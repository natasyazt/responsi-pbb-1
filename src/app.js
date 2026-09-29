const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const loanRoutes = require('./routes/loanRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitasi URL jika terdapat newline / spasi (%0A / %20) di ujung URL
app.use((req, res, next) => {
  req.url = req.url.trim().replace(/[\r\n]+$/, '');
  next();
});

// Root Endpoint - Informasi API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Selamat Datang di REST API Layanan Pencatatan Peminjaman Buku Perpustakaan 📚',
    version: '1.0.0',
    endpoints: {
      getAllLoans: 'GET /loans',
      filterByStatus: 'GET /loans?status=Terlambat (contoh status: Dipinjam, Kembali, Terlambat)',
      filterByMember: 'GET /loans?member_name=Budi',
      filterByBook: 'GET /loans?book_title=Clean+Code',
      search: 'GET /loans?search=keyword',
      getLoanDetail: 'GET /loans/:id',
      createLoan: 'POST /loans',
      updateLoan: 'PUT /loans/:id atau PATCH /loans/:id',
      deleteLoan: 'DELETE /loans/:id'
    }
  });
});

// Daftarkan Routes
app.use('/loans', loanRoutes);

// Middleware 404 & Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Jalankan server jika dieksekusi langsung
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
