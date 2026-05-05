export const SPACE = {
  roomWidth: 3.2,
  roomDepth: 2.35,
  roomHeight: 1.5,
  floorHeight: 1.82,
  wallThickness: 0.08,
  floorThickness: 0.12,
  slotGap: 0.18,
  deskWidth: 0.72,
  deskDepth: 0.44,
  deskHeight: 0.16,
  lampHeight: 0.34,
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
  background: '#121018',
  ground: '#16131c',
  slab: '#3a3340',
  slabEdge: '#17131d',
  facade: '#51342b',
  facadeTrim: '#916947',
  roof: '#2d344b',
  roofEdge: '#15192b',
  stone: '#c8b49a',
  copper: '#c47a4b',
  foliage: '#b86f3d',
  roomBack: '#312a35',
  desk: '#6a4630',
  deskEdge: '#2b1b14',
  lampOff: '#4b4139',
  paper: '#e7d4a9',
  textPanel: 'rgba(15, 12, 18, 0.72)',
} as const;
