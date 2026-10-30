# Portfólio · Davi Brito

Portal de portfólio com o que estou estudando, o que sei fazer e os problemas que sei resolver — cada conceito com uma demonstração interativa (idempotência, retry com backoff, circuit breaker e rate limiting).

## Como rodar

É um único arquivo estático, sem build nem dependências:

- abra `index.html` no navegador, ou
- publique com GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).

## Como editar

Todo o conteúdo vem do objeto `DATA` no início do script em `index.html`:

| Chave | Aba |
| --- | --- |
| `profile`, `home`, `timeline` | Início |
| `about` | Sobre mim |
| `studies` | Estudando |
| `skills`, `principles` | Sei fazer |
| `cases` | Resolvo |

Nos títulos, `*trecho*` aplica o tom suave e `\n` quebra a linha.
