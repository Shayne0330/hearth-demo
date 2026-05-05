import type { ThreeEvent } from '@react-three/fiber';
import { AGENTS, type Project, type Session } from '../../data/projects';
import { COLORS, SPACE } from './spaceTokens';
import { DeskLamp } from './DeskLamp';

type SessionDesk3DProps = {
  project: Project;
  session: Session;
  position: [number, number, number];
  hovered?: boolean;
  selected?: boolean;
  onHover: (projectId?: string, sessionId?: string) => void;
  onSelect: (projectId: string, sessionId: string) => void;
};

export function SessionDesk3D({
  project,
  session,
  position,
  hovered = false,
  selected = false,
  onHover,
  onSelect,
}: SessionDesk3DProps) {
  const agent = AGENTS[session.agentId];
  const active = session.unread || session.status === 'replied';

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onHover(project.id, session.id);
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onHover(project.id);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(project.id, session.id);
  }

  return (
    <group
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <mesh position={[0, SPACE.deskHeight / 2, 0]}>
        <boxGeometry args={[SPACE.deskWidth, SPACE.deskHeight, SPACE.deskDepth]} />
        <meshStandardMaterial
          color={hovered || selected ? agent.palette.accent : COLORS.desk}
          roughness={0.58}
        />
      </mesh>
      <mesh position={[0, SPACE.deskHeight + 0.022, 0.02]}>
        <boxGeometry args={[SPACE.deskWidth * 0.86, 0.024, SPACE.deskDepth * 0.72]} />
        <meshStandardMaterial
          color={active ? COLORS.paper : agent.palette.dim}
          emissive={active ? agent.palette.glow : '#000000'}
          emissiveIntensity={active ? 0.18 : 0}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[-0.2, SPACE.deskHeight + 0.13, -0.1]}>
        <boxGeometry args={[0.22, 0.18, 0.035]} />
        <meshStandardMaterial color="#15161b" roughness={0.36} />
      </mesh>
      <mesh position={[-0.2, SPACE.deskHeight + 0.135, -0.079]}>
        <boxGeometry args={[0.16, 0.105, 0.01]} />
        <meshStandardMaterial
          color={agent.palette.dim}
          emissive={agent.palette.accent}
          emissiveIntensity={session.status === 'running' ? 0.28 : 0.08}
        />
      </mesh>
      <DeskLamp session={session} glow={agent.palette.glow} selected={selected} />
    </group>
  );
}
