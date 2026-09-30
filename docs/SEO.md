# SEO และการเผยแพร่สู่สาธารณะ

ระบบสร้าง metadata สำหรับ Highwire Press (`citation_*`), Dublin Core, JSON-LD แบบ `ScholarlyArticle`, `sitemap.xml` และ `robots.txt` โดยจะนำเสนอเฉพาะภาคนิพนธ์ที่มีสถานะ `PUBLISHED` และระดับการเข้าถึง `PUBLIC` เท่านั้น รายการที่ต้องเข้าสู่ระบบหรือจำกัดเฉพาะภาควิชาจะไม่ถูกใส่ใน sitemap, structured data หรือ citation metadata

## Google Search Console

1. เข้า [Google Search Console](https://search.google.com/search-console) และเพิ่ม property ของโดเมนจริง
2. ยืนยันความเป็นเจ้าของด้วย DNS หรือวิธี HTML ที่ Google แนะนำ
3. เปิด URL `https://โดเมนของคุณ/sitemap.xml` เพื่อตรวจสอบว่า sitemap ใช้งานได้
4. ในเมนู **Sitemaps** ส่งค่า `sitemap.xml`
5. ใช้ **URL inspection** ตรวจหน้าแรกและหน้าภาคนิพนธ์ PUBLIC ที่ต้องการให้จัดทำดัชนี แล้วกดขอจัดทำดัชนีเมื่อเหมาะสม
6. ตรวจรายงาน Pages และ Enhancements หลังจาก Google เก็บข้อมูลแล้ว หากแก้ metadata หรือเนื้อหา ควรรอให้ crawler เข้ามาอ่านใหม่แทนการส่งซ้ำจำนวนมาก

ควรตั้ง `NEXTAUTH_URL` เป็น URL production ที่ถูกต้อง เพราะระบบใช้ค่านี้สร้าง canonical URL, sitemap และลิงก์ structured data หากแอปอยู่หลัง proxy หรือใช้โดเมนอื่นสำหรับเว็บไซต์ ให้ตั้ง `SITE_URL` เป็น URL สาธารณะนั้น

## Google Scholar

Google Scholar ไม่รับประกันการนำเข้าจากการลงทะเบียนเพียงครั้งเดียว ระบบต้องทำให้หน้าเอกสารแต่ละรายการเข้าถึงได้โดยไม่ต้องล็อกอิน และมี metadata ที่สื่อความหมาย เช่น `citation_title`, `citation_author`, `citation_publication_date`, `citation_pdf_url` และ Dublin Core ตามที่ระบบสร้างให้กับ PUBLIC papers

เพื่อให้มีโอกาสถูกเก็บข้อมูล:

- ใช้ URL ถาวรที่ไม่เปลี่ยน และให้หน้า detail แสดงชื่อเรื่อง ผู้เขียน บทคัดย่อ ปี และข้อมูลสถาบันอย่างชัดเจน
- ให้ไฟล์ PDF ของ PUBLIC paper อ่านได้โดย crawler ผ่าน URL ที่เข้าถึงได้จริง และภายใน PDF ควรมี title page พร้อมชื่อเรื่องและผู้เขียน
- หลีกเลี่ยงการบังคับ login, interstitial หรือ JavaScript-only content สำหรับ paper ที่ต้องการให้ Scholar อ่าน
- ตรวจว่า `robots.txt` ไม่บล็อกหน้า paper PUBLIC หรือไฟล์ PDF สาธารณะ
- ไม่ใส่ข้อมูลส่วนบุคคลที่ไม่ควรเผยแพร่ เช่น student ID หรืออีเมลผู้เขียน

Citation metadata ไม่ได้ทำให้ Google Scholar รับรองหรือจัดอันดับเอกสารโดยอัตโนมัติ การจัดทำดัชนีขึ้นกับคุณภาพหน้าเว็บ ความสามารถในการเข้าถึง และนโยบายการเก็บข้อมูลของ Google Scholar
