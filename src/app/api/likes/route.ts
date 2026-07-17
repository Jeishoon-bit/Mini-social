import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST toggle like on a post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "postId requerido" }, { status: 400 })
    }

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    })

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: { id: existingLike.id },
      })

      const likeCount = await db.like.count({ where: { postId } })
      return NextResponse.json({ liked: false, likeCount })
    } else {
      // Like
      await db.like.create({
        data: { userId, postId },
      })

      const likeCount = await db.like.count({ where: { postId } })
      return NextResponse.json({ liked: true, likeCount })
    }
  } catch (error) {
    console.error("Toggle like error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
