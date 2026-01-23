'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, LogOut, Users, BookCheck, LayoutDashboard, Menu, X, AlertCircle, TrendingUp, MessageSquare, QrCode } from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
  nama: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login')
        } else {
          setUser(data.user)
          setLoading(false)
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const isSiswa = user?.role === 'SISWA'

  const adminMenu = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/books', label: 'Kelola Data Buku', icon: BookOpen },
    { href: '/dashboard/admin/transactions', label: 'Transaksi', icon: BookCheck },
    { href: '/dashboard/admin/history', label: 'Riwayat Peminjaman', icon: BookCheck },
    { href: '/dashboard/admin/denda', label: 'Denda', icon: AlertCircle },
    { href: '/dashboard/admin/members', label: 'Kelola Anggota', icon: Users },
    { href: '/dashboard/admin/qrcode', label: 'QR Code', icon: QrCode },
  ]

  const siswaMenu = [
    { href: '/dashboard/siswa', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/siswa/borrow', label: 'Peminjaman Buku', icon: BookOpen },
    { href: '/dashboard/siswa/scan-qr', label: 'Scan QR Code', icon: QrCode },
    { href: '/dashboard/siswa/history', label: 'Riwayat Peminjaman', icon: BookCheck },
    { href: '/dashboard/siswa/return', label: 'Pengembalian Buku', icon: BookCheck },
    { href: '/dashboard/siswa/review', label: 'Review & Rating', icon: MessageSquare },
    { href: '/dashboard/siswa/statistics', label: 'Statistik', icon: TrendingUp },
    { href: '/dashboard/siswa/denda', label: 'Tracker Denda', icon: AlertCircle },
  ]

  const menuItems = isAdmin ? adminMenu : siswaMenu

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F4F7' }}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold" style={{ color: '#1A3D64' }}>
            Sistem Peminjaman Buku
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transition-transform duration-300`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold" style={{ color: '#1A3D64' }}>
                {isAdmin ? 'Admin Panel' : 'Dashboard Siswa'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{user?.nama}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'hover:bg-accent text-foreground'
                    }`}
                    style={isActive ? { backgroundColor: '#1A3D64' } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

