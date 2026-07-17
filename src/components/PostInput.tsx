"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

interface PostInputProps {
  onUpdate: () => void
}

export default function PostInput({ onUpdate }: PostInputProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const user = session?.user
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const handleSubmit = async () => {
    if (!content.trim()) return
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al publicar")
        return
      }

      setContent("")
      onUpdate()
    } catch {
      setError("Error de conexión")
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="¿Qué estás pensando?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setError("")
            }}
            onKeyDown={handleKeyDown}
            className="rounded-xl border-gray-200 bg-gray-50 resize-none min-h-[60px] text-sm placeholder:text-muted-foreground/60 focus:bg-white transition-colors"
            maxLength={500}
            rows={2}
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {content.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              size="sm"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-8 px-4"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
