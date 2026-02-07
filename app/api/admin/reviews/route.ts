import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/admin/reviews - Get all reviews (admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all reviews sorted by creation date (newest first)
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            username: true,
          },
        },
        book: {
          select: {
            id: true,
            judul: true,
            penulis: true,
            gambar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 latest reviews
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data review' },
      { status: 500 }
    )
  }
}
