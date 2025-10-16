import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE!
);

export const handler = async (event: any) => {
  try {
    const { match_id, winner_char } = JSON.parse(event.body || '{}');
    if (!match_id || !winner_char) return resp(400, { error: 'missing params' });

    const { data: bets } = await supabaseAdmin.from('bets').select('*').eq('match_id', match_id);
    const winners = (bets || []).filter(b => b.pick_char === winner_char);

    for (const b of winners) {
      const payout = Math.floor(Number(b.stake) * Number(b.odds_at_bet));
      const fee = Math.floor(payout * 0.1);
      await supabaseAdmin.from('wallet_tx').insert({
        user_id: b.user_id,
        type: 'win',
        amount: payout - fee,
        ref_table: 'bets',
        ref_id: b.id,
      });
      await supabaseAdmin.from('wallet_tx').insert({
        user_id: b.user_id,
        type: 'fee',
        amount: fee,
        ref_table: 'bets',
        ref_id: b.id,
      });
    }

    await supabaseAdmin.from('bets').update({ status: 'won' }).eq('match_id', match_id).eq('pick_char', winner_char);
    await supabaseAdmin.from('bets').update({ status: 'lost' }).eq('match_id', match_id).neq('pick_char', winner_char);
    await supabaseAdmin.from('matches').update({ status: 'done', winner_char }).eq('id', match_id);

    return resp(200, { ok: true });
  } catch (e: any) {
    return resp(500, { error: e.message });
  }
};

const resp = (code: number, body: any) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
