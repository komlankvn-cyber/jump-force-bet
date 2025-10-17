import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 active:scale-95 transition"
      aria-label="Revenir en arrière"
    >
      ← Retour
    </button>
  );
}
