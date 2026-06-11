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
    // Step 1: Exchange code for Facebook access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token` +
      `?client_id=${process.env.INSTAGRAM_APP_ID}` +
      `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!)}` +
      `&code=${code}`
    )
    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", JSON.stringify(tokenData))
      const msg = tokenData.error?.message || "Token exchange failed"
      return NextResponse.redirect(
        new URL(`/dashboard/settings?instagram=error&ig_error=${encodeURIComponent(msg)}`, req.url)
      )
    }

    const fbAccessToken = tokenData.access_token

    // Step 2: Try to get a long-lived token (lasts ~60 days instead of ~1 hour)
    let longLivedToken = fbAccessToken
    try {
      const llResponse = await fetch(
        `https://graph.facebook.com/v22.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${process.env.INSTAGRAM_APP_ID}` +
        `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
        `&fb_exchange_token=${fbAccessToken}`
      )
      const llData = await llResponse.json()
      if (llData.access_token) {
        longLivedToken = llData.access_token
        console.log("Got long-lived token (valid ~60 days)")
      }
    } catch (e) {
      console.log("Long-lived token exchange failed, using short-lived token")
    }

    // Step 3: Get Facebook Pages connected to this user
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${longLivedToken}`
    )
    const pagesData = await pagesResponse.json()

    if (pagesData.error) {
      console.error("Pages fetch error:", JSON.stringify(pagesData.error))
      return NextResponse.redirect(
        new URL(`/dashboard/settings?instagram=error&ig_error=${encodeURIComponent(pagesData.error.message)}`, req.url)
      )
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error("No Facebook pages found for this user")
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings?instagram=error&ig_error=${encodeURIComponent("No Facebook Page found. Make sure you have a Facebook Page linked to your account.")}`,
          req.url
        )
      )
    }

    // Step 4: Search through all pages for one with an Instagram Business Account
    let igBusinessId = ""
    let igUsername = ""
    let igProfilePic = ""
    let connectedPageId = ""
    let connectedPageToken = ""

    for (const page of pagesData.data) {
      try {
        const igResponse = await fetch(
          `https://graph.facebook.com/v22.0/${page.id}` +
          `?fields=instagram_business_account&access_token=${page.access_token}`
        )
        const igData = await igResponse.json()

        if (igData.instagram_business_account) {
          igBusinessId = igData.instagram_business_account.id
          connectedPageId = page.id
          connectedPageToken = page.access_token
          console.log(`Found Instagram Business Account on page "${page.name}" (ID: ${igBusinessId})`)
          break
        }
      } catch (e) {
        console.log(`Skipping page ${page.name}: ${e}`)
      }
    }

    if (!igBusinessId) {
      console.error("No Instagram Business account found on any page")
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings?instagram=error&ig_error=${encodeURIComponent("No Instagram Business/Creator account linked to any of your Facebook Pages. Go to Instagram Settings → Account → Linked Accounts → Facebook and connect to your Page.")}`,
          req.url
        )
      )
    }

    // Step 5: Get Instagram profile info
    try {
      const igProfileResponse = await fetch(
        `https://graph.facebook.com/v22.0/${igBusinessId}` +
        `?fields=username,name,profile_picture_url&access_token=${longLivedToken}`
      )
      const igProfile = await igProfileResponse.json()
      igUsername = igProfile.username || ""
      igProfilePic = igProfile.profile_picture_url || ""
    } catch (e) {
      console.log("Could not fetch Instagram profile info")
    }

    // Step 5.5: Save connection details directly to Firestore via Admin SDK
    const state = req.nextUrl.searchParams.get("state")
    if (state && state.length > 5) {
      try {
        const dbAdmin = getAdminDb()
        
        await dbAdmin.collection("instagram_tokens").doc(state).set({
          accessToken: longLivedToken,
          pageToken: connectedPageToken || "",
          businessId: igBusinessId,
          fbPageId: connectedPageId,
          connectedAt: new Date(),
        })

        await dbAdmin.collection("users").doc(state).update({
          instagramConnected: true,
          instagramHandle: igUsername || igBusinessId,
          instagramProfilePic: igProfilePic || null,
        })
        
        console.log(`[OAuth callback] Successfully wrote Instagram token to Firestore for user: ${state}`)
      } catch (firestoreErr) {
        console.error("[OAuth callback] Firestore write error:", firestoreErr)
      }
    }

    // Step 6: Redirect back with connection data
    // We pass minimal info in URL and the token via a short-lived secure httpOnly cookie
    const redirectUrl = new URL("/dashboard/settings", req.url)
    redirectUrl.searchParams.set("instagram", "success")
    redirectUrl.searchParams.set("ig_username", igUsername || igBusinessId)
    redirectUrl.searchParams.set("ig_business_id", igBusinessId)
    redirectUrl.searchParams.set("ig_page_id", connectedPageId)
    if (igProfilePic) {
      redirectUrl.searchParams.set("ig_profile_pic", igProfilePic)
    }

    // Set the token in a secure httpOnly cookie (expires in 5 minutes — just enough to save it)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("ig_temp_token", longLivedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    })
    // Also store the page token
    response.cookies.set("ig_temp_page_token", connectedPageToken, {
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