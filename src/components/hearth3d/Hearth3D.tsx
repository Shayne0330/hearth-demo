import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import {
  AGENTS,
  getDefaultSession,
  getProjectAttentionState,
  type Project,
  type Session,
} from '../../data/projects';
import { BuildingModel } from './BuildingModel';
import { CameraRig } from './CameraRig';
import { CollapsedBuildingIcon } from './CollapsedBuildingIcon';

export type HearthViewState =
  | { type: 'collapsed' }
  | { type: 'previewing-collapsed' }
  | { type: 'expanding'; fromProjectId?: string }
  | { type: 'expanded'; hoveredProjectId?: string; hoveredSessionId?: string }
  | { type: 'focusing'; projectId: string; sessionId?: string }
  | { type: 'selected'; projectId: string; sessionId?: string };

export type HearthAction =
  | { type: 'PREVIEW_COLLAPSED' }
  | { type: 'END_COLLAPSED_PREVIEW' }
  | { type: 'OPEN_FROM_COLLAPSED' }
  | { type: 'HOVER_PROJECT'; projectId?: string; sessionId?: string }
  | { type: 'FOCUS_SESSION'; projectId: string; sessionId?: string }
  | { type: 'FOCUS_COMPLETE' }
  | { type: 'COLLAPSE' };

type Hearth3DProps = {
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  desktopMode?: boolean;
};

function hearthReducer(state: HearthViewState, action: HearthAction): HearthViewState {
  switch (action.type) {
    case 'PREVIEW_COLLAPSED':
      return state.type === 'collapsed' ? { type: 'previewing-collapsed' } : state;
    case 'END_COLLAPSED_PREVIEW':
      return state.type === 'previewing-collapsed' ? { type: 'collapsed' } : state;
    case 'OPEN_FROM_COLLAPSED':
      return state.type === 'collapsed' || state.type === 'previewing-collapsed'
        ? { type: 'expanding' }
        : state;
    case 'HOVER_PROJECT':
      return state.type === 'expanded'
        ? {
            type: 'expanded',
            hoveredProjectId: action.projectId,
            hoveredSessionId: action.sessionId,
          }
        : state;
    case 'FOCUS_SESSION':
      return state.type === 'expanded' || state.type === 'selected'
        ? {
            type: 'focusing',
            projectId: action.projectId,
            sessionId: action.sessionId,
          }
        : state;
    case 'FOCUS_COMPLETE':
      return state.type === 'focusing'
        ? {
            type: 'selected',
            projectId: state.projectId,
            sessionId: state.sessionId,
          }
        : state.type === 'expanding'
          ? { type: 'expanded' }
          : state;
    case 'COLLAPSE':
      return { type: 'collapsed' };
    default:
      return state;
  }
}

function getProject(projects: Project[], projectId?: string) {
  if (!projectId) return undefined;
  return projects.find((project) => project.id === projectId);
}

function getSession(project?: Project, sessionId?: string): Session | undefined {
  if (!project) return undefined;
  return (
    project.sessions.find((session) => session.id === sessionId) ??
    getDefaultSession(project)
  );
}

export function Hearth3D({
  projects,
  currentProjectId,
  onSelectProject,
  desktopMode = false,
}: Hearth3DProps) {
  const [viewState, dispatch] = useReducer(hearthReducer, { type: 'collapsed' });
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });
  const attentionProjects = useMemo(
    () => projects.filter((project) => getProjectAttentionState(project).isLit),
    [projects],
  );
  const runningOnlyProjects = useMemo(
    () =>
      projects.filter((project) => {
        const attention = getProjectAttentionState(project);
        return !attention.isLit && attention.isBreathing;
      }),
    [projects],
  );

  const focusedProjectId =
    viewState.type === 'focusing' || viewState.type === 'selected'
      ? viewState.projectId
      : viewState.type === 'expanded'
        ? viewState.hoveredProjectId
        : attentionProjects[0]?.id ?? currentProjectId;
  const focusedSessionId =
    viewState.type === 'focusing' || viewState.type === 'selected'
      ? viewState.sessionId
      : viewState.type === 'expanded'
        ? viewState.hoveredSessionId
        : undefined;
  const focusedProject = getProject(projects, focusedProjectId);
  const focusedSession = getSession(focusedProject, focusedSessionId);
  const selectedProjectId =
    viewState.type === 'focusing' || viewState.type === 'selected'
      ? viewState.projectId
      : undefined;
  const selectedSessionId =
    viewState.type === 'focusing' || viewState.type === 'selected'
      ? viewState.sessionId
      : undefined;
  const expanded = viewState.type !== 'collapsed' && viewState.type !== 'previewing-collapsed';

  useEffect(() => {
    window.hearthDesktop?.setExpanded(expanded).catch(() => undefined);
  }, [expanded]);

  useEffect(() => {
    if (viewState.type !== 'expanding') return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'FOCUS_COMPLETE' });
    }, 650);
    return () => clearTimeout(timer);
  }, [viewState.type]);

  useEffect(() => {
    if (viewState.type !== 'focusing') return;
    const { projectId } = viewState;
    const timer = window.setTimeout(() => {
      onSelectProject(projectId);
      dispatch({ type: 'FOCUS_COMPLETE' });
    }, 720);
    return () => clearTimeout(timer);
  }, [onSelectProject, viewState]);

  function handleCollapsedPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!desktopMode) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.screenX,
      startY: event.screenY,
      lastX: event.screenX,
      lastY: event.screenY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCollapsedPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!desktopMode || !drag.active) return;
    const dx = event.screenX - drag.lastX;
    const dy = event.screenY - drag.lastY;
    const totalDx = event.screenX - drag.startX;
    const totalDy = event.screenY - drag.startY;

    if (Math.abs(totalDx) + Math.abs(totalDy) > 4) {
      drag.moved = true;
    }
    if (drag.moved && (dx !== 0 || dy !== 0)) {
      window.hearthDesktop?.moveBy(dx, dy).catch(() => undefined);
      drag.lastX = event.screenX;
      drag.lastY = event.screenY;
    }
  }

  function handleCollapsedPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (desktopMode) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.active = false;
    if (!drag.moved) {
      dispatch({ type: 'OPEN_FROM_COLLAPSED' });
    }
  }

  function handleCollapsedPointerCancel(event: React.PointerEvent<HTMLButtonElement>) {
    if (desktopMode) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current.active = false;
  }

  return (
    <div
      className={[
        'pointer-events-auto transition-all duration-500',
        expanded
          ? desktopMode
            ? 'relative h-full w-full overflow-hidden'
            : 'fixed inset-0 h-screen w-screen overflow-hidden'
          : desktopMode
            ? 'relative h-[300px] w-[420px] overflow-hidden'
            : 'relative h-[270px] w-[370px] overflow-visible',
      ].join(' ')}
    >
      {expanded && !desktopMode && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_48%_42%,rgba(54,47,64,0.88)_0%,rgba(16,13,22,0.92)_62%,rgba(8,6,12,0.96)_100%)]" />
      )}
      <Canvas
        orthographic
        camera={{ position: [6.2, 4.7, 7.4], zoom: 33, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onPointerMissed={() => {
          if (expanded) dispatch({ type: 'COLLAPSE' });
        }}
      >
        <ambientLight intensity={1.25} />
        <directionalLight position={[5, 8, 6]} intensity={1.55} />
        <directionalLight position={[-4, 5, -3]} intensity={0.55} color="#9ed4c5" />
        <pointLight position={[-3, 3, 4]} intensity={0.55} color="#f4a85d" />
        <CameraRig viewState={viewState} />
        {!expanded && <CollapsedBuildingIcon projects={projects} viewState={viewState} />}
        <BuildingModel
          projects={projects}
          viewState={viewState}
          selectedProjectId={selectedProjectId}
          selectedSessionId={selectedSessionId}
          dispatch={dispatch}
        />
      </Canvas>

      {!expanded && (
        <>
          <button
            aria-label="展开 Hearth 记忆宫殿"
            onMouseEnter={() => dispatch({ type: 'PREVIEW_COLLAPSED' })}
            onMouseLeave={() => dispatch({ type: 'END_COLLAPSED_PREVIEW' })}
            onPointerDown={handleCollapsedPointerDown}
            onPointerMove={handleCollapsedPointerMove}
            onPointerUp={handleCollapsedPointerUp}
            onPointerCancel={handleCollapsedPointerCancel}
            className="absolute inset-0 cursor-grab rounded-[28px] bg-transparent active:cursor-grabbing"
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-0">
        {expanded ? (
          <ExpandedOverlay
            project={focusedProject}
            session={focusedSession}
            attentionCount={attentionProjects.length}
            runningCount={runningOnlyProjects.length}
            onCollapse={() => dispatch({ type: 'COLLAPSE' })}
            desktopMode={desktopMode}
          />
        ) : (
          !desktopMode && (
            <CollapsedOverlay
              attentionCount={attentionProjects.length}
              runningCount={runningOnlyProjects.length}
            />
          )
        )}
      </div>
    </div>
  );
}

function CollapsedOverlay({
  attentionCount,
  runningCount,
}: {
  attentionCount: number;
  runningCount: number;
}) {
  return (
    <div className="absolute left-1/2 top-[calc(100%-28px)] w-max -translate-x-1/2 text-center">
      <div className="text-[11px] font-medium tracking-wide text-hearth-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        Hearth
      </div>
      <div className="mt-0.5 text-[9px] text-hearth-text-mute drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        {attentionCount > 0 ? `${attentionCount} 个房间亮灯` : '没有待回看的房间'}
        {runningCount > 0 ? ` · ${runningCount} 个运行中` : ''}
      </div>
    </div>
  );
}

function ExpandedOverlay({
  project,
  session,
  attentionCount,
  runningCount,
  onCollapse,
  desktopMode,
}: {
  project?: Project;
  session?: Session;
  attentionCount: number;
  runningCount: number;
  onCollapse: () => void;
  desktopMode: boolean;
}) {
  const agent = session ? AGENTS[session.agentId] : project ? AGENTS[project.primaryAgentId] : undefined;

  return (
    <>
      {desktopMode && (
        <div className="absolute left-1/2 top-3 h-4 w-24 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 [app-region:drag]" />
      )}
      <div className="absolute left-6 top-6 flex items-baseline gap-4">
        <div className="text-sm font-medium tracking-wide text-hearth-text">
          Hearth
        </div>
        <div className="text-[11px] tracking-wide text-hearth-text-mute">
          项目房间 / Session 工作台
        </div>
        <div className="text-[10px] text-hearth-text-mute/75">
          {attentionCount} 待回看 · {runningCount} 运行中
        </div>
      </div>
      <button
        onClick={onCollapse}
        className="pointer-events-auto absolute right-6 top-6 border-b border-white/20 pb-1 text-[11px] tracking-wide text-hearth-text-soft transition-colors hover:border-hearth-warm hover:text-hearth-text [app-region:no-drag]"
      >
        收起
      </button>
      {project && session && agent && (
        <div
          className={[
            'pointer-events-auto absolute bottom-5 right-5 top-16 w-[min(360px,35vw)] rounded-3xl border border-white/55 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl',
            desktopMode ? 'bg-[#efe4cf]/92' : 'bg-[#efe4cf]/88',
          ].join(' ')}
        >
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-2xl font-medium text-[#2d241d]">{project.name}</div>
                <div className="mt-0.5 text-[11px] text-[#78634f]">
                  {agent.name} · {project.branch ?? 'main'} · {project.vibe}
                </div>
              </div>
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background: agent.palette.accent,
                  boxShadow: `0 0 16px ${agent.palette.glow}`,
                }}
              />
            </div>
            <div className="mt-8 border-t border-[#7a5a37]/18 pt-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#806848]">
                Session 工作台
              </div>
              <div className="mt-1 text-sm font-semibold text-[#5f452c]">
                {session.title}
              </div>
              <div className="mt-4 text-[11px] leading-relaxed text-[#806848]">
                上一次目标
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[#2f261f]">
                {session.lastGoal}
              </div>
              <div className="mt-4 text-[11px] leading-relaxed text-[#806848]">
                最近会话
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[#43362b]">
                {session.lastSummary}
              </div>
            </div>
          </>
        </div>
      )}
    </>
  );
}
