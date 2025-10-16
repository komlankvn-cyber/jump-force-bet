import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE!
);

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { match_id, pick, stake } = body;
    const userId = event.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000'; // à remplacer par vraie auth plus tard

    if (!match_id || !pick || !stake) return resp(400, { error: 'missing params' });

    // récupérer les mises déjà placées
    const { data: bets } = await supabaseAdmin.from('bets').select('stake,pick_char').eq('match_id', match_id);
    const poolA = (bets || []).filter(b => b.pick_char === pick).reduce((s, b) => s + Number(b.stake), 0);
    const poolB = (bets || []).filter(b => b.pick_char !== pick).reduce((s, b) => s + Number(b.stake), 0);
    const total = poolA + poolB + stake;
    const mySide = poolA + stake;
    const odds = Number(((total * 0.9) / Math.max(mySide, 1)).toFixed(4));

    // vérifier le solde utilisateur
    const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
    if (!user || user.credits < stake) return resp(400, { error: 'solde insuffisant' });

    // débiter et enregistrer le pari
    const { error: e1 } = await supabaseAdmin.rpc('perform_bet', {
      p_user_id: userId,
      p_match_id: match_id,
      p_pick: pick,
      p_stake: stake,
      p_odds: odds,
    });
    if (e1) return resp(400, { error: e1.message });

    return resp(200, { ok: true, odds });
  } catch (e: any) {
    return resp(500, { error: e.message });
  }
};

const resp = (code: number, body: any) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
