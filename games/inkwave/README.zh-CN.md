<p align="center">
  <img src="assets/stages/halyard-day.webp" alt="黄金时刻的 Halyard Marina" width="100%">
</p>

<h1 align="center">INKWAVE</h1>

<p align="center">
  <a href="README.md">English</a> · <b>简体中文</b>
</p>

<p align="center">
  一款原创的 Splatoon 风格 4v4 占地对战射击游戏，直接在浏览器里运行。<br>
  涂满地面，在自己的墨水里潜行，把对手的涂地面积比下去。
</p>

<p align="center">
  <a href="https://inkwave-aah.pages.dev"><b>▶ 立即游玩</b></a> ·
  <a href="#操作">操作</a> ·
  <a href="#联机对战">联机</a> ·
  <a href="#本地运行">本地运行</a> ·
  <a href="#实现原理">实现原理</a> ·
  <a href="CONTRIBUTING.md">参与贡献</a>
</p>

<p align="center">
  <a href="https://github.com/jaydendavisnc/inkwave/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/jaydendavisnc/inkwave/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="three.js r186" src="https://img.shields.io/badge/three.js-r186-000000?logo=three.js&logoColor=white">
  <img alt="无需构建" src="https://img.shields.io/badge/build-none%20needed-2ea44f">
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
</p>

---

## 特色

- **多种 4 v 4 模式。** 占地对战（涂地面积多者获胜）与区域控制（守住活动区域，从 100 倒数——侧区会轮换，还有罚时和加时）。可与三个难度档位的机器人对战。
- **与好友联机。** 创建私人房间，分享五位字符的房间码，最多八名玩家带着各自的装备和外观进入大厅。空位由机器人补齐；中途有人掉线，机器人会接管他的乌贼小子。
- **乌贼形态。** 按住即可潜入自己的墨水：快速游动、补充墨罐、攀爬已涂的墙面、在墨水上跃过水面缺口。
- **十二种武器**，手感各不相同：Spritzer、Twinfire Pistols、Canopy Brolly（霰弹枪 + 可发射护盾）、Popper Blaster、Squall Spinner、Glint Charger、Tideline Bow（三箭齐发、两段蓄力）、Swell Roller、Swish Brush、Brine Cutlass（蓄力一击斩）、Sponge Mitts（墨拳、蓄力跳跃、攀墙）以及 Bilge Bucket。任意主武器都可搭配 15 种副武器与 19 种大招。
- **七张地图，白天或黄昏。** Tidewater Plaza、Kelpline Terminal、Halyard Marina、Saltpan Basin、Crossroads Market、Lockgate Canals 与 Terrace Heights，每张都是真实地点，布局各异。部分地图在区域控制模式下会更换少量构件。
- **像液体一样的墨水。** 墨点会扩散并沉降，新墨有光泽而逐渐干燥，墨迹会沿墙流淌，游动时水面本身也会留下尾迹。
- **真正能看懂的地图。** 按住 <kbd>Tab</kbd>，镜头会升起变成实时战场的一幅微缩模型视角，标有队友位置，并可一键超级跳跃。
- **衣柜系统。** 自定义你的乌贼小子：触手发型、头部装备、面部、服装。
- **全部程序化生成。** 角色、动画、武器、贴图、道具、音效和音乐全部由代码生成。除两款字体外没有任何下载资源。

<p align="center">
  <img src="assets/stages/tidewater-day.webp" width="49%" alt="Tidewater Plaza">
  <img src="assets/stages/kelpline-dusk.webp" width="49%" alt="黄昏时的 Kelpline Terminal">
</p>

## 操作

| 动作 | 键盘 / 鼠标 | 手柄 |
|---|---|---|
| 移动 | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | 左摇杆 |
| 瞄准 | 鼠标 | 右摇杆 |
| 开火 | 鼠标左键 | RT |
| 乌贼形态 | <kbd>Shift</kbd> | LT |
| 跳跃 / 翻滚闪避 | <kbd>Space</kbd> | A |
| 副武器（炸弹） | 鼠标右键 / <kbd>E</kbd> | RB |
| 大招 | <kbd>F</kbd> | Y |
| 地图 + 超级跳跃 | 按住 <kbd>Tab</kbd> 或 <kbd>M</kbd>，然后按 <kbd>1</kbd>–<kbd>4</kbd> 或点击标记 | View |
| 暂停 | <kbd>Esc</kbd> | Start |

手柄在托管（https）版本上可用。在普通的 `http://` 局域网地址下，浏览器会屏蔽 Gamepad API。

## 联机对战

在主菜单选择 **Online**，然后选择 **Create a room** 并把房间码发给好友（或选择 **Join a room** 输入对方的房间码）。
房主决定地图、昼夜时段、对局时长以及是否用机器人补位；其他人在各自选好队伍、武器和外观后准备。
阵容、表情动作和准备状态对房间内所有人实时同步。

房间运行在一个轻量中继上（Cloudflare Worker，每个房间一个 Durable Object，位于 [`server/`](server)）。它只转发
消息：每名玩家模拟自己的乌贼小子并广播状态，其他人则通过同一套动画系统在约 0.1 秒延迟的平滑时间线上绘制。
具体原理以及用于测量它的工具见 [`docs/NET.md`](docs/NET.md)。

要在自己的网络上联机，把中继和游戏一起运行：

```bash
npm install      # 只需一次：中继基于 wrangler 运行
npm run relay    # ws://<本机>:8787
```

从 `localhost` 或局域网地址打开的页面会自动使用该中继；`?relay=wss://…` 可将其指向其他任意地址。

## 本地运行

本项目没有构建步骤。任何静态文件服务器都可以；自带的服务脚本还能同时向局域网提供服务，并发送 no-cache 头，确保模块更新不会出现缓存陈旧的问题。

```bash
git clone https://github.com/jaydendavisnc/inkwave.git
cd inkwave
npm install      # Electron + 无头测试工具
npm start        # 桌面应用（Electron）
npm run serve    # 或网页版：http://localhost:8490
npm run package  # 构建 macOS 应用到 dist/（arm64 + x64）
```

可选：把你自己的音乐放进 `songs/`（见 [`songs/README.md`](songs/README.md)）；否则会播放程序化生成的配乐。

常用的 URL 参数：`?map=halyard&time=dusk` 指定地图，`&autostart=180` 跳过菜单直接开始一场 180 秒的对局，`&autopilot` 让机器人替你操作。

```bash
npm install      # 只需一次，用于无头工具
npm run check    # 对每个模块做语法检查
npm run smoke    # 在无头 Chrome 中启动并自动运行 8 秒，出现控制台错误即失败
npm run build    # 组装 dist/（游戏本体 + 仅包含它引用的 three.js 附加模块）
npm run check-maps   # 检查每张地图布局（及其区域控制变体）
```

机器人对局可以在无头静音模式下用于调参：`MAP=halyard MODE=turf SECS=180 npm run botlab`（见 [`tools/botlab/README.md`](tools/botlab/README.md)）。
在中继运行时，`npm run net-test` 会让多个无头客户端进行一场真实对局，并报告每个客户端绘制出了什么
（见 [`docs/NET.md`](docs/NET.md#how-the-netcode-works-srcnetnetmatchjs)）。

## 实现原理

- **墨水绘制在纹理空间。** 每个可涂面都占据一张 4K 图集上的一块区域；墨点由 GPU 绘制到图集中，同时一张粗粒度的 CPU 网格负责同步涂地比分和游戏逻辑查询。关卡着色器把墨水叠加到表面上，并带有自身的高度、光泽和湿润度。见 [`src/world/paint.js`](src/world/paint.js) 与 [`src/world/inkShading.js`](src/world/inkShading.js)。
- **地图即数据。** 一张布局就是竞技场一半区域的盒体与斜面列表；另一半是它的 180° 旋转，因此两队场地永远完全一致。环境光遮蔽离线烘焙（`tools/bake-ao.mjs`）。见 [`src/world/maps.js`](src/world/maps.js)。
- **角色完全程序化。** 几何体、材质、60 骨骼绑定以及全部动画（移动、乌贼形态、武器姿态、次级运动）都是代码，由基于弹簧的姿态系统驱动。见 [`docs/RIG.md`](docs/RIG.md)。
- **各系统通过事件通信。** 武器、角色和对局发出带类型的事件；特效、HUD 和音频负责订阅。这套契约记录在 [`docs/EVENTS.md`](docs/EVENTS.md) 与 [`docs/CONTRACTS.md`](docs/CONTRACTS.md)。
- **确定性的工具链。** 游戏暴露了冻结/单帧步进的调试接口，因此连拍图、手感测量和机器人模拟都能逐帧复现（`tools/film.py`、`tools/measure-handling.mjs`）。

渲染使用 three.js r186（已内置为纯 ES 模块并通过 import map 加载），配合 GTAO、泛光和自定义调色后处理。

## 浏览器支持

主要面向 Chrome 和 Edge；Firefox 可运行。Safari 能跑但较慢。高画质预设建议使用独立显卡或较新的集成显卡；设置菜单提供中、低两档。

## 界面语言

游戏内置英文与简体中文界面：**设置 → 通用 → 语言**。选择会保存在本地，切换后立即生效。

## 参与贡献

欢迎提交 issue 和 pull request。关于项目结构和需要先运行的检查项，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE) © 2026 Jayden Davis。INKWAVE 是一个独立项目，与任天堂无关；Splatoon 是任天堂的商标。
