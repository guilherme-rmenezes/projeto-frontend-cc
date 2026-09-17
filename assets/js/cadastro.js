// Instituto Semear: máscaras de entrada e validação do formulário de cadastro
document.addEventListener("DOMContentLoaded", function () {
  var formulario = document.getElementById("formulario-voluntario");
  if (!formulario) return;

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
      mensagemEnvio.textContent = "Cadastro enviado com sucesso! Em breve nossa equipe entrará em contato para os próximos passos.";
      mensagemEnvio.classList.add("visivel");
      mensagemEnvio.setAttribute("tabindex", "-1");
      mensagemEnvio.focus();
    }
    formulario.reset();
    formulario.querySelectorAll(".campo--valido, .campo--invalido").forEach(function (envoltorio) {
      envoltorio.classList.remove("campo--valido", "campo--invalido");
    });
  });

  // Remove o estado de erro assim que a pessoa começa a corrigir o campo
  formulario.querySelectorAll("input, select, textarea").forEach(function (campo) {
    campo.addEventListener("input", function () {
      var envoltorio = campo.closest(".campo");
      if (envoltorio && envoltorio.classList.contains("campo--invalido") && campo.checkValidity()) {
        envoltorio.classList.remove("campo--invalido");
      }
    });
  });
});
