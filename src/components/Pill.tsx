import { motion } from 'framer-motion';
import { AGENTS, type Project } from '../data/projects';

type PillProps = {
  project: Project;
  otherCount: number;
  onClick: () => void;
};

/**
 * 屏幕顶部的小药丸：显示当前所在的 Agent + Project + vibe。
 */
export function Pill({ project, otherCount, onClick }: PillProps) {
  const agent = AGENTS[project.agentId];

  return (
    <motion.button
      layoutId="hearth-shell"
      onClick={onClick}
      className="group relative flex items-center gap-3 rounded-full border bg-hearth-bg-2/85 px-5 py-2.5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-colors cursor-pointer"
      style={{
        borderRadius: 9999,
        borderColor: `${agent.palette.accent}55`,
      }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.span
        aria-hidden
        className="block h-2 w-2 rounded-full"
        style={{
          background: agent.palette.accent,
          boxShadow: `0 0 12px ${agent.palette.glow}`,
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <span className="text-sm text-hearth-text-soft">
        你在
        <span
          className="ml-1.5 font-medium"
          style={{ color: agent.palette.glow }}
        >
          {agent.name}
        </span>
        <span className="mx-1 opacity-40">/</span>
        <span className="font-medium text-hearth-text">{project.name}</span>
        <span className="mx-1.5 opacity-50">·</span>
        <span style={{ color: agent.palette.accent }}>{project.vibe}</span>
      </span>

      {otherCount > 0 && (
        <span className="ml-1 flex items-center gap-1 rounded-full border border-hearth-text-mute/30 px-2 py-0.5 text-[11px] text-hearth-text-mute">
          <span className="block h-1 w-1 rounded-full bg-hearth-text-mute" />
          其他 {otherCount} 个房间
        </span>
      )}

      <span
        aria-hidden
        className="ml-1 text-[10px] tracking-wider text-hearth-text-mute opacity-0 transition-opacity group-hover:opacity-100"
      >
        进入宫殿
      </span>
    </motion.button>
  );
}
