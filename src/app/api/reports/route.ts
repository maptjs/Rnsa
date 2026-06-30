import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id(id, full_name, city),
        animal:animals(id, species, nickname, status, sighting_count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (city) query = query.eq('city', city);
    if (urgency) query = query.eq('urgency', urgency);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await req.json();

    const { title, description, lat, lng, urgency, reporter_id, city, district, image_urls } = body;

    if (!title || !lat || !lng || !reporter_id) {
      return NextResponse.json({ error: 'title, lat, lng, reporter_id required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('reports').insert({
      title,
      description,
      location: `POINT(${lng} ${lat})`,
      urgency: urgency || 'medium',
      reporter_id,
      city,
      district,
      image_urls: image_urls || [],
      status: 'new',
    }).select().single();

    if (error) throw error;

    // Trigger AI classification asynchronously
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/classify-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ report_id: data.id }),
    }).catch(console.error);

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
