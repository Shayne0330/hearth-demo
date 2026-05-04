import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FloatingTower } from './components/FloatingTower';
import { Palace, type WalkPhase } from './components/Palace';
import { PROJECTS, CURRENT_PROJECT_ID, type Project } from './data/projects';

type Stage = 'tower' | 'palace';

const STALE_HOURS = 24 * 14;

export default function App() {
  const [stage, setStage] = useState<Stage>('tower');
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState(CURRENT_PROJECT_ID);
  const [phase, setPhase] = useState<WalkPhase>('idle');
  const [walkTargetId, setWalkTargetId] = useState<string | null>(null);
  const [autoAbsorb, setAutoAbsorb] =
    useState<{ noteId: string; projectId: string } | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const arrivedTimer = useRef<number | null>(null);
  const autoTimers = useRef<number[]>([]);

  const current = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? PROJECTS[0];

  const handleSelectRoom = useCallback(
    (project: Project) => {
      if (phase !== 'idle') return;
      if (project.id === currentProjectId) return;
      if (project.state === 'archived') return;
      setWalkTargetId(project.id);
      setPhase('walking');
    },
    [phase, currentProjectId],
  );

  const handleWalkComplete = useCallback(() => {
    setPhase('arrived');
    arrivedTimer.current = window.setTimeout(() => {
      if (walkTargetId) setCurrentProjectId(walkTargetId);
      setPhase('idle');
      setWalkTargetId(null);
      setStage('tower');
    }, 1300);
  }, [walkTargetId]);

  useEffect(() => {
    return () => {
      if (arrivedTimer.current) clearTimeout(arrivedTimer.current);
      autoTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'idle' && !autoPlaying) {
        setStage('tower');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (phase !== 'idle' || autoPlaying) return;
        setStage((s) => (s === 'tower' ? 'palace' : 'tower'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, autoPlaying]);

  function startAutoPlay() {
    if (autoPlaying) return;
    setAutoPlaying(true);
    setStage('tower');
    setCurrentProjectId('helios');
    setPhase('idle');
    setWalkTargetId(null);

    const schedule: Array<[number, () => void]> = [
      [200, () => setCaption('你的当前位置只是顶栏一颗呼吸的光')],
      [2400, () => setCaption('点击它，记忆宫殿在你眼前展开')],
      [3000, () => setStage('palace')],
      [4400, () =>
        setCaption('每个 IDE 是一个色系，每个项目是一间房，气质自动生长'),
      ],
      [7800, () =>
        setCaption('随手记的便签悬在空中，需要时再丢进哪个房间'),
      ],
      [10800, () => {
        setAutoAbsorb({ noteId: 'n1', projectId: 'helios' });
      }],
      [11700, () => {
        setAutoAbsorb(null);
        setCaption('要切换工作？挑一间房间，看着自己穿过宫殿走过去');
      }],
      [14200, () => {
        setWalkTargetId('aurora');
        setPhase('walking');
      }],
      [15600, () => setCaption('穿越本身就是心理减速带，让大脑换频道')],
      [17800, () => setCaption(null)],
      [18800, () => {
        setAutoPlaying(false);
      }],
    ];

    autoTimers.current = schedule.map(([ms, fn]) =>
      window.setTimeout(fn, ms),
    );
  }

  function stopAutoPlay() {
    autoTimers.current.forEach(clearTimeout);
    autoTimers.current = [];
    setAutoPlaying(false);
    setCaption(null);
    setAutoAbsorb(null);
  }

  const handleArchiveProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        if (p.id === currentProjectId) return p;
        if (p.state === 'archived') return p;
        return {
          ...p,
          state: 'archived',
          decor: { ...p.decor, coverSheets: true },
        };
      }),
    );
  }, [currentProjectId]);

  const handleAutoArchiveStale = useCallback(() => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === currentProjectId) return p;
        if (p.state === 'archived') return p;
        if (p.lastTouchedHoursAgo < STALE_HOURS) return p;
        return {
          ...p,
          state: 'archived',
          decor: { ...p.decor, coverSheets: true },
        };
      }),
    );
  }, [currentProjectId]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <FauxDesktop />

      <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-6">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {stage === 'tower' ? (
              <motion.div
                key="tower"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <FloatingTower
                  projects={projects}
                  currentProjectId={current.id}
                  onSelectProject={(projectId) => {
                    const p = projects.find((x) => x.id === projectId);
                    if (!p || p.state === 'archived') return;
                    setCurrentProjectId(projectId);
                  }}
                  onArchiveProject={handleArchiveProject}
                  onAutoArchiveStale={handleAutoArchiveStale}
                  onOpenPalace={() => setStage('palace')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="palace"
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Palace
                  projects={projects}
                  currentProjectId={currentProjectId}
                  phase={phase}
                  walkTargetId={walkTargetId}
                  autoAbsorb={autoAbsorb}
                  onClose={() => phase === 'idle' && setStage('tower')}
                  onSelectRoom={handleSelectRoom}
                  onWalkComplete={handleWalkComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {caption && (
          <motion.div
            key={caption}
            className="fixed left-1/2 -translate-x-1/2 bottom-20 z-40 pointer-events-none max-w-[90vw]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-full border border-white/10 bg-black/65 backdrop-blur-md px-5 py-2 text-sm text-hearth-text-soft shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {caption}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed right-5 bottom-5 z-40 flex items-center gap-2">
        <button
          onClick={autoPlaying ? stopAutoPlay : startAutoPlay}
          className="flex items-center gap-2 rounded-full border border-hearth-warm-soft/30 bg-black/60 backdrop-blur-md px-4 py-2 text-xs text-hearth-text-soft hover:border-hearth-warm-soft/60 hover:text-hearth-text transition-colors cursor-pointer"
        >
          {autoPlaying ? (
            <>
              <span className="block h-2 w-2 rounded-sm bg-hearth-warm" />
              停止演示
            </>
          ) : (
            <>
              <span
                className="block h-0 w-0"
                style={{
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '8px solid var(--color-hearth-warm)',
                }}
              />
              自动演示
            </>
          )}
        </button>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 text-[11px] tracking-wider text-hearth-text-mute/60">
        ⌘K 唤起 / 收起 · ESC 收起 · 拖动便签到房间
      </div>
    </div>
  );
}

function FauxDesktop() {
  return (
    <div className="absolute inset-0 -z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2a2832_0%,#0c0a14_70%)]" />
      <div className="absolute left-12 top-24 h-[70%] w-[60%] rounded-xl border border-white/5 bg-black/40 backdrop-blur-[2px] overflow-hidden opacity-50">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <span className="h-3 w-3 rounded-full bg-red-400/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
          <span className="h-3 w-3 rounded-full bg-green-400/60" />
          <span className="ml-2 text-[11px] text-white/30">Helios — Cursor</span>
        </div>
        <div className="p-4 font-mono text-[11px] leading-relaxed text-white/30">
          <div>// 这里是用户正在工作的 IDE</div>
          <div>// 记忆宫殿只是顶部那颗药丸，并不抢走他们的视线</div>
          <div className="mt-2 text-white/20">
            export function expand() {'{'}
          </div>
          <div className="ml-4 text-white/20">return ...</div>
          <div className="text-white/20">{'}'}</div>
        </div>
      </div>
      <div className="absolute right-12 top-32 h-[55%] w-[28%] rounded-xl border border-white/5 bg-black/30 backdrop-blur-[2px] overflow-hidden opacity-40">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="text-[10px] text-white/30">Codex Cloud</span>
        </div>
        <div className="p-3 text-[10px] text-white/30 leading-relaxed">
          <div>● 正在分析依赖图...</div>
          <div className="mt-2">● 已生成补丁草稿</div>
        </div>
      </div>
    </div>
  );
}
