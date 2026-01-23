import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/books - Get all books with optional search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const kategori = searchParams.get('kategori') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { penulis: { contains: search, mode: 'insensitive' } },
        { penerbit: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (kategori) {
      where.kategori = { contains: kategori, mode: 'insensitive' }
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data buku' },
      { status: 500 }
    )
  }
}

// POST /api/books - Create new book (Admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { judul, penulis, penerbit, tahunTerbit, isbn, kategori, jumlah, deskripsi, gambar } = body

    if (!judul || !penulis || !penerbit || !tahunTerbit || !kategori || jumlah === undefined) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        judul,
        penulis,
        penerbit,
        tahunTerbit: parseInt(tahunTerbit),
        isbn,
        kategori,
        jumlah: parseInt(jumlah),
        deskripsi,
        gambar: gambar || null,
      },
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error: any) {
    console.error('Create book error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'ISBN sudah digunakan' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat buku' },
      { status: 500 }
    )
  }
}

