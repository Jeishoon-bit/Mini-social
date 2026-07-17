import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido no puede estar vacío")
    .max(500, "Máximo 500 caracteres"),
})

// GET single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const post = await db.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      userId: post.userId,
      user: post.user,
      likeCount: post._count.likes,
    })
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PUT update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const { id } = await params

    const existingPost = await db.post.findUnique({ where: { id } })
    if (!existingPost) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }
    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: "No puedes editar este post" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const post = await db.post.update({
      where: { id },
      data: { content: result.data.content },
    })

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    const { id } = await params

    const existingPost = await db.post.findUnique({ where: { id } })
    if (!existingPost) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }
    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: "No puedes eliminar este post" },
        { status: 403 }
      )
    }

    await db.post.delete({ where: { id } })

    return NextResponse.json({ message: "Post eliminado" })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
