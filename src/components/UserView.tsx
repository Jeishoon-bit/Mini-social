"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/Navbar"
import PostCard from "@/components/PostCard"
import EditProfileDialog from "@/components/EditProfileDialog"
import { useAppStore } from "@/lib/store"
import { Calendar, MessageSquare, UserPlus, Users } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: string
  _count: { posts: number; followers: number; following: number }
  isFollowing: boolean
  isSelf: boolean
}

interface UserPost {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    id: string
    name: string
    avatarUrl: string
  }
  likeCount: number
  isLikedByUser: boolean
  isFollowingAuthor: boolean
}

interface UserViewProps {
  userId: string
}

export default function UserView({ userId }: UserViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)
  const refreshKey = useAppStore((s) => s.refreshKey)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [profileRes, postsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/posts`),
      ])
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }
      if (postsRes.ok) {
        const allPosts = await postsRes.json()
        setPosts(allPosts.filter((p: UserPost) => p.userId === userId))
      }
    } catch (err) {
      console.error("Fetch user error:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  const handleFollow = async () => {
    try {
      await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      })
      fetchData()
    } catch (err) {
      console.error("Follow error:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <Skeleton className="h-48 rounded-2xl bg-gray-100 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-gray-100" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Usuario no encontrado</p>
        </main>
      </div>
    )
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(profile.createdAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Profile Card */}
        <Card className="border-0 shadow-sm rounded-2xl mb-4">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Miembro desde {memberSince}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {profile._count.posts}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {profile._count.followers}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Seguidores
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {profile._count.following}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    Siguiendo
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              {!profile.isSelf && (
                <Button
                  onClick={handleFollow}
                  variant={profile.isFollowing ? "outline" : "default"}
                  className={`mt-4 rounded-xl ${
                    profile.isFollowing
                      ? ""
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {profile.isFollowing ? "Siguiendo" : "Seguir"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Sin publicaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={fetchData}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
