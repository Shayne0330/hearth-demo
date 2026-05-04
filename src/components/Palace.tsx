import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { IsometricRoom } from './IsometricRoom';
import { Character } from './Character';
import { StickyNote } from './StickyNote';
import { Attic } from './Attic';
import {
  STICKY_NOTES,
  AGENTS,
  isProjectsConnected,
  type Project,
  type StickyNote as Note,
} from '../data/projects';

export type WalkPhase = 'idle' | 'walking' | 'arrived';

type PalaceProps = {
  projects: Project[];
  currentProjectId: string;
  phase: WalkPhase;
  walkTargetId: string | null;
  autoAbsorb?: { noteId: string; projectId: string } | null;
  onClose: () => void;
  onSelectRoom: (project: Project) => void;
  onWalkComplete: () => void;
};

/**
 * 计算从一个房间走到另一个房间的路径点（百分比坐标）。
 * 简单做法：起点 → 中点（略偏上以模拟走过通道） → 终点。
 */
function computePath(from: Project, to: Project) {
  const mid = {
    x: (from.pos.x + to.pos.x) / 2,
    y: (from.pos.y + to.pos.y) / 2 - 4, // 拐一下，制造"上下楼梯"的感觉
  };
  return [from.pos, mid, to.pos];
}

export function Palace({
  projects,
  currentProjectId,
  phase,
  walkTargetId,
  autoAbsorb,
  onClose,
  onSelectRoom,
  onWalkComplete,
}: PalaceProps) {
  const [floor, setFloor] = useState<'main' | 'attic'>('main');
  const current = projects.find((p) => p.id === currentProjectId)!;
  const walkTarget = walkTargetId
    ? projects.find((p) => p.id === walkTargetId) ?? null
    : null;

  const [notes, setNotes] = useState<Note[]>(STICKY_NOTES);
  const [absorbedFlash, setAbsorbedFlash] = useState<{
    noteId: string;
    projectId: string;
  } | null>(null);
  const palaceRef = useRef<HTMLDivElement>(null);

  const path = useMemo(() => {
    if (!walkTarget) return null;
    return computePath(current, walkTarget);
  }, [current, walkTarget]);

  // 计算所有要画的"通道线"
  const walkways = useMemo(() => {
    const lines: Array<{ a: Project; b: Project; key: string }> = [];
    const seen = new Set<string>();
    for (const a of projects) {
      for (const b of projects) {
        if (a.id === b.id) continue;
        if (a.state === 'archived' || b.state === 'archived') continue;
        if (!isProjectsConnected(a, b)) continue;
        const key = [a.id, b.id].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);
        lines.push({ a, b, key });
      }
    }
    return lines;
  }, [projects]);

  function handleNoteDragEnd(note: Note, info: PanInfo) {
    const { x, y } = info.point;
    const el = document.elementFromPoint(x, y);
    if (!el) return;
    const roomEl = el.closest<HTMLElement>('[data-room-id]');
    if (!roomEl) return;
    const roomId = roomEl.dataset.roomId;
    if (!roomId) return;
    const targetProj = projects.find((p) => p.id === roomId);
    if (!targetProj || targetProj.state === 'archived') return;
    setAbsorbedFlash({ noteId: note.id, projectId: roomId });
    window.setTimeout(() => {
      setNotes((arr) => arr.filter((n) => n.id !== note.id));
      setAbsorbedFlash(null);
    }, 600);
  }

  useEffect(() => {
    if (!autoAbsorb) return;
    setAbsorbedFlash(autoAbsorb);
    const t = window.setTimeout(() => {
      setNotes((arr) => arr.filter((n) => n.id !== autoAbsorb.noteId));
      setAbsorbedFlash(null);
    }, 700);
    return () => clearTimeout(t);
  }, [autoAbsorb]);

  return (
    <motion.div
      layoutId="hearth-shell"
      className="relative w-[min(1100px,94vw)] h-[min(720px,86vh)] rounded-[28px] border border-white/5 overflow-hidden"
      style={{
        borderRadius: 28,
        background:
          'linear-gradient(180deg, #4a4854 0%, #3a3842 60%, #2a2832 100%)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
      }}
    >
      {/* 远景星点 */}
      <Starfield />

      <div className="relative z-10 flex h-full flex-col">
        {/* 顶栏 */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-3 bg-black/20">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="block h-2 w-2 rounded-full bg-hearth-warm shadow-[0_0_8px_var(--color-hearth-warm)]" />
            记忆宫殿 · 你的项目地图
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-white/30 uppercase">
            {Object.values(AGENTS).map((a) => (
              <span key={a.id} className="flex items-center gap-1">
                <span
                  className="block h-2 w-2"
                  style={{ background: a.palette.accent }}
                />
                {a.name}
              </span>
            ))}
          </div>
          <button
            onClick={onClose}
            disabled={phase !== 'idle'}
            className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/50 hover:border-white/30 hover:text-white/80 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            收起 (Esc)
          </button>
        </div>

        {/* 主厅 ↔ 阁楼，通过滑动切换 */}
        <div className="relative flex-1 overflow-hidden min-h-0">
        {/* 宫殿主体 */}
        <div
          ref={palaceRef}
          className="absolute inset-0 overflow-hidden"
          style={{ visibility: floor === 'main' ? 'visible' : 'hidden', pointerEvents: floor === 'main' ? 'auto' : 'none' }}
        >
          {/* 通道（连接已知项目对的等距线） */}
          <Walkways walkways={walkways} />

          {/* 房间 */}
          {projects.filter((p) => p.state !== 'archived').map((p) => (
            <div
              key={p.id}
              data-room-id={p.id}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <IsometricRoom
                  project={p}
                  isCurrent={p.id === currentProjectId}
                  onSelect={() => onSelectRoom(p)}
                />
              </div>
              <RoomFlash
                active={absorbedFlash?.projectId === p.id}
                pos={p.pos}
              />
            </div>
          ))}

          {/* 阁楼入口（梯子，右下） */}
          <AtticEntrance onClick={() => setFloor('attic')} />

          {/* 走路中的小人 */}
          {path && phase !== 'idle' && (
            <WalkingCharacter
              path={path}
              done={phase === 'arrived'}
              onComplete={onWalkComplete}
            />
          )}

          {/* 顶部"便签栏"：临时会话挂在这里 */}
          <NoticeBoard count={notes.length} />
          <div className="pointer-events-none absolute inset-0 z-30">
            {notes.map((n, i) => {
              const positions = [
                { x: 35, y: 8, rotate: -4 },
                { x: 50, y: 6, rotate: 5 },
                { x: 65, y: 9, rotate: -3 },
              ];
              const pos = positions[i] ?? { x: 40 + i * 12, y: 8, rotate: 0 };
              return (
                <div key={n.id} className="pointer-events-auto">
                  <StickyNote
                    note={n}
                    initial={pos}
                    onDragEnd={handleNoteDragEnd}
                    hidden={absorbedFlash?.noteId === n.id}
                  />
                </div>
              );
            })}
          </div>

          {/* 抵达提示 */}
          <AnimatePresence>
            {phase === 'arrived' && walkTarget && (
              <ArrivedOverlay project={walkTarget} />
            )}
          </AnimatePresence>
          </div>

          <AnimatePresence>
            {floor === 'attic' && (
              <Attic key="attic" projects={projects} onDescend={() => setFloor('main')} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/** 远景的星点 / 宫殿背景的氛围。 */
function Starfield() {
  const dots = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      x: ((i * 137.5) % 100),
      y: ((i * 89.7) % 100),
      r: i % 5 === 0 ? 1.4 : 0.7,
      o: 0.15 + ((i * 0.07) % 0.5),
    }));
  }, []);
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.3} fill="#fff" opacity={d.o} />
      ))}
    </svg>
  );
}

/** 通道：在两个连通的项目之间画一条带阴影的等距走道。 */
function Walkways({
  walkways,
}: {
  walkways: { a: Project; b: Project; key: string }[];
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {walkways.map(({ a, b, key }) => {
        // 中点稍微往上抬，模拟"楼梯"的弧度
        const mid = {
          x: (a.pos.x + b.pos.x) / 2,
          y: (a.pos.y + b.pos.y) / 2 - 2,
        };
        const path = `M ${a.pos.x} ${a.pos.y} Q ${mid.x} ${mid.y} ${b.pos.x} ${b.pos.y}`;
        return (
          <g key={key}>
            {/* 阴影线 */}
            <path
              d={path}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="0.7"
              fill="none"
            />
            {/* 走道 */}
            <path
              d={path}
              stroke="rgba(170,140,100,0.55)"
              strokeWidth="0.5"
              strokeDasharray="0.6 0.4"
              fill="none"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** 顶部"便签栏"：一个可视的横木条，便签像挂帘子一样从上面垂下来。 */
function NoticeBoard({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ top: 26, left: '20%', right: '20%' }}
    >
      <div
        className="h-[6px] rounded-sm"
        style={{
          background: '#6b4a2f',
          boxShadow: '0 2px 0 #2c1d12',
        }}
      />
      <div className="text-center mt-1">
        <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase">
          走廊便签 · 拖到房间归属
        </span>
      </div>
    </div>
  );
}

function AtticEntrance({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-3 bottom-3 flex flex-col items-center cursor-pointer group"
    >
      {/* 梯子 */}
      <svg width="28" height="80" viewBox="0 0 28 80" className="pixelated">
        <line x1="6" y1="0" x2="6" y2="80" stroke="#8a6240" strokeWidth="2" className="group-hover:stroke-hearth-warm transition-colors" />
        <line x1="22" y1="0" x2="22" y2="80" stroke="#8a6240" strokeWidth="2" className="group-hover:stroke-hearth-warm transition-colors" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            x1="6"
            y1={6 + i * 11}
            x2="22"
            y2={6 + i * 11}
            stroke="#a87653"
            strokeWidth="1.5"
            className="group-hover:stroke-hearth-glow transition-colors"
          />
        ))}
      </svg>
      <div className="text-[9px] tracking-[0.2em] text-white/40 uppercase mt-1 group-hover:text-hearth-warm transition-colors">
        ↑ 阁楼
      </div>
    </button>
  );
}

function WalkingCharacter({
  path,
  done,
  onComplete,
}: {
  path: { x: number; y: number }[];
  done: boolean;
  onComplete: () => void;
}) {
  const xs = path.map((p) => `${p.x}%`);
  const ys = path.map((p) => `${p.y}%`);
  const facing: 'left' | 'right' = path[2].x >= path[0].x ? 'right' : 'left';

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <motion.div
        style={{
          position: 'absolute',
          left: xs[0],
          top: ys[0],
          transform: 'translate(-50%, -100%)',
        }}
        animate={
          done
            ? {}
            : {
                left: xs,
                top: ys,
              }
        }
        transition={{ duration: 1.8, ease: 'easeInOut', times: [0, 0.5, 1] }}
        onAnimationComplete={() => {
          if (!done) onComplete();
        }}
      >
        <Character x={0} y={0} walking={!done} facing={facing} />
      </motion.div>
    </div>
  );
}

function RoomFlash({
  active,
  pos,
}: {
  active: boolean;
  pos: { x: number; y: number };
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="h-32 w-32 rounded-full"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(244,168,93,0.5), transparent 70%)',
              boxShadow: '0 0 40px rgba(244,168,93,0.8)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ArrivedOverlay({ project }: { project: Project }) {
  const agent = AGENTS[project.agentId];
  return (
    <motion.div
      key="arrived"
      className="absolute inset-0 z-50 grid place-items-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative px-8 py-5 rounded-2xl border bg-hearth-bg-2/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center"
        style={{ borderColor: agent.palette.accent }}
        initial={{ scale: 0.9, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span
            className="block h-2 w-2 rounded-full"
            style={{
              background: agent.palette.accent,
              boxShadow: `0 0 8px ${agent.palette.glow}`,
            }}
          />
          <span
            className="text-xs tracking-[0.25em] uppercase"
            style={{ color: agent.palette.accent }}
          >
            已切换
          </span>
        </div>
        <div className="text-2xl font-medium text-hearth-text">
          欢迎回到 {project.name}
        </div>
        <div className="mt-1.5 text-xs text-hearth-text-soft">
          {agent.name} · {project.branch ?? 'main'} · 已就位
        </div>
      </motion.div>
    </motion.div>
  );
}
