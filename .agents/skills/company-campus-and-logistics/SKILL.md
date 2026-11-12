---
name: company-campus-and-logistics
description: Use when changing campus layout, reachable stations, expansion plots, freight vehicles, drivers, cargo custody, dispatch, or returns.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — พื้นที่ทำงาน การเดิน และโลจิสติกส์

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/layout.js: findPath, validateLayout, addStation; js/sim.js: constructPlot, acquireFleetVehicle, acceptFreightContract, advanceFreightContract, matchBackhaulCargo` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/layout-economy.test.cjs; campus-behavior.test.cjs; true-upstream-agri-fleet-software-v110.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ตรวจพื้นที่และเส้นทางจริงเมื่อเพิ่มอาคาร/สถานี ไม่ทำงานจากจุดที่ไปไม่ถึง
- แยกเส้นทางคนในแคมปัสจากสัญญาขนส่งภายนอก
- รถยังไม่ว่างจนจบเงื่อนไขกลับ จองคนขับ น้ำหนัก/ปริมาตร/cargo และช่องโหลด
- แยก custody ลูกค้าจากสินค้าบริษัท คิดระยะรถเปล่า เชื้อเพลิง ค่าทาง ซ่อม เคลม และ backhaul จริง

## โจทย์ลองใช้หลังยกระดับ

รถรับเงินส่งของแล้วแต่ยังไม่กลับลาน: การรับงานใหม่ควรตรวจสถานะรถและคนขับตรงไหน?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

Update Method; source layout/freight ของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

operationReadiness checks freight knowledge and the assigned driver's driving level; centerCamera/minimumZoom fit the current viewport and both map axes.

อ่าน `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และกรณีตรวจ `test/knowledge-and-company.test.cjs`; สถานะร่างเดิมไม่เปลี่ยน maturity อัตโนมัติ

## v2.5.0 integration

sim.productionSteps/productionView expose actual timed assembly checkpoints; planStockProduction creates no-deposit internal stockBatch orders, excluded from activeOrders/shipping until ready stock is allocated on acceptance. Save accepts internal offerId=null only with stockBatch/deposit0/unitPrice1. api.frame uses2game minutes/real second at1×; move uses8cells/tick. Read v2.5.0 patch report for remaining manufacturing scope; do not claim dedicated machinery or government procurement completed.
