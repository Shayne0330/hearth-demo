export type RoomState = 'active' | 'dormant' | 'dusty' | 'archived';

export type AgentId = 'cursor' | 'codex' | 'manus' | 'claude';

export type Agent = {
  id: AgentId;
  name: string;
  palette: {
    facade: string;
    wall: string;
    floor: string;
    accent: string;
    glow: string;
    dim: string;
  };
  vibe: string;
};

export type SessionStatus = 'running' | 'replied' | 'idle' | 'archived';

export type Session = {
  id: string;
  title: string;
  agentId: AgentId;
  status: SessionStatus;
  lastGoal: string;
  lastSummary: string;
  updatedHoursAgo: number;
  unread?: boolean;
  desk: {
    slot: number;
  };
};

export type Project = {
  id: string;
  name: string;
  vibe: string;
  primaryAgentId: AgentId;
  state: RoomState;
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

export type ProjectAttentionState = {
  isLit: boolean;
  isBreathing: boolean;
  litSessions: Session[];
  runningSessions: Session[];
};

export const AGENTS: Record<AgentId, Agent> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    palette: {
      facade: '#87492f',
      wall: '#b86b45',
      floor: '#4f3124',
      accent: '#f4a85d',
      glow: '#ffd8a0',
      dim: '#5a392f',
    },
    vibe: '主工作台',
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    palette: {
      facade: '#315e5b',
      wall: '#6f9f96',
      floor: '#284542',
      accent: '#9ed4c5',
      glow: '#d4fff5',
      dim: '#2d4c4a',
    },
    vibe: '异步帮手',
  },
  manus: {
    id: 'manus',
    name: 'Manus',
    palette: {
      facade: '#5f4976',
      wall: '#9276ac',
      floor: '#3b2f48',
      accent: '#c8aedb',
      glow: '#eadcff',
      dim: '#463758',
    },
    vibe: '实验室',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    palette: {
      facade: '#80623a',
      wall: '#b9935f',
      floor: '#4c3a24',
      accent: '#e8c98a',
      glow: '#fff0c2',
      dim: '#5b472c',
    },
    vibe: '思考室',
  },
};

export const PROJECTS: Project[] = [
  {
    id: 'helios',
    name: 'Helios',
    vibe: '深夜思考状态',
    primaryAgentId: 'cursor',
    state: 'active',
    lastTouchedHoursAgo: 0.2,
    branch: 'feature/3d-hearth',
    activeSessionId: 'helios-ui',
    room: { floor: 2, slot: 0, cluster: 'cursor' },
    sessions: [
      {
        id: 'helios-ui',
        title: '3D 记忆宫殿界面',
        agentId: 'cursor',
        status: 'replied',
        unread: true,
        lastGoal: '把 2D 房子改成可展开的 3D 建筑剖面。',
        lastSummary: '已确认 Project 是房间，Session 是工作台；下一步实现收起和展开状态。',
        updatedHoursAgo: 0.2,
        desk: { slot: 0 },
      },
      {
        id: 'helios-copy',
        title: '概念汇报文案',
        agentId: 'claude',
        status: 'idle',
        lastGoal: '整理一版可以向朋友解释 Hearth 的概念叙事。',
        lastSummary: '重点放在注意力恢复，而不是多 Agent 技术接入。',
        updatedHoursAgo: 5,
        desk: { slot: 1 },
      },
      {
        id: 'helios-build',
        title: '构建基线检查',
        agentId: 'codex',
        status: 'running',
        lastGoal: '恢复 TypeScript build，并隔离旧 2D 组件。',
        lastSummary: '旧 House / Room 与新数据结构冲突，需要从真实入口图里移除。',
        updatedHoursAgo: 0.6,
        desk: { slot: 2 },
      },
    ],
  },
  {
    id: 'lumina',
    name: 'Lumina',
    vibe: '昨天动过',
    primaryAgentId: 'cursor',
    state: 'dormant',
    lastTouchedHoursAgo: 26,
    branch: 'main',
    activeSessionId: 'lumina-review',
    room: { floor: 1, slot: 0, cluster: 'cursor' },
    sessions: [
      {
        id: 'lumina-review',
        title: 'Onboarding 体验复盘',
        agentId: 'cursor',
        status: 'idle',
        lastGoal: '找出新用户第一次打开项目时最困惑的三个点。',
        lastSummary: '入口提示太像 demo，真实项目状态感不够强。',
        updatedHoursAgo: 26,
        desk: { slot: 0 },
      },
    ],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    vibe: '云端跑批中',
    primaryAgentId: 'codex',
    state: 'active',
    lastTouchedHoursAgo: 1.5,
    branch: 'main',
    activeSessionId: 'aurora-agent',
    room: { floor: 2, slot: 1, cluster: 'codex' },
    sessions: [
      {
        id: 'aurora-agent',
        title: 'Agent 任务面板',
        agentId: 'codex',
        status: 'running',
        lastGoal: '把并行任务压缩成适合扫视的状态卡片。',
        lastSummary: '正在验证卡片排序规则：待回看优先，其次运行中，其次空闲。',
        updatedHoursAgo: 1.5,
        desk: { slot: 0 },
      },
      {
        id: 'aurora-tests',
        title: '测试失败摘要',
        agentId: 'codex',
        status: 'replied',
        unread: true,
        lastGoal: '定位 dashboard e2e 偶发失败。',
        lastSummary: '失败更像等待状态未稳定，建议加显式网络 idle 检查。',
        updatedHoursAgo: 0.8,
        desk: { slot: 1 },
      },
    ],
  },
  {
    id: 'datamesh',
    name: 'DataMesh',
    vibe: '积灰两周',
    primaryAgentId: 'codex',
    state: 'dusty',
    lastTouchedHoursAgo: 24 * 14,
    branch: 'main',
    activeSessionId: 'datamesh-schema',
    room: { floor: 1, slot: 1, cluster: 'codex' },
    sessions: [
      {
        id: 'datamesh-schema',
        title: 'Schema 迁移草案',
        agentId: 'codex',
        status: 'idle',
        lastGoal: '确认用户事件表是否要拆成 append-only 日志。',
        lastSummary: '还没有结论，风险主要在历史数据补齐和查询成本。',
        updatedHoursAgo: 24 * 14,
        desk: { slot: 0 },
      },
    ],
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    vibe: '一次性试验',
    primaryAgentId: 'manus',
    state: 'dormant',
    lastTouchedHoursAgo: 8,
    activeSessionId: 'sandbox-spike',
    room: { floor: 0, slot: 0, cluster: 'manus' },
    sessions: [
      {
        id: 'sandbox-spike',
        title: '拖拽手感实验',
        agentId: 'manus',
        status: 'running',
        lastGoal: '试出房间展开时最不打扰的 hover 反馈。',
        lastSummary: 'hover 只做预览，click 再展开，这条体验方向已确认。',
        updatedHoursAgo: 8,
        desk: { slot: 0 },
      },
    ],
  },
  {
    id: 'polaris',
    name: 'Polaris',
    vibe: '反复推敲',
    primaryAgentId: 'claude',
    state: 'active',
    lastTouchedHoursAgo: 3,
    branch: 'main',
    activeSessionId: 'polaris-brief',
    room: { floor: 2, slot: 2, cluster: 'claude' },
    sessions: [
      {
        id: 'polaris-brief',
        title: '产品叙事审阅',
        agentId: 'claude',
        status: 'replied',
        unread: true,
        lastGoal: '压缩 Hearth 的一句话定位。',
        lastSummary: '建议把产品说成“帮你回到项目房间，而不是回到聊天记录”。',
        updatedHoursAgo: 3,
        desk: { slot: 0 },
      },
    ],
  },
  {
    id: 'selene',
    name: 'Selene',
    vibe: '三个月前结项',
    primaryAgentId: 'manus',
    state: 'archived',
    lastTouchedHoursAgo: 24 * 90,
    activeSessionId: 'selene-archive',
    room: { floor: 0, slot: 2, cluster: 'manus' },
    sessions: [
      {
        id: 'selene-archive',
        title: '归档记录',
        agentId: 'manus',
        status: 'archived',
        lastGoal: '保留最终方案和未做清单。',
        lastSummary: '项目已经盖上白布，只在展开沙盘里作为冷区出现。',
        updatedHoursAgo: 24 * 90,
        desk: { slot: 0 },
      },
    ],
  },
];

export const CURRENT_PROJECT_ID = 'helios';

export function getProjectAttentionState(project: Project): ProjectAttentionState {
  const litSessions = project.sessions.filter(
    (session) => session.unread || session.status === 'replied',
  );
  const runningSessions = project.sessions.filter(
    (session) => session.status === 'running',
  );

  return {
    isLit: litSessions.length > 0,
    isBreathing: litSessions.length === 0 && runningSessions.length > 0,
    litSessions,
    runningSessions,
  };
}

export function getDefaultSession(project: Project): Session | undefined {
  const attention = getProjectAttentionState(project);
  return (
    attention.litSessions[0] ??
    project.sessions.find((session) => session.id === project.activeSessionId) ??
    project.sessions[0]
  );
}
