import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateEmbedding(imageBase64: string): Promise<number[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    // Return random 512-dim vector for demo
    return Array.from({ length: 512 }, () => Math.random() * 2 - 1);
  }

  // Use text embedding as proxy for image fingerprint in Phase 1
  // In Phase 2, replace with MobileNetV3 self-hosted model
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: `animal photo fingerprint: ${imageBase64.slice(0, 500)}`,
      dimensions: 512,
    }),
  });

  if (!res.ok) throw new Error('Embedding generation failed');
  const data = await res.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { image_base64, report_id } = await req.json();
    if (!image_base64) throw new Error('image_base64 required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generate 512-dim embedding from photo
    const embedding = await generateEmbedding(image_base64);
    const embeddingStr = `[${embedding.join(',')}]`;

    // Search for matching animals using pgvector cosine similarity
    const { data: matches, error } = await supabase.rpc('find_similar_animals', {
      query_embedding: embeddingStr,
      similarity_threshold: 0.85,
      match_count: 5,
    });

    if (error) throw new Error(`Vector search failed: ${error.message}`);

    const topMatch = matches?.[0];
    const SIMILARITY_THRESHOLD = 0.85;

    if (topMatch && topMatch.similarity >= SIMILARITY_THRESHOLD) {
      // Existing animal found
      if (report_id) {
        await supabase.from('reports').update({ animal_id: topMatch.id }).eq('id', report_id);
        // Add lifecycle event
        await supabase.from('lifecycle_events').insert({
          animal_id: topMatch.id,
          event_type: 'sighting',
          notes: `Signalement automatique (similarité: ${Math.round(topMatch.similarity * 100)}%)`,
        });
      }

      return new Response(
        JSON.stringify({
          matched: true,
          animal: topMatch,
          similarity: topMatch.similarity,
          previous_sightings: topMatch.sighting_count,
          message: `Animal reconnu: ${topMatch.nickname || 'Sans nom'} (${Math.round(topMatch.similarity * 100)}% de similarité)`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No match — create new animal identity
    const { data: newAnimal, error: insertErr } = await supabase
      .from('animals')
      .insert({
        fingerprint_embedding: embeddingStr,
        species: 'unknown',
        status: 'at_large',
        sighting_count: 1,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw new Error(`Failed to create animal: ${insertErr.message}`);

    if (report_id && newAnimal) {
      await supabase.from('reports').update({ animal_id: newAnimal.id }).eq('id', report_id);
    }

    return new Response(
      JSON.stringify({
        matched: false,
        animal: newAnimal,
        similarity: 0,
        previous_sightings: 0,
        message: 'Nouvelle identité animale créée',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
