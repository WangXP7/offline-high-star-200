(function attachScaCanonicalGameContent(globalScope) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const nested of Object.values(value)) deepFreeze(nested);
    return Object.freeze(value);
  }

  const MATCH_EVENTS = [
    { key: "spore", label: "孢子暴雨", desc: "食点刷新变快", duration: 30, foodTargetMult: 1.12, foodRateMult: 1.55, foodMassMult: 1.12, color: "#ffd166" },
    { key: "thorn", label: "刺球如林", desc: "刺球临时增多", duration: 32, virusBurst: 12, color: "#5eea80" },
    { key: "merge", label: "极速合球", desc: "重组时间缩短", duration: 26, mergeMult: 0.52, color: "#67e8f9" },
    { key: "eject", label: "极速喷射", desc: "吐球间隔缩短", duration: 24, ejectMult: 0.52, color: "#f472b6" },
    { key: "rich", label: "巨星星屑", desc: "高价值食点增加", duration: 30, foodMassMult: 1.45, foodRateMult: 1.12, richChanceAdd: 0.08, color: "#a78bfa" },
    { key: "magnet", label: "磁吸星尘", desc: "吃点范围扩大", duration: 24, eatReachMult: 1.52, foodRateMult: 1.1, color: "#44d7b6" },
    { key: "rush", label: "轻盈时间", desc: "全场移动加速", duration: 22, speedMult: 1.16, mergeMult: 0.82, color: "#7dd3fc" },
    { key: "harvest", label: "丰收潮汐", desc: "食点密度大幅提高", duration: 28, foodTargetMult: 1.28, foodRateMult: 1.85, foodMassMult: 1.08, color: "#9cff6e" },
    { key: "gravity", label: "引力乱流", desc: "吃点范围暴涨但移速略降", duration: 24, eatReachMult: 1.95, speedMult: 0.94, color: "#c084fc" },
    { key: "fracture", label: "裂变窗口", desc: "合体更快且移动微加速", duration: 22, mergeMult: 0.42, speedMult: 1.08, color: "#f0abfc" },
    { key: "thornstorm", label: "刺潮爆发", desc: "刺球增多且食点更肥", duration: 26, virusBurst: 18, foodMassMult: 1.24, richChanceAdd: 0.035, color: "#5eea80" },
    { key: "cometfall", label: "彗星坠落", desc: "高价值食点更常见", duration: 30, foodRateMult: 1.22, foodMassMult: 1.62, richChanceAdd: 0.12, color: "#ffd166" },
    { key: "royalfeast", label: "王冠盛宴", desc: "吃点范围和高价值食点提升", duration: 26, eatReachMult: 1.45, foodMassMult: 1.36, richChanceAdd: 0.07, color: "#facc15" },
    { key: "neonrush", label: "霓虹疾走", desc: "移动与吐球节奏加快", duration: 22, speedMult: 1.22, ejectMult: 0.68, color: "#22d3ee" },
    { key: "blackhole", label: "黑洞边界", desc: "吃点范围暴涨但移动变沉", duration: 22, eatReachMult: 2.25, speedMult: 0.88, color: "#a78bfa" },
    { key: "thornwave", label: "刺潮风暴", desc: "刺球持续涌入，适合炸刺翻盘", duration: 24, virusBurst: 20, foodMassMult: 1.16, richChanceAdd: 0.04, color: "#5eea80" },
    { key: "coretide", label: "星核潮汐", desc: "高价值资源大量出现", duration: 28, foodTargetMult: 1.16, foodRateMult: 1.45, foodMassMult: 1.85, richChanceAdd: 0.13, foodBurst: 90, burstMassMult: 2.8, color: "#67e8f9" },
    { key: "supplydrop", label: "星核空投", desc: "中心区域落下大颗资源", duration: 18, foodRateMult: 1.18, foodMassMult: 1.35, foodBurst: 70, burstMassMult: 3.4, color: "#f8fafc" },
    { key: "huntercall", label: "猎手号角", desc: "全场 AI 更敢追击和分身", duration: 24, speedMult: 1.08, aiAggroMult: 1.22, richChanceAdd: 0.04, color: "#ff7a90" },
    { key: "screenburst", label: "霸屏超频", desc: "快合和冲刺冷却缩短", duration: 24, speedMult: 1.08, mergeMult: 0.5, quickMergeCooldownMult: 0.55, skillCooldownMult: 0.58, color: "#67e8f9" },
    { key: "goldenfield", label: "金色矩阵", desc: "战场资源更密更肥", duration: 26, foodTargetMult: 1.3, foodRateMult: 1.8, foodMassMult: 1.35, richChanceAdd: 0.08, color: "#ffd166" },
    { key: "sporethorn", label: "孢子刺潮", desc: "孢子刺球出现，碰到会喷出一部分质量", duration: 24, sporeVirusBurst: 8, sporeVirusChanceAdd: 0.18, foodMassMult: 1.12, color: "#f472b6" },
    { key: "thornforge", label: "刺球工坊", desc: "战术刺球更频繁，适合围追反打", duration: 22, virusBurst: 10, skillCooldownMult: 0.62, richChanceAdd: 0.04, color: "#86efac" }
  ];

  const DEMON_TEMPLATES = [
    { name: "深渊魔王", color: "#7f1d1d", mass: 16500, skill: "summon", label: "深渊召唤" },
    { name: "赤焰魔王", color: "#ef4444", mass: 14500, skill: "flare", label: "赤焰喷发" },
    { name: "霜轮魔王", color: "#2563eb", mass: 15200, skill: "frost", label: "霜轮压制" },
    { name: "引力魔王", color: "#312e81", mass: 16000, skill: "gravity", label: "引力牵引" },
    { name: "饕餮魔王", color: "#92400e", mass: 17800, skill: "drain", label: "饕餮吞息" },
    { name: "巨神魔王", color: "#111827", mass: 36000, skill: "titan", label: "巨神碾压" }
  ];

  globalScope.ScaCanonicalGameContent = deepFreeze({
    schemaVersion: 1,
    MATCH_EVENTS,
    DEMON_TEMPLATES
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
