---
name: company-executive-business-decisions
description: Use when an NPC company has cash but does not diversify, or when changing investment, business entry, technology gates, reserves, or executive decisions.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ผู้บริหาร การลงทุน และการแตกธุรกิจ

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/sim.js: evaluateFacilityInvestment, evaluatePlotConstruction, evaluateDebtRepayment, acquireExternalAsset, acquireFleetVehicle, evaluateNewBusinessOperationsDaily, computeFinancialPools, reserveBoardBudget, consumeBoardReservation, cancelBoardReservation, evaluateExecutiveBoardAndBusinessEntry, recordBoardDecision` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน; ใน v2.1.0 บอร์ดประเมินเวลา 10:45 น. `tod(w) === 645`, แยกงบที่จองกับทุนที่จ่ายแล้ว, รองรับบริษัท <10 คน และบังคับใช้ `nextReviewDay`)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/campus-behavior.test.cjs; external-assets-production-chains-v060.test.cjs; product-depth-npc-board-v130.test.cjs; business-depth-world-corridors-v210.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/). ระบบบอร์ดและเงินสดอิสระมีแล้ว; ใช้สกิลนี้ออกแบบการต่อยอด ไม่เขียนเหมือนไม่มี call-site

## หัวข้อที่เสนอให้ขยาย

- ตรวจ call-site ว่าเคยเสนอทางเลือกจริงก่อนสรุปว่า CEO ไม่ชอบเสี่ยง
- แยกข้อจำกัดทุน/ความรู้/เทค/คน/เครื่อง/ตลาด/ทุนหมุนเวียนกับการตัดสินใจไม่ทำ
- ให้มีทางเลือกเก็บเงิน ทดลอง จ้างช่วง ฝึกทีม หรือขยายตามความเหมาะสม
- บันทึกตัวเลือกที่ประเมิน เหตุผลมติ ผู้ตัดสินใจ งบที่จอง และเวลาทบทวน

## โจทย์ลองใช้หลังยกระดับ

เงินมากและตลาดรถเย็นดีแต่ไม่มีคนขับพร้อม: แยก planner ที่ขาดกับการเลือกเตรียมความสามารถอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; source Company และ ideas บท 28–32 — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

reviewKnowledge / productReadiness / acquireTechnologyLicense: cash, team coverage, market and cost shape research-versus-purchase decisions. License purchase pays real money and never instantly qualifies manufacturing.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ
