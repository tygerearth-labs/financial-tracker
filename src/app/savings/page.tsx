'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import FinancialTrackerApp from '@/components/FinancialTrackerApp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { Target, Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface SavingsTarget {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  startDate: Date
  targetDate: Date
  allocationPercent: number
}

export default function SavingsPage() {
  const { activeProfile } = useProfile()
  const [savingsList, setSavingsList] = useState<SavingsTarget[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<SavingsTarget | null>(null)
  const [savingsForm, setSavingsForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    allocationPercent: '',
  })

  useEffect(() => {
    if (activeProfile) {
      loadSavings()
    }
  }, [activeProfile])

  const loadSavings = async () => {
    if (!activeProfile) return
    try {
      const response = await fetch(`/api/savings?profileId=${activeProfile.id}`)
      if (response.ok) {
        const data = await response.json()
        setSavingsList(data)
      }
    } catch (error) {
      console.error('Error loading savings:', error)
    }
  }

  const handleCreateSavings = async () => {
    if (!activeProfile) return

    try {
      const response = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...savingsForm,
          profileId: activeProfile.id,
        }),
      })

      if (response.ok) {
        await loadSavings()
        setSavingsForm({
          name: '',
          targetAmount: '',
          currentAmount: '',
          startDate: new Date().toISOString().split('T')[0],
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          allocationPercent: '',
        })
        setDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Target tabungan baru telah dibuat',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat target tabungan',
        variant: 'destructive',
      })
    }
  }

  const handleEditSavings = async () => {
    if (!editingSavings) return

    try {
      const response = await fetch(`/api/savings/${editingSavings.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savingsForm),
      })

      if (response.ok) {
        await loadSavings()
        setSavingsForm({
          name: '',
          targetAmount: '',
          currentAmount: '',
          startDate: new Date().toISOString().split('T')[0],
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          allocationPercent: '',
        })
        setEditingSavings(null)
        setDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Target tabungan telah diperbarui',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui target tabungan',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteSavings = async (id: string) => {
    try {
      const response = await fetch(`/api/savings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadSavings()
        toast({
          title: 'Berhasil',
          description: 'Target tabungan telah dihapus',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus target tabungan',
        variant: 'destructive',
      })
    }
  }

  const openCreateDialog = () => {
    setEditingSavings(null)
    setSavingsForm({
      name: '',
      targetAmount: '',
      currentAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      allocationPercent: '',
    })
    setDialogOpen(true)
  }

  const openEditDialog = (savings: SavingsTarget) => {
    setEditingSavings(savings)
    setSavingsForm({
      name: savings.name,
      targetAmount: savings.targetAmount.toString(),
      currentAmount: savings.currentAmount.toString(),
      startDate: new Date(savings.startDate).toISOString().split('T')[0],
      targetDate: new Date(savings.targetDate).toISOString().split('T')[0],
      allocationPercent: savings.allocationPercent.toString(),
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

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateDaysRemaining = (targetDate: Date) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (!activeProfile) {
    return <FinancialTrackerApp><div /></FinancialTrackerApp>
  }

  return (
    <FinancialTrackerApp>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Target Tabungan</h1>
            <p className="text-muted-foreground mt-2">
              Atur dan pantau target tabungan Anda
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSavings ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}
                </DialogTitle>
                <DialogDescription>
                  {editingSavings ? 'Edit target tabungan Anda' : 'Buat target tabungan baru'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Target</Label>
                  <Input
                    id="name"
                    value={savingsForm.name}
                    onChange={(e) => setSavingsForm({ ...savingsForm, name: e.target.value })}
                    placeholder="Contoh: Dana Darurat, Liburan, dll"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Jumlah (Rp)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={savingsForm.targetAmount}
                    onChange={(e) => setSavingsForm({ ...savingsForm, targetAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Jumlah Saat Ini (Rp)</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={savingsForm.currentAmount}
                    onChange={(e) => setSavingsForm({ ...savingsForm, currentAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={savingsForm.startDate}
                    onChange={(e) => setSavingsForm({ ...savingsForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Tanggal</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={savingsForm.targetDate}
                    onChange={(e) => setSavingsForm({ ...savingsForm, targetDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocationPercent">
                    Persentase Alokasi dari Kas Masuk (%) - Opsional
                  </Label>
                  <Input
                    id="allocationPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={savingsForm.allocationPercent}
                    onChange={(e) => setSavingsForm({ ...savingsForm, allocationPercent: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Persentase kas masuk yang akan dialokasikan ke target ini
                  </p>
                </div>
                <Button
                  onClick={editingSavings ? handleEditSavings : handleCreateSavings}
                  className="w-full"
                >
                  {editingSavings ? 'Simpan Perubahan' : 'Buat Target'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savingsList.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Belum ada target tabungan</p>
                    <p className="text-sm mt-2">Klik tombol tambah untuk memulai</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            savingsList.map((savings) => (
              <Card key={savings.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{savings.name}</CardTitle>
                      <CardDescription>
                        Target: {formatCurrency(savings.targetAmount)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(savings)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSavings(savings.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pencapaian</span>
                      <span className="font-medium">
                        {formatCurrency(savings.currentAmount)} / {formatCurrency(savings.targetAmount)}
                      </span>
                    </div>
                    <Progress value={calculateProgress(savings.currentAmount, savings.targetAmount)} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {calculateProgress(savings.currentAmount, savings.targetAmount).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tanggal Mulai</span>
                      <span>{format(new Date(savings.startDate), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Target Tanggal</span>
                      <span>{format(new Date(savings.targetDate), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sisa Waktu</span>
                      <span className="font-medium">
                        {calculateDaysRemaining(savings.targetDate)} hari
                      </span>
                    </div>
                    {savings.allocationPercent > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Alokasi</span>
                        <span className="font-medium text-primary">
                          {savings.allocationPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </FinancialTrackerApp>
  )
}
