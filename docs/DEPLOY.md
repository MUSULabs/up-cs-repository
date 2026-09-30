# การนำระบบขึ้น Vercel

## 1. เตรียม Neon

1. สร้าง project และ database บน [Neon](https://neon.tech)
2. คัดลอก pooled connection string เป็น `DATABASE_URL`
3. ตรวจสอบว่า connection string มี SSL และใช้ได้จาก production

## 2. เตรียม Vercel

1. Import repository เข้า Vercel
2. เพิ่ม environment variables ตาม `.env.example` ใน Production, Preview และ Development ตามต้องการ
3. ตั้ง `NEXTAUTH_URL` เป็น URL จริงของ production และตั้ง `AUTH_SECRET` เป็นค่าสุ่มที่แข็งแรง
4. ตั้ง `DOWNLOAD_IP_SALT` เป็นค่าสุ่มแยกจาก `AUTH_SECRET`
5. ตั้ง `STORAGE_DRIVER=blob` และใส่ `BLOB_READ_WRITE_TOKEN` จาก Vercel Blob store

## 3. สร้างฐานข้อมูล

รันจากเครื่องที่เข้าถึง Neon ได้:

```bash
npx prisma migrate deploy
npm run db:seed
```

ไม่ควรใช้ `prisma migrate dev` ใน production

## 4. Google OAuth

เพิ่ม redirect URI ของ production ใน Google Cloud OAuth client:

```text
https://โดเมนของคุณ/api/auth/callback/google
```

รายละเอียดการสร้าง client และ local redirect URI อยู่ใน [AUTH_SETUP.md](./AUTH_SETUP.md)

## 5. ไฟล์ PDF ใน production

ระบบใช้ Vercel Blob แบบ private ใน production โดยเก็บเฉพาะ pathname ภายใน Blob store ใน `Paper.pdfUrl` ไฟล์จะไม่ถูกส่ง URL ตรงให้ browser และทุกการดาวน์โหลดต้องผ่าน `/api/papers/[slug]/download` ซึ่งตรวจสิทธิ์ซ้ำก่อน stream ไฟล์

ไดรเวอร์ local (`STORAGE_DRIVER=local`) ที่เขียนลง `./uploads` ใช้สำหรับ offline development เท่านั้น หากมีไฟล์เดิมใน `./uploads` และต้องการย้ายไป Blob:

```bash
STORAGE_DRIVER=blob BLOB_READ_WRITE_TOKEN=... npm run storage:migrate
```

ถ้าใช้ PowerShell:

```powershell
$env:STORAGE_DRIVER="blob"
$env:BLOB_READ_WRITE_TOKEN="..."
npm run storage:migrate
```

`BLOB_READ_WRITE_TOKEN` ต้องอยู่ใน Vercel environment variables เท่านั้น ห้ามใส่ใน client bundle หรือ commit ลง repository

ห้าม commit ไฟล์ PDF หรือ credentials ลง repository
