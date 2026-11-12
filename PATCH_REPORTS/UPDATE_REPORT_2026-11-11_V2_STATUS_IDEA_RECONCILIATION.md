# รายงานอัปเดตเอกสาร — สถานะ v2.0.0 และการย้าย ideas ที่ทำแล้ว

- **ฐาน source:** `main` commit `06ee226d2592dfc106f94bedd347b3a014fe1659`, เกม `D.RELEASE_VERSION = 2.0.0`
- **ขอบเขต:** ตรวจ source/report/test ล่าสุด แล้วปรับสถานะ/ดัชนีและคลัง ideas; ไม่แก้ logic เกม
- **สิ่งที่เปลี่ยน:** สรุประบบปัจจุบันและประวัติรายงานทุกแพตช์ใน `project_status_and_ai_onboarding.md`; เปลี่ยน `START_HERE_FOR_AI.md` ให้เป็นทางเข้า; ทำสำเนาสถานะใน COMPANY_SOURCE เป็นลิงก์ไปเอกสารหลัก; แก้ทะเบียนงานให้ v1.3/v2.0 เป็น integrated; เพิ่มรายงาน v1.3/v2.0 ในดัชนี; อัปเดตดัชนีสกิลและ Master Skills พร้อมสำเนาระดับ root ให้ตรงกับ source; ปรับแหล่งอ้างอิง/เทสต์ของ 4 starter skills ที่เกี่ยวข้องโดยคง maturity เป็น `starter-draft`
- **Ideas ที่ย้าย/ตัด:** ย้ายแกนธุรกิจขนส่ง/ซอฟต์แวร์/8 process models/วัตถุดิบใหม่ 7/สินค้าใหม่ 8/บอร์ดลงทุน/บริการ B2B/ภูมิรัฐศาสตร์ไปสถานะ; ลบเอกสาร 23, 24 และ 33 ที่เนื้อหาสมบูรณ์หรือย้ายเป็นกฎถาวรแล้ว; บท 28 เหลือ 88 รายการ, บท 30 ตัด/รวม 13 แถวเหลือ 47; บท 19–21 และ 29/31/32 เหลือส่วนต่อยอดที่ยังเป็นข้อเสนอ
- **สิ่งเสร็จ/บางส่วน/คงไว้:** core ของรุ่น v1.2/v1.3/v2.0 ยืนยันจาก source และ tests; ไอเดียเก่าบท 1–18 และ 25–27 คงไว้เพราะเป็นเอกสารผสมส่วนที่ทำแล้วบางส่วนกับข้อเสนอที่ยังไม่ทำครบ ไม่จัดทั้งบทว่าเสร็จโดยไม่มีหลักฐานรายข้อ
- **ข้อจำกัด:** รายงาน v2.0.0 ระบุการซิงก์ Master Skills ในแอป Gemini แต่ตรวจยืนยันจาก repo นี้ไม่ได้; benchmark 500 NPC เป็นผลในรายงาน v2.0.0 ไม่ได้รันซ้ำในงานเอกสารนี้
- **ผลตรวจใน checkout ระหว่าง reconciliation (source code unchanged):** `npm test` 132/132; `npm run check` ผ่าน; `npm run build` ผ่าน (1,294,182 UTF-8 bytes); `npm run test:browser` 6/6
- **ไม่มีการเปลี่ยนแปลง:** game logic, save behavior, assets หรือ Human Core; SHA-256 ของ Human Core คง `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
- **เอกสารหลัก:** [project status](../../../project_status_and_ai_onboarding.md), [ideas index](../../../ideas/company/README.md), [patch report index](README.md)
