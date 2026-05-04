export type RoomState = 'active' | 'dormant' | 'dusty' | 'archived';

export type AgentId = 'cursor' | 'codex' | 'manus' | 'claude';

export type Agent = {
  id: AgentId;
  name: string;
  // 主题色：屋顶 / 墙体亮面 / 墙体暗面 / 强调色
  palette: {
    roof: string;
    wallLight: string;
    wallDark: string;
    accent: string;
    glow: string;
  };
  vibe: string;
};

export const AGENTS: Record<AgentId, Agent> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    palette: {
      roof: '#c75a3c',
      wallLight: '#e8a36b',
      wallDark: '#a86a3f',
      accent: '#f4a85d',
      glow: '#ffd8a0',
    },
    vibe: '主战场',
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    palette: {
      roof: '#3a6f6a',
      wallLight: '#7eb0a6',
      wallDark: '#4f7c75',
      accent: '#9ed4c5',
      glow: '#bfeadd',
    },
    vibe: '云端帮手',
  },
  manus: {
    id: 'manus',
    name: 'Manus',
    palette: {
      roof: '#6b4a8a',
      wallLight: '#a98ec4',
      wallDark: '#735793',
      accent: '#c8aedb',
      glow: '#e0cdf0',
    },
    vibe: '实验室',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    palette: {
      roof: '#a87a3a',
      wallLight: '#d4b07a',
      wallDark: '#8e6a3c',
      accent: '#e8c98a',
      glow: '#f4e0b5',
    },
    vibe: '思考室',
  },
};

export type Project = {
  id: string;
  name: string;
  vibe: string;
  agentId: AgentId;
  state: RoomState;
  lastTouchedHoursAgo: number;
  branch?: string;
  /** 等距画布坐标（百分比），由 Palace 直接消费 */
  pos: { x: number; y: number };
  /** 装饰：屋顶元素、窗户颜色等 */
  decor?: {
    chimney?: boolean;
    skylight?: boolean;
    plant?: boolean;
    coffee?: boolean;
    coverSheets?: boolean;
  };
};

export const PROJECTS: Project[] = [
  // —— Cursor 区（左上、中左）
  {
    id: 'helios',
    name: 'Helios',
    vibe: '深夜思考状态',
    agentId: 'cursor',
    state: 'active',
    lastTouchedHoursAgo: 0.2,
    branch: 'feature/iso-palace',
    pos: { x: 18, y: 25 },
    decor: { chimney: true, skylight: true, coffee: true, plant: true },
  },
  {
    id: 'lumina',
    name: 'Lumina',
    vibe: '昨天动过',
    agentId: 'cursor',
    state: 'dormant',
    lastTouchedHoursAgo: 26,
    branch: 'main',
    pos: { x: 35, y: 62 },
    decor: { plant: true },
  },

  // —— Codex 区（中右）
  {
    id: 'aurora',
    name: 'Aurora',
    vibe: '云端跑批中',
    agentId: 'codex',
    state: 'active',
    lastTouchedHoursAgo: 1.5,
    branch: 'main',
    pos: { x: 60, y: 42 },
    decor: { skylight: true, plant: true },
  },
  {
    id: 'datamesh',
    name: 'DataMesh',
    vibe: '积灰 2 周',
    agentId: 'codex',
    state: 'dusty',
    lastTouchedHoursAgo: 24 * 14,
    branch: 'main',
    pos: { x: 80, y: 78 },
    decor: { coverSheets: true },
  },

  // —— Manus 区（左下）
  {
    id: 'sandbox',
    name: 'Sandbox',
    vibe: '一次性试验',
    agentId: 'manus',
    state: 'dormant',
    lastTouchedHoursAgo: 8,
    pos: { x: 14, y: 80 },
    decor: { plant: true },
  },

  // —— Claude 区（右上）
  {
    id: 'polaris',
    name: 'Polaris',
    vibe: '反复推敲',
    agentId: 'claude',
    state: 'active',
    lastTouchedHoursAgo: 3,
    branch: 'main',
    pos: { x: 82, y: 20 },
    decor: { chimney: true, coffee: true },
  },

  // —— 已结项（住在阁楼）
  {
    id: 'selene',
    name: 'Selene',
    vibe: '3 个月前结项',
    agentId: 'manus',
    state: 'archived',
    lastTouchedHoursAgo: 24 * 90,
    pos: { x: 25, y: 50 },
    decor: { coverSheets: true },
  },
  {
    id: 'orion',
    name: 'Orion',
    vibe: '半年前完工',
    agentId: 'cursor',
    state: 'archived',
    lastTouchedHoursAgo: 24 * 180,
    pos: { x: 55, y: 45 },
    decor: { coverSheets: true },
  },
  {
    id: 'vega',
    name: 'Vega',
    vibe: '一年没碰',
    agentId: 'codex',
    state: 'archived',
    lastTouchedHoursAgo: 24 * 365,
    pos: { x: 80, y: 55 },
    decor: { coverSheets: true },
  },
];

export type StickyNote = {
  id: string;
  text: string;
  createdHoursAgo: number;
  fade: number;
};

export const STICKY_NOTES: StickyNote[] = [
  {
    id: 'n1',
    text: '想做一个把所有终端 history 喂给 LLM 的小工具',
    createdHoursAgo: 6,
    fade: 0.1,
  },
  {
    id: 'n2',
    text: 'Tom 说他在用 a16z 那个 dev productivity 报告',
    createdHoursAgo: 18,
    fade: 0.3,
  },
  {
    id: 'n3',
    text: '调研下 raycast 的 deeplink 协议',
    createdHoursAgo: 36,
    fade: 0.55,
  },
];

export const CURRENT_PROJECT_ID = 'helios';

/** 在两个项目之间是否要画一条"通路"（楼梯/走道）。
 * 简单规则：同一个 IDE 内部互相连通；以及同侧相邻 IDE 之间用一条主通道。
 */
export function isProjectsConnected(a: Project, b: Project): boolean {
  if (a.agentId === b.agentId) return true;
  // 跨 IDE 主通道
  const main = new Set(['helios', 'aurora', 'polaris']);
  return main.has(a.id) && main.has(b.id);
}
