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

// ======================================================
// CONTROLE CENTRAL DE ACESSO
// Público: Início, Loja e leitura da Comunidade.
// Cadastrado gratuito: também pode editar nome e foto do próprio perfil.
// Assinante ativo: Manuais, Ferramentas, publicação, comentários e WhatsApp.
// ======================================================
function usuarioPossuiCadastroLocal() {
  return !!String(localStorage.getItem('token') || '').trim();
}

function irParaCadastro() {
  try { sessionStorage.setItem('maptork_acesso_pendente', String(window.MAPTORK_PAGINA_ATUAL || 'inicio')); } catch (e) {}
  window.location.href = 'cadastro.html';
}

function exigirCadastroParaAcao() {
  if (usuarioPossuiCadastroLocal()) return true;
  irParaCadastro();
  return false;
}

function abrirAssinaturasOuCadastro() {
  if (!usuarioPossuiCadastroLocal()) {
    irParaCadastro();
    return;
  }
  abrirContaAssinaturas();
}

function destinoAcessoPremium() {
  return usuarioPossuiCadastroLocal() ? 'assinatura' : 'cadastro';
}

async function exigirAssinaturaAtiva(nomeRecurso) {
  if (!usuarioPossuiCadastroLocal()) {
    irParaCadastro();
    return false;
  }

  const assinatura = assinaturaAtual.carregada
    ? assinaturaAtual
    : await consultarAssinatura();

  if (assinatura && assinatura.ativo === true) return true;

  // Não exibe aviso de bloqueio na tela de Ferramentas.
  // O próprio redirecionamento para cadastro/assinatura já informa a regra de acesso.
  abrirContaAssinaturas();
  return false;
}

async function abrirFerramentasProtegidas(btn) {
  if (!(await exigirAssinaturaAtiva('Ferramentas'))) return;
  showPage('esquemas', btn || null, true);
}

async function abrirManuaisProtegidos(btn) {
  if (!(await exigirAssinaturaAtiva('Manuais'))) return;
  showPage('manuais', btn || null, true);
}

function showPage(id, btn, ignorarProtecao) {
  if (!ignorarProtecao) {
    // Manuais e Ferramentas ficam visíveis para todos.
    // A proteção acontece somente quando a pessoa tenta ABRIR um manual
    // ou ACESSAR uma ferramenta: visitante vai para cadastro; usuário
    // gratuito vai para assinatura; assinante ativo recebe acesso.
    if ((id === 'conta' || id === 'assinaturas') && !usuarioPossuiCadastroLocal()) {
      irParaCadastro();
      return;
    }
  }

  window.MAPTORK_PAGINA_ATUAL = id;

  if (id !== 'comunidade' && typeof comunidadePausarTodosVideos === 'function') {
    comunidadePausarTodosVideos();
  }

  document.body.setAttribute("data-page", id);

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

  if (id === "inicio") {
    if (typeof atualizarOfertaInicio === "function") {
      atualizarOfertaInicio(assinaturaAtual);
    }
    if (typeof consultarAssinatura === "function") {
      consultarAssinatura().catch(function(){});
    }
    if (typeof carregarComunidadePublica === "function") {
      carregarComunidadePublica(false).then(function(lista){
        if (typeof renderizarNovosPostsInicio === "function") {
          renderizarNovosPostsInicio(lista);
        }
      }).catch(function(){});
    }
    if (typeof renderizarLojaInicio === "function") renderizarLojaInicio();
    if (typeof preCarregarLoja === "function") preCarregarLoja(false);
  }

  if (id === "comunidade") {
    if (typeof comunidadeDefinirVisao === 'function') {
      comunidadeDefinirVisao('list');
    }
    if (typeof carregarComunidadePublica === "function") {
      carregarComunidadePublica(false);
    }
  }

  if (id === "loja") {
    if (typeof renderizarLojaPublica === "function") renderizarLojaPublica();
    if (typeof preCarregarLoja === "function") preCarregarLoja(false);
  }

  if (id === "esquemas") {
    // Limpa qualquer aviso antigo para a vitrine de Ferramentas abrir sem banner de bloqueio.
    const mensagemFerramentas = document.getElementById("esquemasMensagem");
    if (mensagemFerramentas) {
      mensagemFerramentas.textContent = "";
      mensagemFerramentas.style.display = "none";
      mensagemFerramentas.classList.remove("error-box", "success-box");
    }

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

  if (id === "conta") {
    if (typeof fecharPaineisConta === "function") {
      fecharPaineisConta();
    }

    if (typeof atualizarResumoPerfil === "function") {
      atualizarResumoPerfil(assinaturaAtual);
    }

    if (typeof consultarAssinatura === "function") {
      consultarAssinatura().then(function(info) {
        if (typeof atualizarResumoPerfil === "function") {
          atualizarResumoPerfil(info);
        }
      }).catch(function() {
        if (typeof atualizarResumoPerfil === "function") {
          atualizarResumoPerfil(assinaturaAtual);
        }
      });
    }
    if (typeof carregarMeuPerfilComunidade === 'function') carregarMeuPerfilComunidade();
    if (typeof carregarMeusPostsComunidade === 'function') carregarMeusPostsComunidade();
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


  const botaoAlvo = document.querySelector('.nav button[onclick*="\'' + id + '\'"]') || botoes[index] || null;

  showPage(
    id,
    botaoAlvo
  );
}


function obterBotaoContaMenu() {
  return document.querySelector('.nav button[onclick*="conta"]') || null;
}


function abrirContaAssinaturas() {
  if (!usuarioPossuiCadastroLocal()) {
    irParaCadastro();
    return;
  }
  showPage("assinaturas", obterBotaoContaMenu(), true);
}

function voltarDosPlanos() {
  showPage("conta", obterBotaoContaMenu());
}


function abrirWhatsAppSuporte() {
  const url = "https://wa.me/5561995906710";
  if (window.AndroidApp && typeof window.AndroidApp.openExternal === "function") {
    window.AndroidApp.openExternal(url);
    return;
  }
  window.location.href = url;
}


// ======================================================
// VOLTAR INTERNO DO APP / SITE
// ======================================================
window.maptorkVoltarInterno = function() {
  const calcValores = document.getElementById("calculadoraValores");
  if (calcValores && calcValores.style.display !== "none" && getComputedStyle(calcValores).display !== "none") {
    fecharCalculadoraValores();
    return true;
  }

  const calcPastilha = document.getElementById("calculadoraPastilha");
  if (calcPastilha && calcPastilha.style.display !== "none" && getComputedStyle(calcPastilha).display !== "none") {
    fecharCalculadoraPastilha();
    return true;
  }

  const atual = String(window.MAPTORK_PAGINA_ATUAL || "inicio");

  if (atual === "conta" && typeof contaPainelAtual !== "undefined" && contaPainelAtual) {
    fecharPaineisConta();
    return true;
  }

  if (atual === "suporte") {
    voltarSuporteParaPerfil();
    return true;
  }

  if (atual !== "inicio") {
    const botaoInicio = document.querySelector('.nav button[onclick*="inicio"]');
    showPage("inicio", botaoInicio || null);
    return true;
  }

  return false;
};


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
  const input = document.getElementById("driveSearch");
  const status = document.getElementById("driveStatus");
  const results = document.getElementById("driveResults");

  if (!input || !status || !results) {
    return;
  }

  const setDriveStatusState = function(state) {
    status.classList.remove("status-found", "status-error", "status-info");
    if (state) status.classList.add(state);
  };

  const q = String(
    typeof input.value === "string"
      ? input.value
      : (input.innerText || input.textContent || "")
  ).trim();

  if (!q) {
    status.style.display = "block";
    setDriveStatusState("status-info");
    status.innerHTML = "Digite a marca ou modelo.";
    results.innerHTML = "";
    return;
  }

  status.style.display = "block";
  setDriveStatusState("status-info");
  status.innerHTML = "Pesquisando no Google Drive...";
  results.innerHTML = `
    <div class="pdf-card pdf-loading">
      <div class="loader"></div>
      <p>Pesquisando arquivos...</p>
    </div>
  `;

  try {
    const response = await fetch(
      DRIVE_API_URL + "?q=" + encodeURIComponent(q)
    );

    const data = await response.json();

    if (!data.ok || !data.files || !data.files.length) {
      setDriveStatusState("status-error");
      status.innerHTML = "Nenhum PDF encontrado.";
      results.innerHTML = "";
      return;
    }

    setDriveStatusState("status-found");
    status.innerHTML = data.files.length + " arquivo(s) encontrado(s).";
    results.innerHTML = "";

    data.files.forEach(function(file) {
      const card = document.createElement("div");
      card.className = "pdf-card";
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-label", "Abrir manual " + (file.name || "Manual"));

      const icon = document.createElement("div");
      icon.className = "pdf-icon";
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 3.75h5.5L18.25 8.5V19A2.25 2.25 0 0 1 16 21.25H8A2.25 2.25 0 0 1 5.75 19V6A2.25 2.25 0 0 1 8 3.75Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.5 3.75V8.5H18.25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 12.25h6M9 15.25h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`;

      const copy = document.createElement("div");
      copy.className = "pdf-copy";

      const titulo = document.createElement("div");
      titulo.className = "pdf-title";
      titulo.textContent = file.name || "Manual";

      const meta = document.createElement("div");
      meta.className = "pdf-meta";
      const sizeText = formatManualFileSize(
        file.size || file.fileSize || file.tamanho || file.bytes || file.sizeBytes || file.file_size
      );
      meta.innerHTML = sizeText
        ? `<span>PDF</span><span class="dot">•</span><span>${escapeHtml(sizeText)}</span>`
        : `<span>PDF</span>`;

      copy.appendChild(titulo);
      copy.appendChild(meta);

      const action = document.createElement("div");
      action.className = "pdf-action";
      action.innerHTML = `
        <span class="pdf-open">Abrir</span>
        <svg class="pdf-crown" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 17.5h15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M6.2 15.8 4.8 8.7l4.6 2.9L12 5.8l2.6 5.8 4.6-2.9-1.4 7.1Z" fill="currentColor" opacity=".95"/>
          <path d="M6.2 15.8h11.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>`;

      const open = function() {
        openPdf(file.url);
      };

      card.onclick = open;
      card.onkeydown = function(event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      };

      card.appendChild(icon);
      card.appendChild(copy);
      card.appendChild(action);
      results.appendChild(card);
    });

    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  } catch (erro) {
    console.error("Erro ao pesquisar:", erro);
    status.innerHTML = "Erro ao pesquisar.";
    results.innerHTML = "";
  }
}


function formatManualFileSize(value) {
  if (value == null || value === "") return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/[a-zA-Z]/.test(trimmed) && /B/.test(trimmed)) return trimmed.toUpperCase().replace(/\s+/g, " ");
    const normalized = trimmed.replace(/\./g, "").replace(/,/g, ".");
    const numeric = Number(normalized);
    if (!Number.isNaN(numeric)) {
      return formatManualFileSize(numeric);
    }
    return trimmed;
  }

  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  const decimals = size >= 100 || unit === 0 ? 0 : 1;
  return size.toFixed(decimals) + " " + units[unit];
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
// OFERTA INTELIGENTE DE PLANO NO INÍCIO
// ======================================================
let planoOferecidoInicio = "mensal";

function atualizarOfertaInicio(assinatura) {
  const statusEl = document.getElementById("ofertaPlanoStatus");
  const tituloEl = document.getElementById("ofertaPlanoTitulo");
  const chamadaEl = document.getElementById("ofertaPlanoChamada");
  const descricaoEl = document.getElementById("ofertaPlanoDescricao");
  const botaoEl = document.getElementById("ofertaPlanoBotao");

  if (!statusEl || !tituloEl || !chamadaEl || !descricaoEl || !botaoEl) return;

  if (!usuarioPossuiCadastroLocal()) {
    statusEl.textContent = "ACESSO LIVRE";
    tituloEl.textContent = "Conheça o MAPTORK";
    chamadaEl.textContent = "Navegue pelo site e crie sua conta quando quiser";
    descricaoEl.textContent = "Manuais e Comunidade podem ser explorados. Recursos premium são liberados com assinatura.";
    botaoEl.textContent = "Criar conta";
    botaoEl.dataset.destino = "cadastro";
    planoOferecidoInicio = "mensal";
    return;
  }

  const info = assinatura && typeof assinatura === "object" ? assinatura : assinaturaAtual;
  const ativo = !!(info && info.ativo);
  const planoAtual = normalizarPlano(info && info.plano);
  const dias = Math.max(0, Number((info && info.diasRestantes) || 0));
  const diasTexto = dias === 1 ? "1 DIA" : dias + " DIAS";

  statusEl.textContent = "SEM PLANO";
  tituloEl.textContent = "Plano Mensal";
  chamadaEl.textContent = "Comece com 1 mês de acesso completo";
  descricaoEl.textContent = "Manuais, ferramentas e conteúdo premium do MAPTORK.";
  botaoEl.textContent = "Ver plano";
  planoOferecidoInicio = "mensal";
  botaoEl.dataset.destino = "plano";

  if (!ativo) return;

  if (info.acessoAdmin === true || planoAtual.includes("administrador")) {
    statusEl.textContent = "ACESSO ADMINISTRADOR";
    tituloEl.textContent = "Conta administrativa";
    chamadaEl.textContent = "Acesso completo ao MAPTORK";
    descricaoEl.textContent = "Sua conta administrativa possui acesso a todos os recursos.";
    botaoEl.textContent = "Ver perfil";
    planoOferecidoInicio = "administrador";
    botaoEl.dataset.destino = "perfil";
    return;
  }

  if (planoAtual.includes("anual")) {
    statusEl.textContent = "SEU PLANO: ANUAL • " + diasTexto;
    tituloEl.textContent = "Plano Anual";
    chamadaEl.textContent = "Você já está no maior período disponível";
    descricaoEl.textContent = "Sua assinatura anual está ativa. Consulte os detalhes no Perfil.";
    botaoEl.textContent = "Ver assinatura";
    planoOferecidoInicio = "anual";
    botaoEl.dataset.destino = "perfil";
    return;
  }

  if (planoAtual.includes("trimestral")) {
    statusEl.textContent = "SEU PLANO: TRIMESTRAL • " + diasTexto;
    tituloEl.textContent = "Plano Anual";
    chamadaEl.textContent = "Suba para 1 ano de acesso completo";
    descricaoEl.textContent = "Mais tempo de acesso e o melhor custo-benefício do MAPTORK.";
    botaoEl.textContent = "Ver anual";
    planoOferecidoInicio = "anual";
    botaoEl.dataset.destino = "plano";
    return;
  }

  statusEl.textContent = "SEU PLANO: MENSAL • " + diasTexto;
  tituloEl.textContent = "Plano Trimestral";
  chamadaEl.textContent = "Suba para 3 meses de acesso";
  descricaoEl.textContent = "Tenha mais tempo de acesso e menos renovações durante o uso.";
  botaoEl.textContent = "Ver trimestral";
  planoOferecidoInicio = "trimestral";
  botaoEl.dataset.destino = "plano";
}

function abrirPlanoOferecidoInicio() {
  const botao = document.getElementById("ofertaPlanoBotao");
  if (botao && botao.dataset.destino === "cadastro") {
    irParaCadastro();
    return;
  }
  if (botao && botao.dataset.destino === "perfil") {
    const navPerfil = document.querySelector('.nav button[onclick*="conta"]');
    showPage("conta", navPerfil || null);
    return;
  }

  showPage("assinaturas", null);

  document.querySelectorAll('.plano-card[data-plano]').forEach(function(card) {
    card.classList.remove("plano-recomendado-inicio");
  });

  const alvo = document.querySelector('.plano-card[data-plano="' + planoOferecidoInicio + '"]');
  if (alvo) {
    alvo.classList.add("plano-recomendado-inicio");
    setTimeout(function() {
      try {
        alvo.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) {
        alvo.scrollIntoView();
      }
    }, 80);
  }
}


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

function usuarioAtualEhAdmin() {
  const email = obterEmailUsuario();
  return !!(
    (window.usuarioAtual && window.usuarioAtual.admin === true) ||
    email === "maptork@gmail.com"
  );
}

function normalizarRespostaAssinatura(dados) {
  const raiz = dados && dados.dados && typeof dados.dados === "object" ? dados.dados : (dados || {});
  const info = raiz.assinatura && typeof raiz.assinatura === "object"
    ? raiz.assinatura
    : (raiz.planoAtual && typeof raiz.planoAtual === "object" ? raiz.planoAtual : raiz);
  const status = String(info.status || raiz.status || "").trim().toUpperCase();
  const ativoBruto = info.ativo !== undefined ? info.ativo
    : (info.assinaturaAtiva !== undefined ? info.assinaturaAtiva
    : (raiz.ativo !== undefined ? raiz.ativo : raiz.assinaturaAtiva));
  const ativo = ativoBruto === true || String(ativoBruto).toLowerCase() === "true" || status === "ATIVO" || status === "ACTIVE";
  return {
    ativo: ativo,
    plano: info.plano || info.tipoPlano || raiz.plano || raiz.tipoPlano || null,
    diasRestantes: Number(info.diasRestantes || info.dias_restantes || raiz.diasRestantes || raiz.dias_restantes || 0),
    vencimento: info.vencimento || info.dataVencimento || raiz.vencimento || raiz.dataVencimento || "",
    status: status
  };
}

function acessoAdministradorComoAssinante() {
  return {
    carregada: true,
    ativo: true,
    plano: "administrador",
    diasRestantes: 0,
    vencimento: "",
    status: "ADMINISTRADOR",
    acessoAdmin: true
  };
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

    atualizarOfertaInicio(assinaturaAtual);

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


    const assinaturaRecebida = normalizarRespostaAssinatura(dados);
    assinaturaAtual = {
      carregada: true,
      ativo: assinaturaRecebida.ativo,
      plano: assinaturaRecebida.plano,
      diasRestantes: assinaturaRecebida.diasRestantes,
      vencimento: assinaturaRecebida.vencimento,
      status: assinaturaRecebida.status
    };

    if (!assinaturaAtual.ativo && usuarioAtualEhAdmin()) {
      assinaturaAtual = acessoAdministradorComoAssinante();
    }

    atualizarOfertaInicio(assinaturaAtual);

    return assinaturaAtual;


  } catch (erro) {

    console.error(
      "Erro ao consultar assinatura:",
      erro
    );


    if (usuarioAtualEhAdmin()) {
      assinaturaAtual = acessoAdministradorComoAssinante();
    } else {
      assinaturaAtual.carregada = true;
    }

    atualizarOfertaInicio(assinaturaAtual);

    return assinaturaAtual;
  }
}


// ======================================================
// ABRIR PDF
// ======================================================

async function openPdf(url) {
  localStorage.setItem("maptork_manual_pendente", url);

  if (!usuarioPossuiCadastroLocal()) {
    irParaCadastro();
    return;
  }

  if (!(await exigirAssinaturaAtiva("Abertura e download de manuais"))) return;

  localStorage.removeItem("maptork_manual_pendente");
  window.open(url, "_blank");
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
  // CONTROLE DE ACESSO
  // ----------------------------------------------

  if (!(await exigirAssinaturaAtiva(nome))) return;

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

        abrirContaAssinaturas(
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
/* Fluxo antigo de senha removido na reorganização profissional do Perfil.
   A única alteração de senha agora é salvarDadosPessoaisConta(). */
/*
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
*/


// ======================================================
// EXCLUIR MINHA CONTA
// ======================================================

async function excluirMinhaConta() {

  const token =
    localStorage.getItem(
      "token"
    );


  if (!token) {
    irParaCadastro();
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
          "index.html"
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
let adminFerramentaImagemSelecaoSeq = 0;

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

  const arquivo = input.files[0];
  const seq = ++adminFerramentaImagemSelecaoSeq;
  let rapida = '';
  try {
    rapida = URL.createObjectURL(arquivo);
    atualizarNomeImagemFerramentaAdmin(arquivo.name || "Imagem selecionada");
    if (preview) preview.src = rapida;
    if (previewBox) previewBox.style.display = "flex";
    mostrarMensagemFerramentaAdmin("Imagem selecionada.", true);
    const preparada = await prepararImagemFerramentaAdmin(arquivo);
    if (seq !== adminFerramentaImagemSelecaoSeq) return;
    adminFerramentaImagemSelecionada = preparada;
    if (preview) preview.src = adminFerramentaImagemSelecionada.dataUrl;
    mostrarMensagemFerramentaAdmin("Imagem pronta.", true);
  } catch (erro) {
    adminFerramentaImagemSelecionada = null;
    mostrarMensagemFerramentaAdmin((erro && erro.message) || "Erro ao preparar imagem.", false);
  } finally {
    if (rapida) try { URL.revokeObjectURL(rapida); } catch (_) {}
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
  adminFerramentaImagemSelecaoSeq++;
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

  // Na primeira abertura da sessão busca a lista no servidor para evitar
  // reaparecer ferramenta já excluída por causa do cache local.
  // Depois disso, a navegação entre abas usa o cache desta sessão.
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
      let lista = dados && dados.ok === true && Array.isArray(dados.ferramentas)
        ? dados.ferramentas
        : [];
      lista = maptorkMesclarPendentesServidor(lista, ferramentasDinamicasCache);

      // Reaproveita apenas as imagens em cache cujos IDs ainda existem no servidor.
      const cacheLocal = await obterFerramentasCacheLocal();
      const cacheLocalPorId = Object.create(null);
      cacheLocal.forEach(function(item) {
        cacheLocalPorId[String(item.id || "")] = item;
      });
      const novasImagensCache = Object.create(null);
      lista.forEach(function(item) {
        const id = String((item && item.id) || "");
        const antigo = cacheLocalPorId[id];
        if (antigo && antigo.dataUrl) novasImagensCache[id] = antigo.dataUrl;
      });
      ferramentasImagensCache = novasImagensCache;

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
      if (!ferramentasDinamicasCache.length) {
        await aplicarFerramentasCacheLocalUmaVez();
      }
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
  if (/^local-tool-/i.test(String(id || ''))) {
    mostrarMensagemEsquema('Ferramenta adicionada. Sincronizando acesso...', false);
    return;
  }
  esconderMensagemEsquema();
  if (!(await exigirAssinaturaAtiva(String(titulo || "Ferramenta")))) return;
  mostrarMensagemEsquema("Verificando sua assinatura...");
  const token = String(localStorage.getItem("token") || "").trim();

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
          abrirContaAssinaturas();
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
  const input = document.getElementById("adminFerramentaImagemFile");
  const arquivoPendente = input && input.files && input.files[0] ? input.files[0] : null;

  if (!token) return mostrarMensagemFerramentaAdmin("Sessão inválida. Entre novamente.", false);
  if (!titulo || !texto || !link) return mostrarMensagemFerramentaAdmin("Preencha nome, texto e link.", false);
  if (!/^https?:\/\//i.test(link)) return mostrarMensagemFerramentaAdmin("O link precisa começar com http:// ou https://.", false);
  if (!id && !adminFerramentaImagemSelecionada && !arquivoPendente) return mostrarMensagemFerramentaAdmin("Selecione uma imagem para a nova ferramenta.", false);

  const existenteAdmin = ferramentasAdminCache.find(function(x){ return String(x && x.id || '') === id; }) || null;
  const existentePublico = ferramentasDinamicasCache.find(function(x){ return String(x && x.id || '') === id; }) || null;
  const localId = id || maptorkSyncTempId('tool');
  const selecionada = adminFerramentaImagemSelecionada;
  let dataUrlLocal = selecionada && selecionada.dataUrl ? selecionada.dataUrl : (ferramentasImagensCache[id] || '');
  let blobLocal = '';
  if (!dataUrlLocal && arquivoPendente) {
    try { blobLocal = URL.createObjectURL(arquivoPendente); dataUrlLocal = blobLocal; } catch(_) {}
  }

  const payloadBase = {
    token:token,id:id,localId:localId,titulo:titulo,texto:texto,link:link,
    temImagem:!!(selecionada || arquivoPendente || (existenteAdmin && existenteAdmin.temImagem) || (existentePublico && existentePublico.temImagem)),
    dataUrl:dataUrlLocal,
    imageBase64:selecionada ? selecionada.base64 : '',
    fileName:selecionada ? selecionada.fileName : '',
    mimeType:selecionada ? selecionada.mimeType : ''
  };

  maptorkAplicarFerramentaLocal(payloadBase);
  limparFormularioFerramentaAdmin();
  mostrarMensagemFerramentaAdmin(id ? "Ferramenta atualizada." : "Ferramenta adicionada.", true);

  const enfileirar = async function(payload){
    if (blobLocal && payload.dataUrl !== blobLocal) try { URL.revokeObjectURL(blobLocal); } catch(_) {}
    maptorkAplicarFerramentaLocal(payload);
    await maptorkSyncEnfileirar('tool-save','tool-save:'+localId,payload);
  };

  if (arquivoPendente && !selecionada) {
    setTimeout(async function(){
      try {
        const img = await prepararImagemFerramentaAdmin(arquivoPendente);
        await enfileirar(Object.assign({},payloadBase,{dataUrl:img.dataUrl,imageBase64:img.base64,fileName:img.fileName,mimeType:img.mimeType}));
      } catch(e) {
        mostrarMensagemFerramentaAdmin((e.message||'Erro ao preparar imagem.')+' A ferramenta continua visível localmente.',false);
      }
    },0);
  } else {
    enfileirar(payloadBase);
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
    ferramentasAdminCache = maptorkMesclarPendentesServidor(Array.isArray(dados.ferramentas) ? dados.ferramentas : [], ferramentasAdminCache);
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
// LOJA MAPTORK
// Mesmo fluxo das Novas Ferramentas: Admin cadastra/edita/exclui,
// imagens ficam em cache e a Loja aparece também na tela inicial.
// ======================================================
let lojaProdutosCache = [];
let lojaImagensCache = Object.create(null);
let lojaCarregando = null;
let lojaCarregadaNestaSessao = false;
let lojaAdminCache = [];
let adminLojaImagemSelecionada = null;
let adminLojaImagemSelecaoSeq = 0;
let lojaCacheLocalCarregado = false;
let lojaInicioIndice = 0;
let lojaInicioTimer = null;
let lojaRetryTimer = null;
let lojaRetryTentativas = 0;
const MAPTORK_LOJA_CACHE_KEY = "storeProductsV1";
const MAPTORK_LOJA_INTERVALO_MS = 7000;

function normalizarProdutoLoja(item) {
  const dado = item || {};
  return {
    id: String(dado.id || "").trim(),
    titulo: String(dado.titulo || "").trim(),
    texto: String(dado.texto || "").trim(),
    preco: String(dado.preco || "").trim(),
    link: String(dado.link || "").trim(),
    temImagem: dado.temImagem === true,
    dataUrl: String(dado.dataUrl || "").trim()
  };
}

async function salvarLojaCacheLocal() {
  try {
    const lista = (Array.isArray(lojaProdutosCache) ? lojaProdutosCache : []).map(function(item) {
      return {
        id: String(item.id || ""),
        titulo: String(item.titulo || ""),
        texto: String(item.texto || ""),
        preco: String(item.preco || ""),
        link: String(item.link || ""),
        temImagem: item.temImagem === true,
        dataUrl: lojaImagensCache[String(item.id || "")] || ""
      };
    });
    const banco = await abrirBancoCacheFerramentas();
    await new Promise(function(resolve, reject) {
      const tx = banco.transaction(MAPTORK_FERRAMENTAS_CACHE_STORE, "readwrite");
      tx.objectStore(MAPTORK_FERRAMENTAS_CACHE_STORE).put(lista, MAPTORK_LOJA_CACHE_KEY);
      tx.oncomplete = resolve;
      tx.onerror = function() { reject(tx.error || new Error("Erro ao salvar cache da Loja.")); };
      tx.onabort = function() { reject(tx.error || new Error("Cache da Loja cancelado.")); };
    });
    banco.close();
  } catch (erro) {
    console.warn("Não foi possível salvar o cache da Loja:", erro);
  }
}

async function obterLojaCacheLocal() {
  try {
    const banco = await abrirBancoCacheFerramentas();
    const lista = await new Promise(function(resolve, reject) {
      const tx = banco.transaction(MAPTORK_FERRAMENTAS_CACHE_STORE, "readonly");
      const pedido = tx.objectStore(MAPTORK_FERRAMENTAS_CACHE_STORE).get(MAPTORK_LOJA_CACHE_KEY);
      pedido.onsuccess = function() { resolve(Array.isArray(pedido.result) ? pedido.result : []); };
      pedido.onerror = function() { reject(pedido.error || new Error("Erro ao ler cache da Loja.")); };
    });
    banco.close();
    return lista.map(normalizarProdutoLoja).filter(function(item) { return !!item.id; });
  } catch (erro) {
    return [];
  }
}

async function aplicarLojaCacheLocalUmaVez() {
  if (lojaCacheLocalCarregado) return;
  lojaCacheLocalCarregado = true;
  const cache = await obterLojaCacheLocal();
  if (!cache.length) return;
  lojaProdutosCache = cache.map(function(item) {
    if (item.dataUrl) lojaImagensCache[String(item.id)] = item.dataUrl;
    return {
      id: item.id,
      titulo: item.titulo,
      texto: item.texto,
      preco: item.preco,
      link: item.link,
      temImagem: item.temImagem
    };
  });
  renderizarLojaPublica();
  renderizarLojaInicio();
}

function mostrarMensagemLojaAdmin(texto, sucesso) {
  const box = document.getElementById("adminLojaMensagem");
  if (!box) return;
  box.textContent = texto || "";
  box.className = "diagnostic-result" + (texto ? (sucesso ? " success-box" : " error-box") : "");
  box.style.display = texto ? "block" : "none";
}

function atualizarNomeImagemLojaAdmin(texto) {
  const box = document.getElementById("adminLojaImagemNome");
  if (box) box.textContent = texto || "Nenhuma imagem selecionada";
}

async function aoSelecionarImagemLojaAdmin() {
  const input = document.getElementById("adminLojaImagemFile");
  const preview = document.getElementById("adminLojaImagemPreview");
  const previewBox = document.getElementById("adminLojaPreviewBox");
  if (!input || !input.files || !input.files[0]) {
    adminLojaImagemSelecionada = null;
    atualizarNomeImagemLojaAdmin("Nenhuma imagem selecionada");
    return;
  }
  const arquivo = input.files[0];
  const seq = ++adminLojaImagemSelecaoSeq;
  let rapida = '';
  try {
    rapida = URL.createObjectURL(arquivo);
    atualizarNomeImagemLojaAdmin(arquivo.name || "Imagem selecionada");
    if (preview) preview.src = rapida;
    if (previewBox) previewBox.style.display = "flex";
    mostrarMensagemLojaAdmin("Imagem selecionada.", true);
    const preparada = await prepararImagemFerramentaAdmin(arquivo);
    if (seq !== adminLojaImagemSelecaoSeq) return;
    adminLojaImagemSelecionada = preparada;
    if (preview) preview.src = adminLojaImagemSelecionada.dataUrl;
    mostrarMensagemLojaAdmin("Imagem pronta.", true);
  } catch (erro) {
    adminLojaImagemSelecionada = null;
    mostrarMensagemLojaAdmin((erro && erro.message) || "Erro ao preparar imagem.", false);
  } finally {
    if (rapida) try { URL.revokeObjectURL(rapida); } catch (_) {}
  }
}

function limparFormularioLojaAdmin() {
  ["adminLojaId","adminLojaTitulo","adminLojaTexto","adminLojaPreco","adminLojaLink"].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const input = document.getElementById("adminLojaImagemFile");
  if (input) input.value = "";
  adminLojaImagemSelecionada = null;
  adminLojaImagemSelecaoSeq++;
  atualizarNomeImagemLojaAdmin("Nenhuma imagem selecionada");
  const preview = document.getElementById("adminLojaImagemPreview");
  const previewBox = document.getElementById("adminLojaPreviewBox");
  if (preview) preview.removeAttribute("src");
  if (previewBox) previewBox.style.display = "none";
  const btn = document.getElementById("adminSalvarLojaBtn");
  if (btn) btn.textContent = "SALVAR PRODUTO";
  mostrarMensagemLojaAdmin("", true);
}

async function obterImagemLojaCache(idProduto, forcarAtualizacao) {
  const id = String(idProduto || "").trim();
  if (!id) return "";
  if (!forcarAtualizacao && lojaImagensCache[id]) return lojaImagensCache[id];
  try {
    const resposta = await fetch(
      AUTH_API + "?action=obterImagemLoja&id=" + encodeURIComponent(id) + "&_t=" + Date.now(),
      { cache: "no-store" }
    );
    const dados = await resposta.json();
    if (dados && dados.ok === true && dados.dataUrl) {
      lojaImagensCache[id] = dados.dataUrl;
      return dados.dataUrl;
    }
  } catch (erro) {
    console.warn("Imagem da Loja indisponível:", erro);
  }
  return lojaImagensCache[id] || "";
}

async function carregarImagemLojaEmElemento(idProduto, img, forcarAtualizacao) {
  if (!idProduto || !img) return;
  const id = String(idProduto);
  const atual = lojaImagensCache[id];
  if (atual && !forcarAtualizacao) {
    img.src = atual;
    img.style.display = "block";
    return;
  }
  const dataUrl = await obterImagemLojaCache(id, !!forcarAtualizacao);
  if (dataUrl) {
    img.src = dataUrl;
    img.style.display = "block";
  }
}

function criarImagemProdutoLoja(item, className) {
  const media = document.createElement("div");
  media.className = className;
  if (item.temImagem) {
    const img = document.createElement("img");
    img.alt = String(item.titulo || "Produto MAPTORK");
    img.loading = "lazy";
    img.decoding = "async";
    const dataUrl = lojaImagensCache[String(item.id)] || "";
    if (dataUrl) img.src = dataUrl;
    else img.style.display = "none";
    media.appendChild(img);
    if (!dataUrl) carregarImagemLojaEmElemento(item.id, img, false);
  } else {
    const ph = document.createElement("span");
    ph.className = "loja-produto-placeholder";
    ph.textContent = "🛍";
    media.appendChild(ph);
  }
  return media;
}

function abrirProdutoLoja(link) {
  abrirLinkFerramenta(String(link || ""));
}

function renderizarLojaPublica() {
  const grid = document.getElementById("lojaProdutosGrid");
  if (!grid) return;
  const lista = Array.isArray(lojaProdutosCache) ? lojaProdutosCache : [];
  if (!lista.length) {
    grid.innerHTML = '<div class="loja-empty">Nenhum produto publicado na Loja ainda.</div>';
    return;
  }
  let assinatura = "";
  try { assinatura = JSON.stringify(lista); } catch (e) { assinatura = String(lista.length); }
  if (grid.dataset.renderSignature === assinatura && grid.querySelector(".loja-produto-card")) return;
  grid.innerHTML = "";
  lista.forEach(function(item) {
    const card = document.createElement("article");
    card.className = "loja-produto-card";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.onclick = function() { abrirProdutoLoja(item.link); };
    card.onkeydown = function(e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirProdutoLoja(item.link); } };
    const media = criarImagemProdutoLoja(item, "loja-produto-media");
    const body = document.createElement("div"); body.className = "loja-produto-body";
    const h3 = document.createElement("h3"); h3.className = "loja-produto-title"; h3.textContent = item.titulo || "Produto";
    const texto = document.createElement("p"); texto.className = "loja-produto-text"; texto.textContent = item.texto || "";
    const preco = document.createElement("div"); preco.className = "loja-produto-preco"; preco.textContent = item.preco || "Ver oferta";
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "loja-produto-btn"; btn.textContent = "VER PRODUTO";
    btn.onclick = function(e) { e.stopPropagation(); abrirProdutoLoja(item.link); };
    body.appendChild(h3); body.appendChild(texto); body.appendChild(preco); body.appendChild(btn);
    card.appendChild(media); card.appendChild(body); grid.appendChild(card);
  });
  grid.dataset.renderSignature = assinatura;
}

function pararCarrosselLojaInicio() {
  if (lojaInicioTimer) { clearInterval(lojaInicioTimer); lojaInicioTimer = null; }
}

function atualizarCarrosselLojaInicio() {
  const track = document.getElementById("inicioLojaTrack");
  const dots = Array.prototype.slice.call(document.querySelectorAll("#inicioLojaDots .inicio-loja-dot"));
  if (!track) return;
  const total = track.children.length;
  if (!total) return;
  lojaInicioIndice = ((lojaInicioIndice % total) + total) % total;
  track.style.transform = "translateX(-" + (lojaInicioIndice * 100) + "%)";
  dots.forEach(function(dot, i) { dot.classList.toggle("active", i === lojaInicioIndice); });
}

function iniciarCarrosselLojaInicio() {
  pararCarrosselLojaInicio();
  const track = document.getElementById("inicioLojaTrack");
  if (!track || track.children.length <= 1) return;
  lojaInicioTimer = setInterval(function() {
    if (document.hidden) return;
    lojaInicioIndice = (lojaInicioIndice + 1) % track.children.length;
    atualizarCarrosselLojaInicio();
  }, MAPTORK_LOJA_INTERVALO_MS);
}

function renderizarLojaInicio() {
  const secao = document.getElementById("inicioLojaSection");
  const track = document.getElementById("inicioLojaTrack");
  const dots = document.getElementById("inicioLojaDots");
  if (!secao || !track || !dots) return;
  const lista = Array.isArray(lojaProdutosCache) ? lojaProdutosCache.slice(0, 10) : [];
  if (!lista.length) {
    secao.style.display = "none";
    pararCarrosselLojaInicio();
    return;
  }
  secao.style.display = "block";
  let assinatura = "";
  try { assinatura = JSON.stringify(lista); } catch (e) { assinatura = String(lista.length); }
  if (track.dataset.renderSignature === assinatura && track.children.length) {
    atualizarCarrosselLojaInicio();
    iniciarCarrosselLojaInicio();
    return;
  }
  track.innerHTML = "";
  dots.innerHTML = "";
  lojaInicioIndice = 0;
  for (let i = 0; i < lista.length; i += 2) {
    const grupo = lista.slice(i, i + 2);
    const slide = document.createElement("div"); slide.className = "inicio-loja-slide";
    grupo.forEach(function(item) {
      const card = document.createElement("button"); card.type = "button"; card.className = "loja-produto-card inicio-loja-card";
      card.onclick = function() { abrirProdutoLoja(item.link); };
      const media = criarImagemProdutoLoja(item, "loja-produto-media inicio-loja-card-media");
      const body = document.createElement("div"); body.className = "loja-produto-body inicio-loja-card-body";
      const titulo = document.createElement("h3"); titulo.className = "loja-produto-title inicio-loja-card-title"; titulo.textContent = item.titulo || "Produto";
      const texto = document.createElement("p"); texto.className = "loja-produto-text inicio-loja-card-text"; texto.textContent = item.texto || "";
      const preco = document.createElement("div"); preco.className = "loja-produto-preco inicio-loja-card-preco"; preco.textContent = item.preco || "Ver oferta";
      body.appendChild(titulo); body.appendChild(texto); body.appendChild(preco);
      card.appendChild(media); card.appendChild(body); slide.appendChild(card);
    });
    track.appendChild(slide);
    const dot = document.createElement("button"); dot.type = "button"; dot.className = "inicio-loja-dot" + (i === 0 ? " active" : "");
    const indiceSlide = Math.floor(i / 2);
    dot.setAttribute("aria-label", "Mostrar produtos " + (i + 1) + " e " + Math.min(i + 2, lista.length));
    dot.onclick = function() { lojaInicioIndice = indiceSlide; atualizarCarrosselLojaInicio(); iniciarCarrosselLojaInicio(); };
    dots.appendChild(dot);
  }
  track.dataset.renderSignature = assinatura;
  dots.style.display = track.children.length > 1 ? "flex" : "none";

  const viewport = document.querySelector("#inicioLojaCarousel .inicio-loja-viewport");
  if (viewport && viewport.dataset.swipeReady !== "1") {
    viewport.dataset.swipeReady = "1";
    let touchX = 0;
    let touchY = 0;
    viewport.addEventListener("touchstart", function(e) {
      const toque = e.touches && e.touches[0];
      if (!toque) return;
      touchX = toque.clientX; touchY = toque.clientY;
      pararCarrosselLojaInicio();
    }, { passive:true });
    viewport.addEventListener("touchend", function(e) {
      const toque = e.changedTouches && e.changedTouches[0];
      if (!toque) { iniciarCarrosselLojaInicio(); return; }
      const dx = toque.clientX - touchX;
      const dy = toque.clientY - touchY;
      const total = track.children.length;
      if (total > 1 && Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
        lojaInicioIndice = dx < 0 ? (lojaInicioIndice + 1) % total : (lojaInicioIndice - 1 + total) % total;
        atualizarCarrosselLojaInicio();
      }
      iniciarCarrosselLojaInicio();
    }, { passive:true });
  }

  atualizarCarrosselLojaInicio();
  iniciarCarrosselLojaInicio();
}

function abrirLojaPeloInicio() {
  const btn = document.getElementById("lojaMenuBtn");
  showPage("loja", btn || null);
}

async function preCarregarLoja(forcarAtualizacao) {
  const forcar = !!forcarAtualizacao;

  // Mostra primeiro os produtos salvos localmente para a Loja nunca ficar vazia
  // enquanto o Google Script responde.
  if (!lojaProdutosCache.length) {
    try { await aplicarLojaCacheLocalUmaVez(); } catch (e) {}
  }
  renderizarLojaPublica();
  renderizarLojaInicio();

  if (!forcar && lojaCarregadaNestaSessao) {
    return lojaProdutosCache;
  }
  if (!forcar && lojaCarregando) return lojaCarregando;
  lojaCarregando = (async function() {
    try {
      const resposta = await fetch(AUTH_API + "?action=obterLojaPublica&_t=" + Date.now(), { cache: "no-store" });
      if (!resposta.ok) throw new Error("Loja: servidor respondeu HTTP " + resposta.status);
      const dados = await resposta.json();

      // IMPORTANTE: erro de rota, sessão, implantação ou resposta inválida NÃO significa
      // que a Loja ficou sem produtos. Nesses casos preservamos o cache existente.
      if (!dados || dados.ok !== true || !Array.isArray(dados.produtos)) {
        throw new Error(String((dados && (dados.mensagem || dados.message)) || "Resposta inválida da Loja"));
      }

      let lista = dados.produtos.map(normalizarProdutoLoja);
      lista = maptorkMesclarPendentesServidor(lista, lojaProdutosCache);
      const cacheLocal = await obterLojaCacheLocal();
      const cachePorId = Object.create(null);
      cacheLocal.forEach(function(item) { cachePorId[String(item.id || "")] = item; });
      const novasImagens = Object.create(null);
      lista.forEach(function(item) {
        const antigo = cachePorId[String(item.id || "")];
        if (antigo && antigo.dataUrl) novasImagens[String(item.id)] = antigo.dataUrl;
      });
      lojaImagensCache = novasImagens;
      lojaProdutosCache = lista;
      lojaCarregadaNestaSessao = true;
      lojaRetryTentativas = 0;
      if (lojaRetryTimer) { clearTimeout(lojaRetryTimer); lojaRetryTimer = null; }
      renderizarLojaPublica();
      renderizarLojaInicio();

      const comImagem = lista.filter(function(item) { return item.temImagem && item.id; });
      let cursor = 0;
      async function trabalhador() {
        while (cursor < comImagem.length) {
          const item = comImagem[cursor++];
          const id = String(item.id || "");
          const anterior = lojaImagensCache[id] || "";
          const nova = await obterImagemLojaCache(id, true).catch(function() { return anterior; });
          if (nova) lojaImagensCache[id] = nova;
          renderizarLojaPublica();
          renderizarLojaInicio();
        }
      }
      await Promise.all([trabalhador(), trabalhador()]);
      await salvarLojaCacheLocal();
      renderizarLojaPublica();
      renderizarLojaInicio();
      return lista;
    } catch (erro) {
      console.warn("Não foi possível carregar a Loja:", erro);
      if (!lojaProdutosCache.length) await aplicarLojaCacheLocalUmaVez();
      renderizarLojaPublica();
      renderizarLojaInicio();
      if (!lojaProdutosCache.length && lojaRetryTentativas < 6) {
        lojaRetryTentativas++;
        if (lojaRetryTimer) clearTimeout(lojaRetryTimer);
        lojaRetryTimer = setTimeout(function(){
          lojaCarregadaNestaSessao = false;
          preCarregarLoja(true).catch(function(){});
        }, Math.min(3000 + lojaRetryTentativas * 1500, 10000));
      }
      return lojaProdutosCache;
    } finally {
      lojaCarregando = null;
    }
  })();
  return lojaCarregando;
}

async function salvarProdutoLojaAdmin() {
  const token = String(localStorage.getItem("token") || "").trim();
  const id = String(document.getElementById("adminLojaId")?.value || "").trim();
  const titulo = String(document.getElementById("adminLojaTitulo")?.value || "").trim();
  const texto = String(document.getElementById("adminLojaTexto")?.value || "").trim();
  const preco = String(document.getElementById("adminLojaPreco")?.value || "").trim();
  const link = String(document.getElementById("adminLojaLink")?.value || "").trim();
  const input = document.getElementById("adminLojaImagemFile");
  const arquivoPendente = input && input.files && input.files[0] ? input.files[0] : null;
  if (!token) return mostrarMensagemLojaAdmin("Sessão inválida. Entre novamente.", false);
  if (!titulo || !texto || !link) return mostrarMensagemLojaAdmin("Preencha nome, descrição e link. O campo preço/chamada é opcional.", false);
  if (!/^https?:\/\//i.test(link)) return mostrarMensagemLojaAdmin("O link precisa começar com http:// ou https://.", false);
  if (!id && !adminLojaImagemSelecionada && !arquivoPendente) return mostrarMensagemLojaAdmin("Selecione uma imagem para o novo produto.", false);

  const existenteAdmin = lojaAdminCache.find(function(x){ return String(x && x.id || '') === id; }) || null;
  const existentePublico = lojaProdutosCache.find(function(x){ return String(x && x.id || '') === id; }) || null;
  const localId = id || maptorkSyncTempId('store');
  const selecionada = adminLojaImagemSelecionada;
  let dataUrlLocal = selecionada && selecionada.dataUrl ? selecionada.dataUrl : (lojaImagensCache[id] || '');
  let blobLocal = '';
  if (!dataUrlLocal && arquivoPendente) { try { blobLocal=URL.createObjectURL(arquivoPendente); dataUrlLocal=blobLocal; } catch(_){} }

  const payloadBase = {
    token:token,id:id,localId:localId,titulo:titulo,texto:texto,preco:preco,link:link,
    temImagem:!!(selecionada || arquivoPendente || (existenteAdmin && existenteAdmin.temImagem) || (existentePublico && existentePublico.temImagem)),
    dataUrl:dataUrlLocal,
    imageBase64:selecionada ? selecionada.base64 : '',
    fileName:selecionada ? selecionada.fileName : '',
    mimeType:selecionada ? selecionada.mimeType : ''
  };

  maptorkAplicarLojaLocal(payloadBase);
  limparFormularioLojaAdmin();
  mostrarMensagemLojaAdmin(id ? "Produto atualizado." : "Produto adicionado.", true);

  const enfileirar = async function(payload){
    if (blobLocal && payload.dataUrl !== blobLocal) try { URL.revokeObjectURL(blobLocal); } catch(_) {}
    maptorkAplicarLojaLocal(payload);
    await maptorkSyncEnfileirar('store-save','store-save:'+localId,payload);
  };

  if (arquivoPendente && !selecionada) {
    setTimeout(async function(){
      try {
        const img=await prepararImagemFerramentaAdmin(arquivoPendente);
        await enfileirar(Object.assign({},payloadBase,{dataUrl:img.dataUrl,imageBase64:img.base64,fileName:img.fileName,mimeType:img.mimeType}));
      } catch(e) {
        mostrarMensagemLojaAdmin((e.message||'Erro ao preparar imagem.')+' O produto continua visível localmente.',false);
      }
    },0);
  } else {
    enfileirar(payloadBase);
  }
}

async function carregarLojaAdmin() {
  const box = document.getElementById("adminLojaLista");
  if (!box) return;
  const token = String(localStorage.getItem("token") || "").trim();
  if (!token) { box.innerHTML = '<div class="admin-tool-empty">Sessão inválida.</div>'; return; }
  box.innerHTML = '<div class="admin-tool-empty">Carregando...</div>';
  try {
    const resposta = await fetch(AUTH_API + "?action=adminListarLoja&token=" + encodeURIComponent(token) + "&_t=" + Date.now(), { cache: "no-store" });
    const dados = await resposta.json();
    if (!dados || dados.ok !== true) {
      box.innerHTML = '<div class="admin-tool-empty">' + escaparHtmlFerramenta((dados && dados.mensagem) || "Não foi possível carregar.") + '</div>';
      return;
    }
    lojaAdminCache = maptorkMesclarPendentesServidor(Array.isArray(dados.produtos) ? dados.produtos : [], lojaAdminCache);
    if (!lojaAdminCache.length) {
      box.innerHTML = '<div class="admin-tool-empty">Nenhum produto adicionado ainda.</div>';
      return;
    }
    box.innerHTML = "";
    lojaAdminCache.forEach(function(item) {
      const card = document.createElement("div"); card.className = "admin-tool-item";
      const info = document.createElement("div"); info.className = "admin-tool-item-info";
      const h4 = document.createElement("h4"); h4.textContent = String(item.titulo || "Produto");
      const preco = document.createElement("small"); preco.className = "admin-loja-price"; preco.textContent = String(item.preco || "");
      const p = document.createElement("p"); p.textContent = String(item.texto || "");
      const small = document.createElement("small"); small.textContent = String(item.link || "");
      info.appendChild(h4); info.appendChild(preco); info.appendChild(p); info.appendChild(small);
      const actions = document.createElement("div"); actions.className = "admin-tool-item-actions";
      const editar = document.createElement("button"); editar.type = "button"; editar.className = "admin-tool-edit"; editar.textContent = "EDITAR";
      editar.onclick = function() { editarProdutoLojaAdmin(item.id); };
      const excluir = document.createElement("button"); excluir.type = "button"; excluir.className = "admin-tool-delete"; excluir.textContent = "EXCLUIR";
      excluir.onclick = function() { excluirProdutoLojaAdmin(item.id, item.titulo); };
      actions.appendChild(editar); actions.appendChild(excluir); card.appendChild(info); card.appendChild(actions); box.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro carregar Loja admin:", erro);
    box.innerHTML = '<div class="admin-tool-empty">Erro ao conectar com o servidor.</div>';
  }
}

async function editarProdutoLojaAdmin(id) {
  const item = lojaAdminCache.find(function(x) { return String(x.id) === String(id); });
  if (!item) return;
  document.getElementById("adminLojaId").value = item.id || "";
  document.getElementById("adminLojaTitulo").value = item.titulo || "";
  document.getElementById("adminLojaTexto").value = item.texto || "";
  document.getElementById("adminLojaPreco").value = item.preco || "";
  document.getElementById("adminLojaLink").value = item.link || "";
  adminLojaImagemSelecionada = null;
  const file = document.getElementById("adminLojaImagemFile"); if (file) file.value = "";
  atualizarNomeImagemLojaAdmin("Imagem atual mantida (se não escolher outra)");
  const btn = document.getElementById("adminSalvarLojaBtn"); if (btn) btn.textContent = "ATUALIZAR PRODUTO";
  const previewBox = document.getElementById("adminLojaPreviewBox");
  const preview = document.getElementById("adminLojaImagemPreview");
  if (previewBox) previewBox.style.display = item.temImagem ? "flex" : "none";
  if (item.temImagem && preview) {
    preview.removeAttribute("src");
    await carregarImagemLojaEmElemento(item.id, preview, false);
  }
  mostrarMensagemLojaAdmin("Editando: " + String(item.titulo || "produto"), true);
  document.getElementById("adminConfigLoja")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function excluirProdutoLojaAdmin(id, titulo) {
  if (!confirm('Excluir o produto "' + String(titulo || "") + '"?')) return;
  const token = String(localStorage.getItem("token") || "").trim();
  try {
    const form = new URLSearchParams();
    form.set("action", "adminExcluirProdutoLoja");
    form.set("token", token);
    form.set("id", String(id || ""));
    const resposta = await fetch(AUTH_API + "?action=adminExcluirProdutoLoja&_t=" + Date.now(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: form.toString()
    });
    const dados = await resposta.json();
    if (!dados || dados.ok !== true) {
      mostrarMensagemLojaAdmin((dados && dados.mensagem) || "Não foi possível excluir.", false);
      return;
    }
    mostrarMensagemLojaAdmin("Produto excluído.", true);
    limparFormularioLojaAdmin();
    await carregarLojaAdmin();
    await preCarregarLoja(true);
  } catch (erro) {
    mostrarMensagemLojaAdmin("Erro ao conectar com o Google Script.", false);
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
let maptorkHeroUploadSelecaoSeq = 0;
let maptorkAtualizacoesInicio = [];
let maptorkAtualizacaoIndice = 0;
let maptorkAtualizacaoTimer = null;
// Mantém o ID da novidade em edição fora do DOM para evitar perda do ID
// ao rolar, re-renderizar o Admin ou atualizar a lista.
let maptorkAtualizacaoEditandoId = "";

const MAPTORK_HERO_CACHE_DB = "maptork_ui_cache";
const MAPTORK_HERO_CACHE_STORE = "config";
const MAPTORK_ATUALIZACOES_CACHE_KEY = "heroUpdatesV4";
// Snapshot rápido e persistente. Diferente do IndexedDB (assíncrono), o
// localStorage pode ser lido imediatamente ao reabrir o site, antes de
// qualquer chamada ao Google Script.
const MAPTORK_ATUALIZACOES_CACHE_SYNC_KEY = "maptork_hero_updates_snapshot_v2";
let maptorkAtualizacoesCacheRestaurado = false;

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

function salvarAtualizacoesInicioSnapshotRapido(lista) {
  try {
    const normalizada = (Array.isArray(lista) ? lista : [])
      .map(normalizarAtualizacaoInicio)
      .filter(function(item) { return !!item.id; });

    // Primeiro tenta guardar tudo, inclusive a imagem em dataURL. Isso faz a
    // atualização reaparecer completa mesmo depois de fechar e abrir o site.
    try {
      localStorage.setItem(MAPTORK_ATUALIZACOES_CACHE_SYNC_KEY, JSON.stringify(normalizada));
      return;
    } catch (erroQuota) {
      // Se a imagem for grande demais para a cota do localStorage, mantém pelo
      // menos os dados/URL. A cópia completa continua salva no IndexedDB.
      const compacta = normalizada.map(function(item) {
        return {
          id: item.id,
          titulo: item.titulo,
          texto: item.texto,
          link: item.link,
          url: item.url,
          dataUrl: "",
          temImagem: item.temImagem
        };
      });
      localStorage.setItem(MAPTORK_ATUALIZACOES_CACHE_SYNC_KEY, JSON.stringify(compacta));
    }
  } catch (erro) {
    console.warn("Não foi possível salvar o snapshot rápido das atualizações:", erro);
  }
}

function obterAtualizacoesInicioSnapshotRapido() {
  try {
    const bruto = localStorage.getItem(MAPTORK_ATUALIZACOES_CACHE_SYNC_KEY);
    if (!bruto) return [];
    const lista = JSON.parse(bruto);
    if (!Array.isArray(lista)) return [];
    return lista
      .map(normalizarAtualizacaoInicio)
      .filter(function(item) { return !!item.id; });
  } catch (erro) {
    return [];
  }
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
  // Grava primeiro a cópia síncrona, para a próxima abertura não depender de
  // nenhuma leitura assíncrona nem do servidor.
  salvarAtualizacoesInicioSnapshotRapido(lista);

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

async function restaurarAtualizacoesInicioCacheImediato() {
  if (maptorkAtualizacoesCacheRestaurado) return maptorkAtualizacoesInicio;
  maptorkAtualizacoesCacheRestaurado = true;

  // 1) localStorage: síncrono, aparece na mesma abertura da página.
  const rapido = obterAtualizacoesInicioSnapshotRapido();
  if (rapido.length) {
    maptorkAtualizacoesInicio = rapido;
    maptorkAtualizacaoIndice = 0;
    renderizarAtualizacaoInicioAtual();
    renderizarAtualizacaoAdmin();
    iniciarRotacaoAtualizacoes();
  }

  // 2) IndexedDB: substitui logo em seguida pela cópia completa, normalmente
  // com a imagem em dataURL. Continua sem depender da internet.
  const persistente = await obterAtualizacoesInicioCacheLocal();
  if (persistente.length) {
    maptorkAtualizacoesInicio = persistente;
    if (maptorkAtualizacaoIndice >= persistente.length) maptorkAtualizacaoIndice = 0;
    renderizarAtualizacaoInicioAtual();
    renderizarAtualizacaoAdmin();
    iniciarRotacaoAtualizacoes();

    // Mantém também o snapshot rápido sincronizado para a próxima abertura.
    salvarAtualizacoesInicioSnapshotRapido(persistente);
  }

  return maptorkAtualizacoesInicio;
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
  // Stale-while-revalidate: mostra primeiro as últimas atualizações salvas.
  // Assim a tela inicial não fica vazia aguardando o Google Script.
  const cache = await obterAtualizacoesInicioCacheLocal();

  if (!maptorkAtualizacoesInicio.length && cache.length) {
    maptorkAtualizacoesInicio = cache;
    maptorkAtualizacaoIndice = 0;
    renderizarAtualizacaoInicioAtual();
    renderizarAtualizacaoAdmin();
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
      if (!antigo || !antigo.dataUrl || forcarAtualizacao) return;

      // Reaproveita a imagem somente quando a referência continua a mesma.
      // Se o administrador trocar a imagem, a nova referência será baixada.
      const urlAntiga = String(antigo.url || "").trim();
      const urlNova = String(item.url || "").trim();
      if (!urlAntiga || !urlNova || urlAntiga === urlNova) {
        item.dataUrl = antigo.dataUrl;
      }
    });

    const novaLista = maptorkMesclarPendentesServidor(lista.filter(function(item) { return !!item.id; }), maptorkAtualizacoesInicio);

    // Só substitui/redesenha após a resposta do servidor. Enquanto isso,
    // o usuário continua vendo o cache antigo. Novas atualizações aparecem
    // automaticamente assim que a revalidação terminar.
    maptorkAtualizacoesInicio = novaLista;
    if (maptorkAtualizacaoIndice >= maptorkAtualizacoesInicio.length) maptorkAtualizacaoIndice = 0;

    renderizarAtualizacaoInicioAtual();
    renderizarAtualizacaoAdmin();
    iniciarRotacaoAtualizacoes();

    // Persiste a lista assim que chega do servidor. As imagens em dataURL são
    // acrescentadas ao mesmo cache quando o pré-carregamento terminar.
    salvarAtualizacoesInicioSnapshotRapido(maptorkAtualizacoesInicio);
    await preCarregarImagensAtualizacoes();
    return maptorkAtualizacoesInicio;
  } catch (erro) {
    console.warn("Não foi possível atualizar as novidades pelo servidor:", erro);

    // Sem internet/servidor: mantém na tela o que já estava salvo.
    if (!maptorkAtualizacoesInicio.length && cache.length) {
      maptorkAtualizacoesInicio = cache;
      maptorkAtualizacaoIndice = 0;
      renderizarAtualizacaoInicioAtual();
      renderizarAtualizacaoAdmin();
      iniciarRotacaoAtualizacoes();
    }
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
  maptorkHeroUploadSelecaoSeq++;
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
  const seq = ++maptorkHeroUploadSelecaoSeq;
  let rapida = '';
  atualizarNomeArquivoImagemAdmin(arquivo.name || "Imagem selecionada");
  try {
    rapida = URL.createObjectURL(arquivo);
    mostrarPreviewAtualizacaoAdmin(rapida);
    mostrarMensagemImagemAdmin("Imagem selecionada.", true);
    const preparada = await prepararArquivoImagemAdmin(arquivo);
    if (seq !== maptorkHeroUploadSelecaoSeq) return;
    maptorkHeroUploadSelecionado = preparada;
    mostrarPreviewAtualizacaoAdmin(maptorkHeroUploadSelecionado.dataUrl);
    mostrarMensagemImagemAdmin("Imagem pronta para salvar.", true);
  } catch (erro) {
    console.error("Erro ao preparar imagem:", erro);
    maptorkHeroUploadSelecionado = null;
    mostrarMensagemImagemAdmin((erro && erro.message) || "Não foi possível preparar a imagem selecionada.", false);
  } finally {
    if (rapida) try { URL.revokeObjectURL(rapida); } catch (_) {}
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
  maptorkHeroUploadSelecaoSeq++;
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
  const token = String(localStorage.getItem("token") || "").trim();
  const idCampo = String((document.getElementById("adminHeroAtualizacaoId") || {}).value || "").trim();
  const id = String(maptorkAtualizacaoEditandoId || idCampo || "").trim();
  const titulo = String((document.getElementById("adminHeroTitulo") || {}).value || "").trim();
  const texto = String((document.getElementById("adminHeroTexto") || {}).value || "").trim();
  const link = String((document.getElementById("adminHeroLink") || {}).value || "").trim();
  const input = document.getElementById("adminHeroImageFile");
  const arquivoPendente = input && input.files && input.files[0] ? input.files[0] : null;

  if (!token) return mostrarMensagemImagemAdmin("Sessão inválida. Entre novamente na conta.", false);
  if (!titulo || !texto || !link) return mostrarMensagemImagemAdmin("Preencha nome/cabeçalho, texto e link.", false);
  if (!/^https?:\/\//i.test(link)) return mostrarMensagemImagemAdmin("O link precisa começar com http:// ou https://.", false);

  const itemEditando = id ? maptorkAtualizacoesInicio.find(function(x){ return String(x && x.id || '')===id; }) : null;
  if (!itemEditando && !maptorkHeroUploadSelecionado && !arquivoPendente) return mostrarMensagemImagemAdmin("Selecione uma imagem para a nova atualização.", false);

  const localId = id || maptorkSyncTempId('update');
  const selecionada = maptorkHeroUploadSelecionado;
  let dataUrlLocal = selecionada && selecionada.dataUrl ? selecionada.dataUrl : String((itemEditando && (itemEditando.dataUrl || itemEditando.url)) || '');
  let blobLocal='';
  if (!dataUrlLocal && arquivoPendente) { try{blobLocal=URL.createObjectURL(arquivoPendente);dataUrlLocal=blobLocal;}catch(_){} }

  const payloadBase={
    token:token,id:id,localId:localId,titulo:titulo,texto:texto,link:link,
    dataUrl:dataUrlLocal,url:String((itemEditando&&itemEditando.url)||''),
    imageBase64:selecionada?selecionada.base64:'',fileName:selecionada?selecionada.fileName:'',mimeType:selecionada?selecionada.mimeType:'',
    temImagem:!!(selecionada || arquivoPendente || (itemEditando && itemEditando.temImagem))
  };

  maptorkAplicarAtualizacaoLocal(payloadBase);
  limparFormularioAtualizacaoAdmin();
  mostrarMensagemImagemAdmin(id ? "Atualização editada." : "Nova atualização adicionada.", true);

  const enfileirar=async function(payload){
    if(blobLocal && payload.dataUrl!==blobLocal)try{URL.revokeObjectURL(blobLocal);}catch(_){}
    maptorkAplicarAtualizacaoLocal(payload);
    await maptorkSyncEnfileirar('update-save','update-save:'+localId,payload);
  };

  if(arquivoPendente && !selecionada){
    setTimeout(async function(){
      try{
        const img=await prepararArquivoImagemAdmin(arquivoPendente);
        await enfileirar(Object.assign({},payloadBase,{dataUrl:img.dataUrl,imageBase64:img.base64,fileName:img.fileName,mimeType:img.mimeType,temImagem:true}));
      }catch(e){mostrarMensagemImagemAdmin((e.message||'Erro ao preparar imagem.')+' A atualização continua visível localmente.',false);}
    },0);
  }else{
    enfileirar(payloadBase);
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
    loja: "adminConfigLoja",
    comunidade: "adminConfigComunidade",
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
    } else if (alvo === "loja") {
      await carregarLojaAdmin();
    } else if (alvo === "comunidade") {
      await carregarComunidadeAdmin();
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


    const valorMensalFormatado = formatarPrecoPlano(
          mensal
        );
    const valorTrimestralFormatado = formatarPrecoPlano(
          trimestral
        );
    const valorAnualFormatado = formatarPrecoPlano(
          anual
        );

    if (precoMensal) {

      precoMensal.textContent =
        valorMensalFormatado;
    }
    const precoMensalConta = document.getElementById("precoMensalConta");
    if (precoMensalConta) {
      precoMensalConta.textContent = valorMensalFormatado;
    }


    if (precoTrimestral) {

      precoTrimestral.textContent =
        valorTrimestralFormatado;
    }
    const precoTrimestralConta = document.getElementById("precoTrimestralConta");
    if (precoTrimestralConta) {
      precoTrimestralConta.textContent = valorTrimestralFormatado;
    }


    if (precoAnual) {

      precoAnual.textContent =
        valorAnualFormatado;
    }
    const precoAnualConta = document.getElementById("precoAnualConta");
    if (precoAnualConta) {
      precoAnualConta.textContent = valorAnualFormatado;
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

  if (!usuarioPossuiCadastroLocal()) {
    botao.classList.remove("plano-mensal", "plano-trimestral", "plano-anual");
    botao.classList.add("sem-plano");
    botao.textContent = "CADASTRAR";
    if (typeof atualizarOfertaInicio === "function") atualizarOfertaInicio(assinaturaAtual);
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

    if (typeof atualizarResumoPerfil === "function") {
      atualizarResumoPerfil(assinaturaAtual);
    }

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


  if (assinatura.acessoAdmin === true || plano.includes("administrador")) {

    botao.textContent = "ADMINISTRADOR";
    botao.classList.add("plano-anual");

    if (typeof atualizarResumoPerfil === "function") {
      atualizarResumoPerfil(assinaturaAtual);
    }

  } else if (
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

    if (typeof atualizarResumoPerfil === "function") {
      atualizarResumoPerfil(assinaturaAtual);
    }

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

    if (typeof atualizarResumoPerfil === "function") {
      atualizarResumoPerfil(assinaturaAtual);
    }

  } else {

    botao.textContent =
      "MENSAL • " +
      textoDias;


    botao.classList.add(
      "plano-mensal"
    );
  }

  if (typeof atualizarResumoPerfil === "function") {
    atualizarResumoPerfil(assinaturaAtual);
  }
}


// ======================================================
// CRIAR URL DE RETORNO DO PAGAMENTO
// ======================================================

function criarUrlRetornoPagamento() {
  // O checkout abre fora da tela principal. O retorno usa uma página neutra
  // que confirma o pagamento e fecha a janela, mantendo a sessão MAPTORK aberta.
  const url = new URL('pagamento-retorno.html', window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('pagamento','retorno');
  return url.toString();
}


// ======================================================
// CHECKOUT SEM PERDER A SESSÃO
// ======================================================
let maptorkPagamentoRevalidando = false;
let maptorkPagamentoUltimaRevalidacao = 0;

function maptorkMarcarPagamentoEmAndamento(plano) {
  try {
    localStorage.setItem('maptork_checkout_em_andamento', JSON.stringify({
      plano:String(plano||''),
      iniciadoEm:Date.now()
    }));
  } catch(e) {}
}

function maptorkObterPagamentoEmAndamento() {
  try {
    const bruto=localStorage.getItem('maptork_checkout_em_andamento');
    const dado=bruto?JSON.parse(bruto):null;
    if(!dado||!dado.iniciadoEm)return null;
    if(Date.now()-Number(dado.iniciadoEm)>45*60*1000){
      localStorage.removeItem('maptork_checkout_em_andamento');
      return null;
    }
    return dado;
  } catch(e) { return null; }
}

async function maptorkRevalidarPagamentoAoVoltar() {
  if(!maptorkObterPagamentoEmAndamento())return;
  if(!usuarioPossuiCadastroLocal())return;
  const agora=Date.now();
  if(maptorkPagamentoRevalidando||agora-maptorkPagamentoUltimaRevalidacao<1200)return;
  maptorkPagamentoRevalidando=true;
  maptorkPagamentoUltimaRevalidacao=agora;
  try {
    const info=await consultarAssinatura();
    await atualizarBotaoPlano();
    if(info&&info.ativo===true){
      try{localStorage.removeItem('maptork_checkout_em_andamento');}catch(e){}
      mostrarMensagemPagamento('Pagamento confirmado. Sua assinatura já está ativa.',true);
    }
  } catch(e) {
    // Falha de rede não encerra a sessão nem manda para login/cadastro.
    console.warn('Pagamento: revalidação adiada.',e);
  } finally {
    maptorkPagamentoRevalidando=false;
  }
}

window.addEventListener('focus',function(){setTimeout(maptorkRevalidarPagamentoAoVoltar,250);});
window.addEventListener('pageshow',function(){setTimeout(maptorkRevalidarPagamentoAoVoltar,250);});
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(maptorkRevalidarPagamentoAoVoltar,250);});

// ======================================================
// ESCOLHER PLANO
// ======================================================

async function escolherPlano(plano) {

  esconderMensagemPagamento();

  // Abre a janela ainda dentro do clique do usuário para evitar bloqueio de popup.
  // Se o navegador/WebView não permitir, usamos o comportamento tradicional.
  let janelaPagamento=null;
  try {
    janelaPagamento=window.open('', 'maptork_pagamento');
    if(janelaPagamento && !janelaPagamento.closed){
      try {
        janelaPagamento.document.open();
        janelaPagamento.document.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAPTORK</title></head><body style="margin:0;background:#f5f7fa;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;color:#24324a"><div style="text-align:center;padding:24px"><b>Abrindo pagamento seguro...</b><p style="color:#7b8491">Aguarde alguns segundos.</p></div></body></html>');
        janelaPagamento.document.close();
      } catch(e) {}
    }
  } catch(e) { janelaPagamento=null; }

  const email =
    obterEmailUsuario();


  if (!email) {

    mostrarMensagemPagamento(
      "Não foi possível identificar o e-mail da sua conta. Abra novamente o Perfil e tente de novo.",
      false
    );
    try{if(janelaPagamento&&!janelaPagamento.closed)janelaPagamento.close();}catch(e){}
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

    maptorkMarcarPagamentoEmAndamento(plano);

    if(janelaPagamento && !janelaPagamento.closed){
      try {
        janelaPagamento.location.href=dados.checkoutUrl;
        try{janelaPagamento.focus();}catch(e){}
      } catch(e) {
        window.location.href=dados.checkoutUrl;
      }
    } else {
      window.location.href=dados.checkoutUrl;
    }


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
    try{if(janelaPagamento&&!janelaPagamento.closed)janelaPagamento.close();}catch(e){}

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


  abrirContaAssinaturas();


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

  // Restaura "Novas Atualizações" antes de qualquer chamada de rede. O
  // localStorage renderiza imediatamente e o IndexedDB completa em seguida.
  // Não aguardamos aqui: a restauração acontece em paralelo com o restante.
  try { restaurarAtualizacoesInicioCacheImediato(); } catch (e) {}

  // Aguarda o index.html terminar
  // de carregar o usuário.

  if (usuarioPossuiCadastroLocal()) {
    for (
      let tentativa = 0;
      tentativa < 12;
      tentativa++
    ) {
      if (obterEmailUsuario()) break;
      await new Promise(function(resolve) { setTimeout(resolve, 250); });
    }
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
  if (!usuarioPossuiCadastroLocal()) {
    irParaCadastro();
    return false;
  }

  mostrarMensagemEsquema("Verificando sua assinatura...");
  const liberado = await exigirAssinaturaAtiva(String(nomeFerramenta || "Esta ferramenta"));
  if (liberado) esconderMensagemEsquema();
  return liberado;
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
  const destino = nomeArquivo + "?v=41#" + encodeURIComponent(JSON.stringify(dados));

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
  // A lista de Ferramentas é pública para visualização. O acesso ao conteúdo
  // continua protegido individualmente no clique de cada ferramenta.
  carregarFerramentasDinamicas(false);
  if (typeof aplicarLojaCacheLocalUmaVez === "function") aplicarLojaCacheLocalUmaVez();
  if (typeof preCarregarLoja === "function") setTimeout(function(){ preCarregarLoja(false); }, 300);
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



// ======================================================
// CONTA - ORGANIZAÇÃO EM LISTAS
// ======================================================
let contaPainelAtual = "";

function fecharPaineisConta() {
  contaPainelAtual = "";

  document.querySelectorAll('#conta .conta-panel').forEach(function(painel) {
    painel.classList.remove('is-open');
  });

  const menu = document.getElementById('contaMenuPrincipal');
  if (menu) {
    menu.style.display = 'block';
  }

  const pagina = document.getElementById('conta');
  if (pagina) {
    try { pagina.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
}

function abrirContaPainel(chave) {
  const mapa = {
    dados: 'contaPainelDados',
    planos: 'contaPainelPlanos',
    posts: 'contaPainelComunidade',
    comunidade: 'contaPainelComunidade',
    tema: 'contaPainelTema',
    feedback: 'contaPainelFeedback',
    privacidade: 'contaPainelPrivacidade',
    termos: 'contaPainelTermos',
    senha: 'contaPainelSenha',
    excluir: 'contaPainelExcluir'
  };

  const alvo = String(chave || '').trim().toLowerCase();
  const idPainel = mapa[alvo];
  if (!idPainel) return;

  contaPainelAtual = alvo;

  const menu = document.getElementById('contaMenuPrincipal');
  if (menu) {
    menu.style.display = 'none';
  }

  document.querySelectorAll('#conta .conta-panel').forEach(function(painel) {
    painel.classList.toggle('is-open', painel.id === idPainel);
  });

  if (alvo === 'planos') {
    try { carregarPrecosPlanos(); } catch (e) {}
    try { atualizarResumoPerfil(assinaturaAtual); } catch (e) {}
  } else if (alvo === 'dados') {
    try { preencherDadosPessoaisConta(); } catch (e) {}
  } else if (alvo === 'posts') {
    try { carregarMeusPostsComunidade(false); } catch (e) {}
  } else if (alvo === 'senha') {
    try { preencherSegurancaLogin(); } catch (e) {}
  } else if (alvo === 'comunidade') {
    try { prepararNovaPublicacaoComunidade(); } catch (e) {}
  }

  const pagina = document.getElementById('conta');
  if (pagina) {
    try { pagina.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function preencherDadosPessoaisConta() {
  const nomeEl=document.getElementById('contaEditarNome');
  if(nomeEl)nomeEl.value=String((window.usuarioAtual&&window.usuarioAtual.nome)||localStorage.getItem('nome')||'').trim();
  comunidadeMensagem('contaNomeMensagem','',true);
}

function preencherSegurancaLogin() {
  ['contaEditarSenhaAtual','contaEditarNovaSenha','contaEditarConfirmarSenha'].forEach(function(id){const el=document.getElementById(id);if(el)el.value='';});
  comunidadeMensagem('contaDadosMensagem','',true);
}

async function salvarNomeConta() {
  const nome=String((document.getElementById('contaEditarNome')||{}).value||'').trim();
  if(nome.length<2){comunidadeMensagem('contaNomeMensagem','Digite seu nome.',false);return;}

  // UI otimista: o nome muda na mesma hora em todas as áreas do site.
  maptorkAplicarNomeLocal(nome);
  comunidadeMensagem('contaNomeMensagem','Nome atualizado.',true);
  const btn=document.getElementById('contaSalvarNomeBtn');
  if(btn){btn.textContent='SALVO ✓';setTimeout(function(){if(btn)btn.textContent='SALVAR NOME';},700);}

  // O servidor confirma em segundo plano. Em caso de rede lenta, a tela não volta atrás.
  maptorkSyncEnfileirar('profile-name','profile-name:'+String(localStorage.getItem('email')||'anonimo').toLowerCase(),{
    token:String(localStorage.getItem('token')||''),
    nome:nome
  });
}

async function salvarDadosPessoaisConta() {
  const senhaAtual=String((document.getElementById('contaEditarSenhaAtual')||{}).value||'');
  const novaSenha=String((document.getElementById('contaEditarNovaSenha')||{}).value||'');
  const confirmar=String((document.getElementById('contaEditarConfirmarSenha')||{}).value||'');
  if(!senhaAtual||!novaSenha||!confirmar){comunidadeMensagem('contaDadosMensagem','Preencha os três campos de senha.',false);return;}
  if(novaSenha.length<8||novaSenha!==confirmar){comunidadeMensagem('contaDadosMensagem',novaSenha.length<8?'A nova senha deve ter pelo menos 8 caracteres.':'As novas senhas não coincidem.',false);return;}
  const btn=document.getElementById('contaSalvarDadosBtn');if(btn){btn.disabled=true;btn.textContent='ALTERANDO...';}
  try{
    const fd=new FormData();fd.append('action','atualizarPerfil');fd.append('token',String(localStorage.getItem('token')||''));fd.append('senhaAtual',senhaAtual);fd.append('novaSenha',novaSenha);fd.append('confirmarSenha',confirmar);
    const r=await fetch(obterApiAssinaturas(),{method:'POST',body:fd});const d=await r.json();if(!d||d.ok!==true){const msg=String((d&&d.mensagem)||'Não foi possível alterar a senha.');if(/preencha todos os campos/i.test(msg)){throw new Error('O servidor ainda está usando a versão antiga do usuario.gs. Atualize o arquivo e implante uma nova versão do aplicativo da web.');}throw new Error(msg);}
    preencherSegurancaLogin();comunidadeMensagem('contaDadosMensagem','Senha alterada com sucesso.',true);
  }catch(e){comunidadeMensagem('contaDadosMensagem',e.message||'Erro ao alterar a senha.',false);}
  finally{if(btn){btn.disabled=false;btn.textContent='ALTERAR SENHA';}}
}



function aplicarTemaConta() {
  const temaFinal = 'light';
  document.documentElement.setAttribute('data-theme', 'light');
  try { localStorage.setItem('maptork_tema', temaFinal); } catch (e) {}

  document.querySelectorAll('[data-theme-choice]').forEach(function(botao) {
    const ativo = botao.getAttribute('data-theme-choice') === temaFinal;
    botao.classList.toggle('active', ativo);
    botao.setAttribute('aria-pressed', ativo ? 'true' : 'false');
  });

  const atual = document.getElementById('contaTemaAtual');
  const status = document.getElementById('contaTemaStatus');
  if (atual) atual.textContent = 'Claro fixo';
  if (status) status.textContent = 'CLARO';
}

function carregarTemaConta() {
  aplicarTemaConta();
}

function selecionarTemaConta() {
  aplicarTemaConta();
}


function obterTextoFeedbackConta() {
  const campo = document.getElementById('contaFeedbackTexto');
  return campo ? campo.value.trim() : '';
}

function enviarFeedbackWhatsApp() {
  const texto = obterTextoFeedbackConta();
  const mensagem = encodeURIComponent(texto || 'Olá! Preciso de ajuda com o MAPTORK.');
  const url = 'https://wa.me/5561995906710?text=' + mensagem;
  if (window.AndroidApp && typeof window.AndroidApp.openExternal === 'function') {
    window.AndroidApp.openExternal(url);
    return;
  }
  window.location.href = url;
}

document.addEventListener('DOMContentLoaded', function() {

  carregarTemaConta();
});


// ======================================================
// PERFIL - RESUMO DA CONTA
// ======================================================
function obterIniciaisPerfil(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'MP';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
}

function atualizarResumoPerfil(assinatura) {
  const nome = String((window.usuarioAtual && window.usuarioAtual.nome) || localStorage.getItem('nome') || 'Usuário').trim() || 'Usuário';
  const email = String((window.usuarioAtual && window.usuarioAtual.email) || localStorage.getItem('email') || '').trim();
  const nomeEl = document.getElementById('contaNome');
  const emailEl = document.getElementById('contaEmail');
  const avatarEl = document.getElementById('contaAvatar');
  const badgeEl = document.getElementById('contaPlanoBadge');
  const badgeTextoEl = document.getElementById('contaPlanoTexto');
  const badgePainelEl = document.getElementById('contaPainelPlanoBadge');
  const badgePainelTextoEl = document.getElementById('contaPainelPlanoTexto');

  if (nomeEl) nomeEl.textContent = nome;
  if (emailEl) emailEl.textContent = email || 'Sem e-mail cadastrado';
  if (avatarEl && !avatarEl.dataset.photoUrl) avatarEl.textContent = obterIniciaisPerfil(nome);

  let classe = 'plan-free';
  let texto = 'GRATUITO';
  const info = assinatura && typeof assinatura === 'object' ? assinatura : assinaturaAtual;

  if (info && info.ativo) {
    const plano = normalizarPlano(info.plano);
    const dias = Math.max(0, Number(info.diasRestantes || 0));
    const diasTexto = dias === 1 ? '1 DIA' : dias + ' DIAS';

    if (info.acessoAdmin === true || plano.includes('administrador')) {
      classe = 'plan-anual';
      texto = 'ADMINISTRADOR';
    } else if (plano.includes('trimestral')) {
      classe = 'plan-trimestral';
      texto = 'TRIMESTRAL';
    } else if (plano.includes('anual')) {
      classe = 'plan-anual';
      texto = 'ANUAL';
    } else {
      classe = 'plan-monthly';
      texto = 'MENSAL';
    }

    if (!(info.acessoAdmin === true || plano.includes('administrador')) && dias >= 0) {
      texto += ' • ' + diasTexto;
    }
  }

  if (badgeEl) {
    badgeEl.className = 'profile-plan-badge ' + classe;
  }
  if (badgeTextoEl) {
    badgeTextoEl.textContent = texto;
  }
  if (badgePainelEl) {
    badgePainelEl.className = 'profile-plan-badge ' + classe;
  }
  if (badgePainelTextoEl) {
    badgePainelTextoEl.textContent = texto;
  }
}


// ======================================================
// PLANOS PREMIUM - SELEÇÃO COM CTA ÚNICO
// ======================================================
function selecionarPlanoPremium(plano, contexto) {
  const ctx = contexto === 'conta' ? 'conta' : 'pagina';
  const seletor = '.premium-plan-option[data-premium-context="' + ctx + '"]';
  document.querySelectorAll(seletor).forEach(function(el) {
    const ativo = el.getAttribute('data-premium-plan') === plano;
    el.classList.toggle('selected', ativo);
    el.setAttribute('aria-checked', ativo ? 'true' : 'false');
  });

  const botao = document.getElementById(ctx === 'conta' ? 'premiumAssinarConta' : 'premiumAssinarPagina');
  if (botao) {
    botao.setAttribute('data-plano', plano);
  }
}

function assinarPlanoPremium(contexto) {
  const ctx = contexto === 'conta' ? 'conta' : 'pagina';
  const botao = document.getElementById(ctx === 'conta' ? 'premiumAssinarConta' : 'premiumAssinarPagina');
  const plano = String((botao && botao.getAttribute('data-plano')) || 'trimestral').trim();
  escolherPlano(plano);
}


// ======================================================
// COMUNIDADE MAPTORK - FEED ESTILO INSTAGRAM
// ======================================================
let comunidadePublicaCache = [];
let comunidadePublicaCarregando = null;
let comunidadePublicaUltimaConsulta = 0;
let comunidadeMeuPerfil = null;
let comunidadeMeuPerfilCarregando = null;
let comunidadeMeuPerfilCarregado = false;
let comunidadeMeusPostsCache = [];
let comunidadeMeusPostsCarregando = null;
let comunidadeMeusPostsCarregado = false;
let comunidadeFotosPendentes = [];
let comunidadeFotosAtuaisEdicao = [];
let comunidadePostEditandoId = '';
let comunidadeFotoPerfilPendente = null;
let comunidadeCarrosselEstado = {};


// ======================================================
// RESPOSTA IMEDIATA (UI OTIMISTA)
// A tela muda primeiro; o servidor confirma em seguida.
// Se a gravação falhar, a interface volta ao estado anterior.
// ======================================================
function comunidadeIdTemporario(prefixo) {
  return String(prefixo || 'tmp') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
}

function comunidadeExtrairYoutubeId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/i);
  return m ? m[1] : '';
}

function comunidadeAtualizarLikeNaTela(id, curtido, curtidas, botao) {
  const total = Math.max(0, Number(curtidas || 0));
  const count = document.getElementById('comunidadeCurtidas_' + id);
  if (count) count.textContent = total + (total === 1 ? ' curtida' : ' curtidas');
  const btn = botao || (document.getElementById('comunidadePost_' + id) || {}).querySelector?.('.comunidade-like-btn');
  if (btn) {
    btn.classList.toggle('is-liked', curtido === true);
    btn.innerHTML = comunidadeIconeCoracao(curtido === true);
  }
}

function comunidadeAtualizarComentariosNaTela(id, item) {
  const comentarios = document.getElementById('comunidadeComentarios_' + id);
  if (comentarios && item) comentarios.innerHTML = renderizarComentariosComunidade(item);
}

// Identifica o mesmo comentário entre o estado local e o retorno do feed.
// O backend pode demorar alguns segundos para devolver no feed um comentário
// que já foi aceito pela rota de comentários. Até o feed confirmar, o comentário
// local precisa permanecer visível e persistido no cache.
function comunidadeComentarioEquivalente(a, b) {
  if (!a || !b) return false;
  const aid = String(a.id || '').trim();
  const bid = String(b.id || '').trim();
  if (aid && bid && !/^comentario_\d+_/i.test(aid) && !/^comentario_\d+_/i.test(bid) && aid === bid) return true;
  const at = String(a.texto || '').trim().replace(/\s+/g,' ').toLowerCase();
  const bt = String(b.texto || '').trim().replace(/\s+/g,' ').toLowerCase();
  const an = String(a.nome || '').trim().replace(/\s+/g,' ').toLowerCase();
  const bn = String(b.nome || '').trim().replace(/\s+/g,' ').toLowerCase();
  return !!at && at === bt && (!an || !bn || an === bn);
}

function comunidadeMesclarComentariosLocaisNoRemoto(local, remoto) {
  if (!local || !remoto) return false;
  const locais = Array.isArray(local.comentarios) ? local.comentarios : [];
  const remotos = Array.isArray(remoto.comentarios) ? remoto.comentarios.slice() : [];
  let preservou = false;

  locais.forEach(function(cLocal) {
    if (!cLocal) return;
    const idxRemoto = remotos.findIndex(function(cRemoto){ return comunidadeComentarioEquivalente(cLocal, cRemoto); });
    if (idxRemoto >= 0) {
      // O feed finalmente confirmou o comentário. Usa a versão do servidor e
      // remove marcadores temporários para não manter estado local para sempre.
      if (remotos[idxRemoto] && typeof remotos[idxRemoto] === 'object') {
        delete remotos[idxRemoto]._pendenteServidor;
        delete remotos[idxRemoto]._otimista;
        delete remotos[idxRemoto]._aguardandoFeed;
      }
      return;
    }

    // Comentário ainda não apareceu no feed. Preserva se ainda está sendo
    // enviado ou se a rota social já respondeu OK mas o feed está atrasado.
    if (cLocal._pendenteServidor === true || cLocal._aguardandoFeed === true) {
      remotos.push(Object.assign({}, cLocal));
      preservou = true;
    }
  });

  if (preservou || remotos.length !== (Array.isArray(remoto.comentarios) ? remoto.comentarios.length : 0)) {
    remoto.comentarios = remotos;
    remoto.comentariosTotal = Math.max(Number(remoto.comentariosTotal || 0), Number(local.comentariosTotal || 0), remotos.length);
    remoto.comentariosExpandidos = local.comentariosExpandidos === true;
  }
  return preservou;
}

// Mantém publicações locais na tela enquanto as imagens ainda estão sendo enviadas.
// Uma revalidação em segundo plano não pode apagar a prévia que o usuário acabou de publicar.
function comunidadeMesclarPostsOtimistas(listaServidor, cacheAtual) {
  const servidor = Array.isArray(listaServidor) ? listaServidor.slice() : [];
  const atuais = Array.isArray(cacheAtual) ? cacheAtual : [];
  const otimistas = atuais.filter(function(p){ return !!(p && p._otimista === true); });

  const idsServidor = Object.create(null);
  servidor.forEach(function(p){
    const id = String(p && p.id || '').trim();
    if (id) idsServidor[id] = p;
  });

  const manter = [];
  const idsOcultarServidor = Object.create(null);

  otimistas.forEach(function(local){
    const idReal = String(local && local._postIdServidor || '').trim();
    const esperado = Math.max(0, Number(local && local._fotosEsperadas || 0));
    const remoto = idReal ? idsServidor[idReal] : null;
    const fotosRemotas = remoto && Array.isArray(remoto.fotos) ? remoto.fotos.length : 0;

    // Enquanto o servidor ainda não devolveu todas as imagens enviadas,
    // preserva a versão local com blob URL para a foto nunca sumir da tela.
    const servidorCompleto = !!remoto && (esperado === 0 || fotosRemotas >= esperado);
    if (!servidorCompleto) {
      manter.push(local);
      if (idReal) idsOcultarServidor[idReal] = true;
      return;
    }

    // Momento crítico: a imagem terminou de chegar ao feed e a publicação local
    // será trocada pela versão do servidor. Transfere curtidas/comentários feitos
    // durante o upload ANTES de descartar o post otimista, evitando que sumam.
    if (remoto) {
      if (local._curtidaPendente === true || local.curtidoPorMim === true) {
        remoto.curtidoPorMim = local.curtidoPorMim === true;
        remoto.curtidas = Math.max(Number(remoto.curtidas || 0), Number(local.curtidas || 0));
        if (local._curtidaPendente === true) {
          remoto._curtidaPendente = true;
          remoto._curtidaPendenteBase = local._curtidaPendenteBase === true;
        }
      }
      const preservouComentario = comunidadeMesclarComentariosLocaisNoRemoto(local, remoto);
      if (local._socialPreservarAte) remoto._socialPreservarAte = local._socialPreservarAte;
      if (local._curtidaPendente === true || preservouComentario) {
        setTimeout(function(){ comunidadeAgendarSincronizacaoInteracoes(remoto, idReal); }, 0);
      }
    }
  });

  const filtrados = servidor.filter(function(p){
    const id = String(p && p.id || '').trim();
    return !id || !idsOcultarServidor[id];
  });

  // Uma atualização automática do feed também não pode apagar uma curtida ou
  // comentário que ainda está aguardando a rota social do servidor. Sobrepõe
  // temporariamente o estado local no item remoto até a sincronização concluir.
  const agora = Date.now();
  filtrados.forEach(function(remoto){
    const rid = String(remoto && remoto.id || '').trim();
    if (!rid) return;
    const local = atuais.find(function(p){
      if (!p || p._otimista === true) return false;
      const lid = String(p.id || '').trim();
      const lreal = String(p._postIdServidor || '').trim();
      return lid === rid || lreal === rid;
    });
    if (!local) return;

    const comentariosLocais = Array.isArray(local.comentarios) ? local.comentarios : [];
    const temComentarioPendente = comentariosLocais.some(function(c){ return !!(c && (c._pendenteServidor === true || c._aguardandoFeed === true)); });
    const preservarBreve = Number(local._socialPreservarAte || 0) > agora;

    if (local._curtidaPendente === true || preservarBreve) {
      remoto.curtidoPorMim = local.curtidoPorMim === true;
      remoto.curtidas = Math.max(0, Number(local.curtidas || 0));
      if (local._curtidaPendente === true) {
        remoto._curtidaPendente = true;
        remoto._curtidaPendenteBase = local._curtidaPendenteBase === true;
      }
      if (preservarBreve) remoto._socialPreservarAte = local._socialPreservarAte;
    }

    if (temComentarioPendente || preservarBreve) {
      comunidadeMesclarComentariosLocaisNoRemoto(local, remoto);
      // Durante uma janela curta também mantém o total/expansão local, mas sem
      // apagar comentários que já chegaram do servidor para outras pessoas.
      remoto.comentariosTotal = Math.max(Number(remoto.comentariosTotal || 0), Number(local.comentariosTotal || 0), Array.isArray(remoto.comentarios) ? remoto.comentarios.length : 0);
      remoto.comentariosExpandidos = local.comentariosExpandidos === true;
      if (preservarBreve) remoto._socialPreservarAte = local._socialPreservarAte;
      if (comentariosLocais.some(function(c){ return !!(c && c._pendenteServidor === true); })) {
        setTimeout(function(){ comunidadeAgendarSincronizacaoInteracoes(remoto, rid); }, 0);
      }
    }
  });

  return manter.concat(filtrados);
}

function comunidadeRemoverPostLocal(id) {
  const sid = String(id || '');
  const pubIndex = comunidadePublicaCache.findIndex(function(p){ return String(p && p.id || '') === sid; });
  const meuIndex = comunidadeMeusPostsCache.findIndex(function(p){ return String(p && p.id || '') === sid; });
  const backup = {
    publico: pubIndex >= 0 ? comunidadePublicaCache[pubIndex] : null,
    publicoIndex: pubIndex,
    meu: meuIndex >= 0 ? comunidadeMeusPostsCache[meuIndex] : null,
    meuIndex: meuIndex
  };
  if (pubIndex >= 0) comunidadePublicaCache.splice(pubIndex,1);
  if (meuIndex >= 0) comunidadeMeusPostsCache.splice(meuIndex,1);
  renderizarComunidadePublica(comunidadePublicaCache);
  renderizarNovosPostsInicio(comunidadePublicaCache);
  renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
  comunidadeSalvarCacheUsuario();
  comunidadeSalvarCachePublico();
  return backup;
}

function comunidadeRestaurarPostLocal(backup) {
  if (!backup) return;
  if (backup.publico) {
    const i = Math.max(0, Math.min(Number(backup.publicoIndex || 0), comunidadePublicaCache.length));
    comunidadePublicaCache.splice(i,0,backup.publico);
  }
  if (backup.meu) {
    const i = Math.max(0, Math.min(Number(backup.meuIndex || 0), comunidadeMeusPostsCache.length));
    comunidadeMeusPostsCache.splice(i,0,backup.meu);
  }
  renderizarComunidadePublica(comunidadePublicaCache);
  renderizarNovosPostsInicio(comunidadePublicaCache);
  renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
  comunidadeSalvarCacheUsuario();
  comunidadeSalvarCachePublico();
}

// Cache persistente do feed público (stale-while-revalidate).
// Ao abrir o MAPTORK, os últimos posts salvos aparecem imediatamente.
// Em paralelo, o site consulta o servidor e só redesenha o feed se houver mudança.
const MAPTORK_COMUNIDADE_PUBLICA_CACHE_VERSAO = 'v1';
const MAPTORK_COMUNIDADE_PUBLICA_REVALIDAR_MS = 30000;

function comunidadeChaveCachePublico() {
  // curtidoPorMim pode variar por conta; por isso o cache é separado por usuário.
  const email = String(localStorage.getItem('email') || 'anonimo').trim().toLowerCase();
  return 'maptork_comunidade_publica_' + MAPTORK_COMUNIDADE_PUBLICA_CACHE_VERSAO + ':' + encodeURIComponent(email || 'anonimo');
}

function comunidadePrepararListaPublicaParaCache(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.filter(function(p){ return !(p && p._otimista === true); }).map(function(p){
    if (!p || typeof p !== 'object') return p;
    const copia = Object.assign({}, p);
    delete copia.comentariosExpandidos;
    delete copia._otimista;
    return copia;
  });
}

function comunidadeSalvarCachePublico() {
  try {
    const lista = comunidadePrepararListaPublicaParaCache(comunidadePublicaCache);
    const payload = JSON.stringify({ posts: lista, salvoEm: Date.now() });
    localStorage.setItem(comunidadeChaveCachePublico(), payload);
  } catch (e) {
    // Alguns WebViews limitam localStorage. Se a lista inteira não couber,
    // preserva pelo menos os posts mais recentes para eliminar a tela vazia.
    try {
      const listaReduzida = comunidadePrepararListaPublicaParaCache(comunidadePublicaCache).slice(0, 50);
      localStorage.setItem(comunidadeChaveCachePublico(), JSON.stringify({ posts: listaReduzida, salvoEm: Date.now(), reduzido: true }));
    } catch (_) {}
  }
}

function comunidadeHidratarCachePublico() {
  try {
    const bruto = localStorage.getItem(comunidadeChaveCachePublico());
    if (!bruto) return false;
    const cache = JSON.parse(bruto);
    if (!cache || !Array.isArray(cache.posts) || !cache.posts.length) return false;
    comunidadePublicaCache = cache.posts;
    maptorkAplicarIdentidadeLocalNaLista(comunidadePublicaCache);
    renderizarComunidadePublica(comunidadePublicaCache);
    renderizarNovosPostsInicio(comunidadePublicaCache);
    // Não marca como recém-consultado: a primeira abertura sempre revalida
    // silenciosamente no servidor para detectar novos posts.
    comunidadePublicaUltimaConsulta = 0;
    return true;
  } catch (e) {
    return false;
  }
}

// Cache local do resumo do perfil e dos posts do próprio usuário.
// Evita mostrar "Carregando..." e recriar as mesmas <img> toda vez que
// o usuário entra novamente na aba Perfil.
const MAPTORK_COMUNIDADE_USUARIO_CACHE_VERSAO = 'v3';

function comunidadeChaveCacheUsuario() {
  const email = String(localStorage.getItem('email') || 'anonimo').trim().toLowerCase();
  return 'maptork_comunidade_usuario_' + MAPTORK_COMUNIDADE_USUARIO_CACHE_VERSAO + ':' + encodeURIComponent(email || 'anonimo');
}

function comunidadeSalvarCacheUsuario() {
  try {
    // Operações otimistas podem usar URLs blob: temporárias. Elas não devem ser
    // persistidas no localStorage, porque deixam de existir ao reiniciar o app.
    const postsPersistiveis = Array.isArray(comunidadeMeusPostsCache)
      ? comunidadeMeusPostsCache.filter(function(p){ return !(p && p._otimista === true); })
      : [];
    const perfilPersistivel = comunidadeMeuPerfil && comunidadeMeuPerfil._otimista === true ? null : (comunidadeMeuPerfil || null);
    localStorage.setItem(comunidadeChaveCacheUsuario(), JSON.stringify({
      perfil: perfilPersistivel,
      perfilCarregado: comunidadeMeuPerfilCarregado === true,
      posts: postsPersistiveis,
      postsCarregado: comunidadeMeusPostsCarregado === true,
      salvoEm: Date.now()
    }));
  } catch (e) {
    // O site continua funcionando mesmo se o navegador bloquear armazenamento.
  }
}

function comunidadeHidratarCacheUsuario() {
  try {
    const bruto = localStorage.getItem(comunidadeChaveCacheUsuario());
    if (!bruto) return false;
    const cache = JSON.parse(bruto);
    if (!cache || typeof cache !== 'object') return false;

    if (cache.perfil) {
      comunidadeMeuPerfil = cache.perfil;
      comunidadeMeuPerfilCarregado = cache.perfilCarregado !== false;
      renderizarFotoPerfilComunidade((cache.perfil && cache.perfil.fotoPerfil) || null);
    }

    if (Array.isArray(cache.posts)) {
      comunidadeMeusPostsCache = cache.posts;
      comunidadeMeusPostsCarregado = cache.postsCarregado !== false;
      renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
    }
    return true;
  } catch (e) {
    return false;
  }
}

function comunidadeLimparCacheImagens() {
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'MAPTORK_CLEAR_IMAGE_CACHE' });
    }
  } catch (e) {}
}

// Implantação da Comunidade usada para leitura/publicações já existentes.
// A edição usa a implantação principal mais nova, onde a rota
// comunidadeEditarPost foi adicionada no usuario.gs V15.
const COMUNIDADE_API_URL =
  "https://script.google.com/macros/s/AKfycbw0jiUBscozK7MxByh2aunuoE3W9oTkwXrmkR7cRqRF585CUKZjExdaqzUsUy1P2xhj/exec";

const COMUNIDADE_EDIT_API_URL =
  "https://script.google.com/macros/s/AKfycbzQyy2VRlJR_NZEoeMXNaLkhbdz3RL47EabYDLrRhFnOEmY-0k8g3YliBWXK99LaH7j/exec";

function comunidadeApiUrl() {
  return COMUNIDADE_API_URL;
}

function comunidadeApiUrlEdicao() {
  return COMUNIDADE_EDIT_API_URL;
}

function comunidadeEscaparHtml(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function comunidadeIniciais(valor) {
  const partes = String(valor || 'M').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'M';
  return (partes[0].charAt(0) + (partes.length > 1 ? partes[partes.length - 1].charAt(0) : '')).toUpperCase();
}

function comunidadeImagemUrl(foto) {
  if (!foto) return '';
  if (typeof foto === 'string') return String(foto || '').trim();
  const url = String(foto.url || '').trim();
  const id = String(foto.id || '').trim();
  if (url) return url;
  if (!id) return '';
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w1200';
}

function comunidadeImagemFallback(img) {
  if (!img) return;
  const id = String(img.dataset.id || '').trim();
  if (!id) return;
  const tentativa = Number(img.dataset.fallbackIndex || '0');
  const urls = [
    String(img.dataset.fallback || '').trim(),
    String(img.dataset.fallback2 || '').trim(),
    String(img.dataset.fallback3 || '').trim(),
    'https://drive.usercontent.google.com/download?id=' + encodeURIComponent(id) + '&export=view&authuser=0',
    'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w1200',
    'https://drive.google.com/uc?export=view&id=' + encodeURIComponent(id)
  ].filter(Boolean);
  if (tentativa >= urls.length) {
    img.onerror = null;
    img.classList.add('comunidade-img-erro');
    return;
  }
  img.dataset.fallbackIndex = String(tentativa + 1);
  img.src = urls[tentativa];
}

function comunidadeAtributosImagem(foto) {
  foto = foto || {};
  return ' data-id="' + comunidadeEscaparHtml(String(foto.id || '')) + '"' +
    ' data-fallback="' + comunidadeEscaparHtml(String(foto.urlFallback || '')) + '"' +
    ' data-fallback2="' + comunidadeEscaparHtml(String(foto.urlFallback2 || '')) + '"' +
    ' data-fallback3="' + comunidadeEscaparHtml(String(foto.urlFallback3 || '')) + '"' +
    ' referrerpolicy="no-referrer" onerror="comunidadeImagemFallback(this)"';
}

function comunidadeMensagem(id, texto, sucesso) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = texto ? 'block' : 'none';
  el.className = sucesso ? 'diagnostic-result success-box' : 'diagnostic-result error-box';
  el.textContent = texto || '';
}

function comunidadeBuscarPerfilPorId(id) {
  return comunidadePublicaCache.find(function(p){ return String(p && p.id || '') === String(id || ''); }) || null;
}

async function carregarComunidadePublica(forcar) {
  const grid = document.getElementById('comunidadeGrid');
  if (!grid) return [];

  // Mostra primeiro o que já existe na memória/cache, sem tela de loading.
  if (comunidadePublicaCache.length) {
    renderizarComunidadePublica(comunidadePublicaCache);
    renderizarNovosPostsInicio(comunidadePublicaCache);
  }

  const agora = Date.now();
  const precisaRevalidar = !!forcar || !comunidadePublicaCache.length ||
    !comunidadePublicaUltimaConsulta ||
    (agora - comunidadePublicaUltimaConsulta >= MAPTORK_COMUNIDADE_PUBLICA_REVALIDAR_MS);

  if (!precisaRevalidar) return comunidadePublicaCache;
  if (comunidadePublicaCarregando) return comunidadePublicaCarregando;

  // Só exibe "Carregando comunidade..." quando não existe nenhum cache para mostrar.
  if (!comunidadePublicaCache.length && !grid.querySelector('.comunidade-post')) {
    grid.innerHTML = '<div class="comunidade-loading">Carregando comunidade...</div>';
  }

  // Marca a tentativa antes do fetch para evitar chamadas duplicadas ao trocar de aba.
  comunidadePublicaUltimaConsulta = agora;
  comunidadePublicaCarregando = (async function(){
    try {
      const token = String(localStorage.getItem('token') || '').trim();
      const resposta = await fetch(
        comunidadeApiUrl() + '?action=comunidadeListarPublica&token=' + encodeURIComponent(token) + '&_t=' + Date.now(),
        {cache:'no-store'}
      );
      const dados = await resposta.json();
      if (!dados || dados.ok !== true) throw new Error((dados && dados.mensagem) || 'Não foi possível carregar a Comunidade.');
      const lista = Array.isArray(dados.perfis) ? dados.perfis : (dados.dados && Array.isArray(dados.dados.perfis) ? dados.dados.perfis : []);

      comunidadePublicaCache = comunidadeMesclarPostsOtimistas(lista, comunidadePublicaCache);
      maptorkAplicarIdentidadeLocalNaLista(comunidadePublicaCache);
      comunidadeSalvarCachePublico();
      renderizarComunidadePublica(comunidadePublicaCache);
      renderizarNovosPostsInicio(comunidadePublicaCache);
      return comunidadePublicaCache;
    } catch (erro) {
      console.error('Comunidade:', erro);
      // Sem internet/servidor indisponível: mantém os posts do cache na tela.
      if (!comunidadePublicaCache.length) {
        grid.innerHTML = '<div class="comunidade-empty">Não foi possível carregar a Comunidade agora.</div>';
      }
      return comunidadePublicaCache;
    } finally {
      comunidadePublicaCarregando = null;
    }
  })();
  return comunidadePublicaCarregando;
}

function renderizarNovosPostsInicio(lista) {
  const box = document.getElementById('inicioNovosPosts');
  if (!box) return;

  const posts = Array.isArray(lista) ? lista.slice(0, 3) : [];
  if (!posts.length) {
    box.innerHTML = '<div class="inicio-novos-posts-vazio">Ainda não há posts na Comunidade.</div>';
    return;
  }

  let assinatura = '';
  try { assinatura = JSON.stringify(posts); } catch (e) { assinatura = String(posts.length); }
  if (box.dataset.renderSignature === assinatura && box.querySelector('.inicio-post-card')) return;

  box.innerHTML = posts.map(function(item) {
    const id = String(item.id || '');
    const titulo = item.cabecalho || item.nome || 'Publicação';
    const nome = item.nome || 'Membro MAPTORK';
    const fotos = Array.isArray(item.fotos) ? item.fotos : [];
    const foto = fotos[0] || null;
    const fotoUrl = comunidadeImagemUrl(foto);
    const youtubeId = String(item.youtubeId || '');
    const thumb = youtubeId
      ? 'https://i.ytimg.com/vi/' + comunidadeEscaparHtml(youtubeId) + '/hqdefault.jpg'
      : fotoUrl;
    const fotoPerfil = item.fotoPerfil || null;
    const avatarUrl = comunidadeImagemUrl(fotoPerfil);
    const resumo = String(item.descricao || '').trim();
    const curtidas = Number(item.curtidas || 0);
    const comentarios = Number(item.comentariosTotal || 0);

    return '<button type="button" class="inicio-post-card" onclick="abrirPostInicioComunidade(\'' + comunidadeEscaparHtml(id) + '\')">' +
      '<span class="inicio-post-thumb">' +
        (thumb ? '<img src="' + comunidadeEscaparHtml(thumb) + '" ' + (youtubeId ? '' : comunidadeAtributosImagem(foto)) + ' alt="' + comunidadeEscaparHtml(titulo) + '" loading="lazy" decoding="async">' : '<span>POST</span>') +
      '</span>' +
      '<span class="inicio-post-conteudo">' +
        '<span class="inicio-post-autor">' +
          '<span class="inicio-post-avatar">' + (avatarUrl ? '<img src="' + comunidadeEscaparHtml(avatarUrl) + '" ' + comunidadeAtributosImagem(fotoPerfil) + ' alt="">' : comunidadeEscaparHtml(comunidadeIniciais(nome))) + '</span>' +
          '<span class="inicio-post-autor-copy"><strong>' + comunidadeEscaparHtml(titulo) + '</strong><small>' + comunidadeEscaparHtml(nome) + '</small></span>' +
        '</span>' +
        (resumo ? '<span class="inicio-post-resumo">' + comunidadeEscaparHtml(resumo) + '</span>' : '') +
        '<span class="inicio-post-meta"><span>♡ ' + curtidas + '</span><span>◯ ' + comentarios + '</span></span>' +
      '</span>' +
      '<span class="inicio-post-seta">›</span>' +
    '</button>';
  }).join('');

  box.dataset.renderSignature = assinatura;
}

function abrirPostInicioComunidade(id) {
  const botaoComunidade = Array.from(document.querySelectorAll('.nav button')).find(function(botao) {
    return /Comunidade/i.test(botao.textContent || '');
  });
  showPage('comunidade', botaoComunidade || null);
  setTimeout(function() {
    const post = document.getElementById('comunidadePost_' + id);
    if (post && typeof post.scrollIntoView === 'function') {
      post.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 120);
}

function comunidadeIconeCoracao(preenchido) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" ' + (preenchido ? 'fill="currentColor"' : 'fill="none"') + ' stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
}

function comunidadeIconeComentario() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg>';
}

function renderizarComentariosComunidade(item) {
  const todos = Array.isArray(item.comentarios) ? item.comentarios : [];
  const expandido = item.comentariosExpandidos === true;
  const comentarios = expandido ? todos : todos.slice(0,3);
  const total = Number(item.comentariosTotal || comentarios.length || 0);
  let html = '';
  if (total > 3) {
    html += '<button type="button" class="comunidade-ver-comentarios" onclick="comunidadeAlternarComentarios(\'' + comunidadeEscaparHtml(item.id) + '\')">' + (expandido ? 'Ocultar comentários' : 'Ver todos os ' + total + ' comentários') + '</button>';
  }
  html += comentarios.map(function(c){
    return '<div class="comunidade-comentario"><strong>' + comunidadeEscaparHtml(c.nome || 'Membro') + '</strong><span>' + comunidadeEscaparHtml(c.texto || '') + '</span></div>';
  }).join('');
  return html;
}

function renderizarComunidadePublica(lista) {
  const grid = document.getElementById('comunidadeGrid');
  if (!grid) return;
  if (!Array.isArray(lista) || !lista.length) {
    const assinaturaVazia = 'empty';
    if (grid.dataset.renderSignature !== assinaturaVazia) {
      grid.innerHTML = '<div class="comunidade-empty">Ainda não há publicações.</div>';
      grid.dataset.renderSignature = assinaturaVazia;
    }
    return;
  }

  // Se os dados são os mesmos, mantém o DOM atual. Assim o navegador não
  // destrói/recria as imagens e elas não "carregam de novo" ao trocar de aba.
  let assinatura = '';
  try { assinatura = JSON.stringify(lista); } catch (e) { assinatura = String(lista.length); }
  if (grid.dataset.renderSignature === assinatura && grid.querySelector('.comunidade-post')) return;

  grid.innerHTML = lista.map(function(item){
    const id = String(item.id || '');
    const fotos = Array.isArray(item.fotos) ? item.fotos.slice(0,10) : [];
    const fotoAtual = Math.min(Number(comunidadeCarrosselEstado[id] || 0), Math.max(0, fotos.length - 1));
    comunidadeCarrosselEstado[id] = fotoAtual;
    const foto = fotos[fotoAtual] || {};
    const capa = comunidadeImagemUrl(foto);
    const titulo = item.cabecalho || item.nome || 'Membro MAPTORK';
    const nome = item.nome || titulo;
    const curtido = item.curtidoPorMim === true;
    const curtidas = Number(item.curtidas || 0);
    const comentariosTotal = Number(item.comentariosTotal || 0);
    const youtubeId = String(item.youtubeId || '');
    const fotoPerfil = item.fotoPerfil || null;
    const avatarUrl = comunidadeImagemUrl(fotoPerfil);

    return '<article class="comunidade-post" id="comunidadePost_' + comunidadeEscaparHtml(id) + '">' +
      '<div class="comunidade-post-head">' +
        '<button type="button" class="comunidade-avatar" onclick="abrirPerfilComunidadePorId(\'' + comunidadeEscaparHtml(id) + '\')">' + (avatarUrl ? '<img src="' + comunidadeEscaparHtml(avatarUrl) + '" ' + comunidadeAtributosImagem(fotoPerfil) + ' alt="Foto de perfil">' : comunidadeEscaparHtml(comunidadeIniciais(nome))) + '</button>' +
        '<button type="button" class="comunidade-post-identidade" onclick="abrirPerfilComunidadePorId(\'' + comunidadeEscaparHtml(id) + '\')"><strong>' + comunidadeEscaparHtml(titulo) + '</strong><small>' + comunidadeEscaparHtml(nome) + '</small></button>' +
      '</div>' +
      '<div class="comunidade-post-media' + (youtubeId ? ' has-video' : '') + '">' +
        (youtubeId ? '<iframe class="comunidade-youtube" src="https://www.youtube-nocookie.com/embed/' + comunidadeEscaparHtml(youtubeId) + '?playsinline=1&fs=0&rel=0&enablejsapi=1" title="Vídeo do YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' : (capa ? '<img class="comunidade-feed-img" src="' + comunidadeEscaparHtml(capa) + '" ' + comunidadeAtributosImagem(foto) + ' alt="' + comunidadeEscaparHtml(titulo) + '" loading="lazy" decoding="async">' : '<div class="comunidade-sem-foto">MAPTORK</div>')) +
        (fotos.length > 1 ? '<button type="button" class="comunidade-slide-btn prev" onclick="comunidadeMudarFoto(\'' + comunidadeEscaparHtml(id) + '\',-1)" aria-label="Foto anterior">‹</button><button type="button" class="comunidade-slide-btn next" onclick="comunidadeMudarFoto(\'' + comunidadeEscaparHtml(id) + '\',1)" aria-label="Próxima foto">›</button><span class="comunidade-foto-contador">' + (fotoAtual+1) + '/' + fotos.length + '</span>' : '') +
      '</div>' +
      '<div class="comunidade-post-actions">' +
        '<button type="button" class="comunidade-action-btn comunidade-like-btn ' + (curtido ? 'is-liked' : '') + '" onclick="comunidadeCurtirPerfil(\'' + comunidadeEscaparHtml(id) + '\',this)" aria-label="Curtir">' + comunidadeIconeCoracao(curtido) + '</button>' +
        '<button type="button" class="comunidade-action-btn" onclick="comunidadeFocarComentario(\'' + comunidadeEscaparHtml(id) + '\')" aria-label="Comentar">' + comunidadeIconeComentario() + '</button>' +
      '</div>' +
      '<div class="comunidade-post-body">' +
        '<div class="comunidade-curtidas" id="comunidadeCurtidas_' + comunidadeEscaparHtml(id) + '">' + curtidas + (curtidas === 1 ? ' curtida' : ' curtidas') + '</div>' +
        '<div class="comunidade-legenda"><strong>' + comunidadeEscaparHtml(titulo) + '</strong><span>' + comunidadeEscaparHtml(item.descricao || '') + '</span></div>' +
        '<div class="comunidade-comentarios" id="comunidadeComentarios_' + comunidadeEscaparHtml(id) + '">' + renderizarComentariosComunidade(item) + '</div>' +
        '<div class="comunidade-comentar-box"><input id="comunidadeComentarioInput_' + comunidadeEscaparHtml(id) + '" type="text" maxlength="220" placeholder="Adicione um comentário..." onclick="comunidadeFocarComentario(\'' + comunidadeEscaparHtml(id) + '\')" onkeydown="if(event.key===\'Enter\'){event.preventDefault();comunidadeComentarPerfil(\'' + comunidadeEscaparHtml(id) + '\')}"><button type="button" onclick="comunidadeComentarPerfil(\'' + comunidadeEscaparHtml(id) + '\')">PUBLICAR</button></div>' +
        (comentariosTotal ? '' : '') +
      '</div>' +
    '</article>';
  }).join('');
  grid.dataset.renderSignature = assinatura;
}

function comunidadeAlternarComentarios(id) {
  const item = comunidadeBuscarPerfilPorId(id);
  if (!item) return;
  item.comentariosExpandidos = item.comentariosExpandidos !== true;
  const box = document.getElementById('comunidadeComentarios_' + id);
  if (box) box.innerHTML = renderizarComentariosComunidade(item);
}

function comunidadeDefinirVisao(visao) {
  const secao = document.getElementById('comunidade');
  if (!secao) return;
  secao.setAttribute('data-view', visao === 'detail' ? 'detail' : 'list');
}

async function abrirMeusPostsComunidade() {
  if (!(await exigirAssinaturaAtiva('Publicar na Comunidade'))) return;
  const contaBtn = Array.from(document.querySelectorAll('.nav button')).find(function(b){ return /Perfil/i.test(b.textContent || ''); });
  showPage('conta', contaBtn || null);
  abrirContaPainel('comunidade');
  prepararNovaPublicacaoComunidade();
  if (typeof carregarMeusPostsComunidade === 'function') {
    carregarMeusPostsComunidade(false);
  }
}

async function abrirCriarPostComunidade() {
  if (!(await exigirAssinaturaAtiva('Publicar na Comunidade'))) return;
  const contaBtn = Array.from(document.querySelectorAll('.nav button')).find(function(b){ return /Perfil/i.test(b.textContent || ''); });
  showPage('conta', contaBtn || null);
  abrirContaPainel('comunidade');
  prepararNovaPublicacaoComunidade();
  if (typeof carregarMeusPostsComunidade === 'function') carregarMeusPostsComunidade(false);
}

async function abrirEditorComunidadeProtegido() {
  if (!(await exigirAssinaturaAtiva('Perfil e publicações na Comunidade'))) return;
  abrirContaPainel('comunidade');
  if (typeof carregarMeusPostsComunidade === 'function') carregarMeusPostsComunidade(false);
}

function comunidadeAtualizarEstadoEditor() {
  const editando = !!comunidadePostEditandoId;
  const hidden = document.getElementById('comunidadePostEditandoId');
  const titulo = document.getElementById('comunidadeEditorTitulo');
  const salvar = document.getElementById('comunidadeSalvarBtn');
  const limpar = document.getElementById('comunidadeLimparBtn');
  if (hidden) hidden.value = comunidadePostEditandoId || '';
  if (titulo) titulo.textContent = editando ? 'Editar publicação' : 'Nova publicação';
  if (salvar) salvar.textContent = editando ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR AGORA';
  if (limpar) limpar.textContent = editando ? 'CANCELAR EDIÇÃO' : 'LIMPAR';
}

function comunidadeObterMeuPostPorId(id) {
  const sid = String(id || '').trim();
  return comunidadeMeusPostsCache.find(function(p){ return String(p && p.id || '') === sid; }) || null;
}

function prepararNovaPublicacaoComunidade() {
  comunidadeFotosPendentes.forEach(function(item){ if(item && item.url) try { URL.revokeObjectURL(item.url); } catch (_) {} });
  comunidadeFotosPendentes = [];
  comunidadeFotosAtuaisEdicao = [];
  comunidadePostEditandoId = '';
  ['comunidadeCabecalho','comunidadeDescricao','comunidadeWhatsapp','comunidadeYoutube'].forEach(function(id){ const el=document.getElementById(id); if(el) el.value=''; });
  const input = document.getElementById('comunidadeFotosInput'); if (input) input.value='';
  renderizarFotosSelecionadasComunidade();
  renderizarMinhasFotosComunidade();
  atualizarContadorFotosComunidade();
  comunidadeAtualizarEstadoEditor();
  comunidadeMensagem('comunidadeEditorMensagem','',true);
}

function editarMeuPostComunidade(id) {
  const post = comunidadeObterMeuPostPorId(id);
  if (!post) {
    comunidadeMensagem('comunidadeEditorMensagem','Não foi possível localizar a publicação para edição.',false);
    return;
  }
  comunidadeFotosPendentes.forEach(function(item){ if(item && item.url) try { URL.revokeObjectURL(item.url); } catch (_) {} });
  comunidadeFotosPendentes = [];
  comunidadeFotosAtuaisEdicao = Array.isArray(post.fotos) ? post.fotos.slice(0,10).map(function(f){ return Object.assign({}, f); }) : [];
  comunidadePostEditandoId = String(post.id || '');
  const cab = document.getElementById('comunidadeCabecalho'); if (cab) cab.value = String(post.cabecalho || '');
  const desc = document.getElementById('comunidadeDescricao'); if (desc) desc.value = String(post.descricao || '');
  const wat = document.getElementById('comunidadeWhatsapp'); if (wat) wat.value = String(post.whatsapp || '');
  const you = document.getElementById('comunidadeYoutube'); if (you) you.value = post.youtubeId ? ('https://youtu.be/' + String(post.youtubeId)) : '';
  const input = document.getElementById('comunidadeFotosInput'); if (input) input.value='';
  renderizarFotosSelecionadasComunidade();
  renderizarMinhasFotosComunidade();
  atualizarContadorFotosComunidade();
  comunidadeAtualizarEstadoEditor();
  comunidadeMensagem('comunidadeEditorMensagem','Edição carregada. Faça as alterações e depois toque em SALVAR ALTERAÇÕES.',true);
  const painel = document.getElementById('contaPainelComunidade');
  if (painel) {
    try { painel.scrollIntoView({behavior:'smooth', block:'start'}); } catch (_) {}
  }
}

async function abrirWhatsappComunidade(numero) {
  if (!(await exigirAssinaturaAtiva('WhatsApp para contato'))) return;
  abrirLinkComunidade('https://wa.me/' + String(numero || '').replace(/\D/g,''));
}

function comunidadeMudarFoto(id, delta) {
  const item = comunidadeBuscarPerfilPorId(id);
  if (!item) return;
  const fotos = Array.isArray(item.fotos) ? item.fotos.slice(0,10) : [];
  if (fotos.length < 2) return;
  let atual = Number(comunidadeCarrosselEstado[id] || 0);
  atual = (atual + Number(delta || 0) + fotos.length) % fotos.length;
  comunidadeCarrosselEstado[id] = atual;
  const post = document.getElementById('comunidadePost_' + id);
  if (!post) return renderizarComunidadePublica(comunidadePublicaCache);
  const img = post.querySelector('.comunidade-feed-img');
  const contador = post.querySelector('.comunidade-foto-contador');
  const foto = fotos[atual];
  if (img && foto) {
    img.dataset.fallbackIndex = '0';
    img.dataset.id = String(foto.id || '');
    img.dataset.fallback = String(foto.urlFallback || '');
    img.dataset.fallback2 = String(foto.urlFallback2 || '');
    img.dataset.fallback3 = String(foto.urlFallback3 || '');
    img.src = comunidadeImagemUrl(foto);
  }
  if (contador) contador.textContent = (atual + 1) + '/' + fotos.length;
}

function abrirPerfilComunidadePorId(id) {
  const idx = comunidadePublicaCache.findIndex(function(p){ return String(p && p.id || '') === String(id || ''); });
  if (idx >= 0) abrirPerfilComunidade(idx);
}

function abrirPerfilComunidade(indice) {
  const item = comunidadePublicaCache[Number(indice)];
  if (!item) return;
  const lista = document.getElementById('comunidadeListaView');
  const detalhe = document.getElementById('comunidadeDetalheView');
  if (lista) lista.style.display = 'none';
  if (detalhe) detalhe.style.display = 'block';
  comunidadeDefinirVisao('detail');
  const titulo = document.getElementById('comunidadeDetalheTitulo');
  const desc = document.getElementById('comunidadeDetalheDescricao');
  const avatar = document.getElementById('comunidadeDetalheAvatar');
  const galeria = document.getElementById('comunidadeDetalheFotos');
  const postsUsuario = comunidadePublicaCache.filter(function(p){ return String(p.usuarioId || p.id) === String(item.usuarioId || item.id); });
  if (titulo) titulo.textContent = item.nome || item.cabecalho || 'Membro MAPTORK';
  if (desc) desc.textContent = 'Perfil com ' + postsUsuario.length + (postsUsuario.length === 1 ? ' publicação' : ' publicações');
  if (avatar) {
    const fotoPerfil = item.fotoPerfil || null;
    const avatarUrl = comunidadeImagemUrl(fotoPerfil);
    avatar.innerHTML = avatarUrl ? '<img src="' + comunidadeEscaparHtml(avatarUrl) + '" ' + comunidadeAtributosImagem(fotoPerfil) + ' alt="Foto de perfil">' : '<span>' + comunidadeEscaparHtml(comunidadeIniciais(item.nome || item.cabecalho)) + '</span>';
  }
  if (galeria) galeria.innerHTML = postsUsuario.map(function(post){
    const fotos = Array.isArray(post.fotos) ? post.fotos.slice(0,10) : [];
    const midias = post.youtubeId ? '<iframe class="comunidade-youtube" src="https://www.youtube-nocookie.com/embed/' + comunidadeEscaparHtml(post.youtubeId) + '?playsinline=1&fs=0&rel=0&enablejsapi=1" title="Vídeo do usuário" loading="lazy" allowfullscreen></iframe>' : fotos.map(function(foto){
      const url = comunidadeImagemUrl(foto);
      return '<button type="button" class="comunidade-foto-detalhe" data-url="' + comunidadeEscaparHtml(url) + '" onclick="abrirImagemComunidade(this.dataset.url)"><img src="' + comunidadeEscaparHtml(url) + '" ' + comunidadeAtributosImagem(foto) + ' alt="Foto da comunidade" loading="lazy"></button>';
    }).join('');
    return '<div class="comunidade-perfil-post"><strong>' + comunidadeEscaparHtml(post.cabecalho || 'Publicação') + '</strong><p>' + comunidadeEscaparHtml(post.descricao || '') + '</p><div class="comunidade-perfil-post-midias">' + midias + '</div></div>';
  }).join('');
  const w = String(item.whatsapp || '').replace(/\D/g,'');
  const btn = document.getElementById('comunidadeWhatsappBtn');
  if (btn) {
    btn.style.display = w ? 'inline-flex' : 'none';
    btn.onclick = w ? function(){ abrirWhatsappComunidade(w); } : null;
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function fecharPerfilComunidade() {
  const lista = document.getElementById('comunidadeListaView');
  const detalhe = document.getElementById('comunidadeDetalheView');
  if (lista) lista.style.display = 'block';
  if (detalhe) detalhe.style.display = 'none';
  comunidadeDefinirVisao('list');
  window.scrollTo({top:0,behavior:'smooth'});
}

function abrirImagemComunidade(url) {
  if (!url) return;
  abrirLinkComunidade(url);
}

function abrirLinkComunidade(url) {
  if (window.AndroidApp && typeof window.AndroidApp.openExternal === 'function') {
    window.AndroidApp.openExternal(url); return;
  }
  window.open(url, '_blank', 'noopener');
}

async function comunidadeFocarComentario(id) {
  if (!(await exigirAssinaturaAtiva('Comentários na Comunidade'))) return;
  const input = document.getElementById('comunidadeComentarioInput_' + id);
  if (input) input.focus();
}


// Sincroniza curtidas/comentários feitos enquanto uma publicação ainda está
// sendo gravada. A interface nunca precisa desfazer a ação só porque o post
// ainda não ficou disponível na rota social do servidor.
async function comunidadeSincronizarInteracoesPendentes(item, idServidor) {
  if (!item) return;
  const realId = String(idServidor || item._postIdServidor || item.id || '').trim();
  if (!realId || /^post_\d+_/i.test(realId)) return;
  const token = String(localStorage.getItem('token') || '').trim();
  if (!token || item._sincronizandoInteracoes === true) return;

  item._sincronizandoInteracoes = true;
  try {
    // Curtida: a rota alterna o estado. Para um post recém-publicado o estado
    // base é "não curtido"; em erros "publicação não encontrada" guardamos
    // também o estado anterior para saber se realmente é necessário alternar.
    if (item._curtidaPendente === true) {
      const desejado = item.curtidoPorMim === true;
      const base = item._curtidaPendenteBase === true;
      if (desejado !== base) {
        const fd = new FormData();
        fd.append('action','comunidadeCurtir');
        fd.append('token',token);
        fd.append('id',realId);
        const r = await fetch(comunidadeApiUrl(),{method:'POST',body:fd,keepalive:true});
        const d = await r.json();
        if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Não foi possível sincronizar a curtida.');
        item.curtidoPorMim = d.curtido === true;
        item.curtidas = Math.max(0, Number(d.curtidas || item.curtidas || 0));
      }
      delete item._curtidaPendente;
      delete item._curtidaPendenteBase;
    }

    // Comentários otimistas são enviados na ordem em que foram criados.
    const comentarios = Array.isArray(item.comentarios) ? item.comentarios : [];
    for (let i = 0; i < comentarios.length; i++) {
      const c = comentarios[i];
      if (!c || c._pendenteServidor !== true) continue;
      const texto = String(c.texto || '').trim();
      if (!texto) { delete c._pendenteServidor; continue; }

      const fd = new FormData();
      fd.append('action','comunidadeComentar');
      fd.append('token',token);
      fd.append('id',realId);
      fd.append('texto',texto);
      const r = await fetch(comunidadeApiUrl(),{method:'POST',body:fd,keepalive:true});
      const d = await r.json();
      if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Não foi possível sincronizar o comentário.');
      if (d.comentario) {
        comentarios[i] = Object.assign({}, d.comentario, { _aguardandoFeed: true });
      } else {
        delete c._pendenteServidor;
        c._aguardandoFeed = true;
      }
      item.comentariosTotal = Number(d.comentariosTotal || comentarios.length);
    }

    item._socialPreservarAte = Date.now() + 6000;
    comunidadeSalvarCachePublico();
  } catch (e) {
    // Se o post ainda estiver propagando no servidor, preserva tudo localmente.
    // Uma próxima tentativa acontece ao concluir o upload ou numa nova ação.
    const msg = String((e && e.message) || '');
    if (!/publica[cç][aã]o\s+n[aã]o\s+encontrada/i.test(msg)) {
      console.warn('Falha ao sincronizar interação pendente:', e);
    }
  } finally {
    item._sincronizandoInteracoes = false;
  }
}

function comunidadeAgendarSincronizacaoInteracoes(item, idServidor) {
  if (!item) return;
  const realId = String(idServidor || item._postIdServidor || '').trim();
  if (!realId) return;
  [600, 1800, 4200].forEach(function(ms){
    setTimeout(function(){ comunidadeSincronizarInteracoesPendentes(item, realId); }, ms);
  });
}

async function comunidadeCurtirPerfil(id, botao) {
  if (!exigirCadastroParaAcao()) return;
  const token = String(localStorage.getItem('token') || '').trim();
  const item = comunidadeBuscarPerfilPorId(id);
  const countEl = document.getElementById('comunidadeCurtidas_' + id);
  const antigoCurtido = item ? item.curtidoPorMim === true : !!(botao && botao.classList.contains('is-liked'));
  const antigoTotal = item ? Number(item.curtidas || 0) : Math.max(0, parseInt(String((countEl&&countEl.textContent)||'0'),10)||0);
  const novoCurtido = !antigoCurtido;
  const novoTotal = Math.max(0, antigoTotal + (novoCurtido ? 1 : -1));

  // Resultado primeiro: coração e contador respondem no mesmo toque.
  if (item) { item.curtidoPorMim = novoCurtido; item.curtidas = novoTotal; }
  comunidadeAtualizarLikeNaTela(id, novoCurtido, novoTotal, botao);
  renderizarNovosPostsInicio(comunidadePublicaCache);
  comunidadeSalvarCachePublico();

  // Limpa um aviso antigo. A curtida em publicação recém-criada é apenas local
  // enquanto o post/imagens ainda não chegaram ao banco de dados.
  comunidadeMensagem('comunidadeMensagem', '', true);

  const idTexto = String(id || '');
  const publicacaoAindaLocal = !!(item && item._otimista === true) || /^post_\d+_/i.test(idTexto);
  if (publicacaoAindaLocal) {
    // Guarda a intenção para enviar assim que o post receber o ID definitivo.
    // Assim a curtida não apenas permanece na tela: ela também chega ao banco.
    if (item) {
      if (item._curtidaPendente !== true) item._curtidaPendenteBase = antigoCurtido;
      item._curtidaPendente = true;
      comunidadeSalvarCachePublico();
      if (item._postIdServidor) comunidadeAgendarSincronizacaoInteracoes(item, item._postIdServidor);
    }
    return;
  }

  if (botao) botao.disabled = true;

  try {
    const fd = new FormData();
    fd.append('action','comunidadeCurtir');
    fd.append('token',token);
    fd.append('id',id);
    const r = await fetch(comunidadeApiUrl(),{method:'POST',body:fd,keepalive:true});
    const d = await r.json();
    if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Não foi possível curtir.');
    const confirmadoCurtido = d.curtido === true;
    const confirmadoTotal = Math.max(0, Number(d.curtidas || 0));
    if (item) {
      item.curtidas = confirmadoTotal;
      item.curtidoPorMim = confirmadoCurtido;
      item._socialPreservarAte = Date.now() + 6000;
    }
    comunidadeAtualizarLikeNaTela(id, confirmadoCurtido, confirmadoTotal, botao);
    renderizarNovosPostsInicio(comunidadePublicaCache);
    comunidadeSalvarCachePublico();
  } catch(e) {
    const msg = String((e && e.message) || 'Erro ao curtir.');
    const naoEncontrada = /publica[cç][aã]o\s+n[aã]o\s+encontrada/i.test(msg);

    // Em uma janela curta o post pode já ter saído do modo otimista no cliente,
    // mas ainda não estar disponível na rota de curtidas. Nesse caso mantém o
    // resultado visual e deixa a próxima atualização do cache regularizar.
    if (naoEncontrada) {
      if (item) {
        if (item._curtidaPendente !== true) item._curtidaPendenteBase = antigoCurtido;
        item._curtidaPendente = true;
        comunidadeSalvarCachePublico();
        comunidadeAgendarSincronizacaoInteracoes(item, item._postIdServidor || id);
      }
      comunidadeMensagem('comunidadeMensagem', '', true);
      return;
    }

    // Para outros erros reais, mantém o comportamento seguro de rollback.
    if (item) { item.curtidoPorMim = antigoCurtido; item.curtidas = antigoTotal; }
    comunidadeAtualizarLikeNaTela(id, antigoCurtido, antigoTotal, botao);
    renderizarNovosPostsInicio(comunidadePublicaCache);
    comunidadeSalvarCachePublico();
    comunidadeMensagem('comunidadeMensagem', msg + ' A curtida foi desfeita.', false);
  } finally {
    if (botao) botao.disabled = false;
  }
}

async function comunidadeComentarPerfil(id) {
  if (!(await exigirAssinaturaAtiva('Comentários na Comunidade'))) return;
  const input = document.getElementById('comunidadeComentarioInput_' + id);
  const texto = String((input && input.value) || '').trim();
  if (!texto) return;
  const token = String(localStorage.getItem('token') || '').trim();
  const item = comunidadeBuscarPerfilPorId(id);
  if (!item) return;
  const box = input ? input.closest('.comunidade-comentar-box') : null;
  const btn = box ? box.querySelector('button') : null;
  const antigoTotal = Number(item.comentariosTotal || (Array.isArray(item.comentarios) ? item.comentarios.length : 0));
  const antigoExpandido = item.comentariosExpandidos === true;
  if (!Array.isArray(item.comentarios)) item.comentarios = [];
  const comentarioTemp = {
    id: comunidadeIdTemporario('comentario'),
    nome: String(localStorage.getItem('nome') || 'Você').trim() || 'Você',
    texto: texto,
    _otimista: true,
    _pendenteServidor: true
  };

  // Resultado primeiro: limpa o campo e mostra o comentário imediatamente.
  item.comentarios.push(comentarioTemp);
  item.comentariosTotal = antigoTotal + 1;
  item.comentariosExpandidos = true;
  if (input) input.value = '';
  comunidadeAtualizarComentariosNaTela(id,item);
  renderizarNovosPostsInicio(comunidadePublicaCache);
  comunidadeSalvarCachePublico();
  if (btn) { btn.disabled = true; btn.textContent = 'PUBLICADO'; }

  // Se a publicação ainda é local, mantém o comentário visível e enfileirado.
  // Ele será enviado automaticamente assim que o ID definitivo estiver pronto.
  const idTextoComentario = String(id || '');
  const publicacaoComentarioAindaLocal = item._otimista === true || /^post_\d+_/i.test(idTextoComentario);
  if (publicacaoComentarioAindaLocal) {
    comunidadeMensagem('comunidadeMensagem', '', true);
    if (item._postIdServidor) comunidadeAgendarSincronizacaoInteracoes(item, item._postIdServidor);
    if (btn) { btn.disabled = false; btn.textContent = 'PUBLICAR'; }
    return;
  }

  try {
    const fd = new FormData();
    fd.append('action','comunidadeComentar');
    fd.append('token',token);
    fd.append('id',id);
    fd.append('texto',texto);
    const r = await fetch(comunidadeApiUrl(),{method:'POST',body:fd,keepalive:true});
    const d = await r.json();
    if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Não foi possível comentar.');
    const idx = item.comentarios.findIndex(function(c){ return c && c.id === comentarioTemp.id; });
    if (idx >= 0 && d.comentario) {
      item.comentarios[idx] = Object.assign({}, d.comentario, { _aguardandoFeed: true });
    } else if (idx >= 0 && item.comentarios[idx]) {
      delete item.comentarios[idx]._pendenteServidor;
      delete item.comentarios[idx]._otimista;
      item.comentarios[idx]._aguardandoFeed = true;
    }
    item.comentariosTotal = Number(d.comentariosTotal || item.comentarios.length);
    item._socialPreservarAte = Date.now() + 6000;
    comunidadeAtualizarComentariosNaTela(id,item);
    renderizarNovosPostsInicio(comunidadePublicaCache);
    comunidadeSalvarCachePublico();
  } catch(e) {
    const msg = String((e && e.message) || 'Erro ao comentar.');
    const naoEncontrada = /publica[cç][aã]o\s+n[aã]o\s+encontrada/i.test(msg);

    if (naoEncontrada) {
      // O comentário continua na tela e no cache. Não restaura o campo e não
      // mostra aviso de erro; tenta sincronizar novamente em segundo plano.
      comentarioTemp._pendenteServidor = true;
      comunidadeAtualizarComentariosNaTela(id,item);
      renderizarNovosPostsInicio(comunidadePublicaCache);
      comunidadeSalvarCachePublico();
      comunidadeMensagem('comunidadeMensagem', '', true);
      comunidadeAgendarSincronizacaoInteracoes(item, item._postIdServidor || id);
      return;
    }

    // Somente erros reais (não relacionados à propagação do post) desfazem.
    const idx = item.comentarios.findIndex(function(c){ return c && c.id === comentarioTemp.id; });
    if (idx >= 0) item.comentarios.splice(idx,1);
    item.comentariosTotal = antigoTotal;
    item.comentariosExpandidos = antigoExpandido;
    if (input && !input.value) input.value = texto;
    comunidadeAtualizarComentariosNaTela(id,item);
    renderizarNovosPostsInicio(comunidadePublicaCache);
    comunidadeSalvarCachePublico();
    comunidadeMensagem('comunidadeMensagem', msg + ' O comentário foi desfeito.', false);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'PUBLICAR'; }
  }
}

async function carregarMeuPerfilComunidade(forcar) {
  const token = String(localStorage.getItem('token') || '').trim();
  if (!token) return null;

  if (!forcar && comunidadeMeuPerfilCarregado) {
    if (comunidadeMeuPerfil) renderizarFotoPerfilComunidade(comunidadeMeuPerfil.fotoPerfil || null);
    return comunidadeMeuPerfil;
  }
  if (comunidadeMeuPerfilCarregando) return comunidadeMeuPerfilCarregando;

  comunidadeMensagem('comunidadeEditorMensagem','',true);
  comunidadeMeuPerfilCarregando = (async function() {
    try {
      const r = await fetch(comunidadeApiUrl() + '?action=comunidadeObterMinha&token=' + encodeURIComponent(token) + '&_t=' + Date.now(), {cache:'no-store'});
      const d = await r.json();
      if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Não foi possível carregar seu perfil.');
      const fotoVisualLocal = (comunidadeFotoPerfilPendente && comunidadeFotoPerfilPendente.url)
        ? { url: comunidadeFotoPerfilPendente.url, _local: true }
        : (maptorkPerfilFotoOtimistaAtiva && comunidadeMeuPerfil ? comunidadeMeuPerfil.fotoPerfil : null);
      comunidadeMeuPerfil = d.perfil || (d.dados && d.dados.perfil) || null;
      comunidadeMeuPerfilCarregado = true;
      if (fotoVisualLocal) {
        if (!comunidadeMeuPerfil) comunidadeMeuPerfil = {};
        comunidadeMeuPerfil.fotoPerfil = fotoVisualLocal;
      } else {
        comunidadeFotoPerfilPendente = null;
      }
      renderizarFotoPerfilComunidade((comunidadeMeuPerfil && comunidadeMeuPerfil.fotoPerfil) || null);
      comunidadeSalvarCacheUsuario();
      return comunidadeMeuPerfil;
    } catch (e) {
      console.error(e);
      // Se já existe cache local, mantém a imagem e os dados visíveis.
      if (!comunidadeMeuPerfilCarregado) {
        comunidadeMeuPerfil = null;
        comunidadeMeuPerfilCarregado = true;
        renderizarMinhasFotosComunidade();
        atualizarStatusMeuPerfilComunidade();
      }
      return comunidadeMeuPerfil;
    } finally {
      comunidadeMeuPerfilCarregando = null;
    }
  })();
  return comunidadeMeuPerfilCarregando;
}

async function salvarFotoPerfilConta() {
  if (!usuarioPossuiCadastroLocal()) {
    irParaCadastro();
    return;
  }
  if (!comunidadeFotoPerfilPendente || !comunidadeFotoPerfilPendente.file) {
    comunidadeMensagem('comunidadeFotoPerfilMensagem','Escolha uma foto primeiro.',false); return;
  }

  const pendente = comunidadeFotoPerfilPendente;
  const btn = document.getElementById('comunidadeSalvarFotoPerfilBtn');

  // Aplica imediatamente a imagem selecionada em Perfil, Comunidade e Novos Posts.
  maptorkPerfilFotoOtimistaAtiva = true;
  maptorkAplicarFotoPerfilLocal({ url: pendente.url, _local: true });
  comunidadeMensagem('comunidadeFotoPerfilMensagem','Foto atualizada.',true);
  if (btn) { btn.textContent='SALVO ✓'; setTimeout(function(){ if(btn)btn.textContent='SALVAR FOTO'; },700); }

  // Compressão e envio deixam de bloquear a interface.
  setTimeout(async function(){
    try {
      const avatar = await comprimirFotoComunidade(pendente.file);
      const fotoLocalPersistente = { url: avatar.dataUrl, _local: true };
      maptorkAplicarFotoPerfilLocal(fotoLocalPersistente);
      // DataURL já é persistente: a Comunidade pode reutilizar sem esperar o Drive.
      try{comunidadeSalvarCacheUsuario();}catch(_){}
      if (pendente.url) try { URL.revokeObjectURL(pendente.url); } catch (_) {}
      comunidadeFotoPerfilPendente = null;

      await maptorkSyncEnfileirar('profile-photo','profile-photo:'+String(localStorage.getItem('email')||'anonimo').toLowerCase(),{
        token:String(localStorage.getItem('token')||''),
        fileName:avatar.fileName,
        mimeType:avatar.mimeType,
        imageBase64:avatar.base64,
        dataUrl:avatar.dataUrl
      });
    } catch(e) {
      comunidadeMensagem('comunidadeFotoPerfilMensagem',(e.message||'Não foi possível preparar a foto.')+' A foto continua visível; escolha novamente para tentar sincronizar.',false);
    }
  }, 0);
}

function renderizarMeusPostsComunidade(posts) {
  const lista = document.getElementById('comunidadeMeusPostsLista');
  const contador = document.getElementById('comunidadeMeusPostsContador');
  if (!lista) return;
  posts = Array.isArray(posts) ? posts : [];

  if (contador) contador.textContent = posts.length + (posts.length === 1 ? ' post' : ' posts');

  let assinatura = '';
  try { assinatura = JSON.stringify(posts); } catch (e) { assinatura = String(posts.length); }
  if (lista.dataset.renderSignature === assinatura) return;

  if (!posts.length) {
    lista.innerHTML = '<div class="comunidade-empty conta-posts-empty">Você ainda não publicou nenhum post.</div>';
    lista.dataset.renderSignature = assinatura;
    return;
  }

  lista.innerHTML = posts.map(function(p){
    const fotos = Array.isArray(p.fotos) ? p.fotos : [];
    const foto = fotos[0] || null;
    const url = comunidadeImagemUrl(foto);
    const midia = p.youtubeId
      ? '<img src="https://i.ytimg.com/vi/' + comunidadeEscaparHtml(p.youtubeId) + '/hqdefault.jpg" alt="Vídeo do YouTube" loading="eager" decoding="async">'
      : (url ? '<img src="' + comunidadeEscaparHtml(url) + '" ' + comunidadeAtributosImagem(foto) + ' alt="Foto do post" loading="eager" decoding="async">' : '<span>POST</span>');
    const resumo = comunidadeEscaparHtml(String(p.descricao || '').trim()) || (p.youtubeId ? 'Vídeo do YouTube publicado na comunidade.' : 'Publicação com imagens na comunidade.');
    const infoMidia = p.youtubeId ? 'Vídeo do YouTube' : fotos.length + (fotos.length === 1 ? ' foto' : ' fotos');
    return '<article class="admin-tool-item conta-post-item">' +
      '<div class="conta-post-item-main">' +
        '<div class="conta-post-thumb">' + midia + '</div>' +
        '<div class="admin-tool-item-info conta-post-item-info">' +
          '<h4>' + comunidadeEscaparHtml(p.cabecalho || 'Publicação') + '</h4>' +
          '<p>' + resumo + '</p>' +
          '<small>' + infoMidia + '</small>' +
        '</div>' +
      '</div>' +
      '<div class="admin-tool-item-actions conta-post-item-actions">' +
        '<button type="button" class="admin-tool-edit conta-post-edit-btn" data-id="' + comunidadeEscaparHtml(p.id) + '" onclick="editarMeuPostComunidade(this.dataset.id)">EDITAR</button>' +
        '<button type="button" class="admin-tool-delete conta-post-delete-btn" data-id="' + comunidadeEscaparHtml(p.id) + '" onclick="apagarMeuPostComunidade(this.dataset.id)">APAGAR</button>' +
      '</div>' +
    '</article>';
  }).join('');
  lista.dataset.renderSignature = assinatura;
}

async function carregarMeusPostsComunidade(forcar) {
  const lista = document.getElementById('comunidadeMeusPostsLista');
  if (!lista) return [];
  const token = String(localStorage.getItem('token') || '').trim();
  if (!token) return [];

  if (!forcar && comunidadeMeusPostsCarregado) {
    renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
    return comunidadeMeusPostsCache;
  }
  if (comunidadeMeusPostsCarregando) return comunidadeMeusPostsCarregando;

  // Só mostra "Carregando" quando ainda não existe nenhum conteúdo em cache.
  if (!comunidadeMeusPostsCarregado && !lista.dataset.renderSignature) {
    lista.innerHTML = '<div class="comunidade-loading">Carregando seus posts...</div>';
  }

  comunidadeMeusPostsCarregando = (async function() {
    try {
      const r = await fetch(comunidadeApiUrl() + '?action=comunidadeListarMeus&token=' + encodeURIComponent(token) + '&_t=' + Date.now(), {cache:'no-store'});
      const d = await r.json();
      if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Erro ao carregar seus posts.');
      const postsServidor = Array.isArray(d.posts) ? d.posts : [];
      comunidadeMeusPostsCache = comunidadeMesclarPostsOtimistas(postsServidor, comunidadeMeusPostsCache);
      comunidadeMeusPostsCarregado = true;
      renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
      comunidadeSalvarCacheUsuario();
      return comunidadeMeusPostsCache;
    } catch (e) {
      if (!comunidadeMeusPostsCarregado) {
        lista.innerHTML = '<div class="comunidade-empty">' + comunidadeEscaparHtml(e.message || 'Erro ao carregar seus posts.') + '</div>';
      }
      return comunidadeMeusPostsCache;
    } finally {
      comunidadeMeusPostsCarregando = null;
    }
  })();
  return comunidadeMeusPostsCarregando;
}

async function apagarMeuPostComunidade(id) {
  if (!id || !confirm('Apagar este post?')) return;
  const token = String(localStorage.getItem('token') || '').trim();

  // Some da tela imediatamente.
  const backup = comunidadeRemoverPostLocal(id);
  comunidadeMensagem('comunidadeEditorMensagem','Post apagado.',true);

  try {
    const fd = new FormData();
    fd.append('action','comunidadeExcluirPost'); fd.append('token',token); fd.append('id',id);
    const r = await fetch(comunidadeApiUrl(), {method:'POST',body:fd,keepalive:true});
    const d = await r.json();
    if (!d || d.ok !== true) throw new Error((d && d.mensagem) || 'Erro ao apagar o post.');
    comunidadeLimparCacheImagens();
    // Sincroniza sem bloquear a interface.
    carregarComunidadePublica(true).catch(function(){});
    carregarMeusPostsComunidade(true).catch(function(){});
  } catch (e) {
    comunidadeRestaurarPostLocal(backup);
    comunidadeMensagem('comunidadeEditorMensagem',(e.message || 'Erro ao apagar o post.')+' O post foi restaurado.',false);
  }
}

function atualizarStatusMeuPerfilComunidade() {
  const el = document.getElementById('comunidadeMeuStatus');
  if (!el) return;
  const st = String((comunidadeMeuPerfil && comunidadeMeuPerfil.status) || 'novo').toLowerCase();
  el.className = 'comunidade-status-box status-' + st;
  if (st === 'aprovado') el.textContent = 'Sua publicação mais recente está no ar';
  else if (st === 'pendente') el.textContent = 'Publicação anterior';
  else el.textContent = '';
}

function selecionarFotoPerfilComunidade(input) {
  const file = input && input.files && input.files[0];
  if (!file) return;
  if (!/^image\//i.test(file.type || '')) {
    comunidadeMensagem('comunidadeEditorMensagem','Selecione uma imagem válida.',false);
    return;
  }
  if (comunidadeFotoPerfilPendente && comunidadeFotoPerfilPendente.url) try { URL.revokeObjectURL(comunidadeFotoPerfilPendente.url); } catch (_) {}
  comunidadeFotoPerfilPendente = {file:file,url:URL.createObjectURL(file)};
  input.value = '';
  renderizarFotoPerfilComunidade();
}

function renderizarFotoPerfilComunidade(fotoAtual) {
  const box = document.getElementById('comunidadeFotoPerfilPreview');
  const avatarConta = document.getElementById('contaAvatar');
  if (!box && !avatarConta) return;

  if (comunidadeFotoPerfilPendente && comunidadeFotoPerfilPendente.url) {
    const pendenteUrl = comunidadeFotoPerfilPendente.url;
    if (box && box.dataset.photoUrl !== pendenteUrl) {
      box.innerHTML = '<img src="' + pendenteUrl + '" alt="Nova foto de perfil">';
      box.dataset.photoUrl = pendenteUrl;
    }
    if (avatarConta && avatarConta.dataset.photoUrl !== pendenteUrl) {
      avatarConta.dataset.photoUrl = pendenteUrl;
      avatarConta.innerHTML = '<img src="' + pendenteUrl + '" alt="Nova foto de perfil">';
    }
    return;
  }

  const foto = fotoAtual || (comunidadeMeuPerfil && comunidadeMeuPerfil.fotoPerfil) || null;
  const url = comunidadeImagemUrl(foto);

  if (box) {
    if (box.dataset.photoUrl !== url) {
      box.innerHTML = url ? '<img src="' + comunidadeEscaparHtml(url) + '" ' + comunidadeAtributosImagem(foto) + ' alt="Foto de perfil" loading="eager" decoding="async">' : '<span>FOTO</span>';
      box.dataset.photoUrl = url;
    }
  }

  if (avatarConta) {
    if (url) {
      if (avatarConta.dataset.photoUrl !== url) {
        avatarConta.dataset.photoUrl = url;
        avatarConta.innerHTML = '<img src="' + comunidadeEscaparHtml(url) + '" ' + comunidadeAtributosImagem(foto) + ' alt="Foto de perfil" loading="eager" decoding="async">';
      }
    } else if (avatarConta.dataset.photoUrl) {
      avatarConta.dataset.photoUrl = '';
      avatarConta.textContent = obterIniciaisPerfil(String(localStorage.getItem('nome') || 'Usuário'));
    }
  }
}

function comunidadeTotalFotos() {
  return comunidadeFotosPendentes.length + comunidadeFotosAtuaisEdicao.length;
}

function selecionarFotosComunidade(input) {
  const arquivos = Array.from((input && input.files) || []);
  if (!arquivos.length) return;
  const disponiveis = Math.max(0, 10 - comunidadeTotalFotos());
  const usar = arquivos.slice(0, disponiveis);
  if (!usar.length) {
    comunidadeMensagem('comunidadeEditorMensagem','O limite é de 10 fotos.',false); return;
  }
  usar.forEach(function(file){
    if (!/^image\//i.test(file.type || '')) return;
    comunidadeFotosPendentes.push({file:file,url:URL.createObjectURL(file),nome:file.name});
  });
  input.value='';
  renderizarFotosSelecionadasComunidade();
}

function removerFotoPendenteComunidade(i) {
  const item = comunidadeFotosPendentes.splice(Number(i),1)[0];
  if (item && item.url) try { URL.revokeObjectURL(item.url); } catch(e) {}
  renderizarFotosSelecionadasComunidade();
}

function renderizarFotosSelecionadasComunidade() {
  const box=document.getElementById('comunidadeFotosSelecionadas');
  if (box) box.innerHTML = comunidadeFotosPendentes.map(function(item,i){
    return '<div class="comunidade-foto-edit"><img src="'+item.url+'" alt="Nova foto"><button type="button" onclick="removerFotoPendenteComunidade('+i+')">×</button><small>NOVA</small></div>';
  }).join('');
  atualizarContadorFotosComunidade();
}

function renderizarMinhasFotosComunidade() {
  const box=document.getElementById('comunidadeMinhasFotos');
  if (!box) return;
  const fotos = Array.isArray(comunidadeFotosAtuaisEdicao) ? comunidadeFotosAtuaisEdicao : [];
  box.innerHTML=fotos.map(function(foto,i){
    const url=comunidadeImagemUrl(foto); const id=String(foto.id||'');
    return '<div class="comunidade-foto-edit"><img src="'+comunidadeEscaparHtml(url)+'" '+comunidadeAtributosImagem(foto)+' alt="Foto" loading="lazy"><button type="button" data-id="'+comunidadeEscaparHtml(id)+'" onclick="excluirFotoComunidade(this.dataset.id)">×</button><small>ATUAL '+(i+1)+'</small></div>';
  }).join('');
  atualizarContadorFotosComunidade();
}

function atualizarContadorFotosComunidade() {
  const el=document.getElementById('comunidadeFotoContador');
  if (el) el.textContent = comunidadeTotalFotos() + ' / 10';
}

async function comprimirFotoComunidade(file) {
  if (!file) throw new Error('Imagem inválida.');
  if (file.size > 12*1024*1024) throw new Error('Uma das imagens é maior que 12 MB.');
  const dataUrl=await new Promise(function(resolve,reject){const r=new FileReader();r.onload=function(){resolve(r.result)};r.onerror=reject;r.readAsDataURL(file)});
  const img=await new Promise(function(resolve,reject){const i=new Image();i.onload=function(){resolve(i)};i.onerror=reject;i.src=dataUrl});
  const max=1400; let w=img.width,h=img.height;
  if (Math.max(w,h)>max){const s=max/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s)}
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
  const mime=file.type==='image/png'?'image/png':'image/jpeg';
  const out=c.toDataURL(mime,mime==='image/png'?undefined:.82);
  return {base64:out.split(',')[1],mimeType:mime,fileName:(file.name||'foto.jpg'),dataUrl:out};
}

async function salvarPerfilComunidade() {
  if (!(await exigirAssinaturaAtiva('Publicar na Comunidade'))) return;
  const token=String(localStorage.getItem('token')||'').trim();
  const cab=String((document.getElementById('comunidadeCabecalho')||{}).value||'').trim();
  const desc=String((document.getElementById('comunidadeDescricao')||{}).value||'').trim();
  const wat=String((document.getElementById('comunidadeWhatsapp')||{}).value||'').trim();
  const youtube=String((document.getElementById('comunidadeYoutube')||{}).value||'').trim();
  const editId = String((document.getElementById('comunidadePostEditandoId')||{}).value || comunidadePostEditandoId || '').trim();
  if (!cab) {comunidadeMensagem('comunidadeEditorMensagem','Informe o cabeçalho.',false);return;}
  if (!desc) {comunidadeMensagem('comunidadeEditorMensagem','Informe a descrição.',false);return;}
  if (youtube && !/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))[A-Za-z0-9_-]{11}/i.test(youtube)){comunidadeMensagem('comunidadeEditorMensagem','Cole um link válido do YouTube.',false);return;}
  if (comunidadeTotalFotos()<1 && !youtube){comunidadeMensagem('comunidadeEditorMensagem','Adicione uma foto ou um vídeo do YouTube.',false);return;}

  const btn=document.getElementById('comunidadeSalvarBtn');
  const fotosParaEnviar = comunidadeFotosPendentes.slice();
  const emailAtual = String(localStorage.getItem('email')||'').trim();
  const nomeAtual = String(localStorage.getItem('nome')||'Membro MAPTORK').trim() || 'Membro MAPTORK';

  if (editId) {
    // EDITAR: altera a publicação na tela antes de qualquer chamada ao servidor.
    const original = comunidadeMeusPostsCache.find(function(p){return String(p&&p.id||'')===editId;}) || comunidadePublicaCache.find(function(p){return String(p&&p.id||'')===editId;}) || {};
    const fotosExistentes = Array.isArray(comunidadeFotosAtuaisEdicao) ? comunidadeFotosAtuaisEdicao.slice() : (Array.isArray(original.fotos)?original.fotos.slice():[]);
    const localEditado = Object.assign({}, original, {
      id:editId,email:emailAtual||original.email,nome:nomeAtual||original.nome,
      cabecalho:cab,descricao:desc,whatsapp:wat,youtubeId:comunidadeExtrairYoutubeId(youtube),
      fotoPerfil:(comunidadeMeuPerfil&&comunidadeMeuPerfil.fotoPerfil)||original.fotoPerfil||null,
      fotos:fotosExistentes.concat(fotosParaEnviar.map(function(f){return {url:f.url,id:'',_local:true};})),
      _otimista:true,_editandoSync:true,_postIdServidor:editId,
      _fotosEsperadas:fotosExistentes.length+fotosParaEnviar.length
    });
    comunidadeMeusPostsCache=comunidadeMeusPostsCache.map(function(p){return String(p&&p.id||'')===editId?localEditado:p;});
    comunidadePublicaCache=comunidadePublicaCache.map(function(p){return String(p&&p.id||'')===editId?localEditado:p;});
    renderizarMeusPostsComunidade(comunidadeMeusPostsCache);renderizarComunidadePublica(comunidadePublicaCache);renderizarNovosPostsInicio(comunidadePublicaCache);
    prepararNovaPublicacaoComunidade();
    comunidadeMensagem('comunidadeEditorMensagem','Publicação atualizada.',true);
    if(btn){btn.textContent='SALVO ✓';setTimeout(function(){if(btn)btn.textContent='PUBLICAR AGORA';},700);}

    setTimeout(async function(){
      try{
        const imagens=[];
        for(let i=0;i<fotosParaEnviar.length;i++)imagens.push(await comprimirFotoComunidade(fotosParaEnviar[i].file));
        await maptorkSyncEnfileirar('community-edit','community-edit:'+editId,{
          token:token,id:editId,cabecalho:cab,descricao:desc,whatsapp:wat,youtube:youtube,
          imagens:imagens,imagensEnviadas:0,editConfirmado:false,
          fotosExistentes:fotosExistentes,email:emailAtual,nome:nomeAtual
        });
      }catch(e){comunidadeMensagem('comunidadeEditorMensagem',(e.message||'Erro ao preparar imagens.')+' A edição continua visível localmente.',false);}
    },0);
    return;
  }

  // NOVO POST: aparece instantaneamente; upload/compressão ficam em segundo plano.
  const tempId = comunidadeIdTemporario('post');
  const usuarioId = (comunidadeMeusPostsCache[0] && comunidadeMeusPostsCache[0].usuarioId) || '';
  const tempPost = {
    id: tempId,usuarioId:usuarioId,email:emailAtual,nome:nomeAtual,cabecalho:cab,descricao:desc,whatsapp:wat,
    youtubeId:comunidadeExtrairYoutubeId(youtube),fotoPerfil:(comunidadeMeuPerfil&&comunidadeMeuPerfil.fotoPerfil)||null,
    fotos:fotosParaEnviar.map(function(f){return {url:f.url,id:'',_local:true};}),curtidas:0,curtidoPorMim:false,comentarios:[],comentariosTotal:0,
    status:'aprovado',_otimista:true,_postIdServidor:'',_fotosEsperadas:fotosParaEnviar.length
  };
  comunidadePublicaCache.unshift(tempPost);comunidadeMeusPostsCache.unshift(tempPost);comunidadeMeusPostsCarregado=true;
  renderizarComunidadePublica(comunidadePublicaCache);renderizarNovosPostsInicio(comunidadePublicaCache);renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
  comunidadeFotosPendentes=[];prepararNovaPublicacaoComunidade();
  comunidadeMensagem('comunidadeEditorMensagem','Publicado.',true);
  if(btn){btn.textContent='PUBLICADO ✓';setTimeout(function(){if(btn)btn.textContent='PUBLICAR AGORA';},700);}

  setTimeout(async function(){
    try{
      const imagens=[];
      for(let i=0;i<fotosParaEnviar.length;i++)imagens.push(await comprimirFotoComunidade(fotosParaEnviar[i].file));
      await maptorkSyncEnfileirar('community-create','community-create:'+tempId,{
        token:token,tempId:tempId,cabecalho:cab,descricao:desc,whatsapp:wat,youtube:youtube,email:emailAtual,nome:nomeAtual,
        usuarioId:usuarioId,fotoPerfil:(comunidadeMeuPerfil&&comunidadeMeuPerfil.fotoPerfil)||null,
        imagens:imagens,imagensEnviadas:0,postIdServidor:''
      });
    }catch(e){comunidadeMensagem('comunidadeEditorMensagem',(e.message||'Erro ao preparar imagens.')+' O post continua visível localmente.',false);}
  },0);
}

async function excluirFotoComunidade(id) {
  if (!id || !confirm('Excluir esta foto?')) return;
  const token=String(localStorage.getItem('token')||'').trim();
  try {
    const fd=new FormData();fd.append('action','comunidadeExcluirFoto');fd.append('token',token);fd.append('fotoId',id);
    if (comunidadePostEditandoId) fd.append('postId', comunidadePostEditandoId);
    const endpointFoto = comunidadePostEditandoId ? comunidadeApiUrlEdicao() : comunidadeApiUrl();
    const r=await fetch(endpointFoto,{method:'POST',body:fd});const d=await r.json();if(!d||d.ok!==true)throw new Error((d&&d.mensagem)||'Erro ao excluir foto.');
    const postAtualizado = d.post || d.perfil || (d.dados && (d.dados.post || d.dados.perfil)) || null;
    if (comunidadePostEditandoId && postAtualizado && String(postAtualizado.id || '') === String(comunidadePostEditandoId)) {
      comunidadeFotosAtuaisEdicao = Array.isArray(postAtualizado.fotos) ? postAtualizado.fotos.slice(0,10) : [];
      comunidadeMeusPostsCache = comunidadeMeusPostsCache.map(function(p){ return String(p && p.id || '') === String(postAtualizado.id || '') ? postAtualizado : p; });
      comunidadePublicaCache = comunidadePublicaCache.map(function(p){ return String(p && p.id || '') === String(postAtualizado.id || '') ? postAtualizado : p; });
      renderizarMinhasFotosComunidade();
      renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
      renderizarComunidadePublica(comunidadePublicaCache);
      renderizarNovosPostsInicio(comunidadePublicaCache);
      comunidadeSalvarCacheUsuario();
      comunidadeMensagem('comunidadeEditorMensagem','Foto removida da publicação.',true);
      return;
    }
    comunidadePublicaCache=[];
    const perfilAtualizado = d.perfil || (d.dados && d.dados.perfil) || null;
    if (perfilAtualizado) {
      comunidadeMeuPerfil = perfilAtualizado;
      renderizarMinhasFotosComunidade();
      atualizarStatusMeuPerfilComunidade();
    }
    comunidadeMeuPerfilCarregado = false;
    comunidadeLimparCacheImagens();
    await carregarMeuPerfilComunidade(true);
  } catch(e){comunidadeMensagem('comunidadeEditorMensagem',e.message||'Erro ao excluir foto.',false)}
}

async function carregarComunidadeAdmin() {
  const lista=document.getElementById('adminComunidadeLista'); if(!lista)return;
  const token=String(localStorage.getItem('token')||'').trim();
  lista.innerHTML='<div class="comunidade-loading">Carregando publicações...</div>';
  try {
    const r=await fetch(comunidadeApiUrl()+'?action=adminComunidadeListar&token='+encodeURIComponent(token)+'&_t='+Date.now(),{cache:'no-store'});const d=await r.json();if(!d||d.ok!==true)throw new Error((d&&d.mensagem)||'Erro ao carregar moderação.');
    const perfis=Array.isArray(d.perfis)?d.perfis:(d.dados&&Array.isArray(d.dados.perfis)?d.dados.perfis:[]);
    renderizarComunidadeAdmin(perfis);
  } catch(e){lista.innerHTML='<div class="comunidade-empty">'+comunidadeEscaparHtml(e.message||'Erro ao carregar.')+'</div>'}
}

let comunidadeAdminGrupos = [];

function renderizarComunidadeAdmin(perfis) {
  const lista=document.getElementById('adminComunidadeLista'); if(!lista)return;
  if(!perfis.length){lista.innerHTML='<div class="comunidade-empty">Nenhuma publicação.</div>';return;}
  const mapa={};
  perfis.forEach(function(p){
    const email=String(p.email||'Sem e-mail').trim().toLowerCase()||'Sem e-mail';
    if(!mapa[email])mapa[email]={email:email,nome:String(p.nome||'Usuário'),posts:[]};
    mapa[email].posts.push(p);
  });
  comunidadeAdminGrupos=Object.keys(mapa).sort().map(function(email){return mapa[email];});
  lista.innerHTML=comunidadeAdminGrupos.map(function(grupo,i){
    return '<section class="admin-comunidade-usuario">'+
      '<button type="button" class="admin-comunidade-usuario-btn" data-grupo="'+i+'" onclick="alternarPostsUsuarioAdmin(this)">'+
        '<span><strong>'+comunidadeEscaparHtml(grupo.email)+'</strong><small>'+comunidadeEscaparHtml(grupo.nome)+'</small></span>'+
        '<span class="admin-comunidade-usuario-total">'+grupo.posts.length+(grupo.posts.length===1?' post':' posts')+'</span>'+
        '<span class="admin-comunidade-usuario-seta">›</span>'+
      '</button>'+
      '<div class="admin-comunidade-usuario-posts" id="adminComunidadeGrupo_'+i+'"></div>'+
    '</section>';
  }).join('');
}

function alternarPostsUsuarioAdmin(botao){
  const i=Number(botao&&botao.dataset.grupo),grupo=comunidadeAdminGrupos[i],box=document.getElementById('adminComunidadeGrupo_'+i);
  if(!grupo||!box)return;
  const abrir=!box.classList.contains('is-open');
  document.querySelectorAll('.admin-comunidade-usuario-posts.is-open').forEach(function(el){el.classList.remove('is-open');el.innerHTML='';});
  document.querySelectorAll('.admin-comunidade-usuario-btn.is-open').forEach(function(el){el.classList.remove('is-open');});
  if(abrir){box.innerHTML=renderizarPostsComunidadeAdmin(grupo.posts);box.classList.add('is-open');botao.classList.add('is-open');}
}

function renderizarPostsComunidadeAdmin(perfis){
  return perfis.map(function(p){
    const fotos=Array.isArray(p.fotos)?p.fotos:[];
    return '<article class="admin-comunidade-card">'+
      '<div class="admin-comunidade-head"><div><span class="comunidade-status-chip status-'+comunidadeEscaparHtml(p.status||'pendente')+'">'+comunidadeEscaparHtml((p.status||'pendente').toUpperCase())+'</span><h4>'+comunidadeEscaparHtml(p.cabecalho||p.nome||'Usuário')+'</h4></div><strong>'+fotos.length+' foto(s)</strong></div>'+
      '<p>'+comunidadeEscaparHtml(p.descricao||'')+'</p>'+(p.whatsapp?'<small>WhatsApp: '+comunidadeEscaparHtml(p.whatsapp)+'</small>':'')+
      '<div class="admin-comunidade-social-resumo"><span>'+Number(p.curtidas||0)+' curtidas</span><span>'+Number(p.comentariosTotal||0)+' comentários</span></div>'+
      (p.youtubeId?'<iframe class="comunidade-youtube" src="https://www.youtube-nocookie.com/embed/'+comunidadeEscaparHtml(p.youtubeId)+'?playsinline=1&fs=0&rel=0&enablejsapi=1" title="Vídeo da publicação" loading="lazy" allowfullscreen></iframe>':'')+
      '<div class="admin-comunidade-comentarios">'+(Array.isArray(p.comentarios)?p.comentarios.map(function(c){return '<div class="admin-comunidade-comentario"><span><strong>'+comunidadeEscaparHtml(c.nome||'Membro')+'</strong> '+comunidadeEscaparHtml(c.texto||'')+'</span><button type="button" data-post="'+comunidadeEscaparHtml(p.id)+'" data-comentario="'+comunidadeEscaparHtml(c.id)+'" onclick="excluirComentarioComunidadeAdmin(this.dataset.post,this.dataset.comentario)">APAGAR</button></div>';}).join(''):'')+'</div>'+
      '<div class="admin-comunidade-fotos">'+fotos.map(function(f){const u=comunidadeImagemUrl(f);return '<button type="button" class="admin-comunidade-thumb" data-url="'+comunidadeEscaparHtml(u)+'" onclick="abrirImagemComunidade(this.dataset.url)"><img src="'+comunidadeEscaparHtml(u)+'" '+comunidadeAtributosImagem(f)+' alt="Foto para moderação" loading="eager" decoding="async"></button>'}).join('')+'</div>'+
      '<div class="admin-comunidade-actions"><button type="button" class="cta admin-tool-delete" data-id="'+comunidadeEscaparHtml(p.id)+'" onclick="excluirPerfilComunidadeAdmin(this.dataset.id)">APAGAR POST</button></div>'+ 
    '</article>';
  }).join('');
}

async function excluirComentarioComunidadeAdmin(postId, comentarioId) {
  if(!confirm('Apagar este comentário?'))return;
  const token=String(localStorage.getItem('token')||'').trim();
  try{const fd=new FormData();fd.append('action','adminComunidadeExcluirComentario');fd.append('token',token);fd.append('id',postId);fd.append('comentarioId',comentarioId);const r=await fetch(comunidadeApiUrl(),{method:'POST',body:fd});const d=await r.json();if(!d||d.ok!==true)throw new Error((d&&d.mensagem)||'Erro ao apagar comentário.');comunidadePublicaCache=[];await carregarComunidadeAdmin();}
  catch(e){comunidadeMensagem('adminComunidadeMensagem',e.message||'Erro ao apagar comentário.',false)}
}

async function excluirPerfilComunidadeAdmin(id) {
  if(!confirm('Apagar esta publicação da Comunidade?'))return;
  const token=String(localStorage.getItem('token')||'').trim();
  try{const fd=new FormData();fd.append('action','adminComunidadeExcluir');fd.append('token',token);fd.append('id',id);const r=await fetch(comunidadeApiUrl(),{method:'POST',body:fd});const d=await r.json();if(!d||d.ok!==true)throw new Error((d&&d.mensagem)||'Erro ao excluir.');comunidadePublicaCache=[];await carregarComunidadeAdmin();}
  catch(e){comunidadeMensagem('adminComunidadeMensagem',e.message||'Erro ao excluir.',false)}
}


// Comunidade V5: tela cheia de vídeo compatível com navegador e WebView.
// O botão próprio do MAPTORK evita depender do fullscreen interno do YouTube,
// que não funciona em alguns previews/WebViews Android.
function comunidadeIconeTelaCheiaVideo() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="M3 8l6-6M21 8l-6-6M3 16l6 6M21 16l-6 6"/></svg>';
}

function comunidadeEstadoTelaCheiaVideo() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

function comunidadeSairTelaCheiaCss(shell) {
  if (!shell) shell = document.querySelector('.comunidade-youtube-shell.is-css-fullscreen');
  if (shell) shell.classList.remove('is-css-fullscreen');
  if (!document.querySelector('.comunidade-youtube-shell.is-css-fullscreen')) {
    document.documentElement.classList.remove('comunidade-video-fullscreen-lock');
    document.body.classList.remove('comunidade-video-fullscreen-lock');
  }
}

async function comunidadeAlternarTelaCheiaVideo(botao) {
  const shell = botao && botao.closest ? botao.closest('.comunidade-youtube-shell') : null;
  if (!shell) return;

  // Se já está em fullscreen nativo, sai normalmente.
  if (comunidadeEstadoTelaCheiaVideo()) {
    try {
      const sair = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (sair) {
        const r = sair.call(document);
        if (r && typeof r.catch === 'function') r.catch(function(){});
      }
    } catch (e) {}
    comunidadeSairTelaCheiaCss(shell);
    return;
  }

  // Se entrou pelo fallback CSS, o mesmo botão fecha.
  if (shell.classList.contains('is-css-fullscreen')) {
    comunidadeSairTelaCheiaCss(shell);
    return;
  }

  // Primeiro tenta o Fullscreen API real (Chrome/Android e navegadores compatíveis).
  let tentouNativo = false;
  try {
    const pedir = shell.requestFullscreen || shell.webkitRequestFullscreen || shell.webkitRequestFullScreen || shell.msRequestFullscreen;
    if (pedir) {
      tentouNativo = true;
      const r = pedir.call(shell);
      if (r && typeof r.catch === 'function') await r.catch(function(){});
    }
  } catch (e) {}

  // Alguns WebViews mostram o botão mas recusam o Fullscreen API.
  // Nesse caso, usa tela cheia dentro do próprio site, sem quebrar o vídeo.
  setTimeout(function(){
    if (!comunidadeEstadoTelaCheiaVideo()) {
      shell.classList.add('is-css-fullscreen');
      document.documentElement.classList.add('comunidade-video-fullscreen-lock');
      document.body.classList.add('comunidade-video-fullscreen-lock');
      try { shell.scrollIntoView({block:'center', inline:'center'}); } catch(e) {}
    } else if (tentouNativo) {
      comunidadeSairTelaCheiaCss(shell);
    }
  }, 140);
}

// Comunidade V6: pausa automaticamente o YouTube quando o post sai da tela.
// Assim o áudio/vídeo não continua tocando enquanto o usuário rola o feed.
let comunidadeVideoVisibilidadeObserver = null;

function comunidadePausarVideoFrame(frame) {
  if (!frame || !frame.contentWindow) return;
  try {
    frame.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: 'pauseVideo',
      args: ''
    }), '*');
  } catch (e) {}
}

function comunidadePausarTodosVideos() {
  document.querySelectorAll('iframe.comunidade-youtube').forEach(function(frame){
    comunidadePausarVideoFrame(frame);
  });
}

function comunidadeObservarVisibilidadeVideo(shell) {
  if (!shell || shell.dataset.maptorkAutoPause === '1') return;
  shell.dataset.maptorkAutoPause = '1';

  if (!('IntersectionObserver' in window)) return;
  if (!comunidadeVideoVisibilidadeObserver) {
    comunidadeVideoVisibilidadeObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        const alvo = entry.target;
        if (!alvo || alvo.classList.contains('is-css-fullscreen')) return;
        if (comunidadeEstadoTelaCheiaVideo() === alvo) return;

        // Mantém tocando enquanto uma parte útil do vídeo ainda está visível.
        // Ao sair do post (menos de 20% visível), pausa imediatamente.
        if (!entry.isIntersecting || entry.intersectionRatio < 0.20) {
          const frame = alvo.querySelector('iframe.comunidade-youtube');
          comunidadePausarVideoFrame(frame);
        }
      });
    }, { threshold: [0, 0.20, 0.50, 1] });
  }

  comunidadeVideoVisibilidadeObserver.observe(shell);
}

function comunidadePrepararVideosTelaCheia(root) {
  const base = root && root.querySelectorAll ? root : document;
  base.querySelectorAll('iframe.comunidade-youtube').forEach(function(frame){
    const shellExistente = frame.closest('.comunidade-youtube-shell');
    if (shellExistente) { comunidadeObservarVisibilidadeVideo(shellExistente); return; }
    const pai = frame.parentNode;
    if (!pai) return;

    const shell = document.createElement('div');
    shell.className = 'comunidade-youtube-shell';
    pai.insertBefore(shell, frame);
    shell.appendChild(frame);

    // Permissões úteis para navegadores que respeitam Permissions Policy.
    try {
      const allowAtual = String(frame.getAttribute('allow') || '');
      if (!/fullscreen/i.test(allowAtual)) frame.setAttribute('allow', (allowAtual ? allowAtual + '; ' : '') + 'fullscreen');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('webkitallowfullscreen', '');
    } catch (e) {}

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'comunidade-video-fullscreen-btn';
    botao.setAttribute('aria-label', 'Abrir vídeo em tela cheia');
    botao.innerHTML = comunidadeIconeTelaCheiaVideo();
    botao.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      comunidadeAlternarTelaCheiaVideo(botao);
    });
    shell.appendChild(botao);
    comunidadeObservarVisibilidadeVideo(shell);
  });
}

(function comunidadeObservarVideosTelaCheia(){
  function preparar(){ try { comunidadePrepararVideosTelaCheia(document); } catch(e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preparar, {once:true});
  else preparar();

  let agendado = false;
  const observar = new MutationObserver(function(){
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function(){ agendado = false; preparar(); });
  });
  try { observar.observe(document.documentElement, {childList:true, subtree:true}); } catch(e) {}

  ['fullscreenchange','webkitfullscreenchange','MSFullscreenChange'].forEach(function(nome){
    document.addEventListener(nome, function(){
      if (comunidadeEstadoTelaCheiaVideo()) {
        comunidadeSairTelaCheiaCss();
      }
    });
  });

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') comunidadeSairTelaCheiaCss();
  });

  document.addEventListener('visibilitychange', function(){
    if (document.hidden) comunidadePausarTodosVideos();
  });
})();



// ======================================================
// MAPTORK V92 - UI OTIMISTA GLOBAL / SINCRONIZAÇÃO EM SEGUNDO PLANO
// Tudo que é editado/publicado aparece primeiro no aparelho e só depois
// é confirmado no servidor. Operações com imagem ficam numa fila IndexedDB.
// ======================================================
let maptorkPerfilFotoOtimistaAtiva = false;
let maptorkSyncFila = [];
let maptorkSyncFilaCarregada = false;
let maptorkSyncProcessando = false;
let maptorkSyncTimer = null;
const MAPTORK_SYNC_QUEUE_KEY = 'pendingSyncV1';

function maptorkSyncTempId(prefixo){
  return 'local-' + String(prefixo || 'item') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
}

function maptorkIdentificadoresUsuarioAtual(){
  const email=String(localStorage.getItem('email')||'').trim().toLowerCase();
  const idsPosts=new Set();
  const idsUsuario=new Set();
  if(comunidadeMeuPerfil){
    if(comunidadeMeuPerfil.id)idsPosts.add(String(comunidadeMeuPerfil.id));
    if(comunidadeMeuPerfil.usuarioId)idsUsuario.add(String(comunidadeMeuPerfil.usuarioId));
  }
  (Array.isArray(comunidadeMeusPostsCache)?comunidadeMeusPostsCache:[]).forEach(function(p){
    if(!p)return;
    if(p.id)idsPosts.add(String(p.id));
    if(p.usuarioId)idsUsuario.add(String(p.usuarioId));
  });
  return {email:email,idsPosts:idsPosts,idsUsuario:idsUsuario};
}

function maptorkPostPertenceUsuarioAtual(post,ident){
  if(!post)return false;
  const i=ident||maptorkIdentificadoresUsuarioAtual();
  const emailPost=String(post.email||'').trim().toLowerCase();
  if(i.email && emailPost && emailPost===i.email)return true;
  const uid=String(post.usuarioId||'');
  if(uid && i.idsUsuario.has(uid))return true;
  const id=String(post.id||'');
  return !!(id && i.idsPosts.has(id));
}

function maptorkAplicarIdentidadeLocalNaLista(lista){
  if(!Array.isArray(lista))return lista;
  const ident=maptorkIdentificadoresUsuarioAtual();
  const nome=String(localStorage.getItem('nome')||((window.usuarioAtual&&window.usuarioAtual.nome)||'')).trim();
  const foto=(comunidadeMeuPerfil&&comunidadeMeuPerfil.fotoPerfil)||null;
  lista.forEach(function(post){
    if(!maptorkPostPertenceUsuarioAtual(post,ident))return;
    if(nome)post.nome=nome;
    if(maptorkPerfilFotoOtimistaAtiva && foto)post.fotoPerfil=foto;
  });
  return lista;
}

function maptorkAplicarNomeLocal(nome){
  const valor=String(nome||'').trim(); if(!valor)return;
  try{localStorage.setItem('nome',valor);}catch(_){}
  window.usuarioAtual=window.usuarioAtual||{}; window.usuarioAtual.nome=valor;
  const contaNome=document.getElementById('contaNome'); if(contaNome)contaNome.textContent=valor;
  const usuarioNome=document.getElementById('usuarioNome'); if(usuarioNome)usuarioNome.textContent='Bem-vindo, '+valor;
  try{atualizarResumoPerfil(assinaturaAtual);}catch(_){}
  const ident=maptorkIdentificadoresUsuarioAtual();
  [comunidadePublicaCache,comunidadeMeusPostsCache].forEach(function(lista){
    (Array.isArray(lista)?lista:[]).forEach(function(post){ if(maptorkPostPertenceUsuarioAtual(post,ident))post.nome=valor; });
  });
  try{renderizarComunidadePublica(comunidadePublicaCache);}catch(_){}
  try{renderizarNovosPostsInicio(comunidadePublicaCache);}catch(_){}
  try{renderizarMeusPostsComunidade(comunidadeMeusPostsCache);}catch(_){}
  try{comunidadeSalvarCacheUsuario();}catch(_){}
}

function maptorkAplicarFotoPerfilLocal(foto){
  if(!foto)return;
  if(!comunidadeMeuPerfil)comunidadeMeuPerfil={};
  comunidadeMeuPerfil.fotoPerfil=foto; comunidadeMeuPerfilCarregado=true;
  renderizarFotoPerfilComunidade(foto);
  const ident=maptorkIdentificadoresUsuarioAtual();
  [comunidadePublicaCache,comunidadeMeusPostsCache].forEach(function(lista){
    (Array.isArray(lista)?lista:[]).forEach(function(post){ if(maptorkPostPertenceUsuarioAtual(post,ident))post.fotoPerfil=foto; });
  });
  try{renderizarComunidadePublica(comunidadePublicaCache);}catch(_){}
  try{renderizarNovosPostsInicio(comunidadePublicaCache);}catch(_){}
  try{renderizarMeusPostsComunidade(comunidadeMeusPostsCache);}catch(_){}
  // Mantém o resumo do próprio usuário atualizado sem aguardar a rede.
  try{comunidadeSalvarCacheUsuario();}catch(_){}
}

function maptorkMesclarPendentesServidor(remotos, atuais){
  const server=Array.isArray(remotos)?remotos.slice():[];
  const local=Array.isArray(atuais)?atuais.filter(function(x){return x&&x._pendenteSync===true;}):[];
  if(!local.length)return server;
  local.forEach(function(item){
    const id=String(item.id||'');
    const original=String(item._idOriginal||'');
    const alvo=original||id;
    const idx=server.findIndex(function(x){return String(x&&x.id||'')===alvo;});
    if(idx>=0)server[idx]=item; else server.unshift(item);
  });
  return server;
}

function maptorkRenderFerramentasAdminCache(){
  const box=document.getElementById('adminFerramentasLista'); if(!box)return;
  const lista=Array.isArray(ferramentasAdminCache)?ferramentasAdminCache:[];
  if(!lista.length){box.innerHTML='<div class="admin-tool-empty">Nenhuma ferramenta adicionada ainda.</div>';return;}
  box.innerHTML='';
  lista.forEach(function(item){
    const card=document.createElement('div');card.className='admin-tool-item';
    const info=document.createElement('div');info.className='admin-tool-item-info';
    const h4=document.createElement('h4');h4.textContent=String(item.titulo||'Ferramenta');
    const p=document.createElement('p');p.textContent=String(item.texto||'');
    const small=document.createElement('small');small.textContent=String(item.link||'');
    info.appendChild(h4);info.appendChild(p);info.appendChild(small);
    const actions=document.createElement('div');actions.className='admin-tool-item-actions';
    const editar=document.createElement('button');editar.type='button';editar.className='admin-tool-edit';editar.textContent='EDITAR';editar.onclick=function(){editarFerramentaAdmin(item.id);};
    const excluir=document.createElement('button');excluir.type='button';excluir.className='admin-tool-delete';excluir.textContent='EXCLUIR';excluir.onclick=function(){excluirFerramentaAdmin(item.id,item.titulo);};
    actions.appendChild(editar);actions.appendChild(excluir);card.appendChild(info);card.appendChild(actions);box.appendChild(card);
  });
}

function maptorkAplicarFerramentaLocal(p){
  if(!p||!p.localId)return;
  const idLocal=String(p.localId); const idOriginal=String(p.id||'');
  const publicItem={id:idLocal,titulo:p.titulo,texto:p.texto,temImagem:p.temImagem===true,_pendenteSync:true,_idOriginal:idOriginal};
  const adminItem={id:idLocal,titulo:p.titulo,texto:p.texto,link:p.link,temImagem:p.temImagem===true,_pendenteSync:true,_idOriginal:idOriginal};
  function upsert(lista,item){const i=lista.findIndex(function(x){const xid=String(x&&x.id||'');return xid===idLocal||(idOriginal&&xid===idOriginal);});if(i>=0)lista[i]=item;else lista.unshift(item);}
  upsert(ferramentasDinamicasCache,publicItem);upsert(ferramentasAdminCache,adminItem);
  if(p.dataUrl)ferramentasImagensCache[idLocal]=p.dataUrl;
  renderizarFerramentasDinamicas();maptorkRenderFerramentasAdminCache();
  salvarFerramentasCacheLocal().catch(function(){});
}

function maptorkConfirmarFerramenta(p,d){
  const localId=String(p.localId||'');const realId=String((d&&d.id)||p.id||localId);
  function trocar(lista){return (Array.isArray(lista)?lista:[]).map(function(x){if(String(x&&x.id||'')!==localId)return x;const y=Object.assign({},x,{id:realId});delete y._pendenteSync;delete y._idOriginal;return y;});}
  ferramentasDinamicasCache=trocar(ferramentasDinamicasCache);ferramentasAdminCache=trocar(ferramentasAdminCache);
  if(localId!==realId&&ferramentasImagensCache[localId]){ferramentasImagensCache[realId]=ferramentasImagensCache[localId];delete ferramentasImagensCache[localId];}
  renderizarFerramentasDinamicas();maptorkRenderFerramentasAdminCache();salvarFerramentasCacheLocal().catch(function(){});
  setTimeout(function(){preCarregarFerramentasDinamicas(true).catch(function(){});},1000);
}

function maptorkRenderLojaAdminCache(){
  const box=document.getElementById('adminLojaLista');if(!box)return;
  const lista=Array.isArray(lojaAdminCache)?lojaAdminCache:[];
  if(!lista.length){box.innerHTML='<div class="admin-tool-empty">Nenhum produto adicionado ainda.</div>';return;}
  box.innerHTML='';
  lista.forEach(function(item){
    const card=document.createElement('div');card.className='admin-tool-item';
    const info=document.createElement('div');info.className='admin-tool-item-info';
    const h4=document.createElement('h4');h4.textContent=String(item.titulo||'Produto');
    const preco=document.createElement('small');preco.className='admin-loja-price';preco.textContent=String(item.preco||'');
    const p=document.createElement('p');p.textContent=String(item.texto||'');const small=document.createElement('small');small.textContent=String(item.link||'');
    info.appendChild(h4);info.appendChild(preco);info.appendChild(p);info.appendChild(small);
    const actions=document.createElement('div');actions.className='admin-tool-item-actions';
    const editar=document.createElement('button');editar.type='button';editar.className='admin-tool-edit';editar.textContent='EDITAR';editar.onclick=function(){editarProdutoLojaAdmin(item.id);};
    const excluir=document.createElement('button');excluir.type='button';excluir.className='admin-tool-delete';excluir.textContent='EXCLUIR';excluir.onclick=function(){excluirProdutoLojaAdmin(item.id,item.titulo);};
    actions.appendChild(editar);actions.appendChild(excluir);card.appendChild(info);card.appendChild(actions);box.appendChild(card);
  });
}

function maptorkAplicarLojaLocal(p){
  if(!p||!p.localId)return;
  const idLocal=String(p.localId),idOriginal=String(p.id||'');
  const item={id:idLocal,titulo:p.titulo,texto:p.texto,preco:p.preco,link:p.link,temImagem:p.temImagem===true,_pendenteSync:true,_idOriginal:idOriginal};
  function upsert(lista,obj){const i=lista.findIndex(function(x){const xid=String(x&&x.id||'');return xid===idLocal||(idOriginal&&xid===idOriginal);});if(i>=0)lista[i]=Object.assign({},obj);else lista.unshift(Object.assign({},obj));}
  upsert(lojaProdutosCache,item);upsert(lojaAdminCache,item);
  if(p.dataUrl)lojaImagensCache[idLocal]=p.dataUrl;
  renderizarLojaPublica();renderizarLojaInicio();maptorkRenderLojaAdminCache();salvarLojaCacheLocal().catch(function(){});
}

function maptorkConfirmarLoja(p,d){
  const localId=String(p.localId||'');const realId=String((d&&d.id)||p.id||localId);
  function trocar(lista){return (Array.isArray(lista)?lista:[]).map(function(x){if(String(x&&x.id||'')!==localId)return x;const y=Object.assign({},x,{id:realId});delete y._pendenteSync;delete y._idOriginal;return y;});}
  lojaProdutosCache=trocar(lojaProdutosCache);lojaAdminCache=trocar(lojaAdminCache);
  if(localId!==realId&&lojaImagensCache[localId]){lojaImagensCache[realId]=lojaImagensCache[localId];delete lojaImagensCache[localId];}
  renderizarLojaPublica();renderizarLojaInicio();maptorkRenderLojaAdminCache();salvarLojaCacheLocal().catch(function(){});
  setTimeout(function(){preCarregarLoja(true).catch(function(){});},1000);
}

function maptorkAplicarAtualizacaoLocal(p){
  if(!p||!p.localId)return;
  const idLocal=String(p.localId),idOriginal=String(p.id||'');
  const item=normalizarAtualizacaoInicio({id:idLocal,titulo:p.titulo,texto:p.texto,link:p.link,url:p.url||'',dataUrl:p.dataUrl||'',temImagem:p.temImagem===true});
  item._pendenteSync=true;item._idOriginal=idOriginal;
  const i=maptorkAtualizacoesInicio.findIndex(function(x){const xid=String(x&&x.id||'');return xid===idLocal||(idOriginal&&xid===idOriginal);});
  if(i>=0)maptorkAtualizacoesInicio[i]=item;else{maptorkAtualizacoesInicio.unshift(item);maptorkAtualizacaoIndice=0;}
  renderizarAtualizacaoInicioAtual();renderizarAtualizacaoAdmin();iniciarRotacaoAtualizacoes();salvarAtualizacoesInicioCacheLocal(maptorkAtualizacoesInicio).catch(function(){});
}

function maptorkConfirmarAtualizacao(p,d){
  const localId=String(p.localId||'');const realId=String((d&&d.id)||p.id||localId);
  maptorkAtualizacoesInicio=maptorkAtualizacoesInicio.map(function(x){if(String(x&&x.id||'')!==localId)return x;const y=Object.assign({},x,{id:realId});if(d&&d.url)y.url=d.url;if(d&&d.dataUrl)y.dataUrl=d.dataUrl;delete y._pendenteSync;delete y._idOriginal;return y;});
  renderizarAtualizacaoInicioAtual();renderizarAtualizacaoAdmin();salvarAtualizacoesInicioCacheLocal(maptorkAtualizacoesInicio).catch(function(){});
  setTimeout(function(){carregarImagemInicioServidor(true).catch(function(){});},1000);
}

async function maptorkSyncAbrirFila(){
  try{
    const banco=await abrirBancoCacheFerramentas();
    const fila=await new Promise(function(resolve,reject){const tx=banco.transaction(MAPTORK_FERRAMENTAS_CACHE_STORE,'readonly');const req=tx.objectStore(MAPTORK_FERRAMENTAS_CACHE_STORE).get(MAPTORK_SYNC_QUEUE_KEY);req.onsuccess=function(){resolve(Array.isArray(req.result)?req.result:[]);};req.onerror=function(){reject(req.error);};});
    banco.close();return fila;
  }catch(e){return [];}
}
async function maptorkSyncSalvarFila(){
  try{const banco=await abrirBancoCacheFerramentas();await new Promise(function(resolve,reject){const tx=banco.transaction(MAPTORK_FERRAMENTAS_CACHE_STORE,'readwrite');tx.objectStore(MAPTORK_FERRAMENTAS_CACHE_STORE).put(maptorkSyncFila,MAPTORK_SYNC_QUEUE_KEY);tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};});banco.close();}catch(e){console.warn('Fila de sincronização indisponível:',e);}
}
async function maptorkSyncEnfileirar(tipo,chave,payload){
  if(!maptorkSyncFilaCarregada){maptorkSyncFila=await maptorkSyncAbrirFila();maptorkSyncFilaCarregada=true;}
  const op={id:maptorkSyncTempId('sync'),tipo:String(tipo),chave:String(chave),payload:payload||{},tentativas:0,criadoEm:Date.now()};
  const i=maptorkSyncFila.findIndex(function(x){return x&&x.chave===op.chave;});if(i>=0)maptorkSyncFila[i]=op;else maptorkSyncFila.push(op);
  await maptorkSyncSalvarFila();
  clearTimeout(maptorkSyncTimer);maptorkSyncTimer=setTimeout(maptorkSyncProcessar,40);
  return op;
}

async function maptorkSyncEnviar(op){
  const p=op.payload||{};let r,d;
  if(op.tipo==='profile-name'){
    const fd=new FormData();fd.append('action','atualizarNome');fd.append('token',p.token||'');fd.append('nome',p.nome||'');
    r=await fetch(obterApiAssinaturas(),{method:'POST',body:fd});d=await r.json();
  }else if(op.tipo==='profile-photo'){
    // A foto do perfil é gratuita para qualquer conta cadastrada. Existem duas
    // implantações da Comunidade no projeto; algumas versões antigas ainda
    // exigiam assinatura. Tentamos as duas e aceitamos a primeira que reconhecer
    // a sessão e salvar a imagem.
    const endpointsFoto=[];
    [comunidadeApiUrl(),comunidadeApiUrlEdicao()].forEach(function(url){
      url=String(url||'').trim();
      if(url&&endpointsFoto.indexOf(url)<0)endpointsFoto.push(url);
    });
    let ultimoErroFoto='Não foi possível salvar a foto de perfil.';
    d=null;
    for(let ei=0;ei<endpointsFoto.length;ei++){
      try{
        const fd=new FormData();
        fd.append('action','comunidadeSalvarFotoPerfil');
        fd.append('token',p.token||'');
        fd.append('fileName',p.fileName||'foto.jpg');
        fd.append('mimeType',p.mimeType||'image/jpeg');
        fd.append('imageBase64',p.imageBase64||'');
        r=await fetch(endpointsFoto[ei],{method:'POST',body:fd,cache:'no-store'});
        const tentativa=await r.json();
        if(tentativa&&tentativa.ok===true){d=tentativa;break;}
        ultimoErroFoto=String((tentativa&&tentativa.mensagem)||ultimoErroFoto);
      }catch(erroFoto){
        ultimoErroFoto=String((erroFoto&&erroFoto.message)||ultimoErroFoto);
      }
    }
    if(!d||d.ok!==true){const errFoto=new Error(ultimoErroFoto);errFoto.permanente=true;throw errFoto;}
  }else if(op.tipo==='tool-save'){
    const form=new URLSearchParams();form.set('action','adminSalvarFerramenta');form.set('token',p.token||'');form.set('id',p.id||'');form.set('titulo',p.titulo||'');form.set('texto',p.texto||'');form.set('link',p.link||'');if(p.imageBase64){form.set('imageBase64',p.imageBase64);form.set('fileName',p.fileName||'');form.set('mimeType',p.mimeType||'');}
    r=await fetch(AUTH_API+'?action=adminSalvarFerramenta&_t='+Date.now(),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:form.toString()});d=await r.json();
  }else if(op.tipo==='store-save'){
    const form=new URLSearchParams();form.set('action','adminSalvarProdutoLoja');form.set('token',p.token||'');form.set('id',p.id||'');form.set('titulo',p.titulo||'');form.set('texto',p.texto||'');form.set('preco',p.preco||'');form.set('link',p.link||'');if(p.imageBase64){form.set('imageBase64',p.imageBase64);form.set('fileName',p.fileName||'');form.set('mimeType',p.mimeType||'');}
    r=await fetch(AUTH_API+'?action=adminSalvarProdutoLoja&_t='+Date.now(),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:form.toString()});d=await r.json();
  }else if(op.tipo==='update-save'){
    const form=new URLSearchParams();form.set('action','adminSalvarImagemInicio');form.set('token',p.token||'');if(p.id){form.set('id',p.id);form.set('idAtualizacao',p.id);form.set('modo','editar');}else form.set('modo','novo');form.set('titulo',p.titulo||'');form.set('texto',p.texto||'');form.set('link',p.link||'');if(p.imageBase64){form.set('imageBase64',p.imageBase64);form.set('fileName',p.fileName||'');form.set('mimeType',p.mimeType||'');}
    r=await fetch(AUTH_API+'?action=adminSalvarImagemInicio&_t='+Date.now(),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:form.toString()});d=await r.json();
  }else if(op.tipo==='community-create'){
    if(!p.postIdServidor){
      let fd=new FormData();fd.append('action','comunidadeSalvarPerfil');fd.append('token',p.token||'');fd.append('cabecalho',p.cabecalho||'');fd.append('descricao',p.descricao||'');fd.append('whatsapp',p.whatsapp||'');fd.append('youtube',p.youtube||'');
      r=await fetch(comunidadeApiUrl(),{method:'POST',body:fd});d=await r.json();if(!d||d.ok!==true){const er=new Error(String((d&&d.mensagem)||'Erro ao salvar publicação.'));er.permanente=true;throw er;}
      p.postIdServidor=String(d.postId||(d.dados&&d.dados.postId)||(d.perfil&&d.perfil.id)||'');
      const local=comunidadePublicaCache.find(function(x){return String(x&&x.id||'')===String(p.tempId||'');})||comunidadeMeusPostsCache.find(function(x){return String(x&&x.id||'')===String(p.tempId||'');});if(local)local._postIdServidor=p.postIdServidor;
      await maptorkSyncSalvarFila();
    }
    const imgs=Array.isArray(p.imagens)?p.imagens:[];
    for(let i=Number(p.imagensEnviadas||0);i<imgs.length;i++){const foto=imgs[i];const fd=new FormData();fd.append('action','comunidadeAdicionarFoto');fd.append('token',p.token||'');fd.append('postId',p.postIdServidor||'');fd.append('fileName',foto.fileName||'foto.jpg');fd.append('mimeType',foto.mimeType||'image/jpeg');fd.append('imageBase64',foto.base64||'');r=await fetch(comunidadeApiUrl(),{method:'POST',body:fd});d=await r.json();if(!d||d.ok!==true)throw new Error(String((d&&d.mensagem)||'Erro ao enviar imagem.'));p.imagensEnviadas=i+1;await maptorkSyncSalvarFila();}
    d={ok:true,postId:p.postIdServidor};
  }else if(op.tipo==='community-edit'){
    if(!p.editConfirmado){const fd=new FormData();fd.append('action','comunidadeEditarPost');fd.append('token',p.token||'');fd.append('id',p.id||'');fd.append('cabecalho',p.cabecalho||'');fd.append('descricao',p.descricao||'');fd.append('whatsapp',p.whatsapp||'');fd.append('youtube',p.youtube||'');r=await fetch(comunidadeApiUrlEdicao(),{method:'POST',body:fd});d=await r.json();if(!d||d.ok!==true){const er=new Error(String((d&&d.mensagem)||'Erro ao editar publicação.'));er.permanente=true;throw er;}p.editConfirmado=true;await maptorkSyncSalvarFila();}
    const imgs=Array.isArray(p.imagens)?p.imagens:[];for(let i=Number(p.imagensEnviadas||0);i<imgs.length;i++){const foto=imgs[i];const fd=new FormData();fd.append('action','comunidadeAdicionarFoto');fd.append('token',p.token||'');fd.append('postId',p.id||'');fd.append('fileName',foto.fileName||'foto.jpg');fd.append('mimeType',foto.mimeType||'image/jpeg');fd.append('imageBase64',foto.base64||'');r=await fetch(comunidadeApiUrl(),{method:'POST',body:fd});d=await r.json();if(!d||d.ok!==true)throw new Error(String((d&&d.mensagem)||'Erro ao enviar imagem.'));p.imagensEnviadas=i+1;await maptorkSyncSalvarFila();}
    d={ok:true,postId:p.id};
  }else{return {ok:true};}
  if(!d||d.ok!==true){const err=new Error(String((d&&d.mensagem)||'Não foi possível sincronizar.'));err.permanente=true;throw err;}
  return d;
}

function maptorkSyncConfirmar(op,d){
  const p=op.payload||{};
  if(op.tipo==='profile-name'){
    maptorkAplicarNomeLocal(String((d&&d.nome)||p.nome||''));
    try{carregarComunidadePublica(true).catch(function(){});}catch(_){}
  }else if(op.tipo==='profile-photo'){
    maptorkPerfilFotoOtimistaAtiva=false;
    if(d&&d.fotoPerfil)maptorkAplicarFotoPerfilLocal(d.fotoPerfil);
    comunidadeSalvarCacheUsuario();comunidadeSalvarCachePublico();comunidadeLimparCacheImagens();
    comunidadeMensagem('comunidadeFotoPerfilMensagem','Foto de perfil salva.',true);
    setTimeout(function(){carregarMeuPerfilComunidade(true).catch(function(){});carregarComunidadePublica(true).catch(function(){});},700);
  }else if(op.tipo==='tool-save'){
    maptorkConfirmarFerramenta(p,d);mostrarMensagemFerramentaAdmin('Ferramenta sincronizada.',true);
  }else if(op.tipo==='store-save'){
    maptorkConfirmarLoja(p,d);mostrarMensagemLojaAdmin('Produto sincronizado.',true);
  }else if(op.tipo==='update-save'){
    maptorkConfirmarAtualizacao(p,d);mostrarMensagemImagemAdmin('Atualização sincronizada.',true);
  }else if(op.tipo==='community-create'){
    const local=comunidadePublicaCache.find(function(x){return String(x&&x.id||'')===String(p.tempId||'');})||comunidadeMeusPostsCache.find(function(x){return String(x&&x.id||'')===String(p.tempId||'');});
    if(local){local._postIdServidor=String((d&&d.postId)||p.postIdServidor||'');comunidadeSincronizarInteracoesPendentes(local,local._postIdServidor).catch(function(){});}
    comunidadeMensagem('comunidadeEditorMensagem','Publicado com sucesso.',true);comunidadeMeuPerfilCarregado=false;comunidadeLimparCacheImagens();
    setTimeout(function(){Promise.all([carregarMeuPerfilComunidade(true),carregarMeusPostsComunidade(true),carregarComunidadePublica(true)]).catch(function(){});},350);
  }else if(op.tipo==='community-edit'){
    comunidadeMensagem('comunidadeEditorMensagem','Publicação sincronizada.',true);comunidadeMeuPerfilCarregado=false;comunidadeLimparCacheImagens();
    setTimeout(function(){Promise.all([carregarMeuPerfilComunidade(true),carregarMeusPostsComunidade(true),carregarComunidadePublica(true)]).catch(function(){});},350);
  }
}

function maptorkSyncFalhaPermanente(op,e){
  const msg=String((e&&e.message)||'Não foi possível sincronizar.');
  const p=op.payload||{};
  if(op.tipo==='profile-photo') maptorkPerfilFotoOtimistaAtiva=false;
  if(op.tipo==='tool-save'){ferramentasDinamicasCache.forEach(function(x){if(String(x&&x.id||'')===String(p.localId||''))x._pendenteSync=false;});ferramentasAdminCache.forEach(function(x){if(String(x&&x.id||'')===String(p.localId||''))x._pendenteSync=false;});}
  if(op.tipo==='store-save'){lojaProdutosCache.forEach(function(x){if(String(x&&x.id||'')===String(p.localId||''))x._pendenteSync=false;});lojaAdminCache.forEach(function(x){if(String(x&&x.id||'')===String(p.localId||''))x._pendenteSync=false;});}
  if(op.tipo==='update-save'){maptorkAtualizacoesInicio.forEach(function(x){if(String(x&&x.id||'')===String(p.localId||''))x._pendenteSync=false;});}
  if(op.tipo==='profile-name')comunidadeMensagem('contaNomeMensagem',msg+' O nome continua aplicado neste aparelho; salve novamente para tentar.',false);
  else if(op.tipo==='profile-photo')comunidadeMensagem('comunidadeFotoPerfilMensagem',msg+' A foto continua aplicada neste aparelho; salve novamente para tentar.',false);
  else if(op.tipo==='tool-save')mostrarMensagemFerramentaAdmin(msg+' A alteração continua visível localmente.',false);
  else if(op.tipo==='store-save')mostrarMensagemLojaAdmin(msg+' A alteração continua visível localmente.',false);
  else if(op.tipo==='update-save')mostrarMensagemImagemAdmin(msg+' A alteração continua visível localmente.',false);
  else if(op.tipo==='community-create'||op.tipo==='community-edit')comunidadeMensagem('comunidadeEditorMensagem',msg+' A publicação continua visível neste aparelho; tente salvar novamente se necessário.',false);
}

async function maptorkSyncProcessar(){
  if(maptorkSyncProcessando)return;
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return;
  if(!maptorkSyncFilaCarregada){maptorkSyncFila=await maptorkSyncAbrirFila();maptorkSyncFilaCarregada=true;}
  if(!maptorkSyncFila.length)return;
  maptorkSyncProcessando=true;
  try{
    for(let i=0;i<maptorkSyncFila.length;){
      const op=maptorkSyncFila[i];
      try{const d=await maptorkSyncEnviar(op);maptorkSyncConfirmar(op,d);maptorkSyncFila.splice(i,1);await maptorkSyncSalvarFila();}
      catch(e){op.tentativas=Number(op.tentativas||0)+1;op.ultimaTentativa=Date.now();if(e&&e.permanente===true){maptorkSyncFalhaPermanente(op,e);maptorkSyncFila.splice(i,1);await maptorkSyncSalvarFila();continue;}await maptorkSyncSalvarFila();break;}
    }
  }finally{maptorkSyncProcessando=false;}
  if(maptorkSyncFila.length){clearTimeout(maptorkSyncTimer);maptorkSyncTimer=setTimeout(maptorkSyncProcessar,12000);}
}


function maptorkRestaurarPostComunidadePendente(p,editar){
  if(!p)return;
  const id=editar?String(p.id||''):String(p.tempId||'');if(!id)return;
  const imagens=Array.isArray(p.imagens)?p.imagens:[];
  const fotosNovas=imagens.map(function(f){return {url:f.dataUrl||'',id:'',_local:true};}).filter(function(f){return !!f.url;});
  if(editar){
    const atual=comunidadeMeusPostsCache.find(function(x){return String(x&&x.id||'')===id;})||comunidadePublicaCache.find(function(x){return String(x&&x.id||'')===id;})||{};
    const existentes=Array.isArray(p.fotosExistentes)?p.fotosExistentes:(Array.isArray(atual.fotos)?atual.fotos:[]);
    const item=Object.assign({},atual,{id:id,cabecalho:p.cabecalho,descricao:p.descricao,whatsapp:p.whatsapp,youtubeId:comunidadeExtrairYoutubeId(p.youtube||''),email:p.email||atual.email,nome:p.nome||atual.nome,fotos:existentes.concat(fotosNovas),_otimista:true,_editandoSync:true,_postIdServidor:id,_fotosEsperadas:existentes.length+fotosNovas.length});
    comunidadeMeusPostsCache=comunidadeMeusPostsCache.map(function(x){return String(x&&x.id||'')===id?item:x;});comunidadePublicaCache=comunidadePublicaCache.map(function(x){return String(x&&x.id||'')===id?item:x;});
  }else{
    const ja=comunidadePublicaCache.some(function(x){return String(x&&x.id||'')===id;});if(!ja){const item={id:id,usuarioId:p.usuarioId||'',email:p.email||'',nome:p.nome||'Membro MAPTORK',cabecalho:p.cabecalho||'',descricao:p.descricao||'',whatsapp:p.whatsapp||'',youtubeId:comunidadeExtrairYoutubeId(p.youtube||''),fotoPerfil:p.fotoPerfil||null,fotos:fotosNovas,curtidas:0,curtidoPorMim:false,comentarios:[],comentariosTotal:0,status:'aprovado',_otimista:true,_postIdServidor:p.postIdServidor||'',_fotosEsperadas:fotosNovas.length};comunidadePublicaCache.unshift(item);comunidadeMeusPostsCache.unshift(item);}
  }
  renderizarComunidadePublica(comunidadePublicaCache);renderizarNovosPostsInicio(comunidadePublicaCache);renderizarMeusPostsComunidade(comunidadeMeusPostsCache);
}

function maptorkSyncRestaurarVisuais(fila){
  (Array.isArray(fila)?fila:[]).forEach(function(op){const p=op&&op.payload||{};
    if(op.tipo==='profile-name')maptorkAplicarNomeLocal(p.nome);
    else if(op.tipo==='profile-photo'&&p.dataUrl){maptorkPerfilFotoOtimistaAtiva=true;maptorkAplicarFotoPerfilLocal({url:p.dataUrl,_local:true});}
    else if(op.tipo==='tool-save')maptorkAplicarFerramentaLocal(p);
    else if(op.tipo==='store-save')maptorkAplicarLojaLocal(p);
    else if(op.tipo==='update-save')maptorkAplicarAtualizacaoLocal(p);
    else if(op.tipo==='community-create')maptorkRestaurarPostComunidadePendente(p,false);
    else if(op.tipo==='community-edit')maptorkRestaurarPostComunidadePendente(p,true);
  });
}

async function maptorkSyncInicializar(){
  if(!maptorkSyncFilaCarregada){maptorkSyncFila=await maptorkSyncAbrirFila();maptorkSyncFilaCarregada=true;}
  maptorkSyncRestaurarVisuais(maptorkSyncFila);
  setTimeout(maptorkSyncProcessar,300);
}
window.addEventListener('online',function(){setTimeout(maptorkSyncProcessar,100);});
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(maptorkSyncProcessar,150);});
setTimeout(function(){maptorkSyncInicializar().catch(function(){});},0);


// Mantém imagens da Comunidade/Perfil no Cache Storage do navegador/WebView.
// O service worker usa cache-first para imagens, inclusive as vindas do Google Drive.
(function registrarCacheImagensMaptork(){
  if (!('serviceWorker' in navigator)) return;
  if (!/^https?:$/i.test(location.protocol)) return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('./maptork-sw.js').catch(function(erro){
      console.warn('Cache de imagens MAPTORK indisponível:', erro);
    });
  }, { once: true });
})();

// Mostra imediatamente os últimos posts públicos salvos no aparelho, sem tela de loading.
try { comunidadeHidratarCachePublico(); } catch (e) {}

// Mostra imediatamente o último perfil/posts do próprio usuário salvos no aparelho.
try { comunidadeHidratarCacheUsuario(); } catch (e) {}

// Atualiza silenciosamente em segundo plano. Se os dados forem iguais,
// renderizarMeusPostsComunidade/renderizarFotoPerfilComunidade preservam o DOM
// e as imagens não são recriadas.
setTimeout(function(){
  try {
    if (String(localStorage.getItem('token') || '').trim()) {
      carregarMeuPerfilComunidade(true);
      carregarMeusPostsComunidade(true);
    }
  } catch(e) {}
}, 1600);

// Pré-carrega a Comunidade sem bloquear a abertura do site.
setTimeout(function(){ try { carregarComunidadePublica(false); } catch(e) {} }, 250);


// Carrossel automático da aba Manuais usando imagens locais do projeto.
(function iniciarSliderAbaManuais(){
  function preparar(){
    var root = document.querySelector('.manual-slider');
    if (!root || root.dataset.sliderReady === '1') return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.manual-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.manual-slider-dots span'));
    if (!slides.length) return;
    root.dataset.sliderReady = '1';
    var indice = 0;
    var timer = null;

    function mostrar(novoIndice){
      indice = ((novoIndice % slides.length) + slides.length) % slides.length;
      slides.forEach(function(slide, i){ slide.classList.toggle('active', i === indice); });
      dots.forEach(function(dot, i){ dot.classList.toggle('active', i === indice); });
    }

    function iniciar(){
      parar();
      timer = setInterval(function(){ mostrar(indice + 1); }, 5200);
    }

    function parar(){
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function(dot, i){
      dot.addEventListener('click', function(){ mostrar(i); iniciar(); });
    });

    root.addEventListener('mouseenter', parar);
    root.addEventListener('mouseleave', iniciar);
    root.addEventListener('touchstart', parar, {passive:true});
    root.addEventListener('touchend', iniciar, {passive:true});

    document.addEventListener('visibilitychange', function(){
      if (document.hidden) parar(); else iniciar();
    });

    mostrar(0);
    iniciar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preparar, { once:true });
  else preparar();
})();
