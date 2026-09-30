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

ไดรเวอร์ local ที่เขียนลง `./uploads` ใช้ได้สำหรับ local development เท่านั้น เพราะ filesystem ของ Vercel เป็น ephemeral และไฟล์อาจหายเมื่อ instance เปลี่ยนหรือ redeploy

ก่อนเปิดใช้งานจริงต้องเปลี่ยน `src/lib/storage.ts` ให้ใช้ object storage เช่น S3, Cloudflare R2 หรือ Supabase Storage โดย:

- เก็บเฉพาะ object key ใน `Paper.pdfUrl` ไม่เก็บไฟล์ในฐานข้อมูล
- ใช้ private bucket และให้ download route เป็นผู้ตรวจสิทธิ์ก่อนอ่านไฟล์
- เปลี่ยน `upload`, `download` และ `remove` ให้ใช้ SDK ของ provider
- เก็บ credentials ใน Vercel environment variables เท่านั้น
- พิจารณาใช้ signed URL อายุสั้นหลังตรวจสิทธิ์ หาก provider รองรับ

ห้าม commit ไฟล์ PDF หรือ credentials ลง repository
