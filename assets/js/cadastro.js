// Instituto Semear: máscaras de entrada e validação do formulário de cadastro
//
// Exposta como window.inicializarCadastro porque, no modo SPA (ver router.js),
// este formulário pode ser injetado dinamicamente no DOM depois que o evento
// DOMContentLoaded já disparou; o roteador chama esta função manualmente
// nesse caso. Quando cadastro.html é aberto isoladamente (fora da SPA), o
// próprio DOMContentLoaded abaixo garante o comportamento de sempre.
function inicializarCadastro() {
  var formulario = document.getElementById("formulario-voluntario");
  if (!formulario) return;

  /* ----------------------------------------------------------
     Persistência de rascunho no navegador (localStorage)
     Salva o progresso do formulário a cada alteração, para não
     perder o preenchimento se a aba fechar por engano. O campo
     de aceite da LGPD (termos) nunca é restaurado automaticamente
     por decisão de design: exigimos que a pessoa reconfirme o
     consentimento a cada sessão de preenchimento.
  ---------------------------------------------------------- */

  var CHAVE_RASCUNHO = "institutoSemear:rascunhoCadastro";
  var CAMPOS_TEXTO_RASCUNHO = [
    "nome", "data_nascimento", "cpf", "email", "telefone",
    "cep", "cidade", "endereco", "numero", "bairro",
    "disponibilidade", "mensagem"
  ];

  function coletarDadosRascunho() {
    var dados = {};
    CAMPOS_TEXTO_RASCUNHO.forEach(function (nomeCampo) {
      if (formulario.elements[nomeCampo]) dados[nomeCampo] = formulario.elements[nomeCampo].value;
    });
    dados.areas = Array.prototype.map.call(
      formulario.querySelectorAll('input[name="areas"]:checked'),
      function (input) { return input.value; }
    );
    return dados;
  }

  function salvarRascunho() {
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(coletarDadosRascunho()));
    } catch (erro) {
      // localStorage pode falhar (modo privado, quota excedida); a falha
      // é silenciosa porque o auto-salvamento é uma conveniência, não um
      // requisito para o formulário continuar funcionando.
    }
  }

  function restaurarRascunho() {
    var bruto;
    try {
      bruto = localStorage.getItem(CHAVE_RASCUNHO);
    } catch (erro) {
      return;
    }
    if (!bruto) return;

    var dados;
    try {
      dados = JSON.parse(bruto);
    } catch (erro) {
      localStorage.removeItem(CHAVE_RASCUNHO);
      return;
    }

    var restaurouAlgo = false;
    CAMPOS_TEXTO_RASCUNHO.forEach(function (nomeCampo) {
      if (dados[nomeCampo] && formulario.elements[nomeCampo]) {
        formulario.elements[nomeCampo].value = dados[nomeCampo];
        restaurouAlgo = true;
      }
    });
    if (Array.isArray(dados.areas)) {
      dados.areas.forEach(function (valor) {
        var caixa = formulario.querySelector('input[name="areas"][value="' + valor + '"]');
        if (caixa) { caixa.checked = true; restaurouAlgo = true; }
      });
    }

    if (restaurouAlgo) {
      var avisoRascunho = document.getElementById("aviso-rascunho");
      if (avisoRascunho) avisoRascunho.style.display = "flex";
    }
  }

  function limparRascunho() {
    try { localStorage.removeItem(CHAVE_RASCUNHO); } catch (erro) { /* silencioso */ }
    var avisoRascunho = document.getElementById("aviso-rascunho");
    if (avisoRascunho) avisoRascunho.style.display = "none";
  }

  restaurarRascunho();
  formulario.addEventListener("input", salvarRascunho);

  var botaoDescartar = document.getElementById("descartar-rascunho");
  if (botaoDescartar) {
    botaoDescartar.addEventListener("click", function () {
      formulario.reset();
      limparRascunho();
    });
  }

  /* ----------------------------------------------------------
     Utilidades de máscara
  ---------------------------------------------------------- */

  function apenasDigitos(valor) {
    return valor.replace(/\D/g, "");
  }

  function mascararCPF(valor) {
    var d = apenasDigitos(valor).slice(0, 11);
    d = d.replace(/(\d{3})(\d)/, "$1.$2");
    d = d.replace(/(\d{3})(\d)/, "$1.$2");
    d = d.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return d;
  }

  function mascararTelefone(valor) {
    var d = apenasDigitos(valor).slice(0, 11);
    if (d.length > 10) {
      // celular: (99) 99999-9999
      d = d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    } else if (d.length > 5) {
      // fixo: (99) 9999-9999
      d = d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (d.length > 2) {
      d = d.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    } else if (d.length > 0) {
      d = d.replace(/(\d{0,2})/, "($1");
    }
    return d.trim().replace(/-$/, "");
  }

  function mascararCEP(valor) {
    var d = apenasDigitos(valor).slice(0, 8);
    d = d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
    return d;
  }

  function aplicarMascara(campoId, funcaoMascara) {
    var campo = document.getElementById(campoId);
    if (!campo) return;
    campo.addEventListener("input", function () {
      var posicao = campo.selectionStart;
      var tamanhoAntes = campo.value.length;
      campo.value = funcaoMascara(campo.value);
      var diferenca = campo.value.length - tamanhoAntes;
      var novaPosicao = Math.max(0, posicao + diferenca);
      campo.setSelectionRange(novaPosicao, novaPosicao);
    });
  }

  aplicarMascara("cpf", mascararCPF);
  aplicarMascara("telefone", mascararTelefone);
  aplicarMascara("cep", mascararCEP);

  /* ----------------------------------------------------------
     Validação de CPF (algoritmo dos dígitos verificadores)
  ---------------------------------------------------------- */

  function cpfValido(cpfFormatado) {
    var cpf = apenasDigitos(cpfFormatado);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // todos os dígitos iguais

    function calcularDigito(base) {
      var soma = 0;
      var multiplicador = base.length + 1;
      for (var i = 0; i < base.length; i++) {
        soma += parseInt(base.charAt(i), 10) * multiplicador;
        multiplicador--;
      }
      var resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    }

    var digito1 = calcularDigito(cpf.substring(0, 9));
    var digito2 = calcularDigito(cpf.substring(0, 9) + digito1);

    return cpf.substring(9, 11) === String(digito1) + String(digito2);
  }

  /* ----------------------------------------------------------
     Preenchimento automático de endereço a partir do CEP
     (ViaCEP, consulta pública, sem chave de API)
  ---------------------------------------------------------- */

  var campoCEP = document.getElementById("cep");
  var campoCidade = document.getElementById("cidade");
  var campoBairro = document.getElementById("bairro");
  var campoEndereco = document.getElementById("endereco");

  if (campoCEP) {
    campoCEP.addEventListener("blur", function () {
      var cep = apenasDigitos(campoCEP.value);
      if (cep.length !== 8) return;

      fetch("https://viacep.com.br/ws/" + cep + "/json/")
        .then(function (resposta) { return resposta.json(); })
        .then(function (dados) {
          if (dados.erro) {
            marcarInvalido(campoCEP, "CEP não encontrado. Verifique os números digitados.");
            return;
          }
          marcarValido(campoCEP);
          if (campoCidade && dados.localidade) campoCidade.value = dados.localidade + "/" + dados.uf;
          if (campoBairro && dados.bairro) campoBairro.value = dados.bairro;
          if (campoEndereco && dados.logradouro) campoEndereco.value = dados.logradouro;
        })
        .catch(function () {
          // Falha de rede: mantém o preenchimento manual, sem bloquear o envio
        });
    });
  }

  /* ----------------------------------------------------------
     Feedback visual por campo
  ---------------------------------------------------------- */

  function marcarInvalido(campo, mensagem) {
    var envoltorio = campo.closest(".campo");
    if (!envoltorio) return;
    envoltorio.classList.add("campo--invalido");
    envoltorio.classList.remove("campo--valido");
    var erro = envoltorio.querySelector(".campo__erro");
    if (erro && mensagem) erro.textContent = mensagem;
    campo.setAttribute("aria-invalid", "true");
  }

  function marcarValido(campo) {
    var envoltorio = campo.closest(".campo");
    if (!envoltorio) return;
    envoltorio.classList.remove("campo--invalido");
    envoltorio.classList.add("campo--valido");
    campo.setAttribute("aria-invalid", "false");
  }

  function limparEstado(campo) {
    var envoltorio = campo.closest(".campo");
    if (!envoltorio) return;
    envoltorio.classList.remove("campo--invalido", "campo--valido");
    campo.removeAttribute("aria-invalid");
  }

  /* ----------------------------------------------------------
     Validação específica do CPF ao sair do campo
  ---------------------------------------------------------- */

  var campoCPF = document.getElementById("cpf");
  if (campoCPF) {
    campoCPF.addEventListener("blur", function () {
      if (campoCPF.value.trim() === "") {
        limparEstado(campoCPF);
        return;
      }
      if (cpfValido(campoCPF.value)) {
        marcarValido(campoCPF);
      } else {
        marcarInvalido(campoCPF, "CPF inválido. Confira os números digitados.");
      }
    });
  }

  /* ----------------------------------------------------------
     Validação nativa (HTML5) + reforço visual em todos os campos
     obrigatórios ao enviar o formulário
  ---------------------------------------------------------- */

  var mensagemEnvio = document.getElementById("mensagem-envio");

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var valido = formulario.checkValidity();

    // Reforça a checagem de CPF (regra própria, além da nativa)
    if (campoCPF && campoCPF.value.trim() !== "" && !cpfValido(campoCPF.value)) {
      marcarInvalido(campoCPF, "CPF inválido. Confira os números digitados.");
      valido = false;
    }

    // Marca visualmente cada campo inválido pela API nativa
    Array.prototype.forEach.call(formulario.elements, function (campo) {
      if (typeof campo.checkValidity !== "function" || campo.type === "submit") return;
      var envoltorio = campo.closest(".campo");
      if (!envoltorio) return;
      if (!campo.checkValidity()) {
        envoltorio.classList.add("campo--invalido");
        envoltorio.classList.remove("campo--valido");
        var erro = envoltorio.querySelector(".campo__erro");
        if (erro && !erro.textContent) erro.textContent = campo.validationMessage;
      } else if (campo.value.trim() !== "") {
        envoltorio.classList.remove("campo--invalido");
      }
    });

    if (!valido) {
      formulario.reportValidity();
      if (mensagemEnvio) mensagemEnvio.classList.remove("visivel");
      var primeiroInvalido = formulario.querySelector(".campo--invalido input, .campo--invalido select");
      if (primeiroInvalido) primeiroInvalido.focus();
      return;
    }

    // Formulário válido: em produção, aqui seria feito o envio (fetch/XHR)
    // para o backend da ONG. Nesta demonstração, exibimos a confirmação.
    if (mensagemEnvio) {
      var toastTexto = document.getElementById("toast-texto");
      if (toastTexto) toastTexto.textContent = "Cadastro enviado com sucesso! Em breve nossa equipe entrará em contato para os próximos passos.";
      mensagemEnvio.classList.add("visivel");
    }
    formulario.reset();
    formulario.querySelectorAll(".campo--valido, .campo--invalido").forEach(function (envoltorio) {
      envoltorio.classList.remove("campo--valido", "campo--invalido");
    });
    limparRascunho();
  });

  // Botão de fechar do toast
  var toastFechar = document.getElementById("toast-fechar");
  if (toastFechar && mensagemEnvio) {
    toastFechar.addEventListener("click", function () {
      mensagemEnvio.classList.remove("visivel");
    });
  }

  // Fecha o toast automaticamente após alguns segundos
  if (mensagemEnvio) {
    var temporizadorToast = null;
    var observadorToast = new MutationObserver(function () {
      if (mensagemEnvio.classList.contains("visivel")) {
        clearTimeout(temporizadorToast);
        temporizadorToast = setTimeout(function () {
          mensagemEnvio.classList.remove("visivel");
        }, 6000);
      }
    });
    observadorToast.observe(mensagemEnvio, { attributes: true, attributeFilter: ["class"] });
  }

  // Remove o estado de erro assim que a pessoa começa a corrigir o campo
  formulario.querySelectorAll("input, select, textarea").forEach(function (campo) {
    campo.addEventListener("input", function () {
      var envoltorio = campo.closest(".campo");
      if (envoltorio && envoltorio.classList.contains("campo--invalido") && campo.checkValidity()) {
        envoltorio.classList.remove("campo--invalido");
      }
    });
  });

  /* ----------------------------------------------------------
     Gatilho de demonstração (uso interno, só para capturas de
     tela dos estados de UI: ?demo=toast ou ?demo=erro na URL).
     Não faz parte do fluxo normal de uso do formulário.
  ---------------------------------------------------------- */
  var parametroDemo = new URLSearchParams(window.location.search).get("demo");
  if (parametroDemo === "toast" && mensagemEnvio) {
    var toastTextoDemo = document.getElementById("toast-texto");
    if (toastTextoDemo) toastTextoDemo.textContent = "Cadastro enviado com sucesso! Em breve nossa equipe entrará em contato para os próximos passos.";
    mensagemEnvio.classList.add("visivel");
  }
  if (parametroDemo === "erro" && campoCPF) {
    campoCPF.value = "123.456.789-00";
    marcarInvalido(campoCPF, "CPF inválido. Confira os números digitados.");
  }
}

window.inicializarCadastro = inicializarCadastro;
document.addEventListener("DOMContentLoaded", inicializarCadastro);
