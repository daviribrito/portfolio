# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: static HTML/CSS/JS, no build step, deployable to GitHub Pages as-is.
Reason: the machine has no Node.js or git installed (checked 2026-11-07), so a framework build (Astro was the first recommendation) cannot run locally. Content lives in plain JS data files (`data/*.js`) so editing does not require touching markup.

## Users

- Primary: technical recruiters and engineering leads evaluating Davi Ribeiro Brito for a backend role. They arrive from LinkedIn/GitHub, skim for 1–3 minutes, and want proof of depth, not a list of buzzwords.
- Secondary: Davi himself, using the site as an open study notebook he updates as he learns.

## Product Purpose

A personal portfolio and public study notebook. It shows who Davi is (Sobre), what he is studying and how far along (Roadmap, with interactive animated demonstrations of each concept such as idempotency), and real evidence of work (Commits from selected public GitHub repositories). Success: a visitor leaves understanding that Davi studies how distributed systems fail, and has seen it demonstrated, not just claimed.

## Positioning

Every concept on the roadmap ships with a visual, interactive demonstration of the failure it prevents. The portfolio is a lab notebook, not a résumé.

## Operating Context

- Previous version: https://daviribrito.github.io/portfolio/ ("Davi Brito · Portal"), sections Início, Roadmap, Sobre mim, Sei fazer, Resolvo. Its "Sobre mim" copy is reused as the base for the new Sobre section (inferred approval: user asked for a site "parecido" with it; user did not answer the reuse question).
- GitHub username assumed `daviribrito` (inferred from the github.io URL; not confirmed).
- Language: Portuguese (pt-BR).

## Capabilities and Constraints

- Sections: Sobre, Roadmap (topics + status + progress + animated demos), Commits (public repos chosen by Davi).
- Commits are fetched client-side from the public GitHub REST API (unauthenticated, 60 requests/hour per visitor IP). Davi chooses which repositories appear by editing a list in `data/config.js` (inferred choice; user did not answer). Must handle rate-limit and offline states gracefully.
- Undecided: final list of repositories; list of achievements ("feitos"); final roadmap topics and progress percentages (seeded from previous site, flagged for review).

## Brand Commitments

- User-pinned visual reference: Apple-style product-page structure (large confident typography, generous space, full-width section "tiles", restrained motion). The requested `apple-design` skill was not installed; frontend-design guidance is used instead.
- Voice: first person, direct, humble-technical. Example from the existing site: "Prefiro entender por que algo quebra antes de decidir como consertar."

## Evidence on Hand

- Sobre copy, trajectory (2022 Primeiras linhas → 2023 Backend de verdade → 2025 Produção ensina → 2026 Confiabilidade), values, interests, "O que procuro": from the previous site.
- Roadmap topics from the previous site: Retry com backoff 100%, Idempotência 80%, Circuit Breaker 60%, Rate limiting 45%, Transactional Outbox 30%. Recent learnings: SET NX + TTL, half-open circuit breaker, full vs equal jitter, cursor pagination in PostgreSQL.
- Stack: Node.js, PostgreSQL, Docker, Redis.
- Absent, must not be fabricated: achievements/awards, employers, metrics, testimonials. Placeholders are clearly marked for Davi to fill.

## Product Principles

1. Demonstrate, don't claim: every studied concept should be something a visitor can watch fail and recover.
2. Honest progress: show what is in progress as in progress.
3. Davi controls the content: data in editable files, nothing hard-coded in markup.
4. Fast and static: works on GitHub Pages with no backend.

## Accessibility & Inclusion

- WCAG AA contrast; all animations respect `prefers-reduced-motion` and are controllable (play/pause/replay).
