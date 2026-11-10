/* Monta o conteúdo de cada página a partir de data/*.js */
(function () {
  "use strict";
  const { esc, icon, highlight, monthLabel, frame } = window.Site;

  const STATUS = { dominado: "Dominado", estudando: "Estudando", proximo: "Próximo" };
  const $ = (sel) => document.querySelector(sel);
  const bar = (pct) => '<span class="bar"><i style="width:' + pct + '%"></i></span>';
  const go = (href, label) => '<a class="go" href="' + href + '">' + esc(label) + icon("arrow") + "</a>";

  /* Tópico em foco: o que está em estudo, com laboratório e mais avançado */
  function focusTopic(R) {
    return R.topicos
      .filter((t) => t.status === "estudando")
      .sort((a, b) => (b.demo ? 1 : 0) - (a.demo ? 1 : 0) || b.progresso - a.progresso)[0];
  }
  const hasSection = (t) => t.status !== "proximo" && (t.demo || t.anotacoes.length);
  const faseNome = (R, id) => (R.fases.find((f) => f.id === id) || {}).nome || "";

  /* ---------------------------------------------------------------- Início */
  function home() {
    const R = window.ROADMAP, cfg = window.SITE_CONFIG, S = window.SOBRE;

    const n = (s) => R.topicos.filter((t) => t.status === s).length;
    const stats = [
      [n("dominado") + n("estudando"), "tópicos estudados"],
      [n("estudando"), "em andamento agora"],
      [R.topicos.filter((t) => t.demo).length, "laboratórios interativos"],
      [cfg.github.repositorios.length, "projetos no GitHub"]
    ];
    $("[data-stats]").innerHTML = stats.map((s) => '<div class="stat"><b>' + s[0] + "</b><span>" + esc(s[1]) + "</span></div>").join("");

    const lab = $("[data-lab]");
    if (lab) window.Demos.mount(lab, lab.dataset.lab, { tour: true });

    const f = focusTopic(R);
    const labs = R.topicos.filter((t) => t.demo);
    const cards = [
      frame(
        '<span class="eyebrow">Roadmap</span><h3>Um laboratório para cada conceito</h3>' +
        '<div class="topic-list">' +
        labs.map((t) => '<a href="roadmap.html#' + esc(t.id) + '"><b>' + esc(t.nome) + "</b><small>" + t.progresso + "%</small>" + bar(t.progresso) + "</a>").join("") +
        "</div>" +
        '<div class="foot">' + go("roadmap.html", "Ver o roadmap") + "</div>"
      ),
      frame(
        '<span class="eyebrow">GitHub</span><h3>Últimos commits</h3>' +
        '<ul class="peek" data-commit-peek aria-label="Commits mais recentes"><li><span class="sha">·······</span><span class="msg">Carregando commits…</span><span class="meta">GitHub</span></li></ul>' +
        '<div class="foot">' + go("commits.html", "Ver os projetos") + "</div>"
      ),
      f ? frame(
        '<span class="eyebrow">Foco agora</span>' +
        '<div class="focus"><div class="ring" role="img" aria-label="' + f.progresso + '% concluído">' +
        '<svg viewBox="0 0 92 92" aria-hidden="true"><circle class="bg" cx="46" cy="46" r="42"/><circle class="fg" cx="46" cy="46" r="42" style="stroke-dashoffset:' + (264 - 264 * f.progresso / 100).toFixed(1) + '"/></svg>' +
        "<b>" + f.progresso + "%</b></div>" +
        "<div><h3>" + esc(f.nome) + "</h3><p>" + esc(f.resumo) + "</p></div></div>" +
        '<div class="foot">' + go("roadmap.html#" + f.id, "Abrir tópico") + '<span class="eyebrow">' + esc(faseNome(R, f.fase)) + "</span></div>"
      ) : "",
      frame(
        '<span class="eyebrow">Aprendido recentemente</span>' +
        '<ol class="tl">' +
        R.aprendidoRecentemente.map((r) => '<li><time datetime="' + esc(r.data) + '">' + esc(monthLabel(r.data)) + '</time><a href="roadmap.html#' + esc(r.topico) + '">' + esc(r.texto) + "</a></li>").join("") +
        "</ol>"
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

  /* -------------------------------------------------------------- Roadmap */
  function roadmap() {
    const R = window.ROADMAP;
    const f = focusTopic(R);
    const done = R.topicos.filter((t) => t.status === "dominado").length;
    const total = R.topicos.length;

    $("[data-rm-top]").innerHTML =
      '<div class="rm-where"><span class="eyebrow">Onde estou</span>' +
      (f ? "<span>" + esc(faseNome(R, f.fase)) + " › <b>" + esc(f.nome) + "</b> · " + f.progresso + "%</span>" + '<a class="btn" href="#' + esc(f.id) + '">Abrir' + icon("arrow") + "</a>" : "") +
      "</div>" +
      '<div class="rm-total">' + bar(Math.round((done / total) * 100)) + done + " de " + total + " tópicos dominados</div>";

    $("[data-legend]").innerHTML = ["dominado", "estudando", "proximo"]
      .map((s) => '<li><i class="pin" data-s="' + s + '"></i>' + STATUS[s] + "</li>").join("");

    const leaf = (t) => {
      // Tópicos com seção abrem a seção; os próximos levam ao card em "Próximos passos".
      const link = hasSection(t) || t.status === "proximo";
      const here = f && t.id === f.id;
      const meta = t.status === "proximo" ? "próximo" : t.progresso + "%" + (t.demo ? " · laboratório" : "");
      return "<" + (link ? 'a href="#' + esc(t.id) + '"' : "div") + ' class="leaf rv' + (here ? " here" : "") + '" data-s="' + t.status + '">' +
        (here ? '<span class="here-tag">Você está aqui</span>' : "") +
        '<i class="pin" data-s="' + t.status + '"></i>' +
        '<span class="leaf-tx"><b>' + esc(t.nome) + '</b><span class="leaf-meta">' + (t.status === "proximo" ? "" : bar(t.progresso)) + esc(meta) + "</span></span>" +
        "</" + (link ? "a" : "div") + ">";
    };

    $("[data-rmap]").innerHTML =
      '<div class="rm-root rv"><span class="rm-seed">DB</span><span class="rm-label"><b>Backend</b><small>a base de tudo</small></span></div>' +
      R.fases.map((fase, i) => {
        const tops = R.topicos.filter((t) => t.fase === fase.id);
        const d = tops.filter((t) => t.status === "dominado").length;
        const state = d === tops.length ? "done" : tops.every((t) => t.status === "proximo") ? "next" : "";
        return '<div class="rm-row ' + (i % 2 ? "l" : "r") + '">' +
          '<div class="rm-hub rv ' + state + '"><i class="rm-knot" aria-hidden="true"></i><span class="rm-label"><b>' + esc(fase.nome) + "</b><small>" + d + "/" + tops.length + " dominados</small></span></div>" +
          '<div class="rm-leaves">' + tops.map(leaf).join("") + "</div></div>";
      }).join("");

    $("[data-topics]").innerHTML = R.topicos
      .filter(hasSection)
      .sort((a, b) => (a.demo ? 0 : 1) - (b.demo ? 0 : 1))
      .map((t) =>
        '<section class="sec topic" id="' + esc(t.id) + '" aria-labelledby="t-' + esc(t.id) + '">' +
        '<div class="topic-head"><div>' +
        '<span class="eyebrow">' + esc(faseNome(R, t.fase)) + "</span>" +
        '<h2 class="h3" id="t-' + esc(t.id) + '" style="margin-top:10px">' + esc(t.nome) + "</h2>" +
        '<p class="lede">' + esc(t.resumo) + "</p></div>" +
        '<div class="meter-row" role="img" aria-label="' + STATUS[t.status] + ", " + t.progresso + '%"><span class="st"><i class="pin" data-s="' + t.status + '"></i>' + STATUS[t.status] + "</span>" + bar(t.progresso) + t.progresso + "%</div>" +
        "</div>" +
        (t.demo ? '<div class="rv" data-demo="' + esc(t.demo) + '"></div>' : "") +
        ((t.anotacoes.length || t.armadilhas.length) ? '<div class="grid-2 notes">' +
          (t.anotacoes.length ? frame('<span class="eyebrow">Minhas anotações</span><ul class="bul">' + t.anotacoes.map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>") : "") +
          (t.armadilhas.length ? frame('<span class="eyebrow">Armadilhas</span><ul class="bul trap">' + t.armadilhas.map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>") : "") +
          "</div>" : "") +
        (t.codigo ? '<div class="frame rv" style="margin-top:30px">' + window.Site.CORNERS +
          '<details class="card code-card"><summary>Ver o código<span class="plus" aria-hidden="true">' + icon("plus") + "</span></summary><pre><code>" + highlight(t.codigo) + "</code></pre></details></div>" : "") +
        "</section>")
      .join("");

    document.querySelectorAll("[data-demo]").forEach((el) => window.Demos.mount(el, el.dataset.demo, { tour: true }));

    $("[data-upcoming]").innerHTML = R.topicos
      .filter((t) => t.status === "proximo")
      .map((t) => frame('<span class="eyebrow">' + esc(faseNome(R, t.fase)) + "</span><h3>" + esc(t.nome) + "</h3><p>" + esc(t.resumo) + "</p>", { id: t.id }))
      .join("");

    $("[data-recent]").innerHTML = R.aprendidoRecentemente
      .map((r) => '<li><time datetime="' + esc(r.data) + '">' + esc(monthLabel(r.data)) + '</time><a href="#' + esc(r.topico) + '">' + esc(r.texto) + "</a></li>")
      .join("");
  }

  function commits() {
    const root = $("[data-commits]");
    if (root) window.Commits.renderPage(root);
  }

  const PAGES = { home, sobre, roadmap, commits };
  document.addEventListener("DOMContentLoaded", () => {
    const fn = PAGES[document.body.dataset.page];
    if (fn) fn();
    window.Site.wireLinks();
    window.Site.reveal();
  });
})();
