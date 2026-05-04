import { motion } from 'framer-motion';
import type { Project } from '../data/projects';

type RoomProps = {
  project: Project;
  isCurrent: boolean;
  /** 'top' = 门朝下（房间在顶层）；'bottom' = 门朝上（房间在底层） */
  doorSide?: 'top' | 'bottom';
  onSelect?: (id: string) => void;
};

/**
 * 单个房间。俯视图，cozy pixel-art 风格。
 * 房间的"气质"由 project.state + decor 共同决定，
 * 视觉上通过：光照、家具、生命迹象（咖啡/植物）、覆盖物表达。
 */
export function Room({ project, isCurrent, doorSide = 'top', onSelect }: RoomProps) {
  const { state, decor = {}, name, vibe } = project;
  // 门所在的边（视觉上靠近走廊那一面）
  const doorFacingDown = doorSide === 'top'; // 顶层房间，门在房间下边
  

  // 不同状态下的"光"
  const lightOverlay: Record<string, string> = {
    active:
      'radial-gradient(ellipse at 65% 35%, rgba(255,200,120,0.55) 0%, rgba(255,200,120,0.18) 35%, transparent 70%)',
    dormant:
      'radial-gradient(ellipse at 50% 50%, rgba(120,140,180,0.18) 0%, rgba(60,70,100,0.08) 50%, transparent 80%)',
    dusty:
      'linear-gradient(180deg, rgba(120,115,100,0.22) 0%, rgba(40,35,28,0.45) 100%)',
    archived: 'linear-gradient(180deg, rgba(20,18,15,0.6) 0%, rgba(8,6,4,0.85) 100%)',
  };

  // 地板花纹颜色
  const floorTone: Record<string, string> = {
    active: '#5a3e2c',
    dormant: '#3e3a3e',
    dusty: '#4a4338',
    archived: '#2a241f',
  };

  return (
    <motion.button
      onClick={() => onSelect?.(project.id)}
      whileHover={{ y: -2 }}
      className="group relative h-full w-full text-left cursor-pointer"
    >
      {/* 房间外壳：墙 */}
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: floorTone[state],
          border: `2px solid ${isCurrent ? 'var(--color-hearth-warm)' : 'rgba(120,90,60,0.35)'}`,
          borderRadius: 6,
          boxShadow: isCurrent
            ? '0 0 0 1px var(--color-hearth-warm), 0 0 32px rgba(244,168,93,0.25)'
            : '0 4px 20px rgba(0,0,0,0.35)',
          transition: 'box-shadow 240ms ease',
        }}
      >
        {/* 地板像素格 */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pixelated"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 16px)',
          }}
        />

        {/* 家具层（按状态变化） */}
        <Furniture project={project} doorFacingDown={doorFacingDown} />

        {/* 光照覆盖 */}
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-screen"
          style={{ background: lightOverlay[state] }}
        />

        {/* 积灰/盖布 */}
        {(state === 'dusty' || state === 'archived') && decor.coverSheets && (
          <div
            aria-hidden
            className="absolute inset-3 rounded-sm pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(45deg, rgba(220,210,190,0.06) 0 4px, rgba(220,210,190,0.10) 4px 8px)',
            }}
          />
        )}

        {/* 项目门牌（左上） */}
        <div className="absolute left-3 top-3 z-10">
          <div className="flex items-center gap-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                state === 'active'
                  ? 'bg-hearth-warm shadow-[0_0_8px_var(--color-hearth-warm)]'
                  : state === 'dormant'
                  ? 'bg-hearth-cool/70'
                  : 'bg-hearth-text-mute/40'
              }`}
            />
            <span
              className={`text-[13px] font-medium tracking-wide ${
                state === 'archived' ? 'text-hearth-text-mute' : 'text-hearth-text'
              }`}
            >
              {name}
            </span>
          </div>
          <div className="mt-1 text-[10px] tracking-wider text-hearth-text-mute pl-3.5">
            {vibe}
          </div>
        </div>

        {/* hover 时的微光提示 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              'radial-gradient(ellipse at center bottom, rgba(244,168,93,0.18) 0%, transparent 70%)',
          }}
        />
      </div>
    </motion.button>
  );
}

/** 房间内家具层。用绝对定位的色块拼出 cozy 感。 */
function Furniture({
  project,
  doorFacingDown,
}: {
  project: Project;
  doorFacingDown: boolean;
}) {
  const { state, decor = {} } = project;
  const isOff = state === 'archived' || decor.light === 'off';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 桌子 */}
      <div
        className="absolute"
        style={{
          left: '14%',
          top: '40%',
          width: '32%',
          height: '14%',
          background: '#6b4a2f',
          borderTop: '2px solid #8a6240',
          boxShadow: '0 4px 0 0 #2c1d12',
          opacity: state === 'archived' ? 0.5 : 1,
        }}
      />

      {/* 桌子上的灯 */}
      <div
        className="absolute"
        style={{
          left: '18%',
          top: '32%',
          width: '8px',
          height: '12px',
          background: isOff ? '#3a2a20' : '#f4a85d',
          boxShadow: isOff ? 'none' : '0 0 16px 6px rgba(244,168,93,0.45)',
        }}
      />

      {/* 桌子上的咖啡 */}
      {decor.coffee && (
        <div
          className="absolute"
          style={{
            left: '36%',
            top: '34%',
            width: '10px',
            height: '12px',
            background: '#cfa57a',
            borderTop: '2px solid #6b4a2f',
          }}
        />
      )}

      {/* 椅子 */}
      <div
        className="absolute"
        style={{
          left: '24%',
          top: '57%',
          width: '14%',
          height: '10%',
          background: '#5a3e2c',
          borderRadius: 2,
          opacity: state === 'archived' ? 0.4 : 0.9,
        }}
      />

      {/* 床 */}
      <div
        className="absolute"
        style={{
          left: '60%',
          top: '52%',
          width: '30%',
          height: '20%',
          background: state === 'active' ? '#a87653' : '#5a4538',
          border: '2px solid #2c1d12',
          borderRadius: 2,
        }}
      />
      <div
        className="absolute"
        style={{
          left: '60%',
          top: '50%',
          width: '8%',
          height: '8%',
          background: '#e8dcc4',
          opacity: 0.7,
        }}
      />

      {/* 植物 */}
      {decor.plant && (
        <div
          className="absolute"
          style={{
            left: '76%',
            top: '20%',
            width: '14px',
            height: '18px',
            background:
              decor.plant === 'thriving'
                ? '#6da45c'
                : decor.plant === 'wilting'
                ? '#7a7344'
                : '#5a4d3a',
            borderBottom: '4px solid #6b4a2f',
            opacity: decor.plant === 'dead' ? 0.5 : 1,
          }}
        />
      )}

      {/* 地毯 */}
      <div
        className="absolute"
        style={{
          left: '20%',
          top: '70%',
          width: '40%',
          height: '14%',
          background:
            state === 'active'
              ? 'repeating-linear-gradient(45deg, #7a4a35 0 4px, #6b3e2a 4px 8px)'
              : 'repeating-linear-gradient(45deg, #4a3a30 0 4px, #3e2f26 4px 8px)',
          opacity: state === 'archived' ? 0.3 : 0.85,
          borderRadius: 2,
        }}
      />

      {/* 门 —— 顶层房间门朝下（连接下方走廊），底层房间门朝上 */}
      <div
        className="absolute"
        style={{
          left: '46%',
          ...(doorFacingDown
            ? { bottom: '-2px', borderRadius: '2px 2px 0 0' }
            : { top: '-2px', borderRadius: '0 0 2px 2px' }),
          width: '8%',
          height: '8px',
          background:
            state === 'archived'
              ? '#2c1d12'
              : state === 'active'
              ? 'var(--color-hearth-warm)'
              : '#5a3e2c',
          boxShadow:
            state === 'active' ? '0 0 12px rgba(244,168,93,0.45)' : 'none',
        }}
      />

      {/* 归档：门上挂锁 */}
      {state === 'archived' && (
        <div
          className="absolute"
          style={{
            left: '49%',
            ...(doorFacingDown ? { bottom: '6px' } : { top: '4px' }),
            width: '4px',
            height: '6px',
            background: '#8a8377',
          }}
        />
      )}

      {/* 闲置项目的小窗户透出冷光 */}
      {state === 'dormant' && (
        <div
          className="absolute"
          style={{
            right: '8%',
            top: '8%',
            width: '14%',
            height: '10%',
            background: 'rgba(120,160,200,0.35)',
            border: '2px solid #2c2520',
            boxShadow: '0 0 18px rgba(120,160,200,0.25)',
          }}
        />
      )}
    </div>
  );
}
