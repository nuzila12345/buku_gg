'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        setLoading(false)
        return
      }

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/siswa')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0FDFB' }}>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center" style={{ color: '#0F766E' }}>
            Sistem Peminjaman Buku
          </CardTitle>
          <CardDescription className="text-center">
            Masuk ke akun Anda
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md" style={{ backgroundColor: '#EF444420', color: '#EF4444', border: '1px solid #EF4444' }}>
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              style={{ backgroundColor: '#0F766E' }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="hover:underline font-medium" style={{ color: '#0F766E' }}>
                Daftar di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

