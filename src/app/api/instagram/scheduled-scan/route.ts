import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  return handleScan(req)
}

export async function POST(req: NextRequest) {
  return handleScan(req)
}

async function handleScan(req: NextRequest) {
  try {
    // 1. Verify webhook secret trigger
    const secret = req.nextUrl.searchParams.get("secret")
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "comment2dm-webhook-secret"

    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let dbAdmin
    try {
      dbAdmin = getAdminDb()
    } catch (e: any) {
      return NextResponse.json({
        success: false,
        error: "Firebase Admin Initialization Failed",
        message: e.message,
        instructions: "Please make sure your NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is correctly configured in your .env.local file."
      }, { status: 500 })
    }

    // 2. Fetch all connected users
    let usersSnap
    try {
      usersSnap = await dbAdmin.collection("users")
        .where("instagramConnected", "==", true)
        .get()
    } catch (e: any) {
      if (e.message?.includes("Could not load the default credentials") || e.message?.includes("credential")) {
        return NextResponse.json({
          success: false,
          error: "Firebase Service Account Credentials Not Found",
          message: "The background scheduled scanning API route requires Firebase Admin credentials to read/write Firestore data securely from the backend server.",
          instructions: [
            "1. Open your Firebase Console (https://console.firebase.google.com/)",
            "2. Navigate to Project Settings -> Service Accounts",
            "3. Click 'Generate new private key' to download the JSON service account key file",
            "4. Add the following keys to your local .env.local file:",
            "   - FIREBASE_CLIENT_EMAIL=your-service-account-email-address",
            "   - FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\"",
            "Note: When deployed to Google Cloud Platforms (like Firebase App Hosting, GCP, or Vercel with integrated GCP integrations), Google Application Default Credentials will be loaded automatically and no manual environment variables are required!"
          ]
        }, { status: 500 })
      }
      throw e
    }

    const users = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as any))

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No connected users found",
        processed: 0,
      })
    }

    const results: any[] = []

    // 3. Process each connected user
    for (const user of users) {
      const userResult = {
        userId: user.uid,
        handle: user.instagramHandle || "unknown",
        postsScanned: 0,
        commentsScanned: 0,
        dmsSent: 0,
        dmSkipped: 0,
        errors: [] as string[],
      }

      try {
        // a. Check DM quota
        if (user.dmSentThisMonth >= user.dmQuota) {
          userResult.errors.push("Skipped: User monthly DM quota exceeded")
          results.push(userResult)
          continue
        }

        // b. Fetch Instagram token document
        const tokenDoc = await dbAdmin.collection("instagram_tokens").doc(user.uid).get()
        if (!tokenDoc.exists) {
          userResult.errors.push("Skipped: Stored Instagram token document not found")
          results.push(userResult)
          continue
        }

        const { accessToken, businessId } = tokenDoc.data() as any
        if (!accessToken || !businessId) {
          userResult.errors.push("Skipped: Instagram Access Token or Business ID is missing")
          results.push(userResult)
          continue
        }

        // c. Fetch user's active automations
        const automationsSnap = await dbAdmin.collection("automations")
          .where("userId", "==", user.uid)
          .where("active", "==", true)
          .get()
        
        const automations = automationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any))

        if (automations.length === 0) {
          userResult.errors.push("Skipped: No active automations found")
          results.push(userResult)
          continue
        }

        // d. Fetch recent Instagram posts
        const mediaRes = await fetch(
          `https://graph.facebook.com/v22.0/${businessId}/media` +
          `?fields=id,caption,timestamp` +
          `&limit=10` +
          `&access_token=${accessToken}`
        )
        
        if (!mediaRes.ok) {
          const errData = await mediaRes.json().catch(() => ({}))
          const errMsg = errData?.error?.message || "Failed to fetch media"
          userResult.errors.push(`API Error: ${errMsg}`)
          results.push(userResult)
          continue
        }

        const mediaData = await mediaRes.json()
        const posts = mediaData.data || []
        userResult.postsScanned = posts.length

        if (posts.length === 0) {
          results.push(userResult)
          continue
        }

        // e. Fetch comments for each post
        const allComments: any[] = []
        for (const post of posts) {
          const commentsRes = await fetch(
            `https://graph.facebook.com/v22.0/${post.id}/comments` +
            `?fields=id,text,username,timestamp` +
            `&access_token=${accessToken}`
          )
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json()
            const comments = (commentsData.data || []).map((c: any) => ({
              ...c,
              postId: post.id,
              postCaption: post.caption || "",
            }))
            allComments.push(...comments)
          }
        }
        userResult.commentsScanned = allComments.length

        // f. Match comments against keywords
        let remainingQuota = user.dmQuota - user.dmSentThisMonth

        for (const comment of allComments) {
          const commentText = (comment.text || "").toLowerCase()

          for (const auto of automations) {
            // Respect post-specific trigger
            if (auto.postId && auto.postId !== "all" && auto.postId !== comment.postId) {
              continue
            }

            const matchedKeyword = auto.keywords.find((kw: string) =>
              commentText.includes(kw.toLowerCase())
            )

            if (matchedKeyword) {
              const commentId = comment.id
              const automationId = auto.id
              const processedId = `${commentId}_${automationId}`

              // Check duplicate prevention
              const processedRef = dbAdmin.collection("processed_comments").doc(processedId)
              const processedSnap = await processedRef.get()
              if (processedSnap.exists) {
                userResult.dmSkipped++
                continue
              }

              // Check quota before sending
              if (remainingQuota <= 0) {
                userResult.errors.push(`@${comment.username}: DM quota exceeded`)
                
                // Log failed activity
                await dbAdmin.collection("activity_logs").add({
                  userId: user.uid,
                  automationId,
                  keyword: matchedKeyword,
                  commentAuthor: comment.username || "unknown",
                  timestamp: new Date(),
                  status: "failed",
                })
                continue
              }

              // Try sending DM
              try {
                const dmText = `${auto.replyMessage}\n\n${auto.targetUrl}`
                const dmRes = await fetch(
                  `https://graph.facebook.com/v22.0/${businessId}/messages?access_token=${accessToken}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      recipient: { comment_id: comment.id },
                      message: { text: dmText },
                    }),
                  }
                )
                const dmData = await dmRes.json()

                if (dmData.message_id || dmData.recipient_id) {
                  userResult.dmsSent++
                  remainingQuota--

                  // Mark processed
                  await processedRef.set({
                    commentId,
                    automationId,
                    username: comment.username || "",
                    processedAt: new Date(),
                  })

                  // Log activity success
                  await dbAdmin.collection("activity_logs").add({
                    userId: user.uid,
                    automationId,
                    keyword: matchedKeyword,
                    commentAuthor: comment.username || "unknown",
                    timestamp: new Date(),
                    status: "success",
                  })

                  // Increment automation totalSent count
                  await dbAdmin.collection("automations").doc(automationId).update({
                    totalSent: FieldValue.increment(1),
                  })

                  // Increment user dmSentThisMonth count
                  await dbAdmin.collection("users").doc(user.uid).update({
                    dmSentThisMonth: FieldValue.increment(1),
                  })
                } else {
                  const errMsg = dmData.error?.message || "DM failed"
                  userResult.errors.push(`@${comment.username}: ${errMsg}`)

                  // Log activity failure
                  await dbAdmin.collection("activity_logs").add({
                    userId: user.uid,
                    automationId,
                    keyword: matchedKeyword,
                    commentAuthor: comment.username || "unknown",
                    timestamp: new Date(),
                    status: "failed",
                  })

                  // Mark processed to avoid infinite loop retries on failed DMs
                  await processedRef.set({
                    commentId,
                    automationId,
                    username: comment.username || "",
                    processedAt: new Date(),
                  })
                }
              } catch (e: any) {
                userResult.errors.push(`@${comment.username}: ${e.message}`)
                await dbAdmin.collection("activity_logs").add({
                  userId: user.uid,
                  automationId,
                  keyword: matchedKeyword,
                  commentAuthor: comment.username || "unknown",
                  timestamp: new Date(),
                  status: "failed",
                })
              }
            }
          }
        }

        // g. Update daily analytics
        if (userResult.dmsSent > 0 || userResult.errors.length > 0) {
          const today = new Date().toISOString().split("T")[0]
          const analyticsId = `${user.uid}_${today}`
          const analyticsRef = dbAdmin.collection("analytics").doc(analyticsId)
          const analyticsSnap = await analyticsRef.get()
          
          if (analyticsSnap.exists) {
            await analyticsRef.update({
              sent: FieldValue.increment(userResult.dmsSent),
              detected: FieldValue.increment(userResult.dmsSent),
              failed: FieldValue.increment(userResult.errors.length),
            })
          } else {
            await analyticsRef.set({
              userId: user.uid,
              date: today,
              sent: userResult.dmsSent,
              detected: userResult.dmsSent,
              failed: userResult.errors.length,
            })
          }
        }
      } catch (err: any) {
        userResult.errors.push(`System Error: ${err.message}`)
      }

      results.push(userResult)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: users.length,
      results,
    })
  } catch (err: any) {
    console.error("Scheduled scan exception:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
