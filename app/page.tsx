'use client';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('tournaments').select('*').then(r => setTournaments(r.data || []));
  }, []);

  return (
    <div>
      <h1>Jump Force Bet Arena</h1>
      <a href="/tournaments/new">Créer un tournoi (admin)</a>
      <ul>
        {tournaments.map(t => (
          <li key={t.id}>
            <a href={`/tournaments/${t.id}`}>{t.name}</a> — {t.status} — pot {t.pot}
          </li>
        ))}
      </ul>
    </div>
  );
}
