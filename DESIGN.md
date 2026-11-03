# Pearl Shop — White Pearl

The storefront uses white and near-white surfaces, charcoal text and one muted-gold accent. Real product photography leads the experience. Display type is regular-weight EB Garamond; Montserrat provides clean, legible commerce UI.

## Tokens and typography

- White: `#ffffff`; near-white surface: `#f7f7f5`.
- Charcoal: `#282724`; secondary text: `#64635f`.
- Muted gold: `#806b48`, used for small editorial labels, service icons and focus outlines.
- Hairlines: `#e2e1dd`; control borders: `#93918b`.
- Display: EB Garamond 400, 40–72px, line-height 1.08. Product names: 22–26px.
- Body: Montserrat 400, 15–16px, line-height 1.7–1.85. UI labels use 500; small navigation/category labels are uppercase with restrained tracking.
- Fonts are bundled locally through `next/font/local`; include their OFL notices in `src/app/fonts/`.

## Layout

The homepage opens with a wide photographic hero and a concise white editorial panel. Four pearl categories use the existing `?type=` URLs. The catalogue has two columns on phones, three on tablets and four on larger desktops; square images reach the card edges without decorative mounts. A featured piece, photographed brand story, pearl-care guidance and service strip give the page substance.

Product pages give roughly 60% of desktop space to photography and use full-width photographs on phones. Purchase controls stay in the document flow to avoid obscuring content or keyboard focus. Cart, empty, confirmation, cancelled and 404 screens share the light visual system. Administration retains readable forms, tables and semantic status colours.

## Interaction and implementation

Use 44px minimum controls, visible keyboard focus, labelled native filters, descriptive image alternatives and subtle 200–500ms transitions. Respect reduced motion. Reserve explicit image sizes or aspect ratios and use responsive `sizes`; preload only the primary photograph. Keep shared rules in `globals.css` inside `@layer components`, the Tailwind entry in `tailwind.css`, and colour tokens in `@theme static`.

Prices, product facts and stock continue to come from the existing server data flow. Shipping copy reads `SHIPPING_RULES`: Malaysia RM10 / free from RM300; Singapore RM25 / free from RM500. No invented reviews, awards, certifications or company history.

## Skill guidance applied

UI/UX Pro Max searches: `jewellery ecommerce white luxury --design-system`, `minimalism luxury --domain style`, `luxury serif sans --domain typography`, `e-commerce luxury --domain color`, and `responsive images fonts --stack nextjs`. Use the verified Minimalism & Swiss Style grid, E-commerce Luxury neutral palette, serif/sans hierarchy, accessible contrast, reserved image geometry and responsive-image/font guidance. The initial Liquid Glass style result was rejected as unsuitable for the brief. EB Garamond is the local serif substitution for Cormorant because external font downloads are unavailable in this environment.

