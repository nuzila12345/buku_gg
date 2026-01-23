import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/qrcode/[bookId] - Generate QR Code data for a book
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const { bookId } = params

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      )
    }

    // Generate QR code data with book information
    const qrData = JSON.stringify({
      id: book.id,
      judul: book.judul,
      isbn: book.isbn,
      timestamp: new Date().getTime(),
    })

    return NextResponse.json({
      success: true,
      data: qrData,
      book: {
        id: book.id,
        judul: book.judul,
        penulis: book.penulis,
        isbn: book.isbn,
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Gagal generate QR code' },
      { status: 500 }
    )
  }
}
