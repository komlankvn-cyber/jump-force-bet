'use client';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Tournament({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [t, setT] = useState<any>();
  const [matches, setMatches] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ match_id: number; pick: number; stake: number }>();

  useEffect(() => {
    async function loadData() {
      const [tRes, mRes, cRes] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', id).single(),
        supabase.from('matches').select('*').eq('tournament_id', id).order('id'),
        supabase.from('characters').select('id,name')
      ]);
      setT(tRes.data);
      setMatches(mRes.data || []);
      setCharacters(cRes.data || []);
    }
    loadData();
  }, [id]);

  const getName = (charId: number) => characters.find(c => c.id === charId)?.name || `Perso ${charId}`;

  const youtubeSrc = useMemo(
    () => (t?.stream_youtube_id ? `https://www.youtube.com/embed/${t.stream_youtube_id}?autoplay=1&mute=1` : ''),
    [t]
  );

  const placeBet = async () => {
    if (!selected || !selected.stake) return alert('Choisis mise');
    const res = await fetch('/.netlify/functions/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    });
    const j = await res.json();
    if (!res.ok) return alert(j.error || 'Erreur');
    alert('Pari placé');
  };

  return (
    <div>
      <h2>{t?.name}</h2>
      {youtubeSrc && (
        <iframe
          src={youtubeSrc}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
        />
      )}

      <h3>Matchs</h3>
      <ul>
        {matches.map(m => (
          <li key={m.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
            Match #{m.id} — Round {m.round} — statut {m.status}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              <span>{getName(m.slot_a_char)} vs {getName(m.slot_b_char)}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSelected({ match_id: m.id, pick: m.slot_a_char, stake: 100 })}>
                  Parier 100 sur {getName(m.slot_a_char)}
                </button>
                <button onClick={() => setSelected({ match_id: m.id, pick: m.slot_b_char, stake: 100 })}>
                  Parier 100 sur {getName(m.slot_b_char)}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <button onClick={placeBet}>Confirmer le pari</button>
      </div>
    </div>
  );
}
