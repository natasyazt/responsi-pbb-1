# 📚 Library Book Loan REST API (Layanan Pencatatan Peminjaman Buku)

REST API sederhana untuk layanan pencatatan dan pengelolaan peminjaman buku perpustakaan yang dibangun menggunakan **Node.js**, **Express.js**, dan **Supabase (PostgreSQL)**, serta siap di-deploy ke **Vercel**.

---

## 🔗 Link Hasil Deployment Vercel

- **URL Deployment Vercel**: `https://your-project-name.vercel.app` *(Ganti dengan link Vercel Anda setelah proses deploy)*
- **Contoh Filter Status Terlambat**: `https://your-project-name.vercel.app/loans?status=Terlambat`

---

## 📌 Deskripsi Umum & Tujuan Proyek

Proyek ini bertujuan untuk menyediakan layanan backend berupa REST API untuk sistem manajemen peminjaman buku perpustakaan. API ini memungkinkan petugas atau sistem perpustakaan untuk:
- Mencatat peminjaman baru oleh anggota perpustakaan.
- Melihat seluruh daftar peminjaman beserta detail statusnya.
- Menyaring data peminjaman berdasarkan status (misal: *Dipinjam*, *Kembali*, *Terlambat*), nama anggota, maupun judul buku.
- Memperbarui status dan tanggal pengembalian buku.
- Menghapus riwayat peminjaman buku.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Serverless Functions)

---

## 🗄️ Struktur Data / Schema Database

Tabel yang digunakan bernama `loans` dengan struktur field berikut:

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, default: `gen_random_uuid()` |
| `member_name` | `VARCHAR(150)` | Nama lengkap anggota perpustakaan (Wajib) |
| `member_id` | `VARCHAR(50)` | ID / Nomor Anggota / NIM (Opsional) |
| `book_title` | `VARCHAR(255)` | Judul buku yang dipinjam (Wajib) |
| `book_isbn` | `VARCHAR(50)` | Nomor ISBN buku (Opsional) |
| `loan_date` | `DATE` | Tanggal peminjaman, default: `CURRENT_DATE` |
| `due_date` | `DATE` | Tanggal batas pengembalian / jatuh tempo (Wajib) |
| `return_date` | `DATE` | Tanggal pengembalian buku (Diisi saat dikembalikan) |
| `status` | `VARCHAR(50)` | Status: `'Dipinjam'`, `'Kembali'`, atau `'Terlambat'` (Default: `'Dipinjam'`) |
| `notes` | `TEXT` | Catatan tambahan kondisi buku / peminjaman |
| `created_at` | `TIMESTAMPTZ` | Waktu pembuatan data (Otomatis) |
| `updated_at` | `TIMESTAMPTZ` | Waktu pembaruan data (Otomatis via Trigger) |

> 💡 **File SQL Schema:** Tersedia di file [`schema.sql`](file:///c:/Users/Yoga/OneDrive/New%20folder/responsi%20pbb%201/schema.sql) pada repositori ini.

---

## 🚀 Endpoint API & Contoh Request / Response

### 1. Root / Info API
- **URL**: `GET /`
- **Response**:
```json
{
  "success": true,
  "message": "Selamat Datang di REST API Layanan Pencatatan Peminjaman Buku Perpustakaan 📚",
  "version": "1.0.0",
  "endpoints": {
    "getAllLoans": "GET /loans",
    "filterByStatus": "GET /loans?status=Terlambat",
    "filterByMember": "GET /loans?member_name=Budi",
    "filterByBook": "GET /loans?book_title=Clean+Code",
    "search": "GET /loans?search=keyword",
    "getLoanDetail": "GET /loans/:id",
    "createLoan": "POST /loans",
    "updateLoan": "PUT /loans/:id atau PATCH /loans/:id",
    "deleteLoan": "DELETE /loans/:id"
  }
}
```

---

### 2. Get All Loans (Dengan Fitur Filter Query)
- **URL**: `GET /loans`
- **Query Parameters (Opsional)**:
  - `status`: Filter status (`Dipinjam`, `Kembali`, `Terlambat`) -> contoh: `GET /loans?status=Terlambat`
  - `member_name`: Filter nama peminjam -> contoh: `GET /loans?member_name=Budi`
  - `book_title`: Filter judul buku -> contoh: `GET /loans?book_title=Clean+Code`
  - `search`: Pencarian nama atau judul -> contoh: `GET /loans?search=Data`
  - `sort`: Kolom sorting (default: `created_at`)
  - `order`: `asc` atau `desc` (default: `desc`)

**Contoh Response `GET /loans?status=Terlambat`**:
```json
{
  "success": true,
  "message": "Berhasil mengambil daftar peminjaman buku",
  "total": 1,
  "filters": {
    "status": "Terlambat",
    "member_name": null,
    "book_title": null,
    "search": null
  },
  "data": [
    {
      "id": "e395ef36-121f-4bb2-b50a-8bfebbe5a86d",
      "member_name": "Budi Santoso",
      "member_id": "MBR-001",
      "book_title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "book_isbn": "978-0132350884",
      "loan_date": "2026-09-15",
      "due_date": "2026-09-22",
      "return_date": null,
      "status": "Terlambat",
      "notes": "Peminjaman melewati jatuh tempo",
      "created_at": "2026-09-29T15:00:00.000Z",
      "updated_at": "2026-09-29T15:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Loan By ID
- **URL**: `GET /loans/:id`
- **Contoh Request**: `GET /loans/e395ef36-121f-4bb2-b50a-8bfebbe5a86d`
- **Response**:
```json
{
  "success": true,
  "message": "Berhasil mengambil detail peminjaman buku",
  "data": {
    "id": "e395ef36-121f-4bb2-b50a-8bfebbe5a86d",
    "member_name": "Budi Santoso",
    "member_id": "MBR-001",
    "book_title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "book_isbn": "978-0132350884",
    "loan_date": "2026-09-15",
    "due_date": "2026-09-22",
    "return_date": null,
    "status": "Terlambat",
    "notes": "Peminjaman melewati jatuh tempo",
    "created_at": "2026-09-29T15:00:00.000Z",
    "updated_at": "2026-09-29T15:00:00.000Z"
  }
}
```

---

### 4. Create Loan (Tambah Peminjaman Baru)
- **URL**: `POST /loans`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "member_name": "Rian Ardiansyah",
  "member_id": "MBR-004",
  "book_title": "Refactoring: Improving the Design of Existing Code",
  "book_isbn": "978-0134757599",
  "loan_date": "2026-09-29",
  "due_date": "2026-10-06",
  "notes": "Pinjam untuk referensi skripsi"
}
```
- **Response (Status 201 Created)**:
```json
{
  "success": true,
  "message": "Data peminjaman buku berhasil ditambahkan",
  "data": {
    "id": "784d1ec5-9a84-4861-a083-d510e10fca56",
    "member_name": "Rian Ardiansyah",
    "member_id": "MBR-004",
    "book_title": "Refactoring: Improving the Design of Existing Code",
    "book_isbn": "978-0134757599",
    "loan_date": "2026-09-29",
    "due_date": "2026-10-06",
    "return_date": null,
    "status": "Dipinjam",
    "notes": "Pinjam untuk referensi skripsi",
    "created_at": "2026-09-29T15:10:00.000Z",
    "updated_at": "2026-09-29T15:10:00.000Z"
  }
}
```

---

### 5. Update Loan (Update Data / Pengembalian)
- **URL**: `PUT /loans/:id` atau `PATCH /loans/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "status": "Kembali",
  "return_date": "2026-10-05",
  "notes": "Dikembalikan dalam kondisi baik dan lengkap"
}
```
- **Response (Status 200 OK)**:
```json
{
  "success": true,
  "message": "Data peminjaman buku berhasil diperbarui",
  "data": {
    "id": "784d1ec5-9a84-4861-a083-d510e10fca56",
    "member_name": "Rian Ardiansyah",
    "member_id": "MBR-004",
    "book_title": "Refactoring: Improving the Design of Existing Code",
    "book_isbn": "978-0134757599",
    "loan_date": "2026-09-29",
    "due_date": "2026-10-06",
    "return_date": "2026-10-05",
    "status": "Kembali",
    "notes": "Dikembalikan dalam kondisi baik dan lengkap",
    "created_at": "2026-09-29T15:10:00.000Z",
    "updated_at": "2026-09-29T15:15:00.000Z"
  }
}
```

---

### 6. Delete Loan (Hapus Data Peminjaman)
- **URL**: `DELETE /loans/:id`
- **Response (Status 200 OK)**:
```json
{
  "success": true,
  "message": "Data peminjaman buku berhasil dihapus",
  "deleted_data": {
    "id": "784d1ec5-9a84-4861-a083-d510e10fca56",
    "member_name": "Rian Ardiansyah",
    "book_title": "Refactoring: Improving the Design of Existing Code"
  }
}
```

---

## 💻 Panduan Instalasi & Menjalankan Lokal

### 1. Clone Repositori
```bash
git clone <URL_REPOSITORY_ANDA>
cd "responsi pbb 1"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` di root project (atau salin dari `.env.example`):
```env
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### 4. Jalankan Aplikasi
- **Mode Development (Auto-reload)**:
  ```bash
  npm run dev
  ```
- **Mode Production**:
  ```bash
  npm start
  ```

API akan aktif di: `http://localhost:3000`

---

## 🗄️ Panduan Langkah Demi Langkah Setup Supabase

Ikuti langkah-langkah berikut untuk menyiapkan database Supabase:

1. **Buka Supabase**:
   Kunjungi [https://supabase.com](https://supabase.com) dan login / register akun.
2. **Buat Project Baru**:
   - Klik **New Project**.
   - Masukkan **Name** (contoh: `perpustakaan-api`).
   - Masukkan **Database Password** yang aman (simpan password ini).
   - Pilih Region terdekat (contoh: `Southeast Asia (Singapore)`).
   - Klik **Create new project**.
3. **Eksekusi SQL Schema**:
   - Di dashboard project Supabase, buka menu **SQL Editor** di sidebar kiri (ikon `>_`).
   - Klik **New Query**.
   - Buka file [`schema.sql`](file:///c:/Users/Yoga/OneDrive/New%20folder/responsi%20pbb%201/schema.sql) dari proyek ini, salin seluruh isinya, dan tempelkan (paste) ke SQL Editor.
   - Klik tombol **Run** (atau tekan `Ctrl + Enter`).
   - Anda akan melihat tabel `loans` berhasil dibuat beserta index dan data dummy.
4. **Ambil Kredensial API**:
   - Buka menu **Project Settings** (ikon gear di sidebar kiri bawah).
   - Klik menu **API**.
   - Salin **Project URL** (masukkan ke `SUPABASE_URL` di file `.env`).
   - Salin **Project API Keys** bagian `anon` / `public` (masukkan ke `SUPABASE_KEY` di file `.env`).

---

## ☁️ Panduan Langkah Demi Langkah Deployment ke Vercel

Ikuti langkah-langkah berikut untuk men-deploy API ke Vercel:

1. **Push Proyek ke GitHub**:
   - Buat repository baru di [GitHub](https://github.com/new).
   - Jalankan perintah git di terminal:
     ```bash
     git init
     git add .
     git commit -m "feat: initial commit library loan rest api"
     git branch -M main
     git remote add origin https://github.com/<username>/<repo-name>.git
     git push -u origin main
     ```
2. **Login ke Vercel**:
   - Buka [https://vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
3. **Import Project**:
   - Klik tombol **Add New...** -> **Project**.
   - Pilih repository GitHub yang baru saja di-push.
4. **Konfigurasi Environment Variables di Vercel**:
   - Pada halaman konfigurasi project sebelum deploy, buka bagian **Environment Variables**.
   - Tambahkan dua key berikut:
     - `SUPABASE_URL`: `https://your-project-id.supabase.co`
     - `SUPABASE_KEY`: `your-supabase-anon-key`
5. **Klik Deploy**:
   - Klik tombol **Deploy** dan tunggu proses build sekitar 30 detik.
   - Setelah selesai, Anda akan mendapatkan URL publik Vercel (misal: `https://perpustakaan-api-xxxx.vercel.app`).
6. **Uji Coba API Publik**:
   - Buka browser atau Postman: `https://perpustakaan-api-xxxx.vercel.app/loans?status=Terlambat`
   - Pastikan data berhasil ditampilkan!
