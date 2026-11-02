// Upload product photos to Supabase Storage and save their URLs on the products.
//
// Usage:
//   npm run images:upload -- path/to/photos
//
// Name each photo after the product's slug, e.g. `akoya-classic-strand.jpg`.
// Supported: .jpg .jpeg .png .webp. Re-running replaces the existing photo.
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Uses the service role key, so it is server-only (AGENTS.md rule 3). The npm
// script runs Node with `--conditions=react-server`, which makes this import a no-op.

import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { extname, basename, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const CONTENT_TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: npm run images:upload -- <folder with <slug>.jpg files>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const files = (await readdir(folder)).filter((f) => CONTENT_TYPES[extname(f).toLowerCase()]);
if (files.length === 0) {
  console.error(`No .jpg/.png/.webp files found in ${folder}`);
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const ext = extname(file).toLowerCase();
  const slug = basename(file, extname(file));
  const path = `${slug}${ext}`;

  const { data: product, error: findError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (findError || !product) {
    console.warn(`skip  ${file}: no product with slug "${slug}"`);
    failed++;
    continue;
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, await readFile(join(folder, file)), { contentType: CONTENT_TYPES[ext], upsert: true });
  if (uploadError) {
    console.error(`fail  ${file}: ${uploadError.message}`);
    failed++;
    continue;
  }

  // Version query string so browsers/CDN pick up a replaced photo immediately.
  const publicUrl = `${supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  const { error: updateError } = await supabase.from("products").update({ image_url: publicUrl }).eq("id", product.id);
  if (updateError) {
    console.error(`fail  ${file}: uploaded, but saving image_url failed: ${updateError.message}`);
    failed++;
    continue;
  }

  console.log(`ok    ${file} → ${slug}`);
}

process.exit(failed ? 1 : 0);
