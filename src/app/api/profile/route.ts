import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().max(500000).optional(), // base64 can be large
})

// GET own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PUT update own profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string

    const body = await request.json()
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id: userId },
      data: result.data,
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
