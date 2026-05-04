import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Room } from './Room';
import { Hallway } from './Hallway';
import { Character } from './Character';
import { StickyNote } from './StickyNote';
import {
  PROJECTS,
  STICKY_NOTES,
  type Project,
  type StickyNote as Note,
} from '../data/projects';

export type WalkPhase = 'idle' | 'walking' | 'arrived';

type HouseProps = {
  currentProjectId: string;
  /** 受控的走路状态 */
  phase: WalkPhase;
  walkTargetId: string | null;
  /** 受控的便签飞入演示（可选） */
  autoAbsorb?: { noteId: string; projectId: string } | null;
  onClose: () => void;
  onSelectRoom: (project: Project) => void;
  onWalkComplete: () => void;
};

const ROOM_POSITIONS: Record<
  string,
  { center: { x: number; y: number }; door: { x: number; y: number } }
> = {
  '0,0': { center: { x: 25, y: 25 }, door: { x: 25, y: 44 } },
  '1,0': { center: { x: 75, y: 25 }, door: { x: 75, y: 44 } },
  '0,1': { center: { x: 25, y: 75 }, door: { x: 25, y: 56 } },
  '1,1': { center: { x: 75, y: 75 }, door: { x: 75, y: 56 } },
};
const CORRIDOR_Y = 50;

function gridKey(p: Project) {
  return `${p.grid.col},${p.grid.row}`;
}

function computePath(from: Project, to: Project) {
  const f = ROOM_POSITIONS[gridKey(from)];
  const t = ROOM_POSITIONS[gridKey(to)];
  return [
    f.center,
    f.door,
    { x: f.door.x, y: CORRIDOR_Y },
    { x: t.door.x, y: CORRIDOR_Y },
    t.door,
    t.center,
  ];
}

export function House({
  currentProjectId,
  phase,
  walkTargetId,
  autoAbsorb,
  onClose,
  onSelectRoom,
  onWalkComplete,
}: HouseProps) {
  const current = PROJECTS.find((p) => p.id === currentProjectId)!;
  const walkTarget = walkTargetId
    ? PROJECTS.find((p) => p.id === walkTargetId) ?? null
    : null;

  const [notes, setNotes] = useState<Note[]>(STICKY_NOTES);
  const [absorbedFlash, setAbsorbedFlash] = useState<{
    noteId: string;
    projectId: string;
  } | null>(null);
  const houseRef = useRef<HTMLDivElement>(null);

  const topRow = PROJECTS.filter((p) => p.grid.row === 0).sort(
    (a, b) => a.grid.col - b.grid.col,
  );
  const bottomRow = PROJECTS.filter((p) => p.grid.row === 1).sort(
    (a, b) => a.grid.col - b.grid.col,
  );

  const path = useMemo(() => {
    if (!walkTarget) return null;
    return computePath(current, walkTarget);
  }, [current, walkTarget]);

  function handleNoteDragEnd(note: Note, info: PanInfo) {
    const { x, y } = info.point;
    const el = document.elementFromPoint(x, y);
    if (!el) return;
    const roomEl = el.closest<HTMLElement>('[data-room-id]');
    if (!roomEl) return;
    const roomId = roomEl.dataset.roomId;
    if (!roomId) return;
    const targetProj = PROJECTS.find((p) => p.id === roomId);
    if (!targetProj || targetProj.state === 'archived') return;
    setAbsorbedFlash({ noteId: note.id, projectId: roomId });
    window.setTimeout(() => {
      setNotes((arr) => arr.filter((n) => n.id !== note.id));
      setAbsorbedFlash(null);
    }, 600);
  }

  // 自动播放时由外部触发的便签 → 房间
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
      className="relative w-[min(1040px,92vw)] h-[min(660px,82vh)] rounded-[28px] border border-hearth-warm-soft/20 bg-gradient-to-b from-hearth-bg-2 to-hearth-bg overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
      style={{ borderRadius: 28 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-hearth-warm/15 to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-hearth-warm-soft/10 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-hearth-text-mute">
            <span className="block h-2 w-2 rounded-full bg-hearth-warm shadow-[0_0_8px_var(--color-hearth-warm)]" />
            Hearth · 你的项目居所
          </div>
          <button
            onClick={onClose}
            disabled={phase !== 'idle'}
            className="rounded-full border border-hearth-text-mute/20 px-3 py-1 text-[11px] text-hearth-text-mute hover:border-hearth-text-soft/40 hover:text-hearth-text-soft transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            收起 (Esc)
          </button>
        </div>

        <div
          ref={houseRef}
          className="relative flex-1 grid grid-rows-[1fr_92px_1fr] gap-3 p-5"
        >
          <div className="grid grid-cols-2 gap-4">
            {topRow.map((p) => (
              <div key={p.id} data-room-id={p.id} className="relative h-full">
                <Room
                  project={p}
                  isCurrent={p.id === currentProjectId}
                  doorSide="top"
                  onSelect={() => onSelectRoom(p)}
                />
                <RoomFlash active={absorbedFlash?.projectId === p.id} />
              </div>
            ))}
          </div>

          <Hallway />

          <div className="grid grid-cols-2 gap-4">
            {bottomRow.map((p) => (
              <div key={p.id} data-room-id={p.id} className="relative h-full">
                <Room
                  project={p}
                  isCurrent={p.id === currentProjectId}
                  doorSide="bottom"
                  onSelect={() => onSelectRoom(p)}
                />
                <RoomFlash active={absorbedFlash?.projectId === p.id} />
              </div>
            ))}
          </div>

          {/* 走廊上的便签 */}
          <div className="pointer-events-none absolute inset-5 z-20">
            <div className="relative w-full h-full">
              {notes.map((n, i) => (
                <div key={n.id} className="pointer-events-auto">
                  <StickyNote
                    note={n}
                    initial={{
                      x: 38 + i * 12,
                      y: 47 + (i % 2 === 0 ? -2 : 2),
                      rotate: i % 2 === 0 ? -4 : 5,
                    }}
                    onDragEnd={handleNoteDragEnd}
                    hidden={absorbedFlash?.noteId === n.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 小人 */}
          {path && phase !== 'idle' && (
            <WalkingCharacter
              path={path}
              onComplete={onWalkComplete}
              done={phase === 'arrived'}
            />
          )}

          <AnimatePresence>
            {phase === 'arrived' && walkTarget && (
              <ArrivedOverlay project={walkTarget} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
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
  const times = [0, 0.15, 0.28, 0.72, 0.85, 1];
  const facing: 'left' | 'right' = path[5].x >= path[0].x ? 'right' : 'left';

  return (
    <div className="absolute inset-5 pointer-events-none">
      <div className="relative w-full h-full">
        <motion.div
          style={{
            position: 'absolute',
            left: xs[0],
            top: ys[0],
            transform: 'translate(-50%, -100%)',
          }}
          animate={done ? {} : { left: xs, top: ys }}
          transition={{ duration: 2.2, ease: 'easeInOut', times }}
          onAnimationComplete={() => {
            if (!done) onComplete();
          }}
        >
          <Character x={0} y={0} walking={!done} facing={facing} />
        </motion.div>
      </div>
    </div>
  );
}

function RoomFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            boxShadow:
              '0 0 0 2px var(--color-hearth-warm), 0 0 40px var(--color-hearth-warm)',
            background:
              'radial-gradient(ellipse at center, rgba(244,168,93,0.25), transparent 70%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}

function ArrivedOverlay({ project }: { project: Project }) {
  return (
    <motion.div
      key="arrived"
      className="absolute inset-0 z-40 grid place-items-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-hearth-bg/70 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative px-8 py-5 rounded-2xl border border-hearth-warm-soft/40 bg-hearth-bg-2/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center"
        initial={{ scale: 0.9, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="block h-2 w-2 rounded-full bg-hearth-warm shadow-[0_0_8px_var(--color-hearth-warm)]" />
          <span className="text-xs tracking-[0.25em] text-hearth-warm uppercase">
            已切换
          </span>
        </div>
        <div className="text-2xl font-medium text-hearth-text">
          欢迎回到 {project.name}
        </div>
        <div className="mt-1.5 text-xs text-hearth-text-soft">
          {project.ide.toUpperCase()} · {project.branch ?? 'main'} · 已就位
        </div>
      </motion.div>
    </motion.div>
  );
}
