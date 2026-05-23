import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, accessToken, businessId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Instagram access token required" }, { status: 400 })
    }

    let activeBusinessId = businessId

    // If no business ID, try to find it from token
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
      return NextResponse.json({ error: "No Instagram Business Account found" }, { status: 400 })
    }

    // Fetch recent posts
    const mediaRes = await fetch(
      `https://graph.facebook.com/v22.0/${activeBusinessId}/media` +
      `?fields=id,caption,timestamp` +
      `&limit=10` +
      `&access_token=${accessToken}`
    )
    const mediaData = await mediaRes.json()
    const posts = mediaData.data || []

    if (posts.length === 0) {
      return NextResponse.json({ message: "No posts found", posts: [], comments: [] })
    }

    // Fetch comments for each post
    const allComments: any[] = []

    for (const post of posts) {
      const commentsRes = await fetch(
        `https://graph.facebook.com/v22.0/${post.id}/comments` +
        `?fields=id,text,username,timestamp` +
        `&access_token=${accessToken}`
      )
      const commentsData = await commentsRes.json()
      const comments = (commentsData.data || []).map((c: any) => ({
        ...c,
        postId: post.id,
        postCaption: post.caption || "",
      }))
      allComments.push(...comments)
    }

    return NextResponse.json({
      success: true,
      businessId: activeBusinessId,
      posts: posts.map((p: any) => ({ id: p.id, caption: p.caption, timestamp: p.timestamp })),
      comments: allComments,
    })
  } catch (err: any) {
    console.error("Scan comments error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}