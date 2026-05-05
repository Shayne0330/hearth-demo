# Hearth 3D MVP 开发计划

## 1. 最终技术选型

采用以下技术栈实现 3D MVP：

```txt
React 19 / Vite / TypeScript
+ three
+ @react-three/fiber
+ @react-three/drei
```

当前版本兼容性检查：

- 当前仓库使用 React 19.2.x。
- `@react-three/fiber@9.6.1` peer dependency 覆盖 `react >=19 <19.3`、`react-dom >=19 <19.3`、`three >=0.156`。
- `@react-three/drei@10.7.7` peer dependency 要求 `react ^19`、`react-dom ^19`、`@react-three/fiber ^9.0.0`、`three >=0.159`。
- `three` 当前最新版本为 `0.184.0`。

结论：可以直接在现有 React 19 项目中接入 R3F / Drei。

## 2. 关键技术决策

### 2.1 使用正交相机

3D 场景采用 orthographic camera，而不是 perspective camera。

原因：

- 更接近 2.5D / 轴测建筑立面。
- 房间大小不会因透视产生过大变化，信息界面更稳定。
- 用户不会产生第一人称漫游预期。

### 2.2 使用程序化几何，不使用建模资产

第一版不引入 Blender / GLB / 烘焙贴图流程。

房间、楼层、建筑立面、窗户、走廊、桌子、屏幕、便签、灯全部用几何体生成。

原因：

- 成本可控。
- 空间结构可以由项目数据生成。
- 后续可以逐步替换为模块化低多边形资产。

为了避免程序化几何变成散落的 magic numbers，第一版必须先定义空间设计 token：

```ts
const SPACE = {
  roomWidth: 3.2,
  roomDepth: 2.4,
  roomHeight: 1.8,
  floorHeight: 2.2,
  wallThickness: 0.08,
  deskWidth: 0.72,
  deskDepth: 0.42,
  facadeDepth: 0.16,
};
```

所有建筑、房间、窗户、工作台和灯的位置都从这些 token 与 layout 结果派生，组件内部不直接写散落坐标。

### 2.3 DOM Overlay 和 3D 分工

3D Canvas 负责：

- 建筑立面。
- 房间剖面沙盘。
- 楼层展开动画。
- 房间 hover / click。
- 窗户亮灯和状态发光。

DOM / React UI 负责：

- 项目摘要卡片。
- 上一次目标。
- 最近 Session 占位信息。
- 状态说明。
- 收起 / 展开按钮和调试开关。

这样可以避免在 3D 中做复杂文字排版。

### 2.4 动画不用重型动画库

第一版 3D 动画采用：

- React reducer / 状态机控制场景状态。
- 单一 `SceneTransition` / `CameraRig` 管理展开进度、聚焦进度和相机目标。
- `useFrame` 只在少数上层控制组件里做位置、旋转、透明度、发光强度插值。
- 必要时使用 Three.js 自带 `MathUtils.lerp` / `damp`。

暂不引入 GSAP、react-spring、framer-motion-3d。

原因：

- 动画需求集中在建筑展开、房间高亮、相机轻微聚焦。
- 自己写少量插值足够。
- 减少依赖和调试面。

约束：

- 房间组件不各自维护 transition 状态。
- 房间组件只接收派生后的 `expandProgress`、`focusProgress`、`isLit`、`isHovered` 等 props。
- 全局动画进度可以暂停、复现和调试。

### 2.5 相机交互受限

用户可以轻微缩放、平移或旋转，但角度需要限制。

默认状态应始终保持：

- 用户知道自己在看建筑。
- 用户知道亮灯房间在哪里。
- 用户不会迷路。

优先使用 Drei `CameraControls`。如果控制过重，再降级为固定相机 + 自定义缩放/平移。

## 3. 产品状态模型

MVP 使用单一 discriminated union 表达合法状态，避免 `collapsed + selected-room` 这类非法组合。

```ts
type HearthViewState =
  | { type: 'collapsed' }
  | { type: 'previewing-collapsed' }
  | { type: 'expanding'; fromProjectId?: string }
  | { type: 'expanded'; hoveredProjectId?: string; hoveredSessionId?: string }
  | { type: 'focusing'; projectId: string; sessionId?: string }
  | { type: 'selected'; projectId: string; sessionId?: string };
```

含义：

- `collapsed`：悬浮小房子 / 建筑立面状态。
- `previewing-collapsed`：hover 后的小房子轻量预览状态，不展开建筑。
- `expanding`：建筑从立面展开成剖面沙盘。
- `expanded`：建筑已展开，可 hover 房间或工作台。
- `focusing`：点击房间 / 工作台后的短过场。
- `selected`：项目 / Session 被选中，摘要面板稳定展示。

注意：

- `HearthViewState` 只保存逻辑状态，不保存逐帧动画进度。
- `expandProgress`、`focusProgress`、相机插值等动画值由 `SceneTransition` / `CameraRig` 内部通过 ref 和 `useFrame` 管理。
- 亮灯项目不进入 view state，而是从 `projects[].sessions` 派生。

状态变化统一通过 reducer 处理：

```ts
type HearthAction =
  | { type: 'PREVIEW_COLLAPSED' }
  | { type: 'END_COLLAPSED_PREVIEW' }
  | { type: 'OPEN_FROM_COLLAPSED' }
  | { type: 'HOVER_PROJECT'; projectId?: string; sessionId?: string }
  | { type: 'FOCUS_SESSION'; projectId: string; sessionId?: string }
  | { type: 'FOCUS_COMPLETE' }
  | { type: 'COLLAPSE' };
```

组件只派发 action，不直接拼接多个独立状态。

## 4. 数据结构调整

`Project` 继续作为主数据对象，但叙事上改为“项目房间”。`Session` 是项目房间内的工作台。

建议字段：

```ts
type Session = {
  id: string;
  title: string;
  agentId: AgentId;
  status: 'running' | 'replied' | 'idle' | 'archived';
  lastGoal: string;
  lastSummary: string;
  updatedHoursAgo: number;
  unread?: boolean;
  desk: {
    slot: number;
  };
};

type Project = {
  id: string;
  name: string;
  primaryAgentId: AgentId;
  state: 'active' | 'dormant' | 'dusty' | 'archived';
  lastTouchedHoursAgo: number;
  branch?: string;
  activeSessionId?: string;
  sessions: Session[];
  room: {
    floor: number;
    slot: number;
    cluster: AgentId;
  };
};
```

说明：

- `primaryAgentId` 是项目房间的主要属性，不是主叙事标题。
- `sessions[]` 决定房间内有几张工作台。
- `activeSessionId` 决定默认聚焦哪张工作台。
- `room.floor` 和 `room.slot` 决定房间在建筑中的位置。
- 同 Agent 项目优先放在同楼层、同侧翼或相邻区域。
- `Session.lastGoal` / `Session.lastSummary` 暂时用假数据占位。
- 建筑外部的房间明确亮灯来自 `sessions.some(s => s.unread || s.status === 'replied')`。
- `running` Session 不触发明确亮灯，只触发更弱的呼吸 / 暖光状态，避免状态仪表变成噪音。
- `Project.state` 只表达项目房间的长期状态，例如长期活跃度、落灰、归档。
- 房间是否亮灯不手写在 `Project.state` 上，而是由 Session 状态 selector 派生。
- 展开后，具体亮起的是工作台上的台灯。

建议 selector：

```ts
function getProjectAttentionState(project: Project) {
  const hasUnread = project.sessions.some(
    (s) => s.unread || s.status === 'replied',
  );
  const hasRunning = project.sessions.some((s) => s.status === 'running');
  return {
    isLit: hasUnread,
    isBreathing: !hasUnread && hasRunning,
  };
}
```

## 5. 组件拆分计划

新增 3D 组件目录：

```txt
src/components/hearth3d/
├── Hearth3D.tsx              # 3D 场景入口，包含 Canvas
├── HearthScene.tsx           # 场景主体，接收 projects 和交互状态
├── BuildingModel.tsx         # 同一套几何模型，根据 expandProgress 渲染立面 / 剖面
├── ProjectRoom3D.tsx         # 单个项目房间
├── SessionDesk3D.tsx         # 单个 Session 工作台
├── RoomInterior.tsx          # 房间内部简化几何体
├── DeskLamp.tsx              # 工作台灯 / Session 状态
├── WindowLight.tsx           # 房间外部窗户亮灯 / 呼吸
├── CameraRig.tsx             # 相机位置和过场控制
├── SceneTransition.tsx       # 展开、聚焦、收起的全局进度
├── labels.tsx                # Html 标签 / 门牌
├── layout.ts                 # 根据项目数据计算楼层、房间、工作台坐标
└── spaceTokens.ts            # 空间尺寸、色彩、几何 token
```

重要约束：

- `BuildingModel` 是唯一负责建筑几何的组件。
- 收起立面和展开剖面不各自 hardcode 一套坐标。
- `layout.ts` 是立面窗户、剖面房间、Session 工作台坐标的单一来源。
- `expandProgress` 决定外立面打开、楼层错开和房间露出程度。

保留现有：

- `App.tsx`：保留状态机，但切换到新 3D 入口。
- `FloatingTower.tsx`：可暂时保留作为参考或旧入口。
- `projects.ts`：重塑数据结构。

处理旧组件：

- `House.tsx` 和 `Room.tsx` 当前已经造成 TypeScript build 失败。
- 3D MVP 开发时应删除、隔离或修复旧组件引用。
- 不建议继续维护旧 2D 房子实现。

## 6. 实施阶段

### Phase 0：清理构建基线

目标：

- 让 `npm run build` 恢复通过。
- 确认旧 2D 组件如何处理。

任务：

- 安装 `three`、`@react-three/fiber`、`@react-three/drei`。
- 处理 `House.tsx` / `Room.tsx` 类型错误。
- 保留旧实现作为参考，但不让它阻塞编译。

验收：

- `npm run build` 通过。
- 页面仍能启动。

### Phase 1：3D Canvas 骨架

目标：

- 在页面中渲染一个稳定的 3D 建筑立面。

任务：

- 新建 `Hearth3D` 和 `HearthScene`。
- 接入 orthographic Canvas。
- 添加基础灯光、地面、相机。
- 新建 `spaceTokens.ts`。
- 新建 `layout.ts`，从项目 / Session 数据生成房间、窗户、工作台坐标。
- 渲染一个程序化建筑体和窗户。

验收：

- 页面中出现 2.5D 小房子。
- WebGL fallback 有基础 DOM 替代。

### Phase 2：收起状态

目标：

- 做出悬浮小房子的状态仪表。

任务：

- 根据项目数据生成楼层和窗户。
- 有 replied / unread Session 的房间明确亮灯。
- 有 running Session 但无待回看的房间只做弱呼吸，不做明确亮灯。
- 窗户有轻微呼吸动效。
- 同 Agent 的项目在空间上聚合。
- 房间亮灯由内部 Session 工作台状态派生，不手写在 Project 上。

验收：

- 用户一眼能看到哪个项目房间亮灯。
- 建筑可以作为小型悬浮窗口存在。

### Phase 3：展开状态

目标：

- 点击后，建筑展开为剖面沙盘。hover 只触发收起状态下的轻量预览。

任务：

- 外立面打开或移开。
- 楼层错开。
- 房间内部露出。
- 亮灯房间突出显示。
- 房间内显示 Session 工作台。
- 有回复 / 待回看的 Session 工作台台灯亮起。

验收：

- 收起和展开之间有明确状态差异。
- 展开过程不超过约 0.8 秒。
- 不产生第一人称进入感。

### Phase 4：房间交互与摘要面板

目标：

- 点击亮灯房间后完成短过场和信息恢复。

任务：

- 房间 hover 高亮。
- 工作台 hover 高亮。
- 房间 click 默认聚焦 `activeSessionId` 或最近一个亮灯 Session。
- 工作台 click 精确聚焦对应 Session。
- 相机轻微聚焦到目标房间。
- DOM 面板显示项目名、Session 标题、上一次目标、最近 Session 摘要。

验收：

- 点击房间后能快速理解“我要回到哪个项目”。
- 过场有心理铺垫，但不拖慢切换。

### Phase 5：视觉打磨与验证

目标：

- 让 3D MVP 看起来像高级产品里的空间状态组件。

任务：

- 调整材质、灯光、阴影、发光。
- 调整建筑配色，避免玩具感。
- 桌子、屏幕、便签、灯等内饰用少量几何体表达。
- 用浏览器截图检查桌面和小尺寸悬浮状态。

验收：

- 收起状态不打扰。
- 展开状态清楚表达空间关系。
- 房间文字和摘要信息不遮挡。
- `npm run build` 通过。

## 7. 风险与应对

### 风险 1：3D 开发成本失控

应对：

- 第一版只用程序化几何。
- 不做 GLB 资产。
- 不做家具精细化。
- 不做复杂后处理。

### 风险 2：3D 场景像小游戏

应对：

- 使用克制配色和产品级 DOM 面板。
- 控制动画时间。
- 不做第一人称。
- 不做夸张角色和游戏 HUD。

### 风险 3：Canvas 文字排版困难

应对：

- 3D 内只放少量门牌。
- 复杂信息全部交给 DOM overlay。

### 风险 4：房间过多时性能下降

应对：

- MVP 控制房间数量。
- 使用 `frameloop="demand"` 或减少持续动画。
- 后续再考虑 instancing。

### 风险 5：房间 / 工作台 / 窗户对应关系错位

应对：

- 所有坐标由 `layout.ts` 生成。
- 立面窗户、剖面房间和工作台共享同一份 layout id。
- 禁止在展示组件里重新计算业务布局。

### 风险 6：多 Session 把房间变复杂

应对：

- MVP 中每个房间最多展示 3 张工作台。
- 超过 3 个 Session 时合并为一个 `+N` 工作台占位。
- 外部立面只表达“这个项目有事”，展开后再表达“具体哪张工作台有事”。

## 8. 第一轮开发完成标准

第一轮开发完成后，应该能展示完整 MVP 流程：

```txt
悬浮小房子
→ 某个项目窗户亮灯
→ hover 时轻量预览
→ click 展开建筑
→ 看到剖面沙盘和房间关系
→ 看到房间内亮灯的 Session 工作台
→ 点击亮灯房间或工作台
→ 短聚焦过场
→ 显示项目摘要和 Session 占位信息
```

不包含：

- 真实 Agent 数据接入。
- Webhook / 插件。
- 真实 IDE 切换。
- 第一人称漫游。
- 精细 3D 建模资产。
