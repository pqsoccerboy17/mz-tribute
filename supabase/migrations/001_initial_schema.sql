-- MZ Tribute - Initial Schema
-- Run this in the Supabase SQL editor after creating the project

-- Memories table: stores tribute messages from WhatsApp imports and web submissions
create table memories (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  content text,
  media_urls text[] default '{}',
  source text default 'web',
  whatsapp_timestamp timestamptz,
  era text,
  is_featured boolean default false,
  is_approved boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_memories_created on memories(created_at desc);
create index idx_memories_source on memories(source);

-- Media table: tracks individual files uploaded to Supabase storage
create table media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references memories(id) on delete cascade,
  storage_path text not null,
  url text not null,
  type text not null,
  thumbnail_url text,
  original_filename text,
  file_size_bytes bigint,
  width integer,
  height integer,
  created_at timestamptz default now()
);

create index idx_media_memory on media(memory_id);
create index idx_media_type on media(type);

-- Row Level Security
alter table memories enable row level security;
alter table media enable row level security;

-- Anyone can view approved memories
create policy "Public can view approved memories"
  on memories for select
  using (is_approved = true);

-- Anyone can submit a memory (no auth required)
create policy "Anyone can submit memories"
  on memories for insert
  with check (true);

-- Only authenticated users can update/delete (admin moderation)
create policy "Authenticated users can update memories"
  on memories for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete memories"
  on memories for delete
  using (auth.role() = 'authenticated');

-- Media: public read, public insert, authenticated update/delete
create policy "Public can view media"
  on media for select
  using (true);

create policy "Anyone can upload media"
  on media for insert
  with check (true);

create policy "Authenticated users can update media"
  on media for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete media"
  on media for delete
  using (auth.role() = 'authenticated');

-- Storage bucket (run separately in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('tribute-media', 'tribute-media', true);

-- Enable realtime for memories table
alter publication supabase_realtime add table memories;
