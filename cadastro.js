const API = "https://script.google.com/macros/s/AKfycbzScIhxB1v7f5DVtT0-p38tX2ppKj1H1kckl04aZOU3qHkcma_w10oZ-wZ5I32QTcnK/exec";

async function cadastrar() {

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

  if (!nome) {
    alert("Informe o nome.");
    return;
  }

  if (!email) {
    alert("Informe o e-mail.");
    return;
  }

  if (!senha) {
    alert("Informe a senha.");
    return;
  }

  if (!confirmarSenha) {
    alert("Confirme a senha.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  const form = new FormData();
  form.append("nome", nome);
  form.append("email", email);
  form.append("senha", senha);

  try {

    const resposta = await fetch(API, {
      method: "POST",
      body: form
    });

    const dados = await resposta.json();

    alert(dados.mensagem);

    if (dados.ok) {
      window.location.href = "login.html";
    }

  } catch (erro) {
    alert("Erro: " + erro.message);
  }

}