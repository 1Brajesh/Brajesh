create or replace function public.brajesh_normalize_bachata_move_text(value text)
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select lower(
    regexp_replace(
      trim(coalesce(value, '')),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

create table if not exists public.brajesh_bachata_moves (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  body text not null,
  body_normalized text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint brajesh_bachata_moves_theme_check
    check (theme in ('basic', 'advanced', 'sensual', 'routines', 'long')),
  constraint brajesh_bachata_moves_body_check
    check (char_length(trim(body)) between 1 and 4000),
  constraint brajesh_bachata_moves_body_normalized_check
    check (char_length(trim(body_normalized)) between 1 and 4000)
);

create or replace function public.brajesh_prepare_bachata_move()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.theme := regexp_replace(lower(trim(coalesce(new.theme, ''))), '[^a-z0-9]+', '-', 'g');
  new.theme := regexp_replace(new.theme, '(^-|-$)', '', 'g');
  new.body := regexp_replace(trim(coalesce(new.body, '')), E'\\r\\n?', E'\\n', 'g');
  new.body_normalized := public.brajesh_normalize_bachata_move_text(new.body);
  new.updated_at := timezone('utc', now());

  if tg_op = 'INSERT' and new.created_at is null then
    new.created_at := timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists brajesh_bachata_moves_prepare on public.brajesh_bachata_moves;
create trigger brajesh_bachata_moves_prepare
before insert or update on public.brajesh_bachata_moves
for each row execute function public.brajesh_prepare_bachata_move();

create unique index if not exists brajesh_bachata_moves_theme_body_normalized_idx
  on public.brajesh_bachata_moves (theme, body_normalized);

create index if not exists brajesh_bachata_moves_theme_created_at_idx
  on public.brajesh_bachata_moves (theme, created_at);

alter table public.brajesh_bachata_moves enable row level security;

drop policy if exists "brajesh_bachata_moves_select_admin" on public.brajesh_bachata_moves;
create policy "brajesh_bachata_moves_select_admin"
on public.brajesh_bachata_moves
for select
to authenticated
using (public.is_brajesh_admin());

drop policy if exists "brajesh_bachata_moves_insert_admin" on public.brajesh_bachata_moves;
create policy "brajesh_bachata_moves_insert_admin"
on public.brajesh_bachata_moves
for insert
to authenticated
with check (public.is_brajesh_admin());

drop policy if exists "brajesh_bachata_moves_update_admin" on public.brajesh_bachata_moves;
create policy "brajesh_bachata_moves_update_admin"
on public.brajesh_bachata_moves
for update
to authenticated
using (public.is_brajesh_admin())
with check (public.is_brajesh_admin());

drop policy if exists "brajesh_bachata_moves_delete_admin" on public.brajesh_bachata_moves;
create policy "brajesh_bachata_moves_delete_admin"
on public.brajesh_bachata_moves
for delete
to authenticated
using (public.is_brajesh_admin());

grant select, insert, update, delete on public.brajesh_bachata_moves to authenticated;
