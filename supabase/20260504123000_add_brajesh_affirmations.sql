create or replace function public.brajesh_affirmation_theme_slug(value text)
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(
      regexp_replace(
        regexp_replace(lower(trim(coalesce(value, ''))), '[^a-z0-9]+', '-', 'g'),
        '(^-|-$)',
        '',
        'g'
      ),
      ''
    ),
    'general'
  );
$$;

create or replace function public.brajesh_normalize_affirmation_text(value text)
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

create table if not exists public.brajesh_affirmations (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  body text not null,
  body_normalized text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint brajesh_affirmations_theme_check
    check (theme ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint brajesh_affirmations_body_check
    check (char_length(trim(body)) between 1 and 4000),
  constraint brajesh_affirmations_body_normalized_check
    check (char_length(trim(body_normalized)) between 1 and 4000)
);

create or replace function public.brajesh_prepare_affirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.theme := public.brajesh_affirmation_theme_slug(new.theme);
  new.body := regexp_replace(trim(coalesce(new.body, '')), E'\\r\\n?', E'\\n', 'g');
  new.body_normalized := public.brajesh_normalize_affirmation_text(new.body);
  new.updated_at := timezone('utc', now());

  if tg_op = 'INSERT' and new.created_at is null then
    new.created_at := timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists brajesh_affirmations_prepare on public.brajesh_affirmations;
create trigger brajesh_affirmations_prepare
before insert or update on public.brajesh_affirmations
for each row execute function public.brajesh_prepare_affirmation();

create unique index if not exists brajesh_affirmations_theme_body_normalized_idx
  on public.brajesh_affirmations (theme, body_normalized);

create index if not exists brajesh_affirmations_theme_created_at_idx
  on public.brajesh_affirmations (theme, created_at);

alter table public.brajesh_affirmations enable row level security;

drop policy if exists "brajesh_affirmations_select_admin" on public.brajesh_affirmations;
create policy "brajesh_affirmations_select_admin"
on public.brajesh_affirmations
for select
to authenticated
using (public.is_brajesh_admin());

drop policy if exists "brajesh_affirmations_insert_admin" on public.brajesh_affirmations;
create policy "brajesh_affirmations_insert_admin"
on public.brajesh_affirmations
for insert
to authenticated
with check (public.is_brajesh_admin());

drop policy if exists "brajesh_affirmations_update_admin" on public.brajesh_affirmations;
create policy "brajesh_affirmations_update_admin"
on public.brajesh_affirmations
for update
to authenticated
using (public.is_brajesh_admin())
with check (public.is_brajesh_admin());

drop policy if exists "brajesh_affirmations_delete_admin" on public.brajesh_affirmations;
create policy "brajesh_affirmations_delete_admin"
on public.brajesh_affirmations
for delete
to authenticated
using (public.is_brajesh_admin());

grant select, insert, update, delete on public.brajesh_affirmations to authenticated;
