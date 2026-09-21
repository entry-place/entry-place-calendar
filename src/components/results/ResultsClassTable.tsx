import { ClassResult, RiderResult, DayResult } from '../../types/results';

function RiderName({ firstName, lastName }: { firstName: string; lastName: string }) {
  return <>{firstName} <span className="font-medium opacity-70">{lastName}</span></>;
}

function classLabelScale(len: number): number {
  if (len <= 10) return 1;
  // Every 2 chars beyond 10, reduce by 10% (multiply by 0.90), floor at 0.5
  const steps = Math.floor((len - 10) / 2);
  return Math.max(0.5, Math.pow(0.90, steps));
}

function ClassLabel({ classResult }: { classResult: ClassResult }) {
  const colourClass = classResult.colour
    ? (classResult.colour === 'white' ? 'text-white' : `text-${classResult.colour}-${classResult.colourAmount ?? 500}`)
    : undefined;
  const scale = classLabelScale(classResult.className.length);

  return (
    <span className="relative inline-flex items-center leading-none" style={{ fontStretch: '62%', fontSize: `clamp(${1 * scale}rem, ${1.25 * scale}rem + 1vw, ${2 * scale}rem)` }}>
      {colourClass && (
        <>
          <span
            className={`${colourClass} absolute left-0 w-[36px] h-[28px]`}
            style={{ clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', backgroundColor: 'currentColor', top: '-3px' }}
          />
          <span
            className="absolute left-0 w-[36px] h-[28px]"
            style={{ clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.5))', top: '-3px' }}
          />
        </>
      )}
      <span className="relative z-10" style={{ textShadow: colourClass ? '0 1px 3px rgba(0,0,0,0.4)' : undefined, paddingLeft: colourClass ? '20px' : undefined }}>{classResult.className}</span>
    </span>
  );
}

interface ResultsClassTableProps {
  classResult: ClassResult;
  showSectionScores?: boolean;
}

export default function ResultsClassTable({ classResult, showSectionScores = false }: ResultsClassTableProps) {
  const isMultiDay = classResult.riders.some((r) => r.days && r.days.length > 0);

  if (isMultiDay) {
    return showSectionScores
      ? <MultiDayExpanded classResult={classResult} />
      : <MultiDayCollapsed classResult={classResult} />;
  }

  return <SimpleLapsTable classResult={classResult} />;
}

// ─── Simple laps table (TK5FNC style) ──────────────────────────────────��─────

function SimpleLapsTable({ classResult }: { classResult: ClassResult }) {
  const placedRiders = classResult.riders.filter((r) => r.status === 'placed');
  const dnsRiders = classResult.riders.filter((r) => r.status === 'dns');

  // Determine number of laps from actual data
  const numLaps = classResult.riders.reduce((max, r) => Math.max(max, r.laps?.length ?? 0), 0);

  return (
    <div className="mb-6">
      <div className="overflow-x-auto rounded-lg ring-1 ring-stone-300 dark:ring-stone-600">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-800 text-left text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
              <th className="px-3 py-2 font-bold text-white dark:text-stone-100 bg-stone-900 dark:bg-stone-600 text-base uppercase tracking-wide"><ClassLabel classResult={classResult} /></th>
              {Array.from({ length: numLaps }, (_, i) => (
                <th key={`L${i + 1}`} className="px-2 py-1.5 font-medium text-center w-10">L{i + 1}</th>
              ))}
              <th className="px-2 py-1.5 font-medium text-center w-14">Total</th>
              <th className="px-2 py-1.5 font-medium text-center w-10 border-l border-r border-stone-200 dark:border-stone-700 bg-stone-200 dark:bg-stone-700">Place</th>
              <th className="px-2 py-1.5 font-normal text-center w-20 text-stone-400 dark:text-stone-500">Club Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
            {placedRiders.map((rider, idx) => {
              const isTied = rider.rank !== null && placedRiders.filter((r) => r.rank === rider.rank).length > 1;
              return (
                <tr
                  key={`${rider.firstName}-${rider.lastName}`}
                  className={`hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/50 dark:bg-stone-800/50'
                  }`}
                >
                  <td className="px-2 py-1.5 text-stone-800 dark:text-stone-100 whitespace-nowrap">
                    <RiderName firstName={rider.firstName} lastName={rider.lastName} />
                    {rider.note && (
                      <span className="ml-2 text-xs text-stone-400 font-normal">({rider.note})</span>
                    )}
                  </td>
                  {rider.laps?.map((lap, lapIdx) => (
                    <td key={lapIdx} className="px-2 py-1.5 text-center text-stone-600 dark:text-stone-400 tabular-nums">
                      {lap}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center text-stone-700 dark:text-stone-300 tabular-nums">
                    {rider.total}
                  </td>
                  <td className="px-2 py-1.5 text-center font-semibold text-stone-900 dark:text-stone-100 tabular-nums border-l border-r border-stone-200 dark:border-stone-700 bg-stone-200 dark:bg-stone-700">
                    {rider.rank}{isTied && '='}
                  </td>
                  <td className="px-2 py-1.5 text-center text-xs text-stone-400 dark:text-stone-500 tabular-nums">
                    {rider.clubPoints ?? ''}
                  </td>
                </tr>
              );
            })}
            {dnsRiders.map((rider) => (
              <tr key={`${rider.firstName}-${rider.lastName}`} className="bg-white dark:bg-stone-900">
                <td className="px-2 py-1.5 text-stone-400 dark:text-stone-500 whitespace-nowrap"><RiderName firstName={rider.firstName} lastName={rider.lastName} /></td>
                <td colSpan={numLaps + 3} className="px-2 py-1.5 text-stone-400 dark:text-stone-500 text-center text-xs uppercase tracking-wide">
                  DNS
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Multi-day collapsed view ────────────────────────────────────────────────

function statusLabel(status: string): string {
  return status.toUpperCase();
}

function MultiDayCollapsed({ classResult }: { classResult: ClassResult }) {
  const placedRiders = classResult.riders.filter((r) => r.status === 'placed');
  const dnfRiders = classResult.riders.filter((r) => r.status === 'dnf');
  const ncRiders = classResult.riders.filter((r) => r.status === 'nc');
  const dnsRiders = classResult.riders.filter((r) => r.status === 'dns');

  // Discover day structure from first rider with data
  const sampleRider = classResult.riders.find((r) => r.days && r.days.length > 0);
  const days = sampleRider?.days ?? [];
  // Find overall max laps across all days/riders, then use it as a floor for pending days
  let globalMaxLaps = 0;
  for (const d of days) {
    for (const r of classResult.riders) {
      if (r.days) {
        const dayData = r.days.find((rd) => rd.label === d.label);
        if (dayData) globalMaxLaps = Math.max(globalMaxLaps, dayData.laps.length);
      }
    }
  }
  const maxLaps = globalMaxLaps;

  const allStatusRiders = [...placedRiders, ...dnfRiders, ...ncRiders, ...dnsRiders];
  // Total number of lap+day columns (per day: laps + day total)
  const lapColCount = days.length * (maxLaps + 1);

  return (
    <div className="mb-6">
      <div className="overflow-x-auto rounded-lg ring-1 ring-stone-300 dark:ring-stone-600">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-800 text-left text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
              <th className="px-3 py-2 font-bold text-white dark:text-stone-100 bg-stone-900 dark:bg-stone-600 text-base uppercase tracking-wide sticky left-0 z-10"><ClassLabel classResult={classResult} /></th>
              {days.map((day) => (
                <>
                  {Array.from({ length: maxLaps }, (_, i) => (
                    <th key={`${day.shortLabel}-L${i + 1}`} className={`px-2 py-1.5 font-medium text-center w-10 ${i === 0 ? 'border-l border-stone-300 dark:border-stone-600' : ''} ${day.pending ? 'opacity-30' : ''}`}>
                      {day.shortLabel} L{i + 1}
                    </th>
                  ))}
                  <th key={`${day.shortLabel}-total`} className={`px-2 py-1.5 font-medium text-center w-12 border-l border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 ${day.pending ? 'opacity-30' : ''}`}>
                    {day.shortLabel}
                  </th>
                </>
              ))}
              <th className="px-2 py-1.5 font-medium text-center w-14 border-l border-stone-200 dark:border-stone-700">Total</th>
              <th className="px-2 py-1.5 font-medium text-center w-10 border-l border-r border-stone-200 dark:border-stone-700 bg-stone-200 dark:bg-stone-700">Place</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-300 dark:divide-stone-500">
            {allStatusRiders.map((rider, idx) => {
              if (rider.status === 'dns') {
                return (
                  <tr key={`${rider.firstName}-${rider.lastName}`} className="bg-white dark:bg-stone-900">
                    <td className="px-2 py-1.5 text-stone-400 dark:text-stone-500 sticky left-0 bg-white dark:bg-stone-900"><div className="max-w-48 truncate"><RiderName firstName={rider.firstName} lastName={rider.lastName} /></div></td>
                    <td colSpan={lapColCount + 2} className="px-2 py-1.5 text-stone-400 dark:text-stone-500 text-center text-xs uppercase tracking-wide">
                      DNS
                    </td>
                  </tr>
                );
              }

              const isPlaced = rider.status === 'placed';
              const isTied = isPlaced && placedRiders.filter((r) => r.rank === rider.rank).length > 1;
              const rowBg = idx % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/50 dark:bg-stone-800/50';
              const stickyBg = idx % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800';

              return (
                <tr key={`${rider.firstName}-${rider.lastName}`} className={`group hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors ${rowBg}`}>
                  <td className={`px-2 py-1.5 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors ${isPlaced ? 'text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                    <div className="max-w-48 truncate"><RiderName firstName={rider.firstName} lastName={rider.lastName} /></div>
                  </td>
                  {days.map((dayTemplate) => {
                    const dayData = rider.days?.find((d) => d.label === dayTemplate.label);
                    const pendingClass = dayTemplate.pending ? 'opacity-30' : '';
                    return (
                      <>
                        {Array.from({ length: maxLaps }, (_, i) => {
                          const lap = dayData?.laps[i];
                          return (
                            <td key={`${dayTemplate.shortLabel}-L${i + 1}`} className={`px-2 py-1.5 text-center text-stone-600 dark:text-stone-400 tabular-nums ${i === 0 ? 'border-l border-stone-300 dark:border-stone-600' : ''} ${pendingClass}`}>
                              {lap ? lap.total : ''}
                            </td>
                          );
                        })}
                        <td key={`${dayTemplate.shortLabel}-dt`} className={`px-2 py-1.5 text-center font-medium text-stone-700 dark:text-stone-300 tabular-nums border-l border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors ${pendingClass}`}>
                          {dayData?.dayTotal ?? ''}
                        </td>
                      </>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center font-medium text-stone-700 dark:text-stone-300 tabular-nums border-l border-stone-200 dark:border-stone-700">
                    {rider.total ?? ''}
                  </td>
                  <td className="px-2 py-1.5 text-center font-semibold text-stone-900 dark:text-stone-100 tabular-nums border-l border-r border-stone-200 dark:border-stone-700 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-300 dark:group-hover:bg-blue-800/60 transition-colors">
                    {isPlaced ? (
                      <>{rider.rank}{isTied && '='}</>
                    ) : (
                      <span className="text-xs text-stone-400 dark:text-stone-500 font-normal">{statusLabel(rider.status)}</span>
                    )}
                    {rider.note && (
                      <div className="text-[10px] uppercase font-normal text-gray-600 dark:text-gray-400 leading-tight">{rider.note}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Multi-day expanded view (section scores) ────────────────────────────────

function MultiDayExpanded({ classResult }: { classResult: ClassResult }) {
  const placedRiders = classResult.riders.filter((r) => r.status === 'placed');
  const dnfRiders = classResult.riders.filter((r) => r.status === 'dnf');
  const ncRiders = classResult.riders.filter((r) => r.status === 'nc');
  const dnsRiders = classResult.riders.filter((r) => r.status === 'dns');

  const sampleRider = classResult.riders.find((r) => r.days && r.days.length > 0);
  const days = sampleRider?.days ?? [];

  // Find max laps and sections count
  let maxLaps = 0;
  let numSections = 0;
  for (const r of classResult.riders) {
    if (r.days) {
      for (const d of r.days) {
        maxLaps = Math.max(maxLaps, d.laps.length);
        for (const lap of d.laps) {
          if (lap.sections) numSections = Math.max(numSections, lap.sections.length);
        }
      }
    }
  }

  // Columns per day: sections(15) + Lap total + Day total = 17
  const colsPerDay = numSections + 2;
  const totalDataCols = days.length * colsPerDay + 2; // +2 for Total + Place

  const allStatusRiders = [...placedRiders, ...dnfRiders, ...ncRiders, ...dnsRiders];

  const sectionCellClass = "px-0.5 py-0.5 text-center tabular-nums text-xs min-w-[1.4rem]";
  const headerCellClass = "px-0.5 py-1 text-center font-medium text-xs min-w-[1.4rem]";

  return (
    <div className="mb-6">
      <div className="overflow-x-auto rounded-lg ring-1 ring-stone-300 dark:ring-stone-600">
        <table className="min-w-full text-sm border-separate border-spacing-0">
          <thead>
            {/* Day group headers */}
            <tr className="bg-stone-50 dark:bg-stone-800 text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
              <th rowSpan={2} className="px-3 py-2 font-bold text-white dark:text-stone-100 bg-stone-900 dark:bg-stone-600 text-base uppercase tracking-wide text-left sticky left-0 z-10 min-w-[8rem] border-r border-stone-300 dark:border-stone-600"><ClassLabel classResult={classResult} /></th>
              {days.map((day, dayIdx) => (
                <th
                  key={day.label}
                  colSpan={colsPerDay}
                  className={`px-1 py-1 font-semibold text-center ${dayIdx > 0 ? 'border-l border-stone-300 dark:border-stone-600' : ''}`}
                >
                  {day.label}
                </th>
              ))}
              <th rowSpan={2} className="px-1 py-1 font-medium text-center border-l border-stone-200 dark:border-stone-700 min-w-[2.5rem]">Total</th>
              <th rowSpan={2} className="px-1 py-1 font-medium text-center border-l border-r border-stone-200 dark:border-stone-700 min-w-[2.5rem] bg-stone-200 dark:bg-stone-700">Place</th>
            </tr>
            {/* Section number headers */}
            <tr className="bg-stone-50 dark:bg-stone-800 text-xs text-stone-400 dark:text-stone-500">
              {days.map((day, dayIdx) => (
                <>
                  {Array.from({ length: numSections }, (_, i) => (
                    <th key={`${day.shortLabel}-s${i + 1}`} className={`${headerCellClass} ${i === 0 && dayIdx > 0 ? 'border-l border-stone-300 dark:border-stone-600' : ''}`}>
                      {i + 1}
                    </th>
                  ))}
                  <th key={`${day.shortLabel}-lap`} className={`${headerCellClass} border-l border-stone-200 dark:border-stone-700 font-semibold text-stone-500 dark:text-stone-400`}>
                    Lap
                  </th>
                  <th key={`${day.shortLabel}-day`} className={`${headerCellClass} border-l border-stone-200 dark:border-stone-700 font-semibold text-stone-500 dark:text-stone-400`}>
                    Day
                  </th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {allStatusRiders.map((rider, riderIdx) => {
              if (rider.status === 'dns') {
                return (
                  <tr key={`${rider.firstName}-${rider.lastName}`} className="bg-white dark:bg-stone-900">
                    <td className="px-2 py-1 text-stone-400 dark:text-stone-500 sticky left-0 bg-white dark:bg-stone-900 border-r border-stone-300 dark:border-stone-600 border-t border-stone-300 dark:border-stone-500"><div className="max-w-48 truncate"><RiderName firstName={rider.firstName} lastName={rider.lastName} /></div></td>
                    <td colSpan={totalDataCols} className="px-2 py-1 text-stone-400 dark:text-stone-500 text-center text-xs uppercase tracking-wide border-t border-stone-300 dark:border-stone-500">
                      DNS
                    </td>
                  </tr>
                );
              }

              return <ExpandedRiderRows
                key={`${rider.firstName}-${rider.lastName}`}
                rider={rider}
                days={days}
                maxLaps={maxLaps}
                numSections={numSections}
                riderIdx={riderIdx}
                placedRiders={placedRiders}
                sectionCellClass={sectionCellClass}
              />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpandedRiderRows({
  rider, days, maxLaps, numSections, riderIdx, placedRiders, sectionCellClass,
}: {
  rider: RiderResult;
  days: DayResult[];
  maxLaps: number;
  numSections: number;
  riderIdx: number;
  placedRiders: RiderResult[];
  sectionCellClass: string;
}) {
  const isPlaced = rider.status === 'placed';
  const isTied = isPlaced && placedRiders.filter((r) => r.rank === rider.rank).length > 1;
  const baseBg = riderIdx % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/50 dark:bg-stone-800/50';
  const stickyBg = riderIdx % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800';

  // Build rows: one per lap (up to maxLaps), with bike name on last row
  const rows: React.ReactNode[] = [];

  for (let lapIdx = 0; lapIdx < maxLaps; lapIdx++) {
    const isFirstRow = lapIdx === 0;
    const isMiddleRow = lapIdx === Math.floor((maxLaps - 1) / 2);
    const isLastRow = lapIdx === maxLaps - 1;
    const topBorder = isFirstRow ? 'border-t border-stone-300 dark:border-stone-500' : '';

    rows.push(
      <tr
        key={`${rider.firstName}-${rider.lastName}-L${lapIdx}`}
        className={baseBg}
      >
        {/* Rider name on first row, bike on last row */}
        <td className={`px-2 py-0.5 sticky left-0 z-10 ${stickyBg} border-r border-stone-300 dark:border-stone-600 ${topBorder} ${
          isFirstRow
            ? (isPlaced ? 'text-stone-800 dark:text-stone-100 font-medium' : 'text-stone-500 dark:text-stone-400')
            : isLastRow && rider.bike
              ? 'text-xs text-stone-400 dark:text-stone-500 italic'
              : ''
        }`}>
          <div className="max-w-48 truncate">{isFirstRow ? <RiderName firstName={rider.firstName} lastName={rider.lastName} /> : isLastRow && rider.bike ? rider.bike : ''}</div>
        </td>

        {/* Section scores for each day */}
        {days.map((dayTemplate, dayIdx) => {
          const dayData = rider.days?.find((d) => d.label === dayTemplate.label);
          const lap = dayData?.laps[lapIdx];

          return (
            <>
              {Array.from({ length: numSections }, (_, secIdx) => {
                const score = lap?.sections?.[secIdx];
                return (
                  <td key={`${dayTemplate.shortLabel}-s${secIdx}`} className={`${sectionCellClass} ${topBorder} ${
                    score === 0 ? 'text-stone-900/30 dark:text-stone-500'
                    : 'text-stone-900/70 dark:text-stone-400'
                  } ${secIdx === 0 && dayIdx > 0 ? 'border-l border-stone-300 dark:border-stone-600' : 'border-l-0'}`}>
                    {score !== undefined ? score : ''}
                  </td>
                );
              })}
              {/* Lap total */}
              <td key={`${dayTemplate.shortLabel}-lap`} className={`${sectionCellClass} ${topBorder} font-medium text-stone-700 dark:text-stone-300 border-l border-stone-200 dark:border-stone-700`}>
                {lap ? lap.total : ''}
              </td>
              {/* Day total — only on middle row */}
              <td key={`${dayTemplate.shortLabel}-day`} className={`${sectionCellClass} ${topBorder} font-semibold text-stone-700 dark:text-stone-300 border-l border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800`}>
                {isMiddleRow ? (dayData?.dayTotal ?? '') : ''}
              </td>
            </>
          );
        })}

        {/* Total — only on middle row */}
        <td className={`${sectionCellClass} ${topBorder} font-semibold text-stone-700 dark:text-stone-300 border-l border-stone-200 dark:border-stone-700`}>
          {isMiddleRow ? (rider.total ?? '') : ''}
        </td>
        {/* Place — only on middle row */}
        <td className={`${sectionCellClass} ${topBorder} font-bold text-stone-900 dark:text-stone-100 border-l border-r border-stone-200 dark:border-stone-700 bg-stone-200 dark:bg-stone-700`}>
          {isMiddleRow ? (
            isPlaced ? <>{rider.rank}{isTied && '='}</> : <span className="text-xs text-stone-400 font-normal">{statusLabel(rider.status)}</span>
          ) : ''}
        </td>
      </tr>
    );
  }

  // If rider has fewer laps than maxLaps and no rows were generated, show at least one row
  if (rows.length === 0) {
    rows.push(
      <tr key={`${rider.firstName}-${rider.lastName}`} className={`${baseBg}`}>
        <td className={`px-2 py-0.5 sticky left-0 z-10 ${stickyBg} border-r border-stone-300 dark:border-stone-600 border-t border-stone-300 dark:border-stone-500 text-stone-500 dark:text-stone-400`}>
          <div className="max-w-48 truncate"><RiderName firstName={rider.firstName} lastName={rider.lastName} /></div>
        </td>
        {days.map((dayTemplate) => (
          <>
            {Array.from({ length: numSections }, (_, i) => (
              <td key={`${dayTemplate.shortLabel}-s${i}`} className={`${sectionCellClass} border-t border-stone-300 dark:border-stone-500`}></td>
            ))}
            <td key={`${dayTemplate.shortLabel}-lap`} className={`${sectionCellClass} border-l border-stone-200 dark:border-stone-700 border-t border-stone-300 dark:border-stone-500`}></td>
            <td key={`${dayTemplate.shortLabel}-day`} className={`${sectionCellClass} border-l border-stone-200 dark:border-stone-700 border-t border-stone-300 dark:border-stone-500`}></td>
          </>
        ))}
        <td className={`${sectionCellClass} border-l border-stone-200 dark:border-stone-700 border-t border-stone-300 dark:border-stone-500`}>{rider.total ?? ''}</td>
        <td className={`${sectionCellClass} font-bold border-l border-r border-stone-200 dark:border-stone-700 border-t border-stone-300 dark:border-stone-500`}>
          <span className="text-xs text-stone-400 font-normal">{statusLabel(rider.status)}</span>
        </td>
      </tr>
    );
  }

  return <>{rows}</>;
}
