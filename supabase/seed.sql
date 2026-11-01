-- Sample products for local development. Safe to delete later.
insert into products (slug, name, description, pearl_type, size_mm, luster, origin, price_cents, stock)
values
  ('akoya-classic-strand', 'Akoya Classic Strand',
   'A timeless 45cm strand of round white Akoya pearls with a sterling silver clasp.',
   'akoya', 7.5, 'AAA', 'Japan', 289900, 5),
  ('freshwater-stud-earrings', 'Freshwater Stud Earrings',
   'Everyday studs in soft white freshwater pearls, 925 silver posts.',
   'freshwater', 8.0, 'AA', 'China', 19900, 30),
  ('south-sea-golden-pendant', 'South Sea Golden Pendant',
   'A single golden South Sea pearl on an 18k gold-plated chain.',
   'south_sea', 11.0, 'AAA', 'Philippines', 159900, 3),
  ('tahitian-peacock-bracelet', 'Tahitian Peacock Bracelet',
   'Dark Tahitian pearls with green-peacock overtones on elastic silk.',
   'tahitian', 9.0, 'AA', 'French Polynesia', 99900, 8);
