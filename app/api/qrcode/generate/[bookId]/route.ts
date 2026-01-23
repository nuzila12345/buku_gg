import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/qrcode/generate/[bookId] - Generate QR Code as data URL
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const { bookId } = params

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, judul: true, isbn: true },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      )
    }

    // QR data akan berisi book ID (plain string)
    // Client akan generate visual QR code dari data ini
    const qrData = book.id

    return NextResponse.json({
      success: true,
      qrData,
      book: {
        id: book.id,
        judul: book.judul,
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
