-- ============================================================
--  CONFIGURACIÓN DE LA BASE DE DATOS (ejecutar UNA sola vez)
-- ------------------------------------------------------------
--  En Supabase: menú lateral > "SQL Editor" > "New query"
--  Pega TODO este contenido y pulsa "Run".
-- ============================================================

-- 1) Tabla que guarda toda la liga en una sola fila (id = 'main').
create table if not exists public.league (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Fila inicial vacía de la liga.
insert into public.league (id, data)
values ('main', '{"coaches":[],"picks":{},"matches":[],"trades":[]}'::jsonb)
on conflict (id) do nothing;

-- 3) Activar seguridad por filas (RLS) y permitir lectura/escritura
--    a cualquiera con la clave pública (suficiente para una liga de amigos).
alter table public.league enable row level security;

drop policy if exists "lectura publica" on public.league;
create policy "lectura publica"
  on public.league for select
  using (true);

drop policy if exists "escritura publica" on public.league;
create policy "escritura publica"
  on public.league for insert
  with check (true);

drop policy if exists "actualizacion publica" on public.league;
create policy "actualizacion publica"
  on public.league for update
  using (true)
  with check (true);

-- 4) Activar tiempo real para que los cambios se vean al instante.
alter publication supabase_realtime add table public.league;
