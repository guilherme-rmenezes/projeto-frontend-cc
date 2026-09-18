// Instituto Semear: geração dinâmica dos cartões de iniciativa via templates JS
//
// Módulo ES6: exporta inicializarIniciativas() para ser importado pelo
// router.js no modo SPA, pelo mesmo motivo do cadastro.js.

var dadosIniciativas = [
  {
    indice: "01",
    etiqueta: "Segurança alimentar",
    titulo: "Horta Comunitária",
    descricao: "Implantamos e mantemos hortas em terrenos cedidos por prefeituras e igrejas parceiras, com irrigação simples e manejo agroecológico. A colheita abastece as famílias envolvidas e o excedente vira doação para a cozinha coletiva do bairro.",
    destaques: [
      "58 hortas ativas na região metropolitana de Porto Alegre",
      "Oficinas mensais de compostagem e manejo do solo",
      "Parceria com escolas para hortas pedagógicas"
    ],
    altSvg: "Ilustração de uma horta com plantas em fileiras",
    svg: '<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de uma horta com plantas em fileiras">' +
         '<rect x="0" y="150" width="260" height="50" fill="#4A6741"/>' +
         '<g stroke="#E4C878" stroke-width="4" stroke-linecap="round">' +
         '<path d="M40 150 V110" /><path d="M90 150 V95" /><path d="M140 150 V115" />' +
         '<path d="M190 150 V90" /><path d="M220 150 V120" />' +
         '</g>' +
         '<g fill="#C79A2B">' +
         '<circle cx="40" cy="105" r="12"/><circle cx="90" cy="90" r="14"/>' +
         '<circle cx="140" cy="110" r="11"/><circle cx="190" cy="85" r="15"/>' +
         '<circle cx="220" cy="115" r="10"/>' +
         '</g></svg>'
  },
  {
    indice: "02",
    etiqueta: "Segurança alimentar",
    titulo: "Prato Cheio",
    descricao: "Rede de doação e distribuição emergencial de alimentos para famílias em situação de insegurança alimentar aguda, em parceria com mercados, produtores rurais e bancos de alimentos locais.",
    destaques: [
      "Cestas básicas entregues quinzenalmente a 1.100 famílias",
      "Cozinha coletiva com almoço diário em três comunidades",
      "Captação contínua de alimentos não perecíveis"
    ],
    svg: '<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de uma cesta de alimentos">' +
         '<path d="M60 100 L200 100 L185 175 Q130 190 75 175 Z" fill="#C79A2B"/>' +
         '<path d="M60 100 L200 100" stroke="#1B3A2B" stroke-width="4"/>' +
         '<path d="M90 100 C90 60 170 60 170 100" stroke="#E4C878" stroke-width="6" fill="none"/>' +
         '<circle cx="105" cy="85" r="10" fill="#7C9473"/>' +
         '<circle cx="135" cy="78" r="12" fill="#4A6741"/>' +
         '<circle cx="160" cy="88" r="9" fill="#7C9473"/></svg>'
  },
  {
    indice: "03",
    etiqueta: "Educação e renda",
    titulo: "Escola de Ofícios",
    descricao: "Cursos profissionalizantes gratuitos, como costura industrial, marcenaria, elétrica predial e informática básica, com certificação reconhecida e apoio para o primeiro emprego ou empreendimento próprio.",
    destaques: [
      "910 pessoas formadas desde 2019",
      "68% de inserção no mercado de trabalho em até 6 meses",
      "Turmas com prioridade para chefes de família"
    ],
    svg: '<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de um livro aberto com ferramentas">' +
         '<path d="M30 60 L130 75 L130 160 L30 145 Z" fill="#E4C878"/>' +
         '<path d="M230 60 L130 75 L130 160 L230 145 Z" fill="#C79A2B"/>' +
         '<path d="M130 75 V160" stroke="#1B3A2B" stroke-width="3"/>' +
         '<circle cx="130" cy="45" r="18" fill="#4A6741"/>' +
         '<path d="M122 45 L128 51 L140 37" stroke="#EDE6D6" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    indice: "04",
    etiqueta: "Cuidado com a infância",
    titulo: "Apadrinhamento Sementinha",
    descricao: "Conecta crianças e adolescentes em situação de vulnerabilidade a padrinhos e madrinhas que contribuem mensalmente para material escolar, alimentação e acompanhamento pedagógico, com relatórios trimestrais de acompanhamento.",
    destaques: [
      "412 crianças apadrinhadas atualmente",
      "Acompanhamento psicopedagógico mensal",
      "Contribuição a partir de R$ 40 por mês"
    ],
    svg: '<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de duas mãos protegendo um broto">' +
         '<path d="M40 140 C40 100 90 100 90 140 L90 160 L40 160 Z" fill="#4A6741"/>' +
         '<path d="M220 140 C220 100 170 100 170 140 L170 160 L220 160 Z" fill="#4A6741"/>' +
         '<path d="M130 160 C130 120 130 100 130 80" stroke="#E4C878" stroke-width="5" stroke-linecap="round"/>' +
         '<path d="M130 110 C110 105 100 90 98 70 C122 70 130 90 130 110 Z" fill="#C79A2B"/>' +
         '<path d="M130 95 C150 90 160 75 162 55 C138 55 130 75 130 95 Z" fill="#E4C878"/></svg>'
  }
];

function gerarCartaoIniciativa(item) {
  var itensLista = item.destaques.map(function (destaque) {
    return "<li>" + destaque + "</li>";
  }).join("");

  return `
    <article class="iniciativa">
      <div class="iniciativa__texto">
        <span class="iniciativa__indice" aria-hidden="true">${item.indice}</span>
        <span class="iniciativa__etiqueta">${item.etiqueta}</span>
        <h2>${item.titulo}</h2>
        <p>${item.descricao}</p>
        <ul class="iniciativa__lista">${itensLista}</ul>
      </div>
      <div class="iniciativa__visual">${item.svg}</div>
    </article>
  `;
}

export function inicializarIniciativas() {
  var container = document.getElementById("lista-iniciativas");
  if (!container) return;
  container.innerHTML = dadosIniciativas.map(gerarCartaoIniciativa).join("");
}

document.addEventListener("DOMContentLoaded", inicializarIniciativas);
