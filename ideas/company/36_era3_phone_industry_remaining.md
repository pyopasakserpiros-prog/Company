# Era 3 — remaining phone-industry proposals after v3.1.0

Completed in v3.0.0 and v3.1.0 (and now documented in `project_status_and_ai_onboarding.md`, `docs/company/ERA3_PHONE_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md`):
- 12 executable supplier & brand business roles (`E.ROLE_CONTRACTS`: `fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) and 8 qualified phone material grades (`E.MATERIAL_GRADES`).
- Own-company entry, B2B component sales, and vertical integration across CPU/SoC (booking wafer foundry + OSAT), RAM, Camera, Flash, Display, Battery, PCB/RF, Enclosure, OS, and Handset Brand (`I.enterCampusRole`, `S.selectFeasibleCampusPhoneRole`, `declined_prudent`).
- Normal-opening upstream supply calibration in `world.js` (resolving the v3.0.0 `24/25`-phone starvation to `601–796` phones over 360 days without artificial refills) and multi-day full-campus-life (`S.advance(1440)`) verification.

Still proposed / partial for future authorised patches:
1. Per-machine cleanroom/SMT placement queues for external firms (currently aggregate daily batches for off-screen performance).
2. Independent carrier/distributor corporate balance sheets with multi-month postpaid subsidy contracts and spectrum auctions (currently channel classification in `w.phoneIndustry.channels` over household budgets).
3. Third-party app-store developer ecosystem, SDK royalties, and platform network effects beyond OS licensing fees.
4. Formal patent/IP litigation, injunctions, exclusivity lock-ups, and multi-tranche M&A earn-outs.
5. Full statutory tax returns and per-lot FIFO tax accounting for external world corporations (currently cash-surplus levy + COGS tracking).
