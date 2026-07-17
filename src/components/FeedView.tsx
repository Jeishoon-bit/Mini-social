"use client"

import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/Navbar"
import PostCard from "@/components/PostCard"
import PostInput from "@/components/PostInput"
import { useAppStore } from "@/lib/store"
import { MessageSquare } from "lucide-react"

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

export default function FeedView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const refreshKey = useAppStore((s) => s.refreshKey)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/posts")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (err) {
      console.error("Fetch posts error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts, refreshKey])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Post Input */}
        <div className="mb-4">
          <PostInput onUpdate={fetchPosts} />
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-32 rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">No hay publicaciones aún</p>
            <p className="text-xs mt-1">Sé el primero en compartir algo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={fetchPosts}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
