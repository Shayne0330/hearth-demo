import { motion } from 'framer-motion';
import { AGENTS, type Project } from '../data/projects';

type IsometricRoomProps = {
  project: Project;
  isCurrent: boolean;
  size?: number;
  onSelect?: (id: string) => void;
};

/**
 * 等距视角的房间立方体。
 * - 三面：屋顶（菱形）、左前面（窗户/门）、右前面（标牌/灯）
 * - 颜色由所属 Agent 决定
 * - 状态决定亮度、覆盖物、动效
 */
export function IsometricRoom({
  project,
  isCurrent,
  size = 130,
  onSelect,
}: IsometricRoomProps) {
  const agent = AGENTS[project.agentId];
  const { state, decor = {} } = project;

  // 立方体几何（单位：相对 size）
  const W = size;
  const halfW = W / 2;
  const quarterW = W / 4;
  const H = size * 0.55; // 房屋身高
  const totalH = halfW + H + 6;

  // 状态调整颜色
  const dim = state === 'archived' ? 0.35 : state === 'dusty' ? 0.55 : state === 'dormant' ? 0.75 : 1;
  const adj = (hex: string) => mixHex(hex, '#000', 1 - dim);

  const roof = adj(agent.palette.roof);
  const wallL = adj(agent.palette.wallLight);
  const wallR = adj(agent.palette.wallDark);
  const accent = agent.palette.accent;
  const glow = agent.palette.glow;

  // 三个面
  const topPts = `${halfW},0 ${W},${quarterW} ${halfW},${halfW} 0,${quarterW}`;
  const leftPts = `0,${quarterW} ${halfW},${halfW} ${halfW},${halfW + H} 0,${quarterW + H}`;
  const rightPts = `${W},${quarterW} ${halfW},${halfW} ${halfW},${halfW + H} ${W},${quarterW + H}`;

  // 阴影点（地面菱形）
  const shadowPts = `${halfW},${halfW + H + 4} ${W + 4},${quarterW + H + 4} ${halfW},${halfW + H + 12 + 4} ${0 - 4},${quarterW + H + 4}`;

  return (
    <div
      className="absolute"
      style={{
        left: `${project.pos.x}%`,
        top: `${project.pos.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: Math.round(project.pos.y),
      }}
    >
    <motion.button
      onClick={() => onSelect?.(project.id)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className="group cursor-pointer"
    >
      <svg
        viewBox={`-6 -10 ${W + 12} ${totalH + 14}`}
        width={W + 12}
        height={totalH + 14}
        className="pixelated overflow-visible"
        style={{
          filter: isCurrent
            ? `drop-shadow(0 0 16px ${glow})`
            : 'drop-shadow(0 6px 0 rgba(0,0,0,0.25))',
        }}
      >
        {/* 地面阴影 */}
        <polygon points={shadowPts} fill="rgba(0,0,0,0.35)" />

        {/* 屋顶（菱形，带瓦楞） */}
        <polygon points={topPts} fill={roof} stroke="#1a1410" strokeWidth="1.5" />
        {/* 屋顶纹理：横向瓦楞 */}
        <line x1={halfW} y1={0} x2={W} y2={quarterW} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        <line x1={halfW * 0.5} y1={quarterW * 0.5} x2={halfW * 1.5} y2={quarterW * 1.5} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        <line x1={0} y1={quarterW} x2={halfW} y2={halfW} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />

        {/* 屋顶元素：烟囱 */}
        {decor.chimney && (
          <g>
            <rect
              x={halfW + W * 0.18}
              y={quarterW * 0.4}
              width={W * 0.1}
              height={W * 0.18}
              fill={mixHex(roof, '#000', 0.3)}
              stroke="#1a1410"
              strokeWidth="1.2"
            />
            {/* 烟 */}
            {state === 'active' && (
              <g opacity="0.7">
                <circle cx={halfW + W * 0.23} cy={quarterW * 0.2} r="2.5" fill="#e8dcc4" />
                <circle cx={halfW + W * 0.27} cy={quarterW * 0.05} r="2" fill="#e8dcc4" opacity="0.5" />
              </g>
            )}
          </g>
        )}

        {/* 屋顶元素：天窗 */}
        {decor.skylight && (
          <polygon
            points={`${halfW * 0.65},${quarterW * 0.55} ${halfW * 1.05},${quarterW * 0.75} ${halfW * 0.85},${quarterW * 1.15} ${halfW * 0.45},${quarterW * 0.95}`}
            fill={state === 'active' ? glow : '#5a728c'}
            stroke="#1a1410"
            strokeWidth="1.2"
            opacity={state === 'active' ? 1 : 0.6}
          />
        )}

        {/* 左前面（墙 + 窗） */}
        <polygon points={leftPts} fill={wallL} stroke="#1a1410" strokeWidth="1.5" />
        {/* 窗户 */}
        <g>
          <polygon
            points={`${W * 0.08},${quarterW + H * 0.18} ${W * 0.36},${quarterW + halfW * 0.5 + H * 0.18} ${W * 0.36},${quarterW + halfW * 0.5 + H * 0.5} ${W * 0.08},${quarterW + H * 0.5}`}
            fill={state === 'active' ? glow : state === 'dormant' ? '#3e5468' : '#2a2520'}
            stroke="#1a1410"
            strokeWidth="1.2"
          />
          {state === 'active' && (
            <line
              x1={W * 0.22}
              y1={quarterW + halfW * 0.25 + H * 0.18}
              x2={W * 0.22}
              y2={quarterW + halfW * 0.25 + H * 0.5}
              stroke="#1a1410"
              strokeWidth="1"
            />
          )}
        </g>

        {/* 右前面（墙 + 门） */}
        <polygon points={rightPts} fill={wallR} stroke="#1a1410" strokeWidth="1.5" />
        {/* 门 */}
        <polygon
          points={`${W * 0.62},${halfW * 0.95 + H * 0.4} ${W * 0.86},${quarterW * 0.95 + H * 0.4} ${W * 0.86},${quarterW + H} ${W * 0.62},${halfW + H}`}
          fill={state === 'archived' ? '#1a1410' : mixHex(accent, '#000', 0.2)}
          stroke="#1a1410"
          strokeWidth="1.2"
        />
        {/* 门把手 */}
        {state !== 'archived' && (
          <circle
            cx={W * 0.7}
            cy={halfW + H * 0.85}
            r="1.5"
            fill={glow}
          />
        )}
        {/* 归档：门上挂锁 */}
        {state === 'archived' && (
          <rect
            x={W * 0.72}
            y={halfW + H * 0.78}
            width="4"
            height="6"
            fill="#8a8377"
            stroke="#1a1410"
            strokeWidth="1"
          />
        )}

        {/* 当前房间：温暖光晕从门口投出 */}
        {isCurrent && (
          <ellipse
            cx={W * 0.78}
            cy={halfW + H + 8}
            rx={W * 0.3}
            ry="6"
            fill={glow}
            opacity="0.5"
          />
        )}

        {/* 落灰房间：覆盖纹理 */}
        {decor.coverSheets && (
          <polygon
            points={leftPts}
            fill="url(#dust-pattern)"
            opacity="0.5"
          />
        )}

        {/* 小植物 */}
        {decor.plant && state !== 'archived' && (
          <g>
            <rect
              x={W * 0.04}
              y={quarterW + H * 0.6}
              width="6"
              height="5"
              fill="#6b4a2f"
              stroke="#1a1410"
              strokeWidth="1"
            />
            <ellipse
              cx={W * 0.04 + 3}
              cy={quarterW + H * 0.55}
              rx="4"
              ry="6"
              fill={state === 'dormant' ? '#7a8a5c' : state === 'dusty' ? '#5a4d3a' : '#6da45c'}
              stroke="#1a1410"
              strokeWidth="1"
            />
          </g>
        )}

        <defs>
          <pattern id="dust-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="transparent" />
            <line x1="0" y1="4" x2="4" y2="0" stroke="rgba(220,210,190,0.25)" strokeWidth="1" />
          </pattern>
        </defs>
      </svg>

      {/* 项目名标签 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 mt-1 text-center pointer-events-none"
        style={{ top: totalH + 6 }}
      >
        <div
          className={`text-[12px] font-medium tracking-wide whitespace-nowrap ${
            isCurrent ? 'text-hearth-text' : 'text-hearth-text-soft'
          }`}
          style={
            isCurrent
              ? { textShadow: `0 0 8px ${glow}` }
              : undefined
          }
        >
          {project.name}
        </div>
        <div className="text-[9px] tracking-wider text-hearth-text-mute uppercase whitespace-nowrap">
          {agent.name} · {project.vibe}
        </div>
      </div>

      {/* hover 状态指示 */}
      <div
        aria-hidden
        className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div
          className="rounded-sm px-2 py-0.5 text-[9px] tracking-wider uppercase"
          style={{
            background: agent.palette.accent,
            color: '#1a1410',
          }}
        >
          进入
        </div>
      </div>
    </motion.button>
    </div>
  );
}

/** 简单的颜色混合（hex with hex），factor 0..1。 */
function mixHex(a: string, b: string, factor: number) {
  const f = Math.max(0, Math.min(1, factor));
  const ah = parseHex(a);
  const bh = parseHex(b);
  const r = Math.round(ah.r * (1 - f) + bh.r * f);
  const g = Math.round(ah.g * (1 - f) + bh.g * f);
  const bl = Math.round(ah.b * (1 - f) + bh.b * f);
  return `rgb(${r}, ${g}, ${bl})`;
}

function parseHex(hex: string) {
  const h = hex.replace('#', '');
  const v = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
