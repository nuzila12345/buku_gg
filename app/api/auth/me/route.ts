import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = JSON.parse(userCookie.value)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

