import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

export interface AutomationData {
  id?: string
  userId: string
  keywords: string[]
  replyMessage: string
  targetUrl: string
  campaignGoal?: string
  active: boolean
  createdAt?: Date
  totalSent: number
  postId?: string
  postMediaUrl?: string
  postCaption?: string
  postPermalink?: string
}

export interface ActivityLogData {
  id?: string
  userId: string
  automationId: string
  keyword: string
  commentAuthor: string
  timestamp: Date
  status: "success" | "failed"
}

export interface AnalyticsDataPoint {
  id?: string
  userId: string
  date: string
  sent: number
  detected: number
  failed: number
}

// Automations
export async function createAutomation(data: Omit<AutomationData, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, "automations"), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getAutomations(userId: string) {
  const q = query(
    collection(db, "automations"),
    where("userId", "==", userId)
  )
  const snapshot = await getDocs(q)
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AutomationData))
  // Sort by createdAt in memory instead of requiring a composite index
  return data.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
    return dateB - dateA
  })
}
export async function getAutomation(id: string) {
  const docSnap = await getDoc(doc(db, "automations", id))
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as AutomationData
}

export async function updateAutomation(id: string, data: Partial<AutomationData>) {
  await updateDoc(doc(db, "automations", id), data)
}

export async function deleteAutomation(id: string) {
  await deleteDoc(doc(db, "automations", id))
}

export async function toggleAutomation(id: string, active: boolean) {
  await updateDoc(doc(db, "automations", id), { active })
}

// Activity Logs
export async function getRecentActivity(userId: string, max = 10) {
  const q = query(
    collection(db, "activity_logs"),
    where("userId", "==", userId)
  )
  const snapshot = await getDocs(q)
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ActivityLogData))
  // Sort by timestamp in memory
  return data
    .sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime()
      const dateB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime()
      return dateB - dateA
    })
    .slice(0, max)
}

// Analytics
export async function getAnalytics(userId: string, days = 7) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const q = query(
    collection(db, "analytics"),
    where("userId", "==", userId),
    where("date", ">=", startDate.toISOString().split("T")[0])
  )
  const snapshot = await getDocs(q)
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnalyticsDataPoint))
  // Sort by date in memory
  return data.sort((a, b) => a.date.localeCompare(b.date))
}

// DM Quota
export async function incrementDmCount(userId: string) {
  const { increment: firestoreIncrement } = await import("firebase/firestore")
  await updateDoc(doc(db, "users", userId), {
    dmSentThisMonth: firestoreIncrement(1),
  })
}

// Admin: Get all users
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"))
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
}

// Admin: Get all automations
export async function getAllAutomations() {
  const snapshot = await getDocs(collection(db, "automations"))
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AutomationData))
  return data.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
    return dateB - dateA
  })
}
