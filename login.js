const API = "https://script.google.com/macros/s/AKfycbzScIhxB1v7f5DVtT0-p38tX2ppKj1H1kckl04aZOU3qHkcma_w10oZ-wZ5I32QTcnK/exec";

// LOGIN
async function login() {

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  const resposta = await fetch(
    API +
    "?email=" + encodeURIComponent(email) +
    "&senha=" + encodeURIComponent(senha)
  );

  const dados = await resposta.json();

  if (dados.ok) {

    alert("Bem-vindo, " + dados.nome + "!");

    window.location.href = "index.html";

  } else {

    alert(dados.mensagem);

  }

}

// RECUPERAR SENHA
async function recuperarSenha() {

  const email = prompt("Digite seu e-mail cadastrado:");

  if (!email) return;

  try {

    const resposta = await fetch(
      API +
      "?action=recuperar&email=" +
      encodeURIComponent(email)
    );

    const dados = await resposta.json();

    alert(dados.mensagem);

  } catch (erro) {

    alert("Erro ao recuperar a senha.");

  }

}