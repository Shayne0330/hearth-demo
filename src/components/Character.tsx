import { motion, type MotionValue } from 'framer-motion';

type CharacterProps = {
  /** 0~100 的房子内部 x 百分比 */
  x: MotionValue<number> | number;
  /** 0~100 的房子内部 y 百分比 */
  y: MotionValue<number> | number;
  /** 走路时的左右镜像 */
  facing?: 'left' | 'right';
  walking?: boolean;
};

/**
 * 极简像素小人。12x16 纯色块拼出来的。
 * 没有真正的 sprite sheet，靠 framer-motion 做轻微的"踏步"反馈。
 */
export function Character({ facing = 'right', walking = false, x, y }: CharacterProps) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: typeof x === 'number' ? `${x}%` : x as unknown as string,
        top: typeof y === 'number' ? `${y}%` : y as unknown as string,
        translateX: '-50%',
        translateY: '-100%',
        width: 14,
        height: 22,
        zIndex: 30,
        scaleX: facing === 'left' ? -1 : 1,
        filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.5))',
      }}
    >
      <motion.svg
        viewBox="0 0 14 22"
        width="14"
        height="22"
        className="pixelated"
        animate={
          walking
            ? { y: [0, -1, 0, -1, 0], rotate: [0, -2, 0, 2, 0] }
            : { y: [0, -0.5, 0], rotate: 0 }
        }
        transition={{
          duration: walking ? 0.4 : 2,
          repeat: Infinity,
          ease: walking ? 'linear' : 'easeInOut',
        }}
      >
        {/* 头 */}
        <rect x="3" y="0" width="8" height="6" fill="#f4d4a3" />
        {/* 头发 */}
        <rect x="3" y="0" width="8" height="2" fill="#3a2820" />
        <rect x="2" y="1" width="1" height="3" fill="#3a2820" />
        {/* 眼睛 */}
        <rect x="5" y="3" width="1" height="1" fill="#1a1410" />
        <rect x="8" y="3" width="1" height="1" fill="#1a1410" />
        {/* 身体 */}
        <rect x="2" y="6" width="10" height="9" fill="#a64a3e" />
        {/* 围巾 / 衣领 */}
        <rect x="3" y="6" width="8" height="2" fill="#d6b06f" />
        {/* 腿 */}
        <rect x="3" y="15" width="3" height="6" fill="#3a2a20" />
        <rect x="8" y="15" width="3" height="6" fill="#3a2a20" />
        {/* 鞋 */}
        <rect x="3" y="20" width="3" height="2" fill="#1a1410" />
        <rect x="8" y="20" width="3" height="2" fill="#1a1410" />
        {/* 手 */}
        <rect x="0" y="9" width="2" height="4" fill="#f4d4a3" />
        <rect x="12" y="9" width="2" height="4" fill="#f4d4a3" />
      </motion.svg>
    </motion.div>
  );
}
