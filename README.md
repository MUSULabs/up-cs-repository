# คลังภาคนิพนธ์ UP-CS

คลังดิจิทัลสำหรับค้นหาและอ่านข้อมูลภาคนิพนธ์ของสาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยพะเยา ช่วยให้นิสิตค้นหาหัวข้อเดิม อาจารย์ที่ปรึกษา และเทคโนโลยีที่ใช้ได้จากที่เดียว

## ภาพหน้าจอ

> **ภาพหน้าจอจะเพิ่มในภายหลัง**: หน้าแรก, หน้าค้นหา, หน้ารายละเอียด และหลังบ้านผู้ดูแล

## ฟีเจอร์

- ค้นหาและกรองภาคนิพนธ์ด้วยชื่อเรื่อง บทคัดย่อ ปี หมวดงาน อาจารย์ และเทคโนโลยี
- รายละเอียดสองภาษา พร้อมผู้เขียน อาจารย์ คำสำคัญ และสถิติ
- สิทธิ์ดาวน์โหลด 3 ระดับ: สาธารณะ, ผู้เข้าสู่ระบบ, สมาชิกภาควิชา
- ผู้ดูแลจัดการภาคนิพนธ์ อนุกรมข้อมูล ผู้ใช้ และอัปโหลด PDF
- ตรวจสอบ PDF ด้วย magic bytes, จำกัด 30 MB, นับจำนวนหน้า และบันทึกสถิติการดาวน์โหลด
- ตรวจสอบหัวข้อซ้ำ (similarity scoring) ช่วยนิสิตตัดสินใจหัวข้อ
- อ้างอิงงานวิจัย: APA 7 / IEEE / BibTeX / RIS พร้อมคัดลอกและดาวน์โหลด
- บันทึกรายการโปรด, บันทึกการค้นหา, เปรียบเทียบภาคนิพนธ์ (ต้องเข้าสู่ระบบ)
- แดชบอร์ดสถิติผู้ดูแล (recharts) และหน้าสถิติสาธารณะ `/stats`
- นำเข้า/ส่งออกข้อมูลจำนวนมาก (CSV/XLSX)
- SEO: sitemap, robots, JSON-LD, Highwire Press, Dublin Core, OG image
- PDPA: ไม่เปิด studentId/อีเมล, แฮช IP, หน้า `/privacy`

## เทคโนโลยี

Next.js 15 App Router, TypeScript, React Server Components, Tailwind CSS v4, shadcn/ui, PostgreSQL (Neon), Prisma, Auth.js v5, Zod, React Hook Form, pg_trgm/ILIKE, pdf-lib, recharts, xlsx, react-pdf

## เริ่มใช้งานในเครื่อง

1. ติดตั้ง Node.js รุ่น LTS และ PostgreSQL หรือสร้างฐานข้อมูลบน Neon
2. ติดตั้งแพ็กเกจ: `npm install`
3. คัดลอก `.env.example` เป็น `.env` แล้วกรอกค่า
4. สร้างตารางและดัชนี: `npx prisma migrate dev`
5. เพิ่มข้อมูลตัวอย่าง: `npm run db:seed`
6. เริ่มเซิร์ฟเวอร์: `npm run dev`
7. เปิด `http://localhost:3000`

ไฟล์ PDF ในโหมด local จะถูกเก็บไว้ที่ `./uploads` และไม่ควร commit เข้า Git

## ตัวแปรสภาพแวดล้อม

| ตัวแปร | ใช้สำหรับ |
|---|---|
| `DATABASE_URL` | URL ฐานข้อมูล PostgreSQL |
| `AUTH_SECRET` | secret สำหรับ Auth.js และ fallback salt |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXTAUTH_URL` | URL หลักของระบบ |
| `ADMIN_EMAIL` | อีเมลผู้ดูแลสำหรับ seed |
| `ADMIN_PASSWORD` | รหัสผ่านผู้ดูแลสำหรับ seed |
| `ALLOWED_EMAIL_DOMAIN` | โดเมนอีเมลที่อนุญาต เช่น `up.ac.th` |
| `DOWNLOAD_IP_SALT` | salt แยกสำหรับแฮช IP ดาวน์โหลด |
| `STORAGE_DRIVER` | `local` สำหรับพัฒนา หรือ `blob` สำหรับ Vercel |
| `BLOB_READ_WRITE_TOKEN` | token สำหรับ Vercel Blob แบบ private |

## บัญชีตัวอย่างจาก seed

ค่าจริงของผู้ดูแลอ่านจาก `ADMIN_EMAIL` และ `ADMIN_PASSWORD` ใน `.env` ส่วนบัญชีสาธิตคือ:

| บัญชี | สิทธิ์ | รหัสผ่าน |
|---|---|---|
| `admin@example.com` | ADMIN | `Admin123!` |
| `member@example.com` | DEPT_MEMBER | `Member123!` |
| `viewer@example.com` | VIEWER | `Viewer123!` |

ควรเปลี่ยนข้อมูลตัวอย่างก่อนใช้งานจริง

## Roadmap

สิ่งที่เลื่อนออกจากระยะปัจจุบัน ได้แก่ student self-submission, Google Scholar SEO, OAI-PMH, CSV bulk import และ cloud storage

## เอกสารอ้างอิง (docs/)

- [PROPOSAL.md](docs/PROPOSAL.md) — ใบเสนอโครงการหน้าเดียว
- [USER_MANUAL.md](docs/USER_MANUAL.md) — คู่มือนิสิต
- [ADMIN_MANUAL.md](docs/ADMIN_MANUAL.md) — คู่มือผู้ดูแล
- [PDPA.md](docs/PDPA.md) — นโยบายข้อมูลส่วนบุคคล
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — โครงสร้างระบบ
- [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — สคริปต์สาธิต 5 นาที
- [SEO.md](docs/SEO.md) — คู่มือ SEO และ Google Scholar
- [DEPLOY.md](docs/DEPLOY.md) — คู่มือติดตั้งบน Vercel + Neon
- [SCOPE.md](docs/SCOPE.md) — ขอบเขตโครงการ
- [AUTH_SETUP.md](docs/AUTH_SETUP.md) — การตั้งค่า Auth.js
