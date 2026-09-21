import { ClassResult, ResultFile, ResultSet } from "../../types/results";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Archivo } from "next/font/google";

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'] });

interface ResultsBannerProps {
  resultSets: ResultSet[];
  scoresHidden: boolean;
  resultsHref: string;
}

export default function ResultsBanner({ resultSets, scoresHidden, resultsHref }: ResultsBannerProps) {
  const allResults: ClassResult[] = resultSets.flatMap((rs) => rs.score_data ?? []);
  const allFiles: ResultFile[] = resultSets.flatMap((rs) => rs.files ?? []);
  const totalEntrants = allResults.reduce((sum, c) => sum + c.riders.length, 0);

  return (
    <div className="md:sticky md:top-0 md:z-10 mb-4 bg-slate-900 rounded-lg overflow-hidden">
      {scoresHidden ? (
        <div className="px-5 py-4">
          <span className={`text-2xl font-bold text-white uppercase tracking-wide ${archivo.className}`} style={{ fontStretch: '62%' }}>
            Results
          </span>
          {totalEntrants > 0 && (
            <span className="text-xs text-slate-400 ml-2">
              {totalEntrants} entrant{totalEntrants !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      ) : (
        <a
          href={resultsHref}
          className="block hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold text-white uppercase tracking-wide ${archivo.className}`} style={{ fontStretch: '62%' }}>
                Results
              </span>
              {totalEntrants > 0 && (
                <span className="text-xs text-slate-400">
                  {totalEntrants} entrant{totalEntrants !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>View all</span>
              <ChevronRightIcon className="size-4" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 min-w-max md:min-w-0">
              {allResults.slice(0, 3).map((cls) => {
                const placed = cls.riders.filter((r) => r.status === 'placed').slice(0, 3);
                if (placed.length === 0) return null;
                const colourClass = cls.colour
                  ? (cls.colour === 'white' ? 'text-white' : `text-${cls.colour}-${cls.colourAmount ?? 500}`)
                  : undefined;
                return (
                  <div key={cls.classCode} className={`flex-shrink-0 px-5 py-3 border-t border-slate-700/60 ${archivo.className}`}>
                    <div className="text-xs font-bold text-white truncate mb-1 uppercase tracking-wide" style={{ fontStretch: '62%' }}>
                      <span className="relative inline-flex items-center leading-none">
                        {colourClass && (
                          <>
                            <span
                              className={colourClass}
                              style={{ position: 'absolute', left: 0, width: 20, height: 16, clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', backgroundColor: 'currentColor', top: '-2px' }}
                            />
                            <span
                              style={{ position: 'absolute', left: 0, width: 20, height: 16, clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.5))', top: '-2px' }}
                            />
                          </>
                        )}
                        <span className="relative z-10" style={{ textShadow: colourClass ? '0 1px 3px rgba(0,0,0,0.4)' : undefined, paddingLeft: colourClass ? '12px' : undefined }}>
                          {cls.className}
                        </span>
                      </span>
                    </div>
                    {placed.map((r, i) => (
                      <div key={i} className="text-xs text-slate-200 truncate leading-relaxed">
                        <span className="text-slate-500">{r.rank}.</span>{' '}
                        {r.firstName} {r.lastName}
                        {r.total != null && (
                          <span className="text-slate-500"> ({r.total})</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </a>
      )}
      {allFiles.length > 0 && (
        <div className="flex flex-col gap-2 p-5 border-t border-slate-700/60">
          {allFiles.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md bg-slate-800 hover:bg-slate-700 px-4 py-3 transition-colors"
            >
              <DocumentArrowDownIcon className="size-8 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{file.file_name}</div>
                <div className="text-xs text-slate-400">
                  {file.mime_type === 'application/pdf' ? 'PDF' : file.mime_type.startsWith('image/') ? 'Image' : 'File'}
                  {file.size > 0 && ` · ${file.size >= 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : Math.round(file.size / 1024) + ' KB'}`}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
