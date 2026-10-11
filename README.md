# 🎮 离线小游戏合集 · GitHub 高星精选 200

> **中文** ｜ [English](README_EN.md)

> 3652 个候选仓库 → 8 维度评分 → **四轮论证** → **200 款全部下载到本地、可离线游玩**
> 累计 GitHub Stars：**173,382+** ｜ 本地总体积：**约 3.9 GB** ｜ 品类：**43 个**

---

## 🌐 在线版

**本仓库即在线版**（GitHub Pages）：<https://wangxp7.github.io/offline-high-star-200/>

在线版收录 **194 款**（含中英文切换与游戏内中文化层）。另有 6 项体积特大内容为**本地版专属**：
GameZone 700合1（2.4GB）、锦鲤园 Koi Farm（130MB）、TapTapTap（54MB）、Zero Volt X（55MB）、RxJS Fruits（74MB）、HTML5 游戏书（45MB）——下载仓库完整版或按上文本地方式获取全部 200 款。个别游戏若在线加载异常，本地运行体验最完整。

## 🚀 怎么玩（30 秒上手·本地版）

1. **双击 `启动合集.bat`**（Windows）——它会启动本地服务器并自动打开浏览器
2. 或手动运行：`python server.py`，然后浏览器访问 <http://127.0.0.1:8137>
3. 在导航主页点击任意游戏卡片上的 **「▶ 开始游戏」** 即可；右上角可切换 **中文 / EN**

> ⚠️ 必须通过本地服务器游玩，**不要直接双击 index.html**（file:// 协议下部分游戏无法加载资源）。
> Git Bash / Linux / macOS 用户可运行 `bash start.sh`。

---

## 📦 合集内容（200 款速览）

| 类别 | 代表游戏 |
|---|---|
| 打字/猜词 | Qwerty 打字背单词(23.3k★)、Wordle+、Word Master、成语 Wordle、Kotobade(日)、Letreco(葡)、Globle 地理猜国、32重Wordle 等 8 款 |
| 经典街机 | 吃豆人×4 版本、恐龙快跑×2、超级马里奥JS、波斯王子、Lode Runner、冰封高塔、Blastar 等 |
| 射击/动作 | 坦克大战×2 版本、太空侵略者×3、小行星、打鸭子系、Space Huggers、Ironhold FPS、Gauntlet、以撒网页版 等 20+ |
| 方块/三消 | 俄罗斯方块×7 变体、Hextris、Candy Crush、泡泡龙、连连看 等 |
| 棋类桌游 | 五子棋×2、中国象棋×2、国际象棋、四子棋×2、大富翁、红心大战、二十一点、轮盘、台球、乌尔王室棋、蜘蛛纸牌等 |
| 3D 游戏 | HexGL 竞速、公路赛车、迷宫滚球×2、3D 魔方、像素无双、网页版我的世界 等 15+ |
| 沙盒/模拟 | 落沙沙盒×2、粒子生命×2、模拟城市、等距城市、锦鲤园 等 |
| 放置/肉鸽 | 小黑屋(8.3k★)、人生重开模拟器(10.4k★)、粒子对撞机、Progress Knight、Rogule、睡美人 等 15+ |
| 解谜益智 | 图形密码锁、围住神经猫、扫雷×5 版本、数独×2、皇后棋、黑洞方块 等 20+ |
| 编程学习 | Flexbox 青蛙、Grid 菜园、VIM 大师、Untrusted 黑客迷宫、Git 大师(已替换) 等 |
| 游戏合集 | GameZone(700+款)、124合1、JS五十连发、原生JS二十连、7合1、LCD掌机博物馆 等 9 个合集包 |
| 其他 | 即时战略、塔防、大航海时代II、麻将连连看、AI 观赏 ×6、体感创意 等 |

完整清单：主页（品类筛选+搜索）或 `games/manifest.json`（含星数/体积/许可证/原仓库链接）。

---

## 🧭 选游方法论（为什么是这 200 款）

### 数据来源
- **共计 80+ 路 GitHub Search**（topics：html5-game / browser-game / canvas-game / tetris / snake / pacman / wordle / idle / roguelike / tower-defense / typing / chess / mahjong / js13k / match-3 / breakout / quiz …）+ **40 余个知名仓库定向核查**
- 去重后候选池 **3652** 个仓库

### 8 个评估维度
| # | 维度 | 说明 |
|---|---|---|
| 1 | **热度** | GitHub Stars（对数归一化，占最大权重） |
| 2 | **离线可玩性** | 纯静态 HTML/JS > gh-pages 构建产物 > 需编译（否决）> 需服务器/联网（一票否决） |
| 3 | **完成度** | 有真实玩法循环，而非引擎 demo 或教学半成品 |
| 4 | **体积** | 优先小体积；超大仓库做裁剪（如 untrusted 剔除 214MB 音乐） |
| 5 | **品类多样性** | 43 个品类，同类不堆砌 |
| 6 | **活跃度** | 近年有维护；完好的经典酌情保留 |
| 7 | **许可证** | 均为开源许可，注明出处 |
| 8 | **中文友好度** | 加分项：原生中文界面 15+ 款 |

### 四轮论证记录
- **第一轮 · 硬过滤（3652 → 213）**：剔除归档、非浏览器语言、引擎/框架/素材库关键词、低星、超大仓库、人工排除清单。
- **第二轮 · 人工甄别（213 → 150 定稿）**：逐一核查仓库形态，剔除伪装成游戏的库/CLI 工具/多人联机；定向补入被搜索漏掉的经典（LifeRestart 10.4k★、Untrusted、A Dark Room 等）。
- **第三轮 · 下载实测（150 → 150）**：逐个下载、探测入口、HTTP 校验、浏览器实测。**发现 23 个无法离线运行，全部修复或替补**：
  - codeload 404 → `git clone --depth 1` 绕行（battle-city、GameZone 等）
  - 源码无构建产物 → 替换为同品类可玩替代（handle→Wordle+、cuberun→AI 自学 Flappy、slaytheweb→7合1、sheep-game→Cookie Clicker、candy-box-2→量子解谜、duckhunt→Clumsy Bird、stronghold→马里奥编译器、piano-trainer→2048、never-blink→地形生成器、pillage→Block It、t-rex 3D→NoteCraft、tetrys→四子棋、bagh-chal→AI 玩 Flappy、tessel→蛇蛇大作战、black-hole-square→gh-pages 抢救、curiosity→假黑客桌面、open-panzer→Kaboom 扫雷、dino→荒野放置、quizzity→Simon Says、katla→webgbcam、globle→Astray 2、gpu-life→贪吃曲线、uncharted→ThreeCraft、jojo-cards→Animate 海盗快打、dles→抖动粒子、bombergirl→Letreco、parachuting-robots→蚂蚁放置、solitaire-js→闲置太空、e-card/mah/mini-games-cn/tiny-bunny→gh-pages 抢救 ✓）
  - 入口不叫 index.html → 逐一修正如 chess.html、Tetris.html、block-it.html 等 10 处
  - 绝对路径/需 webpack → 路径改写、手工接线 ES modules
- **第四轮 · 扩充到 200（+50 复检）**：50 款全量复检 + 新增 150 款同流程验证；网络抖动期间用 **git clone / jsDelivr CDN 双通道**补齐（如 anime-guessr 563 个文件逐文件拉取）；修正 slug 撞车、目录重命名（mini-games 匹配构建基准路径）等 5 处工程问题。

### 备选与落选说明
- 推斯科洛埃（CLI 游戏）、warriorjs（9.5k★ 但非浏览器）、BrowserQuest（需服务器）、pokeclicker（412MB）、blockly-games（816MB）等均有一票否决理由
- 个别填补品类空缺的游戏星数较低（最低 21★ 分形探索器），已在主页卡片标注

---

## ✅ 质量验证（全部做过）

1. **HTTP 冒烟测试**：200/200 入口页 200 + 入口引用资源逐一校验（残余告警均为误报：JS 模板字符串、被注释的引用、favicon 变体、统计脚本）
2. **浏览器实测**：200/200 在真实浏览器中渲染出可玩画面（菜单/棋盘/画布），关键页面截图确认
3. **游戏内中文化层（全新）**：每款游戏页面会自动注入一个通用翻译层——
   - 右下角悬浮 **中 | EN** 开关，按游戏独立记忆，默认跟随主页语言；关闭即恢复原版英文
   - 覆盖 **DOM 文本、Canvas fillText/strokeText 绘制文字、CSS 伪元素、title/placeholder 属性、alert/confirm/prompt 弹窗**（已实测：2048 全界面中文、Canvas 绘制"游戏结束/得分"实时翻译）
   - 常用游戏用语词典 200+ 条，并可按游戏扩展（`games/__i18n/<slug>.json`）
   - 局限：以位图字体/精灵图形式"画"出来的英文（如 Radius Raid 的像素标题）无法通用翻译，此类属图片资产需逐游戏改字库
4. **已知小限制**（主页卡片有标注）：
   - 服务器保卫战：样式依赖 tailwind CDN，离线外观降级但玩法完整
   - webgbcam / 不许眨眼(已替换)：需摄像头授权
   - Untrusted：已裁剪音乐目录；GameZone：2.4GB 大合集（700+ 款）
   - 部分游戏含统计脚本引用，离线静默失败无影响

---

## 📁 目录结构

```
offline-games-collection/
├── index.html          ← 导航主页（43 品类筛选 + 搜索 + 中文/EN 切换）
├── server.py           ← 零依赖本地服务器（路径别名兼容各种构建基准路径）
├── 启动合集.bat         ← Windows 一键启动
├── start.sh            ← Git Bash / Linux / macOS
├── README.md / README_EN.md
├── games/
│   ├── manifest.json   ← 200 款完整元数据（中英双语）
│   └── <200 个游戏目录>
└── （选游/下载/验证脚本保留在本地，未随仓库分发）
```

---

## ⚖️ 版权说明

所有游戏版权归原作者所有，本合集仅作**本地学习与个人娱乐**用途。
每个游戏卡片可跳转其 GitHub 原仓库，请遵守各项目 LICENSE。

## 🛠 常见问题

- **双击 bat 闪退？** 安装 Python 3（勾选 Add to PATH）后重试
- **端口被占用？** `python server.py 9000` 换端口
- **想看源码？** 就在 `games/<游戏目录>/` 里
- **游戏打不开？** 确认通过 `http://127.0.0.1:8137` 访问而非 `file://`
