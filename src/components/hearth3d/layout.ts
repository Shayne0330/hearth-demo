import type { Project, Session } from '../../data/projects';
import { SPACE } from './spaceTokens';

export type DeskLayout = {
  session: Session;
  x: number;
  y: number;
  z: number;
};

export type RoomLayout = {
  project: Project;
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  window: {
    x: number;
    y: number;
    z: number;
  };
  desks: DeskLayout[];
};

export type BuildingLayout = {
  rooms: RoomLayout[];
  width: number;
  height: number;
  depth: number;
  minFloor: number;
  maxFloor: number;
  style: 'villa' | 'mansion';
};

const DESK_CUTAWAY_OFFSET = {
  x: -0.06,
  z: 0.52,
} as const;

function getDeskPosition(slot: number, total: number) {
  const positions = total <= 1
    ? [{ x: -0.42, z: 0.54 }]
    : total === 2
      ? [
          { x: -0.76, z: 0.48 },
          { x: 0.48, z: 0.58 },
        ]
      : [
          { x: -0.92, z: 0.34 },
          { x: 0.26, z: 0.58 },
          { x: -0.32, z: -0.24 },
        ];
  const position = positions[slot] ?? positions[positions.length - 1];
  return {
    x: position.x + DESK_CUTAWAY_OFFSET.x,
    z: position.z + DESK_CUTAWAY_OFFSET.z,
  };
}

function getMassingSlots(count: number) {
  if (count <= 6) {
    return {
      style: 'villa' as const,
      slots: [
        { slot: -1, floor: 0, z: 0 },
        { slot: 0, floor: 0, z: 0 },
        { slot: 1, floor: 0, z: 0 },
        { slot: -0.1, floor: 1, z: -0.58 },
        { slot: -0.72, floor: 2, z: 0.44 },
        { slot: 0.68, floor: 2, z: -1.08 },
      ],
    };
  }

  return {
    style: 'mansion' as const,
    slots: [
      { slot: -1, floor: 0, z: 0 },
      { slot: 0, floor: 0, z: 0 },
      { slot: 1, floor: 0, z: 0 },
      { slot: -0.15, floor: 1, z: -0.58 },
      { slot: -0.82, floor: 2, z: 0.44 },
      { slot: 0.62, floor: 2, z: -1.08 },
      { slot: -1.15, floor: 1, z: -1.28 },
      { slot: 1.12, floor: 1, z: -1.28 },
    ],
  };
}

function sortForFacade(projects: Project[]) {
  const clusterWeight = { cursor: 0, codex: 1, claude: 2, manus: 3 };
  return [...projects].sort((a, b) => {
    const stateScore = Number(b.state === 'active') - Number(a.state === 'active');
    if (stateScore !== 0) return stateScore;
    const clusterScore =
      clusterWeight[a.primaryAgentId] - clusterWeight[b.primaryAgentId];
    if (clusterScore !== 0) return clusterScore;
    return a.lastTouchedHoursAgo - b.lastTouchedHoursAgo;
  });
}

export function createBuildingLayout(projects: Project[]): BuildingLayout {
  const visibleProjects = sortForFacade(
    projects.filter((project) => project.state !== 'archived'),
  );
  const massing = getMassingSlots(visibleProjects.length);
  const placedProjects = visibleProjects.map((project, index) => ({
    project,
    placement: massing.slots[index] ?? massing.slots[massing.slots.length - 1],
  }));
  const floors = placedProjects.map(({ placement }) => placement.floor);
  const minFloor = Math.min(...floors);
  const maxFloor = Math.max(...floors);
  const roomStep = SPACE.roomWidth + SPACE.slotGap;

  const rooms = placedProjects.map(({ project, placement }) => {
    const x = placement.slot * roomStep;
    const y = (placement.floor - minFloor) * SPACE.floorHeight;
    const z = placement.z;
    const deskSessions = project.sessions.slice(0, 3);
    const desks = deskSessions.map((session, index) => {
      const position = getDeskPosition(index, deskSessions.length);
      return {
        session,
        x: position.x,
        y: -SPACE.roomHeight / 2 + 0.28,
        z: position.z,
      };
    });

    return {
      project,
      x,
      y,
      z,
      width: SPACE.roomWidth,
      depth: SPACE.roomDepth,
      height: SPACE.roomHeight,
      window: {
        x,
        y: y + 0.18,
        z: SPACE.roomDepth / 2 + SPACE.facadeDepth + 0.08,
      },
      desks,
    };
  });
  const minX = Math.min(...rooms.map((room) => room.x - room.width / 2));
  const maxX = Math.max(...rooms.map((room) => room.x + room.width / 2));
  const minZ = Math.min(...rooms.map((room) => room.z - room.depth / 2));
  const maxZ = Math.max(...rooms.map((room) => room.z + room.depth / 2));

  return {
    rooms,
    width: maxX - minX,
    height: (maxFloor - minFloor + 1) * SPACE.floorHeight,
    depth: maxZ - minZ,
    minFloor,
    maxFloor,
    style: massing.style,
  };
}

export function findRoomLayout(layout: BuildingLayout, projectId?: string) {
  if (!projectId) return undefined;
  return layout.rooms.find((room) => room.project.id === projectId);
}

export function findDeskLayout(
  layout: BuildingLayout,
  projectId?: string,
  sessionId?: string,
) {
  const room = findRoomLayout(layout, projectId);
  if (!room || !sessionId) return undefined;
  return room.desks.find((desk) => desk.session.id === sessionId);
}
