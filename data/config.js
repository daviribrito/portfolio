/*
 * Configuração geral do site.
 * Edite aqui: seu usuário do GitHub, os repositórios que aparecem na aba Commits
 * e os seus links de contato.
 */
window.SITE_CONFIG = {
  nome: "Davi Brito",
  nomeCompleto: "Davi Ribeiro Brito",
  cargo: "Desenvolvedor backend",

  github: {
    usuario: "daviribrito",
    // Só os repositórios desta lista aparecem na aba Commits, nesta ordem.
    // Para esconder um projeto, basta tirá-lo da lista.
    repositorios: [
      {
        nome: "GesToque",
        resumo: "Gestão de estoque com previsão de compras por dia da semana, feriados e sazonalidade. Node.js, PostgreSQL, 2FA e app Android.",
        // Opcional: imagem de capa (16:9) e link da demo.
        capa: "assets/projetos/gestoque-capa.webp",
        capaAlt: "Capa do GesToque: tela de estoque no celular, previsão de compra e login com 2FA.",
        demo: "https://daviribrito.github.io/GesToque"
      },
      { nome: "bank-processor", resumo: "Processamento de transações bancárias com foco em regras de negócio." },
      { nome: "portfolio", resumo: "Portal com demonstrações interativas de padrões de back-end: idempotência, retry, circuit breaker e rate limiting." },
      { nome: "tech-notes", resumo: "Minhas anotações técnicas, diagramas e estudos." }
    ],
    commitsPorRepositorio: 8
  },

  // Cada tópico do roadmap vira uma nota no repositório tech-notes, em
  // <pasta>/<fase>/<id>.md. A sincronização roda pela GitHub Action do tech-notes.
  techNotes: {
    repositorio: "daviribrito/tech-notes",
    branch: "main",
    pasta: "roadmap"
  },

  links: {
    github: "https://github.com/daviribrito",
    linkedin: "https://www.linkedin.com/in/daviribrito/",
    email: "mailto:d4v1.brito007@gmail.com"
  }
};
