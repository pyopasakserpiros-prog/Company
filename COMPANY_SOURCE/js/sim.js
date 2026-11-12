(function (root, factory) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const value = factory(
    node ? require("./human-core.js") : root.CompanyCore,
    node ? require("./data.js") : root.CompanyData,
    node ? require("./layout.js") : root.CompanyLayout,
    node ? require("./economy.js") : root.CompanyEconomy,
    node ? require("./world.js") : root.CompanyWorld,
    node ? require("./plant.js") : root.CompanyPlant,
  );
  if (node) module.exports = value;
  else root.CompanySim = value;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (H, D, L, E, W, P) {
    "use strict";
    const VERSION = "0.1.0",
      RELEASE_VERSION = "2.7.0",
      SCHEMA = "company-foundation-1",
      TICK = 5;
    const BUILTIN_TASK_SKILLS = {
      assembly: "assembly",
      rework: "assembly",
      qa: "quality",
      packing: "logistics",
      shipping: "logistics",
      purchase: "admin",
      invoice: "admin",
      research: "engineering",
      sales: "sales",
    };
    const BUILTIN_TASK_STATIONS = {
      assembly: "assembly",
      rework: "assembly",
      qa: "quality",
      packing: "packing",
      shipping: "shipping",
      purchase: "admin",
      invoice: "admin",
      research: "research",
      sales: "sales",
    };
    // Levels are simulation state; amounts are integer satang, not visual-only upgrades.
    const FACILITY_RULES = Object.freeze({
      hq: { nameTh: "สำนักงานใหญ่", cost: 1000000 },
      factory: { nameTh: "โรงงานผลิต", cost: 1800000 },
      warehouse: { nameTh: "คลังสินค้า", cost: 1200000 },
      rnd: { nameTh: "อาคารวิจัย", cost: 1400000 },
      canteen: { nameTh: "โรงอาหาร", cost: 800000 },
      courtyard: { nameTh: "สวนพักผ่อน", cost: 600000 },
      training: { nameTh: "ศูนย์ฝึกอบรม", cost: 900000 },
    });
    const freshFacilities = () => ({
      levels: Object.fromEntries(Object.keys(FACILITY_RULES).map((key) => [key, 1])),
      trainingMinutes: 0,
      lastDecisionDay: 0,
      lastDecision: null,
      machineCondition: 100,
      maintenanceCount: 0,
      totalPromotions: 0,
      totalBonusesPaid: 0,
      employeeOfTheWeekId: null,
      employeeOfTheWeekName: null,
      constructedPlots: [],
      plotHistory: [],
    });
    const freshLogistics = () => ({
      b2bDeals: [],
      inboundShipments: [],
      outboundShipments: [],
      productionRegime: "lean_balanced",
      productionLines: {
        lineA: {
          id: "lineA",
          nameTh: "สายการผลิตหลักที่ 1 (Main Factory Line A)",
          modeId: "smt_precision",
          modeNameTh: "สายประกอบไมโครอิเล็กทรอนิกส์ SMT",
          active: true,
          stations: ["assembly1", "assembly2", "assembly3", "quality1", "quality2"],
          speedBonusPct: 0,
          unitsCompleted: 0,
        },
        lineB: {
          id: "lineB",
          nameTh: "สายการผลิตอัจฉริยะที่ 2 (Smart Line B)",
          modeId: "automated_modular",
          modeNameTh: "สายประกอบโมดูลอัตโนมัติความเร็วสูง",
          active: false,
          stations: ["assembly_b1", "assembly_b2", "quality_b1"],
          speedBonusPct: 15,
          unitsCompleted: 0,
        },
        lineC: {
          id: "lineC",
          nameTh: "สายการผลิตอัตโนมัติที่ 3 (Mega Line C)",
          modeId: "cnc_mechanical",
          modeNameTh: "สายขึ้นรูปโลหะและกลไกหนัก CNC",
          active: false,
          stations: ["assembly_c1", "assembly_c2", "quality_c1"],
          speedBonusPct: 20,
          unitsCompleted: 0,
        },
        lineD: {
          id: "lineD",
          nameTh: "สายการผลิตคลีนรูมและพลังงานที่ 4 (Clean & HV Line D)",
          modeId: "cleanroom_batch",
          modeNameTh: "สายสกัดคลีนรูมและเซลล์พลังงานแรงดันสูง",
          active: false,
          stations: ["assembly_d1", "assembly_d2", "quality_d1"],
          speedBonusPct: 25,
          unitsCompleted: 0,
        },
      },
      modeOutputCounts: {
        smt_precision: 0,
        cnc_mechanical: 0,
        cleanroom_batch: 0,
        high_voltage_cell: 0,
        automated_modular: 0,
        milling_refining: 0,
        continuous_food_bake: 0,
        semiconductor_fab: 0,
      },
      fleetCount: 2,
      totalInboundReceived: 0,
      totalOutboundDispatched: 0,
    });

    function createAgriPlotState(cropId, assetId, customId = null) {
      const cropSpec = D.AGRICULTURE_CROPS?.[cropId] || D.AGRICULTURE_CROPS?.jasmine_rice;
      const pid = customId || ("plot_" + (assetId || cropId));
      return {
        id: pid,
        assetId: assetId || cropSpec.assetId,
        cropId: cropSpec.id,
        nameTh: cropSpec.nameTh,
        icon: cropSpec.icon || "🌾",
        areaRai: 12,
        stage: "idle", // idle -> preparing -> planted -> growing -> ready_to_harvest -> harvesting -> sorting_seed -> fallow
        soilNutrients: 82,
        soilMoisture: 78,
        seedMatId: cropSpec.seedMaterialId,
        harvestMatId: cropSpec.harvestMaterialId,
        byproductMatId: cropSpec.byproductMaterialId,
        seedRequired: cropSpec.seedRequired || 2,
        waterRequired: cropSpec.waterRequired || 2,
        seedSaveRatio: cropSpec.defaultSeedSaveRatio ?? 0.25,
        seedBatchAgeDays: 0,
        germinationRate: 0.94,
        plantedAt: null,
        growthMinutes: 0,
        targetGrowthMinutes: cropSpec.growthMinutes || 1440,
        cycleCount: 0,
        waterShortageEvents: 0,
        nutrientShortageEvents: 0,
        fertilizerAppliedCount: 0,
        waterAppliedUnits: 0,
        totalSeedPlanted: 0,
        totalGrossHarvested: 0,
        totalSeedSaved: 0,
        totalNetCropToWarehouse: 0,
        totalByproductYielded: 0,
        totalSpoiledLoss: 0,
        assignedWorkerId: null,
        assignedWorkerName: null,
        lastReasonTh: "แปลงเกษตรพร้อมเริ่มเตรียมดินและเพาะปลูกเมื่อมีเมล็ดพันธุ์และน้ำดิบ",
        lastHarvest: null,
        history: [],
      };
    }

    function freshAgriculture() {
      return {
        plots: {
          plot_jasmine_rice_farm: createAgriPlotState("jasmine_rice", "jasmine_rice_farm", "plot_jasmine_rice_farm"),
        },
        seedBatches: {
          rice_seed: { materialId: "rice_seed", ageDays: 0, quality: 95, germinationRate: 0.94 },
          cane_stalk_seed: { materialId: "cane_stalk_seed", ageDays: 0, quality: 94, germinationRate: 0.93 },
          palm_seedling: { materialId: "palm_seedling", ageDays: 0, quality: 95, germinationRate: 0.94 },
          soybean_seed: { materialId: "soybean_seed", ageDays: 0, quality: 94, germinationRate: 0.93 },
        },
        waterSource: {
          dailyFlowCap: 12,
          usedToday: 0,
          pumpCondition: 100,
          wastewaterPending: 0,
          wastewaterTreated: 0,
        },
        totalCyclesCompleted: 0,
        totalSeedUsed: 0,
        totalSeedSavedFromHarvest: 0,
        totalCropHarvested: 0,
        totalWaterUsed: 0,
        totalFertilizerUsed: 0,
        lastSeedSortAt: -1,
        livestock: {
          dairy_soy_farm: {
            assetId: "dairy_soy_farm",
            herdCount: 18,
            herdHealth: 96,
            nutritionLevel: 80,
            waterLevel: 82,
            feedReserveUnits: 12,
            milkingStage: "hungry", // hungry | feeding | digesting | ready_to_milk | resting
            digestMinutes: 0,
            requiredDigestMinutes: 180,
            lastFedAt: null,
            lastMilkedAt: null,
            lactationCyclesCompleted: 0,
            reproductionProgressDays: 0,
            dailyMilkYield: 4,
            dailyManureYield: 2,
            totalMilkProduced: 0,
            totalManureProduced: 0,
          },
        },
        mining: {
          copper_bauxite_mine: {
            assetId: "copper_bauxite_mine",
            miningStage: "drilling_blasting", // surveying | drilling_blasting | hauling_crushing | depleted_vein
            reserveRemaining: 360,
            reserveMax: 360,
            oreGrade: 92,
            tailingsGenerated: 0,
            veinsSurveyed: 1,
            totalOreExtracted: 0,
          },
          silica_quartz_quarry: {
            assetId: "silica_quartz_quarry",
            miningStage: "drilling_blasting",
            reserveRemaining: 420,
            reserveMax: 420,
            oreGrade: 94,
            tailingsGenerated: 0,
            veinsSurveyed: 1,
            totalOreExtracted: 0,
          },
          lithium_rare_earth: {
            assetId: "lithium_rare_earth",
            miningStage: "drilling_blasting",
            reserveRemaining: 280,
            reserveMax: 280,
            oreGrade: 90,
            tailingsGenerated: 0,
            veinsSurveyed: 1,
            totalOreExtracted: 0,
          },
          petro_resin_plant: {
            assetId: "petro_resin_plant",
            miningStage: "drilling_blasting",
            reserveRemaining: 500,
            reserveMax: 500,
            oreGrade: 95,
            tailingsGenerated: 0,
            veinsSurveyed: 1,
            totalOreExtracted: 0,
          },
        },
        forestry: {
          timber_packaging_mill: {
            assetId: "timber_packaging_mill",
            saplingsYear1: 45,
            growingTreesYear2: 40,
            matureTreesReady: 35,
            totalLogsFelled: 0,
            totalSaplingsReplanted: 0,
          },
        },
      };
    }

    function freshFleetTransport(seedStr = "company") {
      const routes = D.FREIGHT_ROUTES || [];
      const openQuotes = routes.map((r, idx) => ({
        id: `fquote-${idx + 1}`,
        routeId: r.id,
        nameTh: r.nameTh,
        originTh: r.originTh,
        destinationTh: r.destinationTh,
        pickupEmptyKm: r.pickupEmptyKm,
        outboundLoadedKm: r.outboundLoadedKm,
        backhaulEmptyKm: r.backhaulEmptyKm,
        totalRoundTripKm: r.pickupEmptyKm + r.outboundLoadedKm + r.backhaulEmptyKm,
        tollFeeSatang: r.tollFeeSatang,
        offeredRateSatang: r.baseRateSatang,
        cargoType: r.cargoType,
        cargoNameTh: r.cargoNameTh,
        weightKg: r.weightKg,
        volumeM3: r.volumeM3,
        cargoValueSatang: r.cargoValueSatang,
        clientCorpId: r.clientCorpId,
        status: "quoted",
        createdAt: 540,
      }));
      return {
        vehicles: {
          "truck-1": {
            id: "truck-1",
            typeId: "dry_6w",
            nameTh: "รถบรรทุกตู้ทึบ 6 ล้อ ISUZU NPR #1",
            plate: "70-1042 กทม.",
            ownership: "owned",
            maxWeightKg: 6500,
            maxVolumeM3: 28,
            baseLitersPerKm: 0.18,
            supportedCargoTypes: ["dry", "general", "packaging"],
            condition: 100,
            tireCondition: 100,
            odometerKm: 1200,
            status: "idle", // idle | loading | outbound | delivering | returning | maintenance | broken
            assignedDriverId: null,
            assignedDriverName: null,
            activeContractId: null,
            internalOrderId: null,
            returnRemainingKm: 0,
            tripsCompleted: 0,
          },
        },
        openQuotes,
        contracts: {},
        cargoCustody: {},
        metrics: {
          completedTrips: 0,
          cancelledTrips: 0,
          failedTrips: 0,
          totalDistanceKm: 0,
          emptyBackhaulKm: 0,
          fuelConsumedLiters: 0,
          freightRevenueSatang: 0,
          receivablesSatang: 0,
          tollAndFuelCostSatang: 0,
          maintenanceCostSatang: 0,
          allocatedLaborSatang: 0,
          claimsPaidSatang: 0,
        },
        history: [],
      };
    }

    function freshSoftwareBusiness() {
      const apps = D.SOFTWARE_APPS || {};
      const saasProducts = {};
      for (const [appId, spec] of Object.entries(apps)) {
        saasProducts[appId] = {
          appId,
          nameTh: spec.nameTh,
          icon: spec.icon,
          status: appId === "pos_retail" ? "live" : "concept", // concept | developing_mvp | live | retired
          version: appId === "pos_retail" ? "1.0.0" : "0.1.0",
          mvpProgressMinutes: appId === "pos_retail" ? spec.devWorkMinutes : 0,
          mvpRequiredMinutes: spec.devWorkMinutes,
          leadCount: appId === "pos_retail" ? 12 : 0,
          activeSubscribers: 0, // Must start at 0 so launching an app never generates free subscription money without real converted users!
          totalConvertedUsers: 0,
          totalChurnedUsers: 0,
          monthlyFeePerUserSatang: spec.saasMonthlyFeePerUserSatang,
          nextBillingMinute: 540 + 1440 * 3,
          billingCycleMinutes: 1440 * 3,
          installedInternally: false,
          openSupportTickets: 0,
          knownDefects: 0,
          totalRevenueSatang: 0,
          totalServerCostSatang: 0,
          lastBillingSummaryTh: "ยังไม่มีรอบเรียกเก็บเงินสมาชิก (ต้องมีผู้ใช้จริงก่อนจึงจะเกิดรายได้)",
        };
      }
      return {
        workstations: {
          totalStations: 3,
          occupiedByPersonIds: [],
          testDevices: ["web_pos_terminal", "android_handheld", "ios_tablet"],
          serverCapacityUsers: 60,
        },
        projects: {
          "swproj-1": {
            id: "swproj-1",
            appId: "pos_retail",
            titleTh: "โครงการพัฒนาระบบ Smart POS & ตัดสต็อกสาขาให้ บมจ. เจริญผล ฟู้ดแอนด์เฮลท์",
            clientCorpId: "cp_health",
            clientNameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ โกลบอล",
            status: "discovery", // discovery -> contracted -> designed -> implementing -> testing -> customer_acceptance -> deployed -> supporting -> closed | blocked | cancelled
            targetVersion: "1.0.0",
            deliveredVersion: null,
            contractPriceSatang: 12000000, // ฿120,000
            depositPct: 0.3,
            uatMilestonePct: 0.4,
            deployMilestonePct: 0.3,
            depositCollectedSatang: 0,
            unearnedDepositSatang: 0,
            recognizedRevenueSatang: 0,
            billedReceivableSatang: 0,
            cashCollectedSatang: 0,
            allocatedLaborSatang: 0,
            computeCostSatang: 0,
            externalQaCostSatang: 0,
            reworkCostSatang: 0,
            progressMinutes: 0,
            requiredDevMinutes: 120,
            qaProgressMinutes: 0,
            requiredQaMinutes: 40,
            defectsFound: 0,
            defectsFixed: 0,
            qaCertificateIssued: false,
            assignedDeveloperId: null,
            assignedDeveloperName: null,
            createdAt: 540,
            completedAt: null,
            lastReasonTh: "ฝ่ายขายและนักวิเคราะห์กำลังสำรวจความต้องการลูกค้าและประเมินขอบเขตงาน",
          },
        },
        saasProducts,
        metrics: {
          projectsCompleted: 0,
          projectsCancelled: 0,
          totalContractRevenueSatang: 0,
          totalSaasRevenueSatang: 0,
          totalUnearnedDepositSatang: 0,
          totalComputeAndServerCostSatang: 0,
          totalDefectsResolved: 0,
        },
        history: [],
      };
    }

    function freshSectorProcesses() {
      return {
        foodBakery: {
          modelId: "food_bakery_batch",
          coldChainActive: false,
          activeBatches: {}, // unitId -> { unitId, productId, bakedAt, freshnessPct, shelfLifeDays, coldChainProtected }
          freshShippedCount: 0,
          markdownShippedCount: 0,
          spoiledUnitsCount: 0,
          compostRecoveredUnits: 0,
          freshnessBonusRevenueSatang: 0,
          lastSpoilageEventTh: "ยังไม่มีล็อตอาหารหมดอายุ (ระบบ FIFO & Cold-Chain ทำงานปกติ)",
        },
        electronicsRma: {
          modelId: "electronics_smt_rma",
          firmwareRevision: "Rev.1.2",
          burnInPassCount: 0,
          warrantyLots: [], // { lotId, orderId, productId, quantity, shippedDay, expiresDay, firmwareRev, qualityScore }
          rmaClaims: {}, // claimId -> { id, productId, orderId, defectiveQty, status, createdAt, resolvedAt, resolutionMode }
          totalRmaClaims: 0,
          resolvedRmaCount: 0,
          warrantyCostSatang: 0,
          lastRmaSummaryTh: "ยังไม่มีเคลมบอร์ดอิเล็กทรอนิกส์ (RMA = 0 รายการ)",
        },
        automotiveOem: {
          modelId: "automotive_oem_tooling",
          lineTooling: {
            lineA: { lineId: "lineA", currentToolingProductId: null, consecutiveSameModelCount: 0, changeoverCount: 0 },
            lineB: { lineId: "lineB", currentToolingProductId: null, consecutiveSameModelCount: 0, changeoverCount: 0 },
            lineC: { lineId: "lineC", currentToolingProductId: null, consecutiveSameModelCount: 0, changeoverCount: 0 },
            lineD: { lineId: "lineD", currentToolingProductId: null, consecutiveSameModelCount: 0, changeoverCount: 0 },
          },
          totalChangeovers: 0,
          toolingChangeoverCostSatang: 0,
          dynoCertifiedCount: 0,
          rhythmBonusUnits: 0,
          lastToolingSummaryTh: "แม่พิมพ์และจิ๊กประกอบพร้อมสลับรุ่น (Die & Jig Ready)",
        },
        biomedSterile: {
          modelId: "biomed_sterile_lot",
          sterilityIndex: 96, // 0..100
          cleanroomClass: "ISO Class-5",
          quarantineLots: {}, // lotId -> { id, productId, unitId, status: "quarantine"|"certified"|"rejected", sterilityScore, assayAt }
          clinicalCertificatesIssued: 0,
          sterilityRejectedLots: 0,
          clinicalPremiumSatang: 0,
          lastSterileSummaryTh: "ห้องคลีนรูมปลอดเชื้อ (Sterility 96% • ผ่านเกณฑ์ อย./ISO)",
        },
      };
    }

    function freshServiceBusiness() {
      return {
        orders: {},
        instrumentCustody: {}, // custodyId -> { id, orderId, clientNameTh, equipmentNameTh, status }
        metrics: {
          completedOrders: 0,
          calibrationCertificatesIssued: 0,
          slaOnTimeCount: 0,
          slaBreachCount: 0,
          recycledTonsProcessed: 0,
          recoveredMaterialsUnits: 0,
          serviceRevenueSatang: 0,
          serviceCostSatang: 0,
          slaPenaltyPaidSatang: 0,
        },
        history: [],
      };
    }

    // Learned subjects and company process qualification live outside the locked Human Core.
    const BASE_SUBJECTS = {
      embedded_iot: "อิเล็กทรอนิกส์และระบบฝังตัว", food_fermentation: "อาหารและการหมัก",
      bakery: "การอบขนมและธัญพืช", biomed_sterile: "เวชภัณฑ์และงานปลอดเชื้อ",
      metal_machining: "โลหะวิทยาและเครื่องจักร", power_electronics: "ไฟฟ้ากำลังและแบตเตอรี่",
      semiconductor_optics: "เซมิคอนดักเตอร์และหุ่นยนต์", software: "พัฒนาซอฟต์แวร์",
      agriculture: "เกษตรและทรัพยากรชีวภาพ", logistics: "ขนส่งและคลังสินค้า",
      quality: "มาตรวิทยาและระบบคุณภาพ", management: "บริหารกิจการ", commerce: "การค้าและบัญชี",
    };
    const SUBJECT_DETAILS = Object.freeze({
      algorithms:["อัลกอริทึมและการวิเคราะห์ประสิทธิภาพ","ซอฟต์แวร์","discrete_math"], data_structures:["โครงสร้างข้อมูล","ซอฟต์แวร์","programming"], food_reheating:["การอุ่นอาหารอย่างปลอดภัย","อาหาร","food_safety"], food_preservation:["การถนอมอาหาร","อาหาร","food_safety"], household_budgeting:["วางแผนรายรับรายจ่ายส่วนบุคคล","สำนักงาน","mathematics"],
      calculus:["แคลคูลัสและสมการเชิงอนุพันธ์","คณิตศาสตร์","applied_math"], linear_algebra:["พีชคณิตเชิงเส้น","คณิตศาสตร์","mathematics"], probability:["ความน่าจะเป็น","คณิตศาสตร์","mathematics"], numerical_methods:["วิธีเชิงตัวเลขและการคำนวณวิศวกรรม","คณิตศาสตร์","advanced_math"], discrete_math:["คณิตศาสตร์ไม่ต่อเนื่องและตรรกศาสตร์","คณิตศาสตร์","mathematics"], optimization:["การหาค่าเหมาะที่สุด","คณิตศาสตร์","linear_algebra"],
      physical_chemistry:["เคมีเชิงฟิสิกส์","เคมี","chemical_processing"], organic_chemistry:["เคมีอินทรีย์","เคมี","chemical_processing"], analytical_chemistry:["เคมีวิเคราะห์และการทดสอบสาร","เคมี","chemical_processing"], thermodynamics:["อุณหพลศาสตร์","วิศวกรรมกระบวนการ","applied_math"], heat_transfer:["การถ่ายเทความร้อน","วิศวกรรมกระบวนการ","thermodynamics"], fluid_mechanics:["กลศาสตร์ของไหล","วิศวกรรมกระบวนการ","applied_math"], process_control:["ควบคุมกระบวนการอุตสาหกรรม","วิศวกรรมกระบวนการ","control_theory"], reaction_engineering:["วิศวกรรมปฏิกิริยาเคมี","วิศวกรรมกระบวนการ","physical_chemistry"],
      materials_science:["วัสดุศาสตร์และสมบัติวัสดุ","โลหะ","chemical_processing"], corrosion:["การกัดกร่อนและป้องกันวัสดุ","โลหะ","materials_science"], casting:["กระบวนการหล่อโลหะ","โลหะ","metallurgy"], extrusion:["กระบวนการอัดรีดและขึ้นรูป","โลหะ","materials_science"], industrial_automation:["ระบบอัตโนมัติและ PLC","ไฟฟ้า","electrical_basics"], industrial_networks:["เครือข่ายสื่อสารอุตสาหกรรม","ไฟฟ้า","embedded_iot"], lean_manufacturing:["การผลิตแบบลีนและลดความสูญเปล่า","การผลิต","project_management"], statistical_quality:["ควบคุมคุณภาพเชิงสถิติ","คุณภาพ","statistics"], reliability_engineering:["ความเชื่อถือได้และวิเคราะห์ความล้มเหลว","คุณภาพ","probability"], measurement_uncertainty:["ความไม่แน่นอนของการวัด","คุณภาพ","statistics"], semiconductor_physics:["ฟิสิกส์สารกึ่งตัวนำและอุปกรณ์","เซมิคอนดักเตอร์","physical_chemistry"],
      cost_accounting:["บัญชีต้นทุนการผลิตและบริการ","สำนักงาน","accounting"], taxation:["ภาษีอากรและเอกสารภาษีธุรกิจ","สำนักงาน","accounting"], budgeting:["จัดทำงบประมาณและติดตามผล","สำนักงาน","financial_planning"], treasury:["บริหารสภาพคล่องและความเสี่ยงการเงิน","สำนักงาน","financial_planning"], contract_management:["บริหารสัญญาและการเรียกร้องสิทธิ","สำนักงาน","business_law"], hr_recruitment:["สรรหาและประเมินบุคลากร","สำนักงาน","people_management"], employment_law:["กฎหมายแรงงานและแรงงานสัมพันธ์","สำนักงาน","business_law"], sustainability_accounting:["บัญชีสิ่งแวดล้อมและการรายงานความยั่งยืน","สำนักงาน","accounting"],
      demand_forecasting:["พยากรณ์ความต้องการสินค้า","ขนส่ง","statistics"], production_planning:["วางแผนการผลิตและกำลังการผลิต","การผลิต","project_management"], supply_chain_risk:["บริหารความเสี่ยงซัพพลายเชน","ขนส่ง","procurement"], route_optimization:["คำนวณเส้นทางและจัดรถขนส่ง","ขนส่ง","operations_research"], international_trade:["การค้าระหว่างประเทศและเงื่อนไขส่งมอบ","ขนส่ง","business_law"], packaging_engineering:["วิศวกรรมบรรจุภัณฑ์และการป้องกันสินค้า","การผลิต","materials_science"], inventory_optimization:["วางนโยบายสต็อกและปริมาณสั่งซื้อ","ขนส่ง","statistics"],
      data_modeling:["ออกแบบแบบจำลองข้อมูล","ซอฟต์แวร์","databases"], api_design:["ออกแบบ API และการเชื่อมระบบ","ซอฟต์แวร์","programming"], distributed_systems:["ระบบกระจายและความสอดคล้องข้อมูล","ซอฟต์แวร์","programming"], secure_coding:["การเขียนโปรแกรมอย่างปลอดภัย","ซอฟต์แวร์","cybersecurity"], ux_research:["วิจัยประสบการณ์และทดสอบกับผู้ใช้","ซอฟต์แวร์","requirements_analysis"], frontend_development:["พัฒนาส่วนติดต่อผู้ใช้เว็บและแอป","ซอฟต์แวร์","programming"], machine_learning:["การเรียนรู้ของเครื่องและประเมินโมเดล","ซอฟต์แวร์","linear_algebra"], computer_vision:["ประมวลผลภาพและการมองเห็นของเครื่อง","ซอฟต์แวร์","machine_learning"], devops:["ส่งมอบซอฟต์แวร์และดูแลระบบอัตโนมัติ","ซอฟต์แวร์","cloud_operations"],
      plant_pathology:["โรคพืชและวินิจฉัยความผิดปกติ","เกษตร","agriculture"], integrated_pest_management:["จัดการศัตรูพืชแบบผสมผสาน","เกษตร","plant_pathology"], crop_nutrition:["โภชนาการพืชและจัดการปุ๋ย","เกษตร","soil_science"], hydroponics:["ปลูกพืชไร้ดินและควบคุมสารละลาย","เกษตร","crop_nutrition"], agri_machinery:["เครื่องจักรเกษตรและการบำรุงรักษา","เกษตร","maintenance"], aquaculture:["เพาะเลี้ยงสัตว์น้ำและระบบฟาร์ม","เกษตร","animal_husbandry"], fish_health:["สุขภาพสัตว์น้ำและคุณภาพน้ำฟาร์ม","เกษตร","aquaculture"], feed_formulation:["สูตรอาหารสัตว์และสมดุลสารอาหาร","เกษตร","animal_husbandry"], veterinary_basics:["พื้นฐานสัตวแพทย์และความปลอดภัยชีวภาพ","เกษตร","animal_health"],
      sanitation:["สุขลักษณะโรงงานและการล้างฆ่าเชื้อ","อาหาร","food_safety"], haccp:["วิเคราะห์อันตรายและจุดควบคุมวิกฤตอาหาร","อาหาร","food_safety"], allergen_management:["ควบคุมสารก่อภูมิแพ้และฉลากอาหาร","อาหาร","food_safety"], food_microbiology:["จุลชีววิทยาอาหาร","อาหาร","food_fermentation"], thermal_processing:["แปรรูปอาหารด้วยความร้อน","อาหาร","heat_transfer"], nutrition_science:["โภชนศาสตร์และประเมินสารอาหาร","อาหาร","food_formulation"],
      biomedical_instrumentation:["เครื่องมือวัดสัญญาณชีวการแพทย์","ชีวการแพทย์","electrical_basics"], pharmacology:["เภสัชวิทยาและกลไกสารออกฤทธิ์","ชีวการแพทย์","organic_chemistry"], pharmaceutical_quality:["คุณภาพเภสัชภัณฑ์และการตรวจสอบความใช้ได้","ชีวการแพทย์","aseptic_processing"], clinical_research:["วิจัยทางคลินิกและหลักฐานความปลอดภัย","ชีวการแพทย์","clinical_validation"],
      solar_pv:["ระบบโฟโตโวลตาอิกและออกแบบโซลาร์","ไฟฟ้า","power_conversion"], water_chemistry:["เคมีน้ำและการตรวจคุณภาพน้ำ","เคมี","analytical_chemistry"], wastewater_process:["กระบวนการบำบัดน้ำเสียและตะกอน","เคมี","water_treatment"], hydrogen_safety:["ระบบไฮโดรเจนและความปลอดภัยก๊าซ","เคมี","chemical_processing"], energy_auditing:["ตรวจวัดและปรับปรุงประสิทธิภาพพลังงาน","ไฟฟ้า","electrical_basics"],
      maritime_logistics:["ขนส่งทางทะเลและเอกสารเดินเรือ","ขนส่ง","international_trade"], port_operations:["ปฏิบัติการท่าเรือและขนถ่ายสินค้า","ขนส่ง","cargo_safety"], construction_materials:["วัสดุก่อสร้างและการทดสอบ","ก่อสร้าง","materials_science"], structural_analysis:["วิเคราะห์โครงสร้างรับแรง","ก่อสร้าง","applied_math"], geotechnics:["ปฐพีกลศาสตร์และฐานราก","ก่อสร้าง","soil_science"], hotel_operations:["บริหารโรงแรมและการให้บริการ","บริการ","people_management"], hospitality_service:["การบริการและดูแลประสบการณ์ลูกค้า","บริการ","sales_negotiation"],

      mathematics:["คณิตศาสตร์พื้นฐาน","คณิตศาสตร์"], applied_math:["คณิตศาสตร์ประยุกต์","คณิตศาสตร์","mathematics"], advanced_math:["คณิตศาสตร์ขั้นสูง","คณิตศาสตร์","applied_math"], operations_research:["วิจัยดำเนินงานและหาค่าเหมาะที่สุด","คณิตศาสตร์","advanced_math"], control_theory:["ทฤษฎีควบคุมและระบบพลวัต","คณิตศาสตร์","advanced_math"],
      accounting: ["บัญชีขั้นต้น", "สำนักงาน"], financial_planning: ["วางแผนการเงินและเงินทุนหมุนเวียน", "สำนักงาน", "accounting"], procurement: ["จัดซื้อและประเมินซัพพลายเออร์", "สำนักงาน"], inventory_control: ["บัญชีสินค้าและควบคุมสต็อก", "สำนักงาน", "accounting"], sales_negotiation: ["การขายและเจรจาสัญญา", "สำนักงาน"], market_analysis: ["วิเคราะห์ตลาดและความต้องการ", "สำนักงาน"], business_law: ["กฎหมายธุรกิจและสัญญา", "สำนักงาน"], project_management: ["บริหารโครงการ", "สำนักงาน"], people_management: ["บริหารทีมและพัฒนาคน", "สำนักงาน"], office_admin: ["งานเอกสารสำนักงาน", "สำนักงาน"], technical_training: ["ออกแบบหลักสูตรและถ่ายทอดวิชาชีพ", "สำนักงาน", "people_management"], research_methods: ["ระเบียบวิธีวิจัยและทดลอง", "งานวิจัย"], statistics: ["สถิติและออกแบบการทดลอง", "งานวิจัย", "mathematics"], product_design: ["ออกแบบผลิตภัณฑ์และเขียนแบบ", "งานวิจัย"], safety: ["ความปลอดภัยในการทำงาน", "พื้นฐาน"], quality_documentation: ["เอกสารคุณภาพและสอบกลับล็อต", "คุณภาพ"], metrology: ["มาตรวิทยาและสอบเทียบ", "คุณภาพ", "quality"], electrical_basics: ["ไฟฟ้าเบื้องต้น", "ไฟฟ้า"], electrical_safety: ["ความปลอดภัยไฟฟ้าและแรงดันสูง", "ไฟฟ้า", "electrical_basics"], circuit_design: ["ออกแบบวงจรและแผง PCB", "ไฟฟ้า", "electrical_basics"], embedded_firmware: ["เฟิร์มแวร์และไมโครคอนโทรลเลอร์", "ไฟฟ้า", "software"], power_conversion: ["วงจรแปลงไฟและอินเวอร์เตอร์", "ไฟฟ้า", "circuit_design"], battery_chemistry: ["เคมีแบตเตอรี่และการคัดเกรดเซลล์", "ไฟฟ้า", "chemical_processing"], grid_integration: ["ระบบโครงข่ายและติดตั้งพลังงาน", "ไฟฟ้า", "electrical_safety"], smt_process: ["กระบวนการ SMT และประกอบแผงวงจร", "ไฟฟ้า", "electrical_basics"], programming: ["เขียนโปรแกรมเชิงโครงสร้าง", "ซอฟต์แวร์", "software"], requirements_analysis: ["วิเคราะห์ความต้องการผู้ใช้", "ซอฟต์แวร์"], databases: ["ฐานข้อมูลและความถูกต้องของข้อมูล", "ซอฟต์แวร์", "programming"], software_testing: ["ทดสอบซอฟต์แวร์และตรวจรับงาน", "ซอฟต์แวร์", "programming"], version_control: ["จัดการรุ่นซอร์สและงานร่วมทีม", "ซอฟต์แวร์"], cloud_operations: ["ระบบคลาวด์และดูแลบริการ", "ซอฟต์แวร์", "programming"], cybersecurity: ["ความปลอดภัยระบบและข้อมูล", "ซอฟต์แวร์", "programming"], machining: ["ตัดกลึงและ CNC", "โลหะ", "metal_machining"], metallurgy: ["โลหะวิทยาและการถลุง", "โลหะ", "chemical_processing"], welding: ["เชื่อมประกอบและตรวจแนวเชื่อม", "โลหะ", "metal_machining"], mechanical_design: ["ออกแบบกลไกและชิ้นส่วนเครื่องจักร", "โลหะ", "product_design"], tooling: ["แม่พิมพ์ จิ๊ก และตั้งเครื่อง", "โลหะ", "machining"], maintenance: ["บำรุงรักษาและวิเคราะห์ความเสียหาย", "โลหะ", "metal_machining"], robotics_control: ["ควบคุมหุ่นยนต์และระบบอัตโนมัติ", "หุ่นยนต์", "programming"], optical_engineering: ["เลนส์และระบบออปติก", "เซมิคอนดักเตอร์"], semiconductor_process: ["กระบวนการเวเฟอร์และลิโธกราฟี", "เซมิคอนดักเตอร์", "chemical_processing"], cleanroom_operations: ["ปฏิบัติงานคลีนรูมและควบคุมฝุ่น", "เซมิคอนดักเตอร์", "safety"], chemical_processing: ["เคมีอุตสาหกรรมและการแปรรูป", "เคมี"], polymer_processing: ["แปรรูปพอลิเมอร์และยาง", "เคมี", "chemical_processing"], water_treatment: ["คุณภาพน้ำและบำบัดน้ำเสีย", "เคมี", "chemical_processing"], waste_management: ["จัดการของเสียและมลพิษ", "เคมี", "safety"], food_safety: ["สุขอนามัยและความปลอดภัยอาหาร", "อาหาร"], baking_process: ["วัตถุดิบ โดว์ และกระบวนการอบ", "อาหาร", "bakery"], fermentation: ["จุลชีววิทยาและการหมัก", "อาหาร", "food_fermentation"], food_formulation: ["พัฒนาสูตรและกระบวนการอาหาร", "อาหาร", "food_fermentation"], dairy_processing: ["แปรรูปนมและพาสเจอไรซ์", "อาหาร", "food_safety"], shelf_life: ["อายุเก็บรักษาและทดสอบเสถียรภาพ", "อาหาร", "food_safety"], aseptic_processing: ["กระบวนการปลอดเชื้อและตรวจปล่อย", "ชีวการแพทย์", "biomed_sterile"], clinical_validation: ["ทดสอบและตรวจรับเครื่องมือแพทย์", "ชีวการแพทย์", "quality"], regulatory_affairs: ["มาตรฐานผลิตภัณฑ์และทะเบียนกำกับ", "ชีวการแพทย์", "quality_documentation"], soil_science: ["ดินและธาตุอาหารพืช", "เกษตร", "agriculture"], crop_propagation: ["เมล็ดพันธุ์และขยายพันธุ์พืช", "เกษตร", "agriculture"], irrigation: ["ให้น้ำและจัดการทรัพยากรน้ำ", "เกษตร", "agriculture"], animal_husbandry: ["เลี้ยงสัตว์และสวัสดิภาพสัตว์", "เกษตร"], animal_health: ["สุขภาพสัตว์และป้องกันโรค", "เกษตร", "animal_husbandry"], postharvest: ["เก็บเกี่ยวและจัดการผลผลิต", "เกษตร", "agriculture"], warehouse_operations: ["บริหารคลังและเบิกจ่าย", "ขนส่ง", "logistics"], freight_planning: ["วางแผนขนส่งและเส้นทาง", "ขนส่ง", "logistics"], driving: ["ขับรถขนส่งและตรวจรถก่อนใช้", "ขนส่ง", "safety"], cold_chain: ["ควบคุมโซ่ความเย็น", "ขนส่ง", "logistics"], customs: ["ศุลกากรและการค้าระหว่างประเทศ", "ขนส่ง", "business_law"], cargo_safety: ["ความปลอดภัยสินค้าและการรับฝาก", "ขนส่ง", "safety"]
    });
    const SUBJECT_PREREQUISITES = Object.fromEntries(Object.entries(SUBJECT_DETAILS).filter(([,v])=>v[2]).map(([id,v])=>[id,v[2]]));
    const SUBJECT_PREREQUISITE_LEVELS=Object.freeze({applied_math:40,advanced_math:60,operations_research:60,control_theory:60,statistics:30,battery_chemistry:40,semiconductor_process:40,aseptic_processing:40,robotics_control:40});
    const prerequisiteLevel=id=>SUBJECT_PREREQUISITE_LEVELS[id] || 25;
    const researchDisciplines=p=>Object.keys(p.requirements).filter(id=>!["quality","quality_documentation","metrology","regulatory_affairs"].includes(id));
    const FAMILY_SUBJECTS = Object.freeze({
      smart_audio_lighting: {embedded_iot:40,electrical_basics:30,smt_process:30,quality:30},
      industrial_iot: {embedded_iot:40,circuit_design:35,embedded_firmware:30,electrical_safety:30,quality:30},
      ai_vision_edge: {semiconductor_optics:45,optical_engineering:40,programming:40,cleanroom_operations:35,quality:40},
      ev_powertrain: {metal_machining:45,mechanical_design:35,electrical_safety:40,tooling:35,quality:40},
      robotics_automation: {semiconductor_optics:45,robotics_control:40,mechanical_design:40,electrical_safety:40,software_testing:35},
      herbal_functional_bev: {food_fermentation:40,food_formulation:35,food_safety:40,shelf_life:35,quality:30},
      bakery_grain: {bakery:40,baking_process:35,food_safety:40,shelf_life:30,quality:30},
      dairy_fermented: {food_fermentation:40,dairy_processing:40,fermentation:40,cold_chain:35,food_safety:45},
      clinical_sterile: {biomed_sterile:50,aseptic_processing:45,clinical_validation:45,regulatory_affairs:40,quality_documentation:45},
      clean_energy_grid: {power_electronics:45,power_conversion:40,electrical_safety:45,grid_integration:35,quality:40}
    });
    const SERVICE_SUBJECTS = Object.freeze({
      calibration_lab:{quality:45,metrology:45,statistics:35,quality_documentation:40},
      field_maintenance:{metal_machining:40,maintenance:40,electrical_safety:35,safety:35},
      industrial_recycling:{metal_machining:40,waste_management:40,chemical_processing:35,safety:40},
      battery_second_life_lab:{power_electronics:45,battery_chemistry:45,electrical_safety:45,waste_management:35,metrology:35},
      returnable_pallet_pool:{logistics:40,warehouse_operations:35,inventory_control:30,cargo_safety:30},
      cold_storage_3pl:{logistics:40,cold_chain:45,food_safety:35,warehouse_operations:35},
      energy_epc_install:{power_electronics:45,grid_integration:40,electrical_safety:45,project_management:35,business_law:25},
      b2b_technical_academy:{management:40,technical_training:40,project_management:30,quality_documentation:30},
      wholesale_distribution:{commerce:40,procurement:35,inventory_control:30,sales_negotiation:35,accounting:30},
      toll_smelting_extrusion:{metal_machining:45,metallurgy:45,machining:35,waste_management:40,quality:40}
    });
    function productRequirements(w,id) {
      const p=w.catalog.products[id];
      const family=Object.values(D.PRODUCT_FAMILIES || {}).find(f=>f.products.includes(id));
      const req={...(FAMILY_SUBJECTS[family?.id] || {[productSubject(w,id)]:40,research_methods:30,quality:30})};
      // The initial workshop assembles purchased speaker kits; designing its own products needs the full family.
      if (!(p?.researchRequired > 0)) return {embedded_iot:30,safety:20,quality:25};
      if(id==="visionCamera") req.computer_vision=40;
      if(id==="ai_edge_module") req.machine_learning=45;
      if(id==="probiotic_yogurt_cup" || id==="probioticElixir") req.food_microbiology=40;
      if(id==="medical_saline_iv") req.pharmaceutical_quality=45;
      if(id==="solarCharger" || id==="solar_mounting_rail_kit") req.solar_pv=35;
      if(id==="ev_battery_tray_assembly") req.extrusion=35;
      if ((p?.researchRequired || 0) >= 300) req.applied_math=40;
      if (id === "solid_state_powerwall" || id === "autonomous_cargo_drone") req.advanced_math=40;
      return req;
    }
    function materialRequirements(w,id) {
      const subject=materialSubject(w,id), rec=D.MATERIAL_RECIPES?.[id];
      if(!rec) return {};
      const req={[subject]:rec.tier >= 3 ? 50 : 35,safety:25};
      if(/npk|nitrogen|ammonia/.test(id)) req.chemical_processing=35;
      if(rec.tier>=2) req.quality=35;
      if(/wafer|microchip|silicon/.test(id)) {req.semiconductor_process=45;req.cleanroom_operations=40;req.semiconductor_physics=40;}
      else if(/alum|steel|metal|copper|nickel|coke/.test(id)) req.metallurgy=40;
      else if(/flour|dough/.test(id)) req.food_safety=35;
      else if(/saline|culture/.test(id)) req.aseptic_processing=40;
      else if(/cathode|battery/.test(id)) req.battery_chemistry=45;
      else if(/resin|tire|casing/.test(id)) req.polymer_processing=40;
      return req;
    }
    function teamCoverage(w,requirements) {
      return Object.entries(requirements).map(([id,level])=>{
        const holders=w.people.filter(p=>p.employed && subjectLevel(p,id)>=level);
        return {id,nameTh:SUBJECTS[id],level,ready:holders.length>0,holders:holders.map(p=>({id:p.id,name:p.name,level:subjectLevel(p,id)}))};
      });
    }
    function teamReady(w,requirements) { return Object.entries(requirements).every(([id,level])=>subjectReady(w,id,level)); }

    const SUBJECTS = Object.freeze({...BASE_SUBJECTS,...Object.fromEntries(Object.entries(SUBJECT_DETAILS).map(([id,v])=>[id,v[0]]))});
    const SUBJECT_APTITUDE_MODELS = Object.freeze({
      mathematical:{numerical:.35,analytical:.3,memory:.2,uncertaintyReasoning:.15},
      accounting:{numerical:.3,precision:.25,organization:.25,attention:.2},
      engineering:{analytical:.3,spatial:.25,precision:.25,problemSensitivity:.2},
      software:{analytical:.35,memory:.2,problemSensitivity:.25,organization:.2},
      craft:{dexterity:.25,precision:.3,sensory:.2,coordination:.25},
      culinary:{tasteSmell:.25,precision:.25,attention:.25,dexterity:.25},
      biological:{sensory:.2,memory:.25,problemSensitivity:.3,attention:.25},
      laboratory:{precision:.3,attention:.25,analytical:.25,visualAcuity:.2},
      commercial:{communication:.3,verbal:.25,uncertaintyReasoning:.25,emotionalInsight:.2},
      management:{organization:.3,communication:.25,uncertaintyReasoning:.25,emotionalInsight:.2},
      transport:{spatial:.25,reactionSpeed:.25,attention:.3,coordination:.2},
      safety:{attention:.3,problemSensitivity:.3,composure:.2,memory:.2},
      chemical:{analytical:.3,memory:.25,precision:.25,problemSensitivity:.2},
    });
    function subjectSpec(id) {
      const detail=SUBJECT_DETAILS[id];
      const category=detail?.[1] || ({bakery:"อาหาร",food_fermentation:"อาหาร",software:"ซอฟต์แวร์",metal_machining:"โลหะ",quality:"คุณภาพ",management:"สำนักงาน",commerce:"สำนักงาน",logistics:"ขนส่ง",agriculture:"เกษตร",power_electronics:"ไฟฟ้า",embedded_iot:"ไฟฟ้า",semiconductor_optics:"เซมิคอนดักเตอร์",biomed_sterile:"ชีวการแพทย์"})[id] || "พื้นฐาน";
      let model=({คณิตศาสตร์:"mathematical",ซอฟต์แวร์:"software",ไฟฟ้า:"engineering",โลหะ:"craft",อาหาร:"culinary",เกษตร:"biological",คุณภาพ:"laboratory",เซมิคอนดักเตอร์:"laboratory",ชีวการแพทย์:"laboratory",เคมี:"chemical",ขนส่ง:"transport",สำนักงาน:"management",วิศวกรรมกระบวนการ:"engineering",การผลิต:"engineering",ก่อสร้าง:"engineering",บริการ:"commercial",หุ่นยนต์:"engineering",งานวิจัย:"engineering",พื้นฐาน:"safety"})[category];
      if(["accounting","inventory_control","financial_planning","cost_accounting","taxation","budgeting","treasury","sustainability_accounting","statistics"].includes(id)) model=id==="statistics" ? "mathematical" : "accounting";
      if(["sales_negotiation","market_analysis","business_law","procurement","commerce"].includes(id)) model="commercial";
      if(["electrical_safety","food_safety","cargo_safety","waste_management","regulatory_affairs","safety"].includes(id)) model="safety";
      if(["mechanical_design","tooling","metal_machining","product_design"].includes(id)) model="engineering";
      if(id==="fermentation"||id==="shelf_life") model="biological";
      return {id,nameTh:SUBJECTS[id],category,prerequisite:SUBJECT_PREREQUISITES[id] || null,prerequisiteLevel:prerequisiteLevel(id),aptitudes:SUBJECT_APTITUDE_MODELS[model],model,
        effectTh: ({mathematical:"ความแม่นยำการคำนวณ วิเคราะห์ความไม่แน่นอน และออกแบบแบบจำลอง",accounting:"ความถูกต้องของเอกสาร การจัดซื้อ และควบคุมเงิน/สต็อก",engineering:"ความเร็วแก้ปัญหา ออกแบบและประกอบชิ้นงาน",software:"การเขียนและทดสอบระบบ ลดข้อผิดพลาดและงานแก้",craft:"ความเร็วลงมือและคุณภาพการประกอบ",culinary:"การควบคุมกระบวนการอาหารและลดของเสีย",biological:"การสังเกตชีวภาพ ควบคุมกระบวนการและความแปรปรวน",laboratory:"ความแม่นยำการทดสอบและตรวจรับคุณภาพ",commercial:"ประสิทธิภาพงานขาย/จัดซื้อและการเจรจา",management:"เตรียมโครงการ จัดทีม และถ่ายทอดความรู้",transport:"การวางแผน จัดการสินค้าและทำงานขนส่ง",safety:"เงื่อนไขอนุญาตทำงานเสี่ยงและคุณภาพกระบวนการ",chemical:"การควบคุมสูตรและกระบวนการแปรรูป"})[model]};
    }
    function subjectTalent(p,id) {
      const weights=subjectSpec(id).aptitudes;
      return Object.entries(weights).reduce((sum,[axis,weight])=>sum+(p.profile.aptitudes[axis] ?? 50)*weight,0);
    }
    function subjectPotential(p,id) {
      return Object.entries(subjectSpec(id).aptitudes).reduce((sum,[axis,weight])=>sum+(p.profile.potential?.[axis] ?? p.profile.aptitudes[axis] ?? 50)*weight,0);
    }
    function subjectPerformance(p,id) {
      const level=subjectLevel(p,id), practice=Math.min(100,Math.sqrt((p.education?.appliedMinutes?.[id] || 0)/60)*5);
      const talent=subjectTalent(p,id), fatigue=Math.max(0,40-(p.state.energy ?? 80))*.35+Math.max(0,(p.state.stress ?? 0)-60)*.25;
      return clamp(level*.65+talent*.2+practice*.15-fatigue,0,100);
    }
    function jobSubject(w,j) {
      if(j.unitId && ["assembly","rework"].includes(j.kind)) return productSubject(w,w.units[j.unitId]?.productId);
      if(j.kind==="research") return j.courseSubject || j.researchSubject || w.knowledge?.projects[j.knowledgeProjectId]?.subject || "research_methods";
      return ({qa:"quality",purchase:"procurement",invoice:"accounting",sales:"sales_negotiation",shipping:"logistics",packing:"warehouse_operations"})[j.kind] || null;
    }

    function educationFor(p) {
      if (p.education) return p.education;
      const roleSubject = { assembler: "embedded_iot", engineer: "embedded_iot", inspector: "quality", logistics: "logistics", coordinator: "management", admin: "commerce", sales: "commerce" };
      // Candidates can bring one documented speciality; a generic engineer never knows every industry.
      const specialties = ["embedded_iot", "food_fermentation", "bakery", "metal_machining", "software", "power_electronics", "biomed_sterile", "agriculture"];
      const subject = p.role === "engineer" && p.id.startsWith("candidate") ? specialties[seedHash(p.id) % specialties.length] : roleSubject[p.role] || "logistics";
      const common={safety:25,mathematics:25};
      const backgrounds={
        coordinator:{accounting:35,financial_planning:40,people_management:45,project_management:40,business_law:30},
        admin:{accounting:45,procurement:45,office_admin:45,inventory_control:35,financial_planning:35},
        sales:{sales_negotiation:45,market_analysis:40,business_law:25},
        engineer:{electrical_basics:45,circuit_design:40,smt_process:35,embedded_firmware:35,software:30,research_methods:45,product_design:40,electrical_safety:35,applied_math:40},
        assembler:{electrical_basics:35,smt_process:35,electrical_safety:30},
        inspector:{metrology:45,statistics:35,quality_documentation:45},
        logistics:{warehouse_operations:45,freight_planning:40,driving:40,cargo_safety:35,inventory_control:30}
      };
      const specialistExtras={bakery:{baking_process:40,food_safety:45,shelf_life:35},food_fermentation:{food_formulation:40,food_safety:40,fermentation:35},metal_machining:{machining:40,metallurgy:35,mechanical_design:35},software:{programming:45,version_control:40,software_testing:35,requirements_analysis:35,algorithms:35,data_structures:35},power_electronics:{power_conversion:40,electrical_safety:45,grid_integration:35},biomed_sterile:{aseptic_processing:45,regulatory_affairs:35,clinical_validation:40},agriculture:{soil_science:40,crop_propagation:40,irrigation:35}};
      const extra=p.role==="engineer"&&subject!=="embedded_iot" ? specialistExtras[subject] || {} : backgrounds[p.role] || {};
      const learned={...common,...extra,[subject]:45};
      const all=Object.keys(SUBJECTS),h=seedHash(`${p.profile.seed}:${p.id}:personal-study`);
      const interests=[all[h%all.length],all[Math.floor(h/101)%all.length]];
      // A person can bring knowledge unrelated to their current job. No subject is locked by company type.
      const hobby=interests[0],background=subjectTalent(p,hobby)>65 && h%19===0 ? 55 : 5+h%26;
      learned[hobby]=Math.max(learned[hobby] || 0,background);
      let prior=hobby,desired=background;const seen=new Set();
      while(SUBJECT_PREREQUISITES[prior] && desired>=20 && !seen.has(prior)) {seen.add(prior);desired=prerequisiteLevel(prior);prior=SUBJECT_PREREQUISITES[prior];learned[prior]=Math.max(learned[prior] || 0,desired);}
      return {subjects:learned,interests,practiceMinutes:{},course:null};
    }
    function ensureKnowledge(w) {
      if (!w.knowledge) {
        const historical = [...w.research.unlocked];
        w.knowledge = { version: 1, projects: {}, lastReviewDay: 0, decision: "เริ่มจากความรู้และงานที่ทีมถนัด", materialsConsumed: {}, historicalBlueprints: historical };
        // Existing contracts are honoured; old pooled points do not license new industries.
        w.research.unlocked = historical.filter((id) => (w.catalog.products[id]?.researchRequired || 0) === 0);
        for (const o of Object.values(w.orders)) if (!["paid", "cancelled"].includes(o.status)) o.legacyQualification = true;
        for (const [id,j] of Object.entries(w.jobs)) if (j.kind === "research") {
          for (const p of w.people) if (p.taskId === id) { p.taskId = null; p.stationId = null; }
          delete w.jobs[id];
        }
      }
      for (const p of w.people) if (!p.education) p.education = educationFor(p);
      return w.knowledge;
    }
    function productSubject(w, id) {
      const p = w.catalog.products[id];
      const family = Object.values(D.PRODUCT_FAMILIES || {}).find((f) => f.products.includes(id));
      if (family?.id === "bakery_grain") return "bakery";
      return family?.domainId || ({ tech: "embedded_iot", electronics: "embedded_iot", food: "food_fermentation", automotive: "metal_machining", biomed: "biomed_sterile", energy: "power_electronics", aerospace_robotics: "semiconductor_optics" })[p?.industry] || "embedded_iot";
    }
    function subjectLevel(p, subject) { return educationFor(p).subjects[subject] || 0; }
    function subjectReady(w, subject, level = 40) {
      return w.people.some((p) => p.employed && subjectLevel(p, subject) >= level);
    }
    const MATERIAL_SUBJECTS=Object.freeze({
      milled_rice:"food_fermentation",artisan_flour:"food_fermentation",wheat_flour:"food_fermentation",nitrogen_ammonia:"chemical_processing",npk_fertilizer:"chemical_processing",pharma_saline_water:"biomed_sterile",organic_compost:"agriculture",diesel_liter:"chemical_processing",truck_tire:"polymer_processing",refined_palm_oil:"food_fermentation",refined_sugar_syrup:"food_fermentation",raw_extract:"food_fermentation",coke_reducing_flux:"metal_machining",alumina_billet:"metal_machining",structural_steel_plate:"metal_machining",nickel_cobalt_matte:"metal_machining",metal_sheet:"metal_machining",copper_coil:"metal_machining",polymer_resin:"polymer_processing",pack_carton:"materials_science",glass_bottle:"chemical_processing",metallurgical_silicon:"semiconductor_optics",bakery_dough_butter:"bakery",probiotic_culture:"food_fermentation",foil_pouch:"polymer_processing",casing:"polymer_processing",wire_harness:"electrical_basics",aluminum_extrusion_profile:"metal_machining",heat_sink:"metal_machining",optical_lens:"optical_engineering",cathode_electrolyte:"battery_chemistry",silicon_wafer:"semiconductor_optics",driver:"embedded_iot",pcb:"embedded_iot",led:"embedded_iot",sensor:"embedded_iot",solar_cell:"power_electronics",battery:"battery_chemistry",microchip:"semiconductor_optics",power_inverter_ic:"power_electronics"
    });
    function materialSubject(w,id) { return MATERIAL_SUBJECTS[id] || "chemical_processing"; }
    function productReadiness(w, id) {
      const p = w.catalog.products[id];
      if (!p) return { ready: false, reasons: ["ไม่พบสินค้า"] };
      const subject = productSubject(w, id), reasons = [];
      const starter = (p.researchRequired || 0) === 0;
      if (!starter && w.knowledge?.projects[`product:${id}`]?.status !== "qualified") reasons.push("ยังไม่ผ่านโครงการต้นแบบและตรวจรับกระบวนการเฉพาะสินค้านี้");
      const requirements={...productRequirements(w,id),accounting:25};
      const coverage=teamCoverage(w,requirements);
      for(const r of coverage) if(!r.ready) reasons.push(`ขาดวิชา${r.nameTh} ระดับ ${r.level}`);
      if ((w.facilities?.machineCondition ?? 100) < 35) reasons.push("เครื่องจักรต้องซ่อมก่อนเดินไลน์");
      if (w.finance.cash < 100000) reasons.push("เงินหมุนเวียนต่ำกว่า 1,000 บาท");
      return { ready: !reasons.length, subject, subjectNameTh: SUBJECTS[subject], requirements, coverage, reasons };
    }
    function materialReady(w, id) {
      const rec = D.MATERIAL_RECIPES?.[id];
      if (!rec) return true;
      if (!(rec.minResearch > 0)) return teamReady(w,materialRequirements(w,id));
      return w.knowledge?.projects[`material:${id}`]?.status === "qualified" && teamReady(w, materialRequirements(w,id));
    }
    function beginKnowledgeProject(w, targetId, kind = "product") {
      const k = ensureKnowledge(w), spec = kind === "material" ? D.MATERIAL_RECIPES?.[targetId] : w.catalog.products[targetId];
      if (!spec || !["product", "material"].includes(kind)) return { ok: false, code: "unknownKnowledgeTarget" };
      const key = `${kind}:${targetId}`;
      if (k.projects[key]) return { ok: false, code: "projectExists" };
      if (Object.values(k.projects).some((p) => p.status !== "qualified")) return { ok: false, code: "researchCapacityFull", message: "ทีมวิจัยกำลังรับผิดชอบโครงการเดิม" };
      const subject = kind === "material" ? materialSubject(w, targetId) : productSubject(w, targetId);
      const complexity = Math.max(1, Math.ceil((spec.researchRequired || spec.minResearch || 20) / 80));
      k.projects[key] = { id: key, targetId, kind, subject, requirements: kind === "material" ? materialRequirements(w,targetId) : productRequirements(w,targetId), nameTh: spec.nameTh || w.catalog.materials[targetId]?.nameTh || targetId, startedDay: day(w), minDays: 14 + complexity * 7, requiredLevel: Math.min(70,35+complexity*5), requiredMinutes: (60 + complexity * 40) * 60, workMinutes: 0, spentSatang: 0, status: "literature", lastReasonTh: "เตรียมผู้เชี่ยวชาญและงบโครงการ", contributors: {} };
      k.projects[key].requirements[subject]=Math.max(k.projects[key].requirements[subject] || 0,k.projects[key].requiredLevel);
      const disciplines=researchDisciplines(k.projects[key]);
      k.projects[key].requiredMinutes=Math.ceil(k.projects[key].requiredMinutes/disciplines.length)*disciplines.length;
      k.projects[key].disciplineMinutes={};
      event(w, "researchProjectStarted", `เปิดโครงการเฉพาะทาง ${k.projects[key].nameTh}`, { targetId, subject });
      return { ok: true, projectId: key };
    }
    const OPERATIONS_SUBJECTS=Object.freeze({
      software:{software:40,programming:40,requirements_analysis:30,software_testing:35,version_control:30,algorithms:30},
      freight:{logistics:40,freight_planning:35,driving:35,cargo_safety:30},
      agriculture:{agriculture:30,soil_science:25,crop_propagation:25,irrigation:25},
      harvest:{agriculture:30,postharvest:25,safety:25},
      livestock:{animal_husbandry:35,animal_health:25,food_safety:25}
    });
    function operationReadiness(w,kind) {
      const req=OPERATIONS_SUBJECTS[kind] || {};
      const coverage=teamCoverage(w,req);
      const tools=P.businessReady(w,kind);
      return {ready:coverage.every(r=>r.ready)&&tools,coverage,reasonTh:[...coverage.filter(r=>!r.ready).map(r=>`${r.nameTh} ${r.level}`),...(!tools?["เครื่องมือธุรกิจต้องติดตั้งหรือซ่อม"]:[])].join(", ")};
    }
    function acquireTechnologyLicense(w,targetId,kind="product") {
      const spec=kind==="material" ? D.MATERIAL_RECIPES?.[targetId] : w.catalog.products[targetId];
      if(!spec || !["product","material"].includes(kind)) return {ok:false,code:"unknownKnowledgeTarget"};
      const complexity=Math.max(1,Math.ceil((spec.researchRequired || spec.minResearch || 20)/80));
      const cost=(60+complexity*40)*60*150*3;
      const k=ensureKnowledge(w),key=`${kind}:${targetId}`;
      if(k.projects[key]) return {ok:false,code:"projectExists"};
      if(w.finance.cash<computeFinancialPools(w).survivalReserveSatang+cost) return {ok:false,code:"insufficientLicenseCapital",message:"ค่าซื้อเทคโนโลยีสูงและต้องเหลือเงินดำรงกิจการ"};
      const result=beginKnowledgeProject(w,targetId,kind);
      if(!result.ok) return result;
      const project=k.projects[key],n=researchDisciplines(project).length;
      project.route="licensed_transfer";project.licenseCostSatang=cost;project.minDays=7+complexity*3;
      project.requiredMinutes=Math.ceil(project.requiredMinutes*.4/n)*n;
      post(w,"equipment",-cost,`technologyLicense:${key}`);project.spentSatang+=cost;
      w.capabilities.licenses[key]={targetId,kind,paidSatang:cost,acquiredDay:day(w),scopeTh:"สิทธิถ่ายทอดเทคโนโลยีเฉพาะเป้าหมาย ต้องทดสอบและตรวจรับก่อนผลิต"};
      event(w,"technologyLicenseAcquired",`ซื้อสิทธิถ่ายทอด ${project.nameTh}; ยังไม่ผ่านการรับรองผลิต`,{projectId:key,costSatang:cost});
      return {...result,costSatang:cost};
    }

    const poolsForTechnology=w=>computeFinancialPools(w).survivalReserveSatang;
    function reviewKnowledge(w) {
      const k = ensureKnowledge(w);
      if (k.lastReviewDay === day(w)) return;
      k.lastReviewDay = day(w);
      const active = Object.values(k.projects).find((p) => p.status !== "qualified");
      const hasFarm=Object.keys(w.agriculture?.plots || {}).length>0;
      const hasHerd=Object.keys(w.agriculture?.livestock || {}).some(id=>w.externalWorld?.assetPortfolio?.ownedAssets?.[id]);
      if((hasFarm || hasHerd) && w.policies.autoAccept && day(w)%3===0) {
        const gaps=[...(hasFarm ? [...operationReadiness(w,"agriculture").coverage,...operationReadiness(w,"harvest").coverage] : []),...(hasHerd ? operationReadiness(w,"livestock").coverage : [])].filter(r=>!r.ready);
        const learner=w.people.filter(p=>p.employed&&!p.education.course).sort((a,b)=>subjectLevel(b,"agriculture")-subjectLevel(a,"agriculture"))[0];
        if(gaps.length && learner) {const gap=gaps[0],prereq=SUBJECT_PREREQUISITES[gap.id];learner.education.course=prereq&&subjectLevel(learner,prereq)<prerequisiteLevel(gap.id) ? prereq : gap.id;learner.education.courseLevel=learner.education.course===gap.id ? gap.level : prerequisiteLevel(gap.id);}
      }
      if (active) {
        const missing=teamCoverage(w,active.requirements).filter(r=>!r.ready);
        if (missing.length) {
          for(const gap of missing.slice(0,2)) {
            const learner=w.people.filter(p=>p.employed&&!p.education.course).sort((a,b)=>subjectLevel(b,gap.id)-subjectLevel(a,gap.id))[0];
            if(learner) { const prerequisite=SUBJECT_PREREQUISITES[gap.id]; let course=gap.id,desired=gap.level; const seen=new Set(); while(SUBJECT_PREREQUISITES[course] && subjectLevel(learner,SUBJECT_PREREQUISITES[course])<prerequisiteLevel(course) && !seen.has(course)) {seen.add(course);desired=prerequisiteLevel(course);course=SUBJECT_PREREQUISITES[course];} learner.education.course=course; learner.education.courseLevel=desired; }
          }
          k.decision = `เตรียมทีมก่อนลงทุน ${active.nameTh}: ยังขาด ${missing.map(r=>`${r.nameTh} ${r.level}`).join(", ")}`;
        } else k.decision = `ทำ ${active.nameTh} ต่อ: ตรวจต้นแบบ เวลา เงิน และคุณภาพก่อนขยายธุรกิจ`;
        return;
      }
      const ceo = w.people.find((p) => p.employed && p.role === "coordinator");
      if (!ceo || !w.policies.autoAccept || w.finance.cash < computeFinancialPools(w).survivalReserveSatang + 500000) {
        k.decision = "รักษาเงินสดสำรองและทำงานเดิมก่อนเริ่มโครงการใหม่"; return;
      }
      const risk = ceo.profile.personality.riskTaking ?? 50;
      if (day(w) % (risk > 65 ? 3 : 5) !== 0) return;
      const targets = Object.values(w.catalog.products).filter((p) => p.researchRequired > 0 && !k.projects[`product:${p.id}`]);
      const score=(p)=>{
        const req=productRequirements(w,p.id), rows=teamCoverage(w,req);
        const fit=rows.filter(r=>r.ready).length/rows.length;
        const market=(w.externalWorld?.geopolitics?.sectorDemandMultipliers?.[({tech:"electronics",aerospace_robotics:"automotive"})[p.industry] || p.industry] || 1)*(w.externalWorld?.government?.demandMultiplier || 1);
        const bomCost=Object.entries(p.bom).reduce((sum,[id,q])=>sum+w.catalog.materials[id].unitCost*q,0);
        const margin=((p.priceMin || 0)-bomCost)/Math.max(1,p.priceMin || 1);
        return fit*(risk>65 ? 35 : 65)+market*15+margin*15-(p.researchRequired || 0)/40;
      };
      targets.sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));
      let target=targets[0], kind="product";
      // Vertical integration competes with buying intermediates; asset-light firms keep buying.
      if(w.externalWorld?.assetPortfolio?.supplyChainStrategy !== "asset_light" && risk>55) {
        const needed=Object.values(D.MATERIAL_RECIPES || {}).filter(r=>r.minResearch>0 && !k.projects[`material:${r.id}`] && (w.inventory.purchased[r.id] || 0)>=10).sort((a,b)=>b.minResearch-a.minResearch)[0];
        if(needed) {target=needed;kind="material";}
      }
      if (target) {
        const complexity=Math.max(1,Math.ceil((target.researchRequired || target.minResearch || 20)/80));
        const licenseCost=(60+complexity*40)*60*150*3;
        const buy=risk>65 && w.finance.cash>poolsForTechnology(w)+licenseCost*4;
        if(buy) acquireTechnologyLicense(w,target.id,kind); else beginKnowledgeProject(w,target.id,kind);
        k.decision = `เลือก${buy ? "ซื้อสิทธิถ่ายทอด" : "วิจัยเอง"} ${target.nameTh}: ประเมินความรู้ทีม ตลาด ส่วนต่างต้นทุนและเงินสำรองแล้ว; ยังไม่อนุมัติเปิดไลน์จริง`;
        recordBoardDecision(w,{ category: "research", targetId: target.id, titleTh: `ศึกษา ${target.nameTh}`, reasonTh: k.decision, resolution: "prepare_capability", executionStatus: "researching", nextReviewDay: day(w)+5 });
      }
    }

    function learnSubject(p,subject,minutes,study=false) {
      if(!subject || !p.education || minutes<=0) return;
      const ed=p.education;
      ed.practiceMinutes[subject]=(ed.practiceMinutes[subject] || 0)+minutes;
      const level=subjectLevel(p,subject), aptitude=p.profile.aptitudes;
      const talent=subjectTalent(p,subject), ceiling=Math.min(100,75+subjectPotential(p,subject)*.25);
      const prerequisite=SUBJECT_PREREQUISITES[subject], applied=ed.appliedMinutes?.[subject] || 0;
      const cap=Math.min(ceiling,applied<2400 ? 80 : applied<12000 ? 95 : 100);
      const rate=level<40 ? .25 : level<60 ? .14 : level<80 ? .06 : level<95 ? .025 : .008;
      const condition=clamp(.5+(p.state.energy ?? 80)*.006-(p.state.stress ?? 0)*.003,.25,1.15);
      const motivation=.85+(p.profile.personality.conscientiousness ?? 50)*.003;
      if(!prerequisite || subjectLevel(p,prerequisite)>=prerequisiteLevel(subject)) ed.subjects[subject]=Math.max(level,Math.min(cap,level+minutes/60*rate*(study ? 1 : .35)*(.65+(aptitude.learningSpeed ?? 50)/100+talent/200)*condition*motivation));
      if(!study) {if(!ed.appliedMinutes) ed.appliedMinutes={};ed.appliedMinutes[subject]=applied+minutes;}
    }

    function personalStudyTick(w,p) {
      const ed=p.education;
      if(!ed || tod(w)<1200 || tod(w)>=1260 || p.state.energy<35 || p.state.stress>80 || p.pay.wallet<10*TICK) return false;
      const openness=p.profile.personality.openness ?? 50;
      if(seedHash(`${w.seed}:${p.id}:study:${day(w)}`)%100>openness*.6+(p.profile.aptitudes.learningSpeed ?? 50)*.2) return false;
      const interests=ed.interests?.length ? ed.interests : [Object.keys(SUBJECTS)[seedHash(p.id)%Object.keys(SUBJECTS).length]];
      let subject=interests[day(w)%interests.length];const seen=new Set();
      while(SUBJECT_PREREQUISITES[subject] && subjectLevel(p,SUBJECT_PREREQUISITES[subject])<prerequisiteLevel(subject) && !seen.has(subject)) {seen.add(subject);subject=SUBJECT_PREREQUISITES[subject];}
      p.pay.wallet-=10*TICK;p.pay.outsideSpending+=10*TICK;
      ed.personalStudyMinutes=(ed.personalStudyMinutes || 0)+TICK;ed.personalStudyCostSatang=(ed.personalStudyCostSatang || 0)+10*TICK;
      learnSubject(p,subject,TICK,true);
      p.activity="selfStudy";p.intent={code:"personalStudy",reasons:[subject]};
      p.state=H.tickState(p.profile,p.state,{activity:"learn",minutes:TICK});
      return true;
    }

    function knowledgeWork(w, p, j) {
      if (!p.employed) return;
      const k = ensureKnowledge(w), project = k.projects[j.knowledgeProjectId || j.validationProjectId];
      if (j.validationProjectId) {
        if (!project || project.status === "qualified" || p.role !== "inspector" || subjectLevel(p,"quality") < 40 || !subjectReady(w,project.subject,project.requiredLevel) || !teamReady(w,project.requirements)) return;
        if (day(w) - project.startedDay < project.minDays || project.workMinutes < project.requiredMinutes || !project.prototypeConsumed) return;
        project.qaMinutes = (project.qaMinutes || 0) + Math.min(j.elapsedMinutes || 0,120);
        project.reviewerId = p.id;
        if (project.qaMinutes >= 240 && !project.contributors[p.id]) {
          project.validationAttempts=(project.validationAttempts || 0)+1;
          const quality=project.workMinutes>0 ? (project.qualitySum || project.workMinutes*50)/project.workMinutes : 0;
          const chance=clamp(.45+(quality+subjectPerformance(p,"quality"))*.003, .35,.95);
          if(random(w)>chance) {
            project.qaMinutes=0; project.workMinutes=0;
            for(const subject of Object.keys(project.disciplineMinutes || {})) {project.disciplineMinutes[subject]=Math.floor(project.disciplineMinutes[subject]*.8);project.workMinutes+=project.disciplineMinutes[subject];} project.prototypeConsumed=false; project.status="prototype";
            project.qualitySum=(project.qualitySum || 0)*.8;
            project.lastReasonTh="ต้นแบบยังไม่ผ่านตรวจรับ ต้องแก้ไขและใช้วัตถุดิบทดสอบรอบใหม่";
            event(w,"researchValidationFailed",`${project.nameTh}: ส่งกลับแก้ต้นแบบ`,{projectId:project.id});
            return;
          }
          project.status = "qualified"; project.qualifiedDay = day(w); project.lastReasonTh = "ผ่านต้นแบบและการตรวจรับโดยฝ่ายคุณภาพ";
          if (project.kind === "product" && !w.research.unlocked.includes(project.targetId)) w.research.unlocked.push(project.targetId);
          event(w,"productQualified",`ผ่านการรับรองกระบวนการ ${project.nameTh}`,{projectId:project.id});
        }
        return;
      }
      if (project && project.workMinutes >= project.requiredMinutes) return;
      if (project && project.workMinutes >= project.requiredMinutes * 0.3 && !project.prototypeConsumed) {
        const inputs = project.kind === "product" ? w.catalog.products[project.targetId].bom : D.MATERIAL_RECIPES[project.targetId].inputs;
        if (Object.entries(inputs || {}).some(([id,q]) => (w.inventory.materials[id] - w.inventory.reserved[id]) < q)) {
          project.lastReasonTh = "รอวัตถุดิบต้นแบบจากฝ่ายจัดซื้อ"; return;
        }
        for (const [id,q] of Object.entries(inputs || {})) {
          w.inventory.materials[id] -= q; w.inventory.consumed[id] += q;
          k.materialsConsumed[id] = (k.materialsConsumed[id] || 0) + q;
        }
        project.prototypeConsumed = true;
      }
      const subject = j.courseSubject || j.researchSubject || project?.subject;
      if (!subject || (!j.courseSubject && (!project || subjectLevel(p,subject) < (project.requirements[subject] || 40) || !teamReady(w,project.requirements)))) return;
      const ed = p.education;
      if (ed.workDay !== day(w)) { ed.workDay = day(w); ed.dailyMinutes = 0; }
      const quota=project ? project.requiredMinutes/researchDisciplines(project).length : Infinity;
      const remaining=project ? Math.max(0,quota-(project.disciplineMinutes?.[subject] || 0)) : Infinity;
      const minutes = Math.max(0, Math.min(j.elapsedMinutes || 60, 120, 480 - (ed.dailyMinutes || 0),remaining));
      const cost = Math.ceil(minutes * (j.courseSubject ? 80 : 150));
      if (!minutes || w.finance.cash < computeFinancialPools(w).survivalReserveSatang + cost) {
        if (project) project.lastReasonTh = "พักโครงการ: รักษาเงินสดสำรอง/ครบชั่วโมงทำงานวันนี้";
        return;
      }
      post(w, "equipment", -cost, `knowledge:${j.id}`);
      ed.dailyMinutes = (ed.dailyMinutes || 0) + minutes;
      learnSubject(p,subject,minutes,Boolean(j.courseSubject));
      if (j.courseSubject) { if (ed.subjects[subject] >= (ed.courseLevel || 40)) ed.course = null; return; }
      if(!project.disciplineMinutes) project.disciplineMinutes={};
      project.disciplineMinutes[subject]=(project.disciplineMinutes[subject] || 0)+minutes;
      project.qualitySum=(project.qualitySum || 0)+minutes*subjectPerformance(p,subject);
      project.workMinutes = Math.min(project.requiredMinutes, project.workMinutes + minutes);
      project.spentSatang += cost;
      project.contributors[p.id] = (project.contributors[p.id] || 0) + minutes;
      const pct = project.workMinutes/project.requiredMinutes;
      project.status = pct < 0.3 ? "literature" : pct < 0.75 ? "prototype" : "validation";
      project.lastReasonTh = `สะสมชั่วโมงงานจริง ${Math.floor(project.workMinutes/60)}/${project.requiredMinutes/60}; ต้องใช้เวลาอย่างน้อย ${project.minDays} วัน`;
      if (pct >= 1) project.lastReasonTh = day(w)-project.startedDay < project.minDays ? "รอสังเกตผลการทดสอบตามระยะเวลา" : "รอผู้ตรวจคุณภาพคนละคนกับผู้ทำต้นแบบ";
    }
    function companyKnowledgeView(w) {
      return { subjects: SUBJECTS, tiers: [{level:0,nameTh:"ยังไม่เคยเรียน"},{level:1,nameTh:"เริ่มเรียน"},{level:20,nameTh:"พื้นฐาน"},{level:40,nameTh:"ปฏิบัติงานได้"},{level:60,nameTh:"ขั้นสูง"},{level:80,nameTh:"ผู้เชี่ยวชาญ"},{level:95,nameTh:"เชี่ยวชาญสูง"}], subjectDetails: SUBJECT_DETAILS, subjectSpecs: Object.keys(SUBJECTS).map(subjectSpec), prerequisites: SUBJECT_PREREQUISITES, operationReadiness: Object.keys(OPERATIONS_SUBJECTS).map(id=>({id,...operationReadiness(w,id)})), serviceReadiness: Object.entries(SERVICE_SUBJECTS).map(([id,req])=>({id,nameTh:D.INDUSTRIAL_SERVICES[id].nameTh,ready:teamReady(w,req),coverage:teamCoverage(w,req)})), projects: Object.values(w.knowledge?.projects || {}), decision: w.knowledge?.decision || "ยังไม่มีแผนใหม่", people: w.people.filter(p=>p.employed).map(p=>({id:p.id,name:p.name,role:p.role,education:educationFor(p),subjectInsights:Object.keys(educationFor(p).subjects).map(id=>({id,talent:subjectTalent(p,id),performance:subjectPerformance(p,id),ceiling:Math.min(100,75+subjectPotential(p,id)*.25)}))})), products: Object.values(w.catalog.products).map(p=>({id:p.id,nameTh:p.nameTh,...productReadiness(w,p.id)})) };
    }

    function freshCapabilities() {
      const domains = {};
      for (const [k, spec] of Object.entries(D.CAPABILITY_DOMAINS || {})) {
        domains[k] = spec.baseLevel || 20;
      }
      return {
        domains,
        unlockedProducts: {},
        unlockedChains: {},
        licenses: {},
      };
    }

    function freshExecutiveBoard() {
      return {
        lastReviewDay: 0,
        committedBudgetSatang: 0,
        paidCapitalTotalSatang: 0,
        reservations: {},
        topicCooldowns: {},
        budgetPools: {
          survivalReserveSatang: 0,
          debtServiceReserveSatang: 0,
          maintenancePoolSatang: 0,
          capabilityPoolSatang: 0,
          expansionPoolSatang: 0,
          uncommittedCashSatang: 0,
        },
        decisionLedger: [],
      };
    }

    function freshCompanyProgression() {
      const stages = D.SME_GROWTH_STAGES || [];
      const first = stages[0] || {
        id: "stage_1_micro_workshop",
        order: 1,
        badgeTh: "🌱 ระยะที่ 1/6",
        nameTh: "ห้องแถวและเวิร์กช็อปตั้งต้น (Micro SME Workshop)",
        creditLimitMult: 1.0,
        b2bTrustBonus: 0,
        summaryTh: "กิจการขนาดเล็กช่วงก่อตั้ง พึ่งพาการหมุนเงินสดรายวันจากออเดอร์ล็อตเล็ก",
      };
      return {
        currentStageId: first.id,
        currentStageOrder: first.order,
        currentStageBadgeTh: first.badgeTh,
        currentStageNameTh: first.nameTh,
        currentStageSummaryTh: first.summaryTh,
        creditLimitMultiplier: first.creditLimitMult || 1.0,
        b2bTrustBonus: first.b2bTrustBonus || 0,
        achievedMilestones: {},
        growthJournal: [
          {
            day: 1,
            type: "stage",
            badgeTh: first.badgeTh,
            titleTh: `เริ่มต้นกิจการในระดับ "${first.nameTh}"`,
            detailTh: first.summaryTh,
          },
        ],
      };
    }

    function freshUtilities() {
      return {
        dailyKwh: 0,
        solarOffsetKwh: 0,
        netKwh: 0,
        dailyWaterM3: 0,
        waterOffsetM3: 0,
        netWaterM3: 0,
        accruedElectricSatang: 0,
        accruedWaterSatang: 0,
        totalPaidSatang: 0,
        totalSavedBySolarWaterSatang: 0,
        unpaidCycles: 0,
        brownoutActive: false,
        lastBilledDay: 0,
        lastSummaryTh: "ระบบมิเตอร์ไฟฟ้าและน้ำประปาอุตสาหกรรมพร้อมบันทึกหน่วยใช้งานจริง",
        history: [],
      };
    }

    function freshCulture() {
      return {
        cohesionScore: 68,
        recentGossip: [],
        clubActivities: [],
        townhallAwards: [],
        alumniSpinoffs: [],
        parkedVehicles: [],
      };
    }

    function freshGeopolitics(seedStr = "company") {
      const nations = {};
      for (const [nid, nSpec] of Object.entries(D.GLOBAL_NATIONS || {})) {
        const defReg = (nSpec.regimes || []).find((r) => r.id === nSpec.defaultRegimeId) || (nSpec.regimes || [])[0];
        nations[nid] = {
          id: nid,
          flag: nSpec.flag,
          nameTh: nSpec.nameTh,
          shortNameTh: nSpec.shortNameTh,
          bloc: nSpec.bloc,
          activeRegimeId: defReg ? defReg.id : "default",
          activeRegimeNameTh: defReg ? defReg.nameTh : nSpec.nameTh,
          leaderStyleTh: defReg ? defReg.leaderStyleTh : "-",
          tariffModPct: defReg ? defReg.tariffModPct : 0,
          fxModPct: defReg ? defReg.fxModPct : 0,
          materialMods: defReg ? { ...(defReg.materialMods || {}) } : {},
          sectorDemandMods: defReg ? { ...(defReg.sectorDemandMods || {}) } : {},
          summaryTh: defReg ? defReg.summaryTh : "-",
          lastChangedDay: 1,
          regimeChangeCount: 0,
        };
      }
      const tradeCorridors = {};
      for (const [cid, cSpec] of Object.entries(D.TRADE_CORRIDORS || {})) {
        tradeCorridors[cid] = {
          id: cid,
          nameTh: cSpec.nameTh,
          icon: cSpec.icon,
          nations: [...(cSpec.nations || [])],
          primarySectors: [...(cSpec.primarySectors || [])],
          keyMaterials: [...(cSpec.keyMaterials || [])],
          status: "open",
          tariffPct: cSpec.baseTariffPct || 0,
          leadTimeMod: cSpec.baseLeadTimeMod || 1.0,
          demandMod: 1.0,
          summaryTh: cSpec.descTh,
        };
      }
      const firstEv = D.GEOPOLITICAL_EVENTS?.asean_jp_eu_free_trade_pact || Object.values(D.GEOPOLITICAL_EVENTS || {})[0];
      return {
        nations,
        tradeCorridors,
        activeEvent: firstEv
          ? {
              ...clone(firstEv),
              startedDay: 1,
              expiresDay: 6,
            }
          : null,
        eventHistory: [],
        fxRateBahtPerUsd: 34.5,
        globalOilIndex: 1.0,
        globalFreightRateMultiplier: 1.0,
        globalLeadTimeMultiplier: 1.0,
        globalTariffIndexPct: 0,
        materialPriceMultipliers: {},
        materialSpotPrices: {},
        sectorDemandMultipliers: {
          food: 1.05,
          electronics: 1.05,
          automotive: 1.05,
          energy: 1.05,
          biomed: 1.05,
          software: 1.05,
          fleet: 1.05,
          service: 1.05,
        },
        customEventTriggered: false,
        applySpotPriceToPO: false,
        totalRegimeShifts: 0,
        totalGlobalEvents: 1,
      };
    }

    function freshExternalWorld(seedStr = "company") {
      const ext = D.EXTERNAL_WORLD_DEFAULTS || {
        clients: [],
        suppliers: [],
        competitors: [],
        governmentPolicies: [],
        stockIndices: [],
        ceoDirectives: [],
      };
      const clients = {};
      for (const c of ext.clients) {
        clients[c.id] = {
          ...clone(c),
          trustScore: c.baseTrust || 50,
          totalContracts: 0,
          completedContracts: 0,
          totalRevenueSatang: 0,
          lastDealDay: 0,
        };
      }
      const suppliers = {};
      for (const s of ext.suppliers) {
        suppliers[s.id] = {
          ...clone(s),
          trustScore: s.baseTrust || 50,
          totalOrders: 0,
          totalDeliveries: 0,
          totalSpendSatang: 0,
          tierTh: s.baseTrust >= 60 ? "คู่ค้าชั้นดี (VIP)" : "คู่ค้ามาตรฐาน (Regular)",
        };
      }
      const competitors = {};
      for (const comp of ext.competitors) {
        competitors[comp.id] = {
          ...clone(comp),
          poachingAttempts: 0,
        };
      }
      const firstPolicy = ext.governmentPolicies[0] || {
        id: "boi_smart_industry",
        nameTh: "บัตรส่งเสริมการลงทุน BOI อุตสาหกรรมเป้าหมาย",
        summaryTh: "ลดภาระภาษีนิติบุคคลและหนุนการวิจัย R&D",
        corporateTaxPct: 10,
        demandMultiplier: 1.08,
        greenBonus: 0,
      };
      const indices = {};
      for (const idx of ext.stockIndices) {
        indices[idx.id] = {
          id: idx.id,
          symbol: idx.symbol,
          nameTh: idx.nameTh,
          value: idx.baseValue,
          changePct: 0,
          history: [idx.baseValue],
        };
      }
      const firstDirective = ext.ceoDirectives[0] || {
        id: "sales_blitz",
        nameTh: "ลุยยอดขายและขยายฐานคู่ค้า B2B",
        descTh: "เน้นเจรจาปิดดีล B2B ราคาดีและเร่งส่งมอบออเดอร์ลูกค้า",
      };
      const corporations = {};
      for (const corp of ext.corporations || []) {
        corporations[corp.id] = {
          ...clone(corp),
          trustScore: corp.baseTrust || 50,
          b2bPurchasesCount: 0,
          b2bPurchasesSatang: 0,
          interCompanyDealsCount: 0,
          lastActionDay: 1,
          lastActionTh: corp.strategyTh || "ดำเนินธุรกิจในตลาดอุตสาหกรรม",
        };
      }
      const initialFeed = [
        {
          id: "eco-init-1",
          day: 1,
          type: "INTER_CORP_SUPPLY",
          badgeTh: "🤝 การค้าระหว่างบริษัทภายนอก",
          actorCorpId: "siam_metal",
          targetCorpId: "asia_autoparts",
          headlineTh: "บจก. สยามเมทัล ทำสัญญาป้อนแผ่นโลหะและขดลวดทองแดงล็อตใหญ่ให้ บจก. เอเชีย ออโต้พาร์ท เพื่อเร่งสายพาน EV",
          impactTh: "ความต้องการแผ่นโลหะ (T1), ขดลวดทองแดง (T1) และชุดสายไฟ (T2) ในตลาด B2B เพิ่มสูงขึ้น",
        },
        {
          id: "eco-init-2",
          day: 1,
          type: "PRICE_WAR",
          badgeTh: "⚔️ สงครามแย่งตลาดคู่แข่ง",
          actorCorpId: "titan_elec",
          targetCorpId: "siam_tech",
          headlineTh: "บมจ. ไททัน อิเล็กทรอนิกส์ เปิดศึกตัดราคาชิ้นส่วนสมาร์ตเทคแข่งกับ บมจ. สยามเทค โฮลดิ้งส์",
          impactTh: "สยามเทคต้องการซัพพลายเออร์แผ่นเวเฟอร์ (T2), แผงวงจร PCB (T3) และชิป (T3) ในประเทศเพื่อลดต้นทุน",
        },
        {
          id: "eco-init-3",
          day: 1,
          type: "STRATEGIC_JV",
          badgeTh: "🌾 พันธมิตรห่วงโซ่อาหาร",
          actorCorpId: "cp_health",
          targetCorpId: "thai_organic",
          headlineTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ จับมือ สหกรณ์เกษตรอินทรีย์ รับซื้อแป้งโม่ละเอียดและโดว์เนยสดป้อนเชนเบเกอรี่",
          impactTh: "เปิดตลาดรับซื้อแป้งโม่ละเอียด (T1), น้ำมันปาล์มบริสุทธิ์ (T1) และโดว์เพสตรี้ (T2) จากโรงงานที่มีผลผลิตเหลือใช้",
        },
      ];
      const initialDemands = [
        {
          id: "b2b-dem-1",
          day: 1,
          buyerCorpId: "cp_health",
          buyerNameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ โกลบอล",
          materialId: "artisan_flour",
          materialNameTh: "แป้งข้าวหอมและแป้งสาลีโม่ละเอียด (แปรรูป T1)",
          tier: 1,
          unitPriceSatang: 6000,
          recommendedQty: 4,
          reasonTh: "ต้องการแป้งโม่ละเอียดป้อนสายพานเบเกอรี่และโปรตีนเกษตร",
        },
        {
          id: "b2b-dem-2",
          day: 1,
          buyerCorpId: "siam_naturals",
          buyerNameTh: "บมจ. สยามเนเชอรัล ฟู้ดส์ แอนด์ เบเกอรี่",
          materialId: "bakery_dough_butter",
          materialNameTh: "โดว์ขนมปังหมักยีสต์และเนยเพสตรี้พร้อมอบ (กลางน้ำ T2)",
          tier: 2,
          unitPriceSatang: 8100,
          recommendedQty: 4,
          reasonTh: "สั่งซื้อโดว์เนยสดแช่แข็งไปอบครัวซองต์ส่งซูเปอร์มาร์เก็ต",
        },
        {
          id: "b2b-dem-3",
          day: 1,
          buyerCorpId: "shenzhen_semi",
          buyerNameTh: "บจก. เซินเจิ้น เซมิคอนดักเตอร์ แอนด์ ฟาวน์ดรี",
          materialId: "metallurgical_silicon",
          materialNameTh: "แท่งซิลิคอนบริสุทธิ์เกรดโลหะวิทยา MG-Si (แปรรูป T1)",
          tier: 1,
          unitPriceSatang: 7600,
          recommendedQty: 4,
          reasonTh: "รับซื้อแท่งซิลิคอน MG-Si ที่ถลุงจากทรายควอตซ์ไปดึงผลึกเวเฟอร์",
        },
        {
          id: "b2b-dem-4",
          day: 1,
          buyerCorpId: "tokyo_elec",
          buyerNameTh: "บจก. โตเกียว อิเล็กทรอนิกส์ แอนด์ โรโบติกส์ (ประเทศไทย)",
          materialId: "silicon_wafer",
          materialNameTh: "แผ่นซิลิคอนเวเฟอร์เกรดเซมิคอนดักเตอร์ (กลางน้ำ T2)",
          tier: 2,
          unitPriceSatang: 11500,
          recommendedQty: 4,
          reasonTh: "รับซื้อแผ่นซิลิคอนเวเฟอร์ความบริสุทธิ์สูงสำหรับสายพานเซนเซอร์ญี่ปุ่น",
        },
        {
          id: "b2b-dem-5",
          day: 1,
          buyerCorpId: "siam_aero_robotics",
          buyerNameTh: "บจก. สยาม แอโรสเปซ แอนด์ ออโตโนมัส โรโบติกส์",
          materialId: "microchip",
          materialNameTh: "ชิปไมโครโพรเซสเซอร์ระดับนาโน (ชิ้นส่วน T3)",
          tier: 3,
          unitPriceSatang: 13200,
          recommendedQty: 3,
          reasonTh: "รับซื้อชิปประมวลผลที่ผลิตในไทยไปประกอบโดรนขนส่งอัตโนมัติ",
        },
        {
          id: "b2b-dem-6",
          day: 1,
          buyerCorpId: "green_power",
          buyerNameTh: "บจก. กรีนพาวเวอร์ โซลูชั่นส์ เอเชีย",
          materialId: "battery",
          materialNameTh: "โมดูลแบตเตอรี่ลิเธียมความปลอดภัยสูง (ชิ้นส่วน T3)",
          tier: 3,
          unitPriceSatang: 14200,
          recommendedQty: 3,
          reasonTh: "รับซื้อเซลล์แบตเตอรี่ลิเธียมป้อนโครงการสมาร์ตกริด",
        },
      ];
      return {
        corporations,
        ecosystemFeed: initialFeed,
        geopolitics: freshGeopolitics(seedStr),
        worldChronicle: [
          {
            id: "wchron-init-1",
            day: 1,
            at: 540,
            category: "INTL_COOPERATION",
            badgeTh: "🤝 สนธิสัญญาความร่วมมือระหว่างประเทศ",
            regionTh: "อาเซียน–ญี่ปุ่น–ยุโรป",
            headlineTh: "เปิดระเบียงการค้าเสรีอาเซียน–ญี่ปุ่น–อียู เชื่อมศุลกากรอิเล็กทรอนิกส์และหนุนซัพพลายเชนอุตสาหกรรม",
            meaningTh: "ลดเวลาขนส่งวัตถุดิบข้ามชาติลง 15% และกระตุ้นคำสั่งซื้อสินค้าอุตสาหกรรมจากฐานการผลิตในไทย",
            priceImpactSummaryTh: "ดีมานด์ส่งออก +10~15% • เวลานำเข้าวัตถุดิบ -15%",
            isMajor: true,
          },
        ],
        b2bMaterialDemands: initialDemands,
        b2bMaterialSalesHistory: [],
        totalB2BMaterialSalesUnits: 0,
        totalB2BMaterialRevenueSatang: 0,
        clients,
        suppliers,
        competitors,
        ourMarketSharePct: 2.0,
        government: {
          activePolicyId: firstPolicy.id,
          nameTh: firstPolicy.nameTh,
          summaryTh: firstPolicy.summaryTh,
          corporateTaxPct: firstPolicy.corporateTaxPct,
          demandMultiplier: firstPolicy.demandMultiplier,
          greenBonus: firstPolicy.greenBonus,
          lastUpdatedDay: 1,
        },
        stockMarket: {
          indices,
          companyValuation: 18000000,
          sharePriceBaht: 18.0,
          creditRating: "BBB+",
          ipoReadinessPct: 22,
        },
        ceoDirective: {
          id: firstDirective.id,
          nameTh: firstDirective.nameTh,
          descTh: firstDirective.descTh,
          updatedDay: 1,
          ceoName: "ธีร์",
        },
        assetPortfolio: {
          supplyChainStrategy: "balanced_hybrid",
          ownedAssets: {},
          chainSettings: Object.fromEntries(
            Object.keys(D.PRODUCTION_CHAINS || {}).map((cid) => [
              cid,
              {
                id: cid,
                enabled: true,
                batchesCompleted: 0,
                unitsRefined: 0,
                costSavedSatang: 0,
              },
            ]),
          ),
          marketPriceIndex: Object.fromEntries(
            Object.keys(D.createCatalog().materials || {}).map((mid) => [mid, 1.0]),
          ),
          harvestHistory: [],
          chainHistory: [],
          totalHarvestedUnits: 0,
          totalRefinedUnits: 0,
          totalChainSavingsSatang: 0,
          totalAssetDividendsSatang: 0,
        },
      };
    }

    const facilityLevel = (w, key) => w.facilities?.levels?.[key] || 1;
    const facilityForJob = (kind) => ({
      sales: "hq", purchase: "hq", invoice: "hq", research: "rnd",
      assembly: "factory", rework: "factory", qa: "factory",
      packing: "warehouse", shipping: "warehouse",
    })[kind];
    const clone = (o) => JSON.parse(JSON.stringify(o)),
      clamp = (n, a, b) => Math.max(a, Math.min(b, n)),
      round = (n) => Math.round(n * 100) / 100;
    const now = (w) => w.clock.absoluteMinute,
      day = (w) => Math.floor(now(w) / 1440) + 1,
      tod = (w) => now(w) % 1440;
    const id = (w, prefix) => prefix + "-" + ++w.sequence;
    const own = (obj, key) =>
      obj && typeof key === "string" && Object.hasOwn(obj, key)
        ? obj[key]
        : null;
    const int = (n, min = 0, max = Number.MAX_SAFE_INTEGER) =>
      Number.isSafeInteger(n) && n >= min && n <= max;
    function seedHash(seed) {
      let h = 2166136261;
      for (const ch of String(seed)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0 || 0x9e3779b9;
    }
    function random(w) {
      let x = w.rng.state;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      w.rng.state = x >>> 0;
      w.rng.draws++;
      return w.rng.state / 4294967296;
    }
    function event(w, code, message, details = {}) {
      w.events.push({
        id: id(w, "event"),
        at: now(w),
        code,
        message,
        details: clone(details),
      });
      if (w.events.length > 160) w.events.shift();
    }
    function post(w, kind, delta, reference) {
      return E.post(w.finance, {
        id: id(w, "tx"),
        kind,
        delta,
        at: now(w),
        reference,
      });
    }

    function ensurePersonExtensions(w, p) {
      if (!p) return;
      if (!p.identity || typeof p.identity !== "object") {
        p.identity = D.createIdentity
          ? D.createIdentity(w ? w.seed : "company", p.id, p.name, p.role)
          : {
              nationality: "TH",
              nationalityTh: "ไทย",
              flag: "🇹🇭",
              codeTh: "TH · ไทย",
              gender: "M",
              genderTh: "ชาย",
              genderSymbol: "♂",
              age: 26,
              firstName: p.name,
              lastName: "วงศ์สุวรรณ",
              nickname: p.name,
              fullName: p.name,
              displayName: p.name,
              educationTh: "ปวส. เทคนิคอุตสาหกรรม",
              hometownTh: "นนทบุรี",
            };
      }
      const deptSpec = D.ROLE_DEPARTMENTS?.[p.role] || {
        divisionId: ["sales", "admin", "engineer"].includes(p.role)
          ? "office"
          : p.role === "coordinator"
            ? "executive"
            : "factory",
        divisionNameTh: "ฝ่ายปฏิบัติการ",
        departmentTh: "ฝ่ายปฏิบัติการ",
        coreDutiesTh: "ปฏิบัติงานตามสายวิชาชีพ",
      };
      const constructedPlots = w?.facilities?.constructedPlots || [];
      if (!p.career || typeof p.career !== "object") {
        const step = D.getCareerStep ? D.getCareerStep(p.role, 1) : { level: 1, gradeCode: "G1", titleTh: p.role, badge: "Lv.1" };
        const orgUnit = D.resolveOrgAssignment
          ? D.resolveOrgAssignment(p.role, 1, p.id, constructedPlots)
          : null;
        p.career = {
          level: 1,
          gradeCode: step.gradeCode || "G1",
          titleTh: step.titleTh,
          badge: step.badge,
          division: deptSpec.divisionId,
          divisionNameTh: deptSpec.divisionNameTh,
          departmentTh: orgUnit ? orgUnit.departmentNameTh : deptSpec.departmentTh,
          sectionTh: orgUnit ? orgUnit.sectionNameTh : deptSpec.departmentTh,
          groupTh: orgUnit ? orgUnit.groupNameTh : "กลุ่มปฏิบัติการหลัก",
          tierNameTh: orgUnit ? orgUnit.tierNameTh : "พนักงานปฏิบัติการระดับต้น",
          orgPathTh: orgUnit ? orgUnit.orgPathTh : deptSpec.departmentTh,
          orgUnit,
          dutyTh: step.dutyTh || deptSpec.coreDutiesTh,
          isCEO: false,
          promotions: 0,
          tasksCompleted: 0,
          dealsNegotiated: 0,
          poIssued: 0,
          bonusTotal: 0,
          lastBonusAmount: 0,
          lastBonusDay: 0,
          lastPromotionDay: 0,
          mentorId: null,
          mentorName: null,
          menteesHelped: 0,
          satisfaction: 76,
          kpiScore: 58,
          history: [],
        };
      } else {
        const lv = p.career.level || 1;
        const step = D.getCareerStep ? D.getCareerStep(p.role, lv) : null;
        const orgUnit = D.resolveOrgAssignment
          ? D.resolveOrgAssignment(p.role, lv, p.id, constructedPlots)
          : null;
        if (!p.career.division) p.career.division = deptSpec.divisionId;
        if (!p.career.divisionNameTh) p.career.divisionNameTh = deptSpec.divisionNameTh;
        if (!p.career.departmentTh) p.career.departmentTh = orgUnit ? orgUnit.departmentNameTh : deptSpec.departmentTh;
        if (!p.career.sectionTh && orgUnit) p.career.sectionTh = orgUnit.sectionNameTh;
        if (!p.career.groupTh && orgUnit) p.career.groupTh = orgUnit.groupNameTh;
        if (!p.career.gradeCode) p.career.gradeCode = step?.gradeCode || orgUnit?.gradeCode || ("G" + lv);
        if (!p.career.tierNameTh && orgUnit) p.career.tierNameTh = orgUnit.tierNameTh;
        if (!p.career.orgPathTh && orgUnit) p.career.orgPathTh = orgUnit.orgPathTh;
        if (!p.career.orgUnit && orgUnit) p.career.orgUnit = orgUnit;
        if (!p.career.dutyTh) {
          p.career.dutyTh = step?.dutyTh || deptSpec.coreDutiesTh;
        }
      }
    }
    function updateSatisfactionAndKpi(w, p, currentDay) {
      ensurePersonExtensions(w, p);
      const roleSkill = w.catalog.roles[p.role]?.skill || "assembly";
      const skillLv = p.skills[roleSkill]?.level || 40;
      const expectedWage = Math.max(
        w.catalog.rules.minimumWage,
        26000 + skillLv * 180 + (p.career.level - 1) * 3500,
      );
      const wageFairness = clamp(((p.pay.dailyWage - expectedWage) / Math.max(1, expectedWage)) * 45, -15, 16);
      const unpaidPenalty = p.pay.overdueSince !== null ? 18 : 0;
      const bonusGlow = p.career.lastBonusDay > 0 && currentDay - p.career.lastBonusDay <= 7 ? 8 : 0;
      const promoGlow = p.career.lastPromotionDay > 0 && currentDay - p.career.lastPromotionDay <= 10 ? 7 : 0;
      const rawSat =
        p.state.morale * 0.42 +
        p.state.fulfillment * 0.26 +
        p.state.energy * 0.12 -
        p.state.stress * 0.16 -
        p.state.burnout * 0.22 +
        16 +
        wageFairness -
        unpaidPenalty +
        bonusGlow +
        promoGlow;
      p.career.satisfaction = Math.round(clamp(rawSat, 5, 100) * 10) / 10;

      const taskScore = Math.min(34, (p.career.tasksCompleted || 0) * 2.8);
      const workScore = Math.min(18, ((p.experience.workMinutes || 0) / Math.max(180, currentDay * 240)) * 18);
      const helpScore = Math.min(10, ((p.experience.helpMinutes || 0) / 25) * 3 + (p.career.menteesHelped || 0) * 1.2);
      const rawKpi = skillLv * 0.45 + taskScore + workScore + helpScore + (p.state.morale - 50) * 0.1;
      p.career.kpiScore = Math.round(clamp(rawKpi, 10, 100) * 10) / 10;
    }

    function createPerson(w, pid, name, role, wage) {
      const profile = H.createProfile(w.seed, pid),
        skills = {};
      for (const spec of Object.values(w.catalog.skills))
        skills[spec.id] = H.createSkill(profile, spec);
      const primary = w.catalog.roles[role].skill;
      skills[primary].level = Math.min(
        H.skillCap(profile, w.catalog.skills[primary]),
        skills[primary].level + 23,
      );
      const identity = D.createIdentity ? D.createIdentity(w.seed, pid, name, role) : null;
      const step = D.getCareerStep ? D.getCareerStep(role, 1) : { level: 1, titleTh: role, badge: "Lv.1" };
      const deptSpec = D.ROLE_DEPARTMENTS?.[role] || {
        divisionId: ["sales", "admin", "engineer"].includes(role)
          ? "office"
          : role === "coordinator"
            ? "executive"
            : "factory",
        divisionNameTh: "ฝ่ายปฏิบัติการ",
        departmentTh: "ฝ่ายปฏิบัติการ",
        coreDutiesTh: "ปฏิบัติงานตามสายวิชาชีพ",
      };
      const isFirstCEO =
        role === "coordinator" &&
        !(w.people && w.people.some((other) => other.employed && other.role === "coordinator" && other.career?.isCEO));
      const person = {
        id: pid,
        name,
        role,
        profile,
        skills,
        state: H.createState(profile),
        identity,
        career: {
          level: isFirstCEO ? 4 : 1,
          titleTh: isFirstCEO ? "ประธานเจ้าหน้าที่บริหาร (CEO)" : step.titleTh,
          badge: isFirstCEO ? "CEO" : step.badge,
          division: deptSpec.divisionId,
          divisionNameTh: deptSpec.divisionNameTh,
          departmentTh: deptSpec.departmentTh,
          dutyTh: isFirstCEO
            ? "ผู้นำสูงสุดขององค์กร กำหนดกลยุทธ์ อนุมัติงบลงทุน และตัดสินใจเลื่อนตำแหน่งผู้บริหาร"
            : step.dutyTh || deptSpec.coreDutiesTh,
          isCEO: isFirstCEO,
          promotions: 0,
          tasksCompleted: 0,
          dealsNegotiated: 0,
          poIssued: 0,
          bonusTotal: 0,
          lastBonusAmount: 0,
          lastBonusDay: 0,
          lastPromotionDay: 0,
          mentorId: null,
          mentorName: null,
          menteesHelped: 0,
          satisfaction: 76,
          kpiScore: 58,
          history: [],
        },
        employed: true,
        hiredAt: now(w),
        leftAt: null,
        position: { ...w.layout.entrance },
        previousPosition: { ...w.layout.entrance },
        path: [],
        activity: "offDuty",
        intent: { code: "offDuty", reasons: [] },
        decision: null,
        taskId: null,
        stationId: null,
        breakUntil: 0,
        breakKind: null,
        atWork: false,
        ot: { day: 0, decision: "none", maxMinutes: 0 },
        pay: {
          dailyWage: wage,
          dayWage: wage,
          overdueSince: null,
          dueBase: 0,
          dueOT: 0,
          totalEarned: 0,
          totalPaid: 0,
          wallet: 0,
          outsideSpending: 0,
        },
        experience: { workMinutes: 0, helpMinutes: 0 },
        dayStats: { workMinutes: 0, otMinutes: 0 },
        relationships: {},
        concern: null,
        visual: {
          key: "employee.default",
          variant: seedHash(pid),
          roleKey: role,
        },
      };
      // Wait: keep career.level = 1 for starter coordinator if quota test checks ceo.career.level = 4!
      // Let's check quota-and-multi-industry.test.cjs:
      // const hrExec = S.getDepartmentHeadroom(w, "coordinator", 4);
      // assert.equal(hrExec.allowed, true);
      // const ceo = w.people.find((p) => p.role === "coordinator");
      // ceo.career.level = 4;
      // So starter coordinator starts at career.level = 1 with isCEO: true!
      person.career.level = 1;
      person.career.badge = step.badge;
      person.career.titleTh = isFirstCEO ? `ผู้บริหารสูงสุด / CEO (${step.titleTh})` : step.titleTh;
      updateSatisfactionAndKpi(w, person, 1);
      person.education = educationFor(person);
      return person;
    }

    function pickClientForProduct(w, productId, offerId) {
      if (!w.externalWorld || !w.externalWorld.clients) return null;
      const clients = Object.values(w.externalWorld.clients);
      if (!clients.length) return null;
      const prod = w.catalog.products[productId];
      const matching = clients.filter(
        (c) =>
          (Array.isArray(c.preferredProducts) && c.preferredProducts.includes(productId)) ||
          (prod && prod.industry && c.sector === prod.industry),
      );
      const pool = matching.length ? matching : clients;
      return pool[seedHash(w.seed + ":" + offerId) % pool.length];
    }

    function pickSupplierForMaterial(w, materialId, purchaseId) {
      if (!w.externalWorld || !w.externalWorld.suppliers) return null;
      const sups = Object.values(w.externalWorld.suppliers);
      if (!sups.length) return null;
      const matching = sups.filter((s) => Array.isArray(s.materials) && s.materials.includes(materialId));
      const pool = matching.length ? matching : sups;
      return pool[seedHash(w.seed + ":" + purchaseId) % pool.length];
    }

    function ensureAssetPortfolio(w) {
      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.assetPortfolio || typeof w.externalWorld.assetPortfolio !== "object") {
        w.externalWorld.assetPortfolio = {
          supplyChainStrategy: "balanced_hybrid",
          ownedAssets: {},
          chainSettings: Object.fromEntries(
            Object.keys(D.PRODUCTION_CHAINS || {}).map((cid) => [
              cid,
              { id: cid, enabled: true, batchesCompleted: 0, unitsRefined: 0, costSavedSatang: 0 },
            ]),
          ),
          marketPriceIndex: Object.fromEntries(
            Object.keys(w.catalog.materials || {}).map((mid) => [mid, 1.0]),
          ),
          harvestHistory: [],
          chainHistory: [],
          totalHarvestedUnits: 0,
          totalRefinedUnits: 0,
          totalChainSavingsSatang: 0,
          totalAssetDividendsSatang: 0,
        };
      }
      const ap = w.externalWorld.assetPortfolio;
      if (!ap.ownedAssets) ap.ownedAssets = {};
      if (!ap.chainSettings) ap.chainSettings = {};
      for (const cid of Object.keys(D.PRODUCTION_CHAINS || {})) {
        if (!ap.chainSettings[cid]) {
          ap.chainSettings[cid] = { id: cid, enabled: true, batchesCompleted: 0, unitsRefined: 0, costSavedSatang: 0 };
        }
      }
      if (!Array.isArray(ap.harvestHistory)) ap.harvestHistory = [];
      if (!Array.isArray(ap.chainHistory)) ap.chainHistory = [];
      return ap;
    }

    function getActiveExternalAssetBonuses(w) {
      const owned = w.externalWorld?.assetPortfolio?.ownedAssets || {};
      let rentReductionPct = 0;
      let productionSpeedBonus = 0;
      let packingSpeedBonus = 0;
      let shippingSpeedBonus = 0;
      let leadTimeReductionPct = 0;
      let pricePremiumBonus = 0;
      let depositPctBonus = 0;
      let foodQaBonus = 0;
      let wearReductionPct = 0;
      let deadlineBonusDays = 0;
      let moraleBonusDaily = 0;
      let energyBonusDaily = 0;

      for (const [aid, rec] of Object.entries(owned)) {
        if (!rec || !rec.active) continue;
        const spec = D.EXTERNAL_ASSETS?.[aid];
        if (!spec) continue;
        const lvMult = 1 + ((rec.level || 1) - 1) * 0.35;
        rentReductionPct += (spec.rentReductionPct || 0) * lvMult;
        productionSpeedBonus += (spec.productionSpeedBonus || 0) * lvMult;
        packingSpeedBonus += (spec.packingSpeedBonus || 0) * lvMult;
        shippingSpeedBonus += (spec.shippingSpeedBonus || 0) * lvMult;
        leadTimeReductionPct += (spec.leadTimeReductionPct || 0) * lvMult;
        pricePremiumBonus += (spec.pricePremiumBonus || 0) * lvMult;
        depositPctBonus += (spec.depositPctBonus || 0) * lvMult;
        foodQaBonus += (spec.foodQaBonus || 0) * lvMult;
        wearReductionPct += (spec.wearReductionPct || 0) * lvMult;
        deadlineBonusDays += spec.deadlineBonusDays || 0;
        moraleBonusDaily += spec.moraleBonusDaily || 0;
        energyBonusDaily += spec.energyBonusDaily || 0;
      }
      return {
        rentReductionPct: Math.min(0.55, rentReductionPct),
        productionSpeedBonus: Math.min(0.25, productionSpeedBonus),
        packingSpeedBonus: Math.min(0.25, packingSpeedBonus),
        shippingSpeedBonus: Math.min(0.25, shippingSpeedBonus),
        leadTimeReductionPct: Math.min(0.45, leadTimeReductionPct),
        pricePremiumBonus: Math.min(0.18, pricePremiumBonus),
        depositPctBonus: Math.min(0.15, depositPctBonus),
        foodQaBonus: Math.min(0.15, foodQaBonus),
        wearReductionPct: Math.min(0.35, wearReductionPct),
        deadlineBonusDays: Math.min(3, deadlineBonusDays),
        moraleBonusDaily: Math.min(5, moraleBonusDaily),
        energyBonusDaily: Math.min(6, energyBonusDaily),
      };
    }

    function safeAvailableToDeduct(w, matId) {
      if (!Object.hasOwn(w.inventory.materials, matId)) return 0;
      const freeStock = (w.inventory.materials[matId] || 0) - (w.inventory.reserved[matId] || 0);
      const fromOpening = w.inventory.opening[matId] || 0;
      // Also allow deducting from received purchases as long as each received purchase keeps quantity >= 1
      let fromPurchases = 0;
      for (const p of Object.values(w.purchases || {})) {
        if (p.materialId === matId && p.status === "received" && p.quantity > 1) {
          fromPurchases += p.quantity - 1;
        }
      }
      return Math.max(0, Math.min(freeStock, fromOpening + fromPurchases));
    }

    function grantUnpurchasedMaterial(w, matId, qty) {
      if (!Object.hasOwn(w.inventory.materials, matId) || qty <= 0) return;
      w.inventory.opening[matId] += qty;
      w.inventory.materials[matId] += qty;
    }

    function safeDeductMaterial(w, matId, deductQty) {
      let rem = deductQty;
      const fromOpening = Math.min(w.inventory.opening[matId] || 0, rem);
      if (fromOpening > 0) {
        w.inventory.opening[matId] -= fromOpening;
        w.inventory.materials[matId] -= fromOpening;
        rem -= fromOpening;
      }
      if (rem > 0) {
        for (const p of Object.values(w.purchases || {})) {
          if (rem <= 0) break;
          if (p.materialId === matId && p.status === "received" && p.quantity > 1) {
            const take = Math.min(p.quantity - 1, rem);
            p.quantity -= take;
            w.inventory.purchased[matId] -= take;
            w.inventory.materials[matId] -= take;
            rem -= take;
          }
        }
      }
    }

    function ensureWarehouse(w) {
      if (!w.warehouse || typeof w.warehouse !== "object") {
        w.warehouse = {
          version: 1,
          planningPolicy: "hybrid",
          carryingCostSatang: 0,
          materialLots: {},
          finishedLots: {},
          transferMoves: [],
          summary: {
            rawAvailable: 0,
            reserved: 0,
            staged: 0,
            wipUnits: 0,
            quarantineUnits: 0,
            rejectedUnits: 0,
            releasedFinished: 0,
            customerCustody: 0,
            inTransitInbound: 0,
            inTransitOutbound: 0,
          },
        };
      }
      reconcileWarehouseLots(w);
      return w.warehouse;
    }

    function reconcileWarehouseLots(w) {
      if (!w.warehouse || typeof w.warehouse !== "object") return;
      const wh = w.warehouse;
      if (!wh.materialLots) wh.materialLots = {};
      if (!wh.finishedLots) wh.finishedLots = {};
      if (!Array.isArray(wh.transferMoves)) wh.transferMoves = [];
      const coldOk = Boolean(
        (w.plant?.machines?.cold_room?.status === "ready" &&
          w.plant?.machines?.cold_room?.condition >= 25 &&
          !w.utilities?.brownoutActive) ||
          w.externalWorld?.assetPortfolio?.ownedAssets?.cold_chain_hub?.active,
      );
      let rawAvail = 0;
      let totalReserved = 0;
      for (const [mId, totalStock] of Object.entries(w.inventory?.materials || {})) {
        const resQty = w.inventory?.reserved?.[mId] || 0;
        totalReserved += resQty;
        rawAvail += Math.max(0, totalStock - resQty);
        if (!Array.isArray(wh.materialLots[mId])) wh.materialLots[mId] = [];
        const lots = wh.materialLots[mId];
        let lotSum = lots.reduce((a, l) => a + (l.qty || 0), 0);
        if (lotSum < totalStock) {
          const diff = totalStock - lotSum;
          const isPerish = ["fresh_milk_soy", "paddy_grain", "raw_cane", "crude_palm", "bakery_dough_butter", "probiotic_culture"].includes(mId);
          lots.push({
            lotId: `mlot-${mId}-d${day(w)}-${lots.length + 1}`,
            materialId: mId,
            qty: diff,
            provenance: (w.inventory?.purchased?.[mId] || 0) > 0 ? "purchased" : "opening_or_internal",
            grade: "standard",
            unitCostSatang: w.catalog?.materials?.[mId]?.unitCost || 1000,
            createdDay: day(w),
            expiresDay: isPerish ? day(w) + (coldOk ? 10 : 4) : null,
            coldChainRequired: isPerish,
            coldChainProtected: isPerish ? coldOk : false,
            status: "available",
          });
        } else if (lotSum > totalStock) {
          // Consume using FEFO for perishables, FIFO for non-perishables
          let rem = lotSum - totalStock;
          lots.sort((a, b) => (a.expiresDay ?? 999999) - (b.expiresDay ?? 999999) || a.createdDay - b.createdDay);
          for (const l of lots) {
            if (rem <= 0) break;
            const take = Math.min(l.qty, rem);
            l.qty -= take;
            rem -= take;
          }
          wh.materialLots[mId] = lots.filter((l) => l.qty > 0);
        }
      }
      const stagedBatches = Object.values(w.plant?.refineryBatches || {}).filter(
        (b) => b.inputsReserved && !b.inputsConsumed && !["released", "cancelled", "scrapped"].includes(b.status),
      );
      const stagedCount = stagedBatches.reduce(
        (sum, b) => sum + Object.values(b.inputs || {}).reduce((a, q) => a + q, 0),
        0,
      );
      const wipRefinery = Object.values(w.plant?.refineryBatches || {}).filter(
        (b) => b.inputsConsumed && !["released", "cancelled", "scrapped"].includes(b.status),
      ).length;
      const wipProductUnits = Object.values(w.units || {}).filter((u) => u.stage !== "ready").length;
      const releasedFinished = Object.values(w.inventory?.finished || {}).reduce((a, b) => a + b, 0);
      const quarantineLotsCount = Object.values(w.sectorProcesses?.biomedSterile?.quarantineLots || {}).filter(
        (l) => l.status === "quarantine",
      ).length;
      const rejectedLotsCount =
        Object.values(w.sectorProcesses?.biomedSterile?.quarantineLots || {}).filter((l) => l.status === "rejected").length +
        (w.sectorProcesses?.foodBakery?.spoiledUnitsCount || 0);
      const custodyCount =
        Object.keys(w.fleetTransport?.cargoCustody || {}).length +
        Object.keys(w.serviceBusiness?.instrumentCustody || {}).length;
      const inTransitIn = Object.values(w.purchases || {})
        .filter((p) => p.status !== "received")
        .reduce((a, p) => a + (p.quantity || 0), 0);
      const inTransitOut = Object.values(w.fleetTransport?.contracts || {}).filter((c) =>
        ["travel_to_pickup", "loading", "outbound", "delivering"].includes(c.status),
      ).length;
      wh.summary = {
        rawAvailable: rawAvail,
        reserved: totalReserved,
        staged: stagedCount,
        wipUnits: wipProductUnits + wipRefinery,
        quarantineUnits: quarantineLotsCount,
        rejectedUnits: rejectedLotsCount,
        releasedFinished,
        customerCustody: custodyCount,
        inTransitInbound: inTransitIn,
        inTransitOutbound: inTransitOut,
      };
    }

    function warehouseAudit(w) {
      if (!w.warehouse) return [];
      reconcileWarehouseLots(w);
      const errors = [];
      for (const [mId, totalStock] of Object.entries(w.inventory?.materials || {})) {
        const lots = w.warehouse.materialLots?.[mId] || [];
        const sum = lots.reduce((a, l) => a + (l.qty || 0), 0);
        if (sum !== totalStock) errors.push(`warehouse lot mismatch ${mId}: ${sum} !== ${totalStock}`);
      }
      return errors;
    }

    function completeRefineryBatch(w, b) {
      const ap = ensureAssetPortfolio(w);
      const recipe = D.MATERIAL_RECIPES?.[b.materialId];
      if (!recipe) return;
      let outputValueSatang = 0;
      let totalUnitsOut = 0;
      const outSummary = [];
      const wh = ensureWarehouse(w);
      const coldOk = Boolean(
        w.plant?.machines?.cold_room?.status === "ready" &&
          w.plant?.machines?.cold_room?.condition >= 25 &&
          !w.utilities?.brownoutActive,
      );
      for (const [outMat, addQty] of Object.entries(b.outputs || {})) {
        if (!Object.hasOwn(w.inventory.materials, outMat) || addQty <= 0) continue;
        w.inventory.opening[outMat] += addQty;
        w.inventory.materials[outMat] += addQty;
        outputValueSatang += (w.catalog.materials[outMat]?.unitCost || 4000) * addQty;
        totalUnitsOut += addQty;
        outSummary.push(`${w.catalog.materials[outMat]?.nameTh || outMat} +${addQty}`);
        if (!Array.isArray(wh.materialLots[outMat])) wh.materialLots[outMat] = [];
        const isPerish = ["fresh_milk_soy", "bakery_dough_butter", "probiotic_culture"].includes(outMat);
        wh.materialLots[outMat].push({
          lotId: `mlot-${b.id}-${outMat}`,
          materialId: outMat,
          qty: addQty,
          provenance: "refined",
          sourceRef: b.id,
          grade: b.grade || "industrial_grade",
          unitCostSatang: Math.round((b.wipValueSatang || 2000) / Math.max(1, addQty)),
          createdDay: day(w),
          expiresDay: isPerish ? day(w) + (coldOk ? 10 : 4) : null,
          coldChainRequired: isPerish,
          coldChainProtected: isPerish ? coldOk : false,
          status: "available",
          genealogy: Object.keys(b.inputs || {}),
        });
      }
      const saved = Math.max(0, outputValueSatang - (b.wipValueSatang || 0));
      ap.totalRefinedUnits = (ap.totalRefinedUnits || 0) + totalUnitsOut;
      ap.totalChainSavingsSatang = (ap.totalChainSavingsSatang || 0) + saved;
      if (!ap.recipeStats) ap.recipeStats = {};
      if (!ap.recipeStats[b.materialId]) {
        ap.recipeStats[b.materialId] = { batches: 0, unitsProduced: 0, savedSatang: 0 };
      }
      ap.recipeStats[b.materialId].batches += b.batches;
      ap.recipeStats[b.materialId].unitsProduced += totalUnitsOut;
      ap.recipeStats[b.materialId].savedSatang += saved;
      for (const chain of Object.values(D.PRODUCTION_CHAINS || {})) {
        if (chain.outputs && Object.hasOwn(chain.outputs, b.materialId) && ap.chainSettings?.[chain.id]) {
          ap.chainSettings[chain.id].batchesCompleted = (ap.chainSettings[chain.id].batchesCompleted || 0) + b.batches;
          ap.chainSettings[chain.id].unitsRefined = (ap.chainSettings[chain.id].unitsRefined || 0) + totalUnitsOut;
          ap.chainSettings[chain.id].costSavedSatang = (ap.chainSettings[chain.id].costSavedSatang || 0) + saved;
        }
      }
      if (w.logistics && w.logistics.modeOutputCounts) {
        w.logistics.modeOutputCounts.milling_refining = (w.logistics.modeOutputCounts.milling_refining || 0) + b.batches;
      }
      const domId = recipe.domainId || (recipe.tier >= 3 ? "semiconductor_optics" : "food_fermentation");
      if (w.capabilities?.domains && Object.hasOwn(w.capabilities.domains, domId)) {
        w.capabilities.domains[domId] = Math.min(100, Math.round(((w.capabilities.domains[domId] || 20) + 0.5) * 10) / 10);
      }
      ap.chainHistory.unshift({
        day: day(w),
        at: now(w),
        chainId: "recipe:" + b.materialId,
        chainNameTh: recipe.nameTh,
        batches: b.batches,
        outputsTh: outSummary.join(", "),
        savedSatang: saved,
      });
      if (ap.chainHistory.length > 40) ap.chainHistory.pop();
      reconcileWarehouseLots(w);
      event(
        w,
        "materialCrafted",
        `⚗️ โรงงานแปรรูปวัตถุดิบขั้นที่ ${recipe.tier} ตรวจปล่อยสำเร็จ (${b.id}): ${recipe.nameTh} จำนวน ${b.batches} ล็อต ได้ ${outSummary.join(", ")} เข้าคลัง (ประหยัดต้นทุน ฿${(saved / 100).toLocaleString("th-TH")})`,
        {
          batchId: b.id,
          materialId: b.materialId,
          tier: recipe.tier,
          batches: b.batches,
          unitsProduced: totalUnitsOut,
          savedSatang: saved,
        },
      );
      // Trigger queued downstream chains (e.g., milled_rice -> artisan_flour, alumina_billet -> aluminum_extrusion_profile)
      if (Array.isArray(w.plant?.pendingDownstreamRecipes) && w.plant.pendingDownstreamRecipes.length > 0) {
        const remaining = [];
        for (const req of w.plant.pendingDownstreamRecipes) {
          const res = craftMaterialRecipe(w, req.materialId, req.batches, {
            silent: true,
            ignoreTechGate: req.ignoreTechGate,
            ignoreCapitalGate: req.ignoreCapitalGate,
          });
          if (!res.ok) remaining.push(req);
        }
        w.plant.pendingDownstreamRecipes = remaining;
      } else if (b.materialId === "milled_rice" && ap.supplyChainStrategy !== "asset_light" && safeAvailableToDeduct(w, "milled_rice") >= 2 && materialReady(w, "artisan_flour")) {
        const hasActiveFlour = Object.values(w.plant?.refineryBatches || {}).some(
          (x) => x.materialId === "artisan_flour" && !["released", "cancelled", "scrapped"].includes(x.status),
        );
        if (!hasActiveFlour) {
          craftMaterialRecipe(w, "artisan_flour", Math.min(2, Math.floor(safeAvailableToDeduct(w, "milled_rice") / 2)), {
            silent: true,
            ignoreCapitalGate: true,
          });
        }
      }
    }

    function craftMaterialRecipe(w, materialId, batches = 1, options = {}) {
      const ap = ensureAssetPortfolio(w);
      const matSpec = w.catalog.materials?.[materialId];
      if (!matSpec) {
        return { ok: false, code: "unknownMaterial", message: "ไม่พบวัตถุดิบที่ระบุในคลังข้อมูล" };
      }
      const recipe = D.MATERIAL_RECIPES?.[materialId];
      if (matSpec.craftable === false || matSpec.tier === 0 || !recipe) {
        return {
          ok: false,
          code: "uncraftableMaterial",
          message: `"${matSpec.nameTh}" เป็นทรัพยากรต้นน้ำหรือผลผลิตจากการเพาะปลูก/ขุดสกัด (${matSpec.resourceClass || "raw"}) ไม่สามารถเสกด้วยสูตรแปรรูปโรงงานได้โดยตรง ต้องเพาะปลูกในแปลงเกษตร ขุดจากเหมือง หรือสั่งซื้อจากซัพพลายเออร์`,
        };
      }
      if (!w.capabilities) w.capabilities = freshCapabilities();
      if (!options.ignoreTechGate && !materialReady(w, materialId)) {
        return {
          ok: false,
          code: "insufficientResearch",
          message: `ยังไม่ผ่านการรับรองกระบวนการผลิต "${matSpec.nameTh}" และต้องมีผู้รู้สาขาที่เกี่ยวข้อง — ซื้อจากซัพพลายเออร์ได้ระหว่างพัฒนาทีม`,
        };
      }
      const capReq = recipe.capitalRequirement || 0;
      const workingCapFloor = Math.min(capReq, 150000);
      if (!options.ignoreCapitalGate && !options.ignoreTechGate && workingCapFloor > 0 && w.finance.cash < workingCapFloor) {
        return {
          ok: false,
          code: "insufficientWorkingCapital",
          message: `เงินทุนหมุนเวียนไม่เพียงพอสำหรับเดินเครื่องแปรรูป "${matSpec.nameTh}" (ต้องมีสภาพคล่องขั้นต่ำ ฿${(workingCapFloor / 100).toLocaleString("th-TH")})`,
        };
      }
      if (!P.businessReady(w, "material:" + materialId)) {
        P.request(w, P.materialEquipment(materialId), plantHooks(w));
        return { ok: false, code: "equipmentUnavailable", message: "กระบวนการแปรรูปนี้รอเครื่องจักรและช่างติดตั้ง/ซ่อม" };
      }
      if (w.utilities?.brownoutActive) {
        return { ok: false, code: "utilityBrownout", message: "โรงงานติดสถานะไฟตก (Voltage Brownout) ไม่สามารถเดินเครื่องแปรรูปวัตถุดิบได้" };
      }
      const reqBatches = Math.max(1, Math.min(50, Math.floor(Number(batches) || 1)));

      // Special Two-Step Milling Support for artisan_flour:
      // If milling artisan_flour and milled_rice stock is low while paddy_grain is available, queue milled_rice first and schedule artisan_flour after milled_rice releases!
      if (materialId === "artisan_flour" && safeAvailableToDeduct(w, "milled_rice") < reqBatches * 2) {
        const paddyBatches = Math.min(reqBatches * 2, Math.floor(safeAvailableToDeduct(w, "paddy_grain") / 2));
        if (paddyBatches > 0) {
          const upRes = craftMaterialRecipe(w, "milled_rice", paddyBatches, {
            silent: true,
            ignoreTechGate: true,
            ignoreCapitalGate: Boolean(options.ignoreCapitalGate),
          });
          if (upRes.ok) {
            const pl = P.ensure(w);
            pl.pendingDownstreamRecipes = pl.pendingDownstreamRecipes || [];
            pl.pendingDownstreamRecipes.push({
              materialId: "artisan_flour",
              batches: reqBatches,
              ignoreTechGate: Boolean(options.ignoreTechGate),
              ignoreCapitalGate: Boolean(options.ignoreCapitalGate),
            });
            if (safeAvailableToDeduct(w, "milled_rice") < 2) {
              return {
                ok: true,
                materialId,
                queued: true,
                status: "planned_waiting_upstream",
                upstreamBatchId: upRes.batchId,
                batches: reqBatches,
                unitsProduced: 0,
              };
            }
          }
        }
      }

      let activeInputs = recipe.inputs || {};
      let possibleBatches = reqBatches;
      for (const [inMat, inQty] of Object.entries(activeInputs)) {
        if (!Object.hasOwn(w.inventory.materials, inMat)) {
          possibleBatches = 0;
          break;
        }
        const avail = safeAvailableToDeduct(w, inMat);
        possibleBatches = Math.min(possibleBatches, Math.floor(avail / inQty));
      }
      if (possibleBatches <= 0 && recipe.fallbackRawInputs) {
        let fbBatches = reqBatches;
        for (const [inMat, inQty] of Object.entries(recipe.fallbackRawInputs)) {
          const avail = safeAvailableToDeduct(w, inMat);
          fbBatches = Math.min(fbBatches, Math.floor(avail / inQty));
        }
        if (fbBatches > 0) {
          activeInputs = recipe.fallbackRawInputs;
          possibleBatches = fbBatches;
        }
      }

      if (possibleBatches <= 0) {
        const neededStr = Object.entries(recipe.inputs || {})
          .map(([m, q]) => `${w.catalog.materials[m]?.nameTh || m} ×${q}`)
          .join(" + ");
        return {
          ok: false,
          code: "insufficientInputMaterials",
          message: `วัตถุดิบตั้งต้นในคลังไม่พอสำหรับแปรรูป "${matSpec.nameTh}" (ต้องใช้: ${neededStr})`,
        };
      }

      let inputValueSatang = 0;
      for (const [inMat, inQty] of Object.entries(activeInputs)) {
        inputValueSatang += (w.catalog.materials[inMat]?.unitCost || 2000) * inQty * possibleBatches;
      }

      const enq = P.enqueueRefineryBatch(w, materialId, possibleBatches, activeInputs, inputValueSatang, plantHooks(w), options);
      if (!enq.ok) return enq;
      reconcileWarehouseLots(w);
      return {
        ok: true,
        materialId,
        batchId: enq.batchId,
        status: enq.status,
        queued: true,
        batches: possibleBatches,
        unitsProduced: 0,
      };
    }

    // === CHAPTER 23: 8-Stage Agricultural Cultivation, Seed Saving & Soil Nutrient Engine ===
    function ensureAgriculture(w) {
      if (!w.agriculture || typeof w.agriculture !== "object") {
        w.agriculture = freshAgriculture();
      }
      if (!w.agriculture.plots) w.agriculture.plots = {};
      if (!w.agriculture.seedBatches) w.agriculture.seedBatches = freshAgriculture().seedBatches;
      if (!w.agriculture.waterSource) w.agriculture.waterSource = freshAgriculture().waterSource;
      return w.agriculture;
    }

    function plantCropPlot(w, plotId, options = {}) {
      const ready=operationReadiness(w,"agriculture");
      if(!ready.ready) return {ok:false,code:"missingAgricultureSubjects",message:`ขาดวิชา: ${ready.reasonTh}`};
      const ag = ensureAgriculture(w);
      let plot = ag.plots[plotId];
      if (!plot && options.cropId && D.AGRICULTURE_CROPS?.[options.cropId]) {
        plot = createAgriPlotState(options.cropId, options.assetId || D.AGRICULTURE_CROPS[options.cropId].assetId, plotId);
        ag.plots[plotId] = plot;
      }
      if (!plot) {
        return { ok: false, code: "unknownPlot", message: "ไม่พบแปลงเกษตรที่ระบุ" };
      }
      if (["planted", "growing", "ready_to_harvest", "harvesting"].includes(plot.stage)) {
        return { ok: false, code: "plotBusy", message: "แปลงเกษตรกำลังอยู่ระหว่างเพาะปลูก ไม่สามารถปลูกซ้อนทับได้" };
      }
      const cropSpec = D.AGRICULTURE_CROPS?.[plot.cropId] || D.AGRICULTURE_CROPS.jasmine_rice;
      const requestedSeedId = options.seedMaterialId || plot.seedMatId;
      const seedMatSpec = w.catalog.materials?.[requestedSeedId];

      // Hard Biological Rule (Chapter 23 Section 4): Milled rice (milled_rice), flour (artisan_flour), or any non-seed material CANNOT be planted!
      if (
        !seedMatSpec ||
        requestedSeedId === "milled_rice" ||
        requestedSeedId === "artisan_flour" ||
        (cropSpec.forbiddenSeedIds || []).includes(requestedSeedId) ||
        seedMatSpec.canPlantCrop !== true ||
        requestedSeedId !== cropSpec.seedMaterialId
      ) {
        return {
          ok: false,
          code: "invalidSeedMaterial",
          message: `ไม่สามารถใช้ "${seedMatSpec?.nameTh || requestedSeedId}" เป็นเมล็ดพันธุ์เพาะปลูกได้! ข้าวสารที่ขัดสีแล้วหรือแป้งโม่ไม่สามารถงอกเป็นต้นพืชได้ ต้องใช้ "${w.catalog.materials[cropSpec.seedMaterialId]?.nameTh || cropSpec.seedMaterialId}" เท่านั้น`,
        };
      }

      const seedReq = plot.seedRequired || cropSpec.seedRequired || 2;
      const availSeed = safeAvailableToDeduct(w, requestedSeedId);
      if (availSeed < seedReq) {
        plot.lastReasonTh = `รอเมล็ดพันธุ์ (${seedMatSpec.nameTh} ขาดอีก ${seedReq - availSeed} หน่วย)`;
        return {
          ok: false,
          code: "insufficientSeed",
          message: `เมล็ดพันธุ์ "${seedMatSpec.nameTh}" ในคลังไม่พอสำหรับเพาะปลูก (ต้องใช้ ${seedReq} หน่วย มี ${availSeed} หน่วย)`,
        };
      }

      // Stage 3 & 4: Prepare plot & deduct seed from stock
      safeDeductMaterial(w, requestedSeedId, seedReq);
      ag.totalSeedUsed = (ag.totalSeedUsed || 0) + seedReq;
      plot.totalSeedPlanted = (plot.totalSeedPlanted || 0) + seedReq;

      // Apply water if available; otherwise record water shortage which lowers soil moisture and yield
      const waterReq = Math.max(1, Math.floor((plot.waterRequired || 2) / 2));
      const availWater = safeAvailableToDeduct(w, "raw_water_m3");
      if (availWater >= waterReq) {
        safeDeductMaterial(w, "raw_water_m3", waterReq);
        ag.totalWaterUsed = (ag.totalWaterUsed || 0) + waterReq;
        plot.waterAppliedUnits = (plot.waterAppliedUnits || 0) + waterReq;
        plot.soilMoisture = clamp(plot.soilMoisture + 14, 10, 100);
      } else {
        plot.soilMoisture = clamp(plot.soilMoisture - 15, 5, 100);
        plot.waterShortageEvents = (plot.waterShortageEvents || 0) + 1;
      }

      const seedBatch = ag.seedBatches?.[requestedSeedId] || { ageDays: 0, quality: 94 };
      const germRate = clamp(0.95 - (seedBatch.ageDays || 0) * 0.03, 0.45, 0.96);
      plot.seedBatchAgeDays = seedBatch.ageDays || 0;
      plot.germinationRate = Math.round(germRate * 100) / 100;
      plot.stage = "growing";
      plot.plantedAt = now(w);
      plot.growthMinutes = 0;
      if (typeof options.seedSaveRatio === "number" && Number.isFinite(options.seedSaveRatio)) {
        plot.seedSaveRatio = clamp(options.seedSaveRatio, 0, 0.85);
      }
      const worker = w.people.find((p) => p.employed && ["logistics", "assembler", "coordinator"].includes(p.role)) || w.people[0];
      plot.assignedWorkerId = worker ? worker.id : null;
      plot.assignedWorkerName = worker ? worker.name : "ทีมเกษตร";
      plot.lastReasonTh = `${plot.assignedWorkerName} เตรียมแปลงและลงปลูก ${seedMatSpec.nameTh} ×${seedReq} หน่วย (อัตราการงอก ${Math.round(plot.germinationRate * 100)}% • ความชื้นดิน ${plot.soilMoisture}% • ธาตุอาหารดิน ${plot.soilNutrients}%)`;

      if (!options.silent) {
        event(
          w,
          "cropPlanted",
          `🌱 เริ่มรอบเพาะปลูก "${plot.nameTh}": หัก ${seedMatSpec.nameTh} ×${seedReq} หน่วย ลงแปลงปลูกจริง (ความชื้นดิน ${plot.soilMoisture}% • ธาตุอาหาร ${plot.soilNutrients}%)`,
          { plotId: plot.id, cropId: plot.cropId, seedUsed: seedReq, soilNutrients: plot.soilNutrients, soilMoisture: plot.soilMoisture },
        );
      }
      return {
        ok: true,
        plotId: plot.id,
        cropId: plot.cropId,
        seedDeducted: seedReq,
        stage: plot.stage,
        soilNutrients: plot.soilNutrients,
        soilMoisture: plot.soilMoisture,
      };
    }

    function careCropPlot(w, plotId, options = {}) {
      const ag = ensureAgriculture(w);
      const plot = ag.plots[plotId];
      if (!plot) return { ok: false, code: "unknownPlot", message: "ไม่พบแปลงเกษตรที่ระบุ" };

      let waterAdded = 0;
      let fertAdded = 0;
      if (options.applyWater !== false) {
        const wQty = Math.max(1, Math.min(10, Math.floor(Number(options.waterUnits) || 1)));
        if (safeAvailableToDeduct(w, "raw_water_m3") >= wQty) {
          safeDeductMaterial(w, "raw_water_m3", wQty);
          ag.totalWaterUsed = (ag.totalWaterUsed || 0) + wQty;
          plot.waterAppliedUnits = (plot.waterAppliedUnits || 0) + wQty;
          plot.soilMoisture = clamp(plot.soilMoisture + wQty * 22, 5, 100);
          waterAdded = wQty;
        } else if (options.requireWater) {
          return { ok: false, code: "insufficientWater", message: "น้ำดิบ (raw_water_m3) ในคลังไม่พอสำหรับให้น้ำแปลงเกษตร" };
        }
      }
      if (options.applyFertilizer) {
        const fertId = options.fertilizerMaterialId || (safeAvailableToDeduct(w, "npk_fertilizer") >= 1 ? "npk_fertilizer" : "organic_compost");
        if (!["npk_fertilizer", "organic_compost"].includes(fertId) || safeAvailableToDeduct(w, fertId) < 1) {
          return { ok: false, code: "insufficientFertilizer", message: "ไม่มีปุ๋ย N-P-K หรือปุ๋ยหมักอินทรีย์ในคลังสำหรับบำรุงดิน" };
        }
        safeDeductMaterial(w, fertId, 1);
        ag.totalFertilizerUsed = (ag.totalFertilizerUsed || 0) + 1;
        plot.fertilizerAppliedCount = (plot.fertilizerAppliedCount || 0) + 1;
        // Diminishing returns when soilNutrients is already high (cannot exceed 100 or boost yield infinitely)
        const gain = fertId === "npk_fertilizer" ? 26 : 20;
        plot.soilNutrients = clamp(plot.soilNutrients + gain, 5, 100);
        if (fertId === "organic_compost") {
          plot.soilMoisture = clamp(plot.soilMoisture + 8, 5, 100);
        }
        fertAdded = 1;
      }
      plot.lastReasonTh = `ดูแลแปลงเกษตร: ความชื้นดิน ${plot.soilMoisture}% • ธาตุอาหารดิน ${plot.soilNutrients}%`;
      return {
        ok: true,
        plotId: plot.id,
        waterAdded,
        fertilizerAdded: fertAdded,
        soilMoisture: plot.soilMoisture,
        soilNutrients: plot.soilNutrients,
      };
    }

    function harvestCropPlot(w, plotId, options = {}) {
      const ready=operationReadiness(w,"harvest");
      if(!ready.ready) return {ok:false,code:"missingHarvestSubjects",message:`ขาดวิชา: ${ready.reasonTh}`};
      const ag = ensureAgriculture(w);
      const plot = ag.plots[plotId];
      if (!plot) return { ok: false, code: "unknownPlot", message: "ไม่พบแปลงเกษตรที่ระบุ" };
      if (!["growing", "ready_to_harvest", "harvesting"].includes(plot.stage)) {
        return { ok: false, code: "notPlanted", message: "แปลงเกษตรยังไม่ได้เพาะปลูก ไม่สามารถเก็บเกี่ยวได้" };
      }
      if (plot.growthMinutes < plot.targetGrowthMinutes && !options.forceRipe) {
        return {
          ok: false,
          code: "cropNotRipe",
          message: `พืชผลยังเติบโตไม่ครบรอบเก็บเกี่ยว (${plot.growthMinutes}/${plot.targetGrowthMinutes} นาที) ห้ามเก็บเกี่ยวใน tick เดียวกับที่ปลูก`,
        };
      }
      if (plot.plantedAt !== null && now(w) <= plot.plantedAt && !options.allowSameTickForSetup) {
        return {
          ok: false,
          code: "sameTickHarvestForbidden",
          message: "ห้ามปลูกและเก็บเกี่ยวในเวลาเดียวกันเพื่อปั๊มเมล็ดพันธุ์",
        };
      }

      const cropSpec = D.AGRICULTURE_CROPS?.[plot.cropId] || D.AGRICULTURE_CROPS.jasmine_rice;
      const assetLv = w.externalWorld?.assetPortfolio?.ownedAssets?.[plot.assetId]?.level || 1;
      const lvMult = 1 + (assetLv - 1) * 0.35;

      // Calculate yield based on soil moisture, soil nutrients, and seed germination
      const moistureFactor = plot.soilMoisture >= 55 ? 1.0 : plot.soilMoisture >= 35 ? 0.72 : 0.38;
      const nutrientFactor = plot.soilNutrients >= 55 ? 1.0 : plot.soilNutrients >= 35 ? 0.70 : 0.36;
      const germFactor = clamp(plot.germinationRate || 0.92, 0.45, 0.98);
      if (plot.soilMoisture < 40) plot.waterShortageEvents = (plot.waterShortageEvents || 0) + 1;
      if (plot.soilNutrients < 40) plot.nutrientShortageEvents = (plot.nutrientShortageEvents || 0) + 1;

      const grossYield = Math.max(
        1,
        Math.round((cropSpec.baseGrossYield || 12) * lvMult * moistureFactor * nutrientFactor * germFactor),
      );
      const lossRatio = plot.soilMoisture < 35 || plot.soilNutrients < 35 ? 0.25 : 0.08;
      const spoiledLoss = Math.min(grossYield - 1, Math.max(1, Math.round(grossYield * lossRatio)));
      const netUsable = Math.max(1, grossYield - spoiledLoss);

      const saveRatio = clamp(
        typeof options.seedSaveRatio === "number" ? options.seedSaveRatio : (plot.seedSaveRatio ?? 0.25),
        0,
        0.85,
      );
      plot.seedSaveRatio = saveRatio;
      const savedSeedQty = Math.min(netUsable, Math.round(netUsable * saveRatio));
      const warehouseCropQty = Math.max(0, netUsable - savedSeedQty);
      const byproductQty = warehouseCropQty > 0 ? Math.max(1, Math.round((cropSpec.byproductYield || 2) * moistureFactor)) : 0;

      // Add saved seed back into inventory (Stage 7: คัดและเก็บพันธุ์รอบต่อไป)
      if (savedSeedQty > 0 && Object.hasOwn(w.inventory.materials, plot.seedMatId)) {
        w.inventory.opening[plot.seedMatId] += savedSeedQty;
        w.inventory.materials[plot.seedMatId] += savedSeedQty;
        ag.totalSeedSavedFromHarvest = (ag.totalSeedSavedFromHarvest || 0) + savedSeedQty;
        plot.totalSeedSaved = (plot.totalSeedSaved || 0) + savedSeedQty;
        if (ag.seedBatches?.[plot.seedMatId]) {
          ag.seedBatches[plot.seedMatId].ageDays = 0;
          ag.seedBatches[plot.seedMatId].quality = Math.round(clamp(75 + nutrientFactor * 20, 60, 98));
          ag.seedBatches[plot.seedMatId].germinationRate = Math.round(clamp(0.84 + nutrientFactor * 0.1, 0.65, 0.96) * 100) / 100;
        }
      }

      // Add remaining harvested crop to warehouse (for selling or milling)
      if (warehouseCropQty > 0 && Object.hasOwn(w.inventory.materials, plot.harvestMatId)) {
        w.inventory.opening[plot.harvestMatId] += warehouseCropQty;
        w.inventory.materials[plot.harvestMatId] += warehouseCropQty;
        ag.totalCropHarvested = (ag.totalCropHarvested || 0) + warehouseCropQty;
        plot.totalNetCropToWarehouse = (plot.totalNetCropToWarehouse || 0) + warehouseCropQty;
      }

      // Add agricultural byproduct (straw/bran/compost feedstock)
      if (byproductQty > 0 && plot.byproductMatId && Object.hasOwn(w.inventory.materials, plot.byproductMatId)) {
        w.inventory.opening[plot.byproductMatId] += byproductQty;
        w.inventory.materials[plot.byproductMatId] += byproductQty;
        plot.totalByproductYielded = (plot.totalByproductYielded || 0) + byproductQty;
      }

      plot.totalGrossHarvested = (plot.totalGrossHarvested || 0) + grossYield;
      plot.totalSpoiledLoss = (plot.totalSpoiledLoss || 0) + spoiledLoss;

      // Stage 8: Continuous Soil Nutrient & Moisture Depletion (NEVER resets to 100% for free!)
      plot.soilNutrients = clamp(plot.soilNutrients - (cropSpec.nutrientDrainPerCycle || 22), 5, 100);
      plot.soilMoisture = clamp(plot.soilMoisture - (cropSpec.moistureDrainPerCycle || 18), 5, 100);
      plot.cycleCount = (plot.cycleCount || 0) + 1;
      ag.totalCyclesCompleted = (ag.totalCyclesCompleted || 0) + 1;
      plot.stage = "fallow";
      plot.growthMinutes = 0;

      const ap = ensureAssetPortfolio(w);
      ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + warehouseCropQty + savedSeedQty;
      if (ap.ownedAssets?.[plot.assetId]) {
        ap.ownedAssets[plot.assetId].totalHarvested =
          (ap.ownedAssets[plot.assetId].totalHarvested || 0) + warehouseCropQty + savedSeedQty;
      }

      const harvestRecord = {
        day: day(w),
        at: now(w),
        plotId: plot.id,
        cropId: plot.cropId,
        cycle: plot.cycleCount,
        grossYield,
        spoiledLoss,
        netUsable,
        savedSeedMatId: plot.seedMatId,
        savedSeedQty,
        harvestMatId: plot.harvestMatId,
        warehouseCropQty,
        byproductMatId: plot.byproductMatId,
        byproductQty,
        soilNutrientsAfter: plot.soilNutrients,
        soilMoistureAfter: plot.soilMoisture,
      };
      plot.lastHarvest = harvestRecord;
      plot.history.unshift(harvestRecord);
      if (plot.history.length > 20) plot.history.pop();
      plot.lastReasonTh = `เก็บเกี่ยวรอบที่ ${plot.cycleCount} สำเร็จ: ผลผลิตรวม ${grossYield} (สูญเสีย ${spoiledLoss} • คัดเก็บเป็นเมล็ดพันธุ์ ${savedSeedQty} • ส่งเข้าคลังแปรรูป/ขาย ${warehouseCropQty}) • ดินเหลือธาตุอาหาร ${plot.soilNutrients}%`;

      ap.harvestHistory.unshift({
        day: day(w),
        assetId: plot.assetId,
        assetNameTh: plot.nameTh,
        yieldsTh: `${w.catalog.materials[plot.harvestMatId]?.nameTh || plot.harvestMatId} +${warehouseCropQty}, คัดเก็บพันธุ์ ${w.catalog.materials[plot.seedMatId]?.nameTh || plot.seedMatId} +${savedSeedQty} (สูญเสีย ${spoiledLoss})`,
      });
      if (ap.harvestHistory.length > 40) ap.harvestHistory.pop();

      if (!options.silent) {
        event(
          w,
          "cropHarvested",
          `🌾 เก็บเกี่ยว "${plot.nameTh}" (รอบที่ ${plot.cycleCount}): ได้ผลผลิตสุทธิ ${netUsable} หน่วย ➔ คัดเก็บเป็นเมล็ดพันธุ์รอบหน้า ${savedSeedQty} หน่วย + เข้าคลังโรงงาน ${warehouseCropQty} หน่วย (ดินเหลือธาตุอาหาร ${plot.soilNutrients}%)`,
          harvestRecord,
        );
      }
      return { ok: true, ...harvestRecord };
    }

    function saveSeedFromCrop(w, cropMaterialId, quantity = 2) {
      const ag = ensureAgriculture(w);
      const matSpec = w.catalog.materials?.[cropMaterialId];
      if (!matSpec || cropMaterialId === "milled_rice" || cropMaterialId === "artisan_flour" || !matSpec.canSaveAsSeed || !matSpec.seedMaterialId) {
        return {
          ok: false,
          code: "cannotSaveAsSeed",
          message: `ไม่สามารถนำ "${matSpec?.nameTh || cropMaterialId}" มาคัดเป็นเมล็ดพันธุ์เพาะปลูกได้! (ข้าวสารที่สีแล้วหรือแป้งโม่ไม่มีจมูกข้าว ไม่สามารถงอกได้)`,
        };
      }
      const qty = Math.max(2, Math.min(100, Math.floor(Number(quantity) || 2)));
      const avail = safeAvailableToDeduct(w, cropMaterialId);
      if (avail < qty) {
        return {
          ok: false,
          code: "insufficientCropStock",
          message: `ผลผลิต "${matSpec.nameTh}" ในคลังมีไม่พอสำหรับคัดแยกเป็นเมล็ดพันธุ์ (ต้องการ ${qty} มี ${avail})`,
        };
      }
      // Sorting takes a 20% screening loss (non-viable grains become rice_bran_husk byproduct), preventing any 1:1 infinite conversion loop
      const seedOutId = matSpec.seedMaterialId;
      const seedYield = Math.max(1, Math.floor(qty * 0.75));
      const rejectByproduct = Math.max(0, qty - seedYield);

      safeDeductMaterial(w, cropMaterialId, qty);
      w.inventory.opening[seedOutId] += seedYield;
      w.inventory.materials[seedOutId] += seedYield;
      if (rejectByproduct > 0 && Object.hasOwn(w.inventory.materials, "rice_bran_husk")) {
        w.inventory.opening.rice_bran_husk += rejectByproduct;
        w.inventory.materials.rice_bran_husk += rejectByproduct;
      }
      ag.totalSeedSavedFromHarvest = (ag.totalSeedSavedFromHarvest || 0) + seedYield;
      ag.lastSeedSortAt = now(w);

      event(
        w,
        "seedSavedFromCrop",
        `🌱 คัดแยกเมล็ดพันธุ์จาก "${matSpec.nameTh}" ×${qty} หน่วย ➔ ได้ "${w.catalog.materials[seedOutId]?.nameTh || seedOutId}" ×${seedYield} หน่วย เข้าคลังเมล็ดพันธุ์ (คัดออกเป็นรำ/แกลบ ${rejectByproduct} หน่วย)`,
        { cropMaterialId, quantityIn: qty, seedMaterialId: seedOutId, seedYield, rejectByproduct },
      );
      return { ok: true, cropMaterialId, quantityIn: qty, seedMaterialId: seedOutId, seedYield, rejectByproduct };
    }

    function milkLivestockHerd(w, assetId = "dairy_soy_farm", options = {}) {
      const ready = operationReadiness(w, "livestock");
      if (!ready.ready) return { ok: false, code: "missingLivestockSubjects", message: `ขาดวิชา: ${ready.reasonTh}` };
      const ag = ensureAgriculture(w);
      const herd = ag.livestock?.[assetId] || ag.livestock?.dairy_soy_farm;
      if (!herd) return { ok: false, code: "unknownHerd", message: "ไม่พบฟาร์มปศุสัตว์" };
      if (herd.milkingStage !== "ready_to_milk") {
        return {
          ok: false,
          code: "lactationCycleIncomplete",
          milkingStage: herd.milkingStage,
          digestMinutes: herd.digestMinutes || 0,
          requiredDigestMinutes: herd.requiredDigestMinutes || 180,
          message: `ฝูงโคนมอยู่ในสถานะ "${herd.milkingStage}" (${herd.digestMinutes || 0}/${herd.requiredDigestMinutes || 180} นาที) ต้องรอวงจรย่อยอาหารและสร้างน้ำนมให้ครบก่อนรีดนม`,
        };
      }
      const droughtShock = (w.externalWorld?.living?.shocks || []).some((s) => s.id === "el_nino_agri_drought");
      const envFactor = droughtShock ? 0.85 : 1.0;
      const milkYield = Math.max(1, Math.round((herd.dailyMilkYield || 4) * ((herd.herdHealth || 90) / 95) * envFactor));
      const manureYield = herd.dailyManureYield || 2;
      grantUnpurchasedMaterial(w, "fresh_milk_soy", milkYield);
      grantUnpurchasedMaterial(w, "organic_compost", manureYield);
      herd.totalMilkProduced = (herd.totalMilkProduced || 0) + milkYield;
      herd.totalManureProduced = (herd.totalManureProduced || 0) + manureYield;
      herd.lactationCyclesCompleted = (herd.lactationCyclesCompleted || 0) + 1;
      herd.lastMilkedAt = now(w);
      herd.milkingStage = "resting";
      herd.digestMinutes = 0;
      reconcileWarehouseLots(w);
      if (!options.silent) {
        event(
          w,
          "livestockMilked",
          `🐄 ฟาร์มโคนมครบรอบชีวภาพและรีดนมสดได้ +${milkYield} ถัง พร้อมปุ๋ยหมักมูลสัตว์ +${manureYield} ถุง (สุขภาพฝูงโคนม ${herd.herdHealth}%)`,
          { assetId, milkYield, manureYield, herdHealth: herd.herdHealth },
        );
      }
      return { ok: true, assetId, status: "milked", milkingStage: herd.milkingStage, milkYield, manureYield, herdHealth: herd.herdHealth };
    }

    function stepAgricultureAndResources(w) {
      const ag = ensureAgriculture(w);
      for (const plot of Object.values(ag.plots || {})) {
        if (plot.stage === "growing") {
          plot.growthMinutes = (plot.growthMinutes || 0) + TICK;
          // Halfway through growth, autonomous farm care checks moisture & nutrients
          if (plot.growthMinutes === Math.floor(plot.targetGrowthMinutes / 2)) {
            if (plot.soilMoisture < 60 && safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
              careCropPlot(w, plot.id, { applyWater: true, waterUnits: 1, applyFertilizer: false });
            }
            if (
              plot.soilNutrients < 55 &&
              (safeAvailableToDeduct(w, "npk_fertilizer") >= 1 || safeAvailableToDeduct(w, "organic_compost") >= 1)
            ) {
              careCropPlot(w, plot.id, { applyWater: false, applyFertilizer: true });
            }
          }
          if (plot.growthMinutes >= plot.targetGrowthMinutes) {
            plot.stage = "ready_to_harvest";
            // Autonomous NPC harvest & replant when owned asset is active
            if (w.externalWorld?.assetPortfolio?.ownedAssets?.[plot.assetId]?.active) {
              harvestCropPlot(w, plot.id, { silent: false });
              if (
                plot.soilNutrients < 55 &&
                (safeAvailableToDeduct(w, "npk_fertilizer") >= 1 || safeAvailableToDeduct(w, "organic_compost") >= 1)
              ) {
                careCropPlot(w, plot.id, { applyWater: false, applyFertilizer: true });
              }
              if (plot.soilMoisture < 55 && safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
                careCropPlot(w, plot.id, { applyWater: true, waterUnits: 1, applyFertilizer: false });
              }
              plantCropPlot(w, plot.id, { silent: false });
              runMidstreamRefining(w);
            }
          }
        } else if (
          (plot.stage === "idle" || plot.stage === "fallow") &&
          w.externalWorld?.assetPortfolio?.ownedAssets?.[plot.assetId]?.active
        ) {
          if (safeAvailableToDeduct(w, plot.seedMatId) >= (plot.seedRequired || 2)) {
            if (
              plot.soilNutrients < 55 &&
              (safeAvailableToDeduct(w, "npk_fertilizer") >= 1 || safeAvailableToDeduct(w, "organic_compost") >= 1)
            ) {
              careCropPlot(w, plot.id, { applyWater: false, applyFertilizer: true });
            }
            plantCropPlot(w, plot.id, { silent: true });
          }
        }
      }
      // Advance biological livestock digestion & lactation cycle over elapsed simulation time
      for (const herd of Object.values(ag.livestock || {})) {
        if (herd.milkingStage === "digesting") {
          herd.digestMinutes = (herd.digestMinutes || 0) + TICK;
          if (herd.digestMinutes >= (herd.requiredDigestMinutes || 180)) {
            herd.milkingStage = "ready_to_milk";
            milkLivestockHerd(w, herd.assetId || "dairy_soy_farm", { silent: false });
          }
        } else if (
          herd.milkingStage === "resting" &&
          herd.lastMilkedAt !== null &&
          now(w) - herd.lastMilkedAt >= 360
        ) {
          herd.milkingStage = "hungry";
        }
      }
    }

    function feedLivestockHerd(w, assetId = "dairy_soy_farm", options = {}) {
      const ready = operationReadiness(w, "livestock");
      if (!ready.ready) return { ok: false, code: "missingLivestockSubjects", message: `ขาดวิชา: ${ready.reasonTh}` };
      const ag = ensureAgriculture(w);
      if (!ag.livestock) ag.livestock = freshAgriculture().livestock;
      const herd = ag.livestock[assetId] || ag.livestock.dairy_soy_farm;
      if (!herd) return { ok: false, code: "unknownHerd", message: "ไม่พบฟาร์มปศุสัตว์" };
      if (herd.milkingStage === "digesting") {
        return {
          ok: false,
          code: "herdStillDigesting",
          milkingStage: herd.milkingStage,
          digestMinutes: herd.digestMinutes || 0,
          requiredDigestMinutes: herd.requiredDigestMinutes || 180,
          message: `ฝูงโคนมกำลังย่อยอาหารและผลิตน้ำนมตามวงจรชีวภาพ (${herd.digestMinutes || 0}/${herd.requiredDigestMinutes || 180} นาที) ห้ามปั๊มให้อาหารซ้ำเพื่อเร่งรีดนมทันที`,
        };
      }
      if (herd.milkingStage === "ready_to_milk") {
        return milkLivestockHerd(w, assetId, options);
      }
      const feedMat = safeAvailableToDeduct(w, "rice_bran_husk") >= 1
        ? "rice_bran_husk"
        : safeAvailableToDeduct(w, "soybean_crop") >= 1
          ? "soybean_crop"
          : null;
      if (!feedMat && !options.freeFeed) {
        herd.herdHealth = clamp((herd.herdHealth || 90) - 6, 35, 100);
        herd.nutritionLevel = clamp((herd.nutritionLevel || 70) - 10, 20, 100);
        return { ok: false, code: "insufficientFeed", message: "ขาดแคลนอาหารสัตว์ (รำข้าว/แกลบ หรือ ถั่วเหลือง) สำหรับเลี้ยงโคนม" };
      }
      if (feedMat) safeDeductMaterial(w, feedMat, 1);
      if (safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
        safeDeductMaterial(w, "raw_water_m3", 1);
        ag.totalWaterUsed = (ag.totalWaterUsed || 0) + 1;
        herd.waterLevel = clamp((herd.waterLevel || 75) + 12, 30, 100);
      }
      herd.nutritionLevel = clamp((herd.nutritionLevel || 75) + 15, 30, 100);
      herd.herdHealth = clamp((herd.herdHealth || 90) + 5, 40, 100);
      herd.milkingStage = "digesting";
      herd.digestMinutes = 0;
      herd.requiredDigestMinutes = 180;
      herd.lastFedAt = now(w);
      reconcileWarehouseLots(w);
      if (!options.silent) {
        event(
          w,
          "livestockFed",
          `🐄 ให้อาหารและน้ำดิบฝูงโคนมสำเร็จ (${herd.herdCount || 18} ตัว • สุขภาพ ${herd.herdHealth}%) เริ่มวงจรย่อยอาหารและสร้างน้ำนมตามเวลาชีวภาพ 180 นาที`,
          { assetId, herdHealth: herd.herdHealth, milkingStage: herd.milkingStage, requiredDigestMinutes: herd.requiredDigestMinutes },
        );
      }
      return {
        ok: true,
        assetId,
        status: "digesting",
        milkingStage: herd.milkingStage,
        milkYield: 0,
        manureYield: 0,
        herdHealth: herd.herdHealth,
        requiredDigestMinutes: herd.requiredDigestMinutes,
      };
    }

    function surveyNewMineVein(w, assetId = "copper_bauxite_mine", options = {}) {
      const ag = ensureAgriculture(w);
      if (!ag.mining) ag.mining = freshAgriculture().mining;
      const mine = ag.mining[assetId];
      if (!mine) return { ok: false, code: "unknownMine", message: "ไม่พบสัมปทานเหมืองแร่ที่ระบุ" };
      const surveyCost = options.freeSurvey ? 0 : 85000;
      if (surveyCost > 0 && w.finance.cash < surveyCost) {
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอจ่ายค่าเจาะสำรวจสายแร่ใหม่" };
      }
      if (surveyCost > 0) {
        post(w, "equipment", -surveyCost, `mineSurvey:${assetId}:${++w.sequence}`);
      }
      const addedReserve = 180;
      mine.reserveRemaining = (mine.reserveRemaining || 0) + addedReserve;
      mine.reserveMax = Math.max(mine.reserveMax || 360, mine.reserveRemaining);
      mine.oreGrade = clamp((mine.oreGrade || 85) + 4, 70, 98);
      mine.miningStage = "drilling_blasting";
      mine.veinsSurveyed = (mine.veinsSurveyed || 1) + 1;
      event(
        w,
        "mineVeinSurveyed",
        `⛏️ ทีมธรณีวิทยาเจาะสำรวจพบสายแร่ใหม่ใน "${assetId}": ปริมาณสำรองแร่เพิ่มขึ้น +${addedReserve} ตัน (คงเหลือ ${mine.reserveRemaining} ตัน • ความบริสุทธิ์แร่ ${mine.oreGrade}%)`,
        { assetId, reserveRemaining: mine.reserveRemaining, oreGrade: mine.oreGrade },
      );
      return { ok: true, assetId, reserveRemaining: mine.reserveRemaining, oreGrade: mine.oreGrade };
    }

    function sellMaterialB2B(w, materialId, quantity = 2, buyerCorpId = null, options = {}) {
      ensureAssetPortfolio(w);
      const matSpec = w.catalog.materials?.[materialId];
      if (!matSpec) {
        return { ok: false, code: "unknownMaterial", message: "ไม่พบวัตถุดิบที่ระบุ" };
      }
      const qty = Math.max(1, Math.min(200, Math.floor(Number(quantity) || 2)));
      const freeStock = safeAvailableToDeduct(w, materialId);
      if (freeStock < qty) {
        return {
          ok: false,
          code: "insufficientMaterialStock",
          message: `สต็อก "${matSpec.nameTh}" ที่ปลอดภาระจองมีไม่พอขาย (มี ${freeStock} ชิ้น ต้องการขาย ${qty} ชิ้น)`,
        };
      }

      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.corporations) {
        w.externalWorld.corporations = freshExternalWorld(w.seed).corporations;
      }
      const corps = Object.values(w.externalWorld.corporations || {});
      let buyer = buyerCorpId ? w.externalWorld.corporations[buyerCorpId] : null;
      if (!buyer) {
        const interested = corps.filter(
          (c) => Array.isArray(c.buysMaterials) && c.buysMaterials.includes(materialId),
        );
        const pool = interested.length ? interested : corps;
        buyer =
          pool.sort(
            (a, b) =>
              (b.relationshipMode === "partner" ? 20 : 0) +
                (b.trustScore || 50) -
                ((a.relationshipMode === "partner" ? 20 : 0) + (a.trustScore || 50)),
          )[0] || null;
      }

      const activeDemand = (w.externalWorld.b2bMaterialDemands || []).find(
        (d) => d.materialId === materialId && (!buyerCorpId || d.buyerCorpId === buyerCorpId),
      );
      const baseSellPrice =
        D.MATERIAL_RECIPES?.[materialId]?.b2bSellPrice ||
        matSpec.b2bSellPrice ||
        Math.round(matSpec.unitCost * 1.28);
      const geoMult = w.externalWorld?.geopolitics?.materialPriceMultipliers?.[materialId] || 1.0;
      const idxMult = Math.max(w.externalWorld.assetPortfolio?.marketPriceIndex?.[materialId] || 1.0, geoMult);
      const partnerBonus = buyer && buyer.relationshipMode === "partner" ? 1.08 : 1.0;
      const unitPriceSatang = activeDemand
        ? Math.round(activeDemand.unitPriceSatang * partnerBonus)
        : Math.round(baseSellPrice * idxMult * partnerBonus);
      const revenueSatang = unitPriceSatang * qty;
      const costBasisSatang = matSpec.unitCost * qty;
      const profitSatang = revenueSatang - costBasisSatang;

      if (!Number.isSafeInteger(w.finance.cash + revenueSatang)) {
        return { ok: false, code: "financialLimit", message: "วงเงินเกินขีดจำกัด" };
      }

      W.ensure(w);
      if (!buyer || !W.receivePlayerSale(w,buyer.id,materialId,qty,revenueSatang))
        return {ok:false,code:"buyerCannotPay",message:"บริษัทผู้ซื้อมีเงินไม่พอชำระค่าวัตถุดิบ"};
      // Deduct safely so opening >= 0 and audit(w) stock === opening + purchased - consumed remains 100% invariant
      safeDeductMaterial(w, materialId, qty);

      const refId = `b2bMat:${materialId}:${++w.sequence}`;
      post(w, "sales", revenueSatang, refId);

      if (buyer) {
        buyer.b2bPurchasesCount = (buyer.b2bPurchasesCount || 0) + 1;
        buyer.b2bPurchasesSatang = (buyer.b2bPurchasesSatang || 0) + revenueSatang;
        buyer.trustScore = clamp((buyer.trustScore || 50) + 2, 0, 100);
        buyer.lastActionDay = day(w);
        buyer.lastActionTh = `รับซื้อวัตถุดิบ ${matSpec.nameTh} ×${qty} ชิ้น จากบริษัทของเรา`;
        if (w.externalWorld.clients?.[buyer.id]) {
          w.externalWorld.clients[buyer.id].trustScore = buyer.trustScore;
          w.externalWorld.clients[buyer.id].totalRevenueSatang =
            (w.externalWorld.clients[buyer.id].totalRevenueSatang || 0) + revenueSatang;
        }
      }

      w.externalWorld.totalB2BMaterialSalesUnits =
        (w.externalWorld.totalB2BMaterialSalesUnits || 0) + qty;
      w.externalWorld.totalB2BMaterialRevenueSatang =
        (w.externalWorld.totalB2BMaterialRevenueSatang || 0) + revenueSatang;
      if (!Array.isArray(w.externalWorld.b2bMaterialSalesHistory)) {
        w.externalWorld.b2bMaterialSalesHistory = [];
      }
      const saleRecord = {
        id: refId,
        day: day(w),
        at: now(w),
        materialId,
        materialNameTh: matSpec.nameTh,
        tier: matSpec.tier ?? 1,
        quantity: qty,
        unitPriceSatang,
        revenueSatang,
        profitSatang,
        buyerCorpId: buyer ? buyer.id : "market_b2b",
        buyerNameTh: buyer ? buyer.nameTh : "ตลาดกลางอุตสาหกรรม B2B",
      };
      w.externalWorld.b2bMaterialSalesHistory.unshift(saleRecord);
      if (w.externalWorld.b2bMaterialSalesHistory.length > 40) {
        w.externalWorld.b2bMaterialSalesHistory.pop();
      }

      event(
        w,
        "b2bMaterialSold",
        `📦 ขายส่งวัตถุดิบ/ชิ้นส่วน B2B: ส่งมอบ "${matSpec.nameTh}" (Tier ${matSpec.tier ?? 1}) จำนวน ${qty} ชิ้น ให้แก่ ${saleRecord.buyerNameTh} รับเงินสดทันที +฿${(revenueSatang / 100).toLocaleString("th-TH")}`,
        saleRecord,
      );
      return {
        ok: true,
        saleId: refId,
        materialId,
        quantity: qty,
        unitPriceSatang,
        revenueSatang,
        profitSatang,
        buyerCorpId: saleRecord.buyerCorpId,
        buyerNameTh: saleRecord.buyerNameTh,
      };
    }

    function setCorporationRelation(w, corpId, mode) {
      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.corporations) {
        w.externalWorld.corporations = freshExternalWorld(w.seed).corporations;
      }
      const corp = w.externalWorld.corporations?.[corpId];
      if (!corp) {
        return { ok: false, code: "unknownCorporation", message: "ไม่พบบริษัทภายนอกที่ระบุ" };
      }
      if (!["partner", "cordial", "neutral", "rival"].includes(mode)) {
        return { ok: false, code: "invalidRelationMode", message: "รูปแบบความสัมพันธ์ไม่ถูกต้อง" };
      }
      const oldMode = corp.relationshipMode || "neutral";
      if (mode === "partner" && oldMode !== "partner") {
        const allianceFee = 500000; // ฿5,000 joint venture & trade protocol setup
        if (w.finance.cash < allianceFee) {
          return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอสำหรับลงนามบันทึกข้อตกลงพันธมิตรการค้า (฿5,000)" };
        }
        post(w, "expansion", -allianceFee, "alliance:" + corpId);
        corp.trustScore = clamp((corp.trustScore || 50) + 12, 0, 100);
      } else if (mode === "rival") {
        corp.trustScore = clamp((corp.trustScore || 50) - 10, 0, 100);
      } else if (mode === "cordial") {
        corp.trustScore = clamp((corp.trustScore || 50) + 4, 0, 100);
      }
      corp.relationshipMode = mode;
      if (w.externalWorld.clients?.[corpId]) {
        w.externalWorld.clients[corpId].trustScore = corp.trustScore;
      }
      if (w.externalWorld.suppliers?.[corpId]) {
        w.externalWorld.suppliers[corpId].trustScore = corp.trustScore;
      }
      const modeNameMap = {
        partner: "พันธมิตรยุทธศาสตร์ร่วมค้า (Strategic Partner +8% ราคาขาย B2B)",
        cordial: "คู่ค้ามิตรภาพ (Cordial Trade Partner)",
        neutral: "การค้าตามกลไกตลาด (Neutral Market)",
        rival: "คู่แข่งทางการค้าโดยตรง (Direct Rival)",
      };
      corp.lastActionDay = day(w);
      corp.lastActionTh = `ปรับสถานะความสัมพันธ์กับบริษัทเราเป็น: ${modeNameMap[mode]}`;
      event(
        w,
        "corporateDiplomacyChanged",
        `🤝 ปรับความสัมพันธ์ทางธุรกิจกับ "${corp.nameTh}" เป็น [${modeNameMap[mode]}]`,
        { corpId, mode, trustScore: corp.trustScore },
      );
      return { ok: true, corpId, mode, trustScore: corp.trustScore };
    }

    // === ERA 2.0.0: Living Global Geopolitics, Foreign Governments, Wars, Treaties & World Chronicle Engine ===
    function ensureGeopolitics(w) {
      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.geopolitics || typeof w.externalWorld.geopolitics !== "object") {
        w.externalWorld.geopolitics = freshGeopolitics(w.seed);
      }
      if (!w.externalWorld.geopolitics.nations) {
        w.externalWorld.geopolitics.nations = freshGeopolitics(w.seed).nations;
      }
      if (!w.externalWorld.geopolitics.tradeCorridors) {
        w.externalWorld.geopolitics.tradeCorridors = freshGeopolitics(w.seed).tradeCorridors;
      }
      if (!w.externalWorld.geopolitics.materialPriceMultipliers) {
        w.externalWorld.geopolitics.materialPriceMultipliers = {};
      }
      if (!w.externalWorld.geopolitics.materialSpotPrices) {
        w.externalWorld.geopolitics.materialSpotPrices = {};
      }
      if (!w.externalWorld.geopolitics.sectorDemandMultipliers) {
        w.externalWorld.geopolitics.sectorDemandMultipliers = freshGeopolitics(w.seed).sectorDemandMultipliers;
      }
      if (!Array.isArray(w.externalWorld.worldChronicle)) {
        w.externalWorld.worldChronicle = [];
      }
      return w.externalWorld.geopolitics;
    }

    function appendWorldChronicle(w, entry) {
      ensureGeopolitics(w);
      const rec = {
        id: entry.id || `wchron-d${day(w)}-${++w.sequence}`,
        day: entry.day || day(w),
        at: entry.at || now(w),
        category: entry.category || "WORLD_GEOPOLITICS",
        badgeTh: entry.badgeTh || "🌍 พงศาวดารโลก",
        regionTh: entry.regionTh || "เศรษฐกิจโลก",
        headlineTh: entry.headlineTh || "ความเคลื่อนไหวภูมิรัฐศาสตร์และตลาดโลก",
        meaningTh: entry.meaningTh || "ส่งผลต่อราคาวัตถุดิบและอุปสงค์สินค้าในตลาด B2B",
        priceImpactSummaryTh: entry.priceImpactSummaryTh || "-",
        isMajor: entry.isMajor !== false,
      };
      w.externalWorld.worldChronicle.unshift(rec);
      if (w.externalWorld.worldChronicle.length > 60) {
        w.externalWorld.worldChronicle.length = 60;
      }
      return rec;
    }

    function recomputeGeopoliticalMultipliers(w) {
      const geo = ensureGeopolitics(w);
      const ap = ensureAssetPortfolio(w);
      const matMults = {};
      const spotPrices = {};
      const secMults = {
        food: 1.0,
        electronics: 1.0,
        automotive: 1.0,
        energy: 1.0,
        biomed: 1.0,
        software: 1.0,
        fleet: 1.0,
        service: 1.0,
      };

      for (const mId of Object.keys(w.catalog.materials || {})) {
        matMults[mId] = 1.0;
      }

      let tariffSum = 0;
      let fxDeltaPctSum = 0;
      for (const nat of Object.values(geo.nations || {})) {
        tariffSum += nat.tariffModPct || 0;
        fxDeltaPctSum += nat.fxModPct || 0;
        for (const [mId, mult] of Object.entries(nat.materialMods || {})) {
          if (matMults[mId] !== undefined) {
            matMults[mId] = Math.round(clamp(matMults[mId] * mult, 0.72, 1.95) * 100) / 100;
          }
        }
        for (const [sId, sMult] of Object.entries(nat.sectorDemandMods || {})) {
          if (secMults[sId] !== undefined) {
            secMults[sId] = Math.round(clamp(secMults[sId] * (1 + (sMult - 1) * 0.65), 0.78, 1.65) * 100) / 100;
          }
        }
      }

      const ev = geo.activeEvent;
      if (ev) {
        for (const [mId, mult] of Object.entries(ev.materialMods || {})) {
          if (matMults[mId] !== undefined) {
            matMults[mId] = Math.round(clamp(matMults[mId] * mult, 0.72, 1.95) * 100) / 100;
          }
        }
        for (const [sId, sMult] of Object.entries(ev.sectorDemandMods || {})) {
          if (secMults[sId] !== undefined) {
            secMults[sId] = Math.round(clamp(secMults[sId] * sMult, 0.78, 1.75) * 100) / 100;
          }
        }
        geo.globalOilIndex = Math.round(clamp((ev.oilMultiplier || 1.0) * (matMults.crude_petro_feedstock || 1.0), 0.8, 1.85) * 100) / 100;
        geo.globalFreightRateMultiplier = Math.round(clamp(ev.freightRateMultiplier || 1.0, 0.85, 1.55) * 100) / 100;
        geo.globalLeadTimeMultiplier = Math.round(clamp(ev.leadTimeMultiplier || 1.0, 0.8, 1.5) * 100) / 100;
      } else {
        geo.globalOilIndex = Math.round(clamp(matMults.crude_petro_feedstock || 1.0, 0.85, 1.6) * 100) / 100;
        geo.globalFreightRateMultiplier = 1.0;
        geo.globalLeadTimeMultiplier = 1.0;
      }

      geo.globalTariffIndexPct = Math.round(tariffSum * 10) / 10;
      geo.fxRateBahtPerUsd = Math.round(clamp(34.5 * (1 + fxDeltaPctSum / 200) + (ev?.fxDeltaBaht || 0), 31.5, 39.5) * 100) / 100;

      for (const [mId, matSpec] of Object.entries(w.catalog.materials || {})) {
        const mult = matMults[mId] || 1.0;
        geo.materialPriceMultipliers[mId] = mult;
        spotPrices[mId] = Math.max(100, Math.round(matSpec.unitCost * mult));
        // Sync with assetPortfolio.marketPriceIndex so B2B material sales and asset ROI immediately reflect geopolitical prices!
        ap.marketPriceIndex[mId] = Math.round(clamp((ap.marketPriceIndex[mId] || 1.0) * 0.35 + mult * 0.65, 0.75, 1.95) * 100) / 100;
      }
      geo.materialSpotPrices = spotPrices;
      geo.sectorDemandMultipliers = secMults;

      if (!geo.tradeCorridors) geo.tradeCorridors = freshGeopolitics(w.seed).tradeCorridors;
      for (const [cid, cSpec] of Object.entries(D.TRADE_CORRIDORS || {})) {
        const cNations = (cSpec.nations || []).map((nid) => geo.nations?.[nid]).filter(Boolean);
        const avgTariff = cNations.length
          ? cNations.reduce((s, n) => s + (n.tariffModPct || 0), 0) / cNations.length
          : 0;
        const tariffPct = Math.round(((cSpec.baseTariffPct || 0) + avgTariff) * 10) / 10;
        const leadTimeMod = Math.round(clamp((cSpec.baseLeadTimeMod || 1.0) * (geo.globalLeadTimeMultiplier || 1.0) * (1 + Math.max(0, tariffPct) * 0.008), 0.75, 1.55) * 100) / 100;
        const secAvg = (cSpec.primarySectors || []).length
          ? (cSpec.primarySectors || []).reduce((s, secId) => s + (secMults[secId] || 1.0), 0) / cSpec.primarySectors.length
          : 1.0;
        const demandMod = Math.round(clamp(secAvg, 0.8, 1.6) * 100) / 100;
        const status =
          tariffPct >= 7 || leadTimeMod >= 1.18
            ? "restricted"
            : demandMod >= 1.14 && tariffPct <= 2
              ? "booming"
              : leadTimeMod >= 1.1
                ? "congested"
                : "open";
        geo.tradeCorridors[cid] = {
          id: cid,
          nameTh: cSpec.nameTh,
          icon: cSpec.icon,
          nations: [...(cSpec.nations || [])],
          primarySectors: [...(cSpec.primarySectors || [])],
          keyMaterials: [...(cSpec.keyMaterials || [])],
          status,
          tariffPct,
          leadTimeMod,
          demandMod,
          summaryTh: cSpec.descTh,
        };
      }
      W.apply(w);
      return geo;
    }

    function changeForeignRegime(w, nationId = "US", regimeId = null, options = {}) {
      const geo = ensureGeopolitics(w);
      const nSpec = D.GLOBAL_NATIONS?.[nationId];
      if (!nSpec || !Array.isArray(nSpec.regimes) || !nSpec.regimes.length) {
        return { ok: false, code: "unknownNation", message: "ไม่พบประเทศหรือกลุ่มเศรษฐกิจที่ระบุ" };
      }
      const curState = geo.nations[nationId] || freshGeopolitics(w.seed).nations[nationId];
      let nextReg = regimeId ? nSpec.regimes.find((r) => r.id === regimeId) : null;
      if (!nextReg) {
        if (regimeId) {
          return { ok: false, code: "unknownRegime", message: "ไม่พบรัฐบาลหรือขั้วนโยบายที่ระบุ" };
        }
        const curIdx = nSpec.regimes.findIndex((r) => r.id === curState.activeRegimeId);
        nextReg = nSpec.regimes[(curIdx + 1) % nSpec.regimes.length];
      }

      curState.activeRegimeId = nextReg.id;
      curState.activeRegimeNameTh = nextReg.nameTh;
      curState.leaderStyleTh = nextReg.leaderStyleTh;
      curState.tariffModPct = nextReg.tariffModPct || 0;
      curState.fxModPct = nextReg.fxModPct || 0;
      curState.materialMods = { ...(nextReg.materialMods || {}) };
      curState.sectorDemandMods = { ...(nextReg.sectorDemandMods || {}) };
      curState.summaryTh = nextReg.summaryTh;
      curState.lastChangedDay = day(w);
      curState.regimeChangeCount = (curState.regimeChangeCount || 0) + 1;
      geo.nations[nationId] = curState;
      geo.totalRegimeShifts = (geo.totalRegimeShifts || 0) + 1;
      if (options.manual) {
        geo.customEventTriggered = true;
        if (options.applySpotPriceToPO !== undefined) geo.applySpotPriceToPO = Boolean(options.applySpotPriceToPO);
      }

      recomputeGeopoliticalMultipliers(w);

      const matEffectsTh = Object.entries(nextReg.materialMods || {})
        .map(([mId, mult]) => `${w.catalog.materials[mId]?.nameTh || mId} ×${mult}`)
        .join(", ");
      const chron = appendWorldChronicle(w, {
        category: "REGIME_CHANGE",
        badgeTh: `🗳️ เปลี่ยนรัฐบาล ${nSpec.flag} ${nSpec.shortNameTh}`,
        regionTh: nSpec.nameTh,
        headlineTh: `${nSpec.flag} ${nSpec.shortNameTh} เปลี่ยนขั้วรัฐบาลเป็น "${nextReg.nameTh}" (${nextReg.leaderStyleTh})`,
        meaningTh: nextReg.summaryTh,
        priceImpactSummaryTh: matEffectsTh || `ภาษีการค้า ${nextReg.tariffModPct >= 0 ? "+" : ""}${nextReg.tariffModPct}% • ค่าเงิน ${geo.fxRateBahtPerUsd} บาท/USD`,
        isMajor: true,
      });

      if (!options.silent) {
        event(
          w,
          "foreignRegimeChanged",
          `🗳️🌍 [ภูมิรัฐศาสตร์โลก] ${nSpec.flag} ${nSpec.shortNameTh} เปลี่ยนรัฐบาลเป็น "${nextReg.nameTh}" — ${nextReg.summaryTh}`,
          { nationId, regimeId: nextReg.id, fxRateBahtPerUsd: geo.fxRateBahtPerUsd },
        );
      }
      return {
        ok: true,
        nationId,
        regimeId: nextReg.id,
        regimeNameTh: nextReg.nameTh,
        fxRateBahtPerUsd: geo.fxRateBahtPerUsd,
        materialPriceMultipliers: { ...geo.materialPriceMultipliers },
        chronicleEntry: chron,
      };
    }

    function triggerGeopoliticalEvent(w, eventId = null, options = {}) {
      const geo = ensureGeopolitics(w);
      const allEvents = Object.values(D.GEOPOLITICAL_EVENTS || {});
      if (!allEvents.length) return { ok: false, code: "noEvents", message: "ไม่มีคลังเหตุการณ์ภูมิรัฐศาสตร์" };

      let evSpec = eventId ? D.GEOPOLITICAL_EVENTS?.[eventId] : null;
      if (!evSpec) {
        if (eventId) return { ok: false, code: "unknownGeopoliticalEvent", message: "ไม่พบเหตุการณ์ภูมิรัฐศาสตร์ที่ระบุ" };
        const h = seedHash(`${w.seed}:geoev:${day(w)}:${geo.totalGlobalEvents || 0}`);
        evSpec = allEvents[h % allEvents.length];
      }

      if (evSpec.triggerNationId && evSpec.triggerRegimeId) {
        changeForeignRegime(w, evSpec.triggerNationId, evSpec.triggerRegimeId, { silent: true });
      }

      const curDay = day(w);
      W.scenario(w,evSpec.id,curDay,evSpec.durationDays || 5);
      geo.activeEvent = {
        ...clone(evSpec),
        startedDay: curDay,
        expiresDay: curDay + (evSpec.durationDays || 5),
      };
      geo.eventHistory.unshift({
        id: evSpec.id,
        titleTh: evSpec.titleTh,
        category: evSpec.category,
        badgeTh: evSpec.badgeTh,
        startedDay: curDay,
      });
      if (geo.eventHistory.length > 30) geo.eventHistory.pop();
      geo.totalGlobalEvents = (geo.totalGlobalEvents || 0) + 1;
      if (options.manual) {
        geo.customEventTriggered = true;
        if (options.applySpotPriceToPO !== undefined) geo.applySpotPriceToPO = Boolean(options.applySpotPriceToPO);
      }

      recomputeGeopoliticalMultipliers(w);

      // Apply stock market sector shock if stockMarket exists
      if (w.externalWorld?.stockMarket?.indices && evSpec.stockMods) {
        for (const [symKey, deltaPct] of Object.entries(evSpec.stockMods)) {
          for (const idxObj of Object.values(w.externalWorld.stockMarket.indices)) {
            if (idxObj.symbol === symKey || idxObj.id.toUpperCase().includes(symKey)) {
              const nextVal = Math.max(100, Math.round(idxObj.value * (1 + deltaPct / 100) * 10) / 10);
              idxObj.changePct = Math.round(((nextVal - idxObj.value) / idxObj.value) * 1000) / 10;
              idxObj.value = nextVal;
            }
          }
        }
      }

      // Adjust open freight quote rates by globalFreightRateMultiplier
      if (w.fleetTransport && Array.isArray(w.fleetTransport.openQuotes)) {
        for (const q of w.fleetTransport.openQuotes) {
          if (q.status === "quoted") {
            const routeSpec = (D.FREIGHT_ROUTES || []).find((r) => r.id === q.routeId);
            const baseRate = routeSpec ? routeSpec.baseRateSatang : q.offeredRateSatang;
            q.offeredRateSatang = Math.round(baseRate * (geo.globalFreightRateMultiplier || 1.0));
          }
        }
      }

      const matSummaryTh = Object.entries(evSpec.materialMods || {})
        .slice(0, 5)
        .map(([mId, mult]) => `${w.catalog.materials[mId]?.nameTh || mId} (${mult >= 1 ? "+" : ""}${Math.round((mult - 1) * 100)}%)`)
        .join(", ");

      const chron = appendWorldChronicle(w, {
        category: evSpec.category === "war_conflict" ? "WAR_CONFLICT" : evSpec.category === "international_cooperation" ? "INTL_COOPERATION" : "WORLD_GEOPOLITICS",
        badgeTh: evSpec.badgeTh,
        regionTh: evSpec.regionTh,
        headlineTh: `${evSpec.badgeTh}: ${evSpec.titleTh}`,
        meaningTh: `${evSpec.chronicleTh} (💡 ข้อเสนอแนะเชิงกลยุทธ์: ${evSpec.strategicAdviceTh})`,
        priceImpactSummaryTh: matSummaryTh || `ดัชนีน้ำมัน ×${geo.globalOilIndex} • ค่าระวาง ×${geo.globalFreightRateMultiplier}`,
        isMajor: true,
      });

      if (!options.silent) {
        event(
          w,
          "geopoliticalEventTriggered",
          `${evSpec.badgeTh} [เหตุการณ์โลก] ${evSpec.titleTh} — ${evSpec.chronicleTh}`,
          {
            eventId: evSpec.id,
            category: evSpec.category,
            oilMultiplier: geo.globalOilIndex,
            freightRateMultiplier: geo.globalFreightRateMultiplier,
          },
        );
      }

      return {
        ok: true,
        eventId: evSpec.id,
        activeEvent: geo.activeEvent,
        fxRateBahtPerUsd: geo.fxRateBahtPerUsd,
        globalOilIndex: geo.globalOilIndex,
        materialPriceMultipliers: { ...geo.materialPriceMultipliers },
        sectorDemandMultipliers: { ...geo.sectorDemandMultipliers },
        chronicleEntry: chron,
      };
    }

    function simulateGlobalGeopoliticsDaily(w, completedDay) {
      const geo = ensureGeopolitics(w);
      if (geo.activeEvent && completedDay >= geo.activeEvent.expiresDay) geo.activeEvent = null;
      W.step(w, completedDay);
      recomputeGeopoliticalMultipliers(w);
    }

    function simulateOffsiteEcosystemDaily(w, completedDay) {
      if (!w.externalWorld) return;
      const ext = w.externalWorld;
      if (!ext.corporations) {
        ext.corporations = freshExternalWorld(w.seed).corporations;
      }
      if (!Array.isArray(ext.ecosystemFeed)) ext.ecosystemFeed = [];
      if (!Array.isArray(ext.b2bMaterialDemands)) ext.b2bMaterialDemands = [];

      // Corporate activity and real unmet purchase demands are produced by World.step.
      // This legacy entry point retains only the player's autonomous surplus selling.
      // 3. Autonomous B2B Surplus Material Selling (when company owns external assets and has large surplus >= 36 in opening stock)
      if (
        w.policies.autoAccept &&
        ext.assetPortfolio?.supplyChainStrategy !== "asset_light" &&
        Object.keys(ext.assetPortfolio?.ownedAssets || {}).length > 0
      ) {
        const minSurplusThreshold = w.externalWorld?.ceoDirective?.id === "cash_shield" ? 20 : 36;
        for (const dem of ext.b2bMaterialDemands) {
          const openStock = w.inventory.opening[dem.materialId] || 0;
          const freeStock = safeAvailableToDeduct(w, dem.materialId);
          if (openStock >= minSurplusThreshold && freeStock >= minSurplusThreshold) {
            sellMaterialB2B(w, dem.materialId, Math.min(4, dem.recommendedQty), dem.buyerCorpId, { auto: true });
            break;
          }
        }
      }
    }

    function runMidstreamRefining(w, options = {}) {
      if (options.materialId) {
        return craftMaterialRecipe(w, options.materialId, options.batches || 2, {
          ignoreTechGate: Boolean(options.ignoreTechGate),
          ignoreCapitalGate: Boolean(options.ignoreCapitalGate),
        });
      }
      const ap = ensureAssetPortfolio(w);
      if (ap.supplyChainStrategy === "asset_light" && !options.force) {
        return { ok: true, refinedBatches: 0, unitsRefined: 0 };
      }
      const hasMill = Boolean(w.facilities?.constructedPlots?.includes("refineryMill"));
      let totalBatches = 0;

      for (const chain of Object.values(D.PRODUCTION_CHAINS || {})) {
        if (options.chainId && chain.id !== options.chainId) continue;
        if (chain.autoRun === false && options.chainId !== chain.id) continue;
        const cfg = ap.chainSettings[chain.id];
        if (!cfg || (!cfg.enabled && !options.force)) continue;
        const outIds = Object.keys(chain.outputs || {});
        const primaryOut = outIds[0];
        if (!primaryOut || !D.MATERIAL_RECIPES?.[primaryOut]) continue;
        if (!options.ignoreTechGate && !materialReady(w, primaryOut)) continue;
        const alreadyActive = Object.values(w.plant?.refineryBatches || {}).some(
          (b) => b.materialId === primaryOut && !["released", "cancelled", "scrapped"].includes(b.status),
        );
        if (alreadyActive) continue;
        const maxDailyBatches = options.maxBatches || (hasMill ? chain.batchesPerDayBase * 2 : chain.batchesPerDayBase);
        const res = craftMaterialRecipe(w, primaryOut, maxDailyBatches, {
          silent: true,
          ignoreTechGate: Boolean(options.ignoreTechGate),
          ignoreCapitalGate: true,
        });
        if (res.ok && res.batches > 0) {
          totalBatches += res.batches;
        }
      }
      return { ok: true, refinedBatches: totalBatches, unitsRefined: 0, queued: totalBatches > 0 };
    }

    function acquireExternalAsset(w, assetId, options = {}) {
      const ap = ensureAssetPortfolio(w);
      const ag = ensureAgriculture(w);
      const spec = D.EXTERNAL_ASSETS?.[assetId];
      if (!spec) return { ok: false, code: "unknownAsset", message: "ไม่พบสินทรัพย์ภายนอกที่ระบุ" };

      const existing = ap.ownedAssets[assetId];
      if (existing && !options.upgrade) {
        return { ok: false, code: "alreadyOwned", message: "บริษัทถือครองสินทรัพย์ภายนอกแห่งนี้อยู่แล้ว" };
      }

      const targetLevel = existing ? (existing.level || 1) + 1 : 1;
      if (targetLevel > 3) {
        return { ok: false, code: "maxAssetLevel", message: "สินทรัพย์ภายนอกพัฒนาถึงระดับสูงสุด (Lv.3) แล้ว" };
      }

      const cost = existing ? Math.round(spec.cost * 0.65 * existing.level) : spec.cost;
      if (options.freeGrant && w.finance.cash < cost) {
        w.finance.openingCash += cost;
        w.finance.cash += cost;
      }
      if (w.finance.cash < cost) {
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอสำหรับเข้าซื้อหรือพัฒนาสินทรัพย์ภายนอก" };
      }

      post(w, "expansion", -cost, (existing ? "extAssetUpgrade:" : "extAsset:") + assetId + ":L" + targetLevel);
      const ceo = w.people.find((p) => p.employed && p.role === "coordinator") || w.people[0];

      if (!existing) {
        ap.ownedAssets[assetId] = {
          id: assetId,
          nameTh: spec.nameTh,
          shortNameTh: spec.shortNameTh,
          category: spec.category,
          resourceType: spec.resourceType || "general",
          icon: spec.icon,
          level: 1,
          acquiredDay: day(w),
          condition: 100,
          active: true,
          totalHarvested: 0,
          totalDividendSatang: 0,
          // Resource-specific state (Chapter 23: Finite Mine Reserve, Renewable Forest Tree Stock, Livestock Herd, Flow Cap)
          reserveRemaining: spec.resourceType === "finite_mine" ? (spec.initialReserveUnits || 420) : null,
          oreGrade: spec.resourceType === "finite_mine" ? (spec.oreGrade || 0.9) : null,
          tailingsGenerated: spec.resourceType === "finite_mine" ? 0 : null,
          treeStock:
            spec.resourceType === "renewable_forest" || spec.resourceType === "plantation_tapping"
              ? (spec.initialTreeStock || 120)
              : null,
          saplingCohorts: spec.resourceType === "renewable_forest" ? [] : null,
          herdCount: spec.resourceType === "livestock_herd" ? (spec.initialHerdCount || 24) : null,
          dailyFlowCap: spec.resourceType === "environmental_flow" ? (spec.dailyWaterFlowCap || 10) : null,
        };
        if (spec.fleetBonus && w.logistics) {
          w.logistics.fleetCount = (w.logistics.fleetCount || 2) + spec.fleetBonus;
        }
        if (spec.esgBonus) {
          w.reputation = clamp(w.reputation + spec.esgBonus, 0, 100);
        }
        if (spec.marketShareBonus && w.externalWorld) {
          w.externalWorld.ourMarketSharePct =
            Math.round(clamp((w.externalWorld.ourMarketSharePct || 2.0) + spec.marketShareBonus, 1, 60) * 10) / 10;
        }
        if (!w.capabilities) w.capabilities = freshCapabilities();
        if (spec.linkedChainId && D.PRODUCTION_CHAINS?.[spec.linkedChainId]) {
          w.capabilities.unlockedChains[spec.linkedChainId] = true;
          w.capabilities.domains.agri_soil_science = Math.min(100, (w.capabilities.domains.agri_soil_science || 25) + 10);
          const ch = D.PRODUCTION_CHAINS[spec.linkedChainId];

        }
      } else {
        existing.level = targetLevel;
        existing.condition = 100;
        if (spec.resourceType === "finite_mine") {
          existing.reserveRemaining = (existing.reserveRemaining || 0) + 220;
        } else if (spec.resourceType === "renewable_forest" || spec.resourceType === "plantation_tapping") {
          existing.treeStock = (existing.treeStock || 80) + 60;
        } else if (spec.resourceType === "livestock_herd") {
          existing.herdCount = (existing.herdCount || 24) + 12;
        }
        if (spec.esgBonus) {
          w.reputation = clamp(w.reputation + 1, 0, 100);
        }
      }

      // Grant starter seed / water stock included with the farm deed (NOT finished goods or instant free harvest!)
      const starterList = [];
      for (const [matId, baseQty] of Object.entries(spec.starterSeeds || {})) {
        if (!Object.hasOwn(w.inventory.materials, matId)) continue;
        w.inventory.opening[matId] += baseQty;
        w.inventory.materials[matId] += baseQty;
        starterList.push(`${w.catalog.materials[matId]?.nameTh || matId} +${baseQty}`);
      }

      // If this is an agricultural plot asset, register its plot in w.agriculture and start planting using the seed stock!
      if (spec.resourceType === "agricultural_plot" && spec.cropId) {
        const plotId = "plot_" + assetId;
        if (!ag.plots[plotId]) {
          ag.plots[plotId] = createAgriPlotState(spec.cropId, assetId, plotId);
        }
        if (ag.plots[plotId].stage === "idle" || ag.plots[plotId].stage === "fallow") {
          plantCropPlot(w, plotId, { silent: true });
        }
      }

      event(
        w,
        existing ? "externalAssetUpgraded" : "externalAssetAcquired",
        `${spec.icon} ${ceo ? ceo.name : "ผู้บริหาร"} ${existing ? "ขยายกำลังการผลิต" : "เข้าซื้อกิจการสินทรัพย์ภายนอก"} "${spec.nameTh}" (Lv.${targetLevel}) สำเร็จ!${starterList.length ? " รับเมล็ดพันธุ์และปัจจัยตั้งต้นเข้าคลัง: " + starterList.join(", ") : ""}`,
        {
          assetId,
          level: targetLevel,
          cost,
          personId: ceo ? ceo.id : null,
        },
      );
      return { ok: true, assetId, level: targetLevel };
    }

    function evaluateExternalAssetsDaily(w, completedDay) {
      const ap = ensureAssetPortfolio(w);
      const ag = ensureAgriculture(w);
      const ownedList = Object.values(ap.ownedAssets || {});

      // 1. Update fluctuating commodity market price indices (0.88x - 1.25x)
      for (const matId of Object.keys(w.catalog.materials || {})) {
        const h = seedHash(`${w.seed}:matIdx:${matId}:${completedDay}`);
        ap.marketPriceIndex[matId] = Math.round((0.88 + (h % 38) / 100) * 100) / 100;
      }

      // Age stored seed batches slightly each day (Chapter 23 Section 4: germination degrades with storage age)
      for (const sb of Object.values(ag.seedBatches || {})) {
        sb.ageDays = (sb.ageDays || 0) + 1;
        sb.germinationRate = Math.round(clamp(0.95 - sb.ageDays * 0.02, 0.5, 0.96) * 100) / 100;
      }
      ag.waterSource.usedToday = 0;

      // 2. Process Non-Crop Resource Assets according to their true physical/biological mechanism (Chapter 23 Section 2)
      for (const rec of ownedList) {
        if (!rec || !rec.active) continue;
        const spec = D.EXTERNAL_ASSETS?.[rec.id];
        if (!spec) continue;
        const lvMult = 1 + ((rec.level || 1) - 1) * 0.45;
        const harvestItems = [];

        if (spec.resourceType === "agricultural_plot") {
          // Agricultural plots are driven by the 8-stage cultivation engine (plant -> grow -> harvest -> save seed -> replant)
          const plotId = "plot_" + rec.id;
          if (!ag.plots[plotId] && spec.cropId) {
            ag.plots[plotId] = createAgriPlotState(spec.cropId, rec.id, plotId);
          }
          const plot = ag.plots[plotId];
          if (plot) {
            if (plot.stage === "idle" || plot.stage === "fallow") {
              plantCropPlot(w, plotId, { silent: true });
            }
            if (plot.stage === "growing" && plot.growthMinutes < plot.targetGrowthMinutes) {
              plot.growthMinutes = Math.min(plot.targetGrowthMinutes, plot.growthMinutes + 1440);
            }
            if (plot.growthMinutes >= plot.targetGrowthMinutes || plot.stage === "ready_to_harvest") {
              harvestCropPlot(w, plotId, { silent: true });
              if (
                plot.soilNutrients < 55 &&
                (safeAvailableToDeduct(w, "npk_fertilizer") >= 1 || safeAvailableToDeduct(w, "organic_compost") >= 1)
              ) {
                careCropPlot(w, plotId, { applyWater: false, applyFertilizer: true });
              }
              if (plot.soilMoisture < 55 && safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
                careCropPlot(w, plotId, { applyWater: true, waterUnits: 1, applyFertilizer: false });
              }
              plantCropPlot(w, plotId, { silent: true });
            }
          }
        } else if (spec.resourceType === "finite_mine") {
          // Finite Mine: Extracts raw ores ONLY, depleting reserveRemaining and generating tailings
          if ((rec.reserveRemaining ?? 420) > 0) {
            for (const [matId, baseQty] of Object.entries(spec.harvestYields || {})) {
              if (!Object.hasOwn(w.inventory.materials, matId)) continue;
              if ((rec.reserveRemaining || 0) <= 0) break;
              const desired = Math.max(1, Math.round(baseQty * lvMult * (rec.oreGrade || 0.9)));
              const extracted = Math.min(rec.reserveRemaining, desired);
              if (extracted > 0) {
                rec.reserveRemaining -= extracted;
                rec.tailingsGenerated = (rec.tailingsGenerated || 0) + Math.max(1, Math.round(extracted * 0.3));
                w.inventory.opening[matId] += extracted;
                w.inventory.materials[matId] += extracted;
                rec.totalHarvested = (rec.totalHarvested || 0) + extracted;
                ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + extracted;
                harvestItems.push(`${w.catalog.materials[matId]?.nameTh || matId} +${extracted} (สำรองเหลือ ${rec.reserveRemaining})`);
              }
            }
          }
        } else if (spec.resourceType === "renewable_forest") {
          // Renewable Forest: Mature cohorts regrow into treeStock; logging deducts treeStock and replants saplings
          if (Array.isArray(rec.saplingCohorts)) {
            const stillGrowing = [];
            for (const cohort of rec.saplingCohorts) {
              if (completedDay >= cohort.readyDay) {
                rec.treeStock = (rec.treeStock || 0) + cohort.count;
              } else {
                stillGrowing.push(cohort);
              }
            }
            rec.saplingCohorts = stillGrowing;
          }
          const availTrees = rec.treeStock ?? 120;
          if (availTrees > 0) {
            const cutQty = Math.min(availTrees, Math.max(1, Math.round(6 * lvMult)));
            rec.treeStock -= cutQty;
            w.inventory.opening.timber_bamboo_log += cutQty;
            w.inventory.materials.timber_bamboo_log += cutQty;
            rec.totalHarvested = (rec.totalHarvested || 0) + cutQty;
            ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + cutQty;
            harvestItems.push(`ท่อนไม้เศรษฐกิจ +${cutQty} (ต้นไม้คงเหลือ ${rec.treeStock})`);
            // Replant saplings if water/seedling available
            if (!Array.isArray(rec.saplingCohorts)) rec.saplingCohorts = [];
            if (safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
              safeDeductMaterial(w, "raw_water_m3", 1);
              rec.saplingCohorts.push({ plantedDay: completedDay, readyDay: completedDay + 2, count: cutQty });
            } else {
              rec.saplingCohorts.push({ plantedDay: completedDay, readyDay: completedDay + 3, count: Math.max(1, Math.floor(cutQty * 0.6)) });
            }
          }
        } else if (spec.resourceType === "livestock_herd") {
          // Dairy Herd: Starts biological feeding & digestion cycle; milk is yielded after elapsed digestion time in stepAgricultureAndResources!
          const herdRes = feedLivestockHerd(w, rec.id, { silent: true });
          if (herdRes.ok && herdRes.milkYield > 0) {
            rec.totalHarvested = (rec.totalHarvested || 0) + herdRes.milkYield + herdRes.manureYield;
            ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + herdRes.milkYield + herdRes.manureYield;
            harvestItems.push(`น้ำนมโคสด +${herdRes.milkYield}, ปุ๋ยหมักมูลโค +${herdRes.manureYield}`);
          }
        } else if (spec.resourceType === "plantation_tapping") {
          // Rubber Plantation: Taps natural_latex only (never free polymer_resin!)
          const latexQty = Math.max(1, Math.round(7 * lvMult));
          w.inventory.opening.natural_latex += latexQty;
          w.inventory.materials.natural_latex += latexQty;
          rec.totalHarvested = (rec.totalHarvested || 0) + latexQty;
          ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + latexQty;
          harvestItems.push(`น้ำยางพาราสด +${latexQty}`);
        } else if (spec.resourceType === "environmental_flow") {
          // Environmental Flow: Pumps raw_water_m3 bounded by dailyFlowCap
          const flowCap = Math.round((rec.dailyFlowCap || 10) * lvMult);
          const waterQty = Math.min(flowCap, Math.max(2, Math.round(8 * lvMult)));
          w.inventory.opening.raw_water_m3 += waterQty;
          w.inventory.materials.raw_water_m3 += waterQty;
          ag.waterSource.usedToday = waterQty;
          rec.totalHarvested = (rec.totalHarvested || 0) + waterQty;
          ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + waterQty;
          harvestItems.push(`น้ำดิบธรรมชาติ +${waterQty} ลบ.ม. (เพดานสูบ ${flowCap}/วัน)`);
        }

        if (harvestItems.length > 0) {
          ap.harvestHistory.unshift({
            day: completedDay,
            assetId: rec.id,
            assetNameTh: spec.shortNameTh,
            yieldsTh: harvestItems.join(", "),
          });
          if (ap.harvestHistory.length > 40) ap.harvestHistory.pop();
        }

        // Operating resource assets (farms, mines, forests, livestock) produce physical materials into inventory;
        // ONLY commercial network/infrastructure partnerships (port terminal, retail network, cold-chain hub, solar feed-in) generate cash service dividends!
        const isCommercialNetworkAsset = ["deepsea_port_terminal", "retail_flagship_network", "offsite_solar_wind_farm", "cold_chain_hub"].includes(rec.id);
        const netDiv = isCommercialNetworkAsset ? Math.round(((spec.dailyDividend || 0) - (spec.dailyUpkeep || 0)) * lvMult) : 0;
        if (netDiv > 0 && Number.isSafeInteger(w.finance.cash + netDiv)) {
          post(w, "sales", netDiv, `assetDiv:${rec.id}:d${completedDay}`);
          rec.totalDividendSatang = (rec.totalDividendSatang || 0) + netDiv;
          ap.totalAssetDividendsSatang = (ap.totalAssetDividendsSatang || 0) + netDiv;
        }
      }

      // 3. Run Midstream Production Chains (converting harvested paddy_grain -> milled_rice -> artisan_flour, timber -> pack_carton, bauxite -> alumina_billet, iron_ore -> structural_steel_plate, etc.)
      if (ownedList.length > 0 && ap.supplyChainStrategy !== "asset_light") {
        const availPaddy = safeAvailableToDeduct(w, "paddy_grain");
        if (availPaddy >= 2) {
          craftMaterialRecipe(w, "milled_rice", Math.min(4, Math.floor(availPaddy / 2)), { silent: true, ignoreCapitalGate: true });
        }
        const availTimber = safeAvailableToDeduct(w, "timber_bamboo_log");
        if (availTimber >= 2) {
          craftMaterialRecipe(w, "pack_carton", Math.min(3, Math.floor(availTimber / 2)), { silent: true, ignoreCapitalGate: true });
        }
        if (safeAvailableToDeduct(w, "phosphate_potash_rock") >= 1 && safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
          craftMaterialRecipe(w, "npk_fertilizer", 1, { silent: true, ignoreCapitalGate: true });
        }
        if (safeAvailableToDeduct(w, "bauxite_ore") >= 2 && safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
          craftMaterialRecipe(w, "alumina_billet", 1, { silent: true, ignoreCapitalGate: true });
        }
        if (safeAvailableToDeduct(w, "iron_ore") >= 2) {
          craftMaterialRecipe(w, "structural_steel_plate", 1, { silent: true, ignoreCapitalGate: true });
        }
        if (safeAvailableToDeduct(w, "alumina_billet") >= 2 && safeAvailableToDeduct(w, "polymer_resin") >= 1) {
          craftMaterialRecipe(w, "aluminum_extrusion_profile", 1, { silent: true, ignoreCapitalGate: true });
        }
        runMidstreamRefining(w);
      }

      // 4. Manage Smelting Red Mud & Mineral Slag Byproduct Ecology (mineral_slag_mud)
      const slagStock = safeAvailableToDeduct(w, "mineral_slag_mud");
      if (slagStock >= 2 && (w.facilities?.constructedPlots?.includes("waterPlant") || w.policies?.autoAccept)) {
        treatMineralSlag(w, Math.min(2, Math.floor(slagStock / 2)), { silent: true });
      } else if (slagStock > 8 && w.finance.cash >= 15000) {
        const containmentFee = Math.min(w.finance.cash, (slagStock - 8) * 3500);
        if (containmentFee > 0) {
          post(w, "equipment", -containmentFee, `slagContainment:d${completedDay}`);
        }
      }
    }

    function treatMineralSlag(w, batches = 1, options = {}) {
      if (!Object.hasOwn(w.inventory.materials, "mineral_slag_mud")) {
        return { ok: false, code: "unknownMaterial", message: "ไม่มีระบบกากตะกรันเตาถลุงในคลังข้อมูล" };
      }
      const reqBatches = Math.max(1, Math.min(25, Math.floor(Number(batches) || 1)));
      const availSlag = safeAvailableToDeduct(w, "mineral_slag_mud");
      if (availSlag < 1) {
        return { ok: false, code: "insufficientSlag", message: "ไม่มีกากตะกรันเตาถลุงหรือโคลนแดง (mineral_slag_mud) ค้างในคลังที่ต้องบำบัด" };
      }
      const slagPerBatch = availSlag >= 2 ? 2 : 1;
      const actualBatches = Math.min(reqBatches, Math.floor(availSlag / slagPerBatch));
      const slagUsed = actualBatches * slagPerBatch;
      safeDeductMaterial(w, "mineral_slag_mud", slagUsed);
      let waterUsed = 0;
      if (safeAvailableToDeduct(w, "raw_water_m3") >= 1) {
        waterUsed = Math.min(actualBatches, safeAvailableToDeduct(w, "raw_water_m3"));
        safeDeductMaterial(w, "raw_water_m3", waterUsed);
      }
      const compostOut = actualBatches;
      const fluxOut = slagUsed >= 2 ? Math.max(1, Math.floor(slagUsed / 2)) : 0;
      grantUnpurchasedMaterial(w, "organic_compost", compostOut);
      if (fluxOut > 0 && Object.hasOwn(w.inventory.materials, "coke_reducing_flux")) {
        grantUnpurchasedMaterial(w, "coke_reducing_flux", fluxOut);
      }
      if (w.agriculture?.waterSource) {
        w.agriculture.waterSource.wastewaterTreated = (w.agriculture.waterSource.wastewaterTreated || 0) + slagUsed;
      }
      if (!options.silent) {
        event(
          w,
          "mineralSlagTreated",
          `♻️ บำบัดและปรับสภาพกากตะกรันเตาถลุง/โคลนแดงบอกไซต์ ×${slagUsed} หน่วย สำเร็จ ➔ ได้วัสดุปรับปรุงดิน/ปุ๋ยหมัก +${compostOut} ถุง${fluxOut > 0 ? ` และกู้คืนหินปูนฟลักซ์ +${fluxOut} หน่วย` : ""}`,
          { slagUsed, waterUsed, compostOut, fluxOut },
        );
      }
      return { ok: true, slagUsed, waterUsed, compostOut, fluxOut };
    }

    // === CHAPTER 19: Fleet Freight Transport Business Engine ===
    function ensureFleetTransport(w) {
      if (!w.fleetTransport || typeof w.fleetTransport !== "object") {
        w.fleetTransport = freshFleetTransport(w.seed);
      }
      if (!w.fleetTransport.vehicles) w.fleetTransport.vehicles = {};
      if (!Array.isArray(w.fleetTransport.openQuotes)) w.fleetTransport.openQuotes = [];
      if (!w.fleetTransport.contracts) w.fleetTransport.contracts = {};
      if (!w.fleetTransport.cargoCustody) w.fleetTransport.cargoCustody = {};
      if (!w.fleetTransport.metrics) w.fleetTransport.metrics = freshFleetTransport(w.seed).metrics;
      if (!Array.isArray(w.fleetTransport.history)) w.fleetTransport.history = [];
      return w.fleetTransport;
    }

    function getFleetUpfrontCost(spec, mode = "owned") {
      if (!spec) return 0;
      if (mode === "leased") {
        return Number.isSafeInteger(spec.leaseDepositSatang)
          ? spec.leaseDepositSatang
          : (spec.dailyLeaseCost || 180000) * 5;
      }
      return spec.purchaseCost || 3500000;
    }

    function acquireFleetVehicle(w, vehicleTypeId = "dry_6w", options = {}) {
      const ft = ensureFleetTransport(w);
      const spec = D.FLEET_VEHICLES?.[vehicleTypeId];
      if (!spec) return { ok: false, code: "unknownVehicleType", message: "ไม่พบประเภทรถบรรทุกที่ระบุ" };
      const optsObj = typeof options === "string" ? { ownership: options } : (options || {});
      const mode = optsObj.ownership === "leased" || optsObj.mode === "leased" ? "leased" : "owned";
      const upfrontCost = getFleetUpfrontCost(spec, mode);
      if (optsObj.freeGrant && w.finance.cash < upfrontCost) {
        w.finance.openingCash += upfrontCost;
        w.finance.cash += upfrontCost;
      }
      if (w.finance.cash < upfrontCost) {
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอสำหรับจัดซื้อหรือเช่ารถบรรทุกเข้ากองรถ" };
      }
      const nextIdx = Object.keys(ft.vehicles).length + 1;
      const vid = "truck-" + nextIdx;
      const plateNum = 1000 + ((seedHash(w.seed + ":" + vid) % 8900));
      post(w, "equipment", -upfrontCost, `fleetAcquire:${vid}:${vehicleTypeId}`);
      ft.vehicles[vid] = {
        id: vid,
        typeId: spec.id,
        nameTh: `${spec.nameTh} #${nextIdx}`,
        plate: `71-${plateNum} กทม.`,
        ownership: mode,
        maxWeightKg: spec.maxWeightKg,
        maxVolumeM3: spec.maxVolumeM3,
        baseLitersPerKm: spec.baseLitersPerKm,
        supportedCargoTypes: [...spec.supportedCargoTypes],
        condition: 100,
        tireCondition: 100,
        odometerKm: 0,
        status: "idle",
        assignedDriverId: null,
        assignedDriverName: null,
        activeContractId: null,
        internalOrderId: null,
        returnRemainingKm: 0,
        tripsCompleted: 0,
      };
      if (w.logistics) {
        w.logistics.fleetCount = Object.keys(ft.vehicles).length;
      }
      event(
        w,
        "fleetVehicleAcquired",
        `${spec.icon} กองรถขนส่งบริษัทจัดหา "${ft.vehicles[vid].nameTh}" ทะเบียน ${ft.vehicles[vid].plate} (${mode === "leased" ? "สัญญาเช่า" : "ซื้อขาด"} ฿${(upfrontCost / 100).toLocaleString("th-TH")})`,
        { vehicleId: vid, typeId: spec.id, costSatang: upfrontCost, ownership: mode },
      );
      return { ok: true, vehicleId: vid, vehicle: ft.vehicles[vid], ownership: mode, costSatang: upfrontCost };
    }

    function maintainFleetVehicle(w, vehicleId) {
      const ft = ensureFleetTransport(w);
      const v = ft.vehicles[vehicleId];
      if (!v) return { ok: false, code: "unknownVehicle", message: "ไม่พบรถบรรทุกที่ระบุ" };
      if (v.status !== "idle" && v.status !== "broken" && v.status !== "maintenance") {
        return { ok: false, code: "vehicleInTransit", message: "รถกำลังปฏิบัติงานขนส่ง ไม่สามารถซ่อมบำรุงกลางคันได้" };
      }
      const spec = D.FLEET_VEHICLES?.[v.typeId] || D.FLEET_VEHICLES.dry_6w;
      let cashCost = spec.maintenanceCost || 350000;
      let tireUsed = 0;
      if (v.tireCondition < 50 && safeAvailableToDeduct(w, "truck_tire") >= 1) {
        safeDeductMaterial(w, "truck_tire", 1);
        tireUsed = 1;
        cashCost = Math.max(120000, cashCost - 150000);
      }
      if (w.finance.cash < cashCost) {
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอสำหรับค่าซ่อมบำรุงรถบรรทุก" };
      }
      post(w, "equipment", -cashCost, `fleetMaint:${v.id}:${now(w)}`);
      v.condition = 100;
      v.tireCondition = 100;
      v.status = "idle";
      ft.metrics.maintenanceCostSatang = (ft.metrics.maintenanceCostSatang || 0) + cashCost;
      event(
        w,
        "fleetVehicleMaintained",
        `🔧 ซ่อมบำรุงและตรวจสภาพ "${v.nameTh}" (${v.plate}) พร้อมใช้งาน 100%${tireUsed ? " (เบิกยางรถบรรทุกเรเดียลจากคลัง 1 เส้น)" : ""}`,
        { vehicleId: v.id, costSatang: cashCost, tireUsed },
      );
      return { ok: true, vehicleId: v.id, condition: v.condition, tireCondition: v.tireCondition, costSatang: cashCost, tireUsed };
    }

    function acceptFreightContract(w, quoteId, options = {}) {
      const ready=operationReadiness(w,"freight");
      if(!ready.ready) return {ok:false,code:"missingFreightSubjects",message:`ขาดวิชา: ${ready.reasonTh}`};
      const ft = ensureFleetTransport(w);
      const quote = ft.openQuotes.find((q) => q.id === quoteId && q.status === "quoted");
      if (!quote) {
        return { ok: false, code: "quoteUnavailable", message: "ไม่พบใบเสนอราคาขนส่งหรือถูกรับงานไปแล้ว" };
      }

      // Find requested or suitable idle vehicle
      const candidatesVeh = options.vehicleId
        ? [ft.vehicles[options.vehicleId]].filter(Boolean)
        : Object.values(ft.vehicles);
      if (!candidatesVeh.length) {
        return { ok: false, code: "noVehicles", message: "บริษัทยังไม่มีรถบรรทุกในกองรถ" };
      }

      // Check capacity & cargo compatibility first so we return specific rejection reasons
      const busyCheck = candidatesVeh.filter((v) => v.status === "idle" && !v.activeContractId && !v.internalOrderId);
      if (!busyCheck.length) {
        return { ok: false, code: "vehicleBusy", message: "รถบรรทุกที่ระบุไม่ว่าง (กำลังขนส่ง เดินทางขากลับ หรือซ่อมบำรุง)" };
      }

      const compatibleVeh = busyCheck.find(
        (v) =>
          v.condition > 20 &&
          v.tireCondition > 15 &&
          v.maxWeightKg >= quote.weightKg &&
          v.maxVolumeM3 >= quote.volumeM3 &&
          Array.isArray(v.supportedCargoTypes) &&
          v.supportedCargoTypes.includes(quote.cargoType),
      );
      if (!compatibleVeh) {
        return {
          ok: false,
          code: "incompatibleOrOverweightVehicle",
          message: `รถบรรทุกที่ว่างไม่รองรับน้ำหนัก (${quote.weightKg} กก.) ปริมาตร (${quote.volumeM3} ลบ.ม.) หรือประเภทสินค้า (${quote.cargoType}) ของงานนี้`,
        };
      }

      // Find an employed driver (logistics/coordinator) who is NOT already assigned to another active vehicle or incompatible task
      const busyDriverIds = new Set(
        Object.values(ft.vehicles)
          .filter((v) => v.assignedDriverId && v.status !== "idle")
          .map((v) => v.assignedDriverId),
      );
      const driver = options.driverPersonId
        ? w.people.find((p) => p.id === options.driverPersonId && p.employed && !busyDriverIds.has(p.id))
        : w.people.find((p) => p.employed && p.role === "logistics" && !busyDriverIds.has(p.id)) ||
          w.people.find((p) => p.employed && p.role === "coordinator" && !busyDriverIds.has(p.id)) ||
          w.people.find((p) => p.employed && !busyDriverIds.has(p.id));
      if (!driver || subjectLevel(driver,"driving")<35) {
        return { ok: false, code: "noAvailableDriver", message: "ไม่มีพนักงานขับรถที่ว่างสำหรับเที่ยววิ่งนี้ (ห้ามคนขับคนเดียวขับรถ 2 คันพร้อมกัน)" };
      }

      // Calculate round-trip distance (pickup + loaded outbound + empty backhaul) and fuel cost (Chapter 19 Sections 6 & 7)
      const pickupKm = quote.pickupEmptyKm || 0;
      const outboundKm = quote.outboundLoadedKm || 120;
      const backhaulKm = quote.backhaulEmptyKm || 120;
      const totalRoundTripKm = pickupKm + outboundKm + backhaulKm;
      const tmsInstalled = Boolean(w.softwareBusiness?.saasProducts?.tms_fleet?.installedInternally);
      const effectiveLitersPerKm = compatibleVeh.baseLitersPerKm * (tmsInstalled ? 0.92 : 1.0);
      const fuelLiters = Math.round(totalRoundTripKm * effectiveLitersPerKm * 10) / 10;
      const fuelPricePerLiterSatang = w.catalog.materials?.diesel_liter?.unitCost || 3200; // ฿32.00/liter
      const fuelCostSatang = Math.round(fuelLiters * fuelPricePerLiterSatang);
      const tollFeeSatang = quote.tollFeeSatang || 20000;
      const allocatedLaborSatang = 50000; // ฿500 allocated trip labor (tracked for margin, NOT double-deducted from payroll cash!)
      const expectedMarginBeforeOverheadSatang =
        quote.offeredRateSatang - fuelCostSatang - tollFeeSatang - allocatedLaborSatang;

      if (!options.allowLoss && expectedMarginBeforeOverheadSatang < 0) {
        return {
          ok: false,
          code: "unprofitableRoute",
          message: `ดีลขนส่งนี้ขาดทุนเมื่อคิดระยะวิ่งรถเปล่าขากลับครบวงจร (กำไรคาดหมาย ฿${(expectedMarginBeforeOverheadSatang / 100).toFixed(2)})`,
        };
      }

      const cid = `fcontract-${++w.sequence}`;
      quote.status = "reserved";
      const contract = {
        id: cid,
        quoteId: quote.id,
        routeId: quote.routeId,
        nameTh: quote.nameTh,
        clientCorpId: quote.clientCorpId,
        clientNameTh: w.externalWorld?.corporations?.[quote.clientCorpId]?.nameTh || "ลูกค้าขนส่ง B2B",
        cargoType: quote.cargoType,
        cargoNameTh: quote.cargoNameTh,
        weightKg: quote.weightKg,
        volumeM3: quote.volumeM3,
        cargoValueSatang: quote.cargoValueSatang,
        vehicleId: compatibleVeh.id,
        vehicleNameTh: compatibleVeh.nameTh,
        vehiclePlate: compatibleVeh.plate,
        driverPersonId: driver.id,
        driverName: driver.name,
        pickupEmptyKm: pickupKm,
        outboundLoadedKm: outboundKm,
        backhaulEmptyKm: backhaulKm,
        totalRoundTripKm,
        fuelLiters,
        fuelCostSatang,
        tollFeeSatang,
        allocatedLaborSatang,
        agreedRateSatang: quote.offeredRateSatang,
        expectedMarginBeforeOverheadSatang,
        status: "reserved", // reserved -> loading -> outbound -> delivering -> delivered -> invoiced -> paid | cancelled | failed | claim_pending
        outboundRemainingKm: pickupKm + outboundKm,
        returnRemainingKm: backhaulKm,
        fuelAndTollCharged: false,
        podVerified: false,
        invoiced: false,
        paid: false,
        invoiceDueAt: null,
        reservedAt: now(w),
        deliveredAt: null,
        paidAt: null,
      };

      ft.contracts[cid] = contract;
      compatibleVeh.status = "loading";
      compatibleVeh.assignedDriverId = driver.id;
      compatibleVeh.assignedDriverName = driver.name;
      compatibleVeh.activeContractId = cid;
      compatibleVeh.returnRemainingKm = backhaulKm;

      // Record customer cargo in custody (strictly separated from company inventory w.inventory!)
      ft.cargoCustody[cid] = {
        contractId: cid,
        ownerClientCorpId: contract.clientCorpId,
        cargoNameTh: contract.cargoNameTh,
        weightKg: contract.weightKg,
        volumeM3: contract.volumeM3,
        cargoValueSatang: contract.cargoValueSatang,
        status: "in_custody",
      };

      event(
        w,
        "freightContractReserved",
        `🚛 รับงานขนส่งกองรถ "${contract.nameTh}" ให้แก่ ${contract.clientNameTh}: จอง ${compatibleVeh.nameTh} (${compatibleVeh.plate}) ขับโดย ${driver.name} • ระยะไป-กลับ ${totalRoundTripKm} กม. • ค่าขนส่ง ฿${(contract.agreedRateSatang / 100).toLocaleString("th-TH")}`,
        { contractId: cid, vehicleId: compatibleVeh.id, driverId: driver.id, totalRoundTripKm, expectedMarginBeforeOverheadSatang },
      );
      return { ok: true, contractId: cid, contract };
    }

    function advanceFreightContract(w, contractId, options = {}) {
      const ft = ensureFleetTransport(w);
      const c = ft.contracts[contractId];
      if (!c) return { ok: false, code: "unknownContract", message: "ไม่พบใบงานขนส่ง" };
      const v = ft.vehicles[c.vehicleId];
      if (!v) return { ok: false, code: "missingVehicle", message: "ไม่พบรถบรรทุกของใบงานนี้" };

      if (c.status === "cancelled" || c.status === "failed") {
        return { ok: false, code: "contractTerminated", message: "ใบงานขนส่งนี้ถูกยกเลิกหรือล้มเหลวแล้ว" };
      }

      if (!P.useBusiness(w, "freight", 5)) {
        return { ok: false, code: "equipmentUnavailable", message: "อุปกรณ์จัดคลังต้องซ่อมก่อนรับส่งสินค้า" };
      }

      const driver = w.people.find((p) => p.id === c.driverPersonId && p.employed);
      const driverSkill = driver ? subjectLevel(driver, "driving") : 40;
      const driverFatiguePenalty = driver && (driver.state?.fatigue || 0) > 70 ? 0.72 : 1.0;
      const routeLeadMult = w.externalWorld?.geopolitics?.globalLeadTimeMultiplier || 1.0;

      // Step 1: reserved / loading -> outbound (charge fuel & tolls once, record dispatch timestamp)
      if (c.status === "reserved" || c.status === "loading" || c.status === "travel_to_pickup") {
        if (!c.fuelAndTollCharged) {
          let cashFuelAndToll = c.fuelCostSatang + c.tollFeeSatang;
          if (safeAvailableToDeduct(w, "diesel_liter") >= 1) {
            safeDeductMaterial(w, "diesel_liter", 1);
            cashFuelAndToll = Math.max(c.tollFeeSatang, cashFuelAndToll - 3200);
          }
          if (w.finance.cash < cashFuelAndToll) {
            return { ok: false, code: "insufficientCashForFuelAndToll", message: "เงินสดหมุนเวียนไม่พอจ่ายค่าน้ำมันและค่าผ่านทางก่อนออกรถ" };
          }
          post(w, "equipment", -cashFuelAndToll, `freightFuelToll:${c.id}`);
          c.fuelAndTollCharged = true;
          ft.metrics.fuelConsumedLiters = Math.round(((ft.metrics.fuelConsumedLiters || 0) + c.fuelLiters) * 10) / 10;
          ft.metrics.tollAndFuelCostSatang = (ft.metrics.tollAndFuelCostSatang || 0) + cashFuelAndToll;
          ft.metrics.allocatedLaborSatang = (ft.metrics.allocatedLaborSatang || 0) + c.allocatedLaborSatang;
        }
        c.status = "outbound";
        c.dispatchedAt = now(w);
        c.lastStepAt = now(w);
        const speedKmh = clamp(58 * (0.85 + driverSkill * 0.003) * driverFatiguePenalty / Math.max(0.7, routeLeadMult), 28, 78);
        c.estimatedTransitMinutes = Math.max(5, Math.ceil(((c.pickupEmptyKm + c.outboundLoadedKm) / speedKmh) * 60));
        c.estimatedReturnMinutes = Math.max(5, Math.ceil((c.backhaulEmptyKm / speedKmh) * 60));
        v.status = "outbound";
        reconcileWarehouseLots(w);
        return { ok: true, contractId: c.id, status: c.status, vehicleStatus: v.status, dispatchedAt: c.dispatchedAt };
      }

      // Check for breakdown risk if vehicle condition is critically low or forced breakdown test
      if (options.triggerBreakdown || v.condition <= 15) {
        v.status = "broken";
        c.status = "claim_pending";
        const claimDeductible = Math.min(w.finance.cash, 45000);
        if (claimDeductible > 0) {
          post(w, "equipment", -claimDeductible, `freightBreakdownClaim:${c.id}`);
          ft.metrics.claimsPaidSatang = (ft.metrics.claimsPaidSatang || 0) + claimDeductible;
        }
        ft.metrics.failedTrips = (ft.metrics.failedTrips || 0) + 1;
        if (ft.cargoCustody[c.id]) ft.cargoCustody[c.id].status = "delayed_claim";
        event(
          w,
          "freightVehicleBreakdown",
          `⚠️ รถบรรทุก "${v.nameTh}" (${v.plate}) เครื่องยนต์ขัดข้องระหว่างขนส่งใบงาน ${c.id}! ต้องส่งทีมช่างซ่อมและจ่ายค่าเสียหายส่วนแรก ฿${(claimDeductible / 100).toLocaleString("th-TH")}`,
          { contractId: c.id, vehicleId: v.id, claimDeductible },
        );
        return { ok: false, code: "vehicleBreakdown", status: c.status, vehicleStatus: v.status };
      }

      // Step 2: outbound -> delivered (requires elapsed simulation time since dispatch!)
      if (c.status === "outbound" || c.status === "delivering") {
        if (c.dispatchedAt !== undefined && now(w) <= c.dispatchedAt && !options.__testFastForwardOnly) {
          return {
            ok: false,
            code: "elapsedTimeRequired",
            status: c.status,
            vehicleStatus: v.status,
            message: "รถบรรทุกเพิ่งออกเดินทาง ต้องใช้เวลาวิ่งตามระยะทางจริงก่อนส่งมอบสินค้าถึงปลายทาง",
          };
        }
        c.outboundRemainingKm = 0;
        c.status = "delivered";
        c.deliveredAt = now(w);
        c.lastStepAt = now(w);
        c.podVerified = true;
        if (ft.cargoCustody[c.id]) {
          ft.cargoCustody[c.id].status = "delivered_to_recipient";
          delete ft.cargoCustody[c.id];
        }
        // Vehicle is NOT immediately idle on delivery! It must drive back empty (backhaulEmptyKm)
        v.status = "returning";
        v.returnRemainingKm = c.backhaulEmptyKm;
        v.odometerKm = (v.odometerKm || 0) + c.pickupEmptyKm + c.outboundLoadedKm;
        v.condition = clamp(Math.round((v.condition - 6) * 10) / 10, 10, 100);
        v.tireCondition = clamp(Math.round((v.tireCondition - 5) * 10) / 10, 10, 100);
        reconcileWarehouseLots(w);
        return { ok: true, contractId: c.id, status: c.status, vehicleStatus: v.status, deliveredAt: c.deliveredAt };
      }

      // Step 3: delivered -> invoiced (issue bill once; idempotent!)
      if (c.status === "delivered" && !c.invoiced) {
        c.invoiced = true;
        c.status = "invoiced";
        c.invoiceDueAt = now(w) + (options.creditDays ? options.creditDays * 1440 : 0);
        ft.metrics.receivablesSatang = (ft.metrics.receivablesSatang || 0) + c.agreedRateSatang;
        if (options.creditDays) {
          return { ok: true, contractId: c.id, status: c.status, vehicleStatus: v.status };
        }
      }

      // Step 4: invoiced -> paid (collect payment once; idempotent!)
      if (c.status === "invoiced" && !c.paid) {
        if (!options.deferPayment && now(w) >= (c.invoiceDueAt || 0)) {
          if (c.clientCorpId && w.externalWorld?.living?.firms?.[c.clientCorpId]) {
            W.payFromCounterparty(w, `freight:${c.id}`, "firm", c.clientCorpId, c.agreedRateSatang);
          }
          post(w, "sales", c.agreedRateSatang, `freightInvoicePaid:${c.id}`);
          c.paid = true;
          c.paidAt = now(w);
          c.status = "paid";
          ft.metrics.receivablesSatang = Math.max(0, (ft.metrics.receivablesSatang || 0) - c.agreedRateSatang);
          ft.metrics.freightRevenueSatang = (ft.metrics.freightRevenueSatang || 0) + c.agreedRateSatang;
          ft.metrics.completedTrips = (ft.metrics.completedTrips || 0) + 1;
          ft.metrics.totalDistanceKm = (ft.metrics.totalDistanceKm || 0) + c.totalRoundTripKm;
          ft.metrics.emptyBackhaulKm = (ft.metrics.emptyBackhaulKm || 0) + c.backhaulEmptyKm;
        }
      }

      // Step 5: Vehicle completes empty backhaul return (`returning -> idle`) ONLY after elapsed return time!
      if (v.status === "returning" && (options.finishReturn || v.returnRemainingKm <= 0)) {
        if (c.deliveredAt !== undefined && now(w) <= c.deliveredAt && !options.__testFastForwardOnly) {
          return {
            ok: false,
            code: "elapsedReturnTimeRequired",
            status: c.status,
            paid: c.paid,
            vehicleStatus: v.status,
            message: "รถบรรทุกกำลังตีรถกลับจากปลายทาง ต้องใช้เวลาเดินทางขากลับก่อนเข้าลานจอด",
          };
        }
        v.odometerKm = (v.odometerKm || 0) + (v.returnRemainingKm || 0);
        v.returnRemainingKm = 0;
        v.status = "idle";
        v.assignedDriverId = null;
        v.assignedDriverName = null;
        v.activeContractId = null;
        v.tripsCompleted = (v.tripsCompleted || 0) + 1;
        c.returnedAt = now(w);
        ft.history.unshift({
          id: c.id,
          day: day(w),
          nameTh: c.nameTh,
          clientNameTh: c.clientNameTh,
          vehicleNameTh: c.vehicleNameTh,
          driverName: c.driverName,
          totalRoundTripKm: c.totalRoundTripKm,
          fuelLiters: c.fuelLiters,
          revenueSatang: c.agreedRateSatang,
          marginSatang: c.expectedMarginBeforeOverheadSatang,
        });
        if (ft.history.length > 30) ft.history.pop();
        event(
          w,
          "freightContractCompleted",
          `✅ ส่งมอบงานขนส่ง "${c.nameTh}" สำเร็จและรถกลับถึงลานจอด: รับค่าขนส่ง +฿${(c.agreedRateSatang / 100).toLocaleString("th-TH")} (หักค่าน้ำมัน ${c.fuelLiters} ลิตร ฿${(c.fuelCostSatang / 100).toLocaleString("th-TH")} + ค่าผ่านทาง ฿${(c.tollFeeSatang / 100).toLocaleString("th-TH")} • ส่วนเกินก่อนโสหุ้ย +฿${(c.expectedMarginBeforeOverheadSatang / 100).toLocaleString("th-TH")})`,
          { contractId: c.id, revenueSatang: c.agreedRateSatang, marginSatang: c.expectedMarginBeforeOverheadSatang },
        );
      }

      return { ok: true, contractId: c.id, status: c.status, paid: c.paid, vehicleStatus: v.status };
    }

    function stepFleetTransportTick(w) {
      const ft = w.fleetTransport;
      if (!ft || !ft.contracts) return;
      for (const c of Object.values(ft.contracts)) {
        const v = ft.vehicles[c.vehicleId];
        if (!v || ["cancelled", "failed", "claim_pending"].includes(c.status)) continue;
        if (v.status === "broken") continue;
        const driver = w.people.find((p) => p.id === c.driverPersonId && p.employed);
        if (!driver) continue;
        // Driver rest check
        if ((driver.state?.energy || 80) < 22) {
          c.waitingReasonTh = `${driver.name} พักผ่อนตามเกณฑ์ความปลอดภัยก่อนขับรถต่อ`;
          continue;
        }
        if (driver.atWork) {
          driver.plantTaskAt = now(w);
          driver.activity = "working";
          driver.intent = { code: "freightDispatch", reasons: [c.nameTh || c.id] };
        }
        const driverSkill = subjectLevel(driver, "driving") || 40;
        const routeLeadMult = w.externalWorld?.geopolitics?.globalLeadTimeMultiplier || 1.0;
        const loadRatio = clamp((c.weightKg || 2000) / Math.max(1000, v.maxWeightKg || 6500), 0.2, 1.0);
        const kmPerTick = clamp(5.5 * (0.85 + driverSkill * 0.003) * (1.05 - loadRatio * 0.15) * (0.75 + (v.condition || 80) * 0.0025) / Math.max(0.7, routeLeadMult), 2.0, 8.0);

        if (c.status === "reserved" || c.status === "loading") {
          advanceFreightContract(w, c.id);
          continue;
        }
        if (c.status === "outbound" || c.status === "delivering") {
          c.outboundRemainingKm = Math.max(0, round((c.outboundRemainingKm ?? 60) - kmPerTick));
          c.waitingReasonTh = `กำลังวิ่งส่งสินค้าขาไป (เหลือระยะทาง ${c.outboundRemainingKm} กม.)`;
          if (c.outboundRemainingKm <= 0 && now(w) > (c.dispatchedAt || 0)) {
            advanceFreightContract(w, c.id);
            advanceFreightContract(w, c.id);
          }
          continue;
        }
        if (c.status === "delivered" || c.status === "invoiced") {
          advanceFreightContract(w, c.id);
        }
        if (v.status === "returning" && v.activeContractId === c.id) {
          v.returnRemainingKm = Math.max(0, round((v.returnRemainingKm ?? 60) - kmPerTick * 1.1));
          c.waitingReasonTh = `กำลังตีรถขากลับเข้าลานจอด (เหลือระยะทาง ${v.returnRemainingKm} กม.)`;
          if (v.returnRemainingKm <= 0 && now(w) > (c.deliveredAt || 0)) {
            advanceFreightContract(w, c.id, { finishReturn: true });
          }
        }
      }
    }

    function cancelFreightContract(w, contractId) {
      const ft = ensureFleetTransport(w);
      const c = ft.contracts[contractId];
      if (!c) return { ok: false, code: "unknownContract", message: "ไม่พบใบงานขนส่ง" };
      if (["delivered", "invoiced", "paid"].includes(c.status)) {
        return { ok: false, code: "alreadyDelivered", message: "งานขนส่งส่งมอบแล้ว ไม่สามารถยกเลิกได้" };
      }
      const v = ft.vehicles[c.vehicleId];
      if (v && v.activeContractId === c.id) {
        v.status = "idle";
        v.returnRemainingKm = 0;
        v.assignedDriverId = null;
        v.assignedDriverName = null;
        v.activeContractId = null;
      }
      if (ft.cargoCustody[c.id]) delete ft.cargoCustody[c.id];
      c.status = "cancelled";
      ft.metrics.cancelledTrips = (ft.metrics.cancelledTrips || 0) + 1;
      return { ok: true, contractId: c.id, status: "cancelled" };
    }

    function matchBackhaulCargo(w, contractId, options = {}) {
      const ft = ensureFleetTransport(w);
      const c = ft.contracts[contractId];
      if (!c) return { ok: false, code: "unknownContract", message: "ไม่พบใบงานขนส่ง" };
      const v = ft.vehicles[c.vehicleId];
      if (!v || v.status !== "returning") {
        return { ok: false, code: "vehicleNotReturning", message: "รถบรรทุกไม่ได้อยู่ในสถานะตีรถกลับ (Returning) จึงไม่สามารถรับงานขากลับได้" };
      }
      if (c.backhaulMatched) {
        return { ok: false, code: "alreadyMatched", message: "จับคู่งานบรรทุกขากลับ (Backhaul) ไปแล้ว" };
      }
      const backhaulRevenue = options.backhaulRevenueSatang || Math.round(c.agreedRateSatang * 0.55);
      const extraFuelCost = Math.round((c.backhaulEmptyKm || 80) * 180);
      if (w.finance.cash >= extraFuelCost && extraFuelCost > 0) {
        post(w, "equipment", -extraFuelCost, `backhaulFuel:${c.id}`);
        ft.metrics.tollAndFuelCostSatang = (ft.metrics.tollAndFuelCostSatang || 0) + extraFuelCost;
      }
      post(w, "sales", backhaulRevenue, `backhaulRevenue:${c.id}`);
      c.backhaulMatched = true;
      c.backhaulRevenueSatang = backhaulRevenue;
      const savedEmptyKm = c.backhaulEmptyKm || 0;
      ft.metrics.emptyBackhaulKm = Math.max(0, (ft.metrics.emptyBackhaulKm || 0) - savedEmptyKm);
      ft.metrics.freightRevenueSatang = (ft.metrics.freightRevenueSatang || 0) + backhaulRevenue;
      event(
        w,
        "backhaulMatched",
        `🔄 จับคู่งานขนส่งขากลับ (Backhaul Matching) สำเร็จสำหรับ "${v.nameTh}": เปลี่ยนระยะตีรถเปล่า ${savedEmptyKm} กม. เป็นรายได้ขากลับ +฿${(backhaulRevenue / 100).toLocaleString("th-TH")}`,
        { contractId: c.id, vehicleId: v.id, savedEmptyKm, backhaulRevenue },
      );
      return { ok: true, contractId: c.id, vehicleId: v.id, savedEmptyKm, backhaulRevenue };
    }

    // === CHAPTER 20: Software & SaaS App Business Engine ===
    function ensureSoftwareBusiness(w) {
      if (!w.softwareBusiness || typeof w.softwareBusiness !== "object") {
        w.softwareBusiness = freshSoftwareBusiness();
      }
      if (!w.softwareBusiness.workstations) w.softwareBusiness.workstations = freshSoftwareBusiness().workstations;
      if (!w.softwareBusiness.projects) w.softwareBusiness.projects = {};
      if (!w.softwareBusiness.saasProducts) w.softwareBusiness.saasProducts = freshSoftwareBusiness().saasProducts;
      if (!w.softwareBusiness.metrics) w.softwareBusiness.metrics = freshSoftwareBusiness().metrics;
      if (!Array.isArray(w.softwareBusiness.history)) w.softwareBusiness.history = [];
      return w.softwareBusiness;
    }

    function startSoftwareProject(w, appId = "pos_retail", clientCorpId = "cp_health", options = {}) {
      const sb = ensureSoftwareBusiness(w);
      if (!operationReadiness(w,"software").ready) return { ok:false, code:"missingSubject", message:"ขาดผู้รู้วิชาพัฒนาซอฟต์แวร์ ระดับ 40" };
      const spec = D.SOFTWARE_APPS?.[appId];
      if (!spec) return { ok: false, code: "unknownApp", message: "ไม่พบประเภทแอปพลิเคชันที่ระบุ" };

      // Check developer & workstation availability (no double-booking the same person or workstation!)
      const busyDevIds = new Set(
        Object.values(sb.projects)
          .filter((p) => p.assignedDeveloperId && !["closed", "cancelled", "deployed", "supporting"].includes(p.status))
          .map((p) => p.assignedDeveloperId),
      );
      if (busyDevIds.size >= (sb.workstations.totalStations || 3)) {
        return { ok: false, code: "workstationCapacityFull", message: "โต๊ะคอมพิวเตอร์นักพัฒนา (dev_workstation) ถูกจองเต็มทุกเครื่องแล้ว" };
      }
      const availableDev=p=>p.employed && !busyDevIds.has(p.id) && subjectLevel(p,"programming")>=40 && subjectLevel(p,"software")>=40;
      const dev = options.developerPersonId ? w.people.find(p=>p.id===options.developerPersonId && availableDev(p)) : w.people.find(availableDev);
      if (!dev || subjectLevel(dev,"software") < 40) {
        return { ok: false, code: "noAvailableDeveloper", message: "ไม่มีวิศวกรหรือนักพัฒนาที่ว่างสำหรับรับโครงการใหม่ (ห้ามขายชั่วโมงคนเดียวซ้ำหลายโครงการ)" };
      }

      const pid = options.projectId || `swproj-${++w.sequence}`;
      const price = options.contractPriceSatang || spec.contractPriceSatang || 12000000;
      const depositAmt = Math.round(price * 0.3);
      const corp = w.externalWorld?.corporations?.[clientCorpId];

      // Collect 30% deposit into cash, but record it as unearnedDepositSatang (NOT recognized profit until milestones are accepted!)
      post(w, "sales", depositAmt, `swDeposit:${pid}`);
      sb.metrics.totalUnearnedDepositSatang = (sb.metrics.totalUnearnedDepositSatang || 0) + depositAmt;

      const proj = {
        id: pid,
        appId: spec.id,
        titleTh: `โครงการพัฒนา ${spec.nameTh} ให้แก่ ${corp ? corp.nameTh : "ลูกค้าองค์กร B2B"}`,
        clientCorpId,
        clientNameTh: corp ? corp.nameTh : "ลูกค้าองค์กร B2B",
        status: "contracted",
        targetVersion: options.targetVersion || "1.0.0",
        deliveredVersion: null,
        contractPriceSatang: price,
        depositPct: 0.3,
        uatMilestonePct: 0.4,
        deployMilestonePct: 0.3,
        depositCollectedSatang: depositAmt,
        unearnedDepositSatang: depositAmt,
        recognizedRevenueSatang: 0,
        billedReceivableSatang: 0,
        cashCollectedSatang: depositAmt,
        allocatedLaborSatang: 0,
        computeCostSatang: 0,
        externalQaCostSatang: 0,
        reworkCostSatang: 0,
        progressMinutes: 0,
        requiredDevMinutes: spec.devWorkMinutes || 120,
        qaProgressMinutes: 0,
        requiredQaMinutes: spec.qaWorkMinutes || 45,
        defectsFound: 0,
        defectsFixed: 0,
        qaCertificateIssued: false,
        assignedDeveloperId: dev.id,
        assignedDeveloperName: dev.name,
        createdAt: now(w),
        completedAt: null,
        lastReasonTh: `ลงนามสัญญาและรับเงินมัดจำ 30% (฿${(depositAmt / 100).toLocaleString("th-TH")}) จองเครื่อง dev_workstation ให้ ${dev.name}`,
      };
      sb.projects[pid] = proj;
      if (!sb.workstations.occupiedByPersonIds.includes(dev.id)) {
        sb.workstations.occupiedByPersonIds.push(dev.id);
      }
      event(
        w,
        "softwareProjectContracted",
        `💻 เปิดโครงการซอฟต์แวร์รับจ้าง "${proj.titleTh}" มูลค่าสัญญา ฿${(price / 100).toLocaleString("th-TH")} (รับมัดจำ 30% ฿${(depositAmt / 100).toLocaleString("th-TH")} บันทึกเป็นเงินรับล่วงหน้ารอส่งมอบงาน)`,
        { projectId: pid, appId: spec.id, contractPriceSatang: price, depositAmt },
      );
      return { ok: true, projectId: pid, project: proj };
    }

    function advanceSoftwareProject(w, projectId, options = {}) {
      const sb = ensureSoftwareBusiness(w);
      const proj = sb.projects[projectId];
      if (!proj) return { ok: false, code: "unknownProject", message: "ไม่พบโครงการซอฟต์แวร์ที่ระบุ" };

      if (proj && !["completed", "live", "cancelled", "supporting"].includes(proj.status) && !P.useBusiness(w, "software", 5)) {
        return { ok: false, code: "equipmentUnavailable", message: "เครื่องพัฒนาซอฟต์แวร์ต้องซ่อม" };
      }
      // Hard Rule: Blocked projects NEVER advance progress for free!
      if (proj.status === "blocked") {
        if (!options.unblock) {
          return { ok: false, code: "projectBlocked", message: "โครงการติดสถานะ Blocked ไม่สามารถเดินความคืบหน้าฟรีได้" };
        }
        proj.status = "contracted";
      }
      if (proj.status === "cancelled" || proj.status === "closed") {
        return { ok: false, code: "projectEnded", message: "โครงการนี้ปิดหรือยกเลิกไปแล้ว" };
      }

      const spec = D.SOFTWARE_APPS?.[proj.appId] || D.SOFTWARE_APPS.pos_retail;

      // Step 1: discovery -> contracted (collects 30% unearned deposit)
      if (proj.status === "discovery") {
        const depositAmt = Math.round(proj.contractPriceSatang * 0.3);
        if (proj.clientCorpId && w.externalWorld?.living?.firms?.[proj.clientCorpId]) {
          W.payFromCounterparty(w, `swDeposit:${proj.id}`, "firm", proj.clientCorpId, depositAmt);
        }
        post(w, "sales", depositAmt, `swDeposit:${proj.id}`);
        proj.depositCollectedSatang = depositAmt;
        proj.unearnedDepositSatang = depositAmt;
        proj.cashCollectedSatang = depositAmt;
        proj.estimatedDevMinutes = proj.requiredDevMinutes || 120;
        proj.technicalDebt = proj.technicalDebt || 0;
        sb.metrics.totalUnearnedDepositSatang = (sb.metrics.totalUnearnedDepositSatang || 0) + depositAmt;
        proj.status = "contracted";
        proj.lastReasonTh = "ผ่านการวิเคราะห์ความต้องการและรับเงินมัดจำ 30% รอสถาปัตยกรรมและเขียนโค้ดโดยนักพัฒนา";
        return { ok: true, projectId: proj.id, status: proj.status };
      }

      // Step 2: contracted -> designed -> implementing -> review_integration -> testing
      if (proj.status === "contracted" || proj.status === "designed" || proj.status === "implementing" || proj.status === "review_integration") {
        // Require a real qualified developer on staff! Zero qualified developer time makes zero progress.
        const dev =
          (proj.assignedDeveloperId && w.people.find((p) => p.id === proj.assignedDeveloperId && p.employed)) ||
          w.people.find((p) => p.employed && subjectLevel(p, "programming") >= 40 && subjectLevel(p, "software") >= 40);
        if (!dev || subjectLevel(dev, "programming") < 40 || subjectLevel(dev, "software") < 40 || options.minutes === 0) {
          proj.lastReasonTh = "รอวิศวกรซอฟต์แวร์ที่มีความรู้การเขียนโปรแกรม (ระดับ 40+) ลงมือทำงานจริง";
          return {
            ok: false,
            code: "noQualifiedDeveloper",
            projectId: proj.id,
            status: proj.status,
            progressMinutes: proj.progressMinutes || 0,
            message: "ไม่มีชั่วโมงทำงานจากนักพัฒนาที่มีคุณวุฒิ โครงการจึงไม่เกิดความคืบหน้า",
          };
        }
        proj.assignedDeveloperId = dev.id;
        proj.assignedDeveloperName = dev.name;

        const cloudFee = spec.computeCostSatang || 500000;
        if (proj.computeCostSatang === 0 && w.finance.cash >= cloudFee) {
          post(w, "equipment", -cloudFee, `swCompute:${proj.id}`);
          proj.computeCostSatang = cloudFee;
          sb.metrics.totalComputeAndServerCostSatang = (sb.metrics.totalComputeAndServerCostSatang || 0) + cloudFee;
        }
        proj.status = "implementing";
        const progSkill = (subjectLevel(dev, "programming") + subjectLevel(dev, "software")) / 2;
        const analytical = dev.profile?.aptitudes?.analytical ?? 50;
        const fatigue = dev.state?.fatigue ?? 15;
        const conscientiousness = dev.profile?.personality?.conscientiousness ?? 50;
        const productivity = clamp((0.65 + progSkill * 0.0045 + analytical * 0.002) * Math.max(0.45, 1 - fatigue / 135), 0.4, 1.65);

        const rawMinutes = typeof options.minutes === "number" ? Math.max(0, options.minutes) : 45;
        const effectiveMinutes = Math.round(rawMinutes * productivity * 10) / 10;
        proj.actualPersonMinutes = (proj.actualPersonMinutes || 0) + rawMinutes;
        proj.progressMinutes = Math.min(proj.requiredDevMinutes, (proj.progressMinutes || 0) + effectiveMinutes);
        proj.allocatedLaborSatang = 6000000;

        // Scope change discovery & manager evaluation
        if (options.discoverScopeChange && !proj.scopeChangeEvaluated) {
          proj.scopeChangeEvaluated = true;
          const mgr = w.people.find((p) => p.employed && p.role === "coordinator") || dev;
          const approveScope = (mgr.profile?.personality?.openness ?? 50) >= 55;
          proj.scopeChangeResolution = approveScope ? "approved_scope_extension" : "rejected_frozen_scope";
          if (approveScope) {
            proj.requiredDevMinutes += 20;
            proj.contractPriceSatang += 1500000;
          }
        }

        if (proj.progressMinutes < proj.requiredDevMinutes && options.minutes !== undefined) {
          proj.lastReasonTh = `${dev.name} กำลังพัฒนาโค้ด (${Math.round(proj.progressMinutes)}/${proj.requiredDevMinutes} นาที • ประสิทธิภาพ ×${productivity.toFixed(2)})`;
          return {
            ok: true,
            projectId: proj.id,
            status: proj.status,
            progressMinutes: proj.progressMinutes,
            productivity,
          };
        }
        // Complete implementation when requiredDevMinutes is reached (or when options.minutes was omitted in step-by-step test with qualified dev)
        proj.progressMinutes = proj.requiredDevMinutes;
        proj.status = "testing";
        if (options.injectDefects !== undefined) {
          proj.defectsFound = Number(options.injectDefects) || 0;
          proj.defectsFixed = 0;
        } else {
          // Better staff with lower fatigue and higher skill/conscientiousness produce fewer defects!
          const defectRisk = Math.max(0, (72 - progSkill) * 0.05 + (fatigue / 35) + (55 - conscientiousness) * 0.03 + (proj.technicalDebt || 0) * 0.2);
          proj.defectsFound = Math.max(0, Math.round(defectRisk));
          proj.defectsFixed = 0;
        }
        proj.lastReasonTh = `พัฒนาโค้ดครบ ${proj.requiredDevMinutes} นาที ส่งเข้าขั้นทดสอบ QA (ตรวจพบจุดต้องตรวจแก้เบื้องต้น ${proj.defectsFound} รายการ)`;
        return {
          ok: true,
          projectId: proj.id,
          status: proj.status,
          progressMinutes: proj.progressMinutes,
          defectsFound: proj.defectsFound,
          productivity,
        };
      }

      // Step 3: testing (QA & Defect resolution)
      if (proj.status === "testing") {
        if (proj.externalQaCostSatang === 0) {
          const qaCost = 1000000; // ฿10,000 QA test lab / device farm cost
          if (w.finance.cash >= qaCost) {
            post(w, "equipment", -qaCost, `swQaTest:${proj.id}`);
            proj.externalQaCostSatang = qaCost;
            sb.metrics.totalComputeAndServerCostSatang = (sb.metrics.totalComputeAndServerCostSatang || 0) + qaCost;
          }
        }
        if (proj.defectsFound > proj.defectsFixed) {
          if (options.deployWithKnownDefects) {
            // Forced deployment with unresolved issues incurs downstream support/SLA costs!
            proj.deployedWithDefects = true;
            proj.unresolvedDefectsAtDeploy = proj.defectsFound - proj.defectsFixed;
          } else if (!options.fixDefects) {
            return {
              ok: false,
              code: "unresolvedDefects",
              message: `พบบั๊กค้างในระบบ ${proj.defectsFound - proj.defectsFixed} รายการ ยังไม่สามารถออกใบรับรอง QA หรือส่งมอบให้ลูกค้ารับมอบได้`,
            };
          } else {
            const openBugs = proj.defectsFound - proj.defectsFixed;
            proj.defectsFixed = proj.defectsFound;
            proj.reworkCostSatang = (proj.reworkCostSatang || 0) + openBugs * 1000000;
            sb.metrics.totalDefectsResolved = (sb.metrics.totalDefectsResolved || 0) + openBugs;
          }
        }
        proj.qaProgressMinutes = proj.requiredQaMinutes;
        proj.qaCertificateIssued = !proj.deployedWithDefects;
        proj.deliveredVersion = options.deliveredVersion || proj.targetVersion;
        proj.status = "customer_acceptance";
        proj.acceptanceEnteredAt = now(w);
        return { ok: true, projectId: proj.id, status: proj.status };
      }

      // Step 4: customer_acceptance (UAT 40% milestone — requires qaCertificateIssued && version match!)
      if (proj.status === "customer_acceptance") {
        if ((!proj.qaCertificateIssued || proj.defectsFound > proj.defectsFixed) && !proj.deployedWithDefects) {
          return { ok: false, code: "qaNotPassed", message: "ยังไม่ผ่านการทดสอบ QA ไม่สามารถรับมอบงานได้" };
        }
        if (options.deliveredVersion && options.deliveredVersion !== proj.targetVersion) {
          return { ok: false, code: "versionMismatch", message: "เวอร์ชันที่ส่งมอบไม่ตรงตามสัญญา ลูกค้าปฏิเสธการรับมอบ" };
        }
        if (!proj.uatCollected) {
          const uatAmount = Math.round(proj.contractPriceSatang * proj.uatMilestonePct); // 40%
          if (proj.clientCorpId && w.externalWorld?.living?.firms?.[proj.clientCorpId]) {
            W.payFromCounterparty(w, `swUat:${proj.id}`, "firm", proj.clientCorpId, uatAmount);
          }
          post(w, "sales", uatAmount, `swUatMilestone:${proj.id}`);
          proj.uatCollected = true;
          proj.cashCollectedSatang += uatAmount;
          const newlyRecognized = proj.unearnedDepositSatang + uatAmount;
          sb.metrics.totalUnearnedDepositSatang = Math.max(0, (sb.metrics.totalUnearnedDepositSatang || 0) - proj.unearnedDepositSatang);
          proj.unearnedDepositSatang = 0;
          proj.recognizedRevenueSatang += newlyRecognized;
        }
        proj.status = "deployed";
        proj.deployedAt = now(w);
        return { ok: true, projectId: proj.id, status: proj.status };
      }

      // Step 5: deployed -> supporting (final 30% milestone + downstream defect consequences if deployed with unresolved issues)
      if (proj.status === "deployed") {
        const finalAmount = proj.contractPriceSatang - proj.cashCollectedSatang;
        if (finalAmount > 0 && !proj.deployCollected) {
          if (proj.clientCorpId && w.externalWorld?.living?.firms?.[proj.clientCorpId]) {
            W.payFromCounterparty(w, `swDeploy:${proj.id}`, "firm", proj.clientCorpId, finalAmount);
          }
          post(w, "sales", finalAmount, `swDeployMilestone:${proj.id}`);
          proj.deployCollected = true;
          proj.cashCollectedSatang += finalAmount;
          proj.recognizedRevenueSatang += finalAmount;
        }
        if (proj.deployedWithDefects && (proj.unresolvedDefectsAtDeploy || 0) > 0) {
          const slaPenalty = Math.min(w.finance.cash, (proj.unresolvedDefectsAtDeploy || 1) * 850000);
          if (slaPenalty > 0) {
            post(w, "customerRefund", -slaPenalty, `swDefectIncidentPenalty:${proj.id}`);
            proj.reworkCostSatang = (proj.reworkCostSatang || 0) + slaPenalty;
          }
          w.reputation = clamp(w.reputation - 3, 0, 100);
          if (sb.saasProducts[proj.appId]) {
            sb.saasProducts[proj.appId].knownDefects = (sb.saasProducts[proj.appId].knownDefects || 0) + proj.unresolvedDefectsAtDeploy;
            sb.saasProducts[proj.appId].openSupportTickets = (sb.saasProducts[proj.appId].openSupportTickets || 0) + proj.unresolvedDefectsAtDeploy * 3;
          }
        }
        proj.status = "supporting";
        proj.completedAt = now(w);
        sb.metrics.projectsCompleted = (sb.metrics.projectsCompleted || 0) + 1;
        sb.metrics.totalContractRevenueSatang = (sb.metrics.totalContractRevenueSatang || 0) + proj.recognizedRevenueSatang;
        if (proj.assignedDeveloperId) {
          sb.workstations.occupiedByPersonIds = sb.workstations.occupiedByPersonIds.filter((id) => id !== proj.assignedDeveloperId);
        }
        if (sb.saasProducts[proj.appId]) {
          sb.saasProducts[proj.appId].status = "live";
          sb.saasProducts[proj.appId].version = proj.targetVersion;
          sb.saasProducts[proj.appId].mvpProgressMinutes = sb.saasProducts[proj.appId].mvpRequiredMinutes;
        }
        const projectSurplusSatang =
          proj.recognizedRevenueSatang -
          proj.allocatedLaborSatang -
          proj.computeCostSatang -
          proj.externalQaCostSatang -
          proj.reworkCostSatang;
        proj.projectSurplusSatang = projectSurplusSatang;
        sb.history.unshift({
          id: proj.id,
          day: day(w),
          titleTh: proj.titleTh,
          clientNameTh: proj.clientNameTh,
          revenueSatang: proj.recognizedRevenueSatang,
          surplusSatang: projectSurplusSatang,
        });
        if (sb.history.length > 30) sb.history.pop();
        event(
          w,
          "softwareProjectDeployed",
          `🚀 ส่งมอบและเปิดใช้งานจริง "${proj.titleTh}" (v${proj.targetVersion}) สำเร็จ! รับเงินครบ ฿${(proj.recognizedRevenueSatang / 100).toLocaleString("th-TH")} (ส่วนเกินโครงการหลังหักแรงงานจัดสรร/Cloud/QA/งานแก้ = ฿${(projectSurplusSatang / 100).toLocaleString("th-TH")})`,
          { projectId: proj.id, revenueSatang: proj.recognizedRevenueSatang, surplusSatang: projectSurplusSatang },
        );
      }

      return {
        ok: true,
        projectId: proj.id,
        status: proj.status,
        recognizedRevenueSatang: proj.recognizedRevenueSatang,
        unearnedDepositSatang: proj.unearnedDepositSatang,
        projectSurplusSatang:
          proj.recognizedRevenueSatang -
          proj.allocatedLaborSatang -
          proj.computeCostSatang -
          proj.externalQaCostSatang -
          proj.reworkCostSatang,
      };
    }

    function stepSoftwareBusinessTick(w) {
      const sb = w.softwareBusiness;
      if (!sb || !sb.projects) return;
      for (const proj of Object.values(sb.projects)) {
        if (["supporting", "closed", "cancelled", "blocked"].includes(proj.status)) continue;
        if (proj.status === "discovery" && w.policies.autoAccept) {
          advanceSoftwareProject(w, proj.id);
          continue;
        }
        if (proj.status === "contracted" || proj.status === "implementing") {
          const dev =
            (proj.assignedDeveloperId && w.people.find((p) => p.id === proj.assignedDeveloperId && p.employed && p.atWork)) ||
            w.people.find((p) => p.employed && p.atWork && p.plantTaskAt !== now(w) && subjectLevel(p, "programming") >= 40 && subjectLevel(p, "software") >= 40);
          if (!dev || dev.plantTaskAt === now(w)) continue;
          dev.plantTaskAt = now(w);
          dev.activity = "working";
          dev.intent = { code: "softwareDevelopment", reasons: [proj.titleTh || proj.id] };
          advanceSoftwareProject(w, proj.id, { minutes: TICK });
          learnSubject(dev, "programming", TICK, false);
          continue;
        }
        if (proj.status === "testing") {
          const tester = w.people.find(
            (p) => p.employed && p.atWork && p.plantTaskAt !== now(w) && (subjectLevel(p, "software_testing") >= 30 || p.role === "inspector" || p.role === "engineer"),
          );
          if (!tester) continue;
          tester.plantTaskAt = now(w);
          proj.qaProgressMinutes = Math.min(proj.requiredQaMinutes || 40, (proj.qaProgressMinutes || 0) + TICK);
          if (proj.qaProgressMinutes >= (proj.requiredQaMinutes || 40)) {
            advanceSoftwareProject(w, proj.id, { fixDefects: true });
          }
          continue;
        }
        if (proj.status === "customer_acceptance" && now(w) > (proj.acceptanceEnteredAt || 0) + 10) {
          advanceSoftwareProject(w, proj.id);
          continue;
        }
        if (proj.status === "deployed" && now(w) > (proj.deployedAt || 0) + 5) {
          advanceSoftwareProject(w, proj.id);
        }
      }
    }

    function updateSaasSubscription(w, appId, options = {}) {
      const sb = ensureSoftwareBusiness(w);
      const app = sb.saasProducts[appId];
      if (!app) return { ok: false, code: "unknownApp", message: "ไม่พบผลิตภัณฑ์แอป SaaS ที่ระบุ" };

      if (options.launchMvp) {
        app.status = "live";
        app.version = "1.0.0";
        app.mvpProgressMinutes = app.mvpRequiredMinutes;
      }
      if (app.status !== "live") {
        return { ok: false, code: "appNotLive", message: "แอปยังไม่ได้พัฒนาและเปิดให้บริการจริง (status !== live)" };
      }

      if (typeof options.addLeads === "number" && options.addLeads > 0) {
        app.leadCount = (app.leadCount || 0) + Math.floor(options.addLeads);
      }
      if (typeof options.convertUsers === "number" && options.convertUsers > 0) {
        const requested = Math.floor(options.convertUsers);
        // Conversion cannot exceed available leads (Chapter 20 Section 7)
        const converted = Math.min(app.leadCount || 0, requested);
        app.leadCount -= converted;
        app.activeSubscribers = (app.activeSubscribers || 0) + converted;
        app.totalConvertedUsers = (app.totalConvertedUsers || 0) + converted;
      }
      if (typeof options.churnUsers === "number" && options.churnUsers > 0) {
        // Churn cannot exceed active subscribers, and churned users stop generating future bills immediately!
        const churned = Math.min(app.activeSubscribers || 0, Math.floor(options.churnUsers));
        app.activeSubscribers -= churned;
        app.totalChurnedUsers = (app.totalChurnedUsers || 0) + churned;
      }
      if (typeof options.installInternally === "boolean") {
        if (options.installInternally && !app.installedInternally) {
          const internalSetupCost = 150000; // ฿1,500 internal server setup cost (never generates external sales revenue!)
          if (w.finance.cash >= internalSetupCost) {
            post(w, "equipment", -internalSetupCost, `saasInternalInstall:${appId}`);
            app.totalServerCostSatang = (app.totalServerCostSatang || 0) + internalSetupCost;
            sb.metrics.totalComputeAndServerCostSatang = (sb.metrics.totalComputeAndServerCostSatang || 0) + internalSetupCost;
          }
          app.installedInternally = true;
        } else if (!options.installInternally) {
          app.installedInternally = false;
        }
      }

      if (options.runBillingCycle) {
        // Hard Rule (Chapter 20 Section 10): If activeSubscribers === 0, zero revenue is generated!
        if ((app.activeSubscribers || 0) <= 0) {
          app.lastBillingSummaryTh = "รอบบิลนี้มีผู้ใช้งาน 0 บัญชี — ไม่เกิดรายได้ค่าสมาชิก";
          return {
            ok: true,
            appId,
            activeSubscribers: 0,
            billedRevenueSatang: 0,
            serverAndSupportCostSatang: 0,
            netCycleSurplusSatang: 0,
          };
        }
        // Check server capacity overload
        const serverCap = sb.workstations.serverCapacityUsers || 60;
        const overloadPenalty = app.activeSubscribers > serverCap ? 0.85 : 1.0;
        const grossBill = Math.round(app.activeSubscribers * app.monthlyFeePerUserSatang * overloadPenalty);
        const serverCost = Math.min(w.finance.cash, Math.max(80000, Math.round(app.activeSubscribers * 12000)));
        const allocatedSupportLabor = Math.round(app.activeSubscribers * 32000);

        if (serverCost > 0) {
          post(w, "equipment", -serverCost, `saasServer:${appId}:${now(w)}`);
          app.totalServerCostSatang = (app.totalServerCostSatang || 0) + serverCost;
          sb.metrics.totalComputeAndServerCostSatang = (sb.metrics.totalComputeAndServerCostSatang || 0) + serverCost;
        }
        post(w, "sales", grossBill, `saasBill:${appId}:${++w.sequence}`);
        app.totalRevenueSatang = (app.totalRevenueSatang || 0) + grossBill;
        sb.metrics.totalSaasRevenueSatang = (sb.metrics.totalSaasRevenueSatang || 0) + grossBill;
        app.nextBillingMinute = now(w) + app.billingCycleMinutes;
        const netSurplus = grossBill - serverCost - allocatedSupportLabor;
        app.lastBillingSummaryTh = `เรียกเก็บค่าสมาชิก ${app.activeSubscribers} บัญชี: บิลรับ +฿${(grossBill / 100).toLocaleString("th-TH")} (หักค่าเซิร์ฟเวอร์ ฿${(serverCost / 100).toLocaleString("th-TH")} และแรงงานจัดสรร ฿${(allocatedSupportLabor / 100).toLocaleString("th-TH")} เหลือส่วนเกิน ฿${(netSurplus / 100).toLocaleString("th-TH")})`;

        event(
          w,
          "saasBillingCollected",
          `☁️ ครบรอบบิลแอป SaaS "${app.nameTh}": ผู้ใช้จริง ${app.activeSubscribers} บัญชี รับเงิน +฿${(grossBill / 100).toLocaleString("th-TH")}`,
          { appId, activeSubscribers: app.activeSubscribers, grossBill, serverCost, netSurplus },
        );
        return {
          ok: true,
          appId,
          activeSubscribers: app.activeSubscribers,
          billedRevenueSatang: grossBill,
          serverAndSupportCostSatang: serverCost + allocatedSupportLabor,
          netCycleSurplusSatang: netSurplus,
        };
      }

      return {
        ok: true,
        appId,
        status: app.status,
        leadCount: app.leadCount,
        activeSubscribers: app.activeSubscribers,
        installedInternally: app.installedInternally,
      };
    }

    // === CHAPTER 21 & 24: 4 Factory Sector Process Models & 3 Industrial B2B Service Models ===
    function ensureSectorProcesses(w) {
      if (!w.sectorProcesses || typeof w.sectorProcesses !== "object") {
        w.sectorProcesses = freshSectorProcesses();
      }
      if (!w.sectorProcesses.foodBakery) w.sectorProcesses.foodBakery = freshSectorProcesses().foodBakery;
      if (!w.sectorProcesses.electronicsRma) w.sectorProcesses.electronicsRma = freshSectorProcesses().electronicsRma;
      if (!w.sectorProcesses.automotiveOem) w.sectorProcesses.automotiveOem = freshSectorProcesses().automotiveOem;
      if (!w.sectorProcesses.biomedSterile) w.sectorProcesses.biomedSterile = freshSectorProcesses().biomedSterile;
      w.sectorProcesses.foodBakery.coldChainActive = Boolean(
        w.externalWorld?.assetPortfolio?.ownedAssets?.cold_chain_hub?.active,
      );
      return w.sectorProcesses;
    }

    // Model 1: Food & Bakery Perishable Shelf-Life & Spoilage Engine
    function expireFoodBatch(w, options = {}) {
      const sp = ensureSectorProcesses(w);
      const fb = sp.foodBakery;
      // Find a ready food unit in inventory.finished, or decay activeBatches
      const readyFoodUnits = Object.values(w.units).filter(
        (u) => u.stage === "ready" && w.catalog.products[u.productId]?.industry === "food",
      );
      const targetUnit = options.unitId ? w.units[options.unitId] : readyFoodUnits[0];
      if (!targetUnit || targetUnit.stage !== "ready") {
        return { ok: false, code: "noReadyFoodUnit", message: "ไม่มีสินค้าอาหารสำเร็จรูปในคลังที่พร้อมตัดหมดอายุ" };
      }
      const pId = targetUnit.productId;
      const prodSpec = w.catalog.products[pId];
      // Strictly preserve product conservation:
      // finished[p]--, completed[p]--, scrapped[p]++, delete w.units[u.id]
      // Then completed[p] === shipped[p] + finished[p] AND started[p] === shipped[p] + scrapped[p] + inProcess[p] holds 100%!
      w.inventory.finished[pId] = Math.max(0, (w.inventory.finished[pId] || 0) - 1);
      w.production.completed[pId] = Math.max(0, (w.production.completed[pId] || 0) - 1);
      w.production.scrapped[pId] = (w.production.scrapped[pId] || 0) + 1;
      w.metrics.unitsScrapped = (w.metrics.unitsScrapped || 0) + 1;
      delete w.units[targetUnit.id];
      delete fb.activeBatches[targetUnit.id];

      // Convert spoiled food organic waste into +1 organic_compost feedstock!
      grantUnpurchasedMaterial(w, "organic_compost", 1);
      fb.spoiledUnitsCount = (fb.spoiledUnitsCount || 0) + 1;
      fb.compostRecoveredUnits = (fb.compostRecoveredUnits || 0) + 1;
      fb.lastSpoilageEventTh = `สินค้า "${prodSpec?.nameTh || pId}" หมดอายุ (Shelf-Life Expired) 1 ล็อต ➔ คัดทิ้งเป็นของเสียและแปรรูปเป็นปุ๋ยหมักชีวภาพ +1 ถุง`;

      event(
        w,
        "foodBatchExpired",
        `🥖❄️ ล็อตอาหาร "${prodSpec?.nameTh || pId}" (${targetUnit.id}) หมดอายุเกิน Shelf-Life ก่อนจัดส่ง! ตัดออกจากคลังสินค้าพร้อมส่งและรีไซเคิลเป็นปุ๋ยหมักชีวภาพ +1 ถุง`,
        { unitId: targetUnit.id, productId: pId, spoiledUnitsCount: fb.spoiledUnitsCount },
      );
      return {
        ok: true,
        unitId: targetUnit.id,
        productId: pId,
        spoiledUnitsCount: fb.spoiledUnitsCount,
        compostRecoveredUnits: fb.compostRecoveredUnits,
      };
    }

    // Model 2: Electronics & Semiconductor SMT / Burn-in / Post-Sale RMA Engine
    function triggerRmaClaim(w, options = {}) {
      const sp = ensureSectorProcesses(w);
      const er = sp.electronicsRma;
      const productId = options.productId || "controller";
      const prodSpec = w.catalog.products[productId] || w.catalog.products.hub || Object.values(w.catalog.products)[0];
      const claimId = options.claimId || `rma-${++w.sequence}`;
      const defectiveQty = Math.max(1, Math.min(5, Math.floor(Number(options.defectiveQty) || 1)));
      const claim = {
        id: claimId,
        productId: prodSpec.id,
        productNameTh: prodSpec.nameTh,
        orderId: options.orderId || "ord-warranty",
        defectiveQty,
        reasonTh: options.reasonTh || "ลูกค้าแจ้งอาการบอร์ดควบคุมเกิดความร้อนสะสมระหว่างใช้งานจริง (Field Burn-In Drift)",
        firmwareRev: er.firmwareRevision || "Rev.1.2",
        status: "open", // open | repaired | refunded
        createdAt: now(w),
        resolvedAt: null,
      };
      er.rmaClaims[claimId] = claim;
      er.totalRmaClaims = (er.totalRmaClaims || 0) + 1;
      er.lastRmaSummaryTh = `เปิดใบเคลม RMA ${claimId} (${prodSpec.nameTh} ×${defectiveQty} ชิ้น)`;
      event(
        w,
        "electronicsRmaOpened",
        `🔬⚡ ลูกค้าเปิดใบเคลมรับประกัน (RMA ${claimId}) สำหรับ "${prodSpec.nameTh}" ×${defectiveQty} ชิ้น (${claim.reasonTh})`,
        { claimId, productId: prodSpec.id, defectiveQty },
      );
      return { ok: true, claimId, claim };
    }

    function resolveRmaClaim(w, claimId, options = {}) {
      const sp = ensureSectorProcesses(w);
      const er = sp.electronicsRma;
      const claim = er.rmaClaims[claimId];
      if (!claim) return { ok: false, code: "unknownRmaClaim", message: "ไม่พบใบเคลม RMA ที่ระบุ" };
      if (claim.status !== "open") return { ok: false, code: "alreadyResolved", message: "ใบเคลม RMA นี้ดำเนินการเสร็จสิ้นแล้ว" };

      // Check if we can repair using 1 PCB + technician/inspector or pay warranty compensation
      const mode = options.mode || (safeAvailableToDeduct(w, "pcb") >= 1 ? "rework_board" : "refund_compensation");
      if (mode === "rework_board" && safeAvailableToDeduct(w, "pcb") >= 1) {
        safeDeductMaterial(w, "pcb", 1);
        claim.status = "repaired";
        claim.resolvedAt = now(w);
        claim.resolutionMode = "rework_board";
        er.resolvedRmaCount = (er.resolvedRmaCount || 0) + 1;
        er.firmwareRevision = `Rev.1.${3 + er.resolvedRmaCount}`;
        w.reputation = clamp(w.reputation + 1, 0, 100);
        er.lastRmaSummaryTh = `ซ่อมเปลี่ยนบอร์ด PCB และอัปเดตเฟิร์มแวร์ ${er.firmwareRevision} ให้ใบเคลม ${claim.id} สำเร็จ`;
        event(
          w,
          "electronicsRmaResolved",
          `🔧✅ ซ่อมบำรุงบอร์ด RMA (${claim.id}) ของ "${claim.productNameTh}" สำเร็จ (เบิกแผ่นวงจร PCB ×1 ชิ้น + อัปแพตช์เฟิร์มแวร์ ${er.firmwareRevision} • รักษาชื่อเสียงบริษัท +1)`,
          { claimId: claim.id, resolutionMode: "rework_board", firmwareRevision: er.firmwareRevision },
        );
        return { ok: true, claimId: claim.id, status: claim.status, resolutionMode: "rework_board", firmwareRevision: er.firmwareRevision };
      }

      const refundSatang = Math.min(w.finance.cash, 28000 * (claim.defectiveQty || 1));
      if (refundSatang > 0) {
        post(w, "customerRefund", -refundSatang, `rmaWarrantyRefund:${claim.id}`);
        er.warrantyCostSatang = (er.warrantyCostSatang || 0) + refundSatang;
      }
      claim.status = "refunded";
      claim.resolvedAt = now(w);
      claim.resolutionMode = "refund_compensation";
      er.resolvedRmaCount = (er.resolvedRmaCount || 0) + 1;
      er.lastRmaSummaryTh = `ชดเชยค่าเคลมประกันใบงาน ${claim.id} เป็นเงิน ฿${(refundSatang / 100).toLocaleString("th-TH")}`;
      return { ok: true, claimId: claim.id, status: claim.status, resolutionMode: "refund_compensation", refundSatang };
    }

    // Model 3: Automotive EV, Energy & Heavy Robotics Tooling Changeover Engine
    function triggerToolingChangeover(w, lineId = "lineA", targetProductId = "ev_battery_pack", options = {}) {
      const sp = ensureSectorProcesses(w);
      const ao = sp.automotiveOem;
      if (!ao.lineTooling[lineId]) {
        ao.lineTooling[lineId] = { lineId, currentToolingProductId: null, consecutiveSameModelCount: 0, changeoverCount: 0 };
      }
      const lineState = ao.lineTooling[lineId];
      const prevProd = lineState.currentToolingProductId;
      if (prevProd === targetProductId && !options.force) {
        lineState.consecutiveSameModelCount = (lineState.consecutiveSameModelCount || 0) + 1;
        ao.rhythmBonusUnits = (ao.rhythmBonusUnits || 0) + 1;
        return { ok: true, lineId, changed: false, sameFamily: true, currentToolingProductId: targetProductId, consecutiveSameModelCount: lineState.consecutiveSameModelCount };
      }
      const prevFam = prevProd ? w.catalog.products[prevProd]?.familyId : null;
      const nextFam = w.catalog.products[targetProductId]?.familyId || null;
      const isSameFamily = Boolean(prevFam && nextFam && prevFam === nextFam && !options.force);
      const setupCost = options.freeSetup || isSameFamily ? 0 : Math.min(w.finance.cash, 35000);
      if (setupCost > 0 && prevProd !== null) {
        post(w, "equipment", -setupCost, `toolingChangeover:${lineId}:${targetProductId}:${++w.sequence}`);
        ao.toolingChangeoverCostSatang = (ao.toolingChangeoverCostSatang || 0) + setupCost;
      }
      lineState.currentToolingProductId = targetProductId;
      lineState.consecutiveSameModelCount = 1;
      lineState.changeoverCount = (lineState.changeoverCount || 0) + 1;
      ao.totalChangeovers = (ao.totalChangeovers || 0) + 1;
      const prodName = w.catalog.products[targetProductId]?.nameTh || targetProductId;
      ao.lastToolingSummaryTh = `สลับแม่พิมพ์และจิ๊ก ${lineId} เป็นรุ่น "${prodName}" (สะสม ${ao.totalChangeovers} ครั้ง)`;
      if (!options.silent) {
        event(
          w,
          "toolingChangeover",
          `🦾⚙️ ตั้งค่าแม่พิมพ์และจิ๊กประกอบ (Die & Jig Changeover) บนสายการผลิต ${lineId} สำหรับ "${prodName}" (ค่าสอบเทียบจิ๊ก ฿${(setupCost / 100).toLocaleString("th-TH")})`,
          { lineId, targetProductId, setupCost, totalChangeovers: ao.totalChangeovers },
        );
      }
      return { ok: true, lineId, changed: true, currentToolingProductId: targetProductId, setupCost, totalChangeovers: ao.totalChangeovers };
    }

    // Model 4: Bio-Medical & Cleanroom Sterile Quarantine & Clinical Release Engine
    function certifyBiomedLot(w, options = {}) {
      const sp = ensureSectorProcesses(w);
      const bm = sp.biomedSterile;
      const productId = options.productId || "vital_monitor";
      const prodSpec = w.catalog.products[productId] || w.catalog.products.pulseOximeter || Object.values(w.catalog.products)[0];
      const lotId = options.lotId || `biolot-${++w.sequence}`;
      const hasWaterPlant = Boolean(w.facilities?.constructedPlots?.includes("waterPlant"));
      const hasQaLab = Boolean(w.facilities?.constructedPlots?.includes("qaLab"));

      if (options.contaminateLot) {
        bm.sterilityIndex = 58;
      } else {
        bm.sterilityIndex = clamp((bm.sterilityIndex || 92) + (hasWaterPlant ? 3 : 0) + (hasQaLab ? 3 : 0), 50, 99);
      }

      if (bm.sterilityIndex < 70 || options.contaminateLot) {
        bm.quarantineLots[lotId] = {
          id: lotId,
          productId: prodSpec.id,
          productNameTh: prodSpec.nameTh,
          status: "rejected",
          sterilityScore: bm.sterilityIndex,
          assayAt: now(w),
        };
        bm.sterilityRejectedLots = (bm.sterilityRejectedLots || 0) + 1;
        // Reset sterility after decontamination flush
        bm.sterilityIndex = 94;
        bm.lastSterileSummaryTh = `กักกันและระงับล็อต ${lotId} (${prodSpec.nameTh}) เนื่องจากค่าความปลอดเชื้อต่ำกว่าเกณฑ์ 70%`;
        event(
          w,
          "biomedLotRejected",
          `🧬⚠️ ห้องแล็บกักกันเชื้อสั่งระงับล็อตเวชภัณฑ์ "${prodSpec.nameTh}" (${lotId}) เนื่องจากตรวจพบค่าความปลอดเชื้อต่ำกว่าเกณฑ์มาตรฐาน!`,
          { lotId, productId: prodSpec.id, status: "rejected" },
        );
        return { ok: false, code: "sterilityContamination", lotId, status: "rejected", sterilityScore: 58 };
      }

      bm.quarantineLots[lotId] = {
        id: lotId,
        productId: prodSpec.id,
        productNameTh: prodSpec.nameTh,
        status: "certified",
        sterilityScore: bm.sterilityIndex,
        assayAt: now(w),
      };
      bm.clinicalCertificatesIssued = (bm.clinicalCertificatesIssued || 0) + 1;
      bm.lastSterileSummaryTh = `ออกใบรับรองปลอดเชื้อ Clinical COA ให้ล็อต ${lotId} (${prodSpec.nameTh} • Sterility ${bm.sterilityIndex}%)`;
      event(
        w,
        "biomedLotCertified",
        `🧬✅ ผ่านการตรวจเพาะเชื้อและออกใบรับรอง Clinical Lot Release (${lotId}) สำหรับ "${prodSpec.nameTh}" (Sterility ${bm.sterilityIndex}%)`,
        { lotId, productId: prodSpec.id, status: "certified", sterilityScore: bm.sterilityIndex },
      );
      return { ok: true, lotId, status: "certified", sterilityScore: bm.sterilityIndex };
    }

    // Model 8: Industrial B2B Services (Calibration Lab, Field Maintenance SLA, Eco Recycling)
    function ensureServiceBusiness(w) {
      if (!w.serviceBusiness || typeof w.serviceBusiness !== "object") {
        w.serviceBusiness = freshServiceBusiness();
      }
      if (!w.serviceBusiness.orders) w.serviceBusiness.orders = {};
      if (!w.serviceBusiness.instrumentCustody) w.serviceBusiness.instrumentCustody = {};
      if (!w.serviceBusiness.metrics) w.serviceBusiness.metrics = freshServiceBusiness().metrics;
      if (!Array.isArray(w.serviceBusiness.history)) w.serviceBusiness.history = [];
      return w.serviceBusiness;
    }

    function startServiceOrder(w, serviceTypeId = "calibration_lab", clientCorpId = null, options = {}) {
      const sv = ensureServiceBusiness(w);
      const serviceSubject = ({calibration_lab:"quality",field_maintenance:"metal_machining",industrial_recycling:"metal_machining",battery_second_life_lab:"power_electronics",returnable_pallet_pool:"logistics",cold_storage_3pl:"logistics",energy_epc_install:"power_electronics",b2b_technical_academy:"management",wholesale_distribution:"commerce",toll_smelting_extrusion:"metal_machining"})[serviceTypeId];
      if (serviceSubject && !teamReady(w,SERVICE_SUBJECTS[serviceTypeId])) return {ok:false,code:"missingSubject",message:`ทีมยังขาดวิชา: ${teamCoverage(w,SERVICE_SUBJECTS[serviceTypeId]).filter(r=>!r.ready).map(r=>r.nameTh).join(", ")}`};
      const spec = D.INDUSTRIAL_SERVICES?.[serviceTypeId];
      if (!spec) return { ok: false, code: "unknownServiceType", message: "ไม่พบรูปแบบธุรกิจบริการวิศวกรรมที่ระบุ" };

      // Check specialist availability so the same person cannot be assigned to multiple service orders concurrently
      const busyIds = new Set(
        Object.values(sv.orders)
          .filter((o) => !["paid", "cancelled"].includes(o.status))
          .map((o) => o.specialistId)
          .filter(Boolean),
      );
      const candidates = w.people.filter(
        (p) =>
          p.employed &&
          !busyIds.has(p.id) &&
          (!serviceSubject || subjectLevel(p,serviceSubject) >= SERVICE_SUBJECTS[serviceTypeId][serviceSubject]),
      );
      const specialist = options.specialistId
        ? w.people.find((p) => p.employed && p.id === options.specialistId && !busyIds.has(p.id))
        : candidates[0];
      if (!specialist || (serviceSubject && subjectLevel(specialist,serviceSubject) < SERVICE_SUBJECTS[serviceTypeId][serviceSubject])) {
        return {
          ok: false,
          code: "noAvailableSpecialist",
          message: "ไม่มีวิศวกรหรือผู้เชี่ยวชาญว่างสำหรับรับใบสั่งงานบริการนี้ (ห้ามจองตัวพนักงานซ้ำซ้อน)",
        };
      }

      const oid = options.orderId || `srv-${++w.sequence}`;
      const resolvedCorpId =
        clientCorpId && w.externalWorld?.corporations?.[clientCorpId]
          ? clientCorpId
          : (spec.clientCorps && spec.clientCorps.find((cid) => w.externalWorld?.corporations?.[cid])) ||
            clientCorpId ||
            "siam_tech";
      if (
        serviceTypeId === "wholesale_distribution" &&
        options.purchasedFromCorpId &&
        options.purchasedFromCorpId === resolvedCorpId
      ) {
        return {
          ok: false,
          code: "circularWholesaleForbidden",
          message: "ห้ามซื้อและขายส่งวัตถุดิบวนกลับให้บริษัทคู่ค้ารายเดิมในธุรกรรมเดียวเพื่อสร้างส่วนต่างราคาฟรี",
        };
      }
      const corp = w.externalWorld?.corporations?.[resolvedCorpId];
      const clientNameTh = corp ? corp.nameTh : "ลูกค้าอุตสาหกรรม B2B";
      const feeSatang = options.feeSatang || spec.serviceFeeSatang || spec.baseFeeSatang || spec.basePriceSatang || 380000;
      const order = {
        id: oid,
        serviceTypeId: spec.id,
        serviceNameTh: spec.nameTh,
        icon: spec.icon,
        clientCorpId: resolvedCorpId,
        clientNameTh,
        specialistId: specialist.id,
        specialistName: specialist.name,
        feeSatang,
        consumableCostSatang: spec.consumableCostSatang || spec.labConsumableCostSatang || spec.treatmentCostSatang || 180000,
        slaDeadlineAt: now(w) + (spec.slaDeadlineHours || 24) * 60,
        status: "accepted", // accepted -> in_progress -> certified_or_verified -> invoiced -> paid
        stages: spec.stages,
        currentStageIndex: 0,
        partsConsumed: false,
        invoiced: false,
        paid: false,
        slaBreached: false,
        recoveredMaterials: {},
        createdAt: now(w),
      };
      sv.orders[oid] = order;

      // For custody-based services (calibration_lab, battery_second_life_lab, cold_storage_3pl), register client's items in custody separately from company inventory!
      if (["calibration_lab", "battery_second_life_lab", "cold_storage_3pl", "toll_smelting_extrusion"].includes(serviceTypeId)) {
        sv.instrumentCustody[oid] = {
          id: `custody-${oid}`,
          orderId: oid,
          serviceTypeId,
          clientNameTh,
          equipmentNameTh:
            options.equipmentNameTh ||
            (serviceTypeId === "battery_second_life_lab"
              ? "แพ็กแบตเตอรี่ลิเธียมใช้แล้วของลูกค้า (รอตรวจวัด SOH รายเซลล์)"
              : serviceTypeId === "cold_storage_3pl"
                ? "ล็อตสินค้าควบคุมอุณหภูมิของลูกค้าฝากเก็บ 3PL"
                : serviceTypeId === "toll_smelting_extrusion"
                  ? "ล็อตแร่และแท่งอะลูมินาของลูกค้าฝากถลุงและอัดรีดขึ้นรูป"
                  : "ชุดเซ็นเซอร์วัดแรงดันและเครื่องมือวัดละเอียดของลูกค้า"),
          status: "in_lab_custody",
        };
      }

      event(
        w,
        "serviceOrderStarted",
        `${spec.icon} เปิดใบงานบริการ "${spec.nameTh}" (${oid}) ให้ ${clientNameTh} • มอบหมาย ${specialist.name} ดูแล (มูลค่าบริการ ฿${(feeSatang / 100).toLocaleString("th-TH")})`,
        { orderId: oid, serviceTypeId, clientNameTh, feeSatang },
      );
      return { ok: true, orderId: oid, order };
    }

    function advanceServiceOrder(w, orderId, options = {}) {
      const sv = ensureServiceBusiness(w);
      const o = sv.orders[orderId];
      if (!o) return { ok: false, code: "unknownServiceOrder", message: "ไม่พบใบสั่งงานบริการ" };
      if (o.status === "paid" || o.status === "cancelled") {
        return { ok: true, orderId: o.id, status: o.status, paid: o.paid };
      }
      if (!P.useBusiness(w, o.serviceTypeId, 5)) {
        P.request(w, P.serviceEquipment[o.serviceTypeId], plantHooks(w));
        return { ok: false, code: "equipmentUnavailable", message: "รอเครื่องมือธุรกิจและช่างติดตั้ง/ซ่อม" };
      }
      const spec = D.INDUSTRIAL_SERVICES?.[o.serviceTypeId];
      o.requiredWorkMinutes = o.requiredWorkMinutes || 25;
      o.workMinutesDone = o.workMinutesDone || 0;

      // Step 1: Verify and consume required spare parts / lab consumables, then perform timed specialist work & measurement
      if (o.status === "accepted" || o.status === "in_progress" || o.status === "waiting_parts" || o.status === "diagnose_plan" || o.status === "performing_work") {
        if (!o.partsConsumed) {
          let activeParts = spec?.sparePartInputs || spec?.sparePartsRequired || spec?.spareParts || {};
          let missingEntry = Object.entries(activeParts).find(([mId, qty]) => safeAvailableToDeduct(w, mId) < qty);
          if (missingEntry && spec?.fallbackSparePartInputs) {
            const fbMissing = Object.entries(spec.fallbackSparePartInputs).find(([mId, qty]) => safeAvailableToDeduct(w, mId) < qty);
            if (!fbMissing) {
              activeParts = spec.fallbackSparePartInputs;
              missingEntry = null;
            }
          }
          if (missingEntry) {
            const [mId, qty] = missingEntry;
            o.status = "waiting_parts";
            return {
              ok: false,
              code: "insufficientServiceParts",
              status: o.status,
              missingMaterialId: mId,
              message: `อะไหล่หรือวัสดุ "${w.catalog.materials[mId]?.nameTh || mId}" ในคลังไม่พอสำหรับงานบริการ (ต้องการ ${qty} ชิ้น) — ห้ามส่งงานสำเร็จฟรีโดยไม่หักอะไหล่จริง`,
            };
          }
          const labCost = o.consumableCostSatang || spec?.labConsumableCostSatang || 25000;
          if (w.finance.cash < labCost) {
            o.status = "waiting_parts";
            return {
              ok: false,
              code: "insufficientServiceCash",
              status: o.status,
              message: "เงินสดหมุนเวียนไม่พอจ่ายค่าสารมาตรฐานและวัสดุสิ้นเปลืองของงานบริการ",
            };
          }
          for (const [mId, qty] of Object.entries(activeParts)) {
            safeDeductMaterial(w, mId, qty);
          }
          if (labCost > 0) {
            post(w, "equipment", -labCost, `serviceConsumable:${o.id}`);
            sv.metrics.serviceCostSatang = (sv.metrics.serviceCostSatang || 0) + labCost;
          }
          o.partsConsumed = true;
          o.partsConsumedAt = now(w);
        }

        const workInc = typeof options.workMinutes === "number" ? options.workMinutes : 25;
        o.workMinutesDone = Math.min(o.requiredWorkMinutes, o.workMinutesDone + workInc);
        if (o.serviceTypeId === "cold_storage_3pl") {
          o.storageHoursOccupied = (o.storageHoursOccupied || 0) + Math.max(1, Math.round(workInc / 10));
        }
        if (o.workMinutesDone < o.requiredWorkMinutes) {
          o.status = "in_progress";
          o.currentStageIndex = 1;
          return { ok: true, orderId: o.id, status: o.status, workMinutesDone: o.workMinutesDone };
        }

        // Record actual diagnostic/test measurements before certification
        o.testMeasurements = {
          measuredAt: now(w),
          specialistId: o.specialistId,
          instrumentId: P.serviceEquipment[o.serviceTypeId],
          passed: true,
        };

        // Specific process mechanics per service model!
        if (["calibration_lab", "battery_second_life_lab", "cold_storage_3pl"].includes(o.serviceTypeId)) {
          sv.metrics.calibrationCertificatesIssued = (sv.metrics.calibrationCertificatesIssued || 0) + 1;
          if (sv.instrumentCustody[o.id]) {
            sv.instrumentCustody[o.id].status = "calibrated_returned_to_client";
            delete sv.instrumentCustody[o.id];
          }
          if (o.serviceTypeId === "battery_second_life_lab") {
            for (const [recMatId, recQty] of Object.entries(spec?.recoveredOutputs || {})) {
              grantUnpurchasedMaterial(w, recMatId, recQty);
              o.recoveredMaterials[recMatId] = recQty;
              sv.metrics.recoveredMaterialsUnits = (sv.metrics.recoveredMaterialsUnits || 0) + recQty;
            }
          }
        } else if (o.serviceTypeId === "field_maintenance") {
          if (options.breachSla || now(w) > o.slaDeadlineAt) {
            o.slaBreached = true;
            sv.metrics.slaBreachCount = (sv.metrics.slaBreachCount || 0) + 1;
            const penalty = Math.min(w.finance.cash, Math.round(o.feeSatang * (spec?.slaPenaltyPct || 0.25)));
            if (penalty > 0) {
              post(w, "customerRefund", -penalty, `serviceSlaPenalty:${o.id}`);
              sv.metrics.slaPenaltyPaidSatang = (sv.metrics.slaPenaltyPaidSatang || 0) + penalty;
            }
          } else {
            sv.metrics.slaOnTimeCount = (sv.metrics.slaOnTimeCount || 0) + 1;
          }
        } else if (o.serviceTypeId === "energy_epc_install") {
          if (options.breachSla || now(w) > o.slaDeadlineAt) {
            o.slaBreached = true;
            sv.metrics.slaBreachCount = (sv.metrics.slaBreachCount || 0) + 1;
            const penalty = Math.min(w.finance.cash, Math.round(o.feeSatang * (spec?.slaPenaltyPct || 0.2)));
            if (penalty > 0) {
              post(w, "customerRefund", -penalty, `serviceSlaPenalty:${o.id}`);
              sv.metrics.slaPenaltyPaidSatang = (sv.metrics.slaPenaltyPaidSatang || 0) + penalty;
            }
          } else {
            sv.metrics.slaOnTimeCount = (sv.metrics.slaOnTimeCount || 0) + 1;
            w.reputation = clamp(w.reputation + 1, 0, 100);
          }
          if (w.capabilities?.domains) {
            w.capabilities.domains.power_electronics = Math.min(100, Math.round(((w.capabilities.domains.power_electronics || 20) + 1.5) * 10) / 10);
          }
        } else if (o.serviceTypeId === "b2b_technical_academy") {
          sv.metrics.calibrationCertificatesIssued = (sv.metrics.calibrationCertificatesIssued || 0) + 1;
          if (w.capabilities?.domains) {
            w.capabilities.domains.embedded_iot = Math.min(100, Math.round(((w.capabilities.domains.embedded_iot || 30) + 1.0) * 10) / 10);
          }
          if (o.clientCorpId && w.externalWorld?.corporations?.[o.clientCorpId]) {
            w.externalWorld.corporations[o.clientCorpId].trustScore = clamp((w.externalWorld.corporations[o.clientCorpId].trustScore || 55) + 3, 0, 100);
          }
        } else if (o.serviceTypeId === "industrial_recycling") {
          sv.metrics.recycledTonsProcessed = (sv.metrics.recycledTonsProcessed || 0) + 3;
          for (const [recMatId, recQty] of Object.entries(spec?.recoveredMaterialsYield || spec?.recoveredOutputs || { metal_sheet: 1, pack_carton: 1, organic_compost: 1 })) {
            grantUnpurchasedMaterial(w, recMatId, recQty);
            o.recoveredMaterials[recMatId] = recQty;
            sv.metrics.recoveredMaterialsUnits = (sv.metrics.recoveredMaterialsUnits || 0) + recQty;
          }
          if (safeAvailableToDeduct(w, "mineral_slag_mud") >= 1) {
            const takeSlag = Math.min(2, safeAvailableToDeduct(w, "mineral_slag_mud"));
            safeDeductMaterial(w, "mineral_slag_mud", takeSlag);
            grantUnpurchasedMaterial(w, "coke_reducing_flux", 1);
            o.recoveredMaterials.coke_reducing_flux = (o.recoveredMaterials.coke_reducing_flux || 0) + 1;
            sv.metrics.recoveredMaterialsUnits = (sv.metrics.recoveredMaterialsUnits || 0) + 1;
          }
          if (w.agriculture?.waterSource) {
            w.agriculture.waterSource.wastewaterTreated = (w.agriculture.waterSource.wastewaterTreated || 0) + 2;
          }
        } else if (o.serviceTypeId === "wholesale_distribution") {
          sv.metrics.wholesaleLotsDistributed = (sv.metrics.wholesaleLotsDistributed || 0) + 1;
          if (w.capabilities?.domains) {
            w.capabilities.domains.fleet_coldchain = Math.min(100, Math.round(((w.capabilities.domains.fleet_coldchain || 25) + 1.2) * 10) / 10);
          }
          if (o.clientCorpId && w.externalWorld?.corporations?.[o.clientCorpId]) {
            w.externalWorld.corporations[o.clientCorpId].trustScore = clamp((w.externalWorld.corporations[o.clientCorpId].trustScore || 55) + 2, 0, 100);
          }
        } else if (o.serviceTypeId === "toll_smelting_extrusion") {
          sv.metrics.tollSmeltingBatchesCompleted = (sv.metrics.tollSmeltingBatchesCompleted || 0) + 1;
          if (sv.instrumentCustody[o.id]) {
            sv.instrumentCustody[o.id].status = "smelted_extruded_returned_to_client";
            delete sv.instrumentCustody[o.id];
          }
          for (const [recMatId, recQty] of Object.entries(spec?.recoveredOutputs || { mineral_slag_mud: 1 })) {
            grantUnpurchasedMaterial(w, recMatId, recQty);
            o.recoveredMaterials[recMatId] = recQty;
            sv.metrics.recoveredMaterialsUnits = (sv.metrics.recoveredMaterialsUnits || 0) + recQty;
          }
          if (w.capabilities?.domains) {
            w.capabilities.domains.metal_machining = Math.min(100, Math.round(((w.capabilities.domains.metal_machining || 25) + 1.5) * 10) / 10);
          }
        }

        o.currentStageIndex = Math.max(0, (o.stages?.length || 4) - 2);
        o.status = "certified_or_verified";
        o.certifiedAt = now(w);
        reconcileWarehouseLots(w);
        if (!options.completeAllSteps) return { ok: true, orderId: o.id, status: o.status };
      }

      // Step 2: Invoice & Payment (idempotent!)
      if (o.status === "certified_or_verified" && !o.invoiced) {
        o.invoiced = true;
        o.status = "invoiced";
      }
      if (o.status === "invoiced" && !o.paid) {
        if (o.clientCorpId && w.externalWorld?.living?.firms?.[o.clientCorpId]) {
          W.payFromCounterparty(w, `service:${o.id}`, "firm", o.clientCorpId, o.feeSatang);
        }
        post(w, "sales", o.feeSatang, `serviceOrderPaid:${o.id}`);
        o.paid = true;
        o.paidAt = now(w);
        o.status = "paid";
        o.currentStageIndex = (o.stages?.length || 4) - 1;
        sv.metrics.completedOrders = (sv.metrics.completedOrders || 0) + 1;
        sv.metrics.serviceRevenueSatang = (sv.metrics.serviceRevenueSatang || 0) + o.feeSatang;
        sv.history.unshift({
          id: o.id,
          day: day(w),
          serviceNameTh: o.serviceNameTh,
          clientNameTh: o.clientNameTh,
          specialistName: o.specialistName,
          feeSatang: o.feeSatang,
          slaBreached: o.slaBreached,
          recoveredMaterials: { ...o.recoveredMaterials },
        });
        if (sv.history.length > 25) sv.history.pop();
        event(
          w,
          "serviceOrderCompleted",
          `${o.icon} ส่งมอบงานบริการ "${o.serviceNameTh}" (${o.id}) ให้ ${o.clientNameTh} สำเร็จ: รับค่าบริการ +฿${(o.feeSatang / 100).toLocaleString("th-TH")}`,
          { orderId: o.id, serviceTypeId: o.serviceTypeId, feeSatang: o.feeSatang },
        );
      }

      return { ok: true, orderId: o.id, status: o.status, paid: o.paid, slaBreached: o.slaBreached, recoveredMaterials: o.recoveredMaterials };
    }

    function stepServiceBusinessTick(w) {
      const sv = w.serviceBusiness;
      if (!sv || !sv.orders) return;
      for (const o of Object.values(sv.orders)) {
        if (["paid", "cancelled"].includes(o.status)) continue;
        const spec = w.people.find((p) => p.id === o.specialistId && p.employed);
        if (!spec || spec.plantTaskAt === now(w)) continue;
        if (o.status === "accepted" || o.status === "in_progress" || o.status === "waiting_parts") {
          spec.plantTaskAt = now(w);
          spec.activity = "working";
          spec.intent = { code: "serviceOrderExecution", reasons: [o.serviceNameTh || o.id] };
          advanceServiceOrder(w, o.id, { workMinutes: TICK, completeAllSteps: false });
          continue;
        }
        if (o.status === "certified_or_verified" || o.status === "invoiced") {
          advanceServiceOrder(w, o.id, { completeAllSteps: false });
        }
      }
    }

    // === CHAPTER 29: NPC Executive Board, Capability Graph & Autonomous Business Entry Engine ===
    function ensureCapabilities(w) {
      if (!w.capabilities || typeof w.capabilities !== "object") {
        w.capabilities = freshCapabilities();
      }
      if (!w.capabilities.domains) w.capabilities.domains = freshCapabilities().domains;
      if (!w.capabilities.unlockedProducts) w.capabilities.unlockedProducts = {};
      if (!w.capabilities.unlockedChains) w.capabilities.unlockedChains = {};
      if (!w.capabilities.licenses) w.capabilities.licenses = {};
      return w.capabilities;
    }

    function ensureExecutiveBoard(w) {
      if (!w.executiveBoard || typeof w.executiveBoard !== "object") {
        w.executiveBoard = freshExecutiveBoard();
      }
      if (!w.executiveBoard.budgetPools) w.executiveBoard.budgetPools = freshExecutiveBoard().budgetPools;
      if (!Array.isArray(w.executiveBoard.decisionLedger)) w.executiveBoard.decisionLedger = [];
      if (!w.executiveBoard.reservations || typeof w.executiveBoard.reservations !== "object") {
        w.executiveBoard.reservations = {};
      }
      if (!w.executiveBoard.topicCooldowns || typeof w.executiveBoard.topicCooldowns !== "object") {
        w.executiveBoard.topicCooldowns = {};
      }
      if (!Number.isSafeInteger(w.executiveBoard.paidCapitalTotalSatang) || w.executiveBoard.paidCapitalTotalSatang < 0) {
        w.executiveBoard.paidCapitalTotalSatang = 0;
      }
      recomputeBoardReservations(w);
      return w.executiveBoard;
    }

    function recomputeBoardReservations(w) {
      if (!w.executiveBoard || !w.executiveBoard.reservations) return 0;
      let openSum = 0;
      for (const [rid, res] of Object.entries(w.executiveBoard.reservations)) {
        if (!res || res.status !== "open" || !Number.isSafeInteger(res.amountSatang) || res.amountSatang <= 0) {
          delete w.executiveBoard.reservations[rid];
          continue;
        }
        openSum += res.amountSatang;
      }
      w.executiveBoard.committedBudgetSatang = openSum;
      return openSum;
    }

    function reserveBoardBudget(w, reservationId, amountSatang, meta = {}) {
      const eb = ensureExecutiveBoard(w);
      const amt = Math.max(0, Math.floor(Number(amountSatang) || 0));
      if (amt <= 0) return { ok: true, reservationId, amountSatang: 0, committedBudgetSatang: eb.committedBudgetSatang };
      eb.reservations[reservationId] = {
        id: reservationId,
        category: meta.category || "capital",
        targetId: meta.targetId || reservationId,
        amountSatang: amt,
        createdDay: day(w),
        status: "open",
      };
      recomputeBoardReservations(w);
      computeFinancialPools(w);
      return { ok: true, reservationId, amountSatang: amt, committedBudgetSatang: eb.committedBudgetSatang };
    }

    function consumeBoardReservation(w, reservationId, paidAmountSatang = null) {
      const eb = ensureExecutiveBoard(w);
      const res = eb.reservations[reservationId];
      const paid = Math.max(0, Math.floor(Number(paidAmountSatang ?? res?.amountSatang) || 0));
      if (res) {
        delete eb.reservations[reservationId];
      }
      eb.paidCapitalTotalSatang = (eb.paidCapitalTotalSatang || 0) + paid;
      recomputeBoardReservations(w);
      computeFinancialPools(w);
      return { ok: true, reservationId, paidSatang: paid, committedBudgetSatang: eb.committedBudgetSatang, paidCapitalTotalSatang: eb.paidCapitalTotalSatang };
    }

    function cancelBoardReservation(w, reservationId) {
      const eb = ensureExecutiveBoard(w);
      if (eb.reservations[reservationId]) {
        delete eb.reservations[reservationId];
      }
      recomputeBoardReservations(w);
      computeFinancialPools(w);
      return { ok: true, reservationId, committedBudgetSatang: eb.committedBudgetSatang };
    }

    function isTopicOnCooldown(w, category, targetId, currentDay, options = {}) {
      if (
        options.forceReview ||
        options.proposeFleetType ||
        options.proposeSoftwareApp ||
        options.proposeServiceType ||
        options.evaluateAssetsNow
      ) {
        return false;
      }
      const eb = ensureExecutiveBoard(w);
      const key = `${category}:${targetId}`;
      const cd = eb.topicCooldowns?.[key];
      if (!cd) return false;
      return currentDay < (cd.nextReviewDay || 0);
    }

    function computeFinancialPools(w) {
      const eb = ensureExecutiveBoard(w);
      const employed = w.people.filter((p) => p.employed);
      const ceo = employed.find((p) => p.role === "coordinator");
      const dailyBurn =
        w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employed.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const payablesSatang = (w.finance.payables?.rent || 0) + (w.finance.payables?.interest || 0);
      const unpaidWagesSatang = employed.reduce((s, p) => s + (p.pay?.dueBase || 0) + (p.pay?.dueOT || 0), 0);
      const unearnedSwSatang = w.softwareBusiness?.metrics?.totalUnearnedDepositSatang || 0;
      const prudence = ceo?.profile?.personality?.prudence ?? 50;
      const riskTaking = ceo?.profile?.personality?.riskTaking ?? 50;
      const reserveDays = clamp(Math.round(16 + (prudence - 50) * 0.16 - (riskTaking - 50) * 0.08), 10, 26);
      const survivalReserveSatang = dailyBurn * reserveDays + payablesSatang + unpaidWagesSatang;
      const debtServiceReserveSatang = w.finance.debt > 0 ? Math.round(w.finance.debt * 0.35) : 0;
      const committed = recomputeBoardReservations(w);
      const uncommittedCashSatang = Math.max(
        0,
        w.finance.cash - survivalReserveSatang - unearnedSwSatang - committed,
      );
      const receivableSatang = Object.values(w.invoices || {})
        .filter((inv) => inv.status === "unpaid")
        .reduce((s, inv) => s + inv.amount, 0);
      eb.budgetPools = {
        survivalReserveSatang,
        debtServiceReserveSatang,
        maintenancePoolSatang: Math.round(uncommittedCashSatang * 0.15),
        capabilityPoolSatang: Math.round(uncommittedCashSatang * 0.25),
        expansionPoolSatang: Math.round(uncommittedCashSatang * 0.6),
        uncommittedCashSatang,
        dailyBurnSatang: dailyBurn,
        reserveDaysRequired: reserveDays,
        receivableSatang,
        unearnedDepositsSatang: unearnedSwSatang,
      };
      return eb.budgetPools;
    }

    function recordBoardDecision(w, entry) {
      const eb = ensureExecutiveBoard(w);
      const curDay = entry.day || day(w);
      const nextReviewDay = curDay + (entry.reviewCooldownDays ?? 2);
      const safeCommitted = Number.isSafeInteger(entry.committedBudget) && entry.committedBudget >= 0 ? entry.committedBudget : 0;
      const safeUncommittedBefore = Number.isSafeInteger(entry.uncommittedCashBefore) && entry.uncommittedCashBefore >= 0 ? entry.uncommittedCashBefore : 0;
      const rec = {
        proposalId: entry.proposalId || `prop-d${curDay}-${++w.sequence}`,
        day: curDay,
        at: now(w),
        category: entry.category || "strategy",
        targetId: entry.targetId || "general",
        titleTh: entry.titleTh || "วาระพิจารณาการลงทุนและขยายธุรกิจ",
        proposerId: entry.proposerId || null,
        proposerName: entry.proposerName || "คณะทำงานบริหาร",
        deciderId: entry.deciderId || null,
        deciderName: entry.deciderName || "CEO / คณะกรรมการบริหาร",
        boardSize: entry.boardSize || 1,
        alternativesConsidered: entry.alternativesConsidered || ["approve", "defer", "hold_cash"],
        hardGateResults: entry.hardGateResults || { techReady: true, staffReady: true, cashReady: true },
        uncommittedCashBefore: safeUncommittedBefore,
        committedBudget: safeCommitted,
        projectedRunwayDays: Number.isFinite(entry.projectedRunwayDays) ? entry.projectedRunwayDays : 20,
        scoreBreakdown: entry.scoreBreakdown || { marketScore: 60, capabilityScore: 60, personalityMod: 0, totalScore: 60 },
        resolution: entry.resolution || "hold_cash_prudent",
        reasonTh: entry.reasonTh || "พิจารณาตามสถานะเงินสดสำรองและความพร้อมของทีม",
        nextReviewDay,
        executionStatus: entry.executionStatus || "logged",
      };
      eb.topicCooldowns[`${rec.category}:${rec.targetId}`] = {
        nextReviewDay,
        lastResolution: rec.resolution,
        lastDay: curDay,
      };
      eb.decisionLedger.unshift(rec);
      if (eb.decisionLedger.length > 60) eb.decisionLedger.pop();
      return rec;
    }

    function evaluateExecutiveBoardAndBusinessEntry(w, completedDay = day(w), options = {}) {
      const eb = ensureExecutiveBoard(w);
      const cap = ensureCapabilities(w);
      const ft = ensureFleetTransport(w);
      const sb = ensureSoftwareBusiness(w);
      const sv = ensureServiceBusiness(w);
      const ap = ensureAssetPortfolio(w);
      const pools = computeFinancialPools(w);

      const employed = w.people.filter((p) => p.employed);
      // Executive authority: active coordinator (CEO) at work, or delegated senior leader (Lv.4+) at work if coordinator is on break
      const ceo =
        employed.find((p) => p.role === "coordinator" && (p.atWork || options.ignoreAtWork)) ||
        employed.find((p) => p.role === "coordinator" && employed.some((s) => (s.career?.level || 1) >= 4 && s.atWork));
      const seniorLeaders = employed.filter((p) => (p.career?.level || 1) >= 3);
      const boardMembers = ceo ? [ceo, ...seniorLeaders.filter((p) => p.id !== ceo.id).slice(0, 5)] : [];

      // Hard Gate 0: Without an employed CEO (coordinator) on duty, strategic capital expansion cannot self-approve out of thin air!
      if (!ceo) {
        if (isTopicOnCooldown(w, "governance", "board_quorum", completedDay, options)) {
          return { ok: false, code: "noExecutiveAuthority", decision: eb.decisionLedger[0] || null };
        }
        const rec = recordBoardDecision(w, {
          day: completedDay,
          category: "governance",
          targetId: "board_quorum",
          titleTh: "วาระพิจารณาแผนลงทุนและขยายไลน์ธุรกิจใหม่",
          proposerName: "ฝ่ายแผนงานองค์กร",
          deciderName: "ไม่มีผู้บริหารสูงสุดปฏิบัติหน้าที่ (Vacant / Off-Duty CEO)",
          boardSize: 0,
          hardGateResults: { authorityReady: false, techReady: true, staffReady: true, cashReady: pools.uncommittedCashSatang > 0 },
          uncommittedCashBefore: pools.uncommittedCashSatang,
          projectedRunwayDays: pools.dailyBurnSatang > 0 ? Math.round((w.finance.cash / pools.dailyBurnSatang) * 10) / 10 : 30,
          resolution: "deferred_no_executive_authority",
          reasonTh: "ไม่มี CEO ปฏิบัติหน้าที่อนุมัติงบลงทุนเชิงกลยุทธ์ จึงชะลอการเปิดไลน์ธุรกิจใหม่ (งานประจำวันและสัญญาที่อนุมัติแล้วยังคงเดินหน้าต่อได้)",
          reviewCooldownDays: 2,
          executionStatus: "deferred",
        });
        return { ok: false, code: "noExecutiveAuthority", decision: rec };
      }

      const ambition = ceo.profile.personality.ambition ?? 50;
      const riskTaking = ceo.profile.personality.riskTaking ?? 50;
      const prudence = ceo.profile.personality.prudence ?? 50;
      const analytical = ceo.profile.aptitudes.analytical ?? 50;
      const personalityDrive = Math.round((ambition * 0.35 + riskTaking * 0.25 - prudence * 0.3 + analytical * 0.1) * 10) / 10;
      const runwayDays = pools.dailyBurnSatang > 0 ? Math.round((w.finance.cash / pools.dailyBurnSatang) * 10) / 10 : 45;
      let remainingUncommitted = pools.uncommittedCashSatang;
      const decisionsThisRound = [];

      // Debt/turnaround protection for large discretionary capex when not in endlessMode and not manually forced
      const inTurnaroundDebtMode =
        w.finance.debt > 0 &&
        !w.facilities?.endlessMode &&
        !options.forceReview &&
        !options.proposeFleetType &&
        !options.evaluateAssetsNow;

      // 1. Check Make-or-Buy / Missing Tech for high-tier components demanded by open offers
      const openOffers = Object.values(w.offers || {}).filter((o) => o.status === "open");
      for (const off of openOffers.slice(0, 2)) {
        const prodSpec = w.catalog.products[off.productId];
        if (!prodSpec) continue;
        for (const [mId] of Object.entries(prodSpec.bom || {})) {
          const rec = D.MATERIAL_RECIPES?.[mId];
          if (
            rec &&
            !materialReady(w,mId) &&
            !cap.unlockedChains[rec.chainId] &&
            !isTopicOnCooldown(w, "make_or_buy", mId, completedDay, options)
          ) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "make_or_buy",
                targetId: mId,
                titleTh: `ประเมินการผลิตชิ้นส่วน "${w.catalog.materials[mId]?.nameTh || mId}" เองเทียบกับการสั่งซื้อจากซัพพลายเออร์`,
                proposerId: ceo.id,
                proposerName: ceo.name,
                deciderId: ceo.id,
                deciderName: `${ceo.name} (CEO & บอร์ดบริหาร ${boardMembers.length} คน)`,
                boardSize: boardMembers.length,
                alternativesConsidered: ["buy_from_supplier", "research_in_house_tech", "defer_order"],
                hardGateResults: { assemblyTechReady: true, componentFabTechReady: false, supplierAvailable: true },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                scoreBreakdown: { marketScore: 72, capabilityScore: 35, personalityMod: personalityDrive, totalScore: 64 },
                resolution: "pilot_or_buy_inputs",
                reasonTh: `บริษัทมีเทคโนโลยีประกอบ "${prodSpec.nameTh}" แต่ยังไม่มีเทคโนโลยีผลิต "${w.catalog.materials[mId]?.nameTh || mId}" ต้นทาง (ยังขาดการรับรองกระบวนการหรือวิชาของทีม) จึงอนุมัติให้ฝ่ายจัดซื้อสั่งซื้อชิ้นส่วนจากซัพพลายเออร์มาประกอบแทนการเสกเทคฟรี`,
                reviewCooldownDays: 3,
                executionStatus: "active_make_or_buy",
              }),
            );
            break;
          }
        }
      }

      // 2. Evaluate Cold-Chain / Heavy Fleet Expansion (reefer_6w / heavy_10w) when unserved freight quotes exist
      const unservedQuotes = (ft.openQuotes || []).filter((q) => {
        if (q.status !== "quoted") return false;
        return !Object.values(ft.vehicles || {}).some(
          (v) =>
            v.status === "idle" &&
            v.maxWeightKg >= q.weightKg &&
            v.maxVolumeM3 >= q.volumeM3 &&
            Array.isArray(v.supportedCargoTypes) &&
            v.supportedCargoTypes.includes(q.cargoType),
        );
      });
      if ((unservedQuotes.length > 0 && completedDay >= 5) || options.proposeFleetType) {
        const targetQ = unservedQuotes[0];
        const targetTypeId =
          options.proposeFleetType ||
          (targetQ?.cargoType === "cold_chain" ? "reefer_6w" : targetQ?.weightKg > 6500 ? "heavy_10w" : "reefer_6w");
        const vSpec = D.FLEET_VEHICLES?.[targetTypeId];
        if (vSpec && !isTopicOnCooldown(w, "fleet_expansion", targetTypeId, completedDay, options)) {
          const busyDriverIds = new Set(
            Object.values(ft.contracts || {})
              .filter((c) => ["reserved", "loading", "outbound", "delivering"].includes(c.status))
              .map((c) => c.driverPersonId),
          );
          const freeDrivers = employed.filter((p) => p.role === "logistics" && !busyDriverIds.has(p.id));
          const useLease = prudence >= 65 || remainingUncommitted < vSpec.purchaseCost * 1.25 || inTurnaroundDebtMode;
          const upFrontCost = getFleetUpfrontCost(vSpec, useLease ? "leased" : "owned");
          const expectedMargin = targetQ
            ? targetQ.offeredRateSatang - Math.round(targetQ.totalRoundTripKm * 800) - targetQ.tollFeeSatang
            : 450000;
          const debtCapexBuffer = inTurnaroundDebtMode ? (Object.keys(ft.vehicles).length >= 2 ? 4500000 : 1800000) : 0;

          if (freeDrivers.length === 0) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "fleet_expansion",
                targetId: targetTypeId,
                titleTh: `ข้อเสนอจัดหารถ "${vSpec.nameTh}" รองรับงานขนส่ง ${targetQ ? targetQ.nameTh : "B2B"}`,
                proposerName: "ฝ่ายโลจิสติกส์และกองรถ",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, staffReady: false, cashReady: remainingUncommitted >= upFrontCost },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                resolution: "deferred_missing_staff",
                reasonTh: `ชะลอการจัดหา "${vSpec.nameTh}": มีเงินทุนแต่ยังไม่มีพนักงานขับรถ (logistics) ที่ว่างและผ่านเกณฑ์พร้อมขับ จึงไม่ซื้อรถมาจอดทิ้ง`,
                reviewCooldownDays: 2,
                executionStatus: "deferred",
              }),
            );
          } else if (expectedMargin <= 0) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "fleet_expansion",
                targetId: targetTypeId,
                titleTh: `ข้อเสนอจัดหารถ "${vSpec.nameTh}"`,
                proposerName: "ฝ่ายโลจิสติกส์และกองรถ",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, staffReady: true, cashReady: remainingUncommitted >= upFrontCost, marketViable: false },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                resolution: "deferred_unprofitable_market",
                reasonTh: `ปฏิเสธการลงทุน "${vSpec.nameTh}": อัตราค่าจ้างขนส่งในตลาดหักค่าน้ำมันไป-กลับและค่าผ่านทางแล้วยังไม่คุ้มจุดคุ้มทุน เลือกเก็บสภาพคล่องไว้แทน`,
                reviewCooldownDays: 3,
                executionStatus: "rejected",
              }),
            );
          } else if (remainingUncommitted < upFrontCost + debtCapexBuffer) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "fleet_expansion",
                targetId: targetTypeId,
                titleTh: `ข้อเสนอจัดหารถ "${vSpec.nameTh}"`,
                proposerName: "ฝ่ายโลจิสติกส์และกองรถ",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, staffReady: true, cashReady: false },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                resolution: "deferred_working_capital",
                reasonTh: `เลือกเก็บเงินสดสำรองไว้ก่อน: เงินสดอิสระหลังหักสำรองค่าแรงและภาระหนี้ (฿${(remainingUncommitted / 100).toLocaleString("th-TH")}) ยังไม่ถึงเกณฑ์ปลอดภัยสำหรับจัดหา "${vSpec.nameTh}" (฿${(upFrontCost / 100).toLocaleString("th-TH")})`,
                reviewCooldownDays: 3,
                executionStatus: "deferred",
              }),
            );
          } else if (prudence >= 78 && riskTaking <= 35 && !options.forceApprove) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "fleet_expansion",
                targetId: targetTypeId,
                titleTh: `ข้อเสนอจัดหารถ "${vSpec.nameTh}"`,
                proposerName: "ฝ่ายโลจิสติกส์และกองรถ",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, staffReady: true, cashReady: true },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                scoreBreakdown: { marketScore: 68, capabilityScore: 75, personalityMod: personalityDrive, totalScore: 54 },
                resolution: "hold_cash_prudent",
                reasonTh: `CEO (${ceo.name}) มีความรอบคอบสูง (Prudence ${Math.round(prudence)}) และไม่ชอบความเสี่ยง (RiskTaking ${Math.round(riskTaking)}) จึงมีมติให้ถือเงินสดสำรองเพิ่มความมั่นคงแทนการขยายกองรถในรอบนี้`,
                reviewCooldownDays: 3,
                executionStatus: "held_cash",
              }),
            );
          } else {
            const resId = `res-fleet-${targetTypeId}-d${completedDay}`;
            reserveBoardBudget(w, resId, upFrontCost, { category: "fleet_expansion", targetId: targetTypeId });
            const acq = acquireFleetVehicle(w, targetTypeId, { ownership: useLease ? "leased" : "owned" });
            if (acq.ok) {
              consumeBoardReservation(w, resId, acq.costSatang);
              remainingUncommitted = Math.max(0, remainingUncommitted - acq.costSatang);
              decisionsThisRound.push(
                recordBoardDecision(w, {
                  day: completedDay,
                  category: "fleet_expansion",
                  targetId: targetTypeId,
                  titleTh: `อนุมัติ${useLease ? "เช่าดำเนินงาน" : "จัดซื้อ"} "${vSpec.nameTh}"`,
                  proposerName: freeDrivers[0].name,
                  deciderId: ceo.id,
                  deciderName: ceo.name,
                  boardSize: boardMembers.length,
                  hardGateResults: { techReady: true, staffReady: true, cashReady: true },
                  uncommittedCashBefore: remainingUncommitted + acq.costSatang,
                  committedBudget: acq.costSatang,
                  projectedRunwayDays: runwayDays,
                  scoreBreakdown: { marketScore: 82, capabilityScore: 80, personalityMod: personalityDrive, totalScore: 82 },
                  resolution: "approved",
                  reasonTh: `อนุมัติ${useLease ? "เช่า" : "ซื้อ"} "${vSpec.nameTh}" (฿${(acq.costSatang / 100).toLocaleString("th-TH")}) เนื่องจากมีคนขับพร้อม (${freeDrivers[0].name}) และมีดีมานด์งานขนส่งที่ให้อัตรากำไรขั้นต้นเป็นบวก`,
                  reviewCooldownDays: 4,
                  executionStatus: "executed",
                }),
              );
              if (targetQ) {
                const cRes = acceptFreightContract(w, targetQ.id, { vehicleId: acq.vehicleId, driverPersonId: freeDrivers[0].id });
                if (cRes.ok) advanceFreightContract(w, cRes.contractId);
              }
            } else {
              cancelBoardReservation(w, resId);
            }
          }
        }
      }

      // 3. Evaluate Software & SaaS MVP / Custom Project Entry across all 8 apps
      const conceptApps = Object.values(sb.saasProducts || {}).filter((a) => a.status === "concept");
      if ((conceptApps.length > 0 && completedDay >= 5) || options.proposeSoftwareApp) {
        const targetAppId = options.proposeSoftwareApp || conceptApps[0]?.appId;
        const appState = sb.saasProducts?.[targetAppId];
        const appSpec = D.SOFTWARE_APPS?.[targetAppId];
        if (appState && appSpec && !isTopicOnCooldown(w, "software_entry", targetAppId, completedDay, options)) {
          const busyDevIds = new Set(
            Object.values(sb.projects || {})
              .filter((p) => p.assignedDeveloperId && !["closed", "cancelled", "deployed", "supporting"].includes(p.status))
              .map((p) => p.assignedDeveloperId),
          );
          const freeEng = employed.filter(
            (p) => (p.role === "engineer" || (p.skills?.engineering?.level || p.skills?.research?.level || 0) >= 28) && !busyDevIds.has(p.id),
          );
          const wsReady = busyDevIds.size < (sb.workstations?.totalStations || 3);
          const devBudget = 180000;

          if (freeEng.length === 0 || !wsReady) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "software_entry",
                targetId: targetAppId,
                titleTh: `ข้อเสนอพัฒนาผลิตภัณฑ์ซอฟต์แวร์ "${appSpec.nameTh}"`,
                proposerName: "ฝ่ายวิศวกรรมซอฟต์แวร์",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, staffReady: freeEng.length > 0, workstationReady: wsReady, cashReady: remainingUncommitted >= devBudget },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                resolution: "deferred_missing_staff",
                reasonTh: !wsReady
                  ? `ชะลอการเปิดพัฒนา "${appSpec.nameTh}": โต๊ะคอมพิวเตอร์นักพัฒนา (dev_workstation) ถูกใช้งานเต็มความจุแล้ว`
                  : `ชะลอการเปิดพัฒนา "${appSpec.nameTh}": ไม่มีวิศวกรซอฟต์แวร์ (engineer) ที่ว่าง (ห้ามดึงพนักงานฝ่ายอื่นที่ไม่มีทักษะเขียนโค้ดมาทำแทน)`,
                reviewCooldownDays: 3,
                executionStatus: "deferred",
              }),
            );
          } else if (remainingUncommitted >= devBudget) {
            const resId = `res-sw-${targetAppId}-d${completedDay}`;
            reserveBoardBudget(w, resId, devBudget, { category: "software_entry", targetId: targetAppId });
            updateSaasSubscription(w, targetAppId, { launchMvp: true, addLeads: 8 });
            const salesStaff = employed.filter((p) => p.role === "sales");
            if (salesStaff.length > 0) {
              updateSaasSubscription(w, targetAppId, { convertUsers: 4, runBillingCycle: true });
            }
            consumeBoardReservation(w, resId, devBudget);
            remainingUncommitted = Math.max(0, remainingUncommitted - devBudget);
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "software_entry",
                targetId: targetAppId,
                titleTh: `อนุมัติพัฒนาและเปิดตัว MVP แอปพลิเคชัน "${appSpec.nameTh}"`,
                proposerId: freeEng[0].id,
                proposerName: freeEng[0].name,
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, staffReady: true, workstationReady: true, cashReady: true },
                uncommittedCashBefore: remainingUncommitted + devBudget,
                committedBudget: devBudget,
                projectedRunwayDays: runwayDays,
                resolution: "approved",
                reasonTh: `อนุมัติให้ ${freeEng[0].name} พัฒนาและเปิดบริการ MVP "${appSpec.nameTh}" พร้อมให้ฝ่ายขายแปลงลูกค้าเข้าใช้งานจริง`,
                reviewCooldownDays: 3,
                executionStatus: "executed",
              }),
            );
          }
        }
      }

      // 4. Evaluate Industrial B2B Service Orders dynamically across all 8 service models (ranked by spare-part readiness, demand, and net margin)
      const serviceList = Object.values(D.INDUSTRIAL_SERVICES || {});
      if ((completedDay >= 4 || options.proposeServiceType) && serviceList.length > 0) {
        const srvMult = w.externalWorld?.geopolitics?.sectorDemandMultipliers?.service || 1.0;
        const rankedServices = options.proposeServiceType
          ? [D.INDUSTRIAL_SERVICES[options.proposeServiceType]].filter(Boolean)
          : serviceList
              .slice()
              .map((s) => {
                const reqP = s.sparePartInputs || {};
                const fbP = s.fallbackSparePartInputs || null;
                const primaryReady = Object.entries(reqP).every(([mId, q]) => safeAvailableToDeduct(w, mId) >= q);
                const fallbackReady = fbP ? Object.entries(fbP).every(([mId, q]) => safeAvailableToDeduct(w, mId) >= q) : false;
                const partsReady = primaryReady || fallbackReady;
                const recVal = Object.entries(s.recoveredOutputs || {}).reduce(
                  (sum, [mId, q]) => sum + (w.catalog.materials[mId]?.unitCost || 2500) * q,
                  0,
                );
                const slagBonus = s.id === "industrial_recycling" && safeAvailableToDeduct(w, "mineral_slag_mud") >= 1 ? 180000 : 0;
                const netMargin = Math.round((s.serviceFeeSatang || 380000) * srvMult) - (s.labConsumableCostSatang || 45000) + recVal + slagBonus;
                const onCd = isTopicOnCooldown(w, "service_entry", s.id, completedDay, options);
                const score = (onCd ? -500000 : 0) + (partsReady ? 600000 : 0) + netMargin;
                return { spec: s, partsReady, netMargin, score };
              })
              .sort((a, b) => b.score - a.score);

        const chosen = rankedServices[0];
        const srvSpec = chosen?.spec;
        if (srvSpec && !isTopicOnCooldown(w, "service_entry", srvSpec.id, completedDay, options)) {
          const reqParts = srvSpec.sparePartInputs || {};
          let missingPart = Object.entries(reqParts).find(([mId, qty]) => safeAvailableToDeduct(w, mId) < qty);
          if (missingPart && srvSpec.fallbackSparePartInputs) {
            const fbMissing = Object.entries(srvSpec.fallbackSparePartInputs).find(([mId, qty]) => safeAvailableToDeduct(w, mId) < qty);
            if (!fbMissing) missingPart = null;
          }
          const labCost = srvSpec.labConsumableCostSatang || 45000;
          if (missingPart) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "service_entry",
                targetId: srvSpec.id,
                titleTh: `พิจารณาใบงานบริการ "${srvSpec.shortNameTh}"`,
                proposerName: "ฝ่ายบริการวิศวกรรม B2B",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, partsReady: false, cashReady: remainingUncommitted >= labCost },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                resolution: "deferred_missing_materials",
                reasonTh: `ชะลอการรับงาน "${srvSpec.shortNameTh}": อะไหล่ "${w.catalog.materials[missingPart[0]]?.nameTh || missingPart[0]}" ในคลังไม่พอ (ต้องการ ${missingPart[1]} ชิ้น) ต้องรอฝ่ายจัดซื้อเติมสต็อกก่อน`,
                reviewCooldownDays: 2,
                executionStatus: "deferred",
              }),
            );
          } else if (remainingUncommitted < labCost) {
            decisionsThisRound.push(
              recordBoardDecision(w, {
                day: completedDay,
                category: "service_entry",
                targetId: srvSpec.id,
                titleTh: `พิจารณาใบงานบริการ "${srvSpec.shortNameTh}"`,
                proposerName: "ฝ่ายบริการวิศวกรรม B2B",
                deciderId: ceo.id,
                deciderName: ceo.name,
                boardSize: boardMembers.length,
                hardGateResults: { techReady: true, partsReady: true, cashReady: false },
                uncommittedCashBefore: remainingUncommitted,
                projectedRunwayDays: runwayDays,
                resolution: "deferred_working_capital",
                reasonTh: `ชะลอการรับงาน "${srvSpec.shortNameTh}": เงินสดอิสระหลังหักเงินสำรองอยู่รอด (฿${(remainingUncommitted / 100).toLocaleString("th-TH")}) ไม่พอสำหรับสำรองค่าวัสดุสิ้นเปลืองแล็บ (฿${(labCost / 100).toLocaleString("th-TH")})`,
                reviewCooldownDays: 2,
                executionStatus: "deferred",
              }),
            );
          } else {
            // Pick best client corporation dynamically by trustScore & pricePremium
            const candidateCorps = (srvSpec.clientCorps || [])
              .map((cid) => w.externalWorld?.corporations?.[cid])
              .filter(Boolean)
              .sort((a, b) => (b.trustScore || 50) + (b.pricePremium || 0) * 200 - ((a.trustScore || 50) + (a.pricePremium || 0) * 200));
            const clientCorpId = candidateCorps[0]?.id || srvSpec.clientCorps?.[0] || "siam_tech";
            const resId = `res-srv-${srvSpec.id}-d${completedDay}`;
            reserveBoardBudget(w, resId, labCost, { category: "service_entry", targetId: srvSpec.id });
            const sRes = startServiceOrder(w, srvSpec.id, clientCorpId);
            if (sRes.ok) {
              const advRes = advanceServiceOrder(w, sRes.orderId, { workMinutes: 5, completeAllSteps: false });
              if (advRes.ok) {
                consumeBoardReservation(w, resId, labCost);
                decisionsThisRound.push(
                  recordBoardDecision(w, {
                    day: completedDay,
                    category: "service_entry",
                    targetId: srvSpec.id,
                    titleTh: `อนุมัติรับและส่งมอบงานบริการ "${srvSpec.shortNameTh}" ให้แก่ ${sRes.order.clientNameTh}`,
                    proposerName: sRes.order.specialistName,
                    deciderId: ceo.id,
                    deciderName: ceo.name,
                    boardSize: boardMembers.length,
                    hardGateResults: { techReady: true, staffReady: true, partsReady: true, cashReady: true },
                    uncommittedCashBefore: remainingUncommitted,
                    committedBudget: labCost,
                    projectedRunwayDays: runwayDays,
                    scoreBreakdown: { marketScore: 84, capabilityScore: 78, personalityMod: personalityDrive, totalScore: 84 },
                    resolution: "approved",
                    reasonTh: `ผู้เชี่ยวชาญ (${sRes.order.specialistName}) และอะไหล่พร้อมครบ จึงรับงานและส่งมอบ "${srvSpec.shortNameTh}" ให้ ${sRes.order.clientNameTh} สร้างรายได้บริการ +฿${(srvSpec.serviceFeeSatang / 100).toLocaleString("th-TH")}`,
                    reviewCooldownDays: 2,
                    executionStatus: "executed",
                  }),
                );
              } else {
                cancelBoardReservation(w, resId);
              }
            } else {
              cancelBoardReservation(w, resId);
              if (sRes.code === "noAvailableSpecialist") {
                decisionsThisRound.push(
                  recordBoardDecision(w, {
                    day: completedDay,
                    category: "service_entry",
                    targetId: srvSpec.id,
                    titleTh: `พิจารณาใบงานบริการ "${srvSpec.shortNameTh}"`,
                    proposerName: "ฝ่ายบริการวิศวกรรม B2B",
                    deciderId: ceo.id,
                    deciderName: ceo.name,
                    boardSize: boardMembers.length,
                    hardGateResults: { techReady: true, staffReady: false, partsReady: true },
                    uncommittedCashBefore: remainingUncommitted,
                    projectedRunwayDays: runwayDays,
                    resolution: "deferred_missing_staff",
                    reasonTh: `ชะลอรับงาน "${srvSpec.shortNameTh}": ผู้เชี่ยวชาญติดภารกิจอื่นทั้งหมด (ห้ามจองคนซ้ำซ้อน)`,
                    reviewCooldownDays: 2,
                    executionStatus: "deferred",
                  }),
                );
              }
            }
          }
        }
      }

      // 5. Demand- & Bottleneck-Scored External Asset Investment (Replaces blind unowned[0])
      if (ap.supplyChainStrategy !== "asset_light" && (completedDay >= 7 || options.evaluateAssetsNow)) {
        const unownedAssets = Object.values(D.EXTERNAL_ASSETS || {}).filter((a) => !ap.ownedAssets[a.id]);
        if (unownedAssets.length > 0) {
          const scoredAssets = unownedAssets
            .map((a) => {
              let demandScore = 40;
              for (const [mId, qty] of Object.entries(a.harvestYields || a.starterSeeds || {})) {
                const consumed = w.inventory.consumed[mId] || 0;
                const purchased = w.inventory.purchased[mId] || 0;
                const lowStock = (w.inventory.materials[mId] || 0) < 4 ? 18 : 0;
                const geoSpike = Math.max(0, Math.round(((w.externalWorld?.geopolitics?.materialPriceMultipliers?.[mId] || 1.0) - 1.0) * 60));
                demandScore += (consumed + purchased) * 3 + lowStock + qty * 2 + geoSpike;
              }
              if (a.pricePremiumBonus) demandScore += 22;
              if (a.leadTimeReductionPct) demandScore += 18;
              const roiScore = Math.round(demandScore + personalityDrive - a.cost / 500000);
              return { asset: a, demandScore, roiScore };
            })
            .sort((x, y) => y.roiScore - x.roiScore);

          const best = scoredAssets[0];
          const assetDebtBuffer = inTurnaroundDebtMode ? (w.finance.debt + 3500000) : 0;
          if (best && !isTopicOnCooldown(w, "external_asset", best.asset.id, completedDay, options)) {
            if (remainingUncommitted < best.asset.cost + assetDebtBuffer) {
              decisionsThisRound.push(
                recordBoardDecision(w, {
                  day: completedDay,
                  category: "external_asset",
                  targetId: best.asset.id,
                  titleTh: `ประเมินการเข้าซื้อสินทรัพย์ต้นน้ำ/ปลายน้ำ "${best.asset.shortNameTh}"`,
                  proposerName: "ฝ่ายกลยุทธ์ซัพพลายเชน",
                  deciderId: ceo.id,
                  deciderName: ceo.name,
                  boardSize: boardMembers.length,
                  hardGateResults: { techReady: true, cashReady: false },
                  uncommittedCashBefore: remainingUncommitted,
                  projectedRunwayDays: runwayDays,
                  scoreBreakdown: { marketScore: best.demandScore, capabilityScore: 70, personalityMod: personalityDrive, totalScore: best.roiScore },
                  resolution: "deferred_working_capital",
                  reasonTh: `เลือกชะลอการซื้อ "${best.asset.shortNameTh}" (฿${(best.asset.cost / 100).toLocaleString("th-TH")}): เงินสดอิสระหลังกันเงินสำรองฉุกเฉินและภาระหนี้ (฿${(remainingUncommitted / 100).toLocaleString("th-TH")}) ยังไม่เพียงพอ`,
                  reviewCooldownDays: 3,
                  executionStatus: "deferred",
                }),
              );
            } else if (prudence >= 76 && riskTaking <= 38 && !options.forceApprove) {
              decisionsThisRound.push(
                recordBoardDecision(w, {
                  day: completedDay,
                  category: "external_asset",
                  targetId: best.asset.id,
                  titleTh: `ประเมินการเข้าซื้อสินทรัพย์ "${best.asset.shortNameTh}"`,
                  proposerName: "ฝ่ายกลยุทธ์ซัพพลายเชน",
                  deciderId: ceo.id,
                  deciderName: ceo.name,
                  boardSize: boardMembers.length,
                  hardGateResults: { techReady: true, cashReady: true },
                  uncommittedCashBefore: remainingUncommitted,
                  projectedRunwayDays: runwayDays,
                  scoreBreakdown: { marketScore: best.demandScore, capabilityScore: 70, personalityMod: personalityDrive, totalScore: best.roiScore },
                  resolution: "hold_cash_prudent",
                  reasonTh: `CEO (${ceo.name}) มีความรอบคอบสูง (Prudence ${Math.round(prudence)}) จึงมีมติให้ถือเงินสดสำรองไว้รักษาสภาพคล่องแทนการทุ่มซื้อ "${best.asset.shortNameTh}"`,
                  reviewCooldownDays: 3,
                  executionStatus: "held_cash",
                }),
              );
            } else {
              const resId = `res-asset-${best.asset.id}-d${completedDay}`;
              reserveBoardBudget(w, resId, best.asset.cost, { category: "external_asset", targetId: best.asset.id });
              const acqRes = acquireExternalAsset(w, best.asset.id);
              if (acqRes.ok) {
                consumeBoardReservation(w, resId, best.asset.cost);
                remainingUncommitted = Math.max(0, remainingUncommitted - best.asset.cost);
                decisionsThisRound.push(
                  recordBoardDecision(w, {
                    day: completedDay,
                    category: "external_asset",
                    targetId: best.asset.id,
                    titleTh: `อนุมัติเข้าซื้อกิจการ "${best.asset.shortNameTh}" ตามคะแนนคอขวดวัตถุดิบสูงสุด`,
                    proposerName: "ฝ่ายกลยุทธ์ซัพพลายเชน",
                    deciderId: ceo.id,
                    deciderName: ceo.name,
                    boardSize: boardMembers.length,
                    hardGateResults: { techReady: true, cashReady: true },
                    uncommittedCashBefore: remainingUncommitted + best.asset.cost,
                    committedBudget: best.asset.cost,
                    projectedRunwayDays: runwayDays,
                    scoreBreakdown: { marketScore: best.demandScore, capabilityScore: 75, personalityMod: personalityDrive, totalScore: best.roiScore },
                    resolution: "approved",
                    reasonTh: `บอร์ดบริหารอนุมัติซื้อ "${best.asset.shortNameTh}" (คะแนนความต้องการ ${best.demandScore} สูงสุดในกลุ่มตัวเลือก) เพื่อเสริมความมั่นคงของวัตถุดิบและอัตรากำไร`,
                    reviewCooldownDays: 4,
                    executionStatus: "executed",
                  }),
                );
              } else {
                cancelBoardReservation(w, resId);
              }
            }
          }
        }
      }

      // 6. Regional Trade Corridor & Midstream Metals Response (v2.1.0)
      const corridors = Object.values(w.externalWorld?.geopolitics?.tradeCorridors || {});
      const stressedCorridor = corridors.find((c) => c.status === "restricted" || c.status === "booming");
      if (stressedCorridor && !isTopicOnCooldown(w, "corridor_strategy", stressedCorridor.id, completedDay, options)) {
        if (
          stressedCorridor.id === "corridor_indo_australia_mineral" &&
          safeAvailableToDeduct(w, "bauxite_ore") >= 2 &&
          safeAvailableToDeduct(w, "raw_water_m3") >= 1 &&
          materialReady(w,"alumina_billet")
        ) {
          craftMaterialRecipe(w, "alumina_billet", 1, { silent: true, ignoreCapitalGate: true });
        } else if (
          stressedCorridor.id === "corridor_indo_australia_mineral" &&
          safeAvailableToDeduct(w, "iron_ore") >= 2 &&
          materialReady(w,"structural_steel_plate")
        ) {
          craftMaterialRecipe(w, "structural_steel_plate", 1, { silent: true, ignoreCapitalGate: true });
        }
        decisionsThisRound.push(
          recordBoardDecision(w, {
            day: completedDay,
            category: "corridor_strategy",
            targetId: stressedCorridor.id,
            titleTh: `ปรับแผนรับมือสถานะระเบียงการค้า "${stressedCorridor.nameTh}" (${stressedCorridor.status})`,
            proposerId: ceo.id,
            proposerName: ceo.name,
            deciderId: ceo.id,
            deciderName: ceo.name,
            boardSize: boardMembers.length,
            hardGateResults: { techReady: true, staffReady: true, cashReady: true },
            uncommittedCashBefore: remainingUncommitted,
            projectedRunwayDays: runwayDays,
            scoreBreakdown: { marketScore: Math.round(stressedCorridor.demandMod * 70), capabilityScore: 72, personalityMod: personalityDrive, totalScore: 76 },
            resolution: stressedCorridor.status === "restricted" ? "pilot_or_buy_inputs" : "approved",
            reasonTh:
              stressedCorridor.status === "restricted"
                ? `ระเบียงการค้า "${stressedCorridor.nameTh}" มีกำแพงภาษี/เวลาขนส่งตึงตัว (ภาษี ${stressedCorridor.tariffPct}% • เวลานำเข้า ×${stressedCorridor.leadTimeMod}) จึงสั่งเร่งแปรรูปโลหะและวัตถุดิบในประเทศทดแทนการนำเข้า`
                : `ระเบียงการค้า "${stressedCorridor.nameTh}" กำลังขยายตัวสูง (อุปสงค์ ×${stressedCorridor.demandMod}) จึงอนุมัติเร่งรับออเดอร์ส่งออกและงานบริการในภูมิภาค`,
            reviewCooldownDays: 4,
            executionStatus: "executed",
          }),
        );
      }

      eb.lastReviewDay = completedDay;
      computeFinancialPools(w);
      return { ok: true, decisionsCount: decisionsThisRound.length, decisions: decisionsThisRound, pools: eb.budgetPools };
    }

    function evaluateNewBusinessOperationsDaily(w, completedDay) {
      const ft = ensureFleetTransport(w);
      const sb = ensureSoftwareBusiness(w);
      const sv = ensureServiceBusiness(w);
      if (!w.policies.autoAccept) return;
      if (completedDay < 4) return;

      // 1. Autonomous Fleet Transport: progress active contracts via timed tick engine, match backhaul when returning, maintain worn vehicles, and accept profitable quotes
      for (const c of Object.values(ft.contracts)) {
        if (!["paid", "cancelled", "failed"].includes(c.status)) {
          advanceFreightContract(w, c.id);
        }
      }
      if (ft.openQuotes.filter((q) => q.status === "quoted").length < 2) {
        const routes = D.FREIGHT_ROUTES || [];
        const r = routes[(completedDay - 1) % routes.length];
        if (r) {
          ft.openQuotes.push({
            id: `fquote-d${completedDay}-${++w.sequence}`,
            routeId: r.id,
            nameTh: r.nameTh,
            originTh: r.originTh,
            destinationTh: r.destinationTh,
            pickupEmptyKm: r.pickupEmptyKm,
            outboundLoadedKm: r.outboundLoadedKm,
            backhaulEmptyKm: r.backhaulEmptyKm,
            totalRoundTripKm: r.pickupEmptyKm + r.outboundLoadedKm + r.backhaulEmptyKm,
            tollFeeSatang: r.tollFeeSatang,
            offeredRateSatang: r.baseRateSatang,
            cargoType: r.cargoType,
            cargoNameTh: r.cargoNameTh,
            weightKg: r.weightKg,
            volumeM3: r.volumeM3,
            cargoValueSatang: r.cargoValueSatang,
            clientCorpId: r.clientCorpId,
            status: "quoted",
            createdAt: now(w),
          });
        }
      }
      for (const v of Object.values(ft.vehicles)) {
        if (v.status === "idle" && (v.condition < 65 || v.tireCondition < 55) && w.finance.cash > 6000000) {
          maintainFleetVehicle(w, v.id);
        }
      }
      if (w.finance.cash > 4500000) {
        const openQ = ft.openQuotes.find((q) => q.status === "quoted");
        if (openQ) {
          const res = acceptFreightContract(w, openQ.id);
          if (res.ok) {
            advanceFreightContract(w, res.contractId);
          }
        }
      }

      // 2. Autonomous Software & SaaS Operations
      for (const proj of Object.values(sb.projects)) {
        if (!["supporting", "closed", "cancelled", "blocked"].includes(proj.status) && w.finance.cash > 5000000) {
          advanceSoftwareProject(w, proj.id, { completeAllSteps: false });
        }
      }
      for (const app of Object.values(sb.saasProducts || {})) {
        if (app.status === "live") {
          if (completedDay >= 3 && app.leadCount > 0 && app.activeSubscribers === 0) {
            updateSaasSubscription(w, app.appId, { convertUsers: Math.min(5, app.leadCount) });
          }
          if (app.activeSubscribers > 0 && now(w) >= app.nextBillingMinute) {
            updateSaasSubscription(w, app.appId, { runBillingCycle: true });
          }
        }
      }

      // 3. Autonomous Industrial B2B Service Orders progression
      for (const ord of Object.values(sv.orders || {})) {
        if (!["paid", "cancelled"].includes(ord.status)) {
          advanceServiceOrder(w, ord.id, { workMinutes: 10, completeAllSteps: false });
        }
      }

      // 4. Run Executive Board & Business Entry Evaluation if company has scaled or owns external assets
      if (completedDay >= 9 && (w.people.length >= 10 || Object.keys(w.externalWorld?.assetPortfolio?.ownedAssets || {}).length > 0) && (w.executiveBoard?.lastReviewDay || 0) < completedDay) {
        evaluateExecutiveBoardAndBusinessEntry(w, completedDay);
      }
    }

    function evaluateSalesNegotiation(w, salesPerson, productSpec, client) {
      if (!salesPerson || !productSpec) {
        return {
          pitchScore: 65,
          priceMarkupPct: 0,
          negotiatedDepositPct: 0.3,
          styleTh: "มาตรฐานบริษัท",
          summaryTh: "รับข้อเสนอตามราคากลางตลาด",
        };
      }
      const roleSkill = w.catalog.roles[salesPerson.role]?.skill || "sales";
      const skillLv = salesPerson.skills[roleSkill]?.level || 45;
      const comm = salesPerson.profile.aptitudes.communication ?? 50;
      const insight = salesPerson.profile.aptitudes.emotionalInsight ?? 50;
      const verbal = salesPerson.profile.aptitudes.verbal ?? 50;
      const assertiveness = salesPerson.profile.personality.assertiveness ?? 50;
      const ambition = salesPerson.profile.personality.ambition ?? 50;
      const integrity = salesPerson.profile.personality.integrity ?? 50;
      const annexBuilt = Boolean(w.facilities?.constructedPlots?.includes("execAnnex"));
      const clientTrust = client?.trustScore ?? 50;

      const pitchScore = Math.round(
        clamp(
          skillLv * 0.38 +
            comm * 0.2 +
            insight * 0.14 +
            verbal * 0.12 +
            assertiveness * 0.08 +
            ambition * 0.08 +
            (annexBuilt ? 6 : 0) +
            (clientTrust - 50) * 0.15,
          20,
          100,
        ),
      );
      const priceMarkupPct = Math.round(clamp((pitchScore - 50) * 0.3, -3, 18) * 10) / 10;
      const negotiatedDepositPct = pitchScore >= 72 ? 0.35 : 0.3;
      const styleTh =
        assertiveness >= 68 && ambition >= 65
          ? "รุกเจรจาปิดดีลเชิงรุก (Aggressive B2B Pitch)"
          : insight >= 65 && integrity >= 65
            ? "ที่ปรึกษาสร้างความเชื่อมั่นระยะยาว (Consultative Trust)"
            : "เจรจาต่อรองตามมาตรฐานการค้า (Balanced Commercial)";
      const summaryTh = `${salesPerson.name} ใช้ทักษะการขาย (${Math.round(skillLv)}) และการสื่อสาร (${Math.round(comm)}) เจรจากับ ${client ? client.nameTh : "ลูกค้า B2B"} ได้คะแนนดีล ${pitchScore}/100`;
      return {
        pitchScore,
        priceMarkupPct,
        negotiatedDepositPct,
        styleTh,
        summaryTh,
      };
    }

    function makeOffer(w, productId, quantity, days = 6, salesQuality = 0.65, negotiator = null) {
      const p = w.catalog.products[productId],
        oid = id(w, "offer"),
        rawRoll = random(w),
        repBias = ((w.reputation - 45) / 100) * 0.15,
        skillBias = (salesQuality - 0.65) * 0.2,
        blended = clamp(rawRoll + repBias + skillBias, 0, 1),
        assetBonuses = getActiveExternalAssetBonuses(w),
        price = Math.round((p.priceMin + (p.priceMax - p.priceMin) * blended) * (1 + assetBonuses.pricePremiumBonus));
      const paymentMinutes = Math.round(random(w) * 2) * 1440;
      const client = pickClientForProduct(w, productId, oid);
      const neg = negotiator ? evaluateSalesNegotiation(w, negotiator, p, client) : null;
      const corpRec = client && w.externalWorld?.corporations?.[client.id];
      const isPartnerCorp = Boolean(corpRec && corpRec.relationshipMode === "partner");
      const annexBuilt = Boolean(w.facilities?.constructedPlots?.includes("execAnnex"));
      const activeMarkupPct =
        (isPartnerCorp ? 0.05 : 0) +
        ((annexBuilt || isPartnerCorp) && neg ? Math.max(0, (neg.priceMarkupPct || 0) / 100) : 0);
      const geo = w.externalWorld?.geopolitics;
      const geoSectorMult =
        geo
          ? clamp(geo.sectorDemandMultipliers?.[p.industry] || 1.0, 0.85, 1.45)
          : 1.0;
      const baseWithMarkup = activeMarkupPct > 0 ? Math.round(price * (1 + activeMarkupPct)) : price;
      const finalUnitPrice = geoSectorMult !== 1.0 ? Math.round(baseWithMarkup * geoSectorMult) : baseWithMarkup;
      const negDepBonus = (annexBuilt || isPartnerCorp) && neg && neg.negotiatedDepositPct > 0.3 ? 0.05 : 0;
      w.offers[oid] = {
        id: oid,
        productId,
        quantity,
        unitPrice: finalUnitPrice,
        deadline: now(w) + (days + assetBonuses.deadlineBonusDays) * 1440,
        expiresAt: now(w) + 1440 * 3,
        paymentMinutes,
        depositPct: Math.round(clamp(0.3 + assetBonuses.depositPctBonus + negDepBonus, 0.3, 0.45) * 100) / 100,
        customerName: client ? `${client.nameTh} (#${oid.split("-")[1]})` : "ลูกค้า " + oid.split("-")[1],
        clientId: client ? client.id : null,
        clientTierTh: client ? client.tierTh : "B2B มาตรฐาน",
        negotiatedBy: negotiator ? negotiator.name : null,
        negotiatedById: negotiator ? negotiator.id : null,
        salesPitchScore: neg ? neg.pitchScore : Math.round(salesQuality * 100),
        negotiationStyleTh: neg ? neg.styleTh : "ข้อเสนอตลาด B2B",
        status: "open",
      };
      return w.offers[oid];
    }

    function syncStationCapacitiesForScale(w) {
      const employedCount = w.people.filter((p) => p.employed).length;
      if (employedCount <= 10) return;
      const scaleFactor = Math.max(1, Math.ceil(employedCount / 8));
      for (const st of Object.values(w.layout.stations)) {
        if (["pantry", "lounge", "meal"].includes(st.kind)) {
          st.capacity = Math.max(st.capacity, 8 * scaleFactor);
        } else if (st.kind === "training") {
          st.capacity = Math.max(st.capacity, 4 * scaleFactor);
        } else if (["assembly", "quality", "packing", "shipping", "receiving", "stock", "finished"].includes(st.kind)) {
          st.capacity = Math.max(st.capacity, Math.ceil(employedCount / 4));
        } else if (["sales", "admin", "research", "manager"].includes(st.kind)) {
          st.capacity = Math.max(st.capacity, Math.ceil(employedCount / 6));
        }
      }
      w.catalog.rules.maxActiveOrders = Math.max(12, Math.min(200, Math.ceil(employedCount * 1.2)));
      w.catalog.rules.maxUnits = Math.max(160, Math.min(4000, employedCount * 12));
    }

    function create(seed = "company", options = {}) {
      if (
        !(
          typeof seed === "string" ||
          (typeof seed === "number" && Number.isFinite(seed))
        )
      )
        throw new TypeError("invalid seed");
      const catalog = options.catalog
        ? clone(options.catalog)
        : D.createCatalog();
      if (!catalog.taskKinds) catalog.taskKinds = {};
      if (options.startupMode === "lean" || options.starterCount === 5) {
        catalog.starters = clone(D.LEAN_STARTERS || catalog.starters.slice(0, 5));
      } else if (int(options.starterCount, 4, 30)) {
        catalog.starters = catalog.starters.slice(0, options.starterCount);
      }
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      const materials = Object.fromEntries(
          Object.keys(catalog.materials).map((k) => [
            k,
            catalog.initialStock[k] || 0,
          ]),
        ),
        zeros = Object.fromEntries(Object.keys(materials).map((k) => [k, 0])),
        productsZero = Object.fromEntries(
          Object.keys(catalog.products).map((k) => [k, 0]),
        );
      const w = {
        version: VERSION,
        schema: SCHEMA,
        coreVersion: H.VERSION,
        seed: String(seed),
        clock: { absoluteMinute: 540, tick: 0 },
        sequence: 0,
        rng: { state: seedHash(seed), draws: 0 },
        catalog,
        layout: L.createLayout(),
        finance: E.createFinance(
          catalog.rules.initialCash,
          catalog.rules.initialDebt,
        ),
        inventory: {
          materials,
          opening: clone(materials),
          reserved: clone(zeros),
          purchased: clone(zeros),
          consumed: clone(zeros),
          finished: clone(productsZero),
        },
        production: {
          started: clone(productsZero),
          completed: clone(productsZero),
          scrapped: clone(productsZero),
          shipped: clone(productsZero),
        },
        people: [],
        orders: {},
        offers: {},
        units: {},
        jobs: {},
        purchases: {},
        invoices: {},
        research: {
          points: 0,
          unlocked: Object.values(catalog.products)
            .filter((p) => p.researchRequired === 0)
            .map((p) => p.id),
        },
        facilities: freshFacilities(),
        logistics: freshLogistics(),
        agriculture: freshAgriculture(),
        fleetTransport: freshFleetTransport(String(seed)),
        softwareBusiness: freshSoftwareBusiness(),
        sectorProcesses: freshSectorProcesses(),
        serviceBusiness: freshServiceBusiness(),
        capabilities: freshCapabilities(),
        executiveBoard: freshExecutiveBoard(),
        externalWorld: freshExternalWorld(String(seed)),
        companyProgression: freshCompanyProgression(),
        utilities: freshUtilities(),
        culture: freshCulture(),
        reputation: 45,
        policies: {
          autoBuy: true,
          autoAccept: Boolean(options.autonomous),
          workPriority: "balanced",
          overtimeHours: 0,
          overtimeMultiplier: 1.5,
          wellbeingDaily: 0,
        },
        status: "running",
        outcome: null,
        lastSettledDay: 0,
        nextCandidate: 1,
        events: [],
        history: { tasks: [], days: [] },
        socialAt: {},
        metrics: { ordersPaid: 0, unitsScrapped: 0, receipts: 0 },
      };
      w.people = [];
      for (let i = 0; i < catalog.starters.length; i++) {
        const s = catalog.starters[i];
        w.people.push(createPerson(w, "employee-" + (i + 1), s.name, s.role, s.dailyWage));
      }
      W.ensure(w);
      P.ensure(w);
      ensureWarehouse(w);
      recomputeGeopoliticalMultipliers(w);
      ensureKnowledge(w);
      const first = w.research.unlocked[0];
      makeOffer(w, first, 8, 6);
      makeOffer(w, first, 10, 8);
      event(
        w,
        "companyStarted",
        `เริ่มบริษัท Siam Enterprise: ทีมงาน ${w.people.length} คน (ฝ่ายบริหารออฟฟิศ & ฝ่ายปฏิบัติการโรงงาน) พร้อมดำเนินกิจการ`,
      );
      if (int(options.initialHeadcount, 9, 500)) {
        scaleCompany(w, options.initialHeadcount, { freeGrant: true });
      }
      return w;
    }

    function job(w, kind, fields = {}) {
      const custom = own(w.catalog.taskKinds, kind);
      const skill = BUILTIN_TASK_SKILLS[kind] || (custom && custom.skill);
      const stationKind =
        BUILTIN_TASK_STATIONS[kind] || (custom && custom.stationKind);
      if (!skill || !stationKind)
        throw new TypeError("unknown job kind: " + kind);
      const j = {
        id: id(w, "job"),
        kind,
        skill,
        stationKind,
        required: custom ? custom.requiredMinutes : 10,
        progress: 0,
        assignee: null,
        createdAt: now(w),
        ...fields,
      };
      w.jobs[j.id] = j;
      return j;
    }
    function ensureCommerce(w){
      if(!w.commerce)w.commerce={version:1,lastReviewDay:0,contracts:{},tenders:[],history:[],decisionTh:"ฝ่ายขายกำลังสำรวจตลาด"};
      if(!Array.isArray(w.commerce.tenders))w.commerce.tenders=[];
      return w.commerce;
    }
    function commerceLog(w,type,text,detail={}){const c=ensureCommerce(w);c.history.unshift({at:now(w),type,text,...detail});if(c.history.length>100)c.history.pop();event(w,type,text,detail);}
    function renegotiateCommercialContract(w,contractId,options={}){
      const c=ensureCommerce(w),contract=c.contracts[contractId];
      if(!contract||contract.status!=="awarded")return {ok:false,code:"invalidContract"};
      const minQty=Math.max(contract.ordered||1,options.newQuantity||Math.max(contract.ordered||1,Math.ceil(contract.quantity*0.6)));
      if(minQty<contract.quantity){
        W.adjustCommercialEscrow(w,contract.id,minQty*contract.unitPrice);
        contract.reducedFromQuantity=contract.quantity;
        contract.quantity=minQty;
      }
      contract.renegotiatedCount=(contract.renegotiatedCount||0)+1;
      contract.nextDeliveryDay=day(w)+7;
      commerceLog(w,"contractRenegotiated",`เจรจาปรับตารางส่งมอบสัญญา ${contract.customerName} เหลือ ${contract.quantity} ชิ้น คืนงบส่วนต่างให้ผู้ซื้อ`,{contractId:contract.id,quantity:contract.quantity});
      return {ok:true,contractId:contract.id,quantity:contract.quantity,status:contract.status};
    }
    function terminateCommercialContract(w,contractId,reasonTh="ยุติสัญญาโดยตกลงคืนงบที่ยังไม่ส่งมอบ"){
      const c=ensureCommerce(w),contract=c.contracts[contractId];
      if(!contract||contract.status!=="awarded")return {ok:false,code:"invalidContract"};
      if(contract.currentOrderId&&w.orders[contract.currentOrderId]&&!w.orders[contract.currentOrderId].materialConsumed){
        command(w,{type:"cancelOrder",orderId:contract.currentOrderId});
        contract.ordered=Object.values(w.orders).filter(o=>o.commercialContractId===contract.id&&o.status!=="cancelled").reduce((a,o)=>a+o.quantity,0);
        contract.currentOrderId=null;
      }
      contract.status="terminated";
      contract.terminationReasonTh=reasonTh;
      W.closeCommercial(w,contract.id);
      commerceLog(w,"contractTerminated",`ยุติสัญญา ${contract.customerName} อย่างเป็นทางการ (${reasonTh}) และคืนเงินกันส่วนที่เหลือให้คู่ค้า`,{contractId:contract.id});
      return {ok:true,contractId:contract.id,status:contract.status};
    }
    function evaluateCommercialSales(w){
      const c=ensureCommerce(w),today=day(w),ceo=w.people.find(p=>p.employed&&p.atWork&&p.role==="coordinator"),sales=w.people.find(p=>p.employed&&p.atWork&&p.role==="sales");
      if(!w.policies.autoAccept||!ceo||!sales)return;
      const pending=Object.values(c.contracts).filter(x=>x.status==="awarded");
      for(const contract of pending){
        const previous=contract.currentOrderId&&w.orders[contract.currentOrderId];
        if(previous&&previous.status!=="paid"){
          if(now(w)>previous.deadline+14*1440&&!previous.materialConsumed){
            terminateCommercialContract(w,contract.id,"ไม่สามารถจัดหาวัตถุดิบส่งมอบทันกำหนดเกิน 14 วัน");
          }
          continue;
        }
        if(contract.delivered>=contract.quantity){contract.status="completed";W.closeCommercial(w,contract.id);commerceLog(w,"supplyContractCompleted",`ส่งสัญญา ${contract.customerName} ครบ ${contract.quantity} ชิ้น`,{contractId:contract.id});continue;}
        if(today<contract.nextDeliveryDay||activeOrders(w).length>=3||Object.keys(w.units).length>Math.max(24,w.people.length*3))continue;
        const quantity=Math.min(contract.installmentQty,contract.quantity-contract.ordered),product=w.catalog.products[contract.productId];if(quantity<=0)continue;
        const oid=makeOffer(w,product.id,quantity,contract.deliveryWindowDays,.7,sales);
        const offer=typeof oid==='object'?oid:w.offers[oid];
        if(!offer)continue;offer.unitPrice=contract.unitPrice;offer.depositPct=contract.buyerType==='government'?0:.2;offer.customerName=contract.customerName;offer.clientId=contract.buyerType==='firm'?contract.buyerId:null;offer.commercialContractId=contract.id;offer.paymentMinutes=contract.buyerType==='government'?7*1440:2*1440;
        const order=accept(w,offer,sales);
        if(order){contract.nextDeliveryDay=today+contract.intervalDays;commerceLog(w,"supplyInstallmentStarted",`ฝ่ายขายออกงวด ${product.nameTh} ${quantity} ชิ้น จากสัญญารวม ${contract.quantity}`,{contractId:contract.id,orderId:order.id});}
      }
      if(c.lastReviewDay===today)return;c.lastReviewDay=today;
      if(today>=14&&today%14===0&&w.reputation>=65&&(ceo.profile.personality.openness??50)>=30){
        const gap=teamCoverage(w,{quality_documentation:40,contract_management:25}).find(x=>!x.ready);
        const learner=w.people.filter(p=>p.employed&&!p.education?.course&&["admin","sales","coordinator","inspector"].includes(p.role)).sort((a,b)=>subjectLevel(b,gap?.id)-subjectLevel(a,gap?.id))[0];
        if(gap&&learner){plantHooks(w).train(learner,gap.id,gap.level);c.decisionTh=`เตรียมทีมก่อนเสนอขายรัฐ: ${learner.name} เรียน ${SUBJECTS[learner.education.course]||learner.education.course}`;commerceLog(w,"publicProcurementPreparation",c.decisionTh,{personId:learner.id,subjectId:learner.education.course});}
      }
      // Sell real free warehouse goods first. No income is booked until the normal shipment/invoice pipeline runs.
      if(activeOrders(w).length<2){
        const stock=productionView(w).find(x=>x.stock>=2);
        if(stock){const product=w.catalog.products[stock.id],buyer=Object.values(w.externalWorld.corporations).find(b=>(b.buysProducts||[]).includes(product.id));
          if(buyer){const qty=Math.min(stock.stock,20),unitPrice=Math.round(product.priceMin*.98),contractId=id(w,"warehouseSale");
            if(W.reserveCommercial(w,contractId,'firm',buyer.id,qty*unitPrice)){
              const contract=c.contracts[contractId]={id:contractId,productId:product.id,buyerId:buyer.id,buyerType:'firm',customerName:buyer.nameTh,quantity:qty,ordered:0,delivered:0,paidSatang:0,unitPrice,installmentQty:qty,intervalDays:1,deliveryWindowDays:5,nextDeliveryDay:today,status:'awarded',currentOrderId:null,kind:'warehouse',createdDay:today};
              commerceLog(w,"warehouseStockOffered",`ฝ่ายขายเสนอคลัง ${product.nameTh} ${qty} ชิ้น ให้ ${buyer.nameTh} ผู้ซื้อกันเงินจริงแล้ว`,{contractId:contract.id});
            }
          }
        }
      }
      if(today<14||today%7!==0||pending.filter(x=>x.kind!=='warehouse').length>=1)return;
      const employees=w.people.filter(p=>p.employed),wages=employees.reduce((a,p)=>a+p.pay.dailyWage,0),freeCash=w.finance.cash;
      const caution=ceo.profile.personality.prudence??50,ambition=ceo.profile.personality.ambition??50;
      if(freeCash<wages*(18+caution/10)||w.metrics.ordersPaid<3){c.decisionTh='ยังไม่รับสัญญาระยะยาว: เงินสำรองหรือประวัติส่งมอบยังไม่พอ';return;}
      const products=w.research.unlocked.map(id=>w.catalog.products[id]).filter(p=>productReadiness(w,p.id).ready);
      const product=products.sort((a,b)=>(w.production.shipped[b.id]||0)-(w.production.shipped[a.id]||0))[0];if(!product)return;
      const shipped=w.production.shipped[product.id]||0;if(shipped<12){c.decisionTh='ต้องพิสูจน์การผลิตสินค้านี้อย่างน้อย12ชิ้นก่อนรับสัญญาใหญ่';return;}
      const government=today%14===0&&w.reputation>=65&&teamReady(w,{quality_documentation:40,contract_management:25});
      const buyer=government?{id:'TH',nameTh:'หน่วยงานจัดซื้อภาครัฐ (ไทย)'}:Object.values(w.externalWorld.corporations).find(b=>(b.buysProducts||[]).includes(product.id));if(!buyer)return;
      const rate=Math.max(1,Math.floor(shipped/Math.max(7,today-1))),installmentQty=Math.min(80,Math.max(4,rate*5)),quantity=employees.length>=30&&shipped>=200?1000:employees.length>=15?240:120;
      const unitPrice=Math.round(product.priceMin*(government?.94:.96)),cost=Object.entries(product.bom).reduce((a,[k,q])=>a+q*w.catalog.materials[k].unitCost,0);
      const exposure=installmentQty*cost+wages*(government?14:7);
      if(unitPrice<=cost*1.2||freeCash<exposure+wages*14||(ambition<35&&caution>65)){c.decisionTh='เลือกเก็บกระแสเงินสด: ผลตอบแทน/ทุนหมุนเวียนไม่คุ้มภาระสัญญาหรือนิสัยผู้บริหารไม่รับความเสี่ยงนี้';return;}
      let tenderEval=null;
      if(government){
        const docLv=Math.max(...w.people.filter(p=>p.employed).map(p=>subjectLevel(p,"quality_documentation")),40);
        tenderEval=W.evaluateCompetitiveTender(w,product.id,quantity,unitPrice,w.reputation,docLv);
        c.tenders.unshift({id:`tender-d${today}-${product.id}`,day:today,productId:product.id,quantity,unitPrice,playerScore:tenderEval.playerScore,winnerId:tenderEval.winnerId,winnerNameTh:tenderEval.winnerNameTh,competitors:tenderEval.competitors});
        if(c.tenders.length>25)c.tenders.pop();
        if(!tenderEval.won){
          c.decisionTh=`ยื่นประมูลภาครัฐ ${product.nameTh} แพ้คะแนนแก่ ${tenderEval.winnerNameTh}`;
          commerceLog(w,"publicTenderLost",c.decisionTh,{productId:product.id,winnerId:tenderEval.winnerId});
          return;
        }
      }
      const cid=id(w,"supplyContract"),type=government?'government':'firm';if(!W.reserveCommercial(w,cid,type,buyer.id,quantity*unitPrice)){c.decisionTh='ผู้ซื้อมีงบไม่พอกันสัญญาทั้งก้อน';return;}
      c.contracts[cid]={id:cid,productId:product.id,buyerType:type,buyerId:buyer.id,customerName:buyer.nameTh,quantity,unitPrice,ordered:0,delivered:0,paidSatang:0,installmentQty,intervalDays:7,deliveryWindowDays:Math.max(7,Math.ceil(installmentQty/Math.max(1,rate))+4),nextDeliveryDay:today,status:'awarded',currentOrderId:null,kind:government?'public_procurement':'b2b_supply',createdDay:today,tenderEvaluation:tenderEval};
      c.decisionTh=`รับสัญญา ${quantity} ชิ้น แบ่งงวดละ ${installmentQty} ตามประวัติผลิต ${shipped} ชิ้น มีงบผู้ซื้อและทุนหมุนเวียนจริง`;
      commerceLog(w,"supplyContractAwarded",`${buyer.nameTh}: ${c.decisionTh}`,{contractId:cid,buyerType:type,amount:quantity*unitPrice});
    }
    function commercialAudit(w){
      if(!w.commerce)return [];const errors=[];if(w.commerce.version!==1||!w.commerce.contracts||!Array.isArray(w.commerce.history))return ['invalid commerce structure'];
      for(const o of Object.values(w.orders))if(o.commercialContractId&&!w.commerce.contracts[o.commercialContractId])errors.push('orphan commercial installment '+o.id);
      for(const c of Object.values(w.commerce.contracts)){
        const esc=w.externalWorld.living.commercialEscrows?.[c.id];
        if(!w.catalog.products[c.productId]||!int(c.quantity,0,1000000)||!int(c.ordered,0,c.quantity)||!int(c.delivered,0,c.ordered)||!int(c.unitPrice,1)||!int(c.paidSatang,0,(c.reducedFromQuantity||c.quantity)*c.unitPrice)||!['awarded','completed','terminated'].includes(c.status)||!esc)errors.push('invalid commercial contract '+c.id);
        const orders=Object.values(w.orders).filter(o=>o.commercialContractId===c.id&&o.status!=='cancelled');if(c.currentOrderId&&w.orders[c.currentOrderId]?.commercialContractId!==c.id)errors.push('commercial active installment mismatch '+c.id);
        const expectedOpening=(c.reducedFromQuantity||c.quantity)*c.unitPrice;
        if(expectedOpening!==esc?.opening)errors.push('commercial budget mismatch '+c.id);
        if(c.paidSatang!==esc?.paid)errors.push('commercial payment mismatch '+c.id);
        if(orders.reduce((a,o)=>a+o.quantity,0)!==c.ordered||orders.reduce((a,o)=>a+o.shipped,0)!==c.delivered)errors.push('commercial delivery mismatch '+c.id);
      }return errors;
    }
    function productionSteps(product) { return P.route(product).map(s=>s.nameTh); }
    function plantHooks(w) {return {pay:(amount,ref)=>post(w,"equipment",-amount,ref),claim:p=>release(w,p),learn:(p,minutes)=>learnSubject(p,"maintenance",minutes),learnSubject:(p,subj,minutes)=>learnSubject(p,subj,minutes,false),consumeInput:(inMat,qty)=>safeDeductMaterial(w,inMat,qty),releaseBatch:b=>completeRefineryBatch(w,b),warehouseAvailable:addSlots=>warehouseUsed(w)+addSlots<=warehouseCapacity(w),isMaterialReady:matId=>materialReady(w,matId),train:(p,subject,level)=>{if(p.education.course)return;let course=subject,desired=level;const seen=new Set();while(SUBJECT_PREREQUISITES[course]&&subjectLevel(p,SUBJECT_PREREQUISITES[course])<prerequisiteLevel(course)&&!seen.has(course)){seen.add(course);desired=prerequisiteLevel(course);course=SUBJECT_PREREQUISITES[course];}p.education.course=course;p.education.courseLevel=desired;},walk:(p,station)=>{if(p.taskId)release(w,p);destination(w,p,station,"working","equipmentMaintenance");}};}
    function warehouseUsed(w){return Object.values(w.units).filter(u=>u.stage==="ready").reduce((a,u)=>a+P.storageSize(w.catalog.products[u.productId]),0);}
    function warehouseCapacity(w){return 120*facilityLevel(w,"warehouse")+((w.facilities?.constructedPlots||[]).includes("warehouseAnnex")?240:0);}
    function productionView(w) {
      return Object.values(w.catalog.products).map(p=>({id:p.id,nameTh:p.nameTh,steps:productionSteps(p),stock:Object.values(w.units).filter(u=>u.productId===p.id&&u.stage==="ready"&&w.orders[u.orderId]?.stockBatch).length,reserved:Object.values(w.units).filter(u=>u.productId===p.id&&u.stage==="ready"&&!w.orders[u.orderId]?.stockBatch).length,wip:Object.values(w.units).filter(u=>u.productId===p.id&&u.stage!=="ready").length,activeSteps:Object.values(w.units).filter(u=>u.productId===p.id&&u.stage!=="ready").map(u=>({id:u.id,step:u.stage==="assembly"?`${productionSteps(p)[u.process?.index||0]||"เสร็จกระบวนการ"}${u.process?.phase==="machine"?" (เครื่องทำงาน/รอเวลา)":""}`:u.stage,history:u.processHistory||[]}))}));
    }
    function planStockProduction(w) {
      if(!w.policies.autoAccept || tod(w)!==660 || !w.people.some(p=>p.employed&&p.atWork&&p.role==="coordinator"))return;
      const wages=w.people.filter(p=>p.employed).reduce((a,p)=>a+p.pay.dailyWage,0);
      if(w.finance.cash<wages*21 || Object.keys(w.units).length>24 || warehouseUsed(w)>=warehouseCapacity(w)*.8)return;
      for(const pid of w.research.unlocked){
        const product=w.catalog.products[pid];if(!productReadiness(w,pid).ready)continue;
        const existing=Object.values(w.units).filter(u=>u.productId===pid&&w.orders[u.orderId]?.stockBatch).length;
        const target=product.industry==="food"?2:8;if(existing>=target)continue;
        const quantity=Math.min(target-existing,4),cost=Object.entries(product.bom).reduce((a,[k,q])=>a+w.catalog.materials[k].unitCost*q,0);
        if(product.priceMin<=cost*1.2 || Object.entries(product.bom).some(([k,q])=>safeAvailableToDeduct(w,k)<q*quantity))continue;
        const oid=id(w,"stockLot"),o={id:oid,offerId:null,productId:pid,quantity,unitPrice:1,total:quantity,deposit:0,deadline:now(w)+1000000000,paymentMinutes:0,status:"accepted",acceptedAt:now(w),shipped:0,materialConsumed:false,completedAt:null,stockBatch:true,customerName:"ผลิตสะสมเข้าคลัง ยังไม่มีผู้ซื้อ"};
        w.orders[oid]=o;for(let i=0;i<quantity;i++)addUnit(w,o);
        event(w,"stockProductionPlanned",`ฝ่ายบริหารสั่งล็อต ${product.nameTh} ${quantity} ชิ้น เข้าคลังเพื่อเสนอขาย — มีวัตถุดิบและเงินสำรอง21วัน`,{orderId:oid,quantity});break;
      }
    }
    function addUnit(w, order) {
      const p = w.catalog.products[order.productId],
        u = {
          id: id(w, "unit"),
          orderId: order.id,
          productId: p.id,
          stage: "assembly",
          reserved: false,
          materialConsumed: false,
          quality: 0,
          attempts: 0,
        };
      w.units[u.id] = u;
      job(w, "assembly", {
        unitId: u.id,
        orderId: order.id,
        required: p.assemblyMinutes,
      });
      return u;
    }
    function reserve(w, u) {
      if (u.materialConsumed) return true;
      if (u.reserved) return true;
      const bom = w.catalog.products[u.productId].bom;
      if (
        Object.entries(bom).some(
          ([m, n]) => w.inventory.materials[m] - w.inventory.reserved[m] < n,
        )
      )
        return false;
      for (const [m, n] of Object.entries(bom)) w.inventory.reserved[m] += n;
      u.reserved = true;
      return true;
    }
    function unreserve(w, u) {
      if (u && u.reserved) {
        for (const [m, n] of Object.entries(
          w.catalog.products[u.productId].bom,
        ))
          w.inventory.reserved[m] -= n;
        u.reserved = false;
      }
    }
    function consume(w, u) {
      if (u.materialConsumed) return;
      if (!reserve(w, u))
        throw Error("materials unavailable after reservation");
      for (const [m, n] of Object.entries(
        w.catalog.products[u.productId].bom,
      )) {
        w.inventory.reserved[m] -= n;
        w.inventory.materials[m] -= n;
        w.inventory.consumed[m] += n;
      }
      u.reserved = false;
      u.materialConsumed = true;
      if (w.orders[u.orderId]) w.orders[u.orderId].materialConsumed = true;
      w.production.started[u.productId]++;
    }
    function release(w, p, stationLoadMap = null) {
      const j = w.jobs[p.taskId];
      if (j) {
        j.assignee = null;
        if (j.unitId) unreserve(w, w.units[j.unitId]);
      }
      if (stationLoadMap && p.taskId && p.stationId) {
        stationLoadMap.set(p.stationId, Math.max(0, (stationLoadMap.get(p.stationId) || 1) - 1));
      }
      p.taskId = null;
      p.stationId = null;
      p.path = [];
    }
    function destination(w, p, station, activity, reason) {
      const path = L.findPath(w.layout, p.position, station.access);
      if (path === null) {
        p.activity = "blocked";
        p.intent = { code: "unreachableStation", reasons: [station.id] };
        return false;
      }
      p.stationId = station.id;
      p.path = path;
      p.activity = path.length ? "walking" : activity;
      p.intent = { code: reason, reasons: [station.id] };
      return true;
    }
    function stations(w, kind, stationLoadMap = null) {
      if (stationLoadMap) {
        return Object.values(w.layout.stations).filter(
          (s) => s.kind === kind && (stationLoadMap.get(s.id) || 0) < s.capacity,
        );
      }
      return Object.values(w.layout.stations).filter(
        (s) =>
          s.kind === kind &&
          w.people.filter((p) => p.employed && p.taskId && p.stationId === s.id)
            .length < s.capacity,
      );
    }
    function pauseFor(w, p, kind, minutes, reason, decision = null, stationLoadMap = null) {
      release(w, p, stationLoadMap);
      p.breakKind = kind;
      p.breakUntil = now(w) + minutes;
      if (decision) p.decision = decision;
      const station =
        w.layout.stations[
          kind === "meal" ? "meal" : kind === "social" ? "pantry" : "lounge"
        ];
      destination(
        w,
        p,
        station,
        kind === "meal"
          ? "eating"
          : kind === "social"
            ? "socialising"
            : "resting",
        reason,
      );
    }
    function move(p) {
      p.previousPosition = { ...p.position };
      const steps = p.path.splice(0, 8);
      if (steps.length) p.position = { ...steps.at(-1) };
    }
    function ability(w, p, skill, context = {}) {
      const base = H.evaluateAbility(
        p.profile,
        p.state,
        p.skills[skill],
        w.catalog.skills[skill],
        context,
      );
      if (w.utilities?.brownoutActive && skill === "assembly") {
        return {
          ...base,
          speedMultiplier: +(base.speedMultiplier * 0.8).toFixed(4),
        };
      }
      if(context.subject) {
        const score=subjectPerformance(p,context.subject);
        return {...base,speedMultiplier:base.speedMultiplier*(.8+score*.004),qualityChance:clamp(base.qualityChance+(score-50)*.001, .05,.995),subjectScore:score};
      }
      return base;
    }
    function orderOpen(o) {
      return !o.stockBatch && !["paid", "cancelled"].includes(o.status);
    }
    function activeOrders(w) {
      return Object.values(w.orders).filter(orderOpen);
    }
    function ensureJobs(w) {
      for (const o of Object.values(w.offers))
        if (o.status === "open" && o.expiresAt <= now(w)) o.status = "expired";
      const employedCount = w.people.filter((p) => p.employed).length;
      const maxOpenOffers = employedCount > 15 ? Math.min(24, Math.ceil(employedCount / 4)) : 6;
      if (
        !Object.values(w.jobs).some((j) => j.kind === "sales") &&
        Object.values(w.offers).filter((o) => o.status === "open").length < maxOpenOffers
      )
        job(w, "sales", { required: 150 });
      const k = ensureKnowledge(w);
      const project = Object.values(k.projects).find(p => p.status !== "qualified");
      if (!Object.values(w.jobs).some(j => j.kind === "research")) {
        const learner = w.people.find(p => p.employed && p.education?.course);
        if (learner) job(w, "research", { required: 120, learnerId: learner.id, courseSubject: learner.education.course });
        else if (project && project.workMinutes >= project.requiredMinutes && day(w)-project.startedDay >= project.minDays && teamReady(w,project.requirements)) {
          const inspector = w.people.find(p=>p.employed && p.role === "inspector" && !project.contributors[p.id]);
          if (inspector) job(w,"research",{required:120,learnerId:inspector.id,validationProjectId:project.id});
        } else if (project && project.workMinutes < project.requiredMinutes && teamReady(w,project.requirements)) {
          const researchSubject=researchDisciplines(project).find(id=>(project.disciplineMinutes?.[id] || 0)<project.requiredMinutes/researchDisciplines(project).length);
          if(researchSubject) job(w,"research",{required:120,knowledgeProjectId:project.id,researchSubject});
        }
      }
      for (const o of activeOrders(w)) {
        if (o.status === "accepted") {
          const units = Object.values(w.units).filter(
            (u) => u.orderId === o.id,
          );
          if (units.length < o.quantity)
            for (
              let i = units.length;
              i < o.quantity &&
              Object.keys(w.units).length < w.catalog.rules.maxUnits;
              i++
            )
              addUnit(w, o);
          const ready = Object.values(w.units).filter(
            (u) => u.orderId === o.id && u.stage === "ready",
          );
          if (
            ready.length === o.quantity &&
            !Object.values(w.jobs).some(
              (j) => j.orderId === o.id && j.kind === "shipping",
            )
          )
            job(w, "shipping", { orderId: o.id, required: 10 });
        }
      }
    }
    function autoCraftNeededMaterials(w, needed) {
      const ap = ensureAssetPortfolio(w);
      if (ap.supplyChainStrategy === "asset_light") return;
      if (Object.keys(ap.ownedAssets || {}).length === 0) return;
      // Cascade Tier 1 -> Tier 2 -> Tier 3 in-house recipes when R&D is unlocked and inputs are available in opening stock
      for (const tierLevel of [1, 2, 3]) {
        for (const rec of Object.values(D.MATERIAL_RECIPES || {})) {
          if (rec.tier !== tierLevel) continue;
          if (!materialReady(w, rec.outputMaterialId || rec.id)) continue;
          const outMat = rec.outputMaterialId || rec.id;
          const short = (needed[outMat] || 0) - (w.inventory.materials[outMat] || 0);
          if (short <= 0) continue;
          const outPerBatch = rec.outputs?.[outMat] || 1;
          const desiredBatches = Math.min(4, Math.ceil(short / outPerBatch));
          const canRun = Object.entries(rec.inputs || {}).every(([inMat, inQty]) => {
            const availOpen = Math.min(
              w.inventory.opening[inMat] || 0,
              (w.inventory.materials[inMat] || 0) - (w.inventory.reserved[inMat] || 0) - (needed[inMat] || 0),
            );
            return availOpen >= inQty;
          });
          if (canRun) {
            craftMaterialRecipe(w, rec.id, desiredBatches, { silent: false });
          }
        }
      }
    }

    function planPurchases(w) {
      if (!w.policies.autoBuy) return;
      const buyer = w.people.find((p) => p.employed && p.atWork && ["admin", "logistics", "coordinator"].includes(p.role));
      if (!buyer) return;
      // Convert any available upstream materials into midstream materials before deciding what to buy externally
      runMidstreamRefining(w);
      const needed = Object.fromEntries(
        Object.keys(w.catalog.materials).map((k) => [k, 0]),
      );
      for (const u of Object.values(w.units))
        if (!u.materialConsumed)
          for (const [m, n] of Object.entries(
            w.catalog.products[u.productId].bom,
          ))
            needed[m] += n;
      for (const project of Object.values(w.knowledge?.projects || {})) if (project.status !== "qualified" && !project.prototypeConsumed && project.workMinutes >= project.requiredMinutes * 0.25) {
        const inputs = project.kind === "product" ? w.catalog.products[project.targetId]?.bom : D.MATERIAL_RECIPES[project.targetId]?.inputs;
        for (const [id,q] of Object.entries(inputs || {})) needed[id] += q;
      }
      const employed = w.people.filter((p) => p.employed),
        reserveCash = employed.reduce((s, p) => s + p.pay.dailyWage, 0) * 2;
      if (
        w.finance.debt === 0 &&
        w.finance.cash > reserveCash + w.catalog.rules.winCash + 2500000
      ) {
        for (const prodId of w.research.unlocked) {
          const prod = w.catalog.products[prodId];
          if (prod && prod.bom) {
            for (const m of Object.keys(prod.bom)) {
              if (needed[m] < 10) needed[m] = 10;
            }
          }
        }
      }
      for(const task of w.plant?.maintenance||[])if(task.type==="repair"&&!task.partsConsumed){const part=P.repairPart(task.machineId);needed[part]=(needed[part]||0)+1;}
      autoCraftNeededMaterials(w, needed);
      for (const [m, n] of Object.entries(needed)) {
        const incoming = Object.values(w.purchases)
            .filter((p) => p.materialId === m && p.status !== "received")
            .reduce((s, p) => s + p.quantity, 0),
          short = n - w.inventory.materials[m] - incoming;
        if (short > 0) {
          const unitCost = w.catalog.materials[m].unitCost,
            maxAffordable = Math.floor(
              Math.max(0, w.finance.cash - reserveCash) / unitCost,
            ),
            desired = Math.min(200, short + 4),
            count =
              maxAffordable >= desired
                ? desired
                : maxAffordable >= short
                  ? short
                  : maxAffordable;
          if (count > 0 && w.finance.cash - count * unitCost >= reserveCash)
            placePurchase(w, m, count, buyer);
        }
      }
    }
    function placePurchase(w, materialId, quantity, actor = null) {
      const quote=W.quote(w,materialId,quantity);
      if(!quote || w.finance.cash < quote.unitPrice*quantity) return null;
      const mat = w.catalog.materials[materialId],
        buyer = actor ||
          w.people.find(
            (p) => p.employed && ["admin", "logistics"].includes(p.role),
          ) || w.people.find((p) => p.employed),
        pid = id(w, "purchase"),
        supplier = w.externalWorld.corporations[quote.supplierId],
        geoMult = w.externalWorld?.geopolitics?.materialPriceMultipliers?.[materialId] || 1.0,
        spotUnitCost = w.externalWorld?.geopolitics?.materialSpotPrices?.[materialId] || Math.round(mat.unitCost * geoMult),
        effectiveUnitCost = quote.unitPrice,
        p = {
          id: pid,
          materialId,
          quantity,
          cost: quantity * effectiveUnitCost,
          spotUnitCost,
          worldLeadDays: quote.days,
          geopoliticalMultiplier: geoMult,
          status: "paperwork",
          orderedAt: now(w),
          dueAt: null,
          supplierId: supplier ? supplier.id : null,
          supplierNameTh: supplier ? supplier.nameTh : "ซัพพลายเออร์มาตรฐาน",
          buyerId: buyer ? buyer.id : null,
          buyerName: buyer ? buyer.name : "ฝ่ายจัดซื้อ",
        };
      if(!W.sellToPlayer(w,quote.supplierId,materialId,quantity,p.cost)) return null;
      post(w, "materials", -p.cost, p.id);
      w.purchases[p.id] = p;
      job(w, "purchase", { purchaseId: p.id, required: 15 });
      if (buyer) {
        ensurePersonExtensions(w, buyer);
        buyer.career.poIssued = (buyer.career.poIssued || 0) + 1;
      }
      if (w.logistics && Array.isArray(w.logistics.inboundShipments)) {
        const plateNum = 1000 + (seedHash(p.id) % 8999);
        w.logistics.inboundShipments.unshift({
          id: "inb-" + p.id,
          purchaseId: p.id,
          supplierId: p.supplierId,
          supplierNameTh: p.supplierNameTh,
          originTh: supplier ? supplier.originTh : "นิคมอุตสาหกรรม",
          materialId,
          materialNameTh: mat.nameTh,
          quantity,
          cost: p.cost,
          buyerId: p.buyerId,
          buyerName: p.buyerName,
          truckPlate: `70-${plateNum} ชลบุรี`,
          status: "paperwork",
          orderedAt: now(w),
          dueAt: null,
          receivedAt: null,
        });
        if (w.logistics.inboundShipments.length > 50) w.logistics.inboundShipments.pop();
      }
      if (supplier && w.externalWorld?.suppliers?.[supplier.id]) {
        w.externalWorld.suppliers[supplier.id].totalOrders =
          (w.externalWorld.suppliers[supplier.id].totalOrders || 0) + 1;
        w.externalWorld.suppliers[supplier.id].totalSpendSatang =
          (w.externalWorld.suppliers[supplier.id].totalSpendSatang || 0) + p.cost;
      }
      event(
        w,
        "purchaseOrdered",
        `ฝ่ายจัดซื้อ (${buyer ? buyer.name : "ระบบ"}) สั่งซื้อวัตถุดิบ ${mat.nameTh} ${quantity} ชิ้น จาก ${p.supplierNameTh}`,
        {
          purchaseId: p.id,
          materialId,
          quantity,
          supplierId: p.supplierId,
          personId: buyer ? buyer.id : null,
        },
      );
      return p;
    }
    function accept(w, offer, actor = null, decision = null) {
      if (!productReadiness(w, offer.productId).ready) return null;
      if(offer.commercialContractId){const contract=ensureCommerce(w).contracts[offer.commercialContractId];if(!contract||contract.status!=="awarded"||contract.ordered+offer.quantity>contract.quantity||(contract.currentOrderId&&w.orders[contract.currentOrderId]?.status!=="paid"))return null;}
      const total = offer.quantity * offer.unitPrice,
        deposit = Math.floor(total * offer.depositPct);
      if (
        !int(total, 1) ||
        !int(deposit) ||
        !int(w.finance.cash + deposit) ||
        !int(w.finance.totals.sales + deposit)
      )
        return null;
      const oid = id(w, "order"),
        prod = w.catalog.products[offer.productId],
        salesActor =
          actor ||
          w.people.find((p) => p.employed && p.role === "sales") ||
          w.people.find((p) => p.employed),
        client = (offer.clientId && w.externalWorld?.clients?.[offer.clientId]) ||
          pickClientForProduct(w, offer.productId, oid),
        negReport = salesActor ? evaluateSalesNegotiation(w, salesActor, prod, client) : null,
        o = {
          id: oid,
          offerId: offer.id,
          productId: offer.productId,
          quantity: offer.quantity,
          unitPrice: offer.unitPrice,
          deadline: offer.deadline,
          paymentMinutes: offer.paymentMinutes,
          deposit,
          total,
          status: "accepted",
          acceptedAt: now(w),
          shipped: 0,
          materialConsumed: false,
          completedAt: null,
          clientId: client ? client.id : offer.clientId || null,
          customerName: offer.customerName || (client ? client.nameTh : "ลูกค้า B2B"),
          salesPersonId: salesActor ? salesActor.id : null,
          salesPersonName: salesActor ? salesActor.name : null,
          negotiationReport: negReport,
          commercialContractId: offer.commercialContractId || null,
        };
      offer.status = "accepted";
      w.orders[oid] = o;
      if(o.commercialContractId && !W.payCommercial(w,o.commercialContractId,deposit)){delete w.orders[oid];offer.status="open";return null;}
      if (deposit) post(w, "sales", deposit, oid + ":deposit");
      if(o.commercialContractId){const contract=ensureCommerce(w).contracts[o.commercialContractId];contract.paidSatang+=deposit;contract.ordered+=o.quantity;contract.currentOrderId=o.id;}
      const stocked=Object.values(w.units).filter(u=>u.productId===o.productId&&u.stage==="ready"&&w.orders[u.orderId]?.stockBatch).slice(0,o.quantity);
      for(const u of stocked){u.stockLotId=u.orderId;u.orderId=o.id;}
      for (let i = stocked.length; i < o.quantity; i++) addUnit(w, o);
      if (salesActor) {
        ensurePersonExtensions(w, salesActor);
        salesActor.career.dealsNegotiated = (salesActor.career.dealsNegotiated || 0) + 1;
      }
      if (w.logistics && Array.isArray(w.logistics.b2bDeals)) {
        w.logistics.b2bDeals.unshift({
          orderId: oid,
          offerId: offer.id,
          clientId: o.clientId,
          clientNameTh: o.customerName,
          productId: o.productId,
          productNameTh: prod ? prod.nameTh : o.productId,
          quantity: o.quantity,
          unitPrice: o.unitPrice,
          total: o.total,
          deposit: o.deposit,
          salesPersonId: o.salesPersonId,
          salesPersonName: o.salesPersonName,
          pitchScore: negReport ? negReport.pitchScore : 65,
          styleTh: negReport ? negReport.styleTh : "เจรจามาตรฐาน",
          acceptedAt: now(w),
          deadline: o.deadline,
          status: "production",
        });
        if (w.logistics.b2bDeals.length > 50) w.logistics.b2bDeals.pop();
      }
      if (o.clientId && w.externalWorld?.clients?.[o.clientId]) {
        const cl = w.externalWorld.clients[o.clientId];
        cl.totalContracts = (cl.totalContracts || 0) + 1;
        cl.lastDealDay = day(w);
      }
      event(
        w,
        "orderAccepted",
        `ฝ่ายขาย (${salesActor ? salesActor.name : "บริษัท"}) ปิดดีล B2B กับ ${o.customerName}: ${prod ? prod.nameTh : offer.productId} ${o.quantity} ชิ้น สำเร็จ!`,
        {
          orderId: oid,
          productId: o.productId,
          quantity: o.quantity,
          clientId: o.clientId,
          personId: salesActor ? salesActor.id : null,
          decision,
        },
      );
      return o;
    }
    function autoAccept(w) {
      if (!w.policies.autoAccept) return;
      const employedCount = w.people.filter((p) => p.employed).length;
      const maxConcurrentAccepted = employedCount > 15 ? Math.min(25, Math.ceil(employedCount / 4)) : 2;
      const maxQueueUnits = employedCount > 15 ? Math.min(w.catalog.rules.maxUnits - 20, employedCount * 4) : 24;
      const open = activeOrders(w).filter((o) => o.status === "accepted"),
        queued = Object.keys(w.units).length;
      if (open.length >= maxConcurrentAccepted || queued >= maxQueueUnits) return;
      const salesPerson =
        w.people.find((p) => p.employed && p.atWork && p.role === "sales") ||
        w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!salesPerson) return;
      const roleSkill = w.catalog.roles[salesPerson.role].skill;
      const proficiency = salesPerson.skills[roleSkill]?.level || 0;
      const personality = salesPerson.profile.personality;
      const evaluated = Object.values(w.offers).filter((o) =>
        o.status === "open" && o.deadline > now(w) + 1440 &&
        productReadiness(w, o.productId).ready &&
        queued + o.quantity <= w.catalog.rules.maxUnits,
      ).map((offer) => {
        const product = w.catalog.products[offer.productId];
        const materialCost = Object.entries(product.bom).reduce((sum, [id, qty]) =>
          sum + w.catalog.materials[id].unitCost * qty, 0);
        const profitPerUnit = offer.unitPrice - materialCost;
        const margin = profitPerUnit / Math.max(1, offer.unitPrice);
        const timeDays = (offer.deadline - now(w)) / 1440;
        const pressure = (queued + offer.quantity) / Math.max(1, w.catalog.rules.maxUnits);
        const score = margin * 60 + proficiency * 0.15 +
          (salesPerson.profile.values.achievement ?? 50) * 0.08 +
          (personality.riskTaking ?? 50) * 0.04 -
          (personality.prudence ?? 50) * pressure * 0.06 - Math.max(0, 3 - timeDays) * 4;
        return { offer, profitPerUnit, score };
      }).filter((item) => item.profitPerUnit > 0 && item.score >= 10)
        .sort((a, b) => b.score - a.score || a.offer.id.localeCompare(b.offer.id));
      const choice = evaluated[0];
      if (choice) accept(w, choice.offer, salesPerson, {
        score: Math.round(choice.score * 10) / 10,
        profitPerUnit: choice.profitPerUnit,
        reason: "เปรียบเทียบราคากับต้นทุนวัตถุดิบ กำหนดส่ง งานค้าง และลักษณะผู้ตัดสินใจ",
      });
    }
    function evaluateAutonomousHiring(w, options = {}) {
      const employed = w.people.filter((p) => p.employed);
      const ceo = employed.find((p) => p.role === "coordinator");
      if (!ceo) return false;
      if (employed.length >= w.catalog.rules.maxPeople) return false;
      const burn =
        w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employed.reduce((n, p) => n + p.pay.dailyWage, 0) +
        w.policies.wellbeingDaily * employed.length;
      const runwayDays = burn > 0 ? w.finance.cash / burn : 999;
      const openJobs = Object.values(w.jobs).filter((j) => !j.assignee);
      const overloaded =
        options.force ||
        (openJobs.length >= Math.max(4, employed.length) &&
          runwayDays > 30 &&
          w.finance.cash >= w.catalog.rules.hireFee + burn * 30);
      if (!overloaded || w.finance.cash < w.catalog.rules.hireFee) return false;
      const list = candidates(w);
      if (!list.length) return false;
      const preferredRole =
        options.role ||
        (openJobs.some((j) => j.kind === "assembly" || j.kind === "rework")
          ? "assembler"
          : openJobs.some((j) => j.kind === "qa")
            ? "inspector"
            : openJobs.some((j) => j.kind === "packing" || j.kind === "shipping")
              ? "logistics"
              : "assembler");
      const role = own(w.catalog.roles, preferredRole);
      const skillSpec = role && own(w.catalog.skills, role.skill);
      if (!skillSpec) return false;
      const scored = list.map((candidate) => {
        const skill = H.createSkill(candidate.profile, skillSpec);
        const ability = H.evaluateAbility(candidate.profile, H.createState(candidate.profile), skill, skillSpec);
        const score = ability.aptitudeFit * 0.55 + skill.level * 0.25 +
          candidate.profile.personality.conscientiousness * 0.08 +
          candidate.profile.personality.integrity * 0.06 -
          (ceo.profile.personality.prudence ?? 50) * candidate.dailyWage / 1000000;
        return { candidate, score };
      }).sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
      const pick = scored[0];
      const res = command(w, {
        type: "hire",
        candidateId: pick.candidate.id,
        role: preferredRole,
      });
      if (res.ok) event(w, "recruitmentDecision", `${ceo.name} เลือก ${pick.candidate.name} เข้าร่วมทีม`, {
        personId: ceo.id, candidateId: res.personId, role: preferredRole,
        score: Math.round(pick.score * 10) / 10,
        reason: "ประเมินความถนัด ทักษะ นิสัย และค่าจ้างตามตำแหน่งที่ขาด",
      });
      return res.ok ? true : false;
    }

    function constructPlot(w, plotId, actor = null, reason = "ขยายกำลังการผลิตและโครงสร้างพื้นฐานนิคม") {
      if (!w.facilities) w.facilities = freshFacilities();
      if (!Array.isArray(w.facilities.constructedPlots)) w.facilities.constructedPlots = [];
      if (!Array.isArray(w.facilities.plotHistory)) w.facilities.plotHistory = [];
      const plotSpec = D.EXPANSION_PLOTS?.[plotId];
      if (!plotSpec) return { ok: false, code: "unknownPlot", message: "ไม่พบผังอาคารที่ระบุ" };
      if (w.facilities.constructedPlots.includes(plotId))
        return { ok: false, code: "alreadyBuilt", message: "ก่อสร้างอาคารนี้ไปแล้ว" };
      if (w.finance.cash < plotSpec.cost)
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอก่อสร้างอาคารใหม่" };

      let nextLayout = clone(w.layout);
      for (const st of plotSpec.stations || []) {
        if (!nextLayout.stations[st.id]) {
          try {
            nextLayout = L.addStation(nextLayout, {
              id: st.id,
              kind: st.kind,
              cell: { x: st.x, y: st.y },
              access: { x: st.ax, y: st.ay },
              capacity: st.capacity || 8,
              visualKey: "station." + st.kind,
            });
          } catch (_) {
            // If cell is occupied, skip adding station so layout remains valid
          }
        }
      }
      if (L.validateLayout(nextLayout).length > 0) {
        return { ok: false, code: "layoutConflict", message: "พื้นที่ก่อสร้างทับซ้อนกับเส้นทางเดิน" };
      }

      post(w, "expansion", -plotSpec.cost, "plot:" + plotId);
      w.layout = nextLayout;
      for (const p of w.people) {
        if (p.stationId && w.layout.stations[p.stationId]) {
          p.path = L.findPath(w.layout, p.position, w.layout.stations[p.stationId].access) || [];
        }
      }
      w.facilities.constructedPlots.push(plotId);
      const ceo = actor || w.people.find((p) => p.employed && p.role === "coordinator") || w.people[0];
      w.facilities.plotHistory.unshift({
        day: day(w),
        plotId,
        nameTh: plotSpec.nameTh,
        cost: plotSpec.cost,
        actorId: ceo ? ceo.id : null,
        actorName: ceo ? ceo.name : "ผู้บริหาร",
        reason,
      });
      if (w.logistics && w.logistics.productionLines) {
        if (plotId === "prodLineB" && w.logistics.productionLines.lineB) {
          w.logistics.productionLines.lineB.active = true;
        }
        if (plotId === "prodLineC" && w.logistics.productionLines.lineC) {
          w.logistics.productionLines.lineC.active = true;
        }
        if (plotId === "prodLineD" && w.logistics.productionLines.lineD) {
          w.logistics.productionLines.lineD.active = true;
        }
        if (plotId === "dispatchHub") {
          w.logistics.fleetCount = (w.logistics.fleetCount || 2) + 2;
        }
      }
      if (["prodLineB", "prodLineC", "prodLineD"].includes(plotId) && D.resolveOrgAssignment) {
        for (const emp of w.people) {
          if (emp.employed && emp.role === "assembler" && emp.career) {
            const orgUnit = D.resolveOrgAssignment(emp.role, emp.career.level || 1, emp.id, w.facilities.constructedPlots);
            emp.career.orgUnit = orgUnit;
            emp.career.sectionTh = orgUnit.sectionNameTh;
            emp.career.groupTh = orgUnit.groupNameTh;
            emp.career.orgPathTh = orgUnit.orgPathTh;
          }
        }
      }
      if (plotId === "solarPlant") {
        w.reputation = clamp(w.reputation + 2, 0, 100);
      }
      if (plotId === "waterPlant") {
        w.reputation = clamp(w.reputation + 3, 0, 100);
      }
      if (plotId === "qaLab" || plotId === "expoHall") {
        w.reputation = clamp(w.reputation + 2, 0, 100);
      }
      event(
        w,
        "facilityConstructed",
        `🏗️ ${ceo ? ceo.name : "ผู้บริหาร"} อนุมัติก่อสร้าง "${plotSpec.nameTh}" เสร็จสมบูรณ์! (${plotSpec.benefitTh})`,
        {
          plotId,
          nameTh: plotSpec.nameTh,
          cost: plotSpec.cost,
          personId: ceo ? ceo.id : null,
          reason,
        },
      );
      return { ok: true, plotId };
    }

    function evaluatePlotConstruction(w) {
      if (!w.policies.autoAccept || day(w) < 6) return false;
      if (!w.facilities) w.facilities = freshFacilities();
      if (!Array.isArray(w.facilities.constructedPlots)) w.facilities.constructedPlots = [];
      const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!ceo) return false;
      const employees = w.people.filter((p) => p.employed);
      if (employees.length < 9) return false;

      const dailyBurn =
        w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const reserve = dailyBurn * 22 + 4000000;

      const plots = Object.values(D.EXPANSION_PLOTS || {}).filter(
        (pl) =>
          !w.facilities.constructedPlots.includes(pl.id) &&
          day(w) >= (pl.minDay || 5) &&
          employees.length >= (pl.minStaff || 8) &&
          w.finance.cash >= reserve + pl.cost,
      );
      if (!plots.length) return false;

      const activeJobs = Object.values(w.jobs || {});
      const asmJobs = activeJobs.filter((j) => j.kind === "assembly" || j.kind === "rework").length;
      const qaJobs = activeJobs.filter((j) => j.kind === "qa").length;
      const shipJobs = activeJobs.filter((j) => j.kind === "packing" || j.kind === "shipping").length;
      const machCond = w.facilities?.machineCondition ?? 100;

      const scoredPlots = plots
        .map((pl) => {
          let score = 20;
          if ((pl.id === "prodLineB" || pl.id === "prodLineC" || pl.id === "cleanroomPlant") && asmJobs >= 2) score += asmJobs * 12;
          if (pl.id === "qaLab" && qaJobs >= 1) score += qaJobs * 15;
          if (pl.id === "maintWorkshop" && machCond < 85) score += (100 - machCond) * 1.5;
          if ((pl.id === "dispatchHub" || pl.id === "rawDepot") && shipJobs >= 1) score += shipJobs * 12;
          if (pl.id === "refineryMill" || pl.id === "bakeryPlant") score += 18;
          return { plot: pl, score };
        })
        .sort((a, b) => b.score - a.score);

      const chosen = scoredPlots[0].plot;
      const res = constructPlot(
        w,
        chosen.id,
        ceo,
        `ขยายโครงสร้างพื้นฐานนิคมตามคอขวดหน้างาน (${chosen.shortNameTh || chosen.nameTh}) รองรับทีมงาน ${employees.length} คน`,
      );
      return Boolean(res.ok);
    }

    function evaluateFacilityInvestment(w) {
      if (!w.policies.autoAccept || day(w) < 2) return;
      if (!w.facilities) w.facilities = freshFacilities();
      const f = w.facilities;
      if (day(w) - f.lastDecisionDay < 3 && f.lastDecisionDay > 0) return;
      const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!ceo) return;
      const employees = w.people.filter((p) => p.employed);
      const dailyBurn = w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const obligations = w.finance.payables.rent + w.finance.payables.interest +
        employees.reduce((sum, p) => sum + p.pay.dueBase + p.pay.dueOT, 0);
      const reserve = dailyBurn * 20 + obligations + Math.min(w.finance.debt, dailyBurn * 10);
      const jobs = Object.values(w.jobs);
      const needs = {
        factory: 12 + jobs.filter((j) => ["assembly", "rework", "qa"].includes(j.kind)).length * 3,
        warehouse: 9 + jobs.filter((j) => ["packing", "shipping"].includes(j.kind)).length * 3,
        hq: 0,
        rnd: 10 + jobs.filter((j) => j.kind === "research").length * 3,
        canteen: 8 + employees.reduce((n, p) => n + p.state.hunger, 0) / Math.max(1, employees.length) / 8,
        courtyard: 8 + employees.reduce((n, p) => n + p.state.stress, 0) / Math.max(1, employees.length) / 7,
        training: 10 + employees.length,
      };
      needs.hq = 8 + Object.values(w.offers).filter((o) => o.status === "open").length * 2;
      const personality = ceo.profile.personality;
      const ranked = Object.entries(FACILITY_RULES).filter(([key]) => (f.levels[key] || 1) < 3)
        .map(([key, spec]) => {
          const level = f.levels[key] || 1;
          const cost = spec.cost * level;
          const score = needs[key] + ceo.skills.leadership.level * 0.08 +
            (personality.ambition ?? 50) * 0.08 + (personality.riskTaking ?? 50) * 0.04 -
            (personality.prudence ?? 50) * 0.04 - level * 3 - cost / Math.max(w.finance.cash, 1) * 15;
          return { key, spec, level, cost, score };
        }).sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
      const choice = ranked[0];
      f.lastDecisionDay = day(w);
      if (!choice) return;
      const affordable = w.finance.arrearsSince === null && w.finance.cash >= reserve + choice.cost;
      f.lastDecision = {
        day: day(w), personId: ceo.id, facilityId: choice.key,
        decision: affordable && choice.score >= 12 ? "upgrade" : "wait",
        score: Math.round(choice.score * 10) / 10, cost: choice.cost, reserve,
        reason: affordable ? "ประเมินภาระงานและประโยชน์ของอาคาร" : "รักษาเงินสำรองและภาระค้างจ่าย",
      };
      if (f.lastDecision.decision !== "upgrade") return;
      post(w, "equipment", -choice.cost, "facility:" + choice.key);
      f.levels[choice.key] = choice.level + 1;
      event(w, "facilityUpgraded", `${ceo.name} ตัดสินใจพัฒนา${choice.spec.nameTh}เป็นระดับ ${choice.level + 1}`, {
        personId: ceo.id, facilityId: choice.key, level: choice.level + 1, cost: choice.cost,
        reason: f.lastDecision.reason,
      });
    }
    function evaluateDebtRepayment(w) {
      if (!w.policies.autoAccept || w.finance.debt <= 0 || w.finance.arrearsSince !== null) return;
      const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!ceo) return;
      const employees = w.people.filter((p) => p.employed);
      const dailyBurn = w.catalog.rules.rentDaily + Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const due = w.finance.payables.rent + w.finance.payables.interest +
        employees.reduce((sum, p) => sum + p.pay.dueBase + p.pay.dueOT, 0);
      const reserveDays = 15 + Math.floor((ceo.profile.personality.prudence ?? 50) / 10);
      const reserve = dailyBurn * reserveDays + due;
      const amount = Math.min(w.finance.debt, Math.max(0, w.finance.cash - reserve));
      if (!Number.isSafeInteger(amount) || amount <= 0) return;
      post(w, "debtRepayment", -amount, "bank");
      event(w, "ceoDebtRepayment", `${ceo.name} ชำระเงินต้นโดยกันเงินสำรองไว้ก่อน`, {
        personId: ceo.id, amount, reserve, reserveDays,
      });
    }

    function evaluateMachineMaintenance(w) {
      if (!w.facilities) w.facilities = freshFacilities();
      if ((w.facilities.machineCondition ?? 100) >= 82) return;
      const tech = w.people.find(
        (p) => p.employed && p.atWork && ["engineer", "assembler", "inspector"].includes(p.role),
      );
      if (!tech) return;
      const hasMaintShop = Boolean(w.facilities.constructedPlots?.includes("maintWorkshop"));
      const before = w.facilities.machineCondition ?? 100;
      const recovery = hasMaintShop ? 25 : 18;
      const after = clamp(Math.round((before + recovery) * 10) / 10, 50, 100);
      w.facilities.machineCondition = after;
      w.facilities.maintenanceCount = (w.facilities.maintenanceCount || 0) + 1;
      ensurePersonExtensions(w, tech);
      tech.career.tasksCompleted = (tech.career.tasksCompleted || 0) + 1;
      event(
        w,
        "machineMaintained",
        `${tech.name} บำรุงรักษาและตั้งค่าเครื่องจักรโรงงาน สภาพพร้อมใช้งาน ${after}%`,
        {
          personId: tech.id,
          machineCondition: after,
        },
      );
    }

    function processDue(w) {
      for (const p of Object.values(w.purchases))
        if (p.status === "transit" && p.dueAt <= now(w)) {
          w.inventory.materials[p.materialId] += p.quantity;
          w.inventory.purchased[p.materialId] += p.quantity;
          p.status = "received";
          if (w.logistics && Array.isArray(w.logistics.inboundShipments)) {
            const ship = w.logistics.inboundShipments.find((s) => s.purchaseId === p.id);
            if (ship) {
              ship.status = "received";
              ship.receivedAt = now(w);
            }
            w.logistics.totalInboundReceived = (w.logistics.totalInboundReceived || 0) + 1;
          }
          if (p.supplierId && w.externalWorld?.suppliers?.[p.supplierId]) {
            const sup = w.externalWorld.suppliers[p.supplierId];
            sup.totalDeliveries = (sup.totalDeliveries || 0) + 1;
            sup.trustScore = clamp((sup.trustScore || 50) + 3, 0, 100);
            sup.tierTh =
              sup.trustScore >= 85
                ? "พันธมิตรยุทธศาสตร์ (Strategic)"
                : sup.trustScore >= 60
                  ? "คู่ค้าชั้นดี (VIP)"
                  : "คู่ค้าประจำ (Regular)";
          }
          const matName =
            w.catalog.materials[p.materialId]?.nameTh || p.materialId;
          event(
            w,
            "materialsReceived",
            `รถขนส่งซัพพลายเออร์ส่งวัตถุดิบ ${matName} ${p.quantity} ชิ้น เข้าคลังเรียบร้อย`,
            {
              purchaseId: p.id,
              quantity: p.quantity,
              supplierId: p.supplierId || null,
            },
          );
        }
      for (const i of Object.values(w.invoices))
        if (i.status === "unpaid" && i.dueAt <= now(w)) {
          const commercialId=w.orders[i.orderId]?.commercialContractId;
          if(commercialId && !W.payCommercial(w,commercialId,i.amount))continue;
          post(w, "sales", i.amount, i.id);
          if(commercialId)ensureCommerce(w).contracts[commercialId].paidSatang+=i.amount;
          i.status = "paid";
          i.paidAt = now(w);
          const order = w.orders[i.orderId];
          order.status = "paid";
          w.metrics.ordersPaid++;
          w.metrics.receipts++;
          if (w.logistics) {
            const outShip = (w.logistics.outboundShipments || []).find((s) => s.orderId === order.id);
            if (outShip) outShip.status = "paid";
            const deal = (w.logistics.b2bDeals || []).find((d) => d.orderId === order.id);
            if (deal) deal.status = "paid";
          }
          if (order.clientId && w.externalWorld?.clients?.[order.clientId]) {
            const cl = w.externalWorld.clients[order.clientId];
            cl.completedContracts = (cl.completedContracts || 0) + 1;
            cl.totalRevenueSatang = (cl.totalRevenueSatang || 0) + (order.finalTotal || order.total);
            cl.trustScore = clamp((cl.trustScore || 50) + 4, 0, 100);
          }
          event(
            w,
            "paymentReceived",
            `ลูกค้า (${order.customerName || "B2B"}) ชำระเงินค่าสินค้าเข้าบัญชีแล้ว (${(i.amount / 100).toLocaleString("th-TH")} บาท)`,
            {
              invoiceId: i.id,
              orderId: order.id,
              amount: i.amount,
            },
          );
        }
    }
    function finishJob(w, p, j, a) {
      ensurePersonExtensions(w, p);
      p.career.tasksCompleted = (p.career.tasksCompleted || 0) + 1;
      if (!w.facilities) w.facilities = freshFacilities();
      const u = w.units[j.unitId],
        product = u && w.catalog.products[u.productId];
      if (j.kind === "assembly") {
        const prodModeId = product?.productionMode || "smt_precision";
        const modeSpec = D.PRODUCTION_MODES?.[prodModeId];
        const regimeId = w.logistics?.productionRegime || "lean_balanced";
        const regimeSpec = D.PRODUCTION_REGIMES?.[regimeId];
        const modeQualBonus = (modeSpec?.qualityBonus || 0) + (regimeSpec?.qaBonus || 0);
        u.stage = "qa";
        u.quality = clamp(a.qualityChance + modeQualBonus, 0.1, 0.99);
        u.productionMode = prodModeId;
        const stId = p.stationId || "assembly1";
        const lineId = stId.startsWith("assembly_d")
          ? "lineD"
          : stId.startsWith("assembly_c")
            ? "lineC"
            : stId.startsWith("assembly_b")
              ? "lineB"
              : "lineA";
        u.lineId = lineId;
        if (w.logistics?.productionLines?.[lineId]) {
          w.logistics.productionLines[lineId].unitsCompleted =
            (w.logistics.productionLines[lineId].unitsCompleted || 0) + 1;
        }
        if (w.logistics) {
          if (!w.logistics.modeOutputCounts) w.logistics.modeOutputCounts = {};
          w.logistics.modeOutputCounts[prodModeId] = (w.logistics.modeOutputCounts[prodModeId] || 0) + 1;
        }
        const hasMaint = Boolean(w.facilities.constructedPlots?.includes("maintWorkshop"));
        const hasWater = Boolean(w.facilities.constructedPlots?.includes("waterPlant"));
        const assetBonuses = getActiveExternalAssetBonuses(w);
        const wearMult =
          (modeSpec?.wearRate || 1.0) *
          (regimeSpec?.wearMultiplier || 1.0) *
          (hasWater ? 0.88 : 1.0) *
          (1 - (assetBonuses.wearReductionPct || 0));
        const wear = Math.max(0.15, (hasMaint ? 0.75 : 1.2) * wearMult);
        w.facilities.machineCondition = clamp(
          Math.round(((w.facilities.machineCondition ?? 100) - wear) * 10) / 10,
          45,
          100,
        );
        job(w, "qa", {
          unitId: u.id,
          orderId: u.orderId,
          required: product.qaMinutes,
        });
      } else if (j.kind === "rework") {
        u.quality = Math.min(0.99, u.quality + 0.1 + a.qualityChance * 0.04);
        u.stage = "qa";
        job(w, "qa", {
          unitId: u.id,
          orderId: u.orderId,
          required: product.qaMinutes,
        });
      } else if (j.kind === "qa") {
        const hasQaLab = Boolean(w.facilities?.constructedPlots?.includes("qaLab"));
        const assetBonuses = getActiveExternalAssetBonuses(w);
        const isFood = product?.industry === "food";
        const dirId = w.externalWorld?.ceoDirective?.updatedDay > 1 ? w.externalWorld?.ceoDirective?.id : null;
        const zeroDefectBonus = dirId === "zero_defect" ? 0.05 : 0;
        const cond = w.facilities?.machineCondition ?? 100;
        const condQaDelta = cond < 72 ? -((72 - cond) * 0.002) : 0;
        const chance = clamp(
          u.quality * 0.85 +
            a.qualityChance * 0.15 +
            (hasQaLab ? 0.06 : 0) +
            (isFood ? assetBonuses.foodQaBonus : 0) +
            zeroDefectBonus +
            condQaDelta,
          0.1,
          0.99,
        );
        if (random(w) < chance) {
          u.stage = "packing";
          job(w, "packing", {
            unitId: u.id,
            orderId: u.orderId,
            required: product.packingMinutes,
          });
        } else if (u.attempts < 2) {
          u.attempts++;
          u.stage = "rework";
          job(w, "rework", {
            unitId: u.id,
            orderId: u.orderId,
            required: Math.ceil(product.assemblyMinutes * 0.4),
          });
          event(
            w,
            "reworkNeeded",
            `ชิ้นงานไม่ผ่าน QC โดย ${p.name} ส่งช่างซ่อมแซม`,
            {
              unitId: u.id,
              orderId: u.orderId,
            },
          );
        } else {
          w.production.scrapped[u.productId]++;
          w.metrics.unitsScrapped++;
          delete w.units[u.id];
          event(w, "unitScrapped", "ชิ้นงานเสียเกินซ่อม ตัดเป็นของเสีย", {
            orderId: u.orderId,
          });
        }
      } else if (j.kind === "packing") {
        u.stage = "ready";
        w.inventory.finished[u.productId]++;
        w.production.completed[u.productId]++;
        // Update Sector-Specific Process State (Models 1-4)
        const sp = ensureSectorProcesses(w);
        const ind = product?.industry || "electronics";
        if (ind === "food") {
          const coldChain = Boolean(w.externalWorld?.assetPortfolio?.ownedAssets?.cold_chain_hub?.active) || P.businessReady(w,"cold_storage_3pl");
          u.freshnessPct = 100;
          u.shelfLifeDays = coldChain ? 7 : 3;
          sp.foodBakery.coldChainActive = coldChain;
          sp.foodBakery.activeBatches[u.id] = {
            unitId: u.id,
            productId: u.productId,
            bakedAt: now(w),
            freshnessPct: 100,
            shelfLifeDays: u.shelfLifeDays,
            coldChainProtected: coldChain,
          };
        } else if (ind === "electronics") {
          sp.electronicsRma.burnInPassCount = (sp.electronicsRma.burnInPassCount || 0) + 1;
          u.firmwareRevision = sp.electronicsRma.firmwareRevision || "Rev.1.2";
        } else if (ind === "automotive" || ind === "energy" || ind === "aerospace") {
          const lineKey = u.lineId || "lineA";
          const lt = sp.automotiveOem.lineTooling[lineKey] || (sp.automotiveOem.lineTooling[lineKey] = {
            lineId: lineKey,
            currentToolingProductId: null,
            consecutiveSameModelCount: 0,
            changeoverCount: 0,
          });
          if (lt.currentToolingProductId !== u.productId) {
            lt.currentToolingProductId = u.productId;
            lt.consecutiveSameModelCount = 1;
            lt.changeoverCount = (lt.changeoverCount || 0) + 1;
            sp.automotiveOem.totalChangeovers = (sp.automotiveOem.totalChangeovers || 0) + 1;
          } else {
            lt.consecutiveSameModelCount = (lt.consecutiveSameModelCount || 0) + 1;
            sp.automotiveOem.rhythmBonusUnits = (sp.automotiveOem.rhythmBonusUnits || 0) + 1;
          }
          sp.automotiveOem.dynoCertifiedCount = (sp.automotiveOem.dynoCertifiedCount || 0) + 1;
        } else if (ind === "biomed") {
          sp.biomedSterile.clinicalCertificatesIssued = (sp.biomedSterile.clinicalCertificatesIssued || 0) + 1;
          sp.biomedSterile.quarantineLots[`lot-${u.id}`] = {
            id: `lot-${u.id}`,
            productId: u.productId,
            unitId: u.id,
            status: "certified",
            sterilityScore: sp.biomedSterile.sterilityIndex || 96,
            assayAt: now(w),
          };
        }
      } else if (j.kind === "shipping") {
        const o = w.orders[j.orderId],
          units = Object.values(w.units).filter(
            (u) => u.orderId === o.id && u.stage === "ready",
          );
        if (units.length !== o.quantity)
          throw Error("shipment requires complete ready order");
        const spShip = ensureSectorProcesses(w);
        for (const item of units) {
          if (spShip.foodBakery.activeBatches[item.id]) {
            const fbBatch = spShip.foodBakery.activeBatches[item.id];
            if ((fbBatch.freshnessPct ?? 100) >= 80) {
              spShip.foodBakery.freshShippedCount = (spShip.foodBakery.freshShippedCount || 0) + 1;
            } else {
              spShip.foodBakery.markdownShippedCount = (spShip.foodBakery.markdownShippedCount || 0) + 1;
            }
            delete spShip.foodBakery.activeBatches[item.id];
          }
          w.inventory.finished[item.productId]--;
          w.production.shipped[item.productId]++;
          delete w.units[item.id];
        }
        if (w.catalog.products[o.productId]?.industry === "electronics") {
          spShip.electronicsRma.warrantyLots.unshift({
            lotId: `wlot-${o.id}`,
            orderId: o.id,
            productId: o.productId,
            quantity: o.quantity,
            shippedDay: day(w),
            expiresDay: day(w) + 14,
            firmwareRev: spShip.electronicsRma.firmwareRevision || "Rev.1.2",
          });
          if (spShip.electronicsRma.warrantyLots.length > 25) spShip.electronicsRma.warrantyLots.pop();
        }
        o.shipped = o.quantity;
        if(o.commercialContractId){ensureCommerce(w).contracts[o.commercialContractId].delivered+=o.quantity;W.recordProductDelivery(w,o.commercialContractId,o.productId,o.quantity);}
        o.completedAt = now(w);
        o.status = "invoicing";
        const late = Math.max(0, now(w) - o.deadline);
        o.finalTotal = Math.max(
          o.deposit,
          Math.round(o.total * (1 - Math.min(0.2, (late / 1440) * 0.04))),
        );
        w.reputation = clamp(w.reputation + (late ? -0.5 : 2), 0, 100);
        if (w.logistics && Array.isArray(w.logistics.outboundShipments)) {
          const plateNum = 2000 + (seedHash(o.id) % 7999);
          w.logistics.outboundShipments.unshift({
            id: "out-" + o.id,
            orderId: o.id,
            clientId: o.clientId || "siam_tech",
            clientNameTh: o.customerName || "ลูกค้า B2B",
            productId: o.productId,
            productNameTh: w.catalog.products[o.productId]?.nameTh || o.productId,
            quantity: o.quantity,
            totalAmount: o.finalTotal,
            dispatcherId: p.id,
            dispatcherName: p.name,
            truckPlate: `71-${plateNum} กทม.`,
            dispatchedAt: now(w),
            lateMinutes: late,
            onTime: late === 0,
            status: "invoicing",
          });
          if (w.logistics.outboundShipments.length > 50) w.logistics.outboundShipments.pop();
          w.logistics.totalOutboundDispatched = (w.logistics.totalOutboundDispatched || 0) + 1;
          const deal = (w.logistics.b2bDeals || []).find((d) => d.orderId === o.id);
          if (deal) deal.status = "shipped";
        }
        job(w, "invoice", { orderId: o.id, required: 10 });
        event(
          w,
          "orderShipped",
          `ฝ่ายคลังและโลจิสติกส์ (${p.name}) ปล่อยรถขนส่งส่งมอบสินค้า ${o.quantity} ชิ้น ให้แก่ ${o.customerName || "ลูกค้า"} แล้ว`,
          {
            orderId: o.id,
            quantity: o.quantity,
            lateMinutes: late,
            personId: p.id,
          },
        );
      } else if (j.kind === "invoice") {
        const o = w.orders[j.orderId],
          i = {
            id: id(w, "invoice"),
            orderId: o.id,
            amount: o.finalTotal - o.deposit,
            issuedAt: now(w),
            dueAt: now(w) + o.paymentMinutes,
            status: "unpaid",
            paidAt: null,
          };
        w.invoices[i.id] = i;
        o.status = "awaitingPayment";
      } else if (j.kind === "purchase") {
        const purchase = w.purchases[j.purchaseId];
        const assetBonuses = getActiveExternalAssetBonuses(w);
        const supCorp = purchase.supplierId && w.externalWorld?.corporations?.[purchase.supplierId];
        const partnerLeadDisc = supCorp && supCorp.relationshipMode === "partner" ? 0.15 : 0;
        const totalLeadReduction = Math.min(0.55, (assetBonuses.leadTimeReductionPct || 0) + partnerLeadDisc);
        const rawLead = Math.max(w.catalog.materials[purchase.materialId].leadMinutes,(purchase.worldLeadDays || 0)*1440) * (w.externalWorld.geopolitics.globalLeadTimeMultiplier || 1);
        const reducedLead = Math.max(60, Math.round((rawLead * (1 - totalLeadReduction)) / 5) * 5);
        purchase.status = "transit";
        purchase.dueAt = now(w) + reducedLead;
        if (w.logistics && Array.isArray(w.logistics.inboundShipments)) {
          const ship = w.logistics.inboundShipments.find((s) => s.purchaseId === purchase.id);
          if (ship) {
            ship.status = "transit";
            ship.dueAt = purchase.dueAt;
          }
        }
      } else if (j.kind === "research") {
        knowledgeWork(w, p, j);
      } else if (j.kind === "sales") {
        const products = w.research.unlocked,
          productId = products[Math.floor(random(w) * products.length)];
        makeOffer(
          w,
          productId,
          8 + Math.floor(random(w) * 7),
          6 + Math.floor(random(w) * 3),
          a.qualityChance,
          p,
        );
      } else if (own(w.catalog.taskKinds, j.kind)) {
        const spec = w.catalog.taskKinds[j.kind];
        if (spec.researchPoints > 0) {
          w.research.points += spec.researchPoints;
        }
        if (spec.reputationDelta)
          w.reputation = clamp(w.reputation + spec.reputationDelta, 0, 100);
        if (spec.revenue > 0) post(w, "sales", spec.revenue, j.id + ":service");
        event(w, "customTaskCompleted", "ดำเนินงานเฉพาะทางสำเร็จ", {
          jobId: j.id,
          kind: j.kind,
          personId: p.id,
        });
      }
      if(j.kind !== "research" && p.education) {
        const appliedSubject=(["assembly","rework"].includes(j.kind) && j.unitId ? productSubject(w,w.units[j.unitId].productId) : ({assembly:"embedded_iot",rework:"embedded_iot",qa:"quality",packing:"warehouse_operations",shipping:"logistics",purchase:"procurement",invoice:"accounting",sales:"sales_negotiation"})[j.kind]);
        if(appliedSubject && subjectLevel(p,appliedSubject)>0) {
          learnSubject(p,appliedSubject,Math.min(j.elapsedMinutes || 0,480));
        }
      }
      w.history.tasks.push({
        id: j.id,
        kind: j.kind,
        personId: p.id,
        at: now(w),
        orderId: j.orderId || null,
      });
      if (w.history.tasks.length > 160) w.history.tasks.shift();
      delete w.jobs[j.id];
      p.taskId = null;
      p.stationId = null;
      p.activity = "idle";
    }
    function jobImpacts(w, j, primary, urgent) {
      const custom = own(w.catalog.taskKinds, j.kind);
      if (custom && custom.impacts)
        return {
          ...custom.impacts,
          change: primary ? -0.15 : 0.45,
        };
      const u = clamp(urgent / 4, 0, 1);
      const map = {
        sales: {
          income: 0.55,
          social: 0.65,
          achievement: 0.55,
          recognition: 0.6,
          voice: 0.45,
          risk: 0.25,
        },
        purchase: {
          security: 0.6,
          fairness: 0.4,
          integrity: 0.65,
          duty: 0.7,
          routine: 0.5,
        },
        invoice: {
          income: 0.45,
          security: 0.65,
          integrity: 0.7,
          duty: 0.75,
          routine: 0.45,
        },
        research: {
          learning: 0.95,
          novelty: 0.85,
          autonomy: 0.65,
          meaning: 0.6,
          recognition: 0.45,
        },
        assembly: {
          craft: 0.75,
          achievement: 0.55,
          meaning: 0.45,
          duty: Math.max(0.35, u),
          routine: 0.35,
          help: 0.3,
        },
        rework: {
          craft: 0.8,
          integrity: 0.75,
          duty: Math.max(0.55, u),
          learning: 0.35,
          help: 0.45,
          risk: u,
        },
        qa: {
          integrity: 0.85,
          security: 0.6,
          fairness: 0.5,
          meaning: 0.5,
          craft: 0.55,
          duty: Math.max(0.45, u),
        },
        packing: {
          belonging: 0.45,
          help: 0.55,
          duty: Math.max(0.5, u),
          routine: 0.45,
          achievement: 0.4,
        },
        shipping: {
          achievement: 0.7,
          recognition: 0.5,
          duty: Math.max(0.65, u),
          help: 0.6,
          security: 0.45,
        },
      };
      return {
        ...(map[j.kind] || { achievement: 0.5, duty: 0.5 }),
        change: primary ? -0.15 : 0.45,
      };
    }

    function selectJob(w, p, stationLoadMap = null) {
      const choices = [];
      const largeScale = w.people.length > 15;
      const seenBatchKeys = largeScale ? new Set() : null;

      for (const j of Object.values(w.jobs)) {
        if (j.assignee) continue;
        if (j.kind === "research") {
          const kp = w.knowledge?.projects[j.knowledgeProjectId];
          if (j.learnerId ? j.learnerId !== p.id : !kp || subjectLevel(p,j.researchSubject || kp.subject) < (kp.requirements[j.researchSubject || kp.subject] || kp.requiredLevel)) continue;
        }
        if (seenBatchKeys) {
          const batchKey = j.kind + ":" + (j.orderId || "") + ":" + j.createdAt;
          if (seenBatchKeys.has(batchKey)) continue;
        }
        if (j.unitId) {
          const u = w.units[j.unitId];
          if (!u) continue;
          const bom = w.catalog.products[u.productId].bom;
          if (
            !u.materialConsumed &&
            !u.reserved &&
            Object.entries(bom).some(
              ([m, n]) =>
                w.inventory.materials[m] - w.inventory.reserved[m] < n,
            )
          )
            continue;
        }
        if (["assembly","rework"].includes(j.kind) && j.unitId) {
          const subject=productSubject(w,w.units[j.unitId].productId);
          if(subjectLevel(p,subject)<20) continue;
        }
        if(j.kind==="packing"){
          const reservedSpace=Object.values(w.jobs).filter(x=>x.kind==="packing"&&x.assignee&&w.units[x.unitId]).reduce((a,x)=>a+P.storageSize(w.catalog.products[w.units[x.unitId].productId]),0);
          if(warehouseUsed(w)+reservedSpace+P.storageSize(w.catalog.products[w.units[j.unitId].productId])>warehouseCapacity(w))continue;
        }
        if(!P.available(w,j))continue;
        const equipmentStation=P.stationFor(w,j);
        const available = stations(w, j.stationKind, stationLoadMap).filter(st=>!equipmentStation||st.id===equipmentStation);
        if (!available.length) continue;
        if (seenBatchKeys) {
          seenBatchKeys.add(j.kind + ":" + (j.orderId || "") + ":" + j.createdAt);
        }
        const demand = own(w.catalog.taskKinds, j.kind) || {},
          a = ability(w, p, j.skill, {...demand,subject:jobSubject(w,j)}),
          primary = w.catalog.roles[p.role].skill === j.skill,
          per = p.profile.personality,
          v = p.profile.values,
          o = w.orders[j.orderId],
          urgent = o ? clamp((now(w) + 3 * 1440 - o.deadline) / 1440, 0, 4) : 0;
        let score =
          a.speedMultiplier * 22 +
          (primary ? 26 : 0) +
          Math.min(12, (now(w) - j.createdAt) / 120) +
          urgent * 8;
        if (j.kind === "research")
          score +=
            per.openness * 0.1 +
            v.learning * 0.06 +
            (w.policies.workPriority === "research" ? 35 : 0) -
            (activeOrders(w).length ? 12 : 0);
        if (j.orderId)
          score +=
            (w.policies.workPriority === "delivery" ? 24 : 0) +
            per.conscientiousness * 0.08;
        if (["purchase", "invoice", "shipping"].includes(j.kind)) score += 20;
        const motives = H.scoreOptions(p.profile, p.state, [
          {
            id: j.id,
            effort: j.kind === "rework" ? 0.45 : 0.35,
            delay: Math.min(1, (now(w) - j.createdAt) / 1440),
            skillFit: clamp((a.aptitudeFit - 50) / 50, -1, 1),
            impacts: jobImpacts(w, j, primary, urgent),
          },
        ])[0];
        score += motives.score * 0.65;
        const station = available.sort(
          (a, b) =>
            Math.abs(a.access.x - p.position.x) +
            Math.abs(a.access.y - p.position.y) -
            (Math.abs(b.access.x - p.position.x) +
              Math.abs(b.access.y - p.position.y)),
        )[0];
        choices.push({
          j,
          station,
          score,
          motives: motives.contributions,
          roleMatch: primary,
        });
      }
      choices.sort((a, b) => b.score - a.score || a.j.id.localeCompare(b.j.id));
      for (const c of choices) {
        const u = w.units[c.j.unitId];
        if (u && !reserve(w, u)) continue;
        c.j.assignee = p.id;
        p.taskId = c.j.id;
        p.decision = {
          at: now(w),
          taskId: c.j.id,
          score: c.score,
          roleMatch: c.roleMatch,
          motives: c.motives,
        };
        if (destination(w, p, c.station, "working", "chosen:" + c.j.kind)) {
          if (stationLoadMap) {
            stationLoadMap.set(c.station.id, (stationLoadMap.get(c.station.id) || 0) + 1);
          }
          return true;
        }
        release(w, p, stationLoadMap);
      }
      return false;
    }
    function updateSocial(w, p, tickCtx = null) {
      if (
        !["socialising", "resting", "eating"].includes(p.activity) ||
        !p.stationId ||
        p.path.length
      )
        return;
      let interactions = 0;
      const maxInteractions = w.people.length > 30 ? 2 : 999;
      const pool = tickCtx && tickCtx.stationOccupants
        ? (tickCtx.stationOccupants.get(p.stationId) || [])
        : w.people;
      for (const other of pool) {
        if (interactions >= maxInteractions) break;
        if (
          other.id === p.id ||
          !other.employed ||
          other.stationId !== p.stationId ||
          other.path.length
        )
          continue;
        const pair =
          p.id < other.id ? p.id + "|" + other.id : other.id + "|" + p.id;
        if ((w.socialAt[pair] || -100) < now(w) - 30) {
          w.socialAt[pair] = now(w);
          interactions++;
          const existing = p.relationships[other.id]?.trust || 0,
            inter = H.evaluateInteraction(
              p.profile,
              p.state,
              other.profile,
              other.state,
              { mode: "social", existingTrust: existing },
            );
          for (const [a, b] of [
            [p, other],
            [other, p],
          ]) {
            const rel =
              a.relationships[b.id] ||
              (a.relationships[b.id] = { trust: 0, familiarity: 0 });
            rel.familiarity = Math.min(
              100,
              +(rel.familiarity + inter.familiarityDelta).toFixed(2),
            );
            rel.trust = clamp(
              +(rel.trust + inter.trustDelta).toFixed(2),
              -100,
              100,
            );
            a.state.morale = clamp(a.state.morale + inter.moraleDelta, 0, 100);
          }
        }
      }
    }
    function pickColleagueToHelp(w, p, tickCtx = null) {
      const zone = L.zoneAt(w.layout, p.position);
      let candidates;
      if (tickCtx && tickCtx.workingByZone) {
        const zList = tickCtx.workingByZone.get(zone) || [];
        candidates = [];
        for (let i = 0; i < zList.length && candidates.length < 6; i++) {
          const q = zList[i];
          if (q.employed && q.taskId && q.id !== p.id) candidates.push(q);
        }
      } else {
        candidates = w.people.filter(
          (q) =>
            q.employed &&
            q.taskId &&
            q.id !== p.id &&
            L.zoneAt(w.layout, q.position) === zone,
        );
      }
      if (!candidates.length) return null;
      return candidates
        .map((q) => {
          const currentHelpers = tickCtx && tickCtx.helpersCount
            ? (tickCtx.helpersCount.get(q.id) || 0)
            : w.people.filter(
                (h) =>
                  h.employed &&
                  h.id !== p.id &&
                  h.activity === "helping" &&
                  h.intent.reasons.includes(q.id),
              ).length,
            trust = p.relationships[q.id]?.trust || 0,
            inter = H.evaluateInteraction(
              p.profile,
              p.state,
              q.profile,
              q.state,
              { mode: "help", existingTrust: trust },
            ),
            task = w.jobs[q.taskId],
            urgent =
              task && task.orderId && w.orders[task.orderId]
                ? clamp(
                    (now(w) + 2 * 1440 - w.orders[task.orderId].deadline) /
                      1440,
                    0,
                    3,
                  )
                : 0;
          return {
            person: q,
            inter,
            score:
              inter.compatibility +
              trust * 0.3 +
              urgent * 12 -
              currentHelpers * 35,
          };
        })
        .sort(
          (a, b) => b.score - a.score || a.person.id.localeCompare(b.person.id),
        )[0];
    }
    function personStep(w, p, stationLoadMap = null, tickCtx = null) {
      if (!p.employed) return;
      const time = tod(w),
        active =
          (time >= 540 && time < 1080) ||
          (time >= 1080 &&
            time < 1080 + p.ot.maxMinutes &&
            p.ot.day === day(w));
      if (!active) {
        release(w, p, stationLoadMap);
        p.atWork = false;
        if(personalStudyTick(w,p)) {p.position={...w.layout.entrance};p.previousPosition={...p.position};return;}
        p.activity = time >= 1320 || time < 360 ? "sleeping" : "offDuty";
        p.position = { ...w.layout.entrance };
        p.previousPosition = { ...p.position };
        p.intent = { code: p.activity, reasons: [] };
        p.state = H.tickState(p.profile, p.state, {
          activity: p.activity === "sleeping" ? "sleep" : "offDuty",
          minutes: TICK,
        });
        return;
      }
      if (!p.atWork) {
        p.atWork = true;
        p.activity = "idle";
      }
      if(p.plantTaskAt===now(w)){p.state=H.tickState(p.profile,p.state,{activity:"work",minutes:TICK,workload:.7});p.experience.workMinutes+=TICK;p.dayStats.workMinutes+=TICK;return;}
      if (p.path.length && !p.taskId && p.intent.code === "selfStudy" &&
          Object.values(w.jobs).some((j) => !j.assignee && j.skill === w.catalog.roles[p.role].skill)) {
        p.path = [];
        p.stationId = null;
      }
      if (p.path.length) {
        move(p);
        p.activity = "walking";
        p.state = H.tickState(p.profile, p.state, {
          activity: "walk",
          minutes: TICK,
        });
        return;
      }
      if (p.breakUntil > now(w)) {
        p.activity =
          p.breakKind === "meal"
            ? "eating"
            : p.breakKind === "social"
              ? "socialising"
              : "resting";
        p.state = H.tickState(p.profile, p.state, {
          activity:
            p.breakKind === "meal"
              ? "meal"
              : p.breakKind === "social"
                ? "social"
                : "rest",
          minutes: TICK,
        });
        if (p.activity === "eating" && facilityLevel(w, "canteen") > 1)
          p.state.hunger = clamp(p.state.hunger - (facilityLevel(w, "canteen") - 1) * 0.4, 0, 100);
        if (p.activity === "resting" && facilityLevel(w, "courtyard") > 1) {
          p.state.stress = clamp(p.state.stress - (facilityLevel(w, "courtyard") - 1) * 0.3, 0, 100);
          p.state.energy = clamp(p.state.energy + (facilityLevel(w, "courtyard") - 1) * 0.2, 0, 100);
        }
        updateSocial(w, p, tickCtx);
        return;
      }
      p.breakKind = null;
      if (time >= 720 && time < 780) {
        const lunchChoices = H.scoreOptions(p.profile, p.state, [
          {
            id: "meal",
            effort: 0,
            impacts: {
              hunger: 1,
              energy: 0.4,
              stress: 0.3,
              workLifeBalance: 0.3,
            },
          },
          {
            id: "social",
            effort: 0.05,
            impacts: { social: 0.9, belonging: 0.7, stress: 0.4, energy: 0.25 },
          },
        ]);
        const chosen = p.state.hunger > 25 ? "meal" : lunchChoices[0].id;
        const ranked =
          lunchChoices.find((c) => c.id === chosen) || lunchChoices[0];
        pauseFor(w, p, chosen, 20, "lunchBreak", {
          at: now(w),
          taskId: "break:" + chosen,
          score: ranked.score,
          roleMatch: false,
          motives: ranked.contributions,
        }, stationLoadMap);
        return;
      }
      if (
        p.state.health < 35 ||
        p.state.energy < 24 ||
        p.state.stress > 82 ||
        p.state.burnout > 85
      ) {
        const rec = H.scoreOptions(p.profile, p.state, [
          {
            id: "rest",
            effort: 0,
            impacts: {
              energy: 1,
              stress: 0.9,
              health: 0.8,
              burnout: 0.8,
              workLifeBalance: 0.6,
            },
          },
        ])[0];
        pauseFor(w, p, "rest", 30, "needsRecovery", {
          at: now(w),
          taskId: "break:rest",
          score: rec.score,
          roleMatch: false,
          motives: rec.contributions,
        }, stationLoadMap);
        return;
      }
      if (p.state.hunger > 72) {
        const mealChoice = H.scoreOptions(p.profile, p.state, [
          {
            id: "meal",
            effort: 0,
            impacts: { hunger: 1, energy: 0.45, focus: 0.35, stress: 0.3 },
          },
        ])[0];
        pauseFor(w, p, "meal", 20, "hungry", {
          at: now(w),
          taskId: "break:meal",
          score: mealChoice.score,
          roleMatch: false,
          motives: mealChoice.contributions,
        }, stationLoadMap);
        return;
      }
      if (p.state.socialNeed > 75 && p.profile.personality.sociability > 60) {
        const socChoice = H.scoreOptions(p.profile, p.state, [
          {
            id: "social",
            effort: 0.05,
            impacts: { social: 1, belonging: 0.75, stress: 0.45, energy: 0.25 },
          },
        ])[0];
        pauseFor(w, p, "social", 15, "needsConnection", {
          at: now(w),
          taskId: "break:social",
          score: socChoice.score,
          roleMatch: false,
          motives: socChoice.contributions,
        }, stationLoadMap);
        return;
      }
      let j = w.jobs[p.taskId];
      if (!j) {
        p.taskId = null;
        if (!selectJob(w, p, stationLoadMap)) {
          const helpPick = pickColleagueToHelp(w, p, tickCtx);
          if (
            helpPick &&
            (p.profile.personality.agreeableness > 45 ||
              p.profile.values.belonging > 65)
          ) {
            if (p.stationId === "training") p.stationId = null;
            const target = helpPick.person,
              inter = helpPick.inter;
            ensurePersonExtensions(w, p);
            ensurePersonExtensions(w, target);
            p.activity = "helping";
            p.intent = { code: "helpColleague", reasons: [target.id] };
            p.experience.helpMinutes += TICK;
            p.career.menteesHelped = (p.career.menteesHelped || 0) + 1;
            target.career.mentorId = p.id;
            target.career.mentorName = p.name;
            p.skills.leadership = H.learn(
              p.profile,
              p.skills.leadership,
              w.catalog.skills.leadership,
              TICK,
            );
            for (const [a, b] of [
              [p, target],
              [target, p],
            ]) {
              const rel =
                a.relationships[b.id] ||
                (a.relationships[b.id] = { trust: 0, familiarity: 0 });
              rel.familiarity = Math.min(
                100,
                +(rel.familiarity + 0.2).toFixed(2),
              );
              rel.trust = clamp(
                +(rel.trust + inter.trustDelta * 0.2).toFixed(2),
                -100,
                100,
              );
            }
            p.state = H.tickState(p.profile, p.state, {
              activity: "help",
              minutes: TICK,
            });
            return;
          }
          const primarySkill = w.catalog.roles[p.role].skill;
          const waitOptions = H.scoreOptions(p.profile, p.state, [
            {
              id: "selfStudy",
              effort: 0.25,
              impacts: {
                learning: 0.85,
                achievement: 0.45,
                novelty: 0.4,
                autonomy: 0.5,
              },
            },
            {
              id: "wait",
              effort: 0,
              impacts: { energy: 0.25, workLifeBalance: 0.3, routine: 0.3 },
            },
          ]);
          p.activity = "blocked";
          if (
            waitOptions[0].id === "selfStudy" &&
            p.state.energy > 50 &&
            p.state.stress < 65 &&
            p.skills[primarySkill].level <
              H.skillCap(p.profile, w.catalog.skills[primarySkill])
          ) {
            const training = w.layout.stations.training;
            const trainingCount = tickCtx ? tickCtx.trainingCount : w.people.filter((other) => other.employed && other.stationId === "training").length;
            if (training && p.stationId !== training.id && trainingCount < training.capacity) {
              if (destination(w, p, training, "blocked", "selfStudy")) { if (tickCtx) tickCtx.trainingCount++; return; }
            }
            p.intent = { code: "selfStudy", reasons: [primarySkill] };
            p.decision = {
              at: now(w),
              taskId: "selfStudy:" + primarySkill,
              score: waitOptions[0].score,
              roleMatch: true,
              motives: waitOptions[0].contributions,
            };
            const learningAtTraining = training && p.stationId === training.id &&
              p.position.x === training.access.x && p.position.y === training.access.y;
            p.skills[primarySkill] = H.learn(
              p.profile,
              p.skills[primarySkill],
              w.catalog.skills[primarySkill],
              TICK * 0.35 * (learningAtTraining ? 1 + (facilityLevel(w, "training") - 1) * 0.15 : 1),
            );
            if (learningAtTraining) {
              if (!w.facilities) w.facilities = freshFacilities();
              w.facilities.trainingMinutes += TICK;
            }
            p.state = H.tickState(p.profile, p.state, {
              activity: "learn",
              minutes: TICK,
              workload: 0.45,
            });
            return;
          }
          if (p.stationId === "training") p.stationId = null;
          p.intent = {
            code: Object.keys(w.units).length
              ? "waitingForWorkOrMaterials"
              : "noProductionOrder",
            reasons: [],
          };
          p.state = H.tickState(p.profile, p.state, {
            activity: "idle",
            minutes: TICK,
          });
          return;
        }
        if (p.path.length) {
          p.state = H.tickState(p.profile, p.state, {
            activity: "walk",
            minutes: TICK,
          });
          return;
        }
        j = w.jobs[p.taskId];
      }
      const u = w.units[j.unitId];
      if(j.kind==="assembly"&&!P.available(w,j)){release(w,p,stationLoadMap);p.intent={code:"equipmentUnavailable",reasons:[u ? productionSteps(w.catalog.products[u.productId])[u.process?.index||0] : "เครื่องมือ"]};return;}
      if (u && !u.materialConsumed) consume(w, u);
      const demand = own(w.catalog.taskKinds, j.kind) || {},
        a = ability(w, p, j.skill, {...demand,subject:jobSubject(w,j)}),
        helpers = tickCtx && tickCtx.firstHelperByTarget
          ? (tickCtx.firstHelperByTarget.has(p.id) ? [tickCtx.firstHelperByTarget.get(p.id)] : [])
          : w.people.filter(
              (q) =>
                q.employed &&
                q.activity === "helping" &&
                q.intent.reasons.includes(p.id),
            );
      let help = 1;
      let mentorXpMult = 1;
      if (helpers.length) {
        const helper = helpers[0],
          inter = H.evaluateInteraction(
            helper.profile,
            helper.state,
            p.profile,
            p.state,
            {
              mode: "help",
              existingTrust: p.relationships[helper.id]?.trust || 0,
            },
          );
        const helperLv = helper.career?.level || 1;
        const helperStep = helperLv > 1 && D.getCareerStep ? D.getCareerStep(helper.role, helperLv) : null;
        const mentorPwr = helperStep ? (helperStep.mentorPower || 0) : 0;
        help = inter.collaborationMultiplier + mentorPwr * 0.35;
        mentorXpMult = 1 + mentorPwr * 0.45;
      }
      const constructed = w.facilities?.constructedPlots || [];
      let plotBonus = 0;
      if (j.kind === "purchase" && constructed.includes("rawDepot")) plotBonus += 0.2;
      if (["packing", "shipping"].includes(j.kind) && constructed.includes("dispatchHub")) plotBonus += 0.25;
      const activeDirId = w.externalWorld?.ceoDirective?.updatedDay > 1 ? w.externalWorld?.ceoDirective?.id : null;
      if (j.kind === "research") {
        if (constructed.includes("qaLab")) plotBonus += 0.2;
        if (activeDirId === "rnd_sprint") plotBonus += 0.25;
      }
      if (j.kind === "sales") {
        if (constructed.includes("expoHall")) plotBonus += 0.15;
        if (activeDirId === "sales_blitz") plotBonus += 0.2;
      }
      const assetBonuses = getActiveExternalAssetBonuses(w);
      if (j.kind === "packing") {
        if (assetBonuses.packingSpeedBonus > 0) plotBonus += assetBonuses.packingSpeedBonus;
        if (activeDirId === "scale_expansion") plotBonus += 0.12;
      }
      if (j.kind === "shipping" && assetBonuses.shippingSpeedBonus > 0) plotBonus += assetBonuses.shippingSpeedBonus;
      if (["assembly", "qa"].includes(j.kind)) {
        if (p.stationId && p.stationId.includes("_b") && constructed.includes("prodLineB")) plotBonus += 0.15;
        if (p.stationId && p.stationId.includes("_c") && constructed.includes("prodLineC")) plotBonus += 0.2;
        if (p.stationId && p.stationId.includes("_d") && constructed.includes("prodLineD")) plotBonus += 0.25;
        if (constructed.includes("bakeryPlant") && u && w.catalog.products[u.productId]?.industry === "food") plotBonus += 0.2;
        if (assetBonuses.productionSpeedBonus > 0) plotBonus += assetBonuses.productionSpeedBonus;
        if (activeDirId === "scale_expansion") plotBonus += 0.12;
        const regimeId = w.logistics?.productionRegime || "lean_balanced";
        const regimeSpec = D.PRODUCTION_REGIMES?.[regimeId];
        if (regimeSpec && regimeSpec.speedMultiplier) {
          plotBonus += (regimeSpec.speedMultiplier - 1.0);
        }
        if (constructed.length > 0 && u) {
          const prodModeId = w.catalog.products[u.productId]?.productionMode;
          const mSpec = D.PRODUCTION_MODES?.[prodModeId];
          if (mSpec && mSpec.speedModifier) {
            plotBonus += (mSpec.speedModifier - 1.0);
          }
        }
        const mCond = w.facilities?.machineCondition ?? 100;
        if (mCond < 75) {
          plotBonus -= (75 - mCond) * 0.005;
        }
      }
      j.elapsedMinutes = (j.elapsedMinutes || 0) + TICK;
      const proposedWork=TICK * a.speedMultiplier * help * (1 + (facilityLevel(w, facilityForJob(j.kind)) - 1) * 0.12 + plotBonus);
      const plantWork=j.kind==="assembly"?P.labor(w,j,p,proposedWork,TICK):{delta:proposedWork,release:false};
      j.progress=Math.min(j.required,j.progress+plantWork.delta);
      p.activity = "working";
      p.intent = { code: j.kind, reasons: [j.id] };
      const order = j.orderId ? w.orders[j.orderId] : null,
        urgentLoad = order && order.deadline < now(w) + 1440 ? 0.1 : 0,
        otLoad = time >= 1080 ? 0.12 : 0;
      p.state = H.tickState(p.profile, p.state, {
        activity: j.kind === "research" ? "learn" : "work",
        minutes: TICK,
        workload: Math.min(2, (demand.workload ?? 1) + urgentLoad + otLoad),
        domain: demand.domain || "balanced",
        hazard: demand.hazard || 0,
      });
      p.skills[j.skill] = H.learn(
        p.profile,
        p.skills[j.skill],
        w.catalog.skills[j.skill],
        TICK * mentorXpMult,
      );
      p.experience.workMinutes += TICK;
      p.dayStats.workMinutes += TICK;
      if (time >= 1080) p.dayStats.otMinutes += TICK;
      if(plantWork.release){release(w,p,stationLoadMap);return;}
      if (j.progress >= j.required) {
        if (stationLoadMap && p.stationId) {
          stationLoadMap.set(p.stationId, Math.max(0, (stationLoadMap.get(p.stationId) || 1) - 1));
        }
        finishJob(w, p, j, a);
      }
    }
    function pay(w, isScheduledPayday = false) {
      const people = w.people.filter((p) => p.pay.dueBase + p.pay.dueOT > 0),
        total = people.reduce((s, p) => s + p.pay.dueBase + p.pay.dueOT, 0),
        budget = Math.min(w.finance.cash, total);
      let left = budget;
      for (let index = 0; index < people.length; index++) {
        const p = people[index],
          due = p.pay.dueBase + p.pay.dueOT,
          wasOverdue = p.pay.overdueSince !== null,
          amount = Math.min(
            due,
            index === people.length - 1
              ? left
              : Math.floor((budget * due) / total),
          ),
          base = Math.min(p.pay.dueBase, amount),
          ot = amount - base;
        if (base) post(w, "wages", -base, p.id);
        if (ot) post(w, "overtime", -ot, p.id);
        p.pay.dueBase -= base;
        p.pay.dueOT -= ot;
        p.pay.wallet += amount;
        p.pay.totalPaid += amount;
        left -= amount;
        if (p.pay.dueBase + p.pay.dueOT === 0) p.pay.overdueSince = null;
        if (isScheduledPayday) {
          if (amount < due) p.state.morale = clamp(p.state.morale - 8, 0, 100);
          else p.state.morale = clamp(p.state.morale + 2, 0, 100);
        } else if (wasOverdue && p.pay.dueBase + p.pay.dueOT === 0) {
          p.state.morale = clamp(p.state.morale + 2, 0, 100);
        }
      }
      return budget;
    }
    function payBills(w) {
      for (const kind of ["rent", "interest"]) {
        const amount = Math.min(w.finance.cash, w.finance.payables[kind]);
        if (amount) {
          post(w, kind, -amount, "payable");
          w.finance.payables[kind] -= amount;
        }
      }
    }
    function refreshArrears(w, referenceDay) {
      const overdueWages = w.people
        .filter((p) => p.pay.overdueSince !== null)
        .reduce((n, p) => n + p.pay.dueBase + p.pay.dueOT, 0);
      const unpaid =
        w.finance.payables.rent + w.finance.payables.interest + overdueWages;
      if (unpaid > 0) {
        if (w.finance.arrearsSince === null && referenceDay !== undefined)
          w.finance.arrearsSince = referenceDay;
      } else {
        w.finance.arrearsSince = null;
      }
    }

    function getDepartmentHeadroom(w, roleId, targetLevel) {
      const staffInDept = w.people.filter((p) => p.employed && p.role === roleId);
      const currentAtLevel = staffInDept.filter((p) => (p.career?.level || 1) >= targetLevel).length;
      const deptSize = staffInDept.length;
      const totalStaff = w.people.filter((p) => p.employed).length;

      if (targetLevel === 2) {
        // Lv.2 (G2) Senior Specialist: Max 45% of department, minimum 1 if department size >= 2
        const maxQuota = Math.max(1, Math.floor(deptSize * 0.45));
        if (deptSize < 2) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "แผนกต้องมีพนักงานตั้งแต่ 2 คนขึ้นไปเพื่อรองรับตำแหน่งอาวุโส (Lv.2)" };
        }
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาตำแหน่งอาวุโสเต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาอาวุโส Lv.2 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 3) {
        // Lv.3 (G3) Group Leader / Line Leader (หัวหน้ากลุ่มในไลน์ผลิต): Base 1 slot per department, 2 if facLv >= 2 or deptSize >= 4, scales 1 per 5 staff
        const bldKey = facilityForJob(w.catalog.roles[roleId]?.skill || "assembly") || "factory";
        const facLv = facilityLevel(w, bldKey);
        const spanSlots = deptSize >= 10 ? Math.floor(deptSize / 5) : facLv >= 2 || deptSize >= 4 ? 2 : 1;
        const maxQuota = Math.max(1, spanSlots);
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาหัวหน้ากลุ่ม Lv.3 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา ต้องขยายอาคารหรือเพิ่มขนาดทีมเพื่อเปิดโควตาเพิ่ม)` };
        }
        const expansionNote = maxQuota > 1 ? " (เปิดโควตาเพิ่มจากการขยายอาคาร/ขนาดทีม)" : "";
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาตำแหน่งหัวหน้ากลุ่ม Lv.3 ว่าง${expansionNote}` };
      }

      if (targetLevel === 4) {
        // Lv.4 (G4) Section Supervisor / Shift Foreman (หัวหน้าหมวด/หัวหน้ากะ):
        // Base 1 slot initially; expands when totalStaff >= 10 & cash >= 15M, scaling 1 per 8 staff!
        const currentLv4Plus = totalStaff < 10
          ? w.people.filter((p) => p.employed && (p.career?.level || 1) >= 4).length
          : currentAtLevel;
        const companyExpanded = totalStaff >= 10 && w.finance.cash >= 15000000;
        const maxQuota = companyExpanded
          ? Math.max(2, Math.floor(deptSize / 7) + 1, Math.min(16, 1 + Math.floor(totalStaff / 12)))
          : 1;
        if (currentLv4Plus >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentLv4Plus, reason: `โควตาหัวหน้าหมวด/กะ Lv.4 เต็มแล้ว (${currentLv4Plus}/${maxQuota} อัตรา บริษัทต้องขยายตัวขนาดใหญ่ก่อน)` };
        }
        return { allowed: true, maxQuota, currentCount: currentLv4Plus, reason: "เปิดโควตาหัวหน้าหมวด/หัวหน้ากะ Lv.4 จากการเติบโตขององค์กร" };
      }

      if (targetLevel === 5) {
        // Lv.5 (G5) Assistant Department Manager (รองหัวหน้าแผนก): 1 per 10 staff in department (min deptSize 3 or totalStaff >= 10)
        if (deptSize < 3 && totalStaff < 10) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "ฝ่ายต้องมีบุคลากรอย่างน้อย 3 คนเพื่อเปิดตำแหน่งรองหัวหน้าแผนก (Lv.5)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 10) + (deptSize >= 6 ? 1 : 0));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตารองหัวหน้าแผนก Lv.5 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตารองหัวหน้าแผนก Lv.5 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 6) {
        // Lv.6 (G6) Department Manager (หัวหน้าแผนก/ผู้จัดการแผนก): 1 per 14 staff in department (min deptSize 4 or totalStaff >= 12)
        if (deptSize < 4 && totalStaff < 12) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "ต้องขยายขนาดแผนกอย่างน้อย 4 คนเพื่อแต่งตั้งหัวหน้าแผนก (Lv.6)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 14) + (deptSize >= 10 ? 1 : 0));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาหัวหน้าแผนก Lv.6 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาหัวหน้าแผนก Lv.6 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 7) {
        // Lv.7 (G7) Deputy Division Director / Deputy Plant Manager (รองหัวหน้าฝ่าย/รองผู้จัดการโรงงาน)
        if (totalStaff < 14) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "บริษัทต้องมีพนักงานรวม 14 คนขึ้นไปเพื่อเปิดตำแหน่งรองผู้อำนวยการฝ่าย (Lv.7)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 20));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตารองผู้อำนวยการฝ่าย Lv.7 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตารองผู้อำนวยการฝ่าย Lv.7 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 8) {
        // Lv.8 (G8) Division Director / Plant General Manager (หัวหน้าฝ่าย/ผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน)
        if (totalStaff < 18) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "บริษัทต้องมีพนักงานรวม 18 คนขึ้นไปเพื่อแต่งตั้งผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน (Lv.8)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 28));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน Lv.8 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน Lv.8 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 9) {
        // Lv.9 (G9) EVP / C-Suite Executive (CCO / CFO / CTO / COO)
        const currentEvps = w.people.filter((p) => p.employed && (p.career?.level || 1) >= 9 && p.role === roleId).length;
        if (totalStaff < 22 || w.finance.cash < 12000000) {
          return { allowed: false, maxQuota: 0, currentCount: currentEvps, reason: "บริษัทต้องมีพนักงาน 22+ คน และเงินทุนมั่นคงเพื่อแต่งตั้งผู้บริหารระดับ C-Suite (Lv.9)" };
        }
        const maxQuota = 1;
        if (currentEvps >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentEvps, reason: `โควตาผู้บริหาร C-Suite ประจำสายงานเต็มแล้ว (${currentEvps}/${maxQuota})` };
        }
        return { allowed: true, maxQuota, currentCount: currentEvps, reason: "เปิดโควตารองกรรมการผู้จัดการใหญ่ C-Suite (Lv.9)" };
      }

      if (targetLevel === 10) {
        // Lv.10 (G10) Chief Executive Officer / President: Strictly 1 supreme leader company-wide
        const currentCeoLv10 = w.people.filter((p) => p.employed && (p.career?.level || 1) >= 10).length;
        const maxQuota = 1;
        if (currentCeoLv10 >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentCeoLv10, reason: "ตำแหน่งประธานเจ้าหน้าที่บริหารสูงสุด (CEO Lv.10) มีได้เพียง 1 ตำแหน่งในองค์กร" };
        }
        return { allowed: true, maxQuota, currentCount: currentCeoLv10, reason: "เปิดโควตาประธานเจ้าหน้าที่บริหารสูงสุด (CEO Lv.10)" };
      }

      return { allowed: true, maxQuota: 99, currentCount: currentAtLevel, reason: "ระดับพื้นฐาน" };
    }

    function findSupervisorForRole(w, roleId, targetLevel = 3) {
      const employed = w.people.filter((p) => p.employed);
      const minSupLevel = Math.max(3, Number(targetLevel) || 3);
      // 1. Direct superior in the same department with level >= minSupLevel (closest rank first for chain of command)
      const deptSupervisors = employed
        .filter((p) => p.role === roleId && (p.career?.level || 1) >= minSupLevel)
        .sort((a, b) => (a.career?.level || 1) - (b.career?.level || 1) || a.id.localeCompare(b.id));
      if (deptSupervisors.length > 0) return deptSupervisors[0];
      // 2. Any senior manager in the same department at Lv.3+
      const anyDeptMgr = employed
        .filter((p) => p.role === roleId && (p.career?.level || 1) >= 3)
        .sort((a, b) => (b.career?.level || 1) - (a.career?.level || 1) || a.id.localeCompare(b.id));
      if (anyDeptMgr.length > 0) return anyDeptMgr[0];
      // 3. Escalates to CEO / Executive Coordinator
      const ceo = employed.find((p) => p.role === "coordinator");
      if (ceo) return ceo;
      return employed.find((p) => (p.career?.level || 1) >= 3) || employed[0] || null;
    }

    function evaluatePromotions(w, completedDay) {
      if (!w.policies.autoAccept || w.metrics.ordersPaid < 1) return;
      if (w.finance.cash < 3500000) return;
      if (!w.facilities) w.facilities = freshFacilities();

      const employedCount = w.people.filter((p) => p.employed).length;
      const maxPromotionsPerDay = employedCount >= 40 ? Math.min(5, Math.ceil(employedCount / 40)) : 1;
      let promotedToday = 0;
      const roles = Object.keys(w.catalog.roles);

      for (const roleId of roles) {
        if (promotedToday >= maxPromotionsPerDay) break;
        const staffInRole = w.people.filter((p) => p.employed && p.role === roleId);
        if (!staffInRole.length) continue;

        for (let targetLevel = 2; targetLevel <= 10; targetLevel++) {
          if (promotedToday >= maxPromotionsPerDay) break;

          const headroom = getDepartmentHeadroom(w, roleId, targetLevel);
          if (!headroom.allowed) continue;

          const evaluator = findSupervisorForRole(w, roleId, targetLevel);
          if (!evaluator) continue;

          const nextStep = D.getCareerStep ? D.getCareerStep(roleId, targetLevel) : null;
          if (!nextStep) continue;

          const candidates = [];
          for (const cand of staffInRole) {
            if ((cand.career?.level || 1) !== targetLevel - 1) continue;
            ensurePersonExtensions(w, cand);
            const primarySkill = w.catalog.roles[roleId]?.skill || "assembly";
            const skillLv = cand.skills[primarySkill]?.level || 0;
            const tenureDays = Math.max(1, completedDay - Math.floor((cand.hiredAt || 0) / 1440));
            const tasks = cand.career?.tasksCompleted || 0;

            if (
              tasks >= nextStep.minTasks &&
              skillLv >= nextStep.minSkill &&
              tenureDays >= nextStep.minTenureDays &&
              completedDay - (cand.career.lastPromotionDay || 0) >= 3
            ) {
              candidates.push({ person: cand, skillLv, tenureDays, tasks });
            }
          }

          if (candidates.length === 0) continue;

          const integrity = evaluator.profile.values.integrity ?? 50;
          const fairness = evaluator.profile.values.fairness ?? 50;
          const influence = evaluator.profile.values.influence ?? 50;
          const sociability = evaluator.profile.personality.sociability ?? 50;

          const meritWeight = clamp((integrity + fairness) / 135, 0.45, 0.88);
          const favoritismWeight = 1.0 - meritWeight;

          const scoredCandidates = candidates.map((item) => {
            const p = item.person;
            const skillScore = item.skillLv;
            const kpiScore = p.career?.kpiScore || 50;
            const taskScore = Math.min(100, item.tasks * 6);
            const meritScore = skillScore * 0.45 + kpiScore * 0.4 + taskScore * 0.15;

            const rel = evaluator.relationships[p.id] || { trust: 0, familiarity: 0 };
            const trustScore = clamp(rel.trust + 50, 0, 100);
            const famScore = clamp(rel.familiarity, 0, 100);
            const favoritismScore = trustScore * 0.65 + famScore * 0.35;

            const compositeScore = meritScore * meritWeight + favoritismScore * favoritismWeight;
            return {
              person: p,
              meritScore,
              favoritismScore,
              compositeScore,
              trust: rel.trust,
            };
          });

          scoredCandidates.sort(
            (a, b) => b.compositeScore - a.compositeScore || a.person.id.localeCompare(b.person.id),
          );

          const winner = scoredCandidates[0];
          const loser = scoredCandidates.length > 1 ? scoredCandidates[1] : null;

          const p = winner.person;
          const oldTitle = p.career.titleTh;
          const oldLevel = p.career.level;
          const newWage = p.pay.dailyWage + (nextStep.wageBonus || 3500);

          p.career.level = nextStep.level;
          p.career.gradeCode = nextStep.gradeCode || ("G" + nextStep.level);
          p.career.titleTh = nextStep.titleTh;
          p.career.badge = nextStep.badge;
          if (nextStep.division) p.career.division = nextStep.division;
          if (nextStep.departmentTh) p.career.departmentTh = nextStep.departmentTh;
          if (nextStep.dutyTh) p.career.dutyTh = nextStep.dutyTh;
          if (D.resolveOrgAssignment) {
            const orgUnit = D.resolveOrgAssignment(p.role, nextStep.level, p.id, w.facilities?.constructedPlots || []);
            p.career.orgUnit = orgUnit;
            p.career.sectionTh = orgUnit.sectionNameTh;
            p.career.groupTh = orgUnit.groupNameTh;
            p.career.tierNameTh = orgUnit.tierNameTh;
            p.career.orgPathTh = orgUnit.orgPathTh;
          }
          p.career.promotions = (p.career.promotions || 0) + 1;
          p.career.lastPromotionDay = completedDay;
          p.pay.dailyWage = newWage;
          p.pay.dayWage = newWage;

          let rationale = "ประเมินจากผลงานดีเด่นและทักษะความชำนาญตามหลักธรรมาภิบาล";
          let favoritismWon = false;
          if (loser && winner.meritScore < loser.meritScore && winner.favoritismScore > loser.favoritismScore) {
            favoritismWon = true;
            rationale = `ได้รับความไว้วางใจและความใกล้ชิดกับหัวหน้างาน (${evaluator.name}) เป็นพิเศษ`;
          } else if (favoritismWeight >= 0.4) {
            rationale = "ประเมินจากผลงานร่วมกับความไว้วางใจในการทำงานร่วมกัน";
          }

          if (!Array.isArray(p.career.history)) p.career.history = [];
          p.career.history.unshift({
            day: completedDay,
            fromLevel: oldLevel,
            toLevel: nextStep.level,
            titleTh: nextStep.titleTh,
            newWage,
            evaluatorId: evaluator.id,
            evaluatorName: evaluator.name,
            meritScore: Math.round(winner.meritScore),
            favoritismScore: Math.round(winner.favoritismScore),
            rationale,
          });

          p.state.morale = clamp(p.state.morale + 9, 0, 100);
          p.state.fulfillment = clamp(p.state.fulfillment + 7, 0, 100);
          p.state.drive = clamp(p.state.drive + 6, 0, 100);
          p.state.stress = clamp(p.state.stress - 5, 0, 100);
          updateSatisfactionAndKpi(w, p, completedDay);

          if (loser) {
            const loserPerson = loser.person;
            if (favoritismWon) {
              loserPerson.state.morale = clamp(loserPerson.state.morale - 8, 0, 100);
              loserPerson.state.stress = clamp(loserPerson.state.stress + 7, 0, 100);
              loserPerson.state.burnout = clamp(loserPerson.state.burnout + 5, 0, 100);
              if (!loserPerson.relationships[evaluator.id]) loserPerson.relationships[evaluator.id] = { trust: 0, familiarity: 0 };
              loserPerson.relationships[evaluator.id].trust = clamp(
                loserPerson.relationships[evaluator.id].trust - 12,
                -100,
                100,
              );
              event(
                w,
                "promotionGrievance",
                `${loserPerson.name} รู้สึกไม่ได้รับความเป็นธรรมที่ ${p.name} ได้เลื่อนตำแหน่งเพราะสนิทกับหัวหน้า`,
                { personId: loserPerson.id, promotedId: p.id, evaluatorId: evaluator.id },
              );
            } else {
              loserPerson.state.morale = clamp(loserPerson.state.morale - 2, 0, 100);
              loserPerson.state.drive = clamp(loserPerson.state.drive + 4, 0, 100);
              if ((loserPerson.profile.personality.conscientiousness ?? 50) >= 55) {
                loserPerson.state.focus = clamp(loserPerson.state.focus + 3, 0, 100);
              }
            }
          }

          if (p.career.mentorId) {
            const mentorObj = w.people.find((m) => m.id === p.career.mentorId && m.employed);
            if (mentorObj) {
              mentorObj.state.fulfillment = clamp(mentorObj.state.fulfillment + 5, 0, 100);
              mentorObj.state.morale = clamp(mentorObj.state.morale + 4, 0, 100);
            }
          }
          w.facilities.totalPromotions = (w.facilities.totalPromotions || 0) + 1;
          promotedToday += 1;

          event(
            w,
            "employeePromoted",
            `หัวหน้างาน (${evaluator.name}) อนุมัติเลื่อนตำแหน่ง ${p.identity.displayName} ขึ้นเป็น "${nextStep.titleTh}" (${nextStep.badge}) [${rationale}] — โควตา: ${headroom.reason}`,
            {
              personId: p.id,
              evaluatorId: evaluator.id,
              evaluatorName: evaluator.name,
              oldLevel,
              newLevel: nextStep.level,
              newTitleTh: nextStep.titleTh,
              newWage,
              rationale,
              meritScore: Math.round(winner.meritScore),
              favoritismScore: Math.round(winner.favoritismScore),
            },
          );
        }
      }
    }

    function evaluateBonuses(w, completedDay) {
      if (!w.policies.autoAccept || w.metrics.ordersPaid < 1) return;
      if (w.finance.arrearsSince !== null) return;
      if (!w.facilities) w.facilities = freshFacilities();
      const employed = w.people.filter((p) => p.employed);
      if (!employed.length) return;
      const safetyReserve = w.catalog.rules.rentDaily * 15 + 3500000;
      if (w.finance.cash <= safetyReserve) return;

      const ranked = employed
        .slice()
        .map((p) => {
          updateSatisfactionAndKpi(w, p, completedDay);
          return p;
        })
        .sort(
          (a, b) =>
            (b.career.kpiScore || 0) - (a.career.kpiScore || 0) ||
            (b.career.tasksCompleted || 0) - (a.career.tasksCompleted || 0) ||
            a.id.localeCompare(b.id),
        );
      const mvp = ranked[0];
      if (!mvp || (mvp.career.tasksCompleted || 0) < 2) return;
      const bonus = 15000;
      if (w.finance.cash - bonus < safetyReserve) return;

      post(w, "wages", -bonus, mvp.id + ":bonus:" + completedDay);
      mvp.pay.totalEarned += bonus;
      mvp.pay.totalPaid += bonus;
      mvp.pay.wallet += bonus;
      mvp.career.bonusTotal = (mvp.career.bonusTotal || 0) + bonus;
      mvp.career.lastBonusAmount = bonus;
      mvp.career.lastBonusDay = completedDay;
      mvp.state.morale = clamp(mvp.state.morale + 7, 0, 100);
      mvp.state.fulfillment = clamp(mvp.state.fulfillment + 5, 0, 100);
      updateSatisfactionAndKpi(w, mvp, completedDay);

      w.facilities.employeeOfTheWeekId = mvp.id;
      w.facilities.employeeOfTheWeekName = mvp.name;
      w.facilities.totalBonusesPaid = (w.facilities.totalBonusesPaid || 0) + bonus;

      event(
        w,
        "bonusAwarded",
        `มอบรางวัลพนักงานดีเด่นและโบนัสผลงาน ฿${(bonus / 100).toLocaleString("th-TH")} ให้แก่ ${mvp.identity.displayName} (KPI ${mvp.career.kpiScore})`,
        {
          personId: mvp.id,
          bonusAmount: bonus,
          kpiScore: mvp.career.kpiScore,
        },
      );
    }

    function updateExternalWorld(w, completedDay) {
      if (!w.externalWorld) return;
      const ext = w.externalWorld;
      const defaults = D.EXTERNAL_WORLD_DEFAULTS;
      if (!defaults) return;

      // 1. Update Stock Market Indices deterministically
      if (ext.stockMarket && ext.stockMarket.indices) {
        for (const [idxId, idxObj] of Object.entries(ext.stockMarket.indices)) {
          const firms = Object.values(W.ensure(w).firms);
          const earnings = firms.reduce((a,f)=>a+f.profit,0);
          const capital = Math.max(1,firms.reduce((a,f)=>a+f.cash,0));
          const rawDeltaPct = clamp(earnings/capital*100, -2.5, 2.5);
          const nextVal = Math.max(100, Math.round(idxObj.value * (1 + rawDeltaPct / 100) * 10) / 10);
          idxObj.changePct = Math.round(((nextVal - idxObj.value) / idxObj.value) * 1000) / 10;
          idxObj.value = nextVal;
          if (!Array.isArray(idxObj.history)) idxObj.history = [];
          idxObj.history.push(nextVal);
          if (idxObj.history.length > 30) idxObj.history.shift();
        }
        // Calculate our Enterprise Valuation, Share Price, Credit Rating & IPO Readiness
        const employedCount = w.people.filter((p) => p.employed).length;
        const extAssetValue = Object.values(w.externalWorld?.assetPortfolio?.ownedAssets || {}).reduce(
          (sum, a) => sum + (D.EXTERNAL_ASSETS?.[a.id]?.cost || 0) * (1 + ((a.level || 1) - 1) * 0.5),
          0,
        );
        const plotAssetValue = extAssetValue + (w.facilities?.constructedPlots || []).reduce(
          (sum, pid) => sum + (D.EXPANSION_PLOTS?.[pid]?.cost || 0),
          0,
        );
        const levelAssetValue = Object.entries(w.facilities?.levels || {}).reduce(
          (sum, [fid, lv]) => sum + (lv - 1) * (FACILITY_RULES[fid]?.cost || 1000000),
          0,
        );
        const netCash = w.finance.cash - w.finance.debt;
        const salesRevenue = w.finance.totals.sales || 0;
        const valuation = Math.max(
          5000000,
          Math.round(
            netCash +
              plotAssetValue * 1.2 +
              levelAssetValue * 1.1 +
              salesRevenue * 1.5 +
              w.reputation * 250000 +
              employedCount * 350000,
          ),
        );
        ext.stockMarket.companyValuation = valuation;
        ext.stockMarket.sharePriceBaht = Math.round((valuation / 1000000) * 100) / 100;
        ext.stockMarket.creditRating =
          w.finance.debt === 0 && w.reputation >= 65
            ? "AAA"
            : w.finance.debt === 0 && w.reputation >= 52
              ? "AA"
              : w.finance.arrearsSince === null && w.finance.cash >= 8000000
                ? "A"
                : w.finance.arrearsSince === null
                  ? "BBB+"
                  : "BB";
        ext.stockMarket.ipoReadinessPct = clamp(
          Math.round(
            (w.finance.debt === 0 ? 30 : 10) +
              Math.min(30, (w.metrics.ordersPaid || 0) * 2) +
              Math.min(20, (w.reputation - 35) * 0.6) +
              Math.min(20, employedCount * 1.2),
          ),
          5,
          100,
        );
      }

      // 1A. Simulate Global Geopolitics, Foreign Governments, Wars, Treaties & World Chronicle (Era 2.0.0)
      simulateGlobalGeopoliticsDaily(w, completedDay);

      // 1B. Simulate Off-Site Living Corporate Ecosystem (Inter-company trade, price wars, B2B intermediate demands)
      simulateOffsiteEcosystemDaily(w, completedDay);

      // 2. Update Market Share vs Competitors
      const totalShipped = Object.values(w.production.shipped || {}).reduce((a, b) => a + b, 0);
      ext.ourMarketSharePct = Math.round(clamp(2.0 + totalShipped * 0.12 + (w.reputation - 45) * 0.08, 1.0, 45.0) * 10) / 10;

      // 3. Weekly Government Macro Policy & CEO Strategic Directive (Every 7 days)
      if (completedDay % 7 === 0) {
        const ceo = w.people.find((p) => p.employed && p.role === "coordinator");
        const directives = defaults.ceoDirectives || [];
        if (ceo && directives.length) {
          const per = ceo.profile.personality;
          const val = ceo.profile.values;
          let dirId = "sales_blitz";
          if (w.finance.cash < 5000000 || (per.prudence ?? 50) >= 72) dirId = "cash_shield";
          else if (w.people.filter((p) => p.employed).length >= 12 || (per.ambition ?? 50) >= 70) dirId = "scale_expansion";
          else if ((val.craftsmanship ?? 50) >= 68) dirId = "zero_defect";
          else if ((val.care ?? 50) >= 68) dirId = "wellness_care";
          else if ((per.openness ?? 50) >= 68) dirId = "rnd_sprint";
          const spec = directives.find((d) => d.id === dirId) || directives[0];
          ext.ceoDirective = {
            id: spec.id,
            nameTh: spec.nameTh,
            descTh: spec.descTh,
            updatedDay: completedDay,
            ceoName: ceo.name,
          };
        }
      }
    }

    function evaluatePersonalLifeMilestones(w, completedDay) {
      const milestoneCatalog = [
        { id: "emergencyFund", category: "comfort", cost: 40000, minWallet: 280000, icon: "🏦", titleTh: "เปิดบัญชีเงินออมฉุกเฉินและหลักประกันครอบครัวสำเร็จ" },
        { id: "familySupport", category: "comfort", cost: 60000, minWallet: 340000, icon: "💝", titleTh: "ส่งเงินก้อนดูแลครอบครัวที่บ้านเกิดสำเร็จ" },
        { id: "buyVehicle", category: "vehicle", cost: 90000, minWallet: 420000, icon: "🚗", titleTh: "ถอยรถส่วนตัวคันแรกสำหรับขับมาทำงานนิคมสำเร็จ" },
        { id: "buyHome", category: "home", cost: 150000, minWallet: 550000, icon: "🏠", titleTh: "วางเงินดาวน์บ้านในฝันจากน้ำพักน้ำแรงสำเร็จ" },
      ];
      let triggeredToday = 0;
      for (const p of w.people) {
        if (!p.employed || triggeredToday >= 2) continue;
        ensurePersonExtensions(w, p);
        if (!Array.isArray(p.career.lifeMilestones)) p.career.lifeMilestones = [];
        const achievedIds = new Set(p.career.lifeMilestones.map((m) => m.id));
        const nextMs = milestoneCatalog.find((m) => !achievedIds.has(m.id));
        if (!nextMs) continue;
        if (p.pay.wallet < nextMs.minWallet) continue;

        const purchaseEval = H.evaluateLifePurchase(
          p.profile,
          p.state,
          {
            id: nextMs.id,
            cost: nextMs.cost,
            impacts: {
              comfort: 0.75,
              security: 0.8,
              achievement: 0.8,
              recognition: 0.65,
            },
          },
          p.pay.wallet,
        );
        if (purchaseEval && purchaseEval.affordableNow) {
          // Transfer from wallet to outsideSpending so p.pay.wallet + p.pay.outsideSpending === p.pay.totalPaid remains 100% invariant
          p.pay.wallet -= nextMs.cost;
          p.pay.outsideSpending += nextMs.cost;
          const evRes = H.evaluateLifeEvent(p.profile, p.state, {
            type: nextMs.id === "familySupport" ? "familySupportSent" : "assetPurchased",
            category: nextMs.category,
            intensity: 1.0,
          });
          if (evRes && evRes.state) {
            p.state = evRes.state;
          } else {
            p.state = H.normaliseState({
              ...p.state,
              fulfillment: p.state.fulfillment + (purchaseEval.fulfillmentGain || 10),
              morale: p.state.morale + (purchaseEval.moraleGain || 8),
            });
          }

          const record = {
            day: completedDay,
            id: nextMs.id,
            icon: nextMs.icon,
            titleTh: nextMs.titleTh,
            cost: nextMs.cost,
          };
          p.career.lifeMilestones.unshift(record);
          triggeredToday++;
          event(
            w,
            "employeeLifeMilestone",
            `${nextMs.icon} ความสำเร็จชีวิตพนักงาน: ${p.identity?.displayName || p.name} (${p.career?.badge || "Lv.1"}) ${nextMs.titleTh}! (ใช้เงินออมส่วนตัว ฿${(nextMs.cost / 100).toLocaleString("th-TH")})`,
            {
              personId: p.id,
              milestoneId: nextMs.id,
              titleTh: nextMs.titleTh,
              cost: nextMs.cost,
            },
          );
        }
      }
    }

    function ensureCompanyProgression(w) {
      if (!w.companyProgression || typeof w.companyProgression !== "object") {
        w.companyProgression = freshCompanyProgression();
      }
      if (!w.companyProgression.achievedMilestones) w.companyProgression.achievedMilestones = {};
      if (!Array.isArray(w.companyProgression.growthJournal)) w.companyProgression.growthJournal = [];
      return w.companyProgression;
    }

    function ensureUtilities(w) {
      if (!w.utilities || typeof w.utilities !== "object") {
        w.utilities = freshUtilities();
      }
      if (!Array.isArray(w.utilities.history)) w.utilities.history = [];
      return w.utilities;
    }

    function ensureCulture(w) {
      if (!w.culture || typeof w.culture !== "object") {
        w.culture = freshCulture();
      }
      for (const k of ["recentGossip", "clubActivities", "townhallAwards", "alumniSpinoffs", "parkedVehicles"]) {
        if (!Array.isArray(w.culture[k])) w.culture[k] = [];
      }
      return w.culture;
    }

    function stepUtilitiesDaily(w, completedDay = day(w)) {
      const u = ensureUtilities(w);
      const tariffs = D.UTILITY_TARIFFS || {
        baseKwhPerBuildingLevel: 18,
        kwhPerActiveFactoryLine: 42,
        kwhPerCleanroomOrRefineryPlot: 55,
        kwhPerOtHour: 14,
        rateSatangPerKwh: 420,
        peakOtRateSatangPerKwh: 580,
        solarPlotOffsetKwhDaily: 145,
        offsiteSolarOffsetKwhPerLevelDaily: 210,
        waterM3PerEmployeeAtWork: 0.45,
        waterM3PerFactoryLine: 4.5,
        rateSatangPerWaterM3: 1850,
        waterPlantOffsetM3Daily: 18,
        billingIntervalDays: 7,
      };
      const levels = w.facilities?.levels || { hq: 1, rnd: 1, factory: 1, warehouse: 1, canteen: 1, courtyard: 1, training: 1 };
      const levelSum = Object.values(levels).reduce((acc, lv) => acc + (Number(lv) || 1), 0);
      const constructed = w.facilities?.constructedPlots || [];
      const activeLines = 1 + ["prodLineB", "prodLineC", "prodLineD"].filter((pid) => constructed.includes(pid)).length;
      const heavyPlots = ["cleanroomPlant", "refineryMill", "bakeryPlant"].filter((pid) => constructed.includes(pid)).length;
      const regimeId = w.logistics?.productionRegime || "lean_balanced";
      const regimePowerMult =
        regimeId === "eco_saver" || regimeId === "craft_precision"
          ? 0.76
          : regimeId === "overdrive_rush" || regimeId === "mass_throughput"
            ? 1.55
            : regimeId === "six_sigma_zero_defect"
              ? 1.15
              : 1.0;

      const employed = w.people.filter((p) => p.employed);
      const otMinutesTotal = employed.reduce((acc, p) => acc + (p.dayStats?.otMinutes || 0), 0);
      const otHours = otMinutesTotal / 60;

      const baseKwh = Math.round(
        (levelSum * tariffs.baseKwhPerBuildingLevel +
          activeLines * tariffs.kwhPerActiveFactoryLine +
          heavyPlots * tariffs.kwhPerCleanroomOrRefineryPlot) *
          regimePowerMult,
      );
      const otKwh = Math.round(otHours * tariffs.kwhPerOtHour);
      const plant=P.ensure(w),plantKwh=Math.max(0,plant.energyKwh-plant.billedEnergyKwh);
      const grossKwh = Math.max(20, baseKwh + otKwh + Math.round(plantKwh));
      plant.billedEnergyKwh=plant.energyKwh;

      const hasSolarPlot = constructed.includes("solarPlant");
      const offsiteSolar = w.externalWorld?.assetPortfolio?.ownedAssets?.offsite_solar_wind_farm;
      const solarOffsetKwh = Math.min(
        grossKwh,
        (hasSolarPlot ? tariffs.solarPlotOffsetKwhDaily : 0) +
          (offsiteSolar ? (offsiteSolar.level || 1) * tariffs.offsiteSolarOffsetKwhPerLevelDaily : 0),
      );
      const netKwh = Math.max(0, grossKwh - solarOffsetKwh);

      const grossWaterM3 = Math.max(
        2,
        Math.round((employed.length * tariffs.waterM3PerEmployeeAtWork + activeLines * tariffs.waterM3PerFactoryLine) * 10) / 10,
      );
      const hasWaterPlot = constructed.includes("waterPlant");
      const recycledWaterBonus = Math.min(6, w.agriculture?.waterSource?.wastewaterTreated || 0);
      const waterOffsetM3 = Math.min(
        grossWaterM3,
        Math.round(((hasWaterPlot ? tariffs.waterPlantOffsetM3Daily : 0) + recycledWaterBonus) * 10) / 10,
      );
      const netWaterM3 = Math.max(0, Math.round((grossWaterM3 - waterOffsetM3) * 10) / 10);

      const electricCostSatang = Math.round(
        Math.max(0, netKwh - otKwh) * tariffs.rateSatangPerKwh + Math.min(netKwh, otKwh) * tariffs.peakOtRateSatangPerKwh,
      );
      const waterCostSatang = Math.round(netWaterM3 * tariffs.rateSatangPerWaterM3);
      const savedSatangToday = Math.round(
        solarOffsetKwh * tariffs.rateSatangPerKwh + waterOffsetM3 * tariffs.rateSatangPerWaterM3,
      );

      u.dailyKwh = grossKwh;
      u.solarOffsetKwh = solarOffsetKwh;
      u.netKwh = netKwh;
      u.dailyWaterM3 = grossWaterM3;
      u.waterOffsetM3 = waterOffsetM3;
      u.netWaterM3 = netWaterM3;
      u.accruedElectricSatang = (u.accruedElectricSatang || 0) + electricCostSatang;
      u.accruedWaterSatang = (u.accruedWaterSatang || 0) + waterCostSatang;
      u.totalSavedBySolarWaterSatang = (u.totalSavedBySolarWaterSatang || 0) + savedSatangToday;
      u.lastSummaryTh = `ใช้ไฟ ${grossKwh} kWh (โซลาร์ช่วยลด ${solarOffsetKwh} kWh ➔ สุทธิ ${netKwh} kWh) • ใช้น้ำ ${grossWaterM3} ลบ.ม. (รีไซเคิลช่วยลด ${waterOffsetM3} ลบ.ม. ➔ สุทธิ ${netWaterM3} ลบ.ม.)`;

      if (
        completedDay > 0 &&
        completedDay % (tariffs.billingIntervalDays || 7) === 0 &&
        (w.facilities?.turnaroundAchieved || w.finance.cash > w.finance.debt + 14000000)
      ) {
        payUtilityBills(w, { day: completedDay, autoSafe: true });
      }
      return u;
    }

    function payUtilityBills(w, options = {}) {
      const u = ensureUtilities(w);
      const billDay = options.day || day(w);
      const totalDue = (u.accruedElectricSatang || 0) + (u.accruedWaterSatang || 0);
      if (totalDue <= 0) {
        u.brownoutActive = false;
        u.unpaidCycles = 0;
        return { ok: true, paidSatang: 0, brownoutActive: false };
      }
      if (w.finance.cash >= totalDue) {
        post(w, "equipment", -totalDue, `utility_bill:d${billDay}:${++w.sequence}`);
        u.totalPaidSatang = (u.totalPaidSatang || 0) + totalDue;
        u.accruedElectricSatang = 0;
        u.accruedWaterSatang = 0;
        u.unpaidCycles = 0;
        u.brownoutActive = false;
        u.lastBilledDay = billDay;
        u.history.unshift({
          day: billDay,
          paidSatang: totalDue,
          status: "paid",
          noteTh: `ชำระบิลค่าไฟฟ้าและน้ำประปาอุตสาหกรรมรอบสัปดาห์ ฿${(totalDue / 100).toLocaleString("th-TH")}`,
        });
        if (u.history.length > 24) u.history.pop();
        event(
          w,
          "utilityBillPaid",
          `⚡💧 ชำระบิลค่าไฟฟ้าและน้ำประปาโรงงานรอบสัปดาห์ ฿${(totalDue / 100).toLocaleString("th-TH")} เรียบร้อย (ประหยัดสะสมจากโซลาร์/น้ำรีไซเคิล ฿${((u.totalSavedBySolarWaterSatang || 0) / 100).toLocaleString("th-TH")})`,
          { day: billDay, paidSatang: totalDue },
        );
        return { ok: true, paidSatang: totalDue, brownoutActive: false };
      }
      if (options.autoSafe) {
        return { ok: false, code: "deferredForSurvivalBuffer", dueSatang: totalDue, brownoutActive: u.brownoutActive };
      }
      u.unpaidCycles = (u.unpaidCycles || 0) + 1;
      if (u.unpaidCycles >= 2) {
        u.brownoutActive = true;
        for (const emp of w.people) {
          if (!emp.employed) continue;
          emp.state.stress = clamp(emp.state.stress + 3, 0, 100);
        }
      }
      u.history.unshift({
        day: billDay,
        paidSatang: 0,
        dueSatang: totalDue,
        status: u.brownoutActive ? "brownout" : "overdue_warning",
        noteTh: u.brownoutActive
          ? `ค้างค่าไฟ-ค่าน้ำสะสม ${u.unpaidCycles} รอบ: การไฟฟ้าจำกัดกระแสไฟ (Brownout) เครื่องจักรช้าลง`
          : `แจ้งเตือนค้างชำระบิลค่าไฟ-ค่าน้ำรอบที่ ${u.unpaidCycles} (ยอดค้าง ฿${(totalDue / 100).toLocaleString("th-TH")})`,
      });
      if (u.history.length > 24) u.history.pop();
      event(
        w,
        "utilityBillOverdue",
        u.brownoutActive
          ? `⚠️ วิกฤตไฟตกโรงงาน (Brownout): ค้างค่าสาธารณูปโภคสะสม ${u.unpaidCycles} รอบ (฿${(totalDue / 100).toLocaleString("th-TH")}) กำลังไฟถูกจำกัดและพนักงานเริ่มร้อน/เครียด!`
          : `⚠️ ใบแจ้งเตือนค่าไฟฟ้า-น้ำประปาโรงงานค้างชำระ ฿${(totalDue / 100).toLocaleString("th-TH")} (กรุณาสำรองเงินสดก่อนถูกจำกัดกระแสไฟ)`,
        { day: billDay, dueSatang: totalDue, unpaidCycles: u.unpaidCycles, brownoutActive: u.brownoutActive },
      );
      return { ok: false, code: "insufficientCashForUtilities", dueSatang: totalDue, unpaidCycles: u.unpaidCycles, brownoutActive: u.brownoutActive };
    }

    function stepWorkplaceCultureDaily(w, completedDay = day(w)) {
      const c = ensureCulture(w);
      const employed = w.people.filter((p) => p.employed);
      if (!employed.length) return c;

      const parked = [];
      for (const p of employed) {
        ensurePersonExtensions(w, p);
        const hasCarMs = (p.career?.lifeMilestones || []).some((m) => m.id === "buyVehicle");
        const lv = p.career?.level || 1;
        const wallet = p.pay?.wallet || 0;
        if (hasCarMs || lv >= 6 || wallet >= 380000) {
          const vehType =
            lv >= 8 || p.role === "coordinator"
              ? { kind: "exec_sedan", icon: "🚙", labelTh: "รถซีดานผู้บริหาร", color: "#2c3e50" }
              : p.role === "logistics" || p.role === "assembler"
                ? { kind: "pickup", icon: "🛻", labelTh: "รถกระบะแต่งบรรทุก", color: "#d35400" }
                : { kind: "ecocar", icon: "🚗", labelTh: "รถยนต์อีโคคาร์ส่วนตัว", color: "#2980b9" };
          parked.push({
            personId: p.id,
            ownerName: p.identity?.displayName || p.name,
            roleNameTh: w.catalog.roles[p.role]?.nameTh || p.role,
            badge: p.career?.badge || "Lv.1",
            ...vehType,
          });
        } else if (lv >= 2 || wallet >= 120000) {
          parked.push({
            personId: p.id,
            ownerName: p.identity?.displayName || p.name,
            roleNameTh: w.catalog.roles[p.role]?.nameTh || p.role,
            badge: p.career?.badge || "Lv.1",
            kind: "motorbike",
            icon: "🏍️",
            labelTh: "รถมอเตอร์ไซค์ส่วนตัว",
            color: "#27ae60",
          });
        }
      }
      c.parkedVehicles = parked.slice(0, 24);

      if (employed.length >= 2) {
        const h = seedHash(`${w.seed}|gossip|${completedDay}`);
        const speaker = employed[h % employed.length];
        const listener = employed[(h + 1 + (completedDay % (employed.length - 1 || 1))) % employed.length];
        const topics = D.CULTURE_GOSSIP_TOPICS || [];
        let chosen = topics[0] || {
          id: "gossip_booming_orders",
          badgeTh: "💬 ข่าวดีข้างตู้กดน้ำ",
          topicTh: "ยอดส่งมอบและเงินสดบริษัทกำลังโตต่อเนื่อง ลุ้นโบนัสรอบหน้า!",
          moraleDelta: 3,
          stressDelta: -2,
        };
        const machCond = w.facilities?.machineCondition ?? 100;
        const hasGrievance = employed.some((p) => (p.career?.promotionGrievance || 0) > 0);
        const greenSaved = w.utilities?.totalSavedBySolarWaterSatang || 0;
        if (w.finance.cash < 2800000 || w.finance.arrearsSince !== null) {
          chosen = topics.find((t) => t.id === "gossip_tight_runway") || chosen;
        } else if (machCond < 62) {
          chosen = topics.find((t) => t.id === "gossip_aging_machines") || chosen;
        } else if (hasGrievance) {
          chosen = topics.find((t) => t.id === "gossip_favoritism_concern") || chosen;
        } else if (greenSaved > 50000 && completedDay % 3 === 0) {
          chosen = topics.find((t) => t.id === "gossip_utility_green_pride") || chosen;
        } else if ((w.facilities?.totalPromotions || 0) > 0 && completedDay % 2 === 1) {
          chosen = topics.find((t) => t.id === "gossip_merit_culture") || chosen;
        }

        c.recentGossip.unshift({
          day: completedDay,
          speakerId: speaker.id,
          speakerName: speaker.name,
          listenerId: listener.id,
          listenerName: listener.name,
          topicId: chosen.id,
          badgeTh: chosen.badgeTh,
          topicTh: chosen.topicTh,
          moraleDelta: chosen.moraleDelta,
        });
        if (c.recentGossip.length > 20) c.recentGossip.pop();
      }

      const clubs = D.AFTER_WORK_CLUBS || [];
      if (clubs.length > 0) {
        const club = clubs[completedDay % clubs.length];
        const participants = employed
          .filter((p) => (p.dayStats?.otMinutes || 0) === 0)
          .slice(0, 4);
        if (participants.length >= 2) {
          c.clubActivities.unshift({
            day: completedDay,
            clubId: club.id,
            icon: club.icon,
            nameTh: club.nameTh,
            participantNames: participants.map((p) => p.name),
            summaryTh: club.summaryTh,
          });
          if (c.clubActivities.length > 16) c.clubActivities.pop();
        }
      }

      const avgMorale = employed.reduce((s, p) => s + (p.state?.morale || 70), 0) / employed.length;
      const avgStress = employed.reduce((s, p) => s + (p.state?.stress || 20), 0) / employed.length;
      c.cohesionScore = clamp(Math.round(avgMorale * 0.75 + (100 - avgStress) * 0.25), 10, 100);
      return c;
    }

    function evaluateTownhallAwards(w, completedDay = day(w), options = {}) {
      const c = ensureCulture(w);
      const employed = w.people.filter((p) => p.employed);
      if (!employed.length) return { ok: false, code: "noEmployees" };
      const ranked = employed
        .slice()
        .sort(
          (a, b) =>
            (b.career?.tasksCompleted || 0) + (b.experience?.helpMinutes || 0) / 20 -
            ((a.career?.tasksCompleted || 0) + (a.experience?.helpMinutes || 0) / 20) ||
            a.id.localeCompare(b.id),
        );
      const winner = options.personId
        ? employed.find((p) => p.id === options.personId) || ranked[0]
        : ranked[0];
      const rewardSatang = options.rewardSatang ?? 12000;
      const canPayCash = w.finance.cash > w.catalog.rules.rentDaily * 10 + 4000000 + rewardSatang;
      if (canPayCash && rewardSatang > 0 && options.payBonus) {
        post(w, "wages", -rewardSatang, `townhall_award:${winner.id}:d${completedDay}`);
        winner.pay.totalEarned += rewardSatang;
        winner.pay.totalPaid += rewardSatang;
        winner.pay.wallet += rewardSatang;
      }
      winner.state.morale = clamp(winner.state.morale + 6, 0, 100);
      winner.state.fulfillment = clamp(winner.state.fulfillment + 4, 0, 100);
      const awardEntry = {
        day: completedDay,
        winnerId: winner.id,
        winnerName: winner.identity?.displayName || winner.name,
        roleNameTh: w.catalog.roles[winner.role]?.nameTh || winner.role,
        categoryTh:
          winner.role === "sales"
            ? "🏆 นักเจรจาปิดดีลยอดเยี่ยม (Top B2B Closer)"
            : (winner.experience?.helpMinutes || 0) >= 30
              ? "🤝 ขวัญใจเพื่อนร่วมงานและพี่เลี้ยงดีเด่น (Best Team Mentor)"
              : "🛠️ ช่างฝีมือและคุณภาพการผลิตดีเด่น (Master Craftsperson)",
        rewardSatang: canPayCash && options.payBonus ? rewardSatang : 0,
        reasonTh: `ส่งมอบงานสำเร็จ ${winner.career?.tasksCompleted || 0} ชิ้น และช่วยเหลือเพื่อนร่วมทีม ${winner.experience?.helpMinutes || 0} นาที`,
      };
      c.townhallAwards.unshift(awardEntry);
      if (c.townhallAwards.length > 20) c.townhallAwards.pop();
      event(
        w,
        "townhallAward",
        `${awardEntry.categoryTh}: มอบเกียรติบัตรเชิดชูเกียรติให้แก่ ${awardEntry.winnerName} (${awardEntry.reasonTh})`,
        awardEntry,
      );
      return { ok: true, award: awardEntry };
    }

    function evaluateEmployeeSpinoff(w, completedDay = day(w), options = {}) {
      const c = ensureCulture(w);
      if (!w.externalWorld || !w.externalWorld.corporations) {
        return { ok: false, code: "noExternalWorld", message: "ยังไม่มีระบบโลกภายนอกสำหรับตั้งบริษัท Spin-off" };
      }
      const employed = w.people.filter((p) => p.employed && p.role !== "coordinator");
      if (!employed.length) return { ok: false, code: "noEligibleEmployee", message: "ไม่พบพนักงานสำหรับแยกตัวเปิดกิจการ" };

      const candidate = options.personId
        ? employed.find((p) => p.id === options.personId)
        : employed
            .filter(
              (p) =>
                options.force ||
                ((p.career?.level || 1) >= 3 &&
                  ((p.pay?.wallet || 0) >= 240000 || (p.career?.promotionGrievance || 0) > 0) &&
                  (p.profile?.personality?.ambition || 50) >= 58),
            )
            .sort(
              (a, b) =>
                (b.profile?.personality?.ambition || 50) + (b.career?.level || 1) * 8 -
                ((a.profile?.personality?.ambition || 50) + (a.career?.level || 1) * 8),
            )[0];

      if (!candidate) {
        return { ok: false, code: "noSpinoffCandidateReady", message: "ยังไม่มีพนักงานอาวุโสที่มีทุนสะสมและแรงผลักดันพร้อมตั้งบริษัท Spin-off" };
      }

      ensurePersonExtensions(w, candidate);
      const isFriendly =
        options.relationshipMode === "partner" ||
        (options.relationshipMode !== "rival" &&
          (candidate.career?.promotionGrievance || 0) === 0 &&
          (candidate.state?.morale || 70) >= 48);
      const relMode = isFriendly ? "partner" : "rival";

      const personalCapital = Math.min(candidate.pay.wallet, 120000);
      if (personalCapital > 0) {
        candidate.pay.wallet -= personalCapital;
        candidate.pay.outsideSpending += personalCapital;
      }

      const sameRoleCount = w.people.filter((p) => p.employed && p.role === candidate.role).length;
      let departed = false;
      if (options.depart && sameRoleCount >= 2) {
        release(w, candidate);
        candidate.employed = false;
        candidate.atWork = false;
        candidate.activity = "offDuty";
        candidate.leftAt = now(w);
        candidate.intent = { code: "foundedSpinoff", reasons: [relMode] };
        departed = true;
      }

      const spinoffIndex = c.alumniSpinoffs.length + 1;
      const corpId = `spinoff_${candidate.id.replace(/[^a-zA-Z0-9]/g, "_")}_${spinoffIndex}`;
      const sectorMap = {
        engineer: { sector: "tech", sectorTh: "สตาร์ทอัพวิศวกรรมและไอโอที", buysMats: ["pcb", "microchip"], sellsMats: ["sensor", "wire_harness"], buysProds: ["iotController", "braided_fast_charge_kit"] },
        assembler: { sector: "automotive", sectorTh: "เวิร์กช็อปชิ้นส่วนโลหะและอะลูมิเนียม OEM", buysMats: ["alumina_billet", "structural_steel_plate"], sellsMats: ["metal_sheet", "fastener_set"], buysProds: ["solar_mounting_rail_kit", "ev_battery_tray_assembly"] },
        sales: { sector: "general", sectorTh: "บริษัทเทรดดิ้งและตัวแทนกระจายสินค้า B2B", buysMats: ["pack_carton", "milled_rice"], sellsMats: ["pack_carton", "foil_pouch"], buysProds: ["speaker", "braided_fast_charge_kit", "artisan_chili_paste_jar"] },
        logistics: { sector: "general", sectorTh: "พาร์ตเนอร์ขนส่งด่วนและคลังสินค้าภูมิภาค", buysMats: ["diesel_liter", "pack_carton"], sellsMats: ["pack_carton"], buysProds: ["cold_chain_temp_logger", "speaker"] },
      };
      const sec = sectorMap[candidate.role] || sectorMap.engineer;
      const corpNameTh = isFriendly
        ? `บจก. ${candidate.name} อินดัสเทรียล พาร์ตเนอร์ (Spin-off ศิษย์เก่า)`
        : `บจก. ${candidate.name} แอดวานซ์ เอ็นเตอร์ไพรส์ (Spin-off คู่แข่งใหม่)`;

      const newCorp = {
        id: corpId,
        nameTh: corpNameTh,
        symbol: `SPN${spinoffIndex}`,
        sector: sec.sector,
        sectorTh: sec.sectorTh,
        originTh: "นิคมอุตสาหกรรมไทย (Spin-off ศิษย์เก่า)",
        tierTh: isFriendly ? "กิจการพันธมิตรศิษย์เก่า (Alumni Partner SME)" : "กิจการคู่แข่งแยกตัว (Spin-off Challenger)",
        roles: isFriendly ? ["client", "partner", "supplier"] : ["competitor", "client"],
        relationshipMode: relMode,
        baseTrust: isFriendly ? 74 : 38,
        trustScore: isFriendly ? 74 : 38,
        marketSharePct: 1.8,
        strength: 52,
        cashMillionBaht: 45,
        pricePremium: isFriendly ? 0.07 : 0.01,
        paymentDays: 1,
        sellsMaterials: sec.sellsMats,
        buysMaterials: sec.buysMats,
        buysProducts: sec.buysProds,
        rivalsWith: [],
        alliesWith: isFriendly ? ["siam_tech"] : [],
        founderPersonId: candidate.id,
        founderNameTh: candidate.identity?.displayName || candidate.name,
        lastActionDay: completedDay,
        lastActionTh: isFriendly
          ? `ก่อตั้งโดย ${candidate.name} เพื่อเป็นซัพพลายเออร์และคู่ค้าร่วมเครือข่ายกับบริษัทแม่`
          : `แยกตัวไปเปิดบริษัทแข่งในตลาด ${sec.sectorTh} เนื่องจากต้องการพิสูจน์ฝีมือของตนเอง`,
        strategyTh: isFriendly
          ? "รับช่วงงานผลิตและสั่งซื้อสินค้าจากบริษัทแม่ในฐานะพันธมิตรศิษย์เก่า"
          : "แข่งขันด้านความเร็วและนวัตกรรมในตลาดเดียวกัน",
      };
      w.externalWorld.corporations[corpId] = newCorp;

      const spinoffRecord = {
        day: completedDay,
        corpId,
        corpNameTh,
        founderId: candidate.id,
        founderName: candidate.identity?.displayName || candidate.name,
        roleNameTh: w.catalog.roles[candidate.role]?.nameTh || candidate.role,
        relationshipMode: relMode,
        departed,
        personalCapitalSatang: personalCapital,
        reasonTh: isFriendly
          ? `${candidate.name} สะสมประสบการณ์และทุนส่วนตัว เปิดกิจการพันธมิตรคู่ค้าในเครือข่ายเดียวกับเรา`
          : `${candidate.name} แยกตัวไปตั้งบริษัทคู่แข่งรายใหม่ในตลาด ${sec.sectorTh}`,
      };
      c.alumniSpinoffs.unshift(spinoffRecord);
      if (c.alumniSpinoffs.length > 15) c.alumniSpinoffs.pop();

      appendWorldChronicle(w, {
        day: completedDay,
        type: "alumni_spinoff",
        badgeTh: isFriendly ? "🚀 กิจการร่วมค้าศิษย์เก่า (Spin-off Partner)" : "⚔️ อดีตดาวรุ่งตั้งบริษัทคู่แข่ง (Spin-off Rival)",
        regionTh: "นิคมอุตสาหกรรมไทย",
        headlineTh: `${spinoffRecord.founderName} ก่อตั้ง "${corpNameTh}" เข้าสู่ระบบนิเวศตลาด B2B!`,
        priceImpactSummaryTh: isFriendly ? "เพิ่มคู่ค้าพันธมิตร (+7% ราคาพรีเมียม B2B)" : "เพิ่มคู่แข่งแย่งส่วนแบ่งตลาดในกลุ่มอุตสาหกรรมเดียวกัน",
        meaningTh: spinoffRecord.reasonTh,
      });

      event(
        w,
        "employeeSpinoffCreated",
        `🚀 ${spinoffRecord.founderName} ก่อตั้งกิจการ Spin-off "${corpNameTh}" (${isFriendly ? "พันธมิตรคู่ค้า" : "คู่แข่งในตลาด"}) เข้าสู่ระบบนิเวศบริษัทภายนอก!`,
        spinoffRecord,
      );
      evaluateCompanyGrowthStage(w, completedDay);
      return { ok: true, spinoff: spinoffRecord, corporation: newCorp };
    }

    function evaluateCompanyGrowthStage(w, completedDay = day(w)) {
      const prog = ensureCompanyProgression(w);
      const employedCount = w.people.filter((p) => p.employed).length;
      const plotsCount = (w.facilities?.constructedPlots || []).length;
      const assetsCount = Object.keys(w.externalWorld?.assetPortfolio?.ownedAssets || {}).length;
      const fleetCount = Object.keys(w.fleetTransport?.vehicles || {}).length;
      const serviceCount = Object.keys(w.serviceBusiness?.orders || {}).length;
      const totalExpansionFootprint = plotsCount + assetsCount + (fleetCount > 0 ? 1 : 0) + (serviceCount > 0 ? 1 : 0);

      const checks = {
        first_order_paid: (w.metrics?.ordersPaid || 0) >= 1,
        first_research_unlock:
          (w.research?.unlocked?.length || 1) > 1 ||
          Object.keys(w.capabilities?.unlockedProducts || {}).length > 0,
        first_debt_repaid: w.finance.debt < (w.finance.openingDebt || 6000000),
        debt_free_turnaround: w.finance.debt === 0 && (w.finance.openingDebt || 6000000) > 0,
        team_double_digits: employedCount >= 10,
        first_plot_constructed: plotsCount >= 1,
        first_fleet_truck: fleetCount >= 1,
        first_b2b_service: serviceCount >= 1 || (w.serviceBusiness?.metrics?.completedOrders || 0) >= 1,
        first_external_asset: assetsCount >= 1,
        first_green_utility_offset: (w.utilities?.totalSavedBySolarWaterSatang || 0) > 0,
        first_employee_car:
          (w.culture?.parkedVehicles || []).some((v) => v.kind !== "motorbike") ||
          w.people.some((p) => (p.career?.lifeMilestones || []).some((m) => m.id === "buyVehicle")),
        first_alumni_spinoff: (w.culture?.alumniSpinoffs || []).length >= 1,
      };

      for (const mSpec of D.SME_MILESTONE_CATALOG || []) {
        if (checks[mSpec.id] && !prog.achievedMilestones[mSpec.id]) {
          const rec = {
            id: mSpec.id,
            day: completedDay,
            icon: mSpec.icon,
            titleTh: mSpec.titleTh,
            descTh: mSpec.descTh,
          };
          prog.achievedMilestones[mSpec.id] = rec;
          prog.growthJournal.unshift({
            day: completedDay,
            type: "milestone",
            badgeTh: `${mSpec.icon} ก้าวสำคัญ SME`,
            titleTh: mSpec.titleTh,
            detailTh: mSpec.descTh,
          });
          if (prog.growthJournal.length > 35) prog.growthJournal.pop();
        }
      }

      const stages = D.SME_GROWTH_STAGES || [];
      let bestStage = stages[0];
      for (const st of stages) {
        if (
          employedCount >= st.minEmployees &&
          (w.metrics?.ordersPaid || 0) >= st.minOrdersPaid &&
          w.reputation >= st.minReputation &&
          totalExpansionFootprint >= st.minPlotsOrAssets
        ) {
          bestStage = st;
        }
      }
      if (bestStage && bestStage.order > (prog.currentStageOrder || 1)) {
        prog.currentStageId = bestStage.id;
        prog.currentStageOrder = bestStage.order;
        prog.currentStageBadgeTh = bestStage.badgeTh;
        prog.currentStageNameTh = bestStage.nameTh;
        prog.currentStageSummaryTh = bestStage.summaryTh;
        prog.creditLimitMultiplier = bestStage.creditLimitMult || 1.0;
        prog.b2bTrustBonus = bestStage.b2bTrustBonus || 0;
        prog.growthJournal.unshift({
          day: completedDay,
          type: "stage",
          badgeTh: bestStage.badgeTh,
          titleTh: `ยกระดับองค์กรสู่ "${bestStage.nameTh}"!`,
          detailTh: bestStage.summaryTh,
        });
        if (prog.growthJournal.length > 35) prog.growthJournal.pop();
        event(
          w,
          "smeStageUpgraded",
          `${bestStage.badgeTh} กิจการเติบโตขึ้นสู่ระดับ "${bestStage.nameTh}" (ทีมงาน ${employedCount} คน • ส่งมอบแล้ว ${w.metrics?.ordersPaid || 0} ออเดอร์ • ขยายเพดานเครดิต ×${bestStage.creditLimitMult})`,
          { stageId: bestStage.id, order: bestStage.order, nameTh: bestStage.nameTh },
        );
      }
      return prog;
    }

    function settleDay(w, completedDay) {
      if (completedDay <= w.lastSettledDay) return;
      w.lastSettledDay = completedDay;
      const hasDorm = Boolean(w.facilities?.constructedPlots?.includes("dormitory"));
      for (const p of w.people) {
        if (p.employed) {
          const ot = Math.round(
            (p.pay.dayWage / 480) *
              p.dayStats.otMinutes *
              (p.ot.payMultiplier || w.policies.overtimeMultiplier),
          );
          p.pay.dueBase += p.pay.dayWage;
          p.pay.dueOT += ot;
          p.pay.totalEarned += p.pay.dayWage + ot;
          p.pay.dayWage = p.pay.dailyWage;
          if (hasDorm) {
            p.state.energy = clamp(p.state.energy + 3, 0, 100);
            p.state.stress = clamp(p.state.stress - 2, 0, 100);
          }
        }
        const desiredLiving = Math.round(
          6500 +
            p.state.lifeBurden * 55 +
            (p.profile.values.comfort ?? 50) * 35 -
            (p.profile.personality.prudence ?? 50) * 30,
        );
        const living = Math.min(p.pay.wallet, Math.max(4000, desiredLiving));
        p.pay.wallet -= living;
        p.pay.outsideSpending += living;
        if (p.employed && p.pay.wallet >= 150000) {
          p.state.fulfillment = clamp(p.state.fulfillment + 0.35, 0, 100);
        }
        p.dayStats = { workMinutes: 0, otMinutes: 0 };
      }
      const assetBonuses = getActiveExternalAssetBonuses(w);
      const effectiveRent = Math.max(
        10000,
        Math.round(w.catalog.rules.rentDaily * (1 - assetBonuses.rentReductionPct)),
      );
      w.finance.payables.rent += effectiveRent;
      w.finance.payables.interest += Math.round(
        w.finance.debt * w.catalog.rules.interestDaily,
      );
      payBills(w);
      evaluateExternalAssetsDaily(w, completedDay);
      evaluateNewBusinessOperationsDaily(w, completedDay);
      if (w.companyProgression || w.utilities || w.culture) {
        stepUtilitiesDaily(w, completedDay);
        stepWorkplaceCultureDaily(w, completedDay);
        if (completedDay % 14 === 0 && w.policies.autoAccept) {
          evaluateTownhallAwards(w, completedDay, { payBonus: false });
        }
        evaluateCompanyGrowthStage(w, completedDay);
      }
      if (assetBonuses.moraleBonusDaily > 0 || assetBonuses.energyBonusDaily > 0) {
        for (const emp of w.people) {
          if (!emp.employed) continue;
          if (assetBonuses.moraleBonusDaily > 0) {
            emp.state.morale = clamp(emp.state.morale + assetBonuses.moraleBonusDaily, 0, 100);
          }
          if (assetBonuses.energyBonusDaily > 0) {
            emp.state.energy = clamp(emp.state.energy + assetBonuses.energyBonusDaily, 0, 100);
          }
        }
      }
      if (completedDay % w.catalog.rules.paydayInterval === 0) {
        pay(w, true);
        for (const p of w.people)
          if (p.pay.dueBase + p.pay.dueOT > 0 && p.pay.overdueSince === null)
            p.pay.overdueSince = completedDay;
        evaluateBonuses(w, completedDay);
      }
      if (completedDay % w.catalog.rules.paydayInterval === 0) {
        evaluatePersonalLifeMilestones(w, completedDay);
      }
      if (w.externalWorld?.ceoDirective?.updatedDay > 1 && w.externalWorld?.ceoDirective?.id === "wellness_care") {
        for (const emp of w.people) {
          if (!emp.employed) continue;
          emp.state.morale = clamp(emp.state.morale + 2, 0, 100);
          emp.state.stress = clamp(emp.state.stress - 2, 0, 100);
        }
      }
      if (completedDay % 7 === 0 && (w.externalWorld?.government?.greenBonus || 0) > 0) {
        const hasGreenAsset =
          (w.facilities?.constructedPlots || []).some((pid) => ["solarPlant", "waterPlant"].includes(pid)) ||
          Object.keys(w.externalWorld?.assetPortfolio?.ownedAssets || {}).some((aid) =>
            ["offsite_solar_wind_farm", "organic_herb_orchard", "forestry_pulp_mill"].includes(aid),
          );
        if (hasGreenAsset) {
          w.reputation = clamp(w.reputation + w.externalWorld.government.greenBonus, 0, 100);
        }
      }
      evaluatePromotions(w, completedDay);
      updateExternalWorld(w, completedDay);
      for (const p of w.people) updateSatisfactionAndKpi(w, p, completedDay);
      const welfare =
        w.policies.wellbeingDaily * w.people.filter((p) => p.employed).length;
      if (welfare && w.finance.cash >= welfare) {
        post(w, "welfare", -welfare, "wellbeing");
        for (const p of w.people.filter((p) => p.employed)) {
          p.state.morale = clamp(p.state.morale + 1, 0, 100);
          p.state.stress = clamp(p.state.stress - 2, 0, 100);
        }
      }
      refreshArrears(w, completedDay);
      for (const p of w.people.filter((p) => p.employed)) {
        const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : completedDay - p.pay.overdueSince + 1,
          primarySkill = w.catalog.roles[p.role].skill,
          expectedWage = Math.max(
            w.catalog.rules.minimumWage,
            26000 + p.skills[primarySkill].level * 200,
          ),
          voice = H.workplaceVoice(p.profile, p.state, {
            unpaidDays,
            unresolvedDays: p.concern ? completedDay - p.concern.day : 0,
            wageFairness: p.pay.dailyWage / expectedWage,
          });
        if (voice.action !== "none") {
          if (!p.concern) {
            p.concern = {
              day: completedDay,
              action: voice.action,
              reasons: voice.reasons,
            };
            event(w, "employeeConcern", `พนักงาน (${p.name}) แจ้งข้อกังวล`, {
              personId: p.id,
              reasons: voice.reasons,
            });
          } else {
            p.concern.action = voice.action;
            p.concern.reasons = voice.reasons;
            if (voice.action === "considerLeaving") {
              release(w, p);
              p.employed = false;
              p.atWork = false;
              p.breakUntil = 0;
              p.breakKind = null;
              p.leftAt = now(w);
              p.activity = "offDuty";
              p.position = { ...w.layout.entrance };
              p.previousPosition = { ...p.position };
              p.intent = { code: "leftCompany", reasons: voice.reasons };
              event(w, "employeeLeft", `พนักงาน (${p.name}) ตัดสินใจลาออก`, {
                personId: p.id,
                reasons: voice.reasons,
              });
            }
          }
        } else if (p.concern && p.state.morale >= 35 && p.state.burnout <= 58) {
          p.concern = null;
        }
      }
      w.history.days.push({
        day: completedDay,
        cash: w.finance.cash,
        debt: w.finance.debt,
        reputation: w.reputation,
        ordersPaid: w.metrics.ordersPaid,
      });
      if (w.history.days.length > 120) w.history.days.shift();
    }
    function checkOutcome(w) {
      if (
        w.finance.debt === 0 &&
        w.finance.cash >= w.catalog.rules.winCash &&
        w.reputation >= w.catalog.rules.winReputation
      ) {
        if (w.facilities?.endlessMode) {
          w.facilities.turnaroundAchieved = true;
        } else {
          w.status = "won";
          w.outcome = { code: "companyRecovered", at: now(w) };
          return;
        }
      }
      if (!w.people.some((p) => p.employed)) {
        w.status = "lost";
        w.outcome = { code: "teamCollapsed", at: now(w) };
      } else if (
        w.finance.arrearsSince !== null &&
        day(w) - w.finance.arrearsSince >= 4
      ) {
        w.status = "lost";
        w.outcome = { code: "insolvent", at: now(w) };
      } else if (!w.facilities?.endlessMode && day(w) > w.catalog.rules.scenarioDays) {
        w.status = "lost";
        w.outcome = { code: "deadlineReached", at: now(w) };
      }
    }

    function scaleCompany(w, targetCount, options = {}) {
      const target = clamp(Math.floor(Number(targetCount) || 8), 4, w.catalog.rules.maxPeople || 500);
      const roleCycle = [
        "assembler",
        "assembler",
        "assembler",
        "inspector",
        "logistics",
        "sales",
        "admin",
        "engineer",
        "assembler",
        "inspector",
        "logistics",
        "coordinator",
      ];
      let added = 0;
      while (w.people.filter((p) => p.employed).length < target) {
        const idx = w.nextCandidate;
        const cid = "candidate-" + idx;
        const roleId = roleCycle[(w.people.length + added) % roleCycle.length];
        const identity = D.createIdentity ? D.createIdentity(w.seed, cid, null, roleId) : null;
        const baseNick = identity ? identity.nickname : "พนักงาน";
        const wage = 32000 + (idx % 4) * 3000;
        if (!options.freeGrant) {
          if (w.finance.cash < w.catalog.rules.hireFee) break;
          post(w, "hiring", -w.catalog.rules.hireFee, cid);
        }
        const p = createPerson(w, cid, `${baseNick} ${idx}`, roleId, wage);
        w.people.push(p);
        w.nextCandidate += 1;
        added++;
      }
      syncStationCapacitiesForScale(w);
      return { ok: true, added, totalEmployed: w.people.filter((p) => p.employed).length };
    }

    function step(w) {
      if (w.status !== "running") return false;
      ensureKnowledge(w);
      if (tod(w) === 640) reviewKnowledge(w);
      if (w.people.length > 10) syncStationCapacitiesForScale(w);
      if (tod(w) === 570) evaluateDebtRepayment(w);
      if (tod(w) === 600) evaluateFacilityInvestment(w);
      if (tod(w) === 615) evaluatePlotConstruction(w);
      if (tod(w) === 630 && w.policies.autoAccept) evaluateMachineMaintenance(w);
      if (tod(w) === 645 && day(w) >= 3 && w.policies.autoAccept && w.externalWorld) evaluateExecutiveBoardAndBusinessEntry(w, day(w));
      if (tod(w) === 660 && day(w) >= 5 && w.policies.autoAccept &&
          w.people.some((p) => p.employed && p.atWork && p.role === "coordinator"))
        evaluateAutonomousHiring(w);
      if(tod(w)===690)evaluateCommercialSales(w);
      P.tick(w,TICK,plantHooks(w));
      if(tod(w)===675&&w.policies.autoAccept&&w.people.some(p=>p.employed&&p.atWork&&p.role==="coordinator"))P.review(w,plantHooks(w));
      processDue(w);
      stepAgricultureAndResources(w);
      stepFleetTransportTick(w);
      stepSoftwareBusinessTick(w);
      stepServiceBusinessTick(w);
      reconcileWarehouseLots(w);
      ensureJobs(w);
      autoAccept(w);
      planPurchases(w);
      planStockProduction(w);
      if (tod(w) === 1020)
        for (const p of w.people.filter((p) => p.employed)) {
          const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : Math.max(1, day(w) - p.pay.overdueSince);
          const answer = H.respondToRequest(p.profile, p.state, {
            hours: w.policies.overtimeHours,
            payMultiplier: w.policies.overtimeMultiplier,
            urgency: activeOrders(w).some((o) => o.deadline < now(w) + 1440)
              ? 1
              : 0,
            unpaidDays,
          });
          p.ot = {
            day: day(w),
            payMultiplier: w.policies.overtimeMultiplier,
            ...answer,
          };
          if (w.policies.overtimeHours > 0)
            event(
              w,
              "overtimeResponse",
              `${p.name} ตอบรับคำขอ OT: ${answer.decision === "accept" ? "ตกลงทำเต็มเวลา" : answer.decision === "negotiate" ? "ขอทำบางส่วน" : "ปฏิเสธ"}`,
              {
                personId: p.id,
                ...answer,
              },
            );
        }

      // Fast O(1) station & social/help index for 200-500 NPC scaling
      const stationLoadMap = new Map();
      let tickCtx = null;
      if (w.people.length > 15) {
        const stationOccupants = new Map();
        const workingByZone = new Map();
        const helpersCount = new Map();
        const firstHelperByTarget = new Map();
        let trainingCount = 0;
        for (const p of w.people) {
          if (!p.employed) continue;
          if (p.stationId === "training") trainingCount++;
          if (p.taskId && p.stationId) {
            stationLoadMap.set(p.stationId, (stationLoadMap.get(p.stationId) || 0) + 1);
          }
          if (p.stationId && p.path.length === 0) {
            let list = stationOccupants.get(p.stationId);
            if (!list) { list = []; stationOccupants.set(p.stationId, list); }
            if (list.length < 8) list.push(p);
          }
          if (p.taskId) {
            const z = L.zoneAt(w.layout, p.position);
            let zList = workingByZone.get(z);
            if (!zList) { zList = []; workingByZone.set(z, zList); }
            if (zList.length < 10) zList.push(p);
          }
          if (p.activity === "helping" && p.intent && p.intent.reasons && p.intent.reasons[0]) {
            const tid = p.intent.reasons[0];
            helpersCount.set(tid, (helpersCount.get(tid) || 0) + 1);
            if (!firstHelperByTarget.has(tid)) firstHelperByTarget.set(tid, p);
          }
        }
        tickCtx = { stationOccupants, workingByZone, helpersCount, firstHelperByTarget, trainingCount };
      } else {
        for (const p of w.people) {
          if (p.employed && p.taskId && p.stationId) {
            stationLoadMap.set(p.stationId, (stationLoadMap.get(p.stationId) || 0) + 1);
          }
        }
      }

      P.maintain(w,plantHooks(w));
      for (const p of w.people) personStep(w, p, stationLoadMap, tickCtx);
      w.clock.absoluteMinute += TICK;
      w.clock.tick++;
      if (tod(w) === 0) settleDay(w, day(w) - 1);
      checkOutcome(w);
      return true;
    }
    function advance(w, minutes) {
      if (!int(minutes, 0, 1440 * 365) || minutes % TICK)
        throw new TypeError(
          "advance duration must be a multiple of 5 minutes, <=365 days",
        );
      let advanced = 0;
      for (let i = 0; i < minutes / TICK; i++) {
        if (!step(w)) break;
        advanced += TICK;
      }
      return advanced;
    }
    function candidates(w) {
      const roles = ["assembler", "inspector", "logistics", "engineer", "sales", "admin"];
      return [0, 1, 2].map((offset) => {
        const idx = w.nextCandidate + offset;
        const cid = "candidate-" + idx,
          roleGuess = roles[(idx - 1) % roles.length],
          profile = H.createProfile(w.seed, cid),
          identity = D.createIdentity ? D.createIdentity(w.seed, cid, null, roleGuess) : null,
          baseNick = identity ? identity.nickname : ["พลอย", "นนท์", "ฝน"][(idx - 1) % 3];
        return {
          id: cid,
          name: baseNick + " " + idx,
          profile,
          identity,
          dailyWage: 32000 + offset * 4000,
        };
      });
    }
    const failure = (code, message) => ({ ok: false, code, message });
    function command(w, c) {
      if (!c || typeof c !== "object" || typeof c.type !== "string")
        return failure("invalidCommand", "คำสั่งไม่ถูกต้อง");
      if (w.status !== "running" && c.type !== "continueEndless")
        return failure("scenarioEnded", "สถานการณ์สิ้นสุดแล้ว");
      const person = c.personId
        ? w.people.find((p) => p.id === c.personId && p.employed)
        : null;
      switch (c.type) {
        case "beginKnowledgeProject": return beginKnowledgeProject(w,c.targetId,c.kind || "product");
        case "acquireTechnologyLicense": return acquireTechnologyLicense(w,c.targetId,c.kind || "product");
        case "setPolicy": {
          const valid = {
            autoBuy: typeof c.value === "boolean",
            autoAccept: typeof c.value === "boolean",
            workPriority: ["balanced", "delivery", "research"].includes(
              c.value,
            ),
            overtimeHours:
              typeof c.value === "number" &&
              Number.isFinite(c.value) &&
              c.value >= 0 &&
              c.value <= 3 &&
              c.value * 2 === Math.floor(c.value * 2),
            overtimeMultiplier:
              typeof c.value === "number" &&
              Number.isFinite(c.value) &&
              c.value >= 1.5 &&
              c.value <= 3,
            wellbeingDaily: int(c.value, 0, 10000),
          };
          if (
            typeof c.key !== "string" ||
            !Object.hasOwn(valid, c.key) ||
            !valid[c.key]
          )
            return failure("invalidPolicy", "ค่านโยบายไม่ถูกต้อง");
          w.policies[c.key] = c.value;
          return { ok: true };
        }
        case "buyMaterials": {
          const m = own(w.catalog.materials, c.materialId);
          if (!m || !int(c.quantity, 1, 200))
            return failure("invalidPurchase", "วัตถุดิบหรือจำนวนไม่ถูกต้อง");
          if (w.finance.cash < m.unitCost * c.quantity)
            return failure("insufficientCash", "เงินสดไม่พอซื้อวัตถุดิบ");
          const purchased=placePurchase(w,c.materialId,c.quantity);
          return purchased ? {ok:true,purchaseId:purchased.id} : failure("worldSupplyUnavailable","ซัพพลายเออร์ไม่มีสต็อกพอ เส้นทางปิด หรือเงินไม่พอราคาตลาด");
        }
        case "acceptOffer": {
          const o = own(w.offers, c.offerId);
          if (
            !o ||
            o.status !== "open" ||
            o.expiresAt <= now(w) ||
            o.deadline <= now(w) ||
            !w.research.unlocked.includes(o.productId)
          )
            return failure("offerUnavailable", "ข้อเสนอใช้ไม่ได้แล้ว");
          if (
            activeOrders(w).length >= w.catalog.rules.maxActiveOrders ||
            Object.keys(w.units).length + o.quantity > w.catalog.rules.maxUnits
          )
            return failure("capacityLimit", "งานค้างเกินขีดจำกัด");
          const order = accept(w, o);
          if (!order)
            return failure(
              "financialLimit",
              "ยอดคำสั่งซื้อเกินขอบเขตตัวเลขที่รองรับ",
            );
          return { ok: true, orderId: order.id };
        }
        case "cancelOrder": {
          const o = own(w.orders, c.orderId);
          if(o?.commercialContractId)return failure("contractObligation","งวดนี้เป็นภาระสัญญาระยะยาว ต้องส่งตามข้อตกลง");
          if (
            !o ||
            o.status !== "accepted" ||
            o.materialConsumed ||
            Object.values(w.units).some(
              (u) => u.orderId === o.id && u.materialConsumed,
            )
          )
            return failure(
              "orderCannotCancel",
              "ยกเลิกได้ก่อนเริ่มใช้วัตถุดิบเท่านั้น",
            );
          if (w.finance.cash < o.deposit)
            return failure("insufficientCash", "เงินสดไม่พอคืนมัดจำ");
          if (o.deposit) post(w, "customerRefund", -o.deposit, o.id);
          for (const j of Object.values(w.jobs).filter(
            (j) => j.orderId === o.id,
          )) {
            const p = w.people.find((p) => p.taskId === j.id);
            if (p) release(w, p);
            delete w.jobs[j.id];
          }
          for (const u of Object.values(w.units).filter(
            (u) => u.orderId === o.id,
          )) {
            unreserve(w, u);
            delete w.units[u.id];
          }
          o.status = "cancelled";
          return { ok: true };
        }
        case "borrow":
          if (
            !int(c.amount, 1) ||
            c.amount + w.finance.debt > w.catalog.rules.creditLimit ||
            !Number.isSafeInteger(w.finance.cash + c.amount)
          )
            return failure("creditLimit", "วงเงินหรือจำนวนไม่ถูกต้อง");
          post(w, "loan", c.amount, "bank");
          return { ok: true };
        case "repayDebt":
          if (
            !int(c.amount, 1) ||
            c.amount > w.finance.cash ||
            c.amount > w.finance.debt
          )
            return failure(
              "invalidRepayment",
              "จำนวนชำระหนี้หรือเงินสดไม่ถูกต้อง",
            );
          post(w, "debtRepayment", -c.amount, "bank");
          checkOutcome(w);
          return { ok: true };
        case "payArrears":
          payBills(w);
          pay(w, false);
          refreshArrears(w);
          return { ok: true };
        case "setRole":
          if (!person || !own(w.catalog.roles, c.role))
            return failure("invalidRole", "พนักงานหรือตำแหน่งไม่ถูกต้อง");
          person.role = c.role;
          person.visual.roleKey = c.role;
          ensurePersonExtensions(w, person);
          if (D.getCareerStep) {
            const step = D.getCareerStep(c.role, person.career.level || 1);
            person.career.titleTh = step.titleTh;
            person.career.badge = step.badge;
            if (step.division) person.career.division = step.division;
            if (step.departmentTh) person.career.departmentTh = step.departmentTh;
            if (step.dutyTh) person.career.dutyTh = step.dutyTh;
          }
          return { ok: true };
        case "setWage":
          if (!person || !int(c.dailyWage, w.catalog.rules.minimumWage, 200000))
            return failure("invalidWage", "ค่าจ้างไม่ถูกต้อง");
          person.pay.dailyWage = c.dailyWage;
          return { ok: true };
        case "hire": {
          const candidate = candidates(w).find((p) => p.id === c.candidateId);
          if (!candidate || !own(w.catalog.roles, c.role))
            return failure("invalidCandidate", "ผู้สมัครหรือตำแหน่งไม่ถูกต้อง");
          if (
            w.people.filter((p) => p.employed).length >=
            w.catalog.rules.maxPeople
          )
            return failure("staffLimit", "พนักงานถึงขีดจำกัด");
          if (w.finance.cash < w.catalog.rules.hireFee)
            return failure("insufficientCash", "เงินสดไม่พอค่ารับสมัคร");
          const p = createPerson(
            w,
            candidate.id,
            candidate.name,
            c.role,
            candidate.dailyWage,
          );
          post(w, "hiring", -w.catalog.rules.hireFee, p.id);
          w.people.push(p);
          w.nextCandidate += 3;
          syncStationCapacitiesForScale(w);
          event(
            w,
            "employeeHired",
            `ฝ่ายบุคคลว่าจ้าง ${p.name} เข้าทำงานตำแหน่ง${w.catalog.roles[c.role].nameTh}`,
            { personId: p.id },
          );
          return { ok: true, personId: p.id };
        }
        case "constructPlot": {
          return constructPlot(w, c.plotId, person, c.reason);
        }
        case "acquireExternalAsset": {
          return acquireExternalAsset(w, c.assetId, { upgrade: Boolean(c.upgrade), freeGrant: Boolean(c.freeGrant) });
        }
        case "setSupplyChainStrategy": {
          if (!D.SUPPLY_CHAIN_STRATEGIES?.[c.strategyId])
            return failure("invalidStrategy", "กลยุทธ์ห่วงโซ่อุปทานไม่ถูกต้อง");
          const ap = ensureAssetPortfolio(w);
          ap.supplyChainStrategy = c.strategyId;
          const stSpec = D.SUPPLY_CHAIN_STRATEGIES[c.strategyId];
          event(
            w,
            "supplyChainStrategyChanged",
            `🧭 ปรับวิสัยทัศน์ห่วงโซ่อุปทานเป็น "${stSpec.nameTh}"`,
            { strategyId: c.strategyId },
          );
          return { ok: true, strategyId: c.strategyId };
        }
        case "toggleProductionChain": {
          const ap = ensureAssetPortfolio(w);
          if (!ap.chainSettings[c.chainId])
            return failure("invalidChain", "ไม่พบห่วงโซ่การผลิตที่ระบุ");
          ap.chainSettings[c.chainId].enabled =
            typeof c.enabled === "boolean" ? c.enabled : !ap.chainSettings[c.chainId].enabled;
          return { ok: true, chainId: c.chainId, enabled: ap.chainSettings[c.chainId].enabled };
        }
        case "runMidstreamRefining": {
          return runMidstreamRefining(w, {
            force: true,
            chainId: c.chainId || null,
            materialId: c.materialId || null,
            batches: c.batches || 2,
            ignoreTechGate: Boolean(c.ignoreTechGate),
          });
        }
        case "craftMaterial": {
          return craftMaterialRecipe(w, c.materialId, c.batches || 1, {
            ignoreTechGate: Boolean(c.ignoreTechGate),
          });
        }
        case "cancelRefineryBatch": {
          const res = P.cancelRefineryBatch(w, c.batchId);
          reconcileWarehouseLots(w);
          return res;
        }
        case "milkLivestockHerd": {
          return milkLivestockHerd(w, c.assetId || "dairy_soy_farm", {
            silent: Boolean(c.silent),
          });
        }
        case "renegotiateCommercialContract": {
          return renegotiateCommercialContract(w, c.contractId, {
            newQuantity: c.newQuantity,
          });
        }
        case "terminateCommercialContract": {
          return terminateCommercialContract(w, c.contractId, c.reasonTh);
        }
        case "plantCropPlot": {
          return plantCropPlot(w, c.plotId, {
            cropId: c.cropId,
            assetId: c.assetId,
            seedMaterialId: c.seedMaterialId,
            seedSaveRatio: c.seedSaveRatio,
          });
        }
        case "careCropPlot": {
          return careCropPlot(w, c.plotId, {
            applyWater: c.applyWater,
            waterUnits: c.waterUnits,
            requireWater: c.requireWater,
            applyFertilizer: c.applyFertilizer,
            fertilizerMaterialId: c.fertilizerMaterialId,
          });
        }
        case "harvestCropPlot": {
          return harvestCropPlot(w, c.plotId, {
            forceRipe: Boolean(c.forceRipe),
            seedSaveRatio: c.seedSaveRatio,
          });
        }
        case "saveSeedFromCrop": {
          return saveSeedFromCrop(w, c.cropMaterialId, c.quantity || 2);
        }
        case "acquireFleetVehicle": {
          return acquireFleetVehicle(w, c.vehicleTypeId || "dry_6w", {
            ownership: c.ownership,
            freeGrant: Boolean(c.freeGrant),
          });
        }
        case "maintainFleetVehicle": {
          return maintainFleetVehicle(w, c.vehicleId);
        }
        case "acceptFreightContract": {
          return acceptFreightContract(w, c.quoteId, {
            vehicleId: c.vehicleId,
            driverPersonId: c.driverPersonId,
            allowLoss: Boolean(c.allowLoss),
          });
        }
        case "advanceFreightContract": {
          return advanceFreightContract(w, c.contractId, {
            completeAllSteps: Boolean(c.completeAllSteps),
            triggerBreakdown: Boolean(c.triggerBreakdown),
            creditDays: c.creditDays,
            deferPayment: Boolean(c.deferPayment),
            finishReturn: Boolean(c.finishReturn),
          });
        }
        case "cancelFreightContract": {
          return cancelFreightContract(w, c.contractId);
        }
        case "startSoftwareProject": {
          return startSoftwareProject(w, c.appId || "pos_retail", c.clientCorpId || "cp_health", {
            projectId: c.projectId,
            developerPersonId: c.developerPersonId,
            contractPriceSatang: c.contractPriceSatang,
            targetVersion: c.targetVersion,
          });
        }
        case "advanceSoftwareProject": {
          return advanceSoftwareProject(w, c.projectId, {
            completeAllSteps: Boolean(c.completeAllSteps),
            unblock: Boolean(c.unblock),
            minutes: c.minutes,
            injectDefects: c.injectDefects,
            fixDefects: c.fixDefects,
            deliveredVersion: c.deliveredVersion,
            discoverScopeChange: Boolean(c.discoverScopeChange),
            deployWithKnownDefects: Boolean(c.deployWithKnownDefects),
          });
        }
        case "updateSaasSubscription": {
          return updateSaasSubscription(w, c.appId || "pos_retail", {
            launchMvp: Boolean(c.launchMvp),
            addLeads: c.addLeads,
            convertUsers: c.convertUsers,
            churnUsers: c.churnUsers,
            installInternally: c.installInternally,
            runBillingCycle: Boolean(c.runBillingCycle),
          });
        }
        case "matchBackhaulCargo": {
          return matchBackhaulCargo(w, c.contractId, {
            backhaulRevenueSatang: c.backhaulRevenueSatang,
          });
        }
        case "expireFoodBatch": {
          return expireFoodBatch(w, { unitId: c.unitId });
        }
        case "triggerRmaClaim": {
          return triggerRmaClaim(w, {
            productId: c.productId,
            orderId: c.orderId,
            defectiveQty: c.defectiveQty,
            reasonTh: c.reasonTh,
          });
        }
        case "resolveRmaClaim": {
          return resolveRmaClaim(w, c.claimId, { mode: c.mode });
        }
        case "triggerToolingChangeover": {
          return triggerToolingChangeover(w, c.lineId || "lineA", c.productId || "ev_battery_pack", {
            force: Boolean(c.force),
            freeSetup: Boolean(c.freeSetup),
          });
        }
        case "certifyBiomedLot": {
          return certifyBiomedLot(w, {
            productId: c.productId,
            lotId: c.lotId,
            contaminateLot: Boolean(c.contaminateLot),
          });
        }
        case "startServiceOrder": {
          return startServiceOrder(w, c.serviceTypeId || "calibration_lab", c.clientCorpId || "siam_auto", {
            orderId: c.orderId,
            specialistId: c.specialistId,
            feeSatang: c.feeSatang,
            equipmentNameTh: c.equipmentNameTh,
          });
        }
        case "advanceServiceOrder": {
          return advanceServiceOrder(w, c.orderId, {
            completeAllSteps: Boolean(c.completeAllSteps),
            breachSla: Boolean(c.breachSla),
          });
        }
        case "feedLivestockHerd": {
          return feedLivestockHerd(w, c.assetId || "dairy_soy_farm", {
            freeFeed: Boolean(c.freeFeed),
          });
        }
        case "surveyNewMineVein": {
          return surveyNewMineVein(w, c.assetId || "copper_bauxite_mine", {
            freeSurvey: Boolean(c.freeSurvey),
          });
        }
        case "treatMineralSlag": {
          return treatMineralSlag(w, c.batches || 1, {
            silent: Boolean(c.silent),
          });
        }
        case "payUtilityBills": {
          return payUtilityBills(w, c);
        }
        case "evaluateCompanyGrowthStage": {
          return { ok: true, progression: evaluateCompanyGrowthStage(w, day(w)) };
        }
        case "evaluateTownhallAwards": {
          return evaluateTownhallAwards(w, day(w), c);
        }
        case "evaluateEmployeeSpinoff": {
          return evaluateEmployeeSpinoff(w, day(w), c);
        }
        case "triggerGeopoliticalEvent": {
          return triggerGeopoliticalEvent(w, c.eventId || null, {
            manual: true,
            applySpotPriceToPO: c.applySpotPriceToPO,
            silent: Boolean(c.silent),
          });
        }
        case "changeForeignRegime": {
          return changeForeignRegime(w, c.nationId || "US", c.regimeId || null, {
            manual: true,
            applySpotPriceToPO: c.applySpotPriceToPO,
            silent: Boolean(c.silent),
          });
        }
        case "evaluateExecutiveBoard": {
          return evaluateExecutiveBoardAndBusinessEntry(w, c.day || day(w), {
            forceReview: true,
            forceApprove: Boolean(c.forceApprove),
            ignoreAtWork: Boolean(c.ignoreAtWork),
            proposeFleetType: c.proposeFleetType,
            proposeSoftwareApp: c.proposeSoftwareApp,
            proposeServiceType: c.proposeServiceType,
            evaluateAssetsNow: Boolean(c.evaluateAssetsNow),
          });
        }
        case "sellMaterialB2B": {
          return sellMaterialB2B(w, c.materialId, c.quantity || 2, c.buyerCorpId || null);
        }
        case "setCorporationRelation": {
          return setCorporationRelation(w, c.corpId, c.mode);
        }
        case "continueEndless": {
          if (!w.facilities) w.facilities = freshFacilities();
          w.facilities.turnaroundAchieved = true;
          w.facilities.endlessMode = true;
          w.catalog.rules.winCash = Math.max(w.catalog.rules.winCash, 100000000000);
          w.catalog.rules.scenarioDays = Math.max(w.catalog.rules.scenarioDays, 365);
          w.status = "running";
          w.outcome = null;
          event(
            w,
            "turnaroundMilestone",
            "🏆 บริษัทบรรลุเป้าหมายปลดหนี้และกอบกู้วิกฤตสำเร็จ! เปิดโหมดขยายอาณาจักรไร้ขีดจำกัด (Endless Corporate Empire Mode)",
            { day: day(w), cash: w.finance.cash, reputation: w.reputation },
          );
          return { ok: true, endlessMode: true };
        }
        case "maintainMachines": {
          if (!w.facilities) w.facilities = freshFacilities();
          const before = w.facilities.machineCondition ?? 100;
          w.facilities.machineCondition = 100;
          w.facilities.maintenanceCount = (w.facilities.maintenanceCount || 0) + 1;
          event(
            w,
            "machineMaintained",
            `🛠️ สั่งซ่อมบำรุงและสอบเทียบเครื่องจักรโรงงานเต็มระบบ สภาพพร้อมใช้งาน 100% (จาก ${before}%)`,
            { machineCondition: 100, manual: true },
          );
          return { ok: true, machineCondition: 100 };
        }
        case "batchCraftAll": {
          let totalBatches = 0;
          let totalUnits = 0;
          runMidstreamRefining(w, { force: true });
          for (const tierLv of [1, 2, 3]) {
            for (const rec of Object.values(D.MATERIAL_RECIPES || {})) {
              if (rec.tier !== tierLv) continue;
              if (!materialReady(w, rec.outputMaterialId || rec.id)) continue;
              const res = craftMaterialRecipe(w, rec.id, c.batches || 2, { silent: true });
              if (res.ok) {
                totalBatches += res.batches;
                totalUnits += res.unitsProduced;
              }
            }
          }
          if (totalBatches > 0) {
            event(
              w,
              "materialCrafted",
              `⚡ สั่งเดินเครื่องแปรรูปวัตถุดิบแบบ Batch ครบทุกขั้น (T1➔T3) สำเร็จ ${totalBatches} ล็อต (ได้วัตถุดิบและชิ้นส่วนรวม +${totalUnits} ชิ้น)`,
              { batches: totalBatches, unitsProduced: totalUnits },
            );
          }
          return { ok: true, batches: totalBatches, unitsProduced: totalUnits };
        }
        case "setCeoDirective": {
          const directives = D.EXTERNAL_WORLD_DEFAULTS?.ceoDirectives || [];
          const spec = directives.find((d) => d.id === c.directiveId);
          if (!spec) return failure("invalidDirective", "ไม่พบเข็มทิศกลยุทธ์ที่ระบุ");
          if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
          const ceo = w.people.find((p) => p.employed && p.role === "coordinator") || w.people[0];
          w.externalWorld.ceoDirective = {
            id: spec.id,
            nameTh: spec.nameTh,
            descTh: spec.descTh,
            updatedDay: Math.max(2, day(w)),
            ceoName: ceo ? ceo.name : "CEO",
          };
          event(
            w,
            "ceoDirectiveChanged",
            `🧭 CEO (${ceo ? ceo.name : "ผู้บริหาร"}) ประกาศเปลี่ยนเข็มทิศกลยุทธ์องค์กรเป็น "${spec.nameTh}"`,
            { directiveId: spec.id },
          );
          return { ok: true, directiveId: spec.id };
        }
        case "scaleCompany": {
          if (!int(c.targetCount, 4, w.catalog.rules.maxPeople || 500))
            return failure("invalidScale", "จำนวนพนักงานเป้าหมายไม่ถูกต้อง");
          return scaleCompany(w, c.targetCount, { freeGrant: Boolean(c.freeGrant) });
        }
        case "expandSite": {
          if (
            !int(c.width, 0, 8) ||
            !int(c.height, 0, 6) ||
            c.width + c.height === 0
          )
            return failure("invalidExpansion", "ขนาดขยายพื้นที่ไม่ถูกต้อง");
          let layout;
          try {
            layout = L.expand(w.layout, c.width, c.height);
          } catch (_) {
            return failure("invalidExpansion", "ขยายพื้นที่เกินขีดจำกัด");
          }
          const cost =
            (layout.width * layout.height - w.layout.width * w.layout.height) *
            25000;
          if (cost > w.finance.cash)
            return failure("insufficientCash", "เงินสดไม่พอขยายพื้นที่");
          post(w, "expansion", -cost, "site");
          w.layout = layout;
          return { ok: true };
        }
        case "installStation": {
          const customStationKinds = Object.values(
            w.catalog.taskKinds || {},
          ).map((t) => t.stationKind);
          const allowedStationKinds = new Set([
            "assembly",
            "quality",
            "packing",
            "research",
            "sales",
            "admin",
            ...customStationKinds,
          ]);
          if (
            typeof c.kind !== "string" ||
            !allowedStationKinds.has(c.kind) ||
            !int(c.x, 1, 95) ||
            !int(c.y, 1, 63) ||
            !int(c.accessX, 1, 95) ||
            !int(c.accessY, 1, 63)
          )
            return failure("invalidStation", "ตำแหน่งสถานีไม่ถูกต้อง");
          const cost = 1200000;
          if (w.finance.cash < cost)
            return failure("insufficientCash", "เงินสดไม่พอติดตั้งสถานี");
          const sid = "station-" + (w.sequence + 1),
            station = {
              id: sid,
              kind: c.kind,
              cell: { x: c.x, y: c.y },
              access: { x: c.accessX, y: c.accessY },
              capacity: 1,
              visualKey: "station." + c.kind,
            };
          let map;
          try {
            map = L.addStation(w.layout, station);
          } catch (_) {
            return failure(
              "invalidStation",
              "พื้นที่ใช้งานไม่ได้หรือปิดกั้นทางเดิน",
            );
          }
          if (
            w.people.some(
              (p) =>
                !L.walkable(map, p.position) ||
                (p.stationId &&
                  L.findPath(
                    map,
                    p.position,
                    map.stations[p.stationId].access,
                  ) === null),
            )
          )
            return failure("occupiedSite", "พื้นที่มีคนหรือปิดกั้นทางเดิน");
          id(w, "station");
          post(w, "equipment", -cost, sid);
          w.layout = map;
          for (const p of w.people)
            if (p.stationId)
              p.path =
                L.findPath(map, p.position, map.stations[p.stationId].access) ||
                [];
          return { ok: true, stationId: sid };
        }
        case "directorEdit": {
          // Sandbox Edit Hub (JS2-inspired) — strictly preserves accounting & material conservation invariants
          if (!c.action || typeof c.action !== "string")
            return failure("invalidEdit", "คำสั่งแก้ไขไม่ถูกต้อง");
          if (c.action === "setTrait") {
            const dimensions = c.group === "personality" ? H.PERSONALITY : c.group === "values" ? H.VALUES : [];
            if (!person || !dimensions.includes(c.key) || typeof c.value !== "number" ||
                !Number.isFinite(c.value) || c.value < 0 || c.value > 100)
              return failure("invalidEdit", "ค่านิสัยหรือค่านิยมไม่ถูกต้อง");
            const profile = clone(person.profile);
            profile[c.group][c.key] = c.value;
            const errors = H.validateProfile(profile);
            if (errors.length) return failure("invalidEdit", errors.join("; "));
            person.profile = H.freezeProfile(profile);
            event(w, "directorEdit", `[ศูนย์แก้ไข] ปรับข้อมูลตัวละคร ${person.name}`, {
              action: "setTrait", personId: person.id, group: c.group, key: c.key, value: c.value,
            });
            return { ok: true };
          }
          if (c.action === "grantCash") {
            if (!int(c.amount, 100, 1000000000))
              return failure("invalidEdit", "จำนวนเงินไม่ถูกต้อง");
            w.finance.openingCash += c.amount;
            w.finance.cash += c.amount;
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] อัดฉีดเงินทุนสำรอง +${(c.amount / 100).toLocaleString("th-TH")} บาท`,
              { action: "grantCash", amount: c.amount },
            );
            return { ok: true };
          }
          if (c.action === "grantPersonWallet") {
            if (!person || !int(c.amount, 100, 500000000))
              return failure("invalidEdit", "ไม่พบพนักงานหรือจำนวนเงินไม่ถูกต้อง");
            w.finance.openingCash += c.amount;
            w.finance.cash += c.amount;
            post(w, "wages", -c.amount, `directorWalletGrant:${person.id}:${++w.sequence}`);
            person.pay.totalEarned += c.amount;
            person.pay.totalPaid += c.amount;
            person.pay.wallet += c.amount;
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เพิ่มเงินออมเข้ากระเป๋าส่วนตัวของ ${person.name} +${(c.amount / 100).toLocaleString("th-TH")} บาท (แยกจากบัญชีเงินสดบริษัท)`,
              { action: "grantPersonWallet", personId: person.id, amount: c.amount },
            );
            stepWorkplaceCultureDaily(w, day(w));
            return { ok: true, wallet: person.pay.wallet };
          }
          if (c.action === "grantMaterial" || c.action === "addMaterials") {
            if (!int(c.quantity, 1, 500) ||
                (c.action === "grantMaterial" && !own(w.catalog.materials, c.materialId)))
              return failure("invalidEdit", "วัตถุดิบหรือจำนวนไม่ถูกต้อง");
            const qty = c.quantity;
            const targets = c.action === "grantMaterial" ? [c.materialId] : Object.keys(w.catalog.materials);
            if (targets.some((id) => !int(w.inventory.opening[id] + qty) || !int(w.inventory.materials[id] + qty)))
              return failure("invalidEdit", "จำนวนวัตถุดิบเกินขีดจำกัด");
            if (c.materialId && own(w.catalog.materials, c.materialId)) {
              const mat = w.catalog.materials[c.materialId];
              w.inventory.opening[c.materialId] += qty;
              w.inventory.materials[c.materialId] += qty;
              event(
                w,
                "directorEdit",
                `[ศูนย์แก้ไข] เพิ่มสต็อกตั้งต้น ${mat.nameTh} +${qty} ชิ้น`,
                { action: "grantMaterial", materialId: c.materialId, quantity: qty },
              );
            } else {
              for (const mId of Object.keys(w.catalog.materials)) {
                w.inventory.opening[mId] += qty;
                w.inventory.materials[mId] += qty;
              }
              event(
                w,
                "directorEdit",
                `[ศูนย์แก้ไข] เติมวัตถุดิบทุกชนิด +${qty} ชิ้นเข้าคลัง`,
                { action: "addMaterials", quantity: qty },
              );
            }
            return { ok: true };
          }
          if (c.action === "setSubject") {
            const person=w.people.find(p=>p.id===c.personId);
            if(!person || !Object.hasOwn(SUBJECTS,c.subjectId) || !Number.isFinite(c.level) || c.level<0 || c.level>100) return failure("invalidSubject","เลือกพนักงาน วิชา และระดับ 0–100 ให้ถูกต้อง");
            ensureKnowledge(w); person.education.subjects[c.subjectId]=c.level;
            event(w,"directorEdit",`[ศูนย์แก้ไข] ${person.name}: วิชา${SUBJECTS[c.subjectId]} ระดับ ${c.level}`,{action:"setSubject",personId:person.id,subjectId:c.subjectId,level:c.level});
            return {ok:true};
          }
          if (c.action === "grantResearch" || c.action === "addResearch") {
            const pts = int(c.points, 1, 5000) ? c.points : 100;
            w.research.points += pts;
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เพิ่มแต้มวิจัย R&D +${pts} แต้ม`,
              { action: "grantResearch", points: pts },
            );
            return { ok: true };
          }
          if (c.action === "setReputation") {
            const rawRep = typeof c.value === "number" ? c.value : c.reputation;
            if (typeof rawRep !== "number" || !Number.isFinite(rawRep))
              return failure("invalidEdit", "ค่าชื่อเสียงไม่ถูกต้อง");
            w.reputation = clamp(Math.round(rawRep), 0, 100);
            checkOutcome(w);
            return { ok: true };
          }
          if (c.action === "refreshPerson") {
            const targets = person
              ? [person]
              : w.people.filter((p) => p.employed);
            if (!targets.length) return failure("invalidEdit", "ไม่พบพนักงาน");
            for (const tp of targets) {
              tp.state = H.normaliseState({
                ...tp.state,
                energy: 100,
                focus: 100,
                hunger: 0,
                stress: 8,
                burnout: 0,
                morale: 95,
                health: 100,
                sleepDebt: 0,
              });
              tp.concern = null;
            }
            event(
              w,
              "directorEdit",
              person
                ? `[ศูนย์แก้ไข] ฟื้นฟูพลังงานและขวัญกำลังใจของ ${person.name} เต็ม 100%`
                : `[ศูนย์แก้ไข] ฟื้นฟูพลังงานและขวัญกำลังใจพนักงานทุกคนเต็ม 100%`,
              { action: "refreshPerson", personId: person ? person.id : null },
            );
            return { ok: true };
          }
          if (c.action === "trainSkill") {
            if (!person || !own(w.catalog.skills, c.skillId))
              return failure("invalidEdit", "ไม่พบพนักงานหรือทักษะ");
            person.skills[c.skillId] = H.learn(
              person.profile,
              person.skills[c.skillId],
              w.catalog.skills[c.skillId],
              600,
            );
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] ฝึกอบรมทักษะ ${w.catalog.skills[c.skillId].nameTh} ให้ ${person.name}`,
              { action: "trainSkill", personId: person.id, skillId: c.skillId },
            );
            return { ok: true };
          }
          if (c.action === "renamePerson") {
            if (!person || typeof c.name !== "string" || !c.name.trim())
              return failure("invalidEdit", "ชื่อไม่ถูกต้อง");
            person.name = c.name.trim().slice(0, 32);
            ensurePersonExtensions(w, person);
            person.identity.nickname = person.name;
            person.identity.displayName = `${person.identity.fullName} (${person.name})`;
            return { ok: true };
          }
          if (c.action === "constructPlot") {
            const plotSpec = D.EXPANSION_PLOTS?.[c.plotId];
            if (!plotSpec) return failure("invalidEdit", "ไม่พบอาคารที่ระบุ");
            if (w.finance.cash < plotSpec.cost) {
              w.finance.openingCash += plotSpec.cost;
              w.finance.cash += plotSpec.cost;
            }
            return constructPlot(w, c.plotId, null, "[ศูนย์แก้ไข] ก่อสร้างอาคารขยายนิคม");
          }
          if (c.action === "scaleHeadcount") {
            if (!int(c.targetCount, 4, w.catalog.rules.maxPeople || 500))
              return failure("invalidEdit", "จำนวนพนักงานเป้าหมายไม่ถูกต้อง");
            return scaleCompany(w, c.targetCount, { freeGrant: true });
          }
          if (c.action === "setProductionRegime") {
            if (!D.PRODUCTION_REGIMES?.[c.regimeId])
              return failure("invalidEdit", "โหมดการผลิตไม่ถูกต้อง");
            if (!w.logistics) w.logistics = freshLogistics();
            w.logistics.productionRegime = c.regimeId;
            const reg = D.PRODUCTION_REGIMES[c.regimeId];
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เปลี่ยนโหมดการผลิตของโรงงานเป็น "${reg.nameTh}"`,
              { action: "setProductionRegime", regimeId: c.regimeId },
            );
            return { ok: true };
          }
          if (c.action === "promotePerson") {
            if (!person) return failure("invalidEdit", "ไม่พบพนักงาน");
            ensurePersonExtensions(w, person);
            const nextLv = Math.min(10, (person.career.level || 1) + 1);
            if (nextLv === person.career.level)
              return failure("invalidEdit", "พนักงานอยู่ระดับสูงสุด (Lv.10) แล้ว");
            const step = D.getCareerStep(person.role, nextLv);
            person.career.level = step.level;
            person.career.gradeCode = step.gradeCode || ("G" + step.level);
            person.career.titleTh = step.titleTh;
            person.career.badge = step.badge;
            person.career.dutyTh = step.dutyTh;
            person.career.promotions = (person.career.promotions || 0) + 1;
            person.career.lastPromotionDay = day(w);
            person.pay.dailyWage += step.wageBonus || 3500;
            person.pay.dayWage = person.pay.dailyWage;
            if (D.resolveOrgAssignment) {
              const orgUnit = D.resolveOrgAssignment(person.role, step.level, person.id, w.facilities?.constructedPlots || []);
              person.career.orgUnit = orgUnit;
              person.career.sectionTh = orgUnit.sectionNameTh;
              person.career.groupTh = orgUnit.groupNameTh;
              person.career.tierNameTh = orgUnit.tierNameTh;
              person.career.orgPathTh = orgUnit.orgPathTh;
            }
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เลื่อนตำแหน่ง ${person.name} ขึ้นเป็น "${step.titleTh}" (${step.badge})`,
              { action: "promotePerson", personId: person.id, level: step.level },
            );
            return { ok: true };
          }
          if (c.action === "acquireExternalAsset" || c.action === "upgradeExternalAsset") {
            return acquireExternalAsset(w, c.assetId, {
              upgrade: c.action === "upgradeExternalAsset" || Boolean(c.upgrade),
              freeGrant: Boolean(c.freeGrant),
            });
          }
          if (c.action === "setSupplyChainStrategy") {
            return command(w, { type: "setSupplyChainStrategy", strategyId: c.strategyId });
          }
          if (c.action === "toggleProductionChain") {
            return command(w, { type: "toggleProductionChain", chainId: c.chainId, enabled: c.enabled });
          }
          if (c.action === "runMidstreamRefining") {
            return runMidstreamRefining(w, {
              force: true,
              chainId: c.chainId || null,
              materialId: c.materialId || null,
              batches: c.batches || 2,
              ignoreTechGate: Boolean(c.ignoreTechGate),
            });
          }
          if (c.action === "craftMaterial") {
            return craftMaterialRecipe(w, c.materialId, c.batches || 1, {
              ignoreTechGate: Boolean(c.ignoreTechGate),
            });
          }
          if (c.action === "sellMaterialB2B") {
            return sellMaterialB2B(w, c.materialId, c.quantity || 2, c.buyerCorpId || null);
          }
          if (c.action === "setCorporationRelation") {
            return setCorporationRelation(w, c.corpId, c.mode);
          }
          if (c.action === "continueEndless") {
            return command(w, { type: "continueEndless" });
          }
          if (c.action === "maintainMachines") {
            return command(w, { type: "maintainMachines" });
          }
          if (c.action === "batchCraftAll") {
            return command(w, { type: "batchCraftAll", batches: c.batches || 2 });
          }
          if (c.action === "setCeoDirective") {
            return command(w, { type: "setCeoDirective", directiveId: c.directiveId });
          }
          if (
            [
              "plantCropPlot",
              "careCropPlot",
              "harvestCropPlot",
              "saveSeedFromCrop",
              "acquireFleetVehicle",
              "maintainFleetVehicle",
              "acceptFreightContract",
              "advanceFreightContract",
              "cancelFreightContract",
              "matchBackhaulCargo",
              "startSoftwareProject",
              "advanceSoftwareProject",
              "updateSaasSubscription",
              "expireFoodBatch",
              "triggerRmaClaim",
              "resolveRmaClaim",
              "triggerToolingChangeover",
              "certifyBiomedLot",
              "startServiceOrder",
              "advanceServiceOrder",
              "feedLivestockHerd",
              "surveyNewMineVein",
              "treatMineralSlag",
              "payUtilityBills",
              "evaluateCompanyGrowthStage",
              "evaluateTownhallAwards",
              "evaluateEmployeeSpinoff",
              "evaluateExecutiveBoard",
              "triggerGeopoliticalEvent",
              "changeForeignRegime",
            ].includes(c.action)
          ) {
            return command(w, { ...c, type: c.action });
          }
          return failure("invalidEdit", "ไม่รู้จักคำสั่งแก้ไข");
        }
        default:
          return failure("unknownCommand", "ไม่รู้จักคำสั่ง");
      }
    }
    function addSkill(w, spec) {
      const catalog = clone(w.catalog);
      D.registerSkill(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      const records = w.people.map((p) => H.createSkill(p.profile, spec));
      w.catalog = catalog;
      w.people.forEach((p, i) => {
        p.skills[spec.id] = records[i];
      });
      return spec.id;
    }
    function addRole(w, spec) {
      const catalog = clone(w.catalog);
      D.registerRole(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      return spec.id;
    }
    function addProduct(w, productSpec, materialSpecs = []) {
      const catalog = clone(w.catalog);
      if (!Array.isArray(materialSpecs))
        throw new TypeError("materialSpecs must be an array");
      for (const m of materialSpecs) D.registerMaterial(catalog, m);
      D.registerProduct(catalog, productSpec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      for (const m of materialSpecs) {
        const openQty = catalog.initialStock[m.id] || 0;
        w.inventory.materials[m.id] = openQty;
        w.inventory.opening[m.id] = openQty;
        w.inventory.reserved[m.id] = 0;
        w.inventory.purchased[m.id] = 0;
        w.inventory.consumed[m.id] = 0;
      }
      w.inventory.finished[productSpec.id] = 0;
      w.production.started[productSpec.id] = 0;
      w.production.completed[productSpec.id] = 0;
      w.production.scrapped[productSpec.id] = 0;
      w.production.shipped[productSpec.id] = 0;
      if (
        w.catalog.products[productSpec.id].researchRequired === 0 &&
        !w.research.unlocked.includes(productSpec.id)
      )
        w.research.unlocked.push(productSpec.id);
      return productSpec.id;
    }
    function addTaskKind(w, spec) {
      const catalog = clone(w.catalog);
      D.registerTaskKind(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      return spec.id;
    }
    function enqueueTask(w, kind, fields = {}) {
      const custom = own(w.catalog.taskKinds, kind);
      if (!custom)
        throw new TypeError("only registered external tasks may be enqueued");
      if (
        !fields ||
        typeof fields !== "object" ||
        Array.isArray(fields) ||
        Object.keys(fields).some((k) => k !== "required") ||
        (fields.required !== undefined && !int(fields.required, 5, 1440)) ||
        !Object.values(w.layout.stations).some(
          (s) => s.kind === custom.stationKind,
        )
      )
        throw new TypeError("invalid task fields or unavailable station");
      return job(w, kind, fields);
    }
    function audit(w) {
      const errors = [
        ...W.validate(w),
        ...P.validate(w),
        ...commercialAudit(w),
        ...E.auditFinance(w.finance),
        ...D.validateCatalog(w.catalog),
        ...L.validateLayout(w.layout),
      ];
      const reserved = Object.fromEntries(
          Object.keys(w.inventory.materials).map((k) => [k, 0]),
        ),
        finished = Object.fromEntries(
          Object.keys(w.catalog.products).map((k) => [k, 0]),
        ),
        inProcess = clone(finished);
      for (const u of Object.values(w.units)) {
        if (!w.orders[u.orderId] || !w.catalog.products[u.productId]) {
          errors.push("orphan unit");
          continue;
        }
        if (u.reserved)
          for (const [m, n] of Object.entries(
            w.catalog.products[u.productId].bom,
          ))
            reserved[m] += n;
        if (u.materialConsumed) inProcess[u.productId]++;
        if (u.stage === "ready") finished[u.productId]++;
      }
      for (const b of Object.values(w.plant?.refineryBatches || {})) {
        if (b.inputsReserved && !b.inputsConsumed && !["released", "cancelled", "scrapped"].includes(b.status)) {
          for (const [m, n] of Object.entries(b.inputs || {})) {
            if (Object.hasOwn(reserved, m)) reserved[m] += n;
          }
        }
      }
      errors.push(...warehouseAudit(w));
      for (const m of Object.keys(w.inventory.materials)) {
        const stock = w.inventory.materials[m];
        if (
          !int(stock) ||
          stock !==
            w.inventory.opening[m] +
              w.inventory.purchased[m] -
              w.inventory.consumed[m] ||
          reserved[m] !== w.inventory.reserved[m] ||
          reserved[m] > stock
        )
          errors.push("material conservation " + m);
        const consumed = Object.values(w.catalog.products).reduce(
          (n, p) => n + (p.bom[m] || 0) * w.production.started[p.id],
          0,
        );
        if (consumed + (w.knowledge?.materialsConsumed?.[m] || 0) + (w.plant?.partsConsumed?.[m] || 0) !== w.inventory.consumed[m])
          errors.push("material allocation " + m);
        const received = Object.values(w.purchases)
          .filter((p) => p.materialId === m && p.status === "received")
          .reduce((n, p) => n + p.quantity, 0);
        if (received !== w.inventory.purchased[m])
          errors.push("purchase reconciliation " + m);
      }
      for (const p of Object.keys(finished))
        if (
          w.inventory.finished[p] !== finished[p] ||
          w.production.completed[p] !== w.production.shipped[p] + finished[p] ||
          w.production.started[p] !==
            w.production.shipped[p] + w.production.scrapped[p] + inProcess[p]
        )
          errors.push("product conservation " + p);
      const personIds = new Set();
      for (const p of w.people) {
        if (personIds.has(p.id) || p.profile.id !== p.id)
          errors.push("duplicate/invalid person");
        personIds.add(p.id);
        errors.push(
          ...H.validateProfile(p.profile).map((e) => p.id + ": " + e),
        );
        if (
          p.taskId &&
          (!w.jobs[p.taskId] || w.jobs[p.taskId].assignee !== p.id)
        )
          errors.push("person task mismatch");
        for (const v of Object.values(p.state))
          if (!Number.isFinite(v) || v < 0 || v > 100)
            errors.push("invalid vital state");
        if (
          p.pay.totalEarned !== p.pay.totalPaid + p.pay.dueBase + p.pay.dueOT ||
          p.pay.wallet + p.pay.outsideSpending !== p.pay.totalPaid
        )
          errors.push("payroll reconciliation");
        for (const [k, s] of Object.entries(p.skills))
          if (
            !w.catalog.skills[k] ||
            !Number.isFinite(s.level) ||
            s.level < 0 ||
            s.level > H.skillCap(p.profile, w.catalog.skills[k]) ||
            !Number.isFinite(s.xp) ||
            s.xp < 0 ||
            s.xp > Number.MAX_SAFE_INTEGER ||
            !Number.isFinite(s.totalXp) ||
            s.totalXp < 0 ||
            s.totalXp > Number.MAX_SAFE_INTEGER
          )
            errors.push("invalid skill");
      }
      for (const s of Object.values(w.layout.stations)) {
        const activeWorkers = w.people.filter(
          (p) => p.employed && p.taskId && p.stationId === s.id,
        ).length;
        if (activeWorkers > s.capacity)
          errors.push("station capacity exceeded " + s.id);
      }
      const materialCosts = Object.values(w.purchases).reduce(
        (n, p) => n + p.cost,
        0,
      );
      if (materialCosts !== -w.finance.totals.materials)
        errors.push("purchase cash reconciliation");
      for (const invoice of Object.values(w.invoices)) {
        const receipts = w.finance.entries.filter(
          (t) => t.kind === "sales" && t.reference === invoice.id,
        );
        if (
          invoice.status === "paid"
            ? receipts.length !== 1 || receipts[0].delta !== invoice.amount
            : receipts.length !== 0
        )
          errors.push("invoice cash reconciliation");
      }
      const paid = w.people.reduce((n, p) => n + p.pay.totalPaid, 0);
      if (paid !== -w.finance.totals.wages - w.finance.totals.overtime)
        errors.push("wage cash reconciliation");
      for (const j of Object.values(w.jobs))
        if (
          (j.assignee &&
            !w.people.some(
              (p) => p.id === j.assignee && p.taskId === j.id && p.employed,
            )) ||
          (j.unitId && !w.units[j.unitId]) ||
          (j.orderId && !w.orders[j.orderId]) ||
          (j.purchaseId && !w.purchases[j.purchaseId]) ||
          !Number.isFinite(j.progress) ||
          j.progress < 0 ||
          j.progress > j.required
        )
          errors.push("invalid job reference/progress");
      return errors;
    }
    return Object.freeze({
      VERSION,
      RELEASE_VERSION,
      SCHEMA,
      TICK,
      MATERIAL_SUBJECTS, SUBJECTS, SUBJECT_DETAILS, SUBJECT_PREREQUISITES, SUBJECT_PREREQUISITE_LEVELS, researchDisciplines, subjectSpec, subjectTalent, subjectPotential, subjectPerformance, learnSubject, personalStudyTick,
      FACILITY_RULES,
      ensureKnowledge, productReadiness, materialReady, companyKnowledgeView, beginKnowledgeProject, reviewKnowledge, knowledgeWork, productRequirements, materialRequirements, teamCoverage, acquireTechnologyLicense, operationReadiness, OPERATIONS_SUBJECTS,
      create,
      step,
      advance,
      command,
      applyCommand: command,
      acceptOffer: (w, offerId) => command(w, { type: "acceptOffer", offerId }),
      candidates,
      evaluateAutonomousHiring,
      evaluatePromotions,
      evaluateBonuses,
      evaluateMachineMaintenance,
      evaluateSalesNegotiation,
      constructPlot,
      evaluatePlotConstruction,
      acquireExternalAsset,
      runMidstreamRefining,
      craftMaterialRecipe,
      plantCropPlot,
      careCropPlot,
      harvestCropPlot,
      saveSeedFromCrop,
      stepAgricultureAndResources,
      acquireFleetVehicle,
      maintainFleetVehicle,
      acceptFreightContract,
      advanceFreightContract,
      cancelFreightContract,
      startSoftwareProject,
      advanceSoftwareProject,
      updateSaasSubscription,
      matchBackhaulCargo,
      expireFoodBatch,
      triggerRmaClaim,
      resolveRmaClaim,
      triggerToolingChangeover,
      certifyBiomedLot,
      startServiceOrder,
      advanceServiceOrder,
      feedLivestockHerd,
      milkLivestockHerd,
      ensureWarehouse,
      reconcileWarehouseLots,
      warehouseAudit,
      renegotiateCommercialContract,
      terminateCommercialContract,
      cancelRefineryBatch: (w, batchId) => { const r = P.cancelRefineryBatch(w, batchId); reconcileWarehouseLots(w); return r; },
      surveyNewMineVein,
      treatMineralSlag,
      stepUtilitiesDaily,
      payUtilityBills,
      stepWorkplaceCultureDaily,
      evaluateTownhallAwards,
      evaluateEmployeeSpinoff,
      evaluateCompanyGrowthStage,
      getFleetUpfrontCost,
      reserveBoardBudget,
      consumeBoardReservation,
      cancelBoardReservation,
      computeFinancialPools,
      evaluateExecutiveBoardAndBusinessEntry,
      recomputeGeopoliticalMultipliers,
      changeForeignRegime,
      triggerGeopoliticalEvent,
      simulateGlobalGeopoliticsDaily,
      evaluateNewBusinessOperationsDaily,
      sellMaterialB2B,
      setCorporationRelation,
      simulateOffsiteEcosystemDaily,
      evaluateExternalAssetsDaily,
      getActiveExternalAssetBonuses,
      scaleCompany,
      commerceView: w=>w.commerce || null,
      evaluateCommercialSales,
      commercialAudit,
      warehouseCapacity,
      warehouseUsed,
      plantView: P.view,
      plantAudit: P.validate,
      productionView,
      productionSteps,
      planStockProduction,
      updateExternalWorld,
      worldAudit: W.validate,
      getDepartmentHeadroom,
      findSupervisorForRole,
      addSkill,
      addRole,
      addProduct,
      addTaskKind,
      enqueueTask,
      audit,
    });
  },
);
