"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const R        = 70;
const CX       = 90;
const CY       = 90;
const CIRC     = 2 * Math.PI * R;  // 439.82
const ARC      = CIRC * 0.75;      // 329.87 — 270° sweep
const ROTATION = 135;              // gap sits at bottom-centre

function arcDash(s: number): string {
  const filled = (s / 100) * ARC;
  return `${filled} ${CIRC - filled}`;
}

// Ease-out quart
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }

export function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const [anim, setAnim] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setAnim(0); // reset on score change (remount via key)
    const duration = 1800;
    const start    = performance.now();

    function tick(now: number) {
      const t     = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOutQuart(t) * score);
      setAnim(value);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }

    // Tiny delay so the 0-state renders first
    const frameId = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(rafRef.current);
    };
  }, [score]);

  const strokeColor =
    anim >= 65 ? "#10b981"
    : anim >= 35 ? "#f59e0b"
    : "#ef4444";

  const glowColor =
    anim >= 65 ? "rgba(16,185,129,0.15)"
    : anim >= 35 ? "rgba(245,158,11,0.15)"
    : "rgba(239,68,68,0.15)";

  const glowBlur =
    anim >= 65 ? "rgba(16,185,129,0.25)"
    : anim >= 35 ? "rgba(245,158,11,0.25)"
    : "rgba(239,68,68,0.25)";

  const fs = size / 180; // scale factor

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      aria-label={`Deal score: ${score} out of 100`}
      style={{ flexShrink: 0, overflow: "visible" }}
    >
      <defs>
        {/* Soft radial glow behind ring */}
        <radialGradient id={`gaugeGlow_${score}`} cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor="transparent" />
          <stop offset="100%" stopColor={glowColor} />
        </radialGradient>

        {/* Drop shadow filter for the arc */}
        <filter id={`arcGlow_${score}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor={glowBlur} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow halo */}
      <circle cx={CX} cy={CY} r={R + 18} fill={`url(#gaugeGlow_${score})`} />

      {/* Background track */}
      <circle
        cx={CX} cy={CY} r={R}
        stroke="#1a1a20"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={`${ARC} ${CIRC - ARC}`}
        transform={`rotate(${ROTATION} ${CX} ${CY})`}
      />

      {/* Progress arc */}
      <circle
        cx={CX} cy={CY} r={R}
        stroke={strokeColor}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={arcDash(anim)}
        transform={`rotate(${ROTATION} ${CX} ${CY})`}
        filter={`url(#arcGlow_${score})`}
        style={{ transition: "stroke 0.4s ease" }}
      />

      {/* Score number */}
      <text
        x={CX} y={CY - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--text-primary)"
        fontFamily="'JetBrains Mono', var(--font-jetbrains), monospace"
        fontSize={fs * 44}
        fontWeight="500"
        style={{ letterSpacing: "-1px" }}
      >
        {anim}
      </text>

      {/* "/ 100" sublabel */}
      <text
        x={CX} y={CY + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--text-secondary)"
        fontFamily="'DM Sans', var(--font-body), sans-serif"
        fontSize={fs * 9}
        letterSpacing="1.5"
      >
        / 100
      </text>
    </svg>
  );
}
