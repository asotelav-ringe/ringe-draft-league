import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan las claves, avisamos en consola para que sea fácil de depurar.
if (!url || !key) {
  console.warn(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. " +
      "Revisa tu archivo .env (o las Environment Variables en Vercel)."
  );
}

export const supabase = createClient(url || "", key || "");
