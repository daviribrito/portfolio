/* Utilidades compartilhadas por todas as páginas. */
(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";

  /* Ícones desenhados (traço 1.75, 24x24) */
  const ICONS = {
    ext: '<path d="M8 16L16 8M9.5 8H16v6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    arrow: '<path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    back: '<path d="M19 12H6M11 6.5L5.5 12l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5v-15zM5 19.5A1.5 1.5 0 006.5 21H19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    chevron: '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    down: '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    pause: '<path d="M9 6v12M15 6v12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    github: '<path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.7c-2.7.6-3.3-1.2-3.3-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.1-.2-4.4-1.1-4.4-4.7 0-1 .4-1.9 1-2.6-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.6 1 2.6 0 3.7-2.3 4.5-4.4 4.7.3.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5z" fill="currentColor"/>',
    linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M8 10.5v6M8 7.6v.1M11.5 16.5v-3.4c0-1.5.9-2.6 2.2-2.6s2 .9 2 2.5v3.5M11.5 10.5v6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>',
    star: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>',
    sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
    clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>'
  };

  const CORNERS = '<span class="c c-tl"></span><span class="c c-tr"></span><span class="c c-bl"></span><span class="c c-br"></span>';

  /* Card com colchetes nos cantos */
  function frame(inner, opts) {
    const o = opts || {};
    const tag = o.href ? "a" : "div";
    return "<" + tag + ' class="frame rv ' + (o.cls || "") + '"' + (o.href ? ' href="' + o.href + '"' : "") + (o.id ? ' id="' + o.id + '"' : "") + (o.attrs || "") + ">" +
      CORNERS + '<div class="card ' + (o.cardCls || "") + '">' + inner + "</div></" + tag + ">";
  }

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* Realce de sintaxe mínimo para JS/SQL: comentários, strings, palavras-chave, números. */
  function highlight(code) {
    const KW = /\b(const|let|var|async|await|function|return|if|else|for|try|catch|throw|new|class|this|of|in|true|false|null|SELECT|INSERT|INTO|VALUES|RETURNING|FROM|WHERE|ORDER|BY|LIMIT|FOR|UPDATE|SKIP|LOCKED|IS|NULL|AND)\b/g;
    const out = [];
    const re = /(\/\/[^\n]*)|(`(?:\\.|[^`])*`|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*')/g;
    let last = 0, m;
    const plain = (t) => esc(t).replace(KW, '<span class="tok-k">$1</span>').replace(/\b(\d[\d_]*)\b/g, '<span class="tok-n">$1</span>');
    while ((m = re.exec(code))) {
      out.push(plain(code.slice(last, m.index)));
      out.push(m[1] ? '<span class="tok-c">' + esc(m[1]) + "</span>" : '<span class="tok-s">' + esc(m[2]) + "</span>");
      last = re.lastIndex;
    }
    out.push(plain(code.slice(last)));
    return out.join("");
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function s(tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs || {}) {
      if (k === "text") el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  /* Caixa com rótulo e linha de apoio dentro de uma cena SVG. */
  function box(parent, { x, y, w, h, label, sub, rx = 14 }) {
    const g = s("g", {}, parent);
    const rect = s("rect", { x, y, width: w, height: h, rx, class: "node" }, g);
    const t = s("text", { x: x + w / 2, y: y + (sub ? h / 2 - 4 : h / 2 + 5), "text-anchor": "middle", class: "t-label", text: label }, g);
    const st = s("text", { x: x + w / 2, y: y + h / 2 + 18, "text-anchor": "middle", class: "t-small", text: sub || "" }, g);
    return { g, rect, label: t, sub: st, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }

  /* Carcaça do laboratório: pergunta, controles, palco, registro de eventos e veredito. */
  function createLab(root, opts) {
    root.classList.add("frame");
    root.innerHTML = CORNERS +
      '<div class="card lab">' +
      '<div class="lab__bar">' +
      '<p class="lab__question">' + esc(opts.question) + "</p>" +
      '<div class="lab__controls"></div>' +
      "</div>" +
      '<div class="lab__stage"></div>' +
      '<div class="lab__foot">' +
      '<ol class="lab__log" aria-live="polite" aria-label="Registro de eventos"></ol>' +
      '<div class="lab__verdict" aria-live="polite"><span class="lab__verdict-big"></span><span class="lab__verdict-small"></span></div>' +
      "</div></div>";

    const controls = root.querySelector(".lab__controls");
    const stage = root.querySelector(".lab__stage");
    const logEl = root.querySelector(".lab__log");
    const verdictEl = root.querySelector(".lab__verdict");

    let mode = opts.modes ? opts.modes[0].id : null;
    let gen = 0;
    let started = false;
    let visible = false;
    let paused = false;
    let t0 = performance.now();

    let seg = null;
    if (opts.modes) {
      seg = document.createElement("div");
      seg.className = "seg";
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", opts.modesLabel || "Cenário");
      opts.modes.forEach((m) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = m.label;
        b.dataset.mode = m.id;
        b.setAttribute("aria-pressed", String(m.id === mode));
        b.addEventListener("click", () => setMode(m.id, true));
        seg.appendChild(b);
      });
      controls.appendChild(seg);
    }

    (opts.extraButtons || []).forEach((eb) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = eb.label;
      b.addEventListener("click", () => eb.onClick(ctx));
      controls.appendChild(b);
    });

    const replay = document.createElement("button");
    replay.type = "button";
    replay.className = "icon-btn";
    if (opts.continuous) {
      replay.setAttribute("aria-label", "Pausar");
      replay.innerHTML = icon("pause");
      replay.addEventListener("click", () => {
        paused = !paused;
        replay.setAttribute("aria-label", paused ? "Continuar" : "Pausar");
        replay.innerHTML = icon(paused ? "play" : "pause");
      });
    } else {
      replay.setAttribute("aria-label", "Repetir a simulação");
      replay.innerHTML = icon("replay");
      replay.addEventListener("click", () => run(true));
    }
    controls.appendChild(replay);

    function setMode(id, byUser) {
      mode = id;
      if (seg) seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === id)));
      if (byUser) ctx.userTouched = true;
      if (opts.liveMode) {
        if (opts.onMode) opts.onMode(ctx, id);
      } else {
        run(true);
      }
    }

    const CANCEL = { cancelled: true };
    const speed = () => (reducedMotion.matches ? 0.35 : 1);

    const ctx = {
      stage,
      root,
      userTouched: false,
      get mode() { return mode; },
      setMode: (id) => setMode(id, false),
      get reduced() { return reducedMotion.matches; },
      alive(g) { return g === gen; },
      async sleep(ms, g) {
        let left = ms * speed();
        while (left > 0) {
          const step = Math.min(left, 50);
          await new Promise((r) => setTimeout(r, step));
          if (g !== gen) throw CANCEL;
          if (!paused && visible) left -= step;
        }
        if (g !== gen) throw CANCEL;
      },
      log(text, cls) {
        const li = document.createElement("li");
        const secs = ((performance.now() - t0) / 1000).toFixed(1).padStart(4, " ");
        li.innerHTML = "<time>" + secs + "s</time><span" + (cls ? ' class="' + cls + '"' : "") + ">" + esc(text) + "</span>";
        logEl.appendChild(li);
        while (logEl.children.length > 60) logEl.firstChild.remove();
        logEl.scrollTop = logEl.scrollHeight;
      },
      verdict(big, small, state) {
        verdictEl.className = "lab__verdict" + (state ? " is-" + state : "");
        verdictEl.querySelector(".lab__verdict-big").textContent = big;
        verdictEl.querySelector(".lab__verdict-small").textContent = small || "";
      },
      /* Move um pacote de A até B e resolve quando chega. */
      async travel(svg, from, to, cls, dur, g, opt) {
        // Em telas estreitas o palco rola na horizontal: acompanha o destino do pacote.
        if (stage.scrollWidth > stage.clientWidth + 4 && visible) {
          const vb = svg.viewBox.baseVal;
          const k = svg.getBoundingClientRect().width / vb.width;
          const mid = ((from[0] + to[0]) / 2) * k;
          stage.scrollTo({ left: mid - stage.clientWidth / 2, behavior: reducedMotion.matches ? "auto" : "smooth" });
        }
        const c = s("circle", { r: (opt && opt.r) || 8, class: "packet " + (cls || "") }, svg);
        c.style.transform = "translate(" + from[0] + "px," + from[1] + "px)";
        const d = dur * speed();
        try {
          const anim = c.animate(
            [{ transform: "translate(" + from[0] + "px," + from[1] + "px)" }, { transform: "translate(" + to[0] + "px," + to[1] + "px)" }],
            { duration: Math.max(d, 1), easing: (opt && opt.easing) || "cubic-bezier(.45,0,.25,1)", fill: "forwards" }
          );
          while (anim.playState !== "finished") {
            await new Promise((r) => setTimeout(r, 40));
            if (g !== gen) { anim.cancel(); throw CANCEL; }
            if (paused || !visible) anim.pause(); else if (anim.playState === "paused") anim.play();
          }
        } finally {
          if (!(opt && opt.keep)) c.remove();
        }
        return c;
      }
    };

    async function run(force) {
      gen += 1;
      const g = gen;
      started = true;
      t0 = performance.now();
      logEl.innerHTML = "";
      stage.innerHTML = "";
      ctx.verdict("", "", null);
      try {
        await opts.run(ctx, g);
      } catch (e) {
        if (e !== CANCEL) console.error(e);
      }
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        visible = en.isIntersecting;
        if (visible && !started) run(false);
      });
    }, { threshold: 0.25 });
    io.observe(root);

    // Para a simulação e solta o observador (usado ao fechar o modal do roadmap).
    ctx.destroy = () => { gen += 1; io.disconnect(); };

    return ctx;
  }

  /* Datas relativas em português */
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  function relativeDate(iso) {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [u, sec] of units) {
      if (Math.abs(diff) >= sec || u === "minute") return rtf.format(Math.round(diff / sec), u);
    }
  }

  function monthLabel(ym) {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
  }

  /* Liga os links de contato marcados com data-link="github|linkedin|email". */
  function wireLinks() {
    const cfg = window.SITE_CONFIG;
    if (!cfg) return;
    document.querySelectorAll("[data-link]").forEach((a) => {
      const href = cfg.links[a.dataset.link];
      if (href) a.href = href;
    });
    // Cada marcador é processado uma vez só (o atributo sai depois de usado).
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon));
      el.removeAttribute("data-icon");
    });
    document.querySelectorAll("[data-icon-after]").forEach((el) => {
      el.insertAdjacentHTML("beforeend", icon(el.dataset.iconAfter));
      el.removeAttribute("data-icon-after");
    });
    document.querySelectorAll("[data-corners]").forEach((el) => {
      el.insertAdjacentHTML("afterbegin", CORNERS);
      el.removeAttribute("data-corners");
    });
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* Tema claro/escuro: segue o sistema até o visitante escolher. */
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function currentTheme() {
    return document.documentElement.dataset.theme || (darkQuery.matches ? "dark" : "light");
  }
  function themeButton() {
    const nav = document.querySelector(".topbar-inner");
    if (!nav) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "icon-btn";
    const paint = () => {
      const dark = currentTheme() === "dark";
      b.innerHTML = icon(dark ? "sun" : "moon");
      b.setAttribute("aria-label", dark ? "Usar tema claro" : "Usar tema escuro");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = dark ? "#000000" : "#f4f5f7";
    };
    b.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("tema", next); } catch (e) {}
      paint();
    });
    darkQuery.addEventListener("change", paint);
    paint();
    nav.appendChild(b);
  }

  /* Indicador deslizante sob a aba atual */
  function tabIndicator() {
    const tabs = document.querySelector(".tabs");
    if (!tabs) return;
    const ind = tabs.querySelector(".tab-ind");
    const place = (el) => {
      if (!el || !ind) return;
      ind.style.width = el.offsetWidth + "px";
      ind.style.transform = "translateX(" + (el.offsetLeft - 3) + "px)";
    };
    const current = () => tabs.querySelector('[aria-current="page"]') || tabs.querySelector(".tab");
    // começa na aba anterior (guardada) e desliza até a atual
    let from = null;
    try { from = tabs.querySelector('.tab[href="' + sessionStorage.getItem("aba") + '"]'); } catch (e) {}
    ind.style.transition = "none";
    place(from || current());
    requestAnimationFrame(() => requestAnimationFrame(() => { ind.style.transition = ""; place(current()); }));
    tabs.querySelectorAll(".tab").forEach((t) => {
      t.addEventListener("mouseenter", () => place(t));
      t.addEventListener("click", () => { try { sessionStorage.setItem("aba", current().getAttribute("href")); } catch (e) {} });
    });
    tabs.addEventListener("mouseleave", () => place(current()));
    window.addEventListener("resize", () => place(current()));
    if (document.fonts) document.fonts.ready.then(() => place(current()));
  }

  /* Entrada ao rolar */
  function reveal(root) {
    const els = (root || document).querySelectorAll(".rv:not(.in)");
    if (!("IntersectionObserver" in window) || reducedMotion.matches) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  document.documentElement.classList.add("js");
  window.Site = { icon, esc, highlight, s, box, createLab, relativeDate, monthLabel, wireLinks, reducedMotion, frame, reveal, CORNERS };
  document.addEventListener("DOMContentLoaded", () => { wireLinks(); themeButton(); tabIndicator(); });
})();
