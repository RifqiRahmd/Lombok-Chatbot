import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

// =============================================
// Supabase JS Client — for structured queries
// =============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================
// pg Pool via Supabase connection string
// Used for raw SQL queries (e.g. chat/route.ts)
// =============================================
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});