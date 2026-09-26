/* Charts + interactions for The Desert Speaks */

const SPECIES = [
  { sci: "Streptopelia decaocto",    com: "Eurasian Collared Dove",   det: 511, conf: 0.807 },
  { sci: "Iduna pallida",            com: "Eastern Olivaceous Warbler", det: 232, conf: 0.698 },
  { sci: "Otus scops",               com: "Eurasian Scops Owl",       det: 159, conf: 0.829 },
  { sci: "Merops apiaster",          com: "European Bee-eater",       det: 78,  conf: 0.861 },
  { sci: "Corvus ruficollis",        com: "Brown-necked Raven",       det: 76,  conf: 0.748 },
  { sci: "Phoenicurus phoenicurus",  com: "Common Redstart",          det: 34,  conf: 0.739 },
  { sci: "Passer hispaniolensis",    com: "Spanish Sparrow",          det: 22,  conf: 0.596 },
  { sci: "Muscicapa striata",        com: "Spotted Flycatcher",       det: 17,  conf: 0.779 },
  { sci: "Athene noctua",            com: "Little Owl",               det: 13,  conf: 0.633 },
  { sci: "Tringa ochropus",          com: "Green Sandpiper",          det: 8,   conf: 0.894 }
];

const DIEL = [
  { period: "Dawn",      species: 12, detections: 288, start: 4,  end: 7,  color: "#D4A574" },
  { period: "Morning",   species: 8,  detections: 356, start: 7,  end: 12, color: "#B8804A" },
  { period: "Afternoon", species: 17, detections: 369, start: 12, end: 18, color: "#8C5A2E" },
  { period: "Dusk",      species: 3,  detections: 3,   start: 18, end: 20, color: "#5A4030" },
  { period: "Night",     species: 10, detections: 194, start: 20, end: 28, color: "#2B3A3F" }
];

// Tooltip helper
function createTip() {
  const el = document.createElement("div");
  el.className = "chart-tip";
  document.body.appendChild(el);
  return el;
}
const TIP = createTip();
function showTip(e, html) {
  TIP.innerHTML = html;
  TIP.classList.add("on");
  const rect = TIP.getBoundingClientRect();
  TIP.style.left = (e.clientX - rect.width/2) + "px";
  TIP.style.top  = (e.clientY - rect.height - 12) + "px";
}
function hideTip() { TIP.classList.remove("on"); }

/* ---------- Chart 1: Species frequency (horizontal bar) ---------- */
function renderSpeciesChart() {
  const host = document.getElementById("chart-species");
  if (!host) return;
  const W = 720, rowH = 34, pad = { top: 20, right: 60, bottom: 30, left: 210 };
  const H = pad.top + pad.bottom + SPECIES.length * rowH;
  const max = Math.max(...SPECIES.map(s => s.det));
  const scale = d => d / max * (W - pad.left - pad.right);

  let svg = `<svg class="svg-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;
  // gridlines
  [0, 100, 200, 300, 400, 500].forEach(v => {
    const x = pad.left + scale(v);
    svg += `<line class="grid" x1="${x}" y1="${pad.top}" x2="${x}" y2="${H-pad.bottom}"/>`;
    svg += `<text class="tick-label" x="${x}" y="${H-pad.bottom+14}" text-anchor="middle">${v}</text>`;
  });
  svg += `<text class="axis-title" x="${pad.left+(W-pad.left-pad.right)/2}" y="${H-4}" text-anchor="middle">DETECTIONS</text>`;

  SPECIES.forEach((s, i) => {
    const y = pad.top + i * rowH + 6;
    const w = scale(s.det);
    svg += `<text class="bar-label" x="${pad.left-8}" y="${y+14}" text-anchor="end">${s.com}</text>`;
    svg += `<text class="bar-sci" x="${pad.left-8}" y="${y+26}" text-anchor="end">${s.sci}</text>`;
    svg += `<rect class="bar" data-i="${i}" x="${pad.left}" y="${y+2}" width="0" height="20" rx="1" data-target="${w}"/>`;
    svg += `<text class="tick-label" x="${pad.left+w+6}" y="${y+16}" style="fill:var(--ink)">${s.det}</text>`;
  });
  svg += `</svg>`;
  host.innerHTML = svg;

  // animate + hover
  const bars = host.querySelectorAll(".bar");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        bars.forEach((b, i) => {
          setTimeout(() => {
            b.setAttribute("width", b.dataset.target);
            b.style.transition = "width 0.8s cubic-bezier(.2,.7,.2,1)";
          }, i * 45);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.15 });
  observer.observe(host);

  bars.forEach(b => {
    b.addEventListener("mousemove", e => {
      const s = SPECIES[+b.dataset.i];
      showTip(e, `<strong>${s.det}</strong> detections<br>conf · ${s.conf.toFixed(2)}`);
    });
    b.addEventListener("mouseleave", hideTip);
  });
}

/* ---------- Chart 2: Diel ring ---------- */
function renderDielRing() {
  const host = document.getElementById("chart-diel");
  if (!host) return;
  const size = 320, cx = size/2, cy = size/2, r = 120, innerR = 70;
  const total = 24;

  let svg = `<svg class="svg-chart diel-ring" viewBox="0 0 ${size} ${size}">`;

  DIEL.forEach((d, i) => {
    const start = d.start;
    const end = d.end > 24 ? d.end - 24 : d.end;
    const wrap = d.end > 24;
    const arc = (s, e) => {
      const sa = (s/total) * Math.PI * 2 - Math.PI/2;
      const ea = (e/total) * Math.PI * 2 - Math.PI/2;
      const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
      const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
      const xi1 = cx + innerR * Math.cos(sa), yi1 = cy + innerR * Math.sin(sa);
      const xi2 = cx + innerR * Math.cos(ea), yi2 = cy + innerR * Math.sin(ea);
      const large = (e - s) > 12 ? 1 : 0;
      return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`;
    };
    if (wrap) {
      svg += `<path class="diel-seg" data-i="${i}" d="${arc(start, 24)}" fill="${d.color}" opacity="0"/>`;
      svg += `<path class="diel-seg" data-i="${i}" d="${arc(0, end)}" fill="${d.color}" opacity="0"/>`;
    } else {
      svg += `<path class="diel-seg" data-i="${i}" d="${arc(start, end)}" fill="${d.color}" opacity="0"/>`;
    }
  });

  // hour ticks
  for (let h = 0; h < 24; h += 3) {
    const a = (h/total) * Math.PI * 2 - Math.PI/2;
    const x1 = cx + (r+4) * Math.cos(a), y1 = cy + (r+4) * Math.sin(a);
    const x2 = cx + (r+12) * Math.cos(a), y2 = cy + (r+12) * Math.sin(a);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--mute)" stroke-width="1"/>`;
    const tx = cx + (r+24) * Math.cos(a), ty = cy + (r+24) * Math.sin(a);
    svg += `<text class="tick-label" x="${tx}" y="${ty+3}" text-anchor="middle">${String(h).padStart(2,"0")}</text>`;
  }

  // center label
  svg += `<text x="${cx}" y="${cy-8}" text-anchor="middle" font-family="var(--serif)" font-size="38" fill="var(--ink)">1,210</text>`;
  svg += `<text x="${cx}" y="${cy+12}" text-anchor="middle" font-family="var(--mono)" font-size="10" fill="var(--mute)" style="text-transform:uppercase; letter-spacing: 0.15em">detections</text>`;
  svg += `<text x="${cx}" y="${cy+28}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--mute)">17 HOURS</text>`;

  svg += `</svg>`;
  host.innerHTML = svg;

  const segs = host.querySelectorAll(".diel-seg");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        segs.forEach((s, i) => {
          setTimeout(() => {
            s.style.transition = "opacity 0.6s";
            s.style.opacity = 1;
          }, i * 100);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  obs.observe(host);

  segs.forEach(s => {
    s.addEventListener("mousemove", e => {
      const d = DIEL[+s.dataset.i];
      showTip(e, `<strong>${d.period}</strong><br>${d.detections} detections · ${d.species} species`);
    });
    s.addEventListener("mouseleave", hideTip);
  });
}

/* ---------- Chart 3: Species accumulation curve ---------- */
function renderAccumulation() {
  const host = document.getElementById("chart-accum");
  if (!host) return;
  // Fabricated but realistic accumulation curve (17 hours)
  const data = [
    [0, 0], [0.5, 8], [1, 12], [2, 13], [3, 14], [4, 15], [5, 15],
    [6, 16], [7, 17], [8, 18], [9, 19], [10, 20], [11, 20], [12, 21],
    [13, 22], [14, 23], [14.5, 25], [15, 27], [15.5, 28], [16, 29], [17, 29]
  ];
  const W = 720, H = 320;
  const pad = { top: 20, right: 30, bottom: 40, left: 40 };
  const xMax = 17, yMax = 30;
  const sx = t => pad.left + (t/xMax) * (W - pad.left - pad.right);
  const sy = v => H - pad.bottom - (v/yMax) * (H - pad.top - pad.bottom);

  let svg = `<svg class="svg-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;
  // gridlines horizontal
  [0,10,20,30].forEach(v => {
    svg += `<line class="grid" x1="${pad.left}" y1="${sy(v)}" x2="${W-pad.right}" y2="${sy(v)}"/>`;
    svg += `<text class="tick-label" x="${pad.left-6}" y="${sy(v)+3}" text-anchor="end">${v}</text>`;
  });
  // vertical gridlines at key hours
  [0,4,8,12,16].forEach(h => {
    svg += `<line class="grid" x1="${sx(h)}" y1="${pad.top}" x2="${sx(h)}" y2="${H-pad.bottom}"/>`;
    svg += `<text class="tick-label" x="${sx(h)}" y="${H-pad.bottom+16}" text-anchor="middle">${h}h</text>`;
  });

  // Phase shading
  const phases = [
    { s: 0, e: 1, label: "RESIDENTS" },
    { s: 10, e: 14, label: "NIGHT PULSE" },
    { s: 14, e: 17, label: "DAWN" }
  ];
  phases.forEach(p => {
    svg += `<rect x="${sx(p.s)}" y="${pad.top}" width="${sx(p.e)-sx(p.s)}" height="${H-pad.top-pad.bottom}" fill="var(--clay)" opacity="0.05"/>`;
    svg += `<text class="tick-label" x="${(sx(p.s)+sx(p.e))/2}" y="${pad.top+12}" text-anchor="middle" style="fill:var(--clay-deep); letter-spacing:0.1em">${p.label}</text>`;
  });

  // Area
  const pts = data.map(([t,v]) => `${sx(t)},${sy(v)}`).join(" ");
  const areaPts = `${sx(0)},${sy(0)} ${pts} ${sx(xMax)},${sy(0)}`;
  svg += `<polygon class="area" points="${areaPts}"/>`;

  // Line w/ animated draw
  const linePath = "M " + data.map(([t,v]) => `${sx(t)} ${sy(v)}`).join(" L ");
  svg += `<path class="line" id="accum-line" d="${linePath}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`;

  // Dots
  data.forEach(([t,v], i) => {
    svg += `<circle class="dot" cx="${sx(t)}" cy="${sy(v)}" r="3" data-t="${t}" data-v="${v}" opacity="0"/>`;
  });

  // Marker for Black-winged Kite at 15h
  svg += `<line x1="${sx(15)}" y1="${sy(27)-6}" x2="${sx(15)}" y2="${pad.top+22}" stroke="var(--clay-deep)" stroke-width="1" stroke-dasharray="2 2"/>`;
  svg += `<circle cx="${sx(15)}" cy="${sy(27)}" r="5" fill="none" stroke="var(--clay-deep)" stroke-width="1.5"/>`;
  svg += `<text class="tick-label" x="${sx(15)+8}" y="${pad.top+30}" style="fill:var(--clay-deep); font-family: var(--body); font-style:italic">Black-winged Kite · 06:26</text>`;

  svg += `<text class="axis-title" x="${pad.left+5}" y="${pad.top-6}">SPECIES COUNT →</text>`;
  svg += `</svg>`;
  host.innerHTML = svg;

  const line = host.querySelector("#accum-line");
  const dots = host.querySelectorAll(".dot");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        line.style.transition = "stroke-dashoffset 2s ease-out";
        line.style.strokeDashoffset = "0";
        dots.forEach((d, i) => {
          setTimeout(() => { d.style.transition = "opacity .3s"; d.style.opacity = 1; }, 2000 + i*30);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  obs.observe(host);

  dots.forEach(d => {
    d.addEventListener("mousemove", e => {
      showTip(e, `Hour <strong>${d.dataset.t}</strong> · ${d.dataset.v} species`);
    });
    d.addEventListener("mouseleave", hideTip);
  });
}

/* ---------- Chart 4: Geographic status donut ---------- */
function renderGeoStatus() {
  const host = document.getElementById("chart-geo");
  if (!host) return;
  const confirmed = 1151, possible = 59, total = 1210;
  const cPct = confirmed / total;
  const size = 280, cx = size/2, cy = size/2, r = 100, inner = 64;

  const arc = (from, to) => {
    const a1 = from * Math.PI * 2 - Math.PI/2;
    const a2 = to * Math.PI * 2 - Math.PI/2;
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const x2 = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2);
    const xi1 = cx + inner*Math.cos(a1), yi1 = cy + inner*Math.sin(a1);
    const xi2 = cx + inner*Math.cos(a2), yi2 = cy + inner*Math.sin(a2);
    const large = (to - from) > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
  };

  let svg = `<svg class="svg-chart" viewBox="0 0 ${size} ${size}" style="max-width:280px">`;
  svg += `<path d="${arc(0, cPct)}" fill="var(--clay-deep)" data-label="Confirmed" data-val="${confirmed}" class="seg" opacity="0"/>`;
  svg += `<path d="${arc(cPct, 1)}" fill="var(--sand)" data-label="Possible" data-val="${possible}" class="seg" opacity="0"/>`;
  svg += `<text x="${cx}" y="${cy-4}" text-anchor="middle" font-family="var(--serif)" font-size="30" fill="var(--ink)">95.1%</text>`;
  svg += `<text x="${cx}" y="${cy+14}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--mute)" style="text-transform:uppercase; letter-spacing:0.12em">confirmed</text>`;
  svg += `</svg>`;
  host.innerHTML = svg;

  const segs = host.querySelectorAll(".seg");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        segs.forEach((s, i) => setTimeout(() => { s.style.transition="opacity .7s"; s.style.opacity=1; }, i*180));
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  obs.observe(host);

  segs.forEach(s => {
    s.addEventListener("mousemove", e => showTip(e, `<strong>${s.dataset.label}</strong>: ${s.dataset.val} detections`));
    s.addEventListener("mouseleave", hideTip);
  });
}

/* ---------- Hero spectrogram (fake waveform + play) ---------- */
function renderSpectro() {
  const host = document.getElementById("hero-wave");
  if (!host) return;
  const W = 400, H = 180;
  let bars = "";
  const rng = (i) => {
    const v = Math.abs(Math.sin(i*0.37) + Math.sin(i*0.13)*0.6 + Math.sin(i*0.07)*0.3);
    return Math.min(1, v);
  };
  const count = 80;
  for (let i=0; i<count; i++) {
    const v = rng(i);
    const h = 10 + v * (H - 20);
    const x = (i / count) * W + 1;
    const y = (H - h)/2;
    const op = 0.35 + v * 0.65;
    bars += `<rect x="${x}" y="${y}" width="${W/count - 2}" height="${h}" fill="#D4A574" opacity="${op}" rx="1"/>`;
  }
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bars}</svg>`;
}

/* ---------- Hero route map SVG ---------- */
function renderRoute() {
  const host = document.getElementById("hero-route");
  if (!host) return;
  const W = 360, H = 420;
  // Stylized route Tunis → south (schematic)
  const pts = [
    { x: 230, y: 40,  label: "TUNIS" },
    { x: 215, y: 100, label: "" },
    { x: 200, y: 160, label: "DORSALE" },
    { x: 180, y: 220, label: "" },
    { x: 150, y: 270, label: "CHOTT EL-JERID" },
    { x: 160, y: 335, label: "QSAR GHILEN", main: true },
    { x: 200, y: 390, label: "GRAND ERG" }
  ];
  const d = "M " + pts.map(p => `${p.x} ${p.y}`).join(" L ");
  let labels = "";
  pts.forEach((p, i) => {
    const r = p.main ? 6 : 3;
    labels += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${p.main ? 'var(--clay-deep)' : 'var(--ink)'}"/>`;
    if (p.main) labels += `<circle cx="${p.x}" cy="${p.y}" r="12" fill="none" stroke="var(--clay-deep)" stroke-width="1" opacity="0.4"><animate attributeName="r" from="6" to="20" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/></circle>`;
    if (p.label) labels += `<text x="${p.x + 14}" y="${p.y + 4}" font-family="var(--mono)" font-size="9" fill="${p.main ? 'var(--clay-deep)' : 'var(--mute)'}" style="text-transform:uppercase; letter-spacing:0.12em" font-weight="${p.main ? '600' : '400'}">${p.label}</text>`;
  });

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}">
      <path d="${d}" stroke="var(--clay)" stroke-width="1.5" fill="none" stroke-dasharray="3 4" pathLength="1" id="route-path" style="stroke-dashoffset:1; animation:dash 3s ease-out forwards"/>
      ${labels}
      <style>@keyframes dash { to { stroke-dashoffset: 0; } }</style>
    </svg>
  `;
}

/* ---------- Audio player (placeholder tones + visualization) ---------- */
let audioCtx, audioPlaying = false, audioSource = null;
function toggleAudio(btn) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioPlaying) {
    if (audioSource) { audioSource.stop(); audioSource = null; }
    audioPlaying = false;
    btn.innerHTML = "▶";
    return;
  }
  // Generate a soft desert ambient tone as placeholder
  const dur = 8;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0; i<data.length; i++) {
    const t = i / audioCtx.sampleRate;
    // layered "bird calls"
    const env = Math.exp(-1 * Math.pow((t % 1.5) - 0.2, 2) / 0.04);
    const chirp = Math.sin(2*Math.PI*(900 + 200*Math.sin(t*30))*t) * env * 0.18;
    const wind = (Math.random()*2 - 1) * 0.015;
    data[i] = chirp + wind;
  }
  audioSource = audioCtx.createBufferSource();
  audioSource.buffer = buf;
  audioSource.loop = true;
  audioSource.connect(audioCtx.destination);
  audioSource.start();
  audioPlaying = true;
  btn.innerHTML = "❚❚";
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(i => obs.observe(i));
}

/* ---------- Scroll progress bar ---------- */
function initProgress() {
  const bar = document.querySelector(".scroll-progress > i");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100) + "%";
  }, { passive: true });
}

/* ---------- Map (Leaflet) ---------- */
function initMap() {
  if (typeof L === "undefined") return;
  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: false,
    dragging: true,
    attributionControl: true
  }).setView([34.2, 9.5], 7);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap · CARTO',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(map);

  // Route line: Tunis → Qsar Ghilen → Grand Erg
  const route = [
    [36.806, 10.181], // Tunis
    [35.74,  10.10],  // Sousse
    [34.29,  9.39],   // Bel Khir area
    [33.94,  8.11],   // Chott
    [33.48,  9.72],   // Qsar Ghilen
    [33.04,  9.78]    // dunes
  ];
  L.polyline(route, {
    color: "#B8804A", weight: 2, opacity: 0.85, dashArray: "4 5"
  }).addTo(map);

  // Markers
  const spots = [
    { pt: [33.48, 9.72], name: "Qsar Ghilen", main: true },
    { pt: [36.806, 10.181], name: "Tunis" },
    { pt: [33.54, 9.97], name: "Old Matmata" },
    { pt: [33.94, 8.11], name: "Chott el-Jerid" }
  ];
  spots.forEach(s => {
    L.circleMarker(s.pt, {
      radius: s.main ? 7 : 4,
      fillColor: s.main ? "#8C5A2E" : "#1F1A14",
      fillOpacity: 0.9,
      color: "#F5EFE4",
      weight: 2
    }).addTo(map).bindTooltip(s.name, { permanent: false, direction: "top", className: "map-tip" });
  });

  // Fit to route
  map.fitBounds(L.latLngBounds(route).pad(0.15));
  window.__map = map;
}

/* ---------- Tweaks (edit mode) ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "photo"
}/*EDITMODE-END*/;

function applyTweaks(cfg) {
  document.body.setAttribute("data-hero", cfg.hero || "photo");
  document.querySelectorAll(".tweaks button[data-hero]").forEach(b => {
    b.classList.toggle("active", b.dataset.hero === cfg.hero);
  });
}

function initTweaks() {
  const panel = document.querySelector(".tweaks");
  const state = { ...TWEAK_DEFAULTS };
  applyTweaks(state);

  window.addEventListener("message", e => {
    if (!e.data || !e.data.type) return;
    if (e.data.type === "__activate_edit_mode") panel.classList.add("on");
    if (e.data.type === "__deactivate_edit_mode") panel.classList.remove("on");
  });
  try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch(_){}

  panel.querySelectorAll("button[data-hero]").forEach(b => {
    b.addEventListener("click", () => {
      state.hero = b.dataset.hero;
      applyTweaks(state);
      try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { hero: state.hero } }, "*"); } catch(_){}
    });
  });
}

/* ---------- Init ---------- */
function init() {
  initMap();
  renderSpeciesChart();
  renderDielRing();
  renderAccumulation();
  renderGeoStatus();
  renderSpectro();
  renderRoute();
  initReveal();
  initProgress();
  initTweaks();

  const playBtn = document.getElementById("play-btn");
  if (playBtn) playBtn.addEventListener("click", () => toggleAudio(playBtn));
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
