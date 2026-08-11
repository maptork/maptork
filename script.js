// ======================================================
// MAPTORK - SCRIPT PRINCIPAL
// ======================================================


// ======================================================
// MODELOS
// ======================================================

const models = {
  "Honda": [
    "CB 300F 2023",
    "CG 160 Titan",
    "CB 500F",
    "XRE 300"
  ],

  "Yamaha": [
    "Fazer FZ25",
    "MT-03",
    "MT-07",
    "Lander 250"
  ],

  "Suzuki": [
    "GS 500",
    "V-Strom 650",
    "Hayabusa"
  ],

  "BMW": [
    "G 310 R",
    "F 750 GS",
    "R 1250 GS"
  ],

  "KTM": [
    "390 Duke",
    "790 Duke",
    "1290 Super Duke"
  ],

  "Ducati": [
    "Monster",
    "Panigale V2",
    "Multistrada"
  ],

  "Triumph": [
    "Tiger 900",
    "Street Triple",
    "Bonneville"
  ],

  "Harley-Davidson": [
    "Iron 883",
    "Sportster S",
    "Fat Bob"
  ]
};


// ======================================================
// NAVEGAÇÃO
// ======================================================

function showPage(id, btn) {

  document
    .querySelectorAll(".page")
    .forEach(function(pagina) {
      pagina.style.display = "none";
    });


  const pagina =
    document.getElementById(id);


  if (pagina) {
    pagina.style.display = "block";
  }


  document
    .querySelectorAll(".nav button")
    .forEach(function(botao) {
      botao.classList.remove("active");
    });


  if (btn) {
    btn.classList.add("active");
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function openPage(id, index) {

  const botoes =
    document.querySelectorAll(
      ".nav button"
    );


  showPage(
    id,
    botoes[index]
  );
}


// ======================================================
// FILTRO DE MARCAS
// ======================================================

function filterBrands() {

  const input =
    document.getElementById(
      "search"
    );


  if (!input) {
    return;
  }


  const q =
    input.value
      .toLowerCase()
      .trim();


  document
    .querySelectorAll(
      "#brands .card"
    )
    .forEach(function(card) {

      const chave =
        String(
          card.dataset.key || ""
        );


      card.style.display =
        !q ||
        chave.includes(q)
          ? "block"
          : "none";
    });
}


// ======================================================
// CARREGAR MODELOS
// ======================================================

function loadModels() {

  const marcaEl =
    document.getElementById(
      "marca"
    );


  const select =
    document.getElementById(
      "modelo"
    );


  if (
    !marcaEl ||
    !select
  ) {
    return;
  }


  const marca =
    marcaEl.value;


  select.innerHTML = "";


  if (!marca) {

    select.disabled = true;

    select.innerHTML =
      '<option value="">Primeiro selecione a marca...</option>';

    return;
  }


  select.disabled = false;

  select.innerHTML =
    '<option value="">Selecione um modelo...</option>';


  const lista =
    models[marca] || [];


  lista.forEach(function(modelo) {

    const option =
      document.createElement(
        "option"
      );


    option.value = modelo;

    option.textContent = modelo;

    select.appendChild(option);
  });


  const resultado =
    document.getElementById(
      "result"
    );


  if (resultado) {
    resultado.style.display = "none";
  }
}


// ======================================================
// DIAGNÓSTICO
// ======================================================

function startDiagnostic() {

  const marcaEl =
    document.getElementById(
      "marca"
    );


  const modeloEl =
    document.getElementById(
      "modelo"
    );


  const result =
    document.getElementById(
      "result"
    );


  if (
    !marcaEl ||
    !modeloEl ||
    !result
  ) {
    return;
  }


  const marca =
    marcaEl.value;


  const modelo =
    modeloEl.value;


  if (
    !marca ||
    !modelo
  ) {

    result.style.display = "block";

    result.textContent =
      "Selecione a marca e o modelo antes de iniciar o diagnóstico.";

    return;
  }


  result.style.display = "block";

  result.innerHTML =
    "<b>Diagnóstico iniciado!</b><br>" +
    '<span style="color:#aaa">' +
    "Consulta selecionada: " +
    marca +
    " " +
    modelo +
    ".</span>";
}


// ======================================================
// GOOGLE DRIVE
// ======================================================

const DRIVE_API_URL =
  "https://script.google.com/macros/s/AKfycbyl-iiZwaurAe2P1lyyNKeN6-C4yhITvAYrkMv7pGDNctmIcyvW0OI9keTOzNss5iim/exec";


// ======================================================
// PESQUISAR MANUAIS
// ======================================================

// ======================================================
// PESQUISAR MANUAIS
// ======================================================

async function searchDrive() {
  
  const input =
    document.getElementById(
      "driveSearch"
    );
  
  
  const status =
    document.getElementById(
      "driveStatus"
    );
  
  
  const results =
    document.getElementById(
      "driveResults"
    );
  
  
  if (
    !input ||
    !status ||
    !results
  ) {
    return;
  }
  
  
  const q =
    input.value.trim();
  
  
  // ==================================================
  // CAMPO VAZIO
  // ==================================================
  
  if (!q) {
    
    status.style.display =
      "block";
    
    
    status.innerHTML =
      "Digite a marca ou modelo.";
    
    
    results.innerHTML =
      "";
    
    
    return;
  }
  
  
  // ==================================================
  // INICIAR PESQUISA
  // ==================================================
  
  status.style.display =
    "block";
  
  
  status.innerHTML =
    "Pesquisando no Google Drive...";
  
  
  results.innerHTML = `

    <div
      class="pdf-card"
      style="
        display:block;
        text-align:center;
        padding:30px;
      "
    >

      <div class="loader"></div>

      <p>
        Pesquisando arquivos...
      </p>

    </div>

  `;
  
  
  try {
    
    const response =
      await fetch(
        
        DRIVE_API_URL +
        "?q=" +
        encodeURIComponent(q)
        
      );
    
    
    const data =
      await response.json();
    
    
    // ==================================================
    // NENHUM RESULTADO
    // ==================================================
    
    if (
      !data.ok ||
      !data.files ||
      !data.files.length
    ) {
      
      status.innerHTML =
        "Nenhum PDF encontrado.";
      
      
      results.innerHTML =
        "";
      
      
      return;
    }
    
    
    // ==================================================
    // QUANTIDADE ENCONTRADA
    // ==================================================
    
    status.innerHTML =
      data.files.length +
      " arquivo(s) encontrado(s).";
    
    
    results.innerHTML =
      "";
    
    
    // ==================================================
    // CRIAR CARD PARA CADA PDF
    // ==================================================
    
    data.files.forEach(
      function(file) {
        
        
        // ----------------------------------------------
        // CARD
        // ----------------------------------------------
        
        const card =
          document.createElement(
            "div"
          );
        
        
        card.className =
          "pdf-card";
        
        
        // ----------------------------------------------
        // ÍCONE
        // ----------------------------------------------
        
        const icon =
          document.createElement(
            "div"
          );
        
        
        icon.className =
          "pdf-icon";
        
        
        icon.textContent =
          "PDF";
        
        
        // ----------------------------------------------
        // TÍTULO
        // ----------------------------------------------
        
        const titulo =
          document.createElement(
            "div"
          );
        
        
        titulo.className =
          "pdf-title";
        
        
        titulo.textContent =
          file.name ||
          "Manual";
        
        
        // ----------------------------------------------
        // BOTÃO
        // ----------------------------------------------
        
        const botao =
          document.createElement(
            "button"
          );
        
        
        botao.className =
          "cta";
        
        
        botao.type =
          "button";
        
        
        botao.textContent =
          "ABRIR PDF";
        
        
        botao.onclick =
          function() {
            
            openPdf(
              file.url
            );
            
          };
        
        
        // ----------------------------------------------
        // MONTAR CARD
        // ----------------------------------------------
        
        card.appendChild(
          icon
        );
        
        
        card.appendChild(
          titulo
        );
        
        
        card.appendChild(
          botao
        );
        
        
        results.appendChild(
          card
        );
        
      }
    );

    // Evita que nomes longos de arquivos deixem a pagina deslocada no celular.
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    
    
  } catch (erro) {
    
    console.error(
      "Erro ao pesquisar:",
      erro
    );
    
    
    status.innerHTML =
      "Erro ao pesquisar.";
    
    
    results.innerHTML =
      "";
    
  }
  
}

// ======================================================
// ASSINATURA ATUAL
// ======================================================

let assinaturaAtual = {
  carregada: false,
  ativo: false,
  plano: null,
  diasRestantes: 0,
  vencimento: "",
  status: ""
};


// ======================================================
// EMAIL DO USUÁRIO
// ======================================================

function obterEmailUsuario() {

  return String(
    (
      window.usuarioAtual &&
      window.usuarioAtual.email
    )
    ||
    localStorage.getItem(
      "email"
    )
    ||
    ""
  )
    .trim()
    .toLowerCase();
}


// ======================================================
// API DAS ASSINATURAS
// ======================================================

function obterApiAssinaturas() {

  if (
    window.ASSINATURAS_API_URL
  ) {
    return window.ASSINATURAS_API_URL;
  }


  if (
    typeof AUTH_API !==
    "undefined"
  ) {
    return AUTH_API;
  }


  return DRIVE_API_URL;
}


// ======================================================
// CONSULTAR ASSINATURA
// ======================================================

async function consultarAssinatura() {

  const email =
    obterEmailUsuario();


  if (!email) {

    assinaturaAtual = {
      carregada: true,
      ativo: false,
      plano: null,
      diasRestantes: 0,
      vencimento: "",
      status: "SEM_PLANO"
    };


    return assinaturaAtual;
  }


  try {

    const api =
      obterApiAssinaturas();


    const resposta =
      await fetch(
        api +
        "?acao=verificarPlano" +
        "&email=" +
        encodeURIComponent(email) +
        "&_t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    const dados =
      await resposta.json();


    assinaturaAtual = {
      carregada: true,
      ativo: dados.ativo === true,
      plano: dados.plano || null,
      diasRestantes:
        Number(
          dados.diasRestantes || 0
        ),
      vencimento:
        dados.vencimento || "",
      status:
        dados.status || ""
    };


    return assinaturaAtual;


  } catch (erro) {

    console.error(
      "Erro ao consultar assinatura:",
      erro
    );


    assinaturaAtual.carregada =
      true;


    return assinaturaAtual;
  }
}


// ======================================================
// ABRIR PDF
// ======================================================

async function openPdf(url) {

  localStorage.setItem(
    "maptork_manual_pendente",
    url
  );
if (true) {
  
}

  const assinatura =
    assinaturaAtual.carregada
      ? assinaturaAtual
      : await consultarAssinatura();


  if (assinatura.ativo) {

    localStorage.removeItem(
      "maptork_manual_pendente"
    );


    window.open(
      url,
      "_blank"
    );


    return;
  }


  mostrarMensagemPagamento(
    "Você precisa de um plano ativo para abrir este manual. Escolha um plano abaixo.",
    false
  );


  const navAssinaturas =
    document
      .querySelectorAll(
        ".nav button"
      )[2];


  showPage(
    "assinaturas",
    navAssinaturas
  );
}

// ======================================================
// MAPTORK - ESQUEMAS ELÉTRICOS
// ======================================================


// ======================================================
// LINKS DOS ARQUIVOS
// ======================================================
//
// COLOQUE OS LINKS VERDADEIROS ABAIXO.
//
// Pode ser:
// Google Drive
// Google Docs
// PDF
// página externa
// outro armazenamento
//
// ======================================================

const LINKS_ESQUEMAS = {

  multimetro:
    "https://drive.google.com/file/d/1qdSeRUuaSZxTIh0QjAO3Z3Nj1OqSGU_d/view?usp=drive_link",

  pinagem:
    "COLE_AQUI_LINK_PINAGEM",

  parametros:
    "COLE_AQUI_LINK_PARAMETROS",

  estatores:
    "COLE_AQUI_LINK_ESTATORES"

};


// ======================================================
// NOMES DOS ARQUIVOS
// ======================================================

const NOMES_ESQUEMAS = {

  multimetro:
    "Multímetro",

  pinagem:
    "Pinagem",

  parametros:
    "Parâmetros",

  estatores:
    "Estatores"

};


// ======================================================
// MOSTRAR MENSAGEM DOS ESQUEMAS
// ======================================================

function mostrarMensagemEsquema(
  mensagem,
  erro = false
) {

  const box =
    document.getElementById(
      "esquemasMensagem"
    );


  if (!box) {
    return;
  }


  box.style.display =
    "block";


  box.innerHTML =
    mensagem;


  if (erro) {
  
  box.style.borderColor =
    "#ed1017";
  
}

  else {

    box.style.borderColor =
      "";

  }

}


// ======================================================
// ESCONDER MENSAGEM
// ======================================================

function esconderMensagemEsquema() {

  const box =
    document.getElementById(
      "esquemasMensagem"
    );


  if (!box) {
    return;
  }


  box.style.display =
    "none";


  box.innerHTML =
    "";

}


// ======================================================
// ABRIR ESQUEMA
// ======================================================

async function abrirEsquema(
  tipo
) {

  // ----------------------------------------------
  // VALIDAR TIPO
  // ----------------------------------------------

  const link =
    LINKS_ESQUEMAS[tipo];


  const nome =
    NOMES_ESQUEMAS[tipo]
    ||
    "Arquivo";


  if (!link) {

    mostrarMensagemEsquema(
      "Arquivo não encontrado.",
      true
    );

    return;
  }


  // ----------------------------------------------
  // VERIFICAR SE LINK FOI CONFIGURADO
  // ----------------------------------------------

  if (
    link.indexOf(
      "COLE_AQUI"
    ) !== -1
  ) {

    mostrarMensagemEsquema(
      "⚠️ O link de " +
      nome +
      " ainda não foi configurado.",
      true
    );

    return;
  }


  // ----------------------------------------------
  // VERIFICANDO
  // ----------------------------------------------

  mostrarMensagemEsquema(
    "Verificando sua assinatura..."
  );


  try {

    // ==================================================
    // SEMPRE CONSULTAR NOVAMENTE
    // ==================================================
    //
    // Não usa somente informação antiga salva
    // no navegador.
    //
    // Consulta o Apps Script novamente.
    //
    // ==================================================

    const assinatura =
      await consultarAssinatura();


    // ==================================================
    // PLANO ATIVO
    // ==================================================

    if (
      assinatura &&
      assinatura.ativo === true
    ) {

      mostrarMensagemEsquema(
        "✅ Plano ativo. Abrindo " +
        nome +
        "..."
      );


      // ----------------------------------------------
      // ABRIR LINK
      // ----------------------------------------------

      window.open(
        link,
        "_blank",
        "noopener,noreferrer"
      );


      // ----------------------------------------------
      // ESCONDER MENSAGEM
      // ----------------------------------------------

      setTimeout(
        function () {

          esconderMensagemEsquema();

        },
        2500
      );


      return;
    }


    // ==================================================
    // SEM PLANO ATIVO
    // ==================================================

    mostrarMensagemEsquema(
      "🔒 Este conteúdo é exclusivo para usuários com plano ativo.",
      true
    );


    // ----------------------------------------------
    // IR PARA MINHAS ASSINATURAS
    // ----------------------------------------------

    setTimeout(
      function () {

        const botoes =
          document.querySelectorAll(
            ".nav button"
          );


        const botaoAssinaturas =
          botoes[2];


        showPage(
          "assinaturas",
          botaoAssinaturas
        );

      },
      1500
    );


  }

  catch (erro) {

    console.error(
      "Erro ao abrir esquema:",
      erro
    );


    mostrarMensagemEsquema(
      "Não foi possível verificar sua assinatura. Tente novamente.",
      true
    );

  }

}
// ======================================================
// MINHA CONTA - ALTERAR SENHA
// ======================================================

async function alterarSenhaConta() {

  const token =
    localStorage.getItem(
      "token"
    );


  const senhaAtualEl =
    document.getElementById(
      "senhaAtual"
    );


  const novaSenhaEl =
    document.getElementById(
      "novaSenha"
    );


  const confirmarSenhaEl =
    document.getElementById(
      "confirmarNovaSenha"
    );


  const mensagem =
    document.getElementById(
      "contaMensagem"
    );


  const botao =
    document.getElementById(
      "btnAlterarSenha"
    );


  if (
    !senhaAtualEl ||
    !novaSenhaEl ||
    !confirmarSenhaEl
  ) {
    return;
  }


  const senhaAtual =
    senhaAtualEl.value.trim();


  const novaSenha =
    novaSenhaEl.value.trim();


  const confirmarSenha =
    confirmarSenhaEl.value.trim();


  function mostrarContaMensagem(
    texto,
    sucesso
  ) {

    if (!mensagem) {
      return;
    }


    mensagem.style.display =
      "block";


    mensagem.className =
      sucesso
        ? "diagnostic-result success-box"
        : "diagnostic-result error-box";


    mensagem.textContent =
      texto;
  }


  if (!token) {

    window.location.href =
      "login.html";

    return;
  }


  if (
    !senhaAtual ||
    !novaSenha ||
    !confirmarSenha
  ) {

    mostrarContaMensagem(
      "Preencha todos os campos.",
      false
    );

    return;
  }


  if (
    novaSenha.length < 8
  ) {

    mostrarContaMensagem(
      "A nova senha deve possuir pelo menos 8 caracteres.",
      false
    );

    return;
  }


  if (
    novaSenha !==
    confirmarSenha
  ) {

    mostrarContaMensagem(
      "As novas senhas não coincidem.",
      false
    );

    return;
  }


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "Aguarde...";
  }


  try {

    const form =
      new FormData();


    form.append(
      "action",
      "alterarSenha"
    );


    form.append(
      "token",
      token
    );


    form.append(
      "senhaAtual",
      senhaAtual
    );


    form.append(
      "novaSenha",
      novaSenha
    );


    form.append(
      "confirmarSenha",
      confirmarSenha
    );


    const resposta =
      await fetch(
        AUTH_API,
        {
          method: "POST",
          body: form
        }
      );


    const dados =
      await resposta.json();


    if (!dados.ok) {

      mostrarContaMensagem(
        dados.mensagem ||
        "Não foi possível alterar a senha.",
        false
      );

      return;
    }


    mostrarContaMensagem(
      dados.mensagem ||
      "Senha alterada com sucesso.",
      true
    );


    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "nome"
    );

    localStorage.removeItem(
      "email"
    );


    setTimeout(
      function() {

        window.location.href =
          "login.html";

      },
      1500
    );


  } catch (erro) {

    console.error(
      erro
    );


    mostrarContaMensagem(
      "Erro ao conectar ao servidor.",
      false
    );


  } finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "ALTERAR SENHA";
    }
  }
}


// ======================================================
// EXCLUIR MINHA CONTA
// ======================================================

async function excluirMinhaConta() {

  const token =
    localStorage.getItem(
      "token"
    );


  if (!token) {

    window.location.href =
      "login.html";

    return;
  }


  const primeiraConfirmacao =
    window.confirm(
      "Tem certeza que deseja excluir sua conta?\n\n" +
      "Sua conta e sua assinatura serão removidas.\n" +
      "Esta ação não poderá ser desfeita."
    );


  if (!primeiraConfirmacao) {
    return;
  }


  const segundaConfirmacao =
    window.confirm(
      "CONFIRMAÇÃO FINAL\n\n" +
      "Deseja realmente excluir sua conta do MAPTORK?"
    );


  if (!segundaConfirmacao) {
    return;
  }


  const botao =
    document.getElementById(
      "btnExcluirConta"
    );


  const mensagem =
    document.getElementById(
      "excluirContaMensagem"
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "EXCLUINDO...";
  }


  if (mensagem) {

    mensagem.style.display =
      "block";

    mensagem.className =
      "diagnostic-result";

    mensagem.textContent =
      "Excluindo sua conta...";
  }


  try {

    const form =
      new FormData();


    form.append(
      "action",
      "excluirMinhaConta"
    );


    form.append(
      "token",
      token
    );


    const resposta =
      await fetch(
        AUTH_API,
        {
          method: "POST",
          body: form
        }
      );


    const dados =
      await resposta.json();


    if (!dados.ok) {

      if (mensagem) {

        mensagem.className =
          "diagnostic-result error-box";

        mensagem.textContent =
          dados.mensagem ||
          "Não foi possível excluir sua conta.";
      }


      if (botao) {

        botao.disabled = false;

        botao.textContent =
          "EXCLUIR MINHA CONTA";
      }


      return;
    }


    if (mensagem) {

      mensagem.className =
        "diagnostic-result success-box";

      mensagem.textContent =
        "Conta excluída com sucesso.";
    }


    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "nome"
    );

    localStorage.removeItem(
      "email"
    );

    localStorage.removeItem(
      "maptork_manual_pendente"
    );

    localStorage.removeItem(
      "maptork_pedido_pendente"
    );

    localStorage.removeItem(
      "maptork_plano_pendente"
    );


    setTimeout(
      function() {

        window.location.replace(
          "login.html"
        );

      },
      1200
    );


  } catch (erro) {

    console.error(
      "Erro ao excluir conta:",
      erro
    );


    if (mensagem) {

      mensagem.className =
        "diagnostic-result error-box";

      mensagem.textContent =
        "Erro ao conectar ao servidor.";
    }


    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "EXCLUIR MINHA CONTA";
    }
  }
}


// ======================================================
// PAINEL ADMINISTRATIVO
// ======================================================

let adminEmailSelecionado =
  "";


// ======================================================
// ABRIR ADMIN
// ======================================================

async function abrirAdmin(botao) {

  if (
    !window.usuarioAtual ||
    !window.usuarioAtual.admin
  ) {
    return;
  }


  showPage(
    "admin",
    botao
  );


  cancelarSenhaAdmin();


  await carregarPrecosPlanos();

  await carregarUsuariosAdmin();
}


// ======================================================
// MENSAGEM ADMIN
// ======================================================

function mostrarAdminMensagem(
  texto,
  sucesso
) {

  const msg =
    document.getElementById(
      "adminMensagem"
    );


  if (!msg) {
    return;
  }


  msg.style.display =
    "block";


  msg.className =
    sucesso
      ? "diagnostic-result success-box"
      : "diagnostic-result error-box";


  msg.textContent =
    texto;
}


// ======================================================
// MENSAGEM SENHA ADMIN
// ======================================================

function mostrarAdminSenhaMensagem(
  texto,
  sucesso
) {

  const msg =
    document.getElementById(
      "adminSenhaMensagem"
    );


  if (!msg) {
    return;
  }


  msg.style.display =
    "block";


  msg.className =
    sucesso
      ? "diagnostic-result success-box"
      : "diagnostic-result error-box";


  msg.textContent =
    texto;
}


// ======================================================
// CARREGAR USUÁRIOS ADMIN
// MOSTRA PLANO + VENCIMENTO + DIAS
// ======================================================

async function carregarUsuariosAdmin() {

  const token =
    localStorage.getItem(
      "token"
    );


  const area =
    document.getElementById(
      "adminUsuarios"
    );


  if (
    !token ||
    !area
  ) {
    return;
  }


  area.innerHTML = `
    <div
      class="card"
      style="text-align:center"
    >
      <div class="loader"></div>

      <p>
        Carregando usuários...
      </p>
    </div>
  `;


  try {

    const resposta =
      await fetch(
        AUTH_API +
        "?action=adminListarUsuarios" +
        "&token=" +
        encodeURIComponent(token) +
        "&_t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    const dados =
      await resposta.json();


    if (!dados.ok) {

      area.innerHTML = "";


      mostrarAdminMensagem(
        dados.mensagem ||
        "Acesso administrativo negado.",
        false
      );


      return;
    }


    mostrarAdminMensagem(
      dados.usuarios.length +
      " usuário(s) encontrado(s).",
      true
    );


    area.innerHTML = "";


    dados.usuarios.forEach(
      function(usuario) {

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "card admin-user-card";


        const statusConta =
          usuario.status ===
          "bloqueado"
            ? "Bloqueado"
            : "Ativo";


        const novoStatus =
          usuario.status ===
          "bloqueado"
            ? "ativo"
            : "bloqueado";


        const textoStatus =
          usuario.status ===
          "bloqueado"
            ? "ATIVAR"
            : "BLOQUEAR";


        let planoTexto =
          "Sem plano";


        let statusPlano =
          "SEM PLANO";


        let vencimentoTexto =
          "-";


        let diasTexto =
          "-";


        if (usuario.plano) {

          planoTexto =
            usuario.plano;


          vencimentoTexto =
            usuario.vencimento ||
            "-";


          if (
            usuario.assinaturaAtiva
          ) {

            statusPlano =
              "ATIVO";


            const dias =
              Number(
                usuario.diasRestantes ||
                0
              );


            diasTexto =
              dias === 1
                ? "1 dia"
                : dias + " dias";

          } else {

            statusPlano =
              "VENCIDO";

            diasTexto =
              "0 dias";
          }
        }


        card.innerHTML = `

          <h3>
            ${escapeHtml(
              usuario.nome || ""
            )}
          </h3>


          <p>
            <strong>
              E-mail:
            </strong>

            ${escapeHtml(
              usuario.email || ""
            )}
          </p>


          <p>
            <strong>
              Tipo:
            </strong>

            ${escapeHtml(
              usuario.tipo ||
              "cliente"
            )}
          </p>


          <p>
            <strong>
              Conta:
            </strong>

            ${statusConta}
          </p>


          <hr
            style="
              border:0;
              border-top:1px solid rgba(255,255,255,.1);
              margin:14px 0;
            "
          >


          <p>
            <strong>
              Plano:
            </strong>

            ${escapeHtml(
              planoTexto
            )}
          </p>


          <p>
            <strong>
              Assinatura:
            </strong>

            ${escapeHtml(
              statusPlano
            )}
          </p>


          <p>
            <strong>
              Vencimento:
            </strong>

            ${escapeHtml(
              vencimentoTexto
            )}
          </p>


          <p>
            <strong>
              Dias restantes:
            </strong>

            ${escapeHtml(
              diasTexto
            )}
          </p>


          <div class="admin-actions">

            <button
              class="cta"
              type="button"
              onclick="
                alterarStatusUsuarioAdmin(
                  '${encodeURIComponent(
                    usuario.email
                  )}',
                  '${novoStatus}'
                )
              "
            >
              ${textoStatus}
            </button>


            <button
              class="cta admin-secondary"
              type="button"
              onclick="
                abrirRedefinirSenhaAdmin(
                  '${encodeURIComponent(
                    usuario.email
                  )}'
                )
              "
            >
              REDEFINIR SENHA
            </button>

          </div>
        `;


        area.appendChild(
          card
        );
      }
    );


  } catch (erro) {

    console.error(
      "Erro admin:",
      erro
    );


    area.innerHTML = "";


    mostrarAdminMensagem(
      "Erro ao conectar ao servidor.",
      false
    );
  }
}


// ======================================================
// ADMIN - ALTERAR STATUS
// ======================================================

async function alterarStatusUsuarioAdmin(
  emailCodificado,
  novoStatus
) {

  const token =
    localStorage.getItem(
      "token"
    );


  const email =
    decodeURIComponent(
      emailCodificado
    );


  const form =
    new FormData();


  form.append(
    "action",
    "adminAlterarStatus"
  );


  form.append(
    "token",
    token
  );


  form.append(
    "email",
    email
  );


  form.append(
    "status",
    novoStatus
  );


  mostrarAdminMensagem(
    novoStatus ===
    "bloqueado"
      ? "Bloqueando usuário..."
      : "Ativando usuário...",
    true
  );


  try {

    const resposta =
      await fetch(
        AUTH_API,
        {
          method: "POST",
          body: form
        }
      );


    const dados =
      await resposta.json();


    mostrarAdminMensagem(
      dados.mensagem,
      dados.ok
    );


    if (dados.ok) {

      await carregarUsuariosAdmin();
    }


  } catch (erro) {

    console.error(
      erro
    );


    mostrarAdminMensagem(
      "Erro ao conectar ao servidor.",
      false
    );
  }
}


// ======================================================
// ADMIN - ABRIR REDEFINIÇÃO DE SENHA
// ======================================================

function abrirRedefinirSenhaAdmin(
  emailCodificado
) {

  adminEmailSelecionado =
    decodeURIComponent(
      emailCodificado
    );


  const box =
    document.getElementById(
      "adminSenhaBox"
    );


  const emailEl =
    document.getElementById(
      "adminSenhaEmail"
    );


  const senha =
    document.getElementById(
      "adminNovaSenha"
    );


  const confirmar =
    document.getElementById(
      "adminConfirmarSenha"
    );


  const msg =
    document.getElementById(
      "adminSenhaMensagem"
    );


  if (emailEl) {

    emailEl.textContent =
      adminEmailSelecionado;
  }


  if (senha) {
    senha.value = "";
  }


  if (confirmar) {
    confirmar.value = "";
  }


  if (msg) {

    msg.style.display = "none";

    msg.textContent = "";
  }


  if (box) {

    box.style.display = "block";


    box.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


// ======================================================
// CANCELAR REDEFINIÇÃO DE SENHA
// ======================================================

function cancelarSenhaAdmin() {

  adminEmailSelecionado =
    "";


  const box =
    document.getElementById(
      "adminSenhaBox"
    );


  const senha =
    document.getElementById(
      "adminNovaSenha"
    );


  const confirmar =
    document.getElementById(
      "adminConfirmarSenha"
    );


  const msg =
    document.getElementById(
      "adminSenhaMensagem"
    );


  if (senha) {
    senha.value = "";
  }


  if (confirmar) {
    confirmar.value = "";
  }


  if (msg) {

    msg.style.display = "none";

    msg.textContent = "";
  }


  if (box) {
    box.style.display = "none";
  }
}


// ======================================================
// ADMIN - SALVAR NOVA SENHA
// ======================================================

async function salvarNovaSenhaAdmin() {

  const token =
    localStorage.getItem(
      "token"
    );


  const novaSenhaEl =
    document.getElementById(
      "adminNovaSenha"
    );


  const confirmarSenhaEl =
    document.getElementById(
      "adminConfirmarSenha"
    );


  const botao =
    document.getElementById(
      "adminSalvarSenhaBtn"
    );


  if (
    !novaSenhaEl ||
    !confirmarSenhaEl
  ) {
    return;
  }


  const novaSenha =
    novaSenhaEl.value.trim();


  const confirmarSenha =
    confirmarSenhaEl.value.trim();


  if (!adminEmailSelecionado) {

    mostrarAdminSenhaMensagem(
      "Selecione um usuário.",
      false
    );

    return;
  }


  if (
    !novaSenha ||
    !confirmarSenha
  ) {

    mostrarAdminSenhaMensagem(
      "Preencha os dois campos de senha.",
      false
    );

    return;
  }


  if (
    novaSenha.length < 8
  ) {

    mostrarAdminSenhaMensagem(
      "A senha deve possuir pelo menos 8 caracteres.",
      false
    );

    return;
  }


  if (
    novaSenha !==
    confirmarSenha
  ) {

    mostrarAdminSenhaMensagem(
      "As senhas não coincidem.",
      false
    );

    return;
  }


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "SALVANDO...";
  }


  mostrarAdminSenhaMensagem(
    "Alterando senha e enviando e-mail...",
    true
  );


  try {

    const form =
      new FormData();


    form.append(
      "action",
      "adminRedefinirSenha"
    );


    form.append(
      "token",
      token
    );


    form.append(
      "email",
      adminEmailSelecionado
    );


    form.append(
      "novaSenha",
      novaSenha
    );


    form.append(
      "confirmarSenha",
      confirmarSenha
    );


    const resposta =
      await fetch(
        AUTH_API,
        {
          method: "POST",
          body: form
        }
      );


    const dados =
      await resposta.json();


    mostrarAdminSenhaMensagem(
      dados.mensagem,
      dados.ok
    );


    if (dados.ok) {

      novaSenhaEl.value = "";

      confirmarSenhaEl.value = "";

      await carregarUsuariosAdmin();
    }


  } catch (erro) {

    console.error(
      erro
    );


    mostrarAdminSenhaMensagem(
      "Erro ao conectar ao servidor.",
      false
    );


  } finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "SALVAR E ENVIAR POR E-MAIL";
    }
  }
}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escapeHtml(texto) {

  return String(
    texto || ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


// ======================================================
// PREÇOS DOS PLANOS
// ======================================================

function formatarPrecoPlano(
  centavos
) {

  const valor =
    Number(
      centavos || 0
    ) / 100;


  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}


// ======================================================
// PREÇO PARA CENTAVOS
// ======================================================

function precoParaCentavos(valor) {

  let texto =
    String(
      valor || ""
    )
      .trim()
      .replace(
        /\s/g,
        ""
      )
      .replace(
        /R\$/gi,
        ""
      );


  if (
    texto.includes(",")
  ) {

    texto =
      texto
        .replace(
          /\./g,
          ""
        )
        .replace(
          ",",
          "."
        );
  }


  const numero =
    Number(texto);


  if (
    !Number.isFinite(numero) ||
    numero <= 0
  ) {
    return 0;
  }


  return Math.round(
    numero * 100
  );
}


// ======================================================
// MENSAGEM DOS PREÇOS
// ======================================================

function mostrarMensagemPrecos(
  texto,
  sucesso
) {

  const msg =
    document.getElementById(
      "adminPrecosMensagem"
    );


  if (!msg) {
    return;
  }


  msg.style.display = "block";


  msg.className =
    sucesso
      ? "diagnostic-result success-box"
      : "diagnostic-result error-box";


  msg.textContent =
    texto;
}


// ======================================================
// CARREGAR PREÇOS
// ======================================================

async function carregarPrecosPlanos() {

  try {

    const api =
      obterApiAssinaturas();


    const resposta =
      await fetch(
        api +
        "?acao=obterPrecos" +
        "&_t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    const dados =
      await resposta.json();


    if (
      !dados.sucesso ||
      !dados.precos
    ) {
      return;
    }


    const mensal =
      Number(
        dados.precos.mensal ||
        3990
      );


    const trimestral =
      Number(
        dados.precos.trimestral ||
        8990
      );


    const anual =
      Number(
        dados.precos.anual ||
        29700
      );


    const precoMensal =
      document.getElementById(
        "precoMensal"
      );


    const precoTrimestral =
      document.getElementById(
        "precoTrimestral"
      );


    const precoAnual =
      document.getElementById(
        "precoAnual"
      );


    if (precoMensal) {

      precoMensal.textContent =
        formatarPrecoPlano(
          mensal
        );
    }


    if (precoTrimestral) {

      precoTrimestral.textContent =
        formatarPrecoPlano(
          trimestral
        );
    }


    if (precoAnual) {

      precoAnual.textContent =
        formatarPrecoPlano(
          anual
        );
    }


    const campoMensal =
      document.getElementById(
        "adminPrecoMensal"
      );


    const campoTrimestral =
      document.getElementById(
        "adminPrecoTrimestral"
      );


    const campoAnual =
      document.getElementById(
        "adminPrecoAnual"
      );


    if (campoMensal) {

      campoMensal.value =
        (
          mensal / 100
        )
          .toFixed(2)
          .replace(
            ".",
            ","
          );
    }


    if (campoTrimestral) {

      campoTrimestral.value =
        (
          trimestral / 100
        )
          .toFixed(2)
          .replace(
            ".",
            ","
          );
    }


    if (campoAnual) {

      campoAnual.value =
        (
          anual / 100
        )
          .toFixed(2)
          .replace(
            ".",
            ","
          );
    }


  } catch (erro) {

    console.error(
      "Erro ao carregar preços:",
      erro
    );
  }
}


// ======================================================
// ADMIN - SALVAR PREÇOS
// ======================================================

async function salvarPrecosAdmin() {

  const token =
    localStorage.getItem(
      "token"
    );


  if (!token) {

    mostrarMensagemPrecos(
      "Sessão inválida.",
      false
    );

    return;
  }


  const mensalEl =
    document.getElementById(
      "adminPrecoMensal"
    );


  const trimestralEl =
    document.getElementById(
      "adminPrecoTrimestral"
    );


  const anualEl =
    document.getElementById(
      "adminPrecoAnual"
    );


  if (
    !mensalEl ||
    !trimestralEl ||
    !anualEl
  ) {

    mostrarMensagemPrecos(
      "Campos dos planos não encontrados.",
      false
    );

    return;
  }


  const mensal =
    precoParaCentavos(
      mensalEl.value
    );


  const trimestral =
    precoParaCentavos(
      trimestralEl.value
    );


  const anual =
    precoParaCentavos(
      anualEl.value
    );


  if (
    mensal <= 0 ||
    trimestral <= 0 ||
    anual <= 0
  ) {

    mostrarMensagemPrecos(
      "Informe valores válidos.",
      false
    );

    return;
  }


  const botao =
    document.getElementById(
      "adminSalvarPrecosBtn"
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "SALVANDO...";
  }


  mostrarMensagemPrecos(
    "Salvando valores...",
    true
  );


  try {

    const form =
      new FormData();


    form.append(
      "action",
      "adminSalvarPrecos"
    );


    form.append(
      "token",
      token
    );


    form.append(
      "mensal",
      String(mensal)
    );


    form.append(
      "trimestral",
      String(trimestral)
    );


    form.append(
      "anual",
      String(anual)
    );


    const resposta =
      await fetch(
        AUTH_API,
        {
          method: "POST",
          body: form
        }
      );


    const dados =
      await resposta.json();


    if (!dados.ok) {

      mostrarMensagemPrecos(
        dados.mensagem ||
        "Não foi possível salvar os valores.",
        false
      );

      return;
    }


    mostrarMensagemPrecos(
      dados.mensagem ||
      "Valores atualizados com sucesso.",
      true
    );


    await carregarPrecosPlanos();


  } catch (erro) {

    console.error(
      "Erro ao salvar preços:",
      erro
    );


    mostrarMensagemPrecos(
      "Erro ao salvar os valores.",
      false
    );


  } finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "SALVAR VALORES";
    }
  }
}


// ======================================================
// ADMIN - RESTAURAR PREÇOS
// ======================================================

async function restaurarPrecosAdmin() {

  const token =
    localStorage.getItem(
      "token"
    );


  if (!token) {

    mostrarMensagemPrecos(
      "Sessão inválida.",
      false
    );

    return;
  }


  const confirmou =
    window.confirm(
      "Deseja restaurar os valores padrão?\n\n" +
      "Mensal: R$ 39,90\n" +
      "Trimestral: R$ 89,90\n" +
      "Anual: R$ 297,00"
    );


  if (!confirmou) {
    return;
  }


  mostrarMensagemPrecos(
    "Restaurando valores...",
    true
  );


  try {

    const form =
      new FormData();


    form.append(
      "action",
      "adminRestaurarPrecos"
    );


    form.append(
      "token",
      token
    );


    const resposta =
      await fetch(
        AUTH_API,
        {
          method: "POST",
          body: form
        }
      );


    const dados =
      await resposta.json();


    if (!dados.ok) {

      mostrarMensagemPrecos(
        dados.mensagem ||
        "Não foi possível restaurar os valores.",
        false
      );

      return;
    }


    mostrarMensagemPrecos(
      dados.mensagem ||
      "Valores padrão restaurados.",
      true
    );


    await carregarPrecosPlanos();


  } catch (erro) {

    console.error(
      "Erro ao restaurar preços:",
      erro
    );


    mostrarMensagemPrecos(
      "Erro ao restaurar valores.",
      false
    );
  }
}


// ======================================================
// MENSAGEM DE PAGAMENTO
// ======================================================

function mostrarMensagemPagamento(
  texto,
  sucesso = null
) {

  const msg =
    document.getElementById(
      "pagamentoMensagem"
    );


  if (!msg) {
    return;
  }


  msg.style.display =
    "block";


  msg.className =
    "diagnostic-result";


  if (
    sucesso === true
  ) {

    msg.classList.add(
      "success-box"
    );
  }


  if (
    sucesso === false
  ) {

    msg.classList.add(
      "error-box"
    );
  }


  msg.textContent =
    texto;
}


// ======================================================
// ESCONDER MENSAGEM DE PAGAMENTO
// ======================================================

function esconderMensagemPagamento() {

  const msg =
    document.getElementById(
      "pagamentoMensagem"
    );


  if (msg) {
    msg.style.display = "none";
  }
}


// ======================================================
// NORMALIZAR PLANO
// ======================================================

function normalizarPlano(plano) {

  return String(
    plano || ""
  )
    .trim()
    .toLowerCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


// ======================================================
// BOTÃO DO PLANO NO TOPO
// ======================================================

async function atualizarBotaoPlano() {

  const botao =
    document.getElementById(
      "planoTopoBtn"
    );


  if (!botao) {
    return;
  }


  botao.classList.remove(
    "plano-mensal",
    "plano-trimestral",
    "plano-anual",
    "sem-plano"
  );


  botao.textContent =
    "VERIFICANDO PLANO...";


  botao.classList.add(
    "sem-plano"
  );


  const assinatura =
    await consultarAssinatura();


  botao.classList.remove(
    "plano-mensal",
    "plano-trimestral",
    "plano-anual",
    "sem-plano"
  );


  if (!assinatura.ativo) {

    botao.textContent =
      "SEM PLANO";


    botao.classList.add(
      "sem-plano"
    );


    return;
  }


  const plano =
    normalizarPlano(
      assinatura.plano
    );


  const dias =
    Math.max(
      0,
      Number(
        assinatura.diasRestantes ||
        0
      )
    );


  const textoDias =
    dias === 1
      ? "1 DIA"
      : dias + " DIAS";


  if (
    plano.includes(
      "trimestral"
    )
  ) {

    botao.textContent =
      "TRIMESTRAL • " +
      textoDias;


    botao.classList.add(
      "plano-trimestral"
    );

  } else if (
    plano.includes(
      "anual"
    )
  ) {

    botao.textContent =
      "ANUAL • " +
      textoDias;


    botao.classList.add(
      "plano-anual"
    );

  } else {

    botao.textContent =
      "MENSAL • " +
      textoDias;


    botao.classList.add(
      "plano-mensal"
    );
  }
}


// ======================================================
// CRIAR URL DE RETORNO DO PAGAMENTO
// ======================================================

function criarUrlRetornoPagamento() {

  const url =
    new URL(
      window.location.href
    );


  url.search = "";

  url.hash = "";


  url.searchParams.set(
    "pagamento",
    "retorno"
  );


  return url.toString();
}


// ======================================================
// ESCOLHER PLANO
// ======================================================

async function escolherPlano(plano) {

  esconderMensagemPagamento();


  const email =
    obterEmailUsuario();


  if (!email) {

    mostrarMensagemPagamento(
      "Não foi possível identificar o e-mail da sua conta. Entre novamente no MAPTORK.",
      false
    );

    return;
  }


  const botoes =
    document.querySelectorAll(
      ".plano-btn"
    );


  botoes.forEach(
    function(btn) {

      btn.disabled = true;
    }
  );


  mostrarMensagemPagamento(
    "Preparando seu checkout seguro da InfinitePay...",
    null
  );


  try {

    const api =
      obterApiAssinaturas();


    const retorno =
      criarUrlRetornoPagamento();


    const url =
      api +
      "?acao=criarCheckout" +
      "&email=" +
      encodeURIComponent(email) +
      "&plano=" +
      encodeURIComponent(plano) +
      "&retorno=" +
      encodeURIComponent(retorno) +
      "&_t=" +
      Date.now();


    const resposta =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );


    const dados =
      await resposta.json();


    if (
      !dados.sucesso ||
      !dados.checkoutUrl
    ) {

      throw new Error(
        dados.mensagem ||
        "Não foi possível criar o checkout."
      );
    }


    localStorage.setItem(
      "maptork_pedido_pendente",
      dados.orderNsu || ""
    );


    localStorage.setItem(
      "maptork_plano_pendente",
      plano
    );


    window.location.href =
      dados.checkoutUrl;


  } catch (erro) {

    console.error(
      "Erro ao criar checkout:",
      erro
    );


    mostrarMensagemPagamento(
      "Não foi possível abrir o pagamento. " +
      (
        erro.message ||
        "Tente novamente."
      ),
      false
    );


    botoes.forEach(
      function(btn) {

        btn.disabled = false;
      }
    );
  }
}


// ======================================================
// PROCESSAR RETORNO DA INFINITEPAY
// ======================================================

async function processarRetornoInfinitePay() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get(
      "pagamento"
    ) !==
    "retorno"
  ) {
    return;
  }


  const orderNsu =
    params.get(
      "order_nsu"
    ) || "";


  const transactionNsu =
    params.get(
      "transaction_nsu"
    ) || "";


  const slug =
    params.get(
      "slug"
    ) || "";


  const navAssinaturas =
    document
      .querySelectorAll(
        ".nav button"
      )[2];


  showPage(
    "assinaturas",
    navAssinaturas
  );


  if (
    !orderNsu ||
    !transactionNsu ||
    !slug
  ) {

    mostrarMensagemPagamento(
      "Você voltou do pagamento, mas faltaram dados para confirmar a transação. Aguarde alguns segundos e atualize a página.",
      false
    );


    await atualizarBotaoPlano();


    limparParametrosPagamento();


    return;
  }


  mostrarMensagemPagamento(
    "Confirmando pagamento com a InfinitePay...",
    null
  );


  try {

    const api =
      obterApiAssinaturas();


    const url =
      api +
      "?acao=confirmarPagamento" +
      "&order_nsu=" +
      encodeURIComponent(
        orderNsu
      ) +
      "&transaction_nsu=" +
      encodeURIComponent(
        transactionNsu
      ) +
      "&slug=" +
      encodeURIComponent(
        slug
      ) +
      "&_t=" +
      Date.now();


    const resposta =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );


    const dados =
      await resposta.json();


    const assinatura =
      await consultarAssinatura();


    if (
      (
        dados.pago === true ||
        dados.sucesso === true
      )
      &&
      assinatura.ativo
    ) {

      mostrarMensagemPagamento(
        "Pagamento confirmado! Seu plano está ativo por " +
        assinatura.diasRestantes +
        " dia(s).",
        true
      );


      await atualizarBotaoPlano();


      localStorage.removeItem(
        "maptork_pedido_pendente"
      );


      localStorage.removeItem(
        "maptork_plano_pendente"
      );


      const manual =
        localStorage.getItem(
          "maptork_manual_pendente"
        );


      localStorage.removeItem(
        "maptork_manual_pendente"
      );


      limparParametrosPagamento();


      if (manual) {

        setTimeout(
          function() {

            window.location.href =
              manual;

          },
          1200
        );
      }


      return;
    }


    mostrarMensagemPagamento(
      dados.mensagem ||
      "Pagamento ainda não confirmado. Aguarde alguns segundos e atualize a página.",
      false
    );


    await atualizarBotaoPlano();


    limparParametrosPagamento();


  } catch (erro) {

    console.error(
      "Erro ao confirmar pagamento:",
      erro
    );


    mostrarMensagemPagamento(
      "Não foi possível confirmar o pagamento agora. Se ele já foi aprovado, o webhook atualizará sua assinatura automaticamente.",
      false
    );


    await atualizarBotaoPlano();


    limparParametrosPagamento();
  }
}


// ======================================================
// LIMPAR PARÂMETROS DO PAGAMENTO
// ======================================================

function limparParametrosPagamento() {

  try {

    const url =
      new URL(
        window.location.href
      );


    [
      "pagamento",
      "receipt_url",
      "order_nsu",
      "slug",
      "capture_method",
      "transaction_nsu"
    ]
      .forEach(
        function(chave) {

          url.searchParams.delete(
            chave
          );
        }
      );


    window.history.replaceState(
      {},
      "",
      url.pathname +
      (
        url.search ||
        ""
      ) +
      (
        url.hash ||
        ""
      )
    );


  } catch (erro) {

    console.warn(
      "Não foi possível limpar a URL do pagamento.",
      erro
    );
  }
}


// ======================================================
// INICIAR SISTEMA
// ======================================================

async function iniciarSistemaAssinaturas() {

  // Aguarda o index.html terminar
  // de carregar o usuário.

  for (
    let tentativa = 0;
    tentativa < 12;
    tentativa++
  ) {

    if (
      obterEmailUsuario()
    ) {
      break;
    }


    await new Promise(
      function(resolve) {

        setTimeout(
          resolve,
          250
        );
      }
    );
  }


  // Carregar valores definidos
  // pelo administrador.

  await carregarPrecosPlanos();


  // Atualizar plano no topo.

  await atualizarBotaoPlano();


  // Processar retorno do pagamento.

  await processarRetornoInfinitePay();
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  iniciarSistemaAssinaturas
);


// ======================================================
// MAPTORK - CALCULADORA DE PASTILHA DE VÁLVULA
// Fórmula: folga medida + pastilha atual - folga manual
// ======================================================
function abrirCalculadoraPastilha() {
  const calc = document.getElementById("calculadoraPastilha");
  const grid = document.getElementById("esquemasGrid");
  const aviso = document.querySelector("#esquemas .esquema-aviso");
  const launcher = document.querySelector("#esquemas .pastilha-launcher");
  const valoresLauncher = document.querySelector("#esquemas .valores-launcher");

  if (calc) calc.style.display = "block";
  if (grid) grid.style.display = "none";
  if (aviso) aviso.style.display = "none";
  if (launcher) launcher.style.display = "none";
  if (valoresLauncher) valoresLauncher.style.display = "none";

  if (calc && window.innerWidth <= 820) {
    calc.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function fecharCalculadoraPastilha() {
  const calc = document.getElementById("calculadoraPastilha");
  const grid = document.getElementById("esquemasGrid");
  const aviso = document.querySelector("#esquemas .esquema-aviso");
  const launcher = document.querySelector("#esquemas .pastilha-launcher");
  const valoresLauncher = document.querySelector("#esquemas .valores-launcher");

  if (calc) calc.style.display = "none";
  if (grid) grid.style.display = "grid";
  if (aviso) aviso.style.display = "block";
  if (launcher) launcher.style.display = "block";
  if (valoresLauncher) valoresLauncher.style.display = "block";
}

function calcularPastilha(campo) {
  const linha = campo.closest(".pastilha-linha");
  if (!linha) return;

  const folga = parseFloat(linha.querySelector(".pastilha-folga").value);
  const atual = parseFloat(linha.querySelector(".pastilha-atual").value);
  const manual = parseFloat(linha.querySelector(".pastilha-manual").value);
  const resultado = linha.querySelector(".pastilha-resultado strong");

  if (!resultado) return;

  if ([folga, atual, manual].some(Number.isNaN)) {
    resultado.textContent = "—";
    return;
  }

  const nova = folga + atual - manual;
  resultado.textContent = nova.toFixed(2).replace(".", ",");
}

function limparCalculadoraPastilha() {
  const calc = document.getElementById("calculadoraPastilha");
  if (!calc) return;

  calc.querySelectorAll("input").forEach((input) => input.value = "");
  calc.querySelectorAll(".pastilha-resultado strong").forEach((el) => el.textContent = "—");
}


// ======================================================\n// MAPTORK - CALCULADORA DE VALORES / IMPRESSAO EM PDF\n// ======================================================
function abrirCalculadoraValores() {
  const calc = document.getElementById("calculadoraValores");
  const grid = document.getElementById("esquemasGrid");
  const aviso = document.querySelector("#esquemas .esquema-aviso");
  const pastilhaLauncher = document.querySelector("#esquemas .pastilha-launcher");
  const valoresLauncher = document.querySelector("#esquemas .valores-launcher");

  if (calc) calc.style.display = "block";
  if (grid) grid.style.display = "none";
  if (aviso) aviso.style.display = "none";
  if (pastilhaLauncher) pastilhaLauncher.style.display = "none";
  if (valoresLauncher) valoresLauncher.style.display = "none";

  const itens = document.getElementById("valoresItens");
  if (itens && !itens.children.length) {
    adicionarItemValor();
    adicionarItemValor();
    adicionarItemValor();
  }

  if (calc && window.innerWidth <= 820) {
    calc.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function fecharCalculadoraValores() {
  const calc = document.getElementById("calculadoraValores");
  const grid = document.getElementById("esquemasGrid");
  const aviso = document.querySelector("#esquemas .esquema-aviso");
  const pastilhaLauncher = document.querySelector("#esquemas .pastilha-launcher");
  const valoresLauncher = document.querySelector("#esquemas .valores-launcher");

  if (calc) calc.style.display = "none";
  if (grid) grid.style.display = "grid";
  if (aviso) aviso.style.display = "block";
  if (pastilhaLauncher) pastilhaLauncher.style.display = "block";
  if (valoresLauncher) valoresLauncher.style.display = "block";
}

function adicionarItemValor(descricao = "", valor = "") {
  const lista = document.getElementById("valoresItens");
  if (!lista) return;

  const linha = document.createElement("div");
  linha.className = "valores-item";
  linha.innerHTML = `
    <input class="valor-item-descricao" type="text" maxlength="100" placeholder="Ex.: Troca de óleo" aria-label="Descrição do item">
    <input class="valor-item-valor" type="text" inputmode="decimal" placeholder="0,00" aria-label="Valor do item">
    <button class="valores-remover" type="button" aria-label="Remover item">×</button>
  `;

  const campoDescricao = linha.querySelector(".valor-item-descricao");
  const campoValor = linha.querySelector(".valor-item-valor");
  const remover = linha.querySelector(".valores-remover");

  campoDescricao.value = descricao;
  campoValor.value = valor;
  campoValor.addEventListener("input", atualizarTotalValores);
  remover.addEventListener("click", () => {
    linha.remove();
    atualizarTotalValores();
  });

  lista.appendChild(linha);
  atualizarTotalValores();
}

function numeroValorBR(valor) {
  let texto = String(valor || "").trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (!texto) return 0;

  if (texto.includes(",")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  }
  const numero = Number(texto.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numero) ? numero : 0;
}

function moedaBR(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarTotalValores() {
  const totalEl = document.getElementById("valoresTotal");
  if (!totalEl) return;
  let total = 0;
  document.querySelectorAll("#valoresItens .valor-item-valor").forEach((campo) => {
    total += numeroValorBR(campo.value);
  });
  totalEl.textContent = moedaBR(total);
}


function autoAjustarObservacao(campo) {
  if (!campo) return;
  campo.style.height = "auto";
  campo.style.height = Math.min(campo.scrollHeight, 180) + "px";
}

function limparCalculadoraValores() {
  ["valoresLoja","valoresVendedor","valoresClienteNome","valoresClienteTelefone","valoresClienteObs"].forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });
  const lista = document.getElementById("valoresItens");
  if (!lista) return;
  lista.innerHTML = "";
  adicionarItemValor();
  adicionarItemValor();
  adicionarItemValor();
  atualizarTotalValores();
}

function escaparHtmlValor(texto) {
  return String(texto || "").replace(/[&<>\"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[c]);
}


function coletarDadosCalculadoraValores() {
  const linhas = [];
  let total = 0;

  document.querySelectorAll("#valoresItens .valores-item").forEach((linha) => {
    const descricao = linha.querySelector(".valor-item-descricao")?.value.trim() || "";
    const valorTexto = linha.querySelector(".valor-item-valor")?.value || "";
    const valor = numeroValorBR(valorTexto);
    if (!descricao && !valorTexto.trim()) return;
    linhas.push({ descricao: descricao || "Item", valor });
    total += valor;
  });

  return {
    itens: linhas,
    total,
    data: new Date().toLocaleDateString("pt-BR"),
    loja: document.getElementById("valoresLoja")?.value.trim() || "",
    vendedor: document.getElementById("valoresVendedor")?.value.trim() || "",
    clienteNome: document.getElementById("valoresClienteNome")?.value.trim() || "",
    clienteTelefone: document.getElementById("valoresClienteTelefone")?.value.trim() || "",
    clienteObs: document.getElementById("valoresClienteObs")?.value.trim() || ""
  };
}

function abrirPaginaValores(nomeArquivo, mensagemVazia) {
  const dados = coletarDadosCalculadoraValores();
  if (!dados.itens.length) {
    alert(mensagemVazia);
    return;
  }

  // Os dados seguem no hash da URL. Assim a nova página funciona mesmo
  // sem depender de localStorage e sem trocar a tela principal do site.
  const destino = nomeArquivo + "#" + encodeURIComponent(JSON.stringify(dados));
  const link = document.createElement("a");
  link.href = destino;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function salvarCalculadoraValoresImagem() {
  abrirPaginaValores(
    "valores-imagem.html",
    "Adicione pelo menos um item antes de gerar a imagem."
  );
}

function imprimirCalculadoraValores() {
  abrirPaginaValores(
    "valores-imprimir.html",
    "Adicione pelo menos um item antes de imprimir."
  );
}

