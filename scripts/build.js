// build.js — gera uma versão de produção minificada em /dist, medindo a
// redução real de tamanho de cada arquivo. Não é usado no deploy (o
// GitHub Pages serve o código-fonte direto), mas demonstra o processo de
// build de produção pedido pelo roteiro.
const fs = require("fs");
const path = require("path");
const { minify: minifyJs } = require("terser");
const CleanCSS = require("clean-css");
const { minify: minifyHtml } = require("html-minifier-terser");

const RAIZ = path.resolve(__dirname, "..");
const DIST = path.join(RAIZ, "dist");

function tamanho(caminho) {
  return fs.statSync(caminho).size;
}

async function minificarArquivoJs(origem, destino) {
  const codigo = fs.readFileSync(origem, "utf8");
  const ehModulo = codigo.includes("export ") || codigo.includes("import ");
  const resultado = await minifyJs(codigo, {
    module: ehModulo,
    compress: true,
    mangle: true
  });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, resultado.code, "utf8");
}

async function minificarArquivoCss(origem, destino) {
  const codigo = fs.readFileSync(origem, "utf8");
  const resultado = new CleanCSS({ level: 2 }).minify(codigo);
  if (resultado.errors.length) throw new Error(resultado.errors.join("; "));
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, resultado.styles, "utf8");
}

async function minificarArquivoHtml(origem, destino) {
  const codigo = fs.readFileSync(origem, "utf8");
  const resultado = await minifyHtml(codigo, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    conservativeCollapse: false
  });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, resultado, "utf8");
}

async function main() {
  const alvos = [
    { origem: "assets/css/style.css", destino: "dist/assets/css/style.css", tipo: "css" },
    { origem: "assets/js/main.js", destino: "dist/assets/js/main.js", tipo: "js" },
    { origem: "assets/js/router.js", destino: "dist/assets/js/router.js", tipo: "js" },
    { origem: "assets/js/cadastro.js", destino: "dist/assets/js/cadastro.js", tipo: "js" },
    { origem: "assets/js/iniciativas.js", destino: "dist/assets/js/iniciativas.js", tipo: "js" },
    { origem: "index.html", destino: "dist/index.html", tipo: "html" },
    { origem: "projetos.html", destino: "dist/projetos.html", tipo: "html" },
    { origem: "cadastro.html", destino: "dist/cadastro.html", tipo: "html" }
  ];

  let totalAntes = 0;
  let totalDepois = 0;
  const linhas = [];

  for (const alvo of alvos) {
    const origemAbs = path.join(RAIZ, alvo.origem);
    const destinoAbs = path.join(RAIZ, alvo.destino);
    const antes = tamanho(origemAbs);

    if (alvo.tipo === "js") await minificarArquivoJs(origemAbs, destinoAbs);
    else if (alvo.tipo === "css") await minificarArquivoCss(origemAbs, destinoAbs);
    else await minificarArquivoHtml(origemAbs, destinoAbs);

    const depois = tamanho(destinoAbs);
    totalAntes += antes;
    totalDepois += depois;
    const reducao = (100 - (depois / antes) * 100).toFixed(1);
    linhas.push(`${alvo.origem.padEnd(28)} ${String(antes).padStart(6)}B -> ${String(depois).padStart(6)}B  (-${reducao}%)`);
  }

  console.log(linhas.join("\n"));
  const reducaoTotal = (100 - (totalDepois / totalAntes) * 100).toFixed(1);
  console.log(`\nTOTAL: ${totalAntes}B -> ${totalDepois}B (-${reducaoTotal}%)`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
