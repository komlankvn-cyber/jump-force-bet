import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE!
);

export const handler = async (event: any) => {
  try {
    // paramètres reçus (ex: ?name=Tournoi+1&size=8)
    const params = new URLSearchParams(event.queryStringParameters);
    const name = params.get('name') || 'Tournoi Auto';
    const size = Number(params.get('size') || 8);

    if (![8, 16, 32].includes(size)) {
      return resp(400, { error: 'size must be 8, 16 or 32' });
    }

    // 1. récupérer les persos non S tier
    const { data: chars, error: e1 } = await supabaseAdmin
      .from('characters')
      .select('id')
      .neq('tier', 'S');

    if (e1 || !chars?.length) return resp(400, { error: 'no characters available' });

    // 2. tirage aléatoire
    const shuffled = chars.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, size);

    // 3. création du tournoi
    const { data: t, error: e2 } = await supabaseAdmin
      .from('tournaments')
      .insert({
        name,
        size,
        status: 'open',
        pot: 0
      })
      .select()
      .single();

    if (e2) return resp(400, { error: e2.message });

    // 4. génération des matchs round 1
    const matches = [];
    for (let i = 0; i < selected.length; i += 2) {
      matches.push({
        tournament_id: t.id,
        round: 1,
        slot_a_char: selected[i]?.id,
        slot_b_char: selected[i + 1]?.id,
        status: 'open'
      });
    }

    const { error: e3 } = await supabaseAdmin.from('matches').insert(matches);
    if (e3) return resp(400, { error: e3.message });

    return resp(200, { ok: true, tournament_id: t.id, matches_created: matches.length });
  } catch (e: any) {
    return resp(500, { error: e.message });
  }
};

const resp = (code: number, body: any) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
