"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { isAdminEmail } from "@/lib/config"
import { syncUserProfile as apiSyncUser, updateUserRole as apiUpdateUserRole } from "@/lib/app-data"

export type UserRole = "customer" | "admin"

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  createdAt?: string
}

interface AuthContextType {
  user: FirebaseUser | null
  profile: UserProfile | null
  role: UserRole
  isAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, pass: string) => Promise<void>
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserRole: (uid: string, role: UserRole) => Promise<void>
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function buildProfile(firebaseUser: FirebaseUser, name?: string): UserProfile {
  const role: UserRole = isAdminEmail(firebaseUser.email) ? "admin" : "customer"
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName:
      firebaseUser.displayName || name || firebaseUser.email?.split("@")[0] || "VIP Traveler",
    photoURL: firebaseUser.photoURL,
    role,
    createdAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Sync (or create) the user's profile from their Auth identity.
  // Firebase Auth stays the identity source; the row lives in PostgreSQL via Prisma.
  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const { user: dbUser } = await apiSyncUser(firebaseUser)
      // Allowlist always wins (admins can never be downgraded by a stale row).
      const effectiveRole: UserRole = isAdminEmail(firebaseUser.email)
        ? "admin"
        : dbUser.role === "admin"
          ? "admin"
          : "customer"
      setProfile({
        uid: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "VIP Traveler",
        photoURL: dbUser.photoURL || firebaseUser.photoURL,
        role: effectiveRole,
        createdAt: dbUser.createdAt,
      })
    } catch (err) {
      console.warn("Profile sync warning (using local fallback profile):", err)
      setProfile(buildProfile(firebaseUser))
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await syncUserProfile(currentUser)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider)
    if (res.user) {
      await syncUserProfile(res.user)
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass)
    if (res.user) {
      await syncUserProfile(res.user)
    }
  }

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass)
    if (res.user) {
      // Persist the chosen display name on the Auth user before syncing,
      // so the Postgres row is created with the real name.
      if (name.trim()) {
        await firebaseUpdateProfile(res.user, { displayName: name.trim() }).catch(() => {})
      }
      await syncUserProfile(res.user)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user)
    }
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  // Admin-only: grant or revoke the admin role on any user's profile.
  const updateUserRole = async (uid: string, role: UserRole) => {
    const currentProfile = profile
    if (!currentProfile || currentProfile.role !== "admin") {
      throw new Error("Only administrators can change user roles.")
    }
    if (!user) {
      throw new Error("Not authenticated.")
    }
    await apiUpdateUserRole(user, uid, role)
    if (uid === currentProfile.uid) {
      setProfile({ ...currentProfile, role })
    }
  }

  const logout = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setProfile(null)
  }

  const currentRole: UserRole = profile?.role ?? (isAdminEmail(user?.email) ? "admin" : "customer")

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: currentRole,
        isAdmin: currentRole === "admin",
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updateUserRole,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}