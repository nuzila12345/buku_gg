import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// DELETE /api/reviews/[id] - Delete a review
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
    const { id } = params

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user owns the review
    if (review.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin menghapus review ini' },
        { status: 403 }
      )
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Review berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus review' },
      { status: 500 }
    )
  }
}
