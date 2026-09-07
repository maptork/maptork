const API = "https://script.google.com/macros/s/AKfycbzQyy2VRlJR_NZEoeMXNaLkhbdz3RL47EabYDLrRhFnOEmY-0k8g3YliBWXK99LaH7j/exec";

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

  if (nome.split(/\s+/).filter(Boolean).length < 2) {
    mostrarMensagem("Informe seu nome completo.", "erro");
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
