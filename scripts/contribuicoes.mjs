// Baixa o calendário público de contribuições do GitHub e grava data/contribuicoes.json.
// Roda na Action "Atualizar contribuições" (uma vez por dia). Sem token: a página é pública.
//
// Uso: node scripts/contribuicoes.mjs [usuario]

import { readFile, writeFile } from "node:fs/promises";

const usuario = process.argv[2] || process.env.GITHUB_USER || "daviribrito";
const ARQUIVO = "data/contribuicoes.json";

const res = await fetch(`https://github.com/users/${usuario}/contributions`, {
  headers: { "User-Agent": "portfolio-contribuicoes", Accept: "text/html" }
});
if (!res.ok) throw new Error(`GitHub respondeu HTTP ${res.status}`);
const html = await res.text();

const attr = (tag, nome) => (tag.match(new RegExp(`\\s${nome}="([^"]*)"`)) || [])[1];

// Cada dia é um <td data-date="..." id="..."> e a contagem exata vem no <tool-tip for="id">.
const dias = new Map();
for (const [tag] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
  const id = attr(tag, "id");
  const d = attr(tag, "data-date");
  if (id && d) dias.set(id, { d, c: 0, nivel: Number(attr(tag, "data-level") || 0) });
}
for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
  const dia = dias.get(m[1]);
  if (!dia) continue;
  const n = m[2].trim().match(/^([\d,]+)\s+contributions?/);
  dia.c = n ? Number(n[1].replace(/,/g, "")) : 0;
}
if (dias.size < 300) throw new Error(`Calendário inesperado: só ${dias.size} dias encontrados (o HTML do GitHub mudou?)`);

const lista = [...dias.values()].sort((a, b) => a.d.localeCompare(b.d)).map(({ d, c }) => ({ d, c }));
const total = lista.reduce((s, x) => s + x.c, 0);

// Só regrava se os dados mudaram (evita commits diários vazios).
let antes = null;
try { antes = JSON.parse(await readFile(ARQUIVO, "utf8")); } catch {}
if (antes && JSON.stringify(antes.dias) === JSON.stringify(lista)) {
  console.log(`Sem mudanças (${total} contribuições).`);
} else {
  await writeFile(ARQUIVO, JSON.stringify({ usuario, atualizadoEm: new Date().toISOString(), total, dias: lista }));
  console.log(`Gravado: ${lista.length} dias, ${total} contribuições.`);
}
