/*
 * Integração com a API pública do GitHub.
 * Os repositórios exibidos vêm de SITE_CONFIG.github.repositorios (data/config.js).
 * Sem token: 60 consultas por hora por visitante. As respostas ficam 15 min em cache no navegador.
 */
(function () {
  "use strict";
  const { esc, icon, relativeDate } = window.Site;
  const API = "https://api.github.com";
  const TTL = 15 * 60 * 1000;

  const LANG = { JavaScript: "#e8c32a", TypeScript: "#3178c6", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", Python: "#3572a5", Go: "#00add8", Shell: "#89e051" };

  class GithubError extends Error {
    constructor(kind, detail) { super(kind); this.kind = kind; this.detail = detail; }
  }

  function cacheGet(k) {
    try {
      const raw = sessionStorage.getItem(k);
      if (!raw) return null;
      const { at, data } = JSON.parse(raw);
      return Date.now() - at < TTL ? data : null;
    } catch (e) { return null; }
  }
  function cacheSet(k, data) {
    try { sessionStorage.setItem(k, JSON.stringify({ at: Date.now(), data })); } catch (e) {}
  }

  async function gh(path) {
    const k = "gh:" + path;
    const hit = cacheGet(k);
    if (hit) return hit;
    let r;
    try {
      r = await fetch(API + path, { headers: { Accept: "application/vnd.github+json" } });
    } catch (e) {
      throw new GithubError("rede");
    }
    if (r.status === 404) throw new GithubError("404");
    if (r.status === 409) return []; // repositório vazio
    if (r.status === 403 || r.status === 429) {
      const reset = Number(r.headers.get("x-ratelimit-reset")) * 1000;
      throw new GithubError("limite", reset || null);
    }
    if (!r.ok) throw new GithubError("http", r.status);
    const data = await r.json();
    cacheSet(k, data);
    return data;
  }

  async function loadRepo(owner, name) {
    const [repo, commits] = await Promise.all([
      gh("/repos/" + owner + "/" + name),
      gh("/repos/" + owner + "/" + name + "/commits?per_page=40")
    ]);
    return {
      repo,
      commits: (commits || []).map((c) => ({
        sha: c.sha.slice(0, 7),
        url: c.html_url,
        msg: (c.commit.message || "").split("\n")[0],
        date: c.commit.author ? c.commit.author.date : c.commit.committer.date,
        repo: name
      }))
    };
  }

  function errorText(err, name) {
    if (err.kind === "404") return { t: "Repositório não encontrado", d: "O repositório “" + name + "” não existe ou é privado." };
    if (err.kind === "limite") {
      const when = err.detail ? new Date(err.detail).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "daqui a pouco";
      return { t: "Limite de consultas ao GitHub atingido", d: "O GitHub libera novas consultas às " + when + ". Enquanto isso, veja os projetos direto no GitHub." };
    }
    if (err.kind === "rede") return { t: "Sem conexão com o GitHub", d: "Verifique a internet e tente de novo." };
    return { t: "O GitHub não respondeu", d: "Tente de novo em alguns instantes." };
  }

  function weeks(commits) {
    const now = Date.now(), W = 7 * 864e5, bins = new Array(12).fill(0);
    commits.forEach((c) => {
      const i = 11 - Math.floor((now - new Date(c.date).getTime()) / W);
      if (i >= 0 && i < 12) bins[i] += 1;
    });
    return bins;
  }

  function commitRow(c, withRepo) {
    return (
      '<li class="commit">' +
      '<a class="commit__sha" href="' + esc(c.url) + '" target="_blank" rel="noopener" aria-label="Commit ' + esc(c.sha) + ' no GitHub">' + esc(c.sha) + "</a>" +
      '<span class="commit__msg" title="' + esc(c.msg) + '">' + esc(c.msg) + "</span>" +
      '<time class="commit__date" datetime="' + esc(c.date) + '">' + esc(relativeDate(c.date)) + "</time>" +
      (withRepo ? '<span class="commit__repo">' + esc(c.repo) + "</span>" : "") +
      "</li>"
    );
  }

  function repoCard(cfgRepo, data, wide, limit) {
    const r = data.repo;
    const bins = weeks(data.commits);
    const max = Math.max(1, ...bins);
    const total12 = bins.reduce((a, b) => a + b, 0);
    const lang = r.language
      ? '<span><i class="lang-dot" style="background:' + (LANG[r.language] || "var(--faint)") + '"></i>' + esc(r.language) + "</span>"
      : "";
    return shell(
      cover(cfgRepo) +
      '<div class="repo-head"><div>' +
      '<span class="eyebrow">Repositório</span>' +
      '<h2 class="repo-name" style="margin-top:8px"><a href="' + esc(r.html_url) + '" target="_blank" rel="noopener">' + esc(r.name) + "</a></h2>" +
      "</div></div>" +
      "<p>" + esc(cfgRepo.resumo || r.description || "") + "</p>" +
      '<div class="repo-meta">' + lang +
      "<span>" + icon("star") + r.stargazers_count + "</span>" +
      "<span>" + icon("clock") + "atualizado " + esc(relativeDate(r.pushed_at)) + "</span>" +
      "</div>" +
      '<div class="activity" role="img" aria-label="' + total12 + ' commits nas últimas 12 semanas">' +
      bins.map((b) => '<span class="' + (b ? "has" : "") + '" style="height:' + Math.max(8, (b / max) * 100) + '%"></span>').join("") +
      "</div>" +
      '<span class="eyebrow">' + total12 + (total12 === 1 ? " commit" : " commits") + " nas últimas 12 semanas</span>" +
      (data.commits.length
        ? '<ol class="commits">' + data.commits.slice(0, limit).map((c) => commitRow(c, false)).join("") + "</ol>"
        : '<div class="state">Nenhum commit ainda.</div>') +
      '<div class="foot"><a class="go" href="' + esc(r.html_url) + '/commits" target="_blank" rel="noopener">Ver todos no GitHub' + icon("ext") + "</a>" +
      (cfgRepo.demo ? '<a class="go" href="' + esc(cfgRepo.demo) + '" target="_blank" rel="noopener">Abrir demo' + icon("ext") + "</a>" : "") +
      "</div>",
      wide
    );
  }

  function cover(cfgRepo) {
    if (!cfgRepo.capa) return "";
    const img = '<img class="cover" src="' + esc(cfgRepo.capa) + '" alt="' + esc(cfgRepo.capaAlt || cfgRepo.nome) + '" width="1920" height="1080" loading="lazy" decoding="async">';
    return cfgRepo.demo ? '<a class="cover-link" href="' + esc(cfgRepo.demo) + '" target="_blank" rel="noopener">' + img + "</a>" : img;
  }

  function shell(inner, wide) {
    return '<div class="frame' + (wide ? " wide-repo" : "") + '">' + window.Site.CORNERS + '<article class="card">' + inner + "</article></div>";
  }

  function stateBox(t, d, retry) {
    return '<div class="state"><strong>' + esc(t) + "</strong>" + esc(d) + (retry ? '<br><button type="button" class="btn" data-retry>Tentar de novo</button>' : "") + "</div>";
  }

  function skeletonCard() {
    return shell('<div aria-hidden="true"><div class="skeleton" style="width:40%;height:20px"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>');
  }

  /* Página Commits */
  function renderPage(root) {
    const cfg = window.SITE_CONFIG.github;
    const filter = root.querySelector(".repo-filter");
    const grid = root.querySelector(".repos");
    const results = {};
    let current = "todos";

    if (!cfg.repositorios.length) {
      grid.innerHTML = '<div class="state wide-repo"><strong>Nenhum projeto selecionado</strong>Adicione repositórios em data/config.js para que apareçam aqui.</div>';
      return;
    }

    const chips = [{ id: "todos", label: "Todos" }].concat(cfg.repositorios.map((r) => ({ id: r.nome, label: r.nome })));
    filter.innerHTML = '<div class="seg" role="group" aria-label="Filtrar por projeto">' +
      chips.map((c) => '<button type="button" data-id="' + esc(c.id) + '" aria-pressed="' + (c.id === current) + '">' + esc(c.label) + "</button>").join("") + "</div>";
    filter.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      current = b.dataset.id;
      filter.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    });

    function draw() {
      const list = current === "todos" ? cfg.repositorios : cfg.repositorios.filter((r) => r.nome === current);
      const single = list.length === 1;
      grid.innerHTML = list.map((r) => {
        const res = results[r.nome];
        if (!res) return skeletonCard();
        if (res.error) {
          const e = errorText(res.error, r.nome);
          return shell(cover(r) + '<h2 class="repo-name">' + esc(r.nome) + "</h2>" + stateBox(e.t, e.d, res.error.kind !== "404"), single);
        }
        return repoCard(r, res, single, single ? cfg.commitsPorRepositorio * 3 : cfg.commitsPorRepositorio);
      }).join("");
    }

    grid.addEventListener("click", (e) => {
      if (e.target.closest("[data-retry]")) {
        try { Object.keys(sessionStorage).filter((k) => k.startsWith("gh:")).forEach((k) => sessionStorage.removeItem(k)); } catch (er) {}
        cfg.repositorios.forEach((r) => { if (results[r.nome] && results[r.nome].error) delete results[r.nome]; });
        load();
      }
    });

    function load() {
      draw();
      cfg.repositorios.forEach((r) => {
        if (results[r.nome]) return;
        loadRepo(cfg.usuario, r.nome)
          .then((d) => { results[r.nome] = d; })
          .catch((err) => { results[r.nome] = { error: err }; })
          .finally(draw);
      });
    }
    load();
  }

  /* Prévia na home: os 3 commits mais recentes entre os projetos escolhidos */
  async function renderPeek(ul) {
    const cfg = window.SITE_CONFIG.github;
    try {
      const all = await Promise.all(cfg.repositorios.map((r) => loadRepo(cfg.usuario, r.nome).catch(() => null)));
      const commits = all.filter(Boolean).flatMap((d) => d.commits).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
      if (!commits.length) throw new Error("vazio");
      ul.innerHTML = commits.map((c) =>
        '<li><span class="sha">' + esc(c.sha) + '</span><span class="msg">' + esc(c.msg) + '</span><span class="meta">' + esc(c.repo) + ", " + esc(relativeDate(c.date)) + "</span></li>"
      ).join("");
    } catch (e) {
      ul.innerHTML = '<li><span class="sha">—</span><span class="msg">Histórico indisponível agora</span><span class="meta">Abra a página de commits para tentar de novo</span></li>';
    }
  }

  window.Commits = { renderPage, renderPeek };
})();
