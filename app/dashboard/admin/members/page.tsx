'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Member {
  id: string
  username: string
  nama: string
  email?: string
  alamat?: string
  telepon?: string
  createdAt: string
  _count: { transactions: number }
}

export default function MembersPage() {
  // Color palette - Teal
  const colorPalette = {
    primary: '#4FD3C4',      // Teal bright
    dark: '#0F766E',         // Teal dark
    light: '#F0FDFB',        // Mint very light
    accent: '#2DD4BF',       // Teal medium
    lightAccent: '#CCFBF1',  // Teal very light
  }

  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    email: '',
    alamat: '',
    telepon: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, members])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data.members || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching members:', error)
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    if (search) {
      filtered = filtered.filter(
        (member) =>
          member.nama.toLowerCase().includes(search.toLowerCase()) ||
          member.username.toLowerCase().includes(search.toLowerCase()) ||
          member.email?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredMembers(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingMember
        ? `/api/members/${editingMember.id}`
        : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      await fetchMembers()
      resetForm()
      alert(editingMember ? 'Anggota berhasil diupdate' : 'Anggota berhasil ditambahkan')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      username: member.username,
      password: '',
      nama: member.nama,
      email: member.email || '',
      alamat: member.alamat || '',
      telepon: member.telepon || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return

    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }
      await fetchMembers()
      alert('Anggota berhasil dihapus')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nama: '',
      email: '',
      alamat: '',
      telepon: '',
    })
    setEditingMember(null)
    setShowForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colorPalette.dark }}>
              👥 Kelola Anggota
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola data anggota perpustakaan
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: colorPalette.primary, color: 'white' }}
            className="whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>

        {showForm && (
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardHeader>
              <CardTitle style={{ color: colorPalette.dark }}>
                {editingMember ? '✏️ Edit Anggota' : '➕ Tambah Anggota Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Username *</label>
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      style={{ borderColor: colorPalette.accent }}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>
                      Password {editingMember ? '(kosongkan jika tidak diubah)' : '*'}
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      style={{ borderColor: colorPalette.accent }}
                      required={!editingMember}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Nama Lengkap *</label>
                    <Input
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      style={{ borderColor: colorPalette.accent }}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Alamat</label>
                    <Input
                      value={formData.alamat}
                      onChange={(e) =>
                        setFormData({ ...formData, alamat: e.target.value })
                      }
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Telepon</label>
                    <Input
                      value={formData.telepon}
                      onChange={(e) =>
                        setFormData({ ...formData, telepon: e.target.value })
                      }
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button 
                    type="submit"
                    style={{ backgroundColor: colorPalette.primary, color: 'white' }}
                  >
                    {editingMember ? 'Update' : 'Tambah'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    style={{ borderColor: colorPalette.accent, color: colorPalette.dark }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
          <CardHeader>
            <CardTitle style={{ color: colorPalette.dark }}>📋 Daftar Anggota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari anggota..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  style={{ borderColor: colorPalette.accent }}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8" style={{ color: colorPalette.dark }}>Memuat...</div>
            ) : (
              <Table>
                <TableHeader style={{ backgroundColor: colorPalette.light }}>
                  <TableRow style={{ borderBottomColor: colorPalette.accent, borderBottomWidth: '2px' }}>
                    <TableHead style={{ color: colorPalette.dark }}>Username</TableHead>
                    <TableHead style={{ color: colorPalette.dark }}>Nama</TableHead>
                    <TableHead style={{ color: colorPalette.dark }}>Email</TableHead>
                    <TableHead style={{ color: colorPalette.dark }}>Telepon</TableHead>
                    <TableHead style={{ color: colorPalette.dark }}>Total Peminjaman</TableHead>
                    <TableHead style={{ color: colorPalette.dark }}>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8" style={{ color: colorPalette.dark }}>
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id} style={{ borderBottomColor: colorPalette.light }}>
                        <TableCell className="font-medium" style={{ color: colorPalette.dark }}>
                          {member.username}
                        </TableCell>
                        <TableCell style={{ color: colorPalette.dark }}>{member.nama}</TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell>{member.telepon || '-'}</TableCell>
                        <TableCell style={{ color: colorPalette.primary }}>
                          <span className="font-semibold">{member._count.transactions}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              style={{ borderColor: colorPalette.accent, color: colorPalette.dark }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(member.id)}
                              style={{ borderColor: '#EF4444', color: '#EF4444' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

