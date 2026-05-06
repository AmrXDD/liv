import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const W = 360;
const H = 180;
const PAD_X = 28;
const PAD_Y = 24;

// glucose readings (mg/dL) over a 6h window — high → normal
const READINGS = [285, 268, 240, 205, 175, 148, 132, 118, 108, 102, 96, 92];
const MIN = 70;
const MAX = 300;
const NORMAL_HI = 140;
const NORMAL_LO = 80;

const xAt = (i: number) =>
  PAD_X + (i / (READINGS.length - 1)) * (W - PAD_X * 2);
const yAt = (v: number) =>
  PAD_Y + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD_Y * 2);

const linePath = READINGS.reduce<string>((acc, v, i) => {
  const x = xAt(i);
  const y = yAt(v);
  if (i === 0) return `M ${x} ${y}`;
  const prevX = xAt(i - 1);
  const cx1 = prevX + (x - prevX) / 2;
  const cx2 = prevX + (x - prevX) / 2;
  const prevY = yAt(READINGS[i - 1]);
  return `${acc} C ${cx1} ${prevY}, ${cx2} ${y}, ${x} ${y}`;
}, "");

const areaPath = `${linePath} L ${xAt(READINGS.length - 1)} ${H - PAD_Y} L ${PAD_X} ${H - PAD_Y} Z`;

export function BloodSugarAnimation() {
  const { t } = useTranslation();
  const root = useRef<SVGSVGElement | null>(null);
  const lineRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const [labelText, setLabelText] = useState("HIGH");
  const [labelTone, setLabelTone] = useState<"high" | "normal">("high");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerGsap();
    const path = lineRef.current;
    const dot = dotRef.current;
    const val = valueRef.current;
    if (!path || !dot || !val) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const counter = { v: READINGS[0] };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });

    tl.set(path, { strokeDashoffset: length })
      .set(dot, { attr: { cx: xAt(0), cy: yAt(READINGS[0]) }, opacity: 0 })
      .set(counter, { v: READINGS[0] })
      .to(val, { duration: 0, onUpdate: () => (val.textContent = String(Math.round(counter.v))) })
      .to(dot, { opacity: 1, duration: 0.4 })
      .to(
        path,
        {
          strokeDashoffset: 0,
          duration: 4.2,
          ease: "power2.inOut",
          onUpdate: function () {
            const p = this.progress();
            const pt = path.getPointAtLength(length * p);
            gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } });
          },
        },
        "<"
      )
      .to(
        counter,
        {
          v: READINGS[READINGS.length - 1],
          duration: 4.2,
          ease: "power2.inOut",
          onUpdate: () => {
            const cur = Math.round(counter.v);
            val.textContent = String(cur);
            if (cur > NORMAL_HI) {
              setLabelText("HIGH");
              setLabelTone("high");
            } else if (cur >= NORMAL_LO) {
              setLabelText("IN RANGE");
              setLabelTone("normal");
            }
          },
        },
        "<"
      )
      .to(dot, { scale: 1.4, duration: 0.6, transformOrigin: "center", yoyo: true, repeat: 3 });

    return () => {
      tl.kill();
    };
  }, []);

  const yNormalHi = yAt(NORMAL_HI);
  const yNormalLo = yAt(NORMAL_LO);

  return (
    <div className="relative aspect-[4/5] rounded-3xl">
      <div className="relative flex h-full flex-col p-6 text-ink">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-eyebrow uppercase text-ink-muted">
              {t("hero.glucose.eyebrow", { defaultValue: "Live glucose" })}
            </div>
            <div className="display-serif text-lg leading-tight text-ink">
              {t("hero.glucose.title", { defaultValue: "From spike to steady" })}
            </div>
          </div>
          <span
            ref={labelRef}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              labelTone === "high"
                ? "bg-coral-500/15 text-coral-700"
                : "bg-forest-500/15 text-forest-700"
            }`}
          >
            {labelText}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <span ref={valueRef} className="display-serif text-5xl tracking-tightest text-ink">
            285
          </span>
          <span className="text-xs text-ink-muted">mg/dL</span>
        </div>

        <div className="mt-2 flex-1">
          <svg
            ref={root}
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lf-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff5757" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#7be0a8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lf-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff5757" />
                <stop offset="60%" stopColor="#ffb86b" />
                <stop offset="100%" stopColor="#7be0a8" />
              </linearGradient>
            </defs>

            {/* Normal range band */}
            <rect
              x={PAD_X}
              y={yNormalHi}
              width={W - PAD_X * 2}
              height={yNormalLo - yNormalHi}
              fill="#7be0a8"
              fillOpacity="0.10"
            />
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={yNormalHi}
              y2={yNormalHi}
              stroke="#7be0a8"
              strokeOpacity="0.45"
              strokeDasharray="3 4"
            />
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={yNormalLo}
              y2={yNormalLo}
              stroke="#7be0a8"
              strokeOpacity="0.45"
              strokeDasharray="3 4"
            />

            {/* Y-axis ticks */}
            {[100, 180, 260].map((v) => (
              <text
                key={v}
                x={6}
                y={yAt(v) + 3}
                fill="currentColor"
                fillOpacity="0.45"
                fontSize="9"
                fontFamily="Cairo, sans-serif"
                className="text-ink"
              >
                {v}
              </text>
            ))}

            {/* Area beneath the line */}
            <path d={areaPath} fill="url(#lf-area)" opacity="0.55" />

            {/* The animated line itself */}
            <path
              ref={lineRef}
              d={linePath}
              fill="none"
              stroke="url(#lf-stroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tracking dot */}
            <circle
              ref={dotRef}
              r="6"
              fill="#fff"
              stroke="#006c45"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 6px rgba(123,224,168,0.8))" }}
            />
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-ink-muted">
          <span>00:00</span>
          <span className="text-center">+3h</span>
          <span className="text-end">+6h</span>
        </div>

        <div className="mt-3 rounded-xl border border-ink/10 px-3 py-2 text-xs leading-snug text-ink-muted">
          {t("hero.glucose.caption", {
            defaultValue: "Real client data — protocols that bring blood sugar into a healthy range, in weeks not years.",
          })}
        </div>
      </div>
    </div>
  );
}
