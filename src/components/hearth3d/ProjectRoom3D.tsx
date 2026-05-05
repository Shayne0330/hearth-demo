import type { ThreeEvent } from '@react-three/fiber';
import { AGENTS, getProjectAttentionState } from '../../data/projects';
import type { RoomLayout } from './layout';
import { COLORS, SPACE } from './spaceTokens';
import { SessionDesk3D } from './SessionDesk3D';

type ProjectRoom3DProps = {
  room: RoomLayout;
  expanded: boolean;
  hoveredProjectId?: string;
  hoveredSessionId?: string;
  selectedProjectId?: string;
  selectedSessionId?: string;
  onHover: (projectId?: string, sessionId?: string) => void;
  onSelect: (projectId: string, sessionId?: string) => void;
};

export function ProjectRoom3D({
  room,
  expanded,
  hoveredProjectId,
  hoveredSessionId,
  selectedProjectId,
  selectedSessionId,
  onHover,
  onSelect,
}: ProjectRoom3DProps) {
  const { project } = room;
  const agent = AGENTS[project.primaryAgentId];
  const attention = getProjectAttentionState(project);
  const hovered = hoveredProjectId === project.id;
  const selected = selectedProjectId === project.id;
  const dimmed = project.state === 'dusty' || project.state === 'dormant';
  const roomColor = selected || hovered ? agent.palette.wall : agent.palette.dim;
  const floorColor = project.state === 'dusty' ? '#473e39' : agent.palette.floor;

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onHover(project.id);
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onHover(undefined);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(project.id);
  }

  return (
    <group
      position={[room.x, room.y, room.z]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <mesh position={[0, -SPACE.roomHeight / 2, 0]}>
        <boxGeometry args={[room.width, SPACE.floorThickness, room.depth]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.72}
          emissive={attention.isLit ? agent.palette.glow : '#000000'}
          emissiveIntensity={attention.isLit ? 0.05 : 0}
        />
      </mesh>
      <mesh position={[0, 0, -room.depth / 2]}>
        <boxGeometry args={[room.width, room.height, SPACE.wallThickness]} />
        <meshStandardMaterial color={roomColor} roughness={0.68} />
      </mesh>
      <mesh position={[-room.width / 2, 0, 0]}>
        <boxGeometry args={[SPACE.wallThickness, room.height, room.depth]} />
        <meshStandardMaterial color={COLORS.roomBack} roughness={0.7} />
      </mesh>
      <mesh position={[room.width / 2, 0, 0]}>
        <boxGeometry args={[SPACE.wallThickness, room.height, room.depth]} />
        <meshStandardMaterial color={COLORS.roomBack} roughness={0.7} />
      </mesh>
      <mesh position={[0, room.height / 2, 0]}>
        <boxGeometry args={[room.width, SPACE.floorThickness, room.depth]} />
        <meshStandardMaterial color={COLORS.slab} roughness={0.74} />
      </mesh>

      {(selected || hovered || attention.isLit) && (
        <pointLight
          color={agent.palette.glow}
          intensity={selected ? 1.2 : attention.isLit ? 0.72 : 0.35}
          distance={4}
          position={[0, 0.35, 0.3]}
        />
      )}

      {project.state === 'dusty' && expanded && (
        <mesh position={[0, -SPACE.roomHeight / 2 + 0.09, 0.05]}>
          <boxGeometry args={[room.width * 0.76, 0.018, room.depth * 0.54]} />
          <meshStandardMaterial color="#d8d0bd" transparent opacity={0.22} />
        </mesh>
      )}

      {expanded &&
        room.desks.map((desk) => (
          <SessionDesk3D
            key={desk.session.id}
            project={project}
            session={desk.session}
            position={[desk.x, desk.y, desk.z]}
            hovered={hoveredSessionId === desk.session.id}
            selected={selected && selectedSessionId === desk.session.id}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}

      {expanded && project.sessions.length > 3 && (
        <mesh position={[room.width / 2 - 0.38, -SPACE.roomHeight / 2 + 0.32, 0.66]}>
          <boxGeometry args={[0.42, 0.2, 0.32]} />
          <meshStandardMaterial color={agent.palette.accent} roughness={0.5} />
        </mesh>
      )}

      <mesh position={[0, -SPACE.roomHeight / 2 + 0.012, room.depth / 2 - 0.02]}>
        <boxGeometry args={[room.width * 0.22, 0.026, 0.12]} />
        <meshStandardMaterial
          color={selected ? agent.palette.accent : dimmed ? '#5a5149' : agent.palette.glow}
          emissive={agent.palette.glow}
          emissiveIntensity={selected ? 0.35 : attention.isLit ? 0.18 : 0}
        />
      </mesh>
    </group>
  );
}
