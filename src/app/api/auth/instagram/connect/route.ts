import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.INSTAGRAM_APP_ID
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
  
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

  // Facebook Login OAuth — full set of permissions needed for Instagram DM automation
  // instagram_basic: read media & comments
  // instagram_manage_comments: interact with comments
  // pages_show_list: list user's pages
  // pages_read_engagement: read page engagement data
  // pages_manage_metadata: subscribe pages to webhooks
  // pages_messaging: send DMs via page (needed for Instagram DMs)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "instagram_basic",
      "instagram_manage_comments",
    ].join(","),
    state: crypto.randomUUID(),
  })

  const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`

  return NextResponse.redirect(authUrl)
}