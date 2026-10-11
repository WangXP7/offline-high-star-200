/* 离线小游戏合集 · 通用中文化层
 * 由 server.py 注入到每款游戏页面：
 *  - 悬浮 中/EN 开关（按游戏记忆），默认跟随主页语言选择
 *  - 覆盖 DOM 文本、Canvas fillText/strokeText、title/placeholder/value/alt
 *  - 关闭开关 = 原版英文，零副作用
 */
(function () {
  if (window.__ZH_I18N__) return;
  window.__ZH_I18N__ = true;

  var GAME_KEY = (location.pathname.split("/").filter(Boolean)[0] || "root");
  var LS = "i18n_zh__" + GAME_KEY;

  /* ---------- 词典：整句优先，长短语在前 ---------- */
  var DICT = {
    // 名句 / 整句
    "join the numbers and get to the 2048 tile!": "滑动合并相同数字，拼出 2048！",
    "join the numbers and get to the 2048 tile": "滑动合并相同数字，拼出 2048！",
    "press space to start": "按空格键开始",
    "press space or tap to start": "按空格或点击开始",
    "press enter to start": "按回车键开始",
    "press any key to start": "按任意键开始",
    "click to start": "点击开始",
    "tap to start": "点击开始",
    "tap to play": "点击开始",
    "click to play": "点击开始",
    "how to play": "玩法说明",
    "game over": "游戏结束",
    "you win": "你赢了",
    "you lose": "你输了",
    "new game": "新游戏",
    "new score": "新纪录！",
    "high score": "最高分",
    "top score": "最高分",
    "insert coin": "请投币",
    "player 1": "玩家 1",
    "player 2": "玩家 2",
    "1 player": "单人游戏",
    "2 players": "双人游戏",
    "3 players": "三人游戏",
    "4 players": "四人游戏",
    "press 1 to start": "按 1 开始",
    "score:": "得分：",
    "time:": "时间：",
    "level:": "关卡：",
    "lives:": "生命：",
    // 高频词（短）
    "score": "得分", "best": "最佳", "start": "开始", "play": "开始游戏",
    "pause": "暂停", "resume": "继续", "restart": "重新开始", "replay": "再玩一次",
    "continue": "继续", "settings": "设置", "options": "选项", "help": "帮助",
    "about": "关于", "menu": "菜单", "home": "主页", "quit": "退出", "exit": "退出",
    "sound": "音效", "music": "音乐", "mute": "静音", "sfx": "音效",
    "level": "关卡", "round": "回合", "stage": "关卡", "time": "时间", "lives": "生命",
    "moves": "步数", "points": "得分", "next": "下一关", "back": "返回", "close": "关闭",
    "ok": "确定", "cancel": "取消", "yes": "是", "no": "否", "on": "开", "off": "关",
    "save": "保存", "load": "读取", "easy": "简单", "medium": "中等", "normal": "普通",
    "hard": "困难", "expert": "专家", "win": "胜利", "lose": "失败", "ready": "准备",
    "go": "开始", "controls": "操作", "instructions": "操作说明", "credits": "制作人员",
    "more": "更多", "share": "分享", "download": "下载", "fullscreen": "全屏",
    "player": "玩家", "enemy": "敌人", "speed": "速度", "volume": "音量",
    "difficulty": "难度", "language": "语言", "version": "版本", "loading": "加载中…",
    "new": "新纪录", "over": "结束", "tap": "点击", "swipe": "滑动", "zoom": "缩放",
    "width": "宽度", "height": "高度", "mines": "雷数", "flags": "旗子",
    "words found": "已找到单词", "time left": "剩余时间", "line": "行", "lines": "行数",
    "deal": "发牌", "bet": "下注", "double down": "加倍", "split": "分牌",
    "stand": "停牌", "hit": "要牌", "your hand": "你的手牌", "dealer": "庄家",
    "new game?": "再来一局？", "again": "再来一次", "skip": "跳过", "reset": "重置",
    "submit": "提交", "name": "名字", "rules": "规则", "guide": "指南", "tips": "提示",
    "top": "最高", "free": "免费", "gift": "礼物", "spin": "转动", "jackpot": "头奖",
    "autoplay": "自动", "candidates": "候选数", "analyze": "分析", "solve": "求解",
    "undo": "撤销", "redo": "重做", "hint": "提示", "check": "检查", "clear": "清除",
    "endless": "无尽模式", "timed": "限时模式", "practice": "练习", "daily": "每日挑战",
    "join the numbers and get to the": "滑动合并相同数字，拼出",
    "tile!": "块！", "keep playing": "继续游戏", "try again": "再试一次",
    "game over!": "游戏结束！", "you got to": "你拼到了"
  };
  var KEYS = Object.keys(DICT).sort(function (a, b) { return b.length - a.length; });

  /* ---------- 每游戏扩展词典（可选） ---------- */
  var EXTRA = {};
  // 游戏 root 相对前缀（兼容 GitHub Pages 子路径部署）
  function gamesRelPrefix() {
    var segs = location.pathname.split("/").filter(Boolean);
    var i = segs.indexOf(GAME_KEY);
    if (i === -1) return "../";
    return "../".repeat(segs.length - i); // 从 slug 段回退到 games 根
  }
  var REL = gamesRelPrefix();
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", REL + "__i18n/" + GAME_KEY + ".json", false); // 同步一次，量小
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try { var j = JSON.parse(xhr.responseText); for (var k in j) EXTRA[k.toLowerCase()] = j[k]; } catch (e) {}
      }
    };
    xhr.send();
  } catch (e) {}
  var ALL_KEYS = KEYS.concat(Object.keys(EXTRA)).sort(function (a, b) { return b.length - a.length; });
  function lookup(s) {
    var k = s.trim().toLowerCase().replace(/\s+/g, " ");
    if (EXTRA[k] !== undefined) return EXTRA[k];
    if (DICT[k] !== undefined) return DICT[k];
    return null;
  }
  function translateText(s) {
    if (!s || !zhOn) return s;
    var hit = lookup(s);
    if (hit !== null) return hit;
    // 长句内嵌替换（保留前后缀）
    var out = s, low = s.toLowerCase();
    for (var i = 0; i < ALL_KEYS.length; i++) {
      var key = ALL_KEYS[i];
      if (key.length < 3) continue;
      var idx = low.indexOf(key);
      if (idx === -1) continue;
      var zh = EXTRA[key] !== undefined ? EXTRA[key] : DICT[key];
      out = out.slice(0, idx) + zh + out.slice(idx + key.length);
      low = out.toLowerCase();
    }
    return out !== s ? out : s;
  }

  // 原生弹窗翻译（alert/confirm/prompt）
  (function () {
    var DIALOG = {
      "no cameras found! make sure your webcam is plugged in and enabled!":
        "未检测到摄像头！请插入并启用摄像头后再试。 | No cameras found — plug in / enable a webcam and retry.",
      "camera permission denied, please refresh and allow camera capture!":
        "摄像头权限被拒绝！请刷新页面并允许摄像头。 | Camera permission denied — refresh and allow camera.",
      "unspecified camera error! make sure camera permissions are enabled!":
        "摄像头启动失败！请检查摄像头权限设置。 | Unspecified camera error — check permissions."
    };
    function t(s) {
      if (typeof s !== "string") return s;
      var k = s.trim().toLowerCase();
      if (DIALOG[k]) return DIALOG[k];
      var low = s.toLowerCase(), out = s;
      for (var key in DICT) {
        if (key.length < 4) continue;
        var idx = low.indexOf(key);
        if (idx !== -1) { out = out.slice(0, idx) + DICT[key] + out.slice(idx + key.length); low = out.toLowerCase(); }
      }
      return out;
    }
    if (!window.__zhAlertHooked) {
      window.__zhAlertHooked = true;
      var oa = window.alert, oc = window.confirm, op = window.prompt;
      window.alert = function (m) { oa(t(m)); };
      window.confirm = function (m) { return oc(t(m)); };
      window.prompt = function (m, v) { return op(t(m), v); };
    }
  })();

  /* ---------- 开关状态 ---------- */
  var zhOn = false;
  try {
    var saved = localStorage.getItem(LS);
    if (saved !== null) zhOn = saved === "1";
    else zhOn = (localStorage.getItem("games_lang") !== "en"); // 默认跟随主页
  } catch (e) { zhOn = true; }

  /* ---------- DOM 翻译 ---------- */
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, IFRAME: 1, CODE: 1, PRE: 1, TEXTAREA: 1 };
  function walk(root) {
    if (!zhOn) return;
    var tw = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null, false);
    var n, batch = [];
    while ((n = tw.nextNode())) {
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      var p = n.parentElement;
      if (!p || SKIP[p.tagName]) continue;
      batch.push(n);
    }
    batch.forEach(function (n) {
      var t = translateText(n.nodeValue);
      if (t !== n.nodeValue) n.nodeValue = t;
    });
    // 属性
    var els = (root || document.body || document).querySelectorAll("[title],[placeholder],[alt],[value],[aria-label]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      ["title", "placeholder", "alt", "aria-label"].forEach(function (a) {
        var v = el.getAttribute && el.getAttribute(a);
        if (v) { var t2 = translateText(v); if (t2 !== v) el.setAttribute(a, t2); }
      });
      if (el.tagName === "INPUT" && el.type === "submit" && el.value) {
        var t3 = translateText(el.value); if (t3 !== el.value) el.value = t3;
      }
    }
    if (document.title) document.title = translateText(document.title);
  }

  /* ---------- Canvas 绘制文字翻译 ---------- */
  function patchCanvas(cv) {
    if (cv.__zh_patched) return;
    cv.__zh_patched = true;
    var ctx;
    try { ctx = cv.getContext("2d"); } catch (e) { return; }
    if (!ctx) return;
    ["fillText", "strokeText"].forEach(function (m) {
      var orig = ctx[m];
      if (!orig) return;
      ctx[m] = function (text, x, y) {
        var args = Array.prototype.slice.call(arguments);
        if (zhOn && typeof text === "string") args[0] = translateText(text);
        return orig.apply(this, args);
      };
    });
  }
  function patchAllCanvases() {
    var list = document.querySelectorAll("canvas");
    for (var i = 0; i < list.length; i++) patchCanvas(list[i]);
  }
  // 拦截未来创建的 canvas
  var OrigCreate = document.createElement.bind(document);
  document.createElement = function (tag) {
    var el = OrigCreate.apply(null, arguments);
    if (String(tag).toLowerCase() === "canvas") {
      setTimeout(function () { patchCanvas(el); }, 0);
    }
    return el;
  };

  /* ---------- 按游戏注入 CSS（翻译伪元素文字） ---------- */
  var GAME_CSS = {
    "2048": ".score-container:after{content:'得分'!important}.best-container:after{content:'最佳'!important}",
    "hexgl": "", "kurve": ""
  };
  function injectGameCSS() {
    var css = GAME_CSS[GAME_KEY];
    if (!css || !zhOn) return;
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- SVG <text> 同样覆盖（TreeWalker 已覆盖 DOM 文本） ---------- */

  /* ---------- Pages 子路径适配：注册改写型 Service Worker ---------- */
  (function () {
    if (location.protocol !== "http:" && location.protocol !== "https:") return;
    if (!navigator.serviceWorker) return;
    var segs = location.pathname.split("/").filter(Boolean);
    var i = segs.indexOf(GAME_KEY);
    if (i === -1) return;                      // 本地根路径部署无需 SW
    var sub = "/" + segs.slice(0, i + 1).join("/") + "/";  // 例如 /offline-high-star-200/<slug>/
    if (location.pathname.indexOf(sub) !== 0) return;      // 已在子路径内则无需改写? 仍注册以防绝对引用
    var swUrl = "../".repeat(segs.length - i - 1) + "sw.js";
    try { navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(function () {}); } catch (e) {}
  })();

  /* ---------- 开关按钮 ---------- */
  function buildButton() {
    var b = document.createElement("div");
    b.id = "zh-i18n-toggle";
    b.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483647;" +
      "background:rgba(13,17,23,.88);color:#e6edf3;border:1px solid #58a6ff;border-radius:999px;" +
      "padding:7px 14px;font:600 13px 'Segoe UI','Microsoft YaHei',sans-serif;cursor:pointer;" +
      "box-shadow:0 2px 10px rgba(0,0,0,.45);user-select:none;opacity:.85";
    b.textContent = zhOn ? "中文 ✓ | EN" : "中 | EN ✓";
    b.title = "切换游戏界面语言 / Switch UI language";
    b.onclick = function () {
      zhOn = !zhOn;
      try { localStorage.setItem(LS, zhOn ? "1" : "0"); } catch (e) {}
      b.textContent = zhOn ? "中文 ✓ | EN" : "中 | EN ✓";
      if (zhOn) { walk(document.body || document); patchAllCanvases(); }
      else { location.reload(); }
    };
    document.body.appendChild(b);
  }

  function init() {
    if (!document.body) { setTimeout(init, 60); return; }
    buildButton();
    if (zhOn) {
      walk(document.body || document);
      patchAllCanvases();
      injectGameCSS();
    }
    // 动态内容监听
    var mo = new MutationObserver(function (muts) {
      if (!zhOn) return;
      muts.forEach(function (m) {
        if (m.type === "childList") {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType === 1) { patchCanvas(n); walk(n); }
            else if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) {
              var t = translateText(n.nodeValue);
              if (t !== n.nodeValue) n.nodeValue = t;
            }
          });
        } else if (m.type === "characterData" && m.target.nodeValue) {
          var t2 = translateText(m.target.nodeValue);
          if (t2 !== m.target.nodeValue) m.target.nodeValue = t2;
        }
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
