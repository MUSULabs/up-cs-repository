# Project: UP-CS Research Repository (คลังภาคนิพนธ์ วิทยาการคอมพิวเตอร์ ม.พะเยา)

## What this is

A small digital library web app collecting undergraduate senior projects (ภาคนิพนธ์)
of the Computer Science program, University of Phayao. Inspired by IEEE Xplore / ThaiLIS TDC
but intentionally much smaller.

## Primary user

Undergraduate CS students looking for a thesis topic — they want to know what
previous cohorts already built, which advisor supervised it, and what tech stack was used.

## Problem being solved

Past senior projects are scattered with no central place. New students cannot discover prior work.

## Scale

~200 papers, 5 academic years. This is SMALL. Do not over-engineer.

## Tech stack (fixed — never substitute)

- Next.js 15 App Router, TypeScript strict mode, React Server Components
- Tailwind CSS v4 + shadcn/ui + lucide-react
- PostgreSQL (Neon) + Prisma ORM
- Auth.js v5 (NextAuth) — Google OAuth restricted to @up.ac.th + credentials for admin
- Zod + react-hook-form
- Search: PostgreSQL pg_trgm + ILIKE (NO Elasticsearch, NO Meilisearch, no Thai word segmentation)

## UI language

All UI labels are Thai. Content fields store both Thai and English
(titleTh/titleEn, abstractTh/abstractEn) and are shown as tabs on the detail page.

## Access control — 3 levels per paper

- PUBLIC: anyone can view the detail page and download the PDF
- AUTHENTICATED: anyone can read the abstract; must sign in to download the PDF
- DEPT_ONLY: only users with role DEPT_MEMBER or ADMIN can download (older papers
  where publication rights could not be obtained)

Abstract and metadata are ALWAYS readable by everyone. Only the PDF is gated.

## User roles

VIEWER (default) < DEPT_MEMBER (verified CS student/staff) < ADMIN

## PDPA rules — important

- studentId is stored but NEVER rendered on any public page or API response
- Never expose author email publicly
- Hash IP addresses before writing to any log table

## Explicit NON-GOALS — do not build these

- No student self-submission flow, no moderation queue
- No Google Scholar / citation_* meta tags
- No OAI-PMH endpoint
- No DOI, no peer review, no payments, no comments, no full-text PDF search
- No microservices, no Docker, no monorepo — one Next.js app, one database

## Conventions

- Prisma models PascalCase, fields camelCase
- Route groups: app/(public)/... and app/(admin)/...
- Server Components by default; "use client" only for interactive widgets
- Server Actions for mutations — no REST API routes unless strictly needed
- All search/filter state lives in URL searchParams so results are shareable
- Thai comments are fine; identifiers must be English
