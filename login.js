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
        window.location.replace("index.html");
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
