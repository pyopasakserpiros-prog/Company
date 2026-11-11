# รายงานอัปเดตข้อเสนอธุรกิจ/โลกภายนอกและ Audit การเปิดธุรกิจ NPC

**วันที่:** 11 พฤศจิกายน 2026
**ฐาน:** main v2.0.0, HEAD ก่อนแก้ 6182e0a662bf1dfe47360e64e20e635ea07abeae
**ชนิดงาน:** วิเคราะห์ source และจัดทำเอกสารส่งต่องาน; ไม่มีการแก้ source game
**สถานะ:** พรอมต์และข้อเสนอรอผู้ใช้ส่ง ZIP ให้ Gemini

## สิ่งที่เปลี่ยน

- เพิ่ม ideas/company/34_business_depth_world_markets_and_npc_entry_audit.md สรุปจุดซ้ำ/ช่องว่างของธุรกิจ, โมเดล Primary Metals ที่ปรับข้อกำหนดความสมจริง, ตัวเลือกประเทศและตลาดใหม่, audit NPC และแนวคิดเพิ่มจาก Codex
- เพิ่ม docs/company/NEXT_PATCH_PROMPT_BUSINESS_DEPTH_WORLD_MARKETS_AND_NPC_BUGS.md เป็นพรอมต์พร้อมใช้ให้ Gemini ตรวจฐาน, แก้บั๊ก business-entry, ออกแบบธุรกิจ/สินค้า/ประเทศเพิ่มเติม, อัปเดต Master Skills และส่ง ZIP ที่ตรวจแล้ว
- ปรับ ideas index, START_HERE และทะเบียนงานเพื่อให้พบพรอมต์และแยก planned ออกจากงานที่ Gemini เริ่มทำแล้ว
- เพิ่มบั๊กที่ยืนยันแล้วใน project status เพื่อไม่ให้คำอธิบายระบบบริหาร NPC สื่อว่า live decision path ใช้งานได้ครบ

## หลักฐานและผลตรวจ

- Source catalog: 58 materials, 36 products, 8 business process models, 6 services, 8 nations/blocs และ 12 geopolitical events
- 60-day repro ด้วย seed audit-main-v200, เงินทดสอบ 500,000,000 satang และ continueEndless เมื่อชนะ: lastReviewDay = 0, decision ledger มี 60 รายการล่าสุดและทั้งหมดเป็น governance|deferred_no_executive_authority, ไม่มีสินทรัพย์เพิ่ม รถเพิ่ม หรือ service order
- Unit test product-depth-npc-board-v130.cjs ใช้ ignoreAtWork: true ตอนเรียก evaluator จึงไม่ทดสอบปัญหาเวลาจริง
- Repro เส้นทาง lease ด้วย CEO ที่ prudence ≥65 พบข้อมูลรถไม่มี leaseDepositSatang; evaluator จึงบันทึกจำนวนเงินเป็น NaN ขณะที่ acquisition ใช้ dailyLeaseCost × 5
- ตรวจ source พบค่า committed budget ถูกเพิ่มหลังการซื้อรถและนำไปหักในเงินอิสระต่อ โดยไม่พบการ release/reset ใน path ที่ตรวจ
- npm test: ผ่าน 132/132
- npm run check: ผ่าน รวม Locked Human Core SHA-256
- ไม่รัน build/browser/benchmark เพราะไม่ได้แก้ source และไม่ได้ทำ ZIP

## การแยกสถานะ

- **ยืนยันใน source/probe:** evaluator เรียกตอน gate atWork ไม่ผ่าน, ค่า lease field ไม่มี, committed amount ถูกหักจาก pool หลัง cash debit แล้ว
- **ต้องให้ Gemini ทวนด้วย test:** deadlock บริษัทเล็ก, เงินสำรอง service-entry, การเลือก service/client, cooldown ที่ไม่ถูกใช้ และรายละเอียด physical/process economics ของโลหะ
- **ยังเป็นข้อเสนอ:** ประเทศที่อาจเพิ่ม, ผลิตภัณฑ์โลหะและตัวเลขต้นทุน/ราคา, เส้นทางการค้าระดับภูมิภาค และบริการติดตั้ง/ค้าส่ง/ฝึกอบรมซึ่งมีแนวคิดค้างในบท 21 อยู่แล้ว
- ไม่มีการแก้/ลบสินค้า ระบบ หรือบั๊กใน source; ไม่มีรายการใดถูกย้ายไป status ว่า “ทำแล้ว”
- สกิลยังไม่เปลี่ยน เพราะเป็นเอกสารเตรียมงาน ไม่ใช่แพตช์ implementation; พรอมต์กำหนดให้ Gemini อัปเดต Master Skills และสกิลที่ได้รับผลกระทบเมื่อทำ patch จริง

## ขั้นตอนถัดไป

ผู้ใช้สามารถดาวน์โหลด main และส่ง ZIP ให้ Gemini โดยแนบ/อ้างพรอมต์ใหม่ เมื่อ Gemini ส่ง ZIP กลับ ผู้รับต้องตรวจฐานและ diff, ยืนยันบั๊ก, ตรวจ source และ ZIP ใหม่ก่อนรวม ไม่มีการส่งข้อความหา Gemini จาก Codex โดยตรง
