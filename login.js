const API = "https://script.google.com/macros/s/AKfycbzScIhxB1v7f5DVtT0-p38tX2ppKj1H1kckl04aZOU3qHkcma_w10oZ-wZ5I32QTcnK/exec";

function mostrarMensagem(texto, tipo) {
  const msg = document.getElementById("mensagem");
  
  msg.className = "mensagem " + tipo;
  msg.innerHTML = texto;
  
  setTimeout(() => {
    msg.className = "mensagem";
    msg.innerHTML = "";
  }, 4000);
}




// LOGIN
async function login() {
  
  const botao = document.querySelector("button[type='submit']");
  
  botao.disabled = true;
  botao.innerHTML = "Aguarde...";
  
  try {
    
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    
    const resposta = await fetch(
      API +
      "?email=" + encodeURIComponent(email) +
      "&senha=" + encodeURIComponent(senha)
    );
    
    const dados = await resposta.json();
    
    
    if (dados.ok) {
    
    localStorage.setItem("token", dados.token);
    localStorage.setItem("nome", dados.nome);
    localStorage.setItem("email", email);
    
    mostrarMensagem("Bem-vindo, " + dados.nome + "!", "sucesso");
    
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}
    
     else {
      mostrarMensagem(dados.mensagem, "erro");
    }
    
  } catch (erro) {
    
    mostrarMensagem("Erro ao conectar ao servidor.", "erro");
    
  } finally {
    
    botao.disabled = false;
    botao.innerHTML = "ENTRAR";
    
  }
}
// RECUPERAR SENHA
async function recuperarSenha() {

    const email = document.getElementById("email").value.trim();

    if (!email) {
        mostrarMensagem("Digite seu e-mail antes de recuperar a senha.", "erro");
        return;
    }

    try {

        const resposta = await fetch(
            API +
            "?action=recuperar&email=" +
            encodeURIComponent(email)
        );

        const dados = await resposta.json();

        if (dados.ok) {
    mostrarMensagem(
        "Nova senha enviada para: <br><b>" + email + "</b>",
        "sucesso"
    );
} else {
    mostrarMensagem(dados.mensagem, "erro");
}

    } catch (erro) {

        mostrarMensagem("Erro ao recuperar a senha.", "erro");

    }
    

}
function mostrarSenha() {

    const senha = document.getElementById("senha");
    const icone = document.getElementById("iconeOlho");

    if (senha.type === "password") {

        senha.type = "text";

        icone.innerHTML = `
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.22 4.31"/>
            <path d="M1 1l22 22"/>
        `;

    } else {

        senha.type = "password";

        icone.innerHTML = `
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}