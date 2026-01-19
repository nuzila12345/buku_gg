import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { TransactionStatus } from '@prisma/client'

// GET /api/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const userId = searchParams.get('userId') || ''

    const where: any = {}

    // If user is SISWA, only show their transactions
    if (user.role === 'SISWA') {
      where.userId = user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status as TransactionStatus
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nama: true,
          },
        },
        book: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data transaksi' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create new transaction (borrow book)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const body = await request.json()
    const { bookId, batasKembali } = body

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID harus diisi' },
        { status: 400 }
      )
    }

    // Check if book exists and has available stock
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check available stock (jumlah - active borrows)
    const activeBorrows = await prisma.transaction.count({
      where: {
        bookId,
        status: TransactionStatus.DIPINJAM,
      },
    })

    if (activeBorrows >= book.jumlah) {
      return NextResponse.json(
        { error: 'Buku tidak tersedia' },
        { status: 400 }
      )
    }

    // Calculate batasKembali (default 7 days from now)
    const batasKembaliDate = batasKembali
      ? new Date(batasKembali)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        bookId,
        batasKembali: batasKembaliDate,
        status: TransactionStatus.DIPINJAM,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nama: true,
          },
        },
        book: true,
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat transaksi' },
      { status: 500 }
    )
  }
}

