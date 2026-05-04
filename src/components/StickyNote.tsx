import { motion, type PanInfo } from 'framer-motion';
import type { StickyNote as Note } from '../data/projects';

type StickyNoteProps = {
  note: Note;
  /** 在走廊里的初始位置（相对房子内容区，百分比） */
  initial: { x: number; y: number; rotate: number };
  onDragEnd: (note: Note, info: PanInfo) => void;
  hidden?: boolean;
};

const COLORS = ['#f4d99a', '#f0c674', '#e6b58a'] as const;

export function StickyNote({ note, initial, onDragEnd, hidden }: StickyNoteProps) {
  const colorIdx = parseInt(note.id.replace(/\D/g, ''), 10) % COLORS.length;
  const fade = Math.max(0, Math.min(1, note.fade));
  const opacity = 1 - fade * 0.55;

  return (
    <motion.div
      drag={!hidden}
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{ scale: 1.06, rotate: 0, zIndex: 100 }}
      whileHover={{ scale: 1.04, rotate: 0, y: -4 }}
      onDragEnd={(_, info) => onDragEnd(note, info)}
      animate={{
        opacity: hidden ? 0 : opacity,
        scale: hidden ? 0.6 : 1,
        rotate: initial.rotate,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      style={{
        position: 'absolute',
        left: `calc(${initial.x}% - 60px)`,
        top: `calc(${initial.y}% - 30px)`,
        width: 120,
        height: 78,
        background: COLORS[colorIdx],
        color: '#3a2820',
        padding: 10,
        fontSize: 10,
        lineHeight: 1.35,
        boxShadow:
          '0 4px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.4) inset',
        cursor: hidden ? 'default' : 'grab',
        userSelect: 'none',
        // 像素小图钉
        clipPath: 'none',
        zIndex: 20,
      }}
      className="pixelated"
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 4,
          width: 6,
          height: 6,
          background: '#a64a3e',
          transform: 'translateX(-50%)',
          borderRadius: 1,
          boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
        }}
      />
      <div className="mt-2 line-clamp-3 text-[10px] font-medium tracking-tight">
        {note.text}
      </div>
      <div className="absolute right-2 bottom-1 text-[8px] tracking-wider opacity-50">
        {note.createdHoursAgo < 24
          ? `${Math.round(note.createdHoursAgo)}h`
          : `${Math.round(note.createdHoursAgo / 24)}d`}
      </div>
    </motion.div>
  );
}
