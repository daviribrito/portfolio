/*
 * Roadmap de estudos. Comece vazio e vá adicionando conforme estudar.
 *
 * Cada área (fase) vira um ramo da árvore. Cada tópico ganha automaticamente:
 *   - uma página no portfólio: topico.html?id=<id>
 *   - uma nota no tech-notes: roadmap/<fase>/<id>.md
 *
 * Modelo de área:
 *   { id: "testes", nome: "Testes e qualidade", texto: "Uma frase sobre a área." }
 *
 * Modelo de tópico:
 *   {
 *     id: "piramide-testes",      // único: letras minúsculas, números e hífen
 *     fase: "testes",             // id de uma das áreas acima
 *     nome: "Pirâmide de testes",
 *     status: "estudando",        // "dominado" | "estudando" | "proximo"
 *     progresso: 30,              // 0 a 100
 *     demo: null,                 // laboratório: "retry" | "idempotencia" | "circuit" | "ratelimit" | "outbox" | "pipeline" | null
 *     linguagem: "js",            // linguagem do campo codigo (opcional, padrão "js")
 *     resumo: "Uma frase sobre o tópico.",
 *     anotacoes: ["..."],
 *     armadilhas: ["..."],
 *     codigo: null                // ou um trecho entre crases: `...`
 *   }
 *
 * Modelo de "aprendido recentemente":
 *   { data: "2026-11", texto: "O que aprendeu", topico: "piramide-testes" }
 */
window.ROADMAP = {
  fases: [],

  topicos: [],

  aprendidoRecentemente: []
};
