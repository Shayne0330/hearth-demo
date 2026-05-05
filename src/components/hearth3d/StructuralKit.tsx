import type { RoomLayout } from './layout';
import { COLORS, SPACE } from './spaceTokens';

type StructuralKitProps = {
  rooms: RoomLayout[];
};

function getRoomsByTier(rooms: RoomLayout[]) {
  const ground = rooms
    .filter((room) => room.y < SPACE.floorHeight * 0.5)
    .sort((a, b) => a.x - b.x);
  const middle = rooms.find(
    (room) =>
      room.y >= SPACE.floorHeight * 0.5 &&
      room.y < SPACE.floorHeight * 1.5,
  );
  const top = rooms
    .filter((room) => room.y >= SPACE.floorHeight * 1.5)
    .sort((a, b) => a.x - b.x);

  return { ground, middle, top };
}

function roomTopY(room: RoomLayout) {
  return room.y + room.height / 2;
}

function roomBottomY(room: RoomLayout) {
  return room.y - room.height / 2;
}

function roomFrontZ(room: RoomLayout) {
  return room.z + room.depth / 2;
}

export function StructuralKit({ rooms }: StructuralKitProps) {
  const { ground, middle, top } = getRoomsByTier(rooms);
  const leftGround = ground[0];
  const centerGround = ground[1];
  const rightGround = ground[2];
  const leftTop = top[0];
  const rightTop = top[1];

  return (
    <group>
      {middle && (
        <>
          <ShortSupportColumns
            x={middle.x}
            z={middle.z + middle.depth / 2 - 0.22}
            bottomY={SPACE.roomHeight / 2 + 0.1}
            topY={middle.y - middle.height / 2}
            width={middle.width}
          />
          <Railing
            x={middle.x - 0.2}
            y={middle.y - middle.height / 2 + 0.18}
            z={middle.z + middle.depth / 2 + 0.28}
            width={middle.width * 0.78}
            depth={0.42}
            openSide="back"
          />
        </>
      )}

      {leftTop && (
        <HighSupportColumns
          x={leftTop.x}
          z={leftTop.z + leftTop.depth / 2 - 0.2}
          bottomY={SPACE.roomHeight / 2 + 0.08}
          topY={roomBottomY(leftTop)}
          width={leftTop.width}
        />
      )}

      {rightTop && (
        <>
          <HighSupportColumns
            x={rightTop.x}
            z={rightTop.z + rightTop.depth / 2 - 0.18}
            bottomY={SPACE.roomHeight / 2 + 0.08}
            topY={roomBottomY(rightTop)}
            width={rightTop.width}
          />
          <Railing
            x={rightTop.x}
            y={rightTop.y - rightTop.height / 2 + 0.2}
            z={rightTop.z + rightTop.depth / 2 + 0.34}
            width={rightTop.width * 0.86}
            depth={0.48}
            openSide="left"
          />
        </>
      )}

      {centerGround && rightTop && (
        <Staircase
          x={centerGround.x + centerGround.width * 0.52}
          y={roomTopY(centerGround) + 0.08}
          z={roomFrontZ(centerGround) + 0.5}
          rise={rightTop.y - centerGround.y - 0.82}
          runX={rightTop.x - centerGround.x - 0.52}
          runZ={roomFrontZ(rightTop) - roomFrontZ(centerGround) - 0.26}
        />
      )}

      {leftGround && middle && (
        <Staircase
          x={leftGround.x + leftGround.width * 0.38}
          y={roomTopY(leftGround) + 0.08}
          z={roomFrontZ(leftGround) + 0.48}
          rise={middle.y - leftGround.y - 0.86}
          runX={middle.x - leftGround.x - 0.62}
          runZ={roomFrontZ(middle) - roomFrontZ(leftGround) - 0.18}
        />
      )}

      {middle && leftTop && (
        <Staircase
          x={middle.x - middle.width * 0.06}
          y={roomTopY(middle) + 0.08}
          z={roomFrontZ(middle) + 0.46}
          rise={leftTop.y - middle.y - 0.86}
          runX={leftTop.x - middle.x - 0.18}
          runZ={roomFrontZ(leftTop) - roomFrontZ(middle) - 0.18}
        />
      )}

      {rightGround && (
        <>
          <Railing
            x={rightGround.x + 0.06}
            y={roomTopY(rightGround) + 0.22}
            z={roomFrontZ(rightGround) + 0.3}
            width={rightGround.width * 0.9}
            depth={0.52}
            openSide="left"
          />
          <Planter
            variant="tree"
            x={rightGround.x}
            y={roomTopY(rightGround) + 0.1}
            z={rightGround.z}
          />
        </>
      )}

      {centerGround && (
        <Planter
          variant="bench"
          x={centerGround.x - centerGround.width * 0.22}
          y={roomTopY(centerGround) + 0.08}
          z={roomFrontZ(centerGround) - 0.22}
        />
      )}

      {leftGround && (
        <PlanterRow
          x={leftGround.x - leftGround.width * 0.2}
          y={roomTopY(leftGround) + 0.08}
          z={roomFrontZ(leftGround) - 0.12}
          count={3}
        />
      )}
    </group>
  );
}

function ShortSupportColumns({
  x,
  z,
  bottomY,
  topY,
  width,
}: {
  x: number;
  z: number;
  bottomY: number;
  topY: number;
  width: number;
}) {
  const height = Math.max(0.2, topY - bottomY);
  return (
    <group>
      {[-width * 0.35, width * 0.35].map((offset) => (
        <mesh key={offset} position={[x + offset, bottomY + height / 2, z]}>
          <cylinderGeometry args={[0.055, 0.065, height, 12]} />
          <meshStandardMaterial color={COLORS.stone} roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function HighSupportColumns({
  x,
  z,
  bottomY,
  topY,
  width,
}: {
  x: number;
  z: number;
  bottomY: number;
  topY: number;
  width: number;
}) {
  const height = Math.max(SPACE.roomHeight + 0.24, topY - bottomY);
  return (
    <group>
      {[-width * 0.36, width * 0.36].map((offset) => (
        <mesh key={offset} position={[x + offset, bottomY + height / 2, z]}>
          <boxGeometry args={[0.1, height, 0.1]} />
          <meshStandardMaterial color={COLORS.stone} roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function Staircase({
  x,
  y,
  z,
  rise,
  runX,
  runZ,
}: {
  x: number;
  y: number;
  z: number;
  rise: number;
  runX: number;
  runZ: number;
}) {
  const stepCount = 7;
  return (
    <group>
      {Array.from({ length: stepCount }, (_, index) => {
        const t = index / (stepCount - 1);
        return (
          <mesh key={index} position={[x + runX * t, y + rise * t, z + runZ * t]}>
            <boxGeometry args={[0.52, 0.09, 0.34]} />
            <meshStandardMaterial color={COLORS.stone} roughness={0.64} />
          </mesh>
        );
      })}
      <mesh position={[x + runX * 0.5, y + rise * 0.5 + 0.26, z + runZ * 0.5 + 0.24]}>
        <boxGeometry args={[Math.max(0.8, Math.abs(runX) + 0.18), 0.055, 0.07]} />
        <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.46} />
      </mesh>
      {[0, 0.5, 1].map((t) => (
        <mesh key={t} position={[x + runX * t, y + rise * t + 0.14, z + runZ * t + 0.22]}>
          <boxGeometry args={[0.05, 0.34, 0.05]} />
          <meshStandardMaterial color={COLORS.roofEdge} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Railing({
  x,
  y,
  z,
  width,
  depth,
  openSide,
}: {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  openSide: 'left' | 'right' | 'back';
}) {
  const postY = y + 0.18;
  const railY = y + 0.36;
  const postPositions = [
    [-width / 2, 0],
    [0, 0],
    [width / 2, 0],
    [-width / 2, -depth],
    [width / 2, -depth],
  ].filter(([px, pz]) => {
    if (openSide === 'left') return px > -width / 2 || pz === 0;
    if (openSide === 'right') return px < width / 2 || pz === 0;
    return pz > -depth;
  });

  return (
    <group position={[x, 0, z]}>
      {postPositions.map(([px, pz]) => (
        <mesh key={`${px}-${pz}`} position={[px, postY, pz]}>
          <boxGeometry args={[0.045, 0.36, 0.045]} />
          <meshStandardMaterial color={COLORS.roofEdge} roughness={0.5} />
        </mesh>
      ))}
      {openSide !== 'back' && (
        <mesh position={[0, railY, 0]}>
          <boxGeometry args={[width + 0.08, 0.055, 0.055]} />
          <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.48} />
        </mesh>
      )}
      {openSide !== 'left' && (
        <mesh position={[-width / 2, railY, -depth / 2]}>
          <boxGeometry args={[0.055, 0.055, depth + 0.08]} />
          <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.48} />
        </mesh>
      )}
      {openSide !== 'right' && (
        <mesh position={[width / 2, railY, -depth / 2]}>
          <boxGeometry args={[0.055, 0.055, depth + 0.08]} />
          <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.48} />
        </mesh>
      )}
    </group>
  );
}

function PlanterRow({
  x,
  y,
  z,
  count,
}: {
  x: number;
  y: number;
  z: number;
  count: number;
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <Planter
          key={index}
          variant="small"
          x={x + index * 0.48}
          y={y}
          z={z}
        />
      ))}
    </group>
  );
}

function Planter({
  x,
  y,
  z,
  variant,
}: {
  x: number;
  y: number;
  z: number;
  variant: 'small' | 'tree' | 'bench';
}) {
  if (variant === 'tree') {
    return (
      <group position={[x, y, z]}>
        <mesh>
          <cylinderGeometry args={[0.34, 0.38, 0.2, 18]} />
          <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.42, 10]} />
          <meshStandardMaterial color="#7b4a2d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.28, 14, 10]} />
          <meshStandardMaterial color={COLORS.foliage} roughness={0.76} />
        </mesh>
        <mesh position={[-0.18, 0.46, 0.04]}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshStandardMaterial color="#d08a45" roughness={0.76} />
        </mesh>
        <mesh position={[0.17, 0.48, -0.02]}>
          <sphereGeometry args={[0.19, 12, 8]} />
          <meshStandardMaterial color={COLORS.foliage} roughness={0.76} />
        </mesh>
      </group>
    );
  }

  if (variant === 'bench') {
    return (
      <group position={[x, y, z]}>
        <mesh>
          <boxGeometry args={[0.82, 0.16, 0.32]} />
          <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.68} />
        </mesh>
        <mesh position={[-0.2, 0.15, 0]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color={COLORS.foliage} roughness={0.76} />
        </mesh>
        <mesh position={[0.02, 0.18, 0.02]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial color="#d08a45" roughness={0.76} />
        </mesh>
        <mesh position={[0.22, 0.09, 0.28]}>
          <boxGeometry args={[0.56, 0.08, 0.14]} />
          <meshStandardMaterial color="#8b5a35" roughness={0.62} />
        </mesh>
        <mesh position={[0.22, 0.2, 0.37]} rotation={[0.32, 0, 0]}>
          <boxGeometry args={[0.56, 0.06, 0.18]} />
          <meshStandardMaterial color="#8b5a35" roughness={0.62} />
        </mesh>
        {[-0.03, 0.47].map((offset) => (
          <mesh key={offset} position={[offset, 0.005, 0.28]}>
            <boxGeometry args={[0.04, 0.14, 0.04]} />
            <meshStandardMaterial color={COLORS.roofEdge} roughness={0.5} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[0.54, 0.16, 0.24]} />
        <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.68} />
      </mesh>
      {[-0.16, 0, 0.16].map((offset, index) => (
        <mesh key={offset} position={[offset, 0.13 + index * 0.02, 0]}>
          <sphereGeometry args={[0.105, 10, 8]} />
          <meshStandardMaterial color={index === 1 ? '#d08a45' : COLORS.foliage} roughness={0.76} />
        </mesh>
      ))}
    </group>
  );
}
