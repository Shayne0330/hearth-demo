import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type MeshStandardMaterial } from 'three';
import type { Session } from '../../data/projects';
import { COLORS, SPACE } from './spaceTokens';

type DeskLampProps = {
  session: Session;
  glow: string;
  selected?: boolean;
};

export function DeskLamp({ session, glow, selected = false }: DeskLampProps) {
  const shadeRef = useRef<MeshStandardMaterial>(null);
  const bulbRef = useRef<MeshStandardMaterial>(null);
  const lit = session.unread || session.status === 'replied';
  const running = !lit && session.status === 'running';

  useFrame(({ clock }, delta) => {
    const pulse = 0.5 + Math.sin(clock.elapsedTime * (lit ? 3.2 : 1.6)) * 0.5;
    const target = lit ? 1.4 + pulse * 0.9 : running ? 0.28 + pulse * 0.18 : 0.02;
    if (shadeRef.current) {
      shadeRef.current.emissiveIntensity = MathUtils.damp(
        shadeRef.current.emissiveIntensity,
        selected ? target + 0.45 : target,
        8,
        delta,
      );
    }
    if (bulbRef.current) {
      bulbRef.current.emissiveIntensity = MathUtils.damp(
        bulbRef.current.emissiveIntensity,
        selected ? target + 0.8 : target + 0.25,
        8,
        delta,
      );
    }
  });

  return (
    <group position={[SPACE.deskWidth * 0.28, SPACE.deskHeight + 0.14, -SPACE.deskDepth * 0.2]}>
      <mesh position={[0, SPACE.lampHeight * 0.28, 0]}>
        <cylinderGeometry args={[0.028, 0.028, SPACE.lampHeight * 0.56, 8]} />
        <meshStandardMaterial color={COLORS.lampOff} roughness={0.45} />
      </mesh>
      <mesh position={[0, SPACE.lampHeight * 0.6, 0]}>
        <sphereGeometry args={[0.085, 16, 10]} />
        <meshStandardMaterial
          ref={bulbRef}
          color={lit ? glow : COLORS.lampOff}
          emissive={glow}
          emissiveIntensity={0.1}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, SPACE.lampHeight * 0.72, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.18, 0.2, 16]} />
        <meshStandardMaterial
          ref={shadeRef}
          color={lit ? glow : COLORS.lampOff}
          emissive={glow}
          emissiveIntensity={0}
          roughness={0.5}
        />
      </mesh>
      {(lit || running) && (
        <pointLight
          color={glow}
          intensity={lit ? 1.2 : 0.32}
          distance={2.2}
          position={[0, SPACE.lampHeight * 0.66, 0.04]}
        />
      )}
    </group>
  );
}
