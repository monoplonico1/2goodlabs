-- El edificio compartido: pisos, espacios (reservas y publicados) y cuentas.
--
-- Quién escribe: solo el Worker de Cloudflare (con la llave service_role), después de validar
-- con public/js/rules.js. El navegador puede leer el edificio (la vista "building") y sus
-- propios espacios, pero no escribe directo en ninguna tabla.
--
-- Cómo se evitan los choques: cada piso tiene un número de versión. El Worker lee el piso,
-- decide con las reglas y guarda con floor_commit() diciendo qué versión leyó; si alguien
-- cambió el piso en el medio, falla con "conflict" y el Worker vuelve a intentar.
--
-- Aplicar: Supabase → SQL Editor → pegar este archivo → Run (una sola vez).

create extension if not exists btree_gist with schema extensions;
create extension if not exists pg_cron;

-- ————————————————————————————————— Cuentas
-- Una por usuario de Supabase Auth (también los anónimos, que todavía no dieron su correo).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  plan text not null default 'free',          -- para cuando se cobre
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create function public.sync_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

create trigger on_auth_user_saved
  after insert or update of email on auth.users
  for each row execute function public.sync_profile();

-- ————————————————————————————————— Pisos
create table public.floors (
  id smallint primary key,
  name text not null,
  open boolean not null default true,         -- se abren pisos nuevos cuando se llenan
  version bigint not null default 0,          -- sube con cada cambio de lo que se ve
  updated_at timestamptz not null default now()
);
insert into public.floors (id, name) values (1, 'Piso 1');

-- ————————————————————————————————— Espacios
-- hold: alguien lo está armando; se ve como "reservado" y vence en expires_at.
-- published: publicado por una cuenta registrada.
-- Al vencer o liberarse, la fila se borra: el lugar vuelve a estar libre.
create type public.space_status as enum ('hold', 'published');

create table public.spaces (
  id text primary key check (id ~ '^[od]-[a-z0-9]{1,12}$'),
  owner uuid not null references auth.users on delete cascade,
  floor smallint not null references public.floors default 1,
  kind text not null check (kind in ('office', 'desk')),
  "row" text,
  x int,
  w int,
  desk int,
  number int,
  status public.space_status not null default 'hold',
  doc jsonb not null default '{}' check (pg_column_size(doc) < 65536),
  expires_at timestamptz,
  extended boolean not null default false,    -- la reserva se alarga una sola vez
  plan text not null default 'free',
  price_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  check ((kind = 'office' and "row" is not null and x is not null and w is not null and desk is null)
      or (kind = 'desk' and desk is not null and "row" is null and x is null)),
  check ((status = 'hold') = (expires_at is not null))
);

-- Respaldo de las reglas: dos oficinas nunca se superponen y un puesto es de uno solo.
-- (Los pasillos entre oficinas los garantiza el Worker con rules.js.)
alter table public.spaces add constraint spaces_no_overlap
  exclude using gist (floor with =, "row" with =, int4range(x, x + w) with &&) where (kind = 'office');
create unique index spaces_one_desk on public.spaces (floor, desk) where kind = 'desk';
-- Una sola reserva a la vez por cuenta.
create unique index spaces_one_hold on public.spaces (owner) where status = 'hold';
create index spaces_owner on public.spaces (owner);
create index spaces_expiring on public.spaces (expires_at) where status = 'hold';

-- ————————————————————————————————— Lectura
alter table public.profiles enable row level security;
alter table public.floors enable row level security;
alter table public.spaces enable row level security;

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "floors are public" on public.floors for select using (true);
create policy "own spaces" on public.spaces for select to authenticated using (owner = auth.uid());

-- Lo que todos ven del edificio: publicados con su contenido; reservas sin contenido ni dueño.
create view public.building as
  select id, floor, kind, "row", x, w, desk, number, status,
         case when status = 'published' then doc end as doc,
         case when status = 'hold' then expires_at end as expires_at
  from public.spaces
  where status = 'published' or expires_at > now();
grant select on public.building to anon, authenticated;

-- Avisos en vivo: el navegador escucha cambios de versión de los pisos y vuelve a leer.
alter publication supabase_realtime add table public.floors;

-- ————————————————————————————————— Escritura (solo el Worker)
-- Guarda un cambio en un piso si nadie lo cambió desde la versión que leyó el Worker.
--   p_mode 'insert': espacio nuevo (p_row completo)
--   p_mode 'update': cambia uno que existe (falla con "gone" si ya no está, p. ej. venció)
--   p_mode 'delete': libera p_row->>'id'
-- Devuelve la versión nueva del piso.
create function public.floor_commit(p_floor smallint, p_version bigint, p_mode text, p_row jsonb)
returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v bigint;
  r public.spaces;
begin
  select version into v from floors where id = p_floor for update;
  if v is null then raise exception 'no_floor'; end if;
  if v <> p_version then raise exception 'conflict'; end if;

  delete from spaces where floor = p_floor and status = 'hold' and expires_at <= now();
  r := jsonb_populate_record(null::public.spaces, p_row);

  if p_mode = 'insert' then
    insert into spaces (id, owner, floor, kind, "row", x, w, desk, number, status, doc, expires_at, extended, plan, price_cents, published_at)
    values (r.id, r.owner, p_floor, r.kind, r."row", r.x, r.w, r.desk, r.number, r.status, coalesce(r.doc, '{}'),
            r.expires_at, coalesce(r.extended, false), coalesce(r.plan, 'free'), coalesce(r.price_cents, 0),
            case when r.status = 'published' then now() end);
  elsif p_mode = 'update' then
    update spaces s set
      owner = r.owner, kind = r.kind, "row" = r."row", x = r.x, w = r.w, desk = r.desk, number = r.number,
      status = r.status, doc = coalesce(r.doc, '{}'), expires_at = r.expires_at,
      extended = coalesce(r.extended, false), plan = coalesce(r.plan, 'free'), price_cents = coalesce(r.price_cents, 0),
      updated_at = now(),
      published_at = case when r.status = 'published' then coalesce(s.published_at, now()) end
    where s.id = r.id and s.floor = p_floor;
    if not found then raise exception 'gone'; end if;
  elsif p_mode = 'delete' then
    delete from spaces where id = r.id and floor = p_floor;
  else
    raise exception 'bad_mode';
  end if;

  update floors set version = version + 1, updated_at = now() where id = p_floor returning version into v;
  return v;
end $$;

-- Borra las reservas vencidas y avisa a los pisos donde estaban. Corre cada minuto.
create function public.release_expired() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with gone as (
    delete from spaces where status = 'hold' and expires_at <= now() returning floor
  ), touched as (
    update floors f set version = version + 1, updated_at = now()
    where f.id in (select floor from gone) returning 1
  )
  select count(*) into n from gone;
  return n;
end $$;

select cron.schedule('release-expired-holds', '* * * * *', $$select public.release_expired()$$);

-- Límite de pedidos por clave (ip o usuario) en una ventana de tiempo. true = se permite.
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits int not null
);
alter table public.rate_limits enable row level security;

create function public.rate_hit(p_key text, p_max int, p_seconds int) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into rate_limits as t (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when t.window_start < now() - make_interval(secs => p_seconds) then 1 else t.hits + 1 end,
    window_start = case when t.window_start < now() - make_interval(secs => p_seconds) then now() else t.window_start end
  returning hits into n;
  return n <= p_max;
end $$;

select cron.schedule('clean-rate-limits', '17 * * * *', $$delete from public.rate_limits where window_start < now() - interval '1 day'$$);

-- Las funciones de escritura no se pueden llamar desde el navegador.
revoke execute on function public.floor_commit(smallint, bigint, text, jsonb) from public, anon, authenticated;
revoke execute on function public.release_expired() from public, anon, authenticated;
revoke execute on function public.rate_hit(text, int, int) from public, anon, authenticated;
revoke execute on function public.sync_profile() from public, anon, authenticated;
grant execute on function public.floor_commit(smallint, bigint, text, jsonb) to service_role;
grant execute on function public.release_expired() to service_role;
grant execute on function public.rate_hit(text, int, int) to service_role;
