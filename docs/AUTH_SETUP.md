# การตั้งค่า Auth.js v5

## 1. สร้าง Google OAuth Client

1. เปิด [Google Cloud Console](https://console.cloud.google.com/) และเลือกหรือสร้าง Project
2. ไปที่ **APIs & Services → OAuth consent screen** แล้วตั้งค่าแอป
3. กำหนดประเภทผู้ใช้ตามนโยบายของมหาวิทยาลัย และเพิ่มขอบเขต `openid`, `email` และ `profile`
4. ไปที่ **APIs & Services → Credentials → Create credentials → OAuth client ID**
5. เลือก **Web application**
6. ตั้งค่า Authorized JavaScript origins:
   - `http://localhost:3000`
   - โดเมน production เช่น `https://research.example.ac.th`
7. ตั้งค่า Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://research.example.ac.th/api/auth/callback/google`
8. คัดลอก Client ID และ Client Secret ไปยังตัวแปรสภาพแวดล้อม

## 2. ตัวแปรสภาพแวดล้อม

ตั้งค่าใน `.env.local` สำหรับเครื่องพัฒนา และในระบบ deployment สำหรับ production:

```env
AUTH_SECRET=สุ่มค่าลับที่ยาวและคาดเดาไม่ได้
AUTH_GOOGLE_ID=Google_Client_ID
AUTH_GOOGLE_SECRET=Google_Client_Secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=รหัสผ่านเริ่มต้นของผู้ดูแล
```

`DATABASE_URL` ต้องชี้ไปยัง PostgreSQL เดียวกับ Prisma หากใช้ credentials
ผู้ดูแลระบบต้องมีบัญชีที่มี `role = ADMIN` และมี `passwordHash` ที่สร้างด้วย
bcrypt (สคริปต์ seed จะสร้างบัญชีจาก `ADMIN_EMAIL` และ `ADMIN_PASSWORD`)

## 3. นโยบายบัญชี Google

ระบบรับเฉพาะบัญชีที่ลงท้ายด้วย `@up.ac.th` เท่านั้น บัญชี Google ที่ผ่านการตรวจสอบ
จะถูกกำหนดบทบาทเป็น `DEPT_MEMBER` โดยอัตโนมัติ บัญชีอื่นจะถูกปฏิเสธพร้อมข้อความ
แจ้งเตือนบนหน้าล็อกอิน

## 4. ตรวจสอบการตั้งค่า

```bash
npm run dev
```

เปิด `http://localhost:3000/login` แล้วทดสอบทั้ง Google OAuth และส่วนเข้าสู่ระบบ
ผู้ดูแลระบบ หากแก้ callback URL หรือเปลี่ยนโดเมน ต้องลงทะเบียน URI ให้ตรงกับ
ที่อยู่จริงทุกตัวอักษร
