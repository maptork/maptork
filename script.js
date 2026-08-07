const models={
"Honda":["CB 300F 2023","CG 160 Titan","CB 500F","XRE 300"],
"Yamaha":["Fazer FZ25","MT-03","MT-07","Lander 250"],
"Suzuki":["GS 500","V-Strom 650","Hayabusa"],
"BMW":["G 310 R","F 750 GS","R 1250 GS"],
"KTM":["390 Duke","790 Duke","1290 Super Duke"],
"Ducati":["Monster","Panigale V2","Multistrada"],
"Triumph":["Tiger 900","Street Triple","Bonneville"],
"Harley-Davidson":["Iron 883","Sportster S","Fat Bob"]
};
function showPage(id,btn){
document.querySelectorAll('.page').forEach(p=>p.style.display='none');
document.getElementById(id).style.display='block';
document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
if(btn)btn.classList.add('active');
window.scrollTo({top:0,behavior:'smooth'});
}
function openPage(id,index){showPage(id,document.querySelectorAll('.nav button')[index]);}
function filterBrands(){
const q=document.getElementById('search').value.toLowerCase().trim();
document.querySelectorAll('#brands .card').forEach(c=>c.style.display=(!q||c.dataset.key.includes(q))?'block':'none');
}
function loadModels(){
const marca=document.getElementById('marca').value;
const select=document.getElementById('modelo');
select.innerHTML='';
if(!marca){select.disabled=true;select.innerHTML='<option value="">Primeiro selecione a marca...</option>';return;}
select.disabled=false;
select.innerHTML='<option value="">Selecione um modelo...</option>';
models[marca].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;select.appendChild(o);});
document.getElementById('result').style.display='none';
}
function startDiagnostic(){
const marca=document.getElementById('marca').value;
const modelo=document.getElementById('modelo').value;
const result=document.getElementById('result');
if(!marca||!modelo){result.style.display='block';result.textContent='Selecione a marca e o modelo antes de iniciar o diagnóstico.';return;}
result.style.display='block';
result.innerHTML='<b>Diagnóstico iniciado!</b><br><span style="color:#aaa">Consulta selecionada: '+marca+' '+modelo+'.</span>';
}

const DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbyl-iiZwaurAe2P1lyyNKeN6-C4yhITvAYrkMv7pGDNctmIcyvW0OI9keTOzNss5iim/exec";

async function searchDrive() {
  
  const input = document.getElementById("driveSearch");
  const status = document.getElementById("driveStatus");
  const results = document.getElementById("driveResults");
  
  const q = input.value.trim();
  
  if (!q) {
    status.style.display = "block";
    status.innerHTML = "Digite a marca ou modelo.";
    results.innerHTML = "";
    return;
  }
  
  
  
  
  
  
  status.style.display = "block";
status.innerHTML = " Pesquisando no Google Drive...";

results.innerHTML = `
<div class="pdf-card" style="text-align:center;padding:30px">
    <div class="loader"></div>
    <p>Pesquisando arquivos...</p>
</div>
`;
  
  
  
  
  
  try {
    
    const response = await fetch(
      DRIVE_API_URL + "?q=" + encodeURIComponent(q)
    );
    
    const data = await response.json();
    
    if (!data.ok || !data.files.length) {
  status.innerHTML = "Nenhum PDF encontrado.";
  results.innerHTML = "";
  return;
}
    
    status.innerHTML = data.files.length + " arquivo(s) encontrado(s).";
    
    results.innerHTML = "";
    
    data.files.forEach(file => {
      
      results.innerHTML += `
            <div class="card">
                <h3>${file.name}</h3>

                <button class="cta"
                    onclick="openPdf('${file.url}')">
                    ABRIR PDF
                </button>
            </div>
            `;
      
    });
    
  } catch (e) {
    
    status.innerHTML = "Erro ao pesquisar.";
    
  }
  
}

function openPdf(url) {
  window.open(url, "_blank");
}



// ===================================
// MINHA CONTA - ALTERAR SENHA
// ===================================

async function alterarSenhaConta() {
  
  const token = localStorage.getItem("token");
  
  const senhaAtual =
    document.getElementById("senhaAtual").value.trim();
  
  const novaSenha =
    document.getElementById("novaSenha").value.trim();
  
  const confirmarSenha =
    document.getElementById("confirmarNovaSenha").value.trim();
  
  const mensagem =
    document.getElementById("contaMensagem");
  
  const botao =
    document.getElementById("btnAlterarSenha");
  
  
  // ===================================
  // FUNÇÃO PARA MOSTRAR MENSAGEM
  // ===================================
  
  function mostrarContaMensagem(texto, sucesso) {
    
    mensagem.style.display = "block";
    
    mensagem.className = sucesso ?
      "diagnostic-result success-box" :
      "diagnostic-result error-box";
    
    mensagem.textContent = texto;
  }
  
  
  // ===================================
  // VERIFICAR LOGIN
  // ===================================
  
  if (!token) {
    
    window.location.href = "login.html";
    
    return;
  }
  
  
  // ===================================
  // CAMPOS OBRIGATÓRIOS
  // ===================================
  
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
  
  
  // ===================================
  // TAMANHO DA NOVA SENHA
  // ===================================
  
  if (novaSenha.length < 8) {
    
    mostrarContaMensagem(
      "A nova senha deve possuir pelo menos 8 caracteres.",
      false
    );
    
    return;
  }
  
  
  // ===================================
  // CONFIRMAR NOVA SENHA
  // ===================================
  
  if (novaSenha !== confirmarSenha) {
    
    mostrarContaMensagem(
      "As novas senhas não coincidem.",
      false
    );
    
    return;
  }
  
  
  // ===================================
  // DESATIVAR BOTÃO
  // ===================================
  
  botao.disabled = true;
  
  botao.textContent = "Aguarde...";
  
  
  try {
    
    const form = new FormData();
    
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
    
    
    // AUTH_API já existe no index.html
    const resposta = await fetch(
      AUTH_API,
      {
        method: "POST",
        body: form
      }
    );
    
    
    const dados =
      await resposta.json();
    
    
    // ===================================
    // ERRO
    // ===================================
    
    if (!dados.ok) {
      
      mostrarContaMensagem(
        dados.mensagem ||
        "Não foi possível alterar a senha.",
        false
      );
      
      return;
    }
    
    
    // ===================================
    // SUCESSO
    // ===================================
    
    mostrarContaMensagem(
      dados.mensagem ||
      "Senha alterada com sucesso.",
      true
    );
    
    
    // Apaga sessão do navegador
    localStorage.removeItem("token");
    
    localStorage.removeItem("nome");
    
    
    // Volta para login
    setTimeout(() => {
      
      window.location.href =
        "login.html";
      
    }, 1500);
    
    
  } catch (erro) {
    
    console.error(erro);
    
    mostrarContaMensagem(
      "Erro ao conectar ao servidor.",
      false
    );
    
    
  } finally {
    
    botao.disabled = false;
    
    botao.textContent =
      "ALTERAR SENHA";
  }
}

// ===================================
// PAINEL ADMINISTRATIVO
// ===================================

let adminEmailSelecionado = "";

async function abrirAdmin(botao) {

  if (!window.usuarioAtual || !window.usuarioAtual.admin) {
    return;
  }

  showPage("admin", botao);
  cancelarSenhaAdmin();
  await carregarUsuariosAdmin();
}


function mostrarAdminMensagem(texto, sucesso) {

  const msg = document.getElementById("adminMensagem");

  if (!msg) return;

  msg.style.display = "block";

  msg.className = sucesso
    ? "diagnostic-result success-box"
    : "diagnostic-result error-box";

  msg.textContent = texto;
}


function mostrarAdminSenhaMensagem(texto, sucesso) {

  const msg = document.getElementById("adminSenhaMensagem");

  if (!msg) return;

  msg.style.display = "block";

  msg.className = sucesso
    ? "diagnostic-result success-box"
    : "diagnostic-result error-box";

  msg.textContent = texto;
}


async function carregarUsuariosAdmin() {

  const token = localStorage.getItem("token");
  const area = document.getElementById("adminUsuarios");

  if (!token || !area) return;

  area.innerHTML = `
    <div class="card" style="text-align:center">
      <div class="loader"></div>
      <p>Carregando usuários...</p>
    </div>
  `;

  try {

    const resposta = await fetch(
      AUTH_API +
      "?action=adminListarUsuarios&token=" +
      encodeURIComponent(token),
      { cache: "no-store" }
    );

    const dados = await resposta.json();

    if (!dados.ok) {

      area.innerHTML = "";

      mostrarAdminMensagem(
        dados.mensagem || "Acesso administrativo negado.",
        false
      );

      return;
    }

    mostrarAdminMensagem(
      dados.usuarios.length + " usuário(s) encontrado(s).",
      true
    );

    area.innerHTML = "";

    dados.usuarios.forEach(usuario => {

      const card = document.createElement("div");

      card.className = "card admin-user-card";

      const status =
        usuario.status === "bloqueado"
          ? "Bloqueado"
          : "Ativo";

      const novoStatus =
        usuario.status === "bloqueado"
          ? "ativo"
          : "bloqueado";

      const textoStatus =
        usuario.status === "bloqueado"
          ? "ATIVAR"
          : "BLOQUEAR";

      card.innerHTML = `
        <h3>${escapeHtml(usuario.nome || "")}</h3>

        <p>
          <strong>E-mail:</strong>
          ${escapeHtml(usuario.email || "")}
        </p>

        <p>
          <strong>Tipo:</strong>
          ${escapeHtml(usuario.tipo || "cliente")}
        </p>

        <p>
          <strong>Status:</strong>
          ${status}
        </p>

        <div class="admin-actions">

          <button
            class="cta"
            type="button"
            onclick="alterarStatusUsuarioAdmin(
              '${encodeURIComponent(usuario.email)}',
              '${novoStatus}'
            )"
          >
            ${textoStatus}
          </button>

          <button
            class="cta admin-secondary"
            type="button"
            onclick="abrirRedefinirSenhaAdmin(
              '${encodeURIComponent(usuario.email)}'
            )"
          >
            REDEFINIR SENHA
          </button>

        </div>
      `;

      area.appendChild(card);
    });

  } catch (erro) {

    console.error(erro);

    area.innerHTML = "";

    mostrarAdminMensagem(
      "Erro ao conectar ao servidor.",
      false
    );
  }
}


async function alterarStatusUsuarioAdmin(
  emailCodificado,
  novoStatus
) {

  const token = localStorage.getItem("token");
  const email = decodeURIComponent(emailCodificado);

  const form = new FormData();

  form.append("action", "adminAlterarStatus");
  form.append("token", token);
  form.append("email", email);
  form.append("status", novoStatus);

  mostrarAdminMensagem(
    novoStatus === "bloqueado"
      ? "Bloqueando usuário..."
      : "Ativando usuário...",
    true
  );

  try {

    const resposta = await fetch(
      AUTH_API,
      {
        method: "POST",
        body: form
      }
    );

    const dados = await resposta.json();

    mostrarAdminMensagem(
      dados.mensagem,
      dados.ok
    );

    if (dados.ok) {
      await carregarUsuariosAdmin();
    }

  } catch (erro) {

    console.error(erro);

    mostrarAdminMensagem(
      "Erro ao conectar ao servidor.",
      false
    );
  }
}


function abrirRedefinirSenhaAdmin(
  emailCodificado
) {

  adminEmailSelecionado =
    decodeURIComponent(emailCodificado);

  const box =
    document.getElementById("adminSenhaBox");

  const emailEl =
    document.getElementById("adminSenhaEmail");

  const senha =
    document.getElementById("adminNovaSenha");

  const confirmar =
    document.getElementById("adminConfirmarSenha");

  const msg =
    document.getElementById("adminSenhaMensagem");

  if (emailEl) {
    emailEl.textContent =
      adminEmailSelecionado;
  }

  if (senha) senha.value = "";
  if (confirmar) confirmar.value = "";

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


function cancelarSenhaAdmin() {

  adminEmailSelecionado = "";

  const box =
    document.getElementById("adminSenhaBox");

  const senha =
    document.getElementById("adminNovaSenha");

  const confirmar =
    document.getElementById("adminConfirmarSenha");

  const msg =
    document.getElementById("adminSenhaMensagem");

  if (senha) senha.value = "";
  if (confirmar) confirmar.value = "";

  if (msg) {
    msg.style.display = "none";
    msg.textContent = "";
  }

  if (box) {
    box.style.display = "none";
  }
}


async function salvarNovaSenhaAdmin() {

  const token =
    localStorage.getItem("token");

  const novaSenha =
    document
      .getElementById("adminNovaSenha")
      .value
      .trim();

  const confirmarSenha =
    document
      .getElementById("adminConfirmarSenha")
      .value
      .trim();

  const botao =
    document.getElementById(
      "adminSalvarSenhaBtn"
    );


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


  botao.disabled = true;

  botao.textContent =
    "SALVANDO...";


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

      document
        .getElementById("adminNovaSenha")
        .value = "";

      document
        .getElementById("adminConfirmarSenha")
        .value = "";

      await carregarUsuariosAdmin();
    }


  } catch (erro) {

    console.error(erro);

    mostrarAdminSenhaMensagem(
      "Erro ao conectar ao servidor.",
      false
    );


  } finally {

    botao.disabled = false;

    botao.textContent =
      "SALVAR E ENVIAR POR E-MAIL";
  }
}


function escapeHtml(texto) {

  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}



function mostrarPagamentoPendente() {
  const msg = document.getElementById("pagamentoMensagem");

  if (!msg) return;

  msg.style.display = "block";
  msg.className = "diagnostic-result";
  msg.textContent = "Área de pagamento ainda não configurada.";
}
