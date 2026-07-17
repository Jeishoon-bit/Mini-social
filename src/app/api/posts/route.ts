import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

// GET all posts (global feed)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string

    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { likes: true },
        },
        likes: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
      },
    })

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      user: post.user,
      likeCount: post._count.likes,
      isLikedByUser: post.likes.length > 0,
    }))

    // Check follow status for each post author
    const authorIds = [...new Set(posts.map((p) => p.userId))]
    const follows = await db.follow.findMany({
      where: {
        followerId: userId,
        followingId: { in: authorIds },
      },
      select: { followingId: true },
    })

    const followingSet = new Set(follows.map((f) => f.followingId))

    const postsWithFollow = formattedPosts.map((post) => ({
      ...post,
      isFollowingAuthor: followingSet.has(post.user.id),
    }))

    return NextResponse.json(postsWithFollow)
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

const postSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido no puede estar vacío")
    .max(500, "Máximo 500 caracteres"),
})

// POST create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string

    const body = await request.json()
    const result = postSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const post = await db.post.create({
      data: {
        userId,
        content: result.data.content,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(
      {
        id: post.id,
        userId: post.userId,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        user: post.user,
        likeCount: 0,
        isLikedByUser: false,
        isFollowingAuthor: false,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
