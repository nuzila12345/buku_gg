import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/members - Get all members (Admin only)
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    const where: any = {
      role: UserRole.SISWA,
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { nama: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        alamat: true,
        telepon: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data anggota' },
      { status: 500 }
    )
  }
}

// POST /api/members - Create new member (Admin only)
export async function POST(request: NextRequest) {
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
    const { username, password, nama, email, alamat, telepon } = body

    if (!username || !password || !nama) {
      return NextResponse.json(
        { error: 'Username, password, dan nama harus diisi' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const member = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nama,
        email,
        alamat,
        telepon,
        role: UserRole.SISWA,
      },
      select: {
        id: true,
        username: true,
        nama: true,
        email: true,
        alamat: true,
        telepon: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat anggota' },
      { status: 500 }
    )
  }
}

