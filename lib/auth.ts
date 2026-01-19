import { prisma } from './prisma'
import * as bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  nama: string
  email?: string
  alamat?: string
  telepon?: string
}

export async function verifyUser(credentials: LoginCredentials) {
  const user = await prisma.user.findUnique({
    where: { username: credentials.username },
  })

  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(credentials.password, user.password)

  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama,
  }
}

export async function createUser(data: RegisterData) {
  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      nama: data.nama,
      email: data.email,
      alamat: data.alamat,
      telepon: data.telepon,
      role: UserRole.SISWA,
    },
  })

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama,
  }
}

