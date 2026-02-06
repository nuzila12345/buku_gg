import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hitungDenda } from '@/lib/denda'

// PUT /api/denda/[id] - Siswa ajukan pembayaran denda (PENDING_KONFIRMASI)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { transactionId, paymentMethod } = body

    // Jika ID adalah temporary ID (temp-{transactionId}), buat denda baru terlebih dahulu
    let dendaId = id
    if (id.startsWith('temp-') && transactionId) {
      // Ambil data transaksi
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          book: true,
          user: true,
        },
      })

      if (!transaction) {
        return NextResponse.json(
          { error: 'Transaksi tidak ditemukan' },
          { status: 404 }
        )
      }

      // Hitung denda
      const dendaCalculation = hitungDenda(
        transaction.batasKembali,
        transaction.tanggalKembali
      )

      // Cek apakah denda sudah ada
      const existingDenda = await prisma.denda.findUnique({
        where: { transactionId },
      })

      if (existingDenda) {
        dendaId = existingDenda.id
      } else {
        // Buat denda baru
        const newDenda = await prisma.denda.create({
          data: {
            transactionId,
            userId: transaction.userId,
            bookId: transaction.bookId,
            tanggalPinjam: transaction.tanggalPinjam,
            tanggalJatuhTempo: transaction.batasKembali,
            tanggalKembali: transaction.tanggalKembali,
            jumlahHariTelat: dendaCalculation.jumlahHariTelat,
            dendaPerHari: 1000,
            totalDenda: dendaCalculation.totalDenda,
            status: 'BELUM_DIBAYAR',
          },
        })
        dendaId = newDenda.id
      }
    }

    // Update denda status ke PENDING_KONFIRMASI (menunggu konfirmasi admin)
    const denda = await prisma.denda.update({
      where: { id: dendaId },
      data: {
        status: 'PENDING_KONFIRMASI',
        tanggalBayar: new Date(),
        paymentMethod: paymentMethod ? paymentMethod.toUpperCase() as any : 'CASH',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Pembayaran denda sedang menunggu konfirmasi admin',
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

// PATCH /api/denda/[id] - Admin konfirmasi pembayaran denda
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID diperlukan' },
        { status: 400 }
      )
    }

    // Konfirmasi pembayaran - ubah status ke SUDAH_DIBAYAR
    const denda = await prisma.denda.update({
      where: { id },
      data: {
        status: 'SUDAH_DIBAYAR',
        tanggalDibayar: new Date(),
        dikonfirmasiOleh: adminId,
        tanggalKonfirmasi: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Pembayaran denda berhasil dikonfirmasi',
      data: denda,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Denda tidak ditemukan' },
        { status: 404 }
      )
    }

    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Gagal mengkonfirmasi pembayaran' },
      { status: 500 }
    )
  }
}
