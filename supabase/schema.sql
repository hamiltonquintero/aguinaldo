-- ============================================================
-- AGUINALDO NAVIDEÑO — Schema Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TABLA: events
-- Almacena la configuración del evento y los resultados del 
-- sorteo. Los resultados están encriptados en el servidor;
-- el frontend NUNCA los recibe completos.
-- ------------------------------------------------------------
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,          -- identificador amigable en la URL
  title         text not null,
  event_date    text,
  event_time    text,
  budget        text,
  location      text,
  rules         text,
  admin_token   text not null,                 -- token secreto del organizador (SHA-256)
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- TABLA: members
-- Un registro por participante dentro de un evento.
-- El campo "match_name" y "match_wishlist" solo se devuelven
-- al cliente DESPUÉS de validar el PIN correcto (vía Edge Fn).
-- ------------------------------------------------------------
create table if not exists public.members (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references public.events(id) on delete cascade,
  name            text not null,
  phone           text,
  match_name      text not null,               -- a quién le toca regalar
  match_wishlist  text,
  pin_hash        text,                        -- bcrypt hash del PIN (null = aún no reclamado)
  claimed_at      timestamptz,                 -- cuándo creó su PIN
  failed_attempts int default 0,
  locked_until    timestamptz,                 -- bloqueo temporal tras muchos intentos
  created_at      timestamptz default now(),
  unique (event_id, name)
);

-- ------------------------------------------------------------
-- TABLA: admin_sessions
-- Sesiones temporales del organizador (1 hora de validez)
-- ------------------------------------------------------------
create table if not exists public.admin_sessions (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Ningún cliente puede leer la tabla members directamente.
-- Todo acceso pasa por las Edge Functions (service_role).
-- ------------------------------------------------------------
alter table public.events  enable row level security;
alter table public.members enable row level security;
alter table public.admin_sessions enable row level security;

-- Políticas: solo el service_role (Edge Functions) puede operar
-- Los clientes anónimos no tienen acceso directo a ninguna tabla
create policy "No direct client access - events"
  on public.events for all
  using (false);

create policy "No direct client access - members"
  on public.members for all
  using (false);

create policy "No direct client access - admin_sessions"
  on public.admin_sessions for all
  using (false);

-- ------------------------------------------------------------
-- ÍNDICES para rendimiento
-- ------------------------------------------------------------
create index if not exists idx_members_event_id on public.members(event_id);
create index if not exists idx_members_event_name on public.members(event_id, name);
create index if not exists idx_admin_sessions_event on public.admin_sessions(event_id);
