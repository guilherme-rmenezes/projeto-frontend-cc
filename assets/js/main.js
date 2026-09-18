// Instituto Semear: comportamento comum a todas as páginas
document.addEventListener("DOMContentLoaded", function () {
  // Menu de navegação (mobile)
  var alterna = document.querySelector(".alterna-nav");
  var nav = document.querySelector(".nav-principal");

  if (alterna && nav) {
    alterna.addEventListener("click", function () {
      var aberto = alterna.getAttribute("aria-expanded") === "true";
      alterna.setAttribute("aria-expanded", String(!aberto));
      nav.classList.toggle("aberto");
    });

    // Fecha o menu ao clicar em um link (mobile)
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("aberto");
        alterna.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Ano corrente no rodapé
  var anoAlvo = document.querySelector("[data-ano-atual]");
  if (anoAlvo) {
    anoAlvo.textContent = new Date().getFullYear();
  }

  // Animações de entrada ao rolar a página (biblioteca AOS, hospedada
  // localmente em assets/vendor/aos/). Desativada quando a pessoa tem a
  // preferência do sistema "reduzir movimento" ativada, respeitando a
  // mesma regra de acessibilidade já aplicada via CSS em prefers-reduced-motion.
  if (window.AOS) {
    window.AOS.init({
      duration: 500,
      easing: "ease-out",
      once: true,
      offset: 60,
      disable: function () {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }
    });
  }
});
