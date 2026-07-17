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
import { Calendar, MessageSquare, Pencil, UserPlus, Users } from "lucide-react"

interface ProfileData {
  id: string
  name: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: string
  _count: { posts: number; followers: number; following: number }
}

interface Post {
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

export default function ProfileView() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const refreshKey = useAppStore((s) => s.refreshKey)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [profileRes, postsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/posts"),
      ])
      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data)
      }
      if (postsRes.ok) {
        const allPosts = await postsRes.json()
        const userId = session?.user?.id || ""
        setPosts(allPosts.filter((p: Post) => p.userId === userId))
      }
    } catch (err) {
      console.error("Fetch profile error:", err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

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

  if (!profile) return null

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
              <p className="text-sm text-muted-foreground mt-0.5">
                {profile.email}
              </p>
              {profile.bio ? (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/50 mt-1 italic">
                  Sin biografía
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Miembro desde {memberSince}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{profile._count.posts}</div>
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

              {/* Edit Button */}
              <Button
                onClick={() => setEditOpen(true)}
                variant="outline"
                className="mt-4 rounded-xl"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Aún no has publicado nada</p>
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

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentName={profile.name}
        currentBio={profile.bio}
        currentAvatar={profile.avatarUrl}
        onUpdate={fetchData}
      />
    </div>
  )
}
