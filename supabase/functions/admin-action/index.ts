// Edge Function: admin-action
// Acciones del organizador autenticado con su admin_token:
//   - reset-pin: resetea el PIN de un participante específico
//   - list-status: lista el estado de todos los participantes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashToken(token: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
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

    const { slug, adminToken, action, memberId } = await req.json();

    if (!slug || !adminToken || !action) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar evento y admin_token
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, admin_token, title")
      .eq("slug", slug)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Evento no encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenHash = await hashToken(adminToken);
    if (tokenHash !== event.admin_token) {
      return new Response(
        JSON.stringify({ error: "Token de administrador inválido." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- ACCIÓN: list-status ---
    if (action === "list-status") {
      const { data: members, error } = await supabase
        .from("members")
        .select("id, name, phone, pin_hash, failed_attempts, locked_until, claimed_at")
        .eq("event_id", event.id)
        .order("name");

      if (error) throw error;

      const statusList = members.map((m) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        isClaimed: !!m.pin_hash,
        claimedAt: m.claimed_at,
        failedAttempts: m.failed_attempts,
        isLocked: m.locked_until ? new Date(m.locked_until) > new Date() : false,
        lockedUntil: m.locked_until,
      }));

      return new Response(
        JSON.stringify({ eventTitle: event.title, members: statusList }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- ACCIÓN: reset-pin ---
    if (action === "reset-pin") {
      if (!memberId) {
        return new Response(
          JSON.stringify({ error: "Falta memberId para reset-pin." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("members")
        .update({
          pin_hash: null,
          claimed_at: null,
          failed_attempts: 0,
          locked_until: null,
        })
        .eq("id", memberId)
        .eq("event_id", event.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "PIN reseteado. El participante puede crear uno nuevo." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- ACCIÓN: unlock (desbloquear sin resetear PIN) ---
    if (action === "unlock") {
      if (!memberId) {
        return new Response(
          JSON.stringify({ error: "Falta memberId para unlock." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("members")
        .update({ failed_attempts: 0, locked_until: null })
        .eq("id", memberId)
        .eq("event_id", event.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Participante desbloqueado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Acción desconocida: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("admin-action error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
