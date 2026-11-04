-- DEMO catalogue additions: fictional products and illustrative prices.
-- Local seed only; this file does not apply itself to any database.
-- Origins describe the cultured pearls. Sizes are nominal pearl diameters.
-- Luster grades are illustrative catalogue labels, not independent certifications.
-- Images are supplied separately by slug; leave image_url NULL for upload later.
-- Re-running preserves existing rows, including any uploaded images.
insert into products (
  slug, name, description, pearl_type, size_mm, luster, origin,
  price_cents, currency, stock, image_url, is_active
)
values
  ('akoya-rose-stud-earrings', 'Akoya Rose Stud Earrings',
   'Round white cultured Akoya pearls with soft rose overtones on sterling silver posts. Sold as a pair.',
   'akoya', 7.0, 'AA', 'Japan', 64900, 'myr', 14, null, true),
  ('akoya-petite-pearl-bracelet', 'Akoya Petite Pearl Bracelet',
   'An 18cm bracelet of white cultured Akoya pearls, individually knotted with a sterling silver clasp.',
   'akoya', 6.5, 'AA', 'Japan', 119000, 'myr', 8, null, true),
  ('akoya-solitaire-pearl-ring', 'Akoya Solitaire Pearl Ring',
   'A single white cultured Akoya pearl on a polished sterling silver band. A simple open setting keeps the pearl in focus.',
   'akoya', 8.0, 'AAA', 'Japan', 89000, 'myr', 6, null, true),
  ('freshwater-button-pearl-pendant', 'Freshwater Button Pearl Pendant',
   'A white button-shaped cultured freshwater pearl with a sterling silver bail and a 40cm sterling silver chain.',
   'freshwater', 8.0, 'A', 'China', 14900, 'myr', 25, null, true),
  ('freshwater-lavender-drop-earrings', 'Freshwater Lavender Drop Earrings',
   'Soft lavender cultured freshwater pearls in drop shapes on sterling silver hooks. Pearl shape and tone vary slightly between pairs.',
   'freshwater', 9.0, 'AA', 'China', 24900, 'myr', 18, null, true),
  ('freshwater-baroque-necklace', 'Freshwater Baroque Necklace',
   'A 45cm strand of white baroque cultured freshwater pearls with a sterling silver clasp. Each pearl has its own irregular outline.',
   'freshwater', 10.0, 'AA', 'China', 48900, 'myr', 12, null, true),
  ('south-sea-white-stud-earrings', 'South Sea White Stud Earrings',
   'White cultured South Sea pearls with a soft satin sheen on 14k white gold posts. Sold as a pair.',
   'south_sea', 10.0, 'AA', 'Australia', 398000, 'myr', 4, null, true),
  ('south-sea-champagne-drop-earrings', 'South Sea Champagne Drop Earrings',
   'Pale champagne cultured South Sea pearls suspended from simple 14k yellow gold hooks. Slight variations in shape are part of the pair.',
   'south_sea', 11.0, 'AA', 'Indonesia', 480000, 'myr', 3, null, true),
  ('south-sea-golden-strand', 'South Sea Golden Strand',
   'A 43cm strand of light golden, near-round cultured South Sea pearls with a gold-plated sterling silver clasp. Visible surface marks and subtle shape variations give it character.',
   'south_sea', 9.0, 'A', 'Philippines', 680000, 'myr', 2, null, true),
  ('tahitian-silver-pearl-pendant', 'Tahitian Silver Pearl Pendant',
   'A silver-grey cultured Tahitian pearl with subtle green overtones, a sterling silver bail and a 45cm sterling silver chain.',
   'tahitian', 10.0, 'AA', 'French Polynesia', 129000, 'myr', 9, null, true),
  ('tahitian-charcoal-hoop-earrings', 'Tahitian Charcoal Hoop Earrings',
   'Charcoal-grey cultured Tahitian pearls hang from small polished sterling silver hoops. Sold as a pair, with slight differences in overtone.',
   'tahitian', 9.0, 'AA', 'French Polynesia', 219000, 'myr', 5, null, true),
  ('tahitian-lagoon-pearl-ring', 'Tahitian Lagoon Pearl Ring',
   'A dark cultured Tahitian pearl with green-blue overtones in a clean sterling silver solitaire setting.',
   'tahitian', 10.0, 'AAA', 'French Polynesia', 189000, 'myr', 7, null, true)
on conflict (slug) do nothing;
