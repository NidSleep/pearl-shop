-- Pearl Shop: public bucket for product photos.
-- Run in Supabase Dashboard → SQL Editor after 0001_init.sql.
--
-- Public bucket = anyone can READ images by URL (needed for the shop pages).
-- No upload policies are added, so only the server (service role key) can
-- write. Upload with: npm run images:upload -- <folder>

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5 * 1024 * 1024,  -- 5 MB per image
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
