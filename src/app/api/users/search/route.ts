import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET search users by name
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""

    if (!q.trim()) {
      return NextResponse.json([])
    }

    const users = await db.user.findMany({
      where: {
        name: { contains: q },
        id: { not: userId },
      },
      take: 20,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    })

    // Check if current user follows each result
    const follows = await db.follow.findMany({
      where: {
        followerId: userId,
        followingId: { in: users.map((u) => u.id) },
      },
      select: { followingId: true },
    })

    const followingSet = new Set(follows.map((f) => f.followingId))

    const usersWithFollow = users.map((user) => ({
      ...user,
      isFollowing: followingSet.has(user.id),
    }))

    return NextResponse.json(usersWithFollow)
  } catch (error) {
    console.error("Search users error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
