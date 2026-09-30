# docs/ARCHITECTURE.md
## โครงสร้างระบบ (Architecture)

### แผนภาพระบบ (Text Diagram)
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  (public)    │  │   (admin)    │  │   (api)      │      │
│  │  /search     │  │  /admin/*    │  │  /api/*      │      │
│  │  /papers/*   │  │  /my/*       │  │  /check-topic│      │
│  │  /stats      │  │  /submit     │  │  /health     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Neon)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Paper      │  │   User       │  │  DownloadLog │      │
│  │   Advisor    │  │   Bookmark   │  │  SavedSearch │      │
│  │   Technology│  │   PaperTech  │  │  ...         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer                            │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ LocalStorage │  │ Vercel Blob  │ (selected by env var)  │
│  │  ./uploads   │  │  private     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### โมเดลข้อมูลสรุป (Data Model Summary)
| ตาราง | คำอธิบาย | คีย์หลัก |
|---|---|---|
| Paper | ภาคนิพนธ์ | id (cuid), slug |
| User | ผู้ใช้ระบบ | id (cuid), email |
| Advisor | อาจารย์ที่ปรึกษา | id (cuid) |
| ResearchArea | หมวดงานวิจัย | id (cuid) |
| Technology | เทคโนโลยี | id (cuid) |
| Keyword | คำสำคัญ | id (cuid) |
| PaperAdvisor | เชื่อม Paper-Advisor | paperId, advisorId |
| PaperTech | เชื่อม Paper-Technology | paperId, technologyId |
| PaperKeyword | เชื่อม Paper-Keyword | paperId, keywordId |
| Bookmark | รายการโปรดของผู้ใช้ | userId, paperId |
| SavedSearch | การค้นหาที่บันทึก | id (cuid) |
| DownloadLog | บันทึกดาวน์โหลด | id (cuid) |

### เมตริกการควบคุมการเข้าถึง (Access Control Matrix)
| บทบาท | PUBLIC | AUTHENTICATED | DEPT_ONLY |
|---|---|---|---|
| VIEWER | ดู/ดาวน์โหลด PDF | ดู abstract เท่านั้น | ไม่มีสิทธิ์ |
| DEPT_MEMBER | ดู/ดาวน์โหลด PDF | ดู abstract เท่านั้น | ดู/ดาวน์โหลด PDF |
| ADMIN | ดู/ดาวน์โหลด PDF | ดู abstract เท่านั้น | ดู/ดาวน์โหลด PDF |

### ตัดสินใจเทคโนโลยี (Tech Decisions)
| ปัญหา | วิธีแก้ | เหตุผล |
|---|---|---|
| ค้นหาข้อมูล | PostgreSQL pg_trgm + ILIKE | ไม่ต้องใช้ Elasticsearch/Meilisearch เพราะขนาดเล็ก |
| การตรวจสอบความคล้าย | pg_trgm similarity() + keyword overlap | คำนวณในฐานข้อมูลเพื่อประสิทธิภาพ |
| การจัดเก็บไฟล์ | LocalStorage (dev) / Vercel Blob (prod) | รองรับทั้ง offline และ production |
| การตรวจสอบสิทธิ์ | Auth.js v5 + Prisma Adapter | รองรับ Google OAuth + Credentials |
| ระดับการเข้าถึง PDF | ตรวจสอบที่ Server Action | ไม่เชื่อใน client-side เดียว |
| UI Language | Tailwind + shadcn/ui | คอมโพเนนต์พร้อมใช้งาน ใช้ Tailwind v4 |
| การจัดเก็บ URL state | searchParams | ให้ผลการค้นหาแชร์ได้ |

### ไฟล์สำคัญ
- `src/app/(public)/...` — เส้นทางสาธารณะ
- `src/app/(admin)/...` — เส้นทางผู้ดูแล (ต้องเข้าสู่ระบบ)
- `src/server/` — ฟังก์ชัน Query ด้วย Prisma
- `src/lib/` — ห้องปฏิบัติการ (access, similarity, storage, validation)
- `src/generated/prisma/` — Client ที่ได้ generate
- `prisma/schema.prisma` — โมเดลข้อมูล