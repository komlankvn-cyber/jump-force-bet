"use client";
import { useState } from "react";

export default function Home() {
  const [size, setSize] = useState(8);
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createTournament = async () => {
    setLoading(true);
    const r = await fetch(`/.netlify/functions/createTournament?size=${size}`);
    const data = await r.json();
    setRes(data);
    setLoading(false);
  };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-3">Créer un tournoi Jump Force</h1>
      <div className="flex gap-2 mb-4">
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={8}>8 joueurs</option>
          <option value={16}>16 joueurs</option>
          <option value={32}>32 joueurs</option>
        </select>
        <button
          onClick={createTournament}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Création..." : "Créer le tournoi"}
        </button>
      </div>

      {res?.tournament && (
        <div className="mt-3">
          <p>
            Tournoi créé : <b>{res.tournament.name}</b>
          </p>
          <a
            href={`/tournaments/${res.tournament.id}`}
            className="underline text-blue-400"
          >
            Voir le tournoi
          </a>
        </div>
      )}
    </main>
  );
}
