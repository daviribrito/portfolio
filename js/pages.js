/* Monta o conteúdo de cada página a partir de data/*.js */
(function () {
  "use strict";
  const { esc, icon, highlight, monthLabel, frame } = window.Site;

  const $ = (sel) => document.querySelector(sel);
  const bar = (pct) => '<span class="bar"><i style="width:' + pct + '%"></i></span>';
  const go = (href, label) => '<a class="go" href="' + href + '">' + esc(label) + icon("arrow") + "</a>";

  /* ---------------------------------------------------- Modelo do roadmap
     Estrutura em data/roadmap.js, progresso e anotações em data/estudos.js. */
  const ESTADOS = {
    "nao-iniciado": "Não iniciado",
    estudo: "Em estudo",
    pratica: "Em prática",
    dominado: "Dominado",
    revisar: "Revisar"
  };
  const ORDEM_ESTADOS = ["nao-iniciado", "estudo", "pratica", "dominado", "revisar"];
  const PRIORIDADE = { essencial: "Essencial", importante: "Importante", complementar: "Complementar" };
  const IMPORTANCIA = PRIORIDADE;
  const RANK_IMP = { essencial: 0, importante: 1, complementar: 2 };
  const NIVEIS = ["N1", "N2", "N3", "N4"];

  let MODEL = null;
  function model() {
    if (MODEL) return MODEL;
    const R = window.ROADMAP || { areas: [], modulos: [], topicos: [], niveis: {} };
    const E = window.ESTUDOS || {};
    const status = E.status || {}, conteudo = E.conteudo || {};
    const areas = R.areas || [];
    const modulos = R.modulos || [];
    const modById = {};
    modulos.forEach((m) => (modById[m.id] = m));
    // Hierarquia: Área → Módulo → Tópico. A área do tópico vem do módulo.
    const topicos = (R.topicos || []).map((t) => {
      const c = conteudo[t.id] || {};
      const m = modById[t.modulo] || { area: "", numero: "", nome: "" };
      return Object.assign(
        { pre: [], conteudos: [], criterios: [], anotacoes: [], armadilhas: [], codigo: null, linguagem: "java", demo: null, links: [] },
        t, c,
        { area: m.area, mod: m, status: ESTADOS[status[t.id]] ? status[t.id] : "nao-iniciado" }
      );
    });
    const byId = {};
    topicos.forEach((t) => (byId[t.id] = t));
    const dependentes = {};
    topicos.forEach((t) => t.pre.forEach((p) => (dependentes[p] = dependentes[p] || []).push(t.id)));
    MODEL = {
      areas, modulos, niveis: R.niveis || {}, topicos, byId, dependentes,
      recentes: E.aprendidoRecentemente || [],
      area: (id) => areas.find((a) => a.id === id),
      daArea: (id) => topicos.filter((t) => t.area === id),
      modulosDa: (id) => modulos.filter((m) => m.area === id),
      doModulo: (id) => topicos.filter((t) => t.modulo === id)
    };
    return MODEL;
  }

  // Concluído = dominado ou já dominado e marcado para revisar.
  const concluido = (t) => t.status === "dominado" || t.status === "revisar";
  const andamento = (t) => t.status === "estudo" || t.status === "pratica";
  const pct = (list) => (list.length ? Math.round((list.filter(concluido).length / list.length) * 100) : 0);
  const contar = (list) => ORDEM_ESTADOS.reduce((o, s) => ((o[s] = list.filter((t) => t.status === s).length), o), {});
  const preOk = (M, t) => t.pre.every((p) => M.byId[p] && concluido(M.byId[p]));

  // Próximos liberados: não iniciados com todos os pré-requisitos concluídos.
  function liberados(M) {
    const ordemArea = {};
    M.areas.forEach((a, i) => (ordemArea[a.id] = i));
    return M.topicos
      .filter((t) => t.status === "nao-iniciado" && preOk(M, t))
      .sort((a, b) => RANK_IMP[a.prioridade] - RANK_IMP[b.prioridade] || a.nivel.localeCompare(b.nivel) || ordemArea[a.area] - ordemArea[b.area]);
  }

  const areaUrl = (id) => "area.html?id=" + encodeURIComponent(id);
  const topicUrl = (id) => "topico.html?id=" + encodeURIComponent(id);
  const topicLink = (id, inner, cls) => '<a href="' + topicUrl(id) + '" data-topic="' + esc(id) + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + inner + "</a>";
  const pin = (s) => '<i class="pin" data-s="' + s + '" aria-hidden="true"></i>';
  const chip = (txt, cls) => '<span class="mchip ' + (cls || "") + '">' + esc(txt) + "</span>";
  const impChip = (imp) => chip(IMPORTANCIA[imp] || imp, "imp-" + imp);
  const nivelNome = (M, n) => n + " · " + ((M.niveis[n] && M.niveis[n].nome) || "");

  function noteUrl(t) {
    const tn = window.SITE_CONFIG.techNotes;
    if (!tn) return null;
    return "https://github.com/" + tn.repositorio + "/blob/" + tn.branch + "/" + tn.pasta + "/" + t.area + "/" + t.id + ".md";
  }

  // Tópico em foco: em prática primeiro, depois em estudo, pela ordem do roadmap.
  function focusTopic(M) {
    return M.topicos.find((t) => t.status === "pratica") || M.topicos.find((t) => t.status === "estudo");
  }

  /* ---------------------------------------------------------------- Início */
  function home() {
    const M = model(), cfg = window.SITE_CONFIG, S = window.SOBRE;
    const c = contar(M.topicos);

    const stats = [
      [M.topicos.length, "tópicos no roadmap"],
      [c.dominado + c.revisar, "dominados"],
      [c.estudo + c.pratica, "em estudo ou prática"],
      [cfg.github.repositorios.length, "projetos no GitHub"]
    ];
    $("[data-stats]").innerHTML = stats.map((s) => '<div class="stat"><b>' + s[0] + "</b><span>" + esc(s[1]) + "</span></div>").join("");

    const lab = $("[data-lab]");
    if (lab) window.Demos.mount(lab, lab.dataset.lab, { tour: true });

    const f = focusTopic(M);
    const fa = f && M.area(f.area);
    const fp = f ? pct(M.daArea(f.area)) : 0;
    const cards = [
      frame(
        '<span class="eyebrow">Roadmap</span><h3>Formação em Backend Engineering</h3>' +
        '<div class="topic-list">' +
        M.areas.map((a) => { const p = pct(M.daArea(a.id)); return '<a href="' + areaUrl(a.id) + '"><b>' + esc(a.numero + " " + a.nome) + "</b><small>" + p + "%</small>" + bar(p) + "</a>"; }).join("") +
        (M.areas.length ? "" : "<p>As áreas aparecem aqui conforme o roadmap for preenchido.</p>") +
        "</div>" +
        '<div class="foot">' + go("roadmap.html", "Ver o roadmap") + "</div>"
      ),
      frame(
        '<span class="eyebrow">GitHub</span><h3>Últimos commits</h3>' +
        '<ul class="peek" data-commit-peek aria-label="Commits mais recentes"><li><span class="sha">·······</span><span class="msg">Carregando commits…</span><span class="meta">GitHub</span></li></ul>' +
        '<div class="foot">' + go("commits.html", "Ver os projetos") + "</div>"
      ),
      f ? frame(
        '<span class="eyebrow">Foco agora · ' + esc(ESTADOS[f.status]) + "</span>" +
        '<div class="focus"><div class="ring" role="img" aria-label="Área ' + esc(fa.numero) + ": " + fp + '% concluída">' +
        '<svg viewBox="0 0 92 92" aria-hidden="true"><circle class="bg" cx="46" cy="46" r="42"/><circle class="fg" cx="46" cy="46" r="42" style="stroke-dashoffset:' + (264 - (264 * fp) / 100).toFixed(1) + '"/></svg>' +
        "<b>" + fp + "%</b></div>" +
        "<div><h3>" + esc(f.nome) + "</h3><p>" + esc(f.descricao) + "</p></div></div>" +
        '<div class="foot">' + go(topicUrl(f.id), "Abrir tópico") + '<span class="eyebrow">Área ' + esc(fa.numero) + "</span></div>"
      ) : "",
      frame(
        '<span class="eyebrow">Aprendido recentemente</span>' +
        '<ol class="tl">' + recentList(M) + "</ol>"
      ),
      frame(
        '<span class="eyebrow">O que procuro</span>' +
        '<p class="lede" style="color:var(--soft)">' + esc(S ? S.procuro : "") + "</p>" +
        '<div class="actions" style="justify-content:flex-start">' +
        '<a class="btn primary" data-link="email" href="' + esc(cfg.links.email) + '">Vamos conversar' + icon("arrow") + "</a>" +
        '<a class="btn" href="sobre.html">Sobre mim</a></div>',
        { cls: "wide", cardCls: "" }
      )
    ];
    $("[data-bento]").insertAdjacentHTML("beforeend", cards.join(""));

    const peek = $("[data-commit-peek]");
    if (peek && window.Commits) window.Commits.renderPeek(peek);
  }

  function recentList(M) {
    return M.recentes
      .map((r) => '<li><time datetime="' + esc(r.data) + '">' + esc(monthLabel(r.data)) + "</time>" + (M.byId[r.topico] ? topicLink(r.topico, esc(r.texto)) : "<span>" + esc(r.texto) + "</span>") + "</li>")
      .join("") || '<li><span></span><span class="mute">Nada registrado ainda.</span></li>';
  }

  /* ---------------------------------------------------------------- Sobre */
  function sobre() {
    const d = window.SOBRE, cfg = window.SITE_CONFIG;

    $("[data-facts]").innerHTML = d.fatos
      .map((f) => "<div><dt>" + esc(f.rotulo) + "</dt><dd>" + (f.destaque ? '<span class="on"><i class="live" aria-hidden="true"></i>' + esc(f.valor) + "</span>" : esc(f.valor)) + "</dd></div>")
      .join("");
    $("[data-story]").innerHTML = d.historia.map((p) => "<p>" + esc(p) + "</p>").join("");
    $("[data-quote]").textContent = "“" + d.frase + "”";

    const tl = $("[data-timeline]");
    tl.style.setProperty("--n", d.trajetoria.length);
    tl.innerHTML = d.trajetoria
      .map((t) => '<li class="j-step' + (t.atual ? " now" : "") + '"><time>' + esc(t.ano) + (t.atual ? " · agora" : "") + "</time><b>" + esc(t.titulo) + "</b><p>" + esc(t.texto) + "</p></li>")
      .join("");

    $("[data-feats]").innerHTML = d.feitos
      .map((f) => frame(
        (f.capa
          ? (f.link ? '<a class="cover-link" href="' + esc(f.link) + '" target="_blank" rel="noopener">' : "") +
            '<img class="cover" src="' + esc(f.capa) + '" alt="' + esc(f.capaAlt || f.titulo) + '" width="1920" height="1080" loading="lazy" decoding="async">' +
            (f.link ? "</a>" : "")
          : "") +
        "<h3>" + esc(f.titulo) + "</h3><p>" + esc(f.texto) + "</p>" +
        (f.exemplo ? '<span class="ex-tag">Exemplo, troque em data/sobre.js</span>' : ""),
        { cls: f.exemplo ? "is-example" : "" }
      ))
      .join("");

    $("[data-values]").innerHTML = d.valores.map((v) => frame("<h3>" + esc(v.titulo) + "</h3><p>" + esc(v.texto) + "</p>")).join("");
    $("[data-stack]").innerHTML = d.stack.map((t) => '<span class="chip">' + esc(t) + "</span>").join("");
    $("[data-hobbies]").innerHTML = d.foraDoCodigo.map((t) => '<span class="chip">' + esc(t) + "</span>").join("");
    $("[data-procuro]").textContent = d.procuro;
    document.querySelectorAll("[data-nome]").forEach((el) => (el.textContent = cfg.nome));
    document.querySelectorAll("[data-cargo]").forEach((el) => (el.textContent = cfg.cargo));
  }


  /* ------------------------------------------------------ Tópicos */

  const modLabel = (t) => (t.mod && t.mod.numero ? t.mod.numero + " " + t.mod.nome : "");
  const niveisDe = (list) => {
    const ns = NIVEIS.filter((n) => list.some((t) => t.nivel === n));
    return ns.length ? (ns.length === 1 ? ns[0] : ns[0] + "–" + ns[ns.length - 1]) : "";
  };

  /* Conteúdo de um tópico. mode: "page" (página própria) ou "modal". */
  function topicBody(M, t, mode) {
    const page = mode === "page";
    const rv = page ? " rv" : "";
    const a = M.area(t.area) || { id: "", numero: "", nome: "" };
    const hasNotes = t.anotacoes.length || t.armadilhas.length;
    const hasContent = hasNotes || t.demo || t.codigo || t.links.length;
    const note = noteUrl(t);
    const relList = (ids) => ids.map((id) => M.byId[id]).filter(Boolean)
      .map((x) => "<li>" + pin(x.status) + topicLink(x.id, esc(x.nome)) + "<small>" + esc(modLabel(x)) + " · " + esc(ESTADOS[x.status]) + "</small></li>").join("");
    const libera = M.dependentes[t.id] || [];

    return (
      '<div class="topic-head">' +
      "<div>" +
      '<span class="eyebrow' + rv + '">' + (page ? '<a href="' + areaUrl(a.id) + '">Área ' + esc(a.numero) + "</a>" : "Área " + esc(a.numero)) + " · " + esc(modLabel(t)) + "</span>" +
      "<" + (page ? "h1" : "h2") + ' class="' + (page ? "h2" : "h3") + rv + '" id="' + (page ? "t-titulo" : "tmodal-titulo") + '" style="margin-top:10px">' + esc(t.nome) + "</" + (page ? "h1" : "h2") + ">" +
      '<p class="lede' + rv + '">' + esc(t.descricao) + "</p></div>" +
      '<div class="topic-meta' + rv + '">' +
      '<span class="mchip st-' + t.status + '">' + pin(t.status) + esc(ESTADOS[t.status]) + "</span>" +
      chip(nivelNome(M, t.nivel), "lvl") + impChip(t.prioridade) +
      "</div></div>" +

      '<div class="grid-2 notes">' +
      frame('<span class="eyebrow">Conteúdos</span><ul class="bul">' + t.conteudos.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>") +
      frame(
        '<span class="eyebrow">Aplicação no backend</span><p>' + esc(t.aplicacao) + "</p>" +
        '<span class="eyebrow" style="margin-top:6px">Critérios de conclusão</span><ul class="checks">' +
        t.criterios.map((x) => '<li><i class="box' + (concluido(t) ? " on" : "") + '" aria-hidden="true"></i>' + esc(x) + "</li>").join("") + "</ul>"
      ) +
      "</div>" +

      '<div class="grid-2 notes" style="margin-top:12px">' +
      frame('<span class="eyebrow">Pré-requisitos</span>' +
        (t.pre.length ? '<ul class="rel">' + relList(t.pre) + "</ul>" : '<p class="mute">Nenhum: pode começar por aqui.</p>')) +
      frame('<span class="eyebrow">Libera</span>' +
        (libera.length ? '<ul class="rel">' + relList(libera) + "</ul>" : '<p class="mute">Nenhum tópico depende diretamente deste.</p>')) +
      "</div>" +

      (hasNotes
        ? '<div class="grid-2 notes" style="margin-top:12px">' +
          (t.anotacoes.length ? frame('<span class="eyebrow">Minhas anotações</span><ul class="bul">' + t.anotacoes.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>") : "") +
          (t.armadilhas.length ? frame('<span class="eyebrow">Armadilhas</span><ul class="bul trap">' + t.armadilhas.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>") : "") +
          "</div>"
        : "") +

      (t.demo ? '<div class="topic-lab' + rv + '" data-demo="' + esc(t.demo) + '"></div>' : "") +

      (t.codigo
        ? '<div class="frame' + rv + '" style="margin-top:12px">' + window.Site.CORNERS +
          '<details class="card code-card"' + (page ? "" : " open") + "><summary>Ver o código<span class=\"plus\" aria-hidden=\"true\">" + icon("plus") + "</span></summary><pre><code>" + highlight(t.codigo) + "</code></pre></details></div>"
        : "") +

      (t.links.length
        ? '<div class="topic-refs' + rv + '"><span class="eyebrow">Referências</span><ul>' +
          t.links.map((l) => '<li><a class="go" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.titulo) + icon("ext") + "</a></li>").join("") + "</ul></div>"
        : "") +

      (!hasContent ? '<p class="empty-note' + rv + '" style="margin-top:12px">Ainda sem anotações. Elas entram aqui conforme o estudo avança.</p>' : "") +

      '<div class="topic-links' + rv + '">' +
      (note ? '<a class="go" href="' + esc(note) + '" target="_blank" rel="noopener">' + icon("book") + "Nota no tech-notes" + icon("ext") + "</a>" : "") +
      '<a class="go" href="' + areaUrl(a.id) + "#mod-" + esc(t.modulo) + '">Ver o módulo ' + esc(t.mod.numero) + icon("arrow") + "</a>" +
      "</div>"
    );
  }

  function mountDemos(root) {
    return [...root.querySelectorAll("[data-demo]")]
      .map((el) => window.Demos.mount(el, el.dataset.demo, { tour: true }))
      .filter(Boolean);
  }

  /* Modal de tópico (desktop e tablet). No celular o link abre a página. */
  const modalMedia = window.matchMedia("(min-width: 768px)");

  function topicModal(M) {
    const dlg = document.createElement("dialog");
    dlg.className = "tmodal";
    dlg.setAttribute("aria-labelledby", "tmodal-titulo");
    dlg.innerHTML =
      '<div class="tmodal__bar">' +
      '<span class="eyebrow">Roadmap</span>' +
      '<div class="tmodal__actions">' +
      '<a class="btn" data-tm-expand href="#">Expandir' + icon("expand") + "</a>" +
      '<button type="button" class="icon-btn" data-tm-close aria-label="Fechar">' + icon("close") + "</button>" +
      "</div></div>" +
      '<div class="tmodal__body" data-tm-body></div>';
    document.body.appendChild(dlg);

    const body = dlg.querySelector("[data-tm-body]");
    const expand = dlg.querySelector("[data-tm-expand]");
    let labs = [];

    dlg.querySelector("[data-tm-close]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => {
      // O evento chega um instante depois; se outro tópico já foi aberto, não apaga.
      if (dlg.open) return;
      labs.forEach((l) => l.destroy && l.destroy());
      labs = [];
      body.innerHTML = "";
      if (location.hash && M.byId[location.hash.slice(1)]) history.replaceState(null, "", location.pathname + location.search);
    });

    return {
      open(id) {
        const t = M.byId[id];
        if (!t) return false;
        labs.forEach((l) => l.destroy && l.destroy());
        body.innerHTML = topicBody(M, t, "modal");
        body.querySelectorAll(".rv").forEach((el) => el.classList.remove("rv"));
        body.scrollTop = 0;
        expand.href = topicUrl(t.id);
        if (!dlg.open) dlg.showModal();
        labs = mountDemos(body);
        history.replaceState(null, "", "#" + t.id);
        return true;
      }
    };
  }

  // Liga o modal aos links de tópico da página (desktop e tablet).
  function wireTopicModal(M) {
    const modal = topicModal(M);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-topic]");
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !modalMedia.matches) return;
      if (modal.open(a.dataset.topic)) e.preventDefault();
    });
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId && M.byId[hashId]) {
      if (modalMedia.matches) modal.open(hashId);
      else location.replace(topicUrl(hashId));
    }
  }

  const legendHtml = () => ORDEM_ESTADOS.map((s) => "<li>" + pin(s) + esc(ESTADOS[s]) + "</li>").join("");
  const statusCounts = (c) => ORDEM_ESTADOS.filter((s) => c[s]).map((s) => '<span class="sc">' + pin(s) + c[s] + " " + esc(ESTADOS[s].toLowerCase()) + "</span>").join("");
  const progressBlock = (titulo, list) => {
    const p = pct(list), c = contar(list);
    return '<div class="rm-where"><span class="eyebrow">' + esc(titulo) + "</span><b>" + p + "%</b><span>" + (c.dominado + c.revisar) + " de " + list.length + " tópicos dominados</span></div>" +
      '<div class="rm-total">' + bar(p) + '</div><div class="rm-counts">' + statusCounts(c) + "</div>";
  };

  /* -------------------------------------------------------------- Roadmap */
  function roadmap() {
    const M = model();

    $("[data-rm-top]").innerHTML = progressBlock("Progresso geral", M.topicos);
    $("[data-legend]").innerHTML = legendHtml();

    // Planejamento: o que está em andamento, o que revisar e o que já foi liberado.
    const item = (t) => "<li>" + pin(t.status) + topicLink(t.id, esc(t.nome)) + "<small>" + esc(modLabel(t)) + " · " + t.nivel + " · " + esc(PRIORIDADE[t.prioridade]) + "</small></li>";
    const col = (titulo, sub, list, vazio) => frame(
      '<span class="eyebrow">' + esc(titulo) + "</span><p>" + esc(sub) + "</p>" +
      (list.length ? '<ul class="plan-list">' + list.map(item).join("") + "</ul>" : '<p class="mute">' + esc(vazio) + "</p>")
    );
    $("[data-plan]").innerHTML =
      col("Em andamento", "Tópicos em estudo ou em prática.", M.topicos.filter(andamento), "Nenhum tópico em andamento.") +
      col("Revisar", "Já dominados que precisam de revisão.", M.topicos.filter((t) => t.status === "revisar"), "Nada para revisar.") +
      col("Próximos liberados", "Não iniciados com todos os pré-requisitos concluídos, essenciais primeiro.", liberados(M).slice(0, 8), "Nenhum tópico liberado.");

    // Trilha das áreas.
    $("[data-rmap]").innerHTML =
      '<div class="rm-root rv"><span class="rm-seed">DB</span><span class="rm-label"><b>Backend Engineering</b><small>da matemática ao system design</small></span></div>' +
      M.areas.map((a, i) => {
        const tops = M.daArea(a.id);
        const ap = pct(tops), ac = contar(tops);
        const state = tops.length && ap === 100 ? "done" : tops.some((t) => t.status !== "nao-iniciado") ? "" : "next";
        return '<div class="rm-row ' + (i % 2 ? "l" : "r") + '">' +
          '<div class="rm-hub rv ' + state + '"><i class="rm-knot" aria-hidden="true"></i><span class="rm-label"><b>' + esc(a.numero) + "</b><small>" + ap + "%</small></span></div>" +
          '<div class="rm-leaves"><a class="leaf area-leaf rv" href="' + areaUrl(a.id) + '">' +
          '<span class="leaf-tx"><span class="eyebrow">Área ' + esc(a.numero) + " · " + esc(PRIORIDADE[a.prioridade] || a.prioridade) + " · " + M.modulosDa(a.id).length + " módulos · " + niveisDe(tops) + "</span>" +
          "<b>" + esc(a.nome) + "</b>" +
          '<span class="leaf-meta">' + bar(ap) + ap + "% · " + (ac.dominado + ac.revisar) + "/" + tops.length + " tópicos</span>" +
          (ac.estudo + ac.pratica + ac.revisar ? '<span class="leaf-counts">' + statusCounts({ estudo: ac.estudo, pratica: ac.pratica, revisar: ac.revisar }) + "</span>" : "") +
          "</span></a></div></div>";
      }).join("") +
      (M.areas.length ? "" : '<p class="empty-note rv">O roadmap está vazio por enquanto.</p>');

    $("[data-recent]").innerHTML = recentList(M);

    wireTopicModal(M);
  }

  /* ------------------------------------------------------ Página de uma área */
  function areaPage() {
    const M = model();
    const root = $("[data-area-page]");
    const id = new URLSearchParams(location.search).get("id");
    const i = M.areas.findIndex((a) => a.id === id);
    const a = M.areas[i];

    if (!a) {
      root.innerHTML =
        '<div class="head"><span class="tag">Roadmap</span><h1 class="h2">Área não encontrada <span>talvez o endereço tenha mudado</span></h1>' +
        '<div class="actions"><a class="btn primary" href="roadmap.html">Ver o roadmap' + icon("arrow") + "</a></div></div>";
      document.title = "Área não encontrada, Davi Brito";
      return;
    }

    document.title = "Área " + a.numero + ": " + a.nome + ", Davi Brito";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = a.descricao;

    const tops = M.daArea(a.id);
    const areaLinks = (ids) => ids.map((x) => M.area(x)).filter(Boolean)
      .map((x) => '<li><a href="' + areaUrl(x.id) + '"><b>' + esc(x.numero) + "</b> " + esc(x.nome) + "</a><small>" + pct(M.daArea(x.id)) + "%</small></li>").join("");

    // Resumo por nível (N1 a N4) dentro da área.
    const niveis = NIVEIS.filter((n) => tops.some((t) => t.nivel === n));
    const nivelResumo = niveis.map((n) => {
      const doN = tops.filter((t) => t.nivel === n), p = pct(doN);
      return '<li><b>' + esc(nivelNome(M, n)) + "</b><small>" + esc((M.niveis[n] && M.niveis[n].texto) || "") + "</small>" + bar(p) + "<span>" + p + "% · " + doN.filter(concluido).length + "/" + doN.length + "</span></li>";
    }).join("");

    const row = (t) => {
      const pendentes = t.status === "nao-iniciado" ? t.pre.filter((p) => M.byId[p] && !concluido(M.byId[p])) : [];
      return '<a class="trow" href="' + topicUrl(t.id) + '" data-topic="' + esc(t.id) + '" data-s="' + t.status + '">' +
        pin(t.status) +
        '<span class="trow-tx"><b>' + esc(t.nome) + "</b>" +
        "<small>" + t.nivel + " · " + esc(ESTADOS[t.status]) + (pendentes.length ? " · requer " + pendentes.length + " pré-requisito" + (pendentes.length > 1 ? "s" : "") : "") + "</small></span>" +
        impChip(t.prioridade) + "</a>";
    };

    const prev = M.areas[i - 1], next = M.areas[i + 1];
    const navCard = (x, label, cls) => x
      ? '<a class="tnav__link ' + cls + '" href="' + areaUrl(x.id) + '"><span class="eyebrow">' + label + "</span><b>" + esc(x.numero + " " + x.nome) + "</b></a>"
      : "<span></span>";

    root.innerHTML =
      '<nav class="crumbs rv" aria-label="Caminho"><a href="roadmap.html">' + icon("back") + "Roadmap</a><span>/</span><span>Área " + esc(a.numero) + "</span></nav>" +
      '<div class="topic-head">' +
      '<div><span class="eyebrow rv">Área ' + esc(a.numero) + "</span>" +
      '<h1 class="h2 rv" id="a-titulo" style="margin-top:10px">' + esc(a.nome) + "</h1>" +
      '<p class="lede rv">' + esc(a.descricao) + "</p></div>" +
      '<div class="topic-meta rv">' + chip("Prioridade: " + (PRIORIDADE[a.prioridade] || a.prioridade), "imp-" + a.prioridade) + chip("Níveis " + niveisDe(tops), "lvl") + "</div>" +
      "</div>" +

      '<div class="area-progress rv">' + progressBlock("Progresso da área", tops) + "</div>" +

      '<div class="grid-2 notes area-info">' +
      frame('<span class="eyebrow">Objetivo</span><p>' + esc(a.objetivo) + "</p>" +
        (a.nota ? '<span class="eyebrow" style="margin-top:6px">Prioridade dentro da área</span><p>' + esc(a.nota) + "</p>" : "") +
        '<span class="eyebrow" style="margin-top:6px">Pré-requisitos</span>' +
        (a.pre.length ? '<ul class="rel area-rel">' + areaLinks(a.pre) + "</ul>" : '<p class="mute">Nenhum: é um ponto de partida.</p>')) +
      frame('<span class="eyebrow">Progresso por nível</span><ul class="lvl-list">' + nivelResumo + "</ul>") +
      "</div>" +

      M.modulosDa(a.id).map((m) => {
        const doMod = M.doModulo(m.id), mp = pct(doMod);
        return '<section class="level-block" id="mod-' + esc(m.id) + '" aria-labelledby="mt-' + esc(m.id) + '">' +
          '<div class="sub-head rv mod-head"><h2 class="h3" id="mt-' + esc(m.id) + '">' + esc(m.numero) + " " + esc(m.nome) + " <span>" + doMod.length + " tópicos · " + niveisDe(doMod) + "</span></h2>" +
          '<div class="mod-progress">' + bar(mp) + "<span>" + mp + "% · " + doMod.filter(concluido).length + "/" + doMod.length + "</span></div></div>" +
          '<div class="trows">' + doMod.map(row).join("") + "</div></section>";
      }).join("") +

      '<nav class="tnav rv" aria-label="Outras áreas">' + navCard(prev, "Área anterior", "prev") + navCard(next, "Próxima área", "next") + "</nav>";

    wireTopicModal(M);
  }

  /* --------------------------------------------------- Página de um tópico */
  function topico() {
    const M = model();
    const root = $("[data-topic-page]");
    const id = new URLSearchParams(location.search).get("id");
    const t = M.byId[id];

    if (!t) {
      root.innerHTML =
        '<div class="head"><span class="tag">Roadmap</span><h1 class="h2">Tópico não encontrado <span>talvez o endereço tenha mudado</span></h1>' +
        '<div class="actions"><a class="btn primary" href="roadmap.html">Ver o roadmap' + icon("arrow") + "</a></div></div>";
      document.title = "Tópico não encontrado, Davi Brito";
      return;
    }

    document.title = t.nome + ", Davi Brito";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = t.descricao;

    const a = M.area(t.area) || { numero: "", id: "" };
    const list = M.daArea(t.area);
    const i = list.indexOf(t);
    const prev = list[i - 1], next = list[i + 1];
    const navCard = (x, label, cls) => x
      ? '<a class="tnav__link ' + cls + '" href="' + topicUrl(x.id) + '"><span class="eyebrow">' + label + " · " + esc(x.mod.numero) + "</span><b>" + esc(x.nome) + "</b></a>"
      : "<span></span>";

    root.innerHTML =
      '<nav class="crumbs rv" aria-label="Caminho"><a href="roadmap.html">' + icon("back") + 'Roadmap</a><span>/</span><a href="' + areaUrl(a.id) + '">Área ' + esc(a.numero) + '</a><span>/</span><a href="' + areaUrl(a.id) + "#mod-" + esc(t.modulo) + '">' + esc(modLabel(t)) + "</a></nav>" +
      topicBody(M, t, "page") +
      '<nav class="tnav rv" aria-label="Outros tópicos da área">' + navCard(prev, "Anterior", "prev") + navCard(next, "Próximo", "next") + "</nav>";

    mountDemos(root);
  }

  function commits() {
    const root = $("[data-commits]");
    if (root) window.Commits.renderPage(root);
  }

  const PAGES = { home, sobre, roadmap, area: areaPage, topico, commits };
  document.addEventListener("DOMContentLoaded", () => {
    const fn = PAGES[document.body.dataset.page];
    if (fn) fn();
    window.Site.wireLinks();
    window.Site.reveal();
  });
})();
