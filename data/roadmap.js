/*
 * Roadmap de estudos.
 * status: "dominado" | "estudando" | "proximo"
 * demo: id do laboratório animado (ver js/demos.js) ou null
 * linguagem (opcional): linguagem do campo codigo, para o tech-notes. Padrão: "js".
 *
 * Para criar uma matéria nova, adicione um objeto em `topicos` com um `id` único
 * (ex.: "gestao-memoria-java"). Ela ganha automaticamente:
 *   - uma página no portfólio: topico.html?id=gestao-memoria-java
 *   - uma nota no tech-notes: roadmap/<fase>/gestao-memoria-java.md
 * Para criar uma área nova, adicione um objeto em `fases`.
 */
window.ROADMAP = {
  fases: [
    { id: "fundamentos", nome: "Fundamentos de backend", texto: "APIs, banco relacional, containers e cache." },
    { id: "confiabilidade", nome: "Confiabilidade", texto: "Fazer o sistema sobreviver a falhas previsíveis." },
    { id: "distribuidos", nome: "Sistemas distribuídos", texto: "Consistência entre serviços que não compartilham memória." },
    { id: "testes", nome: "Testes e qualidade", texto: "Provar que o código faz o que deve, antes e depois de cada mudança." },
    { id: "devops", nome: "DevOps e CI/CD", texto: "Levar o código do commit à produção de forma automática, repetível e segura." }
  ],

  topicos: [
    {
      id: "retry",
      fase: "confiabilidade",
      nome: "Retry com backoff",
      status: "dominado",
      progresso: 100,
      demo: "retry",
      resumo: "Tentar de novo sem derrubar quem já está caindo.",
      anotacoes: [
        "Retry imediato e em intervalo fixo sincroniza os clientes: todos voltam ao mesmo tempo e o servidor recebe um pico maior que o original.",
        "Backoff exponencial espaça as tentativas; o jitter espalha os clientes dentro de cada janela.",
        "Full jitter (sleep = random(0, base * 2^n)) costuma distribuir melhor a carga que equal jitter."
      ],
      armadilhas: [
        "Só fazer retry de operações idempotentes, ou de erros que garantem que nada foi executado.",
        "Limitar o total de tentativas e respeitar o Retry-After quando o servidor mandar."
      ],
      codigo: `const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function comRetry(fn, { tentativas = 5, base = 100, teto = 5000 } = {}) {
  for (let n = 0; ; n++) {
    try {
      return await fn();
    } catch (erro) {
      if (n + 1 >= tentativas || !erro.retentavel) throw erro;
      const janela = Math.min(teto, base * 2 ** n);
      await sleep(Math.random() * janela); // full jitter
    }
  }
}`
    },
    {
      id: "idempotencia",
      fase: "confiabilidade",
      nome: "Idempotência",
      status: "estudando",
      progresso: 80,
      demo: "idempotencia",
      resumo: "Repetir uma requisição sem repetir o efeito.",
      anotacoes: [
        "O cliente gera uma chave única por intenção (não por tentativa) e a envia no header Idempotency-Key.",
        "O servidor reserva a chave antes de processar. Se ela já existe, devolve a resposta guardada em vez de executar de novo.",
        "Reserva atômica no Redis com SET chave valor NX PX ttl: só uma requisição ganha a corrida."
      ],
      armadilhas: [
        "Duas requisições simultâneas com a mesma chave: sem reserva atômica, as duas processam.",
        "Mesma chave com corpo diferente deve ser rejeitada (422), não tratada como repetição.",
        "TTL curto demais faz um retry tardio virar uma cobrança nova."
      ],
      codigo: `async function pagar(req, res) {
  const chave = req.get("Idempotency-Key");
  const reservou = await redis.set(\`idem:\${chave}\`, "em-andamento", { NX: true, PX: 86_400_000 });

  if (!reservou) {
    const salvo = await redis.get(\`idem:\${chave}\`);
    if (salvo === "em-andamento") return res.status(409).end();
    return res.status(200).json(JSON.parse(salvo)); // mesma resposta, nenhum efeito novo
  }

  const recibo = await cobrar(req.body);
  await redis.set(\`idem:\${chave}\`, JSON.stringify(recibo), { PX: 86_400_000 });
  res.status(201).json(recibo);
}`
    },
    {
      id: "circuit-breaker",
      fase: "confiabilidade",
      nome: "Circuit breaker",
      status: "estudando",
      progresso: 60,
      demo: "circuit",
      resumo: "Parar de chamar um serviço que está falhando e dar tempo para ele voltar.",
      anotacoes: [
        "Fechado: as chamadas passam e as falhas são contadas.",
        "Aberto: depois de N falhas, as chamadas falham na hora, sem esperar o timeout.",
        "Meio-aberto: depois de um tempo, deixa passar uma chamada de teste. Se der certo, fecha; se falhar, abre de novo."
      ],
      armadilhas: [
        "Contar falhas por janela de tempo, não só em sequência, para não abrir com um único pico.",
        "No meio-aberto, limitar as chamadas de teste; deixar todas passarem derruba o serviço que estava se recuperando."
      ],
      codigo: `class Disjuntor {
  estado = "fechado"; falhas = 0; abertoEm = 0;

  async chamar(fn) {
    if (this.estado === "aberto") {
      if (Date.now() - this.abertoEm < 3000) throw new Error("circuito aberto");
      this.estado = "meio-aberto";
    }
    try {
      const r = await fn();
      this.estado = "fechado"; this.falhas = 0;
      return r;
    } catch (e) {
      if (this.estado === "meio-aberto" || ++this.falhas >= 3) {
        this.estado = "aberto"; this.abertoEm = Date.now();
      }
      throw e;
    }
  }
}`
    },
    {
      id: "rate-limiting",
      fase: "confiabilidade",
      nome: "Rate limiting",
      status: "estudando",
      progresso: 45,
      demo: "ratelimit",
      resumo: "Aceitar só o volume que o sistema aguenta, de forma justa.",
      anotacoes: [
        "Token bucket: o balde enche a uma taxa fixa; cada requisição gasta uma ficha. Permite rajadas curtas até a capacidade do balde.",
        "Sem ficha, a resposta é 429 com Retry-After, e o cliente faz backoff.",
        "Em vários servidores, o balde precisa ficar num lugar compartilhado (Redis) e a operação precisa ser atômica."
      ],
      armadilhas: [
        "Limitar por IP pune quem está atrás do mesmo NAT; prefira limitar por chave de API ou por usuário.",
        "Janela fixa permite o dobro do limite na virada da janela."
      ],
      codigo: `function criarBalde({ capacidade, porSegundo }) {
  let fichas = capacidade, ultimo = Date.now();
  return function permitir() {
    const agora = Date.now();
    fichas = Math.min(capacidade, fichas + ((agora - ultimo) / 1000) * porSegundo);
    ultimo = agora;
    if (fichas < 1) return false; // 429
    fichas -= 1;
    return true;
  };
}`
    },
    {
      id: "outbox",
      fase: "distribuidos",
      nome: "Transactional outbox",
      status: "estudando",
      progresso: 30,
      demo: "outbox",
      resumo: "Gravar no banco e publicar o evento sem perder nenhum dos dois.",
      anotacoes: [
        "Escrita dupla (salvar no banco e depois publicar na fila) quebra se o processo cair entre os dois passos.",
        "Com outbox, o evento é gravado numa tabela na mesma transação do pedido. Ou os dois existem, ou nenhum.",
        "Um relay lê a tabela outbox e publica. A entrega é pelo menos uma vez, então o consumidor precisa ser idempotente."
      ],
      armadilhas: [
        "Vários relays lendo a mesma tabela: use SELECT ... FOR UPDATE SKIP LOCKED.",
        "A tabela outbox cresce para sempre se ninguém limpar as linhas publicadas."
      ],
      codigo: `await db.tx(async (t) => {
  const pedido = await t.one(
    "INSERT INTO pedidos (cliente_id, total) VALUES ($1, $2) RETURNING *", [cliente, total]);
  await t.none(
    "INSERT INTO outbox (tipo, payload) VALUES ('pedido.criado', $1)", [pedido]);
}); // um commit só: pedido e evento juntos

// relay, em outro processo
const linhas = await db.any(
  "SELECT * FROM outbox WHERE publicado_em IS NULL ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED");`
    },
    {
      id: "paginacao",
      fase: "fundamentos",
      nome: "Paginação por cursor",
      status: "dominado",
      progresso: 100,
      demo: null,
      resumo: "Paginar tabelas grandes sem OFFSET.",
      anotacoes: [
        "OFFSET 100000 obriga o banco a ler e descartar 100 mil linhas.",
        "Com cursor (WHERE (criado_em, id) < ($1, $2) ORDER BY criado_em DESC, id DESC), o índice vai direto ao ponto."
      ],
      armadilhas: ["O cursor precisa de uma ordenação única: inclua o id como desempate."],
      codigo: null
    },
    {
      id: "fundamentos-api",
      fase: "fundamentos",
      nome: "APIs REST com Node.js e PostgreSQL",
      status: "dominado",
      progresso: 100,
      demo: null,
      resumo: "A base: rotas, validação, transações e migrações.",
      anotacoes: [
        "Validar a entrada na borda da rota e responder 400 com o campo que falhou, antes de tocar no banco.",
        "Operações que mexem em mais de uma tabela vão numa transação: BEGIN, as queries no mesmo client e COMMIT, ou ROLLBACK no erro.",
        "Sempre consultas parametrizadas ($1, $2): nunca concatenar texto do usuário no SQL.",
        "O schema muda só por migrações versionadas no repositório, aplicadas na mesma ordem em todo ambiente."
      ],
      armadilhas: [
        "Usar pool.query() dentro de uma transação: cada chamada pode pegar outra conexão do pool, e o BEGIN fica numa conexão diferente do resto.",
        "Esquecer o client.release() no finally: o pool esgota e a API para de responder sem erro aparente."
      ],
      codigo: `async function criarPedido(req, res) {
  const { clienteId, itens } = req.body;
  if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "clienteId e itens são obrigatórios" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "INSERT INTO pedidos (cliente_id) VALUES ($1) RETURNING id",
      [clienteId]
    );
    for (const item of itens) {
      await client.query(
        "INSERT INTO itens_pedido (pedido_id, produto_id, qtd) VALUES ($1, $2, $3)",
        [rows[0].id, item.produtoId, item.qtd]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ id: rows[0].id });
  } catch (erro) {
    await client.query("ROLLBACK");
    throw erro;
  } finally {
    client.release();
  }
}`
    },
    {
      id: "sagas",
      fase: "distribuidos",
      nome: "Sagas e compensação",
      status: "proximo",
      progresso: 0,
      demo: null,
      resumo: "Transações longas entre serviços, desfeitas passo a passo quando algo falha.",
      anotacoes: [],
      armadilhas: [],
      codigo: null
    },
    {
      id: "consistencia",
      fase: "distribuidos",
      nome: "Consistência eventual",
      status: "proximo",
      progresso: 0,
      demo: null,
      resumo: "Projetar telas e regras para dados que ainda não chegaram em todo lugar.",
      anotacoes: [],
      armadilhas: [],
      codigo: null
    },

    /* ---------------------------------------------------- Testes e qualidade */
    {
      id: "piramide-testes",
      fase: "testes",
      nome: "Pirâmide de testes",
      status: "estudando",
      progresso: 60,
      demo: null,
      resumo: "Muitos testes rápidos na base, poucos testes lentos no topo.",
      anotacoes: [
        "Unitários: testam uma função ou regra isolada, rodam em milissegundos e formam a maior parte da suíte.",
        "Integração: testam a conversa com o que é real (banco, fila, outra API). Menos numerosos, pegam erro de SQL, de migração e de configuração.",
        "Ponta a ponta (E2E): sobem o sistema inteiro e simulam o usuário. Poucos, só para os fluxos que não podem quebrar (login, checkout).",
        "Cada teste segue Arrange, Act, Assert: prepara os dados, executa uma ação e confere um resultado."
      ],
      armadilhas: [
        "Pirâmide invertida (muitos E2E, poucos unitários): a suíte fica lenta, frágil e ninguém confia quando ela falha.",
        "Testar a implementação em vez do comportamento: qualquer refatoração quebra o teste sem que nada tenha quebrado de verdade.",
        "Cobertura alta não é qualidade: 100% de linhas executadas sem nenhum assert útil não prova nada."
      ],
      codigo: `// regra de negócio pura: fácil de testar
function aplicarCupom(total, cupom, agora = new Date()) {
  if (cupom.expiraEm < agora) throw new Error("cupom expirado");
  return Math.max(0, total - cupom.valor);
}

test("aplica o desconto do cupom", () => {
  const cupom = { valor: 20, expiraEm: new Date("2099-01-01") };   // Arrange
  const total = aplicarCupom(100, cupom);                           // Act
  expect(total).toBe(80);                                           // Assert
});

test("rejeita cupom expirado", () => {
  const cupom = { valor: 20, expiraEm: new Date("2020-01-01") };
  expect(() => aplicarCupom(100, cupom)).toThrow("cupom expirado");
});`
    },
    {
      id: "testes-integracao",
      fase: "testes",
      nome: "Testes de integração com banco",
      status: "estudando",
      progresso: 40,
      demo: null,
      resumo: "Testar a API contra um PostgreSQL de verdade, sem sujar os dados entre um teste e outro.",
      anotacoes: [
        "Banco real em container (Docker ou o service do GitHub Actions), com as mesmas migrações de produção.",
        "Cada teste roda dentro de uma transação que é desfeita no final: o banco volta limpo e os testes não dependem da ordem.",
        "Supertest chama as rotas da API sem subir servidor na rede e confere status, corpo e o que foi gravado.",
        "Dados de teste criados por funções (fábricas) dentro do próprio teste, não por um dump compartilhado."
      ],
      armadilhas: [
        "Mockar o banco num teste de integração: o teste passa e o SQL quebrado só aparece em produção.",
        "Testes que dependem da ordem ou de dados deixados por outro teste: passam sozinhos e falham na suíte.",
        "Usar SQLite no teste e PostgreSQL em produção: tipos, locks e funções se comportam diferente."
      ],
      codigo: `const request = require("supertest");
const { app, pool } = require("../src/app");

let client;
beforeEach(async () => {
  client = await pool.connect();
  await client.query("BEGIN");          // tudo que o teste gravar...
  app.locals.db = client;
});
afterEach(async () => {
  await client.query("ROLLBACK");       // ...é desfeito aqui
  client.release();
});

test("POST /pedidos grava o pedido e os itens", async () => {
  const res = await request(app)
    .post("/pedidos")
    .send({ clienteId: 1, itens: [{ produtoId: 7, qtd: 2 }] });

  expect(res.status).toBe(201);
  const { rows } = await client.query("SELECT qtd FROM itens_pedido WHERE pedido_id = $1", [res.body.id]);
  expect(rows).toEqual([{ qtd: 2 }]);
});`
    },
    {
      id: "fluxo-testes",
      fase: "testes",
      nome: "Fluxo de testes: do TDD ao merge",
      status: "estudando",
      progresso: 35,
      demo: null,
      resumo: "Em que momento cada teste roda, da máquina do dev até o deploy.",
      anotacoes: [
        "TDD em três passos: escreve um teste que falha (vermelho), faz o mínimo para passar (verde) e melhora o código com o teste protegendo (refatorar).",
        "Na máquina: testes unitários em modo watch enquanto codifica; hook de pre-commit roda lint e os testes rápidos.",
        "No pull request: o CI roda a suíte completa (unitários + integração). PR só pode ser mergeado com o pipeline verde.",
        "Depois do merge: build, deploy em staging, testes E2E de fumaça e só então produção.",
        "Bug encontrado vira primeiro um teste que reproduz o bug; a correção vem depois e o teste impede que ele volte."
      ],
      armadilhas: [
        "Teste instável (flaky) ignorado com retry automático: o time aprende a não confiar no vermelho.",
        "Suíte lenta demais para rodar antes do push: o dev pula e o CI vira o primeiro lugar onde o erro aparece.",
        "Proteção de branch desligada: alguém mergeia com o pipeline vermelho \"só desta vez\"."
      ],
      codigo: `// 1. Vermelho: o teste descreve o bug do cupom aplicado duas vezes
test("aplica o cupom uma vez só, mesmo se a requisição repetir", async () => {
  const pedido = await criarPedido({ total: 100 });
  await aplicarCupom(pedido.id, "DEZ");
  await aplicarCupom(pedido.id, "DEZ");               // repetição
  expect((await buscarPedido(pedido.id)).total).toBe(90);
});

// 2. Verde: a correção mínima
async function aplicarCupom(pedidoId, codigo) {
  const r = await db.query(
    "UPDATE pedidos SET total = total - 10, cupom = $2 WHERE id = $1 AND cupom IS NULL",
    [pedidoId, codigo]
  );
  return r.rowCount === 1;                             // false se já tinha cupom
}

// 3. Refatorar: com o teste verde, dá para mudar o código com segurança`
    },
    {
      id: "mocks-dubles",
      fase: "testes",
      nome: "Mocks, stubs e dublês",
      status: "proximo",
      progresso: 0,
      demo: null,
      resumo: "Quando substituir uma dependência no teste, e quando isso esconde o problema.",
      anotacoes: [],
      armadilhas: [],
      codigo: null
    },

    /* -------------------------------------------------------- DevOps e CI/CD */
    {
      id: "ci-pipeline",
      fase: "devops",
      nome: "Pipeline de CI/CD",
      status: "estudando",
      progresso: 50,
      demo: "pipeline",
      linguagem: "yaml",
      resumo: "Cada push passa por lint, testes e build antes de chegar em produção.",
      anotacoes: [
        "CI (integração contínua): a cada push ou pull request o código é verificado automaticamente. O dev descobre o erro em minutos, não no deploy.",
        "CD (entrega/implantação contínua): o que passou no CI vira um artefato que segue sozinho para staging e produção.",
        "Falhar rápido: as etapas mais baratas vêm primeiro (lint, unitários); build e deploy só rodam se tudo antes passou.",
        "O pipeline é código versionado junto com o projeto (.github/workflows), revisado em PR como qualquer outro arquivo.",
        "Construir o artefato uma vez e promover a mesma imagem entre ambientes; não recompilar para produção."
      ],
      armadilhas: [
        "Segredos impressos no log ou expostos para PRs de forks: use os secrets do repositório e nunca dê echo neles.",
        "Versões diferentes entre a máquina e o CI (\"na minha máquina funciona\"): fixe a versão do Node e use npm ci com o lockfile.",
        "Pipeline lento sem cache de dependências: o time passa a evitar o CI."
      ],
      codigo: `# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  testes:
    runs-on: ubuntu-latest
    services:
      postgres:                       # banco real para os testes de integração
        image: postgres:16
        env:
          POSTGRES_PASSWORD: teste
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint             # falha rápido: o mais barato primeiro
      - run: npm test
        env:
          DATABASE_URL: postgres://postgres:teste@localhost:5432/postgres

  build:
    needs: testes                     # só roda se os testes passarem
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:\${{ github.sha }} .`
    },
    {
      id: "docker",
      fase: "devops",
      nome: "Containers com Docker",
      status: "estudando",
      progresso: 45,
      demo: null,
      linguagem: "dockerfile",
      resumo: "Empacotar a aplicação com tudo o que ela precisa para rodar igual em qualquer lugar.",
      anotacoes: [
        "Imagem é a receita congelada (código + dependências + runtime); container é a imagem rodando.",
        "Multi-stage build: uma etapa instala e compila, a imagem final leva só o necessário e fica bem menor.",
        "A ordem das camadas importa: copiar package*.json e instalar antes de copiar o código aproveita o cache a cada build.",
        "Docker Compose sobe a API, o PostgreSQL e o Redis juntos para desenvolver e testar localmente."
      ],
      armadilhas: [
        "Usar a tag latest: o deploy de amanhã pode pegar outra imagem. Marque a imagem com o SHA do commit.",
        "Rodar como root dentro do container e esquecer o .dockerignore (node_modules, .env e .git vão para a imagem).",
        "Colocar segredos no Dockerfile ou na imagem: qualquer um que baixar a imagem consegue ler."
      ],
      codigo: `# etapa 1: instala dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# etapa 2: imagem final, só com o necessário
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]`
    },
    {
      id: "deploy-estrategias",
      fase: "devops",
      nome: "Estratégias de deploy e rollback",
      status: "proximo",
      progresso: 0,
      demo: null,
      resumo: "Blue-green, canary e como voltar atrás em segundos quando a versão nova falha.",
      anotacoes: [],
      armadilhas: [],
      codigo: null
    },
    {
      id: "observabilidade",
      fase: "devops",
      nome: "Observabilidade: logs, métricas e traces",
      status: "proximo",
      progresso: 0,
      demo: null,
      resumo: "Saber o que está acontecendo em produção sem precisar entrar no servidor.",
      anotacoes: [],
      armadilhas: [],
      codigo: null
    }
  ],

  aprendidoRecentemente: [
    { data: "2026-10", texto: "Reserva atômica de chaves com SET NX + TTL", topico: "idempotencia" },
    { data: "2026-10", texto: "Transição para meio-aberto no circuit breaker", topico: "circuit-breaker" },
    { data: "2026-09", texto: "Full jitter contra equal jitter em backoff", topico: "retry" },
    { data: "2026-08", texto: "Paginação por cursor no PostgreSQL", topico: "paginacao" }
  ]
};
