import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type MeshStandardMaterial } from 'three';
import { COLORS, SPACE } from './spaceTokens';

type WindowLightProps = {
  color: string;
  glow: string;
  lit: boolean;
  breathing: boolean;
  highlighted?: boolean;
  position: [number, number, number];
};

export function WindowLight({
  color,
  glow,
  lit,
  breathing,
  highlighted = false,
  position,
}: WindowLightProps) {
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }, delta) => {
    const pulse = 0.5 + Math.sin(clock.elapsedTime * (lit ? 2.5 : 1.4)) * 0.5;
    const target = lit
      ? 1.1 + pulse * 0.75
      : breathing
        ? 0.18 + pulse * 0.12
        : 0.02;
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = MathUtils.damp(
        materialRef.current.emissiveIntensity,
        highlighted ? target + 0.35 : target,
        8,
        delta,
      );
    }
  });

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[SPACE.windowWidth, SPACE.windowHeight, 0.035]} />
        <meshStandardMaterial
          ref={materialRef}
          color={lit || breathing ? color : COLORS.roofEdge}
          emissive={glow}
          emissiveIntensity={0}
          roughness={0.42}
        />
      </mesh>
      <mesh position={[0, 0, -0.023]}>
        <boxGeometry args={[SPACE.windowWidth + 0.12, SPACE.windowHeight + 0.12, 0.025]} />
        <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.65} />
      </mesh>
    </group>
  );
}
