-- VitalFlow Database Schema
-- Run this in your Supabase SQL Editor

-- User profile & preferences
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  date_of_birth date,
  height_cm numeric,
  weight_goal_kg numeric,
  dietary_preferences text[] default '{}',
  health_goals text[] default '{}',
  cycle_tracking_enabled boolean default true,
  average_cycle_length int default 28,
  timezone text default 'America/New_York',
  created_at timestamptz default now()
);

-- Apple Health & manual health metrics
create table if not exists health_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  metric_type text not null,
  value numeric not null,
  unit text,
  source text default 'manual',
  recorded_at timestamptz not null,
  created_at timestamptz default now()
);

-- Mood & energy check-ins
create table if not exists mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  mood_score int check (mood_score between 1 and 5),
  energy_score int check (energy_score between 1 and 10),
  stress_score int check (stress_score between 1 and 10),
  notes text,
  tags text[] default '{}',
  time_of_day text,
  recorded_at timestamptz default now()
);

-- Food diary
create table if not exists food_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  meal_type text,
  description text,
  photo_url text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  water_ml numeric,
  ai_analysis jsonb,
  recorded_at timestamptz default now()
);

-- Supplement & medication log
create table if not exists supplement_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  dosage text,
  taken boolean default true,
  recorded_at timestamptz default now()
);

-- Symptom tracking
create table if not exists symptom_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  symptoms text[] not null default '{}',
  severity int check (severity between 1 and 5),
  notes text,
  recorded_at timestamptz default now()
);

-- Menstrual cycle
create table if not exists cycle_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  entry_type text not null,
  flow_level text,
  symptoms text[] default '{}',
  notes text,
  recorded_at timestamptz default now()
);

-- Water intake
create table if not exists water_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  amount_ml numeric not null,
  recorded_at timestamptz default now()
);

-- Workout log
create table if not exists workout_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  workout_type text not null,
  duration_minutes int,
  calories numeric,
  distance_km numeric,
  heart_rate_avg int,
  heart_rate_max int,
  notes text,
  recorded_at timestamptz default now()
);

-- Body measurements
create table if not exists measurement_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  weight_kg numeric,
  waist_cm numeric,
  hips_cm numeric,
  chest_cm numeric,
  recorded_at timestamptz default now()
);

-- AI insights (cached to avoid repeated API calls)
create table if not exists ai_insights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  insight_type text,
  content text not null,
  data_context jsonb,
  created_at timestamptz default now()
);

-- Meal plans
create table if not exists meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  week_start date,
  meals jsonb not null,
  cycle_phase text,
  created_at timestamptz default now()
);

-- Performance indexes
create index if not exists idx_health_metrics_user_type_date on health_metrics(user_id, metric_type, recorded_at desc);
create index if not exists idx_mood_entries_user_date on mood_entries(user_id, recorded_at desc);
create index if not exists idx_food_entries_user_date on food_entries(user_id, recorded_at desc);
create index if not exists idx_cycle_entries_user_date on cycle_entries(user_id, recorded_at desc);
create index if not exists idx_workout_entries_user_date on workout_entries(user_id, recorded_at desc);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table health_metrics enable row level security;
alter table mood_entries enable row level security;
alter table food_entries enable row level security;
alter table supplement_entries enable row level security;
alter table symptom_entries enable row level security;
alter table cycle_entries enable row level security;
alter table water_entries enable row level security;
alter table workout_entries enable row level security;
alter table measurement_entries enable row level security;
alter table ai_insights enable row level security;
alter table meal_plans enable row level security;

-- RLS Policies (user can only see their own data)
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'health_metrics', 'mood_entries', 'food_entries',
    'supplement_entries', 'symptom_entries', 'cycle_entries', 'water_entries',
    'workout_entries', 'measurement_entries', 'ai_insights', 'meal_plans']
  loop
    execute format('
      create policy if not exists "Users access own data" on %I
      for all using (
        %s = auth.uid()
      )', t, case when t = 'profiles' then 'id' else 'user_id' end);
  end loop;
end $$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
