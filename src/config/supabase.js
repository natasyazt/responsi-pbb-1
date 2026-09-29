const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
// Hapus /rest/v1 atau trailing slash jika ada agar tidak dobel saat dipanggil SDK
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_KEY && !process.env.SUPABASE_ANON_KEY)) {
  console.warn('⚠️  [PERINGATAN] SUPABASE_URL atau SUPABASE_KEY belum diset di file .env.');
  console.warn('   Pastikan untuk mengisi file .env dengan kredensial Supabase Anda.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
