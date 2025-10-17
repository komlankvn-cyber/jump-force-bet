import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE! // clé admin (seulement côté Netlify)
);

export const handler = async (event: any) => {
  try {
    // --- 1️⃣ Taille du tournoi ---
    const size = Number(new URLSearchParams(event.queryStringParameters).get("size") ?? 8);
    if (![8, 16, 32].includes(size)) {
      return { statusCode: 400, body: JSON.stringify({ error: "size must be 8, 16 or 32" }) };
    }

    // --- 2️⃣ Sélection aléatoire des personnages ---
    const { data: chars, error: errChars } = await supabase
      .from("characters")
      .select("id,name,tier")
      .order("id", { ascending: false })
      .limit(200);

    if (errChars || !chars || chars.length < size) {
      throw new Error("Not enough characters in DB");
    }

    const pool = [...chars].sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, size);

    // --- 3️⃣ Création du tournoi ---
    const name = `Tournoi ${size} — ${new Date().toLocaleString("fr-FR")}`;
    const { data: tRes, error: tErr } = await supabase
      .from("tournaments")
      .insert([
        {
          name,
          size,
          status: "open",
          pot: 0,
          stream_youtube_id: null,
        },
      ])
      .select("id,name,size,status")
      .single();

    if (tErr || !tRes) throw tErr;

    // --- 4️⃣ Génération des matchs ---
    const matches = [];
    for (let i = 0; i < size; i += 2) {
      const a = selected[i];
      const b = selected[i + 1];
      matches.push({
        tournament_id: tRes.id,
        round: 1,
        slot: i / 2 + 1,
        fighter_a_id: a.id,
        fighter_b_id: b.id,
        fighter_a_name: a.name,
        fighter_b_name: b.name,
        status: "open",
        youtube_url: null,
        winner_id: null,
      });
    }

    const { data: mRes, error: mErr } = await supabase
      .from("matches")
      .insert(matches)
      .select("id,fighter_a_name,fighter_b_name,status");

    if (mErr) throw mErr;

    // --- 5️⃣ Retour au front ---
    return {
      statusCode: 200,
      body: JSON.stringify({ tournament: tRes, matches: mRes }),
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
