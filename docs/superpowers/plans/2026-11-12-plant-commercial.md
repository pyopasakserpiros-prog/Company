# Plant and commercial implementation record

Goal: Continue approved production overhaul from c2609be, including user-required machinery across business models and a meaningful technical workforce. User explicitly authorized execution; no additional architecture choice delegated to user.

Architecture: plant.js UMD follows world.js; sim owns jobs/finance/learning; plant owns equipment/process stages. World escrow funds real commercial commitments. Existing per-unit engine handles bounded installments, while parent contracts aggregate large quantities. UI reads frozen snapshots.

- [x] Read AGENTS/status/workflow/relevant skills and actual pipeline before editing; keep core/rules unchanged.
- [x] Replace cosmetic checkpoints with staged real labor/holds/temperature and equipment slots. Wire movement, energy, wear, purchases/ETA, qualified installation/repair, parts and real learning.
- [x] Tool gates for material recipes and service/software/freight; preserve explicit synchronous-material limitation.
- [x] Finite warehouse footprint/packing reservations, proactive stock sales, large aggregate contracts and real buyer/government escrow.
- [x] Company machinery/maintenance and sales/contracts panels, immutable mobile snapshots.
- [x] Verify schema/finance/resources, passive save continuation, warehouse sale end-to-end, contract eligibility, browser, performance; write report, update skills/status/handoff and package final ZIP.

Constraints: no AGENTS/core changes, no revenue on signature or free machine grants in normal decisions, deterministic simulation time, user remains observer. Tradeoffs: group process routes vs full industrial physics; simplified public purchasing vs competitive/legal tender; material batch API timing remains existing model; no separate sprite/building per tool. These limitations are in the system contract and report.
