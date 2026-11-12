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
        labs.map((t) => '<a href="' + topicUrl(t.id) + '"><b>' + esc(t.nome) + "</b><small>" + t.progresso + "%</small>" + bar(t.progresso) + "</a>").join("") +
        (labs.length ? "" : "<p>Os laboratórios aparecem aqui conforme os tópicos forem adicionados ao roadmap.</p>") +
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
        '<div class="foot">' + go(topicUrl(f.id), "Abrir tópico") + '<span class="eyebrow">' + esc(faseNome(R, f.fase)) + "</span></div>"
      ) : "",
      frame(
        '<span class="eyebrow">Aprendido recentemente</span>' +
        '<ol class="tl">' +
        (R.aprendidoRecentemente.length ? R.aprendidoRecentemente.map((r) => '<li><time datetime="' + esc(r.data) + '">' + esc(monthLabel(r.data)) + '</time><a href="' + topicUrl(r.topico) + '">' + esc(r.texto) + "</a></li>").join("") : "<li><span></span><span class=\"mute\">Nada registrado ainda.</span></li>") +
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

  /* ------------------------------------------------------ Tópicos (matérias) */

  // Cada matéria tem a sua página; no roadmap ela também abre em modal.
  const topicUrl = (id) => "topico.html?id=" + encodeURIComponent(id);
  const topicLink = (id, inner, cls) => '<a href="' + topicUrl(id) + '" data-topic="' + esc(id) + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + inner + "</a>";

  function noteUrl(t) {
    const tn = window.SITE_CONFIG.techNotes;
    if (!tn) return null;
    return "https://github.com/" + tn.repositorio + "/blob/" + tn.branch + "/" + tn.pasta + "/" + t.fase + "/" + t.id + ".md";
  }

  // Ordem de leitura: pela fase, depois pela ordem em que o tópico aparece no arquivo.
  function ordered(R) {
    return R.fases.flatMap((f) => R.topicos.filter((t) => t.fase === f.id));
  }

  /* Conteúdo de uma matéria. mode: "page" (página própria) ou "modal". */
  function topicBody(R, t, mode) {
    const page = mode === "page";
    const rv = page ? " rv" : "";
    const hid = page ? "t-titulo" : "tmodal-titulo";
    const hasNotes = t.anotacoes.length || t.armadilhas.length;
    const note = noteUrl(t);

    return (
      '<div class="topic-head">' +
      "<div>" +
      '<span class="eyebrow' + rv + '">' + esc(faseNome(R, t.fase)) + "</span>" +
      "<" + (page ? "h1" : "h2") + ' class="' + (page ? "h2" : "h3") + rv + '" id="' + hid + '" style="margin-top:10px">' + esc(t.nome) + "</" + (page ? "h1" : "h2") + ">" +
      '<p class="lede' + rv + '">' + esc(t.resumo) + "</p></div>" +
      '<div class="meter-row' + rv + '" role="img" aria-label="' + STATUS[t.status] + (t.status === "proximo" ? "" : ", " + t.progresso + "%") + '">' +
      '<span class="st"><i class="pin" data-s="' + t.status + '"></i>' + STATUS[t.status] + "</span>" +
      (t.status === "proximo" ? "" : bar(t.progresso) + t.progresso + "%") +
      "</div></div>" +

      (hasNotes
        ? '<div class="grid-2 notes">' +
          (t.anotacoes.length ? frame('<span class="eyebrow">Minhas anotações</span><ul class="bul">' + t.anotacoes.map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>") : "") +
          (t.armadilhas.length ? frame('<span class="eyebrow">Armadilhas</span><ul class="bul trap">' + t.armadilhas.map((a) => "<li>" + esc(a) + "</li>").join("") + "</ul>") : "") +
          "</div>"
        : "") +

      (t.demo ? '<div class="topic-lab' + rv + '" data-demo="' + esc(t.demo) + '"></div>' : "") +

      (t.codigo
        ? '<div class="frame' + rv + '" style="margin-top:12px">' + window.Site.CORNERS +
          '<details class="card code-card"' + (page ? "" : " open") + "><summary>Ver o código<span class=\"plus\" aria-hidden=\"true\">" + icon("plus") + "</span></summary><pre><code>" + highlight(t.codigo) + "</code></pre></details></div>"
        : "") +

      (!t.demo && !hasNotes && !t.codigo
        ? frame(
            '<span class="eyebrow">' + (t.status === "proximo" ? "Na fila" : "Em construção") + "</span>" +
            "<p>" + (t.status === "proximo"
              ? "Este tópico ainda vai começar. As anotações, as armadilhas e o laboratório entram aqui quando eu estudar."
              : "As anotações deste tópico ainda estão sendo escritas.") + "</p>",
            { cls: "upcoming" }
          )
        : "") +

      '<div class="topic-links' + rv + '">' +
      (note ? '<a class="go" href="' + esc(note) + '" target="_blank" rel="noopener">' + icon("book") + "Nota no tech-notes" + icon("ext") + "</a>" : "") +
      (page ? '<a class="go" href="roadmap.html">Ver o roadmap' + icon("arrow") + "</a>" : "") +
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

  function topicModal(R) {
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
    // Clique fora da caixa (no fundo escurecido) fecha.
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => {
      // O evento chega um instante depois; se outro tópico já foi aberto, não apaga.
      if (dlg.open) return;
      labs.forEach((l) => l.destroy && l.destroy());
      labs = [];
      body.innerHTML = "";
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    });

    return {
      open(id) {
        const t = R.topicos.find((x) => x.id === id);
        if (!t) return false;
        labs.forEach((l) => l.destroy && l.destroy());
        body.innerHTML = topicBody(R, t, "modal");
        // No modal nada fica escondido esperando rolagem: tudo aparece de cara.
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

  /* -------------------------------------------------------------- Roadmap */
  function roadmap() {
    const R = window.ROADMAP;
    const f = focusTopic(R);
    const done = R.topicos.filter((t) => t.status === "dominado").length;
    const total = R.topicos.length;

    $("[data-rm-top]").innerHTML =
      '<div class="rm-where"><span class="eyebrow">Onde estou</span>' +
      (!total ? "<span>Nenhum tópico ainda</span>" : "") + (f ? "<span>" + esc(faseNome(R, f.fase)) + " › <b>" + esc(f.nome) + "</b> · " + f.progresso + "%</span>" + topicLink(f.id, "Abrir" + icon("arrow"), "btn") : "") +
      "</div>" +
      (total ? '<div class="rm-total">' + bar(Math.round((done / total) * 100)) + done + " de " + total + " tópicos dominados</div>" : "");

    $("[data-legend]").innerHTML = ["dominado", "estudando", "proximo"]
      .map((s) => '<li><i class="pin" data-s="' + s + '"></i>' + STATUS[s] + "</li>").join("");

    const leaf = (t) => {
      const here = f && t.id === f.id;
      const meta = t.status === "proximo" ? "próximo" : t.progresso + "%" + (t.demo ? " · laboratório" : "");
      return '<a href="' + topicUrl(t.id) + '" data-topic="' + esc(t.id) + '" class="leaf rv' + (here ? " here" : "") + '" data-s="' + t.status + '">' +
        (here ? '<span class="here-tag">Você está aqui</span>' : "") +
        '<i class="pin" data-s="' + t.status + '"></i>' +
        '<span class="leaf-tx"><b>' + esc(t.nome) + '</b><span class="leaf-meta">' + (t.status === "proximo" ? "" : bar(t.progresso)) + esc(meta) + "</span></span>" +
        "</a>";
    };

    $("[data-rmap]").innerHTML =
      '<div class="rm-root rv"><span class="rm-seed">DB</span><span class="rm-label"><b>Backend</b><small>a base de tudo</small></span></div>' +
      R.fases.map((fase, i) => {
        const tops = R.topicos.filter((t) => t.fase === fase.id);
        const d = tops.filter((t) => t.status === "dominado").length;
        const state = tops.length && d === tops.length ? "done" : tops.every((t) => t.status === "proximo") ? "next" : "";
        return '<div class="rm-row ' + (i % 2 ? "l" : "r") + '">' +
          '<div class="rm-hub rv ' + state + '"><i class="rm-knot" aria-hidden="true"></i><span class="rm-label"><b>' + esc(fase.nome) + "</b><small>" + d + "/" + tops.length + " dominados</small></span></div>" +
          '<div class="rm-leaves">' + tops.map(leaf).join("") + "</div></div>";
      }).join("") +
      (R.fases.length ? "" : '<p class="empty-note rv">O roadmap está vazio por enquanto. As áreas e os tópicos aparecem aqui conforme forem adicionados em <code>data/roadmap.js</code>.</p>');

    $("[data-upcoming]").innerHTML = R.topicos
      .filter((t) => t.status === "proximo")
      .map((t) => frame(
        '<span class="eyebrow">' + esc(faseNome(R, t.fase)) + "</span><h3>" + esc(t.nome) + "</h3><p>" + esc(t.resumo) + "</p>",
        { href: topicUrl(t.id), attrs: ' data-topic="' + esc(t.id) + '"' }
      ))
      .join("") || '<p class="empty-note">Nada na fila por enquanto.</p>';

    $("[data-recent]").innerHTML = R.aprendidoRecentemente
      .map((r) => '<li><time datetime="' + esc(r.data) + '">' + esc(monthLabel(r.data)) + "</time>" + topicLink(r.topico, esc(r.texto)) + "</li>")
      .join("") || '<li><span></span><span class="mute">Nada registrado ainda.</span></li>';

    // Desktop e tablet: abre em modal. Celular, ou Ctrl/Cmd/clique do meio: segue o link.
    const modal = topicModal(R);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-topic]");
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !modalMedia.matches) return;
      if (modal.open(a.dataset.topic)) e.preventDefault();
    });

    // Links antigos (roadmap.html#retry) continuam funcionando.
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId && R.topicos.some((t) => t.id === hashId)) {
      if (modalMedia.matches) modal.open(hashId);
      else location.replace(topicUrl(hashId));
    }
  }

  /* --------------------------------------------------- Página de uma matéria */
  function topico() {
    const R = window.ROADMAP;
    const root = $("[data-topic-page]");
    const id = new URLSearchParams(location.search).get("id");
    const list = ordered(R);
    const i = list.findIndex((t) => t.id === id);
    const t = list[i];

    if (!t) {
      root.innerHTML =
        '<div class="head"><span class="tag">Roadmap</span><h1 class="h2">Tópico não encontrado <span>talvez o endereço tenha mudado</span></h1>' +
        '<div class="actions"><a class="btn primary" href="roadmap.html">Ver o roadmap' + icon("arrow") + "</a></div></div>";
      document.title = "Tópico não encontrado, Davi Brito";
      return;
    }

    document.title = t.nome + ", Davi Brito";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = t.resumo;

    const prev = list[i - 1], next = list[i + 1];
    const navCard = (x, label, cls) => x
      ? '<a class="tnav__link ' + cls + '" href="' + topicUrl(x.id) + '"><span class="eyebrow">' + label + "</span><b>" + esc(x.nome) + "</b></a>"
      : "<span></span>";

    root.innerHTML =
      '<nav class="crumbs rv" aria-label="Caminho"><a href="roadmap.html">' + icon("back") + "Roadmap</a><span>/</span><span>" + esc(faseNome(R, t.fase)) + "</span></nav>" +
      topicBody(R, t, "page") +
      '<nav class="tnav rv" aria-label="Outros tópicos">' + navCard(prev, "Anterior", "prev") + navCard(next, "Próximo", "next") + "</nav>";

    mountDemos(root);
  }

  function commits() {
    const root = $("[data-commits]");
    if (root) window.Commits.renderPage(root);
  }

  const PAGES = { home, sobre, roadmap, topico, commits };
  document.addEventListener("DOMContentLoaded", () => {
    const fn = PAGES[document.body.dataset.page];
    if (fn) fn();
    window.Site.wireLinks();
    window.Site.reveal();
  });
})();
