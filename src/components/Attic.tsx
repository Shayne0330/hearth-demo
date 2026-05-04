import { motion } from 'framer-motion';
import { IsometricRoom } from './IsometricRoom';
import type { Project } from '../data/projects';

type AtticProps = {
  projects: Project[];
  onDescend: () => void;
};

/**
 * 阁楼：摆放所有 archived 状态的项目。
 * 视觉调性：更暗、更冷，倾斜的天窗，蛛网，落灰更厚。
 */
export function Attic({ projects, onDescend }: AtticProps) {
  const archivedProjects = projects.filter((p) => p.state === 'archived');

  return (
    <motion.div
      key="attic-content"
      className="absolute inset-0 z-40"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 22 }}
    >
      {/* 阁楼背景：更冷的色调 + 顶部斜窗光 */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #2c2a35 0%, #1f1d28 60%, #14121c 100%)',
        }}
      />

      {/* 顶部天窗光柱 */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: '20%',
          right: '20%',
          top: 0,
          height: '38%',
          background:
            'linear-gradient(180deg, rgba(220,230,255,0.18) 0%, rgba(180,200,230,0.05) 60%, transparent 100%)',
          clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
        }}
      />

      {/* 蛛网（左上、右下点缀） */}
      <Cobweb top="10%" left="6%" />
      <Cobweb top="68%" right="8%" />

      {/* 飘落的灰尘 */}
      <DustParticles />

      {/* 顶栏 */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 px-6 py-3 bg-black/30">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="block h-2 w-2 rounded-full bg-white/30" />
          阁楼 · 已结项的房间被温柔地盖上白布
        </div>
        <button
          onClick={onDescend}
          className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/50 hover:border-white/30 hover:text-white/80 transition-colors cursor-pointer"
        >
          ↓ 下楼
        </button>
      </div>

      {/* 阁楼主体：归档房间散落 */}
      <div className="relative z-10 h-[calc(100%-49px)]">
        {archivedProjects.map((p) => (
          <IsometricRoom
            key={p.id}
            project={p}
            isCurrent={false}
            size={110}
          />
        ))}

        {/* 楼梯下行口（左下） */}
        <div className="absolute left-3 bottom-3 flex flex-col items-center pointer-events-none">
          <svg width="28" height="80" viewBox="0 0 28 80" className="pixelated">
            <line x1="6" y1="0" x2="6" y2="80" stroke="#5a4538" strokeWidth="2" />
            <line x1="22" y1="0" x2="22" y2="80" stroke="#5a4538" strokeWidth="2" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={i}
                x1="6"
                y1={6 + i * 11}
                x2="22"
                y2={6 + i * 11}
                stroke="#7a5d44"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          <div className="text-[9px] tracking-[0.2em] text-white/30 uppercase mt-1">
            主厅
          </div>
        </div>

        {/* 一句温柔的注脚 */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 text-center max-w-[60%]">
          <div className="text-[11px] text-white/35 leading-relaxed">
            它们没有被删除。<br />
            只是盖上了白布，等你哪天想念了再上来。
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Cobweb({
  top,
  left,
  right,
}: {
  top: string;
  left?: string;
  right?: string;
}) {
  return (
    <svg
      className="pointer-events-none absolute pixelated"
      style={{ top, left, right }}
      width="60"
      height="60"
      viewBox="0 0 60 60"
    >
      <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" fill="none">
        <line x1="0" y1="0" x2="60" y2="60" />
        <line x1="0" y1="0" x2="40" y2="60" />
        <line x1="0" y1="0" x2="60" y2="40" />
        <path d="M 5 5 Q 15 12 12 24" />
        <path d="M 5 5 Q 25 8 35 22" />
        <path d="M 5 5 Q 8 18 22 26" />
      </g>
    </svg>
  );
}

function DustParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 73) % 100,
    delay: (i * 0.4) % 5,
    duration: 8 + ((i * 0.3) % 4),
  }));
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-white/30"
          style={{ left: `${p.x}%`, top: '-4px' }}
          animate={{ y: ['0vh', '90vh'], opacity: [0, 0.6, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
