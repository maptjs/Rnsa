import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { searchParams } = new URL(req.url);
    const municipality = searchParams.get('municipality');

    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required (x-api-key header)' }, { status: 401 });
    }

    // Verify key
    const { data: sub, error } = await supabase
      .from('municipality_subscriptions')
      .select('*')
      .eq('api_key', apiKey)
      .eq('active', true)
      .single();

    if (error || !sub) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 });
    }

    // Proxy to Supabase Edge Function
    const efUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/b2g-stats${municipality ? `?municipality=${municipality}` : ''}`;
    const res = await fetch(efUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
