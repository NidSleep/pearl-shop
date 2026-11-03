---
name: Pearl Shop
description: The Midnight Jewellery Edit — editorial pearl jewellery in ink, ivory and antique gold.
colors:
  ink: "#111f2b"
  ivory: "#f8f5ef"
  gold: "#d8b77c"
  gold-hover: "#edce96"
  accent: "#795b2c"
  muted: "#5d6569"
  on-dark: "#c6cbd0"
  surface: "#eae5db"
  line: "#d4d0c7"
  control-border: "#858b8c"
  field: "#fffdf9"
  ink-hover: "#304758"
  focus: "#a67b37"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(3.5rem, 6.7vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 4.8vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.6rem, 4.5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.75rem"
    lineHeight: 1.6
  button:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  square: "0"
  status-pill: "50px"
  circle: "50%"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "3rem"
  expansive: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "0.85rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "0.85rem 1.5rem"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "0.85rem 1.5rem"
  button-gold-hover:
    backgroundColor: "{colors.gold-hover}"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0.65rem 0.85rem"
    width: "100%"
  product-mount:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0.75rem 0.75rem 2.3rem"
  summary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "2rem"
---

# Design System: Pearl Shop

## Overview

**Creative North Star: "The Midnight Jewellery Edit"**

Pearl Shop uses the contrast and typography of a fashion editorial. Deep ink gives cream product photography a defined stage; warm ivory keeps product facts and shopping controls clear. Antique gold supplies fine rules, selected emphasis and actions on dark surfaces.

Playfair Display carries the expressive voice, while Geist handles navigation, prices and commerce. Flat rectangular forms, generous section spacing and visible photographic mounts create the identity without obscuring the catalogue. The same palette supports restrained, readable administration.

**Key Characteristics:**

- Strong ink and ivory contrast with restrained gold emphasis.
- Expressive serif headings paired with direct sans-serif commerce.
- Square photographic mounts, fine rules and rectangular controls.
- Spacious editorial sections with compact, usable product information.
- Brief image motion with a complete reduced-motion alternative.

## Colors

Frontmatter is the normative value reference, extracted from `src/app/tailwind.css` and `src/app/globals.css`.

### Primary

- **Antique gold** (`gold`): actions on ink, photographic captions, the wordmark dot and italic emphasis. `gold-hover` lightens interactive actions.
- **Burnished accent** (`accent`): warm emphasis and link hover on light surfaces.

### Neutral

- **Ink** (`ink`): text, header/footer, photographic mounts and status stages; `ink-hover` lightens primary buttons.
- **Warm ivory** (`ivory`): reading background and principal text on ink.
- **Muted slate** (`muted`): supporting facts on light surfaces. **Soft silver** (`on-dark`) serves dark surfaces.
- **Warm panel** (`surface`): care panels, summaries and missing-image backgrounds.
- **Fine rule** (`line`): section divisions. **Control border** (`control-border`) gives fields a stronger edge.
- **Field paper** (`field`): control interiors. **Focus ochre** (`focus`): keyboard outlines.

**The Contrast Rule.** Use gold actions with ink text on dark stages; use ink actions with ivory text on light shopping surfaces. Supporting text has separate light- and dark-surface roles.

## Typography

**Display Font:** Playfair Display, with Georgia and serif fallbacks.

**Body Font:** Geist, with Arial and sans-serif fallbacks.

Both fonts are loaded by `next/font/google` in `src/app/layout.tsx`. Serif headings use regular weight and close tracking; body copy uses relaxed leading. Italic serif emphasis ties editorial headings to gold or the burnished accent.

### Hierarchy

- **Display:** the frontmatter role is the desktop hero. At 1023px and below it becomes `clamp(3rem, 6.3vw, 5rem)`; at 767px and below, `clamp(2.8rem, 8.8vw, 4.25rem)` with line height 1.09. Below 390px it is 2.8rem.
- **Headline:** section headings use the headline role; phones use `clamp(2.4rem, 8vw, 3.4rem)`.
- **Page title:** functional page headings use the page-title role. Product and status views have explicit phone sizes; administration uses 2.5rem.
- **Product title:** names use serif type at 1.125rem, with a 1.25rem Tailwind small-breakpoint variant and a 1.1rem phone override.
- **Body:** the base role establishes the page rhythm. Descriptions commonly use 0.9–0.95rem with 1.9 leading. Hero copy is limited to 33–35 characters per line.
- **Label and button:** small Geist text separates facts from headings. Prices and quantity outputs use tabular numerals. Fields use 0.875rem on larger screens and 1rem on phones.

**The Two Voices Rule.** Use the serif for identity and product names; keep actions, prices, filters and operational facts in Geist.

## Layout

The shared container has a maximum width of 1200px and desktop side gutters of 3rem. At 1023px and below the gutters become 1.5rem; at 767px and below they become 1.25rem.

Catalogue grids use four columns above 1023px and two columns below it, including phones. Product detail and cart use paired columns on larger screens and stack at 767px. From 1024px, product imagery and cart summaries become sticky with a 7.5rem top offset. Fine rules divide sections instead of enclosing every block in a card.

The sticky header is 88px minimum height on larger screens and 72px on phones. Mobile navigation retains collection, care and cart controls while hiding the story link. The footer uses three desktop columns, two phone columns and one column below 390px.

On phones purchase controls form a fixed ink bar with safe-area padding. Product-page bottom spacing, footer clearance and scroll padding account for it; preserve those relationships. Filters use two columns, with the type filter and submission action spanning the row.

The spacing scale records reused values rather than every dimension. Preserve explicit aspect ratios: square catalogue/detail photographs, with the featured editorial image changing from wide on desktop to portrait on phones. Page-specific composition belongs in `.impeccable/surfaces/src-app-page-tsx.md`.

## Elevation & Depth

The system is flat by default. Ink mounts, tonal panels and fine borders supply separation. The hero's zero-blur shadow extends its background to the viewport edges; it is a layout treatment. The fixed phone purchase bar uses a soft upward shadow (`0 -8px 24px #111f2b18`) to separate persistent controls from scrolling content.

**The Flat Surface Rule.** Keep product cards and reading panels free of decorative drop shadows; establish depth with contrast, framing and spacing.

## Shapes

Controls, mounts, panels and image crops have square corners. Circles are reserved for the wordmark dot, cart count and status symbol; compact status badges use pill corners. Thin borders carry structure, with a stronger top edge on the cart summary. Photographs sit inside ink mounts rather than blending into the page background.

## Components

### Buttons and links

Rectangular actions use the frontmatter primary, secondary or gold variant. Buttons have a 50px minimum height; filter actions use 48px. Secondary actions have a visible control border. Primary and gold actions lighten on hover; secondary actions gain panel fill and an ink border. Text links retain underlines and a 44px minimum height.

Keyboard focus uses a 2px ochre outline with 5px offset. Disabled controls reduce opacity to 0.55 and use a not-allowed cursor. Background, text and border transitions last 200ms; buttons do not translate or scale.

### Inputs and quantity controls

Fields use field paper, ink values, control borders and a 48px minimum height. Hover strengthens the border to ink; focus uses the shared outline. Labels sit above fields. Phone field text increases to 1rem. Quantity controls group square buttons around a tabular output; each button is at least 44px wide and 48px tall.

### Product cards and imagery

A linked product card combines a square photo, ink mount, gold arrow and separate facts block. The product name is serif; pearl type, size and price are sans-serif. Sold-out state has a textual ink-and-ivory badge. Missing photographs receive a labelled warm-panel placeholder.

Photos use cover fitting by default; the featured hero explicitly uses contain fitting. Card hover or keyboard focus scales the photo to 1.045 over 650ms with the shared ease. Keep the photo frame clipped and the link focus ring visible. Mount padding reduces on phones.

### Navigation and footer

The ink header uses an ivory serif wordmark, gold dot and compact Geist links. The cart count is a gold circle with ink numerals. Navigation and footer link hover turn gold and underline; navigation colour transitions last 180ms. Footer typography repeats the editorial serif, while delivery and payment facts remain sans-serif.

### Panels, status and administration

Summaries and care content use warm panels, square corners and clear rules. Status screens use an ink stage, ivory heading, silver supporting text and gold actions. Administration uses light surfaces, compact tables and textual order-status badges; retain their observed semantic colours.

### Motion

The featured hero photo reveals through a one-second clip-path animation using `cubic-bezier(.16, 1, .3, 1)`. Content remains present without animation. Image hover uses the same ease. Under `prefers-reduced-motion: reduce`, all animations and transitions are removed, hover scaling is removed, and scrolling becomes immediate.

## Do's and Don'ts

### Do:

- **Do** frame cream product photography with ink and preserve explicit image proportions.
- **Do** use separate supporting-text colours for light and dark surfaces.
- **Do** keep keyboard outlines, labelled stock states and minimum control sizes visible.
- **Do** preserve two-column phone browsing and clearance around the fixed purchase bar.
- **Do** use real catalogue photography, product facts and existing commercial terms.

### Don't:

- **Don't** return to a low-contrast presentation where cream imagery and the page merge.
- **Don't** replace rectangular shopping controls with decorative pills or floating cards.
- **Don't** use serif display styling for prices, filters or operational facts.
- **Don't** add motion that survives the reduced-motion preference.
- **Don't** invent reviews, awards, certifications or other commercial proof.
