import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/books/upload - Upload gambar buku
export async function POST(request: NextRequest) {
  try {
    const { bookId, gambar } = await request.json()

    if (!bookId || !gambar) {
      return NextResponse.json(
        { error: 'bookId dan gambar diperlukan' },
        { status: 400 }
      )
    }

    // Validasi format base64
    if (!gambar.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Format gambar tidak valid. Harus berupa base64 data URI' },
        { status: 400 }
      )
    }

    // Update book dengan gambar
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        gambar: gambar,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Gambar berhasil disimpan',
      data: {
        id: updatedBook.id,
        judul: updatedBook.judul,
        gambar: updatedBook.gambar?.substring(0, 50) + '...', // Show first 50 chars only
      },
    })
  } catch (error) {
    console.error('Error uploading gambar:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan gambar' },
      { status: 500 }
    )
  }
}
