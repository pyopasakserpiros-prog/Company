---
name: company-npc-life-and-behavior
description: Use when changing NPC personality effects, work/rest choices, relationships, learning, life events, or explanations of behavior.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ชีวิต บุคลิก และการตัดสินใจ NPC

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/human-core.js (อ่านเท่านั้น); js/sim.js: selectJob, personStep, pickColleagueToHelp, updateSocial, evaluatePersonalLifeMilestones` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/simulation.test.cjs; campus-behavior.test.cjs; workforce-career-realism.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ห้ามแก้สูตรแกนที่ล็อก เพิ่มระบบชีวิตภายนอกแกนผ่านสัญญาที่รองรับ
- แยกนิสัย ทักษะ ความเหนื่อย ข้อมูล ความสัมพันธ์ และทรัพยากรก่อนอธิบายเหตุผล
- การเปลี่ยนนิสัยต้องมีผลต่อ choice weights จริง ไม่ใช่แค่ข้อความสุ่ม
- ตัวอย่างเปรียบเทียบก่อน/หลังต้องแยกผลจาก RNG หรือสถานการณ์ที่เปลี่ยนร่วม

## โจทย์ลองใช้หลังยกระดับ

ผู้เล่นเพิ่มความรอบคอบของ CEO: จะสังเกตผลอย่างไรโดยไม่บังคับว่าเขาต้องปฏิเสธทุกการลงทุน?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; Update Method; human-core model ของโครงการ — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

learnSubject / personalStudyTick: individual interests, after-work study funded from personal wallet, weighted aptitude/potential, energy/stress and learned experience; no company-type subject locks.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## v2.8.0 Living Scenarios, Observability & Human Depth (`living-scenarios-observability-and-human-depth-v280`)

- **Personal Aspirations (`p.aspiration`) & Episodic Memories (`p.memories`, `p.historyLog`, `recordPersonMemory`)**: Derived from locked Human Core personality/values (`executive_leader`, `independent_founder`, `master_specialist`, `mentor_builder`, `craft_perfectionist`, `financial_security`), updated daily in `updateSatisfactionAndKpi`, and populated by real workplace events.
- **Workplace Friction vs. Coaching (`w.culture.conflicts`)**: QA rework in `finishJob` and passed-over promotions in `evaluatePromotions` adjust `p.relationships[otherId].trust`, `p.career.promotionGrievance`, and `w.culture.conflicts` based on empathy/fairness (always guarding `otherId !== p.id`).
- **Internal Career Switching (`S.evaluateInternalCareerSwitch`), Retention Counter-Offers (`S.evaluateEmployeeRetention`) & Living Spin-Offs (`S.evaluateEmployeeSpinoff`)**: Employees can switch roles internally when cross-trained (`w.culture.roleSwitches`), receive retention raises/bonuses before leaving (`w.culture.retentionOffers`), or found living spin-off firms registered in `w.externalWorld.living.firms`.
- **Counterfactual Comparison (`S.runCounterfactualComparison`)**: Compares identical world seeds under altered CEO personality, technician knowledge, or capital. Verified with **190/190** tests (`test/living-scenarios-human-depth-v280.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

S.readNewsTick records a five-minute personal reading slot, role/openness participation and aptitude/market comprehension. Only read executive news enters intelligence and affects supplier/R&D scoring. Validate p.news and inspect Character → News. No origin locks learning; no information-sharing/misinformation model is claimed.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Current v3.0.0 integration reference

Reference key: `phone-talent.js`. Outside professionals use stable Human Core profiles, individual subjects, loyalty/satisfaction and paid work. Recruitment removes former-firm contribution and preserves identity on campus. Outside condition updates remain a lightweight model, not full campus life. Validate profiles and recruited current-save continuation.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.
