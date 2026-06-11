import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const clientId = process.env.INSTAGRAM_APP_ID
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
  const userId = req.nextUrl.searchParams.get("userId") || ""
  
  if (!clientId) {
    return NextResponse.json(
      { error: "Instagram App ID not configured" },
      { status: 500 }
    )
  }

  if (!redirectUri) {
    return NextResponse.json(
      { error: "Instagram Redirect URI not configured" },
      { status: 500 }
    )
  }

  // Instagram Login for Business OAuth - scopes required for Instagram comment and DM automation:
  // instagram_business_basic: profile info and media
  // instagram_business_manage_comments: read/reply to comments
  // instagram_business_manage_messages: send automated DMs
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
    ].join(","),
    state: userId || crypto.randomUUID(),
  })

  const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`

  return NextResponse.redirect(authUrl)
}