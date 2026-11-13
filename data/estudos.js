/*
 * MEUS ESTUDOS: progresso e anotações de cada tópico do roadmap.
 *
 * A estrutura (áreas, tópicos, níveis, pré-requisitos) fica em data/roadmap.js.
 * Aqui entra só o que é seu. Tópico que não aparece aqui está "Não iniciado".
 *
 * status: estados possíveis de cada tópico
 *   "nao-iniciado"  ainda não comecei
 *   "estudo"        estudando a teoria
 *   "pratica"       aplicando em código ou projeto
 *   "dominado"      entendo e já apliquei na prática
 *   "revisar"       já dominei, mas preciso revisar
 *
 *   Exemplo:  status: { "idem-chaves": "pratica", "alg-busca": "dominado" }
 *
 * conteudo: anotações por tópico (todos os campos são opcionais)
 *   "idem-chaves": {
 *     anotacoes: ["..."],
 *     armadilhas: ["..."],
 *     codigo: `...`,
 *     linguagem: "java",      // padrão "java"
 *     demo: "idempotencia",   // laboratório: retry | idempotencia | circuit | ratelimit | outbox | pipeline
 *     links: [{ titulo: "Artigo", url: "https://..." }]
 *   }
 *
 * aprendidoRecentemente: registros curtos do que fez sentido
 *   { data: "2026-11", texto: "O que aprendi", topico: "idem-chaves" }
 */
window.ESTUDOS = {
  status: {},

  conteudo: {},

  aprendidoRecentemente: []
};
