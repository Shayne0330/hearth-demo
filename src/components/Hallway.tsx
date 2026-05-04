type HallwayProps = {
  onAtticClick?: () => void;
};

/**
 * 走廊：连接 4 个房间的中央通道。
 * 中间是一张边桌（便签会浮在桌子上方，由 House 渲染）。
 * 右侧梯子通往阁楼。
 */
export function Hallway({ onAtticClick }: HallwayProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(60,42,30,0.85) 0%, rgba(40,28,20,0.85) 100%)',
        borderTop: '2px solid rgba(120,90,60,0.4)',
        borderBottom: '2px solid rgba(120,90,60,0.4)',
      }}
    >
      {/* 走廊地板木纹 */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 pixelated"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 24px), repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 8px)',
        }}
      />

      {/* 走廊微暖光（壁炉余温） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(244,168,93,0.10) 0%, transparent 70%)',
        }}
      />

      {/* 边桌（便签会落在桌上） */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 200,
          height: 22,
          background: '#6b4a2f',
          borderTop: '2px solid #8a6240',
          boxShadow: '0 3px 0 0 #2c1d12',
        }}
      />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[9px] tracking-[0.2em] text-hearth-text-mute uppercase">
        边桌 · 临时便签
      </span>

      {/* 梯子（通往阁楼） */}
      <button
        onClick={onAtticClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer group"
      >
        <div className="flex flex-col gap-[2px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="transition-colors group-hover:bg-hearth-warm"
              style={{
                width: 18,
                height: 3,
                background: '#8a6240',
              }}
            />
          ))}
        </div>
        <span className="text-[9px] tracking-[0.2em] text-hearth-text-mute uppercase group-hover:text-hearth-warm transition-colors">
          ↑ 阁楼
        </span>
      </button>
    </div>
  );
}
