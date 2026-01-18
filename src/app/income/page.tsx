'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import FinancialTrackerApp from '@/components/FinancialTrackerApp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { ArrowDownCircle, Plus, Edit, Trash2, FolderPlus } from 'lucide-react'
import { format } from 'date-fns'

interface Category {
  id: string
  name: string
  type: string
  color: string
}

interface Income {
  id: string
  amount: number
  description: string | null
  date: Date
  category: Category
}

export default function IncomePage() {
  const { activeProfile } = useProfile()
  const [incomeList, setIncomeList] = useState<Income[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#10b981',
  })

  useEffect(() => {
    if (activeProfile) {
      loadIncome()
      loadCategories()
    }
  }, [activeProfile])

  const loadIncome = async () => {
    if (!activeProfile) return
    try {
      const response = await fetch(`/api/income?profileId=${activeProfile.id}`)
      if (response.ok) {
        const data = await response.json()
        setIncomeList(data)
      }
    } catch (error) {
      console.error('Error loading income:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=INCOME')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCreateIncome = async () => {
    if (!activeProfile) return

    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...incomeForm,
          profileId: activeProfile.id,
        }),
      })

      if (response.ok) {
        await loadIncome()
        setIncomeForm({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          categoryId: '',
        })
        setDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Data kas masuk telah ditambahkan',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menambahkan data kas masuk',
        variant: 'destructive',
      })
    }
  }

  const handleEditIncome = async () => {
    if (!editingIncome) return

    try {
      const response = await fetch(`/api/income/${editingIncome.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeForm),
      })

      if (response.ok) {
        await loadIncome()
        setIncomeForm({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          categoryId: '',
        })
        setEditingIncome(null)
        setDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Data kas masuk telah diperbarui',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui data kas masuk',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadIncome()
        toast({
          title: 'Berhasil',
          description: 'Data kas masuk telah dihapus',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus data kas masuk',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          type: 'INCOME',
        }),
      })

      if (response.ok) {
        await loadCategories()
        setCategoryForm({ name: '', color: '#10b981' })
        setCategoryDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Kategori baru telah dibuat',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat kategori',
        variant: 'destructive',
      })
    }
  }

  const openCreateDialog = () => {
    setEditingIncome(null)
    setIncomeForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
    })
    setDialogOpen(true)
  }

  const openEditDialog = (income: Income) => {
    setEditingIncome(income)
    setIncomeForm({
      amount: income.amount.toString(),
      description: income.description || '',
      date: new Date(income.date).toISOString().split('T')[0],
      categoryId: income.category.id,
    })
    setDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!activeProfile) {
    return <FinancialTrackerApp><div /></FinancialTrackerApp>
  }

  return (
    <FinancialTrackerApp>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kas Masuk</h1>
            <p className="text-muted-foreground mt-2">
              Kelola semua pemasukan keuangan Anda
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Kategori
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Kategori Baru</DialogTitle>
                  <DialogDescription>
                    Buat kategori untuk mengelompokkan kas masuk
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Nama Kategori</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Contoh: Gaji, Bonus, dll"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryColor">Warna</Label>
                    <Input
                      id="categoryColor"
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <Button onClick={handleCreateCategory} className="w-full">
                    Buat Kategori
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kas Masuk
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingIncome ? 'Edit Kas Masuk' : 'Tambah Kas Masuk'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingIncome ? 'Edit data kas masuk Anda' : 'Tambah data kas masuk baru'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (Rp)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={incomeForm.date}
                      onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Kategori</Label>
                    <Select
                      value={incomeForm.categoryId}
                      onValueChange={(value) => setIncomeForm({ ...incomeForm, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="description"
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                      placeholder="Deskripsi kas masuk"
                    />
                  </div>
                  <Button
                    onClick={editingIncome ? handleEditIncome : handleCreateIncome}
                    className="w-full"
                  >
                    {editingIncome ? 'Simpan Perubahan' : 'Tambah Kas Masuk'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Kas Masuk</CardTitle>
            <CardDescription>
              Daftar semua transaksi kas masuk Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto">
              {incomeList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowDownCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Belum ada data kas masuk</p>
                  <p className="text-sm mt-2">Klik tombol tambah untuk memulai</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeList.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>{format(new Date(income.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{income.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: income.category.color }}
                            />
                            {income.category.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(income.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(income)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteIncome(income.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FinancialTrackerApp>
  )
}
