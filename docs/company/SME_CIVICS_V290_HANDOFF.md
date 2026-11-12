# รับช่วง v2.9.0 — SME / civics / informed NPCs

ฐาน Agy `f7167e2315e2d11a7bc8f979c17d4469617c5920` / v2.8.0; ผู้ใช้ให้ Codex ตรวจและพัฒนาต่อ รุ่นส่งมอบ v2.9.0 อ่าน AGENTS ฉบับจริง → project status → ทะเบียนงาน → Master Skills ก่อนเริ่มเสมอ

อ่าน [คู่มือ](SME_AND_CIVICS_SYSTEM.md), [รายงาน](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md), [หลักฐาน](validation/v290/sme-30day-results.json) และ source/tests ไม่ใช้ข้อความว่าเสร็จแทนการตรวจจริง งาน Agy v2.8.0 ถูกเก็บไว้ ไม่ใช่งานต้องทำซ้ำ

เปิด `Company_single.html` หรือ `COMPANY_SOURCE/index.html` ผ่าน local server จะมีหน้าเลือก SME 6 แบบ เวลาไม่เดินจนกว่าจะเลือก ดูทุนที่บริษัท → ภาพรวม, วิชา/โครงการที่องค์ความรู้, ผู้นำ/กระทรวงที่โลก → ประเทศ, ข่าวเฉพาะตัวที่ตัวละคร → ข่าวที่รับรู้

สร้างใหม่ผ่าน API: `S.create(seed,{autonomous:true,startingBusiness:'food_kitchen'})` หรือ `'bakery'/'cable_workshop'/'metal_workshop'/'software_agency'/'repair_service'`. ไม่ระบุ origin คือสถานการณ์ legacy สำหรับเทสต์ ไม่ใช่จุดเริ่ม SME หน้าเกม ไม่เพิ่ม migration/ลบเซฟผู้ใช้โดยพลการ

Verification from `COMPANY_SOURCE`:

    npm test
    npm run check
    npm run test:browser
    node tools/sme-soak.cjs
    node tools/benchmark.cjs

ชุดใหม่13กรณีใน `test/sme-civics-v290.test.cjs`; browser14กรณีรวม source/standalone/มือถือ. Script soak จำลอง12โลก×30วัน ตรวจบัญชีและเซฟทุกวัน ส่งJSONไปstdout. ดู log ใน validation/v290 (Node24.22.1/Linux/Chromium), ไม่ใช่ผลเล่นจริงบนมือถือผู้ใช้

## ขอบเขตที่ยังต้องลงลึก

ยังไม่ได้ตรวจสมจริงทุก42ผลิตภัณฑ์แบบmass/energy/yieldรายขั้น ไม่ได้เพิ่มประเทศใหม่ ภายนอกยังเป็นกิจการรวม รัฐบาล/ผู้นำสมมติและกลุ่มเศรษฐกิจไม่ใช่กฎหมายรัฐสภาจริง สงครามเป็นเศรษฐกิจ ไม่มีหน่วยรบ/ผู้เสียชีวิต สกุลสินค้าใช้กลุ่มIDไม่ใช่HS code; auto ministryยังเลือกtariff/waiverเป็นหลัก. SMEเช่าพื้นที่จริงแต่ผังแคมปัสยังใช้สิ่งอำนวยความสะดวกร่วม ไม่แยกสิทธิผู้เช่าครบ ซอฟต์แวร์ effort/allocated labor ยังมีค่าประมาณเดิม รายการต่อยอดอยู่ [ideas38](../../ideas/company/38_sme_civics_followups.md)

## Ready-to-use review brief (proposal, not an automatically started patch)

Review Company v2.9.0 against its actual source. Preserve Agy's v2.8 autonomy/crisis/life systems, the immutable Human Core and AGENTS. Focus on product-specific process/yield/capacity realism and project scope/labor estimates before adding labels. Trace every change from qualified people, inputs/equipment/time and market/counterparty capacity to real inventories/payments and NPC decisions. Keep SME beginnings small; no money-only technology, free customers or instant software completion. Origin is a preference, never a knowledge lock. Build your own creative solutions where they improve the player's observational experience; explain tradeoffs and limitations. Update affected repo skills/master copies/status/docs/report together. If working in Gemini app, update its two app skills too, and return a complete source/build/docs ZIP verified after fresh extraction. Do not say all systems are realistic just because tests pass.

สองสกิลภายในแอป Gemini ยังต้องให้ผู้ทำงานในแอปอัปเดตเอง การอัปเดตไฟล์ใน repo ครั้งนี้ไม่ได้ยืนยันปลายทางนั้น
