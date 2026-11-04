# Portfólio · Davi Brito

Portal de portfólio organizado como um roadmap: da raiz até o tópico que estou estudando agora. Cada tópico abre com anotações, um teste visual interativo (idempotência, retry com backoff, circuit breaker, rate limiting) e mini projetos.

## Como rodar

É um único arquivo estático, sem build nem dependências:

- abra `index.html` no navegador, ou
- publique com GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).

## Como editar

Todo o conteúdo vem do objeto `DATA` no início do script em `index.html`:

| Chave | Aba |
| --- | --- |
| `profile`, `home`, `timeline` | Início |
| `roadmap` | Roadmap: ramos, tópicos, anotações e mini projetos |
| `about` | Sobre mim |
| `skills`, `principles` | Sei fazer |
| `cases` | Resolvo |

Nos títulos, `*trecho*` aplica o tom suave e `\n` quebra a linha.
