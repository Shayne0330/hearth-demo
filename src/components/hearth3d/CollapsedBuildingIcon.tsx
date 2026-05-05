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
import { COLORS } from './spaceTokens';

type CollapsedBuildingIconProps = {
  projects: Project[];
  viewState: HearthViewState;
};

type IconRoom = {
  project?: Project;
  x: number;
  y: number;
  shape: 'tall' | 'wide' | 'round';
};

const ICON_ROOMS: Array<Omit<IconRoom, 'project'>> = [
  { x: -1.35, y: -0.82, shape: 'tall' },
  { x: -0.45, y: -0.82, shape: 'wide' },
  { x: 0.45, y: -0.82, shape: 'tall' },
  { x: 1.35, y: -0.82, shape: 'wide' },
  { x: -1.35, y: 0.02, shape: 'wide' },
  { x: -0.45, y: 0.02, shape: 'round' },
  { x: 0.45, y: 0.02, shape: 'wide' },
  { x: 1.35, y: 0.02, shape: 'tall' },
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
  const iconRooms = useMemo<IconRoom[]>(
    () =>
      ICON_ROOMS.map((room, index) => ({
        ...room,
        project: projects.filter((project) => project.state !== 'archived')[index],
      })),
    [projects],
  );

  useFrame((_, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const preview = viewState.type === 'previewing-collapsed';
    const targetScale = preview ? 1.06 : 1;
    root.scale.x = MathUtils.damp(root.scale.x, targetScale, 7, delta);
    root.scale.y = MathUtils.damp(root.scale.y, targetScale, 7, delta);
    root.scale.z = MathUtils.damp(root.scale.z, targetScale, 7, delta);
    root.rotation.y = MathUtils.damp(root.rotation.y, -0.22, 5, delta);
  });

  return (
    <group ref={rootRef} position={[0, -0.2, 0]}>
      <group rotation={[0, 0, 0]}>
        <Base />
        <MainFacade />
        <RoofGarden />
        {iconRooms.map((room, index) => (
          <IconWindow key={index} room={room} />
        ))}
        <SideWing />
      </group>
    </group>
  );
}

function Base() {
  return (
    <group>
      <mesh position={[0, -1.42, 0]}>
        <boxGeometry args={[4.35, 0.16, 1.06]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.66} />
      </mesh>
      <mesh position={[0.12, -1.52, -0.06]}>
        <boxGeometry args={[4.62, 0.08, 1.24]} />
        <meshStandardMaterial color="#7a6a5b" roughness={0.72} />
      </mesh>
      <mesh position={[0.2, -1.62, -0.14]}>
        <boxGeometry args={[4.9, 0.05, 1.38]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

function MainFacade() {
  return (
    <group>
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[4.08, 1.98, 0.32]} />
        <meshStandardMaterial color="#60372c" roughness={0.72} />
      </mesh>
      {[-1.86, -0.68, 0.68, 1.86].map((x) => (
        <mesh key={x} position={[x, -0.42, 0.18]}>
          <boxGeometry args={[0.08, 1.9, 0.08]} />
          <meshStandardMaterial color="#d4c1a6" roughness={0.62} />
        </mesh>
      ))}
      <mesh position={[0, -1.02, 0.22]}>
        <boxGeometry args={[4.22, 0.08, 0.14]} />
        <meshStandardMaterial color="#171b2b" roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.48, 0.24]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[4.46, 0.54, 0.52]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.2, 0.36]}>
        <boxGeometry args={[4.68, 0.12, 0.18]} />
        <meshStandardMaterial color={COLORS.roofEdge} roughness={0.5} />
      </mesh>
    </group>
  );
}

function RoofGarden() {
  return (
    <group position={[0, 0.98, -0.16]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.78, 0.12, 0.82]} />
        <meshStandardMaterial color="#6e9fa0" roughness={0.42} metalness={0.04} />
      </mesh>
      <mesh position={[-1.12, 0.14, 0.18]}>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color={COLORS.foliage} roughness={0.76} />
      </mesh>
      <mesh position={[-0.86, 0.16, 0.12]}>
        <sphereGeometry args={[0.13, 14, 10]} />
        <meshStandardMaterial color="#d08a45" roughness={0.76} />
      </mesh>
      <mesh position={[1.18, 0.24, -0.18]}>
        <cylinderGeometry args={[0.08, 0.08, 0.48, 14]} />
        <meshStandardMaterial color={COLORS.copper} roughness={0.48} />
      </mesh>
      <mesh position={[1.42, 0.3, -0.1]}>
        <cylinderGeometry args={[0.07, 0.07, 0.56, 14]} />
        <meshStandardMaterial color={COLORS.copper} roughness={0.48} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.1]}>
        <torusGeometry args={[0.14, 0.025, 8, 24]} />
        <meshStandardMaterial color="#f4d4a3" roughness={0.48} />
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
  const glow = lit ? agent.palette.glow : breathing ? agent.palette.accent : '#2f2925';
  const emissiveIntensity = lit ? 0.9 : breathing ? 0.18 : 0.02;

  return (
    <group position={[room.x, room.y, 0.42]}>
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
            <boxGeometry args={[room.shape === 'wide' ? 0.48 : 0.34, room.shape === 'wide' ? 0.28 : 0.48, 0.04]} />
            <meshStandardMaterial
              color={glow}
              emissive={agent.palette.glow}
              emissiveIntensity={emissiveIntensity}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0, -0.035]}>
            <boxGeometry args={[room.shape === 'wide' ? 0.58 : 0.44, room.shape === 'wide' ? 0.38 : 0.58, 0.04]} />
            <meshStandardMaterial color={agent.palette.accent} roughness={0.58} />
          </mesh>
        </>
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
              <meshStandardMaterial color="#171b2b" roughness={0.5} />
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

function SideWing() {
  return (
    <group position={[2.22, -0.42, -0.22]} rotation={[0, -0.12, 0]}>
      <mesh>
        <boxGeometry args={[0.64, 1.76, 0.72]} />
        <meshStandardMaterial color="#4b302b" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.52, 0.12]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.82, 0.42, 0.78]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.56, 0.38]}>
        <boxGeometry args={[0.42, 0.5, 0.04]} />
        <meshStandardMaterial color="#201c22" roughness={0.5} />
      </mesh>
    </group>
  );
}
