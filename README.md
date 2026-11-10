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
| Início | `index.html` | simulação de idempotência + atalhos |
| Sobre | `sobre.html` | `data/sobre.js` |
| Roadmap | `roadmap.html` | `data/roadmap.js`: a árvore; cada matéria abre em modal (desktop e tablet) ou direto na página (celular) |
| Matéria | `topico.html?id=<id>` | `data/roadmap.js` + `js/demos.js`: uma página por tópico |
| Commits | `commits.html` | API pública do GitHub + `data/config.js` |

## Editar o conteúdo

- **Quais projetos aparecem em Commits:** edite `github.repositorios` em `data/config.js`. Só os repositórios dessa lista aparecem, na ordem da lista.
- **Sobre, trajetória e feitos:** `data/sobre.js`. Os feitos marcados com `exemplo: true` aparecem com a etiqueta "Exemplo" no site. Troque pelo texto real e apague o `exemplo: true`.
- **Roadmap:** `data/roadmap.js`. Cada tópico tem `status` (`dominado`, `estudando`, `proximo`), `progresso` (0–100), anotações, armadilhas e código. O campo `demo` liga o tópico a um laboratório animado: `retry`, `idempotencia`, `circuit`, `ratelimit` ou `outbox`.
- **Links de contato:** `links` em `data/config.js` (GitHub, LinkedIn e e-mail).

## Criar uma matéria nova (e a nota no tech-notes)

Adicione um objeto em `topicos` no `data/roadmap.js`, por exemplo:

```js
{
  id: "gestao-memoria-java",        // único: minúsculas, números e hífen
  fase: "fundamentos",              // id de uma das fases
  nome: "Gestão de memória em Java",
  status: "estudando",              // dominado | estudando | proximo
  progresso: 30,
  demo: null,
  linguagem: "java",                // linguagem do campo codigo (padrão: js)
  resumo: "Heap, stack, GC e vazamentos.",
  anotacoes: ["..."],
  armadilhas: ["..."],
  codigo: `...`
}
```

Ao enviar para a `main`:

1. A página nasce sozinha em `topico.html?id=gestao-memoria-java` e aparece na árvore do roadmap.
2. O repositório [tech-notes](https://github.com/daviribrito/tech-notes) gera a nota `roadmap/<fase>/gestao-memoria-java.md`, com link para a página. A página do portfólio também aponta para a nota (botão "Nota no tech-notes").

A sincronização é feita pela Action **Sincronizar com o portfólio** do tech-notes. Ela roda a cada hora e também pode ser disparada à mão em Actions → Run workflow. Se você remover um tópico, a nota gerada dele também é removida. Notas escritas à mão no tech-notes nunca são tocadas.

### Sincronizar na hora (opcional)

Por padrão a nota aparece em até 1 hora. Para gerar no mesmo minuto do push:

1. Crie um token *fine-grained* em GitHub → Settings → Developer settings → Personal access tokens, só com o repositório `tech-notes` e a permissão **Contents: Read and write**.
2. No repositório `portfolio`, vá em Settings → Secrets and variables → Actions → New repository secret, com o nome `TECH_NOTES_TOKEN` e o token como valor.

A Action **Avisar o tech-notes** (`.github/workflows/avisar-tech-notes.yml`) passa a disparar a sincronização sempre que `data/roadmap.js` mudar.
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
