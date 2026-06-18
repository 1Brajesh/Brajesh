drop view if exists public.brajesh_poem_stats;

create view public.brajesh_poem_stats
with (security_invoker = false)
as
select
  poems.id as poem_id,
  count(distinct likes.id)::integer as likes_count,
  count(distinct comments.id) filter (where comments.approved)::integer as comments_count
from public.brajesh_poems poems
left join public.brajesh_poem_likes likes
  on likes.poem_id = poems.id
left join public.brajesh_comments comments
  on comments.poem_id = poems.id
group by poems.id;

grant select on public.brajesh_poem_stats to anon, authenticated;
