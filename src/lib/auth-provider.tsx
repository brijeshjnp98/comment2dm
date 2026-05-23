"use client"

import * as React from "react"
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface AppUser {
  uid: string
  email: string
  name: string
  role: "user" | "admin"
  instagramConnected: boolean
  instagramHandle?: string
  instagramProfilePic?: string
  plan: "free" | "basic" | "pro"
  dmSentThisMonth: number
  dmQuota: number
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshAppUser: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [appUser, setAppUser] = React.useState<AppUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  const fetchAppUser = React.useCallback(async (uid: string) => {
    const docSnap = await getDoc(doc(db, "users", uid))
    if (docSnap.exists()) {
      setAppUser(docSnap.data() as AppUser)
    }
  }, [])

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchAppUser(firebaseUser.uid)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [fetchAppUser])

  const signUp = async (email: string, password: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser: AppUser = {
      uid: credential.user.uid,
      email,
      name,
      role: "user",
      instagramConnected: false,
      plan: "free",
      dmSentThisMonth: 0,
      dmQuota: 1000,
      createdAt: new Date(),
    }
    await setDoc(doc(db, "users", credential.user.uid), newUser)
    setAppUser(newUser)
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setAppUser(null)
  }

  const refreshAppUser = async () => {
    if (user) {
      await fetchAppUser(user.uid)
    }
  }

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signUp, signIn, signOut, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}