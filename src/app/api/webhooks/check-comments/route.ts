import { NextRequest, NextResponse } from "next/server"

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "comment2dm-webhook-secret"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { secret, scanData } = body

    // Allow manual trigger from dashboard
    if (secret !== WEBHOOK_SECRET && secret !== "manual-trigger") {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
    }

    // scanData comes from the client with all needed info
    // This way we don't need Firebase Admin SDK on server
    if (!scanData || !Array.isArray(scanData)) {
      return NextResponse.json({ error: "scanData array required" }, { status: 400 })
    }

    const results: any[] = []

    for (const scan of scanData) {
      const { userId, accessToken, businessId, handle } = scan
      if (!accessToken || !userId) continue

      let activeBusinessId = businessId

      // Try to find Business ID if not provided
      if (!activeBusinessId) {
        const pagesRes = await fetch(
          `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
        )
        const pagesData = await pagesRes.json()
        if (pagesData.data?.[0]) {
          const igRes = await fetch(
            `https://graph.facebook.com/v22.0/${pagesData.data[0].id}?fields=instagram_business_account&access_token=${pagesData.data[0].access_token}`
          )
          const igData = await igRes.json()
          activeBusinessId = igData.instagram_business_account?.id
        }
      }

      if (!activeBusinessId) {
        results.push({ userId, handle, error: "No Instagram Business Account" })
        continue
      }

      // Fetch recent posts
      const mediaRes = await fetch(
        `https://graph.facebook.com/v22.0/${activeBusinessId}/media` +
        `?fields=id,caption,timestamp` +
        `&limit=10` +
        `&access_token=${accessToken}`
      )
      if (!mediaRes.ok) {
        results.push({ userId, handle, error: "Failed to fetch media" })
        continue
      }
      const mediaData = await mediaRes.json()
      const posts = mediaData.data || []

      // Fetch comments for all posts
      const allComments: any[] = []
      for (const post of posts) {
        const commentsRes = await fetch(
          `https://graph.facebook.com/v22.0/${post.id}/comments` +
          `?fields=id,text,username,timestamp` +
          `&access_token=${accessToken}`
        )
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          allComments.push(
            ...(commentsData.data || []).map((c: any) => ({
              ...c,
              postId: post.id,
            }))
          )
        }
      }

      results.push({
        userId,
        handle,
        postsFound: posts.length,
        commentsFound: allComments.length,
        comments: allComments,
        businessId: activeBusinessId,
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}