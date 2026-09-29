-- =======================================================
-- SQL SCHEMA FOR SUPABASE: Library Loan System (Peminjaman Buku)
-- =======================================================

-- 1. Buat Tabel loans
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_name VARCHAR(150) NOT NULL,
    member_id VARCHAR(50),
    book_title VARCHAR(255) NOT NULL,
    book_isbn VARCHAR(50),
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Dipinjam', -- 'Dipinjam', 'Kembali', 'Terlambat'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Index untuk optimasi pencarian & filter
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_member_name ON loans(member_name);
CREATE INDEX IF NOT EXISTS idx_loans_book_title ON loans(book_title);

-- 3. Function & Trigger untuk memperbarui updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS) - Optional (Allow Public for API key)
-- Secara default di Supabase, bila RLS di-enable, kita perlu buat policy:
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write access" 
ON loans 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Data Dummy Awal untuk Pengujian (Opsional)
INSERT INTO loans (member_name, member_id, book_title, book_isbn, loan_date, due_date, return_date, status, notes)
VALUES 
('Budi Santoso', 'MBR-001', 'Clean Code: A Handbook of Agile Software Craftsmanship', '978-0132350884', '2026-09-15', '2026-09-22', NULL, 'Terlambat', 'Peminjaman melewati jatuh tempo'),
('Siti Rahma', 'MBR-002', 'Designing Data-Intensive Applications', '978-1449373320', '2026-09-25', '2026-10-02', NULL, 'Dipinjam', 'Peminjaman aktif'),
('Andi Pratama', 'MBR-003', 'The Pragmatic Programmer', '978-0135957059', '2026-09-10', '2026-09-17', '2026-09-16', 'Kembali', 'Buku dikembalikan dalam kondisi baik');
