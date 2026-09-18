// Instituto Semear: roteador da Single Page Application
//
// Abordagem escolhida: roteamento por HASH (#/, #/projetos, #/cadastro),
// não History API com pushState. Motivo prático: o site é publicado como
// hospedagem 100% estática no GitHub Pages, sem servidor configurável para
// reescrever rotas. Com pushState, atualizar a página (F5) ou compartilhar
// um link direto para /projetos quebraria com 404, porque não existe um
// arquivo físico nesse caminho e não há como configurar um rewrite no
// GitHub Pages sem o hack de um 404.html customizado. O hash nunca é
// enviado ao servidor, então funciona em qualquer hospedagem estática sem
// configuração extra, ao custo de URLs menos "limpas".
//
// Estratégia de conteúdo: em vez de duplicar o HTML de cada página dentro
// deste arquivo JS, o roteador reaproveita os próprios arquivos
// index.html, projetos.html e cadastro.html como fonte de dados: busca
// cada um via fetch(), extrai apenas o <main> com DOMParser e injeta esse
// conteúdo dentro do <main id="app"> deste index.html. Isso significa que
// projetos.html e cadastro.html continuam funcionando normalmente também
// como páginas avulsas (acesso direto, compartilhamento de link, uso sem
// JavaScript), sem nenhuma duplicação de conteúdo entre os dois modos.

document.addEventListener("DOMContentLoaded", function () {
  var app = document.getElementById("app");
  if (!app) return; // só ativa a SPA na página que tem o contêiner #app (index.html)

  var rotas = {
    "/": "index.html",
    "/projetos": "projetos.html",
    "/cadastro": "cadastro.html"
  };

  var primeiraExecucao = true;

  function caminhoAtual() {
    var hash = window.location.hash.replace(/^#/, "");
    return rotas[hash] ? hash : "/";
  }

  // Reescreve, só dentro do conteúdo injetado, os links internos que
  // apontam para os arquivos .html reais, trocando-os pelo equivalente em
  // hash, para que a navegação dentro da SPA nunca recarregue a página.
  function reescreverLinksInternos() {
    var mapaArquivoParaHash = {
      "index.html": "#/",
      "projetos.html": "#/projetos",
      "cadastro.html": "#/cadastro"
    };
    Object.keys(mapaArquivoParaHash).forEach(function (arquivo) {
      app.querySelectorAll('a[href="' + arquivo + '"]').forEach(function (link) {
        link.setAttribute("href", mapaArquivoParaHash[arquivo]);
      });
    });
  }

  function marcarLinkAtivo(caminho) {
    document.querySelectorAll(".nav-principal a").forEach(function (link) {
      link.removeAttribute("aria-current");
    });
    var hrefAlvo = caminho === "/" ? "#/" : "#" + caminho;
    var linkAtivo = document.querySelector('.nav-principal a[href="' + hrefAlvo + '"]');
    if (linkAtivo) linkAtivo.setAttribute("aria-current", "page");
  }

  async function renderizarRota() {
    var caminho = caminhoAtual();
    var arquivo = rotas[caminho];

    // Na primeiríssima carga, se a rota for a home, o conteúdo já está
    // presente no HTML original (progressive enhancement / SEO); evita
    // um fetch redundante do próprio documento.
    var precisaBuscar = !(primeiraExecucao && arquivo === "index.html");

    if (precisaBuscar) {
      try {
        var resposta = await fetch(arquivo, { cache: "no-store" });
        var textoHtml = await resposta.text();
        var doc = new DOMParser().parseFromString(textoHtml, "text/html");
        var novoMain = doc.querySelector("main");
        if (novoMain) app.innerHTML = novoMain.innerHTML;
        var novoTitulo = doc.querySelector("title");
        if (novoTitulo) document.title = novoTitulo.textContent;
      } catch (erro) {
        app.innerHTML = "<p style=\"padding:2rem;\">Não foi possível carregar esta página.</p>";
      }
    }

    primeiraExecucao = false;

    reescreverLinksInternos();
    marcarLinkAtivo(caminho);
    app.scrollIntoView({ behavior: "instant", block: "start" });

    // Reinicializa scripts específicos da página recém-injetada
    if (arquivo === "cadastro.html" && typeof window.inicializarCadastro === "function") {
      window.inicializarCadastro();
    }
    if (arquivo === "projetos.html" && typeof window.inicializarIniciativas === "function") {
      window.inicializarIniciativas();
    }
  }

  window.addEventListener("hashchange", renderizarRota);
  renderizarRota();
});
