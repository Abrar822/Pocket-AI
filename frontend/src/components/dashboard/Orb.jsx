import { startTransition, useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Orb — glowing ring + mirrored flowing sound waves, matching the
 * reference "Pocket AI" voice orb (Listening.../Thinking... states).
 *
 * Props:
 *   size      - number, ring diameter in px (default 220)
 *   listening - boolean, shorthand for state="listening" vs "idle" (default true)
 *   state     - "listening" | "thinking" | "idle", overrides `listening` if set
 *   label     - override the state text shown under the ring
 *   hint      - optional secondary line under the label (e.g. wake word hint)
 */
    export default function Orb({
    size = 220,
    listening = true,
    state,
    label,
    hint,
}) {
    const resolvedState = state || (listening ? "listening" : "idle");
    const animate = resolvedState !== "idle";

    const [phase, setPhase] = useState(0);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(null);
    const instanceId = useId().replace(/:/g, "");

    const ringGradId = `orbRingGrad-${instanceId}`;
    const waveGradId = `orbWaveGrad-${instanceId}`;
    const ringGlowId = `orbRingGlow-${instanceId}`;
    const waveGlowId = `orbWaveGlow-${instanceId}`;
    const barGlowId = `orbBarGlow-${instanceId}`;

    // viewBox scales with `size` so waves have room either side of the ring
    const vw = size * 3.2;
    const vh = size * 1.36;
    const cx = vw / 2;
    const cy = vh / 2;
    const ringR = size / 2;

    useEffect(() => {
        if (!animate) {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTimeRef.current = null;
            return;
        }
        if (typeof window === "undefined") return;

        const tick = (time) => {
            const prev = lastTimeRef.current ?? time;
            const dt = Math.min((time - prev) / 1000, 0.05);
            lastTimeRef.current = time;
            startTransition(() => setPhase((p) => p + dt));
            rafRef.current = window.requestAnimationFrame(tick);
        };
        rafRef.current = window.requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTimeRef.current = null;
        };
    }, [animate]);

    // ---- flowing mirrored sound-wave lines that pass through the ring ----
    const waveDefs = useMemo(
        () => [
            { amp: 0.3 * size, freq: 1.6, speed: 1.0, opacity: 0.85, width: 1.6, offset: 0 },
            { amp: 0.15 * size, freq: 2.1, speed: 1.5, opacity: 0.6, width: 1.2, offset: 1.1 },
            { amp: 0.11 * size, freq: 2.7, speed: 1, opacity: 0.4, width: 1, offset: 2.3 },
        ],
        [size]
    );

    const wavePaths = useMemo(() => {
        const left = vw * 0.02;
        const right = vw * 0.98;
        const points = 60;
        const step = (right - left) / (points - 1);

        return waveDefs.map((wave, wi) => {
            const buildSide = (sign) => {
                let d = "";
                for (let i = 0; i < points; i++) {
                    const x = left + i * step;
                    const t = i / (points - 1);
                    // distance from ring center, used to bulge the wave near the ring
                    const distFromCenter = Math.abs(x - cx) / (vw / 2);
                    const bulge = Math.exp(-Math.pow(distFromCenter * 2.1, 2)) * 0.55 + 0.45;
                    const edgeFade = Math.sin(t * Math.PI);
                    const y =
                        cy +
                        sign *
                            Math.sin(t * Math.PI * wave.freq * 4 + phase * wave.speed + wave.offset) *
                            wave.amp *
                            bulge *
                            edgeFade;
                    d += (i === 0 ? "M " : "L ") + x.toFixed(2) + " " + y.toFixed(2) + " ";
                }
                return d;
            };
            return {
                key: `wave-${wi}`,
                top: buildSide(1),
                bottom: buildSide(-1),
                ...wave,
            };
        });
    }, [cx, cy, phase, vw, waveDefs]);

    // ---- center equalizer bars ----
    const barCount = 9;
    const bars = useMemo(() => {
        return Array.from({ length: barCount }, (_, i) => {
            const seed = i * 1.37;
            return { key: `bar-${i}`, seed, index: i };
        });
    }, []);

    const barMaxH = ringR * 0.72;
    const barGap = (ringR * 1.5) / barCount;
    const barStartX = cx - (barGap * (barCount - 1)) / 2;

    const resolvedLabel =
        label || (resolvedState === "thinking" ? "Thinking..." : resolvedState === "listening" ? "Listening..." : "Idle");

    return (
        <div style={{ width: "60%", maxWidth: vw, margin: "0 auto", textAlign: "center" }}>
            <svg
                viewBox={`0 0 ${vw} ${vh}`}
                width="100%"
                height="auto"
                role="img"
                aria-label={resolvedLabel}
                style={{ display: "block", overflow: "visible" }}
            >
                <defs>
                    <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e94ff5" />
                        <stop offset="30%" stopColor="#b06bff" />
                        <stop offset="65%" stopColor="#5b8bff" />
                        <stop offset="100%" stopColor="#4fd8ff" />
                    </linearGradient>

                    <linearGradient id={waveGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e94ff5" stopOpacity="0.05" />
                        <stop offset="25%" stopColor="#c26bff" stopOpacity="0.75" />
                        <stop offset="50%" stopColor="#9a7bff" stopOpacity="0.9" />
                        <stop offset="75%" stopColor="#5fa8ff" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#4fd8ff" stopOpacity="0.05" />
                    </linearGradient>

                    <filter id={ringGlowId} x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur stdDeviation={size * 0.02} result="near" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.06} result="far" />
                        <feMerge>
                            <feMergeNode in="far" />
                            <feMergeNode in="near" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id={waveGlowId} x="-10%" y="-100%" width="120%" height="300%">
                        <feGaussianBlur stdDeviation={size * 0.012} result="near" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.03} result="far" />
                        <feMerge>
                            <feMergeNode in="far" />
                            <feMergeNode in="near" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id={barGlowId} x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation={size * 0.02} result="b" />
                        <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* mirrored flowing sound-wave lines */}
                <g filter={`url(#${waveGlowId})`}>
                    {wavePaths.map((w) => (
                        <g key={w.key} opacity={w.opacity}>
                            <path d={w.top} fill="none" stroke={`url(#${waveGradId})`} strokeWidth={w.width} strokeLinecap="round" />
                            <path d={w.bottom} fill="none" stroke={`url(#${waveGradId})`} strokeWidth={w.width} strokeLinecap="round" />
                        </g>
                    ))}
                </g>

                {/* ring */}
                <g filter={`url(#${ringGlowId})`}>
                    {resolvedState === "thinking" ? (
                        <g
                            style={{
                                transformOrigin: `${cx}px ${cy}px`,
                                animation: "orb-spin 1.6s linear infinite",
                            }}
                        >
                            <circle
                                cx={cx}
                                cy={cy}
                                r={ringR}
                                fill="none"
                                stroke={`url(#${ringGradId})`}
                                strokeWidth={size * 0.02}
                                strokeOpacity={0.25}
                            />
                            <circle
                                cx={cx}
                                cy={cy}
                                r={ringR}
                                fill="none"
                                stroke={`url(#${ringGradId})`}
                                strokeWidth={size * 0.025}
                                strokeLinecap="round"
                                strokeDasharray={`${ringR * 1.9} ${ringR * 2 * Math.PI}`}
                            />
                        </g>
                    ) : (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={ringR}
                            fill="none"
                            stroke={`url(#${ringGradId})`}
                            strokeWidth={size * 0.022}
                        />
                    )}
                </g>

                {/* center content: equalizer bars or thinking pulse-line */}
                {/* {resolvedState === "thinking" ? (
                    <path
                        d={(() => {
                            const w = ringR * 1.3;
                            const x0 = cx - w / 2;
                            const midDip = ringR * 0.22 * Math.sin(phase * 3);
                            return `M ${x0} ${cy} L ${cx - w * 0.18} ${cy} L ${cx - w * 0.09} ${cy - ringR * 0.3} L ${cx} ${cy + midDip} L ${cx + w * 0.09} ${cy - ringR * 0.22} L ${cx + w * 0.18} ${cy} L ${x0 + w} ${cy}`;
                        })()}
                        fill="none"
                        stroke={`url(#${ringGradId})`}
                        strokeWidth={size * 0.012}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#${barGlowId})`}
                    />
                ) : (
                    <g filter={`url(#${barGlowId})`}>
                        {bars.map((bar) => {
                            const x = barStartX + bar.index * barGap;
                            const wobble = animate
                                ? (Math.sin(phase * 3.2 + bar.seed * 2.1) * 0.5 +
                                      Math.sin(phase * 5.4 + bar.seed) * 0.5) *
                                  0.5 +
                                  0.5
                                : 0.35;
                            const h = Math.max(barMaxH * 0.14, barMaxH * wobble);
                            return (
                                <rect
                                    key={bar.key}
                                    x={x - size * 0.011}
                                    y={cy - h / 2}
                                    width={size * 0.022}
                                    height={h}
                                    rx={size * 0.011}
                                    fill={`url(#${ringGradId})`}
                                />
                            );
                        })}
                    </g>
                )} */}
            </svg>

            <div
                style={{
                    marginTop: size * 0.08,
                    color: "#e7e6fb",
                    fontSize: Math.max(13, size * 0.075),
                    fontFamily: "inherit",
                    letterSpacing: 0.2,
                }}
            >
                {resolvedLabel}
            </div>
            {hint && (
                <div
                    style={{
                        marginTop: size * 0.05,
                        color: "#8b87b8",
                        fontSize: Math.max(11, size * 0.055),
                        fontFamily: "inherit",
                    }}
                >
                    {hint}
                </div>
                
            )}

            <style>{`
                @keyframes orb-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
