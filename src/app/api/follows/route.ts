import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST toggle follow
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const { followingId } = await request.json()

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId requerido" },
        { status: 400 }
      )
    }

    if (userId === followingId) {
      return NextResponse.json(
        { error: "No puedes seguirte a ti mismo" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: followingId },
    })
    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: { id: existingFollow.id },
      })

      const followerCount = await db.follow.count({
        where: { followingId },
      })
      return NextResponse.json({ following: false, followerCount })
    } else {
      // Follow
      await db.follow.create({
        data: { followerId: userId, followingId },
      })

      const followerCount = await db.follow.count({
        where: { followingId },
      })
      return NextResponse.json({ following: true, followerCount })
    }
  } catch (error) {
    console.error("Toggle follow error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
