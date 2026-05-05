import { useEffect, useState } from 'react';
import { Hearth3D } from './components/hearth3d/Hearth3D';
import { CURRENT_PROJECT_ID, PROJECTS } from './data/projects';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState(CURRENT_PROJECT_ID);
  const desktopMode = Boolean(window.hearthDesktop?.isDesktop);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={[
        'relative h-full w-full overflow-hidden',
        desktopMode ? 'bg-transparent' : 'bg-hearth-bg',
      ].join(' ')}
    >
      {!desktopMode && <FauxDesktop currentProjectId={currentProjectId} />}

      <div
        className={[
          'fixed inset-0 z-30 flex items-start justify-center',
          desktopMode ? 'pt-0' : 'pt-7',
        ].join(' ')}
      >
        <Hearth3D
          projects={PROJECTS}
          currentProjectId={currentProjectId}
          onSelectProject={setCurrentProjectId}
          desktopMode={desktopMode}
        />
      </div>
    </div>
  );
}

function FauxDesktop({ currentProjectId }: { currentProjectId: string }) {
  const currentProject = PROJECTS.find((project) => project.id === currentProjectId);

  return (
    <div className="absolute inset-0 -z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2b2834_0%,#0d0a15_72%)]" />
      <div className="absolute left-10 top-20 h-[72%] w-[62%] overflow-hidden rounded-xl border border-white/6 bg-black/42 opacity-60 backdrop-blur-[2px]">
        <div className="flex items-center gap-2 border-b border-white/6 px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
          <span className="h-3 w-3 rounded-full bg-green-400/60" />
          <span className="ml-2 text-[11px] text-white/35">
            {currentProject?.name ?? 'Project'} - Cursor
          </span>
        </div>
        <div className="grid grid-cols-[180px_1fr] h-[calc(100%-37px)]">
          <div className="border-r border-white/5 bg-black/24 p-4">
            <div className="mb-5 h-3 w-24 rounded bg-white/10" />
            <div className="space-y-2">
              {['src', 'components', 'hearth3d', 'data', 'docs'].map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-hearth-warm/40" />
                  <span
                    className="h-2 rounded bg-white/10"
                    style={{ width: 70 + index * 10 }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="mb-4 h-4 w-52 rounded bg-white/10" />
            <div className="space-y-3">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="flex gap-2">
                  <span className="h-3 w-10 rounded bg-hearth-cool/20" />
                  <span
                    className="h-3 rounded bg-white/8"
                    style={{ width: `${55 + ((index * 19) % 36)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 right-12 h-[52%] w-[36%] overflow-hidden rounded-xl border border-white/6 bg-black/32 opacity-45">
        <div className="border-b border-white/6 px-4 py-2 text-[11px] text-white/25">
          Agent session output
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="rounded-lg border border-white/5 bg-white/[0.035] p-3">
              <div className="mb-2 h-2 w-24 rounded bg-hearth-warm/20" />
              <div className="h-2 w-full rounded bg-white/8" />
              <div className="mt-2 h-2 w-2/3 rounded bg-white/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
