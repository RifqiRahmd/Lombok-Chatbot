import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await pool.query(
    'SELECT nama_resto, gambar, tentang, daerah FROM restoran ORDER BY id'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('DB Error detail:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}