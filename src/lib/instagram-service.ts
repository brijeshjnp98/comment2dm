import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"

// Get stored Instagram token for a user
export async function getInstagramToken(userId: string): Promise<string | null> {
  try {
    const tokenDoc = await getDoc(doc(db, "instagram_tokens", userId))
    if (tokenDoc.exists()) {
      return tokenDoc.data().accessToken || null
    }
    return null
  } catch (err) {
    console.error("Error fetching Instagram token:", err)
    return null
  }
}

// Get Instagram Business Account ID
export async function getInstagramBusinessId(userId: string): Promise<string | null> {
  try {
    const tokenDoc = await getDoc(doc(db, "instagram_tokens", userId))
    if (tokenDoc.exists()) {
      return tokenDoc.data().businessId || null
    }
    return null
  } catch (err) {
    return null
  }
}

// Fetch recent media (posts) from Instagram Business Account
export async function fetchRecentMedia(
  accessToken: string,
  businessId: string,
  limit = 10
): Promise<any[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${businessId}/media` +
      `?fields=id,caption,media_type,media_url,permalink,timestamp` +
      `&limit=${limit}` +
      `&access_token=${accessToken}`
    )
    const data = await response.json()
    return data.data || []
  } catch (err) {
    console.error("Error fetching media:", err)
    return []
  }
}

// Fetch comments on a specific post
export async function fetchComments(
  accessToken: string,
  mediaId: string
): Promise<any[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${mediaId}/comments` +
      `?fields=id,text,username,timestamp` +
      `&access_token=${accessToken}`
    )
    const data = await response.json()
    return data.data || []
  } catch (err) {
    console.error("Error fetching comments:", err)
    return []
  }
}

// Send a DM reply to a user
export async function sendDirectMessage(
  accessToken: string,
  businessId: string,
  recipientUsername: string,
  message: string,
  linkUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Get the recipient's Instagram user ID from username
    const searchResponse = await fetch(
      `https://graph.facebook.com/v22.0/${businessId}/messages` +
      `?recipient=${recipientUsername}` +
      `&message_type=text` +
      `&text=${encodeURIComponent(message)}` +
      (linkUrl ? `&link=${encodeURIComponent(linkUrl)}` : "") +
      `&access_token=${accessToken}`,
      { method: "POST" }
    )
    const result = await searchResponse.json()
    
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// Log activity to Firestore
export async function logActivity(
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

// Increment DM count for user
export async function incrementDmSent(userId: string) {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const current = userSnap.data().dmSentThisMonth || 0
      await updateDoc(userRef, {
        dmSentThisMonth: current + 1,
      })
    }
  } catch (err) {
    console.error("Failed to increment DM count:", err)
  }
}