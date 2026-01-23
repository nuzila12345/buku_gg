import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Total Buku
    const totalBooks = await prisma.book.count()

    // Buku Dipinjam (status DIPINJAM)
    const borrowedBooks = await prisma.transaction.count({
      where: { status: 'DIPINJAM' },
    })

    // Total Siswa (members)
    const totalMembers = await prisma.user.count({
      where: { role: 'SISWA' },
    })

    // Denda Belum Dibayar
    const unpaidFines = await prisma.denda.aggregate({
      where: { status: 'BELUM_DIBAYAR' },
      _sum: { totalDenda: true },
    })

    // Transaksi Hari Ini
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTransactions = await prisma.transaction.count({
      where: {
        tanggalPinjam: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Data untuk grafik peminjaman per bulan (6 bulan terakhir)
    const monthlyBorrowingData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      date.setDate(1)
      date.setHours(0, 0, 0, 0)

      const nextMonth = new Date(date)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const count = await prisma.transaction.count({
        where: {
          tanggalPinjam: {
            gte: date,
            lt: nextMonth,
          },
        },
      })

      monthlyBorrowingData.push({
        month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        count,
      })
    }

    // Data untuk kategori buku paling dipinjam
    const categoryData = await prisma.transaction.groupBy({
      by: ['bookId'],
      _count: true,
    })

    // Sort by count manually
    const sortedCategoryData = categoryData.sort((a: typeof categoryData[0], b: typeof categoryData[0]) => b._count - a._count)

    const categoryBooks = await Promise.all(
      sortedCategoryData.slice(0, 10).map(async (item: typeof categoryData[0]) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          select: { judul: true },
        })
        return {
          name: book?.judul || 'Unknown',
          count: item._count,
        }
      })
    )

    // Data untuk status transaksi breakdown
    const statusBreakdown = await prisma.transaction.groupBy({
      by: ['status'],
      _count: true,
    })

    const statusData = statusBreakdown.map((item: typeof statusBreakdown[0]) => ({
      name: item.status,
      value: item._count,
    }))

    // Top 10 buku terpopuler (paling sering dipinjam)
    const topBooks = await prisma.transaction.groupBy({
      by: ['bookId'],
      _count: true,
    })

    // Sort by count manually and take top 10
    const topBooksSorted = topBooks
      .sort((a: typeof topBooks[0], b: typeof topBooks[0]) => b._count - a._count)
      .slice(0, 10)

    const topBooksData = await Promise.all(
      topBooksSorted.map(async (item: typeof topBooks[0]) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          select: { judul: true, penulis: true },
        })
        return {
          id: item.bookId,
          judul: book?.judul || 'Unknown',
          penulis: book?.penulis || 'Unknown',
          peminjaman: item._count,
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalBooks,
        borrowedBooks,
        totalMembers,
        unpaidFines: unpaidFines._sum.totalDenda || 0,
        todayTransactions,
      },
      charts: {
        monthlyBorrowingData,
        categoryBorrowingData: categoryBooks,
        statusBreakdown: statusData,
        topBooks: topBooksData,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
