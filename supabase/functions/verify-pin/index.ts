// Edge Function: verify-pin
// Visitas siguientes: valida el PIN y devuelve SOLO el resultado
// de esa persona. Bloquea tras 5 intentos fallidos (30 min).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

async function hashPin(pin: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pin)
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { slug, memberId, pin } = await req.json();

    if (!slug || !memberId || !pin) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que el evento existe
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Evento no encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar miembro
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, pin_hash, failed_attempts, locked_until, match_name, match_wishlist")
      .eq("id", memberId)
      .eq("event_id", event.id)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: "Participante no encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sin PIN registrado todavía
    if (!member.pin_hash) {
      return new Response(
        JSON.stringify({ error: "Este participante aún no ha creado su PIN.", notClaimed: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar bloqueo temporal
    if (member.locked_until && new Date(member.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(member.locked_until).getTime() - Date.now()) / 60000
      );
      return new Response(
        JSON.stringify({
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto(s).`,
          isLocked: true,
          minutesLeft,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar PIN
    const inputHash = await hashPin(pin);
    const isCorrect = inputHash === member.pin_hash;

    if (!isCorrect) {
      const newAttempts = (member.failed_attempts || 0) + 1;
      const shouldLock = newAttempts >= MAX_ATTEMPTS;
      const lockedUntil = shouldLock
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
        : null;

      await supabase
        .from("members")
        .update({
          failed_attempts: newAttempts,
          ...(shouldLock ? { locked_until: lockedUntil } : {}),
        })
        .eq("id", memberId);

      const attemptsLeft = MAX_ATTEMPTS - newAttempts;

      return new Response(
        JSON.stringify({
          error: shouldLock
            ? `PIN incorrecto. Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos.`
            : `PIN incorrecto. Te quedan ${attemptsLeft} intento(s).`,
          attemptsLeft: Math.max(0, attemptsLeft),
          isLocked: shouldLock,
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PIN correcto — resetear intentos fallidos y devolver resultado
    await supabase
      .from("members")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("id", memberId);

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          matchName: member.match_name,
          matchWishlist: member.match_wishlist || "",
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("verify-pin error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
