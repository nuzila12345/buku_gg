import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/books/[id] - Get book by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
    })

    if (!book) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Get book error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data buku' },
      { status: 500 }
    )
  }
}

// PUT /api/books/[id] - Update book (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        judul,
        penulis,
        penerbit,
        tahunTerbit: tahunTerbit ? parseInt(tahunTerbit) : undefined,
        isbn,
        kategori,
        jumlah: jumlah !== undefined ? parseInt(jumlah) : undefined,
        deskripsi,
        gambar: gambar !== undefined ? gambar : undefined,
      },
    })

    return NextResponse.json({ book })
  } catch (error: any) {
    console.error('Update book error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'ISBN sudah digunakan' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate buku' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - Delete book (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.book.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete book error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus buku' },
      { status: 500 }
    )
  }
}

