# Company Simulation — Autonomous Campus

เกมจำลองบริษัทที่ผู้เล่นเฝ้ามอง NPC และ CEO ตัดสินใจเอง ฉากหลักเป็นที่ดินภายนอกที่มีอาคารสำนักงาน โรงงาน คลัง โรงอาหาร สวน และศูนย์ฝึก

เปิดเล่น COMPANY_SOURCE/CompanyFoundation_single.html ได้แบบออฟไลน์ หรือเปิด COMPANY_SOURCE/index.html ผ่าน local server ดูวิธีรันและทดสอบใน COMPANY_SOURCE/README.md

เริ่มรับช่วงที่ START_HERE_FOR_AI.md แล้วอ่าน AGENTS.md และ project_status_and_ai_onboarding.md สำหรับข้อกำหนดและสถานะปัจจุบัน

Human Core 1.0.0 ถูกล็อกถาวร ห้ามแก้ไฟล์แกนหรือ hash; เพิ่มระบบภายนอกแกนได้ เกม Company ปัจจุบันอยู่ branch main; ข้อความ branch ในเอกสารเก่าต้องเทียบกับ repo จริง

## Workflow ร่วมพัฒนา

ทีมมี Codex และ Agy ที่เข้าถึง repo โดยตรง กับ Gemini/ChatGPT แบบแอปแชตที่รับส่ง ZIP ผ่านผู้ใช้ อ่าน [ขั้นตอนทำงานร่วมกัน](docs/company/AGENT_COLLABORATION_WORKFLOW.md) และ [สถานะงานปัจจุบัน](docs/company/AGENT_WORK_STATUS.md) ก่อนเริ่ม เพื่อประสานขอบเขตและไม่แก้ทับงานกัน

Gemini มีอิสระคิดไอเดีย ออกแบบเพิ่มเติม และตัดสินใจภายใต้กฎเหล็ก เมื่อส่ง ZIP กลับให้ตรวจเทียบกับ repo ล่าสุดก่อนรวม และย้ายเฉพาะ ideas ที่ตรวจแล้วว่าทำเสร็จไปบันทึกในสถานะโครงการ
