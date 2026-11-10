// Edge Function: create-event
// Recibe el sorteo completo del organizador y lo guarda en la BD.
// Devuelve el slug del evento y el admin_token en texto plano
// (el organizador debe guardarlo; solo se muestra una vez).

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

    const body = await req.json();
    const { eventConfig, raffleResults } = body;

    // Validaciones básicas
    if (!eventConfig?.title || !raffleResults?.length) {
      return new Response(
        JSON.stringify({ error: "Faltan datos del evento o del sorteo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generar slug único (título simplificado + timestamp corto)
    const baseSlug = eventConfig.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Generar admin token aleatorio (256 bits) y hashearlo para guardar
    const rawAdminToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenBuffer = new TextEncoder().encode(rawAdminToken);
    const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBuffer);
    const adminTokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Insertar evento
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        slug,
        title: eventConfig.title,
        event_date: eventConfig.date || null,
        event_time: eventConfig.time || null,
        budget: eventConfig.budget || null,
        location: eventConfig.location || null,
        rules: eventConfig.rules || null,
        admin_token: adminTokenHash,
      })
      .select("id")
      .single();

    if (eventError) throw eventError;

    // Insertar miembros (resultados del sorteo)
    const membersToInsert = raffleResults.map((r: any) => ({
      event_id: event.id,
      name: r.giverName,
      phone: r.giverPhone || null,
      match_name: r.receiverName,
      match_wishlist: r.receiverWishlist || null,
    }));

    const { error: membersError } = await supabase
      .from("members")
      .insert(membersToInsert);

    if (membersError) throw membersError;

    return new Response(
      JSON.stringify({
        slug,
        adminToken: rawAdminToken, // Solo se devuelve UNA vez, en texto plano
        message: "Evento creado exitosamente.",
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-event error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
