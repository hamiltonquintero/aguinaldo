// Edge Function: claim-pin
// Primera vez que un participante entra: crea su PIN secreto.
// Solo se puede hacer UNA vez por nombre. Si ya fue reclamado,
// rechaza la solicitud (el organizador puede resetear via admin).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash SHA-256 simple para el PIN (suficiente para este caso de uso)
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

    // Validar PIN: 4 a 6 dígitos numéricos
    if (!/^\d{4,6}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: "El PIN debe tener entre 4 y 6 dígitos numéricos." }),
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

    // Buscar miembro y verificar que pertenece al evento
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, pin_hash, match_name, match_wishlist")
      .eq("id", memberId)
      .eq("event_id", event.id)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: "Participante no encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Si ya fue reclamado, rechazar
    if (member.pin_hash) {
      return new Response(
        JSON.stringify({
          error: "Este nombre ya tiene un PIN registrado. Si lo olvidaste, contacta al organizador.",
          alreadyClaimed: true,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guardar hash del PIN y revelar el resultado
    const pinHash = await hashPin(pin);
    const { error: updateError } = await supabase
      .from("members")
      .update({
        pin_hash: pinHash,
        claimed_at: new Date().toISOString(),
        failed_attempts: 0,
      })
      .eq("id", memberId);

    if (updateError) throw updateError;

    // Devolver el resultado solo en esta respuesta
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
    console.error("claim-pin error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
