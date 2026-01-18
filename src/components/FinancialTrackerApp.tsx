'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  FileText,
  Sun,
  Moon,
  Monitor,
  User,
  Plus,
  Edit,
  Trash2,
  Menu,
  X,
} from 'lucide-react'

type MenuItem = {
  label: string
  icon: any
  href: string
  visible: boolean
}

interface FinancialTrackerAppProps {
  children: ReactNode
}

export default function FinancialTrackerApp({ children }: FinancialTrackerAppProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { activeProfile, setActiveProfile, profiles, setProfiles } = useProfile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [profileForm, setProfileForm] = useState({ name: '', description: '' })

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/', visible: true },
    { label: 'Kas Masuk', icon: ArrowDownCircle, href: '/income', visible: true },
    { label: 'Kas Keluar', icon: ArrowUpCircle, href: '/expense', visible: true },
    { label: 'Target Tabungan', icon: Target, href: '/savings', visible: true },
    { label: 'Laporan', icon: FileText, href: '/reports', visible: true },
  ]

  const handleCreateProfile = async () => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const newProfile = await response.json()
        setProfiles([...profiles, newProfile])
        setProfileForm({ name: '', description: '' })
        setProfileDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Profil baru telah dibuat',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat profil',
        variant: 'destructive',
      })
    }
  }

  const handleEditProfile = async () => {
    if (!editingProfile) return

    try {
      const response = await fetch(`/api/profiles/${editingProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfiles(profiles.map((p) => (p.id === editingProfile.id ? updatedProfile : p)))
        if (activeProfile?.id === editingProfile.id) {
          setActiveProfile(updatedProfile)
        }
        setProfileForm({ name: '', description: '' })
        setEditingProfile(null)
        setProfileDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Profil telah diperbarui',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui profil',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const newProfiles = profiles.filter((p) => p.id !== profileId)
        setProfiles(newProfiles)
        if (activeProfile?.id === profileId) {
          setActiveProfile(null)
        }
        toast({
          title: 'Berhasil',
          description: 'Profil telah dihapus',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus profil',
        variant: 'destructive',
      })
    }
  }

  const openCreateDialog = () => {
    setEditingProfile(null)
    setProfileForm({ name: '', description: '' })
    setProfileDialogOpen(true)
  }

  const openEditDialog = (profile: any) => {
    setEditingProfile(profile)
    setProfileForm({ name: profile.name, description: profile.description || '' })
    setProfileDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline-block font-bold text-lg">Financial Tracker</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {activeProfile ? activeProfile.name : 'Pilih Profil'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Profil</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profiles.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Belum ada profil
                  </div>
                ) : (
                  <>
                    {profiles.map((profile) => (
                      <div key={profile.id} className="group flex items-center justify-between px-2 py-1">
                        <DropdownMenuItem
                          className="flex-1"
                          onClick={() => setActiveProfile(profile)}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{profile.name}</span>
                          </div>
                          {activeProfile?.id === profile.id && (
                            <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                          )}
                        </DropdownMenuItem>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(profile)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
                <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault()
                      openCreateDialog()
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Profil Baru
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProfile ? 'Edit Profil' : 'Buat Profil Baru'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProfile
                          ? 'Edit profil keuangan Anda'
                          : 'Buat profil keuangan baru untuk memisahkan data keuangan'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Profil</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Contoh: Profil 1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi (Opsional)</Label>
                        <Textarea
                          id="description"
                          value={profileForm.description}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, description: e.target.value })
                          }
                          placeholder="Deskripsi profil keuangan"
                        />
                      </div>
                      <Button
                        onClick={editingProfile ? handleEditProfile : handleCreateProfile}
                        className="w-full"
                      >
                        {editingProfile ? 'Simpan Perubahan' : 'Buat Profil'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b bg-background">
          <nav className="container px-4 py-4 space-y-2">
            {menuItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Sidebar + Content for Desktop */}
        <div className="container px-4 sm:px-8 py-6">
          <div className="lg:flex lg:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:w-64 shrink-0">
              <nav className="sticky top-24 space-y-2">
                {menuItems
                  .filter((item) => item.visible)
                  .map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
              </nav>
            </aside>

            {/* Page Content Area */}
            <div className="flex-1 min-w-0">
              <div className="max-w-6xl mx-auto">
                {!activeProfile ? (
                  <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4 p-8">
                      <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Pilih Profil</h3>
                        <p className="text-muted-foreground max-w-sm">
                          Pilih atau buat profil keuangan untuk memulai pengelolaan keuangan
                        </p>
                      </div>
                      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Profil Baru
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Buat Profil Baru</DialogTitle>
                            <DialogDescription>
                              Buat profil keuangan baru untuk memisahkan data keuangan
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nama Profil</Label>
                              <Input
                                id="name"
                                value={profileForm.name}
                                onChange={(e) =>
                                  setProfileForm({ ...profileForm, name: e.target.value })
                                }
                                placeholder="Contoh: Profil 1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Deskripsi (Opsional)</Label>
                              <Textarea
                                id="description"
                                value={profileForm.description}
                                onChange={(e) =>
                                  setProfileForm({ ...profileForm, description: e.target.value })
                                }
                                placeholder="Deskripsi profil keuangan"
                              />
                            </div>
                            <Button onClick={handleCreateProfile} className="w-full">
                              Buat Profil
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {children}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Financial Tracker - Multi-Profile Financial Management
            </p>
            <p className="text-sm text-muted-foreground">
              Created by <span className="font-medium">Tyger Earth | Ahtjong Labs</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
