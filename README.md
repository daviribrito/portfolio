# Portfólio, Davi Brito

🔗 **Site no ar:** [daviribrito.github.io/portfolio](https://daviribrito.github.io/portfolio/)

| Página | Link |
|---|---|
| Início | [daviribrito.github.io/portfolio](https://daviribrito.github.io/portfolio/) |
| Roadmap | [daviribrito.github.io/portfolio/roadmap.html](https://daviribrito.github.io/portfolio/roadmap.html) |
| Sobre mim | [daviribrito.github.io/portfolio/sobre.html](https://daviribrito.github.io/portfolio/sobre.html) |
| Commits | [daviribrito.github.io/portfolio/commits.html](https://daviribrito.github.io/portfolio/commits.html) |

Site estático (HTML, CSS e JS puros, sem build) com estas páginas:

| Página | Arquivo | Conteúdo vem de |
|---|---|---|
| Início | `index.html` | simulação de idempotência + resumo do roadmap |
| Sobre | `sobre.html` | `data/sobre.js` |
| Roadmap | `roadmap.html` | visão geral: progresso, o que estudar agora e as 11 áreas |
| Área | `area.html?id=<area>` | objetivo, pré-requisitos, critérios e tópicos por nível (N1 a N4) |
| Tópico | `topico.html?id=<id>` | o que aprender, como aplicar, pré-requisitos e as suas anotações; abre em modal no desktop e tablet |
| Commits | `commits.html` | API pública do GitHub + `data/config.js` |

## Editar o conteúdo

- **Quais projetos aparecem em Commits:** edite `github.repositorios` em `data/config.js`. Só os repositórios dessa lista aparecem, na ordem da lista.
- **Sobre, trajetória e feitos:** `data/sobre.js`.
- **Links de contato:** `links` em `data/config.js` (GitHub, LinkedIn e e-mail).

## Roadmap de Backend Engineering

O roadmap fica em dois arquivos:

| Arquivo | O que guarda |
|---|---|
| `data/roadmap.js` | A **estrutura**: 11 áreas e os tópicos de cada uma, com nível (N1 a N4), importância (essencial, importante, complementar), pré-requisitos, o que aprender e como aplicar. |
| `data/estudos.js` | O **seu progresso**: o status de cada tópico, as anotações e o "aprendido recentemente". Começa vazio. |

### Registrar um estudo

Em `data/estudos.js`:

```js
status: {
  "be-idempotencia": "pratica"      // nao-iniciado | estudo | pratica | dominado | revisar
},
conteudo: {
  "be-idempotencia": {
    anotacoes: ["..."],
    armadilhas: ["..."],
    codigo: `...`,
    linguagem: "java",
    demo: "idempotencia",           // laboratório opcional
    links: [{ titulo: "Artigo", url: "https://..." }]
  }
},
aprendidoRecentemente: [
  { data: "2026-11", texto: "Chaves de idempotência com SET NX", topico: "be-idempotencia" }
]
```

O progresso de cada área é a fração de tópicos dominados (ou marcados para revisar). Um tópico só deve virar `dominado` quando foi entendido **e** aplicado na prática.

### Criar um tópico novo

Adicione um objeto em `topicos` no `data/roadmap.js` com `id` único (minúsculas, números e hífen), `area`, `grupo`, `nome`, `nivel`, `importancia`, `pre`, `descricao`, `aprender` e `aplicar`. O cabeçalho do arquivo tem o modelo.

### Ligação com o tech-notes

Cada tópico vira uma nota no repositório [tech-notes](https://github.com/daviribrito/tech-notes) em `roadmap/<area>/<id>.md`, cada área ganha um `README.md` com os tópicos por nível, e `roadmap/README.md` mostra o progresso geral. A página do tópico aponta para a nota (botão "Nota no tech-notes") e a nota aponta para a página.

A sincronização é feita pela Action **Sincronizar com o portfólio** do tech-notes. Ela roda a cada hora e também pode ser disparada à mão em Actions → Run workflow. Se você remover um tópico, a nota gerada dele também é removida. Notas escritas à mão no tech-notes nunca são tocadas.
### Sincronizar na hora (opcional)

Por padrão a nota aparece em até 1 hora. Para gerar no mesmo minuto do push:

1. Crie um token *fine-grained* em GitHub → Settings → Developer settings → Personal access tokens, só com o repositório `tech-notes` e a permissão **Contents: Read and write**.
2. No repositório `portfolio`, vá em Settings → Secrets and variables → Actions → New repository secret, com o nome `TECH_NOTES_TOKEN` e o token como valor.

A Action **Avisar o tech-notes** (`.github/workflows/avisar-tech-notes.yml`) passa a disparar a sincronização sempre que `data/roadmap.js` ou `data/estudos.js` mudarem.

## Rodar localmente

Sem Node nem Python, usando o PowerShell:

```bash
pwsh -File tools/serve.ps1
```

Depois abra http://localhost:3200.

## Publicar

O GitHub Pages publica a branch `main` (pasta raiz). Cada push em `main` atualiza o site em um ou dois minutos.

## Visual

As regras de design (cores, tipografia, componentes, temas claro e escuro) estão em [`DESIGN.md`](DESIGN.md). O contexto do produto está em [`PRODUCT.md`](PRODUCT.md).

## Arquivos de apoio

- `tools/serve.ps1`: servidor local em PowerShell, sem dependências.
- `tools/capa-portfolio.html`: página usada para gerar a imagem de capa (`assets/projetos/portfolio-capa.png`) que aparece ao compartilhar o link.

## Sobre a aba Commits

Ela usa a API pública do GitHub sem token: são 60 consultas por hora para cada visitante, e as respostas ficam 15 minutos em cache no navegador. Se o limite estourar, a página mostra o horário em que o GitHub libera novas consultas e um botão para tentar de novo.
