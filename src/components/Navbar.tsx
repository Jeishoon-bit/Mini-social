"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Logo from "@/components/Logo"
import { useAppStore } from "@/lib/store"

export default function Navbar() {
  const { data: session } = useSession()
  const setView = useAppStore((s) => s.setView)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setView({ type: "search", query: searchQuery.trim() })
      setSearchQuery("")
    }
  }

  const handleLogoClick = () => {
    setView({ type: "feed" })
  }

  if (!session) return null

  const user = session.user
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Logo width={28} height={28} color="#3b82f6" />
          <span className="text-lg font-bold tracking-tight hidden sm:inline">
            Mini Social
          </span>
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl h-9 text-sm bg-gray-50 border-gray-200"
          />
        </form>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full p-0 hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              onClick={() => setView({ type: "profile" })}
              className="rounded-lg cursor-pointer"
            >
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
