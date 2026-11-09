/*
 * Conteúdo da página Sobre.
 * Textos-base vindos da versão anterior do portal. Revise à vontade.
 * Itens com `exemplo: true` aparecem marcados como exemplo no site até você trocá-los.
 */
window.SOBRE = {
  frase: "Prefiro entender por que algo quebra antes de decidir como consertar.",

  fatos: [
    { rotulo: "Base", valor: "São Paulo · remoto ou híbrido" },
    { rotulo: "Experiência", valor: "4+ anos em TI e sustentação" },
    { rotulo: "Idiomas", valor: "Português e inglês" },
    { rotulo: "Status", valor: "Aberto a oportunidades", destaque: true }
  ],

  historia: [
    "Sou desenvolvedor backend e gosto da parte que quase ninguém vê: o que acontece quando a rede cai, o banco trava ou o mesmo pedido chega duas vezes.",
    "Vim da infraestrutura e da sustentação. Hoje, no Mercado Eletrônico, investigo erros de uma plataforma B2B de compras pelos logs e pelo SQL Server, reproduzo cenários, testo APIs e escrevo as automações que tiram o trabalho manual do time. Ver de perto por que um sistema falha em produção foi o que me puxou para o desenvolvimento back-end com Java, Spring Boot e Node.js.",
    "Este portal é o meu caderno de estudos aberto: o que eu já domino, o que estou aprendendo agora e os problemas que sei resolver."
  ],

  trajetoria: [
    { ano: "2022", titulo: "Estágio em TI", texto: "Carla Amorim Joias: suporte, infraestrutura das lojas, apoio ao ERP e padronização de processos." },
    { ano: "2024", titulo: "Infra e servidores", texto: "Windows Server, Active Directory, backups na AWS e Office 365. Em agosto, entrada no Mercado Eletrônico como técnico de suporte." },
    { ano: "2025", titulo: "Sustentação de plataforma B2B", texto: "Analista de Suporte Técnico Jr: logs, SQL Server, APIs REST, feature flags e automações. Prêmio Top ME." },
    { ano: "2026", titulo: "Rumo ao back-end", texto: "Carreiras Back-End Java e Node.js na Alura, o GesToque e laboratórios de confiabilidade.", atual: true }
  ],

  // Seus feitos (vindos do LinkedIn).
  feitos: [
    { titulo: "Prêmio Top ME", texto: "Quando os dois membros mais experientes do time saíram, mantive a operação estável, treinei os novos integrantes e segui tratando incidentes e correções dos clientes." },
    { titulo: "GesToque: estoque com previsão de compras", texto: "Node.js, PostgreSQL (Supabase) e Vercel. Previsão por dia da semana, feriados e sazonalidade, login com 2FA, importação de Excel/CSV validada e app Android com build no GitHub Actions.", capa: "assets/projetos/gestoque-capa.webp", capaAlt: "Capa do GesToque: tela de estoque no celular, previsão de compra e login com 2FA.", link: "https://daviribrito.github.io/GesToque" },
    { titulo: "Automações na sustentação", texto: "Relatório diário que detecta processos parados de um cliente estratégico, extensão de navegador que alerta tickets na fila e script de carga que acabou com a edição manual de planilhas." }
  ],

  valores: [
    { titulo: "Clareza primeiro", texto: "Código e decisões que outra pessoa entende sem mim por perto." },
    { titulo: "Aprender em público", texto: "Documentar o que estudo ajuda a fixar e a ensinar." },
    { titulo: "Responsabilidade pelo que sobe", texto: "Se está em produção, é meu também, inclusive às 3 da manhã." }
  ],

  foraDoCodigo: ["Leitura técnica", "Café", "Música", "Jogos de estratégia", "Escrever sobre o que aprendo"],

  stack: ["Java", "Spring Boot", "Node.js", "TypeScript", "SQL Server", "PostgreSQL", "APIs REST", "Postman", "Jira"],

  procuro: "Um time que leve confiabilidade a sério, onde eu possa crescer em sistemas distribuídos e contribuir com APIs e serviços robustos."
};
