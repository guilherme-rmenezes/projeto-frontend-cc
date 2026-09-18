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
//
// Módulo ES6: importa diretamente as funções de inicialização das páginas
// que a SPA injeta dinamicamente, em vez de expô-las como globais em
// window. O import cria a dependência explícita, e o próprio navegador
// garante que cadastro.js e iniciativas.js só são baixados e avaliados
// uma única vez, mesmo sendo também carregados como entrada própria em
// cadastro.html e projetos.html quando abertos isoladamente.
import { inicializarCadastro } from "./cadastro.js";
import { inicializarIniciativas } from "./iniciativas.js";

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

  var tokenNavegacaoAtual = 0;

  async function renderizarRota() {
    var caminho = caminhoAtual();
    var arquivo = rotas[caminho];

    // Token de requisição: se, enquanto este fetch está em voo, uma nova
    // navegação começar (a pessoa clicou de novo antes da resposta
    // anterior chegar), tokenNavegacaoAtual muda e esta chamada descarta
    // seu próprio resultado ao perceber que não é mais a mais recente.
    // Sem isso, uma rota mais lenta clicada primeiro pode responder depois
    // de uma mais rápida clicada em seguida e sobrescrever o conteúdo
    // errado por cima (condição de corrida real, encontrada em testes).
    var meuToken = ++tokenNavegacaoAtual;

    // Na primeiríssima carga, se a rota for a home, o conteúdo já está
    // presente no HTML original (progressive enhancement / SEO); evita
    // um fetch redundante do próprio documento.
    var precisaBuscar = !(primeiraExecucao && arquivo === "index.html");

    if (precisaBuscar) {
      try {
        var resposta = await fetch(arquivo, { cache: "no-store" });
        var textoHtml = await resposta.text();

        if (meuToken !== tokenNavegacaoAtual) return; // resposta obsoleta: uma navegação mais nova já está em andamento

        var doc = new DOMParser().parseFromString(textoHtml, "text/html");
        var novoMain = doc.querySelector("main");
        if (novoMain) app.innerHTML = novoMain.innerHTML;
        var novoTitulo = doc.querySelector("title");
        if (novoTitulo) document.title = novoTitulo.textContent;
      } catch (erro) {
        if (meuToken !== tokenNavegacaoAtual) return;
        app.innerHTML = "<p style=\"padding:2rem;\">Não foi possível carregar esta página.</p>";
      }
    }

    if (meuToken !== tokenNavegacaoAtual) return; // guarda também o caminho sem fetch (home na primeira carga)

    primeiraExecucao = false;

    reescreverLinksInternos();
    marcarLinkAtivo(caminho);
    app.scrollIntoView({ behavior: "instant", block: "start" });

    // O AOS escaneia o DOM na inicialização; como a SPA troca o conteúdo
    // de #app depois disso, é preciso pedir que ele reavalie os elementos
    // com data-aos recém-injetados.
    if (window.AOS && typeof window.AOS.refreshHard === "function") {
      window.AOS.refreshHard();
    }

    // Reinicializa scripts específicos da página recém-injetada
    if (arquivo === "cadastro.html") {
      inicializarCadastro();
    }
    if (arquivo === "projetos.html") {
      inicializarIniciativas();
    }
  }

  window.addEventListener("hashchange", renderizarRota);
  renderizarRota();
});
