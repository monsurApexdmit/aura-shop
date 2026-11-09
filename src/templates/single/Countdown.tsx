import { useEffect, useState } from "react";

function msToMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/** Hours, minutes and seconds left until local midnight; ticks every second. */
function useMidnightCountdown() {
  const [left, setLeft] = useState(msToMidnight);
  useEffect(() => {
    const id = window.setInterval(() => setLeft(msToMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const total = Math.max(0, Math.floor(left / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** HH:MM:SS boxes to local midnight, for the ink urgency strip. */
export default function Countdown() {
  const { h, m, s } = useMidnightCountdown();
  const parts = [
    { value: h, label: "Hrs" },
    { value: m, label: "Min" },
    { value: s, label: "Sec" },
  ];
  return (
    <div className="flex items-center gap-1.5" role="timer" aria-label={`${h} hours ${m} minutes left`}>
      {parts.map((p, i) => (
        <div key={p.label} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true" className="font-display text-lg font-bold text-ink-foreground/50">:</span>}
          <span className="flex min-w-[3.25rem] flex-col items-center rounded-xl bg-ink-foreground/10 px-2 py-1.5 ring-1 ring-ink-foreground/15">
            <span aria-hidden="true" className="font-display text-xl font-bold leading-none tabular-nums sm:text-2xl">{pad(p.value)}</span>
            <span aria-hidden="true" className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-foreground/60">{p.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
