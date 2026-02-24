import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg:       "#030507",
  panel:    "#070c10",
  border:   "#1a2530",
  borderHi: "#2a3d50",
  dim:      "#2a3d50",
  muted:    "#4a6070",
  text:     "#c8dae8",
  bright:   "#e8f4ff",
  go:       "#00e87a",
  goBg:     "rgba(0,232,122,0.08)",
  goBdr:    "rgba(0,232,122,0.35)",
  caution:  "#ffc820",
  cautionBg:"rgba(255,200,32,0.08)",
  cautionBdr:"rgba(255,200,32,0.35)",
  nogo:     "#ff2244",
  nogoBg:   "rgba(255,34,68,0.08)",
  nogoBdr:  "rgba(255,34,68,0.35)",
};

const FONT_MONO = "'Share Tech Mono', 'Courier New', monospace";
const FONT_DISPLAY = "'Barlow Condensed', 'Impact', sans-serif";
const FONT_BODY = "'Barlow', 'Helvetica Neue', sans-serif";

// Inject google fonts
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK = {
  time: new Date(),
  flight: { verdict: "CAUTION", reason: "Crosswind 9kt on RWY 17 — within limits but gusty", rwy: "17", xw: 9, hw: 4 },
  spray:  { verdict: "GO",      reason: "Delta-T 4.2°C · Wind 8 km/h · No rain 6h" },
  rain:   { verdict: "GO",      reason: "No significant rain in 6h" },
  threat: { verdict: "CAUTION", reason: "1 minor warning active — Western Port" },
  farm: {
    wind: 8, gust: 14, dir: 162, temp: 18.4, dew: 9.2,
    humidity: 53, rain24: 2.1, rain6: 0,
  },
  airport: {
    wind: 11, gust: 18, dir: 170, temp: 17.8, dew: 8.6,
    qnh: 1017, vis: 12,
  },
  flightWindows: [
    { start: "09:00", end: "11:00", verdict: "GO",      label: "Best window" },
    { start: "13:00", end: "15:30", verdict: "CAUTION", label: "Afternoon gusty" },
    { start: "17:00", end: "18:30", verdict: "GO",      label: "Evening calm" },
  ],
  sprayWindows: [
    { start: "07:30", end: "10:30", verdict: "GO",      label: "Morning ideal" },
    { start: "15:00", end: "17:00", verdict: "CAUTION", label: "Wind building" },
  ],
  runways: [
    { id: "17", hw: 4,  xw: 9,  best: true  },
    { id: "35", hw: -4, xw: 9,  best: false },
    { id: "08", hw: 2,  xw: 11, best: false },
    { id: "26", hw: -2, xw: 11, best: false },
  ],
};

// ─── VERDICT HELPERS ─────────────────────────────────────────────────────────
function verdictColor(v)  { return v === "GO" ? C.go : v === "CAUTION" ? C.caution : C.nogo; }
function verdictBg(v)     { return v === "GO" ? C.goBg : v === "CAUTION" ? C.cautionBg : C.nogoBg; }
function verdictBdr(v)    { return v === "GO" ? C.goBdr : v === "CAUTION" ? C.cautionBdr : C.nogoBdr; }
function verdictLabel(v)  { return v === "NO_GO" ? "NO-GO" : v; }

// ─── CLOCK ───────────────────────────────────────────────────────────────────
function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t;
}

// ─── WIND COMPASS ────────────────────────────────────────────────────────────
function WindCompass({ dir, speed, gust, size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const rad = (dir - 90) * Math.PI / 180;
  const arrowLen = r * 0.72;
  const ax = cx + Math.cos(rad) * arrowLen;
  const ay = cy + Math.sin(rad) * arrowLen;
  const tx = cx - Math.cos(rad) * (r * 0.25);
  const ty = cy - Math.sin(rad) * (r * 0.25);
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 - 90) * Math.PI / 180;
    const inner = i % 9 === 0 ? r * 0.72 : i % 3 === 0 ? r * 0.8 : r * 0.86;
    return { x1: cx + Math.cos(a) * inner, y1: cy + Math.sin(a) * inner,
             x2: cx + Math.cos(a) * r,    y2: cy + Math.sin(a) * r,
             major: i % 9 === 0 };
  });
  const cardinals = [
    { label: "N", a: -90 }, { label: "E", a: 0 }, { label: "S", a: 90 }, { label: "W", a: 180 }
  ];

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="cgrd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d1820" />
          <stop offset="100%" stopColor="#030507" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + size * 0.07} fill="none" stroke={C.border} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r} fill="url(#cgrd)" stroke={C.borderHi} strokeWidth={0.5} />
      {/* Ticks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.major ? C.dim : "#0d1820"} strokeWidth={t.major ? 1.5 : 0.8} />
      ))}
      {/* Cardinal labels */}
      {cardinals.map(({ label, a }) => {
        const rr = (a * Math.PI / 180);
        return (
          <text key={label}
            x={cx + Math.cos(rr) * r * 0.56} y={cy + Math.sin(rr) * r * 0.56 + 4}
            textAnchor="middle" fill={C.muted}
            style={{ fontFamily: FONT_MONO, fontSize: size * 0.1, fontWeight: 600 }}>
            {label}
          </text>
        );
      })}
      {/* Arrow shaft */}
      <line x1={tx} y1={ty} x2={ax} y2={ay}
        stroke={C.go} strokeWidth={2.5} strokeLinecap="round" />
      {/* Arrow head */}
      <polygon
        points={`${ax},${ay} ${ax + Math.cos(rad - 2.4) * r * 0.18},${ay + Math.sin(rad - 2.4) * r * 0.18} ${ax + Math.cos(rad + 2.4) * r * 0.18},${ay + Math.sin(rad + 2.4) * r * 0.18}`}
        fill={C.go} />
      {/* Tail */}
      <circle cx={tx} cy={ty} r={3} fill={C.muted} />
      {/* Center */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.bright}
        style={{ fontFamily: FONT_MONO, fontSize: size * 0.14, fontWeight: 700 }}>
        {speed}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={C.muted}
        style={{ fontFamily: FONT_MONO, fontSize: size * 0.09 }}>
        km/h
      </text>
    </svg>
  );
}

// ─── VERDICT STAMP ───────────────────────────────────────────────────────────
function Stamp({ verdict, size = "lg" }) {
  const sz = { sm: { fs: "0.75rem", pad: "0.2rem 0.6rem", bw: 1.5 },
                md: { fs: "1.1rem",  pad: "0.3rem 0.9rem", bw: 2 },
                lg: { fs: "2.2rem",  pad: "0.4rem 1.4rem", bw: 3 },
                xl: { fs: "3.5rem",  pad: "0.6rem 2rem",   bw: 4 } }[size];
  const col = verdictColor(verdict);
  const pulse = verdict === "NO_GO"
    ? { animation: "hmPulse 1.8s ease-in-out infinite" } : {};
  return (
    <span style={{
      display: "inline-block", fontFamily: FONT_DISPLAY, fontWeight: 900,
      letterSpacing: "0.12em", lineHeight: 1, color: col,
      fontSize: sz.fs, padding: sz.pad,
      border: `${sz.bw}px solid ${col}`, borderRadius: "4px",
      background: verdictBg(verdict), ...pulse,
      textShadow: verdict === "NO_GO" ? `0 0 20px ${col}80` : "none",
    }}>
      {verdictLabel(verdict)}
    </span>
  );
}

// ─── THE BIG QUESTION CARD ───────────────────────────────────────────────────
function QuestionCard({ question, verdict, reason, sub }) {
  const col = verdictColor(verdict);
  return (
    <div style={{
      background: verdictBg(verdict),
      border: `1.5px solid ${verdictBdr(verdict)}`,
      borderRadius: "8px", padding: "1.25rem 1.4rem",
      display: "flex", flexDirection: "column", gap: "0.6rem",
      position: "relative", overflow: "hidden",
    }}>
      {/* Corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 40, height: 40,
        background: `linear-gradient(225deg, ${col}30, transparent)`,
        borderRadius: "0 8px 0 0",
      }} />
      <div style={{
        fontFamily: FONT_MONO, fontSize: "0.65rem", fontWeight: 600,
        letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase",
      }}>
        {question}
      </div>
      <Stamp verdict={verdict} size="lg" />
      <div style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: C.text, lineHeight: 1.4 }}>
        {reason}
      </div>
      {sub && <div style={{ fontFamily: FONT_MONO, fontSize: "0.72rem", color: C.muted }}>{sub}</div>}
    </div>
  );
}

// ─── INSTRUMENT CELL ─────────────────────────────────────────────────────────
function Inst({ label, value, unit, accent }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: "6px", padding: "0.65rem 0.75rem", textAlign: "center",
      borderTop: accent ? `2px solid ${accent}` : `1px solid ${C.border}`,
    }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", letterSpacing: "0.18em", color: C.muted, marginBottom: "0.3rem" }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: "1.25rem", fontWeight: 700, color: accent || C.bright, lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: "0.7rem", color: C.muted, marginLeft: "0.2rem" }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── TIMELINE BAR ────────────────────────────────────────────────────────────
function TimelineBar({ windows, type }) {
  // 06:00 to 20:00 = 14h window
  const START_H = 6, SPAN_H = 14;
  function pct(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return Math.max(0, Math.min(100, ((h + m/60 - START_H) / SPAN_H) * 100));
  }
  const now = new Date();
  const nowPct = ((now.getHours() + now.getMinutes()/60 - START_H) / SPAN_H) * 100;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted, marginBottom: "0.4rem" }}>
        {type} WINDOWS  ·  06:00 — 20:00 LOCAL
      </div>
      {/* Track */}
      <div style={{
        position: "relative", height: "32px",
        background: "#070c10", border: `1px solid ${C.border}`, borderRadius: "4px",
        overflow: "hidden",
      }}>
        {/* Hour ticks */}
        {Array.from({ length: 13 }, (_, i) => (
          <div key={i} style={{
            position: "absolute", left: `${(i/14)*100}%`, top: 0, bottom: 0,
            borderLeft: `1px solid ${C.border}`, opacity: 0.5,
          }} />
        ))}
        {/* Windows */}
        {windows.map((w, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${pct(w.start)}%`,
            width: `${pct(w.end) - pct(w.start)}%`,
            top: "4px", bottom: "4px",
            background: verdictBg(w.verdict),
            borderLeft: `3px solid ${verdictColor(w.verdict)}`,
            borderRadius: "2px",
            display: "flex", alignItems: "center", paddingLeft: "0.4rem",
          }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: "0.6rem",
              fontWeight: 700, color: verdictColor(w.verdict), whiteSpace: "nowrap",
            }}>
              {w.start}–{w.end}
            </span>
          </div>
        ))}
        {/* Now marker */}
        {nowPct >= 0 && nowPct <= 100 && (
          <div style={{
            position: "absolute", left: `${nowPct}%`, top: 0, bottom: 0,
            borderLeft: "2px solid #fff", opacity: 0.8,
          }}>
            <div style={{
              position: "absolute", top: 0, left: 4,
              fontFamily: FONT_MONO, fontSize: "0.55rem", color: "#fff", whiteSpace: "nowrap",
            }}>NOW</div>
          </div>
        )}
      </div>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
        {["06", "08", "10", "12", "14", "16", "18", "20"].map(h => (
          <span key={h} style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: C.dim }}>
            {h}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── RUNWAY CARD ─────────────────────────────────────────────────────────────
function RunwayCard({ rwy }) {
  const col = rwy.best ? C.go : C.muted;
  return (
    <div style={{
      background: rwy.best ? C.goBg : C.panel,
      border: `1px solid ${rwy.best ? C.goBdr : C.border}`,
      borderRadius: "6px", padding: "0.6rem 0.8rem",
      textAlign: "center", position: "relative",
    }}>
      {rwy.best && (
        <div style={{
          position: "absolute", top: "0.3rem", right: "0.4rem",
          fontFamily: FONT_MONO, fontSize: "0.5rem", color: C.go, letterSpacing: "0.1em",
        }}>BEST</div>
      )}
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.8rem", color: col, lineHeight: 1 }}>
        {rwy.id}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: C.muted, marginTop: "0.25rem" }}>
        {rwy.hw >= 0 ? "HW" : "TW"} {Math.abs(rwy.hw)}kt
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: rwy.xw > 10 ? C.caution : C.muted }}>
        XW {rwy.xw}kt
      </div>
    </div>
  );
}

// ─── QUICK LOG ────────────────────────────────────────────────────────────────
function QuickLog() {
  const [last, setLast] = useState(null);
  const [entries, setEntries] = useState([]);
  const types = [
    { id: "rain",  label: "RAIN",  color: "#3399ff", glyph: "⬇" },
    { id: "spray", label: "SPRAY", color: C.go,      glyph: "◈" },
    { id: "maint", label: "MAINT", color: "#ff8c00", glyph: "⚙" },
    { id: "flight",label: "FLT",   color: "#cc66ff", glyph: "▲" },
  ];
  function log(type) {
    const now = new Date();
    const entry = { ...type, time: now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false }) };
    setLast(entry);
    setEntries(prev => [entry, ...prev.slice(0, 4)]);
    setTimeout(() => setLast(null), 2500);
  }
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: "8px", padding: "1rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted }}>
          QUICK LOG
        </div>
        {last && (
          <div style={{
            fontFamily: FONT_MONO, fontSize: "0.7rem",
            color: last.color, animation: "hmFadeIn 0.2s ease",
          }}>
            ✓ {last.label} logged
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {types.map(t => (
          <button key={t.id} onClick={() => log(t)} style={{
            background: "transparent",
            border: `1.5px solid ${t.color}40`,
            borderRadius: "6px", padding: "0.9rem 0.25rem",
            color: t.color, cursor: "pointer", transition: "all 0.15s",
            fontFamily: FONT_MONO, fontWeight: 700, fontSize: "0.7rem",
            letterSpacing: "0.1em", lineHeight: 1.4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${t.color}15`; e.currentTarget.style.borderColor = t.color; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${t.color}40`; }}>
            <div style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{t.glyph}</div>
            {t.label}
          </button>
        ))}
      </div>
      {entries.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "0.5rem" }}>
          {entries.map((e, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: FONT_MONO, fontSize: "0.65rem", color: C.muted,
              padding: "0.15rem 0",
            }}>
              <span style={{ color: e.color }}>{e.label}</span>
              <span>{e.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.25em", color: C.muted, textTransform: "uppercase" }}>
        {label}
      </div>
      {sub && <div style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: C.dim }}>{sub}</div>}
      <div style={{ flex: 1, height: "1px", background: C.border }} />
    </div>
  );
}

// ─── CHECK ROW ────────────────────────────────────────────────────────────────
function CheckRow({ label, verdict, reason, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.75rem",
      padding: "0.6rem 0.75rem",
      borderBottom: last ? "none" : `1px solid ${C.border}`,
    }}>
      <div style={{
        width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
        background: verdictColor(verdict),
        boxShadow: `0 0 6px ${verdictColor(verdict)}80`,
      }} />
      <div style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", fontWeight: 600, color: C.bright, minWidth: "90px" }}>
        {label}
      </div>
      <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: "0.82rem", color: C.muted }}>
        {reason}
      </div>
      <Stamp verdict={verdict} size="sm" />
    </div>
  );
}

// ─── DISPATCH BOX ────────────────────────────────────────────────────────────
function DispatchBox({ text }) {
  return (
    <div style={{
      background: "rgba(0,232,122,0.05)", border: `1px solid ${C.goBdr}`,
      borderLeft: `4px solid ${C.go}`,
      borderRadius: "6px", padding: "1rem 1.25rem",
    }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.go, marginBottom: "0.4rem" }}>
        ▶ DISPATCH
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: "1rem", fontWeight: 500, color: C.bright, lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}

// ─── DOCTRINE ANNOTATION ─────────────────────────────────────────────────────
function DocNote({ children, anchor = "left" }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: "0.6rem", color: C.caution,
      letterSpacing: "0.08em", lineHeight: 1.5,
      padding: "0.5rem 0.75rem",
      background: "rgba(255,200,32,0.06)",
      borderLeft: anchor === "left" ? `2px solid ${C.caution}` : "none",
      borderRight: anchor === "right" ? `2px solid ${C.caution}` : "none",
      borderRadius: "2px",
    }}>
      <span style={{ color: C.caution, opacity: 0.6 }}>DOCTRINE · </span>
      {children}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const clock = useClock();
  const [activeTab, setActiveTab] = useState("command");
  const timeStr = clock.toLocaleTimeString("en-AU", {
    timeZone: "Australia/Melbourne",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const dateStr = clock.toLocaleDateString("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short", day: "numeric", month: "short",
  });

  const tabs = ["command", "flight", "farm", "doctrine"];

  return (
    <>
      <style>{`
        @import url('${FONTS_URL}');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes hmPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,34,68,0.4); }
          50% { opacity: 0.85; box-shadow: 0 0 0 6px rgba(255,34,68,0); }
        }
        @keyframes hmFadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hmBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      <div style={{
        background: C.bg, minHeight: "100vh", color: C.text,
        fontFamily: FONT_BODY,
        // Subtle scanline texture
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`,
      }}>

        {/* ── HEADER ── */}
        <header style={{
          background: C.panel, borderBottom: `1px solid ${C.border}`,
          padding: "0 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "52px", position: "sticky", top: 0, zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.1rem",
              letterSpacing: "0.12em", color: C.go,
            }}>
              HMFFCC
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: "0.55rem", color: C.dim,
              letterSpacing: "0.1em",
            }}>
              HEAVENS MEADOW · YTYA · VIC
            </div>
          </div>

          {/* Tabs */}
          <nav style={{ display: "flex", gap: "0" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                fontFamily: FONT_MONO, fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase",
                padding: "0 1rem", height: "52px", cursor: "pointer",
                background: activeTab === t ? `${C.go}12` : "transparent",
                color: activeTab === t ? C.go : C.muted,
                border: "none", borderBottom: activeTab === t ? `2px solid ${C.go}` : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                {t}
              </button>
            ))}
          </nav>

          {/* Clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: "1.1rem", fontWeight: 700,
              color: C.bright, letterSpacing: "0.08em",
            }}>
              {timeStr.slice(0, 5)}
              <span style={{ animation: "hmBlink 1s step-end infinite", color: C.muted }}>:</span>
              {timeStr.slice(6)}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: C.dim, letterSpacing: "0.1em" }}>
              {dateStr}
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.25rem 1.5rem" }}>

          {/* ══════════════ COMMAND TAB ══════════════ */}
          {activeTab === "command" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* DISPATCH */}
              <DispatchBox text="Spray window open — Delta-T 4.2°C, wind 8 km/h. Flight possible with caution: RWY 17 crosswind 9kt, gusts 18kt. Minor warning active Western Port — no threat to operations." />

              {/* BIG FOUR QUESTIONS */}
              <div>
                <SectionHeader label="The Five Questions" sub="All decisions collapse to these" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                  <QuestionCard question="CAN I FLY?" verdict="CAUTION" reason="Crosswind 9kt on RWY 17 · gusty this afternoon" sub="RWY 17 best · HW 4kt · XW 9kt" />
                  <QuestionCard question="CAN I SPRAY?" verdict="GO" reason="Delta-T 4.2°C · Wind 8 km/h · Rain-free 6h" />
                  <QuestionCard question="CAN MACHINES MOVE?" verdict="GO" reason="2.1mm in 24h — ground firm" />
                  <QuestionCard question="DANGER NEARBY?" verdict="CAUTION" reason="1 minor warning — Western Port · No impact to farm" />
                </div>
              </div>

              {/* WINDOWS */}
              <div>
                <SectionHeader label="Windows" sub="GO = solid · CAUTION = hatched" />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem",
                  background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1rem" }}>
                  <TimelineBar windows={MOCK.flightWindows} type="FLIGHT" />
                  <TimelineBar windows={MOCK.sprayWindows}  type="SPRAY" />
                </div>
              </div>

              {/* INSTRUMENTS */}
              <div>
                <SectionHeader label="Current Conditions" sub="Farm · YTYA" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.5rem" }}>
                  <Inst label="FARM TEMP" value={MOCK.farm.temp} unit="°C" accent={C.caution} />
                  <Inst label="DEW POINT" value={MOCK.farm.dew}  unit="°C" />
                  <Inst label="DELTA-T"   value={(MOCK.farm.temp - MOCK.farm.dew).toFixed(1)} unit="°C" accent={C.go} />
                  <Inst label="HUMIDITY"  value={MOCK.farm.humidity} unit="%" />
                  <Inst label="WIND"      value={MOCK.farm.wind} unit="km/h" />
                  <Inst label="GUSTS"     value={MOCK.farm.gust} unit="km/h" accent={C.caution} />
                  <Inst label="RAIN 24H"  value={MOCK.farm.rain24} unit="mm" />
                  <Inst label="RAIN 6H"   value={MOCK.farm.rain6}  unit="mm" />
                  <Inst label="QNH"       value={MOCK.airport.qnh} unit="hPa" />
                  <Inst label="VISIBILITY" value={MOCK.airport.vis} unit="km" />
                </div>
              </div>

              {/* LOG */}
              <QuickLog />
            </div>
          )}

          {/* ══════════════ FLIGHT TAB ══════════════ */}
          {activeTab === "flight" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <SectionHeader label="Flight Assessment" sub="YTYA Tyabb · Real-time" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {/* Left: verdict + checks */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Overall */}
                  <div style={{
                    background: C.cautionBg, border: `2px solid ${C.cautionBdr}`,
                    borderRadius: "10px", padding: "1.5rem", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.muted, marginBottom: "0.75rem" }}>
                      FLIGHT STATUS
                    </div>
                    <Stamp verdict="CAUTION" size="xl" />
                    <div style={{ marginTop: "1rem", fontFamily: FONT_BODY, fontSize: "1rem", color: C.text }}>
                      Crosswind 9kt on RWY 17 — within limits but gusting to 18kt. Fly with awareness.
                    </div>
                  </div>

                  {/* Checks */}
                  <div style={{
                    background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden",
                  }}>
                    <div style={{ padding: "0.6rem 0.75rem", borderBottom: `1px solid ${C.border}`, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted }}>
                      PRE-FLIGHT CHECKS
                    </div>
                    <CheckRow label="Wind"        verdict="CAUTION" reason="RWY 17: HW 4kt, XW 9kt, gusts 18kt" />
                    <CheckRow label="Visibility"  verdict="GO"      reason="12 km — well above VFR minimum" />
                    <CheckRow label="Ceiling"     verdict="GO"      reason="Est. cloud base ~2,300 ft" />
                    <CheckRow label="Density Alt" verdict="GO"      reason="Est. 680 ft — negligible performance effect" />
                    <CheckRow label="Fog"         verdict="GO"      reason="Spread 9.2°C — low risk" />
                    <CheckRow label="Precip"      verdict="GO"      reason="No precipitation" last />
                  </div>
                </div>

                {/* Right: compass + runway */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Compass */}
                  <div style={{
                    background: C.panel, border: `1px solid ${C.border}`,
                    borderRadius: "8px", padding: "1rem",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
                  }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted }}>
                      WIND — YTYA
                    </div>
                    <WindCompass dir={MOCK.airport.dir} speed={MOCK.airport.wind} gust={MOCK.airport.gust} size={160} />
                    <div style={{ fontFamily: FONT_MONO, fontSize: "0.75rem", color: C.muted }}>
                      {MOCK.airport.dir}° · {MOCK.airport.wind} km/h · Gusts {MOCK.airport.gust} km/h
                    </div>
                  </div>

                  {/* Runways */}
                  <div style={{
                    background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1rem",
                  }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted, marginBottom: "0.75rem" }}>
                      RUNWAY ANALYSIS
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {MOCK.runways.map(r => <RunwayCard key={r.id} rwy={r} />)}
                    </div>
                  </div>

                  {/* Instruments */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <Inst label="CLOUD BASE" value="~2,300" unit="ft" accent={C.go} />
                    <Inst label="DENSITY ALT" value="~680"  unit="ft" accent={C.go} />
                    <Inst label="GUST FACTOR" value="1.64" accent={C.caution} />
                    <Inst label="QNH" value={MOCK.airport.qnh} unit="hPa" />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1rem" }}>
                <TimelineBar windows={MOCK.flightWindows} type="FLIGHT" />
              </div>
            </div>
          )}

          {/* ══════════════ FARM TAB ══════════════ */}
          {activeTab === "farm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <SectionHeader label="Farm Operations" sub="Heavens Meadow · 79m elevation" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <QuestionCard question="SPRAY" verdict="GO" reason="Wind 8 km/h · Delta-T 4.2°C · Ideal" sub="Window closes ~10:30 as wind builds" />
                <QuestionCard question="FIELD ACCESS" verdict="GO" reason="2.1mm in 24h — ground firm" />
                <QuestionCard question="HAY" verdict="GO" reason="Dry and clear · Humidity 53%" />
              </div>

              {/* Spray conditions detail */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "0.6rem 0.75rem", borderBottom: `1px solid ${C.border}`, fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted }}>
                  SPRAY CONDITIONS
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.5rem", padding: "0.75rem" }}>
                  <Inst label="DELTA-T"     value="4.2"  unit="°C"    accent={C.go} />
                  <Inst label="WIND"        value="8"    unit="km/h"  accent={C.go} />
                  <Inst label="GUSTS"       value="14"   unit="km/h"  accent={C.caution} />
                  <Inst label="DRIFT RISK"  value="LOW"              accent={C.go} />
                  <Inst label="HUMIDITY"    value="53"   unit="%" />
                  <Inst label="RAIN 6H"     value="0"    unit="mm" />
                </div>
              </div>

              {/* Wind compass for farm */}
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "1rem", background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1rem", alignItems: "center" }}>
                <WindCompass dir={MOCK.farm.dir} speed={MOCK.farm.wind} size={150} />
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", color: C.muted, marginBottom: "0.5rem" }}>FARM WIND · 162° SSE</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "2.5rem", color: C.bright, lineHeight: 1 }}>8 <span style={{ fontSize: "1rem", color: C.muted, fontFamily: FONT_MONO }}>km/h</span></div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: "0.8rem", color: C.caution, marginTop: "0.25rem" }}>Gusts 14 km/h</div>
                  <div style={{ marginTop: "0.75rem", fontFamily: FONT_BODY, fontSize: "0.85rem", color: C.muted }}>
                    Conditions ideal for spraying. Wind at lower end of window — ensure not dropping below 3 km/h.
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1rem" }}>
                <TimelineBar windows={MOCK.sprayWindows} type="SPRAY" />
              </div>

              <QuickLog />
            </div>
          )}

          {/* ══════════════ DOCTRINE TAB ══════════════ */}
          {activeTab === "doctrine" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

              {/* Title */}
              <div style={{ textAlign: "center", padding: "2rem 0 1rem" }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.3em", color: C.muted, marginBottom: "0.75rem" }}>
                  HMFFCC · UI AESTHETIC DOCTRINE · V1.0
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "3rem", color: C.bright, letterSpacing: "0.1em", lineHeight: 1 }}>
                  THIS IS NOT AN APP
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "3rem", letterSpacing: "0.1em", lineHeight: 1 }}>
                  <span style={{ color: C.go }}>THIS IS AUTHORITY</span>
                </div>
              </div>

              {/* Rule 1: Three States */}
              <div>
                <SectionHeader label="Rule 1 · Eliminate Ambiguity" sub="Every screen collapses to three states" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  {[
                    { v: "GO",      label: "Proceed.", sub: "Conditions met. Move.", col: C.go },
                    { v: "CAUTION", label: "Possible.", sub: "Understand the risk.", col: C.caution },
                    { v: "NO_GO",   label: "Do not.", sub: "Not a suggestion.", col: C.nogo },
                  ].map(({ v, label, sub, col }) => (
                    <div key={v} style={{
                      background: verdictBg(v), border: `2px solid ${verdictBdr(v)}`,
                      borderRadius: "10px", padding: "2rem 1.5rem", textAlign: "center",
                    }}>
                      <Stamp verdict={v} size="xl" />
                      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.5rem", color: col, marginTop: "1rem" }}>{label}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: "0.7rem", color: C.muted, marginTop: "0.25rem" }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <DocNote>No gradients. No soft colors. No animated fluff. Hard lines. Clear status. Authority.</DocNote>
                </div>
              </div>

              {/* Rule 2: Language */}
              <div>
                <SectionHeader label="Rule 2 · Compute What Others Refuse To Compute" sub="Convert physics into decision" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {[
                    { bad: "Wind 19kt gust 28.", good: "Crosswind exceeds personal limit by 4kt. Unsafe for RWY 17." },
                    { bad: "Temp 3°, Dew 2°.", good: "Fog risk at sunrise. Visibility may collapse 06:10–07:00." },
                    { bad: "Rain 4mm.", good: "Field access compromised for 36–48 hours." },
                    { bad: "Conditions appear favorable…", good: "Spray now. 2-hour window." },
                  ].map((ex, i) => (
                    <div key={i} style={{
                      background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden",
                    }}>
                      <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${C.border}`, display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: "0.7rem", color: C.nogo, flexShrink: 0 }}>✗</span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: "0.78rem", color: C.muted }}>{ex.bad}</span>
                      </div>
                      <div style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: "0.7rem", color: C.go, flexShrink: 0 }}>✓</span>
                        <span style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", fontWeight: 600, color: C.bright }}>{ex.good}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule 3: Typography */}
              <div>
                <SectionHeader label="Rule 3 · Type Hierarchy" sub="Every weight is earned. Every size has a job." />
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[
                    { role: "Verdict — The answer.", sample: "GO", font: FONT_DISPLAY, size: "3.5rem", weight: 900, col: C.go },
                    { role: "Decision — The reason.", sample: "Crosswind 9kt on RWY 17. Within limits.", font: FONT_BODY, size: "1rem", weight: 500, col: C.text },
                    { role: "Instrument — The number.", sample: "17.8°C", font: FONT_MONO, size: "1.3rem", weight: 700, col: C.bright },
                    { role: "Label — The category.", sample: "DENSITY ALT", font: FONT_MONO, size: "0.58rem", weight: 600, col: C.muted },
                    { role: "Docstring — The system.", sample: "HMFFCC · YTYA · VIC", font: FONT_MONO, size: "0.55rem", weight: 400, col: C.dim },
                  ].map((t, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "1rem", alignItems: "center", paddingBottom: "1.25rem", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: C.muted, letterSpacing: "0.1em" }}>ROLE</div>
                        <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.text, marginTop: "0.2rem" }}>{t.role}</div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: "0.58rem", color: C.dim, marginTop: "0.5rem" }}>
                          {t.font.split(",")[0].replace(/'/g, "")} · {t.size} · {t.weight}
                        </div>
                      </div>
                      <div style={{ fontFamily: t.font, fontSize: t.size, fontWeight: t.weight, color: t.col }}>
                        {t.sample}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule 4: Color System */}
              <div>
                <SectionHeader label="Rule 4 · Color — Meaning, Not Decoration" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
                  {[
                    { name: "GO",      hex: C.go,      use: "Clear condition. Proceed." },
                    { name: "CAUTION", hex: C.caution, use: "Risk present. Decide consciously." },
                    { name: "NO-GO",   hex: C.nogo,    use: "Do not. No exceptions." },
                    { name: "BRIGHT",  hex: C.bright,  use: "Primary data. Read this." },
                    { name: "TEXT",    hex: C.text,    use: "Secondary data. Context." },
                    { name: "MUTED",   hex: C.muted,   use: "Labels. System. Dim." },
                    { name: "PANEL",   hex: C.panel,   use: "Card surface. One step up." },
                    { name: "BG",      hex: C.bg,      use: "Ground. Absolute black." },
                  ].map(c => (
                    <div key={c.name} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ height: "40px", background: c.hex }} />
                      <div style={{ padding: "0.5rem 0.6rem" }}>
                        <div style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", fontWeight: 700, color: C.bright }}>{c.name}</div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", color: C.muted }}>{c.hex}</div>
                        <div style={{ fontFamily: FONT_BODY, fontSize: "0.7rem", color: C.muted, marginTop: "0.25rem" }}>{c.use}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule 5: Calm Interface */}
              <div>
                <SectionHeader label="Rule 5 · The Calm Instrument" sub="The more serious the system, the quieter the interface" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.25rem" }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.muted, marginBottom: "1rem" }}>
                      THIS INTERFACE MUST FEEL LIKE
                    </div>
                    {["A kneeboard checklist.", "A hangar whiteboard.", "A farmer's log ledger."].map(t => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.go, flexShrink: 0 }} />
                        <span style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: C.bright }}>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.25rem" }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.nogo, marginBottom: "1rem" }}>
                      NOT A
                    </div>
                    {["SaaS dashboard.", "Mobile app.", "Weather website.", "Aviation app with 9 tabs."].map(t => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.nogo, flexShrink: 0 }} />
                        <span style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: C.muted }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Memetic core */}
              <div style={{
                background: "rgba(0,232,122,0.05)",
                border: `1px solid ${C.goBdr}`,
                borderRadius: "10px", padding: "2rem",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.3em", color: C.muted, marginBottom: "1.25rem" }}>
                  MEMETIC CORE · THE TEST
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.5rem", color: C.nogo }}>FAIL</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: C.muted, marginTop: "0.25rem", fontStyle: "italic" }}>
                      "Let me just check another weather app…"
                    </div>
                  </div>
                  <div style={{ width: "1px", background: C.border }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: "1.5rem", color: C.go }}>WIN</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: C.text, marginTop: "0.25rem", fontStyle: "italic" }}>
                      "Good. That's sorted."
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom spacer */}
              <div style={{ height: "2rem" }} />
            </div>
          )}

        </main>
      </div>
    </>
  );
}
