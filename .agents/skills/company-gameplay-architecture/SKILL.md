---
name: company-gameplay-architecture
description: Use when changing Company simulation timing, module ownership, command boundaries, snapshots, or deterministic behavior.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — สถาปัตยกรรมและลูปจำลอง

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/sim.js: create, step, advance; js/api.js: create, view, dispatch, frame; js/economy.js; js/layout.js` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/api.test.cjs; simulation.test.cjs; core-baseline.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ให้ simulation เป็นเจ้าของเวลา state และ RNG; UI อ่าน snapshot และใช้ command boundary
- ตรวจว่าการอ่าน snapshot/วาดภาพไม่ทำให้เงิน คน เวลา หรือ RNG เปลี่ยน
- แยกเวลา simulation กับ frame และตรวจ repeatability ด้วย seed/คำสั่งเดิม
- อ่าน API/schema จริงก่อนเพิ่ม state ใหม่และกำหนดเจ้าของข้อมูลให้ชัด

## โจทย์ลองใช้หลังยกระดับ

เปิดหน้าต่างดู NPC แล้วผลจำลองเปลี่ยนแม้ไม่ได้สั่งอะไร: จะ trace การกลายพันธุ์ของ state/RNG ที่ไหน?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

Agent Skills specification; Update Method; Fix Your Timestep! — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

sim.js owns subject learning, team matrices, R&D projects, licensing and sample consumption; api.js reads companyKnowledge. Template: docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md. No Human Core changes.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.4.0 — Verified living-world integration

Load world.js after economy.js, before sim.js in index.html. sim UMD receives World dependency. updateExternalWorld calls World.step once per completedDay via simulateGlobalGeopoliticsDaily; recomputeGeopoliticalMultipliers resets base then World.apply. Repeat apply without the reset is unsupported. No wall time/RNG in UI. sim.audit includes world account audit. Historical simulateOffsiteEcosystemDaily only retains player surplus selling; world owns external company activity.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.

## Verified v2.6.0 integration

index loads world.js then plant.js before sim.js. Plant owns machine/process state, sim owns clocks/ledger/learning/job assignments; API snapshots plant/commerce/manufacturing/warehouseCapacity/warehouseUsed. P.tick before person steps, maintain reserves technician tick, labor clips at phase boundaries. Slot reservations survive passive waiting and repair. No wall time or rendering RNG.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.
