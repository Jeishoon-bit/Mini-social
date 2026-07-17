"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"

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

interface PostCardProps {
  post: Post
  onUpdate: () => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { data: session } = useSession()
  const setView = useAppStore((s) => s.setView)
  const [liking, setLiking] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [deleting, setDeleting] = useState(false)

  const currentUserId = session?.user?.id || ""
  const isOwn = currentUserId === post.userId

  const initials = post.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const timeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return "hace un momento"
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const handleLike = async () => {
    setLiking(true)
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })
      onUpdate()
    } catch (err) {
      console.error("Like error:", err)
    } finally {
      setLiking(false)
    }
  }

  const handleEdit = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })
      if (res.ok) {
        setEditOpen(false)
        onUpdate()
      }
    } catch (err) {
      console.error("Edit error:", err)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" })
      if (res.ok) {
        onUpdate()
      }
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setDeleting(false)
    }
  }

  const handleFollow = async () => {
    try {
      await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: post.userId }),
      })
      onUpdate()
    } catch (err) {
      console.error("Follow error:", err)
    }
  }

  const handleAuthorClick = () => {
    if (!isOwn) {
      setView({ type: "user", userId: post.userId })
    } else {
      setView({ type: "profile" })
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <button onClick={handleAuthorClick} className="shrink-0 mt-0.5">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatarUrl || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAuthorClick}
                className="font-semibold text-sm hover:underline truncate"
              >
                {post.user.name}
              </button>
              <span className="text-xs text-muted-foreground">
                {timeAgo(post.createdAt)}
              </span>
              {/* Follow button for non-followed authors */}
              {!isOwn && !post.isFollowingAuthor && (
                <button
                  onClick={handleFollow}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 ml-auto"
                >
                  Seguir
                </button>
              )}
              {!isOwn && post.isFollowingAuthor && (
                <button
                  onClick={handleFollow}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground ml-auto hover:underline"
                >
                  Siguiendo
                </button>
              )}
              {/* More menu for own posts */}
              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-auto -mr-1"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => setEditOpen(true)}
                      className="rounded-lg cursor-pointer"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={handleLike}
                disabled={liking}
                className="flex items-center gap-1.5 group transition-colors"
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 ${
                    post.isLikedByUser
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-gray-400 group-hover:text-red-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    post.isLikedByUser
                      ? "text-red-500 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {post.likeCount > 0 ? post.likeCount : ""}
                </span>
              </button>
              <button className="flex items-center gap-1.5 group transition-colors">
                <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Editar publicación</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="rounded-xl min-h-[100px] resize-none"
            maxLength={500}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
