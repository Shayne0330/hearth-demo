# Hearth

Hearth 是一个面向多项目、多 Session、多 Agent 工作流的 3D 记忆宫殿原型。

它尝试把「回到一个会话」这件事从列表、卡片和日志里拿出来，变成一个可以被空间记住的动作：项目是房间，Session 是房间里的工作台，Agent / IDE 是工作台的属性。当某个 Session 有回复或需要回看时，房间会从外立面亮起，用户可以通过一个悬浮的小建筑快速回到对应上下文。

## 当前概念

### Project = 房间

一个项目对应一个房间。房间不是单纯的信息卡片，而是一个可以承载记忆的位置：它在建筑里的层级、相邻关系和灯光状态，会帮助用户重新建立对项目结构的感知。

### Session = 工作台

一个项目可以有多个 Session，因此房间里可以有多张工作台。每张工作台代表一次正在进行或已经返回结果的会话。

- 有回复 / 未读的 Session：工作台灯亮起，外部房间窗口也会明确亮灯。
- 正在运行的 Session：使用更弱的呼吸或暖光，避免把「运行中」误读成「需要处理」。
- Agent / IDE：不是最外层叙事，而是 Session 或工作台的属性。

### Collapsed = 悬浮建筑状态仪表

收起状态不是完整地图，而是一个小型 2.5D 建筑立面。它可以悬浮在桌面、IDE 或 Agent 窗口之上，作为一个低打扰的状态仪表。

- 整个小建筑都可以拖拽移动。
- 亮着的窗户对应需要回看的项目房间。
- 外立面装饰和内部房间 / 工作台属性保持对应。
- 当前 MVP 使用固定 8 个项目房间的样板建筑，优先保证视觉表现和汇报效果。

### Expanded = 透明悬浮剖面沙盘

展开状态是一个轻量的透明悬浮窗，而不是新的完整应用窗口。建筑外立面会切开，露出内部项目房间和 Session 工作台。

- 点击小建筑展开。
- Hover 房间时显示该项目的最近目标 / 最近会话占位信息。
- 点击房间会进入聚焦状态，为后续恢复上下文做过场铺垫。

## 运行方式

安装依赖：

```bash
npm install
```

浏览器预览：

```bash
npm run dev
```

打开控制台提示的地址，通常是：

```text
http://127.0.0.1:5173/
```

桌面悬浮窗预览：

```bash
npm run desktop:dev
```

构建并用 Electron 打开：

```bash
npm run desktop
```

## 技术栈

- Vite + React + TypeScript
- Three.js
- React Three Fiber
- Drei
- Tailwind CSS
- Electron

## 当前 MVP 范围

已经实现：

- 3D 建筑 / 房间 / 工作台 / 台灯原型
- 收起状态的小型建筑立面
- 展开状态的建筑剖面视图
- 透明桌面悬浮窗口
- 收起状态整栋小建筑拖拽
- 基于 Session 状态派生房间亮灯
- Project / Session / Agent 的轻量数据模型
- Hover 项目信息卡片
- 概念定义与技术计划文档

暂不包含：

- 真实 Agent / IDE Webhook
- 自动抓取上下文摘要
- 多数量房间的程序化外立面生成
- 完整资产建模与美术生产管线
- 打包发布流程

## 项目结构

```text
electron/
├── main.cjs              # 透明悬浮窗口、窗口模式切换、拖拽 IPC
└── preload.cjs           # 暴露桌面窗口 API

src/
├── App.tsx
├── components/hearth3d/
│   ├── Hearth3D.tsx              # 3D 交互入口与状态机
│   ├── BuildingModel.tsx         # 展开剖面建筑
│   ├── CollapsedBuildingIcon.tsx # 收起建筑立面
│   ├── ProjectRoom3D.tsx         # 项目房间
│   ├── SessionDesk3D.tsx         # Session 工作台
│   ├── DeskLamp.tsx              # 工作台灯
│   ├── WindowLight.tsx           # 外立面窗灯
│   ├── CameraRig.tsx             # 相机过渡
│   ├── layout.ts                 # 房间布局
│   └── spaceTokens.ts            # 空间尺寸 / 颜色 token
├── data/projects.ts              # 项目、Session、Agent 假数据和 selector
└── types/hearthDesktop.d.ts      # Electron preload 类型

概念定义.md
3D_MVP_开发计划.md
```

## 文档

- `概念定义.md`：记录核心概念、关键决策和展示叙事。
- `3D_MVP_开发计划.md`：记录技术选型、风险点和实现计划。

## 设计原则

Hearth 的重点不是做一个更复杂的任务管理器，而是降低「回到上下文」的认知摩擦。

它把项目和 Session 做成空间实体，让用户通过位置、光、房间和工作台，快速恢复注意力。
