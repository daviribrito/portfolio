/*
 * Roadmap de estudos.
 * status: "dominado" | "estudando" | "proximo"
 * demo: id do laboratório animado (ver js/demos.js) ou null
 * Progresso e anotações vieram da versão anterior; revise.
 */
window.ROADMAP = {
  fases: [
    { id: "fundamentos", nome: "Fundamentos de backend", texto: "APIs, banco relacional, containers e cache." },
    { id: "confiabilidade", nome: "Confiabilidade", texto: "Fazer o sistema sobreviver a falhas previsíveis." },
    { id: "distribuidos", nome: "Sistemas distribuídos", texto: "Consistência entre serviços que não compartilham memória." }
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
      anotacoes: [],
      armadilhas: [],
      codigo: null
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
    }
  ],

  aprendidoRecentemente: [
    { data: "2026-10", texto: "Reserva atômica de chaves com SET NX + TTL", topico: "idempotencia" },
    { data: "2026-10", texto: "Transição para meio-aberto no circuit breaker", topico: "circuit-breaker" },
    { data: "2026-09", texto: "Full jitter contra equal jitter em backoff", topico: "retry" },
    { data: "2026-08", texto: "Paginação por cursor no PostgreSQL", topico: "paginacao" }
  ]
};
