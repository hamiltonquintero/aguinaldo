// Cliente Supabase — solo usado para invocar Edge Functions.
// La BD nunca se consulta directamente desde el frontend.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured =
  supabaseUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder_anon_key';

// Creamos el cliente solo si hay credenciales reales;
// si no, usamos un objeto vacío para que no explote en runtime.
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Helper interno ───────────────────────────────────────────
async function invokeFunction(name, body) {
  if (!supabase) {
    return { error: 'Supabase no está configurado. Agrega tus credenciales en el archivo .env para activar el backend.' };
  }
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) return { error: error.message };
  return data;
}

// ─── get-members usa query param → fetch directo ─────────────
async function fetchGetMembers(slug) {
  if (!supabase) {
    return { error: 'Supabase no está configurado.' };
  }
  try {
    const url = `${supabaseUrl}/functions/v1/get-members?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Error al cargar el evento.' };
    return json;
  } catch (e) {
    return { error: e.message || 'Error de red.' };
  }
}

// ─── API pública ──────────────────────────────────────────────

export async function apiCreateEvent(eventConfig, raffleResults) {
  return invokeFunction('create-event', { eventConfig, raffleResults });
}

export async function apiGetMembers(slug) {
  return fetchGetMembers(slug);
}

export async function apiClaimPin(slug, memberId, pin) {
  return invokeFunction('claim-pin', { slug, memberId, pin });
}

export async function apiVerifyPin(slug, memberId, pin) {
  return invokeFunction('verify-pin', { slug, memberId, pin });
}

export async function apiAdminAction(slug, adminToken, action, memberId = null) {
  return invokeFunction('admin-action', { slug, adminToken, action, memberId });
}
