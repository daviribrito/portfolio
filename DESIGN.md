---
name: Davi Brito
description: An open lab notebook on how distributed systems fail, laid out like the original portfolio and finished like a product page.
colors:
  ink: "#16181d"
  accent: "#0066cc"
  page: "#f4f5f7"
  paper: "#ffffff"
  card: "#f4f5f7"
  raise: "#ffffff"
  hover: "#e9ebef"
  soft: "#3a3e47"
  muted: "#565b66"
  faint: "#676c77"
  line: "#dfe1e6"
  line-strong: "#c9ccd3"
  action: "#16181d"
  on-action: "#ffffff"
  live: "#2fbf71"
  ok: "#12804a"
  fail: "#c8262b"
  wait: "#9a5b00"
  tag-bg: "#fff3d6"
  tag-ink: "#7a5200"
  lab: "#000000"
  lab-surface: "#15171c"
  lab-node: "#1d2027"
  lab-ink: "#f4f5f7"
  lab-ink-2: "#a3a8b3"
  lab-line: "#2a2d35"
  lab-ok: "#2fbf71"
  lab-fail: "#ff5a5f"
  lab-wait: "#f5b13d"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(40px, 6.4vw, 76px)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.042em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.8vw, 56px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.036em"
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(24px, 2.8vw, 32px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.028em"
  card-title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    letterSpacing: "-0.02em"
  data:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 44px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.045em"
    fontFeature: "tnum"
  lede:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.9vw, 21px)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 500
rounded:
  tile: "28px"
  panel: "18px"
  small: "12px"
  pill: "999px"
  dot: "50%"
spacing:
  grid-gap: "12px"
  chip-gap: "8px"
  card-gap: "14px"
  card-pad: "clamp(20px, 2.6vw, 32px)"
  panel-pad: "clamp(40px, 6.5vw, 80px) clamp(18px, 4.5vw, 56px)"
  block: "clamp(56px, 8vw, 104px)"
  wrap: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.pill}"
    padding: "10px 22px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 22px"
    height: "44px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.dot}"
    size: "36px"
  tag:
    backgroundColor: "{colors.card}"
    textColor: "{colors.soft}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.soft}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "32px"
  example-tag:
    backgroundColor: "{colors.tag-bg}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.card-pad}"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "{spacing.panel-pad}"
  lab:
    backgroundColor: "{colors.lab}"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.tile}"
    padding: "clamp(20px, 3.6vw, 44px)"
  tab:
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  tab-active:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  segmented-active:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.pill}"
  here-tag:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
---

# Design System: Davi Brito

## Overview

**Creative North Star: "The Product-Page Notebook"**

The structure is the user's original portfolio (https://daviribrito.github.io/portfolio/): a floating topbar with segmented tabs, one large panel per page, centred head groups with a tag above a two-line heading, a stats strip, a bento grid, a roadmap tree and a journey timeline. The finish is a product page: a soft grey ground, white rounded tiles, big bold headings, pill controls, and every interactive lab shown in a black display case so the simulation is the hero of its section.

The voice is confident and calm. Hanken Grotesk at weight 700 sets every heading with tight tracking, always in two lines with the second line greyed, so a heading reads as statement plus consequence. Body copy is generous (16–21px). Mono is reserved for code, logs and commit SHAs. Ink (near-black, flipping to near-white in dark) carries every primary action; blue is for links. Green, red and amber appear only where a simulated system resolves, plus one pulsing green dot for what is live right now.

Both themes are token swaps. The labs and code blocks stay dark in both themes: they redefine the tokens locally, so every nested component inherits the dark case without theme branches.

**Key Characteristics:**
- Soft grey ground, white 28px tiles, 18px cards in the ground tone.
- Pill buttons, tabs, tags, chips and segmented controls; circles for status dots, seeds and knots.
- Two-line Hanken Grotesk 700 headings, second line faint.
- Black display case for each lab and code block, in both themes.
- Ink for actions, blue for links, semantic colour only at resolution.
- 12px gaps between tiles and cards, large clamped padding inside.

## Colors

A cool neutral stack, one ink, one link blue, and semantic colour held back for outcomes.

### Primary
- **Ink** (`ink` / `action`): headings, primary buttons, active segment, brand mark, seed, knots, progress fills, current-leaf ring. Dark: `#f4f5f7` with `on-action` `#000000`.

### Secondary
- **Link Blue** (`accent`): text links (`.go`, `.links`), commit SHAs, activity bars, focus outline, selection. Dark `#4da3ff`. Never a button fill.

### Tertiary
- **Live Green** (`live`): pulsing live dot, "dominado" pins, the current journey marker.
- **Outcome set** (`ok`, `fail`, `wait`): verdicts, log lines, ledger rows, failing nodes, trap bullets. Dark `#3ed283`, `#ff6b6f`, `#f5b13d`.
- **Example Amber** (`tag-bg` / `tag-ink`): pill marking placeholder content. Dark `#3a2c0c` / `#ffd27a`.

### Neutral
- **Ground** (`page`): body background. Dark `#000000`.
- **Paper** (`paper`): page panels, footer, journey steps, peek rows, empty states. Dark `#161618`.
- **Card** (`card`): cards, leaves, tags, chips, tab track, roadmap summary bar. Dark `#1f1f22`.
- **Raise** (`raise`): active tab indicator, hovered/current leaf. Dark `#26262a`.
- **Soft / Muted / Faint**: secondary text in three steps; faint is the second line of headings, eyebrows and dates. Dark `#d2d5dc` / `#a8adb7` / `#8e939d`.
- **Line / Line Strong**: dividers, roadmap trunk, outlines of "próximo" and example cards. Dark `#2a2c31` / `#3b3e45`.

### Lab case (both themes)
`.lab` and `.code-card` redefine `ink`, `muted`, `faint`, `line`, `card`, `raise`, `action` and the outcome set to the `lab-*` values, on a `lab` ground (`#000000`; `#0b0b0d` with a `#2a2c31` edge in dark).

### Named Rules
**The One Ink Rule.** Primary actions and active states are ink. Blue is for links only.

**The Colour At Resolution Rule.** Green, red and amber appear only when a simulated outcome resolves. Live counts stay neutral until then.

**The Token Swap Rule.** Every colour is a custom property with a light and a dark value; the lab case is a local swap, not a theme branch.

## Typography

**Display / Body Font:** Hanken Grotesk (with system-ui, -apple-system)
**Mono Font:** JetBrains Mono (code, logs, SHAs only)

**Character:** A crisp grotesk at bold weight and tight tracking for statements, set large; relaxed body sizes for reading.

### Hierarchy
- **Display** (700, clamp 40–76px, 1.03, -0.042em): page h1, centred, two lines.
- **Headline** (700, clamp 32–56px, 1.06): section headings under a tag.
- **Title** (700, clamp 24–32px): roadmap topic headings.
- **Card title** (700, 19px): card and lab-question headings; repo names 24px.
- **Data** (700, clamp 32–44px, tabular): stat numbers and verdict figures.
- **Lede** (400, clamp 17–21px, 1.45): intros, muted.
- **Body** (400, 16px/1.55); card copy 15px muted.
- **Label** (600, 13px): eyebrows, "Resultado", legend, meta keys. Sans, not uppercase.
- **Mono** (JetBrains Mono 500, 12.5px): SHAs, logs, code.

### Named Rules
**The Muted Second Line Rule.** Display, headline and title are two clauses; the second sits in a block span coloured faint.

**The Mono Means Code Rule.** Mono is only for code, logs and SHAs. Labels, dates and counts stay in the sans.

## Layout

A centred column capped at 1180px with fluid gutters (clamp 10–28px). Each page is one rounded paper panel; extra panels stack 12px apart. Inside, centred head groups (tag, two-line heading, muted sub) lead into grids at a 12px gap: two or three equal columns (collapsing at 760px / 900px) and a two-column bento with full-width "wide" cells. The stats strip is four cells divided by 1px lines, folding to 2x2 below 640px.

The roadmap is a vertical tree on a 2px centre trunk: a round ink seed, then rows with a round hub knot flanked by leaves that alternate sides (190px centre lane). Below 760px the trunk moves left and labels left-align. The journey is a row of white step cards on a grey card with round markers on a 2px rule; the current step is an ink card. On mobile it becomes a vertical rule on the left.

## Elevation & Depth

Mostly flat and tonal: ground, paper, card, raise. Tiles are separated by tone, not borders. The topbar is translucent (blur 20px, saturate 180%) with a hairline ring and a soft drop. Linked leaves lift 2px with a soft shadow on hover. The lab case uses inset 1px rings to separate its stage, log and verdict.

### Shadow Vocabulary
- **Hover lift** (`0 2px 6px rgb(22 24 29 / 0.04), 0 18px 40px -20px rgb(22 24 29 / 0.18)`; dark uses black at 0.4 / 0.8): linked roadmap leaves on hover.
- **Inset ring** (`inset 0 0 0 1px line`): lab stage, log, verdict, segmented track, "próximo" and example outlines (1.5px).

## Shapes

Generous, consistent radii: 28px for panels and labs, 18px for cards, leaves, lab panels and footer, 12px for small rows, pill for every control and tag, circles for dots, seeds, knots, markers and the monogram.

### Named Rules
**The Rounded Family Rule.** Use only 28 / 18 / 12 / pill / circle. No square corners on surfaces.

## Components

### Buttons
- **Primary:** ink pill, 44px, 15px/600, 22px side padding; hover 88% opacity; press scales to 0.97; trailing arrow slides 3px.
- **Secondary:** transparent pill with a 1px line-strong inset ring; hover fills `hover`.
- **Icon button:** 36px circle, transparent, muted icon; hover fills `hover`. In labs 42px with a card fill and ring.
- **Text link ("go"):** blue 15px/500 with a sliding arrow, underline on hover.

### Chips
- **Tag:** card pill, 13px/600 soft text, optional live dot; sits above every section heading.
- **Chip:** 32px card pill for stack and hobby lists.
- **Example tag:** amber pill marking placeholder content.
- **Here tag:** ink pill on the top edge of the current leaf ("Você está aqui").

### Cards / Containers
- **Panel:** paper, 28px radius, padding clamp 40–80px / 18–56px.
- **Card:** card tone, 18px radius, padding clamp 20–32px, 14px internal gap, footer pushed down. Corner-bracket spans from the original markup are kept but hidden.
- **Outline variants:** upcoming and example cards are transparent with an inset 1.5px ring.

### Navigation
A floating pill topbar, sticky 12px from the top: round ink "DB" mark and name, segmented pill tabs centred, round theme button on the right. The active tab is a raised white pill that slides between tabs on the spring curve (0.45s). Below 640px the tabs drop to a full-width second row and the bar rounds to 22px.

### Roadmap Tree
Round ink seed (56px), round hub knots (16px, filled = done, outlined grey = next), leaves as 18px cards with a status dot (green dominado, amber estudando, outlined próximo), a 15px title and a meta row with a 6px progress bar.

### Lab
A black 28px case: question (clamp 18–22px/700) and controls (pill segmented with an ink-white active segment, round icon buttons) on one bar; an 18px stage for the SVG scene; then a mono log beside a verdict panel with a "Resultado" label, a large tabular figure and a muted line. On resolution the verdict gains a 10% green or red wash and ring.

### Code card
Same black case as the lab, a 17px/700 summary with a round plus that rotates into an ink "x" when open, and syntax tokens in pink, green, amber and grey.

### Live Dot
An 8px green circle pulsing a 4px halo every 2.2s; only for what is genuinely current.

## Do's and Don'ts

### Do:
- **Do** keep the original structure: topbar with tabs, one panel per page, tag above a two-line heading, bento, roadmap tree, journey.
- **Do** use the rounded family (28 / 18 / 12 / pill / circle) for every surface and control.
- **Do** show every lab and code block in the black case, in both themes.
- **Do** keep primary actions as ink pills and links in blue.
- **Do** keep lab counts neutral until the outcome resolves.
- **Do** define every new colour as a token with a light and a dark value.

### Don't:
- **Don't** reintroduce the hatch, square corners or visible corner brackets.
- **Don't** use blue or any brand hue as a button fill.
- **Don't** use green, red or amber decoratively.
- **Don't** set labels, dates or prose in mono.
- **Don't** add resting shadows to cards; separate by tone.
