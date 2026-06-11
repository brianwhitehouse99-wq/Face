-- ============================================================
-- Face. — Supabase Database Schema
-- Run this in your Supabase dashboard: SQL Editor > New Query
-- ============================================================

-- Athletes table
create table athletes (
  id          bigserial primary key,
  name        text not null,
  sport       text not null check (sport in ('NFL','NBA','MLB','NHL','CFB','CBB')),
  -- Note: CBB = Men's college basketball only. Do not add women's players under CBB.
  team        text not null,
  position    text not null,
  conference  text,                        -- null for pro athletes
  photo_url   text not null,
  aliases     text[] not null default '{}', -- e.g. {"mahomes","patrick mahomes"}
  hints       text[] not null default '{}', -- shown after wrong guesses
  is_star     boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- Daily picks table (seeded each midnight by cron)
create table daily_picks (
  id          bigserial primary key,
  date        date not null,
  athlete_id  bigint references athletes(id),
  "order"     int not null,               -- display order 1,2,3...
  sport_filter text not null default 'all', -- which filter group this pick belongs to
  created_at  timestamptz default now(),
  unique(date, athlete_id, sport_filter)
);

-- Indexes for fast filtering
create index on athletes(sport);
create index on athletes(conference);
create index on athletes(is_star);
create index on athletes(active);
create index on daily_picks(date, sport_filter);

-- Row-level security (allow public reads, no public writes)
alter table athletes enable row level security;
alter table daily_picks enable row level security;

create policy "Public can read athletes" on athletes for select using (active = true);
create policy "Public can read daily_picks" on daily_picks for select using (true);

-- ============================================================
-- Sample data — replace photo_url with real photos
-- ============================================================

insert into athletes (name, sport, team, position, conference, photo_url, aliases, hints, is_star) values

-- NFL
('Patrick Mahomes', 'NFL', 'Kansas City Chiefs', 'QB', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Patrick_Mahomes_2019.jpg/440px-Patrick_Mahomes_2019.jpg',
 '{"mahomes","patrick mahomes"}', '{"Kansas City Chiefs","2x Super Bowl MVP","#15"}', true),

('Lamar Jackson', 'NFL', 'Baltimore Ravens', 'QB', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Lamar_Jackson_2019.jpg/440px-Lamar_Jackson_2019.jpg',
 '{"lamar jackson","lamar","jackson"}', '{"Baltimore Ravens","2x NFL MVP","#8"}', true),

('Josh Allen', 'NFL', 'Buffalo Bills', 'QB', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Josh_Allen_2019.jpg/440px-Josh_Allen_2019.jpg',
 '{"josh allen","allen"}', '{"Buffalo Bills","#17"}', true),

-- NBA
('LeBron James', 'NBA', 'Los Angeles Lakers', 'Forward', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/LeBron_James_crop.jpg/440px-LeBron_James_crop.jpg',
 '{"lebron","lebron james","king james"}', '{"Los Angeles Lakers","4x NBA Champion","#23"}', true),

('Stephen Curry', 'NBA', 'Golden State Warriors', 'Guard', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Stephen_Curry_2022.jpg/440px-Stephen_Curry_2022.jpg',
 '{"steph curry","stephen curry","curry"}', '{"Golden State Warriors","4x NBA Champion"}', true),

('Jayson Tatum', 'NBA', 'Boston Celtics', 'Forward', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jayson_Tatum_2021.jpg/440px-Jayson_Tatum_2021.jpg',
 '{"tatum","jayson tatum"}', '{"Boston Celtics","NBA Champion","#0"}', true),

-- MLB
('Shohei Ohtani', 'MLB', 'Los Angeles Dodgers', 'P/DH', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Shohei_Ohtani_2023.jpg/440px-Shohei_Ohtani_2023.jpg',
 '{"ohtani","shohei ohtani","shohei"}', '{"Los Angeles Dodgers","2x AL MVP"}', true),

('Mike Trout', 'MLB', 'Los Angeles Angels', 'CF', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Mike_Trout_2021.jpg/440px-Mike_Trout_2021.jpg',
 '{"trout","mike trout"}', '{"Los Angeles Angels","3x AL MVP"}', true),

-- NHL
('Connor McDavid', 'NHL', 'Edmonton Oilers', 'C', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Connor_McDavid_2022.jpg/440px-Connor_McDavid_2022.jpg',
 '{"mcdavid","connor mcdavid"}', '{"Edmonton Oilers","Hart Trophy winner"}', true),

('Nathan MacKinnon', 'NHL', 'Colorado Avalanche', 'C', null,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Nathan_MacKinnon_2022.jpg/440px-Nathan_MacKinnon_2022.jpg',
 '{"mackinnon","nathan mackinnon"}', '{"Colorado Avalanche","Stanley Cup Champion"}', true),

-- CFB
('Caleb Williams', 'CFB', 'USC Trojans', 'QB', 'Pac-12',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Caleb_Williams_2022.jpg/440px-Caleb_Williams_2022.jpg',
 '{"caleb williams","caleb","williams"}', '{"USC Trojans","Heisman Trophy winner"}', true),

('J.J. McCarthy', 'CFB', 'Michigan Wolverines', 'QB', 'Big Ten',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/J.J._McCarthy_2023.jpg/440px-J.J._McCarthy_2023.jpg',
 '{"jj mccarthy","j.j. mccarthy","mccarthy"}', '{"Michigan Wolverines","National Champion 2023"}', true),

-- CBB (men's only)
('Zach Edey', 'CBB', 'Purdue Boilermakers', 'C', 'Big Ten',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Zach_Edey_2024.jpg/440px-Zach_Edey_2024.jpg',
 '{"zach edey","edey"}', '{"Purdue Boilermakers","Naismith Award winner"}', true);
