const supabase = require('../config/supabase');

// 1. GET ALL LOANS (Dengan fitur Filter Query, misal ?status=Terlambat)
const getAllLoans = async (req, res, next) => {
  try {
    const { status, member_name, book_title, search, sort = 'created_at', order = 'desc' } = req.query;

    let query = supabase
      .from('loans')
      .select('*');

    // Filter berdasarkan status (contoh: ?status=Terlambat atau ?status=Dipinjam)
    if (status) {
      query = query.ilike('status', `%${status.trim()}%`);
    }

    // Filter berdasarkan nama anggota / peminjam
    if (member_name) {
      query = query.ilike('member_name', `%${member_name.trim()}%`);
    }

    // Filter berdasarkan judul buku
    if (book_title) {
      query = query.ilike('book_title', `%${book_title.trim()}%`);
    }

    // Filter pencarian umum (search across member_name atau book_title)
    if (search) {
      query = query.or(`member_name.ilike.%${search.trim()}%,book_title.ilike.%${search.trim()}%`);
    }

    // Urutan (Sorting)
    const ascending = order.toLowerCase() === 'asc';
    query = query.order(sort, { ascending });

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data peminjaman buku',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar peminjaman buku',
      total: data.length,
      filters: {
        status: status || null,
        member_name: member_name || null,
        book_title: book_title || null,
        search: search || null
      },
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET LOAN BY ID
const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: `Data peminjaman dengan ID '${id}' tidak ditemukan`
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data peminjaman buku',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail peminjaman buku',
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE NEW LOAN (POST /loans)
const createLoan = async (req, res, next) => {
  try {
    const {
      member_name,
      member_id,
      book_title,
      book_isbn,
      loan_date,
      due_date,
      status,
      notes
    } = req.body;

    // Validasi field wajib
    if (!member_name || !book_title || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Field member_name, book_title, dan due_date wajib diisi!'
      });
    }

    const newLoan = {
      member_name: member_name.trim(),
      member_id: member_id ? member_id.trim() : null,
      book_title: book_title.trim(),
      book_isbn: book_isbn ? book_isbn.trim() : null,
      loan_date: loan_date || new Date().toISOString().split('T')[0],
      due_date: due_date,
      return_date: null,
      status: status || 'Dipinjam',
      notes: notes || null
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([newLoan])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan data peminjaman buku',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Data peminjaman buku berhasil ditambahkan',
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE LOAN (PUT /loans/:id atau PATCH /loans/:id)
const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      member_name,
      member_id,
      book_title,
      book_isbn,
      loan_date,
      due_date,
      return_date,
      status,
      notes
    } = req.body;

    // Cek apakah data ada terlebih dahulu
    const { data: existingLoan, error: checkError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingLoan) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID '${id}' tidak ditemukan`
      });
    }

    // Bangun object update hanya untuk field yang dikirim
    const updateData = {};
    if (member_name !== undefined) updateData.member_name = member_name.trim();
    if (member_id !== undefined) updateData.member_id = member_id ? member_id.trim() : null;
    if (book_title !== undefined) updateData.book_title = book_title.trim();
    if (book_isbn !== undefined) updateData.book_isbn = book_isbn ? book_isbn.trim() : null;
    if (loan_date !== undefined) updateData.loan_date = loan_date;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (return_date !== undefined) updateData.return_date = return_date;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Jika status diubah menjadi 'Kembali' dan return_date belum diset, otomatis set tanggal hari ini
    if (status === 'Kembali' && !return_date && !existingLoan.return_date) {
      updateData.return_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui data peminjaman buku',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data peminjaman buku berhasil diperbarui',
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE LOAN (DELETE /loans/:id)
const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cek keberadaan data
    const { data: existingLoan, error: checkError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingLoan) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID '${id}' tidak ditemukan`
      });
    }

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus data peminjaman buku',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data peminjaman buku berhasil dihapus',
      deleted_data: existingLoan
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan
};
