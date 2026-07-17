"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useAppStore, AppView } from "@/lib/store"
import AuthProvider from "@/components/AuthProvider"
import LoginView from "@/components/LoginView"
import RegisterView from "@/components/RegisterView"
import FeedView from "@/components/FeedView"
import ProfileView from "@/components/ProfileView"
import UserView from "@/components/UserView"
import SearchView from "@/components/SearchView"
import { Skeleton } from "@/components/ui/skeleton"

function Router() {
  const { data: session, status } = useSession()
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  // Redirect to login when not authenticated
  useEffect(() => {
    if (status === "unauthenticated" && view.type !== "login" && view.type !== "register") {
      setView({ type: "login" })
    }
    // Redirect to feed when authenticated and on login/register
    if (status === "authenticated" && (view.type === "login" || view.type === "register")) {
      setView({ type: "feed" })
    }
  }, [status, view.type, setView])

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-48 rounded-xl bg-gray-100 mx-auto" />
          <Skeleton className="h-10 rounded-xl bg-gray-100" />
          <Skeleton className="h-10 rounded-xl bg-gray-100" />
          <Skeleton className="h-10 rounded-xl bg-gray-100" />
        </div>
      </div>
    )
  }

  // Auth views
  if (view.type === "login") return <LoginView />
  if (view.type === "register") return <RegisterView />

  // Protected views (only accessible when authenticated)
  if (!session) return <LoginView />

  switch (view.type) {
    case "feed":
      return <FeedView />
    case "profile":
      return <ProfileView />
    case "user":
      return <UserView userId={view.userId} />
    case "search":
      return <SearchView query={view.query} />
    default:
      return <FeedView />
  }
}

export default function Home() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
