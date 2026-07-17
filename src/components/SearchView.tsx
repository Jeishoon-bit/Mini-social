"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/Navbar"
import { useAppStore } from "@/lib/store"
import { Search as SearchIcon, UserPlus, MessageSquare, Users } from "lucide-react"

interface SearchUser {
  id: string
  name: string
  avatarUrl: string
  bio: string
  _count: { posts: number; followers: number; following: number }
  isFollowing: boolean
}

interface SearchViewProps {
  query: string
}

export default function SearchView({ query }: SearchViewProps) {
  const [users, setUsers] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(true)
  const setView = useAppStore((s) => s.setView)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        }
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [query])

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isFollowing: data.following, _count: { ...u._count, followers: data.followerCount ?? u._count.followers } }
              : u
          )
        )
      }
    } catch (err) {
      console.error("Follow error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            Resultados para &ldquo;{query}&rdquo;
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {users.length} usuario{users.length !== 1 ? "s" : ""} encontrado
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <SearchIcon className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">No se encontraron usuarios</p>
            <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card
                key={user.id}
                className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setView({ type: "user", userId: user.id })}
                      className="shrink-0"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl || ""} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          setView({ type: "user", userId: user.id })
                        }
                        className="font-semibold text-sm hover:underline truncate block"
                      >
                        {user.name}
                      </button>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {user._count.posts}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {user._count.followers}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={user.isFollowing ? "outline" : "default"}
                      onClick={() => handleFollow(user.id)}
                      className={`rounded-xl shrink-0 ${
                        user.isFollowing
                          ? ""
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Siguiendo
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Seguir
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
