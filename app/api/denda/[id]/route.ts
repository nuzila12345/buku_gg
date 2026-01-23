import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/denda/[id] - Update status pembayaran denda
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, tanggalDibayar } = body

    // Validasi status
    if (!['BELUM_DIBAYAR', 'SUDAH_DIBAYAR'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    // Update denda
    const denda = await prisma.denda.update({
      where: { id },
      data: {
        status,
        tanggalDibayar:
          status === 'SUDAH_DIBAYAR'
            ? tanggalDibayar
              ? new Date(tanggalDibayar)
              : new Date()
            : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Denda berhasil diperbarui',
      data: denda,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Denda tidak ditemukan' },
        { status: 404 }
      )
    }

    console.error('Error updating denda:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui denda' },
      { status: 500 }
    )
  }
}
