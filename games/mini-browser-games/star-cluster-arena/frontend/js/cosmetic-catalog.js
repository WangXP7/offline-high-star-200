(function attachScaCosmeticCatalog(globalScope) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const nested of Object.values(value)) deepFreeze(nested);
    return Object.freeze(value);
  }

  const SKINS = [
    { key: "aqua", name: "青荧", color: "#44d7b6", type: "basic" },
    { key: "solar", name: "日冕", color: "#ffd166", type: "basic" },
    { key: "rose", name: "绯星", color: "#ff7a90", type: "basic" },
    { key: "violet", name: "紫晶", color: "#a78bfa", type: "basic" },
    { key: "frost", name: "霜蓝", color: "#67e8f9", type: "basic" },
    { key: "ember", name: "熔火", color: "#f59e0b", type: "basic" },
    { key: "jade", name: "玉环", color: "#34d399", type: "basic" },
    { key: "void", name: "幽紫", color: "#8b5cf6", type: "basic" },
    { key: "nova", name: "绯光", color: "#fb7185", type: "basic" },
    { key: "comet", name: "彗星航线", color: "#3b82f6", accent: "#f8fafc", type: "special", pattern: "comet", tier: "common", rarity: "普通" },
    { key: "mecha", name: "机甲星环", color: "#64748b", accent: "#67e8f9", type: "special", pattern: "mecha", tier: "common", rarity: "普通" },
    { key: "tide", name: "潮汐之心", color: "#0f766e", accent: "#5eead4", type: "special", pattern: "tide", tier: "rare", rarity: "稀有" },
    { key: "flare", name: "赤焰风暴", color: "#ef4444", accent: "#ffd166", type: "special", pattern: "flare", tier: "epic", rarity: "史诗" },
    { key: "crown", name: "王冠星域", color: "#7c3aed", accent: "#ffd166", type: "special", pattern: "crown", tier: "epic", rarity: "史诗" },
    { key: "pixel", name: "像素矩阵", color: "#0f172a", accent: "#58edc8", type: "special", pattern: "mecha", tier: "rare", rarity: "稀有" },
    { key: "lotus", name: "莲华星盘", color: "#be185d", accent: "#f9a8d4", type: "special", pattern: "crown", tier: "epic", rarity: "史诗" },
    { key: "prism", name: "棱镜幻面", color: "#2563eb", accent: "#f0abfc", type: "special", pattern: "comet", tier: "epic", rarity: "史诗" },
    { key: "honeycomb", name: "蜂巢矩阵", color: "#92400e", accent: "#fde68a", type: "special", pattern: "mecha", tier: "rare", rarity: "稀有" },
    { key: "thunder", name: "雷霆球核", color: "#4338ca", accent: "#fef08a", type: "special", pattern: "flare", tier: "epic", rarity: "史诗" },
    { key: "ocean", name: "深海潮核", color: "#0e7490", accent: "#a7f3d0", type: "special", pattern: "tide", tier: "rare", rarity: "稀有" },
    { key: "celestial", name: "天穹星眼", color: "#1e1b4b", accent: "#e0e7ff", type: "special", pattern: "abyss", tier: "legendary", rarity: "传说" },
    { key: "abyss", name: "深渊脉冲", color: "#111827", accent: "#a78bfa", type: "special", pattern: "abyss", tier: "legendary", rarity: "传说" },
    { key: "dragon", name: "龙焰天幕", color: "#7f1d1d", accent: "#facc15", type: "special", pattern: "flare", tier: "legendary", rarity: "传说" },
    { key: "neon-grid", name: "霓虹棋盘", color: "#111827", accent: "#22d3ee", type: "special", pattern: "mecha", tier: "rare", rarity: "稀有" },
    { key: "phoenix", name: "凤焰星羽", color: "#b91c1c", accent: "#fde68a", type: "special", pattern: "flare", tier: "epic", rarity: "史诗" },
    { key: "glacier", name: "冰川晶冠", color: "#0e7490", accent: "#e0f2fe", type: "special", pattern: "tide", tier: "epic", rarity: "史诗" },
    { key: "sakura-moon", name: "樱月绮面", color: "#9d174d", accent: "#fbcfe8", type: "special", pattern: "crown", tier: "rare", rarity: "稀有" },
    { key: "cosmic-koi", name: "星河锦鲤", color: "#0f766e", accent: "#fef08a", type: "special", pattern: "tide", tier: "legendary", rarity: "传说" },
    { key: "storm-eye", name: "风暴之眼", color: "#1d4ed8", accent: "#bae6fd", type: "special", pattern: "abyss", tier: "legendary", rarity: "传说" },
    { key: "candy-pop", name: "糖果爆弹", color: "#db2777", accent: "#fef3c7", type: "special", pattern: "comet", tier: "common", rarity: "普通" },
    { key: "jade-dragon", name: "青玉龙鳞", color: "#047857", accent: "#bbf7d0", type: "special", pattern: "mecha", tier: "epic", rarity: "史诗" },
    { key: "zero-code", name: "零号代码", color: "#020617", accent: "#58edc8", type: "special", pattern: "mecha", tier: "legendary", rarity: "传说" },
    { key: "sunset", name: "落霞星幕", color: "#c2410c", accent: "#fed7aa", type: "special", pattern: "flare", tier: "rare", rarity: "稀有" },
    { key: "spore-nebula", name: "孢子星云", color: "#be185d", accent: "#fdf2f8", type: "special", pattern: "comet", tier: "epic", rarity: "史诗" },
    { key: "blitz-crown", name: "闪电王冠", color: "#1e3a8a", accent: "#fde047", type: "special", pattern: "crown", tier: "legendary", rarity: "传说" }
  ];

  const SPORES = [
    { key: "mint", name: "薄荷孢子", color: "#7dd3fc", type: "basic" },
    { key: "gold", name: "金糖孢子", color: "#ffd166", type: "basic" },
    { key: "pink", name: "桃雾孢子", color: "#f472b6", type: "basic" },
    { key: "lime", name: "青芽孢子", color: "#9cff6e", type: "basic" },
    { key: "ash", name: "银尘孢子", color: "#d7e1ea", type: "basic" },
    { key: "hot", name: "焰点孢子", color: "#ff7a5c", type: "basic" },
    { key: "star", name: "星砂孢子", color: "#c084fc", type: "basic" },
    { key: "wave", name: "潮光孢子", color: "#22d3ee", type: "basic" },
    { key: "cinder", name: "余烬孢子", color: "#fb923c", type: "basic" },
    { key: "meteor", name: "流星尾焰", color: "#fb923c", accent: "#fff7ed", type: "special", pattern: "meteor", tier: "common", rarity: "普通" },
    { key: "bubble", name: "水晶泡泡", color: "#38bdf8", accent: "#e0f2fe", type: "special", pattern: "bubble", tier: "common", rarity: "普通" },
    { key: "spark", name: "电弧火花", color: "#a78bfa", accent: "#fef08a", type: "special", pattern: "spark", tier: "rare", rarity: "稀有" },
    { key: "vine", name: "藤蔓星种", color: "#34d399", accent: "#dcfce7", type: "special", pattern: "vine", tier: "epic", rarity: "史诗" },
    { key: "aurora", name: "极光羽片", color: "#22d3ee", accent: "#f0abfc", type: "special", pattern: "aurora", tier: "epic", rarity: "史诗" },
    { key: "pearl", name: "珍珠泡影", color: "#e0f2fe", accent: "#38bdf8", type: "special", pattern: "bubble", tier: "rare", rarity: "稀有" },
    { key: "rune", name: "符文星屑", color: "#c084fc", accent: "#fef3c7", type: "special", pattern: "spark", tier: "epic", rarity: "史诗" },
    { key: "candy", name: "糖星碎粒", color: "#fb7185", accent: "#fef3c7", type: "special", pattern: "bubble", tier: "common", rarity: "普通" },
    { key: "snowflake", name: "雪晶孢子", color: "#bae6fd", accent: "#ffffff", type: "special", pattern: "spark", tier: "rare", rarity: "稀有" },
    { key: "gear-spore", name: "齿轮孢子", color: "#94a3b8", accent: "#67e8f9", type: "special", pattern: "royal", tier: "epic", rarity: "史诗" },
    { key: "dragon-ash", name: "龙烬孢子", color: "#f97316", accent: "#fef08a", type: "special", pattern: "meteor", tier: "legendary", rarity: "传说" },
    { key: "royal", name: "王冠碎金", color: "#facc15", accent: "#ffffff", type: "special", pattern: "royal", tier: "legendary", rarity: "传说" },
    { key: "void-spore", name: "虚空碎片", color: "#312e81", accent: "#e0e7ff", type: "special", pattern: "meteor", tier: "legendary", rarity: "传说" },
    { key: "firework", name: "烟火碎星", color: "#f97316", accent: "#fff7ed", type: "special", pattern: "spark", tier: "rare", rarity: "稀有" },
    { key: "lotus-seed", name: "莲心星种", color: "#f472b6", accent: "#fdf2f8", type: "special", pattern: "vine", tier: "rare", rarity: "稀有" },
    { key: "quartz", name: "石英泡影", color: "#e0f2fe", accent: "#a78bfa", type: "special", pattern: "bubble", tier: "common", rarity: "普通" },
    { key: "phoenix-ash", name: "凤焰灰烬", color: "#ef4444", accent: "#fde68a", type: "special", pattern: "meteor", tier: "epic", rarity: "史诗" },
    { key: "neon-bit", name: "霓虹字节", color: "#22d3ee", accent: "#58edc8", type: "special", pattern: "spark", tier: "epic", rarity: "史诗" },
    { key: "storm-pearl", name: "风暴珍珠", color: "#2563eb", accent: "#fef08a", type: "special", pattern: "royal", tier: "legendary", rarity: "传说" },
    { key: "koi-scale", name: "锦鲤鳞片", color: "#fb923c", accent: "#bbf7d0", type: "special", pattern: "bubble", tier: "epic", rarity: "史诗" },
    { key: "blackhole-dust", name: "黑洞星砂", color: "#020617", accent: "#c084fc", type: "special", pattern: "meteor", tier: "legendary", rarity: "传说" },
    { key: "spore-burst", name: "孢子爆花", color: "#f472b6", accent: "#ffffff", type: "special", pattern: "spark", tier: "epic", rarity: "史诗" }
  ];

  const HALOS = [
    { key: "none", name: "无光环", color: "#94a3b8", type: "basic" },
    { key: "orbit", name: "星轨光环", color: "#38bdf8", accent: "#e0f2fe", type: "special", pattern: "orbit", tier: "common", rarity: "普通" },
    { key: "frost-ring", name: "霜轮光环", color: "#67e8f9", accent: "#ffffff", type: "special", pattern: "frost", tier: "common", rarity: "普通" },
    { key: "pulse-ring", name: "磁暴光环", color: "#a78bfa", accent: "#fef08a", type: "special", pattern: "pulse", tier: "rare", rarity: "稀有" },
    { key: "sun-crown", name: "日冕光环", color: "#fb923c", accent: "#fff7ed", type: "special", pattern: "sun", tier: "epic", rarity: "史诗" },
    { key: "halo-crown", name: "王冠光环", color: "#ffd166", accent: "#ffffff", type: "special", pattern: "crown", tier: "epic", rarity: "史诗" },
    { key: "nebula-ring", name: "星云光环", color: "#db2777", accent: "#f0abfc", type: "special", pattern: "pulse", tier: "rare", rarity: "稀有" },
    { key: "lotus-ring", name: "莲华光环", color: "#be185d", accent: "#f9a8d4", type: "special", pattern: "crown", tier: "epic", rarity: "史诗" },
    { key: "chrono-ring", name: "时轮光环", color: "#0f766e", accent: "#99f6e4", type: "special", pattern: "orbit", tier: "rare", rarity: "稀有" },
    { key: "gear-ring", name: "齿轮光环", color: "#475569", accent: "#67e8f9", type: "special", pattern: "frost", tier: "epic", rarity: "史诗" },
    { key: "thunder-ring", name: "雷纹光环", color: "#4338ca", accent: "#fef08a", type: "special", pattern: "pulse", tier: "epic", rarity: "史诗" },
    { key: "gravity", name: "引力黑环", color: "#111827", accent: "#c084fc", type: "special", pattern: "gravity", tier: "legendary", rarity: "传说" },
    { key: "void-gate", name: "虚空门环", color: "#020617", accent: "#818cf8", type: "special", pattern: "gravity", tier: "legendary", rarity: "传说" },
    { key: "phoenix-ring", name: "凤焰光环", color: "#ef4444", accent: "#fde68a", type: "special", pattern: "sun", tier: "epic", rarity: "史诗" },
    { key: "koi-ring", name: "锦鲤游环", color: "#0f766e", accent: "#facc15", type: "special", pattern: "orbit", tier: "rare", rarity: "稀有" },
    { key: "mirror-ring", name: "镜月光环", color: "#64748b", accent: "#e0f2fe", type: "special", pattern: "frost", tier: "rare", rarity: "稀有" },
    { key: "neon-ring", name: "霓虹电环", color: "#22d3ee", accent: "#58edc8", type: "special", pattern: "pulse", tier: "epic", rarity: "史诗" },
    { key: "lotus-crown", name: "莲华冠环", color: "#be185d", accent: "#fdf2f8", type: "special", pattern: "crown", tier: "legendary", rarity: "传说" },
    { key: "storm-ring", name: "风眼光环", color: "#1d4ed8", accent: "#bae6fd", type: "special", pattern: "gravity", tier: "legendary", rarity: "传说" },
    { key: "candy-ring", name: "糖霜光环", color: "#fb7185", accent: "#fef3c7", type: "special", pattern: "pulse", tier: "common", rarity: "普通" },
    { key: "jade-ring", name: "青玉光环", color: "#047857", accent: "#bbf7d0", type: "special", pattern: "orbit", tier: "epic", rarity: "史诗" },
    { key: "blitz-ring", name: "制霸电冕", color: "#2563eb", accent: "#fde047", type: "special", pattern: "crown", tier: "legendary", rarity: "传说" }
  ];

  const TRAILS = [
    { key: "none", name: "无拖尾", color: "#94a3b8", type: "basic" },
    { key: "stardust", name: "星尘尾迹", color: "#7dd3fc", accent: "#f8fafc", type: "special", pattern: "dots", tier: "common", rarity: "普通" },
    { key: "sakura", name: "樱粉尾迹", color: "#f472b6", accent: "#fff1f2", type: "special", pattern: "petals", tier: "common", rarity: "普通" },
    { key: "bubble-trail", name: "泡泡航迹", color: "#38bdf8", accent: "#e0f2fe", type: "special", pattern: "bubbles", tier: "rare", rarity: "稀有" },
    { key: "arc", name: "电弧残影", color: "#a78bfa", accent: "#fef08a", type: "special", pattern: "arc", tier: "rare", rarity: "稀有" },
    { key: "flame-trail", name: "火焰航迹", color: "#f97316", accent: "#fef3c7", type: "special", pattern: "flame", tier: "epic", rarity: "史诗" },
    { key: "aurora-trail", name: "极光缎带", color: "#22d3ee", accent: "#f0abfc", type: "special", pattern: "ribbon", tier: "epic", rarity: "史诗" },
    { key: "data-trail", name: "数据残影", color: "#58edc8", accent: "#0f172a", type: "special", pattern: "squares", tier: "epic", rarity: "史诗" },
    { key: "ink-trail", name: "水墨流痕", color: "#0f172a", accent: "#e5e7eb", type: "special", pattern: "ribbon", tier: "rare", rarity: "稀有" },
    { key: "snow-trail", name: "雪雾拖尾", color: "#bae6fd", accent: "#ffffff", type: "special", pattern: "bubbles", tier: "common", rarity: "普通" },
    { key: "crown-trail", name: "碎金王迹", color: "#facc15", accent: "#ffffff", type: "special", pattern: "dots", tier: "epic", rarity: "史诗" },
    { key: "demon-trail", name: "魔焰裂痕", color: "#7f1d1d", accent: "#f97316", type: "special", pattern: "rift", tier: "legendary", rarity: "传说" },
    { key: "rift-trail", name: "裂隙拖影", color: "#111827", accent: "#c084fc", type: "special", pattern: "rift", tier: "legendary", rarity: "传说" },
    { key: "phoenix-trail", name: "凤焰长羽", color: "#ef4444", accent: "#fde68a", type: "special", pattern: "flame", tier: "epic", rarity: "史诗" },
    { key: "koi-trail", name: "锦鲤水痕", color: "#0f766e", accent: "#facc15", type: "special", pattern: "bubbles", tier: "rare", rarity: "稀有" },
    { key: "mirror-trail", name: "镜月残光", color: "#94a3b8", accent: "#e0f2fe", type: "special", pattern: "arc", tier: "rare", rarity: "稀有" },
    { key: "neon-trail", name: "霓虹脉线", color: "#22d3ee", accent: "#58edc8", type: "special", pattern: "squares", tier: "epic", rarity: "史诗" },
    { key: "lotus-trail", name: "莲华花路", color: "#be185d", accent: "#fdf2f8", type: "special", pattern: "petals", tier: "epic", rarity: "史诗" },
    { key: "storm-trail", name: "风暴电尾", color: "#1d4ed8", accent: "#bae6fd", type: "special", pattern: "arc", tier: "legendary", rarity: "传说" },
    { key: "candy-trail", name: "糖霜泡带", color: "#fb7185", accent: "#fef3c7", type: "special", pattern: "dots", tier: "common", rarity: "普通" },
    { key: "blackhole-trail", name: "黑洞拖影", color: "#020617", accent: "#c084fc", type: "special", pattern: "rift", tier: "legendary", rarity: "传说" },
    { key: "spore-trail", name: "孢子流萤", color: "#be185d", accent: "#fdf2f8", type: "special", pattern: "bubbles", tier: "epic", rarity: "史诗" }
  ];

  const collections = deepFreeze({ skin: SKINS, spore: SPORES, halo: HALOS, trail: TRAILS });
  const defaults = deepFreeze({ skin: "aqua", spore: "mint", halo: "none", trail: "none" });
  const indexes = Object.fromEntries(Object.entries(collections).map(([type, values]) => [type, new Map(values.map(value => [value.key, value]))]));

  function definition(type, key) {
    return indexes[type]?.get(String(key || "")) || indexes[type]?.get(defaults[type]) || null;
  }

  function normalizeProfile(value = {}) {
    return Object.freeze(Object.fromEntries(Object.keys(defaults).map(type => [type, definition(type, value?.[type])?.key || defaults[type]])));
  }

  globalScope.ScaCosmeticCatalog = Object.freeze({
    schemaVersion: 1,
    SKINS: collections.skin,
    SPORES: collections.spore,
    HALOS: collections.halo,
    TRAILS: collections.trail,
    defaults,
    definition,
    normalizeProfile
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
