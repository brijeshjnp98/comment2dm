"use client"

import * as React from "react"
import { Scan, Loader2, CheckCircle2, AlertCircle, MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-provider"
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { getAutomations, AutomationData } from "@/lib/firestore-service"

interface ScanResult {
  postsScanned: number
  commentsScanned: number
  matchedComments: { username: string; keyword: string; text: string }[]
  dmsSent: number
  dmSkipped: number
  errors: string[]
}

export function ScanButton() {
  const { appUser, refreshAppUser } = useAuth()
  const [scanning, setScanning] = React.useState(false)
  const [result, setResult] = React.useState<ScanResult | null>(null)
  const [error, setError] = React.useState("")
  const [debugInfo, setDebugInfo] = React.useState<string>("")

  // Check if a comment has already been processed for a given automation
  async function isAlreadyProcessed(commentId: string, automationId: string): Promise<boolean> {
    try {
      const docRef = doc(db, "processed_comments", `${commentId}_${automationId}`)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
    } catch {
      return false
    }
  }

  // Mark a comment as processed
  async function markAsProcessed(commentId: string, automationId: string, username: string) {
    try {
      await setDoc(doc(db, "processed_comments", `${commentId}_${automationId}`), {
        commentId,
        automationId,
        username,
        processedAt: new Date(),
      })
    } catch (err) {
      console.error("Failed to mark as processed:", err)
    }
  }

  // Log activity to Firestore
  async function logActivity(
    userId: string,
    automationId: string,
    keyword: string,
    commentAuthor: string,
    status: "success" | "failed"
  ) {
    try {
      await addDoc(collection(db, "activity_logs"), {
        userId,
        automationId,
        keyword,
        commentAuthor,
        timestamp: new Date(),
        status,
      })
    } catch (err) {
      console.error("Failed to log activity:", err)
    }
  }

  // Update analytics for today
  async function updateDailyAnalytics(userId: string, sent: number, detected: number, failed: number) {
    const today = new Date().toISOString().split("T")[0]
    const analyticsId = `${userId}_${today}`
    try {
      const docRef = doc(db, "analytics", analyticsId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          sent: increment(sent),
          detected: increment(detected),
          failed: increment(failed),
        })
      } else {
        await setDoc(docRef, {
          userId,
          date: today,
          sent,
          detected,
          failed,
        })
      }
    } catch (err) {
      console.error("Failed to update analytics:", err)
    }
  }

  async function handleScan() {
    if (!appUser) return
    
    setScanning(true)
    setResult(null)
    setError("")
    setDebugInfo("")

    try {
      // 0. Check DM quota
      if (appUser.dmSentThisMonth >= appUser.dmQuota) {
        setError(`DM quota exceeded! You've used ${appUser.dmSentThisMonth}/${appUser.dmQuota} DMs this month. Upgrade your plan to send more.`)
        return
      }

      // 1. Get Instagram token
      const tokenDoc = await getDoc(doc(db, "instagram_tokens", appUser.uid))
      if (!tokenDoc.exists()) {
        setError("Instagram not connected. Go to Settings to connect.")
        return
      }
      const accessToken = tokenDoc.data().accessToken
      let businessId = tokenDoc.data().businessId
      const fbPageId = tokenDoc.data().fbPageId || ""

      setDebugInfo("Token found. Checking Instagram Business Account...")

      // 2. If no businessId, try to find it from stored page ID or token
      if (!businessId) {
        setDebugInfo("No Business ID stored. Attempting to find...")

        let pageIdToUse = fbPageId
        let pageTokenToUse = accessToken

        // If we have a stored Page ID, use it directly
        if (fbPageId) {
          setDebugInfo(`Using stored Facebook Page ID: ${fbPageId}`)
        } else {
          // Try to get pages from user token
          setDebugInfo("Fetching Facebook Pages from your account...")
          const pagesRes = await fetch(
            `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
          )
          const pagesData = await pagesRes.json()
          
          if (pagesData.error) {
            setDebugInfo(`Facebook API Error: ${pagesData.error.message}`)
            setError(`Facebook API Error: ${pagesData.error.message}. Try getting a new token with 'pages_show_list' permission from Graph API Explorer.`)
            return
          }

          if (!pagesData.data || pagesData.data.length === 0) {
            setDebugInfo("No Facebook pages found. Please add your Page ID manually in Settings.")
            setError("No Facebook Page found. Go to Settings → Enter Token Manually and add your Facebook Page ID.")
            return
          }

          pageIdToUse = pagesData.data[0].id
          pageTokenToUse = pagesData.data[0].access_token
          setDebugInfo(`Found page: ${pagesData.data[0].name} (ID: ${pageIdToUse})`)
        }

        // Get Instagram Business Account from the page
        const igRes = await fetch(
          `https://graph.facebook.com/v22.0/${pageIdToUse}` +
          `?fields=instagram_business_account` +
          `&access_token=${pageTokenToUse}`
        )
        const igData = await igRes.json()

        if (!igData.instagram_business_account) {
          setDebugInfo("Instagram Business Account not found. Checking if Instagram is linked to this page...")
          setError("Your Facebook Page doesn't have an Instagram Business Account linked. Make sure your Instagram is a Creator/Business account and linked to the Facebook Page in Instagram Settings.")
          return
        }

        businessId = igData.instagram_business_account.id
        
        // Save it for next time
        await setDoc(doc(db, "instagram_tokens", appUser.uid), {
          accessToken,
          businessId,
          fbPageId: pageIdToUse,
          connectedAt: new Date(),
        }, { merge: true })

        setDebugInfo(`Found Instagram Business Account ID: ${businessId}`)
      }

      // 3. Fetch recent posts
      setDebugInfo("Fetching recent Instagram posts...")
      const mediaRes = await fetch(
        `https://graph.facebook.com/v22.0/${businessId}/media` +
        `?fields=id,caption,timestamp` +
        `&limit=10` +
        `&access_token=${accessToken}`
      )
      const mediaData = await mediaRes.json()

      if (mediaData.error) {
        setDebugInfo(`Media fetch error: ${mediaData.error.message}`)
        setError(`Instagram API Error: ${mediaData.error.message}. Your token may not have 'instagram_basic' permission.`)
        return
      }

      const posts = mediaData.data || []
      setDebugInfo(`Found ${posts.length} posts. Fetching comments...`)

      if (posts.length === 0) {
        setResult({ postsScanned: 0, commentsScanned: 0, matchedComments: [], dmsSent: 0, dmSkipped: 0, errors: [] })
        return
      }

      // 4. Fetch comments for each post
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

      // 5. Get user's automations
      const automations = await getAutomations(appUser.uid)
      const activeAutomations = automations.filter(a => a.active)

      // 6. Match comments against keywords
      const matchedComments: ScanResult["matchedComments"] = []
      let dmsSent = 0
      let dmSkipped = 0
      const errors: string[] = []
      let remainingQuota = appUser.dmQuota - appUser.dmSentThisMonth

      setDebugInfo(`Matching ${allComments.length} comments against ${activeAutomations.length} active automations...`)

      for (const comment of allComments) {
        const commentText = (comment.text || "").toLowerCase()

        for (const auto of activeAutomations) {
          const matchedKeyword = auto.keywords.find((kw: string) =>
            commentText.includes(kw.toLowerCase())
          )

          if (matchedKeyword) {
            // Check duplicate prevention
            const alreadyProcessed = await isAlreadyProcessed(comment.id, auto.id!)
            if (alreadyProcessed) {
              dmSkipped++
              continue
            }

            matchedComments.push({
              username: comment.username || "unknown",
              keyword: matchedKeyword,
              text: comment.text || "",
            })

            // Check quota before sending
            if (remainingQuota <= 0) {
              errors.push(`@${comment.username}: DM quota exceeded`)
              await logActivity(appUser.uid, auto.id!, matchedKeyword, comment.username || "unknown", "failed")
              continue
            }

            // Try to send DM via Instagram Graph API
            try {
              const dmText = `${auto.replyMessage}\n\n${auto.targetUrl}`
              
              // Instagram DM API: Send message to the user
              // Uses the Instagram-scoped user ID from the comment
              const dmRes = await fetch(
                `https://graph.facebook.com/v22.0/${businessId}/messages`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient: { comment_id: comment.id },
                    message: { text: dmText },
                  }),
                }
              )
              
              // Add access token as query param (required by Meta API)
              const dmResWithToken = await fetch(
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
              const dmData = await dmResWithToken.json()
              
              if (dmData.message_id || dmData.recipient_id) {
                dmsSent++
                remainingQuota--
                
                // Mark as processed (duplicate prevention)
                await markAsProcessed(comment.id, auto.id!, comment.username || "")
                
                // Log success activity
                await logActivity(appUser.uid, auto.id!, matchedKeyword, comment.username || "unknown", "success")

                // Update automation's totalSent count
                try {
                  const autoRef = doc(db, "automations", auto.id!)
                  await updateDoc(autoRef, { totalSent: increment(1) })
                } catch {}

                // Increment user's DM count
                try {
                  const userRef = doc(db, "users", appUser.uid)
                  await updateDoc(userRef, { dmSentThisMonth: increment(1) })
                } catch {}

              } else {
                const errMsg = dmData.error?.message || "DM failed"
                errors.push(`@${comment.username}: ${errMsg}`)
                await logActivity(appUser.uid, auto.id!, matchedKeyword, comment.username || "unknown", "failed")
                
                // Still mark as processed to avoid retry spam
                await markAsProcessed(comment.id, auto.id!, comment.username || "")
              }
            } catch (e: any) {
              errors.push(`@${comment.username}: ${e.message}`)
              await logActivity(appUser.uid, auto.id!, matchedKeyword, comment.username || "unknown", "failed")
            }
          }
        }
      }

      // 7. Update daily analytics
      await updateDailyAnalytics(
        appUser.uid,
        dmsSent,
        matchedComments.length,
        errors.length
      )

      // Refresh user data to get updated DM count
      await refreshAppUser()

      setDebugInfo("")
      setResult({
        postsScanned: posts.length,
        commentsScanned: allComments.length,
        matchedComments,
        dmsSent,
        dmSkipped,
        errors,
      })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setScanning(false)
    }
  }

  if (!appUser?.instagramConnected) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Instagram Not Connected</AlertTitle>
        <AlertDescription className="text-amber-700 text-xs">
          Connect Instagram in Settings first to scan comments.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleScan}
          disabled={scanning}
          className="bg-primary rounded-full px-6"
        >
          {scanning ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Scan className="mr-2 size-4" />
          )}
          Scan Comments Now
        </Button>
        <p className="text-xs text-muted-foreground">
          Checks your recent Instagram posts for keyword matches
        </p>
      </div>

      {debugInfo && (
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-xl">
          <RefreshCw className="size-3 animate-spin shrink-0" />
          <span>{debugInfo}</span>
        </div>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Scan Failed</AlertTitle>
          <AlertDescription className="text-red-700 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
          <p className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Scan Complete
          </p>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{result.postsScanned}</p>
              <p className="text-xs text-muted-foreground">Posts Scanned</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{result.commentsScanned}</p>
              <p className="text-xs text-muted-foreground">Comments Found</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{result.dmsSent}</p>
              <p className="text-xs text-muted-foreground">DMs Sent</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-muted-foreground">{result.dmSkipped}</p>
              <p className="text-xs text-muted-foreground">Already Sent</p>
            </div>
          </div>

          {result.matchedComments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Matched Comments:</p>
              {result.matchedComments.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg">
                  <MessageSquare className="size-3 text-primary shrink-0" />
                  <span className="font-medium">@{m.username}</span>
                  <span className="text-muted-foreground">said &quot;{m.text}&quot;</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                    keyword: {m.keyword}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="text-xs text-red-600 space-y-1">
              <p className="font-medium">DM Errors:</p>
              {result.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          {result.matchedComments.length === 0 && result.commentsScanned > 0 && (
            <p className="text-sm text-muted-foreground">
              No matching keywords found in recent comments.
            </p>
          )}
        </div>
      )}
    </div>
  )
}