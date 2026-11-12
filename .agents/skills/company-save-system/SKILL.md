---
name: company-save-system
description: Use when changing save schema, import/export, validation, supported-version behavior, corruption handling, or deterministic save/load continuation.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ระบบเซฟและการรับข้อมูลกลับ

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/save.js: checkJsonTree, migrate, validate, serialize/deserialize exports; js/api.js: load` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/save.test.cjs; api.test.cjs; core-baseline.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ตรวจข้อมูลก่อนแทนโลกปัจจุบัน ข้อมูลเสียต้องไม่ทำลายเกมหรือเซฟจริงของผู้ใช้
- ตรวจ finite/safe numbers, references, assignment, ledger และทรัพยากรตามสัญญา
- แยก releaseVersion กับ save schema VERSION ไม่ยึดค่ารุ่นเก่าจากเอกสาร
- ไม่เพิ่ม migration ข้ามรุ่นโดยไม่จำเป็นเมื่อกฎโครงการไม่ได้ต้องการ แต่เซฟรุ่นที่รองรับต้องต่อเนื่องถูกต้อง

## โจทย์ลองใช้หลังยกระดับ

โหลดเซฟเสียกลางเกมแล้วกู้หน้าปัจจุบันไม่ได้: validation/assignment boundary ควรตรวจเรียงอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; save tests ของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

ensureKnowledge migration archives old point unlocks and retains finances/contracts. save.js validates education subjects and project evidence; current-save round trips preserve discipline work and personal study.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.4.0 — Verified living-world integration

Save.validate delegates current `externalWorld.living` to S.worldAudit and rejects malformed balances/stock/market/references. Current saves preserve in-transit shipments, opening accounts, policy terms, finite reserves, temporary scenarios and histories. Missing legacy living state initializes on next daily world step; no daily reset. Test 180-day world save roundtrip and deterministic continuation to day200. Do not replace a valid living state during loading.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.
