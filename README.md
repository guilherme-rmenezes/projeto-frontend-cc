# Instituto Semear

Projeto desenvolvido para a disciplina de Desenvolvimento Front-End para Web, do curso de Ciência da Computação.

Site institucional fictício de uma ONG, construído com HTML5 semântico, CSS puro e JavaScript vanilla (ES6 Modules). Funciona tanto como três páginas HTML tradicionais quanto como Single Page Application, com roteamento por hash reaproveitando essas mesmas páginas. Não exige build para rodar (o código-fonte legível é o que vai para produção); há apenas um script de minificação opcional para quem quiser gerar uma versão de produção mais leve. Segue automaticamente o modo escuro do sistema operacional.

## Sumário

* [Páginas e tecnologias](#páginas-e-tecnologias)
* [Arquitetura da SPA](#arquitetura-da-spa)
* [Estrutura de pastas](#estrutura-de-pastas)
* [Pré-requisitos](#pré-requisitos)
* [Como rodar localmente](#como-rodar-localmente)
* [Versionamento e fluxo de contribuição](#versionamento-e-fluxo-de-contribuição)
* [Deploy](#deploy)

## Páginas e tecnologias

* `index.html`: apresentação da ONG, pilares de atuação, estatísticas de impacto e depoimento. Shell da SPA (contém o `<main id="app">` onde as outras páginas são injetadas). Tecnologias: HTML5 semântico, CSS Grid de 12 colunas, animações de entrada com AOS.
* `projetos.html`: as quatro iniciativas solidárias, geradas dinamicamente. Tecnologias: JavaScript (Template Literals + `Array.map`) lendo um array de dados e injetando via `innerHTML`, sem nenhum `<article>` estático no HTML.
* `cadastro.html`: formulário de cadastro de voluntários. Tecnologias: máscaras de CPF/telefone/CEP em JavaScript puro, validação nativa HTML5 reforçada por validação customizada (algoritmo dos dígitos verificadores do CPF), integração com a API pública ViaCEP, e persistência de rascunho do formulário via `localStorage`.

## Arquitetura da SPA

O `index.html` funciona como shell: um roteador por hash (`#/`, `#/projetos`, `#/cadastro`) busca as páginas reais via `fetch`, extrai o `<main>` com `DOMParser` e injeta o conteúdo dentro de `#app`, sem recarregar a página. Cada página continua funcionando normalmente também de forma isolada (acesso direto, sem depender do roteador para a primeira renderização).

## Estrutura de pastas

```
index.html
projetos.html
cadastro.html
README.md
.gitignore
assets/
    css/
        style.css        (Design System: cores, tipografia, espaçamento, componentes, breakpoints)
    js/
        main.js           (menu mobile, ano do rodapé, inicialização do AOS)
        router.js          (roteador da SPA, ES6 Module)
        cadastro.js        (formulário: máscaras, validação, ViaCEP, rascunho no localStorage; ES6 Module)
        iniciativas.js     (geração dos cartões de iniciativa via templates; ES6 Module)
    vendor/
        aos/               (biblioteca AOS hospedada localmente, sem CDN)
```

## Pré-requisitos

Nenhuma dependência é necessária para rodar o site como está (o deploy usa diretamente o código-fonte). Para desenvolvimento local, um servidor HTTP simples já é suficiente (a SPA usa `fetch`, que não funciona abrindo o arquivo direto via `file://`).

## Como rodar localmente

```bash
# na pasta do projeto
python3 -m http.server 8000
# depois acesse http://localhost:8000/index.html
```

Qualquer servidor estático equivalente funciona (ex.: extensão Live Server do VS Code).

## Versionamento e fluxo de contribuição

* Mensagens de commit seguem, a partir da reestruturação do projeto, o padrão **Conventional Commits** (`feat:`, `fix:`, `feat!:` para mudanças que quebram compatibilidade).
* Releases marcadas com tags anotadas de **versionamento semântico** (`v1.0.0`, `v1.1.0`, `v2.0.0`), incrementando MAJOR quando a mudança altera o comportamento esperado (ex.: reescrita para SPA), e MINOR para novas funcionalidades aditivas.
* Fluxo de branches inspirado em **GitFlow**: `main` reflete o código publicado no GitHub Pages; `develop` recebe features antes de virar release; branches `feature/*` são criadas a partir de `develop` (ou de `main`, para correções pequenas) e mescladas via Pull Request, referenciando a Issue correspondente (`Closes #N`).

## Acessibilidade

Modo escuro automático via `prefers-color-scheme`, paleta calculada para manter contraste WCAG AA (4.5:1) em texto normal, foco de teclado movido para o `<h1>` a cada troca de rota na SPA, e landmarks/atributos ARIA nos componentes interativos (menu, formulário, toast).

## Build de produção (opcional)

Não é necessário para o deploy (o GitHub Pages serve o código-fonte direto), mas há um script que gera uma versão minificada em `dist/` (ignorada pelo Git):

```bash
npm install
npm run build
```

Reduz o peso total dos arquivos em cerca de 37% (Terser para JS, clean-css para CSS, html-minifier-terser para HTML).

## Deploy

Publicado via GitHub Pages a partir da branch `main`.
