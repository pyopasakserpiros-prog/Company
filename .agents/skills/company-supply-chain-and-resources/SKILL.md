---
name: company-supply-chain-and-resources
description: Use when adding materials or recipes, farming and seed cycles, mining, upstream provenance, make-or-buy, or material procurement.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — วัตถุดิบ ต้นน้ำ และซัพพลายเชน

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.0.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: RESOURCE_CLASSES, AGRICULTURE_CROPS, MATERIAL_RECIPES; js/sim.js: craftMaterialRecipe, plantCropPlot, careCropPlot, harvestCropPlot, saveSeedFromCrop, runMidstreamRefining, planPurchases` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน). แค็ตตาล็อกปัจจุบันมี 58 วัตถุดิบ/35 สูตร; เทียบ ID กับ source ก่อนใช้ข้อเสนอ
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/true-upstream-agri-fleet-software-v110.test.cjs; external-assets-production-chains-v060.test.cjs; product-depth-npc-board-v130.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- แยกแร่/น้ำธรรมชาติ พันธุ์ พืชผล ผลพลอยได้ และของแปรรูป ไม่ใช้ tier แทนทุกมิติ
- น้ำตาล แป้ง กระดาษ ข้าว แนฟทา/ดีเซลไม่ใช่ต้นน้ำธรรมชาติ
- ทุกสูตรแปรรูปต้องตามต้นทางได้ ใช้ N/P/K จากแหล่งที่มีธาตุนั้นและมีต้นทุนจริง
- ทำทางซื้อเมื่อเทคผลิตเองยังขาด พร้อม lead time และการหักสต็อก/พันธุ์ตามจริง

## โจทย์ลองใช้หลังยกระดับ

สูตรหินฟอสเฟต/โพแทช+น้ำให้ NPK มีอะไรขาด และจะแยกทางซื้อกับผลิตเองอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; แหล่งและสเปกทรัพยากรของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master
