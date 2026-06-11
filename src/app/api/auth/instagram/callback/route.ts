import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")
  const errorReason = req.nextUrl.searchParams.get("error_reason")
  const errorDescription = req.nextUrl.searchParams.get("error_description")

  if (error || !code) {
    console.error("Instagram OAuth denied:", { error, errorReason, errorDescription })
    const errorMsg = errorDescription || errorReason || error || "unknown_error"
    return NextResponse.redirect(
      new URL(`/dashboard/settings?instagram=error&ig_error=${encodeURIComponent(errorMsg)}`, req.url)
    )
  }

  try {
    // Step 1: Exchange authorization code for Instagram access token
    const formParams = new URLSearchParams()
    formParams.append("client_id", process.env.INSTAGRAM_APP_ID!)
    formParams.append("client_secret", process.env.INSTAGRAM_APP_SECRET!)
    formParams.append("grant_type", "authorization_code")
    formParams.append("redirect_uri", process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!)
    formParams.append("code", code)

    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formParams.toString(),
    })
    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", JSON.stringify(tokenData))
      const msg = tokenData.error_message || tokenData.error?.message || "Token exchange failed"
      return NextResponse.redirect(
        new URL(`/dashboard/settings?instagram=error&ig_error=${encodeURIComponent(msg)}`, req.url)
      )
    }

    const shortLivedToken = tokenData.access_token
    const igUserId = tokenData.user_id?.toString() || ""

    // Step 2: Exchange short-lived token for a long-lived access token (lasts ~60 days)
    let longLivedToken = shortLivedToken
    try {
      const llResponse = await fetch(
        `https://graph.instagram.com/access_token` +
        `?grant_type=ig_exchange_token` +
        `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
        `&access_token=${shortLivedToken}`
      )
      const llData = await llResponse.json()
      if (llData.access_token) {
        longLivedToken = llData.access_token
        console.log("Got long-lived Instagram token (valid ~60 days)")
      }
    } catch (e) {
      console.log("Long-lived token exchange failed, using short-lived token")
    }

    // Step 3: Get Instagram profile info
    let igUsername = ""
    let igProfilePic = ""
    try {
      const igProfileResponse = await fetch(
        `https://graph.facebook.com/v22.0/${igUserId}` +
        `?fields=username,name,profile_picture_url&access_token=${longLivedToken}`
      )
      const igProfile = await igProfileResponse.json()
      igUsername = igProfile.username || ""
      igProfilePic = igProfile.profile_picture_url || ""
    } catch (e) {
      console.log("Could not fetch Instagram profile info", e)
    }

    // Step 4: Save connection details directly to Firestore via Admin SDK
    const state = req.nextUrl.searchParams.get("state")
    if (state && state.length > 5) {
      try {
        const dbAdmin = getAdminDb()
        
        await dbAdmin.collection("instagram_tokens").doc(state).set({
          accessToken: longLivedToken,
          pageToken: "", // No page token needed for direct Instagram Business Login
          businessId: igUserId,
          fbPageId: "", // No page ID needed for direct Instagram Business Login
          connectedAt: new Date(),
        })

        await dbAdmin.collection("users").doc(state).update({
          instagramConnected: true,
          instagramHandle: igUsername || igUserId,
          instagramProfilePic: igProfilePic || null,
        })
        
        console.log(`[OAuth callback] Successfully wrote Instagram token to Firestore for user: ${state}`)
      } catch (firestoreErr) {
        console.error("[OAuth callback] Firestore write error:", firestoreErr)
      }
    }

    // Step 5: Redirect back with connection data
    const redirectUrl = new URL("/dashboard/settings", req.url)
    redirectUrl.searchParams.set("instagram", "success")
    redirectUrl.searchParams.set("ig_username", igUsername || igUserId)
    redirectUrl.searchParams.set("ig_business_id", igUserId)
    redirectUrl.searchParams.set("ig_page_id", "")
    if (igProfilePic) {
      redirectUrl.searchParams.set("ig_profile_pic", igProfilePic)
    }

    // Set the token in a secure httpOnly cookie (expires in 5 minutes)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("ig_temp_token", longLivedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    })
    // Set a blank page token cookie to avoid clearing cookie bugs
    response.cookies.set("ig_temp_page_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    })

    return response
  } catch (err: any) {
    console.error("Instagram OAuth error:", err)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?instagram=error&ig_error=${encodeURIComponent(err.message || "OAuth failed")}`, req.url)
    )
  }
}