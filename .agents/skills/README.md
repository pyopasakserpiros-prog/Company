# Company Simulation — AI Skills

สกิลเหล่านี้ใช้กับ `COMPANY_SOURCE/` ของเกม Siam Enterprise / Company Simulation โดยเฉพาะ ตรวจ source และ [project status](../../project_status_and_ai_onboarding.md) ทุกครั้งก่อนอ้างพฤติกรรมหรือเวอร์ชัน

## สกิลหลัก (อ้างอิงปัจจุบัน v3.1.0)

- [`company-evolution-dev/SKILL.md`](company-evolution-dev/SKILL.md) — Master Skill ภาพรวมสถาปัตยกรรมและระบบที่ตรวจถึง **v3.1.0 (`sme-origins-civics-informed-decisions-v290`)**; สำเนาระดับ root คือ [`SKILL.md`](../../SKILL.md), [`SKILL_COMPANY_EVOLUTION_DEV.md`](../../SKILL_COMPANY_EVOLUTION_DEV.md), และ [`SKILL_COMPANY_FOR_EVERY_PATCH.md`](../../SKILL_COMPANY_FOR_EVERY_PATCH.md) สำหรับการส่งต่อไฟล์
- [`company-for-every-patch/SKILL.md`](company-for-every-patch/SKILL.md) — Evergreen workflow ก่อน/หลังแพตช์และรายการตรวจความสมจริงเชิงกระบวนการ สถานการณ์วิกฤต การติดตามผล และความลึกชีวิต NPC ถึง **v3.1.0**

## สกิลเฉพาะด้าน

สกิล 14 รายการด้านล่างมี metadata `maturity: starter-draft` พร้อมบันทึกการเชื่อมระบบจริงถึง **v3.1.0**:

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


## Current v3.1.0 source references

Both master references and all14affected domain references now include phone contracts and their relevant APIs/invariants/tests. Root master copies match canonical files. Read `docs/company/ERA3_PHONE_SYSTEM.md` and `docs/company/validation/v300/skill-reference-checks.json`. The update is source-backed reference maintenance, not a new maturity certification. Domain starter status remains unchanged; the two skills inside Gemini app have not been accessed or verified. Historical v2.9 notes above remain history.

## Current v3.1.0 source references

Both master skills (`company-evolution-dev` and `company-for-every-patch`), their root copies (`SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`), and all 14 domain skills now include the v3.1.0 12-role phone supplier ecosystem, 8 qualified material grades, own-company supplier entry and vertical integration, Fabless SoC -> Foundry -> OSAT orders, and normal-opening upstream supply calibration (`236/236` unit/integration tests). The two installed Gemini app skills (`user:company-evolution-dev` and `user:company-for-every-patch`) were also updated via `skills:update_skill` during the v3.1.0 implementation session.

## Silicon & Handset spin-off

[Dedicated source-backed reference](silicon-handset-dev/SKILL.md) covers SPINOFF_SOURCE0.1.0, separate from Company3.1.0. Read [spin-off status](../../spinoff_phone/PROJECT_STATUS.md) for implemented scope and explicit limits.
