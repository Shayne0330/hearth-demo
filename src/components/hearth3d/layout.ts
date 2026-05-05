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

function getDeskPosition(slot: number, total: number) {
  const positions = total <= 1
    ? [{ x: -0.68, z: 0.62 }]
    : total === 2
      ? [
          { x: -1.02, z: 0.62 },
          { x: -0.28, z: 0.72 },
        ]
      : [
          { x: -1.14, z: 0.54 },
          { x: -0.5, z: 0.74 },
          { x: 0.14, z: 0.58 },
        ];
  return positions[slot] ?? positions[positions.length - 1];
}

function getMassingSlots(count: number) {
  if (count <= 5) {
    return {
      style: 'villa' as const,
      slots: [
        { slot: -0.55, floor: 0 },
        { slot: 0.55, floor: 0 },
        { slot: -0.55, floor: 1 },
        { slot: 0.55, floor: 1 },
        { slot: 0, floor: 2 },
      ],
    };
  }

  return {
    style: 'mansion' as const,
    slots: [
      { slot: -1, floor: 0 },
      { slot: 0, floor: 0 },
      { slot: 1, floor: 0 },
      { slot: -1, floor: 1 },
      { slot: 0, floor: 1 },
      { slot: 1, floor: 1 },
      { slot: -0.5, floor: 2 },
      { slot: 0.5, floor: 2 },
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
  const slots = placedProjects.map(({ placement }) => placement.slot);
  const minFloor = Math.min(...floors);
  const maxFloor = Math.max(...floors);
  const minSlot = Math.min(...slots);
  const maxSlot = Math.max(...slots);
  const roomStep = SPACE.roomWidth + SPACE.slotGap;

  const rooms = placedProjects.map(({ project, placement }) => {
    const floorIndex = placement.floor - minFloor;
    const x = (placement.slot - (minSlot + maxSlot) / 2) * roomStep - floorIndex * 0.18;
    const y = (placement.floor - minFloor) * SPACE.floorHeight;
    const z = -floorIndex * 0.28;
    const deskSessions = project.sessions.slice(0, 3);
    const desks = deskSessions.map((session, index) => {
      const position = getDeskPosition(index, deskSessions.length);
      return {
        session,
        x: position.x,
        y: -SPACE.roomHeight / 2 + 0.36,
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
        z: z + SPACE.roomDepth / 2 + SPACE.facadeDepth + 0.08,
      },
      desks,
    };
  });

  return {
    rooms,
    width: (maxSlot - minSlot + 1) * roomStep,
    height: (maxFloor - minFloor + 1) * SPACE.floorHeight,
    depth: SPACE.roomDepth,
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
