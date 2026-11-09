# Portfólio, Davi Brito

Site estático (HTML, CSS e JS puros, sem build) com quatro páginas:

| Página | Arquivo | Conteúdo vem de |
|---|---|---|
| Início | `index.html` | simulação de idempotência + atalhos |
| Sobre | `sobre.html` | `data/sobre.js` |
| Roadmap | `roadmap.html` | `data/roadmap.js` + `js/demos.js` |
| Commits | `commits.html` | API pública do GitHub + `data/config.js` |

## Editar o conteúdo

- **Quais projetos aparecem em Commits:** edite `github.repositorios` em `data/config.js`. Só os repositórios dessa lista aparecem, na ordem da lista.
- **Sobre, trajetória e feitos:** `data/sobre.js`. Os feitos marcados com `exemplo: true` aparecem com a etiqueta "Exemplo" no site. Troque pelo texto real e apague o `exemplo: true`.
- **Roadmap:** `data/roadmap.js`. Cada tópico tem `status` (`dominado`, `estudando`, `proximo`), `progresso` (0–100), anotações, armadilhas e código. O campo `demo` liga o tópico a um laboratório animado: `retry`, `idempotencia`, `circuit`, `ratelimit` ou `outbox`.
- **Links de contato:** `links` em `data/config.js`. Falta completar a URL do LinkedIn.

## Rodar localmente

Sem Node nem Python, usando o PowerShell:

```bash
pwsh -File tools/serve.ps1
```

Depois abra http://localhost:3200.

## Publicar no GitHub Pages

1. Crie um repositório (ou use o `portfolio`) e envie todos os arquivos.
2. Em Settings → Pages, escolha a branch `main` e a pasta `/ (root)`.

## Sobre a aba Commits

Ela usa a API pública do GitHub sem token: são 60 consultas por hora para cada visitante, e as respostas ficam 15 minutos em cache no navegador. Se o limite estourar, a página mostra o horário em que o GitHub libera novas consultas e um botão para tentar de novo.
