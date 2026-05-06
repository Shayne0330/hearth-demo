export const SPACE = {
  roomWidth: 3.2,
  roomDepth: 2.35,
  roomHeight: 1.5,
  floorHeight: 1.82,
  wallThickness: 0.08,
  floorThickness: 0.12,
  slotGap: 0.18,
  deskWidth: 1.44,
  deskDepth: 0.88,
  deskHeight: 0.22,
  lampHeight: 0.48,
  facadeDepth: 0.16,
  windowWidth: 0.58,
  windowHeight: 0.42,
} as const;

export const SCENE = {
  collapsedZoom: 33,
  expandedZoom: 52,
  collapsedCamera: [5.6, 4.5, 7.2] as const,
  expandedCamera: [8.2, 5.8, 9.6] as const,
} as const;

export const COLORS = {
  background: '#effcff',
  ground: '#c6eff5',
  slab: '#f7fbff',
  slabEdge: '#16324f',
  facade: '#41c8cf',
  facadeTrim: '#ffd447',
  roof: '#f18bb2',
  roofEdge: '#16324f',
  stone: '#fff1b4',
  copper: '#f07a2f',
  foliage: '#7bdc68',
  roomBack: '#21466b',
  desk: '#e9843f',
  deskEdge: '#16324f',
  lampOff: '#6a84a3',
  paper: '#fff7ce',
  textPanel: 'rgba(239, 252, 255, 0.82)',
} as const;
