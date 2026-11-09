/*
 * Laboratórios animados do roadmap.
 * Cada demonstração é uma simulação didática (dados sintéticos), não um sistema real.
 * Uso: Demos.mount(elemento, "idempotencia" | "retry" | "circuit" | "ratelimit" | "outbox", { tour })
 */
(function () {
  "use strict";
  const { s, box, createLab } = window.Site;

  function scene(ctx, w, h, label) {
    return s("svg", { viewBox: "0 0 " + w + " " + h, class: "scene", role: "img", "aria-label": label }, ctx.stage);
  }

  /* Tabela de linhas de texto dentro de uma cena. */
  function rows(svg, x, y, gap) {
    let n = 0;
    return {
      add(text, cls) {
        const t = s("text", { x, y: y + n * gap, class: "t-mono row " + (cls || ""), text }, svg);
        n += 1;
        try { t.animate([{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }], { duration: 350, easing: "ease-out" }); } catch (e) {}
        return t;
      }
    };
  }

  function burst(svg, at, cls) {
    const c = s("circle", { r: 8, class: "packet " + cls }, svg);
    c.style.transform = "translate(" + at[0] + "px," + at[1] + "px)";
    const a = c.animate(
      [
        { transform: "translate(" + at[0] + "px," + at[1] + "px) scale(1)", opacity: 1 },
        { transform: "translate(" + at[0] + "px," + at[1] + "px) scale(3.2)", opacity: 0 }
      ],
      { duration: 520, easing: "ease-out", fill: "forwards" }
    );
    a.onfinish = () => c.remove();
  }

  function setNode(n, state) {
    n.rect.classList.toggle("is-active", state === "active");
    n.rect.classList.toggle("is-fail", state === "fail");
    n.rect.classList.toggle("is-ok", state === "ok");
  }

  /* ------------------------------------------------------------------ */
  /* Idempotência                                                        */
  /* ------------------------------------------------------------------ */
  function idempotencia(root, opts) {
    return createLab(root, {
      question: "A resposta do pagamento se perdeu. O cliente tenta de novo. Quantas vezes o cartão é cobrado?",
      modesLabel: "Chave de idempotência",
      modes: [
        { id: "sem", label: "Sem chave" },
        { id: "com", label: "Com chave" }
      ],
      async run(ctx, g) {
        const sem = ctx.mode === "sem";
        const key = "7f3a-91c2";
        const svg = scene(ctx, 960, 330, "Simulação: cliente, rede, API de pagamentos, chaves de idempotência e cobranças");

        s("path", { d: "M200 165 H400", class: "wire-dash" }, svg);
        s("text", { x: 300, y: 150, "text-anchor": "middle", class: "t-small", text: "rede" }, svg);
        s("path", { d: "M590 150 C640 150 640 84 690 84", class: "wire" + (sem ? " dim" : "") }, svg);
        s("path", { d: "M590 180 C640 180 640 245 690 245", class: "wire" }, svg);

        const cli = box(svg, { x: 30, y: 120, w: 170, h: 90, label: "Cliente", sub: "app de compras" });
        const api = box(svg, { x: 400, y: 120, w: 190, h: 90, label: "API de pagamentos", sub: "POST /pagamentos" });

        const keysG = s("g", { class: sem ? "dim" : "" }, svg);
        s("rect", { x: 690, y: 24, width: 250, height: 120, rx: 14, class: "node" }, keysG);
        s("text", { x: 708, y: 54, class: "t-label", text: "Chaves de idempotência" }, keysG);
        if (sem) s("text", { x: 708, y: 84, class: "t-mono", text: "nenhuma chave enviada" }, keysG);
        const keyRows = rows(keysG, 708, 84, 24);

        const ledger = s("rect", { x: 690, y: 180, width: 250, height: 130, rx: 14, class: "node" }, svg);
        s("text", { x: 708, y: 210, class: "t-label", text: "Cobranças no cartão" }, svg);
        const ledgerRows = rows(svg, 708, 240, 24);

        const timer = s("text", { x: 115, y: 246, "text-anchor": "middle", class: "t-mono", text: "" }, svg);

        const C = [200, 165], A = [400, 165], K = [690, 84], L = [690, 245], AK = [590, 150], AL = [590, 180];

        const running = sem ? "Simulando sem chave de idempotência" : "Simulando com chave de idempotência";
        ctx.verdict("0 cobranças", running);
        await ctx.sleep(500, g);

        ctx.log(sem ? "Cliente envia POST /pagamentos de R$ 50,00" : "Cliente envia POST /pagamentos com Idempotency-Key " + key, "info");
        setNode(cli, "active");
        await ctx.travel(svg, C, A, "", 900, g);
        setNode(cli); setNode(api, "active");

        let keyRow = null;
        if (!sem) {
          ctx.log("API reserva a chave " + key + " com SET NX");
          await ctx.travel(svg, AK, K, "", 600, g);
          keyRow = keyRows.add(key + "  em andamento", "r-wait");
        }

        ctx.log("API cobra R$ 50,00 no cartão");
        await ctx.travel(svg, AL, L, "ok", 600, g);
        ledgerRows.add("#1   R$ 50,00   aprovada", "r-ok");
        ctx.verdict("1 cobrança", running);
        if (keyRow) { keyRow.textContent = key + "  recibo #1"; keyRow.setAttribute("class", "t-mono row r-ok"); }

        ctx.log("API responde 201 Created", "ok");
        await ctx.travel(svg, A, [292, 165], "ok", 560, g, { easing: "linear" });
        burst(svg, [292, 165], "fail");
        setNode(api);
        ctx.log("A resposta se perde na rede. O cliente recebe timeout.", "fail");
        setNode(cli, "fail");

        for (let ms = 1200; ms > 0; ms -= 100) {
          timer.textContent = "nova tentativa em " + (ms / 1000).toFixed(1).replace(".", ",") + " s";
          await ctx.sleep(100, g);
        }
        timer.textContent = "";
        setNode(cli, "active");

        ctx.log(sem ? "Cliente tenta de novo: POST /pagamentos" : "Cliente tenta de novo com a mesma chave " + key, "wait");
        await ctx.travel(svg, C, A, "wait", 900, g);
        setNode(cli); setNode(api, "active");

        if (sem) {
          ctx.log("API não sabe que é uma repetição e cobra de novo", "fail");
          await ctx.travel(svg, AL, L, "fail", 600, g);
          ledgerRows.add("#2   R$ 50,00   aprovada", "r-fail");
          ledger.classList.add("is-fail");
          ctx.log("API responde 201 Created");
          await ctx.travel(svg, A, C, "ok", 900, g);
          setNode(api);
          ctx.log("O cliente recebe a confirmação. O cartão foi cobrado duas vezes.", "fail");
          ctx.verdict("2 cobranças", "O cliente pagou R$ 100,00 por uma compra de R$ 50,00.", "fail");

          if (opts.tour && !ctx.userTouched) {
            await ctx.sleep(3200, g);
            if (!ctx.userTouched) ctx.setMode("com");
          }
        } else {
          ctx.log("API encontra a chave " + key + ": já processada");
          await ctx.travel(svg, AK, K, "wait", 500, g);
          keyRow.classList.add("r-hit");
          await ctx.travel(svg, K, AK, "ok", 500, g);
          ctx.log("API devolve o recibo #1 guardado, sem cobrar de novo", "ok");
          await ctx.travel(svg, A, C, "ok", 900, g);
          setNode(api); setNode(cli, "ok");
          ctx.log("O cliente recebe a mesma confirmação. Uma cobrança só.", "ok");
          ctx.verdict("1 cobrança", "A repetição devolveu o mesmo recibo. Nenhum efeito novo.", "ok");
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Retry com backoff                                                    */
  /* ------------------------------------------------------------------ */
  function retry(root) {
    const T = 8, X0 = 150, X1 = 920, CAP = 2, BUCKET = 0.5, OUTAGE = 0.6;
    const x = (t) => X0 + (t / T) * (X1 - X0);

    function simulate(mode) {
      const delay = (n) => {
        if (mode === "fixo") return 1;
        const janela = 2 ** n;
        return mode === "exp" ? janela : Math.random() * janela;
      };
      const queue = [];
      for (let c = 0; c < 5; c++) queue.push({ c, t: 0, n: 0 });
      const buckets = {}, out = [];
      while (queue.length) {
        queue.sort((a, b) => a.t - b.t || a.c - b.c);
        const ev = queue.shift();
        if (ev.t > T) continue;
        const b = Math.floor(ev.t / BUCKET);
        buckets[b] = (buckets[b] || 0) + 1;
        const ok = ev.t >= OUTAGE && buckets[b] <= CAP;
        out.push({ ...ev, ok, b });
        if (!ok && ev.n < 6) queue.push({ c: ev.c, t: +(ev.t + delay(ev.n)).toFixed(3), n: ev.n + 1 });
      }
      return out;
    }

    return createLab(root, {
      question: "Cinco clientes recebem erro ao mesmo tempo. Como cada estratégia de retry distribui as novas tentativas?",
      modesLabel: "Estratégia",
      modes: [
        { id: "fixo", label: "Fixo" },
        { id: "exp", label: "Exponencial" },
        { id: "jitter", label: "Com jitter" }
      ],
      async run(ctx, g) {
        const events = simulate(ctx.mode);
        const svg = scene(ctx, 960, 360, "Linha do tempo das tentativas de cinco clientes e carga no servidor");

        for (let c = 0; c < 5; c++) {
          const y = 36 + c * 34;
          s("text", { x: 20, y: y + 5, class: "t-small", text: "Cliente " + (c + 1) }, svg);
          s("line", { x1: X0, x2: X1, y1: y, y2: y, class: "wire" }, svg);
        }
        s("rect", { x: X0, y: 20, width: x(OUTAGE) - X0, height: 172, rx: 6, class: "outage" }, svg);
        s("text", { x: X0 + 6, y: 208, class: "t-mono", text: "servidor fora do ar" }, svg);

        const BASE = 322, UNIT = 18;
        s("line", { x1: X0, x2: X1, y1: BASE, y2: BASE, class: "wire" }, svg);
        s("line", { x1: X0, x2: X1, y1: BASE - CAP * UNIT, y2: BASE - CAP * UNIT, class: "cap-line" }, svg);
        s("text", { x: 20, y: BASE - CAP * UNIT + 4, class: "t-small", text: "capacidade" }, svg);
        s("text", { x: 20, y: BASE - 6, class: "t-small", text: "carga" }, svg);
        for (let t = 0; t <= T; t += 1) {
          s("text", { x: x(t), y: 348, "text-anchor": "middle", class: "t-mono", text: t + "s" }, svg);
        }
        const bw = ((X1 - X0) / (T / BUCKET)) - 6;
        const bars = {};
        const cursor = s("line", { x1: X0, x2: X0, y1: 16, y2: BASE, class: "cursor" }, svg);

        let peak = 0;
        const done = new Set();
        let i = 0;
        let simT = 0;
        ctx.verdict("Pico de 0 por janela", "Acompanhe a carga no servidor");
        while (simT <= T + 0.01) {
          cursor.setAttribute("x1", x(simT)); cursor.setAttribute("x2", x(simT));
          while (i < events.length && events[i].t <= simT) {
            const ev = events[i++];
            const y = 36 + ev.c * 34;
            if (ev.ok) s("circle", { cx: x(ev.t), cy: y, r: 7, class: "packet ok" }, svg);
            else s("circle", { cx: x(ev.t), cy: y, r: 6, class: "ring" }, svg);
            const count = events.filter((e) => e.b === ev.b && e.t <= ev.t).length;
            if (count > peak) {
              peak = count;
              ctx.verdict("Pico de " + peak + " por janela", "Acompanhe a carga no servidor");
            }
            if (!bars[ev.b]) bars[ev.b] = s("rect", { x: X0 + ev.b * (bw + 6) + 3, width: bw, rx: 4, class: "bar" }, svg);
            bars[ev.b].setAttribute("y", BASE - count * UNIT);
            bars[ev.b].setAttribute("height", count * UNIT);
            bars[ev.b].classList.toggle("over", count > CAP);
            if (ev.ok) done.add(ev.c);
            if (ev.n > 0 || !ev.ok) {
              ctx.log(
                "t=" + ev.t.toFixed(2).replace(".", ",") + "s  cliente " + (ev.c + 1) + ", tentativa " + (ev.n + 1) + ": " + (ev.ok ? "200 OK" : "503"),
                ev.ok ? "ok" : "fail"
              );
            }
          }
          simT += 0.05;
          await ctx.sleep(40, g);
        }
        const total = events.length;
        const bad = peak > CAP + 1;
        ctx.verdict(
          "Pico de " + peak + " por janela",
          total + " tentativas, " + done.size + " de 5 clientes atendidos. " +
            (ctx.mode === "jitter" ? "O jitter espalhou os clientes pelo tempo." : "Os clientes voltam juntos e batem no servidor ao mesmo tempo."),
          bad ? "fail" : "ok"
        );
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Circuit breaker                                                     */
  /* ------------------------------------------------------------------ */
  function circuit(root, opts) {
    let refs = null;
    return createLab(root, {
      question: "O serviço de estoque caiu. O disjuntor deixa de chamá-lo e testa de tempos em tempos se ele voltou.",
      modesLabel: "Saúde do serviço",
      modes: [
        { id: "ok", label: "Serviço saudável" },
        { id: "down", label: "Serviço fora do ar" }
      ],
      liveMode: true,
      continuous: true,
      onMode(ctx, id) {
        if (!refs) return;
        refs.svc.sub.textContent = id === "ok" ? "saudável" : "fora do ar";
        setNode(refs.svc, id === "ok" ? null : "fail");
        ctx.log(id === "ok" ? "O serviço de estoque voltou" : "O serviço de estoque caiu", id === "ok" ? "ok" : "fail");
      },
      async run(ctx, g) {
        const svg = scene(ctx, 960, 330, "Simulação de circuit breaker entre clientes e o serviço de estoque");
        const states = [
          { id: "fechado", label: "Fechado", x: 250, w: 140 },
          { id: "aberto", label: "Aberto", x: 410, w: 140 },
          { id: "meio", label: "Meio-aberto", x: 570, w: 160 }
        ];
        const pills = {};
        states.forEach((st) => {
          const pg = s("g", { class: "pill" }, svg);
          s("rect", { x: st.x, y: 22, width: st.w, height: 40, rx: 20 }, pg);
          s("text", { x: st.x + st.w / 2, y: 47, "text-anchor": "middle", text: st.label }, pg);
          pills[st.id] = pg;
        });
        s("path", { d: "M180 195 H330", class: "wire" }, svg);
        s("path", { d: "M530 195 H700", class: "wire" }, svg);
        const cli = box(svg, { x: 30, y: 150, w: 150, h: 90, label: "Clientes", sub: "pedidos" });
        const brk = box(svg, { x: 330, y: 150, w: 200, h: 90, label: "Disjuntor", sub: "falhas: 0 de 3" });
        const svc = box(svg, { x: 700, y: 150, w: 220, h: 90, label: "Serviço de estoque", sub: ctx.mode === "ok" ? "saudável" : "fora do ar" });
        if (ctx.mode !== "ok") setNode(svc, "fail");
        const info = s("text", { x: 430, y: 284, "text-anchor": "middle", class: "t-mono", text: "" }, svg);
        refs = { svc };

        let state = "fechado", fails = 0, clock = 0, openedAt = 0, fast = 0, okCount = 0, req = 0, halfFails = 0;
        const COOLDOWN = 3500;
        const wait = async (ms) => { await ctx.sleep(ms, g); clock += ms; };
        const go = async (a, b, cls, ms) => { await ctx.travel(svg, a, b, cls, ms, g); clock += ms; };
        const show = () => {
          Object.entries(pills).forEach(([id, pg]) => pg.classList.toggle("on", id === state));
          pills[state].setAttribute("data-state", state);
          brk.sub.textContent = "falhas: " + fails + " de 3";
          setNode(brk, state === "aberto" ? "fail" : state === "meio" ? "active" : null);
          const label = { fechado: "Fechado", aberto: "Aberto", meio: "Meio-aberto" }[state];
          const small = state === "aberto"
            ? fast + " chamadas recusadas na hora, sem esperar timeout."
            : state === "meio" ? "Deixando passar uma chamada de teste." : okCount + " chamadas atendidas.";
          ctx.verdict(label, small, state === "aberto" ? "fail" : state === "fechado" ? "ok" : null);
        };
        show();

        while (true) {
          await wait(700);
          req += 1;
          if (state === "aberto") {
            const left = COOLDOWN - (clock - openedAt);
            if (left > 0) {
              info.textContent = "testa de novo em " + (left / 1000).toFixed(1).replace(".", ",") + " s";
              await go([180, 195], [330, 195], "", 380);
              fast += 1;
              ctx.log("Chamada recusada na hora: circuito aberto", "fail");
              await go([330, 195], [180, 195], "fail", 300);
              show();
              continue;
            }
            state = "meio"; info.textContent = ""; show();
            ctx.log("Tempo de espera acabou: deixa passar uma chamada de teste", "wait");
          }
          await go([180, 195], [330, 195], "", 380);
          await go([530, 195], [700, 195], state === "meio" ? "wait" : "", 420);
          if (ctx.mode === "ok") {
            await go([700, 195], [530, 195], "ok", 380);
            okCount += 1;
            if (state === "meio") ctx.log("A chamada de teste funcionou: o circuito fecha", "ok");
            else ctx.log("200 OK em 80 ms", "ok");
            state = "fechado"; fails = 0;
            await go([330, 195], [180, 195], "ok", 340);
          } else {
            info.textContent = "esperando resposta…";
            await wait(1100);
            info.textContent = "";
            await go([700, 195], [530, 195], "fail", 380);
            fails = Math.min(3, fails + 1);
            ctx.log("Timeout depois de 1,5 s", "fail");
            if (state === "meio" || fails >= 3) {
              if (state === "meio") halfFails += 1;
              ctx.log(state === "meio" ? "O teste falhou: o circuito abre de novo" : "3 falhas: o circuito abre", "fail");
              state = "aberto"; openedAt = clock;
            }
            await go([330, 195], [180, 195], "fail", 340);
          }
          show();

          if (opts.tour && !ctx.userTouched) {
            if (ctx.mode === "ok" && okCount === 3 && req < 6) ctx.setMode("down");
            else if (ctx.mode === "down" && halfFails >= 1 && state === "aberto" && clock - openedAt > 1500) ctx.setMode("ok");
          }
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Rate limiting (token bucket)                                       */
  /* ------------------------------------------------------------------ */
  function ratelimit(root, opts) {
    return createLab(root, {
      question: "Cada requisição gasta uma ficha do balde, que enche 2 fichas por segundo. O que acontece numa rajada?",
      modesLabel: "Tráfego",
      modes: [
        { id: "normal", label: "Tráfego normal" },
        { id: "rajada", label: "Rajada" }
      ],
      liveMode: true,
      continuous: true,
      onMode(ctx, id) { ctx.log(id === "rajada" ? "Começa uma rajada de requisições" : "O tráfego volta ao normal", "info"); },
      async run(ctx, g) {
        const svg = scene(ctx, 960, 330, "Simulação de token bucket entre clientes e a API");
        s("path", { d: "M180 185 H330", class: "wire" }, svg);
        s("path", { d: "M530 185 H700", class: "wire" }, svg);
        box(svg, { x: 30, y: 140, w: 150, h: 90, label: "Clientes", sub: "requisições" });
        const api = box(svg, { x: 700, y: 140, w: 200, h: 90, label: "API", sub: "aceitas: 0" });
        s("text", { x: 430, y: 66, "text-anchor": "middle", class: "t-label", text: "Balde de fichas" }, svg);
        s("path", { d: "M340 86 V250 a16 16 0 0 0 16 16 H504 a16 16 0 0 0 16 -16 V86", class: "bucket" }, svg);
        const fill = s("text", { x: 430, y: 296, "text-anchor": "middle", class: "t-mono", text: "" }, svg);
        const CAP = 6, RATE = 2;
        const slots = [];
        for (let i = 0; i < CAP; i++) {
          const cx = 380 + (i % 3) * 50, cy = 236 - Math.floor(i / 3) * 50;
          slots.push(s("circle", { cx, cy, r: 16, class: "token" }, svg));
        }
        let tokens = CAP, accepted = 0, rejected = 0, sent = 0;
        const recent = [];
        const paint = () => {
          slots.forEach((c, i) => c.classList.toggle("empty", i >= Math.floor(tokens)));
          fill.textContent = Math.floor(tokens) + " de " + CAP + " fichas";
          api.sub.textContent = "aceitas: " + accepted;
          const r = recent.slice(-5).filter((v) => !v).length;
          if (!sent) return ctx.verdict("Balde cheio", "Esperando requisições.", null);
          ctx.verdict(
            r > 0 ? "Respondendo 429" : "Dentro do limite",
            rejected + " de " + sent + " requisições recusadas até agora. " +
              (r > 0 ? "O excesso volta depois, com backoff." : "Rajadas curtas cabem no balde."),
            r > 0 ? "fail" : "ok"
          );
        };
        paint();

        const safe = (p) => p.catch(() => {});
        safe((async () => {
          while (true) {
            await ctx.sleep(100, g);
            tokens = Math.min(CAP, tokens + RATE * 0.1);
            paint();
          }
        })());

        let tick = 0;
        while (true) {
          const burst = ctx.mode === "rajada";
          await ctx.sleep(burst ? 160 : 800, g);
          tick += 1;
          sent += 1;
          const id = sent;
          safe((async () => {
            await ctx.travel(svg, [180, 185], [340, 185], "", 380, g);
            if (tokens >= 1) {
              tokens -= 1; paint();
              await ctx.travel(svg, [520, 185], [700, 185], "ok", 380, g);
              accepted += 1; recent.push(true);
              if (!burst || id % 3 === 0) ctx.log("Requisição " + id + ": 200 OK", "ok");
            } else {
              rejected += 1; recent.push(false);
              ctx.log("Requisição " + id + ": 429 Too Many Requests", "fail");
              await ctx.travel(svg, [340, 185], [180, 185], "fail", 300, g);
            }
            while (recent.length > 10) recent.shift();
            paint();
          })());

          if (opts.tour && !ctx.userTouched) {
            if (ctx.mode === "normal" && tick === 5) ctx.setMode("rajada");
            else if (ctx.mode === "rajada" && tick === 30) { ctx.setMode("normal"); tick = 100; }
          }
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Transactional outbox                                               */
  /* ------------------------------------------------------------------ */
  function outbox(root) {
    return createLab(root, {
      question: "O processo cai no meio do caminho. O evento do pedido chega na fila?",
      modesLabel: "Estratégia",
      modes: [
        { id: "dupla", label: "Escrita dupla" },
        { id: "outbox", label: "Outbox" }
      ],
      async run(ctx, g) {
        const dual = ctx.mode === "dupla";
        const svg = scene(ctx, 960, 360, "Simulação de escrita dupla e transactional outbox");

        const api = box(svg, { x: 20, y: 140, w: 150, h: 90, label: "API de pedidos", sub: "no ar" });
        s("rect", { x: 230, y: 30, width: 340, height: 300, rx: 18, class: "node" }, svg);
        s("text", { x: 250, y: 62, class: "t-label", text: "PostgreSQL" }, svg);
        s("rect", { x: 248, y: 80, width: 150, height: 232, rx: 12, class: "table" }, svg);
        s("text", { x: 262, y: 106, class: "t-mono strong", text: "pedidos" }, svg);
        const obG = s("g", { class: dual ? "dim" : "" }, svg);
        s("rect", { x: 408, y: 80, width: 146, height: 232, rx: 12, class: "table" }, obG);
        s("text", { x: 422, y: 106, class: "t-mono strong", text: "outbox" }, obG);
        if (dual) s("text", { x: 422, y: 136, class: "t-mono", text: "não usada" }, obG);
        const relG = s("g", { class: dual ? "dim" : "" }, svg);
        const relay = box(relG, { x: 610, y: 150, w: 130, h: 70, label: "Relay", sub: dual ? "não existe" : "lê a outbox" });
        s("rect", { x: 780, y: 30, width: 165, height: 300, rx: 18, class: "node" }, svg);
        s("text", { x: 798, y: 62, class: "t-label", text: "Fila" }, svg);
        const pedidos = rows(svg, 262, 136, 26);
        const ob = rows(obG, 422, 136, 26);
        const filaRows = rows(svg, 798, 96, 26);
        let filaN = 0;
        const fila = {
          add(text, cls) {
            const r = filaRows.add(text, cls);
            filaN += 1;
            ctx.verdict(filaN + (filaN === 1 ? " evento" : " eventos") + " na fila", "Simulação em andamento");
            return r;
          }
        };

        const toPed = [[170, 185], [248, 185]];
        const toOb = [[170, 200], [408, 200]];

        ctx.verdict("0 eventos na fila", dual ? "Simulando escrita dupla" : "Simulando outbox");
        await ctx.sleep(400, g);

        if (dual) {
          for (const n of [101, 102]) {
            ctx.log("Pedido #" + n + ": INSERT em pedidos e COMMIT", "info");
            setNode(api, "active");
            await ctx.travel(svg, toPed[0], toPed[1], "", 700, g);
            pedidos.add("#" + n + "  criado", "r-ok");
            if (n === 102) {
              await ctx.sleep(400, g);
              setNode(api, "fail"); api.sub.textContent = "caiu";
              ctx.log("O processo da API cai antes de publicar o evento", "fail");
              await ctx.sleep(1400, g);
              setNode(api); api.sub.textContent = "reiniciada";
              ctx.log("A API reinicia sem lembrar que faltou publicar o #102", "fail");
              break;
            }
            ctx.log("Publica pedido.criado #" + n + " na fila");
            await ctx.travel(svg, [170, 230], [170, 346], "", 300, g, { easing: "linear" });
            await ctx.travel(svg, [170, 346], [862, 346], "", 900, g, { easing: "linear" });
            await ctx.travel(svg, [862, 346], [862, 330], "", 120, g, { easing: "linear" });
            fila.add("pedido.criado #" + n, "r-ok");
            setNode(api);
            await ctx.sleep(500, g);
          }
          ctx.verdict("1 evento perdido", "O pedido #102 existe no banco, mas nenhum outro serviço ficou sabendo dele.", "fail");
          return;
        }

        const publish = async (n, cls) => {
          await ctx.travel(svg, [554, 185], [610, 185], cls, 400, g);
          await ctx.travel(svg, [740, 185], [780, 185], cls, 400, g);
        };

        const obRows = {};
        for (const n of [101, 102]) {
          ctx.log("Pedido #" + n + ": INSERT em pedidos e em outbox, na mesma transação", "info");
          setNode(api, "active");
          await Promise.all([ctx.travel(svg, toPed[0], toPed[1], "", 700, g), ctx.travel(svg, toOb[0], toOb[1], "", 800, g)]);
          pedidos.add("#" + n + "  criado", "r-ok");
          obRows[n] = ob.add("#" + n + "  pendente", "r-wait");
          ctx.log("COMMIT: ou os dois existem, ou nenhum", "ok");
          if (n === 102) {
            setNode(api, "fail"); api.sub.textContent = "caiu";
            ctx.log("O processo da API cai logo depois do COMMIT. O evento já está salvo.", "wait");
          } else setNode(api);
          await ctx.sleep(500, g);

          setNode(relay, "active");
          ctx.log("Relay lê a outbox e publica pedido.criado #" + n);
          await publish(n, "");
          fila.add("pedido.criado #" + n, "r-ok");
          if (n === 101) {
            obRows[n].textContent = "#101  publicado"; obRows[n].setAttribute("class", "t-mono row r-ok");
            setNode(relay);
          } else {
            setNode(relay, "fail"); relay.sub.textContent = "caiu";
            ctx.log("O relay cai antes de marcar o #102 como publicado", "fail");
            await ctx.sleep(1200, g);
            setNode(relay, "active"); relay.sub.textContent = "reiniciado";
            ctx.log("O relay reinicia, vê o #102 pendente e publica de novo", "wait");
            await publish(n, "wait");
            const dup = fila.add("pedido.criado #102", "r-dup");
            obRows[n].textContent = "#102  publicado"; obRows[n].setAttribute("class", "t-mono row r-ok");
            setNode(relay);
            await ctx.sleep(500, g);
            ctx.log("O consumidor reconhece o id do evento repetido e ignora a cópia", "ok");
            dup.classList.add("r-struck");
          }
          await ctx.sleep(500, g);
        }
        setNode(api); api.sub.textContent = "reiniciada";
        ctx.verdict("0 eventos perdidos", "O #102 chegou duas vezes e o consumidor idempotente ignorou a cópia.", "ok");
      }
    });
  }

  const REGISTRY = { idempotencia, retry, circuit, ratelimit, outbox };

  window.Demos = {
    mount(el, id, opts) {
      const fn = REGISTRY[id];
      if (!fn) return null;
      return fn(el, opts || {});
    }
  };
})();
