import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { TransactionStatus } from '@prisma/client'

// GET /api/transactions/[id] - Get transaction by ID
export async function GET(
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
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
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

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // If user is SISWA, only allow access to their own transactions
    if (user.role === 'SISWA' && transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data transaksi' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update transaction (return book or update)
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
    const body = await request.json()
    const { status, denda } = body

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // If user is SISWA, only allow return action on their own transactions
    if (user.role === 'SISWA') {
      if (transaction.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Students can only return books
      if (status === TransactionStatus.DIKEMBALIKAN) {
        const updateData: any = {
          status: TransactionStatus.DIKEMBALIKAN,
          tanggalKembali: new Date(),
        }

        // Calculate fine if late
        if (new Date() > transaction.batasKembali) {
          const daysLate = Math.ceil(
            (new Date().getTime() - transaction.batasKembali.getTime()) /
              (1000 * 60 * 60 * 24)
          )
          updateData.denda = daysLate * 5000 // 5000 per day
        }

        const updatedTransaction = await prisma.transaction.update({
          where: { id: params.id },
          data: updateData,
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

        return NextResponse.json({ transaction: updatedTransaction })
      }
    } else {
      // Admin can update any field
      const updateData: any = {}
      if (status) updateData.status = status
      if (denda !== undefined) updateData.denda = parseFloat(denda)
      if (status === TransactionStatus.DIKEMBALIKAN && !transaction.tanggalKembali) {
        updateData.tanggalKembali = new Date()
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id: params.id },
        data: updateData,
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

      return NextResponse.json({ transaction: updatedTransaction })
    }

    return NextResponse.json(
      { error: 'Aksi tidak diizinkan' },
      { status: 403 }
    )
  } catch (error: any) {
    console.error('Update transaction error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate transaksi' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete transaction (Admin only)
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

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete transaction error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus transaksi' },
      { status: 500 }
    )
  }
}

