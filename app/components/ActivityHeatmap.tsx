type DayCount = { date: string; count: number };

const LEVEL_COLORS = [
  "rgba(237, 227, 208, 0.06)", // 0 reviews — celda vacía
  "rgba(162, 59, 46, 0.35)", // nivel 1 — cascara tenue
  "rgba(162, 59, 46, 0.6)", // nivel 2
  "rgba(162, 59, 46, 0.9)", // nivel 3
  "#D4A857", // nivel 4 — crema, el día con más actividad
];

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function buildWeeks(counts: DayCount[]) {
  const countMap = new Map(counts.map((c) => [c.date, c.count]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 370);
  start.setDate(start.getDate() - start.getDay()); // retrocede al domingo

  const days: DayCount[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    days.push({ date: iso, count: countMap.get(iso) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: DayCount[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function levelFor(count: number, max: number) {
  if (count === 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export default function ActivityHeatmap({ counts }: { counts: DayCount[] }) {
  const weeks = buildWeeks(counts);
  const max = Math.max(1, ...counts.map((c) => c.count));

  let lastMonth = -1;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-[3px] mb-1.5 pl-0">
          {weeks.map((week, wi) => {
            const firstDay = new Date(week[0].date + "T00:00:00");
            const month = firstDay.getMonth();
            const showLabel = month !== lastMonth;
            if (showLabel) lastMonth = month;
            return (
              <div key={wi} className="w-[11px] shrink-0">
                {showLabel && (
                  <span className="font-mono text-[9px] text-parchment-dim">
                    {MONTH_LABELS[month]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const level = levelFor(day.count, max);
                const dateLabel = new Date(day.date + "T00:00:00").toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={day.date}
                    title={`${day.count} café${day.count === 1 ? "" : "s"} catado${
                      day.count === 1 ? "" : "s"
                    } el ${dateLabel}`}
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{ backgroundColor: LEVEL_COLORS[level] }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <span className="font-mono text-[10px] text-parchment-dim">Menos</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: color }} />
          ))}
          <span className="font-mono text-[10px] text-parchment-dim">Más</span>
        </div>
      </div>
    </div>
  );
}
