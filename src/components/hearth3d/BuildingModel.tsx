import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type Dispatch } from 'react';
import { MathUtils, type Group } from 'three';
import {
  AGENTS,
  type AgentId,
  getDefaultSession,
  getProjectAttentionState,
  type Project,
} from '../../data/projects';
import type { HearthAction, HearthViewState } from './Hearth3D';
import { createBuildingLayout } from './layout';
import { COLORS, SPACE } from './spaceTokens';
import { ProjectRoom3D } from './ProjectRoom3D';
import { WindowLight } from './WindowLight';

type BuildingModelProps = {
  projects: Project[];
  viewState: HearthViewState;
  selectedProjectId?: string;
  selectedSessionId?: string;
  dispatch: Dispatch<HearthAction>;
};

function isOpenState(viewState: HearthViewState) {
  return (
    viewState.type === 'expanding' ||
    viewState.type === 'expanded' ||
    viewState.type === 'focusing' ||
    viewState.type === 'selected'
  );
}

function getSessionAgentCounts(project: Project) {
  return project.sessions.reduce(
    (acc, session) => {
      acc[session.agentId] += 1;
      return acc;
    },
    { cursor: 0, codex: 0, manus: 0, claude: 0 } satisfies Record<AgentId, number>,
  );
}

export function BuildingModel({
  projects,
  viewState,
  selectedProjectId,
  selectedSessionId,
  dispatch,
}: BuildingModelProps) {
  const rootRef = useRef<Group>(null);
  const facadeRef = useRef<Group>(null);
  const roomsRef = useRef<Group>(null);
  const layout = useMemo(() => createBuildingLayout(projects), [projects]);
  const open = isOpenState(viewState);
  const hoveringProjectId =
    viewState.type === 'expanded' ? viewState.hoveredProjectId : undefined;
  const hoveringSessionId =
    viewState.type === 'expanded' ? viewState.hoveredSessionId : undefined;

  useFrame((_, delta) => {
    const root = rootRef.current;
    const facade = facadeRef.current;
    const rooms = roomsRef.current;
    if (root) {
      const targetScale = open ? 1 : 0.001;
      root.scale.x = MathUtils.damp(root.scale.x, targetScale, 7, delta);
      root.scale.y = MathUtils.damp(root.scale.y, targetScale, 7, delta);
      root.scale.z = MathUtils.damp(root.scale.z, targetScale, 7, delta);
      root.rotation.y = MathUtils.damp(root.rotation.y, open ? -0.04 : 0, 5, delta);
      root.position.x = MathUtils.damp(root.position.x, open ? 0 : 0, 7, delta);
      root.position.y = MathUtils.damp(root.position.y, open ? 0 : -0.15, 7, delta);
    }
    if (facade) {
      facade.position.x = MathUtils.damp(facade.position.x, open ? -3.15 : 0, 6, delta);
      facade.position.z = MathUtils.damp(facade.position.z, open ? 0.45 : 0, 6, delta);
      facade.rotation.y = MathUtils.damp(facade.rotation.y, open ? -1.18 : 0, 6, delta);
    }
    if (rooms) {
      rooms.position.x = MathUtils.damp(rooms.position.x, open ? 0.85 : 0, 6, delta);
      rooms.position.z = MathUtils.damp(rooms.position.z, open ? -0.18 : -0.7, 6, delta);
    }
  });

  function handleCollapsedPointerOver() {
    if (viewState.type === 'collapsed') dispatch({ type: 'PREVIEW_COLLAPSED' });
  }

  function handleCollapsedPointerOut() {
    if (viewState.type === 'previewing-collapsed') {
      dispatch({ type: 'END_COLLAPSED_PREVIEW' });
    }
  }

  function handleCollapsedClick() {
    if (viewState.type === 'collapsed' || viewState.type === 'previewing-collapsed') {
      dispatch({ type: 'OPEN_FROM_COLLAPSED' });
    }
  }

  function handleHover(projectId?: string, sessionId?: string) {
    if (viewState.type === 'expanded') {
      dispatch({ type: 'HOVER_PROJECT', projectId, sessionId });
    }
  }

  function handleSelect(projectId: string, sessionId?: string) {
    const project = projects.find((item) => item.id === projectId);
    const selectedSessionId = sessionId ?? (project ? getDefaultSession(project)?.id : undefined);
    dispatch({ type: 'FOCUS_SESSION', projectId, sessionId: selectedSessionId });
  }

  const facadeHeight = layout.height + SPACE.roomHeight + 0.5;
  const facadeWidth = layout.width + 0.4;
  const facadeY = (layout.maxFloor - layout.minFloor) * SPACE.floorHeight * 0.5;

  return (
    <group
      ref={rootRef}
      onPointerOver={handleCollapsedPointerOver}
      onPointerOut={handleCollapsedPointerOut}
      onClick={handleCollapsedClick}
    >
      <group ref={roomsRef}>
        {layout.rooms.map((room) => (
          <ProjectRoom3D
            key={room.project.id}
            room={room}
            expanded={open}
            hoveredProjectId={hoveringProjectId}
            hoveredSessionId={hoveringSessionId}
            selectedProjectId={selectedProjectId}
            selectedSessionId={selectedSessionId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        ))}
      </group>

      <group ref={facadeRef}>
        <mesh position={[0, facadeY, SPACE.roomDepth / 2 + SPACE.facadeDepth / 2]}>
          <boxGeometry args={[facadeWidth, facadeHeight, SPACE.facadeDepth]} />
          <meshStandardMaterial color={COLORS.facade} roughness={0.68} />
        </mesh>
        <FacadeArchitecture
          facadeWidth={facadeWidth}
          facadeHeight={facadeHeight}
          facadeY={facadeY}
          topFloorY={(layout.maxFloor - layout.minFloor) * SPACE.floorHeight}
          style={layout.style}
        />
        <mesh position={[0, facadeY + facadeHeight / 2 + 0.13, SPACE.roomDepth / 2 + SPACE.facadeDepth / 2]}>
          <boxGeometry args={[facadeWidth + 0.24, 0.26, SPACE.facadeDepth + 0.05]} />
          <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.66} />
        </mesh>
        {layout.rooms.map((room) => {
          const agent = AGENTS[room.project.primaryAgentId];
          const attention = getProjectAttentionState(room.project);
          const highlighted = selectedProjectId === room.project.id;
          return (
            <group key={room.project.id}>
              <WindowLight
                position={[room.window.x, room.window.y, room.window.z]}
                color={agent.palette.accent}
                glow={agent.palette.glow}
                lit={attention.isLit}
                breathing={attention.isBreathing}
                highlighted={highlighted}
              />
              <FacadeRoomOrnaments
                project={room.project}
                x={room.window.x}
                y={room.window.y}
                z={room.window.z + 0.03}
              />
            </group>
          );
        })}
      </group>

      <mesh position={[0, -SPACE.roomHeight / 2 - 0.18, -0.08]}>
        <boxGeometry args={[facadeWidth + 0.8, 0.12, SPACE.roomDepth + 0.8]} />
        <meshStandardMaterial color={COLORS.ground} roughness={0.8} />
      </mesh>
      {!open && (
        <mesh position={[0, -SPACE.roomHeight / 2 - 0.28, -0.18]}>
          <boxGeometry args={[facadeWidth + 1.1, 0.035, SPACE.roomDepth + 1.1]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.28} />
        </mesh>
      )}
    </group>
  );
}

function FacadeArchitecture({
  facadeWidth,
  facadeHeight,
  facadeY,
  topFloorY,
  style,
}: {
  facadeWidth: number;
  facadeHeight: number;
  facadeY: number;
  topFloorY: number;
  style: 'villa' | 'mansion';
}) {
  const z = SPACE.roomDepth / 2 + SPACE.facadeDepth + 0.01;
  const columnCount = style === 'villa' ? 3 : 4;
  const columns = Array.from({ length: columnCount }, (_, index) => {
    const t = index / (columnCount - 1);
    return -facadeWidth / 2 + t * facadeWidth;
  });

  return (
    <group>
      <mesh position={[0, facadeY - facadeHeight / 2 + 0.18, z]}>
        <boxGeometry args={[facadeWidth + 0.36, 0.34, 0.12]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.62} />
      </mesh>
      {columns.map((x) => (
        <mesh key={x} position={[x, facadeY, z + 0.02]}>
          <boxGeometry args={[0.14, facadeHeight * 0.92, 0.08]} />
          <meshStandardMaterial color={COLORS.stone} roughness={0.64} />
        </mesh>
      ))}
      <mesh position={[0, topFloorY + SPACE.roomHeight / 2 + 0.42, z - 0.12]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[facadeWidth + 0.62, 0.72, 0.48]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, topFloorY + SPACE.roomHeight / 2 + 0.08, z + 0.04]}>
        <boxGeometry args={[facadeWidth + 0.74, 0.12, 0.2]} />
        <meshStandardMaterial color={COLORS.roofEdge} roughness={0.48} />
      </mesh>
      <mesh position={[0, topFloorY + SPACE.roomHeight / 2 + 0.78, z - 0.42]}>
        <boxGeometry args={[facadeWidth * 0.82, 0.08, 1.04]} />
        <meshStandardMaterial color="#5f8f90" roughness={0.34} metalness={0.08} />
      </mesh>
      <mesh position={[facadeWidth * 0.34, topFloorY + SPACE.roomHeight / 2 + 0.98, z - 0.72]}>
        <cylinderGeometry args={[0.11, 0.11, 0.52, 14]} />
        <meshStandardMaterial color={COLORS.copper} roughness={0.4} />
      </mesh>
      <mesh position={[facadeWidth * 0.44, topFloorY + SPACE.roomHeight / 2 + 1.08, z - 0.66]}>
        <cylinderGeometry args={[0.09, 0.09, 0.62, 14]} />
        <meshStandardMaterial color={COLORS.copper} roughness={0.4} />
      </mesh>
      {[-0.36, -0.22, 0.24].map((x, index) => (
        <mesh key={index} position={[facadeWidth * x, topFloorY + SPACE.roomHeight / 2 + 0.82, z - 0.3]}>
          <sphereGeometry args={[0.18, 14, 10]} />
          <meshStandardMaterial color={COLORS.foliage} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function FacadeRoomOrnaments({
  project,
  x,
  y,
  z,
}: {
  project: Project;
  x: number;
  y: number;
  z: number;
}) {
  const counts = getSessionAgentCounts(project);
  const agent = AGENTS[project.primaryAgentId];

  return (
    <group>
      {counts.cursor > 0 && (
        <group position={[x, y - 0.42, z + 0.03]}>
          <mesh>
            <boxGeometry args={[0.82, 0.08, 0.28]} />
            <meshStandardMaterial color={agent.palette.accent} roughness={0.58} />
          </mesh>
          {[-0.3, 0, 0.3].map((rail) => (
            <mesh key={rail} position={[rail, 0.14, 0.09]}>
              <boxGeometry args={[0.035, 0.26, 0.035]} />
              <meshStandardMaterial color={COLORS.roofEdge} roughness={0.45} />
            </mesh>
          ))}
        </group>
      )}

      {counts.codex > 0 &&
        Array.from({ length: Math.min(counts.codex, 2) }, (_, index) => (
          <group
            key={index}
            position={[x + (index === 0 ? -0.34 : 0.34), y + 0.42, z + 0.05]}
          >
            <mesh>
              <torusGeometry args={[0.12, 0.025, 8, 20]} />
              <meshStandardMaterial color={AGENTS.codex.palette.accent} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <circleGeometry args={[0.095, 20]} />
              <meshStandardMaterial
                color="#203332"
                emissive={AGENTS.codex.palette.glow}
                emissiveIntensity={0.16}
              />
            </mesh>
          </group>
        ))}

      {counts.manus > 0 && (
        <group position={[x - 0.48, y - 0.02, z + 0.05]}>
          {[0, 1, 2].map((index) => (
            <mesh key={index} position={[0.05 * index, 0.12 * index, 0]}>
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshStandardMaterial color={AGENTS.manus.palette.accent} roughness={0.72} />
            </mesh>
          ))}
        </group>
      )}

      {counts.claude > 0 && (
        <group position={[x, y + 0.34, z + 0.05]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.48, 0.08, 0.05]} />
            <meshStandardMaterial color={AGENTS.claude.palette.accent} roughness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.48, 0.08, 0.05]} />
            <meshStandardMaterial color={AGENTS.claude.palette.accent} roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}
