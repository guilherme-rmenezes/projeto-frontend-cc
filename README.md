# Instituto Semear

Projeto desenvolvido para a disciplina de Desenvolvimento Front-End para Web, do curso de Ciência da Computação.

Site institucional fictício de uma ONG, construído com HTML5 semântico, CSS puro e JavaScript vanilla, sem frameworks ou etapa de build.

## Páginas

* `index.html`: apresentação da ONG, pilares de atuação e estatísticas de impacto
* `projetos.html`: detalhamento das quatro iniciativas solidárias
* `cadastro.html`: formulário de cadastro de voluntários, com máscaras de CPF, telefone e CEP, além de validação nativa e customizada

## Estrutura de pastas

```
index.html
projetos.html
cadastro.html
assets/
    css/
        style.css   (estilos compartilhados pelas 3 páginas)
    js/
        main.js      (menu mobile e ano do rodapé)
        cadastro.js  (máscaras, validação de CPF e integração com ViaCEP)
```

## Destaques técnicos

* HTML5 semântico (header, nav, main, section, article, footer, fieldset/legend)
* Máscaras de entrada em tempo real para CPF, telefone e CEP (JavaScript puro)
* Validação de CPF pelo algoritmo real dos dígitos verificadores
* Preenchimento automático de endereço via API pública ViaCEP
* Validação nativa HTML5 (required, pattern, type, minlength/maxlength) reforçada com feedback visual acessível
* Responsivo, sem dependências externas além de fontes do Google Fonts

## Como rodar localmente

Basta abrir `index.html` no navegador. Não há etapa de build.

## Deploy

Publicado via GitHub Pages a partir da branch main.
