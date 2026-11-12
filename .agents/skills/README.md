# Company Simulation — AI Skills

สกิลเหล่านี้ใช้กับ `COMPANY_SOURCE/` ของเกม Siam Enterprise / Company Simulation โดยเฉพาะ ตรวจ source และ [project status](../../project_status_and_ai_onboarding.md) ทุกครั้งก่อนอ้างพฤติกรรมหรือเวอร์ชัน

## สกิลหลัก (ซิงก์ถึงรุ่น v2.9.0)

- [`company-evolution-dev/SKILL.md`](company-evolution-dev/SKILL.md) — Master Skill ภาพรวมสถาปัตยกรรมและระบบที่ตรวจถึง **v2.9.0 (`sme-origins-civics-informed-decisions-v290`)**; สำเนาระดับ root คือ [`SKILL.md`](../../SKILL.md), [`SKILL_COMPANY_EVOLUTION_DEV.md`](../../SKILL_COMPANY_EVOLUTION_DEV.md), และ [`SKILL_COMPANY_FOR_EVERY_PATCH.md`](../../SKILL_COMPANY_FOR_EVERY_PATCH.md) สำหรับการส่งต่อไฟล์
- [`company-for-every-patch/SKILL.md`](company-for-every-patch/SKILL.md) — Evergreen workflow ก่อน/หลังแพตช์และรายการตรวจความสมจริงเชิงกระบวนการ สถานการณ์วิกฤต การติดตามผล และความลึกชีวิต NPC ถึง **v2.9.0**

## สกิลเฉพาะด้าน

สกิล 14 รายการด้านล่างมี metadata `maturity: starter-draft` พร้อมบันทึกการเชื่อมระบบจริงถึง **v2.9.0**:

- `company-npc-life-and-behavior` — ชีวิตและพฤติกรรม NPC (`p.aspiration`, `p.memories`, ความเชื่อใจ/ความขัดแย้ง `w.culture.conflicts`, การย้ายสายงานภายใน, ข้อเสนอรั้่งตัวก่อนลาออก, Spin-off ที่มีชีวิตใน `w.externalWorld.living.firms`)
- `company-workforce-and-careers` — กำลังคน อาชีพ และการเติบโต (`evaluateAutonomousHiring` คัดผู้เชี่ยวชาญรายวิชา, `evaluateInternalCareerSwitch`, `evaluateEmployeeRetention`)
- `company-executive-business-decisions` — การลงทุน/ตัดสินใจผู้บริหาร (`evaluateOperationalCrisesAndBottlenecks`, `contractOemMaintenance`, `runCounterfactualComparison`, การเจรจาลดขนาดสัญญาและลดราคาสินค้าค้างคลัง)
- `company-economy-and-accounting` — เงินและบัญชี
- `company-supply-chain-and-resources` — วัตถุดิบและซัพพลายเชน (`w.plant.refineryBatches`, วงจรชีวภาพ 180 นาที, `unreservePartForRepair`)
- `company-production-and-services` — การผลิต เครื่องจักร 20 ชนิด บริการ B2B 10 แบบ และซอฟต์แวร์/QA/SLA
- `company-campus-and-logistics` — นิคม อาคาร คลังสินค้าล็อต/โซ่ความเย็น (`w.warehouse`) และกองรถขนส่งตามเวลาจริง
- `company-world-and-markets` — โลกภายนอก ตลาด การประมูลภาครัฐแข่งขัน (`w.commerce.tenders`) และบัญชีต้นทุนขาย/กำไรเกณฑ์คงค้าง
- `company-edit-hub-and-observability` — Edit Hub และการสังเกตผล (`S.buildObservabilityView`, `w.watchlist`, แท็บ `🔍 ติดตามสด / คอขวด`)
- `company-gameplay-architecture` — สถาปัตยกรรมเกม
- `company-data-integrity` — ความถูกต้องของข้อมูล
- `company-save-system` — ระบบเซฟและการตรวจความสมบูรณ์กลางงาน (รวม `w.watchlist`)
- `company-rendering-and-performance` — การแสดงผลและประสิทธิภาพ (v2.9 recorded Node simulation mean `1.382 ms/tick` at 500 NPCs; not mobile FPS)
- `company-qa-and-delivery` — QA เอกสารและส่งมอบ (v2.9 historical `203/203` unit/integration and `14/14` browser; verify future output)

## การดูแลสกิล

ทุกแพตช์ให้ตรวจ Master Skill และสกิลเฉพาะด้านที่ได้รับผลกระทบกับ source/test จริง อัปเดตดัชนีและไฟล์ที่เกี่ยวข้อง พร้อมระบุผลในรายงาน

## Retained v2.8.0 Living Scenarios, Observability & Human Depth

อ่าน [คู่มือโรงงาน/คลัง/สัญญา](../../docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [คู่มือโลกภายนอก](../../docs/company/LIVING_WORLD_SYSTEM.md), [รายงาน v2.8.0](../../docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.8.0.md) และ [รายงาน v2.7.0](../../docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md).

ล่าสุด v2.9.0 เพิ่มสัญญา startup.js/civics.js และ news/learning/software fixes ใน Master ทั้งสองและ14domain references; root copiesตรงcanonical รายงานและข้อจำกัดดู `docs/company/SME_AND_CIVICS_SYSTEM.md` จำนวน203เทสต์/14browser เป็นหลักฐานรุ่นนี้ ไม่ใช่เกณฑ์จำนวนตายตัว สถานะdraftของสกิลเฉพาะด้านยังไม่เปลี่ยน และยังไม่ยืนยันอัปเดต2สกิลภายในแอปGemini

## Era 3 proposal (not a runtime skill certification)

See [the English two-document handoff](../../era3/ERA_3_FEATURE_AND_SMART_PHONES.md) and [status copy](../../era3/project_status_and_ai_onboarding.md). Master/evergreen/QA references route collaborators there; no new phone functionality, release or skill maturity is claimed. The player's role is observer/Edit Hub; NPCs operate the world.
