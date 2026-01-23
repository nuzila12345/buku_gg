import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hitungDenda } from '@/lib/denda'

// GET /api/denda - Dapatkan semua data denda
export async function GET(request: NextRequest) {
  try {
    // Ambil data transaksi yang terlambat
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactions = await prisma.transaction.findMany({
      where: {
        batasKembali: {
          lt: today,
        },
        status: {
          in: ['DIKEMBALIKAN', 'TERLAMBAT'],
        },
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
          },
        },
      },
      orderBy: {
        tanggalPinjam: 'desc',
      },
    })

    // Ambil semua denda
    const allDenda = await prisma.denda.findMany()

    // Format data untuk response
    const dendaList = transactions.map((transaction) => {
      const denda = hitungDenda(
        transaction.batasKembali,
        transaction.tanggalKembali
      )

      // Cari denda untuk transaksi ini
      const dendaData = allDenda.find(d => d.transactionId === transaction.id)

      return {
        id: dendaData?.id || `temp-${transaction.id}`,
        transactionId: transaction.id,
        userId: transaction.userId,
        bookId: transaction.bookId,
        namaSiswa: transaction.user.nama,
        judulBuku: transaction.book.judul,
        penulisBuku: transaction.book.penulis,
        tanggalPinjam: transaction.tanggalPinjam,
        tanggalJatuhTempo: transaction.batasKembali,
        tanggalKembali: transaction.tanggalKembali,
        jumlahHariTelat: denda.jumlahHariTelat,
        dendaPerHari: dendaData?.dendaPerHari || 1000,
        totalDenda: denda.totalDenda,
        status: dendaData?.status || 'BELUM_DIBAYAR',
        tanggalDibayar: dendaData?.tanggalDibayar,
        createdAt: dendaData?.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: dendaList,
      total: dendaList.length,
    })
  } catch (error) {
    console.error('Error fetching denda:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data denda' },
      { status: 500 }
    )
  }
}
