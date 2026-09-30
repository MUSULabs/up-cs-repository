import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const areaData = [
  ["ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง", "Artificial Intelligence and Machine Learning", "ai-machine-learning"],
  ["การพัฒนาเว็บและแอปพลิเคชัน", "Web and Application Development", "web-application-development"],
  ["เครือข่ายและความมั่นคงปลอดภัย", "Networking and Cybersecurity", "networking-cybersecurity"],
  ["วิทยาการข้อมูลและการวิเคราะห์", "Data Science and Analytics", "data-science-analytics"],
  ["เกมและสื่อผสม", "Game and Multimedia", "game-multimedia"],
  ["IoT และระบบฝังตัว", "IoT and Embedded Systems", "iot-embedded-systems"],
  ["วิศวกรรมซอฟต์แวร์", "Software Engineering", "software-engineering"],
  ["คอมพิวเตอร์กราฟิกส์และการประมวลผลภาพ", "Computer Graphics and Image Processing", "computer-graphics-image-processing"],
] as const;

const advisorData = [
  ["ผศ.ดร.", "กิตติศักดิ์", "วงศ์คำ", "Kittisak", "Wongkham"],
  ["ผศ.ดร.", "ณัฐวุฒิ", "ศรีสวัสดิ์", "Nattawut", "Srisawat"],
  ["ดร.", "ปาริชาติ", "ไชยวงศ์", "Parichat", "Chaiwong"],
  ["อาจารย์", "ธนกฤต", "อินต๊ะ", "Thanakrit", "Inta"],
  ["ผศ.ดร.", "สุภาวดี", "บุญมี", "Supawadee", "Boonmee"],
  ["ดร.", "วรพล", "แก้วคำ", "Woraphon", "Kaewkham"],
  ["อาจารย์", "ชลธิชา", "ธรรมวงศ์", "Chonthicha", "Thammawong"],
  ["ผศ.ดร.", "พงศกร", "คำลือ", "Phongsakorn", "Kamlue"],
  ["ดร.", "อรทัย", "มูลเมือง", "Orathai", "Munmueang"],
  ["อาจารย์", "ศุภชัย", "รัตนไพศาล", "Supachai", "Rattanapaisan"],
] as const;

type TechnologyCategory = "LANGUAGE" | "FRAMEWORK" | "DATABASE" | "TOOL" | "OTHER";

const technologyData: Array<[string, string, TechnologyCategory]> = [
  ["Python", "python", "LANGUAGE"], ["TypeScript", "typescript", "LANGUAGE"],
  ["JavaScript", "javascript", "LANGUAGE"], ["Java", "java", "LANGUAGE"],
  ["C#", "csharp", "LANGUAGE"], ["Dart", "dart", "LANGUAGE"],
  ["PHP", "php", "LANGUAGE"], ["SQL", "sql", "LANGUAGE"],
  ["React", "react", "FRAMEWORK"], ["Next.js", "nextjs", "FRAMEWORK"],
  ["Flutter", "flutter", "FRAMEWORK"], ["Laravel", "laravel", "FRAMEWORK"],
  ["Django", "django", "FRAMEWORK"], ["FastAPI", "fastapi", "FRAMEWORK"],
  ["Node.js", "nodejs", "FRAMEWORK"], ["TensorFlow", "tensorflow", "FRAMEWORK"],
  ["YOLOv8", "yolov8", "FRAMEWORK"], ["OpenCV", "opencv", "FRAMEWORK"],
  ["PostgreSQL", "postgresql", "DATABASE"], ["MySQL", "mysql", "DATABASE"],
  ["MongoDB", "mongodb", "DATABASE"], ["Firebase", "firebase", "DATABASE"],
  ["Redis", "redis", "DATABASE"], ["Prisma ORM", "prisma-orm", "TOOL"],
  ["Docker", "docker", "TOOL"], ["GitHub Actions", "github-actions", "TOOL"],
  ["Figma", "figma", "TOOL"], ["Jupyter Notebook", "jupyter-notebook", "TOOL"],
  ["Raspberry Pi", "raspberry-pi", "TOOL"], ["Arduino", "arduino", "TOOL"],
];

const authorData = [
  ["ณัฐดนัย", "ใจดี", "Nattadanai", "Jaidee"], ["พิมพ์ชนก", "แก้วมา", "Pimchanok", "Kaewma"],
  ["ธนภัทร", "วงศ์ใหญ่", "Thanaphat", "Wongyai"], ["กัญญารัตน์", "ไชยลังกา", "Kanyarat", "Chailangka"],
  ["ศุภวิชญ์", "อินต๊ะ", "Suphawit", "Inta"], ["ชญานิศ", "คำปัน", "Chayanit", "Khampan"],
  ["ภัทรพล", "เมืองใจ", "Phattharaphon", "Mueangjai"], ["ณิชาภา", "ศรีคำ", "Nichapa", "Srikham"],
  ["กิตติพงษ์", "บุญเรือง", "Kittiphong", "Boonrueang"], ["สุชาดา", "แสงแก้ว", "Suchada", "Saengkaew"],
  ["วรเมธ", "พรมมา", "Woramet", "Phromma"], ["ปวีณา", "ถาแก้ว", "Paweena", "Thakaew"],
] as const;

const keywordData = [
  ["การเรียนรู้เชิงลึก", "Deep Learning", "deep-learning"], ["ปัญญาประดิษฐ์", "Artificial Intelligence", "artificial-intelligence"],
  ["การจำแนกภาพ", "Image Classification", "image-classification"], ["แอปพลิเคชันบนมือถือ", "Mobile Application", "mobile-application"],
  ["ระบบสารสนเทศ", "Information System", "information-system"], ["การท่องเที่ยว", "Tourism", "tourism"],
  ["การเกษตรอัจฉริยะ", "Smart Agriculture", "smart-agriculture"], ["ความมั่นคงปลอดภัยไซเบอร์", "Cybersecurity", "cybersecurity"],
  ["อินเทอร์เน็ตของสรรพสิ่ง", "Internet of Things", "internet-of-things"], ["วิทยาการข้อมูล", "Data Science", "data-science"],
  ["การวิเคราะห์ข้อมูล", "Data Analytics", "data-analytics"], ["การศึกษาออนไลน์", "Online Education", "online-education"],
  ["เกมเพื่อการเรียนรู้", "Educational Game", "educational-game"], ["พาณิชย์อิเล็กทรอนิกส์", "E-commerce", "e-commerce"],
  ["การประมวลผลภาษา", "Natural Language Processing", "natural-language-processing"], ["การตรวจจับวัตถุ", "Object Detection", "object-detection"],
  ["คลาวด์คอมพิวติง", "Cloud Computing", "cloud-computing"], ["ประสบการณ์ผู้ใช้", "User Experience", "user-experience"],
  ["ฐานข้อมูล", "Database", "database"], ["การทดสอบซอฟต์แวร์", "Software Testing", "software-testing"],
] as const;

const paperData = [
  ["ระบบจำแนกโรคใบข้าวด้วยการเรียนรู้เชิงลึก", "Rice Leaf Disease Classification System Using Deep Learning", 0],
  ["แอปพลิเคชันจองห้องเรียนออนไลน์คณะเทคโนโลยีสารสนเทศและการสื่อสาร", "Online Classroom Reservation Application for the School of Information and Communication Technology", 1],
  ["ระบบแนะนำเส้นทางท่องเที่ยวเชิงวัฒนธรรมในจังหวัดพะเยา", "Cultural Tourism Route Recommendation System in Phayao Province", 2],
  ["การพยากรณ์ปริมาณน้ำในกว๊านพะเยาด้วยแบบจำลองการเรียนรู้ของเครื่อง", "Machine Learning Model for Forecasting Water Volume in Phayao Lake", 3],
  ["เกมส่งเสริมการเรียนรู้คำศัพท์ภาษาอังกฤษสำหรับนักเรียนประถมศึกษา", "An English Vocabulary Learning Game for Primary School Students", 4],
  ["ระบบตรวจวัดคุณภาพอากาศผ่านอินเทอร์เน็ตของสรรพสิ่ง", "IoT-Based Air Quality Monitoring System", 5],
  ["ระบบจัดการโครงงานภาคนิพนธ์สำหรับสาขาวิชาวิทยาการคอมพิวเตอร์", "Senior Project Management System for the Computer Science Program", 6],
  ["ระบบตรวจจับหมวกนิรภัยสำหรับผู้ขับขี่รถจักรยานยนต์", "Helmet Detection System for Motorcycle Riders", 7],
  ["ระบบคัดแยกขยะด้วยการตรวจจับวัตถุจากภาพ", "Image-Based Waste Sorting System Using Object Detection", 0],
  ["แพลตฟอร์มตลาดสินค้าเกษตรอินทรีย์ของชุมชนจังหวัดพะเยา", "Organic Agricultural Marketplace Platform for Phayao Communities", 1],
  ["ระบบเฝ้าระวังการบุกรุกเครือข่ายสำหรับห้องปฏิบัติการ", "Network Intrusion Monitoring System for Computer Laboratories", 2],
  ["แดชบอร์ดวิเคราะห์ข้อมูลการใช้บริการห้องสมุดมหาวิทยาลัย", "University Library Service Usage Analytics Dashboard", 3],
  ["เกมจำลองการจัดการฟาร์มอัจฉริยะบนอุปกรณ์เคลื่อนที่", "Mobile Game Simulating Smart Farm Management", 4],
  ["ระบบรดน้ำต้นไม้อัตโนมัติสำหรับแปลงเกษตรขนาดเล็ก", "Automatic Plant Watering System for Small Agricultural Plots", 5],
  ["การออกแบบและพัฒนาระบบติดตามงานแบบอไจล์", "Design and Development of an Agile Task Tracking System", 6],
  ["การสร้างภาพสามมิติของโบราณสถานในจังหวัดพะเยา", "3D Reconstruction of Historical Sites in Phayao Province", 7],
  ["ระบบวิเคราะห์อารมณ์จากความคิดเห็นของผู้ใช้บริการร้านอาหาร", "Sentiment Analysis System for Restaurant Customer Reviews", 0],
  ["เว็บแอปพลิเคชันจัดการคลินิกสุขภาพชุมชน", "Web Application for Community Health Clinic Management", 1],
  ["ระบบยืนยันตัวตนแบบหลายปัจจัยสำหรับระบบสารสนเทศภายใน", "Multi-Factor Authentication System for Internal Information Systems", 2],
  ["การพยากรณ์จำนวนนักท่องเที่ยวจังหวัดพะเยาจากข้อมูลอนุกรมเวลา", "Time-Series Forecasting of Tourist Arrivals in Phayao Province", 3],
  ["เกมตอบคำถามความรู้ท้องถิ่นจังหวัดพะเยา", "Phayao Local Knowledge Quiz Game", 4],
  ["ระบบติดตามอุณหภูมิและความชื้นในโรงเรือนเพาะเห็ด", "Temperature and Humidity Monitoring System for Mushroom Houses", 5],
  ["ระบบแจ้งซ่อมอุปกรณ์คอมพิวเตอร์ภายในมหาวิทยาลัย", "University Computer Equipment Maintenance Request System", 6],
  ["การรู้จำใบหน้าสำหรับบันทึกเวลาเข้าเรียน", "Face Recognition for Classroom Attendance Recording", 7],
  ["ระบบค้นหาเอกสารภาคนิพนธ์ด้วยการประมวลผลภาษาธรรมชาติ", "Senior Project Document Search System Using Natural Language Processing", 0],
  ["แอปพลิเคชันติดตามการรับประทานยาสำหรับผู้สูงอายุ", "Medication Adherence Tracking Application for Older Adults", 1],
  ["ระบบตรวจสอบความปลอดภัยของรหัสผ่านสำหรับองค์กรขนาดเล็ก", "Password Security Assessment System for Small Organizations", 2],
  ["การแบ่งกลุ่มนักศึกษาตามรูปแบบการเรียนรู้ด้วยวิทยาการข้อมูล", "Student Clustering by Learning Patterns Using Data Science", 3],
  ["เกมการเรียนรู้การคัดแยกขยะสำหรับเด็กปฐมวัย", "Waste Sorting Educational Game for Preschool Children", 4],
  ["ระบบควบคุมโรงเรือนอัจฉริยะด้วยไมโครคอนโทรลเลอร์", "Smart Greenhouse Control System Using a Microcontroller", 5],
  ["ระบบติดตามและประเมินผลการฝึกงานของนักศึกษา", "Student Internship Tracking and Evaluation System", 6],
  ["การปรับปรุงภาพถ่ายเอกสารเก่าด้วยการประมวลผลภาพ", "Old Document Photograph Enhancement Using Image Processing", 7],
  ["ระบบแนะนำเมนูอาหารจากวัตถุดิบที่มีอยู่ในครัว", "Recipe Recommendation System Based on Available Kitchen Ingredients", 0],
  ["ระบบจองรถรับส่งนักศึกษาภายในมหาวิทยาลัย", "University Student Shuttle Booking System", 1],
  ["ระบบตรวจจับการโจมตีแบบฟิชชิงจากอีเมลภาษาไทย", "Thai Email Phishing Attack Detection System", 2],
  ["การวิเคราะห์ปัจจัยที่ส่งผลต่อผลการเรียนของนักศึกษา", "Analysis of Factors Affecting Student Academic Performance", 3],
  ["เกมผจญภัยส่งเสริมการท่องเที่ยวชุมชน", "Adventure Game Promoting Community Tourism", 4],
  ["อุปกรณ์แจ้งเตือนการล้มสำหรับผู้สูงอายุ", "Fall Detection and Alert Device for Older Adults", 5],
  ["ระบบจัดการเวอร์ชันและเอกสารความต้องการซอฟต์แวร์", "Software Requirements and Version Documentation Management System", 6],
  ["ระบบจำแนกชนิดดอกไม้ท้องถิ่นจากภาพถ่าย", "Local Flower Species Classification System from Photographs", 7],
] as const;

const areaKeywords = [
  [0, 1, 2, 15], [3, 4, 8, 18], [7, 16, 18, 19], [9, 10, 11, 16],
  [12, 13, 14], [6, 8, 9, 16], [4, 18, 19], [2, 15, 16],
] as const;

const areaTechnologies = [
  [0, 1, 15, 16, 17], [1, 2, 8, 9, 10], [0, 1, 24, 25], [0, 7, 27, 28],
  [1, 2, 8, 26], [0, 5, 28, 29], [1, 8, 9, 23, 25], [0, 15, 17, 26],
] as const;

function slugifyTitle(title: string, index: number) {
  return `paper-${index + 1}-${title.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}`;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before running the seed.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.downloadLog.deleteMany();
    await tx.paperAuthor.deleteMany();
    await tx.paperAdvisor.deleteMany();
    await tx.paperKeyword.deleteMany();
    await tx.paperTech.deleteMany();
    await tx.paper.deleteMany();
    await tx.account.deleteMany();
    await tx.session.deleteMany();
    await tx.verificationToken.deleteMany();
    await tx.user.deleteMany();
    await tx.author.deleteMany();
    await tx.advisor.deleteMany();
    await tx.keyword.deleteMany();
    await tx.technology.deleteMany();
    await tx.researchArea.deleteMany();

    const adminHash = await bcrypt.hash(adminPassword, 12);
    const demoHash = await bcrypt.hash("Demo1234!", 12);
    await tx.user.createMany({
      data: [
        { email: adminEmail, name: "ผู้ดูแลระบบ", passwordHash: adminHash, role: "ADMIN", emailVerified: new Date() },
        { email: "dept-member@up.ac.th", name: "สมาชิกภาควิชา", passwordHash: demoHash, role: "DEPT_MEMBER", emailVerified: new Date() },
        { email: "viewer@example.com", name: "ผู้ชมตัวอย่าง", passwordHash: demoHash, role: "VIEWER", emailVerified: new Date() },
      ],
    });

    const areas = await Promise.all(areaData.map(([nameTh, nameEn, slug]) =>
      tx.researchArea.create({ data: { nameTh, nameEn, slug } }),
    ));
    const advisors = await Promise.all(advisorData.map(([titleName, firstNameTh, lastNameTh, firstNameEn, lastNameEn]) =>
      tx.advisor.create({ data: { titleName, firstNameTh, lastNameTh, firstNameEn, lastNameEn } }),
    ));
    const technologies = await Promise.all(technologyData.map(([name, slug, category]) =>
      tx.technology.create({ data: { name, slug, category } }),
    ));
    const keywords = await Promise.all(keywordData.map(([nameTh, nameEn, slug]) =>
      tx.keyword.create({ data: { nameTh, nameEn, slug } }),
    ));
    const authors = await Promise.all(authorData.map(([firstNameTh, lastNameTh, firstNameEn, lastNameEn], index) =>
      tx.author.create({
        data: {
          firstNameTh, lastNameTh, firstNameEn, lastNameEn,
          studentId: `CS${String(6301001 + index).padStart(7, "0")}`,
        },
      }),
    ));

    for (const [index, [titleTh, titleEn, areaIndex]] of paperData.entries()) {
      const year = index >= 34 ? (index % 2 === 0 ? 2563 : 2564) : 2563 + (index % 5);
      const accessLevel = index < 24 ? "PUBLIC" : index < 34 ? "AUTHENTICATED" : "DEPT_ONLY";
      const keywordIds = areaKeywords[areaIndex].slice(0, 3 + (index % 3));
      const technologyIds = areaTechnologies[areaIndex].slice(0, 2 + (index % 4));
      const paper = await tx.paper.create({
        data: {
          slug: slugifyTitle(titleTh, index),
          titleTh,
          titleEn,
          abstractTh: `${titleTh} เป็นโครงงานภาคนิพนธ์ที่พัฒนาขึ้นเพื่อสนับสนุนการใช้งานจริงในบริบทของมหาวิทยาลัยและชุมชนจังหวัดพะเยา งานวิจัยนี้ออกแบบกระบวนการเก็บรวบรวมข้อมูลและพัฒนาระบบโดยใช้เทคโนโลยีที่เหมาะสมกับผู้ใช้งาน ผลการทดลองแสดงให้เห็นว่าระบบสามารถทำงานได้ตามวัตถุประสงค์และช่วยลดขั้นตอนการดำเนินงานเดิมได้ การประเมินจากผู้ใช้ให้ข้อมูลสำหรับปรับปรุงระบบในอนาคต`,
          abstractEn: `This senior project presents ${titleEn.toLowerCase()} for practical use in a university and community context in Phayao. The system was designed with a data collection process and technologies appropriate for its target users. Experimental results show that the system meets its objectives and reduces the effort required by the previous workflow. User evaluation also provides directions for future improvement.`,
          academicYear: year,
          semester: index % 2 === 0 ? 1 : 2,
          accessLevel,
          viewCount: 35 + ((index * 137) % 920),
          downloadCount: accessLevel === "PUBLIC" ? 8 + ((index * 17) % 130) : accessLevel === "AUTHENTICATED" ? 4 + ((index * 11) % 65) : 1 + (index % 15),
          researchAreaId: areas[areaIndex].id,
          authors: {
            create: [0, 1, 2].slice(0, 1 + (index % 3)).map((offset, authorOrder) => ({
              authorId: authors[(index + offset) % authors.length].id,
              authorOrder,
            })),
          },
          advisors: {
            create: [
              { advisorId: advisors[index % advisors.length].id, role: "MAIN" },
              ...(index % 3 === 0 ? [{ advisorId: advisors[(index + 3) % advisors.length].id, role: "CO" as const }] : []),
            ],
          },
          keywords: { create: keywordIds.map((keywordId) => ({ keywordId: keywords[keywordId].id })) },
          technologies: { create: technologyIds.map((technologyId) => ({ technologyId: technologies[technologyId].id })) },
        },
      });
      if (paper.id === "") throw new Error("Unexpected empty paper id");
    }
  }, { timeout: 120_000 });

  console.log(`Seeded 3 users, ${areaData.length} research areas, ${advisorData.length} advisors, ${paperData.length} papers.`);
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
