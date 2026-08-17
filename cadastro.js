const API = "https://script.google.com/macros/s/AKfycbzRX5WWEj0_cD3ERlixKXqB_feiUKzqnExED5KiKYH7VOTvt_tjoqEuTC60iq5cp3Ra/exec";

function mostrarMensagem(texto, tipo) {

    const msg = document.getElementById("mensagem");

    msg.className = "mensagem " + tipo;
    msg.innerHTML = texto;

    setTimeout(() => {
        msg.className = "mensagem";
        msg.innerHTML = "";
    }, 4000);

}
async function cadastrar() {
  

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

  if (!nome) {
    mostrarMensagem("Informe o nome.", "erro");
    return;
  }

  if (!email) {
    mostrarMensagem("Informe o e-mail.", "erro");
    return;
  }

  // Valida o formato do e-mail antes de enviar o cadastro.
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

  if (!emailValido) {
    mostrarMensagem("Digite um e-mail válido. Exemplo: nome@email.com", "erro");
    document.getElementById("email").focus();
    return;
  }

  if (!senha) {
    mostrarMensagem("Informe a senha.", "erro");
    return;
  }

  if (!confirmarSenha) {
    mostrarMensagem("Confirme a senha.", "erro");
    return;
  }

  if (senha !== confirmarSenha) {
    mostrarMensagem("As senhas não coincidem.", "erro");
    return;
  }

  const form = new FormData();
  form.append("nome", nome);
  form.append("email", email);
  form.append("senha", senha);

  const botao = document.querySelector("button");

botao.disabled = true;
botao.innerHTML = "Aguarde...";

try {
  
  const resposta = await fetch(API, {
    method: "POST",
    body: form
  });
  
  const dados = await resposta.json();
  
  mostrarMensagem(dados.mensagem, dados.ok ? "sucesso" : "erro");
  
  if (dados.ok) {
    window.location.href = "login.html";
  }
  
} catch (erro) {
  mostrarMensagem("Erro ao conectar ao servidor.", "erro");
} finally {
  botao.disabled = false;
  botao.innerHTML = "CADASTRAR";
}

}
function mostrarSenha(idCampo, idIcone) {

    const campo = document.getElementById(idCampo);
    const icone = document.getElementById(idIcone);

    if (campo.type === "password") {

        campo.type = "text";

        icone.innerHTML = `
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.22 4.31"/>
            <path d="M1 1l22 22"/>
        `;

    } else {

        campo.type = "password";

        icone.innerHTML = `
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}