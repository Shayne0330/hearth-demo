import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AGENTS, type AgentId, type Project } from '../data/projects';

type FloatingTowerProps = {
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onArchiveProject: (projectId: string) => void;
  onAutoArchiveStale: () => void;
  onOpenPalace: () => void;
};

type ToolBuilding = {
  agentId: AgentId;
  name: string;
  projects: Project[];
  styleIndex: number;
};

const TOOL_ORDER: AgentId[] = ['cursor', 'codex', 'manus', 'claude'];
const STYLE_INDEX: Record<AgentId, number> = {
  cursor: 0,
  codex: 1,
  manus: 2,
  claude: 3,
};
const HITBOX_WIDTH: Record<AgentId, number> = {
  cursor: 126,
  codex: 118,
  manus: 84,
  claude: 108,
};
const BUILDING_HEIGHT: Record<AgentId, number> = {
  cursor: 220,
  codex: 218,
  manus: 204,
  claude: 214,
};
const STALE_HOURS = 24 * 14;

export function FloatingTower({
  projects,
  currentProjectId,
  onSelectProject,
  onArchiveProject,
  onAutoArchiveStale,
  onOpenPalace,
}: FloatingTowerProps) {
  const [hoveredAgent, setHoveredAgent] = useState<AgentId | null>(null);

  const buildings = useMemo<ToolBuilding[]>(
    () =>
      TOOL_ORDER.map((agentId) => ({
        agentId,
        name: AGENTS[agentId].name,
        projects: projects.filter((p) => p.agentId === agentId),
        styleIndex: STYLE_INDEX[agentId],
      })),
    [projects],
  );

  return (
    <motion.div
      layoutId="hearth-shell"
      className="pointer-events-auto relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseLeave={() => setHoveredAgent(null)}
    >
      <div className="pointer-events-none absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-white/25" />

      <div className="flex items-end justify-center gap-0">
        {buildings.map((building, i) => (
          <StreetBuilding
            key={building.agentId}
            building={building}
            isHovered={hoveredAgent === building.agentId}
            isAnyHovered={hoveredAgent !== null}
            currentProjectId={currentProjectId}
            z={20 + i}
            onHover={() => setHoveredAgent(building.agentId)}
            onLeave={() =>
              setHoveredAgent((prev) =>
                prev === building.agentId ? null : prev,
              )
            }
            onSelectProject={onSelectProject}
            onArchiveProject={onArchiveProject}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-white/55">
        <button
          onClick={onAutoArchiveStale}
          className="rounded-full border border-white/20 px-2 py-0.5 hover:border-white/35 hover:text-white/80"
        >
          收纳两周未动
        </button>
        <button
          onClick={onOpenPalace}
          className="rounded-full border border-white/20 px-2 py-0.5 hover:border-white/35 hover:text-white/80"
        >
          进入宫殿全景
        </button>
      </div>
    </motion.div>
  );
}

function StreetBuilding({
  building,
  isHovered,
  isAnyHovered,
  currentProjectId,
  z,
  onHover,
  onLeave,
  onSelectProject,
  onArchiveProject,
}: {
  building: ToolBuilding;
  isHovered: boolean;
  isAnyHovered: boolean;
  currentProjectId: string;
  z: number;
  onHover: () => void;
  onLeave: () => void;
  onSelectProject: (projectId: string) => void;
  onArchiveProject: (projectId: string) => void;
}) {
  const col = building.styleIndex % 8;
  const row = Math.floor(building.styleIndex / 8);
  const width = HITBOX_WIDTH[building.agentId];
  const height = BUILDING_HEIGHT[building.agentId];

  return (
    <motion.div
      className="relative -mx-[2px]"
      onMouseLeave={onLeave}
      animate={{
        y: isHovered ? -5 : 0,
        opacity: isAnyHovered && !isHovered ? 0.55 : 1,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ zIndex: isHovered ? 60 : z }}
    >
      <div className="relative" style={{ width, height }}>
        <button
          aria-label={`${building.name} 楼`}
          onMouseEnter={onHover}
          className="absolute inset-0 z-20 m-0 block cursor-pointer border-0 bg-transparent p-0"
        />

        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-150"
          style={{
            opacity: isHovered ? 0 : 1,
            backgroundImage: "url('/assets/buildings-facade.png')",
            backgroundSize: '800% 200%',
            backgroundPosition: `${(col / 7) * 100}% ${(row / 1) * 100}%`,
          }}
        />
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-150"
          style={{
            opacity: isHovered ? 1 : 0,
            backgroundImage: "url('/assets/buildings-cutaway.png')",
            backgroundSize: '800% 200%',
            backgroundPosition: `${(col / 7) * 100}% ${(row / 1) * 100}%`,
          }}
        />

        {isHovered && (
          <div className="absolute left-[14%] right-[14%] top-[13%] bottom-[8%] overflow-y-auto rounded-sm">
            <div className="space-y-1.5 pr-1">
              {building.projects.length === 0 && (
                <div className="rounded border border-white/40 bg-white/30 px-1.5 py-1 text-[9px] text-black/50">
                  暂无项目
                </div>
              )}
              {building.projects.map((p) => {
                const stale = p.lastTouchedHoursAgo >= STALE_HOURS;
                const covered =
                  p.state === 'archived' || stale || p.decor?.coverSheets;
                const isCurrent = p.id === currentProjectId;
                return (
                  <div key={p.id} className="relative">
                    <button
                      onClick={() => onSelectProject(p.id)}
                      className="w-full rounded border border-black/20 bg-white/70 px-1.5 py-1 text-left text-[9px] leading-tight text-black/70 hover:bg-white/85"
                    >
                      <div className="truncate pr-3">{p.name}</div>
                      <div className="truncate text-[8px] text-black/45">
                        {Math.round(p.lastTouchedHoursAgo)}h
                      </div>
                      {isCurrent && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                    {covered && (
                      <div className="pointer-events-none absolute inset-0 rounded bg-[linear-gradient(155deg,rgba(255,255,255,0.7),rgba(224,230,234,0.9))]" />
                    )}
                    {!covered && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveProject(p.id);
                        }}
                        className="absolute right-0.5 bottom-0.5 rounded border border-black/20 bg-white/80 px-1 text-[8px] text-black/55"
                      >
                        收
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-1 text-center text-[10px] tracking-[0.1em] uppercase"
        style={{ color: AGENTS[building.agentId].palette.glow }}
      >
        {building.name}
      </div>
    </motion.div>
  );
}
