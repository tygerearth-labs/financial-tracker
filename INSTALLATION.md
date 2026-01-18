# Financial Tracker - Instalasi dan Panduan

Aplikasi Financial Tracker dengan dukungan multi-profil, built with Next.js 15, TypeScript, Tailwind CSS, dan shadcn/ui.

## 📋 Prasyarat

- Node.js 18+ atau Bun
- Akun GitHub (untuk Vercel)
- Akun Neon Tech (opsional, untuk database production)

## 🚀 Instalasi Lokal

### 1. Clone Repository

```bash
git clone <repository-url>
cd my-project
```

### 2. Install Dependencies

Jika menggunakan Bun:
```bash
bun install
```

Jika menggunakan npm:
```bash
npm install
```

### 3. Setup Database (SQLite - Default)

Database SQLite sudah dikonfigurasi secara default. Cukup jalankan:

```bash
bun run db:push
```

Ini akan membuat file `db/custom.db` dan menginisialisasi schema.

### 4. Konfigurasi Environment Variables

Buat file `.env` di root project:

```env
# Database (SQLite - Default)
DATABASE_URL="file:../db/custom.db"

# Jika menggunakan Neon (lihat bagian Neon Tech di bawah)
# DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 5. Jalankan Development Server

```bash
bun run dev
```

Akses aplikasi di: `http://localhost:3000`

---

## ☁️ Setup Neon Tech Database

Neon Tech adalah serverless PostgreSQL yang scalable dan cocok untuk production Vercel.

### 1. Buat Akun Neon

1. Kunjungi [https://neon.tech](https://neon.tech)
2. Sign up dengan GitHub, Google, atau email

### 2. Buat Project Baru

1. Klik "Create a project"
2. Pilih region terdekat (misal: Singapore untuk Asia Tenggara)
3. Beri nama project (misal: financial-tracker)
4. Klik "Create project"

### 3. Dapatkan Connection String

Setelah project dibuat, Neon akan menampilkan connection string:

```
postgresql://username:password@ep-cool-region.aws.neon.tech/financial-tracker?sslmode=require
```

Copy connection string ini.

### 4. Update .env File

```env
# Update dengan connection string dari Neon
DATABASE_URL="postgresql://username:password@ep-cool-region.aws.neon.tech/financial-tracker?sslmode=require"
```

### 5. Update Prisma Schema untuk Neon

Edit file `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Ubah dari "sqlite" ke "postgresql"
  url      = env("DATABASE_URL")
}
```

### 6. Push Schema ke Neon

```bash
bun run db:push
```

Ini akan membuat semua tabel di database Neon Anda.

### 7. Generate Prisma Client

```bash
bun run db:generate
```

---

## 🌐 Deploy ke Vercel

### 1. Persiapan

1. Push kode ke GitHub repository
2. Pastikan file `.gitignore` sudah dikonfigurasi dengan benar

### 2. Buat Akun Vercel

1. Kunjungi [https://vercel.com](https://vercel.com)
2. Sign up dengan GitHub, GitLab, atau Bitbucket

### 3. Import Project ke Vercel

1. Klik "Add New" → "Project"
2. Pilih repository GitHub Anda
3. Vercel akan otomatis mendeteksi project Next.js

### 4. Konfigurasi Environment Variables di Vercel

Di Vercel dashboard, masuk ke:

**Settings → Environment Variables**

Tambahkan variable berikut:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Connection string dari Neon Tech |

Contoh:
```
postgresql://neondb_owner:npg_zYFTKfR3D6Bb@ep-calm-salad-a1sjb1a6.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Klik "Save".

### 5. Build Configuration

Vercel akan otomatis mendeteksi Next.js configuration. Pastikan `package.json` memiliki:

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  }
}
```

### 6. Deploy

Klik "Deploy" dan tunggu proses build selesai.

Vercel akan memberikan URL production seperti:
```
https://financial-tracker.vercel.app
```

---

## 🔧 File .env Lengkap

### Development (SQLite)

```env
# Database SQLite untuk development
DATABASE_URL="file:../db/custom.db"
```

### Production (Neon PostgreSQL)

```env
# Database Neon untuk production
DATABASE_URL="postgresql://neondb_owner:npg_zYFTKfR3D6Bb@ep-calm-salad-a1sjb1a6.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Optional Environment Variables

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Financial Tracker"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# (Opsional) Untuk integrasi di masa depan
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"
```

---

## 📝 Database Migration

### Development

Untuk membuat migration baru:

```bash
bun run db:migrate
```

### Push Schema Tanpa Migration (Cepat)

```bash
bun run db:push
```

### Reset Database (Hati-hati!)

```bash
bun run db:reset
```

**⚠️ Peringatan**: Ini akan menghapus semua data di database!

---

## 🐛 Troubleshooting

### Masalah: Database Connection Error

**SQLite**:
- Pastikan folder `db` ada dan writable
- Cek path di `DATABASE_URL`

**Neon PostgreSQL**:
- Pastikan connection string benar
- Coba restart project di Vercel

### Masalah: Build Error di Vercel

1. Pastikan semua dependencies terinstall:
```bash
bun install
```

2. Coba rebuild local:
```bash
bun run build
```

3. Cek logs di Vercel Dashboard → Deployments

### Masalah: Prisma Client Not Generated

```bash
bun run db:generate
```

---

## 📚 Struktur Project

```
my-project/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── profiles/     # Profile CRUD
│   │   │   ├── income/       # Income CRUD
│   │   │   ├── expense/      # Expense CRUD
│   │   │   ├── categories/   # Category CRUD
│   │   │   └── savings/      # Savings CRUD
│   │   ├── income/           # Income page
│   │   ├── expense/          # Expense page
│   │   ├── savings/          # Savings page
│   │   ├── reports/          # Reports page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Dashboard page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── providers/        # Theme provider
│   ├── contexts/
│   │   └── ProfileContext.tsx # Profile state management
│   ├── hooks/
│   │   └── use-toast.ts      # Toast hook
│   └── lib/
│       ├── db.ts             # Prisma client
│       └── utils.ts          # Utilities
├── public/                    # Static assets
├── .env                      # Environment variables
├── package.json              # Dependencies
└── INSTALLATION.md           # File ini
```

---

## 🎯 Fitur Utama

✅ Multi-profile support (Profil 1, Profil 2, Profil 3, dll)
✅ CRUD Kas Masuk dengan kategori
✅ CRUD Kas Keluar dengan kategori
✅ Target Tabungan dengan sistem alokasi
✅ Laporan lengkap dengan export Excel/CSV
✅ Dark/Light theme support
✅ Responsive design (Mobile & Desktop)
✅ Dashboard dengan ringkasan keuangan

---

## 📞 Support

Jika mengalami masalah atau butuh bantuan:

1. Cek logs di terminal untuk development
2. Cek Vercel Dashboard untuk production logs
3. Review dokumentasi resmi:
   - [Next.js](https://nextjs.org/docs)
   - [Prisma](https://www.prisma.io/docs)
   - [Neon](https://neon.tech/docs)
   - [Vercel](https://vercel.com/docs)

---

## 📄 License

Created by Tyger Earth | Ahtjong Labs

© 2024 Financial Tracker. All rights reserved.
