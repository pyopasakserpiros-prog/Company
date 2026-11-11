---
name: company-rendering-and-performance
description: Use when changing Canvas rendering, camera/zoom, labels, large NPC counts, tick cost, frame rate, culling, or performance measurements.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — การแสดงภาพและประสิทธิภาพ

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/campus-render.js: updateSpritePositions, render; js/api.js: frame/view; js/sim.js: step/tick indexes; js/layout.js: findPath; tools/benchmark.cjs` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/api.test.cjs; campus-browser.cjs; tools/benchmark.cjs (simulation-only)` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- วัด simulation tick กับ browser frame/FPS แยกกัน ระบุจำนวนคน viewport zoom และอุปกรณ์
- รักษา RNG/state ของ simulation ไม่ให้การวาดหรือ sampling เปลี่ยนโลก
- ตรวจ culling, label density, zoom/pinch และค่าใช้จ่าย snapshot ก่อนเพิ่มรายละเอียดภาพ
- อย่าอ้าง bounded path cache ว่าเป็น LRU หาก code ไม่ได้ทำ recency; อย่าใช้ค่า benchmark เก่าแทนผลใหม่

## โจทย์ลองใช้หลังยกระดับ

Node benchmark ผ่านแต่เกมมือถือกระตุก: จะเก็บหลักฐานฝั่ง renderer โดยไม่สรุปว่าจำลองช้าได้อย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

MDN Optimizing canvas; Fix Your Timestep!; Playwright best practices — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

centerCamera fits both world axes and clears follow mode; minimumZoom is viewport-dependent for button/wheel/pinch. Test portrait full-campus fit, company tabs and character knowledge on mobile.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ
