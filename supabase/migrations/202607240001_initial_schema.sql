create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text,
  avatar text,
  level integer not null default 1 check (level > 0),
  exp integer not null default 0 check (exp >= 0),
  coins integer not null default 0 check (coins >= 0),
  streak integer not null default 0 check (streak >= 0),
  created_at timestamptz not null default now()
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(), title text not null, category text not null,
  difficulty text not null, content jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade,
  question text not null, options jsonb not null, answer text not null, explanation text not null
);
create table public.progress (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade, score integer not null check (score between 0 and 100),
  completed_at timestamptz not null default now(), unique (user_id, lesson_id)
);
create table public.achievements (
  id uuid primary key default gen_random_uuid(), name text not null unique, description text not null, reward integer not null default 0 check (reward >= 0)
);
create table public.user_achievements (
  user_id uuid not null references public.users(id) on delete cascade, achievement_id uuid not null references public.achievements(id) on delete cascade,
  primary key (user_id, achievement_id)
);
create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(), title text not null, reward_exp integer not null default 0 check (reward_exp >= 0),
  reward_coin integer not null default 0 check (reward_coin >= 0), created_at timestamptz not null default now()
);

create index progress_user_id_idx on public.progress(user_id);
create index quiz_questions_lesson_id_idx on public.quiz_questions(lesson_id);

create or replace function public.create_user_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, username, avatar)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email, ''), '@', 1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_user_profile();

-- Admins are assigned by setting auth.users.raw_app_meta_data.role to "admin" server-side.
create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.users enable row level security;
alter table public.lessons enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_challenges enable row level security;

create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users update own profile" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Authenticated users read lessons" on public.lessons for select to authenticated using (true);
create policy "Admins manage lessons" on public.lessons for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Authenticated users read quiz questions" on public.quiz_questions for select to authenticated using (true);
create policy "Admins manage quiz questions" on public.quiz_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Users read own progress" on public.progress for select using (auth.uid() = user_id);
create policy "Users submit own progress" on public.progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Authenticated users read achievements" on public.achievements for select to authenticated using (true);
create policy "Users read own achievement awards" on public.user_achievements for select using (auth.uid() = user_id);
create policy "Users earn own achievement awards" on public.user_achievements for insert with check (auth.uid() = user_id);
create policy "Authenticated users read daily challenges" on public.daily_challenges for select to authenticated using (true);
create policy "Admins manage challenges" on public.daily_challenges for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage for user avatars. Create the bucket in the Supabase dashboard as private.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false) on conflict (id) do nothing;
create policy "Users upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users read their own avatar" on storage.objects for select to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
