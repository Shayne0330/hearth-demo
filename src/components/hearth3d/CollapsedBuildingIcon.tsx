import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { MathUtils, type Group } from 'three';
import {
  AGENTS,
  getProjectAttentionState,
  type AgentId,
  type Project,
} from '../../data/projects';
import type { HearthViewState } from './Hearth3D';
import { createBuildingLayout } from './layout';
import { COLORS } from './spaceTokens';

type CollapsedBuildingIconProps = {
  projects: Project[];
  viewState: HearthViewState;
};

type IconRoom = {
  project?: Project;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  shape: 'tall' | 'wide' | 'round';
  floating?: boolean;
};

const ICON_ROOM_SLOTS: Array<Omit<IconRoom, 'project'>> = [
  { x: -1.34, y: -0.94, z: 0.14, width: 1.16, height: 0.82, shape: 'tall' },
  { x: 0, y: -0.94, z: 0.08, width: 1.18, height: 0.82, shape: 'wide' },
  { x: 1.34, y: -0.94, z: 0.02, width: 1.16, height: 0.82, shape: 'tall' },
  { x: -0.12, y: -0.06, z: -0.5, width: 1.18, height: 0.84, shape: 'round', floating: true },
  { x: -0.8, y: 0.82, z: 0.34, width: 1.08, height: 0.78, shape: 'wide', floating: true },
  { x: 0.72, y: 0.82, z: -0.78, width: 1.08, height: 0.78, shape: 'tall', floating: true },
];

function getSessionCounts(project?: Project) {
  return (project?.sessions ?? []).reduce(
    (acc, session) => {
      acc[session.agentId] += 1;
      return acc;
    },
    { cursor: 0, codex: 0, manus: 0, claude: 0 } satisfies Record<AgentId, number>,
  );
}

export function CollapsedBuildingIcon({
  projects,
  viewState,
}: CollapsedBuildingIconProps) {
  const rootRef = useRef<Group>(null);
  const iconRooms = useMemo<IconRoom[]>(() => {
    const layoutProjects = createBuildingLayout(projects).rooms.map((room) => room.project);
    return ICON_ROOM_SLOTS.map((room, index) => ({
      ...room,
      project: layoutProjects[index],
    }));
  }, [projects]);

  useFrame((_, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const preview = viewState.type === 'previewing-collapsed';
    const targetScale = preview ? 1.06 : 1;
    root.scale.x = MathUtils.damp(root.scale.x, targetScale, 7, delta);
    root.scale.y = MathUtils.damp(root.scale.y, targetScale, 7, delta);
    root.scale.z = MathUtils.damp(root.scale.z, targetScale, 7, delta);
    root.rotation.y = MathUtils.damp(root.rotation.y, -0.28, 5, delta);
  });

  return (
    <group ref={rootRef} position={[0, -0.16, 0]}>
      <Base />
      <BackServiceWall />
      {iconRooms.map((room, index) => (
        <IconRoomBlock key={index} room={room} />
      ))}
      <SkyTerrace />
    </group>
  );
}

function Base() {
  return (
    <group>
      <mesh position={[0, -1.46, -0.08]}>
        <boxGeometry args={[4.46, 0.14, 1.42]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.66} />
      </mesh>
      <mesh position={[0.12, -1.56, -0.2]}>
        <boxGeometry args={[4.7, 0.08, 1.62]} />
        <meshStandardMaterial color={COLORS.ground} roughness={0.72} />
      </mesh>
      <mesh position={[0.26, -1.66, -0.34]}>
        <boxGeometry args={[4.94, 0.05, 1.86]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

function BackServiceWall() {
  return (
    <group position={[-1.96, -0.02, -0.64]}>
      <mesh>
        <boxGeometry args={[0.24, 2.7, 0.3]} />
        <meshStandardMaterial color={COLORS.roomBack} roughness={0.76} />
      </mesh>
      <mesh position={[0, 1.42, 0.08]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.32, 0.72, 0.36]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.52} />
      </mesh>
      {[-0.78, 0.08, 0.86].map((y) => (
        <mesh key={y} position={[0.14, y, 0.19]}>
          <boxGeometry args={[0.08, 0.1, 0.12]} />
          <meshStandardMaterial color={COLORS.stone} roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function IconRoomBlock({ room }: { room: IconRoom }) {
  const agent = room.project ? AGENTS[room.project.primaryAgentId] : AGENTS.cursor;
  const wallColor = room.project ? agent.palette.facade : AGENTS.cursor.palette.facade;
  const sideColor = room.project ? agent.palette.dim : AGENTS.cursor.palette.dim;
  const capColor = room.project ? agent.palette.floor : AGENTS.cursor.palette.floor;

  return (
    <group position={[room.x, room.y, room.z]}>
      {room.floating && <SupportColumns room={room} />}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[room.width, room.height, 0.42]} />
        <meshStandardMaterial color={wallColor} roughness={0.72} />
      </mesh>
      <mesh position={[room.width / 2 + 0.045, 0, -0.08]}>
        <boxGeometry args={[0.09, room.height, 0.52]} />
        <meshStandardMaterial color={sideColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, -room.height / 2 - 0.05, 0.06]}>
        <boxGeometry args={[room.width + 0.22, 0.1, 0.58]} />
        <meshStandardMaterial color={COLORS.roofEdge} roughness={0.56} />
      </mesh>
      <mesh position={[0, room.height / 2 + 0.07, 0.02]}>
        <boxGeometry args={[room.width + 0.18, 0.12, 0.6]} />
        <meshStandardMaterial color={capColor} roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[0, room.height / 2 + 0.15, 0.18]}>
        <boxGeometry args={[room.width + 0.08, 0.06, 0.22]} />
        <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.58} />
      </mesh>
      <IconWindow room={room} />
    </group>
  );
}

function SupportColumns({ room }: { room: IconRoom }) {
  return (
    <group position={[0, -room.height / 2 - 0.26, 0.18]}>
      {[-room.width * 0.34, room.width * 0.34].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.07, 0.48, 0.07]} />
          <meshStandardMaterial color={COLORS.stone} roughness={0.64} />
        </mesh>
      ))}
    </group>
  );
}

function SkyTerrace() {
  return (
    <group position={[-0.02, 1.43, -0.24]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 0.1, 0.78]} />
        <meshStandardMaterial color={AGENTS.cursor.palette.wall} roughness={0.42} metalness={0.04} />
      </mesh>
      <mesh position={[-1.02, 0.16, 0.16]}>
        <sphereGeometry args={[0.15, 14, 10]} />
        <meshStandardMaterial color={COLORS.foliage} roughness={0.76} />
      </mesh>
      <mesh position={[-0.78, 0.17, 0.1]}>
        <sphereGeometry args={[0.12, 14, 10]} />
        <meshStandardMaterial color={AGENTS.manus.palette.accent} roughness={0.76} />
      </mesh>
      <mesh position={[0.96, 0.24, -0.1]}>
        <cylinderGeometry args={[0.08, 0.08, 0.48, 14]} />
        <meshStandardMaterial color={COLORS.copper} roughness={0.48} />
      </mesh>
      <mesh position={[1.18, 0.3, -0.02]}>
        <cylinderGeometry args={[0.07, 0.07, 0.56, 14]} />
        <meshStandardMaterial color={COLORS.copper} roughness={0.48} />
      </mesh>
    </group>
  );
}

function IconWindow({ room }: { room: IconRoom }) {
  const project = room.project;
  const agent = project ? AGENTS[project.primaryAgentId] : AGENTS.cursor;
  const attention = project ? getProjectAttentionState(project) : undefined;
  const lit = Boolean(attention?.isLit);
  const breathing = Boolean(attention?.isBreathing);
  const counts = getSessionCounts(project);
  const glow = lit ? agent.palette.glow : breathing ? agent.palette.accent : COLORS.slabEdge;
  const emissiveIntensity = lit ? 0.9 : breathing ? 0.18 : 0.02;
  const faceZ = 0.24;

  return (
    <group position={[0, -0.02, faceZ]}>
      {room.shape === 'round' ? (
        <>
          <mesh>
            <torusGeometry args={[0.18, 0.04, 10, 24]} />
            <meshStandardMaterial color={AGENTS.codex.palette.accent} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0, -0.015]}>
            <circleGeometry args={[0.145, 24]} />
            <meshStandardMaterial
              color={glow}
              emissive={agent.palette.glow}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        </>
      ) : (
        <>
          <mesh>
            <boxGeometry args={[room.shape === 'wide' ? 0.5 : 0.34, room.shape === 'wide' ? 0.28 : 0.46, 0.04]} />
            <meshStandardMaterial
              color={glow}
              emissive={agent.palette.glow}
              emissiveIntensity={emissiveIntensity}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0, -0.035]}>
            <boxGeometry args={[room.shape === 'wide' ? 0.6 : 0.44, room.shape === 'wide' ? 0.38 : 0.56, 0.04]} />
            <meshStandardMaterial color={agent.palette.accent} roughness={0.58} />
          </mesh>
        </>
      )}

      {lit && (
        <pointLight color={agent.palette.glow} intensity={0.55} distance={1.1} position={[0, 0, 0.16]} />
      )}

      {counts.cursor > 0 && (
        <group position={[0, -0.34, 0.06]}>
          <mesh>
            <boxGeometry args={[0.58, 0.06, 0.2]} />
            <meshStandardMaterial color={AGENTS.cursor.palette.accent} roughness={0.55} />
          </mesh>
          {[-0.2, 0, 0.2].map((x) => (
            <mesh key={x} position={[x, 0.1, 0.07]}>
              <boxGeometry args={[0.026, 0.18, 0.026]} />
              <meshStandardMaterial color={COLORS.roofEdge} roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}

      {counts.codex > 1 && (
        <mesh position={[0.32, 0.26, 0.06]}>
          <torusGeometry args={[0.09, 0.022, 8, 18]} />
          <meshStandardMaterial color={AGENTS.codex.palette.accent} roughness={0.42} />
        </mesh>
      )}

      {counts.manus > 0 && (
        <group position={[-0.34, 0.02, 0.06]}>
          {[0, 1, 2].map((index) => (
            <mesh key={index} position={[0.04 * index, 0.08 * index, 0]}>
              <sphereGeometry args={[0.075, 10, 8]} />
              <meshStandardMaterial color={AGENTS.manus.palette.accent} roughness={0.75} />
            </mesh>
          ))}
        </group>
      )}

      {counts.claude > 0 && (
        <group position={[0, 0.31, 0.06]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.38, 0.055, 0.04]} />
            <meshStandardMaterial color={AGENTS.claude.palette.accent} roughness={0.48} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.38, 0.055, 0.04]} />
            <meshStandardMaterial color={AGENTS.claude.palette.accent} roughness={0.48} />
          </mesh>
        </group>
      )}
    </group>
  );
}
