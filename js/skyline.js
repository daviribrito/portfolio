/*
 * Contribuições do GitHub em grade ou em "skyline".
 * Plano, é o calendário de sempre (cor mais forte = mais contribuições). No modo Skyline a grade
 * inclina e gira, e cada dia sobe numa barra da altura da contagem, numa onda da semana mais
 * antiga até hoje. Arraste para os lados para girar. Aponte um dia para ler; aponte um destaque
 * (sequência atual, maior sequência, dia mais ativo) e só esses dias ficam acesos.
 * Setas do teclado andam dia a dia quando o gráfico tem foco.
 *
 * Versão em JavaScript puro (canvas 2D) de um componente React; dados em data/contribuicoes.json.
 * Uso: Skyline.mount(elemento, { dias: [{ d: "2026-01-31", c: 3 }, ...] })
 */
(function () {
  "use strict";

  const MON = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const DAY = 86400000;
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  const ICON = {
    grid: "M120 56v48a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16m80-16h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-96 96H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m96 0h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16",
    city: "M239.73 208H224V96a16 16 0 0 0-16-16h-44a4 4 0 0 0-4 4v124h-16V32.41a16.43 16.43 0 0 0-6.16-13a16 16 0 0 0-18.72-.69L39.12 72A16 16 0 0 0 32 85.34V208H16.27A8.18 8.18 0 0 0 8 215.47a8 8 0 0 0 8 8.53h224a8 8 0 0 0 8-8.53a8.18 8.18 0 0 0-8.27-7.47M76 184a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm40 56a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Z",
    flame: "M173.79 51.48a221.3 221.3 0 0 0-41.67-34.34a8 8 0 0 0-8.24 0a221.3 221.3 0 0 0-41.67 34.34C54.59 80.48 40 112.47 40 144a88 88 0 0 0 176 0c0-31.53-14.59-63.52-42.21-92.52M96 184c0-27.67 22.53-47.28 32-54.3c9.48 7 32 26.63 32 54.3a32 32 0 0 1-64 0",
    trophy: "M232 64h-24V48a8 8 0 0 0-8-8H56a8 8 0 0 0-8 8v16H24A16 16 0 0 0 8 80v16a40 40 0 0 0 40 40h3.65A80.13 80.13 0 0 0 120 191.61V216H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-24.42c31.94-3.23 58.44-25.64 68.08-55.58H208a40 40 0 0 0 40-40V80a16 16 0 0 0-16-16M48 120a24 24 0 0 1-24-24V80h24v32q0 4 .39 8Zm184-24a24 24 0 0 1-24 24h-.5a82 82 0 0 0 .5-8.9V80h24Z",
    star: "M240 128a15.79 15.79 0 0 1-10.5 15l-63.44 23.07L143 229.5a16 16 0 0 1-30 0l-23.06-63.44L26.5 143a16 16 0 0 1 0-30l63.44-23.06L113 26.5a16 16 0 0 1 30 0l23.07 63.44L229.5 113a15.79 15.79 0 0 1 10.5 15"
  };
  const ico = (d, size) => '<svg viewBox="0 0 256 256" width="' + size + '" height="' + size + '" aria-hidden="true"><path fill="currentColor" d="' + d + '"/></svg>';

  // ------------------------------------------------------------ cores e geometria
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const hexToInt = (hex) => parseInt(hex.trim().replace("#", ""), 16);
  const shade = (hex, k) => {
    const n = hexToInt(hex);
    const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 1 ? c + (255 - c) * (k - 1) : c * k)));
    return "rgb(" + f((n >> 16) & 255) + "," + f((n >> 8) & 255) + "," + f(n & 255) + ")";
  };
  const mix = (a, b, t) => {
    if (t <= 0.001) return a;
    const x = hexToInt(a), y = hexToInt(b);
    const ch = (s) => Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t);
    return "#" + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0");
  };
  const inPoly = (x, y, p) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      if (p[i][1] > y !== p[j][1] > y && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    }
    return c;
  };
  const longDate = (d) => WD[d.getDay()] + ", " + d.getDate() + " de " + MON[d.getMonth()];
  const parseDay = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const keyOf = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  // As cores vêm do CSS (tema claro e escuro).
  function readTheme(el) {
    const cs = getComputedStyle(el);
    const v = (n, fb) => (cs.getPropertyValue(n) || fb).trim();
    return {
      palette: [0, 1, 2, 3, 4].map((i) => v("--sk-" + i, "#ebedf0")),
      blank: v("--sk-blank", "#eceef1"),
      ground: v("--sk-ground", "#f2f3f5"),
      label: v("--sk-label", "#86868b"),
      ring: v("--sk-ring", "#1d1d1f"),
      edge: parseFloat(v("--sk-edge", "0.55")),
      shadow: v("--sk-shadow", "rgba(0,0,0,.18)"),
      font: getComputedStyle(document.body).fontFamily
    };
  }

  function mount(root, data) {
    // O calendário do GitHub segue o fuso UTC e pode trazer o dia de amanhã; corta em hoje.
    const hoje = keyOf(new Date());
    const dias = ((data && data.dias) || []).filter((x) => x.d <= hoje);
    const byDate = new Map(dias.map((x) => [x.d, x.c]));
    const end = dias.length ? parseDay(dias[dias.length - 1].d) : new Date();

    root.classList.add("sky");
    root.innerHTML =
      '<header class="sky__head"><div class="sky__title"><h2 class="h3" id="sky-titulo">Contribuições no GitHub</h2><p data-sky-sub></p></div>' +
      '<div class="seg sky__seg" role="radiogroup" aria-label="Visualização">' +
      '<button type="button" role="radio" data-v="0">' + ico(ICON.grid, 13) + '<span>Grade</span></button>' +
      '<button type="button" role="radio" data-v="1">' + ico(ICON.city, 13) + '<span>Skyline</span></button>' +
      "</div></header>" +
      '<div class="sky__box" tabindex="0" role="img" aria-labelledby="sky-titulo" data-sky-box><canvas aria-hidden="true"></canvas>' +
      '<div class="sky__tip" data-sky-tip hidden><b></b><span></span></div></div>' +
      '<div class="sky__foot"><div class="sky__chips" data-sky-chips></div>' +
      '<div class="sky__legend" aria-hidden="true">Menos<i data-l="0"></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i>Mais</div></div>';

    const box = root.querySelector("[data-sky-box]");
    const cv = box.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const tip = root.querySelector("[data-sky-tip]");
    const sub = root.querySelector("[data-sky-sub]");
    const segBtns = [...root.querySelectorAll(".sky__seg button")];
    const chipsEl = root.querySelector("[data-sky-chips]");

    let theme = readTheme(root);
    let W = root.getBoundingClientRect().width || 900;
    let narrow = W < 600, tiny = W < 400, WEEKS = narrow ? 26 : 53;
    let model = null;
    let sky = false, P = 0, yaw = 0;
    let pTween = null, yawTween = null, drag = null;
    let hover = null, streak = null;
    let glow = [], lift = [];
    let geom = { tops: [], sides: [], order: [] };
    let running = false, visible = true, last = performance.now(), t0 = performance.now();

    // -------------------------------------------------------- dados da grade
    function build() {
      const lastRow = end.getDay();
      const count = (WEEKS - 1) * 7 + lastRow + 1;
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (count - 1));
      const vals = [];
      const cells = [];
      for (let i = 0; i < count; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const v = byDate.get(keyOf(date)) || 0;
        vals.push(v);
        cells.push({ w: Math.floor(i / 7), d: i % 7, v, date, lvl: 0 });
      }
      const sorted = vals.filter((v) => v > 0).sort((a, b) => a - b);
      const q = (f) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * f))] || 1;
      const cut = [q(0.25), q(0.5), q(0.75)];
      cells.forEach((c) => (c.lvl = c.v <= 0 ? 0 : c.v <= cut[0] ? 1 : c.v <= cut[1] ? 2 : c.v <= cut[2] ? 3 : 4));
      let best = { from: 0, to: -1 }, run = 0;
      for (let i = 0; i < cells.length; i++) {
        run = cells[i].v > 0 ? run + 1 : 0;
        if (run > best.to - best.from + 1) best = { from: i - run + 1, to: i };
      }
      let cur = 0;
      for (let i = cells.length - 1; i >= 0 && cells[i].v > 0; i--) cur++;
      let top = 0;
      for (let i = 1; i < cells.length; i++) if (cells[i].v > cells[top].v) top = i;
      model = {
        cells,
        total: vals.reduce((a, b) => a + b, 0),
        longest: best,
        current: { from: cells.length - cur, to: cells.length - 1 },
        best: top,
        max: Math.max(1, ...vals)
      };
      glow = cells.map(() => 1);
      lift = cells.map(() => 0);
      hover = null;
      renderText();
    }

    const days = (a) => Math.max(0, a.to - a.from + 1);
    const inStreak = (i) =>
      streak === "long" ? i >= model.longest.from && i <= model.longest.to
        : streak === "now" ? i >= model.current.from && i <= model.current.to
          : streak === "best" ? i === model.best : true;

    function renderText() {
      const t = model.total;
      sub.innerHTML = "<b>" + t.toLocaleString("pt-BR") + "</b> " + (t === 1 ? "contribuição" : "contribuições") + (narrow ? " nos últimos seis meses" : " no último ano");
      box.setAttribute("aria-label", "Contribuições no GitHub: " + t + ". Use as setas para ler cada dia.");
      const b = model.cells[model.best];
      const chips = [
        { id: "now", icon: ICON.flame, label: "Sequência atual", short: "Atual", value: days(model.current) + (days(model.current) === 1 ? " dia" : " dias") },
        { id: "long", icon: ICON.trophy, label: "Maior sequência", short: "Maior", value: days(model.longest) + (days(model.longest) === 1 ? " dia" : " dias") },
        { id: "best", icon: ICON.star, label: "Dia mais ativo", short: "Pico", value: b && b.v ? b.v + " em " + b.date.getDate() + " " + MON[b.date.getMonth()] : "nenhum" }
      ];
      chipsEl.innerHTML = chips.map((c) =>
        '<button type="button" class="sky__chip" data-id="' + c.id + '" aria-pressed="false" aria-label="' + c.label + ": " + c.value + '">' +
        '<span class="sky__chip-ico i-' + c.id + '">' + ico(c.icon, 11) + "</span>" +
        (tiny ? "" : '<span class="sky__chip-l">' + c.label + "</span>") +
        "<b>" + (tiny ? c.short + " " + c.value : c.value) + "</b></button>").join("");
      segBtns.forEach((b2) => {
        const on = (b2.dataset.v === "1") === sky;
        b2.setAttribute("aria-checked", String(on));
        b2.setAttribute("aria-pressed", String(on));
        b2.tabIndex = on ? 0 : -1;
        b2.querySelector("span").className = tiny ? "visually-hidden" : "";
      });
    }

    // -------------------------------------------------------- tamanho da caixa
    const flatH = () => {
      const left = narrow ? 26 : 32;
      const pitch = (Math.min(W, 1100) - (narrow ? 32 : 56) - left) / WEEKS;
      return Math.round(pitch * 7 + 30);
    };
    const skyH = () => (narrow ? Math.round(Math.min(280, (W - 32) * 0.56 + 34)) : 340);
    const setHeight = () => (box.style.height = flatH() + (skyH() - flatH()) * ease(Math.min(1, P * 1.4)) + "px");

    // -------------------------------------------------------- animação
    function tween(from, to, dur, fn) { return { from, to, dur, fn, start: performance.now() }; }
    function step(tw, now) {
      const k = Math.min(1, (now - tw.start) / tw.dur);
      return { value: tw.from + (tw.to - tw.from) * tw.fn(k), done: k >= 1 };
    }
    function kick() {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }

    function toggle(to) {
      if (to === sky) return;
      sky = to;
      setHover(null);
      renderText();
      if (reduceMQ.matches) { P = to ? 1 : 0; if (!to) yaw = 0; setHeight(); kick(); return; }
      pTween = tween(P, to ? 1 : 0, to ? 1900 : 1100, easeInOut);
      if (!to) yawTween = tween(yaw, 0, 1100, easeInOut);
      kick();
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let busy = false;
      if (pTween) { const s = step(pTween, now); P = s.value; if (s.done) pTween = null; else busy = true; setHeight(); }
      if (yawTween) { const s = step(yawTween, now); yaw = s.value; if (s.done) yawTween = null; else busy = true; }
      if (drag && drag.moved) busy = true;
      busy = draw(now, dt) || busy;
      if (busy && visible) requestAnimationFrame(frame);
      else running = false;
    }

    // -------------------------------------------------------- desenho
    function draw(now, dt) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = cv.clientWidth, ch = cv.clientHeight;
      if (!cw || !ch) return false;
      if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) {
        cv.width = Math.round(cw * dpr);
        cv.height = Math.round(ch * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const e = ease(P);
      const a = ((-14 * e + yaw * e) * Math.PI) / 180;
      const b = (52 * e * Math.PI) / 180;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const Wk = WEEKS, gx = Wk / 2, gy = 3.5;
      const proj = (x, y, z) => { const X = x - gx, Y = y - gy; const xr = X * ca - Y * sa, yr = X * sa + Y * ca; return [xr, yr * cb - z * sb]; };
      const depth = (x, y) => (x - gx) * sa + (y - gy) * ca;
      const zMax = 4.9 * e;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const [x, y] of [proj(0, 0, 0), proj(Wk, 0, 0), proj(0, 7, 0), proj(Wk, 7, 0), proj(0, 0, zMax), proj(Wk, 0, zMax), proj(0, 7, zMax), proj(Wk, 7, zMax)]) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      const padL = narrow ? 26 : 32, padB = 22;
      const S = Math.min((cw - padL - 4) / (x1 - x0), (ch - padB - 6) / (y1 - y0));
      const ox = padL + (cw - padL - 4 - (x1 - x0) * S) / 2 - x0 * S;
      const oy = 4 + (ch - padB - 6 - (y1 - y0) * S) / 2 - y0 * S;
      const scr = (x, y, z) => { const [u, v] = proj(x, y, z); return [ox + u * S, oy + v * S]; };

      // sombra do chão quando a cidade está de pé
      if (e > 0.02) {
        const g = [scr(-0.4, -0.4, 0), scr(Wk + 0.4, -0.4, 0), scr(Wk + 0.4, 7.4, 0), scr(-0.4, 7.4, 0)];
        ctx.save();
        ctx.globalAlpha = 0.55 * e;
        ctx.fillStyle = theme.ground;
        ctx.shadowColor = theme.shadow;
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;
        ctx.beginPath();
        g.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      const cells = model.cells, n = cells.length;
      const order = cells.map((_, i) => i).sort((i, j) => depth(cells[i].w + 0.5, cells[i].d + 0.5) - depth(cells[j].w + 0.5, cells[j].d + 0.5));
      const tops = new Array(n), sides = new Array(n);
      const gap = 0.16 + 0.04 * e;
      const appear = reduceMQ.matches ? 1 : Math.min(1, (now - t0) / 700);
      const faces = [[1, 0, 0.74], [-1, 0, 0.9], [0, 1, 0.62], [0, -1, 0.95]];
      let moving = appear < 1;

      for (const i of order) {
        const c = cells[i];
        const want = streak ? (inStreak(i) ? 1 : 0.12) : hover != null ? (i === hover ? 1 : 0.82) : 1;
        glow[i] += (want - glow[i]) * Math.min(1, dt * 10);
        lift[i] += ((i === hover ? 1 : 0) - lift[i]) * Math.min(1, dt * 12);
        if (Math.abs(want - glow[i]) > 0.005 || Math.abs((i === hover ? 1 : 0) - lift[i]) > 0.005) moving = true;
        // a subida corre como uma onda da semana mais antiga até hoje
        const wave = ease(P * 1.45 - (c.w / Wk) * 0.45);
        const hgt = (c.v > 0 ? 0.3 + (c.v / model.max) * 4.6 : 0.06) * wave + lift[i] * 0.35 * e;
        const xa = c.w + gap / 2, xb = c.w + 1 - gap / 2, ya = c.d + gap / 2, yb = c.d + 1 - gap / 2;
        const top = [scr(xa, ya, hgt), scr(xb, ya, hgt), scr(xb, yb, hgt), scr(xa, yb, hgt)];
        tops[i] = top;
        const gl = glow[i] * appear;
        const base = mix(theme.palette[c.lvl], theme.blank, 1 - gl);
        sides[i] = [];
        ctx.globalAlpha = appear;
        if (hgt > 0.02 && e > 0.01) {
          for (const [nx, ny, k] of faces) {
            if (nx * sa + ny * ca <= 0.001) continue;
            const q = nx === 1 ? [scr(xb, ya, hgt), scr(xb, yb, hgt), scr(xb, yb, 0), scr(xb, ya, 0)]
              : nx === -1 ? [scr(xa, yb, hgt), scr(xa, ya, hgt), scr(xa, ya, 0), scr(xa, yb, 0)]
                : ny === 1 ? [scr(xb, yb, hgt), scr(xa, yb, hgt), scr(xa, yb, 0), scr(xb, yb, 0)]
                  : [scr(xa, ya, hgt), scr(xb, ya, hgt), scr(xb, ya, 0), scr(xa, ya, 0)];
            sides[i].push(q);
            const g = ctx.createLinearGradient(q[0][0], q[0][1], q[3][0], q[3][1]);
            g.addColorStop(0, shade(base, k));
            g.addColorStop(1, shade(base, k * 0.8));
            ctx.fillStyle = g;
            ctx.beginPath();
            q.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.closePath();
            ctx.fill();
          }
        }
        // topo: arredondado enquanto é ladrilho, reto quando vira telhado
        const r = (2.6 * (1 - e) + 0.6) * Math.min(1, S / 14);
        const cx = (top[0][0] + top[2][0]) / 2, cy = (top[0][1] + top[2][1]) / 2;
        ctx.fillStyle = shade(base, 1 + 0.08 * e);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineJoin = "round";
        ctx.lineWidth = r * 2;
        const span = Math.max(1, Math.hypot(top[2][0] - top[0][0], top[2][1] - top[0][1]));
        const ins = Math.min(0.45, (2.83 * r) / span);
        ctx.beginPath();
        top.forEach(([x, y], j) => { const px = x + (cx - x) * ins, py = y + (cy - y) * ins; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (e > 0.2 && c.v > 0) {
          ctx.globalAlpha = gl * theme.edge * e;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(top[3][0], top[3][1]);
          ctx.lineTo(top[0][0], top[0][1]);
          ctx.lineTo(top[1][0], top[1][1]);
          ctx.stroke();
        }
        if (i === hover) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = theme.ring;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          top.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      geom = { tops, sides, order };

      // rótulos de mês e dia da semana, deitados no chão
      ctx.fillStyle = theme.label;
      ctx.font = (narrow ? 10 : 11) + "px " + theme.font;
      ctx.textBaseline = "middle";
      let lastMonth = -1, lastLabelW = -9;
      for (const c of cells) {
        if (c.d !== 0 && !(c.w === 0 && c.d === cells[0].d)) continue;
        const m = c.date.getMonth();
        if (m === lastMonth) continue;
        lastMonth = m;
        if (c.w > Wk - 2 || c.w - lastLabelW < 3) continue; // evita rótulos sobrepostos
        lastLabelW = c.w;
        const [x, y] = scr(c.w + 0.1, 7.75 + 0.25 * e, 0);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1 - 0.25 * e;
        ctx.fillText(MON[m], x, y);
      }
      ctx.textAlign = "right";
      for (const d of [1, 3, 5]) {
        const [x, y] = scr(-0.35, d + 0.5, 0);
        ctx.globalAlpha = 1 - 0.6 * e;
        ctx.fillText(WD[d], x - 2, y);
      }
      ctx.globalAlpha = 1;

      // dica presa ao dia apontado
      if (hover != null && tops[hover]) {
        const tp = tops[hover];
        const tx = (tp[0][0] + tp[1][0] + tp[2][0] + tp[3][0]) / 4;
        const ty = Math.min(tp[0][1], tp[1][1], tp[2][1], tp[3][1]);
        tip.style.transform = "translate(" + tx + "px," + (ty - 8) + "px) translate(-50%,-100%)";
      }
      return moving;
    }

    // -------------------------------------------------------- apontar, arrastar e teclado
    function pickAt(x, y) {
      const { tops, sides, order } = geom;
      for (let k = order.length - 1; k >= 0; k--) {
        const i = order[k];
        if (tops[i] && inPoly(x, y, tops[i])) return i;
        for (const q of sides[i] || []) if (inPoly(x, y, q)) return i;
      }
      return null;
    }
    function setHover(i) {
      if (i === hover) return;
      hover = i;
      if (i == null) { tip.hidden = true; }
      else {
        const c = model.cells[i];
        tip.querySelector("b").textContent = c.v === 0 ? "Nenhuma" : c.v + (c.v === 1 ? " contribuição" : " contribuições");
        tip.querySelector("span").textContent = longDate(c.date);
        tip.hidden = false;
      }
      kick();
    }
    const local = (ev) => { const r = box.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };

    box.addEventListener("pointermove", (ev) => {
      if (drag && drag.id === ev.pointerId && sky) {
        const dx = ev.clientX - drag.x;
        if (Math.abs(dx) > 3) drag.moved = true;
        if (drag.moved) {
          const now = performance.now();
          const ny = Math.max(-40, Math.min(40, drag.yaw + dx * 0.32));
          drag.v = ((ny - yaw) / Math.max(1, now - drag.t)) * 1000;
          drag.t = now;
          yaw = ny;
          yawTween = null;
          setHover(null);
          kick();
          return;
        }
      }
      if (ev.pointerType === "mouse" || !sky) setHover(pickAt(...local(ev)));
    });
    box.addEventListener("pointerdown", (ev) => {
      if (!sky) return;
      box.setPointerCapture && box.setPointerCapture(ev.pointerId);
      drag = { x: ev.clientX, yaw, id: ev.pointerId, moved: false, t: performance.now(), v: 0 };
    });
    box.addEventListener("pointerup", (ev) => {
      const dg = drag;
      drag = null;
      if (!dg || dg.id !== ev.pointerId) return;
      if (dg.moved) {
        // desliza um pouco e assenta, dentro dos limites
        const to = Math.max(-40, Math.min(40, yaw + dg.v * 0.18));
        yawTween = tween(yaw, to, 650, easeOut);
        kick();
      } else setHover(pickAt(...local(ev)));
    });
    box.addEventListener("pointercancel", () => (drag = null));
    box.addEventListener("pointerleave", (ev) => { if (ev.pointerType === "mouse" && !drag) setHover(null); });
    box.addEventListener("blur", () => setHover(null));
    box.addEventListener("keydown", (ev) => {
      const n = model.cells.length;
      let i = hover == null ? n - 1 : hover;
      if (ev.key === "ArrowLeft") i -= 7;
      else if (ev.key === "ArrowRight") i += 7;
      else if (ev.key === "ArrowUp") i -= 1;
      else if (ev.key === "ArrowDown") i += 1;
      else if (ev.key === "Home") i = 0;
      else if (ev.key === "End") i = n - 1;
      else if (ev.key === "Escape") return setHover(null);
      else return;
      ev.preventDefault();
      setHover(Math.max(0, Math.min(n - 1, i)));
    });

    segBtns.forEach((b2) => {
      b2.addEventListener("click", () => toggle(b2.dataset.v === "1"));
      b2.addEventListener("keydown", (ev) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(ev.key)) return;
        ev.preventDefault();
        toggle(!sky);
        segBtns[sky ? 1 : 0].focus();
      });
    });

    const setStreak = (id) => {
      streak = id;
      chipsEl.querySelectorAll(".sky__chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.id === id)));
      kick();
    };
    chipsEl.addEventListener("pointerover", (ev) => { const c = ev.target.closest(".sky__chip"); if (c && ev.pointerType === "mouse") setStreak(c.dataset.id); });
    chipsEl.addEventListener("pointerout", (ev) => { const c = ev.target.closest(".sky__chip"); if (c && ev.pointerType === "mouse" && !c.contains(ev.relatedTarget)) setStreak(null); });
    chipsEl.addEventListener("focusin", (ev) => { const c = ev.target.closest(".sky__chip"); if (c) setStreak(c.dataset.id); });
    chipsEl.addEventListener("focusout", () => setStreak(null));
    chipsEl.addEventListener("click", (ev) => { const c = ev.target.closest(".sky__chip"); if (c) setStreak(streak === c.dataset.id ? null : c.dataset.id); });

    // -------------------------------------------------------- tamanho, tema e visibilidade
    new ResizeObserver(() => {
      const nw = root.getBoundingClientRect().width;
      if (!nw || Math.abs(nw - W) < 1) return;
      W = nw;
      const wasWeeks = WEEKS;
      narrow = W < 600; tiny = W < 400; WEEKS = narrow ? 26 : 53;
      if (WEEKS !== wasWeeks) build(); else renderText();
      setHeight();
      kick();
    }).observe(root);
    const retheme = () => { theme = readTheme(root); kick(); };
    new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", retheme);
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) kick(); }, { rootMargin: "100px" }).observe(root);

    build();
    setHeight();
    kick();
  }

  window.Skyline = { mount };
})();
