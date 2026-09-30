# UP-CS Research Repository Scope

## Goal

Create a small digital library for undergraduate senior projects (ภาคนิพนธ์) from
the Computer Science program at the University of Phayao. The repository gives
students one place to discover prior work, advisors, and technology stacks when
choosing a thesis topic.

## Primary user

Undergraduate Computer Science students looking for a thesis topic.

## Content and scale

The repository contains approximately 200 senior-project papers spanning five
academic years. Each paper includes searchable metadata, Thai and English titles
and abstracts, advisor information, technology-stack details, and—where permitted—
a downloadable PDF.

## Access levels

Each paper has one of three PDF access levels:

- **PUBLIC** — anyone can view the detail page and download the PDF.
- **AUTHENTICATED** — anyone can read the abstract, but users must sign in to
  download the PDF.
- **DEPT_ONLY** — only users with the `DEPT_MEMBER` or `ADMIN` role can download
  the PDF.

Abstracts and metadata are always readable by everyone. Only the PDF is gated.
The default user role is `VIEWER`; verified Computer Science students and staff
may be `DEPT_MEMBER`; administrators are `ADMIN`.

## Non-goals

- Student self-submission flow or a moderation queue
- Google Scholar or `citation_*` meta tags
- OAI-PMH endpoint
- DOI, peer review, payments, or comments
- Full-text PDF search
- Microservices, Docker, or a monorepo
- A separate search platform, Thai word segmentation, or other infrastructure
  beyond the small Next.js application and its database

## Delivery phases

### Phase 1

- Browse the paper collection
- Search and filter papers
- View paper detail pages
- Admin CRUD for paper metadata and access settings

### Phase 2

- Deploy the application
- Bulk CSV import for the paper collection

### Later

- Student submission
- SEO enhancements
- OAI-PMH
