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

function configurarCamposCredenciaisPorPagina(idPagina) {
  document.querySelectorAll('input[type="password"]').forEach(function(campo) {
    const pagina = campo.closest('.page');
    const deveAtivar = pagina && pagina.id === idPagina;
    campo.disabled = !deveAtivar;
  });
}

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

  if (id === "esquemas") {
    // As ferramentas são pré-carregadas ao abrir o MAPTORK.
    // Ao voltar para esta página, apenas renderiza o cache da sessão.
    if (typeof renderizarFerramentasDinamicas === "function") {
      renderizarFerramentasDinamicas();
    }
    if (typeof preCarregarFerramentasDinamicas === "function") {
      preCarregarFerramentasDinamicas(false);
    }
  }

  configurarCamposCredenciaisPorPagina(id);


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
    String(
      typeof input.value === "string"
        ? input.value
        : (input.innerText || input.textContent || "")
    ).trim();
  
  
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
    "https://drive.google.com/file/d/1O43CidjWggxFGvhevKHycuxqVSOrJiVF/view?usp=drivesdk",

  parametros:
    "https://drive.google.com/file/d/1endRtCcb1c_nMfSDD3ULlcGdml4ttl2a/view?usp=drivesdk",

  estatores:
    "https://drive.google.com/file/d/1GRKeKfKQfW2AbTsKwDg08yVtuCGPzLRW/view?usp=drivesdk"

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
// FERRAMENTAS DINÂMICAS - ADMIN + ASSINANTES
// ======================================================

let ferramentasDinamicasCache = [];
let ferramentasImagensCache = Object.create(null);
let ferramentasDinamicasCarregando = null;
let ferramentasDinamicasCarregadasNestaSessao = false;
let ferramentasAdminCache = [];
let adminFerramentaImagemSelecionada = null;

// Cache persistente das ferramentas/imagens. Isso faz a tela de Ferramentas
// aparecer imediatamente nas próximas aberturas do site/app, enquanto o
// servidor é atualizado em segundo plano.
const MAPTORK_FERRAMENTAS_CACHE_DB = "maptork_ui_cache";
const MAPTORK_FERRAMENTAS_CACHE_STORE = "config";
const MAPTORK_FERRAMENTAS_CACHE_KEY = "dynamicToolsV5";
let ferramentasCacheLocalCarregado = false;

function normalizarFerramentaDinamicaCache(item) {
  const dado = item || {};
  return {
    id: String(dado.id || "").trim(),
    titulo: String(dado.titulo || "").trim(),
    texto: String(dado.texto || "").trim(),
    temImagem: dado.temImagem === true,
    dataUrl: String(dado.dataUrl || "").trim()
  };
}

function abrirBancoCacheFerramentas() {
  return new Promise(function(resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB indisponível."));
      return;
    }

    const pedido = indexedDB.open(MAPTORK_FERRAMENTAS_CACHE_DB, 1);
    pedido.onupgradeneeded = function(evento) {
      const banco = evento.target.result;
      if (!banco.objectStoreNames.contains(MAPTORK_FERRAMENTAS_CACHE_STORE)) {
        banco.createObjectStore(MAPTORK_FERRAMENTAS_CACHE_STORE);
      }
    };
    pedido.onsuccess = function() { resolve(pedido.result); };
    pedido.onerror = function() { reject(pedido.error || new Error("Erro ao abrir cache.")); };
  });
}

async function salvarFerramentasCacheLocal() {
  try {
    const lista = (Array.isArray(ferramentasDinamicasCache) ? ferramentasDinamicasCache : []).map(function(item) {
      return {
        id: String(item.id || ""),
        titulo: String(item.titulo || ""),
        texto: String(item.texto || ""),
        temImagem: item.temImagem === true,
        dataUrl: ferramentasImagensCache[String(item.id || "")] || ""
      };
    });

    const banco = await abrirBancoCacheFerramentas();
    await new Promise(function(resolve, reject) {
      const tx = banco.transaction(MAPTORK_FERRAMENTAS_CACHE_STORE, "readwrite");
      tx.objectStore(MAPTORK_FERRAMENTAS_CACHE_STORE).put(lista, MAPTORK_FERRAMENTAS_CACHE_KEY);
      tx.oncomplete = resolve;
      tx.onerror = function() { reject(tx.error || new Error("Erro ao salvar cache.")); };
      tx.onabort = function() { reject(tx.error || new Error("Cache cancelado.")); };
    });
    banco.close();
  } catch (erro) {
    console.warn("Não foi possível salvar o cache das ferramentas:", erro);
  }
}

async function obterFerramentasCacheLocal() {
  try {
    const banco = await abrirBancoCacheFerramentas();
    const lista = await new Promise(function(resolve, reject) {
      const tx = banco.transaction(MAPTORK_FERRAMENTAS_CACHE_STORE, "readonly");
      const pedido = tx.objectStore(MAPTORK_FERRAMENTAS_CACHE_STORE).get(MAPTORK_FERRAMENTAS_CACHE_KEY);
      pedido.onsuccess = function() { resolve(Array.isArray(pedido.result) ? pedido.result : []); };
      pedido.onerror = function() { reject(pedido.error || new Error("Erro ao ler cache.")); };
    });
    banco.close();
    return lista.map(normalizarFerramentaDinamicaCache).filter(function(item) { return !!item.id; });
  } catch (erro) {
    return [];
  }
}

async function aplicarFerramentasCacheLocalUmaVez() {
  if (ferramentasCacheLocalCarregado) return;
  ferramentasCacheLocalCarregado = true;

  const cache = await obterFerramentasCacheLocal();
  if (!cache.length) return;

  ferramentasDinamicasCache = cache.map(function(item) {
    if (item.dataUrl) ferramentasImagensCache[String(item.id)] = item.dataUrl;
    return {
      id: item.id,
      titulo: item.titulo,
      texto: item.texto,
      temImagem: item.temImagem
    };
  });

  renderizarFerramentasDinamicas();
}

function escaparHtmlFerramenta(texto) {
  return String(texto || "").replace(/[&<>\"']/g, function(c) {
    return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c];
  });
}

function mostrarMensagemFerramentaAdmin(texto, sucesso) {
  const box = document.getElementById("adminFerramentaMensagem");
  if (!box) return;
  box.textContent = texto || "";
  box.className = "diagnostic-result" + (texto ? (sucesso ? " success-box" : " error-box") : "");
  box.style.display = texto ? "block" : "none";
}

function atualizarNomeImagemFerramentaAdmin(texto) {
  const box = document.getElementById("adminFerramentaImagemNome");
  if (box) box.textContent = texto || "Nenhuma imagem selecionada";
}

async function prepararImagemFerramentaAdmin(arquivo) {
  if (!arquivo) throw new Error("Escolha uma imagem.");
  if (!String(arquivo.type || "").toLowerCase().startsWith("image/")) {
    throw new Error("Selecione uma imagem JPG, PNG ou WEBP.");
  }
  if (arquivo.size > 12 * 1024 * 1024) {
    throw new Error("A imagem original deve ter no máximo 12 MB.");
  }

  const original = await lerArquivoComoDataUrl(arquivo);
  const imagem = await carregarImagemDataUrl(original);
  let largura = imagem.naturalWidth || imagem.width || 1;
  let altura = imagem.naturalHeight || imagem.height || 1;
  const maxLado = 760;
  const escala = Math.min(1, maxLado / largura, maxLado / altura);
  largura = Math.max(1, Math.round(largura * escala));
  altura = Math.max(1, Math.round(altura * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");
  ctx.clearRect(0, 0, largura, altura);
  ctx.drawImage(imagem, 0, 0, largura, altura);

  let mimeType = String(arquivo.type || "").toLowerCase() === "image/png" ? "image/png" : "image/jpeg";
  let qualidade = mimeType === "image/png" ? undefined : 0.9;
  let dataUrl = canvas.toDataURL(mimeType, qualidade);
  let base64 = extrairBase64DeDataUrl(dataUrl);

  if (mimeType === "image/jpeg") {
    while (tamanhoBase64EmBytes(base64) > 800 * 1024 && qualidade > 0.55) {
      qualidade = Number((qualidade - 0.08).toFixed(2));
      dataUrl = canvas.toDataURL("image/jpeg", qualidade);
      base64 = extrairBase64DeDataUrl(dataUrl);
    }
  } else if (tamanhoBase64EmBytes(base64) > 950 * 1024) {
    const webp = canvas.toDataURL("image/webp", 0.86);
    if (webp.indexOf("data:image/webp") === 0) {
      dataUrl = webp;
      base64 = extrairBase64DeDataUrl(webp);
      mimeType = "image/webp";
    }
  }

  if (tamanhoBase64EmBytes(base64) > 1400 * 1024) {
    throw new Error("A imagem ficou muito grande. Escolha outra imagem.");
  }

  return {
    fileName: gerarNomeImagemUploadAdmin(arquivo.name || "ferramenta", mimeType),
    mimeType: mimeType,
    base64: base64,
    dataUrl: dataUrl
  };
}

async function aoSelecionarImagemFerramentaAdmin() {
  const input = document.getElementById("adminFerramentaImagemFile");
  const preview = document.getElementById("adminFerramentaImagemPreview");
  const previewBox = document.getElementById("adminFerramentaPreviewBox");

  if (!input || !input.files || !input.files[0]) {
    adminFerramentaImagemSelecionada = null;
    atualizarNomeImagemFerramentaAdmin("Nenhuma imagem selecionada");
    return;
  }

  try {
    atualizarNomeImagemFerramentaAdmin(input.files[0].name || "Imagem selecionada");
    mostrarMensagemFerramentaAdmin("Preparando imagem...", true);
    adminFerramentaImagemSelecionada = await prepararImagemFerramentaAdmin(input.files[0]);
    if (preview) preview.src = adminFerramentaImagemSelecionada.dataUrl;
    if (previewBox) previewBox.style.display = "flex";
    mostrarMensagemFerramentaAdmin("Imagem pronta.", true);
  } catch (erro) {
    adminFerramentaImagemSelecionada = null;
    input.value = "";
    atualizarNomeImagemFerramentaAdmin("Nenhuma imagem selecionada");
    mostrarMensagemFerramentaAdmin((erro && erro.message) || "Erro ao preparar imagem.", false);
  }
}

function limparFormularioFerramentaAdmin() {
  const ids = ["adminFerramentaId", "adminFerramentaTitulo", "adminFerramentaTexto", "adminFerramentaLink"];
  ids.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const input = document.getElementById("adminFerramentaImagemFile");
  if (input) input.value = "";
  adminFerramentaImagemSelecionada = null;
  atualizarNomeImagemFerramentaAdmin("Nenhuma imagem selecionada");
  const preview = document.getElementById("adminFerramentaImagemPreview");
  const previewBox = document.getElementById("adminFerramentaPreviewBox");
  if (preview) preview.removeAttribute("src");
  if (previewBox) previewBox.style.display = "none";
  const btn = document.getElementById("adminSalvarFerramentaBtn");
  if (btn) btn.textContent = "SALVAR FERRAMENTA";
  mostrarMensagemFerramentaAdmin("", true);
}

async function obterImagemFerramentaCache(idFerramenta, forcarAtualizacao) {
  const id = String(idFerramenta || "").trim();
  if (!id) return "";

  if (!forcarAtualizacao && ferramentasImagensCache[id]) {
    return ferramentasImagensCache[id];
  }

  try {
    const resposta = await fetch(
      AUTH_API + "?action=obterImagemFerramenta&id=" + encodeURIComponent(id) + "&_t=" + Date.now(),
      { cache: "no-store" }
    );
    const dados = await resposta.json();
    if (dados && dados.ok === true && dados.dataUrl) {
      ferramentasImagensCache[id] = dados.dataUrl;
      return dados.dataUrl;
    }
  } catch (erro) {
    console.warn("Imagem da ferramenta indisponível:", erro);
  }

  return ferramentasImagensCache[id] || "";
}

async function carregarImagemFerramentaEmElemento(idFerramenta, img, forcarAtualizacao) {
  if (!idFerramenta || !img) return;

  const id = String(idFerramenta);
  const jaCarregada = ferramentasImagensCache[id];
  if (jaCarregada && !forcarAtualizacao) {
    img.src = jaCarregada;
    img.style.display = "block";
    return;
  }

  const dataUrl = await obterImagemFerramentaCache(id, !!forcarAtualizacao);
  if (dataUrl) {
    img.src = dataUrl;
    img.style.display = "block";
  }
}

function renderizarFerramentasDinamicas() {
  const grid = document.getElementById("ferramentasDinamicasGrid") || document.getElementById("esquemasGrid");
  const bloco = document.getElementById("ferramentasDinamicasBloco");
  if (!grid) return;

  grid.querySelectorAll(".ferramenta-dinamica-card").forEach(function(el) { el.remove(); });

  const lista = Array.isArray(ferramentasDinamicasCache) ? ferramentasDinamicasCache : [];
  if (bloco) bloco.style.display = lista.length ? "block" : "none";

  lista.forEach(function(item) {
    const card = document.createElement("div");
    card.className = "card esquema-card ferramenta-dinamica-card";

    const media = document.createElement("div");
    media.className = "ferramenta-dinamica-media";

    if (item.temImagem) {
      const img = document.createElement("img");
      img.alt = String(item.titulo || "Ferramenta MAPTORK");
      const cacheImagem = ferramentasImagensCache[String(item.id)] || "";
      if (cacheImagem) {
        img.src = cacheImagem;
        img.style.display = "block";
      } else {
        img.style.display = "none";
      }
      media.appendChild(img);

      // Se o usuário abrir Ferramentas antes de terminar o pré-carregamento,
      // completa apenas a imagem que ainda estiver faltando.
      if (!cacheImagem) {
        carregarImagemFerramentaEmElemento(item.id, img, false);
      }
    } else {
      media.innerHTML = '<span class="ferramenta-dinamica-placeholder">🔧</span>';
    }

    const titulo = document.createElement("h3");
    titulo.textContent = String(item.titulo || "Ferramenta");

    const texto = document.createElement("p");
    texto.className = "muted";
    texto.textContent = String(item.texto || "");


    const botao = document.createElement("button");
    botao.className = "cta esquema-btn";
    botao.type = "button";
    botao.textContent = "ACESSAR FERRAMENTA";
    botao.onclick = function() { abrirFerramentaDinamica(item.id, item.titulo); };

    card.appendChild(media);
    card.appendChild(titulo);
    card.appendChild(texto);
    card.appendChild(botao);
    grid.appendChild(card);
  });
}

async function preCarregarFerramentasDinamicas(forcarAtualizacao) {
  const forcar = !!forcarAtualizacao;

  // Primeiro mostra instantaneamente a última versão já salva no aparelho/navegador.
  // A atualização online acontece depois e não deixa os cards vazios.
  await aplicarFerramentasCacheLocalUmaVez();

  if (!forcar && ferramentasDinamicasCarregadasNestaSessao) {
    renderizarFerramentasDinamicas();
    return ferramentasDinamicasCache;
  }

  if (!forcar && ferramentasDinamicasCarregando) {
    return ferramentasDinamicasCarregando;
  }

  ferramentasDinamicasCarregando = (async function() {
    try {
      const resposta = await fetch(
        AUTH_API + "?action=obterFerramentasPublicas&_t=" + Date.now(),
        { cache: "no-store" }
      );
      const dados = await resposta.json();
      const lista = dados && dados.ok === true && Array.isArray(dados.ferramentas)
        ? dados.ferramentas
        : [];

      ferramentasDinamicasCache = lista;
      ferramentasDinamicasCarregadasNestaSessao = true;
      renderizarFerramentasDinamicas();

      // Atualiza as imagens em segundo plano, no máximo duas por vez.
      // Se já existir imagem no IndexedDB ela continua visível enquanto a nova chega.
      const comImagem = lista.filter(function(item) {
        return item && item.temImagem && item.id;
      });
      let cursor = 0;

      async function trabalhadorFerramentas() {
        while (cursor < comImagem.length) {
          const item = comImagem[cursor++];
          const id = String(item.id || "");
          const imgAnterior = ferramentasImagensCache[id] || "";
          const novaImagem = await obterImagemFerramentaCache(id, true).catch(function() { return imgAnterior; });
          if (novaImagem) ferramentasImagensCache[id] = novaImagem;
          renderizarFerramentasDinamicas();
        }
      }

      await Promise.all([trabalhadorFerramentas(), trabalhadorFerramentas()]);
      await salvarFerramentasCacheLocal();
      renderizarFerramentasDinamicas();
      return lista;
    } catch (erro) {
      console.warn("Não foi possível pré-carregar novas ferramentas:", erro);
      renderizarFerramentasDinamicas();
      return ferramentasDinamicasCache;
    } finally {
      ferramentasDinamicasCarregando = null;
    }
  })();

  return ferramentasDinamicasCarregando;
}

// Mantém compatibilidade com as chamadas existentes do Admin.
async function carregarFerramentasDinamicas(forcarAtualizacao) {
  renderizarFerramentasDinamicas();
  return preCarregarFerramentasDinamicas(!!forcarAtualizacao);
}

function abrirLinkFerramenta(link) {
  const url = String(link || "").trim();
  if (!/^https?:\/\//i.test(url)) return;
  try {
    if (window.AndroidApp && typeof window.AndroidApp.openExternal === "function") {
      window.AndroidApp.openExternal(url);
      return;
    }
  } catch (erro) {}
  const nova = window.open(url, "_blank", "noopener,noreferrer");
  if (!nova) window.location.href = url;
}

async function abrirFerramentaDinamica(id, titulo) {
  esconderMensagemEsquema();
  mostrarMensagemEsquema("Verificando sua assinatura...");
  const token = String(localStorage.getItem("token") || "").trim();
  if (!token) {
    mostrarMensagemEsquema("Entre na sua conta para acessar esta ferramenta.", true);
    return;
  }

  try {
    const form = new URLSearchParams();
    form.set("action", "abrirFerramentaDinamica");
    form.set("token", token);
    form.set("id", String(id || ""));

    const resposta = await fetch(
      AUTH_API + "?action=abrirFerramentaDinamica&_t=" + Date.now(),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form.toString()
      }
    );
    const dados = await resposta.json();

    if (!dados || dados.ok !== true || !dados.link) {
      mostrarMensagemEsquema((dados && dados.mensagem) || "Não foi possível abrir a ferramenta.", true);
      if (dados && dados.codigo === "SEM_PLANO") {
        setTimeout(function() {
          const botaoAssinaturas = document.querySelector('.nav button[onclick*="assinaturas"]');
          showPage("assinaturas", botaoAssinaturas || null);
        }, 1500);
      }
      return;
    }

    mostrarMensagemEsquema("Plano ativo. Abrindo " + String(titulo || "ferramenta") + "...");
    abrirLinkFerramenta(dados.link);
    setTimeout(esconderMensagemEsquema, 1800);
  } catch (erro) {
    console.error("Erro ao abrir ferramenta dinâmica:", erro);
    mostrarMensagemEsquema("Não foi possível verificar sua assinatura. Tente novamente.", true);
  }
}

async function salvarFerramentaAdmin() {
  const token = String(localStorage.getItem("token") || "").trim();
  const id = String(document.getElementById("adminFerramentaId")?.value || "").trim();
  const titulo = String(document.getElementById("adminFerramentaTitulo")?.value || "").trim();
  const texto = String(document.getElementById("adminFerramentaTexto")?.value || "").trim();
  const link = String(document.getElementById("adminFerramentaLink")?.value || "").trim();
  const botao = document.getElementById("adminSalvarFerramentaBtn");

  if (!token) return mostrarMensagemFerramentaAdmin("Sessão inválida. Entre novamente.", false);
  if (!titulo || !texto || !link) return mostrarMensagemFerramentaAdmin("Preencha nome, texto e link.", false);
  if (!/^https?:\/\//i.test(link)) return mostrarMensagemFerramentaAdmin("O link precisa começar com http:// ou https://.", false);
  if (!id && !adminFerramentaImagemSelecionada) return mostrarMensagemFerramentaAdmin("Selecione uma imagem para a nova ferramenta.", false);

  if (botao) { botao.disabled = true; botao.textContent = id ? "SALVANDO..." : "ADICIONANDO..."; }
  mostrarMensagemFerramentaAdmin("Salvando ferramenta...", true);

  try {
    const form = new URLSearchParams();
    form.set("action", "adminSalvarFerramenta");
    form.set("token", token);
    form.set("id", id);
    form.set("titulo", titulo);
    form.set("texto", texto);
    form.set("link", link);
    if (adminFerramentaImagemSelecionada) {
      form.set("imageBase64", adminFerramentaImagemSelecionada.base64);
      form.set("fileName", adminFerramentaImagemSelecionada.fileName);
      form.set("mimeType", adminFerramentaImagemSelecionada.mimeType);
    }

    const resposta = await fetch(
      AUTH_API + "?action=adminSalvarFerramenta&_t=" + Date.now(),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form.toString()
      }
    );
    const dados = await resposta.json();
    if (!dados || dados.ok !== true) {
      mostrarMensagemFerramentaAdmin((dados && dados.mensagem) || "Não foi possível salvar a ferramenta.", false);
      return;
    }

    limparFormularioFerramentaAdmin();
    mostrarMensagemFerramentaAdmin(id ? "Ferramenta atualizada com sucesso." : "Ferramenta adicionada com sucesso.", true);
    await carregarFerramentasAdmin();
    await carregarFerramentasDinamicas(true);
  } catch (erro) {
    console.error("Erro salvar ferramenta:", erro);
    mostrarMensagemFerramentaAdmin("Erro ao conectar com o Google Script.", false);
  } finally {
    if (botao) { botao.disabled = false; botao.textContent = "SALVAR FERRAMENTA"; }
  }
}

async function carregarFerramentasAdmin() {
  const box = document.getElementById("adminFerramentasLista");
  if (!box) return;
  const token = String(localStorage.getItem("token") || "").trim();
  if (!token) { box.innerHTML = '<div class="admin-tool-empty">Sessão inválida.</div>'; return; }

  box.innerHTML = '<div class="admin-tool-empty">Carregando...</div>';
  try {
    const resposta = await fetch(
      AUTH_API + "?action=adminListarFerramentas&token=" + encodeURIComponent(token) + "&_t=" + Date.now(),
      { cache: "no-store" }
    );
    const dados = await resposta.json();
    if (!dados || dados.ok !== true) {
      box.innerHTML = '<div class="admin-tool-empty">' + escaparHtmlFerramenta((dados && dados.mensagem) || "Não foi possível carregar.") + '</div>';
      return;
    }
    ferramentasAdminCache = Array.isArray(dados.ferramentas) ? dados.ferramentas : [];
    if (!ferramentasAdminCache.length) {
      box.innerHTML = '<div class="admin-tool-empty">Nenhuma ferramenta adicionada ainda.</div>';
      return;
    }

    box.innerHTML = "";
    ferramentasAdminCache.forEach(function(item) {
      const card = document.createElement("div");
      card.className = "admin-tool-item";
      const info = document.createElement("div");
      info.className = "admin-tool-item-info";
      const h4 = document.createElement("h4");
      h4.textContent = String(item.titulo || "Ferramenta");
      const p = document.createElement("p");
      p.textContent = String(item.texto || "");
      const small = document.createElement("small");
      small.textContent = String(item.link || "");
      info.appendChild(h4); info.appendChild(p); info.appendChild(small);
      const actions = document.createElement("div");
      actions.className = "admin-tool-item-actions";
      const editar = document.createElement("button");
      editar.type = "button"; editar.className = "admin-tool-edit"; editar.textContent = "EDITAR";
      editar.onclick = function() { editarFerramentaAdmin(item.id); };
      const excluir = document.createElement("button");
      excluir.type = "button"; excluir.className = "admin-tool-delete"; excluir.textContent = "EXCLUIR";
      excluir.onclick = function() { excluirFerramentaAdmin(item.id, item.titulo); };
      actions.appendChild(editar); actions.appendChild(excluir);
      card.appendChild(info); card.appendChild(actions);
      box.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro carregar ferramentas admin:", erro);
    box.innerHTML = '<div class="admin-tool-empty">Erro ao conectar com o servidor.</div>';
  }
}

async function editarFerramentaAdmin(id) {
  const item = ferramentasAdminCache.find(function(x) { return String(x.id) === String(id); });
  if (!item) return;
  document.getElementById("adminFerramentaId").value = item.id || "";
  document.getElementById("adminFerramentaTitulo").value = item.titulo || "";
  document.getElementById("adminFerramentaTexto").value = item.texto || "";
  document.getElementById("adminFerramentaLink").value = item.link || "";
  adminFerramentaImagemSelecionada = null;
  const file = document.getElementById("adminFerramentaImagemFile");
  if (file) file.value = "";
  atualizarNomeImagemFerramentaAdmin("Imagem atual mantida (se não escolher outra)");
  const btn = document.getElementById("adminSalvarFerramentaBtn");
  if (btn) btn.textContent = "ATUALIZAR FERRAMENTA";
  const previewBox = document.getElementById("adminFerramentaPreviewBox");
  const preview = document.getElementById("adminFerramentaImagemPreview");
  if (previewBox) previewBox.style.display = item.temImagem ? "flex" : "none";
  if (item.temImagem && preview) {
    preview.removeAttribute("src");
    await carregarImagemFerramentaEmElemento(item.id, preview);
  }
  mostrarMensagemFerramentaAdmin("Editando: " + String(item.titulo || "ferramenta"), true);
  document.querySelector(".admin-tools-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function excluirFerramentaAdmin(id, titulo) {
  if (!confirm('Excluir a ferramenta "' + String(titulo || "") + '"?')) return;
  const token = String(localStorage.getItem("token") || "").trim();
  try {
    const form = new URLSearchParams();
    form.set("action", "adminExcluirFerramenta");
    form.set("token", token);
    form.set("id", String(id || ""));
    const resposta = await fetch(
      AUTH_API + "?action=adminExcluirFerramenta&_t=" + Date.now(),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form.toString()
      }
    );
    const dados = await resposta.json();
    if (!dados || dados.ok !== true) {
      mostrarMensagemFerramentaAdmin((dados && dados.mensagem) || "Não foi possível excluir.", false);
      return;
    }
    mostrarMensagemFerramentaAdmin("Ferramenta excluída.", true);
    limparFormularioFerramentaAdmin();
    await carregarFerramentasAdmin();
    await carregarFerramentasDinamicas(true);
  } catch (erro) {
    mostrarMensagemFerramentaAdmin("Erro ao conectar com o Google Script.", false);
  }
}

// ======================================================
// PAINEL ADMINISTRATIVO
// ======================================================

let adminEmailSelecionado =
  "";


// ======================================================
// ADMIN - IMAGEM DO INÍCIO (GOOGLE APPS SCRIPT)
// ======================================================

const MAPTORK_IMAGEM_MAX_LADO = 1400;
const MAPTORK_IMAGEM_MAX_BYTES = 12 * 1024 * 1024;
const MAPTORK_IMAGEM_MAX_FINAL_BYTES = 3 * 1024 * 1024;
const MAPTORK_IMAGEM_ALVO_PERSISTENCIA_BYTES = 1400 * 1024;
const MAPTORK_ATUALIZACAO_INTERVALO_MS = 9000;

let maptorkHeroUploadSelecionado = null;
let maptorkAtualizacoesInicio = [];
let maptorkAtualizacaoIndice = 0;
let maptorkAtualizacaoTimer = null;
// Mantém o ID da novidade em edição fora do DOM para evitar perda do ID
// ao rolar, re-renderizar o Admin ou atualizar a lista.
let maptorkAtualizacaoEditandoId = "";

const MAPTORK_HERO_CACHE_DB = "maptork_ui_cache";
const MAPTORK_HERO_CACHE_STORE = "config";
const MAPTORK_ATUALIZACOES_CACHE_KEY = "heroUpdatesV4";

function normalizarAtualizacaoInicio(item) {
  const dado = item || {};
  return {
    id: String(dado.id || "").trim(),
    titulo: String(dado.titulo || "").trim(),
    texto: String(dado.texto || "").trim(),
    link: String(dado.link || "").trim(),
    url: String(dado.url || "").trim(),
    dataUrl: String(dado.dataUrl || "").trim(),
    temImagem: dado.temImagem === true || !!String(dado.url || dado.dataUrl || "").trim()
  };
}

function obterAtualizacaoInicioAtual() {
  if (!Array.isArray(maptorkAtualizacoesInicio) || !maptorkAtualizacoesInicio.length) return null;
  if (maptorkAtualizacaoIndice < 0 || maptorkAtualizacaoIndice >= maptorkAtualizacoesInicio.length) {
    maptorkAtualizacaoIndice = 0;
  }
  return maptorkAtualizacoesInicio[maptorkAtualizacaoIndice] || null;
}

function definirImagemComFallback(elemento, link) {
  if (!elemento) return;
  const src = String(link || "").trim();
  if (!src) {
    elemento.removeAttribute("src");
    elemento.style.display = "none";
    return;
  }

  elemento.style.display = "block";
  elemento.onload = function() {
    this.style.display = "block";
  };
  elemento.onerror = function() {
    this.onerror = null;
    this.removeAttribute("src");
    this.style.display = "none";
  };
  elemento.src = src;
}

function renderizarDotsAtualizacoes() {
  const box = document.getElementById("heroAtualizacaoDots");
  if (!box) return;
  box.innerHTML = "";

  if (maptorkAtualizacoesInicio.length <= 1) {
    box.style.display = "none";
    return;
  }

  box.style.display = "flex";
  maptorkAtualizacoesInicio.forEach(function(item, indice) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-update-dot" + (indice === maptorkAtualizacaoIndice ? " active" : "");
    dot.setAttribute("aria-label", "Mostrar atualização " + (indice + 1));
    dot.onclick = function() {
      mostrarAtualizacaoIndice(indice, true);
    };
    box.appendChild(dot);
  });
}

function renderizarAtualizacaoInicioAtual() {
  const area = document.getElementById("heroUpdatesArea");
  const imagem = document.getElementById("heroImage");
  const titulo = document.getElementById("heroAtualizacaoTitulo");
  const texto = document.getElementById("heroAtualizacaoTexto");
  const botao = document.getElementById("heroAtualizacaoBtn");
  const contador = document.getElementById("heroAtualizacaoContador");
  const item = obterAtualizacaoInicioAtual();

  if (!item) {
    if (area) area.style.display = "none";
    if (imagem) definirImagemComFallback(imagem, "");
    if (titulo) titulo.textContent = "";
    if (texto) texto.textContent = "";
    if (botao) botao.style.display = "none";
    if (contador) contador.textContent = "";
    renderizarDotsAtualizacoes();
    return;
  }

  if (area) area.style.display = "block";
  if (titulo) titulo.textContent = item.titulo;
  if (texto) texto.textContent = item.texto;
  if (botao) botao.style.display = item.link ? "inline-flex" : "none";
  if (contador) {
    contador.textContent = maptorkAtualizacoesInicio.length > 1
      ? (maptorkAtualizacaoIndice + 1) + " / " + maptorkAtualizacoesInicio.length
      : "";
  }

  definirImagemComFallback(imagem, item.dataUrl || item.url || "");
  renderizarDotsAtualizacoes();
}

function iniciarRotacaoAtualizacoes() {
  if (maptorkAtualizacaoTimer) {
    clearInterval(maptorkAtualizacaoTimer);
    maptorkAtualizacaoTimer = null;
  }

  if (maptorkAtualizacoesInicio.length <= 1) return;

  maptorkAtualizacaoTimer = setInterval(function() {
    if (document.hidden) return;
    mostrarAtualizacaoIndice((maptorkAtualizacaoIndice + 1) % maptorkAtualizacoesInicio.length, false);
  }, MAPTORK_ATUALIZACAO_INTERVALO_MS);
}

function mostrarAtualizacaoIndice(indice, reiniciarTimer) {
  if (!maptorkAtualizacoesInicio.length) return;
  const total = maptorkAtualizacoesInicio.length;
  maptorkAtualizacaoIndice = ((Number(indice) || 0) % total + total) % total;
  renderizarAtualizacaoInicioAtual();
  if (reiniciarTimer) iniciarRotacaoAtualizacoes();
}

function abrirAtualizacaoInicio() {
  const item = obterAtualizacaoInicioAtual();
  const link = String((item && item.link) || "").trim();
  if (!link) return;
  abrirLinkFerramenta(link);
}

function abrirBancoCacheImagemInicio() {
  return new Promise(function(resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB indisponível."));
      return;
    }

    const pedido = indexedDB.open(MAPTORK_HERO_CACHE_DB, 1);
    pedido.onupgradeneeded = function(evento) {
      const banco = evento.target.result;
      if (!banco.objectStoreNames.contains(MAPTORK_HERO_CACHE_STORE)) {
        banco.createObjectStore(MAPTORK_HERO_CACHE_STORE);
      }
    };
    pedido.onsuccess = function() { resolve(pedido.result); };
    pedido.onerror = function() { reject(pedido.error || new Error("Erro ao abrir cache.")); };
  });
}

async function salvarAtualizacoesInicioCacheLocal(lista) {
  try {
    const banco = await abrirBancoCacheImagemInicio();
    await new Promise(function(resolve, reject) {
      const tx = banco.transaction(MAPTORK_HERO_CACHE_STORE, "readwrite");
      tx.objectStore(MAPTORK_HERO_CACHE_STORE).put(lista || [], MAPTORK_ATUALIZACOES_CACHE_KEY);
      tx.oncomplete = resolve;
      tx.onerror = function() { reject(tx.error || new Error("Erro ao salvar cache.")); };
      tx.onabort = function() { reject(tx.error || new Error("Cache cancelado.")); };
    });
    banco.close();
  } catch (erro) {
    console.warn("Não foi possível salvar o cache das atualizações:", erro);
  }
}

async function obterAtualizacoesInicioCacheLocal() {
  try {
    const banco = await abrirBancoCacheImagemInicio();
    const lista = await new Promise(function(resolve, reject) {
      const tx = banco.transaction(MAPTORK_HERO_CACHE_STORE, "readonly");
      const pedido = tx.objectStore(MAPTORK_HERO_CACHE_STORE).get(MAPTORK_ATUALIZACOES_CACHE_KEY);
      pedido.onsuccess = function() { resolve(Array.isArray(pedido.result) ? pedido.result : []); };
      pedido.onerror = function() { reject(pedido.error || new Error("Erro ao ler cache.")); };
    });
    banco.close();
    return lista.map(normalizarAtualizacaoInicio).filter(function(item) { return !!item.id; });
  } catch (erro) {
    return [];
  }
}

async function carregarImagemAtualizacaoServidor(item) {
  if (!item || !item.id || !item.temImagem || item.dataUrl) return item;

  try {
    const resposta = await fetch(
      AUTH_API + "?action=obterImagemInicio&id=" + encodeURIComponent(item.id) + "&_t=" + Date.now(),
      { cache: "no-store" }
    );
    const dados = await resposta.json();
    if (dados && dados.ok === true) {
      item.dataUrl = String(dados.dataUrl || "").trim();
      item.url = String(dados.url || item.url || "").trim();
    }
  } catch (erro) {
    console.warn("Imagem da atualização indisponível:", item.id, erro);
  }
  return item;
}

async function preCarregarImagensAtualizacoes() {
  const lista = maptorkAtualizacoesInicio;
  if (!lista.length) return;

  // Duas imagens por vez para não travar celulares mais simples.
  let cursor = 0;
  async function trabalhador() {
    while (cursor < lista.length) {
      const indice = cursor++;
      await carregarImagemAtualizacaoServidor(lista[indice]);
      if (indice === maptorkAtualizacaoIndice) renderizarAtualizacaoInicioAtual();
    }
  }

  await Promise.all([trabalhador(), trabalhador()]);
  await salvarAtualizacoesInicioCacheLocal(lista);
  renderizarAtualizacaoInicioAtual();
}

async function carregarImagemInicioServidor(forcarAtualizacao) {
  const cache = await obterAtualizacoesInicioCacheLocal();

  if (!maptorkAtualizacoesInicio.length && cache.length) {
    maptorkAtualizacoesInicio = cache;
    maptorkAtualizacaoIndice = 0;
    renderizarAtualizacaoInicioAtual();
    iniciarRotacaoAtualizacoes();
  }

  try {
    const resposta = await fetch(
      AUTH_API + "?action=obterImagemInicio&_t=" + Date.now(),
      { cache: "no-store" }
    );
    const dados = await resposta.json();
    if (!dados || dados.ok !== true) {
      throw new Error((dados && dados.mensagem) || "Resposta inválida.");
    }

    let lista = Array.isArray(dados.atualizacoes)
      ? dados.atualizacoes.map(normalizarAtualizacaoInicio)
      : [];

    // Compatibilidade com o servidor antigo de atualização única.
    if (!lista.length && (dados.titulo || dados.texto || dados.link)) {
      lista = [normalizarAtualizacaoInicio({
        id: dados.id || "legacy",
        titulo: dados.titulo,
        texto: dados.texto,
        link: dados.link,
        url: dados.url,
        dataUrl: dados.dataUrl,
        temImagem: !!(dados.url || dados.dataUrl)
      })];
    }

    const cachePorId = Object.create(null);
    cache.forEach(function(item) {
      cachePorId[String(item.id)] = item;
    });

    lista.forEach(function(item) {
      const antigo = cachePorId[String(item.id)];
      if (antigo && antigo.dataUrl) item.dataUrl = antigo.dataUrl;
    });

    maptorkAtualizacoesInicio = lista.filter(function(item) { return !!item.id; });
    if (maptorkAtualizacaoIndice >= maptorkAtualizacoesInicio.length) maptorkAtualizacaoIndice = 0;

    renderizarAtualizacaoInicioAtual();
    renderizarAtualizacaoAdmin();
    iniciarRotacaoAtualizacoes();

    await preCarregarImagensAtualizacoes();
    return maptorkAtualizacoesInicio;
  } catch (erro) {
    console.warn("Não foi possível atualizar as novidades pelo servidor:", erro);
    renderizarAtualizacaoInicioAtual();
    renderizarAtualizacaoAdmin();
    iniciarRotacaoAtualizacoes();
    return maptorkAtualizacoesInicio;
  }
}

function mostrarMensagemImagemAdmin(texto, sucesso) {
  const msg = document.getElementById("adminImagemMensagem");
  if (!msg) return;
  const valor = String(texto || "").trim();

  if (!valor) {
    msg.textContent = "";
    msg.className = "diagnostic-result";
    msg.style.display = "none";
    return;
  }

  msg.style.display = "block";
  msg.className = sucesso
    ? "diagnostic-result success-box"
    : "diagnostic-result error-box";
  msg.textContent = valor;
}

function atualizarNomeArquivoImagemAdmin(texto) {
  const nome = document.getElementById("adminHeroImageNome");
  if (nome) nome.textContent = texto || "Nenhuma imagem selecionada";
}

function mostrarPreviewAtualizacaoAdmin(src) {
  const box = document.getElementById("adminHeroPreviewBox");
  const img = document.getElementById("adminHeroImagePreview");
  const valor = String(src || "").trim();

  if (!valor) {
    if (box) {
      box.style.display = "none";
      box.classList.add("is-empty");
    }
    if (img) img.removeAttribute("src");
    return;
  }

  if (box) {
    box.style.display = "flex";
    box.classList.remove("is-empty");
  }
  definirImagemComFallback(img, valor);
}

function limparSelecaoImagemAdmin(manterPreviewAtual) {
  maptorkHeroUploadSelecionado = null;
  const input = document.getElementById("adminHeroImageFile");
  if (input) input.value = "";
  atualizarNomeArquivoImagemAdmin("Nenhuma imagem selecionada");

  if (!manterPreviewAtual) {
    mostrarPreviewAtualizacaoAdmin("");
  }
}

function lerArquivoComoDataUrl(arquivo) {
  return new Promise(function(resolve, reject) {
    const leitor = new FileReader();
    leitor.onload = function() { resolve(String(leitor.result || "")); };
    leitor.onerror = function() { reject(new Error("Não foi possível ler a imagem.")); };
    leitor.readAsDataURL(arquivo);
  });
}

function carregarImagemDataUrl(dataUrl) {
  return new Promise(function(resolve, reject) {
    const img = new Image();
    img.onload = function() { resolve(img); };
    img.onerror = function() { reject(new Error("A imagem selecionada não pôde ser aberta.")); };
    img.src = dataUrl;
  });
}

function gerarNomeImagemUploadAdmin(nomeOriginal, mimeType) {
  let base = String(nomeOriginal || "maptork_atualizacao")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!base) base = "maptork_atualizacao";

  let ext = "jpg";
  if (mimeType === "image/png") ext = "png";
  if (mimeType === "image/webp") ext = "webp";
  return base + "." + ext;
}

function extrairBase64DeDataUrl(dataUrl) {
  const partes = String(dataUrl || "").split(",");
  return partes.length > 1 ? partes[1] : "";
}

function tamanhoBase64EmBytes(base64) {
  const valor = String(base64 || "");
  if (!valor) return 0;
  let padding = 0;
  if (valor.endsWith("==")) padding = 2;
  else if (valor.endsWith("=")) padding = 1;
  return Math.max(0, Math.floor((valor.length * 3) / 4) - padding);
}

async function prepararArquivoImagemAdmin(arquivo) {
  if (!arquivo) throw new Error("Escolha uma imagem do celular.");
  if (!String(arquivo.type || "").toLowerCase().startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem válido.");
  }
  if (arquivo.size > MAPTORK_IMAGEM_MAX_BYTES) {
    throw new Error("A imagem original deve ter no máximo 12 MB.");
  }

  const original = await lerArquivoComoDataUrl(arquivo);
  const imagem = await carregarImagemDataUrl(original);
  let largura = imagem.naturalWidth || imagem.width || 1;
  let altura = imagem.naturalHeight || imagem.height || 1;
  const escala = Math.min(1, MAPTORK_IMAGEM_MAX_LADO / largura, MAPTORK_IMAGEM_MAX_LADO / altura);
  largura = Math.max(1, Math.round(largura * escala));
  altura = Math.max(1, Math.round(altura * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");
  ctx.clearRect(0, 0, largura, altura);
  ctx.drawImage(imagem, 0, 0, largura, altura);

  let mimeType = String(arquivo.type || "").toLowerCase() === "image/png" ? "image/png" : "image/jpeg";
  let qualidade = mimeType === "image/png" ? undefined : 0.9;
  let dataUrl = canvas.toDataURL(mimeType, qualidade);
  let base64 = extrairBase64DeDataUrl(dataUrl);

  if (mimeType === "image/jpeg") {
    while (tamanhoBase64EmBytes(base64) > MAPTORK_IMAGEM_ALVO_PERSISTENCIA_BYTES && qualidade > 0.5) {
      qualidade = Number((qualidade - 0.08).toFixed(2));
      dataUrl = canvas.toDataURL("image/jpeg", qualidade);
      base64 = extrairBase64DeDataUrl(dataUrl);
    }
  } else if (tamanhoBase64EmBytes(base64) > MAPTORK_IMAGEM_ALVO_PERSISTENCIA_BYTES) {
    const qualidades = [0.9, 0.82, 0.74];
    for (let i = 0; i < qualidades.length; i++) {
      const webp = canvas.toDataURL("image/webp", qualidades[i]);
      if (webp.indexOf("data:image/webp") === 0) {
        dataUrl = webp;
        base64 = extrairBase64DeDataUrl(webp);
        mimeType = "image/webp";
        if (tamanhoBase64EmBytes(base64) <= MAPTORK_IMAGEM_ALVO_PERSISTENCIA_BYTES) break;
      }
    }
  }

  if (tamanhoBase64EmBytes(base64) > MAPTORK_IMAGEM_MAX_FINAL_BYTES) {
    throw new Error("A imagem ficou muito grande mesmo após a redução. Escolha outra imagem.");
  }

  return {
    fileName: gerarNomeImagemUploadAdmin(arquivo.name, mimeType),
    mimeType: mimeType,
    dataUrl: dataUrl,
    base64: base64
  };
}

async function aoSelecionarImagemAdmin() {
  const input = document.getElementById("adminHeroImageFile");
  if (!input || !input.files || !input.files[0]) {
    maptorkHeroUploadSelecionado = null;
    atualizarNomeArquivoImagemAdmin("Nenhuma imagem selecionada");
    return;
  }

  const arquivo = input.files[0];
  atualizarNomeArquivoImagemAdmin(arquivo.name || "Imagem selecionada");

  try {
    mostrarMensagemImagemAdmin("Preparando imagem...", true);
    maptorkHeroUploadSelecionado = await prepararArquivoImagemAdmin(arquivo);
    mostrarPreviewAtualizacaoAdmin(maptorkHeroUploadSelecionado.dataUrl);
    mostrarMensagemImagemAdmin("Imagem pronta para salvar.", true);
  } catch (erro) {
    console.error("Erro ao preparar imagem:", erro);
    maptorkHeroUploadSelecionado = null;
    if (input) input.value = "";
    atualizarNomeArquivoImagemAdmin("Nenhuma imagem selecionada");
    mostrarMensagemImagemAdmin((erro && erro.message) || "Não foi possível preparar a imagem selecionada.", false);
  }
}

function preencherFormularioAtualizacaoAdmin(item) {
  const dado = item || null;
  const id = document.getElementById("adminHeroAtualizacaoId");
  const titulo = document.getElementById("adminHeroTitulo");
  const texto = document.getElementById("adminHeroTexto");
  const link = document.getElementById("adminHeroLink");
  const botao = document.getElementById("adminSalvarImagemBtn");

  maptorkAtualizacaoEditandoId = dado ? String(dado.id || "").trim() : "";
  if (id) id.value = maptorkAtualizacaoEditandoId;
  if (titulo) titulo.value = dado ? dado.titulo : "";
  if (texto) texto.value = dado ? dado.texto : "";
  if (link) link.value = dado ? dado.link : "";

  maptorkHeroUploadSelecionado = null;
  const input = document.getElementById("adminHeroImageFile");
  if (input) input.value = "";

  if (dado) {
    atualizarNomeArquivoImagemAdmin("Imagem atual mantida (se não escolher outra)");
    mostrarPreviewAtualizacaoAdmin(dado.dataUrl || dado.url || "");
    if (botao) botao.textContent = "SALVAR ALTERAÇÕES";
  } else {
    atualizarNomeArquivoImagemAdmin("Nenhuma imagem selecionada");
    mostrarPreviewAtualizacaoAdmin("");
    if (botao) botao.textContent = "ADICIONAR ATUALIZAÇÃO";
  }
}

function limparFormularioAtualizacaoAdmin() {
  preencherFormularioAtualizacaoAdmin(null);
  mostrarMensagemImagemAdmin("", true);
}

function editarAtualizacaoInicioAdmin(id) {
  const item = maptorkAtualizacoesInicio.find(function(x) {
    return String(x.id) === String(id);
  });
  if (!item) return;

  preencherFormularioAtualizacaoAdmin(item);
  mostrarMensagemImagemAdmin("Editando: " + (item.titulo || "atualização"), true);
  const card = document.querySelector(".admin-image-card");
  if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderizarAtualizacaoAdmin() {
  const box = document.getElementById("adminAtualizacaoLista");
  if (!box) return;
  box.innerHTML = "";

  if (!maptorkAtualizacoesInicio.length) {
    box.innerHTML = '<div class="admin-tool-empty">Nenhuma atualização publicada.</div>';
    return;
  }

  maptorkAtualizacoesInicio.forEach(function(item) {
    const card = document.createElement("div");
    card.className = "admin-tool-item";

    const info = document.createElement("div");
    info.className = "admin-tool-item-info";

    const h4 = document.createElement("h4");
    h4.textContent = item.titulo || "Atualização";
    const p = document.createElement("p");
    p.textContent = item.texto || "";
    const small = document.createElement("small");
    small.textContent = item.link || "";

    info.appendChild(h4);
    info.appendChild(p);
    info.appendChild(small);

    const actions = document.createElement("div");
    actions.className = "admin-tool-item-actions";

    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "admin-tool-edit";
    editar.textContent = "EDITAR";
    editar.onclick = function() { editarAtualizacaoInicioAdmin(item.id); };

    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.className = "admin-tool-delete";
    excluir.textContent = "EXCLUIR";
    excluir.onclick = function() { excluirAtualizacaoInicioAdmin(item.id, item.titulo); };

    actions.appendChild(editar);
    actions.appendChild(excluir);
    card.appendChild(info);
    card.appendChild(actions);
    box.appendChild(card);
  });
}

async function salvarImagemInicioAdmin() {
  const botao = document.getElementById("adminSalvarImagemBtn");
  const token = localStorage.getItem("token") || "";
  const idCampo = String((document.getElementById("adminHeroAtualizacaoId") || {}).value || "").trim();
  const id = String(maptorkAtualizacaoEditandoId || idCampo || "").trim();
  const titulo = String((document.getElementById("adminHeroTitulo") || {}).value || "").trim();
  const texto = String((document.getElementById("adminHeroTexto") || {}).value || "").trim();
  const link = String((document.getElementById("adminHeroLink") || {}).value || "").trim();

  if (!token) return mostrarMensagemImagemAdmin("Sessão inválida. Entre novamente na conta.", false);
  if (!titulo || !texto || !link) return mostrarMensagemImagemAdmin("Preencha nome/cabeçalho, texto e link.", false);
  if (titulo.length > 80) return mostrarMensagemImagemAdmin("O nome/cabeçalho pode ter no máximo 80 caracteres.", false);
  if (texto.length > 500) return mostrarMensagemImagemAdmin("O texto pode ter no máximo 500 caracteres.", false);
  if (!/^https?:\/\//i.test(link)) return mostrarMensagemImagemAdmin("O link precisa começar com http:// ou https://.", false);

  const itemEditando = id ? maptorkAtualizacoesInicio.find(function(x) { return String(x.id) === id; }) : null;

  if (!maptorkHeroUploadSelecionado || !maptorkHeroUploadSelecionado.base64) {
    const input = document.getElementById("adminHeroImageFile");
    if (input && input.files && input.files[0]) {
      try {
        mostrarMensagemImagemAdmin("Preparando imagem...", true);
        maptorkHeroUploadSelecionado = await prepararArquivoImagemAdmin(input.files[0]);
      } catch (erro) {
        return mostrarMensagemImagemAdmin((erro && erro.message) || "Não foi possível preparar a imagem.", false);
      }
    }
  }

  if (!itemEditando && !maptorkHeroUploadSelecionado) {
    return mostrarMensagemImagemAdmin("Selecione uma imagem para a nova atualização.", false);
  }

  if (botao) {
    botao.disabled = true;
    botao.textContent = "SALVANDO...";
  }
  mostrarMensagemImagemAdmin(id ? "Salvando alterações..." : "Adicionando atualização...", true);

  try {
    const form = new URLSearchParams();
    form.set("action", "adminSalvarImagemInicio");
    form.set("token", token);
    if (id) {
      form.set("id", id);
      form.set("idAtualizacao", id);
      form.set("modo", "editar");
    } else {
      form.set("modo", "novo");
    }
    form.set("titulo", titulo);
    form.set("texto", texto);
    form.set("link", link);

    if (maptorkHeroUploadSelecionado && maptorkHeroUploadSelecionado.base64) {
      form.set("fileName", maptorkHeroUploadSelecionado.fileName);
      form.set("mimeType", maptorkHeroUploadSelecionado.mimeType);
      form.set("imageBase64", maptorkHeroUploadSelecionado.base64);
    }

    const resposta = await fetch(
      AUTH_API + "?action=adminSalvarImagemInicio" +
        (id ? "&id=" + encodeURIComponent(id) + "&idAtualizacao=" + encodeURIComponent(id) + "&modo=editar" : "&modo=novo") +
        "&_t=" + Date.now(),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form.toString()
      }
    );
    const dados = await resposta.json();

    if (!dados || dados.ok !== true) {
      return mostrarMensagemImagemAdmin((dados && dados.mensagem) || "Não foi possível salvar a atualização.", false);
    }

    // Atualiza o item local imediatamente. Assim a edição aparece na tela
    // mesmo antes da nova leitura do Google Script terminar.
    const idSalvo = String((dados && dados.id) || id || "").trim();
    if (idSalvo) {
      const existenteLocal = maptorkAtualizacoesInicio.find(function(x) {
        return String(x.id) === idSalvo;
      });
      const dataUrlNova = String((dados && dados.dataUrl) || "").trim();
      const urlNova = String((dados && dados.url) || "").trim();
      if (existenteLocal) {
        existenteLocal.titulo = titulo;
        existenteLocal.texto = texto;
        existenteLocal.link = link;
        if (dataUrlNova) existenteLocal.dataUrl = dataUrlNova;
        if (urlNova) existenteLocal.url = urlNova;
      } else {
        maptorkAtualizacoesInicio.unshift(normalizarAtualizacaoInicio({
          id: idSalvo,
          titulo: titulo,
          texto: texto,
          link: link,
          url: urlNova,
          dataUrl: dataUrlNova,
          temImagem: true
        }));
      }
      renderizarAtualizacaoInicioAtual();
      renderizarAtualizacaoAdmin();
      await salvarAtualizacoesInicioCacheLocal(maptorkAtualizacoesInicio);
    }

    limparFormularioAtualizacaoAdmin();
    await carregarImagemInicioServidor(true);
    mostrarMensagemImagemAdmin(id ? "Atualização editada com sucesso." : "Nova atualização adicionada com sucesso.", true);
  } catch (erro) {
    console.error("Erro ao salvar atualização:", erro);
    mostrarMensagemImagemAdmin("Erro ao conectar com o Google Script.", false);
  } finally {
    if (botao) {
      botao.disabled = false;
      const editandoCampo = String((document.getElementById("adminHeroAtualizacaoId") || {}).value || "").trim();
      const editando = String(maptorkAtualizacaoEditandoId || editandoCampo || "").trim();
      botao.textContent = editando ? "SALVAR ALTERAÇÕES" : "ADICIONAR ATUALIZAÇÃO";
    }
  }
}

async function excluirAtualizacaoInicioAdmin(id, titulo) {
  const token = localStorage.getItem("token") || "";
  if (!token) return mostrarMensagemImagemAdmin("Sessão inválida. Entre novamente na conta.", false);
  if (!id) return;

  if (!window.confirm('Excluir a atualização "' + String(titulo || "") + '"?')) return;

  try {
    const form = new URLSearchParams();
    form.set("action", "adminRestaurarImagemInicio");
    form.set("token", token);
    form.set("id", String(id));

    const resposta = await fetch(
      AUTH_API + "?action=adminRestaurarImagemInicio&_t=" + Date.now(),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: form.toString()
      }
    );
    const dados = await resposta.json();

    if (!dados || dados.ok !== true) {
      return mostrarMensagemImagemAdmin((dados && dados.mensagem) || "Não foi possível excluir a atualização.", false);
    }

    limparFormularioAtualizacaoAdmin();
    await carregarImagemInicioServidor(true);
    mostrarMensagemImagemAdmin("Atualização excluída.", true);
  } catch (erro) {
    console.error("Erro ao excluir atualização:", erro);
    mostrarMensagemImagemAdmin("Erro ao conectar com o Google Script.", false);
  }
}

// Mantido com o nome antigo apenas por compatibilidade com qualquer chamada antiga.
async function restaurarImagemInicioAdmin() {
  const item = obterAtualizacaoInicioAtual();
  if (item) return excluirAtualizacaoInicioAdmin(item.id, item.titulo);
}

async function prepararImagemAdmin() {
  await carregarImagemInicioServidor(false);
  limparFormularioAtualizacaoAdmin();
  renderizarAtualizacaoAdmin();
}


// ======================================================
// MENU DE CONFIGURAÇÕES DO ADMIN
// ======================================================

let adminConfigAtual = "";

function mostrarMenuAdmin() {
  adminConfigAtual = "";

  const menu = document.getElementById("adminConfigMenu");
  if (menu) menu.style.display = "block";

  document.querySelectorAll(".admin-config-panel").forEach(function(painel) {
    painel.classList.remove("is-open");
  });

  cancelarSenhaAdmin();

  const pagina = document.getElementById("admin");
  if (pagina) {
    pagina.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

async function abrirConfiguracaoAdmin(nome) {
  const alvo = String(nome || "").trim().toLowerCase();
  const mapa = {
    planos: "adminConfigPlanos",
    atualizacoes: "adminConfigAtualizacoes",
    ferramentas: "adminConfigFerramentas",
    usuarios: "adminConfigUsuarios"
  };

  const idPainel = mapa[alvo];
  if (!idPainel) return;

  adminConfigAtual = alvo;

  const menu = document.getElementById("adminConfigMenu");
  if (menu) menu.style.display = "none";

  document.querySelectorAll(".admin-config-panel").forEach(function(painel) {
    painel.classList.toggle("is-open", painel.id === idPainel);
  });

  const painel = document.getElementById(idPainel);
  if (painel) {
    painel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  try {
    if (alvo === "planos") {
      await carregarPrecosPlanos();
    } else if (alvo === "atualizacoes") {
      await prepararImagemAdmin();
    } else if (alvo === "ferramentas") {
      await carregarFerramentasAdmin();
    } else if (alvo === "usuarios") {
      await carregarUsuariosAdmin();
    }
  } catch (erro) {
    console.error("Erro ao abrir configuração do Admin:", erro);
  }
}


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

  mostrarMenuAdmin();
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


    const totalUsuarios =
      dados.usuarios.length;


    const totalPlanosAtivos =
      dados.usuarios.filter(
        function(usuario) {
          return (
            usuario.assinaturaAtiva ===
            true
          );
        }
      ).length;


    const textoUsuarios =
      totalUsuarios === 1
        ? "1 usuário"
        : totalUsuarios + " usuários";


    const textoPlanosAtivos =
      totalPlanosAtivos === 1
        ? "1 plano ativo"
        : totalPlanosAtivos + " planos ativos";


    mostrarAdminMensagem(
      textoUsuarios +
      " • " +
      textoPlanosAtivos +
      ".",
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


        let classeCorPlano =
          "";


        if (
          usuario.assinaturaAtiva === true
        ) {

          const planoNormalizado =
            String(
              usuario.plano || ""
            )
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toLowerCase();


          if (
            planoNormalizado.indexOf("mensal") !== -1
          ) {

            classeCorPlano =
              "admin-user-plan-mensal";

          } else if (
            planoNormalizado.indexOf("trimestral") !== -1
          ) {

            classeCorPlano =
              "admin-user-plan-trimestral";

          } else if (
            planoNormalizado.indexOf("anual") !== -1
          ) {

            classeCorPlano =
              "admin-user-plan-anual";

          } else {

            classeCorPlano =
              "admin-user-plan-active";

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

            <span class="${classeCorPlano}">
              ${escapeHtml(
                planoTexto
              )}
            </span>
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


  await carregarImagemInicioServidor(false);


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
// ACESSO ÀS FERRAMENTAS LOCAIS - SOMENTE ASSINANTES
// ======================================================
async function validarAcessoFerramentaAssinante(nomeFerramenta) {
  mostrarMensagemEsquema("Verificando sua assinatura...");

  try {
    const assinatura = await consultarAssinatura();

    if (assinatura && assinatura.ativo === true) {
      esconderMensagemEsquema();
      return true;
    }

    mostrarMensagemEsquema(
      "🔒 " + String(nomeFerramenta || "Esta ferramenta") +
      " é exclusiva para usuários com plano ativo.",
      true
    );

    setTimeout(function () {
      const botaoAssinaturas =
        document.querySelector('.nav button[onclick*="assinaturas"]') ||
        document.querySelectorAll(".nav button")[2] ||
        null;

      showPage("assinaturas", botaoAssinaturas);
    }, 1200);

    return false;
  } catch (erro) {
    console.error("Erro ao validar acesso da ferramenta:", erro);
    mostrarMensagemEsquema(
      "Não foi possível verificar sua assinatura. Tente novamente.",
      true
    );
    return false;
  }
}

// ======================================================
// MAPTORK - CALCULADORA DE PASTILHA DE VÁLVULA
// Fórmula: folga medida + pastilha atual - folga manual
// ======================================================
async function abrirCalculadoraPastilha() {
  if (!(await validarAcessoFerramentaAssinante("Calculadora de Pastilha"))) return;
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

function teclaCampoPastilha(evento, campo) {
  if (!evento) return;
  if (evento.key === "Enter") {
    evento.preventDefault();
    if (campo) campo.blur();
  }
}

function sanitizarCampoPastilha(campo) {
  if (!campo) return;

  const original = campo.textContent || "";
  let valor = original.replace(/[^0-9.,]/g, "");

  const primeiroSeparador = valor.search(/[.,]/);
  if (primeiroSeparador >= 0) {
    const inteiro = valor.slice(0, primeiroSeparador);
    const decimal = valor.slice(primeiroSeparador + 1).replace(/[.,]/g, "");
    valor = inteiro + valor[primeiroSeparador] + decimal;
  }

  valor = valor.slice(0, 7);

  if (valor !== original) {
    campo.textContent = valor;
    const selecao = window.getSelection();
    const faixa = document.createRange();
    faixa.selectNodeContents(campo);
    faixa.collapse(false);
    selecao.removeAllRanges();
    selecao.addRange(faixa);
  }
}

function lerNumeroPastilha(valor) {
  const normalizado = String(valor || "").trim().replace(",", ".");
  const numero = Number.parseFloat(normalizado);
  return Number.isFinite(numero) ? numero : NaN;
}

function calcularPastilha(campo) {
  const linha = campo.closest(".pastilha-linha");
  if (!linha) return;

  const folgaCampo = linha.querySelector(".pastilha-folga");
  const atualCampo = linha.querySelector(".pastilha-atual");
  const manualCampo = linha.querySelector(".pastilha-manual");

  const folga = lerNumeroPastilha(folgaCampo ? folgaCampo.textContent : "");
  const atual = lerNumeroPastilha(atualCampo ? atualCampo.textContent : "");
  const manual = lerNumeroPastilha(manualCampo ? manualCampo.textContent : "");
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

  calc.querySelectorAll(".pastilha-input").forEach((campo) => {
    campo.textContent = "";
  });
  calc.querySelectorAll(".pastilha-resultado strong").forEach((el) => el.textContent = "—");
}


// ======================================================\n// MAPTORK - CALCULADORA DE VALORES / IMPRESSAO EM PDF\n// ======================================================
const MAPTORK_VALORES_ESTADO = "maptork_calculadora_valores_estado_v3";
const MAPTORK_VALORES_REABRIR = "maptork_calculadora_valores_reabrir";

function capturarEstadoCalculadoraValores() {
  const itens = [];
  document.querySelectorAll("#valoresItens .valores-item").forEach((linha) => {
    itens.push({
      descricao: linha.querySelector(".valor-item-descricao")?.textContent || "",
      valor: linha.querySelector(".valor-item-valor")?.textContent || ""
    });
  });

  return {
    loja: document.getElementById("valoresLoja")?.textContent || "",
    vendedor: document.getElementById("valoresVendedor")?.textContent || "",
    clienteNome: document.getElementById("valoresClienteNome")?.textContent || "",
    clienteTelefone: document.getElementById("valoresClienteTelefone")?.textContent || "",
    clienteObs: document.getElementById("valoresClienteObs")?.textContent || "",
    itens
  };
}

function salvarEstadoCalculadoraValores() {
  try {
    localStorage.setItem(MAPTORK_VALORES_ESTADO, JSON.stringify(capturarEstadoCalculadoraValores()));
  } catch (erro) {
    console.warn("Não foi possível guardar a calculadora:", erro);
  }
}

function restaurarEstadoCalculadoraValores() {
  let estado = null;
  try {
    const bruto = localStorage.getItem(MAPTORK_VALORES_ESTADO);
    if (bruto) estado = JSON.parse(bruto);
  } catch (erro) {
    console.warn("Não foi possível restaurar a calculadora:", erro);
  }
  if (!estado || typeof estado !== "object") return false;

  const campos = {
    valoresLoja: estado.loja,
    valoresVendedor: estado.vendedor,
    valoresClienteNome: estado.clienteNome,
    valoresClienteTelefone: estado.clienteTelefone,
    valoresClienteObs: estado.clienteObs
  };
  Object.entries(campos).forEach(([id, valor]) => {
    const campo = document.getElementById(id);
    if (campo) campo.textContent = String(valor || "");
  });

  const lista = document.getElementById("valoresItens");
  if (lista && Array.isArray(estado.itens)) {
    lista.innerHTML = "";
    const itens = estado.itens.length ? estado.itens : [{}, {}, {}];
    itens.forEach((item) => adicionarItemValor(item?.descricao || "", item?.valor || "", false));
  }

  autoAjustarObservacao(document.getElementById("valoresClienteObs"));
  atualizarTotalValores();
  return true;
}

async function abrirCalculadoraValores() {
  if (!(await validarAcessoFerramentaAssinante("Calculadora de Valores"))) return;
  const calc = document.getElementById("calculadoraValores");
  const grid = document.getElementById("esquemasGrid");
  const aviso = document.querySelector("#esquemas .esquema-aviso");
  const pastilhaLauncher = document.querySelector("#esquemas .pastilha-launcher");
  const valoresLauncher = document.querySelector("#esquemas .valores-launcher");

  if (calc) calc.style.display = "block";
  prepararEditoresCalculadoraValores();
  restaurarEstadoCalculadoraValores();
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
  salvarEstadoCalculadoraValores();
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

function adicionarItemValor(descricao = "", valor = "", persistir = true) {
  const lista = document.getElementById("valoresItens");
  if (!lista) return;

  const linha = document.createElement("div");
  linha.className = "valores-item";
  linha.innerHTML = `
    <div class="valor-item-descricao valores-editor valores-editor-item" contenteditable="plaintext-only" inputmode="text" enterkeyhint="next" role="textbox" aria-label="Descrição do item" data-placeholder="Ex.: Troca de óleo" spellcheck="false"></div>
    <div class="valor-item-valor valores-editor valores-editor-item" contenteditable="plaintext-only" inputmode="decimal" enterkeyhint="done" role="textbox" aria-label="Valor do item" data-placeholder="0,00" spellcheck="false"></div>
    <button class="valores-remover" type="button" aria-label="Remover item">×</button>
  `;

  const campoDescricao = linha.querySelector(".valor-item-descricao");
  const campoValor = linha.querySelector(".valor-item-valor");
  const remover = linha.querySelector(".valores-remover");

  campoDescricao.textContent = descricao;
  campoValor.textContent = valor;
  campoValor.addEventListener("input", atualizarTotalValores);
  remover.addEventListener("click", () => {
    linha.remove();
    atualizarTotalValores();
    salvarEstadoCalculadoraValores();
  });

  lista.appendChild(linha);
  atualizarTotalValores();
  if (persistir) salvarEstadoCalculadoraValores();
}

function prepararEditoresCalculadoraValores() {
  const calc = document.getElementById("calculadoraValores");
  if (!calc || calc.dataset.editoresPreparados === "1") return;
  calc.dataset.editoresPreparados = "1";

  calc.addEventListener("keydown", (event) => {
    const campo = event.target.closest?.(".valores-editor:not(.valores-editor-multiline)");
    if (!campo) return;
    if (event.key === "Enter") {
      event.preventDefault();
      campo.blur();
    }
  });

  calc.addEventListener("paste", (event) => {
    const campo = event.target.closest?.(".valores-editor");
    if (!campo) return;
    event.preventDefault();
    const texto = (event.clipboardData || window.clipboardData)?.getData("text/plain") || "";
    document.execCommand("insertText", false, texto);
  });

  calc.addEventListener("input", (event) => {
    const campo = event.target.closest?.(".valores-editor");
    if (!campo) return;
    if (campo.classList.contains("valor-item-valor")) atualizarTotalValores();
    if (campo.id === "valoresClienteObs") autoAjustarObservacao(campo);
    salvarEstadoCalculadoraValores();
  });
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
    total += numeroValorBR(campo.textContent);
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
    if (campo) campo.textContent = "";
  });
  const lista = document.getElementById("valoresItens");
  if (!lista) return;
  lista.innerHTML = "";
  adicionarItemValor("", "", false);
  adicionarItemValor("", "", false);
  adicionarItemValor("", "", false);
  atualizarTotalValores();
  salvarEstadoCalculadoraValores();
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
    const descricao = linha.querySelector(".valor-item-descricao")?.textContent.trim() || "";
    const valorTexto = linha.querySelector(".valor-item-valor")?.textContent || "";
    const valor = numeroValorBR(valorTexto);
    if (!descricao && !valorTexto.trim()) return;
    linhas.push({ descricao: descricao || "Item", valor });
    total += valor;
  });

  return {
    itens: linhas,
    total,
    data: new Date().toLocaleDateString("pt-BR"),
    loja: document.getElementById("valoresLoja")?.textContent.trim() || "",
    vendedor: document.getElementById("valoresVendedor")?.textContent.trim() || "",
    clienteNome: document.getElementById("valoresClienteNome")?.textContent.trim() || "",
    clienteTelefone: document.getElementById("valoresClienteTelefone")?.textContent.trim() || "",
    clienteObs: document.getElementById("valoresClienteObs")?.textContent.trim() || ""
  };
}

function abrirPaginaValores(nomeArquivo, mensagemVazia) {
  salvarEstadoCalculadoraValores();
  const dados = coletarDadosCalculadoraValores();
  if (!dados.itens.length) {
    alert(mensagemVazia);
    return;
  }

  // Abre diretamente durante o clique do usuário. Isso é mais compatível
  // com Chrome/Android WebView do que disparar um clique artificial em link.
  const destino = nomeArquivo + "#" + encodeURIComponent(JSON.stringify(dados));

  // No aplicativo Android, usa a ponte nativa para abrir a página em uma
  // janela interna. Isso evita bloqueio de pop-up/target=_blank do WebView.
  try {
    if (window.AndroidApp && typeof window.AndroidApp.openInternalPage === "function") {
      window.AndroidApp.openInternalPage(destino);
      return;
    }
  } catch (erro) {
    console.warn("Abertura nativa indisponível:", erro);
  }

  try {
    const novaAba = window.open(destino, "_blank");
    if (novaAba) {
      try { novaAba.focus(); } catch (e) {}
      return;
    }
  } catch (erro) {
    console.warn("Não foi possível abrir uma nova aba:", erro);
  }

  // Fallback: se o navegador bloquear pop-up, abre na mesma tela.
  // Marca o retorno para reabrir automaticamente a calculadora com os dados salvos.
  try { sessionStorage.setItem(MAPTORK_VALORES_REABRIR, "1"); } catch (e) {}
  window.location.href = destino;
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



function reabrirCalculadoraValoresSeNecessario() {
  let reabrir = false;
  try {
    reabrir = sessionStorage.getItem(MAPTORK_VALORES_REABRIR) === "1";
    if (reabrir) sessionStorage.removeItem(MAPTORK_VALORES_REABRIR);
  } catch (e) {}

  if (!reabrir) return;

  restaurarEstadoCalculadoraValores();
  const botaoEsquemas = document.querySelector('.nav button[onclick*="esquemas"]');
  showPage("esquemas", botaoEsquemas || null);
  abrirCalculadoraValores();
}

// Mantém campos de senha desativados fora das páginas Conta/Admin.
document.addEventListener("DOMContentLoaded", function () {
  // Pré-carrega a lista e todas as imagens das ferramentas assim que o MAPTORK abre.
  // A navegação posterior usa somente o cache em memória desta sessão.
  carregarFerramentasDinamicas(false);
  const paginaVisivel = document.querySelector('.page:not([style*="display:none"])');
  configurarCamposCredenciaisPorPagina(paginaVisivel ? paginaVisivel.id : "inicio");

  // Restaura os valores se a página tiver sido realmente recarregada.
  restaurarEstadoCalculadoraValores();
  reabrirCalculadoraValoresSeNecessario();
});

// Também trata o botão Voltar quando o navegador recupera a página pelo
// cache de navegação (bfcache), situação em que DOMContentLoaded não roda de novo.
window.addEventListener("pageshow", function () {
  reabrirCalculadoraValoresSeNecessario();
});
