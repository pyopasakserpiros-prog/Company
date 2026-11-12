(function () {
  "use strict";

  const app = CompanyAPI.create("company-demo", { autonomous: true });
  const byId = (id) => document.getElementById(id);
  const money = (cents) =>
    "฿" +
    (Number(cents || 0) / 100).toLocaleString("th-TH", {
      maximumFractionDigits: 0,
    });
  const moneyFull = (cents) =>
    (Number(cents || 0) / 100).toLocaleString("th-TH", {
      maximumFractionDigits: 2,
    }) + " บาท";
  const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

  const SKILL_DESCRIPTIONS = {
    sales: {
      eff: "เจรจาดีลธุรกิจกับบริษัทคู่ค้า B2B เพิ่มโอกาสได้ราคาต่อหน่วยสูงขึ้นและเงื่อนไขการค้าที่ดี",
      train: "เจรจาหาลูกค้าที่อาคารสำนักงานใหญ่ / ศูนย์การค้า B2B",
    },
    admin: {
      eff: "บริหารซัพพลายเชน ออกใบสั่งซื้อวัตถุดิบ (PO) และวางบิลเรียกเก็บเงินลูกค้า (Invoice)",
      train: "งานจัดซื้อและบัญชีที่อาคารสำนักงานใหญ่ / คลังวัตถุดิบ",
    },
    engineering: {
      eff: "ทำโครงการเฉพาะวิชา ทดสอบต้นแบบและตรวจรับกระบวนการ พร้อมบำรุงรักษาเครื่องจักร",
      train: "วิจัยและพัฒนาที่อาคารแล็บวิจัย (R&D Lab) & โรงซ่อมบำรุง",
    },
    assembly: {
      eff: "เพิ่มความเร็วในการเดินเครื่องจักรประกอบชิ้นงานตามไลน์ผลิต A/B/C และลดโอกาสของเสีย",
      train: "ประกอบชิ้นงานและงานซ่อม (Rework) ที่อาคารโรงงานผลิต",
    },
    quality: {
      eff: "เพิ่มความแม่นยำในการคัดกรองคุณภาพสินค้า (QC/QA) และตรวจรับวัตถุดิบหน้าคลัง",
      train: "ตรวจสอบคุณภาพชิ้นงานที่แท่นตรวจ QC ในโรงงาน",
    },
    logistics: {
      eff: "เร่งความเร็วการแพ็กสินค้าลงกล่องมาตรฐานส่งออกและการปล่อยรถบรรทุกจัดส่งลูกค้า B2B",
      train: "งานแพ็กเกจจิ้งและจัดส่งที่คลังสินค้าและศูนย์ส่งออก",
    },
    leadership: {
      eff: "เพิ่มประสิทธิภาพเมื่อเดินไปช่วยเพื่อนร่วมงาน (Collaboration Multiplier) และบริหารองค์กร",
      train: "ช่วยเหลือเพื่อนร่วมงานในโซนเดียวกันและประสานงานองค์กร",
    },
  };

  const APTITUDE_GROUPS = [
    {
      title: "ปัญญาและการคิดวิเคราะห์ (Cognitive & Reasoning)",
      keys: [
        "analytical",
        "numerical",
        "verbal",
        "creativity",
        "learningSpeed",
        "memory",
        "attention",
        "problemSensitivity",
        "perceptualSpeed",
        "uncertaintyReasoning",
      ],
    },
    {
      title: "การสื่อสาร อารมณ์ และการจัดการ (Social & Executive)",
      keys: ["communication", "emotionalInsight", "organization", "composure", "speechClarity"],
    },
    {
      title: "ความแม่นยำและควบคุมกลไก (Psychomotor & Technical)",
      keys: [
        "precision",
        "dexterity",
        "controlPrecision",
        "coordination",
        "reactionSpeed",
        "spatial",
      ],
    },
    {
      title: "ประสาทสัมผัสและพละกำลังกาย (Sensory & Physical)",
      keys: [
        "stamina",
        "strength",
        "balance",
        "flexibility",
        "sensory",
        "visualAcuity",
        "colorDiscrimination",
        "hearing",
        "tasteSmell",
      ],
    },
  ];

  const STATE_LABELS = [
    ["energy", "พลังงานกาย (Energy)", false],
    ["focus", "สมาธิจดจ่อ (Focus)", false],
    ["morale", "ขวัญกำลังใจ (Morale)", false],
    ["health", "สุขภาพกาย (Health)", false],
    ["fulfillment", "ความอิ่มเอมใจ (Fulfillment)", false],
    ["drive", "แรงขับเคลื่อน (Drive)", false],
    ["stress", "ความเครียด (Stress)", true],
    ["burnout", "ภาวะหมดไฟสะสม (Burnout)", true],
    ["hunger", "ความหิว (Hunger)", true],
    ["sleepDebt", "หนี้การนอนหลับ (Sleep Debt)", true],
    ["socialNeed", "ความต้องการพบปะ (Social Need)", true],
    ["lifeBurden", "ภาระชีวิตทางบ้าน (Life Burden)", true],
  ];

  const GOAL_NAMES_TH = {
    emergencyFund: "สร้างเงินออมสำรองฉุกเฉิน",
    familySupport: "ส่งเสียและดูแลครอบครัว",
    buyVehicle: "เก็บเงินซื้อยานพาหนะส่วนตัว",
    buyHome: "เก็บเงินดาวน์บ้านของตัวเอง",
    masterCraft: "ฝึกฝนฝีมือสู่ช่างระดับปรมาจารย์",
    careerLead: "ก้าวหน้าขึ้นเป็นผู้นำสายงาน",
    skillMastery: "พัฒนาความเชี่ยวชาญเฉพาะทาง",
    homeOwnership: "มีบ้านเป็นของตัวเอง",
    careerAdvancement: "เติบโตในสายอาชีพ",
    personalVehicle: "ซื้อรถยนต์ส่วนตัว",
    wealthAndFreedom: "อิสรภาพทางการเงิน",
    romanceAndFamily: "สร้างครอบครัวที่อบอุ่น",
  };

  const MOOD_NAMES_TH = {
    content: "พึงพอใจและสงบ",
    happy: "แจ่มใสมีความสุข",
    motivated: "เปี่ยมไฟทำงาน",
    neutral: "ปกติ",
    tense: "ตึงเครียด",
    distressed: "กังวลใจ",
    exhausted: "อ่อนล้ามาก",
  };

  let current = app.snapshot();
  let pending = current;
  let lastPaint = 0;
  let lastEventId = current.events.at(-1)?.id || null;
  let autoStarted = false;

  // Sheet, Filter & Tracked NPC State (JS2-adapted)
  const uiState = {
    sheetOpen: false,
    sheetMode: null, // 'people' | 'campus' | 'log' | 'market' | 'policy' | 'menu' | 'person' | 'building'
    subTab: "",
    selectedPersonId: null,
    compareTargetId: current.people[1]?.id || null,
    selectedBuildingId: null,
    trackedIds: new Set(),
    peopleFilterTrackedOnly: false,
    peopleDivisionFilter: "ALL", // 'ALL' | 'executive' | 'office' | 'factory'
    rosterLimit: 60,
    newsMode: "ALL",
    newsCategory: "ALL",
    digestPeriod: "d1",
  };

  function toggleTrackedPerson(personId) {
    const res = app.dispatch({
      type: "toggleWatchlist",
      targetType: "person",
      targetId: personId,
    });
    if (res && res.ok) {
      if (res.starred) {
        uiState.trackedIds.add(personId);
        showToast("⭐ ปักหมุดติดตามพนักงานบนแผนที่และรายงานแล้ว (บันทึกถาวรในเซฟ)");
      } else {
        uiState.trackedIds.delete(personId);
        showToast("ยกเลิกการปักหมุดติดตามพนักงานแล้ว");
      }
      paint(app.snapshot());
      return;
    }
    if (uiState.trackedIds.has(personId)) {
      uiState.trackedIds.delete(personId);
      showToast("ยกเลิกการปักหมุดติดตามพนักงานแล้ว");
    } else {
      uiState.trackedIds.add(personId);
      showToast("⭐ ปักหมุดติดตามพนักงานบนแผนที่และรายงานแล้ว");
    }
    paint(current);
  }

  const mapCanvas = byId("map");
  const minimapCanvas = byId("minimap");
  const renderer =
    typeof CampusRender !== "undefined"
      ? CampusRender.createRenderer(mapCanvas, minimapCanvas)
      : null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function showToast(text, isError = false) {
    if (byId("notice")) byId("notice").textContent = text;
    const box = byId("toasts");
    if (!box) return;
    const t = el("div", "toast" + (isError ? " err" : ""), text);
    box.append(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => {
      if (t.parentNode) t.remove();
    }, 3400);
  }

  function dispatch(command, successNote) {
    const result = app.dispatch(command);
    if (!result.ok) {
      showToast(result.message || "คำสั่งไม่สำเร็จ", true);
      return result;
    }
    if (successNote) showToast(successNote, false);
    paint(app.snapshot());
    return result;
  }

  function barColor(val, invert = false) {
    const v = invert ? 100 - val : val;
    if (v >= 70) return "#58d68d";
    if (v >= 45) return "#58b8f6";
    if (v >= 28) return "#f5b041";
    return "#e66052";
  }

  function makeBarRow(label, value, marker = null, invert = false) {
    const row = el("div", "bar");
    const lb = el("div", "lb", label);
    lb.title = label;
    const tr = el("div", "tr");
    const fl = el("div", "fl");
    fl.style.width = clamp(value, 0, 100) + "%";
    fl.style.background = barColor(value, invert);
    tr.append(fl);
    if (marker !== null && Number.isFinite(marker)) {
      const mk = el("div", "mk");
      mk.style.left = clamp(marker, 0, 100) + "%";
      tr.append(mk);
    }
    const vl = el("div", "vl", String(Math.round(value)));
    row.append(lb, tr, vl);
    return row;
  }

  function formatTime(minuteOfDay) {
    const h = Math.floor((minuteOfDay % 1440) / 60);
    const m = minuteOfDay % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + " น.";
  }

  function renderTopHud(v) {
    const t = v.time;
    const period =
      t.minute >= 720 && t.minute < 780
        ? "🍱 พักเที่ยง"
        : t.minute >= 1020 && t.minute < 1200
          ? "🌙 ล่วงเวลา (OT)"
          : t.minute >= 540 && t.minute < 1020
            ? "☀️ เวลาทำงาน"
            : "🏠 นอกเวลาทำงาน";
    const icon =
      t.minute >= 1080 || t.minute < 360
        ? "🌙"
        : t.minute >= 990
          ? "🌇"
          : "☀️";

    if (byId("dateTxt")) {
      byId("dateTxt").textContent = `${icon} วันที่ ${t.day} • ${formatTime(t.minute)} • ${period}`;
    }

    const curSpd = app.getSpeed();
    document.querySelectorAll("#speedBar button").forEach((btn) => {
      btn.classList.toggle("on", Number(btn.dataset.speed) === curSpd);
    });
    if (byId("speed")) byId("speed").value = String(curSpd);

    const resRow = byId("resRow");
    if (resRow) {
      const employedCount = v.people.filter((p) => p.employed).length;
      const runway = v.company.runwayDays === null ? "∞" : v.company.runwayDays.toFixed(1);
      const pills = [
        {
          ic: "💰",
          label: "เงินสด",
          val: money(v.company.cash),
          cls: v.company.cash < 2500000 ? "warn" : "ok",
        },
        {
          ic: "🏦",
          label: "หนี้",
          val: money(v.company.debt),
          cls: v.company.debt === 0 ? "ok" : "",
        },
        {
          ic: "🔥",
          label: "รายจ่าย/วัน",
          val: money(v.company.dailyBurnEstimate),
          cls: "",
        },
        {
          ic: "⏳",
          label: "Runway",
          val: `${runway} วัน`,
          cls: v.company.runwayDays !== null && v.company.runwayDays < 10 ? "warn" : "",
        },
        {
          ic: "👥",
          label: "ทีมงาน",
          val: `${employedCount}/${v.catalog.rules?.maxPeople || 500}`,
          cls: "",
        },
        {
          ic: "⭐",
          label: "ชื่อเสียง",
          val: v.company.reputation.toFixed(0),
          cls: v.company.reputation >= 60 ? "ok" : "",
        },
        {
          ic: "🌱",
          label: "ระดับกิจการ",
          val: v.companyProgression?.currentStageBadgeTh || "🌱 ระยะที่ 1/6",
          cls: (v.companyProgression?.currentStageOrder || 1) >= 3 ? "ok" : "",
        },
        {
          ic: v.utilities?.brownoutActive ? "⚠️" : "⚡",
          label: "ค่าไฟ/โซลาร์",
          val: v.utilities?.brownoutActive ? "ไฟตก (Brownout)" : `${v.utilities?.netKwh || 0} kWh`,
          cls: v.utilities?.brownoutActive ? "warn" : "ok",
        },
      ];
      resRow.replaceChildren(
        ...pills.map((p) => {
          const pill = el("span", "pill" + (p.cls ? " " + p.cls : ""));
          pill.append(el("span", "", `${p.ic} ${p.label}`), el("b", "", p.val));
          return pill;
        }),
      );
    }

    const latestEvt = v.events.at(-1);
    if (latestEvt && latestEvt.id !== lastEventId) {
      lastEventId = latestEvt.id;
      const d = Math.floor(latestEvt.at / 1440) + 1;
      const tm = formatTime(latestEvt.at % 1440);
      if (byId("notice")) {
        byId("notice").textContent = `วันที่ ${d} (${tm}): ${latestEvt.message}`;
      }
    }
  }

  function renderSelectionBanner(v) {
    const banner = byId("selInfo");
    if (!banner) return;
    if (uiState.selectedPersonId) {
      const p = v.people.find((x) => x.id === uiState.selectedPersonId && x.employed);
      if (p) {
        banner.classList.add("show");
        const pt = el("canvas", "pt");
        pt.width = 44;
        pt.height = 44;
        if (typeof CampusRender !== "undefined") CampusRender.drawPortrait(pt, p);

        const info = el("div", "");
        info.style.flex = "1";
        info.style.minWidth = "0";
        const isTracked = uiState.trackedIds.has(p.id);
        const id = p.identity || {};
        const car = p.career || { badge: "Lv.1", titleTh: p.roleName, satisfaction: 76 };
        const nm = el(
          "div",
          "",
          `${isTracked ? "⭐ " : ""}${p.emoji} ${id.flag || "🇹🇭"} ${id.displayName || p.name} • ${car.badge} ${car.titleTh}`,
        );
        nm.style.fontWeight = "700";
        const demoLine = el(
          "div",
          "muted",
          `${id.genderSymbol || "♂"} เพศ${id.genderTh || "ชาย"} • อายุ ${id.age || 26} ปี • สัญชาติ${id.nationalityTh || "ไทย"} • ${car.departmentTh || p.roleName} • 😊 พึงพอใจ ${Math.round(car.satisfaction ?? 76)}%`,
        );
        const sub = el("div", "muted", p.activityLabelTh);
        info.append(nm, demoLine, sub);

        const pinBtn = el("button", "btn", isTracked ? "⭐ ติดตามอยู่" : "☆ ติดตาม");
        pinBtn.onclick = () => toggleTrackedPerson(p.id);

        const openBtn = el("button", "btn pri", "ดูแผ่นประวัติ");
        openBtn.onclick = () => openPersonSheet(p.id);
        const closeBtn = el("button", "sel-close", "✕");
        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "ปิดข้อมูลตัวละคร");
        closeBtn.onclick = () => {
          uiState.selectedPersonId = null;
          banner.classList.remove("show");
          banner.replaceChildren();
        };
        const actions = el("div", "sel-actions");
        actions.append(pinBtn, openBtn);
        banner.replaceChildren(pt, info, closeBtn, actions);
        return;
      }
    }
    banner.classList.remove("show");
  }

  function openSheet(mode, defaultTab = "") {
    current=app.snapshot();pending=current;
    uiState.sheetOpen = true;
    uiState.sheetMode = mode;
    if (defaultTab) uiState.subTab = defaultTab;
    const sheet = byId("sheet");
    if (sheet) sheet.classList.add("show");
    document.querySelectorAll("#hudBottom button").forEach((b) => {
      b.classList.toggle("on", b.dataset.nav === mode);
    });
    renderActiveSheet(current);
  }

  function closeSheet() {
    uiState.sheetOpen = false;
    const sheet = byId("sheet");
    if (sheet) sheet.classList.remove("show");
    document.querySelectorAll("#hudBottom button").forEach((b) => b.classList.remove("on"));
  }

  function openPersonSheet(personId) {
    uiState.selectedPersonId = personId;
    uiState.selectedBuildingId = null;
    renderSelectionBanner(current);
    if (
      ![
        "vital",
        "identity",
        "aptitudes",
        "skills",
        "knowledge",
        "news",
        "relations",
        "wallet",
        "chronicle",
        "compare",
      ].includes(uiState.subTab)
    ) {
      uiState.subTab = "vital";
    }
    openSheet("person", uiState.subTab);
  }

  function openBuildingSheet(buildingId) {
    uiState.selectedBuildingId = buildingId;
    if (renderer) renderer.focusBuilding(buildingId);
    if (!["inside", "stations", "manage"].includes(uiState.subTab)) {
      uiState.subTab = "inside";
    }
    openSheet("building", uiState.subTab);
  }

  function setSheetTabs(tabs) {
    const bar = byId("shTabs");
    if (!bar) return;
    if (!tabs.some((t) => t.id === uiState.subTab)) {
      uiState.subTab = tabs[0]?.id || "";
    }
    bar.replaceChildren(
      ...tabs.map((t) => {
        const b = el("button", t.id === uiState.subTab ? "on" : "", t.label);
        b.type = "button";
        b.onclick = () => {
          uiState.subTab = t.id;
          renderActiveSheet(current);
        };
        return b;
      }),
    );
  }

  function makePersonRow(v, p) {
    const row = el("div", "prow");
    const pt = el("canvas", "pt");
    pt.width = 48;
    pt.height = 48;
    if (typeof CampusRender !== "undefined") CampusRender.drawPortrait(pt, p);

    const allBuildings = [
      ...(v.campus?.buildings || []),
      ...(v.campus?.expansionPlots || []),
    ];
    const bld = allBuildings.find((b) => b.id === p.buildingId);
    const isTracked = uiState.trackedIds.has(p.id);
    const pi = el("div", "pi");
    const id = p.identity || {};
    const car = p.career || { badge: "Lv.1", titleTh: p.roleName, satisfaction: 76, bonusTotal: 0 };
    const divLabel =
      car.division === "executive"
        ? "👑 บริหาร"
        : car.division === "office"
          ? "🏢 ออฟฟิศ"
          : "🏭 โรงงาน";
    const nm = el("div", "nm");
    nm.append(
      el("span", "", `${isTracked ? "⭐ " : ""}${id.flag || "🇹🇭"} ${id.displayName || p.name}`),
      el("span", "chip g", `${car.badge} ${car.titleTh}`),
      el("span", "chip", divLabel),
      el("span", "chip b", `${id.genderSymbol || "♂"}${id.genderTh || "ชาย"} ${id.age || 26}ปี`),
      el("span", "chip ok", `😊 ${Math.round(car.satisfaction ?? 76)}%`),
    );
    const sub = el(
      "div",
      "sub",
      `${bld ? bld.icon + " " + bld.shortNameTh : p.zoneId} • ${p.emoji} ${p.activityLabelTh} • ค่าจ้าง ${money(p.pay.dailyWage)}/วัน${car.bonusTotal ? " • โบนัสสะสม " + money(car.bonusTotal) : ""}`,
    );

    const bars = el("div", "mini-bars");
    for (const [val, inv] of [
      [p.state.energy, false],
      [p.state.morale, false],
      [p.state.stress, true],
    ]) {
      const m = el("div", "mini");
      const fill = el("i");
      fill.style.width = clamp(val) + "%";
      fill.style.background = barColor(val, inv);
      m.append(fill);
      bars.append(m);
    }

    const starBtn = el("button", "chip" + (isTracked ? " g" : ""), isTracked ? "⭐ ติดตาม" : "☆ ติดตาม");
    starBtn.title = "ปักหมุดติดตามพนักงานคนนี้";
    starBtn.onclick = (ev) => {
      ev.stopPropagation();
      toggleTrackedPerson(p.id);
    };

    pi.append(nm, sub, bars);
    row.append(pt, pi, starBtn);
    row.onclick = () => openPersonSheet(p.id);
    return row;
  }

  /* ---------- 1. Character Sheet Drawer (8 Tabs — JS2 Style + Compare Tab) ---------- */
  function renderCharacterSheet(v, body) {
    const p = v.people.find((x) => x.id === uiState.selectedPersonId) || v.people[0];
    if (!p) return;
    const isTracked = uiState.trackedIds.has(p.id);
    const id = p.identity || {};
    const car = p.career || { level: 1, badge: "Lv.1", titleTh: p.roleName, satisfaction: 76, kpiScore: 58, tasksCompleted: 0, bonusTotal: 0, promotions: 0, menteesHelped: 0 };
    byId("shTitle").textContent = `${isTracked ? "⭐ " : ""}${id.flag || "🇹🇭"} ${id.displayName || p.name} • ${car.badge} ${car.titleTh}`;

    setSheetTabs([
      { id: "vital", label: "สถานะชีพ" },
      { id: "identity", label: "ตัวตน/ค่านิยม" },
      { id: "aptitudes", label: "ความถนัด 30 ด้าน" },
      { id: "skills", label: "ทักษะ/สายงาน" },
      { id: "knowledge", label: "ความรู้" },
      { id: "news", label: "ข่าวที่รับรู้" },
      { id: "relations", label: "ความสัมพันธ์" },
      { id: "wallet", label: "กระเป๋า/เป้าหมาย" },
      { id: "chronicle", label: "บันทึกชีวิต" },
      { id: "compare", label: "เทียบกับ..." },
    ]);

    const nodes = [];

    const headCard = el("div", "card");
    const topRow = el("div", "");
    topRow.style.display = "flex";
    topRow.style.gap = "12px";
    topRow.style.alignItems = "center";

    const pt = el("canvas", "pt");
    pt.width = 64;
    pt.height = 64;
    if (typeof CampusRender !== "undefined") CampusRender.drawPortrait(pt, p);

    const meta = el("div", "");
    meta.style.flex = "1";
    const allBuildings = [
      ...(v.campus?.buildings || []),
      ...(v.campus?.expansionPlots || []),
    ];
    const bld = allBuildings.find((b) => b.id === p.buildingId);
    const titleLine = el(
      "div",
      "",
      `${id.flag || "🇹🇭"} ${id.fullName || p.name} (ชื่อเล่น: ${p.name})`,
    );
    titleLine.style.fontWeight = "700";
    titleLine.style.fontSize = "15px";

    const badgeRow = el("div", "");
    badgeRow.style.display = "flex";
    badgeRow.style.flexWrap = "wrap";
    badgeRow.style.gap = "4px";
    badgeRow.style.marginTop = "4px";
    badgeRow.append(
      el("span", "chip b", `${id.genderSymbol || "♂"} เพศ${id.genderTh || "ชาย"}`),
      el("span", "chip b", `🎂 อายุ ${id.age || 26} ปี`),
      el("span", "chip g", `${id.flag || "🇹🇭"} สัญชาติ${id.nationalityTh || "ไทย"} (${id.nationality || "TH"})`),
      el("span", "chip g", `🎖️ ${car.badge} ${car.titleTh}`),
      el("span", "chip", `🏛️ ${car.departmentTh || p.roleName}`),
      el("span", "chip ok", `😊 ความพึงพอใจ ${Math.round(car.satisfaction ?? 76)}%`),
      el("span", "chip", `📊 KPI ${Math.round(car.kpiScore ?? 58)}/100`),
    );

    const bgLine = el(
      "div",
      "muted",
      `🎓 ${id.educationTh || "เทคนิคอุตสาหกรรม"} • 📍 ภูมิลำเนา: ${id.hometownTh || "ไทย"} • หน้าที่หลัก: ${car.dutyTh || "ปฏิบัติงานตามสายวิชาชีพ"}`,
    );
    bgLine.style.marginTop = "4px";

    const locLine = el(
      "div",
      "muted",
      `${bld ? bld.icon + " " + bld.nameTh : ""} • ${p.isIndoors ? "ปฏิบัติงานในอาคาร" : "อยู่กลางแจ้ง"} • ค่าจ้าง ${money(p.pay.dailyWage)}/วัน${car.bonusTotal ? " • โบนัสสะสม " + money(car.bonusTotal) : ""}`,
    );
    const actLine = el(
      "div",
      "",
      `${p.emoji} ${p.activityLabelTh}${car.mentorName ? " • 🤝 รุ่นพี่พี่เลี้ยง: " + car.mentorName : ""}`,
    );
    actLine.style.color = "#eccf82";
    actLine.style.fontSize = "12.5px";
    actLine.style.marginTop = "2px";
    meta.append(titleLine, badgeRow, bgLine, locLine, actLine);

    const pinBtn = el("button", "btn" + (isTracked ? " pri" : ""), isTracked ? "⭐ ติดตามอยู่" : "☆ ปักหมุดติดตาม");
    pinBtn.onclick = () => toggleTrackedPerson(p.id);

    topRow.append(pt, meta, pinBtn);

    const switchRow = el("div", "");
    switchRow.style.marginTop = "8px";
    switchRow.style.display = "flex";
    switchRow.style.gap = "4px";
    switchRow.style.flexWrap = "wrap";
    for (const emp of v.people.filter((x) => x.employed).slice(0, 24)) {
      const trk = uiState.trackedIds.has(emp.id) ? "⭐" : emp.emoji;
      const chip = el("button", "chip" + (emp.id === p.id ? " g" : ""), `${trk} ${emp.name}`);
      chip.onclick = () => {
        uiState.selectedPersonId = emp.id;
        renderActiveSheet(current);
      };
      switchRow.append(chip);
    }
    headCard.append(topRow, switchRow);
    if(uiState.subTab !== "knowledge") nodes.push(headCard);

    if (uiState.subTab === "vital") {
      const thoughtCard = el("div", "card");
      thoughtCard.append(el("h3", "", "💭 ความคิดและเหตุผลการตัดสินใจล่าสุด"));
      for (const th of p.recentThoughts || []) {
        const item = el("div", "logrow", `• ${th}`);
        thoughtCard.append(item);
      }
      if (p.decision && p.decision.motives?.length) {
        const mWrap = el("div", "");
        mWrap.style.marginTop = "6px";
        for (const m of p.decision.motives.slice(0, 5)) {
          const dimName =
            m.labelTh ||
            (typeof CompanyData !== "undefined" && CompanyData.translateMotiveFactor
              ? CompanyData.translateMotiveFactor(m.factor)
              : null) ||
            v.catalog.dimensions.values.find((d) => d.id === m.factor)?.nameTh ||
            v.catalog.dimensions.personality.find((d) => d.id === m.factor)?.nameTh ||
            m.factor;
          mWrap.append(
            el(
              "span",
              "chip " + (m.amount >= 0 ? "ok" : "r"),
              `${dimName} ${m.amount >= 0 ? "+" : ""}${m.amount.toFixed(1)}`,
            ),
          );
        }
        thoughtCard.append(mWrap);
      }
      nodes.push(thoughtCard);

      const stateCard = el("div", "card");
      stateCard.append(
        el("h3", "", `❤️ สภาพร่างกายและจิตใจ 12 มิติ (อารมณ์: ${MOOD_NAMES_TH[p.affect?.mood] || p.affect?.mood || "ปกติ"})`),
      );
      for (const [key, label, inv] of STATE_LABELS) {
        stateCard.append(makeBarRow(label, p.state[key] ?? 0, null, inv));
      }
      nodes.push(stateCard);

      const roleCard = el("div", "card");
      roleCard.append(
        el("h3", "", `🎖️ เส้นทางสายอาชีพ โควตาแผนก ผลงาน KPI และโบนัส (${car.badge})`),
        makeBarRow("ความพึงพอใจในการทำงาน (Job Satisfaction)", car.satisfaction ?? 76, null, false),
        makeBarRow("ดัชนีผลงานรวม (KPI Score)", car.kpiScore ?? 58, null, false),
        el(
          "div",
          "logrow",
          `ระดับชั้น: [${car.gradeCode || "G1"} / ${car.badge}] ${car.titleTh} (${car.tierNameTh || "ระดับปฏิบัติการ"})`,
        ),
        el(
          "div",
          "logrow",
          `ผังสายบังคับบัญชา 4 ชั้น: ${car.orgPathTh || (car.divisionNameTh + " › " + car.departmentTh)} • แผนก: ${car.sectionTh || car.departmentTh} • กลุ่มงาน: ${car.groupTh || "กลุ่มหลัก"}`,
        ),
        el(
          "div",
          "logrow",
          `ค่าจ้าง ${moneyFull(p.pay.dailyWage)}/วัน • โบนัสสะสม ${moneyFull(car.bonusTotal || 0)} • งานสำเร็จ ${car.tasksCompleted || 0} งาน${car.dealsNegotiated ? " • ปิดดีล B2B " + car.dealsNegotiated + " สัญญา" : ""}${car.poIssued ? " • ออกใบ PO " + car.poIssued + " รายการ" : ""} • เลื่อนขั้นแล้ว ${car.promotions || 0} ครั้ง`,
        ),
      );
      if (car.headroom) {
        roleCard.append(
          el(
            "div",
            "logrow",
            `🏢 โควตาตำแหน่งในแผนก: ${car.headroom.reason} (ครองตำแหน่งอยู่ ${car.headroom.currentCount}/${car.headroom.maxQuota} อัตรา)`,
          ),
        );
      }
      if (car.nextLevel) {
        roleCard.append(
          el(
            "div",
            "muted",
            `🎯 เกณฑ์เลื่อนตำแหน่งถัดไป (${car.nextLevel.badge} ${car.nextLevel.titleTh}): ประเมินโดยหัวหน้างาน/CEO • งานสำเร็จ ${car.tasksCompleted || 0}/${car.nextLevel.minTasks} งาน • ทักษะสายงาน ≥ ${car.nextLevel.minSkill} • อายุงาน ≥ ${car.nextLevel.minTenureDays} วัน (+฿${((car.nextLevel.wageBonus || 0) / 100).toLocaleString("th-TH")}/วัน)`,
          ),
        );
      } else {
        roleCard.append(el("div", "muted", "🌟 ดำรงตำแหน่งระดับสูงสุดของสายงานแล้ว"));
      }
      if (car.history && car.history.length > 0) {
        const hTitle = el("h4", "", "📜 ประวัติการประเมินเลื่อนตำแหน่งโดยหัวหน้างาน");
        hTitle.style.margin = "8px 0 4px";
        hTitle.style.color = "#fef3c7";
        roleCard.append(hTitle);
        for (const h of car.history.slice(0, 3)) {
          roleCard.append(
            el(
              "div",
              "logrow",
              `วันที่ ${h.day}: เลื่อนเป็น ${h.titleTh} (ค่าจ้าง ${money(h.newWage)}/วัน) • ผู้ประเมิน: ${h.evaluatorName || "หัวหน้างาน"} • เหตุผล: ${h.rationale || "ผลงานตามเกณฑ์"}`,
            ),
          );
        }
      }
      nodes.push(roleCard);
    } else if (uiState.subTab === "identity") {
      const valCard = el("div", "card");
      valCard.append(el("h3", "", "🌟 คุณค่าชีวิต 18 มิติ (และขีดความอิ่มเอมปัจจุบัน)"));
      const satMarker = clamp((p.state.fulfillment * 0.6 + p.state.morale * 0.4), 10, 95);
      for (const d of v.catalog.dimensions.values) {
        valCard.append(makeBarRow(d.nameTh, p.profile.values[d.id], satMarker, false));
      }
      valCard.append(
        el("div", "muted", "ขีดขาว = ระดับความอิ่มเอมในคุณค่าปัจจุบัน (ยิ่งค่านิยมสูง พนักงานยิ่งเลือกงานที่ตอบโจทย์ด้านนั้น)"),
      );
      nodes.push(valCard);

      const perCard = el("div", "card");
      perCard.append(el("h3", "", "🧭 บุคลิกภาพ 14 มิติ (HEXACO Core 1.0.0)"));
      for (const d of v.catalog.dimensions.personality) {
        perCard.append(makeBarRow(d.nameTh, p.profile.personality[d.id], null, d.id === "stressReactivity"));
      }
      nodes.push(perCard);
    } else if (uiState.subTab === "aptitudes") {
      const nameMap = Object.fromEntries(v.catalog.dimensions.aptitudes.map((d) => [d.id, d.nameTh]));
      for (const grp of APTITUDE_GROUPS) {
        const c = el("div", "card");
        c.append(el("h3", "", grp.title));
        for (const k of grp.keys) {
          if (p.profile.aptitudes[k] === undefined) continue;
          c.append(
            makeBarRow(
              nameMap[k] || k,
              p.profile.aptitudes[k],
              p.profile.potential?.[k] ?? null,
              false,
            ),
          );
        }
        c.append(el("div", "muted", "แถบสี = ความถนัดตั้งต้น | ขีดขาว = เพดานศักยภาพสูงสุด (Potential)"));
        nodes.push(c);
      }
    } else if (uiState.subTab === "skills") {
      const skCard = el("div", "card");
      skCard.append(el("h3", "", "🛠️ ทักษะวิชาชีพที่ฝึกฝนได้ (Learned Skills)"));
      for (const s of v.catalog.skills) {
        const rec = p.skills[s.id] || { level: 0, totalXp: 0 };
        const cap =
          typeof CompanyCore !== "undefined"
            ? CompanyCore.skillCap(p.profile, s)
            : 100;
        const item = el("div", "skill-item");
        item.append(makeBarRow(s.nameTh, rec.level, cap, false));
        const desc = SKILL_DESCRIPTIONS[s.id] || {
          eff: "เพิ่มความเร็วและคุณภาพในงานเฉพาะทาง",
          train: "ปฏิบัติงานจริงในสถานีที่เกี่ยวข้อง",
        };
        item.append(
          el(
            "div",
            "skill-sub",
            `${desc.eff} • XP สะสม ${rec.totalXp.toFixed(0)} (เพดานศักยภาพ ${cap.toFixed(0)})`,
          ),
          el("div", "skill-sub", `ฝึกได้จาก: ${desc.train}`),
        );
        skCard.append(item);
      }
      nodes.push(skCard);
    } else if (uiState.subTab === "news") {
      const card=el("div","card");card.append(el("h3","","ข่าวที่ตัวละครรับรู้"),el("p","muted","แต่ละคนมีเวลาอ่านและความเข้าใจต่างกัน ข่าวที่ยังไม่ได้อ่านจะไม่เข้าความรู้ของเขา"));
      for(const n of (p.news?.known||[]).slice())card.append(el("div","logrow",`วันที่ ${Math.floor((n.readAt||0)/1440)+1} • ${n.headlineTh||n.id} — ${n.interpretationTh||'กำลังประเมินข้อมูล'}`));
      if(!p.news?.known?.length)card.append(el("p","muted","ยังไม่มีข่าวที่อ่านในบันทึก"));nodes.push(card);
    } else if (uiState.subTab === "knowledge") {
      const ed=p.education || {subjects:{},practiceMinutes:{}},k=v.companyKnowledge;
      const heading=el("div","card");
      heading.append(el("h3","",`📚 ความรู้ของ ${p.name}`),el("div","muted","Lv1 เริ่มเรียน/พื้นฐาน • Lv2 ปฏิบัติได้ • Lv3 ขั้นสูง • Lv4 ผู้เชี่ยวชาญ • Lv5 เชี่ยวชาญสูง ทุกวิชาเป็นความรู้ส่วนตัว แม้บริษัทยังไม่มีงานที่ใช้"));
      if(ed.course) heading.append(el("div","logrow",`กำลังเรียนเพื่อบริษัท: ${k.subjects[ed.course]} → ${ed.courseLevel || 40}/100`));
      heading.append(el("div","muted",`ความสนใจส่วนตัว: ${(ed.interests || []).map(id=>k.subjects[id]).join(" • ") || "ยังไม่มีข้อมูล"} • ศึกษานอกงาน ${Math.floor((ed.personalStudyMinutes || 0)/60)} ชั่วโมง`));
      nodes.push(heading);
      const linked=v.companyKnowledge.people.find(q=>q.id===p.id);
      for(const [id,level] of Object.entries(ed.subjects).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1])) {
        const lv=level>=95 ? 5 : level>=80 ? 4 : level>=60 ? 3 : level>=40 ? 2 : 1;
        const row=el("div","card");row.append(el("h3","",`${k.subjects[id]} · Lv${lv}`),makeBarRow("ความชำนาญ",level,null,false));
        const spec=k.subjectSpecs.find(s=>s.id===id),insight=linked?.subjectInsights.find(s=>s.id===id);
        const used=k.products.some(product=>product.ready&&Object.hasOwn(product.requirements || {},id));
        row.append(el("div","muted",`ฝึก/ศึกษา ${Math.floor((ed.practiceMinutes[id] || 0)/60)} ชม. • งานจริง ${Math.floor((ed.appliedMinutes?.[id] || 0)/60)} ชม. • ความเหมาะสมจากความถนัด ${Math.round(insight?.talent || 0)}/100 • ${used ? "เกี่ยวข้องกับสินค้าที่ทีมพร้อมทำ" : "ความรู้ติดตัว; อาจใช้กับงานอื่นหรือโอกาสใหม่"}`),el("div","muted",spec.effectTh));
        nodes.push(row);
      }
    } else if (uiState.subTab === "relations") {
      const relCard = el("div", "card");
      relCard.append(el("h3", "", "🤝 ความสัมพันธ์และความไว้วางใจกับเพื่อนร่วมทีม"));
      const others = v.people.filter((x) => x.id !== p.id).slice(0, 30);
      for (const o of others) {
        const rel = p.relationships[o.id] || { trust: 0, familiarity: 0 };
        const item = el("div", "skill-item");
        const top = el("div", "");
        top.style.display = "flex";
        top.style.justifyContent = "space-between";
        top.append(
          el("strong", "", `${o.emoji || "👤"} ${o.name} (${o.roleName})`),
          el(
            "span",
            "chip " + (rel.trust >= 15 ? "ok" : rel.trust < 0 ? "r" : "b"),
            `ความเชื่อใจ ${rel.trust >= 0 ? "+" : ""}${rel.trust.toFixed(1)}`,
          ),
        );
        item.append(
          top,
          makeBarRow("ความคุ้นเคย (Familiarity)", rel.familiarity, null, false),
          makeBarRow("ความไว้วางใจ (Trust)", clamp(rel.trust + 50, 0, 100), 50, false),
        );
        relCard.append(item);
      }
      nodes.push(relCard);
    } else if (uiState.subTab === "wallet") {
      const finCard = el("div", "card");
      finCard.append(el("h3", "", "💰 กระเป๋าเงินส่วนตัวและเป้าหมายชีวิต"));
      const goalId = p.aspirations?.primaryGoal || "emergencyFund";
      const goalLabel = GOAL_NAMES_TH[goalId] || goalId;
      const ratio = clamp((p.aspirations?.progressRatio || 0) * 100, 0, 100);
      finCard.append(
        makeBarRow(`เป้าหมาย: ${goalLabel}`, ratio, 100, false),
        el(
          "div",
          "muted",
          `เงินเก็บในกระเป๋า: ${moneyFull(p.pay.wallet)} / เป้าหมาย ${moneyFull(p.aspirations?.targetSavings || 0)} • แรงถีบตัว (Hustle) ${Math.round(p.aspirations?.hustleDrive || 50)}`,
        ),
      );
      const g2 = el("div", "grid2");
      g2.style.marginTop = "8px";
      g2.append(
        el("div", "pill", `ค่าจ้าง/วัน: ${money(p.pay.dailyWage)}`),
        el("div", "pill", `รอรับวันเงินเดือนออก: ${money(p.pay.dueBase + p.pay.dueOT)}`),
        el("div", "pill", `รายรับสะสม: ${money(p.pay.totalPaid)}`),
        el("div", "pill", `ค่าครองชีพใช้จ่ายสะสม: ${money(p.pay.outsideSpending)}`),
      );
      finCard.append(g2);
      nodes.push(finCard);

      const gearCard = el("div", "card");
      gearCard.append(el("h3", "", "🎒 อุปกรณ์ประจำตำแหน่งและทรัพย์สินส่วนตัว"));
      const grid = el("div", "inv-grid");
      const items = [
        { tag: "ประจำตัว", status: "สวม", ic: "🪪", nm: "บัตรพนักงาน", qty: "×1" },
        {
          tag: "เครื่องมือ",
          status: "สวม",
          ic:
            p.role === "assembler"
              ? "🔧"
              : p.role === "inspector"
                ? "🔍"
                : p.role === "engineer"
                  ? "💻"
                  : p.role === "sales"
                    ? "📱"
                    : "📋",
          nm: `ชุดอุปกรณ์${p.roleName}`,
          qty: "×1",
        },
        {
          tag: "การเงิน",
          status: "พกพา",
          ic: "👛",
          nm: "กระเป๋าเงิน",
          qty: money(p.pay.wallet),
        },
        {
          tag: "สวัสดิการ",
          status: v.policies.wellbeingDaily > 0 ? "ได้รับ" : "พื้นฐาน",
          ic: "🍱",
          nm: "คูปองโรงอาหาร",
          qty: money(v.policies.wellbeingDaily),
        },
      ];
      for (const it of items) {
        const cell = el("div", "inv-cell sel");
        cell.append(
          el("span", "inv-b-tl", it.tag),
          el("span", "inv-b-tr", it.status),
          el("div", "ic", it.ic),
          el("div", "nm", it.nm),
          el("span", "inv-b-br", it.qty),
        );
        grid.append(cell);
      }
      gearCard.append(grid);
      nodes.push(gearCard);
    } else if (uiState.subTab === "chronicle") {
      const logCard = el("div", "card");
      logCard.append(el("h3", "", `📜 บันทึกการปฏิบัติงานและชีวิตของ ${p.name}`));
      const myTasks = [...(v.taskHistory || [])]
        .filter((t) => t.personId === p.id)
        .reverse();
      const myEvents = [...(v.events || [])]
        .filter((e) => e.details?.personId === p.id || (e.message && e.message.includes(p.name)))
        .reverse();

      for (const th of p.recentThoughts || []) {
        const r = el("div", "logrow");
        r.append(el("span", "tm", `วันที่ ${v.time.day}`), el("span", "actor", p.name + " "), el("span", "", th));
        logCard.append(r);
      }
      if (p.aspiration) {
        const r = el("div", "logrow");
        r.append(
          el("span", "tm", `เป้าหมายชีวิต`),
          el("strong", "", ` ${p.aspiration.titleTh} (${p.aspiration.progressPct || 0}%) `),
          el("span", "muted", p.aspiration.descTh || ""),
        );
        logCard.append(r);
      }
      for (const mem of (p.memories || []).slice(0, 10)) {
        const r = el("div", "logrow");
        r.append(
          el("span", "tm", `วันที่ ${mem.day} (ความทรงจำ)`),
          el("span", "actor", "🧠 "),
          el("span", "", mem.textTh),
        );
        logCard.append(r);
      }
      for (const e of myEvents.slice(0, 12)) {
        const r = el("div", "logrow");
        const d = Math.floor(e.at / 1440) + 1;
        r.append(
          el("span", "tm", `วันที่ ${d} ${formatTime(e.at % 1440)}`),
          el("span", "", e.message),
        );
        logCard.append(r);
      }
      for (const t of myTasks.slice(0, 15)) {
        const r = el("div", "logrow");
        const d = Math.floor(t.at / 1440) + 1;
        r.append(
          el("span", "tm", `วันที่ ${d} ${formatTime(t.at % 1440)}`),
          el("span", "actor", p.name + " "),
          el("span", "", `ดำเนินงาน ${t.kind} สำเร็จลุล่วง${t.orderId ? " (" + t.orderId + ")" : ""}`),
        );
        logCard.append(r);
      }
      nodes.push(logCard);
    } else if (uiState.subTab === "compare") {
      const others = v.people.filter((x) => x.employed && x.id !== p.id);
      const other = others.find((x) => x.id === uiState.compareTargetId) || others[0];
      const cmpCard = el("div", "card");
      cmpCard.append(el("h3", "", `⚖️ เปรียบเทียบข้อมูลเชิงลึกของ ${p.name} กับเพื่อนร่วมงาน`));

      if (!other) {
        cmpCard.append(el("div", "muted", "ยังไม่มีพนักงานคนอื่นสำหรับเปรียบเทียบ"));
        nodes.push(cmpCard);
      } else {
        uiState.compareTargetId = other.id;
        const selWrap = el("div", "sw");
        selWrap.append(el("span", "", "เลือกพนักงานที่จะเปรียบเทียบ:"));
        const sel = el("select");
        sel.style.width = "200px";
        for (const o of others.slice(0, 60)) {
          const opt = el("option", "", `${o.name} (${o.roleName})`);
          opt.value = o.id;
          sel.append(opt);
        }
        sel.value = other.id;
        sel.onchange = () => {
          uiState.compareTargetId = sel.value;
          renderActiveSheet(current);
        };
        selWrap.append(sel);
        cmpCard.append(selWrap);

        const cmp =
          typeof CompanyAPI !== "undefined" && CompanyAPI.compareEmployees
            ? CompanyAPI.compareEmployees(p, other)
            : null;

        if (cmp) {
          for (const section of [
            { title: "🛠️ ทักษะวิชาชีพ (Learned Skills)", rows: cmp.skills },
            { title: "❤️ สถานะร่างกายและจิตใจหลัก", rows: cmp.vitality },
            { title: "🧭 บุคลิกภาพ 14 มิติ", rows: cmp.personality },
            { title: "🌟 คุณค่าชีวิต 18 มิติ", rows: cmp.values },
            { title: "🧠 ความถนัด 30 ด้าน", rows: cmp.aptitudes },
          ]) {
            const secCard = el("div", "card");
            secCard.append(
              el("h3", "", `${section.title} (${p.name} เทียบกับ ${other.name})`),
            );
            for (const row of section.rows) {
              const r = el("div", "logrow");
              r.style.display = "flex";
              r.style.justifyContent = "space-between";
              r.style.alignItems = "center";
              const dSign = row.delta > 0 ? `+${row.delta}` : String(row.delta);
              const chipCls = row.delta > 3 ? "ok" : row.delta < -3 ? "r" : "b";
              r.append(
                el("span", "", row.nameTh),
                el(
                  "span",
                  "",
                  `${p.name}: ${row.a} | ${other.name}: ${row.b} `,
                ),
                el("span", `chip ${chipCls}`, dSign),
              );
              secCard.append(r);
            }
            nodes.push(secCard);
          }
        }
        nodes.unshift(cmpCard);
      }
    }

    body.replaceChildren(...nodes);
  }

  /* ---------- 2. Building Inspect Drawer (When Clicking a Building or Expansion Plot on Map) ---------- */
  function renderBuildingSheet(v, body) {
    const allBuildings = [
      ...(v.campus?.buildings || []),
      ...(v.campus?.expansionPlots || []),
    ];
    const b = allBuildings.find((x) => x.id === uiState.selectedBuildingId) || allBuildings[0];
    if (!b) return;
    byId("shTitle").textContent = `${b.icon} ${b.nameTh}`;

    setSheetTabs([
      { id: "inside", label: "ภายในอาคาร & ผู้คน" },
      { id: "stations", label: "สถานีและเครื่องจักร" },
      { id: "manage", label: "สลับดูอาคารอื่น" },
    ]);

    const nodes = [];
    const headCard = el("div", "card");
    const isPlot = Boolean(b.cost !== undefined && b.constructed !== undefined);
    headCard.append(
      el(
        "h3",
        "",
        `${b.icon} ${b.nameTh}${b.id === "gate" || isPlot ? "" : ` • ระดับ ${b.level}`} (${b.subtitleTh})`,
      ),
      el(
        "div",
        "muted",
        isPlot && !b.constructed
          ? `สถานะ: แปลงที่ดินรอการก่อสร้าง (งบลงทุน ${money(b.cost)}) • ผลประโยชน์: ${b.benefitTh}`
          : `พนักงานประจำ/ในอาคารตอนนี้: ${b.totalAssignedCount} คน (อยู่ในตัวอาคาร ${b.indoorCount} คน) • งานที่กำลังเดินเครื่อง ${b.activeJobCount} งาน`,
      ),
    );
    const benefits = {
      hq: "ระดับที่สูงขึ้นช่วยให้งานขาย B2B และจัดซื้อ/บัญชีคืบหน้าเร็วขึ้น",
      factory: "ระดับที่สูงขึ้นช่วยให้งานประกอบ ซ่อม และตรวจคุณภาพคืบหน้าเร็วขึ้น",
      warehouse: "ระดับที่สูงขึ้นช่วยให้งานแพ็กและจัดส่งคืบหน้าเร็วขึ้น",
      rnd: "ระดับที่สูงขึ้นช่วยให้งานวิจัยคืบหน้าเร็วขึ้น",
      canteen: "โรงอาหารระดับสูงช่วยลดความหิวระหว่างมื้ออาหารมากขึ้น",
      courtyard: "สวนระดับสูงช่วยให้พนักงานคลายเครียดและฟื้นพลังได้มากขึ้น",
      training: "พนักงานที่ว่างสามารถเดินมาฝึกทักษะที่นี่; ระดับสูงช่วยเพิ่มผลการฝึก",
    };
    if (benefits[b.id]) headCard.append(el("div", "muted", benefits[b.id]));
    if (b.benefitTh && b.constructed) headCard.append(el("div", "muted", `✅ เปิดใช้งานแล้ว: ${b.benefitTh}`));
    if (b.id === "training") headCard.append(el("div", "muted", `เวลาฝึกสะสม ${v.campus.trainingMinutes} นาที`));
    const decision = v.campus?.facilityDecision;
    if (decision && decision.facilityId === b.id) {
      const ceo = v.people.find((p) => p.id === decision.personId);
      headCard.append(el("div", "logrow", `${ceo?.name || "ผู้บริหาร"}: ${decision.decision === "upgrade" ? "ตัดสินใจลงทุน" : "รอการลงทุน"} • ${decision.reason} • งบ ${money(decision.cost)}`));
    }
    nodes.push(headCard);

    if (uiState.subTab === "inside") {
      const specCard = el("div", "card");
      if (b.id === "hq" || b.id === "execAnnex" || b.id === "expoHall") {
        specCard.append(el("h3", "", "📊 สถานะฝ่ายบริหาร ฝ่ายขาย B2B และฝ่ายจัดซื้อ/บัญชี"));
        specCard.append(
          el(
            "div",
            "muted",
            `ข้อเสนอคู่ค้าที่ฝ่ายขายกำลังประเมิน: ${v.offers.length} ดีล • ออเดอร์กำลังผลิต: ${v.orders.filter((o) => o.status === "accepted").length} รายการ • รายรับรอเก็บ (Invoices): ${moneyFull(v.company.receivable)}`,
          ),
        );
        for (const o of v.offers.slice(0, 6)) {
          const prod = v.catalog.products.find((p) => p.id === o.productId);
          specCard.append(
            el(
              "div",
              "logrow",
              `💼 ${o.customerName}: สั่ง ${prod?.nameTh || o.productId} ×${o.quantity} ชิ้น (${money(o.unitPrice)}/ชิ้น) • ${o.negotiatedBy ? "เจรจาโดย " + o.negotiatedBy + " (คะแนนดีล " + o.salesPitchScore + ")" : "ฝ่ายขายประเมินอัตโนมัติ"}`,
            ),
          );
        }
      } else if (["factory", "prodLineB", "prodLineC", "prodLineD", "maintWorkshop", "qaLab"].includes(b.id)) {
        specCard.append(el("h3", "", "⚙️ สถิติสายการผลิต เครื่องจักร และการตรวจสอบคุณภาพ (QC)"));
        const completed = Object.values(v.production.completed || {}).reduce((a, n) => a + n, 0);
        const shipped = Object.values(v.production.shipped || {}).reduce((a, n) => a + n, 0);
        const scrapped = Object.values(v.production.scrapped || {}).reduce((a, n) => a + n, 0);
        specCard.append(
          el(
            "div",
            "muted",
            `สภาพเครื่องจักร: ${v.campus.machineCondition}% • ประกอบสำเร็จสะสม: ${completed} ชิ้น • ส่งมอบแล้ว: ${shipped} ชิ้น • ตัดเป็นของเสีย (Scrap): ${scrapped} ชิ้น`,
          ),
        );
        for (const j of v.jobs.filter((x) => ["assembly", "rework", "qa"].includes(x.kind)).slice(0, 8)) {
          const worker = v.people.find((p) => p.id === j.assignee);
          specCard.append(
            makeBarRow(
              `${j.kind.toUpperCase()} (${worker ? worker.name : "รอช่าง"})`,
              j.fraction * 100,
              null,
              false,
            ),
          );
        }
      } else if (["warehouse", "rawDepot", "dispatchHub"].includes(b.id)) {
        specCard.append(el("h3", "", "📦 สต็อกวัตถุดิบ สินค้าสำเร็จรูป และขบวนรถขนส่งโลจิสติกส์"));
        const grid = el("div", "inv-grid");
        for (const m of v.catalog.materials) {
          const qty = v.inventory.materials[m.id] || 0;
          const res = v.inventory.reserved[m.id] || 0;
          const cell = el("div", "inv-cell");
          cell.append(
            el("span", "inv-b-tl", "วัตถุดิบ"),
            el("span", "inv-b-tr", `จอง ${res}`),
            el("div", "ic", "🔩"),
            el("div", "nm", m.nameTh),
            el("span", "inv-b-br", `×${qty}`),
          );
          grid.append(cell);
        }
        for (const prod of v.catalog.products) {
          const fin = v.inventory.finished[prod.id] || 0;
          const cell = el("div", "inv-cell sel");
          cell.append(
            el("span", "inv-b-tl", "พร้อมส่ง"),
            el("span", "inv-b-tr", "QC ผ่าน"),
            el("div", "ic", "📦"),
            el("div", "nm", prod.nameTh),
            el("span", "inv-b-br", `×${fin}`),
          );
          grid.append(cell);
        }
        specCard.append(grid);
        const transits = (v.logistics?.inboundShipments || []).filter((p) => p.status !== "received");
        for (const tr of transits.slice(0, 6)) {
          specCard.append(
            el(
              "div",
              "logrow",
              `🚚 [${tr.truckPlate}] ${tr.supplierNameTh}: ส่ง ${tr.materialNameTh} ×${tr.quantity} ชิ้น • สถานะ: ${tr.status === "transit" ? "กำลังวิ่งมาที่คลัง" : "กำลังออกใบ PO"}`,
            ),
          );
        }
      } else if (b.id === "canteen" || b.id === "dormitory") {
        specCard.append(el("h3", "", "🍱 บรรยากาศโรงอาหาร หอพัก และสวัสดิการพนักงาน"));
        specCard.append(
          el(
            "div",
            "muted",
            `งบสวัสดิการอาหารกลางวันปัจจุบัน: ${money(v.policies.wellbeingDaily)}/คน/วัน • พนักงานจะเดินมากินมื้อเที่ยงเวลา 12:00–13:00 น. และพักผ่อนฟื้นฟูกำลังใจ`,
          ),
        );
      } else if (b.id === "rnd") {
        specCard.append(el("h3", "", "🔬 ความก้าวหน้าการวิจัยและพัฒนา (R&D Lab)"));
        specCard.append(
          el("div","muted",`โครงการเฉพาะทาง ${v.companyKnowledge?.projects?.length || 0} โครงการ — ดูที่หน้าบริษัท`),
        );
        for (const prod of v.catalog.products) {
          specCard.append(
            el(
              "div",
              "logrow",
              `${prod.unlocked ? "✅ ปลดล็อกแล้ว" : "🔒 กำลังวิจัย"}: ${prod.nameTh} (ราคาขาย ${money(prod.priceMin)}–${money(prod.priceMax)} | ต้นทุน BOM ${money(prod.bomCost)})`,
            ),
          );
        }
      } else {
        specCard.append(el("h3", "", "🌿 พื้นที่ส่วนกลางและโครงสร้างพื้นฐานนิคม"));
        specCard.append(
          el(
            "div",
            "muted",
            `พนักงานที่อยู่ในเวลางาน: ${v.people.filter((p) => p.employed && p.atWork).length} / ${v.people.filter((p) => p.employed).length} คน`,
          ),
        );
      }
      nodes.push(specCard);

      const occCard = el("div", "card");
      const occupants = v.people.filter((p) => p.employed && p.buildingId === b.id);
      occCard.append(el("h3", "", `👥 พนักงานใน${b.shortNameTh} (${occupants.length} คน)`));
      if (!occupants.length) {
        occCard.append(el("div", "muted", "ขณะนี้ไม่มีพนักงานอยู่ในอาคารนี้"));
      } else {
        for (const p of occupants.slice(0, 40)) occCard.append(makePersonRow(v, p));
      }
      nodes.push(occCard);
    } else if (uiState.subTab === "stations") {
      const stCard = el("div", "card");
      stCard.append(el("h3", "", "🏭 สถานีทำงานภายในอาคาร"));
      const stations = Object.values(v.scene.layout.stations).filter(
        (s) => (b.stationIds || []).includes(s.id) || (b.stationKinds || []).includes(s.kind),
      );
      for (const s of stations) {
        const workers = v.people.filter((p) => p.employed && p.stationId === s.id);
        const r = el("div", "logrow");
        r.append(
          el("strong", "", `สถานี ${s.id} (${s.kind})`),
          el(
            "div",
            "muted",
            `ความจุ ${workers.length}/${s.capacity} คน • ผู้ใช้งาน: ${workers.slice(0, 10).map((w) => w.name).join(", ") || "ว่าง"}${workers.length > 10 ? ` (+อีก ${workers.length - 10} คน)` : ""}`,
          ),
        );
        stCard.append(r);
      }
      nodes.push(stCard);
    } else if (uiState.subTab === "manage") {
      const navCard = el("div", "card");
      navCard.append(el("h3", "", "🏢 เลือกตรวจสอบอาคารอื่นในนิคม"));
      for (const other of allBuildings) {
        const row = el("div", "prow");
        row.append(
          el("div", "nm", `${other.icon} ${other.nameTh}`),
          el("span", "chip g", `👥 ${other.totalAssignedCount || 0} คน`),
        );
        row.onclick = () => openBuildingSheet(other.id);
        navCard.append(row);
      }
      nodes.push(navCard);
    }

    body.replaceChildren(...nodes);
  }

  /* ---------- 2.5 External Assets & Multi-Stage Production Chains View ---------- */
  function renderExternalAssetsAndChainsView(v) {
    const ap = v.externalWorld?.assetPortfolio || {
      supplyChainStrategy: "balanced_hybrid",
      ownedAssets: {},
      harvestHistory: [],
      chainHistory: [],
      totalHarvestedUnits: 0,
      totalRefinedUnits: 0,
      totalChainSavingsSatang: 0,
      totalAssetDividendsSatang: 0,
    };
    const assets = v.catalog?.externalAssets || [];
    const chains = v.catalog?.productionChains || [];
    const strategies = v.catalog?.supplyChainStrategies || [];
    const bonuses = v.catalog?.activeAssetBonuses || {};
    const ownedCount = assets.filter((a) => a.owned).length;

    // Card 1: Executive Make-or-Buy Strategy & Portfolio Summary
    const stratCard = el("div", "card");
    stratCard.append(
      el("h3", "", `🌾 หมวดสินทรัพย์ภายนอกนิคม & ห่วงโซ่การผลิตลูกโซ่ (ถือครองแล้ว ${ownedCount}/${assets.length} แห่ง)`),
      el(
        "div",
        "muted",
        "บริษัทสามารถเลือกกลยุทธ์ได้อย่างอิสระ: จะผลิตสินค้าปลายน้ำ (เช่น ขนมปังโฮลเกรน เบเกอรี่ ชิป AI) โดยสั่งซื้อวัตถุดิบกลางน้ำจากตลาดทั้งหมดก็ได้ หรือจะลงทุนซื้อสินทรัพย์ต้นน้ำ (ไร่ข้าว สวนปาล์ม ไร่อ้อย เหมืองแร่) เพื่อส่งผลผลิตเข้าโรงโม่/โรงกลั่นแปรรูปกลางน้ำของบริษัทเองก็ได้ตามวิสัยทัศน์และเงินทุน",
      ),
      el(
        "div",
        "logrow",
        `📦 ผลผลิตต้นน้ำเก็บเกี่ยวเข้าคลังสะสม: ${ap.totalHarvestedUnits || 0} ชิ้น • ⚙️ แปรรูปวัตถุดิบกลางน้ำสะสม: ${ap.totalRefinedUnits || 0} ชิ้น • 💰 ประหยัดต้นทุนเทียบซื้อตลาด: ${moneyFull(ap.totalChainSavingsSatang || 0)} • 💵 ปันผลสุทธิจากสินทรัพย์: ${moneyFull(ap.totalAssetDividendsSatang || 0)}`,
      ),
      el(
        "div",
        "logrow",
        `⚡ ผลกระทบเชิงปฏิบัติการรวม: ลดค่าเช่า/ค่าไฟนิคม -${Math.round((bonuses.rentReductionPct || 0) * 100)}% • เร่งความเร็วผลิต +${Math.round((bonuses.productionSpeedBonus || 0) * 100)}% • เร่งแพ็กกิ้ง +${Math.round((bonuses.packingSpeedBonus || 0) * 100)}% • ลดเวลารอวัตถุดิบนำเข้า -${Math.round((bonuses.leadTimeReductionPct || 0) * 100)}% • โบนัสราคาขาย B2B +${Math.round((bonuses.pricePremiumBonus || 0) * 100)}%`,
      ),
    );

    const stratRow = el("div", "");
    stratRow.style.display = "flex";
    stratRow.style.flexWrap = "wrap";
    stratRow.style.gap = "6px";
    stratRow.style.marginTop = "8px";
    for (const st of strategies) {
      const isCur = (ap.supplyChainStrategy || "balanced_hybrid") === st.id;
      const btn = el("button", "chip" + (isCur ? " g" : ""), `${st.icon} ${st.nameTh}`);
      btn.onclick = () =>
        dispatch(
          { type: "setSupplyChainStrategy", strategyId: st.id },
          `ปรับวิสัยทัศน์ห่วงโซ่อุปทานเป็น "${st.shortNameTh}" แล้ว`,
        );
      stratRow.append(btn);
    }
    stratCard.append(stratRow);

    // Card 2: Multi-Stage Production Chains (Upstream -> Midstream -> Downstream)
    const chainCard = el("div", "card");
    const refineNowBtn = el("button", "btn pri", "⚙️ เดินเครื่องแปรรูปวัตถุดิบกลางน้ำ (T0➔T1)");
    refineNowBtn.style.marginBottom = "8px";
    refineNowBtn.style.marginRight = "6px";
    refineNowBtn.onclick = () =>
      dispatch(
        { type: "runMidstreamRefining" },
        "สั่งเดินเครื่องแปรรูปวัตถุดิบต้นน้ำเป็นวัตถุดิบกลางน้ำแล้ว",
      );
    const batchCraftBtn = el("button", "btn pri", "⚡ แปรรูปรวดเดียวครบทุกขั้น (Batch Craft T1➔T3)");
    batchCraftBtn.style.marginBottom = "8px";
    batchCraftBtn.onclick = () =>
      dispatch(
        { type: "batchCraftAll", batches: 2 },
        "สั่งเดินเครื่องแปรรูปวัตถุดิบแบบ Batch ครบทุกขั้น (T1➔T3) แล้ว",
      );
    chainCard.append(
      el("h3", "", "🔗 ห่วงโซ่การผลิตแบบลูกโซ่ 8 สาย (ต้นน้ำ ➔ แปรรูปกลางน้ำ ➔ สินค้าปลายน้ำ)"),
      el("div", "muted", "เปิด/ปิดการแปรรูปกลางน้ำแต่ละสายได้อิสระ หากปิดหรือไม่มีวัตถุดิบต้นน้ำ ฝ่ายจัดซื้อจะสั่งซื้อวัตถุดิบกลางน้ำจากซัพพลายเออร์ภายนอกแทนโดยอัตโนมัติ"),
      refineNowBtn,
      batchCraftBtn,
    );

    for (const ch of chains) {
      const box = el("div", "logrow");
      const top = el("div", "");
      top.style.display = "flex";
      top.style.justifyContent = "space-between";
      top.style.alignItems = "center";
      top.style.flexWrap = "wrap";
      top.style.gap = "6px";
      top.append(
        el("strong", "", `${ch.icon} ${ch.nameTh}`),
        el(
          "span",
          "chip " + (ch.upstreamOwned ? "ok" : "b"),
          ch.upstreamOwned ? `✅ มี${ch.upstreamAssetNameTh}แล้ว` : `🛒 ยังไม่มีสินทรัพย์ต้นน้ำ (ซื้อตลาดได้)`,
        ),
      );
      const toggleBtn = el(
        "button",
        "chip " + (ch.enabled ? "g" : "r"),
        ch.enabled ? "🟢 โหมดผลิตเอง (Make + Buy เสริม)" : "⚪ โหมดซื้อสำเร็จรูปล้วน (Buy Only)",
      );
      toggleBtn.onclick = () =>
        dispatch(
          { type: "toggleProductionChain", chainId: ch.id, enabled: !ch.enabled },
          `สลับโหมดห่วงโซ่ "${ch.shortNameTh}" แล้ว`,
        );
      top.append(toggleBtn);

      box.append(
        top,
        el("div", "", `• ขั้นต้นน้ำ ➔ กลางน้ำ: ใช้ [${ch.inputsTh}] แปรรูปเป็น [${ch.outputsTh}] (สำเร็จแล้ว ${ch.batchesCompleted} ล็อต • ประหยัดต้นทุน ${moneyFull(ch.costSavedSatang)})`),
        el("div", "muted", `• ป้อนสินค้าปลายน้ำ: ${ch.downstreamNamesTh} — ${ch.makeOrBuyNoteTh}`),
      );
      chainCard.append(box);
    }

    // Card 3: 12 External Assets Catalog & Acquisition Controls
    const assetCard = el("div", "card");
    assetCard.append(
      el("h3", "", "🏞️ ทะเบียนสินทรัพย์ภายนอกนิคมและสัมปทานทั้ง 12 แห่ง (External Assets Portfolio)"),
      el("div", "muted", "สินทรัพย์แต่ละแห่งส่งผลจริงต่อระบบนิเวศบริษัท ทั้งการส่งผลผลิตต้นน้ำเข้าคลังฟรีทุกวัน ลดค่าไฟ ลดเวลานำเข้า เพิ่มราคาขาย และสวัสดิการพนักงาน"),
    );

    for (const a of assets) {
      const row = el("div", "logrow");
      const header = el("div", "");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.flexWrap = "wrap";
      header.style.gap = "6px";

      header.append(
        el(
          "strong",
          "",
          `${a.icon} ${a.nameTh} (${a.locationTh}) [${a.categoryNameTh}]`,
        ),
      );

      const actionWrap = el("div", "");
      actionWrap.style.display = "flex";
      actionWrap.style.gap = "6px";
      actionWrap.style.alignItems = "center";
      if (!a.owned) {
        const buyBtn = el("button", "btn pri", `💼 เข้าซื้อกิจการ (${money(a.cost)})`);
        buyBtn.onclick = () =>
          dispatch(
            { type: "acquireExternalAsset", assetId: a.id },
            `เข้าซื้อกิจการ "${a.nameTh}" สำเร็จ! รับผลผลิตล็อตแรกเข้าคลังแล้ว`,
          );
        actionWrap.append(buyBtn);
      } else {
        const resExtra = a.reserveRemaining !== null && a.reserveRemaining !== undefined
          ? ` • ปริมาณสำรองแร่เหลือ ${a.reserveRemaining} หน่วย (กากแร่ ${a.tailingsGenerated || 0})`
          : a.treeStock !== null && a.treeStock !== undefined
            ? ` • ต้นไม้โตเต็มวัยเหลือ ${a.treeStock} ต้น (กล้าไม้รอโต ${a.saplingCohortsCount || 0} รุ่น)`
            : a.herdCount !== null && a.herdCount !== undefined
              ? ` • ฝูงโคนม ${a.herdCount} ตัว`
              : "";
        actionWrap.append(el("span", "chip ok", `✅ ถือครอง Lv.${a.level}/3 (ผลผลิตสะสม ${a.totalHarvested} หน่วย${resExtra})`));
        if (a.upgradeCost) {
          const upBtn = el("button", "btn", `⬆️ ขยายเป็น Lv.${a.level + 1} (${money(a.upgradeCost)})`);
          upBtn.onclick = () =>
            dispatch(
              { type: "acquireExternalAsset", assetId: a.id, upgrade: true },
              `ขยายกำลังการผลิต "${a.shortNameTh}" เป็นระดับ ${a.level + 1} แล้ว`,
            );
          actionWrap.append(upBtn);
        }
      }
      header.append(actionWrap);
      row.append(header);

      for (const eff of a.operationalEffectsTh || []) {
        row.append(el("div", "", `  ↳ ${eff}`));
      }
      row.append(
        el(
          "div",
          "muted",
          `ปันผลผลผลิตส่วนเกิน: +${money(a.dailyDividend)}/วัน • ค่าดูแลรักษา: -${money(a.dailyUpkeep)}/วัน (กำไรสุทธิ +${money(a.dailyDividend - a.dailyUpkeep)}/วัน)`,
        ),
      );
      assetCard.append(row);
    }

        // Card 1B: 5-Tier Material & Component Value Chain DAG (T0 -> T1 -> T2 -> T3 -> T4) & B2B Material Trading
    const dagCard = el("div", "card");
    const extWorld = v.externalWorld || {};
    const b2bDemands = extWorld.b2bMaterialDemands || [];
    const recipes = v.catalog?.materialRecipes || [];
    const tiers = v.catalog?.materialTiers || [];

    dagCard.append(
      el("h3", "", "⚗️ ห่วงโซ่วัตถุดิบหลายขั้นตอน 5 ระดับ (T0 ➔ T1 ➔ T2 ➔ T3 ➔ T4) & การค้าส่งวัตถุดิบ B2B"),
      el(
        "div",
        "muted",
        "บริษัทไม่จำเป็นต้องขายเฉพาะสินค้าขั้นสุดท้าย (T4) เท่านั้น! สิ่งที่เราแปรรูปได้ในขั้น T1, T2 และ T3 สามารถใช้เป็นวัตถุดิบตั้งต้นสำหรับขั้นต่อไป หรือขายส่งเป็นสินค้า B2B ให้บริษัทภายนอกได้ทันที • ชิ้นส่วนไฮเทค (T3) ในช่วงต้นเกมที่ยังไม่มีแต้มวิจัย R&D ต้องสั่งซื้อจากซัพพลายเออร์ก่อน เมื่อมีทุนและองค์ความรู้ถึงเกณฑ์จึงปลดล็อกผลิตเองได้",
      ),
      el(
        "div",
        "logrow",
        `📦 ยอดขายส่งวัตถุดิบ/ชิ้นส่วน B2B สะสม: ${extWorld.totalB2BMaterialSalesUnits || 0} ชิ้น • 💵 รายได้ ${moneyFull(extWorld.totalB2BMaterialRevenueSatang || 0)} • โครงการความรู้ ${v.companyKnowledge?.projects?.length || 0} โครงการ`,
      ),
    );

    if (tiers.length) {
      const tierInfo = el("div", "logrow");
      tierInfo.textContent = tiers.map((t) => `[${t.badgeTh}] ${t.shortNameTh}`).join("  ➔  ");
      dagCard.append(tierInfo);
    }

    if (b2bDemands.length) {
      dagCard.append(el("h4", "", "📢 กระดานรับซื้อวัตถุดิบและชิ้นส่วนกลางน้ำจากบริษัทภายนอกวันนี้ (Live B2B Material Demands)"));
      for (const dem of b2bDemands) {
        const stockNow = v.inventory?.materials?.[dem.materialId] || 0;
        const resNow = v.inventory?.reserved?.[dem.materialId] || 0;
        const freeNow = Math.max(0, stockNow - resNow);
        const dRow = el("div", "logrow");
        dRow.style.display = "flex";
        dRow.style.justifyContent = "space-between";
        dRow.style.alignItems = "center";
        dRow.style.flexWrap = "wrap";
        dRow.style.gap = "6px";
        dRow.append(
          el(
            "div",
            "",
            `🏢 ${dem.buyerNameTh} รับซื้อ [${dem.materialNameTh}] (Tier ${dem.tier}) ในราคาพิเศษ ${money(dem.unitPriceSatang)}/ชิ้น • คงคลังพร้อมขาย: ${freeNow} ชิ้น — ${dem.reasonTh}`,
          ),
        );
        const sellBtn = el(
          "button",
          "btn" + (freeNow >= dem.recommendedQty ? " pri" : ""),
          `💰 ขายส่ง ${dem.recommendedQty} ชิ้น (+${money(dem.unitPriceSatang * dem.recommendedQty)})`,
        );
        sellBtn.onclick = () =>
          dispatch(
            {
              type: "sellMaterialB2B",
              materialId: dem.materialId,
              quantity: dem.recommendedQty,
              buyerCorpId: dem.buyerCorpId,
            },
            `ขายส่ง ${dem.materialNameTh} ×${dem.recommendedQty} ชิ้น ให้แก่ ${dem.buyerNameTh} สำเร็จ!`,
          );
        dRow.append(sellBtn);
        dagCard.append(dRow);
      }
    }

    dagCard.append(el("h4", "", "🔬 สูตรการแปรรูปวัตถุดิบและสังเคราะห์ชิ้นส่วนภายในโรงงาน 27 รายการ (Tier 1 ➔ Tier 2 ➔ Tier 3)"));
    for (const rec of recipes) {
      const rRow = el("div", "logrow");
      const rTop = el("div", "");
      rTop.style.display = "flex";
      rTop.style.justifyContent = "space-between";
      rTop.style.alignItems = "center";
      rTop.style.flexWrap = "wrap";
      rTop.style.gap = "6px";

      const badgeCls = rec.unlocked ? "ok" : "r";
      const gateTxt = rec.unlocked
        ? `✅ มีองค์ความรู้พร้อมผลิตเอง (T${rec.tier})`
        : "🔒 ยังต้องซื้อจากตลาดจนกว่ากระบวนการผ่านรับรองและทีมมีวิชาครบ";
      rTop.append(
        el("strong", "", `[Tier ${rec.tier}] ${rec.nameTh}`),
        el("span", "chip " + badgeCls, gateTxt),
      );

      const btnGroup = el("div", "");
      btnGroup.style.display = "flex";
      btnGroup.style.gap = "6px";
      btnGroup.style.flexWrap = "wrap";

      const craftBtn = el("button", "chip " + (rec.unlocked ? "g" : ""), "⚗️ แปรรูปผลิตเอง 1 ล็อต");
      craftBtn.onclick = () =>
        dispatch(
          { type: "craftMaterial", materialId: rec.id, batches: 1 },
          `สั่งเดินเครื่องแปรรูป "${rec.nameTh}" แล้ว`,
        );
      const sellMatBtn = el("button", "chip b", `📦 ขายส่ง B2B (2 ชิ้น • ${money(rec.b2bSellPrice * 2)})`);
      sellMatBtn.onclick = () =>
        dispatch(
          { type: "sellMaterialB2B", materialId: rec.id, quantity: 2 },
          `ขายส่งวัตถุดิบ ${rec.id} ×2 ชิ้น เข้าตลาด B2B แล้ว`,
        );
      btnGroup.append(craftBtn, sellMatBtn);
      rTop.append(btnGroup);

      rRow.append(
        rTop,
        el("div", "", `• สูตรตั้งต้น: ใช้ [${rec.inputsTh}] ➔ ได้ [${rec.outputsTh}] (ราคาขายส่ง B2B มาตรฐาน ${money(rec.b2bSellPrice)}/ชิ้น • ผลิตสะสม ${rec.unitsProduced || 0} ชิ้น)`),
        el("div", "muted", `• เส้นทางห่วงโซ่ลูกโซ่: ${rec.chainPathTh}`),
      );
      dagCard.append(rRow);
    }

    // Card 0A: 8-Stage Agricultural Cultivation & Seed Cycle Dashboard (Chapter 23)
    const agri = v.agriculture || { plots: {}, seedBatches: {}, waterSource: {} };
    const agriCard = el("div", "card");
    agriCard.append(
      el("h3", "", "🌱 ระบบวงจรเกษตร 8 ขั้นตอน การคัดเมล็ดพันธุ์ และสมดุลธาตุอาหารดิน (Chapter 23 True Agriculture)"),
      el(
        "div",
        "muted",
        "เกษตรกรและผู้บริหารดำเนินวงจรเพาะปลูกอัตโนมัติ: เตรียมแปลง ➔ หักเมล็ดพันธุ์ปลูกลงดิน ➔ ดูแลน้ำดิบและปุ๋ยธาตุอาหาร ➔ เก็บเกี่ยวผลผลิต ➔ คัดแยกข้าวเปลือกที่ยังงอกได้เก็บเป็นเมล็ดพันธุ์รอบถัดไป (ข้าวสารที่สีแล้วและแป้งโม่ใช้ปลูกไม่ได้!) • ดินและน้ำมีสถานะต่อเนื่อง ไม่รีเซ็ตฟรีหลังเก็บเกี่ยว",
      ),
      el(
        "div",
        "logrow",
        `🌾 รอบเพาะปลูกสำเร็จสะสม: ${agri.totalCyclesCompleted || 0} รอบ • 🌱 เมล็ดพันธุ์ใช้ปลูกสะสม: ${agri.totalSeedUsed || 0} หน่วย • 🌾 คัดเก็บเมล็ดพันธุ์จากผลผลิต: ${agri.totalSeedSavedFromHarvest || 0} หน่วย • 💧 น้ำดิบใช้ดูแลแปลง: ${agri.totalWaterUsed || 0} ลบ.ม. • 🧪 ปุ๋ยบำรุงดินที่ใช้: ${agri.totalFertilizerUsed || 0} ถุง`,
      ),
    );
    for (const plot of Object.values(agri.plots || {})) {
      const pRow = el("div", "logrow");
      const lh = plot.lastHarvest;
      pRow.append(
        el(
          "strong",
          "",
          `${plot.icon || "🌾"} ${plot.nameTh} [${plot.id}] — สถานะแปลง: ${plot.stage} (ปลูกรอบที่ ${plot.cycleCount || 0})`,
        ),
        el(
          "div",
          "",
          `• สภาพดินต่อเนื่อง: ธาตุอาหารดิน ${plot.soilNutrients}% | ความชื้นดิน ${plot.soilMoisture}% | อัตราการงอกเมล็ดพันธุ์ ${Math.round((plot.germinationRate || 0.92) * 100)}% | สัดส่วนกันเมล็ดพันธุ์รอบหน้า ${Math.round((plot.seedSaveRatio || 0.25) * 100)}%`,
        ),
        el(
          "div",
          "muted",
          lh
            ? `• ผลเก็บเกี่ยวรอบล่าสุด (รอบที่ ${lh.cycle}): ผลผลิตรวม ${lh.grossYield} หน่วย ➔ สูญเสีย ${lh.spoiledLoss} | คัดเก็บเป็นเมล็ดพันธุ์ (${lh.savedSeedMatId}) +${lh.savedSeedQty} | ส่งเข้าคลังแปรรูป/ขาย (${lh.harvestMatId}) +${lh.warehouseCropQty} | ผลพลอยได้ +${lh.byproductQty}`
            : `• เหตุผล/สถานะปัจจุบัน: ${plot.lastReasonTh}`,
        ),
      );
      agriCard.append(pRow);
    }

    // Card 0B: True Natural Source -> Extraction/Cultivation -> Midstream -> Downstream Table (Chapter 23 Section 9)
    const trueTableCard = el("div", "card");
    trueTableCard.append(
      el("h3", "", "🗺️ ตารางห่วงโซ่ต้นน้ำแท้จริง ➔ การสกัด/เพาะปลูก ➔ กลางน้ำ ➔ สินค้าปลายน้ำ (True Upstream Provenance)"),
      el(
        "div",
        "muted",
        "แยกประเภทแหล่งกำเนิดทรัพยากร (resourceClass) ออกจากลำดับการแปรรูป (Tier): น้ำตาล แป้ง กระดาษ นมโค และข้าวไม่ใช่ทรัพยากรธรรมชาติ T0 แท้จริง แต่เกิดจากวงจรเพาะปลูก เลี้ยงสัตว์ ป่าปลูก หรือการแปรรูปที่มีต้นทุนและเวลาจริง",
      ),
    );
    for (const row of v.catalog?.trueResourceChainTable || []) {
      const tr = el("div", "logrow");
      tr.append(
        el("strong", "", `🔗 ${row.nameTh}`),
        el("div", "", `1) ต้นน้ำธรรมชาติแท้จริง: ${row.trueNaturalSourceTh} | พันธุ์/แหล่งสำรอง: ${row.propaguleOrDepositTh}`),
        el("div", "", `2) การสกัด/เพาะปลูก: ${row.cultivationOrExtractionTh}`),
        el("div", "", `3) แปรรูปกลางน้ำ: ${row.midstreamProcessingTh} ➔ 4) ปลายน้ำ: ${row.downstreamProductTh}`),
        el("div", "muted", `↳ ขอบเขตการจำลอง: ${row.simulationScopeNoteTh}`),
      );
      trueTableCard.append(tr);
    }

    return [stratCard, agriCard, trueTableCard, dagCard, chainCard, assetCard];
  }

  /* ---------- 3. Bottom Nav Sheets (People, Campus, Log, Market, Policy, Menu/Edit Hub) ---------- */
  function renderCompanySheet(v, body) {
    byId("shTitle").textContent = "🏛️ บริษัท — กิจการ คน ความรู้ และแผนงาน";
    const tabs = [{id:"company_overview",label:"ภาพรวม"},{id:"company_tracker",label:"🔍 ติดตามสด / คอขวด"},{id:"company_knowledge",label:"องค์ความรู้ / R&D"},{id:"company_curriculum",label:"สารบัญวิชา"},{id:"company_business",label:"ธุรกิจ / สินค้า"},{id:"company_board",label:"บอร์ด / แผน"},{id:"company_org",label:"โครงสร้าง / คน"},{id:"company_plant",label:"เครื่องจักร / งานช่าง"},{id:"company_contracts",label:"ฝ่ายขาย / สัญญา"},{id:"company_assets",label:"ทรัพย์สิน / ทรัพยากร"}];
    setSheetTabs(tabs);
    if (!tabs.some(t=>t.id===uiState.subTab)) uiState.subTab = "company_overview";
    body.replaceChildren();
    const card = el("div","card"); body.append(card);
    const row = (title,text) => { const r=el("div","logrow");r.append(el("strong","",title),el("div","muted",text));card.append(r); };
    const k=v.companyKnowledge || {people:[],projects:[],products:[],subjects:{}};
    const tier=(n)=>(k.tiers || []).filter(t=>n>=t.level).at(-1)?.nameTh || "ยังไม่เคยเรียน";
    const coverage=(rows)=>(rows || []).map(r=>`${r.ready ? "✓" : "ขาด"} ${r.nameTh} ${r.level} — ${r.holders.map(h=>h.name).join(", ") || "ยังไม่มีผู้รู้"}`).join(" • ");
    const stages={literature:"ศึกษาความเป็นไปได้",prototype:"ทำต้นแบบ",validation:"ตรวจสอบกระบวนการ",qualified:"ผ่านการรับรอง"};
    if(uiState.subTab==="company_overview") {
      if(v.startup){const s=v.startup;row("จุดเริ่มต้น SME — "+s.nameTh,`ทุนผู้ก่อตั้ง ${moneyFull(s.paidInCapital)} = เงินสดเริ่มต้น ${moneyFull(s.openingCash)} + เครื่องมือ ${moneyFull(s.openingEquipmentValue)} + สต็อก ${moneyFull(s.openingStockValue)} + มัดจำ ${moneyFull(s.leaseDeposit)} + เตรียมกิจการ ${moneyFull(s.registrationValue)}
เช่าพื้นที่ใช้สอย ${s.areaM2} ตร.ม. ในแคมปัสร่วม ค่าเช่า ${moneyFull(s.rentDaily)}/วัน ไม่ได้เป็นเจ้าของอาคารทั้งหมด`);row("การเรียนรู้และการขยายกิจการ",s.decisionTh);for(const h of s.learningHistory.slice(0,5))row("การพัฒนาทีม",h.reasonTh||h.messageTh||JSON.stringify(h));}
      if(v.intelligence){row("ข่าวและการตัดสินใจของผู้บริหาร",v.intelligence.decisionTh);for(const n of v.intelligence.negotiations||[])row("เจรจาพาร์ทเนอร์",`${v.externalWorld.corporations[n.corpId]?.nameTh||n.corpId} • ${({negotiating:'กำลังเจรจา',signed:'ตกลงแล้ว',deferred:'ชะลอไว้ก่อน'})[n.status]} • ${n.reasonTh||''}`);}

      if(v.phoneIndustry?.playerEntry){row("แนวทางเข้าสู่อุตสาหกรรมโทรศัพท์",v.phoneIndustry.playerEntry.reasonTh||v.phoneIndustry.playerEntry.decisionTh||"กำลังประเมินความพร้อม");const phoneLink=el("button","btn","ดูอุตสาหกรรมโทรศัพท์และแผนต่อไป");phoneLink.onclick=()=>openSheet("phoneIndustry","phone_overview");card.append(phoneLink);}
      row("ฐานะบริษัท",`เงินสด ${money(v.company.cash)} • หนี้ ${money(v.company.debt)} • ลูกหนี้ ${money(v.company.receivable)} • เงินสำรองพอประมาณ ${v.company.runwayDays} วัน`);
      row("กิจการขณะนี้",`${v.companyProgression?.currentStageNameTh || "บริษัทเริ่มต้น"} • ทีม ${k.people.length} คน • ออเดอร์ที่จ่ายแล้ว ${v.company.metrics.ordersPaid} • งานที่ยังเปิด ${v.orders.filter(o=>!["paid","cancelled"].includes(o.status)).length}`);
      row("ความพร้อมเทคโนโลยี",`พร้อมดำเนินการ ${k.products.filter(p=>p.ready).length}/${k.products.length} สินค้า • โครงการเฉพาะทาง ${k.projects.filter(p=>p.status!=="qualified").length} โครงการ`);
      row("แนวทางที่ผู้บริหารกำลังพิจารณา",k.decision);
      row("สาธารณูปโภค",`ไฟฟ้า ${v.utilities?.dailyKwh || 0} kWh/วัน • น้ำ ${v.utilities?.dailyWaterM3 || 0} ลบ.ม./วัน • ${v.utilities?.brownoutActive ? "ไฟตก ต้องชำระบิล" : "ไม่มีไฟตก"}`);
    } else if(uiState.subTab==="company_tracker") {
      const obs = v.observability || { activeBottlenecks: [], peopleWorkboard: [], watchlistSummary: { people: [], bottlenecks: [], events: [] } };
      row("🔍 กระดานติดตามสด: ใครกำลังทำอะไร • ติดอะไร • กำลังแก้ยังไง", `คอขวดที่พบตอนนี้ ${obs.activeBottlenecks.length} รายการ • ติดดาวติดตามแล้ว ${(v.watchlist?.people?.length || 0) + (v.watchlist?.bottlenecks?.length || 0)} รายการ`);
      if (obs.activeBottlenecks.length === 0) {
        row("✅ ระบบการผลิตและธุรกิจไหลลื่น", "ไม่พบเครื่องจักรเสียรอช่าง อะไหล่ขาด หรือสัญญาเสี่ยงส่งมอบล่าช้าในขณะนี้");
      } else {
        for (const bn of obs.activeBottlenecks) {
          const r = el("div", "logrow");
          const top = el("div", "");
          top.style.display = "flex";
          top.style.justifyContent = "space-between";
          top.style.alignItems = "center";
          top.append(el("strong", "", `${bn.severity === "critical" ? "🚨" : "⚠️"} ${bn.titleTh}`));
          const starBtn = el("button", "btn sm" + (bn.starred ? " pri" : ""), bn.starred ? "⭐ ติดดาวแล้ว" : "☆ ติดดาว");
          starBtn.onclick = () => dispatch({ type: "toggleWatchlist", targetType: "bottleneck", targetId: bn.id, labelTh: bn.titleTh }, "อัปเดตดาวติดตามคอขวดแล้ว");
          top.append(starBtn);
          r.append(
            top,
            el("div", "", `• ติดอะไร: ${bn.whatStuckTh}`),
            el("div", "", `• สาเหตุ: ${bn.whyStuckTh}`),
            el("div", "muted", `• กำลังแก้ยังไง (${bn.ownerName}): ${bn.howSolvingTh}`),
          );
          card.append(r);
        }
      }
      for (const wb of obs.peopleWorkboard) {
        const r = el("div", "logrow");
        const top = el("div", "");
        top.style.display = "flex";
        top.style.justifyContent = "space-between";
        top.style.alignItems = "center";
        const nameBtn = el("button", "btn sm", `👤 ${wb.name} (${wb.roleNameTh} • ${wb.badge})`);
        nameBtn.onclick = () => openPersonSheet(wb.personId);
        const starBtn = el("button", "btn sm" + (wb.starred ? " pri" : ""), wb.starred ? "⭐ ติดตาม" : "☆ ติดดาว");
        starBtn.onclick = () => toggleTrackedPerson(wb.personId);
        top.append(nameBtn, starBtn);
        r.append(
          top,
          el("div", "", `🛠️ ทำอะไรอยู่: ${wb.doingWhatTh}`),
          el("div", "", `🚧 ติดอะไร: ${wb.stuckOnTh}`),
          el("div", "muted", `💡 กำลังแก้ยังไง: ${wb.solvingHowTh}${wb.aspiration ? ` • เป้าหมายชีวิต: ${wb.aspiration.titleTh} (${wb.aspiration.progressPct || 0}%)` : ""}`),
        );
        card.append(r);
      }
    } else if(uiState.subTab==="company_knowledge") {
      row("ความรู้เป็นของคน เทคโนโลยีเป็นของกระบวนการ", "ต้องมีผู้เชี่ยวชาญเฉพาะวิชา ชั่วโมงทำต้นแบบ ระยะเวลาตรวจสอบ และผู้ตรวจคุณภาพ เงินหรือแต้มสะสมอย่างเดียวไม่ปลดล็อกข้ามอุตสาหกรรม หากผู้เชี่ยวชาญออกจากงาน ความพร้อมอาจหายไปได้");
      row("แผนปัจจุบัน",k.decision);
      for(const p of k.projects) row(`${p.nameTh} — ${stages[p.status] || p.status}`,`${p.route === "licensed_transfer" ? "ซื้อสิทธิถ่ายทอด" : "วิจัยเอง"} • วิชา${k.subjects[p.subject] || p.subject} • ${Math.floor(p.workMinutes/60)}/${p.requiredMinutes/60} ชั่วโมง • เริ่มวันที่ ${p.startedDay}, ใช้เวลาอย่างน้อย ${p.minDays} วัน • ใช้งบแล้ว ${money(p.spentSatang)} • ${p.lastReasonTh}`);
      if(!k.projects.length) row("ยังไม่มีโครงการใหม่","ผู้บริหารจะพิจารณาตามความพร้อมทีม เงินสำรอง และโอกาสธุรกิจ ไม่วิจัยทุกสาขาพร้อมกัน");
      for(const p of k.people) row(p.name,Object.entries(p.education.subjects).map(([id,n])=>`${k.subjects[id] || id} ${Math.floor(n)}/100 (${tier(n)})`).join(" • ")+(p.education.course ? ` • กำลังเรียน${k.subjects[p.education.course]}` : ""));
    } else if(uiState.subTab==="company_curriculum") {
      row(`หลักสูตร ${Object.keys(k.subjects).length} วิชา`,"พื้นฐาน 20 → ปฏิบัติงานได้ 40 → ขั้นสูง 60 → ผู้เชี่ยวชาญ 80 → เชี่ยวชาญสูง 95; เรียนขั้นสูงช้าลง และระดับผู้เชี่ยวชาญต้องมีประสบการณ์จริง ทุกวิชาเรียนได้ แม้บริษัทไม่มีงานที่ใช้วิชานั้น ความถนัดช่วยการเรียนแต่ไม่แทนความรู้");
      const categories=[...new Set((k.subjectSpecs || []).map(s=>s.category))];
      const filter=el("select",""); filter.setAttribute("aria-label","หมวดวิชา");
      for(const c of categories) {const o=el("option","",c);o.value=c;filter.append(o);}
      uiState.subjectCategory=categories.includes(uiState.subjectCategory) ? uiState.subjectCategory : categories[0];filter.value=uiState.subjectCategory;
      filter.onchange=()=>{uiState.subjectCategory=filter.value;renderActiveSheet(current);};card.append(filter);
      for(const subject of (k.subjectSpecs || []).filter(s=>s.category===uiState.subjectCategory)) {
        row(subject.nameTh,`${subject.prerequisite ? `ต้องมีพื้นฐาน${k.subjects[subject.prerequisite]} ${subject.prerequisiteLevel} ก่อน • ` : ""}${subject.effectTh} • องค์ประกอบความถนัด: ${Object.entries(subject.aptitudes).map(([id,weight])=>`${v.catalog.dimensions.aptitudes.find(a=>a.id===id)?.nameTh || id} ${Math.round(weight*100)}%`).join(", ")}`);
        const holders=k.people.filter(p=>(p.education.subjects[subject.id] || 0)>0);
        for(const person of holders) {const insight=person.subjectInsights.find(s=>s.id===subject.id);row(person.name,`${tier(person.education.subjects[subject.id])} ${Math.floor(person.education.subjects[subject.id])}/100 • ประสบการณ์งานจริง ${Math.floor((person.education.appliedMinutes?.[subject.id] || 0)/60)} ชั่วโมง • ความเหมาะสมจากความถนัด ${Math.round(insight.talent)}/100`);}
      }
    } else if(uiState.subTab==="company_business") {
      row("โรงงานและคลังสินค้าพร้อมขาย","บริษัทอาจผลิตสะสมเมื่อมีทุนและวัตถุดิบ ฝ่ายขายจัดสินค้าพร้อมขายให้ออเดอร์ก่อนเริ่มผลิตใหม่ สินค้าคงคลังยังไม่ใช่รายได้");
      for(const m of v.manufacturing||[])if(m.stock||m.reserved||m.wip){row(m.nameTh,`พร้อมเสนอขาย ${m.stock} • จองให้ลูกค้า ${m.reserved} • ระหว่างผลิต ${m.wip}\nกระบวนการ: ${m.steps.join(" → ")} → QC → แพ็ก → คลัง\n${m.activeSteps.slice(0,5).map(x=>x.id+": "+x.step).join(" • ")}`);}

      for(const p of k.products) row(`${p.ready ? "✅ พร้อม" : "🔒 ยังไม่พร้อม"} ${p.nameTh}`,`ผลิตแล้ว ${v.production.completed[p.id] || 0} ชิ้น • วิชา${p.subjectNameTh || "เฉพาะทาง"} • ${p.reasons.join(" / ") || "มีทีมและกระบวนการพร้อม; ฝ่ายขายยังต้องประเมินกำไรและคำสั่งซื้อ"} • ${coverage(p.coverage)}`);
      for(const service of k.serviceReadiness || []) row(`${service.ready ? "✓ ทีมพร้อม" : "🔒 ขาดความรู้"} ${service.nameTh}`,coverage(service.coverage));
      row("ธุรกิจบริการ / ขนส่ง / ซอฟต์แวร์",`งานบริการ ${Object.keys(v.serviceBusiness?.orders || {}).length} • สัญญาขนส่ง ${Object.keys(v.fleetTransport?.contracts || {}).length} • โครงการซอฟต์แวร์ ${Object.keys(v.softwareBusiness?.projects || {}).length}`);
    } else if(uiState.subTab==="company_plant") {
      const plant=v.plant;
      row("เครื่องจักรและเครื่องมือ",plant?.decisionTh || "ยังไม่มีเครื่องจักร");
      row("คลังและพลังงาน",`พื้นที่สินค้าสำเร็จรูป ${v.warehouseUsed}/${v.warehouseCapacity} ช่อง (สินค้าขนาดใหญ่ใช้หลายช่อง) • พลังงานเครื่องมือสะสม ${(plant?.energyKwh||0).toFixed(2)} kWh รวมในมิเตอร์รายวัน`);
      for(const m of Object.values(plant?.machines||{})){
        const spec=plant.specs[m.id],status={ready:"พร้อมทำงาน",installing:"รอช่างติดตั้ง",maintenance:"อยู่ระหว่างซ่อม/บำรุง"};
        row(spec.nameTh,`${status[m.status]||m.status} • สภาพ ${m.condition.toFixed(1)}% • อุณหภูมิ ${m.temperatureC.toFixed(0)}°C\n${m.status==='installing'?'กำหนดรับเครื่องวันที่ '+(Math.floor((m.availableAt||0)/1440)+1)+' • ':''}เครื่องรองรับ ${spec.capacity} งาน • ใช้อยู่ ${Object.keys(m.slots).length} • กำลังไฟ ${spec.kw} kW\nชั่วโมงใช้สะสม ${(m.totalMinutes/60).toFixed(1)} • ค่าเครื่อง ${moneyFull(spec.cost)}`);
      }
      const activeBatches=Object.values(plant?.refineryBatches||{}).filter(b=>!['released','cancelled','scrapped'].includes(b.status));
      if(activeBatches.length){
        for(const b of activeBatches)row(`⚗️ ล็อตแปรรูป: ${b.nameTh} ×${b.batches}`,`สถานะ ${b.status} • เครื่อง ${plant.specs[b.equipment]?.nameTh||b.equipment} • ผู้ทำ ${b.operatorName||'รอผู้เชี่ยวชาญ'}
${b.waitingReasonTh||''}`);
      }
      row("เครื่องมือเฉพาะที่ยังไม่มี",Object.entries(plant?.specs||{}).filter(([id])=>!plant.machines[id]).map(([id,s])=>`${s.nameTh}: ${moneyFull(s.cost)}`).join(" • ")+" — ผู้บริหารจะพิจารณาตามงาน ทุนสำรอง และปริมาณผลิต");
      for(const task of plant?.maintenance||[])row(`งานช่าง: ${plant.specs[task.machineId].nameTh}`,`${task.type==='install'?'ติดตั้ง':'ซ่อมบำรุง'} (${task.phase||'กำลังดำเนินการ'}) ${Math.round(task.progress/task.required*100)}% • ผู้ทำ ${v.people.find(p=>p.id===task.workerId)?.name||'รอช่างที่รู้จริง'} • ${task.diagnosedFaultTh||''} • ${task.type==='repair'?(task.partsConsumed?'เบิกอะไหล่แล้ว':'รอเบิกอะไหล่'):'ยังไม่ใช้งานจนติดตั้งเสร็จ'}`);
      for(const e of (plant?.history||[]).slice(0,12))row(`นาที ${e.at}`,e.text);
    } else if(uiState.subTab==="company_contracts") {
      row("ฝ่ายขายและภาระสัญญา",v.commerce?.decisionTh||"กำลังสะสมประวัติการผลิตและสำรวจผู้ซื้อ");
      row("การขายและการรับเงิน","ฝ่ายขายเสนอสินค้าจากคลังให้คู่ค้าที่ใช้สินค้านั้น ผู้ซื้อกันเงินก่อนรับสัญญา สัญญารวม120/240/1,000ชิ้นแบ่งงวดตามประวัติผลิต งานรัฐต้องมีชื่อเสียง วิชาเอกสารคุณภาพและสัญญา และทุนรอรับเงินหลังส่งของ");
      for(const t of (v.commerce?.tenders||[]).slice(0,5))row(`🏛️ ประมูลภาครัฐ: ${v.catalog.products.find(p=>p.id===t.productId)?.nameTh||t.productId} (${t.quantity} ชิ้น)`,`ผู้ชนะ: ${t.winnerNameTh} • คะแนนบริษัทเรา ${t.playerScore} • ราคาเสนอ ${moneyFull(t.unitPrice)}/ชิ้น`);
      for(const c of Object.values(v.commerce?.contracts||{}))row(`${c.buyerType==='government'?'🏛️ จัดซื้อรัฐ':'🤝 B2B'} ${c.customerName}`,`${v.catalog.products.find(p=>p.id===c.productId)?.nameTh||c.productId} • สัญญารวม ${c.quantity} ชิ้น • ออกงวดแล้ว ${c.ordered} • ส่งแล้ว ${c.delivered}
งวดละ ${c.installmentQty} • ราคาต่อหน่วย ${moneyFull(c.unitPrice)} • รับเงินจริง ${moneyFull(c.paidSatang)} • ${c.status==='completed'?'ส่งครบแล้ว':c.status==='terminated'?'ยุติสัญญาและคืนงบแล้ว':'มีภาระส่งมอบ'}
กำหนดออกงวดถัดไปวันที่ ${c.nextDeliveryDay}`);
      for(const e of (v.commerce?.history||[]).slice(0,16))row(`นาที ${e.at}`,e.text);
    } else if(uiState.subTab==="company_board") {
      row("แผนเตรียมความสามารถ",k.decision);
      const b=v.executiveBoard || {};
      row("งบลงทุน",`งบที่จอง ${money(b.committedBudgetSatang)} • ทุนที่จ่ายแล้ว ${money(b.paidCapitalTotalSatang)} • เงินสำรองดำรงกิจการ ${money(b.budgetPools?.survivalReserveSatang)}`);
      for(const d of b.decisionLedger || []) row(d.titleTh,`${d.reasonTh} • ผู้เสนอ ${d.proposerName || "บอร์ด"} • ทบทวนวันที่ ${d.nextReviewDay} • ${d.executionStatus}`);
    } else if(uiState.subTab==="company_org") {
      for(const p of v.people.filter(p=>p.employed)) {
        const r=el("button","logrow");r.type="button";r.textContent=`${p.name} • ${p.roleName || p.role} • ${p.activityLabelTh || p.activity}`;r.onclick=()=>openPersonSheet(p.id);card.append(r);
      }
      for(const d of v.orgSummary?.departments || []) row(d.departmentTh || d.nameTh || "แผนก",`จำนวนคน ${d.count || d.headcount || 0}`);
    } else {
      for(const b of [...(v.campus.buildings || []),...(v.campus.expansionPlots || []).filter(p=>p.constructed)]) row(b.nameTh || b.id,`อาคาร • ระดับ ${b.level || 1}`);
      for(const a of v.catalog.externalAssets || []) if(a.owned) row(a.nameTh,`สินทรัพย์ภายนอก • ระดับ ${a.level || 1}`);
      if(v.warehouse?.summary){
        const ws=v.warehouse.summary;
        row("สถานะคลังและล็อตวัตถุดิบ (FIFO/FEFO)",`พร้อมใช้ ${ws.rawAvailable} • จองแล้ว ${ws.reserved} • รอโหลดเข้าเครื่อง ${ws.staged} • ระหว่างผลิต (WIP) ${ws.wipUnits} • กักกันตรวจเชื้อ ${ws.quarantineUnits} • คัดทิ้ง ${ws.rejectedUnits} • สินค้าสำเร็จรูป ${ws.releasedFinished} • ทรัพย์สินลูกค้าฝากดูแล ${ws.customerCustody} • ขนส่งขาเข้า ${ws.inTransitInbound} • ขนส่งขาออก ${ws.inTransitOutbound}`);
      }
      if(v.agriculture?.livestock?.dairy_soy_farm){
        const hd=v.agriculture.livestock.dairy_soy_farm;
        row("วงจรชีวภาพฟาร์มโคนม",`สถานะ ${hd.milkingStage} (${hd.digestMinutes||0}/${hd.requiredDigestMinutes||180} นาที) • สุขภาพฝูง ${hd.herdHealth}% • รอบรีดนมสะสม ${hd.lactationCyclesCompleted||0} รอบ`);
      }
      for(const vehicle of Object.values(v.fleetTransport?.vehicles || {})) row(vehicle.nameTh || vehicle.plate || vehicle.id,`ยานพาหนะ • ${vehicle.status} • สภาพ ${vehicle.condition}%`);
      row("วัตถุดิบในคลัง",v.catalog.materials.filter(m=>(v.inventory.materials[m.id] || 0)>0).map(m=>`${m.nameTh}: ${v.inventory.materials[m.id]}`).join(" • "));
    }
  }

  function renderWorldSheet(v,body) {
    byId("shTitle").textContent="🌍 โลก — ประเทศ รัฐบาล บริษัท และการค้า";
    setSheetTabs([{id:"world_overview",label:"ภาพรวม"},{id:"world_nations",label:"ประเทศ / รัฐบาล"},{id:"world_firms",label:"บริษัทภายนอก"},{id:"world_markets",label:"ตลาด / วัตถุดิบ"},{id:"world_diplomacy",label:"การทูต / เส้นทาง"},{id:"world_chronicle",label:"พงศาวดารโลก"}]);
    const e=v.externalWorld,m=e?.living,geo=e?.geopolitics;
    body.replaceChildren();
    const row=(title,text)=>{const card=el("div","card world-card");card.append(el("h3","",title),el("div","muted",text));body.append(card);return card;};
    const groupName={food:"อาหาร",energy:"พลังงาน",metals:"โลหะ",electronics:"อิเล็กทรอนิกส์",chemicals:"เคมีภัณฑ์",biological:"ชีวภาพและเกษตร",industrial:"อุตสาหกรรมทั่วไป"};
    const treatyState={proposed:"กำลังเจรจา",signed:"ลงนามแล้ว",effective:"มีผลบังคับใช้",suspended:"ระงับใช้",expired:"หมดอายุ",rejected:"เจรจาไม่สำเร็จ"};
    const measureName={tariff:"ภาษีนำเข้า",waiver:"ยกเว้นภาษีนำเข้า",export_quota:"โควตาส่งออก"};
    const policy={balanced:"รักษาเสถียรภาพ",stimulus:"กระตุ้นเศรษฐกิจ",tightening:"ควบคุมเงินเฟ้อ",austerity:"รักษาฐานะการคลัง"};
    const status={peace:"สัมพันธ์ปกติ",treaty:"ข้อตกลงการค้า",sanctions:"จำกัดการค้า",war:"ความขัดแย้งติดอาวุธ"};
    if(!m){row("กำลังเตรียมข้อมูลโลก","โลกจากเซฟเก่าจะเริ่มจำลองเมื่อผ่านวันถัดไป");return;}
    const nations=Object.values(m.nations),firms=Object.values(m.firms),materialName=k=>v.catalog.materials.find(x=>x.id===k)?.nameTh||k;
    const nationName=k=>geo.nations[k]?.shortNameTh||k,firmName=k=>e.corporations[k]?.nameTh||k;
    const entityPicker=(key,items,label)=>{
      if(!items.some(x=>x.id===uiState[key]))uiState[key]=items[0]?.id;
      const select=el("select","world-select");select.setAttribute("aria-label",label);
      for(const x of items){const o=el("option","",x.nameTh||x.id);o.value=x.id;select.append(o);}select.value=uiState[key];
      select.onchange=()=>{uiState[key]=select.value;renderWorldSheet(v,body);};body.append(select);return uiState[key];
    };
    const history=(records)=>records.slice(-10).map(x=>`วันที่ ${x.day}: ผลิต ${x.output ?? x.traded} • ${x.profit!==undefined?'เงินสดสุทธิ '+moneyFull(x.profit):'บริษัททำงาน '+x.activeFirms}`).join("\n");
    if(uiState.subTab==="world_overview"){
      row("โลกที่กำลังดำเนินไป",`${nations.length} ประเทศ/กลุ่มเศรษฐกิจ • ${firms.length} บริษัท • สินค้าระหว่างทาง ${m.shipments.length} ล็อต • จำลองถึงวันที่ ${m.lastDay}`);
      row("สถานการณ์การทูต",`ข้อตกลง ${m.relations.filter(r=>r.status==='treaty').length} คู่ • จำกัดการค้า ${m.relations.filter(r=>r.status==='sanctions').length} คู่ • ความขัดแย้ง ${m.relations.filter(r=>r.status==='war').length} คู่`);
      row("ผลต่อบริษัทของเรา",`บาท/USD ${geo.fxRateBahtPerUsd} • ค่าระวาง ×${geo.globalFreightRateMultiplier} • วัตถุดิบราคาเปลี่ยนตามสต็อกจริงและนโยบายรัฐ • ข้อเสนอรับซื้อวัตถุดิบ ${e.b2bMaterialDemands.length} รายการ`);
      row("ติดตามให้ลึกขึ้น","เลือกประเทศเพื่อดูเหตุผลนโยบาย เลือกบริษัทเพื่อดูเงินและข้อจำกัดการผลิต และดูตลาดเพื่อหาต้นเหตุราคาที่เปลี่ยน ทุกข่าวอ้างอิงการตัดสินใจหรือธุรกรรมในโลกจำลอง");
      row("เศรษฐกิจ 10 วันล่าสุด",history(m.history));
      for(const j of m.journal.slice(0,6))row(`วันที่ ${j.day} • ${j.headlineTh}`,j.meaningTh);
    }else if(uiState.subTab==="world_nations"){
      const id=entityPicker("worldNation",nations.map(n=>({id:n.id,nameTh:`${geo.nations[n.id].flag} ${geo.nations[n.id].nameTh}`})),"เลือกประเทศ"),n=m.nations[id],g=geo.nations[id];
      row(`${g.flag} ${g.nameTh}`,n.descriptionTh);
      row("รัฐบาลและนโยบาย",`${g.activeRegimeNameTh} • ${policy[n.policy]}\nเหตุผล: ${n.policyReasonTh}\nรอบทบทวนถัดไปวันที่ ${n.lastReviewDay+14} • ทบทวนผู้นำวันที่ ${n.nextElectionDay}`);
      if(n.government){const h=n.government;row("ผู้นำและวาระ",`${h.leader.name} (ตัวละครสมมติ) • ${g.activeRegimeNameTh} • วาระ ${h.termDays} วัน • รอบเปลี่ยน/คงผู้นำวันที่ ${n.nextElectionDay}`);for(const x of (h.electionHistory||[]).slice(0,3))row("ผลทบทวนผู้นำ",`วันที่ ${x.day}: ${x.turnover?'เปลี่ยน':'คง'}คณะบริหาร • ${x.leaderName} • ผลประเมินเศรษฐกิจ/ความนิยม ${Math.round(x.performance)}/100`);}
      if(n.commerceMinistry){const c=n.commerceMinistry;row(c.nameTh,`${c.reasonTh||'ทบทวนต้นทุนและอุปทานในประเทศ'}\nภาษีศุลกากรรับจริง ${moneyFull(c.customsRevenue)} • ทบทวนล่าสุดวันที่ ${c.lastReviewDay}`);for(const x of c.measures.slice(-8))row(x.nameTh||measureName[x.type],`${groupName[x.group]} • อัตรา ${x.rate}% • ประกาศวันที่ ${x.announcedDay} • มีผลวันที่ ${x.effectiveDay} • สิ้นสุดวันที่ ${x.expiresDay}\n${x.reasonTh}`);}
      if(n.security)row("ต้นทุนความขัดแย้ง",`ใช้จ่ายสะสม ${moneyFull(n.security.defenceSpentSatang)} • ความเสียหายโครงสร้างพื้นฐาน ${n.security.damageIndex.toFixed(2)}% • อยู่ในความขัดแย้ง ${n.security.conflictDays} วัน`);
      row("เศรษฐกิจและความเป็นอยู่",`เงินเฟ้อ ${n.inflation}% • ว่างงาน ${n.unemployment}% • ดอกเบี้ยนโยบาย ${n.interestRate}% • ดัชนีเศรษฐกิจ ${n.gdpIndex}\nความนิยม ${n.approval}% • เสถียรภาพ ${n.stability}% • โครงสร้างพื้นฐาน ${n.infrastructure}/100`);
      row("คลังและกำลังซื้อ",`เงินคลัง ${moneyFull(n.treasury)} • ภาษีสะสม ${moneyFull(n.taxes)} • รายจ่ายรัฐ ${moneyFull(n.spending)}\nเงินภาคครัวเรือน/อุตสาหกรรมปลายทาง ${moneyFull(n.householdCash)} • ใช้จ่ายสะสม ${moneyFull(n.consumption)}`);
      for(const f of firms.filter(f=>f.nationId===id)){const card=row(firmName(f.id),`${moneyFull(f.cash)} • ${f.decisionTh}`);const b=el("button","btn","ดูบริษัทนี้");b.onclick=()=>{uiState.worldFirm=f.id;uiState.subTab='world_firms';renderWorldSheet(v,body);};card.append(b);}
      for(const r of m.relations.filter(r=>r.a===id||r.b===id).sort((a,b)=>b.tension-a.tension).slice(0,5))row(`สัมพันธ์กับ ${nationName(r.a===id?r.b:r.a)}`,`${status[r.status]} • ความตึงเครียด ${r.tension}/100 • ${r.reasonTh}`);
    }else if(uiState.subTab==="world_firms"){
      const id=entityPicker("worldFirm",firms.map(f=>({id:f.id,nameTh:firmName(f.id)})),"เลือกบริษัทภายนอก"),f=m.firms[id],c=e.corporations[id];
      row(c.nameTh,`${nationName(f.nationId)} • ${c.sectorTh} • ${f.status==='suspended'?'พักกิจการเพราะขาดทุนหมุนเวียน':'ดำเนินกิจการ'}`);
      row("ฐานะและผลประกอบการ",`เงินสด ${moneyFull(f.cash)} • รายรับวันนี้ ${moneyFull(f.dailyRevenue)} • รายจ่ายวันนี้ ${moneyFull(f.dailyCost)} • กระแสเงินสดสุทธิหลังภาษีวันนี้ ${moneyFull(f.profit)}
ต้นทุนขาย (COGS) วันนี้ ${moneyFull(f.cogsSatang||0)} • กำไรจากการดำเนินงานทางบัญชี ${moneyFull(f.accrualProfitSatang||f.profit)} • ลงทุนสะสม ${moneyFull(f.investment)} • ขาดทุนต่อเนื่อง ${f.consecutiveLossDays} วัน`);
      row("ผู้บริหารกำลังตัดสินใจอะไร",`${f.decisionTh}\nรับความเสี่ยง ${f.risk}/100 • ระมัดระวัง ${f.prudence}/100 • ทบทวนทุก 7 วัน`);
      row("กำลังผลิตและความรู้",`กำลังผลิต ${f.capacity} หน่วย/สาย/วัน • ใช้งาน ${Math.round(f.utilization*100)}% • เทคโนโลยี ${f.technology}/100\nข้อจำกัด: ${f.missing.join(' • ')||'ยังไม่พบข้อจำกัดวันนี้'}`);
      row("สต็อกและทรัพยากร",Object.entries(f.stock).map(([k,q])=>`${materialName(k)}: ${q}`).join('\n')||'ไม่มีสต็อก');
      row("ปริมาณสำรองธรรมชาติ",Object.entries(f.reserves).filter(([k])=>v.catalog.materials.find(x=>x.id===k)?.isTrueNaturalResource).map(([k,q])=>`${materialName(k)}: ${q}`).join('\n')||'ไม่มีแหล่งขุดในกิจการนี้');
      row("ผลประกอบการย้อนหลัง",history(f.history));
      for(const j of m.journal.filter(j=>j.actorCorpId===id||j.targetCorpId===id).slice(0,8))row(`วันที่ ${j.day} • ${j.headlineTh}`,j.meaningTh);
    }else if(uiState.subTab==="world_markets"){
      const id=entityPicker("worldMaterial",Object.values(m.markets).map(k=>({id:k.id,nameTh:materialName(k.id)})),"เลือกวัตถุดิบโลก"),k=m.markets[id];
      row(materialName(id),`ราคาฐานตลาด ${moneyFull(k.price)}/หน่วย • ราคาซื้อรวมผลนโยบาย ${moneyFull(geo.materialSpotPrices[id])}/หน่วย\n${k.reasonTh} • ซื้อขายวันนี้ ${k.traded} หน่วย`);
      for(const f of firms.filter(f=>(e.corporations[f.id].sellsMaterials||[]).includes(id)))row(`ผู้ขาย: ${firmName(f.id)}`,`สต็อก ${f.stock[id]||0} หน่วย • ${nationName(f.nationId)} • ${f.decisionTh}`);
      for(const d of e.b2bMaterialDemands.filter(d=>d.materialId===id))row(`ผู้ต้องการ: ${d.buyerNameTh}`,`${d.recommendedQty} หน่วย • ราคา ${moneyFull(d.unitPriceSatang)} • ${d.reasonTh}`);
      row("อ่านตัวเลขอย่างไร","สต็อกเสนอขายและคำขอซื้อเป็นค่ารวมของรอบวัน ราคาเคลื่อนทีละขั้น การสั่งซื้อจริงยังขึ้นกับสต็อกล่าสุด เงิน และเส้นทางที่เปิด");
    }else if(uiState.subTab==="world_diplomacy"){
      const id=entityPicker("worldRelation",m.relations.map(r=>({id:r.id,nameTh:`${nationName(r.a)} ↔ ${nationName(r.b)}`})),"เลือกความสัมพันธ์ระหว่างประเทศ"),r=m.relations.find(r=>r.id===id);
      row(`${nationName(r.a)} ↔ ${nationName(r.b)}`,`${status[r.status]} • ความตึงเครียด ${r.tension}/100 • ความเชื่อมั่น ${r.trust}/100\n${r.reasonTh} • มีผลตั้งแต่วันที่ ${r.sinceDay}`);
      for(const t of (m.civics?.treaties||[]).filter(t=>t.parties.includes(r.a)&&t.parties.includes(r.b)))row("ข้อตกลงรายสินค้า",`${t.groups.map(g=>groupName[g]).join(', ')} • ${treatyState[t.status]} • ยกเว้น ${t.waiverPct}% • มีผลวันที่ ${t.effectiveDay||'รอเจรจา'} • สิ้นสุดวันที่ ${t.expiresDay||'ยังไม่กำหนด'}\n${t.reasonTh||''} • ผู้ลงนาม ${(t.signatories||[]).map(x=>x.name).join(' / ')}`);
      for(const c of Object.values(geo.tradeCorridors))row(c.nameTh,`ภาษี ${c.tariffPct}% • เวลาขนส่ง ×${c.leadTimeMod} • อุปสงค์ ×${c.demandMod} • ${status[c.livingStatus]||c.status}`);
      row("สินค้าระหว่างทาง",`${m.shipments.length} ล็อต ชำระเงินแล้ว สินค้าจะเข้าคลังผู้ซื้อเมื่อถึงกำหนด`);
      for(const s of m.shipments.slice(0,20))row(`${materialName(s.materialId)} ×${s.quantity}`,`${firmName(s.sellerId)} → ${firmName(s.buyerId)}\nออกวันที่ ${s.departedDay} • ถึงวันที่ ${s.dueDay}${s.delayed?' • ล่าช้าจากความขัดแย้ง':''} • ภาษี ${moneyFull(s.tariff)}`);
    }else{
      row("พงศาวดารโลก","เหตุการณ์จากรัฐบาล การทูต การตัดสินใจบริษัท และธุรกรรมจริง เก็บประวัติล่าสุดแบบจำกัดขนาด");
      for(const j of m.journal.slice(0,60))row(`วันที่ ${j.day} • ${j.headlineTh}`,j.meaningTh);
      if(!m.journal.length)row("ยังไม่มีเหตุการณ์","เริ่มเดินเวลาเพื่อให้โลกตัดสินใจและค้าขาย");
    }
  }

  function openPhoneExperiment(v){
    const dialog=el("dialog","business-chooser");dialog.id="phone-experiment";document.body.append(dialog);dialog.append(el("h2","","Edit Hub — การทดลอง"),el("p","muted","เปลี่ยนเงื่อนไขแล้วเฝ้าดู NPC ตัดสินใจเอง การเพิ่มเงินและความรู้ไม่รับประกันผลลัพธ์"));
    const firms=v.phoneIndustry.firms||[],people=Object.values(v.phoneTalent?.people||{}).filter(p=>p.employment==='external');
    const select=(items,label)=>{const x=el("select");x.setAttribute("aria-label",label);for(const [value,name]of items){const o=el("option","",name);o.value=value;x.append(o);}dialog.append(x);return x;};
    const input=(label,value)=>{const x=el("input");x.type="number";x.setAttribute("aria-label",label);x.value=value;dialog.append(x);return x;};
    dialog.append(el("h3","","เงินทุนบริษัทภายนอก"));const firm=select(firms.map(f=>[f.id,f.nameTh]),"บริษัทที่ทดลองเพิ่มเงิน"),amount=input("จำนวนเงินบาทที่เพิ่ม",10000);
    const note=el("p","muted","");const send=(c)=>{const r=app.dispatch(c);note.textContent=r.ok?"บันทึกการทดลองแล้ว ดูผลเมื่อโลกเดินต่อ":r.message||"ตรวจค่าที่กรอก";paint(app.snapshot());};
    const cash=el("button","btn","เพิ่มเงินทุน (ทดลอง)");cash.onclick=()=>send({type:'directorPhoneEdit',action:'grantCash',firmId:firm.value,amount:Math.round(Number(amount.value)*100)});dialog.append(cash);
    dialog.append(el("h3","","วัตถุดิบของบริษัทในระบบโทรศัพท์"));
    const matFirm=select(firms.map(f=>[f.id,f.nameTh]),"บริษัทที่ทดลองเติมวัตถุดิบ");
    const matItems=(v.catalog?.materials||[]).filter(m=>['silicon_wafer','copper_coil','polymer_resin','metal_sheet','pcb','battery','optical_lens','sensor','glass_bottle'].includes(m.id)).map(m=>[m.id,m.nameTh]);
    const matSelect=select(matItems.length?matItems:[['silicon_wafer','เวเฟอร์ซิลิคอน']],"วัตถุดิบโทรศัพท์ที่ทดลอง"),matQty=input("จำนวนวัตถุดิบที่เพิ่ม",20);
    const matBtn=el("button","btn","เติมวัตถุดิบบริษัทโทรศัพท์ (ทดลอง)");matBtn.onclick=()=>send({type:'directorPhoneEdit',action:'grantFirmMaterial',firmId:matFirm.value,materialId:matSelect.value,quantity:Math.round(Number(matQty.value))});dialog.append(matBtn);
    dialog.append(el("h3","","บุคลากรภายนอก"));const person=select(people.map(p=>[p.id,p.name+" — "+(firms.find(f=>f.id===p.employerId)?.nameTh||"บริษัทภายนอก")]),"บุคลากรที่ทดลอง");
    const subject=select(Object.entries(v.companyKnowledge.subjects),"วิชาที่ทดลอง"),level=input("ระดับความรู้ 0 ถึง 100",50),knowledge=el("button","btn","ปรับความรู้ (ทดลอง)");knowledge.onclick=()=>send({type:'directorPhoneEdit',action:'setSubject',personId:person.value,subjectId:subject.value,level:Number(level.value)});dialog.append(knowledge);
    const labels={sociability:'การเข้าสังคม',conscientiousness:'ความรับผิดชอบ',agreeableness:'ความประนีประนอม',openness:'เปิดรับสิ่งใหม่',riskTaking:'การรับความเสี่ยง',stressReactivity:'การตอบสนองความเครียด',assertiveness:'ความกล้าแสดงออก',patience:'ความอดทน',integrity:'ความซื่อตรง',adaptability:'การปรับตัว',ambition:'ความทะเยอทะยาน',prudence:'ความรอบคอบ',humility:'ความถ่อมตน',optimism:'การมองโลกในแง่ดี'};
    const trait=select(Object.entries(labels),"นิสัยที่ทดลอง"),value=input("ค่านิสัย 0 ถึง 100",50),change=el("button","btn","ปรับนิสัย (ทดลอง)");change.onclick=()=>send({type:'directorPhoneEdit',action:'setTrait',personId:person.value,key:trait.value,level:Number(value.value)});dialog.append(change,note);
    const close=el("button","btn","ปิดการทดลอง");close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(close);dialog.addEventListener('cancel',()=>dialog.remove());dialog.showModal();
  }
  // Phone sheets read snapshots only. Selecting an entity never dispatches a command.
  function renderPhoneIndustry(v, body) {
    byId("shTitle").textContent="📱 อุตสาหกรรมโทรศัพท์ — เฝ้าดูบริษัทและเทคโนโลยี";
    setSheetTabs([{id:"phone_overview",label:"ภาพรวม"},{id:"phone_company",label:"บริษัท"},{id:"phone_products",label:"สินค้า / R&D"},{id:"phone_supply",label:"ซัพพลายเชน"},{id:"phone_market",label:"ตลาด / ข่าว"},{id:"phone_people",label:"บุคลากร"}]);
    body.replaceChildren();
    const d=v.phoneIndustry || {}, list=x=>Array.isArray(x)?x:Object.values(x||{});
    const firms=list(d.firms), designs=list(d.designs), chips=list(d.chips), projects=list(d.projects), wipBatches=list(d.wipBatches), foundryOrders=list(d.foundryOrders), channels=list(d.channels), roleFeasibility=list(d.roleFeasibility);
    const name=x=>x?.nameTh||x?.name||x?.titleTh||x?.headlineTh||"ยังไม่ระบุชื่อ";
    const lookup=(rows,id)=>rows.find(x=>x.id===id);
    const state=x=>({pilot:"ผลิตนำร่อง",complete:"เสร็จแล้ว",shipping:"ระหว่างขนส่ง",notice:"รอครบกำหนดย้ายงาน",transferred:"ย้ายงานแล้ว",planned:"วางแผน",research:"วิจัย",prototype:"ต้นแบบ",validation:"ทดสอบ",qualified:"ผ่านการรับรอง",released:"วางตลาด",active:"ดำเนินงาน",completed:"เสร็จแล้ว",negotiating:"กำลังเจรจา",signed:"ลงนาม",delivered:"ส่งมอบ",paid:"ชำระแล้ว",blocked:"ติดข้อจำกัด",production:"กำลังผลิต",ready:"พร้อม",failed:"ไม่ผ่าน",cancelled:"ยกเลิก"})[x]||"อยู่ระหว่างดำเนินการ";
    const text=x=>typeof x==="string"?x:"";
    const reason=x=>text(x?.reasonTh)||text(x?.decisionTh)||text(x?.descriptionTh)||text(x?.messageTh)||text(x?.meaningTh)||"ยังไม่มีคำอธิบายการตัดสินใจ";
    const row=(title,detail)=>{const c=el("div","card phone-card");c.append(el("h3","",title),el("div","muted",detail));body.append(c);return c;};
    const empty=()=>row("ยังไม่มีรายการ","ข้อมูลจะปรากฏเมื่อบริษัทตัดสินใจและเกิดกิจกรรมจริงในโลก");
    const experiment=el("button","btn","Edit Hub — ทดลองเปลี่ยนเงื่อนไข");experiment.onclick=()=>openPhoneExperiment(v);body.append(experiment);
    const select=(rows,key,label)=>{if(!rows.length)return null;const s=el("select","world-select phone-select");s.setAttribute("aria-label",label);for(const x of rows){const o=el("option","",name(x));o.value=x.id;s.append(o);}if(!rows.some(x=>x.id===uiState[key]))uiState[key]=rows[0].id;s.value=uiState[key];s.onchange=()=>{uiState[key]=s.value;renderPhoneIndustry(current,body);};body.append(s);return lookup(rows,s.value);};
    const firmName=id=>name(lookup(firms,id));
    const people=list(v.phoneTalent?.people || v.phoneTalent?.engineers);
    const personName=id=>name(lookup(people,id)||lookup(v.people||[],id));
    const entry=d.playerEntry;
    if(uiState.subTab==="phone_overview") {
      row("โลกโทรศัพท์ที่กำลังเปลี่ยนแปลง",`บริษัท ${firms.length} แห่ง • แบบสินค้า ${designs.length} แบบ • ชิป ${chips.length} รุ่น • โครงการวิจัย ${projects.length} โครงการ • ล็อตแปรรูป WIP ${wipBatches.length} ชุด\nบริษัทและวิศวกรตัดสินใจเองตามทุน ความรู้ ความพร้อม และตลาด`);
      if(entry)row("บริษัทของเราและโอกาสเข้าสู่อุตสาหกรรม",reason(entry));
      if(roleFeasibility.length){
        row("ความพร้อมของบริษัทเราต่อ 12 บทบาทธุรกิจโทรศัพท์",roleFeasibility.map(r=>`${r.feasible?(r.feasibleButDeclined?"⏸ พร้อมแต่ CEO ชะลอ":"✅ พร้อมดำเนินการ"):"⏳ ยังไม่ครบเงื่อนไข"} • ${r.nameTh.split(' (')[0]} (ทุนขั้นต้น ${moneyFull(r.entryCapitalSatang)}) — ${r.reasonTh}`).join("\n"));
      }
      for(const f of firms.slice(0,16)){const c=row(`${name(f)} (${(f.roles||[f.role]).join(', ')})`,reason(f));const b=el("button","btn","ดูบริษัทและแผน");b.onclick=()=>{uiState.phoneFirm=f.id;uiState.subTab="phone_company";renderPhoneIndustry(current,body);};c.append(b);}
      if(!firms.length)empty();
    } else if(uiState.subTab==="phone_company") {
      const f=select(firms,"phoneFirm","เลือกบริษัทโทรศัพท์");if(!f){empty();return;}
      const external=list(v.world?.firms || v.livingWorld?.firms || v.worldModel?.firms).find(x=>x.id===f.id);
      const cash=f.cashSatang??f.cash??external?.cash;
      row(name(f),`บทบาทธุรกิจ: ${f.roleNameTh||f.role} (${(f.roles||[f.role]).join(', ')})\n${reason(f)}\nเงินสดบริษัท ${cash==null?"ยังไม่มีข้อมูลบัญชี":moneyFull(cash)} • รายรับสะสม ${moneyFull(f.revenueSatang||0)} • ต้นทุนขาย ${moneyFull(f.costOfGoodsSatang||0)} • วิจัย/NRE ${moneyFull((f.researchSatang||0)+(f.nreSpentSatang||0))}\nผลิตสะสม ${f.produced||0} หน่วย • ขายสะสม ${f.sold||0} หน่วย • แผนต่อไป: ${text(f.planTh)||text(f.nextPlanTh)||reason(f.plan)||"รอตัดสินใจตามเงื่อนไขจริง"}`);
      for(const p of projects.filter(x=>x.firmId===f.id))row(({handset:"โครงการแบบโทรศัพท์",semiconductor:"โครงการออกแบบชิป",platform:"โครงการแพลตฟอร์ม",component:"โครงการพัฒนาชิ้นส่วน"})[p.type]||"โครงการวิศวกรรม",`${state(p.status)} • ${Math.round(p.progress||0)}/${p.requiredMinutes||0} นาที • ${reason(p)}\nผู้ร่วมวิจัย: ${list(p.contributors||p.contributorIds||p.engineerIds).map(x=>typeof x==="string"?personName(x):name(x)).join(" • ")||"ยังไม่มีผู้ร่วมโครงการ"}`);
      for(const x of designs.filter(x=>x.firmId===f.id))row(name(x),`${state(x.stage||x.status)} • ${reason(x)}`);
      for(const fo of foundryOrders.filter(o=>o.fablessFirmId===f.id||o.foundryFirmId===f.id).slice(0,5))row(`คำสั่งจ้างผลิตเวเฟอร์/แพ็กเกจ ${fo.id}`,`ผู้ออกแบบ ${firmName(fo.fablessFirmId)} → โรงหล่อ ${firmName(fo.foundryFirmId)} → OSAT ${firmName(fo.osatFirmId)}\nโหนด ${fo.nodeNm} nm • ดายดี ${fo.goodDies}/${fo.grossDies} • บรรจุผ่าน ${fo.packagedGood} ชิ้น (A-Bin ${fo.aBin} / B-Bin ${fo.bBin}) • ต้นทุน ${moneyFull(fo.unitCostSatang)}/ชิ้น`);
    } else if(uiState.subTab==="phone_products") {
      const x=select(designs,"phoneDesign","เลือกแบบโทรศัพท์");if(!x){empty();return;}
      row(name(x),`${firmName(x.firmId)} • ${state(x.stage||x.status)} • เครือข่าย ${x.radioGeneration||2}G\n${reason(x)}`);
      const bom=x.bom||{};const chip=lookup(chips,x.chipId||bom.chipId||x.socId);
      row("ชิปและส่วนประกอบ",`ผู้ออกแบบชิป: ${chip?firmName(chip.ownerId):"ยังไม่ได้เลือกชิป"}\n${chip?"ชุดคำสั่ง "+chip.isa+" • แรม "+chip.memoryType+" • จุดเน้น "+(chip.focus||"balanced"):""}`);
      if(chip)row("ผลทดสอบชิป",`${chip.cores} คอร์ • ${chip.clockGhz} GHz • กระบวนการ ${chip.nodeNm} nm • พื้นที่ดาย ${chip.dieAreaMm2} mm² • โหลด ${chip.loadW} W`);
      if(x.evaluation){const e=x.evaluation;row("ผลทดสอบเครื่อง",`แบต ${e.batteryHours.toFixed(1)} ชั่วโมง • โหลดเฉลี่ย ${e.averagePowerW} W • ผิวเครื่องที่โหลดสูงสุด ${e.surfaceC} °C • ประสิทธิภาพต่อเนื่อง ${(e.sustainedFactor*100).toFixed(0)}%\nโทร ${e.taskScores.call} • เว็บ ${e.taskScores.web} • กราฟิก ${e.taskScores.game} (คะแนนเทียบงานเดียวกัน)\nการวินิจฉัยคอขวด: ${e.bottleneckSummaryTh||"สมดุล"}`);}
      if(x.parts)row("สเปกชิ้นส่วนจริง",`RAM ${x.parts.ram.capacityMB} MB (${x.parts.ram.bandwidthGBps} GB/s) • พื้นที่เก็บ ${x.parts.storage.capacityMB} MB (${x.parts.storage.readMBps} MB/s)\nจอ ${x.parts.display.width}×${x.parts.display.height} (${x.parts.display.brightnessNits||220} nits) • แบต ${x.parts.battery.wh} Wh • กล้อง ${x.parts.camera?.megapixels||0} MP (f/${x.parts.camera?.fNumber||2.4})\nระบบ ${x.parts.os.installableApps?'รองรับแอปภายนอก':'เฟิร์มแวร์ฟีเจอร์โฟน'} • ภาระระบบ ${(x.parts.os.overhead*100).toFixed(0)}%`);
      if(x.comparison){const c=x.comparison;row("เทียบรุ่นก่อนของบริษัทเดียวกัน",`CPU ${c.cpuThroughput.toFixed(2)} • RAM ${c.ramMB} MB • พื้นที่ ${c.storageMB} MB • คุณภาพกล้อง ${c.cameraQuality.toFixed(2)}\nแบต ${c.batteryHours.toFixed(1)} ชั่วโมง • เว็บ ${c.web.toFixed(1)} • กราฟิก ${c.game.toFixed(1)} • ราคา ${moneyFull(c.priceSatang)}\nค่าต่างเป็นบวกหรือลบได้ รุ่นใหม่ไม่ได้ดีกว่าทุกด้าน`);}
      row("สินค้าสำเร็จและราคา",`ผลิตแล้ว ${x.produced} เครื่อง • ขายแล้ว ${x.sold} เครื่อง • ราคา ${moneyFull(x.priceSatang)} • ต้นทุนประกอบล่าสุด ${x.actualUnitCostSatang?moneyFull(x.actualUnitCostSatang):"ยังไม่ผลิต"}`);
      row("ความเข้ากันได้ / ผลทดสอบ",x.evaluation?.compatible?"ผ่านด่านชิ้นส่วนและไดรเวอร์ของแบบนี้":(x.evaluation?.reasonsTh||[]).join(" • ")||"ยังไม่มีผลทดสอบ");
      for(const p of projects.filter(p=>p.designId===x.id||p.productId===x.id))row(({handset:"โครงการแบบโทรศัพท์",semiconductor:"โครงการออกแบบชิป",platform:"โครงการแพลตฟอร์ม",component:"โครงการพัฒนาชิ้นส่วน"})[p.type]||"โครงการวิศวกรรม",`${state(p.status)} • ${Math.round(p.progress||0)}/${p.requiredMinutes||0} นาที • ${reason(p)}\nผู้ร่วมวิจัย: ${list(p.contributors||p.contributorIds||p.engineerIds).map(z=>typeof z==="string"?personName(z):name(z)).join(" • ")||"ยังไม่มีผู้ร่วมโครงการ"}`);
    } else if(uiState.subTab==="phone_supply") {
      const selected=select(firms,"phoneSupplyFirm","เลือกบริษัทที่ต้องการดูคลัง");if(!selected){empty();return;}
      const raw=Object.entries(selected.rawStock||{}).filter(([,q])=>q>0);row("วัตถุดิบในคลัง — "+name(selected),raw.map(([id,q])=>(v.catalog?.materials?.find(m=>m.id===id)?.nameTh||({pcb:"แผงวงจร",silicon_wafer:"เวเฟอร์ซิลิคอน",copper_coil:"ลวดทองแดง",glass_bottle:"แก้วแปรรูป",battery:"แบตเตอรี่ต้นแบบ",polymer_resin:"เรซินพอลิเมอร์",metal_sheet:"แผ่นโลหะ"})[id]||id)+" × "+q).join(" • ")||"ยังไม่มีวัตถุดิบในคลัง");
      const lots=list(d.lots).filter(l=>l.ownerId===selected.id), contracts=list(d.contracts).filter(c=>c.buyerId===selected.id||c.sellerId===selected.id), wips=wipBatches.filter(w=>w.firmId===selected.id);
      row("การผลิตและการส่งมอบ",`ล็อตผลิต ${lots.length} ล็อต • งานระหว่างทำ (WIP) ${wips.length} ชุด • สัญญา ${contracts.length} ฉบับ`);
      for(const wBatch of wips.slice(0,8))row(`ชุดแปรรูป WIP — ${wBatch.kind} (${wBatch.materialGrade||'มาตรฐาน'})`,`สถานะ ${state(wBatch.stage)} • ดี ${wBatch.goodUnits}/${wBatch.quantity} หน่วย • เวลางาน ${wBatch.workMinutesDone}/${wBatch.requiredWorkMinutes} นาที\n${wBatch.reasonTh}`);
      for(const l of lots)row((l.kind==="phone"?name(lookup(designs,l.designId)):({chip:"ชิปประมวลผล",ram:"RAM",storage:"หน่วยเก็บข้อมูล",display:"หน้าจอ",battery:"แบตเตอรี่",camera:"กล้อง",enclosure:"ตัวถัง",pcb_rf:"บอร์ด HDI/RF"})[l.kind]||"ชิ้นส่วน") + " — ล็อตผลิต",`${firmName(l.ownerId||l.firmId)} • รับเข้าวันที่ ${l.day}${l.materialGrade?" • เกรด "+l.materialGrade:""}\nจำนวน ${l.available??0} คงเหลือ / ${l.reserved??0} ระหว่างส่ง / ${l.used??0} เบิกใช้ / ${l.sold??0} ขายแล้ว • ต้นทุน ${moneyFull(l.costSatang??l.totalCostSatang??l.cost??0)}\nต้นทุนต่อหน่วย ${moneyFull(l.unitCostSatang||0)}`);
      for(const c of contracts)row(c.kind==="raw"?"ขนส่งวัตถุดิบ":"ขนส่งชิ้นส่วน",`${firmName(c.sellerId)} → ${firmName(c.buyerId)} • ${state(c.status)}\nจำนวน ${c.quantity} • จ่ายผู้ขาย ${moneyFull(c.paidSatang)} • ภาษี ${moneyFull(c.taxSatang||0)}\nสั่งวันที่ ${c.day} • กำหนดรับวันที่ ${c.dueDay}`);
      if(!lots.length&&!contracts.length)empty();
    } else if(uiState.subTab==="phone_people") {
      for(const p of people){const c=row(name(p),`${p.employment==='campus'?'ย้ายมาเป็นพนักงานบริษัทเราแล้ว':firmName(p.employerId)} • ${({ceo:'ผู้บริหาร',engineer:'วิศวกร',commercial:'จัดซื้อและการค้า'})[p.role]||'ผู้เชี่ยวชาญ'}\n${p.duties}\nค่าจ้างต่อวัน ${moneyFull(p.dailyWageSatang)} • ความพึงพอใจ ${p.satisfaction} • ความผูกพัน ${p.loyalty}\nงานวันนี้ ${p.workedMinutes}/360 นาที`);const subjects=Object.entries(p.education?.subjects||{}).sort((a,b)=>b[1]-a[1]).slice(0,10);c.append(el('div','muted',subjects.map(([id,n])=>(v.companyKnowledge?.subjects?.[id]||({electrical_basics:'พื้นฐานไฟฟ้า',software:'พัฒนาซอฟต์แวร์',programming:'เขียนโปรแกรม',semiconductor_physics:'ฟิสิกส์สารกึ่งตัวนำ',semiconductor_process:'กระบวนการผลิตสารกึ่งตัวนำ',semiconductor_optics:'ออปติคัลและเซ็นเซอร์ภาพ',power_electronics:'อิเล็กทรอนิกส์กำลัง',smt_process:'การประกอบวงจร SMT',metal_machining:'งานขึ้นรูปโลหะ',physical_chemistry:'เคมีเชิงฟิสิกส์',chemical_processing:'กระบวนการเคมี',circuit_design:'ออกแบบวงจร',metrology:'มาตรวิทยา',embedded_firmware:'เฟิร์มแวร์',people_management:'บริหารคน',procurement:'จัดซื้อ'})[id]||id)+' '+Math.floor(n)+'/100').join(' • ')));}
      if(!people.length)empty();
    } else {
      const cohorts=list(d.cohorts);
      row("ยอดขาย ช่องทางจัดจำหน่าย และผู้ใช้งานจริง",`ยอดขายสะสม ${d.headlineMetrics?.sold||0} เครื่อง • ฐานใช้งานจริง ${d.headlineMetrics?.activeInstalled||0} เครื่อง • ช่องทางผู้ให้บริการเครือข่าย/ตัวแทนจำหน่าย ${channels.length} รายการ`);
      for(const c of cohorts)row(name(lookup(designs,c.designId)),`ยอดขาย ${c.quantity??c.salesUnits??0} เครื่อง • ฐานใช้งาน ${c.active??c.installedBase??0} เครื่อง • ช่องทาง ${c.channel||'direct_household'} (${c.networkGen||'2G'})\n${reason(c)}`);
      const news=list(d.news);for(const n of news.slice(0,40))row(name(n),`${n.day!=null?"วันที่ "+n.day+" • ":""}${reason(n)}`);
      if(!cohorts.length&&!news.length)empty();
    }
  }

  function renderActiveSheet(v) {
    if (!uiState.sheetOpen) return;
    if(uiState.sheetMode === "world" && document.activeElement?.classList.contains("world-select")) return;
    const body = byId("shBody");
    if (!body) return;

    if (uiState.sheetMode === "phoneIndustry") { renderPhoneIndustry(v,body); return; }
    if (uiState.sheetMode === "world") { renderWorldSheet(v,body); return; }
    if (uiState.sheetMode === "company") { renderCompanySheet(v,body); return; }

    if (uiState.sheetMode === "person") {
      renderCharacterSheet(v, body);
      return;
    }
    if (uiState.sheetMode === "building") {
      renderBuildingSheet(v, body);
      return;
    }

    if (uiState.sheetMode === "people") {
      const employedList = v.people.filter((p) => p.employed);
      byId("shTitle").textContent = "👥 ทำเนียบพนักงาน โครงสร้างองค์กร และฝ่ายบุคคล";
      setSheetTabs([
        { id: "roster", label: `พนักงานปัจจุบัน (${employedList.length})` },
        { id: "org", label: "🏛️ โครงสร้างองค์กร (ออฟฟิศ & โรงงาน)" },
        { id: "hr", label: "ระบบสรรหาอัตโนมัติ (HR)" },
      ]);
      if (uiState.subTab === "org") {
        const org = v.orgSummary || { totalEmployed: employedList.length, executiveCount: 1, officeCount: 3, factoryCount: 4, levelPyramid: [], departments: [] };
        const summaryCard = el("div", "card");
        summaryCard.append(
          el("h3", "", "🏛️ พีระมิดลำดับขั้นการบังคับบัญชา 10 ระดับ (Lv.1–Lv.10 / G1–G10) & ผังองค์กร 4 ชั้น"),
          el(
            "div",
            "logrow",
            `👥 พนักงานรวมทั้งสิ้น: ${org.totalEmployed} คน (เพดานรองรับสูงสุด ${v.catalog.rules?.maxPeople || 500} คน) • 👑 สายงานบริหาร/CEO: ${org.executiveCount} คน • 🏢 สายงานออฟฟิศ: ${org.officeCount} คน • 🏭 สายงานโรงงาน: ${org.factoryCount} คน`,
          ),
          el(
            "div",
            "muted",
            "ลำดับชั้นบังคับบัญชาจริง 10 ขั้น: ปฏิบัติการ (Lv.1) › ชำนาญการ (Lv.2) › หัวหน้ากลุ่มในไลน์ผลิต (Lv.3) › หัวหน้าหมวด/กะ (Lv.4) › รองหัวหน้าแผนก (Lv.5) › หัวหน้าแผนก (Lv.6) › รองผู้อำนวยการฝ่าย (Lv.7) › ผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน (Lv.8) › รองกรรมการผู้จัดการใหญ่ C-Suite (Lv.9) › ประธานเจ้าหน้าที่บริหาร CEO (Lv.10)",
          ),
        );
        if (Array.isArray(org.levelPyramid) && org.levelPyramid.length) {
          for (const tier of [...org.levelPyramid].reverse()) {
            summaryCard.append(
              el(
                "div",
                "logrow",
                `[${tier.gradeCode} / Lv.${tier.level}] ${tier.tierNameTh} — ปัจจุบัน ${tier.count} คน (${tier.chainRoleTh})${tier.sampleNames?.length ? " • อาทิ: " + tier.sampleNames.join(", ") : ""}`,
              ),
            );
          }
        }

        const deptCards = (org.departments || []).map((dept) => {
          const dc = el("div", "card");
          dc.append(
            el("h3", "", `${dept.divisionId === "executive" ? "👑" : dept.divisionId === "office" ? "🏢" : "🏭"} ${dept.departmentTh} (${dept.roleNameTh})`),
            el("div", "muted", `สายงาน: ${dept.divisionNameTh} • สถานที่ปฏิบัติงาน: ${dept.zoneTh}`),
            el("div", "logrow", `ภารกิจหลัก: ${dept.coreDutiesTh}`),
            el(
              "div",
              "logrow",
              `ผู้บังคับบัญชาสายตรง: ${dept.supervisorName} (${dept.supervisorBadge || "Lv.1"}) • กำลังพลในฝ่าย: ${dept.headcount} คน (ผอ.ฝ่าย Lv.7+: ${dept.directorCount || 0} | ผจก.แผนก Lv.5-6: ${dept.deptManagerCount || 0} | หัวหน้ากะ Lv.4: ${dept.foremanCount || 0} | หัวหน้ากลุ่ม Lv.3: ${dept.groupLeaderCount || 0} | อาวุโส Lv.2: ${dept.seniorCount || 0})`,
            ),
          );
          if (Array.isArray(dept.sections) && dept.sections.length) {
            for (const sec of dept.sections) {
              const grpTxt = (sec.groups || [])
                .map((g) => `${g.nameTh} (${g.headcount} คน, หน.กลุ่ม: ${g.leaderName})`)
                .join("  |  ");
              dc.append(
                el(
                  "div",
                  "logrow",
                  `📂 ${sec.nameTh} (กำลังพล ${sec.headcount} คน • หน.แผนก: ${sec.sectionHeadName}) › กลุ่มย่อย: ${grpTxt}`,
                ),
              );
            }
          }
          if (dept.quotaLv2 && dept.quotaLv3) {
            dc.append(
              el(
                "div",
                "muted",
                `โควตาเลื่อนขั้นตาม Span of Control — อาวุโส Lv.2: ${dept.quotaLv2.currentCount}/${dept.quotaLv2.maxQuota} | หัวหน้ากลุ่ม Lv.3: ${dept.quotaLv3.currentCount}/${dept.quotaLv3.maxQuota} | หัวหน้ากะ Lv.4: ${dept.quotaLv4 ? dept.quotaLv4.currentCount + "/" + dept.quotaLv4.maxQuota : "-"} | ผจก.แผนก Lv.6: ${dept.quotaLv6 ? dept.quotaLv6.currentCount + "/" + dept.quotaLv6.maxQuota : "-"}`,
              ),
            );
          }
          return dc;
        });
        body.replaceChildren(summaryCard, ...deptCards);
        return;
      }

      if (uiState.subTab === "hr") {
        const c = el("div", "card");
        c.append(
          el("h3", "", "🤝 ระบบฝ่ายบุคคลและผู้บริหารสรรหาคนอัตโนมัติ"),
          el(
            "div",
            "muted",
            "เมื่อปริมาณงานค้างสะสมล้นมือต่อเนื่องและกระแสเงินสดมี Runway > 30 วัน ฝ่ายบุคคลและ CEO จะคัดเลือกผู้สมัครด้านล่างเข้าทำงานตามแผนกที่ขาดแคลนโดยอัตโนมัติ (รองรับการขยายตัวสูงสุด 500 คน)",
          ),
        );
        for (const cand of v.candidates || []) {
          const cid = cand.identity || {};
          const item = el("div", "logrow");
          item.append(
            el(
              "strong",
              "",
              `ผู้สมัคร: ${cid.flag || "🇹🇭"} ${cid.displayName || cand.name} (${cid.genderSymbol || "♂"} เพศ${cid.genderTh || "ชาย"} • อายุ ${cid.age || 25} ปี • สัญชาติ${cid.nationalityTh || "ไทย"})`,
            ),
            el(
              "div",
              "muted",
              `🎓 ${cid.educationTh || "เทคนิคอุตสาหกรรม"} • ค่าแรงที่คาดหวัง ${money(cand.dailyWage)}/วัน • พร้อมเข้าสัมภาษณ์เมื่อบริษัทขยายทีม`,
            ),
          );
          c.append(item);
        }
        body.replaceChildren(c);
      } else {
        const c = el("div", "card");
        const filterRow = el("div", "");
        filterRow.style.display = "flex";
        filterRow.style.justifyContent = "space-between";
        filterRow.style.alignItems = "center";
        filterRow.style.flexWrap = "wrap";
        filterRow.style.gap = "6px";
        filterRow.style.marginBottom = "8px";
        filterRow.append(el("h3", "", "แตะที่ชื่อพนักงานเพื่อเปิดดูแผ่นประวัติ หรือกด ⭐ เพื่อปักหมุดติดตาม"));

        const divChips = el("div", "");
        divChips.style.display = "flex";
        divChips.style.gap = "4px";
        divChips.style.flexWrap = "wrap";
        for (const [dKey, dLabel] of [
          ["ALL", "ทุกสายงาน"],
          ["executive", "👑 บริหาร/CEO"],
          ["office", "🏢 ฝ่ายออฟฟิศ"],
          ["factory", "🏭 ฝ่ายโรงงาน"],
        ]) {
          const btn = el("button", "chip" + (uiState.peopleDivisionFilter === dKey ? " b" : ""), dLabel);
          btn.onclick = () => {
            uiState.peopleDivisionFilter = dKey;
            renderActiveSheet(current);
          };
          divChips.append(btn);
        }
        const trkToggle = el(
          "button",
          "chip" + (uiState.peopleFilterTrackedOnly ? " g" : ""),
          `⭐ เฉพาะที่ติดตาม (${uiState.trackedIds.size})`,
        );
        trkToggle.onclick = () => {
          uiState.peopleFilterTrackedOnly = !uiState.peopleFilterTrackedOnly;
          renderActiveSheet(current);
        };
        divChips.append(trkToggle);
        filterRow.append(divChips);
        c.append(filterRow);

        const list = employedList.filter(
          (x) =>
            (!uiState.peopleFilterTrackedOnly || uiState.trackedIds.has(x.id)) &&
            (uiState.peopleDivisionFilter === "ALL" || x.career?.division === uiState.peopleDivisionFilter),
        );
        if (!list.length) {
          c.append(el("div", "muted", "ไม่พบพนักงานในหมวดที่เลือก"));
        } else {
          for (const p of list.slice(0, uiState.rosterLimit)) {
            c.append(makePersonRow(v, p));
          }
          if (list.length > uiState.rosterLimit) {
            const moreBtn = el(
              "button",
              "btn",
              `แสดงเพิ่มอีก (${uiState.rosterLimit}/${list.length} คน)`,
            );
            moreBtn.style.marginTop = "8px";
            moreBtn.onclick = () => {
              uiState.rosterLimit += 80;
              renderActiveSheet(current);
            };
            c.append(moreBtn);
          }
        }
        body.replaceChildren(c);
      }
      return;
    }

    if (uiState.sheetMode === "campus") {
      byId("shTitle").textContent = "🏢 อาคารและผังนิคมอุตสาหกรรม";
      setSheetTabs([
        { id: "buildings", label: `อาคารหลักทั้ง ${v.campus?.buildings?.length || 0} แห่ง` },
        { id: "expand", label: "การขยายนิคมและสถานี" },
      ]);
      if (uiState.subTab === "expand") {
        const c = el("div", "card");
        c.append(
          el("h3", "", "🏗️ การลงทุนขยายพื้นที่นิคมและก่อสร้างอาคารใหม่"),
          el(
            "div",
            "muted",
            `ขนาดพื้นที่ปัจจุบัน: ${v.scene.layout.width} × ${v.scene.layout.height} ช่อง • สถานีทำงานรวม ${Object.keys(v.scene.layout.stations).length} จุด • ก่อสร้างอาคารส่วนต่อขยายแล้ว ${(v.campus?.constructedPlots || []).length}/${(v.campus?.expansionPlots || []).length} แห่ง`,
          ),
          el(
            "div",
            "muted",
            "การอัปเกรดอาคารและการก่อสร้างคลังวัตถุดิบ/ไลน์การผลิตใหม่เป็นการตัดสินใจของ CEO ตามเงินสำรองและการเติบโตของบริษัท",
          ),
        );
        for (const pl of v.campus?.expansionPlots || []) {
          const item = el("div", "logrow");
          item.append(
            el(
              "strong",
              "",
              `${pl.constructed ? "✅ ก่อสร้างแล้ว" : "📐 แปลงที่ดินรองรับการขยายตัว"}: ${pl.icon} ${pl.nameTh} (งบลงทุน ${money(pl.cost)})`,
            ),
            el("div", "muted", `${pl.subtitleTh} • ผลประโยชน์: ${pl.benefitTh}`),
          );
          c.append(item);
        }
        body.replaceChildren(c);
      } else {
        const c = el("div", "card");
        c.append(el("h3", "", "คลิกที่อาคารเพื่อส่องดูพนักงานและสายงานภายใน"));
        const allList = [
          ...(v.campus?.buildings || []),
          ...(v.campus?.expansionPlots || []).filter((pl) => pl.constructed),
        ];
        for (const b of allList) {
          const row = el("div", "prow");
          const pi = el("div", "pi");
          pi.append(
            el("div", "nm", `${b.icon} ${b.nameTh}${b.id === "gate" || b.constructed ? "" : ` (Lv.${b.level})`}`),
            el("div", "sub", b.subtitleTh),
          );
          row.append(
            pi,
            el("span", "chip g", `👥 ${b.totalAssignedCount} คน`),
            el("span", "chip ok", `⚙️ ${b.activeJobCount} งาน`),
          );
          row.onclick = () => openBuildingSheet(b.id);
          c.append(row);
        }
        body.replaceChildren(c);
      }
      return;
    }

    if (uiState.sheetMode === "log") {
      byId("shTitle").textContent = "📋 พงศาวดารนิคม รายงานประจำรอบ และสมุดบัญชี";
      setSheetTabs([
        { id: "events", label: "พงศาวดาร & รายงาน (Chronicle)" },
        { id: "digest", label: "สรุปผลประจำรอบ (1/7/30 วัน)" },
        { id: "ledger", label: "สมุดบัญชีแยกประเภท" },
      ]);

      if (uiState.subTab === "digest") {
        const c = el("div", "card");
        c.append(el("h3", "", "📊 รายงานสรุปผลการดำเนินงาน 4 บัญชีหลัก (Periodic Digest)"));
        const pBar = el("div", "");
        pBar.style.display = "flex";
        pBar.style.gap = "6px";
        pBar.style.marginBottom = "10px";
        for (const [k, lb] of [
          ["d1", "รอบ 1 วันล่าสุด"],
          ["d7", "รอบ 7 วันล่าสุด"],
          ["d30", "รอบ 30 วันล่าสุด"],
        ]) {
          const btn = el("button", "chip" + (uiState.digestPeriod === k ? " g" : ""), lb);
          btn.onclick = () => {
            uiState.digestPeriod = k;
            renderActiveSheet(current);
          };
          pBar.append(btn);
        }
        c.append(pBar);

        const dg = v.digests?.[uiState.digestPeriod] || v.digests?.d1;
        if (dg) {
          const acc1 = el("div", "card");
          acc1.append(
            el("h3", "", `💰 1. บัญชีการเงินและกระแสเงินสด (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `รายรับจากการขาย: +${moneyFull(dg.cashflow.revenue)} | ค่าวัตถุดิบ: -${moneyFull(dg.cashflow.materials)} | ค่าจ้างและสวัสดิการ: -${moneyFull(dg.cashflow.payrollAndWelfare)} | ค่าเช่าและโสหุ้ย: -${moneyFull(dg.cashflow.overhead)}`,
            ),
            el(
              "div",
              "logrow",
              `กระแสเงินสดสุทธิจากการดำเนินงาน: ${dg.cashflow.netOperating >= 0 ? "+" : ""}${moneyFull(dg.cashflow.netOperating)} (เงินสดคงเหลือ ${moneyFull(dg.cashflow.endingCash)} • หนี้ธนาคาร ${moneyFull(dg.cashflow.endingDebt)})`,
            ),
          );

          const acc2 = el("div", "card");
          acc2.append(
            el("h3", "", `⚙️ 2. บัญชีสายการผลิตและคุณภาพ (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `เซ็นรับดีลใหม่: ${dg.operations.dealsAccepted} ดีล • ส่งมอบสำเร็จ: ${dg.operations.ordersDelivered} ออเดอร์ • ผ่านการตรวจ QC: ${dg.operations.qcPassed} ครั้ง • ตีกลับซ่อม (Rework): ${dg.operations.qcRework} ครั้ง • งานค้างในระบบ: ${dg.operations.activeJobs} งาน`,
            ),
          );

          const acc3 = el("div", "card");
          acc3.append(
            el("h3", "", `📦 3. บัญชีคลังพัสดุและซัพพลายเชน (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `ใบสั่งซื้ออัตโนมัติ (PO): ${dg.inventory.poIssued} รายการ • พัสดุรับเข้าคลัง: ${dg.inventory.deliveriesReceived} รอบ • วัตถุดิบคงคลังรวม: ${dg.inventory.totalRawUnits} ชิ้น • สินค้าสำเร็จรูปพร้อมส่ง: ${dg.inventory.totalFinishedUnits} ชิ้น`,
            ),
          );

          const acc4 = el("div", "card");
          acc4.append(
            el("h3", "", `👥 4. บัญชีบุคลากรและวัฒนธรรมองค์กร (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `พนักงานปัจจุบัน: ${dg.people.headcount} คน (รับเพิ่มในรอบนี้ ${dg.people.hiresInPeriod} คน) • ความเครียดเฉลี่ย: ${dg.people.avgStress} • ขวัญกำลังใจเฉลี่ย: ${dg.people.avgMorale} • พลังงานเฉลี่ย: ${dg.people.avgEnergy} • แต้มวิจัย R&D สะสม: ${dg.people.researchPoints}`,
            ),
          );
          body.replaceChildren(c, acc1, acc2, acc3, acc4);
        } else {
          body.replaceChildren(c);
        }
        return;
      }

      if (uiState.subTab === "ledger") {
        const c = el("div", "card");
        c.append(el("h3", "", "💳 รายการเดินบัญชีแบบ Double-Entry ล่าสุด (Closed-Loop Accounting)"));
        for (const entry of [...(v.ledger || [])].reverse()) {
          const d = Math.floor(entry.at / 1440) + 1;
          const r = el("div", "logrow");
          r.append(
            el("span", "tm", `วันที่ ${d}`),
            el("span", "actor", `[${entry.kind}] `),
            el(
              "strong",
              "",
              `${entry.delta >= 0 ? "+" : ""}${moneyFull(entry.delta)}`,
            ),
            el("span", "muted", entry.reference ? ` (${entry.reference})` : ""),
          );
          c.append(r);
        }
        body.replaceChildren(c);
        return;
      }

      const c = el("div", "card");
      c.append(el("h3", "", "📜 พงศาวดารนิคมและตัวกรองข่าวสาร (Living Corporate Chronicle)"));

      const modeRow = el("div", "");
      modeRow.style.display = "flex";
      modeRow.style.gap = "4px";
      modeRow.style.flexWrap = "wrap";
      modeRow.style.marginBottom = "6px";
      for (const [mId, mLb] of [
        ["ALL", "ทั้งหมด"],
        ["MAJOR_ONLY", "เฉพาะเรื่องสำคัญ"],
        ["OPS_FINANCE", "ปฏิบัติการ/การเงิน"],
        ["TRACKED_ONLY", `⭐ เฉพาะคนที่ติดตาม (${uiState.trackedIds.size})`],
        ["QUIET_DIGEST", "โหมดเงียบ (เฉพาะวิกฤต/ดีลใหญ่)"],
      ]) {
        const b = el("button", "chip" + (uiState.newsMode === mId ? " g" : ""), mLb);
        b.onclick = () => {
          uiState.newsMode = mId;
          renderActiveSheet(current);
        };
        modeRow.append(b);
      }

      const catRow = el("div", "");
      catRow.style.display = "flex";
      catRow.style.gap = "4px";
      catRow.style.flexWrap = "wrap";
      catRow.style.marginBottom = "8px";
      for (const [cId, cLb] of [
        ["ALL", "ทุกหมวด"],
        ["WORLD_GEOPOLITICS", "🌍 พงศาวดารโลก/ภูมิรัฐศาสตร์"],
        ["SALES", "ฝ่ายขาย/ลูกค้า"],
        ["PROD", "โรงงาน/QC"],
        ["SUPPLY", "คลัง/จัดซื้อ"],
        ["HR_CULTURE", "บุคลากร/ชีวิต"],
        ["FINANCE", "การเงิน/ลงทุน"],
        ["RND", "วิจัย R&D"],
      ]) {
        const b = el("button", "chip" + (uiState.newsCategory === cId ? " b" : ""), cLb);
        b.onclick = () => {
          uiState.newsCategory = cId;
          renderActiveSheet(current);
        };
        catRow.append(b);
      }
      c.append(modeRow, catRow);

      const records = [...(v.chronicle || [])].filter((item) => {
        if (uiState.newsCategory !== "ALL" && item.category !== uiState.newsCategory) return false;
        if (uiState.newsMode === "MAJOR_ONLY" && !item.major) return false;
        if (
          uiState.newsMode === "OPS_FINANCE" &&
          !["SALES", "PROD", "SUPPLY", "FINANCE", "RND"].includes(item.category)
        ) {
          return false;
        }
        if (uiState.newsMode === "TRACKED_ONLY") {
          if (!item.actorId || !uiState.trackedIds.has(item.actorId)) return false;
        }
        if (uiState.newsMode === "QUIET_DIGEST") {
          if (!item.major && item.epistemic !== "VERIFIED") return false;
        }
        return true;
      });

      if (!records.length) {
        c.append(el("div", "muted", "ไม่มีรายการบันทึกที่ตรงกับตัวกรองปัจจุบัน"));
      } else {
        for (const rec of records.slice(0, 45)) {
          const r = el("div", "logrow");
          const top = el("div", "");
          top.style.display = "flex";
          top.style.flexWrap = "wrap";
          top.style.gap = "5px";
          top.style.alignItems = "center";

          const epCls =
            rec.epistemic === "VERIFIED"
              ? "ok"
              : rec.epistemic === "OBSERVED"
                ? "b"
                : "g";
          top.append(
            el("span", "tm", `วันที่ ${rec.day} ${formatTime(rec.minuteOfDay)}`),
            el("span", `chip ${epCls}`, rec.epistemicLabelTh),
            el("span", "chip", rec.categoryLabelTh),
          );
          if (rec.actorName) {
            const actorBtn = el("button", "chip g", `👤 ${rec.actorName}`);
            actorBtn.onclick = () => openPersonSheet(rec.actorId);
            top.append(actorBtn);
          }
          const msg = el("div", "", rec.message);
          msg.style.marginTop = "3px";
          const mean = el("div", "muted", `↳ ความหมายเชิงระบบ: ${rec.meaningTh}`);
          mean.style.fontSize = "11px";
          r.append(top, msg, mean);
          c.append(r);
        }
      }
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "market") {
      byId("shTitle").textContent = "📦 ตลาด B2B โลจิสติกส์ซัพพลายเชน และแบบแปลน R&D";
      setSheetTabs([
        { id: "orders", label: "🤝 ดีลฝ่ายขาย & ออเดอร์ B2B" },
        { id: "chains", label: "🌾 ต้นน้ำแท้จริง & วงจรเกษตร" },
        { id: "biz_processes", label: "🏛️ โปรเซส 8 โมเดลธุรกิจ & บริการ B2B (บท 21)" },
        { id: "fleet", label: "🚛 กองรถขนส่ง B2B (บท 19)" },
        { id: "software", label: "💻 ซอฟต์แวร์ & SaaS (บท 20)" },
        { id: "logistics", label: "🏭 ไลน์ผลิต & โลจิสติกส์โรงงาน" },
        { id: "stock", label: `คลังวัตถุดิบ ${v.catalog?.materials?.length || 51} ชนิด` },
        { id: "rnd", label: `แบบแปลนวิจัย ${v.catalog?.products?.length || 42} ชนิด` },
      ]);
      if (uiState.subTab === "chains") {
        body.replaceChildren(...renderExternalAssetsAndChainsView(v));
        return;
      }
      if (uiState.subTab === "biz_processes") {
        const sp = v.sectorProcesses || {};
        const fb = sp.foodBakery || {};
        const er = sp.electronicsRma || {};
        const ao = sp.automotiveOem || {};
        const bm = sp.biomedSterile || {};
        const sv = v.serviceBusiness || { orders: {}, instrumentCustody: {}, metrics: {}, history: [] };
        const svm = sv.metrics || {};

        const overviewCard = el("div", "card");
        overviewCard.append(
          el("h3", "", "🏛️ สถาปัตยกรรม 8 โมเดลธุรกิจที่มีโปรเซสเฉพาะตัวแตกต่างกันจริง (8 Distinct Business Process Models)"),
          el(
            "div",
            "muted",
            "ทุกกลุ่มธุรกิจในเกมไม่ได้เปลี่ยนแค่ชื่อกับตัวเลขรายได้ แต่มี State Machine, ทรัพยากรคอขวด, กฎการรับรู้รายได้ และความเสี่ยงเฉพาะทางของตนเองตามความเป็นจริง",
          ),
        );
        for (const m of v.catalog?.businessProcessModels || []) {
          overviewCard.append(
            el(
              "div",
              "logrow",
              `🔹 [${m.id}] ${m.nameTh} — โปรเซส: ${m.keyProcessTh} • รายได้จาก: ${m.revenueDriverTh} • ต้นทุนหลัก: ${m.costDriverTh} • ความเสี่ยงเฉพาะ: ${m.failureRiskTh}`,
            ),
          );
        }

        const sectorCard = el("div", "card");
        sectorCard.append(
          el("h3", "", "🏭 สถานะโปรเซสเฉพาะทางของโรงงานทั้ง 4 อุตสาหกรรม (4 Distinct Factory Sector Process Engines)"),
          el(
            "div",
            "logrow",
            `🥖 [1. อาหารและเบเกอรี่ — Batch Shelf-Life & Cold-Chain] ห้องเย็น Cold-Chain: ${fb.coldChainActive ? "🟢 เปิดใช้งาน (ยืดอายุ 7 วัน)" : "⚪ มาตรฐาน (อายุ 3 วัน)"} • ล็อตอาหารสดในคลัง: ${Object.keys(fb.activeBatches || {}).length} ล็อต • ส่งมอบสดใหม่: ${fb.freshShippedCount || 0} ชิ้น | ส่งช่วงลดราคา: ${fb.markdownShippedCount || 0} ชิ้น • หมดอายุคัดทิ้ง: ${fb.spoiledUnitsCount || 0} ชิ้น (แปรรูปเป็นปุ๋ยหมักชีวภาพ +${fb.compostRecoveredUnits || 0} ถุง) — ${fb.lastSpoilageEventTh || "-"}`,
          ),
          el(
            "div",
            "logrow",
            `🔬 [2. อิเล็กทรอนิกส์และเซมิคอนดักเตอร์ — SMT Burn-In & RMA Warranty] เฟิร์มแวร์ปัจจุบัน: ${er.firmwareRevision || "Rev.1.2"} • ผ่านทดสอบ Burn-In: ${er.burnInPassCount || 0} เครื่อง • ล็อตอยู่ในระยะประกันหลังการขาย: ${(er.warrantyLots || []).length} ล็อต • ใบเคลม RMA สะสม: ${er.totalRmaClaims || 0} รายการ (ซ่อม/ชดเชยแล้ว ${er.resolvedRmaCount || 0} รายการ • ต้นทุนเคลมประกัน -${moneyFull(er.warrantyCostSatang || 0)}) — ${er.lastRmaSummaryTh || "-"}`,
          ),
          el(
            "div",
            "logrow",
            `🦾 [3. ยานยนต์ไฟฟ้า พลังงาน และหุ่นยนต์ — Heavy OEM Die & Jig Changeover] สลับแม่พิมพ์/จิ๊กสะสม: ${ao.totalChangeovers || 0} ครั้ง (ต้นทุนตั้งจิ๊ก -${moneyFull(ao.toolingChangeoverCostSatang || 0)}) • ผ่านทดสอบโหลดจริง Dyno: ${ao.dynoCertifiedCount || 0} เครื่อง • โบนัสเดินเครื่องรุ่นเดิมต่อเนื่อง (Rhythm Bonus): ${ao.rhythmBonusUnits || 0} ชิ้น — ${ao.lastToolingSummaryTh || "-"}`,
          ),
          el(
            "div",
            "logrow",
            `🧬 [4. การแพทย์และเวชภัณฑ์คลีนรูม — ISO Class-5 Sterile Quarantine & Clinical Release] ดัชนีความปลอดเชื้อคลีนรูม: ${bm.sterilityIndex ?? 96}% (${bm.cleanroomClass || "ISO Class-5"}) • ออกใบรับรอง Clinical COA: ${bm.clinicalCertificatesIssued || 0} ล็อต • กักกัน/ระงับล็อตปนเปื้อน: ${bm.sterilityRejectedLots || 0} ล็อต — ${bm.lastSterileSummaryTh || "-"}`,
          ),
        );

        const serviceCard = el("div", "card");
        serviceCard.append(
          el("h3", "", "🔬🛠️♻️ ธุรกิจบริการวิศวกรรมและสิ่งแวดล้อม B2B ทั้ง 3 โมเดล (Industrial Services — บทที่ 21)"),
          el(
            "div",
            "muted",
            "1) ห้องแล็บสอบเทียบและออกใบรับรอง ISO (รับฝากเครื่องมือลูกค้าเข้าแล็บ ไม่ปนสต็อกบริษัท) • 2) บริการซ่อมบำรุงเครื่องจักรนอกสถานที่ตาม SLA (เบิกอะไหล่จริง หากเกินเวลา SLA ถูกหักค่าปรับ) • 3) บริการบำบัดของเสียและรีไซเคิลอุตสาหกรรม (รับค่าบำบัด + สกัดได้แผ่นโลหะ กล่องกระดาษ และปุ๋ยหมักกลับเข้าคลังจริง)",
          ),
          el(
            "div",
            "logrow",
            `✅ งานบริการส่งมอบสำเร็จ: ${svm.completedOrders || 0} ใบงาน • 🔬 ใบรับรองสอบเทียบ ISO: ${svm.calibrationCertificatesIssued || 0} ใบ • 🛠️ ซ่อมทันเวลา SLA: ${svm.slaOnTimeCount || 0} งาน (ผิดเวลา SLA: ${svm.slaBreachCount || 0} งาน) • ♻️ รีไซเคิลกากของเสีย: ${svm.recycledTonsProcessed || 0} ตัน (กู้คืนวัตถุดิบเข้าคลัง +${svm.recoveredMaterialsUnits || 0} ชิ้น)`,
          ),
          el(
            "div",
            "logrow",
            `💵 รายได้ธุรกิจบริการรวม: ${moneyFull(svm.serviceRevenueSatang || 0)} • 🧪 ต้นทุนสารมาตรฐาน/อะไหล่บริการ: -${moneyFull(svm.serviceCostSatang || 0)} • ⚠️ ค่าปรับผิดสัญญา SLA: -${moneyFull(svm.slaPenaltyPaidSatang || 0)} • 📦 เครื่องมือลูกค้าฝากสอบเทียบในแล็บ: ${Object.keys(sv.instrumentCustody || {}).length} ชิ้น`,
          ),
        );
        for (const o of Object.values(sv.orders || {})) {
          serviceCard.append(
            el(
              "div",
              "logrow",
              `${o.icon || "🔬"} [${o.id}] ${o.serviceNameTh} (${o.clientNameTh}) — สถานะ: ${o.status} • ผู้เชี่ยวชาญ: ${o.specialistName || "-"} • ค่าบริการ ${moneyFull(o.feeSatang)}${o.slaBreached ? " • ⚠️ เกินกำหนด SLA" : ""}`,
            ),
          );
        }
        body.replaceChildren(overviewCard, sectorCard, serviceCard);
        return;
      }
      if (uiState.subTab === "fleet") {
        const ft = v.fleetTransport || { vehicles: {}, openQuotes: [], contracts: {}, cargoCustody: {}, metrics: {}, history: [] };
        const m = ft.metrics || {};
        const fleetSummaryCard = el("div", "card");
        fleetSummaryCard.append(
          el("h3", "", "🚛 ธุรกิจขนส่งด้วยกองรถของบริษัท (Fleet Freight Transport Business — บทที่ 19)"),
          el(
            "div",
            "muted",
            "ฝ่ายโลจิสติกส์และ CEO บริหารกองรถบรรทุกอัตโนมัติ: ประเมินระยะทางไปจุดรับ + ขนส่ง + รถเปล่าขากลับ (Backhaul) หักน้ำมันดีเซล (diesel_liter) ค่าผ่านทาง และจองรถ+คนขับโดยไม่ชนกับงานส่งสินค้าภายในบริษัท สินค้าฝากขนของลูกค้าแยกออกจากสต็อกบริษัท 100%",
          ),
          el(
            "div",
            "logrow",
            `🚚 รถบรรทุกในกองรถ: ${Object.keys(ft.vehicles || {}).length} คัน • ✅ เที่ยววิ่งสำเร็จ: ${m.completedTrips || 0} เที่ยว • 🛣️ ระยะทางรวม: ${m.totalDistanceKm || 0} กม. (รถเปล่าขากลับ ${m.emptyBackhaulKm || 0} กม.) • ⛽ น้ำมันใช้สะสม: ${m.fuelConsumedLiters || 0} ลิตร`,
          ),
          el(
            "div",
            "logrow",
            `💵 รายได้ค่าขนส่งรับรู้: ${moneyFull(m.freightRevenueSatang || 0)} • 🧾 ลูกหนี้ค่าขนส่งค้างรับ: ${moneyFull(m.receivablesSatang || 0)} • ⛽ ต้นทุนน้ำมัน+ค่าผ่านทางจริง: -${moneyFull(m.tollAndFuelCostSatang || 0)} • 🔧 ค่าซ่อมบำรุงรถ/ยาง: -${moneyFull(m.maintenanceCostSatang || 0)}`,
          ),
        );
        for (const veh of Object.values(ft.vehicles || {})) {
          fleetSummaryCard.append(
            el(
              "div",
              "logrow",
              `🚛 [${veh.plate}] ${veh.nameTh} (${veh.ownership === "leased" ? "รถเช่า" : "รถบริษัท"}) — สถานะ: ${veh.status} • ความจุ ${veh.maxWeightKg} กก. / ${veh.maxVolumeM3} ลบ.ม. • สภาพเครื่อง ${veh.condition}% | สภาพยาง ${veh.tireCondition}% • เลขไมล์ ${veh.odometerKm} กม. • คนขับ: ${veh.assignedDriverName || "ว่างพร้อมรับงาน"}`,
            ),
          );
        }

        const contractsCard = el("div", "card");
        contractsCard.append(el("h3", "", "📋 ใบงานสัญญารับจ้างขนส่งและข้อเสนอเส้นทาง (Freight Contracts & Route Quotes)"));
        for (const c of Object.values(ft.contracts || {})) {
          contractsCard.append(
            el(
              "div",
              "logrow",
              `📦 [${c.id}] ${c.nameTh} (${c.clientNameTh}) — สถานะ: ${c.status} • สินค้าฝากขน: ${c.cargoNameTh} (${c.weightKg} กก.) • ไป-กลับ ${c.totalRoundTripKm} กม. (ขากลับรถเปล่า ${c.backhaulEmptyKm} กม.) • ค่าขนส่ง ${moneyFull(c.agreedRateSatang)} | น้ำมัน ${c.fuelLiters} ลิตร (${moneyFull(c.fuelCostSatang)}) + ค่าผ่านทาง ${moneyFull(c.tollFeeSatang)} ➔ ส่วนเกินก่อนโสหุ้ย ${moneyFull(c.expectedMarginBeforeOverheadSatang)}`,
            ),
          );
        }
        for (const q of (ft.openQuotes || []).filter((x) => x.status === "quoted")) {
          contractsCard.append(
            el(
              "div",
              "logrow",
              `📢 [ข้อเสนอรอประเมิน ${q.id}] ${q.nameTh}: ${q.cargoNameTh} (${q.weightKg} กก., ${q.volumeM3} ลบ.ม., ประเภท ${q.cargoType}) • ระยะรวมไป-กลับ ${q.totalRoundTripKm} กม. • เสนอค่าจ้าง ${moneyFull(q.offeredRateSatang)}`,
            ),
          );
        }
        body.replaceChildren(fleetSummaryCard, contractsCard);
        return;
      }
      if (uiState.subTab === "software") {
        const sb = v.softwareBusiness || { workstations: {}, projects: {}, saasProducts: {}, metrics: {}, history: [] };
        const sm = sb.metrics || {};
        const swCard = el("div", "card");
        swCard.append(
          el("h3", "", "💻 ธุรกิจซอฟต์แวร์และแอปพลิเคชัน: รับจ้างพัฒนา & บริการสมาชิก SaaS (บทที่ 20)"),
          el(
            "div",
            "muted",
            "ทีมวิศวกรและฝ่ายขายดำเนินโครงการซอฟต์แวร์ตามขั้นตอนจริง: เก็บความต้องการ ➔ สัญญา/มัดจำ 30% (บันทึกเป็นเงินรับล่วงหน้า ไม่นับเป็นกำไรทันที) ➔ พัฒนา ➔ ทดสอบ QA/แก้บั๊ก ➔ ลูกค้ารับมอบ (UAT 40%) ➔ เปิดใช้งานจริง (30%) • แอป SaaS คิดรายได้ตามจำนวนบัญชีผู้ใช้จริงเท่านั้น (0 ผู้ใช้ = 0 รายได้)",
          ),
          el(
            "div",
            "logrow",
            `🖥️ โต๊ะนักพัฒนา (dev_workstation): จอง ${(sb.workstations?.occupiedByPersonIds || []).length}/${sb.workstations?.totalStations || 3} เครื่อง • ☁️ ความจุเซิร์ฟเวอร์รองรับ: ${sb.workstations?.serverCapacityUsers || 60} บัญชี • ✅ โครงการส่งมอบสำเร็จ: ${sm.projectsCompleted || 0} โครงการ`,
          ),
          el(
            "div",
            "logrow",
            `💰 รายได้โครงการรับจ้างรับรู้แล้ว: ${moneyFull(sm.totalContractRevenueSatang || 0)} • ☁️ รายได้สมาชิกรายรอบ SaaS: ${moneyFull(sm.totalSaasRevenueSatang || 0)} • ⏳ เงินมัดจำรับล่วงหน้ารอส่งมอบ: ${moneyFull(sm.totalUnearnedDepositSatang || 0)} • 🖧 ต้นทุน Cloud/QA/Server: -${moneyFull(sm.totalComputeAndServerCostSatang || 0)}`,
          ),
        );
        for (const proj of Object.values(sb.projects || {})) {
          swCard.append(
            el(
              "div",
              "logrow",
              `🛠️ [${proj.id}] ${proj.titleTh} (v${proj.targetVersion}) — สถานะ: ${proj.status} • ผู้พัฒนา: ${proj.assignedDeveloperName || "-"} • ความคืบหน้า Dev ${proj.progressMinutes}/${proj.requiredDevMinutes}m | QA ${proj.qaProgressMinutes}/${proj.requiredQaMinutes}m (บั๊กพบ ${proj.defectsFound} แก้แล้ว ${proj.defectsFixed}) • มูลค่าสัญญา ${moneyFull(proj.contractPriceSatang)} (รับรู้รายได้แล้ว ${moneyFull(proj.recognizedRevenueSatang)} | มัดจำรอรับรู้ ${moneyFull(proj.unearnedDepositSatang)})`,
            ),
          );
        }

        const saasCard = el("div", "card");
        saasCard.append(el("h3", "", "☁️ ผลิตภัณฑ์แอปพลิเคชัน SaaS ทั้ง 8 ประเภท (SaaS Product Portfolio & Internal Dogfooding)"));
        for (const app of Object.values(sb.saasProducts || {})) {
          saasCard.append(
            el(
              "div",
              "logrow",
              `${app.icon || "📱"} ${app.nameTh} (v${app.version}) — สถานะ: ${app.status}${app.installedInternally ? " • 🟢 ติดตั้งใช้งานภายในบริษัทแล้ว" : ""} • Lead รอแปลง: ${app.leadCount} | ผู้ใช้จ่ายจริง: ${app.activeSubscribers} บัญชี (ค่าบริการ ${moneyFull(app.monthlyFeePerUserSatang)}/บัญชี/รอบ) • รายได้สะสม ${moneyFull(app.totalRevenueSatang)} — ${app.lastBillingSummaryTh}`,
            ),
          );
        }
        body.replaceChildren(swCard, saasCard);
        return;
      }
      const c = el("div", "card");
      if (uiState.subTab === "logistics") {
        const log = v.logistics || { b2bDeals: [], inboundShipments: [], outboundShipments: [], productionRegime: "lean_balanced", productionLines: {}, modeOutputCounts: {}, fleetCount: 2 };
        const lineCard = el("div", "card");
        lineCard.append(
          el("h3", "", "🏭 การแตกไลน์การผลิต 4 อาคาร (Lines A/B/C/D) & โหมดควบคุมจังหวะสายพาน"),
          el("div", "muted", `สภาพเครื่องจักรโรงงานปัจจุบัน: ${v.campus?.machineCondition ?? 100}% (ซ่อมบำรุงแล้ว ${v.campus?.maintenanceCount || 0} ครั้ง) • ขบวนรถบรรทุกขนส่ง: ${log.fleetCount || 2} คัน • รับวัตถุดิบสะสม ${log.totalInboundReceived || 0} เที่ยว • ส่งออกสะสม ${log.totalOutboundDispatched || 0} เที่ยว`),
        );
        const maintBtn = el("button", "btn pri", `🛠️ สั่งซ่อมบำรุงและสอบเทียบเครื่องจักรทันที (สภาพปัจจุบัน ${v.campus?.machineCondition ?? 100}% ➔ 100%)`);
        maintBtn.style.margin = "6px 0";
        maintBtn.onclick = () =>
          dispatch(
            { type: "maintainMachines" },
            "ซ่อมบำรุงและสอบเทียบเครื่องจักรโรงงานเต็ม 100% เรียบร้อยแล้ว",
          );
        lineCard.append(maintBtn);
        const regRow = el("div", "");
        regRow.style.display = "flex";
        regRow.style.flexWrap = "wrap";
        regRow.style.gap = "6px";
        regRow.style.margin = "6px 0 8px";
        for (const reg of v.catalog?.productionRegimes || []) {
          const isCur = (log.productionRegime || "lean_balanced") === reg.id;
          const btn = el("button", "chip" + (isCur ? " g" : ""), `⚙️ ${reg.nameTh}`);
          btn.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "setProductionRegime", regimeId: reg.id },
              `เปลี่ยนโหมดเดินเครื่องเป็น "${reg.nameTh}" แล้ว`,
            );
          regRow.append(btn);
        }
        lineCard.append(regRow);
        for (const line of Object.values(log.productionLines || {})) {
          lineCard.append(
            el(
              "div",
              "logrow",
              `${line.active ? "🟢 เดินเครื่อง" : "⚪ รอก่อสร้างอาคารบนที่ดินขยาย"}: ${line.nameTh} [${line.modeNameTh || "สายพานมาตรฐาน"}] • โบนัสความเร็ว +${line.speedBonusPct}% • ประกอบสำเร็จแล้ว ${line.unitsCompleted || 0} ชิ้น`,
            ),
          );
        }
        if (Array.isArray(v.catalog?.productionModes) && v.catalog.productionModes.length) {
          lineCard.append(el("h4", "", "🔬 รูปแบบเทคโนโลยีการผลิตเฉพาะทาง 5 ระบบ (5 Production Modes)"));
          for (const pm of v.catalog.productionModes) {
            const cnt = log.modeOutputCounts?.[pm.id] || 0;
            lineCard.append(
              el(
                "div",
                "logrow",
                `${pm.icon} ${pm.nameTh}: ${pm.descriptionTh} (ผลิตสำเร็จ ${cnt} ชิ้น • โบนัส QC +${Math.round((pm.qualityBonus || 0) * 100)}%)`,
              ),
            );
          }
        }

        const inbCard = el("div", "card");
        inbCard.append(el("h3", "", "🚚 โลจิสติกส์ขาเข้า: การสั่งวัตถุดิบและรถบรรทุกซัพพลายเออร์ (Inbound Logistics)"));
        if (!(log.inboundShipments || []).length) {
          inbCard.append(el("div", "muted", "ยังไม่มีรายการสั่งซื้อวัตถุดิบขาเข้า"));
        } else {
          for (const s of (log.inboundShipments || []).slice(0, 10)) {
            const stBadge = s.status === "received" ? "✅ รับเข้าคลังแล้ว" : s.status === "transit" ? "🚚 กำลังขนส่งมาโรงงาน" : "📋 กำลังออกใบ PO";
            inbCard.append(
              el(
                "div",
                "logrow",
                `${stBadge} [${s.truckPlate}] จาก ${s.supplierNameTh} (${s.originTh}): ${s.materialNameTh} ×${s.quantity} ชิ้น (มูลค่า ${money(s.cost)} • สั่งโดย ${s.buyerName})`,
              ),
            );
          }
        }

        const outCard = el("div", "card");
        outCard.append(el("h3", "", "🚛 โลจิสติกส์ขาออก: การจัดส่งสินค้าให้บริษัทลูกค้า B2B (Outbound Dispatch)"));
        if (!(log.outboundShipments || []).length) {
          outCard.append(el("div", "muted", "ยังไม่มีรายการปล่อยรถขนส่งสินค้าขาออก"));
        } else {
          for (const s of (log.outboundShipments || []).slice(0, 10)) {
            const stBadge = s.status === "paid" ? "💰 ลูกค้าชำระเงินแล้ว" : "🧾 ส่งถึงมือลูกค้า/รอเก็บเงิน Invoice";
            outCard.append(
              el(
                "div",
                "logrow",
                `${stBadge} [${s.truckPlate}] ส่งมอบให้ ${s.clientNameTh}: ${s.productNameTh} ×${s.quantity} ชิ้น (ยอดสุทธิ ${money(s.totalAmount)} • ปล่อยรถโดย ${s.dispatcherName} • ${s.onTime ? "ตรงเวลา" : "ล่าช้า"})`,
              ),
            );
          }
        }
        body.replaceChildren(lineCard, inbCard, outCard);
        return;
      } else if (uiState.subTab === "stock") {
        c.append(
          el("h3", "", "📦 คลังวัตถุดิบ 37 ชนิด (T0 ต้นน้ำ ➔ T1 แปรรูป ➔ T2 กลางน้ำ ➔ T3 ชิ้นส่วนไฮเทค) & สินค้าสำเร็จรูป 28 ชนิด"),
          el("div", "muted", "วัตถุดิบ T0 (10 ชนิด) ผลิตเองไม่ได้ต้องเก็บเกี่ยวหรือซื้อ • วัตถุดิบ T1–T2 (19 ชนิด) แปรรูปเองหรือซื้อตลาดได้ • ชิ้นส่วนไฮเทค T3 (8 ชนิด) ต้นเกมต้องซื้อ เมื่อมีแต้มวิจัย R&D ถึงเกณฑ์จึงผลิตเองได้ และทุกชนิดสามารถขายส่ง B2B ได้!"),
        );
        const grid = el("div", "inv-grid");
        for (const m of v.catalog.materials) {
          const qty = v.inventory.materials[m.id] || 0;
          const res = v.inventory.reserved[m.id] || 0;
          const cell = el("div", "inv-cell");
          const tierIcon = m.tier === 0 ? "🌾" : m.tier === 1 ? "⚗️" : m.tier === 2 ? "⚙️" : "🧠";
          cell.append(
            el("span", "inv-b-tl", `${m.tierBadgeTh || ("T" + (m.tier ?? 0))} · ${money(m.unitCost)}`),
            el("span", "inv-b-tr", m.craftable ? (m.canCraftInHouse ? "✅ ผลิตเองได้" : "🔒 ต้องรับรองกระบวนการ") : m.isTrueNaturalResource ? "⛏️ ทรัพยากรธรรมชาติ" : "🌱 ผลผลิต / พันธุ์ / ผลพลอยได้"),
            el("div", "ic", tierIcon),
            el("div", "nm", m.nameTh),
            el("span", "inv-b-br", `×${qty} (จอง ${res})`),
          );
          grid.append(cell);
        }
        c.append(grid);
      } else if (uiState.subTab === "rnd") {
        c.append(
          el("h3", "", "🔬 ความพร้อมสินค้าและกระบวนการ"),
          el("div", "muted", "ดูทีมผู้รู้ โครงการต้นแบบ และแผนผู้บริหารได้ที่ บริษัท → องค์ความรู้ / R&D"),
        );
        for (const prod of v.catalog.products) {
          const req = prod.researchRequired || 0;
          const statusTxt = prod.unlocked ? "✅ ทีมและกระบวนการพร้อม" : `🔒 ${prod.readiness?.reasons?.join(" / ") || "ยังไม่ผ่านการรับรอง"}`;
          c.append(
            el(
              "div",
              "logrow",
              `${statusTxt}: ${prod.nameTh} [${prod.industryNameTh || "อุตสาหกรรมทั่วไป"}] • ราคาขาย ${money(prod.priceMin)}–${money(prod.priceMax)} (ต้นทุน BOM ${money(prod.bomCost)} | ประกอบ ${prod.assemblyMinutes}m • QC ${prod.qaMinutes}m • แพ็ก ${prod.packingMinutes}m)`,
            ),
          );
        }
      } else {
        c.append(
          el("h3", "", "🤝 การเจรจาดีลธุรกิจ B2B โดยฝ่ายขายและสถานะคำสั่งซื้อ"),
          el(
            "div",
            "muted",
            `ออเดอร์ที่ชำระเงินแล้วสะสม: ${v.company.metrics.ordersPaid} ออเดอร์ • ข้อเสนอจากบริษัทคู่ค้ารอฝ่ายขายพิจารณา: ${v.offers.length} รายการ`,
          ),
        );
        for (const o of [...(v.orders || [])].slice(-12).reverse()) {
          const prod = v.catalog.products.find((p) => p.id === o.productId);
          const negTxt = o.negotiationReport
            ? ` • เจรจาโดย ${o.salesPersonName || "ฝ่ายขาย"} (${o.negotiationReport.styleTh}, คะแนนดีล ${o.negotiationReport.pitchScore}/100)`
            : "";
          c.append(
            el(
              "div",
              "logrow",
              `📦 ${o.id} [${o.customerName || "ลูกค้า B2B"}]: ${prod?.nameTh || o.productId} ×${o.quantity} ชิ้น • ยอดรวม ${money(o.total)} • สถานะ: ${o.status}${negTxt}`,
            ),
          );
        }
      }
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "policy") {
      byId("shTitle").textContent = "⚖️ กลยุทธ์ผู้บริหารและนโยบายบริษัท";
      setSheetTabs([
        { id: "directives", label: "สถานะบริษัทและ CEO" },
        { id: "sme_culture", label: "🌱 การเติบโต SME 6 ระยะ & วัฒนธรรม/ค่าไฟน้ำ (v2.2)" },
        { id: "board_ledger", label: "🏛️ สมุดมติบอร์ดบริหาร & โดเมนความรู้ (บท 29/32)" },
        { id: "assets", label: "🌾 สินทรัพย์ภายนอก & ห่วงโซ่ลูกโซ่" },
        { id: "external", label: "🌐 คู่ค้า & คู่แข่ง" },
        { id: "macro", label: "📈 ตลาดหุ้น & รัฐบาล" },
      ]);
      if (uiState.subTab === "sme_culture") {
        const prog = v.companyProgression || { currentStageBadgeTh: "🌱 ระยะที่ 1/6", currentStageNameTh: "ห้องแถวและเวิร์กช็อปตั้งต้น", currentStageOrder: 1, achievedMilestones: {}, growthJournal: [] };
        const util = v.utilities || { dailyKwh: 0, solarOffsetKwh: 0, netKwh: 0, dailyWaterM3: 0, waterOffsetM3: 0, netWaterM3: 0, accruedElectricSatang: 0, accruedWaterSatang: 0, totalPaidSatang: 0, totalSavedBySolarWaterSatang: 0, brownoutActive: false, history: [] };
        const cult = v.culture || { cohesionScore: 68, recentGossip: [], clubActivities: [], townhallAwards: [], alumniSpinoffs: [], parkedVehicles: [] };

        const stageCard = el("div", "card");
        stageCard.append(
          el("h3", "", `🌱 บันไดการเติบโตของกิจการ 6 ระยะ (SME-to-Conglomerate Growth Ladder — ปัจจุบัน: ${prog.currentStageBadgeTh} ${prog.currentStageNameTh})`),
          el("div", "muted", prog.currentStageSummaryTh || "เฝ้าดูบริษัทเติบโตจากห้องแถวเล็กๆ สู่โรงงานมาตรฐาน เครือข่ายซัพพลายเชน และมหาชนตามผลงานจริง"),
          el("div", "logrow", `🏦 ตัวคูณวงเงินสินเชื่อตามระดับกิจการ: ×${prog.creditLimitMultiplier || 1.0} • 🤝 โบนัสความเชื่อมั่นคู่ค้า B2B: +${prog.b2bTrustBonus || 0} คะแนน • 🏆 ก้าวสำคัญที่บรรลุแล้ว: ${Object.keys(prog.achievedMilestones || {}).length}/12 รายการ`)
        );
        for (const st of v.catalog?.smeGrowthStages || []) {
          const isCur = st.order === prog.currentStageOrder;
          const isDone = st.order < prog.currentStageOrder;
          stageCard.append(
            el("div", "logrow", `${isCur ? "🟢 [ระดับปัจจุบัน]" : isDone ? "✅ [ผ่านแล้ว]" : "⚪ [เป้าหมายถัดไป]"} ${st.badgeTh} ${st.nameTh} — เงื่อนไข: ทีมงาน ≥ ${st.minEmployees} คน, ส่งมอบ ≥ ${st.minOrdersPaid} ออเดอร์, ชื่อเสียง ≥ ${st.minReputation}, อาคารขยาย/สินทรัพย์ ≥ ${st.minPlotsOrAssets} แห่ง`)
          );
        }

        const msCard = el("div", "card");
        msCard.append(el("h3", "", "🏅 บันทึก 12 ก้าวแรกแห่งความสำเร็จของ SME (Organic SME Milestones & Timeline)"));
        for (const mSpec of v.catalog?.smeMilestoneCatalog || []) {
          const done = prog.achievedMilestones?.[mSpec.id];
          msCard.append(
            el("div", "logrow", `${done ? `✅ [สำเร็จวันที่ ${done.day}]` : "⏳ [รอปลดล็อกตามเหตุการณ์จริง]"} ${mSpec.icon} ${mSpec.titleTh} — ${mSpec.descTh}`)
          );
        }

        const utilCard = el("div", "card");
        utilCard.append(
          el("h3", "", "⚡💧 ระบบมิเตอร์ไฟฟ้า-น้ำประปาโรงงาน โซลาร์รูฟท็อป และความเสี่ยงไฟตก (Real SME Utility Metering & Solar Offset)"),
          el("div", "logrow", `🔌 ไฟฟ้ารายวัน: ใช้รวม ${util.dailyKwh} kWh | โซลาร์ช่วยผลิต ${util.solarOffsetKwh} kWh ➔ ใช้ไฟสุทธิ ${util.netKwh} kWh • 🚿 น้ำประปารายวัน: ใช้รวม ${util.dailyWaterM3} ลบ.ม. | น้ำรีไซเคิลช่วยลด ${util.waterOffsetM3} ลบ.ม. ➔ ใช้น้ำสุทธิ ${util.netWaterM3} ลบ.ม.`),
          el("div", "logrow", `🧾 ยอดค่าไฟค้างชำระรอบนี้: ${moneyFull(util.accruedElectricSatang || 0)} • ยอดค่าน้ำค้างชำระ: ${moneyFull(util.accruedWaterSatang || 0)} • 💚 ประหยัดเงินสะสมจากโซลาร์และบำบัดน้ำ: +${moneyFull(util.totalSavedBySolarWaterSatang || 0)} • สถานะกระแสไฟ: ${util.brownoutActive ? "🔴 ไฟตก (Brownout -20% ความเร็วผลิต)" : "🟢 ปกติเต็มกำลัง"}`)
        );

        const cultCard = el("div", "card");
        cultCard.append(
          el("h3", "", `🍻 วัฒนธรรมองค์กร ข่าวลือข้างตู้กดน้ำ ชมรมหลังเลิกงาน ลานจอดรถ และบริษัท Spin-off ศิษย์เก่า (ดัชนีความผูกพัน ${cult.cohesionScore}/100)`),
          el("div", "logrow", `🚗 รถส่วนตัวพนักงานในลานจอดรถวันนี้: ${(cult.parkedVehicles || []).length} คัน • 🏆 รางวัลพนักงานดีเด่นสะสม: ${(cult.townhallAwards || []).length} ครั้ง • 🚀 บริษัท Spin-off ที่ก่อตั้งโดยอดีตพนักงาน: ${(cult.alumniSpinoffs || []).length} แห่ง`)
        );
        for (const g of (cult.recentGossip || []).slice(0, 5)) {
          cultCard.append(el("div", "logrow", `[วันที่ ${g.day}] ${g.badgeTh} (${g.speakerName} คุยกับ ${g.listenerName}): "${g.topicTh}"`));
        }
        for (const cl of (cult.clubActivities || []).slice(0, 4)) {
          cultCard.append(el("div", "logrow", `[วันที่ ${cl.day}] ${cl.icon} ${cl.nameTh}: สมาชิกที่เข้าร่วม (${(cl.participantNames || []).join(", ")}) — ${cl.summaryTh}`));
        }
        for (const sp of (cult.alumniSpinoffs || []).slice(0, 5)) {
          cultCard.append(el("div", "logrow", `🚀 [วันที่ ${sp.day}] ${sp.founderName} (${sp.roleNameTh}) ก่อตั้ง "${sp.corpNameTh}" สถานะ: ${sp.relationshipMode === "partner" ? "🤝 พันธมิตรคู่ค้า" : "⚔️ คู่แข่งในตลาด"} — ${sp.reasonTh}`));
        }

        body.replaceChildren(stageCard, msCard, utilCard, cultCard);
        return;
      }
      if (uiState.subTab === "board_ledger") {
        const eb = v.executiveBoard || { budgetPools: {}, decisionLedger: [] };
        const pools = eb.budgetPools || {};
        const cap = v.capabilities || { domains: {} };

        const poolCard = el("div", "card");
        poolCard.append(
          el("h3", "", "💰 พอร์ตงบประมาณและเงินสดอิสระของคณะกรรมการบริหาร (Uncommitted Cash & Budget Pools — บทที่ 29/32)"),
          el(
            "div",
            "muted",
            "การตัดสินใจลงทุนของ CEO และบอร์ดบริหารคำนวณจากเงินสดอิสระ (Uncommitted Cash) หลังหักเงินสำรองฉุกเฉิน ค่าแรงค้างจ่าย เจ้าหนี้การค้า และเงินมัดจำลูกค้าที่มีภาระต้องส่งมอบ เพื่อป้องกันการนำเงินก้อนเดียวไปลงทุนซ้ำซ้อน",
          ),
          el(
            "div",
            "logrow",
            `🏦 เงินสดในบัญชีรวม: ${moneyFull(v.company.cash)} • 🛡️ เงินสำรองฉุกเฉินขั้นต่ำ (${pools.reserveDaysRequired || 18} วัน): ${moneyFull(pools.survivalReserveSatang || 0)} • ⏳ เงินมัดจำลูกค้ามีภาระส่งมอบ: ${moneyFull(pools.unearnedDepositsSatang || 0)}`,
          ),
          el(
            "div",
            "logrow",
            `🟢 เงินสดอิสระพร้อมพิจารณาลงทุน (Uncommitted Cash): ${moneyFull(pools.uncommittedCashSatang || 0)} • 📌 งบจองรอดำเนินการ (Open Reservations): ${moneyFull(eb.committedBudgetSatang || 0)} • 🏗️ งบลงทุนที่จ่ายจริงสะสม: ${moneyFull(eb.paidCapitalTotalSatang || 0)} • 🧾 ลูกหนี้การค้ารอเรียกเก็บ: ${moneyFull(pools.receivableSatang || 0)}`,
          ),
        );

        const domCard = el("div", "card");
        domCard.append(
          el("h3", "", "🧠 กราฟความสามารถ 9 โดเมนและ 10 ตระกูลผลิตภัณฑ์ (9 Capability Domains & 10 Product Families — บทที่ 28/32)"),
          el("div", "muted", "แยกองค์ความรู้ตามโดเมนอุตสาหกรรมจริง การวิจัยเบเกอรี่ไม่ทำให้เกิดความรู้ผลิตชิปเซมิคอนดักเตอร์ และการสลับรุ่นสินค้าในตระกูลเดียวกันไม่ต้องเสียค่าตั้งแม่พิมพ์ใหม่"),
        );
        for (const d of v.catalog?.capabilityDomains || []) {
          const lv = cap.domains?.[d.id] ?? d.baseLevel ?? 20;
          domCard.append(
            el("div", "logrow", `${d.icon || "🔬"} [${d.id}] ${d.nameTh} — ระดับความเชี่ยวชาญโดเมน: ${lv}/100 • ${d.descTh}`),
          );
        }

        const ledgerCard = el("div", "card");
        ledgerCard.append(
          el("h3", "", `📜 สมุดบันทึกมติคณะกรรมการบริหารและเหตุผลการตัดสินใจ (${(eb.decisionLedger || []).length} รายการ)`),
          el("div", "muted", "บันทึกทุกข้อเสนอที่ผ่านการพิจารณาของ CEO และหัวหน้าฝ่าย พร้อมผลตรวจ Hard Gates และเหตุผลที่อนุมัติ ชะลอ หรือเลือกถือเงินสด"),
        );
        if (!(eb.decisionLedger || []).length) {
          ledgerCard.append(el("div", "muted", "ยังไม่มีมติการลงทุนในรอบนี้ (ระบบจะประเมินอัตโนมัติตามรอบวันหรือเมื่อเกิดคอขวดหน้างาน)"));
        } else {
          for (const item of (eb.decisionLedger || []).slice(0, 20)) {
            ledgerCard.append(
              el(
                "div",
                "logrow",
                `[วันที่ ${item.day}] (${item.resolution}) ${item.titleTh} — ผู้ตัดสินใจ: ${item.deciderName} • เงินสดอิสระก่อนพิจารณา: ${moneyFull(item.uncommittedCashBefore || 0)} • เหตุผล: ${item.reasonTh}`,
              ),
            );
          }
        }
        body.replaceChildren(poolCard, domCard, ledgerCard);
        return;
      }
      if (uiState.subTab === "assets") {
        body.replaceChildren(...renderExternalAssetsAndChainsView(v));
        return;
      }

      if (uiState.subTab === "external" && v.externalWorld) {
        const ext = v.externalWorld;
        const feedCard = el("div", "card");
        feedCard.append(
          el("h3", "", "🌐 ความเคลื่อนไหวนอกพื้นที่บริษัท (Living Off-Site Corporate Ecosystem & Inter-Company Feed)"),
          el(
            "div",
            "muted",
            "บริษัทภายนอกทั้ง 16 แห่งไม่ได้หยุดนิ่งรอซื้อของจากเราเท่านั้น แต่มีการค้าขายวัตถุดิบระหว่างกัน เปิดศึกหั่นราคาแย่งส่วนแบ่งตลาด จับมือเป็นพันธมิตรร่วมทุน และประกาศรับซื้อวัตถุดิบแปรรูป (Tier 1–3) ทุกวัน",
          ),
        );
        for (const item of (ext.ecosystemFeed || []).slice(0, 12)) {
          feedCard.append(
            el(
              "div",
              "logrow",
              `[วันที่ ${item.day}] ${item.badgeTh}: ${item.headlineTh} — 💡 ${item.impactTh}`,
            ),
          );
        }

        const corpCard = el("div", "card");
        corpCard.append(
          el(
            "h3",
            "",
            `🏢 ทำเนียบ 22 บริษัทภายนอกหลายบทบาท (เป็นทั้งคู่ค้า ซัพพลายเออร์ พันธมิตร และคู่แข่ง • ส่วนแบ่งตลาดของเรา ${ext.ourMarketSharePct || 2.0}%)`,
          ),
          el(
            "div",
            "muted",
            "บริษัทเดียวกันสามารถเป็นซัพพลายเออร์ขายแร่/ชิ้นส่วนให้เรา เป็นลูกค้าซื้อวัตถุดิบกลางน้ำหรือสินค้าสำเร็จรูปจากเรา เป็นพันธมิตรร่วมค้า (+8% ราคาขาย B2B) หรือเป็นคู่แข่งแย่งส่วนแบ่งตลาดในเวลาเดียวกัน",
          ),
        );
        const roleLabelMap = {
          client: "🛒 ลูกค้าซื้อสินค้า",
          supplier: "🚚 ซัพพลายเออร์ขายวัตถุดิบ",
          partner: "🤝 พันธมิตรร่วมทุน",
          competitor: "⚔️ คู่แข่งในตลาด",
        };
        for (const corp of Object.values(ext.corporations || {})) {
          const row = el("div", "logrow");
          const top = el("div", "");
          top.style.display = "flex";
          top.style.justifyContent = "space-between";
          top.style.alignItems = "center";
          top.style.flexWrap = "wrap";
          top.style.gap = "6px";

          const rolesTxt = (corp.roles || []).map((r) => roleLabelMap[r] || r).join(" · ");
          const relCls =
            corp.relationshipMode === "partner"
              ? "ok"
              : corp.relationshipMode === "rival"
                ? "r"
                : "b";
          top.append(
            el("strong", "", `[${corp.symbol}] ${corp.nameTh} (${corp.originTh}) — ${corp.sectorTh}`),
            el("span", "chip " + relCls, `สถานะ: ${corp.relationshipMode} • ความเชื่อใจ ${corp.trustScore}/100`),
          );

          const dipRow = el("div", "");
          dipRow.style.display = "flex";
          dipRow.style.gap = "4px";
          dipRow.style.flexWrap = "wrap";
          for (const [mKey, mLb] of [
            ["partner", "🤝 ร่วมเป็นพันธมิตร (+8% B2B)"],
            ["cordial", "💼 คู่ค้ามิตรภาพ"],
            ["rival", "⚔️ คู่แข่งโดยตรง"],
          ]) {
            const b = el("button", "chip" + (corp.relationshipMode === mKey ? " g" : ""), mLb);
            b.onclick = () =>
              dispatch(
                { type: "setCorporationRelation", corpId: corp.id, mode: mKey },
                `ปรับความสัมพันธ์กับ ${corp.nameTh} เป็น ${mLb} แล้ว`,
              );
            dipRow.append(b);
          }
          top.append(dipRow);

          const buyMatsTh = (corp.buysMaterials || [])
            .slice(0, 5)
            .map((mid) => v.catalog.materials.find((m) => m.id === mid)?.nameTh || mid)
            .join(", ");
          const sellMatsTh = (corp.sellsMaterials || [])
            .slice(0, 5)
            .map((mid) => v.catalog.materials.find((m) => m.id === mid)?.nameTh || mid)
            .join(", ");

          row.append(
            top,
            el("div", "", `• บทบาท: [${rolesTxt}] • ส่วนแบ่งตลาด ${corp.marketSharePct}% • ความแข็งแกร่ง ${corp.strength}/100 • เงินทุนหมุนเวียน ฿${corp.cashMillionBaht}M`),
            el("div", "", `• รับซื้อวัตถุดิบแปรรูปจากเรา (B2B): ${buyMatsTh || "-"} | จำหน่ายวัตถุดิบให้ตลาด: ${sellMatsTh || "-"}`),
            el("div", "muted", `• ความเคลื่อนไหวล่าสุด (วันที่ ${corp.lastActionDay || 1}): ${corp.lastActionTh || corp.strategyTh}`),
          );
          corpCard.append(row);
        }

        body.replaceChildren(feedCard, corpCard);
        return;
      }

      if (uiState.subTab === "macro" && v.externalWorld) {
        const ext = v.externalWorld;
        const gov = ext.government || {};
        const sm = ext.stockMarket || {};
        const govCard = el("div", "card");
        govCard.append(
          el("h3", "", "🏛️ นโยบายเศรษฐกิจและอุตสาหกรรมของรัฐบาล (Government Policy)"),
          el("div", "logrow", `📜 นโยบายที่มีผลบังคับใช้: "${gov.nameTh || "ส่งเสริมอุตสาหกรรม"}"`),
          el("div", "muted", `ผลกระทบต่อบริษัท: ${gov.summaryTh || "-"} • อัตราภาษีนิติบุคคลอ้างอิง ${gov.corporateTaxPct || 15}% • ตัวคูณอุปสงค์ตลาด ×${gov.demandMultiplier || 1.0}`),
        );

        const stockCard = el("div", "card");
        stockCard.append(
          el("h3", "", "📈 ตลาดหลักทรัพย์ ดัชนีกลุ่มอุตสาหกรรม และการประเมินมูลค่าบริษัท"),
          el(
            "div",
            "logrow",
            `💎 มูลค่ากิจการประเมิน (Enterprise Valuation): ${moneyFull(sm.companyValuation || 18000000)} • ราคาหุ้นประเมิน ฿${(sm.sharePriceBaht || 18).toFixed(2)}/หุ้น • อันดับเครดิตองค์กร: ${sm.creditRating || "BBB+"} • ความพร้อมเข้าตลาดหลักทรัพย์ (IPO Readiness): ${sm.ipoReadinessPct || 22}%`,
          ),
        );
        for (const idx of Object.values(sm.indices || {})) {
          const sign = idx.changePct >= 0 ? "+" : "";
          stockCard.append(
            el(
              "div",
              "logrow",
              `📊 [${idx.symbol}] ${idx.nameTh}: ${idx.value.toFixed(1)} จุด (${sign}${idx.changePct.toFixed(1)}%)`,
            ),
          );
        }
        body.replaceChildren(govCard, stockCard);
        return;
      }

      const c = el("div", "card");
      const ceo = v.people.find((p) => p.employed && p.role === "coordinator");
      const dir = v.externalWorld?.ceoDirective;
      c.append(
        el("h3", "", ceo ? "ผู้บริหารสูงสุด (CEO): " + (ceo.identity?.displayName || ceo.name) : "ยังไม่มีผู้บริหาร"),
        el("div", "muted", "บริษัทดำเนินงานอัตโนมัติตามนิสัยและค่านิยมของ CEO และหัวหน้าแผนก ผู้เล่นสามารถเฝ้าดูการตัดสินใจและโลกธุรกิจได้"),
        el("div", "logrow", "เงินสด " + moneyFull(v.company.cash) + " • หนี้ " + moneyFull(v.company.debt)),
        el("div", "logrow", "ลำดับความสำคัญ: " + v.policies.workPriority + " • เพดาน OT " + v.policies.overtimeHours + " ชั่วโมง"),
      );
      if (dir) {
        c.append(
          el("div", "logrow", `🧭 เข็มทิศกลยุทธ์องค์กรปัจจุบัน: "${dir.nameTh}" — ${dir.descTh}`),
        );
      }
      if (Array.isArray(v.catalog?.ceoDirectives) && v.catalog.ceoDirectives.length) {
        const dirWrap = el("div", "");
        dirWrap.style.display = "flex";
        dirWrap.style.flexWrap = "wrap";
        dirWrap.style.gap = "6px";
        dirWrap.style.margin = "8px 0";
        for (const dSpec of v.catalog.ceoDirectives) {
          const isCur = dir && dir.id === dSpec.id;
          const b = el("button", "chip" + (isCur ? " g" : ""), `🧭 ${dSpec.nameTh}`);
          b.onclick = () =>
            dispatch(
              { type: "setCeoDirective", directiveId: dSpec.id },
              `เปลี่ยนเข็มทิศกลยุทธ์ CEO เป็น "${dSpec.nameTh}" แล้ว`,
            );
          dirWrap.append(b);
        }
        c.append(dirWrap);
      }
      const d = v.campus && v.campus.facilityDecision;
      if (d) {
        const b = v.campus.buildings.find((item) => item.id === d.facilityId);
        c.append(el("div", "logrow", (d.decision === "upgrade" ? "ลงทุน " : "รอการลงทุน ") + (b ? b.nameTh : d.facilityId) + " • " + d.reason + " • งบ " + money(d.cost)));
      } else c.append(el("div", "muted", "ผู้บริหารยังไม่มีการประเมินอาคารในรอบนี้"));
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "menu") {
      byId("shTitle").textContent = "⚙️ เมนูระบบ เซฟ/โหลด และศูนย์แก้ไข (Edit Hub)";
      setSheetTabs([
        { id: "sys", label: "จัดการเซฟและจำลองเวลา" },
        { id: "edit", label: "✏️ ศูนย์แก้ไข (Edit Hub)" },
      ]);

      if (uiState.subTab === "edit") {
        const financeExperimentCard = el("div", "card edit-section");
        financeExperimentCard.append(
          el("h3", "", "💰 ทดลองมอบเงินบาท (แยกบัญชีเงินสดบริษัท vs กระเป๋าเงินออมส่วนตัวพนักงาน)"),
          el("div", "muted", "เลือกเติมเงินหน่วยบาทเข้าบัญชีบริษัทเพื่อดูว่า CEO จะนำไปชำระหนี้หรือขยายธุรกิจใด หรือเติมเข้ากระเป๋าส่วนตัวของพนักงานที่เลือกเพื่อดูการซื้อรถ/ซื้อบ้าน/เปิดบริษัท Spin-off โดยไม่ปะปนสองบัญชี")
        );
        const compCashRow = el("div", "");
        compCashRow.style.display = "flex";
        compCashRow.style.flexWrap = "wrap";
        compCashRow.style.gap = "6px";
        compCashRow.style.marginTop = "6px";
        for (const [labelBaht, satangAmt] of [
          ["🏦 เติมเงินสดบริษัท +฿50,000", 5000000],
          ["🏦 เติมเงินสดบริษัท +฿250,000", 25000000],
          ["🏦 เติมเงินสดบริษัท +฿1,000,000", 100000000],
        ]) {
          const b = el("button", "btn pri", labelBaht);
          b.type = "button";
          b.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "grantCash", amount: satangAmt },
              `เพิ่มเงินสดบริษัทเรียบร้อยแล้ว (${labelBaht})`,
            );
          compCashRow.append(b);
        }
        financeExperimentCard.append(compCashRow);

        const inventory = el("div", "card edit-section");
        inventory.append(el("h3", "", "📦 เสกวัตถุดิบ"),
          el("div", "muted", "กรองหมวดหมู่หรือเลือกชนิดวัตถุดิบและจำนวนเพื่อเพิ่มเข้าในคลัง (ไม่ต้องจำรหัส ID)"));
        const matCatRow = el("div", "");
        matCatRow.style.display = "flex";
        matCatRow.style.flexWrap = "wrap";
        matCatRow.style.gap = "4px";
        matCatRow.style.marginBottom = "6px";
        for (const [catKey, catLabel] of [
          ["ALL", "ทุกหมวด (64 ชนิด)"],
          ["T0", "⛏️ ต้นน้ำธรรมชาติ"],
          ["AGRI", "🌱 พันธุ์พืช & เกษตร"],
          ["METAL_CHEM", "⚙️ โลหะ & เคมีแปรรูป"],
          ["HITECH", "🧠 ชิ้นส่วนไฮเทค"],
        ]) {
          const cb = el("button", "chip" + ((uiState.editMatCat || "ALL") === catKey ? " g" : ""), catLabel);
          cb.type = "button";
          cb.onclick = () => {
            uiState.editMatCat = catKey;
            renderActiveSheet(current);
          };
          matCatRow.append(cb);
        }
        inventory.append(matCatRow);
        const mat = el("select");
        mat.setAttribute("aria-label", "เลือกวัตถุดิบ");
        const activeMatCat = uiState.editMatCat || "ALL";
        const filteredMats = v.catalog.materials.filter((m) => {
          if (activeMatCat === "ALL") return true;
          if (activeMatCat === "T0") return m.resourceClass === "T0_NATURAL";
          if (activeMatCat === "AGRI") return ["SEED_STOCK", "CULTIVATED_CROP"].includes(m.resourceClass);
          if (activeMatCat === "METAL_CHEM") return ["T1_REFINED_RAW", "INDUSTRIAL_BYPRODUCT"].includes(m.resourceClass);
          if (activeMatCat === "HITECH") return ["T2_COMPONENT", "T3_HITECH"].includes(m.resourceClass);
          return true;
        });
        for (const m of (filteredMats.length ? filteredMats : v.catalog.materials)) {
          const option = el("option", "", m.nameTh + " • คงคลัง " + (v.inventory.materials[m.id] || 0));
          option.value = m.id;
          mat.append(option);
        }
        const qty = el("input");
        qty.type = "number"; qty.min = "1"; qty.max = "500"; qty.step = "1"; qty.value = "10";
        qty.setAttribute("aria-label", "จำนวนวัตถุดิบ");
        const add = el("button", "btn pri", "เสกวัตถุดิบ");
        add.type = "button";
        add.onclick = () => {
          const n = Number(qty.value);
          if (!Number.isInteger(n) || n < 1 || n > 500) return showToast("กรอกจำนวน 1–500 ชิ้น", true);
          dispatch({ type: "directorEdit", action: "grantMaterial", materialId: mat.value, quantity: n }, "เพิ่มวัตถุดิบเข้าคลังแล้ว");
        };
        inventory.append(mat, qty, add);

        const personCard = el("div", "card edit-section");
        personCard.append(el("h3", "", "👤 แก้ไขตัวละคร"));
        const chooser = el("select");
        chooser.setAttribute("aria-label", "เลือกตัวละคร");
        for (const p of v.people.filter((p) => p.employed).slice(0, 100)) {
          const option = el("option", "", p.name + " • " + p.roleName);
          option.value = p.id; chooser.append(option);
        }
        const target = v.people.find((p) => p.id === uiState.selectedPersonId && p.employed) || v.people.find((p) => p.employed);
        if (target) chooser.value = target.id;
        const nameInput = el("input");
        nameInput.type = "text"; nameInput.maxLength = 32;
        nameInput.setAttribute("aria-label", "ชื่อตัวละคร");
        const rename = el("button", "btn", "เปลี่ยนชื่อตัวละคร");
        rename.type = "button";
        rename.onclick = () => dispatch({ type: "directorEdit", action: "renamePerson", personId: chooser.value, name: nameInput.value }, "เปลี่ยนชื่อตัวละครแล้ว");
        const trait = el("select");
        trait.setAttribute("aria-label", "เลือกนิสัยหรือค่านิยม");
        for (const [group, dimensions] of [["personality", v.catalog.dimensions.personality], ["values", v.catalog.dimensions.values]]) {
          for (const d of dimensions) {
            const option = el("option", "", (group === "personality" ? "นิสัย: " : "ค่านิยม: ") + d.nameTh);
            option.value = group + ":" + d.id; trait.append(option);
          }
        }
        const traitValue = el("input");
        traitValue.type = "number"; traitValue.min = "0"; traitValue.max = "100"; traitValue.step = "1";
        traitValue.setAttribute("aria-label", "ค่านิสัยหรือค่านิยม");
        const syncPerson = () => {
          const selected = current.people.find((p) => p.id === chooser.value);
          const [group, key] = trait.value.split(":");
          nameInput.value = selected?.name || "";
          traitValue.value = String(selected?.profile?.[group]?.[key] ?? 50);
        };
        chooser.onchange = syncPerson;
        trait.onchange = syncPerson;
        syncPerson();
        const saveTrait = el("button", "btn", "บันทึกนิสัยหรือค่านิยม");
        saveTrait.type = "button";
        saveTrait.onclick = () => {
          const [group, key] = trait.value.split(":");
          const value = Number(traitValue.value);
          if (!Number.isFinite(value) || value < 0 || value > 100) return showToast("กรอกค่า 0–100", true);
          dispatch({ type: "directorEdit", action: "setTrait", personId: chooser.value, group, key, value }, "ปรับข้อมูลตัวละครแล้ว");
        };
        const skill = el("select");
        skill.setAttribute("aria-label", "เลือกทักษะ");
        for (const item of v.catalog.skills) {
          const option = el("option", "", item.nameTh);
          option.value = item.id; skill.append(option);
        }
        const restore = el("button", "btn", "ฟื้นฟูตัวละครที่เลือก");
        restore.type = "button";
        restore.onclick = () => dispatch({ type: "directorEdit", action: "refreshPerson", personId: chooser.value }, "ฟื้นฟูตัวละครที่เลือกแล้ว");
        const train = el("button", "btn pri", "เพิ่มประสบการณ์ทักษะ");
        train.type = "button";
        train.onclick = () => dispatch({ type: "directorEdit", action: "trainSkill", personId: chooser.value, skillId: skill.value, delta: 15 }, "เพิ่มประสบการณ์ทักษะแล้ว");
        const promoBtn = el("button", "btn", "⬆️ เลื่อนตำแหน่ง +1 ขั้น (Lv.1–Lv.10)");
        promoBtn.type = "button";
        promoBtn.onclick = () => dispatch({ type: "directorEdit", action: "promotePerson", personId: chooser.value }, "เลื่อนตำแหน่งตัวละครที่เลือกแล้ว");

        const tendencyBox = el("div", "muted", "");
        tendencyBox.style.marginTop = "6px";
        const updateTendencyPreview = () => {
          const selected = current.people.find((p) => p.id === chooser.value);
          const [, key] = (trait.value || "personality:sociability").split(":");
          const val = Number(traitValue.value) || 50;
          const levelWord = val >= 70 ? "สูงมาก" : val >= 55 ? "ค่อนข้างสูง" : val <= 30 ? "ต่ำ" : "ปานกลาง";
          const hintMap = {
            riskTaking: "ส่งผลต่อความกล้าเสนอเปิดธุรกิจใหม่และการรับงานท้าทายของ CEO/พนักงาน",
            prudence: "ส่งผลต่อการกันเงินสำรองฉุกเฉินและการชั่งน้ำหนักความเสี่ยงก่อนลงทุน",
            sociability: "ส่งผลต่อการชวนเพื่อนคุยข้างตู้กดน้ำ การเข้าชมรมหลังเลิกงาน และการประสานงาน",
            ambition: "ส่งผลต่อแรงผลักดันเลื่อนขั้นและการออกไปตั้งบริษัท Spin-off เมื่อสะสมทุนครบ",
            fairness: "ส่งผลต่อความโปร่งใสในการประเมินเลื่อนตำแหน่งและความไวต่อการเล่นพรรคเล่นพวก",
          };
          const walletBaht = ((selected?.pay?.wallet || 0) / 100).toLocaleString("th-TH");
          tendencyBox.textContent = `💡 แนวโน้มพฤติกรรม (${levelWord} ${val}/100): ${hintMap[key] || "เปลี่ยนน้ำหนักการตัดสินใจเลือกงาน การพักผ่อน และปฏิสัมพันธ์ตามสถานการณ์จริง"} • เงินออมส่วนตัวปัจจุบัน: ฿${walletBaht}`;
        };
        const origSyncPerson = syncPerson;
        chooser.onchange = () => { origSyncPerson(); updateTendencyPreview(); };
        trait.onchange = () => { origSyncPerson(); updateTendencyPreview(); };
        traitValue.oninput = updateTendencyPreview;
        updateTendencyPreview();

        const walletRow = el("div", "");
        walletRow.style.display = "flex";
        walletRow.style.flexWrap = "wrap";
        walletRow.style.gap = "6px";
        walletRow.style.marginTop = "6px";
        for (const [wLb, wSatang] of [
          ["👛 มอบเงินออมเข้ากระเป๋าคนนี้ +฿2,000", 200000],
          ["👛 มอบเงินออมเข้ากระเป๋าคนนี้ +฿5,000 (พอซื้อรถ/ดาวน์บ้าน)", 500000],
        ]) {
          const wb = el("button", "btn", wLb);
          wb.type = "button";
          wb.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "grantPersonWallet", personId: chooser.value, amount: wSatang },
              `เพิ่มเงินออมเข้ากระเป๋าส่วนตัวพนักงานแล้ว (${wLb})`,
            );
          walletRow.append(wb);
        }

        const subjectChoice=el("select","");subjectChoice.setAttribute("aria-label","เลือกวิชาเรียนรู้");
        for(const [id,name] of Object.entries(v.companyKnowledge.subjects)) {const o=el("option","",name);o.value=id;subjectChoice.append(o);}
        const subjectValue=el("input","");subjectValue.type="number";subjectValue.min="0";subjectValue.max="100";subjectValue.value="0";subjectValue.setAttribute("aria-label","ระดับวิชาที่เรียนรู้");
        const subjectInfo=el("div","muted", "เลือกพนักงานและวิชา แล้วกำหนดระดับ 0–100 เพื่อทดลอง; การรู้วิชาอย่างเดียวยังไม่แทนเครื่องมือและการรับรองกระบวนการ");
        const syncSubject=()=>{subjectValue.value=String(current.people.find(p=>p.id===chooser.value)?.education?.subjects?.[subjectChoice.value] || 0);};
        subjectChoice.onchange=syncSubject;syncSubject();
        const saveSubject=el("button","btn","บันทึกวิชาให้พนักงานคนนี้");saveSubject.type="button";
        saveSubject.onclick=()=>dispatch({type:"directorEdit",action:"setSubject",personId:chooser.value,subjectId:subjectChoice.value,level:Number(subjectValue.value)},"อัปเดตวิชาเฉพาะพนักงานแล้ว");
        personCard.append(subjectInfo,subjectChoice,subjectValue,saveSubject);
        personCard.append(chooser, nameInput, rename, trait, traitValue, saveTrait, tendencyBox, skill, restore, train, promoBtn, walletRow);

        const scaleCard = el("div", "card edit-section");
        scaleCard.append(
          el("h3", "", "🚀 ขยายสเกลพนักงาน & ก่อสร้างอาคารนิคม (รองรับสูงสุด 500 NPC)"),
          el("div", "muted", "ทดสอบการขยายขนาดองค์กรสู่ระดับ 50–500 คน หรือสั่งก่อสร้างคลังและไลน์การผลิตใหม่ทันที"),
        );
        const scaleBtnRow = el("div", "");
        scaleBtnRow.style.display = "flex";
        scaleBtnRow.style.flexWrap = "wrap";
        scaleBtnRow.style.gap = "6px";
        scaleBtnRow.style.marginTop = "6px";
        for (const cnt of [25, 100, 300, 500]) {
          const sb = el("button", "btn", `👥 ขยายเป็น ${cnt} คน`);
          sb.type = "button";
          sb.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "scaleHeadcount", targetCount: cnt },
              `ขยายขนาดองค์กรเป็น ${cnt} คนเรียบร้อยแล้ว`,
            );
          scaleBtnRow.append(sb);
        }
        scaleCard.append(scaleBtnRow);

        const plotBtnRow = el("div", "");
        plotBtnRow.style.display = "flex";
        plotBtnRow.style.flexWrap = "wrap";
        plotBtnRow.style.gap = "6px";
        plotBtnRow.style.marginTop = "8px";
        for (const pl of v.campus?.expansionPlots || []) {
          if (pl.constructed) continue;
          const pb = el("button", "btn", `🏗️ สร้าง${pl.shortNameTh}`);
          pb.type = "button";
          pb.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "constructPlot", plotId: pl.id },
              `ก่อสร้าง ${pl.nameTh} สำเร็จแล้ว`,
            );
          plotBtnRow.append(pb);
        }
        scaleCard.append(plotBtnRow);

        const extAssetEditCard = el("div", "card edit-section");
        extAssetEditCard.append(
          el("h3", "", "🌾 เสก/เข้าถือครองสินทรัพย์ภายนอกทันที (Sandbox External Assets)"),
          el("div", "muted", "คลิกเพื่อเข้าถือครองไร่ข้าว สวนปาล์ม ไร่อ้อย ฟาร์มโคนม เหมืองแร่ โซลาร์ฟาร์ม หรือท่าเรือทันทีโดยไม่ต้องรอเก็บเงิน"),
        );
        const assetBtnRow = el("div", "");
        assetBtnRow.style.display = "flex";
        assetBtnRow.style.flexWrap = "wrap";
        assetBtnRow.style.gap = "6px";
        assetBtnRow.style.marginTop = "6px";
        for (const a of v.catalog?.externalAssets || []) {
          const ab = el("button", "btn" + (a.owned ? " pri" : ""), `${a.icon} ${a.owned ? "อัปเกรด " : "เข้าถือครอง "}${a.shortNameTh}`);
          ab.type = "button";
          ab.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "acquireExternalAsset", assetId: a.id, upgrade: a.owned, freeGrant: true },
              `${a.owned ? "อัปเกรด" : "เข้าถือครอง"} ${a.nameTh} สำเร็จแล้ว`,
            );
          assetBtnRow.append(ab);
        }
        extAssetEditCard.append(assetBtnRow);

        const bizProcessEditCard = el("div", "card");
        bizProcessEditCard.append(
          el("h3", "", "🏛️ ศูนย์ทดสอบโปรเซส 8 โมเดลธุรกิจจริง (Sandbox Business Process Triggers)"),
          el("div", "muted", "ใช้สำหรับทดสอบกลไกโปรเซสเฉพาะทางของแต่ละธุรกิจในโหมดผู้กำกับ (Sandbox Edit Hub) โดยรักษาสมการบัญชีและสต็อก 100%"),
        );
        const bpBtnRow = el("div", "");
        bpBtnRow.style.display = "flex";
        bpBtnRow.style.flexWrap = "wrap";
        bpBtnRow.style.gap = "6px";
        bpBtnRow.style.marginTop = "6px";
        const bpActions = [
          ["🌱 ปลูกข้าวหอมมะลิลงแปลง", { type: "directorEdit", action: "plantCropPlot", plotId: "plot_jasmine_rice_farm" }],
          ["🐄 เลี้ยงอาหาร & รีดนมฝูงโคนม", { type: "directorEdit", action: "feedLivestockHerd", assetId: "dairy_soy_farm", freeFeed: true }],
          ["⛏️ เจาะสำรวจสายแร่ใหม่ (+180 ตัน)", { type: "directorEdit", action: "surveyNewMineVein", assetId: "copper_bauxite_mine", freeSurvey: true }],
          ["🥖 ทดสอบอาหารหมดอายุ ➔ ปุ๋ยหมัก", { type: "directorEdit", action: "expireFoodBatch" }],
          ["🔬 เปิดใบเคลมบอร์ด RMA", { type: "directorEdit", action: "triggerRmaClaim", productId: "controller" }],
          ["🦾 สลับแม่พิมพ์ Die & Jig (Line A)", { type: "directorEdit", action: "triggerToolingChangeover", lineId: "lineA", productId: "ev_battery_pack", force: true }],
          ["🧬 ออกใบรับรองปลอดเชื้อ Clinical COA", { type: "directorEdit", action: "certifyBiomedLot", productId: "vital_monitor" }],
          ["🔬 รับงานแล็บสอบเทียบ ISO", { type: "directorEdit", action: "startServiceOrder", serviceTypeId: "calibration_lab", clientCorpId: "siam_auto" }],
          ["♻️ รับงานรีไซเคิลกากของเสีย ➔ กู้คืนวัตถุดิบ", { type: "directorEdit", action: "startServiceOrder", serviceTypeId: "industrial_recycling", clientCorpId: "eastern_chem" }],
          ["⚔️ จำลองสงครามปิดล้อมทะเลแดง (น้ำมัน/ค่าระวางพุ่ง)", { type: "directorEdit", action: "triggerGeopoliticalEvent", eventId: "red_sea_blockade_war" }],
          ["⚔️ จำลองสงครามทะเลดำ (ราคาปุ๋ย/แป้งสาลีพุ่ง)", { type: "directorEdit", action: "triggerGeopoliticalEvent", eventId: "black_sea_grain_fertilizer_war" }],
          ["⚡ จำลองสงครามคว่ำบาตรชิป AI (ราคาชิป/เวเฟอร์พุ่ง)", { type: "directorEdit", action: "triggerGeopoliticalEvent", eventId: "superpower_chip_embargo" }],
          ["🗳️ เปลี่ยนรัฐบาลสหรัฐฯ (ขึ้นกำแพงภาษี/กรีนดีล)", { type: "directorEdit", action: "changeForeignRegime", nationId: "US" }],
          ["🗳️ เปลี่ยนรัฐบาลจีน (จำกัดโควตาส่งออกลิเธียม)", { type: "directorEdit", action: "changeForeignRegime", nationId: "CN", regimeId: "strategic_resource_control" }],
          ["🤝 ลงนามสนธิสัญญาการค้าเสรี อาเซียน-ญี่ปุ่น-อียู", { type: "directorEdit", action: "triggerGeopoliticalEvent", eventId: "asean_jp_eu_free_trade_pact" }],
          ["📦 เปิดใบงานค้าส่งและกระจายวัตถุดิบ B2B (Wholesale Hub)", { type: "directorEdit", action: "startServiceOrder", serviceTypeId: "wholesale_distribution", clientCorpId: "singapore_port_3pl" }],
          ["🔥 เปิดใบงานรับจ้างถลุงแร่และรีดอะลูมิเนียม (Toll Smelting)", { type: "directorEdit", action: "startServiceOrder", serviceTypeId: "toll_smelting_extrusion", clientCorpId: "nusantara_nickel" }],
          ["⚡💧 ชำระบิลค่าไฟฟ้าและน้ำประปาโรงงานรอบสัปดาห์", { type: "directorEdit", action: "payUtilityBills" }],
          ["🏆 จัดพิธีมอบรางวัลพนักงานดีเด่นประจำรอบ (Townhall Award)", { type: "directorEdit", action: "evaluateTownhallAwards", payBonus: true }],
          ["🚀 จำลองพนักงานอาวุโสแยกตัวเปิดบริษัท Spin-off ศิษย์เก่า", { type: "directorEdit", action: "evaluateEmployeeSpinoff", force: true }],
          ["🔄 โอนย้ายสายอาชีพภายในตามความถนัด/คอขวด", { type: "directorEdit", action: "evaluateInternalCareerSwitch", force: true }],
          ["🛠️ แก้วิกฤตคอขวดเครื่องจักร/จ้างช่าง OEM ภายนอก", { type: "directorEdit", action: "evaluateOperationalCrisesAndBottlenecks" }],
        ];
        for (const [labelTh, payload] of bpActions) {
          const btn = el("button", "btn", labelTh);
          btn.onclick = () => dispatch(payload, `สั่งดำเนินการ: ${labelTh}`);
          bpBtnRow.append(btn);
        }
        bizProcessEditCard.append(bpBtnRow);

        body.replaceChildren(financeExperimentCard, inventory, personCard, scaleCard, extAssetEditCard, bizProcessEditCard);
        return;
      }

      const c = el("div", "card");
      c.append(el("h3", "", "⏱️ ข้ามเวลาและบริหารจัดการไฟล์บันทึก (100% Offline)"));
      const row1 = el("div", "");
      const bHour = el("button", "btn", "⏩ จำลองทันที +1 ชั่วโมง");
      bHour.onclick = () => byId("advance-hour").click();
      const bDay = el("button", "btn pri", "⏭️ จำลองทันที +1 วัน");
      bDay.onclick = () => byId("advance-day").click();
      row1.append(bHour, bDay);

      const row2 = el("div", "");
      row2.style.marginTop = "8px";
      const bSave = el("button", "btn pri", "💾 บันทึกในเครื่อง");
      bSave.onclick = () => byId("save-local").click();
      const bLoad = el("button", "btn", "📂 โหลดเซฟในเครื่อง");
      bLoad.onclick = () => byId("load-local").click();
      const bExp = el("button", "btn", "⬇️ ส่งออกไฟล์ JSON");
      bExp.onclick = () => byId("export-save").click();
      const bAudit = el("button", "btn", "✅ ตรวจบัญชีและแกนระบบ");
      bAudit.onclick = () => byId("audit").click();
      row2.append(bSave, bLoad, bExp, bAudit);

      const row3 = el("div", "");
      row3.style.marginTop = "10px";
      row3.append(el("div", "muted", "เริ่มบริษัทใหม่ด้วย Seed และขนาดทีมเริ่มต้นที่ต้องการ:"));
      const seedInp = el("input");
      seedInp.value = v.seed || "company-demo";
      seedInp.style.marginTop = "4px";
      const bNew=el("button","btn pri","🌱 เลือกธุรกิจเริ่มต้นใหม่");bNew.onclick=()=>showBusinessChooser(seedInp.value);row3.append(seedInp,bNew);

      c.append(row1, row2, row3);
      body.replaceChildren(c);
    }
  }

  function syncCompatControls(v) {
    const offersBox = byId("offers");
    if (offersBox) {
      offersBox.replaceChildren(
        ...v.offers.map((o) => {
          const b = el("button", "", "accept");
          b.type = "button";
          b.onclick = () => dispatch({ type: "acceptOffer", offerId: o.id });
          return b;
        }),
      );
    }
  }

  function paint(v) {
    if (v && v.status === "won") {
      app.dispatch({ type: "continueEndless" });
      v = app.snapshot();
      showToast("🏆 ยินดีด้วย! บริษัทปลดหนี้และพ้นวิกฤตสำเร็จ — เปิดโหมดขยายอาณาจักรไร้ขีดจำกัด (Endless Empire) ต่อเนื่องทันที!");
    }
    current = v;
    if (v?.watchlist?.people && Array.isArray(v.watchlist.people)) {
      uiState.trackedIds = new Set(v.watchlist.people);
    }
    lastPaint = performance.now();
    renderTopHud(v);
    renderSelectionBanner(v);
    syncCompatControls(v);
    if (uiState.sheetOpen && !(uiState.sheetMode === "menu" && uiState.subTab === "edit") && !(uiState.sheetMode === "company" && uiState.subTab === "company_curriculum" && document.activeElement?.tagName === "SELECT")) renderActiveSheet(v);
  }

  document.querySelectorAll("#speedBar button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const spd = Number(btn.dataset.speed);
      if (spd > 0 && !current.policies.autoAccept) {
        app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
      }
      app.setSpeed(spd);
      paint(app.snapshot());
    });
  });

  document.querySelectorAll("#hudBottom button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nav = btn.dataset.nav;
      if (uiState.sheetOpen && uiState.sheetMode === nav) {
        closeSheet();
      } else {
        openSheet(nav);
      }
    });
  });

  if (byId("tickerBtn")) {
    byId("tickerBtn").onclick = () => openSheet("log", "events");
  }
  if (byId("shClose")) byId("shClose").onclick = closeSheet;
  if (byId("shTall")) {
    byId("shTall").onclick = () => byId("sheet")?.classList.toggle("tall");
  }

  if (byId("fZoomIn")) byId("fZoomIn").onclick = () => renderer?.zoomBy(1.18);
  if (byId("fZoomOut")) byId("fZoomOut").onclick = () => renderer?.zoomBy(0.85);
  if (byId("fHome")) byId("fHome").onclick = () => renderer?.centerCamera();
  if (byId("fFollow")) {
    byId("fFollow").onclick = () => {
      if (!renderer) return;
      const targetId = uiState.selectedPersonId || current.people[0]?.id;
      const activeFollow = renderer.setFollow(targetId);
      byId("fFollow").classList.toggle("on", Boolean(activeFollow));
      showToast(activeFollow ? "กำลังติดตามพนักงานบนแผนที่" : "ยกเลิกการล็อกกล้องติดตาม");
    };
  }

  if (renderer) {
    renderer.bindInteractions({
      onSelectPerson: (personId) => {
        uiState.selectedPersonId = personId;
        paint(current);
        openPersonSheet(personId);
      },
      onSelectBuilding: (buildingId) => {
        uiState.selectedBuildingId = buildingId;
        openBuildingSheet(buildingId);
      },
    });
  }

  if (byId("new-game")) {
    byId("new-game").onclick = () => showBusinessChooser(byId("seed")?.value);
  }

  if (byId("speed")) {
    byId("speed").onchange = () => {
      app.setSpeed(Number(byId("speed").value));
      paint(app.snapshot());
    };
  }
  if (byId("advance-hour")) {
    byId("advance-hour").onclick = () => {
      app.advance(60);
      paint(app.snapshot());
    };
  }
  if (byId("advance-day")) {
    byId("advance-day").onclick = () => {
      app.advance(1440);
      paint(app.snapshot());
    };
  }
  if (byId("save-local")) {
    byId("save-local").onclick = () => {
      try {
        localStorage.setItem("company-foundation-review", app.save());
        showToast("บันทึกสถานะบริษัทลงในเครื่องแล้ว");
      } catch (e) {
        showToast("บันทึกในเครื่องไม่ได้: " + e.message, true);
      }
    };
  }
  if (byId("load-local")) {
    byId("load-local").onclick = () => {
      try {
        const text = localStorage.getItem("company-foundation-review");
        if (!text) {
          showToast("ยังไม่มีเซฟในเครื่อง", true);
          return;
        }
        const result = app.load(text);
        showToast(result.ok ? "โหลดเซฟสำเร็จแล้ว" : result.message, !result.ok);
        if (result.ok) paint(app.snapshot());
      } catch (e) {
        showToast(e.message, true);
      }
    };
  }
  if (byId("export-save")) {
    byId("export-save").onclick = () => {
      const blob = new Blob([app.save()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = el("a");
      link.href = url;
      link.download = "company-campus-save.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  if (byId("import-save")) {
    byId("import-save").onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > CompanySave.MAX_BYTES) {
        showToast("ไฟล์เซฟใหญ่เกินขีดจำกัด", true);
        return;
      }
      const result = app.load(await file.text());
      showToast(result.ok ? "นำเข้าเซฟแล้ว" : result.message, !result.ok);
      if (result.ok) paint(app.snapshot());
      event.target.value = "";
    };
  }
  if (byId("audit")) {
    byId("audit").onclick = () => {
      const errors = app.audit();
      showToast(
        errors.length
          ? errors.join("; ")
          : "ตรวจข้อมูล บัญชี วัตถุดิบ และแกนมนุษย์: ผ่าน 100%",
        errors.length > 0,
      );
    };
  }

  document.addEventListener("visibilitychange", () => app.resetClock());
  app.subscribe((v) => {
    pending = v;
  });
  paint(current);

  const bootTime = performance.now();
  function frame(t) {
    if (!autoStarted && !document.getElementById("business-chooser")?.open && t - bootTime > 1400) {
      autoStarted = true;
      if (!current.policies.autoAccept && current.orders.length === 0) {
        app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
        pending = app.snapshot();
      }
      if (app.getSpeed() === 0) {
        app.setSpeed(1);
        paint(app.snapshot());
      }
    }
    if (!document.hidden && autoStarted) app.frame(t);
    if (pending !== current && t - lastPaint >= 180) paint(pending);
    if (renderer) {
      renderer.render(current, t, {
        personId: uiState.selectedPersonId,
        buildingId: uiState.selectedBuildingId,
        trackedIds: uiState.trackedIds,
        speed: app.getSpeed(),
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function showBusinessChooser(seed="company-demo") {
    app.setSpeed(0);autoStarted=false;
    let dialog=byId("business-chooser");if(!dialog){dialog=el("dialog","business-chooser");dialog.id="business-chooser";document.body.append(dialog);}
    dialog.replaceChildren();dialog.addEventListener("cancel",e=>e.preventDefault(),{once:true});
    dialog.append(el("h2","","เริ่มบริษัท SME ของคุณ"),el("p","muted","เลือกจุดเริ่มต้น ทีมจะบริหาร รับงาน และเรียนรู้ต่อเองตามนิสัย ความพร้อม และสถานการณ์ ธุรกิจเริ่มต้นไม่ล็อกความรู้ตลอดชีวิต"));
    const seedInput=el("input");seedInput.id="startup-seed";seedInput.value=seed;seedInput.setAttribute("aria-label","Seed ของโลก");dialog.append(seedInput);
    const select=el("select");select.id="startup-business";select.setAttribute("aria-label","ประเภทธุรกิจเริ่มต้น");
    const profiles=CompanyStartup.list();for(const p of profiles){const o=el("option","",p.icon+" "+p.nameTh);o.value=p.id;select.append(o);}dialog.append(select);
    const detail=el("div","card");const update=()=>{const p=profiles.find(p=>p.id===select.value);detail.replaceChildren(el("h3","",p.nameTh),el("p","",p.descriptionTh),el("p","",`ทุนผู้ก่อตั้ง ${moneyFull(p.capital)} • ทีม ${p.people} คน • จ่ายเครื่องมือ สต็อก และมัดจำก่อนเริ่ม เงินสดที่เหลือดูในภาพรวมบริษัท`));};select.onchange=update;update();dialog.append(detail);
    const start=el("button","btn pri","เริ่มชีวิตบริษัท");start.id="startup-confirm";start.onclick=()=>{app.newGame(seedInput.value||"company-demo",{autonomous:true,startingBusiness:select.value});app.dispatch({type:"setPolicy",key:"autoAccept",value:true});dialog.close();autoStarted=true;app.setSpeed(1);paint(app.snapshot());};dialog.append(start);
    const load=el("button","btn","โหลดเซฟเดิมแทน");load.onclick=()=>{dialog.close();autoStarted=true;byId("load")?.click();};dialog.append(load);if(!dialog.open)dialog.showModal();
  }
  window.CompanyDebug = Object.freeze({
    app,
    showBusinessChooser,
    getCamera: () => renderer?.getCamera(),
    refresh: () => paint(app.snapshot()),
    openPersonSheet,
    openPhoneIndustry: () => openSheet("phoneIndustry", "phone_overview"),
    openBuildingSheet,
    toggleTrackedPerson,
  });
  window.CompanyGame = window.CompanyDebug;
  showBusinessChooser();
})();
