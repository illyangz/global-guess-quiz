-- Create scores table for storing quiz results
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  score integer not null,
  total integer not null default 197,
  time_remaining integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.scores enable row level security;

-- Allow anyone to view scores (public leaderboard)
create policy "scores_select_public"
  on public.scores for select
  using (true);

-- Allow anyone to insert scores (no auth required for this quiz)
create policy "scores_insert_public"
  on public.scores for insert
  with check (true);

-- Create index for faster leaderboard queries
create index if not exists scores_score_idx on public.scores(score desc, time_remaining desc);
create index if not exists scores_created_at_idx on public.scores(created_at desc);
