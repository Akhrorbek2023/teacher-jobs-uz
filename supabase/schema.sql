create extension if not exists pgcrypto;

create type public.user_role as enum ('teacher','employer','admin');
create type public.vacancy_status as enum ('draft','pending','published','closed','expired');
create type public.source_type as enum ('manual','official','telegram','job_board','import');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'teacher',
  phone text,
  city text,
  district text,
  bio text,
  subjects text[] not null default '{}',
  experience_years int not null default 0 check (experience_years >= 0),
  min_salary numeric(12,2),
  languages text[] not null default '{}',
  certificates text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  city text,
  district text,
  website text,
  telegram text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vacancies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  subject text,
  description text not null,
  requirements text,
  responsibilities text,
  city text,
  district text,
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  salary_text text,
  employment_type text default 'full_time',
  source_type public.source_type not null default 'manual',
  source_url text,
  source_name text,
  status public.vacancy_status not null default 'pending',
  verified boolean not null default false,
  expires_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_vacancies (
  user_id uuid references public.profiles(id) on delete cascade,
  vacancy_id uuid references public.vacancies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, vacancy_id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  cv_url text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  unique(vacancy_id, teacher_id)
);

create table public.telegram_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  telegram_chat_id text unique not null,
  subjects text[] not null default '{}',
  city text,
  min_salary numeric(12,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.vacancy_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  source_type public.source_type not null,
  active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create index vacancies_search_idx on public.vacancies using gin (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(subject,''))
);
create index vacancies_city_idx on public.vacancies(city);
create index vacancies_subject_idx on public.vacancies(subject);
create index vacancies_status_idx on public.vacancies(status);
create index vacancies_salary_idx on public.vacancies(salary_min, salary_max);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies
for each row execute function public.set_updated_at();
create trigger vacancies_updated_at before update on public.vacancies
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.vacancies enable row level security;
alter table public.saved_vacancies enable row level security;
alter table public.applications enable row level security;
alter table public.telegram_subscriptions enable row level security;
alter table public.vacancy_sources enable row level security;

create policy "public can read published vacancies"
on public.vacancies for select using (status = 'published');

create policy "authenticated can create vacancy"
on public.vacancies for insert to authenticated
with check (auth.uid() is not null);

create policy "owner can update vacancy"
on public.vacancies for update to authenticated
using (
  company_id in (select id from public.companies where owner_id = auth.uid())
);

create policy "owner can delete vacancy"
on public.vacancies for delete to authenticated
using (
  company_id in (select id from public.companies where owner_id = auth.uid())
);

create policy "profiles readable by owner"
on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles insert own"
on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own"
on public.profiles for update to authenticated using (id = auth.uid());

create policy "companies public read"
on public.companies for select using (true);
create policy "companies owner insert"
on public.companies for insert to authenticated with check (owner_id = auth.uid());
create policy "companies owner update"
on public.companies for update to authenticated using (owner_id = auth.uid());
create policy "companies owner delete"
on public.companies for delete to authenticated using (owner_id = auth.uid());

create policy "saved own read"
on public.saved_vacancies for select to authenticated using (user_id = auth.uid());
create policy "saved own insert"
on public.saved_vacancies for insert to authenticated with check (user_id = auth.uid());
create policy "saved own delete"
on public.saved_vacancies for delete to authenticated using (user_id = auth.uid());

create policy "applications teacher read"
on public.applications for select to authenticated using (teacher_id = auth.uid());
create policy "applications teacher insert"
on public.applications for insert to authenticated with check (teacher_id = auth.uid());

create policy "telegram own"
on public.telegram_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Seed sources
insert into public.vacancy_sources(name, url, source_type) values
('Maktab tizimi / Pedagog', 'https://pedagog.uzedu.uz/', 'official'),
('HH Uzbekistan', 'https://hh.uz/', 'job_board')
on conflict do nothing;
