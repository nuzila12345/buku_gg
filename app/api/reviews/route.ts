import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/reviews - Get all reviews for user or specific book
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const searchParams = request.nextUrl.searchParams
    const bookId = searchParams.get('bookId') || ''

    const where: any = {}

    // If user is SISWA, only show their reviews
    if (user.role === 'SISWA') {
      where.userId = user.id
    }

    if (bookId) {
      where.bookId = bookId
    }

    const reviews = await prisma.review.findMany({
      where,
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

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const body = await request.json()
    const { bookId, rating, ulasan } = body

    if (!bookId || !rating || !ulasan) {
      return NextResponse.json(
        { error: 'bookId, rating, dan ulasan harus diisi' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating harus antara 1-5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this book
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: bookId,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          ulasan,
          updatedAt: new Date(),
        },
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
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Review berhasil diperbarui',
          review: updatedReview,
        },
        { status: 200 }
      )
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        bookId: bookId,
        rating,
        ulasan,
      },
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
    })

    return NextResponse.json(
      { success: true, message: 'Review berhasil dibuat', review },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Gagal membuat review' },
      { status: 500 }
    )
  }
}
