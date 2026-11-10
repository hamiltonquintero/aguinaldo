// Edge Function: get-members
// Devuelve la lista de participantes de un evento (solo nombre y
// si ya reclamaron su PIN). NUNCA devuelve match_name ni match_wishlist.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Falta el parámetro slug." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar evento por slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, event_date, event_time, budget, location, rules")
      .eq("slug", slug)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Evento no encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar miembros — SOLO nombre, id y si ya fue reclamado
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("id, name, phone, pin_hash, locked_until")
      .eq("event_id", event.id)
      .order("name");

    if (membersError) throw membersError;

    // Transformar: no exponer pin_hash, solo indicar si está reclamado y si está bloqueado
    const safeMemberList = members.map((m) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      isClaimed: !!m.pin_hash,
      isLocked: m.locked_until ? new Date(m.locked_until) > new Date() : false,
    }));

    return new Response(
      JSON.stringify({
        event: {
          title: event.title,
          date: event.event_date,
          time: event.event_time,
          budget: event.budget,
          location: event.location,
          rules: event.rules,
        },
        members: safeMemberList,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("get-members error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
