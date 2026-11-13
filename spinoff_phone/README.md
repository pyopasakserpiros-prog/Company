# Silicon & Handset — playable v0.3.0

**เปิดเล่น:** ดาวน์โหลด [Silicon_Handset_single.html](../Silicon_Handset_single.html) แล้วเปิดออฟไลน์ หรือรันจาก `SPINOFF_SOURCE/` พร้อม local dependencies ในสาขานี้

- [สถานะ/API/ข้อจำกัดของเกมจริง (v0.3.0)](PROJECT_STATUS.md)
- [รายงานแพตช์ล่าสุด (v0.3.0)](PATCH_REPORT_V0.3.0.md) · [รายงานแพตช์ก่อนหน้า (v0.2.0)](PATCH_REPORT_V0.2.0.md)
- [บันทึกรับช่วงและพรอมต์ถัดไป (v0.3.0 Handoff)](V030_HANDOFF_HISTORY.md)
- [วิธีรัน/ทดสอบซอร์ส](../SPINOFF_SOURCE/README.md)

เกม Company เดิมยังแยกอยู่บน `main` ภาค Spin-off นี้แยก executable และเซฟ (`silicon-handset-v030`, schema 3) มีบริษัทคู่แข่ง ทีมงาน พอร์ตวิจัยเฉพาะทาง (9 เป้าหมายวิศวกรรม) รหัสชิ้นส่วน SKU และล็อตผลิตจริง (`w.skus`, `w.lots`) สุ่มและเติบโตตามเหตุปัจจัยของตนเอง ไม่มี catchup ตามผู้เล่น แผนระยะยาวด้านล่างยังคงเป็นพิมพ์เขียวสำหรับต่อยอดในอนาคต

# โครงการ Spin-off: มหาศึกสมาร์ตโฟนและจักรวรรดิซิลิคอน (Silicon & Handset Empire)

โฟลเดอร์นี้เป็นศูนย์กลางการออกแบบและพิมพ์เขียวสำหรับโครงการ **Spin-off Game** ที่โฟกัสเฉพาะธุรกิจ เทคโนโลยี ชิปเซมิคอนดักเตอร์ และอุตสาหกรรมโทรศัพท์มือถืออย่างลึกซึ้งและสมจริง ("สมจริงจนน่าขนลุก แต่ดูชีวิต NPC สนุก")

## อ่านข้อทักท้วงก่อนใช้เป็นสเปก

[Codex review and design refinements](CODEX_REVIEW_AND_DESIGN_REFINEMENTS.md) — แยกข้อเสนอเดิมออกจากข้อจำกัดจริงของ source พร้อมแนวแก้ progression, การแข่งขัน, RAM/storage, เงินสด, ฟิสิกส์, NPC และลำดับ vertical slice

## เอกสารหลักในโฟลเดอร์นี้ (สำหรับเจ้าของโปรเจกต์, Codex และทีม AI)

1. **[`SPINOFF_MASTER_DESIGN_AND_CODEX_BLUEPRINT.md`](SPINOFF_MASTER_DESIGN_AND_CODEX_BLUEPRINT.md)** — **พิมพ์เขียวแม่บท วิสัยทัศน์ กลไกธุรกิจ และสมการตัดสินใจเชิงลึก**
2. **[`SPINOFF_GAMEPLAY_UI_AND_SYSTEM_SPECS.md`](SPINOFF_GAMEPLAY_UI_AND_SYSTEM_SPECS.md)** — **พิมพ์เขียวโครงสร้างตัวเกม ผังแคมปัส ชีวิต NPC หน้าจอ UI และสถาปัตยกรรมโค้ด**
3. **[`IDEAS.md`](IDEAS.md)** — **รายการงานวิจัยและระบบที่รอพัฒนาต่อหลัง v0.3.0**
