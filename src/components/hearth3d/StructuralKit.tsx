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

function getShortSupportHeight() {
  return SPACE.floorHeight - SPACE.roomHeight - 0.1;
}

export function StructuralKit({ rooms }: StructuralKitProps) {
  const { ground, middle, top } = getRoomsByTier(rooms);
  const leftGround = ground[0];
  const centerGround = ground[1];
  const rightGround = ground[2];
  const leftTop = top[0];
  const rightTop = top[1];
  const ladderHeight = SPACE.roomHeight + getShortSupportHeight();

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

      {leftTop && leftGround && (
        <HighSupportColumns
          x={leftTop.x}
          z={roomFrontZ(leftGround) - 0.18}
          bottomY={roomTopY(leftGround) + 0.06}
          topY={roomBottomY(leftTop)}
          width={leftTop.width}
        />
      )}

      {rightTop && (
        <Railing
          x={rightTop.x}
          y={rightTop.y - rightTop.height / 2 + 0.2}
          z={rightTop.z + rightTop.depth / 2 + 0.34}
          width={rightTop.width * 0.86}
          depth={0.48}
          openSide="left"
        />
      )}

      {leftGround && (
        <ExteriorLadder
          x={leftGround.x + leftGround.width * 0.5 + 0.08}
          bottomY={roomTopY(leftGround) + 0.08}
          topY={roomTopY(leftGround) + 0.08 + ladderHeight}
          z={roomFrontZ(leftGround) + 0.08}
        />
      )}

      {rightGround && (
        <ExteriorLadder
          x={rightGround.x - rightGround.width * 0.5 + 0.12}
          bottomY={roomTopY(rightGround) + 0.08}
          topY={roomTopY(rightGround) + 0.08 + ladderHeight}
          z={roomFrontZ(rightGround) + 0.16}
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

function ExteriorLadder({
  x,
  bottomY,
  topY,
  z,
}: {
  x: number;
  bottomY: number;
  topY: number;
  z: number;
}) {
  const height = Math.max(0.5, topY - bottomY);
  const rungCount = 5;
  const railGap = 0.34;
  const railY = bottomY + height / 2;

  return (
    <group position={[x, 0, z]}>
      {[-railGap / 2, railGap / 2].map((offset) => (
        <mesh key={offset} position={[offset, railY, 0]}>
          <boxGeometry args={[0.055, height, 0.055]} />
          <meshStandardMaterial color={COLORS.roofEdge} roughness={0.5} />
        </mesh>
      ))}
      {Array.from({ length: rungCount }, (_, index) => {
        const t = index / (rungCount - 1);
        return (
          <mesh key={index} position={[0, bottomY + height * t, 0.03]}>
            <boxGeometry args={[railGap + 0.16, 0.045, 0.055]} />
            <meshStandardMaterial color={COLORS.facadeTrim} roughness={0.48} />
          </mesh>
        );
      })}
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
          <meshStandardMaterial color={COLORS.copper} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.28, 14, 10]} />
          <meshStandardMaterial color={COLORS.foliage} roughness={0.76} />
        </mesh>
        <mesh position={[-0.18, 0.46, 0.04]}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshStandardMaterial color={COLORS.copper} roughness={0.76} />
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
          <meshStandardMaterial color={COLORS.copper} roughness={0.76} />
        </mesh>
        <mesh position={[0.22, 0.09, 0.28]}>
          <boxGeometry args={[0.56, 0.08, 0.14]} />
          <meshStandardMaterial color={COLORS.desk} roughness={0.62} />
        </mesh>
        <mesh position={[0.22, 0.2, 0.37]} rotation={[0.32, 0, 0]}>
          <boxGeometry args={[0.56, 0.06, 0.18]} />
          <meshStandardMaterial color={COLORS.desk} roughness={0.62} />
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
          <meshStandardMaterial color={index === 1 ? COLORS.copper : COLORS.foliage} roughness={0.76} />
        </mesh>
      ))}
    </group>
  );
}
