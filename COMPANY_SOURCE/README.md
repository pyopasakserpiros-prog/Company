> Runtime v3.0.0: generated phone industry with real stocks, funded R&D, campus entry and read-only phone market. See [system contracts](../docs/company/ERA3_PHONE_SYSTEM.md) and [current report](../docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.0.0.md). Old release sections below are historical. `node tools/phone-industry-soak.cjs` writes a normal/edited-input sector experiment to its output argument (default local JSON); it is not a full-campus endurance test.

# Company Simulation — วิธีเปิดและพัฒนา

รุ่นเกมบน `main`: **v2.9.0** · [สถานะและรายงานแพตช์](../project_status_and_ai_onboarding.md)

เริ่มเกมมีหน้าเลือก SME 6 ประเภทและหยุดเวลารอเลือก ทีม NPC ดำเนินงานและเรียนรู้ต่อเอง ดู [คู่มือ SME/รัฐบาล/ข่าว](../docs/company/SME_AND_CIVICS_SYSTEM.md) และ [รายงานล่าสุด](../docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md)

## เล่น

เปิด `CompanyFoundation_single.html` (หรือ `Company_single.html`) ในเบราว์เซอร์ที่อนุญาตไฟล์ในเครื่อง หรือรันในโฟลเดอร์นี้:

    python3 -m http.server 8000

จากนั้นเข้า `http://localhost:8000/index.html` เกมใช้ Canvas และไม่มีบริการภายนอกขณะเล่น ซูมด้วยปุ่ม +/−, ล้อเมาส์ หรือบีบนิ้ว ลากแผนที่เพื่อเลื่อน แตะคนหรืออาคารเพื่อดูข้อมูล แถบเลือกตัวละครมีปุ่มปิด

NPC/CEO ดำเนินกิจการเอง ผู้เล่นปรับเวลา/มุมมอง ตรวจข้อมูล เสกวัตถุดิบ และแก้ชื่อตัวละคร นิสัย ค่านิยม หรือฝึกทักษะในเมนู/แก้ไขได้ การแก้ตัวละครไม่เปลี่ยนไฟล์สูตรแกน

## สร้างและทดสอบ

ใช้ Node 20 ขึ้นไป การเล่นไฟล์ HTML ไม่ต้องติดตั้ง npm:

    npm ci
    npm run check
    npm test
    npm run build
    npx playwright install chromium
    npm run test:browser

หากมี Chromium ติดตั้งแล้ว กำหนด `CHROMIUM_PATH` แทนการดาวน์โหลด browser ได้ ตั้ง `COMPANY_SCREENSHOTS_DIR` เพื่อบันทึกภาพทดสอบ browser ชุด `test:browser` จะ build HTML ก่อนและตรวจทั้งหน้าซอร์สกับไฟล์เดี่ยวบนขนาดมือถือ/เดสก์ท็อป

`tools/build.cjs` รวม `index.html`, `css/debug.css` และ `js/` ตามลำดับใน index เป็น `CompanyFoundation_single.html` และ `Company_single.html` อย่าแก้ HTML ที่ build โดยไม่แก้ซอร์สต้นทาง

## รุ่นปัจจุบัน v2.7.0

เครื่องมือ 20 แบบ (พร้อมระบบย่อย 5 ด้าน อาการเสีย และการจัดหาซื้อใหม่/มือสอง/เช่า) กระบวนการสินค้า 42 รายการ คิวแปรรูปวัตถุดิบ 40 สูตรตามเวลาจริง (`w.plant.refineryBatches`) คลังสินค้าล็อตและโซ่ความเย็น (`w.warehouse`) ขนส่ง/บริการ B2B/ซอฟต์แวร์ตามเวลาจริง ประมูลภาครัฐแข่งขัน (`w.commerce.tenders`) การปรับ/ยุติสัญญา และวงจรชีวภาพปศุสัตว์ 180 นาที

อ่าน [คู่มือและขอบเขต](../docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [คู่มือโลกภายนอก](../docs/company/LIVING_WORLD_SYSTEM.md) และ [รายงาน v2.7.0](../docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) ก่อนพัฒนาต่อ
