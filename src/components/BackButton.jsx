"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      style={{
        backgroundColor: "#6C2BD9",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: "15px",
      }}
    >
      ← Retour
    </button>
  );
}
