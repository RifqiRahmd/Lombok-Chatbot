import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('restoran')
      .select('nama_resto, gambar, tentang, daerah')
      .order('id');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('DB Error detail:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}