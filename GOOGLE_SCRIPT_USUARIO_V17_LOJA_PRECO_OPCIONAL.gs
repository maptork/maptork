// MAPTORK - usuario.gs atualizado: nome completo, conta e comunidade
// Substitua todo o conteúdo do arquivo usuario.gs por este código.
// Contas antigas com uma coluna de nascimento continuam compatíveis.

const PLANILHA_ID = "1DXgcXzrX-KyiL3nfj__jXXwnAjFvkmxEbOmOsjvgVfo";
const ABA = "Usuarios";
const EMAIL_ADMIN = "maptork@gmail.com";

function getAba(){
  const sh=SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(ABA);
  if(!sh)throw new Error('A aba "Usuarios" não foi encontrada.');
  return sh;
}
function resposta(ok,mensagem,extra){return ContentService.createTextOutput(JSON.stringify(Object.assign({ok:ok,mensagem:mensagem},extra||{}))).setMimeType(ContentService.MimeType.JSON);}
function gerarToken(){return Utilities.getUuid()+Utilities.getUuid();}
function hashSenha(senha){const d=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(senha||''),Utilities.Charset.UTF_8);return 'sha256$'+d.map(function(b){return(b<0?b+256:b).toString(16).padStart(2,'0');}).join('');}
function senhaCorreta(digitada,salva){salva=String(salva||'');return salva.indexOf('sha256$')===0?hashSenha(digitada)===salva:String(digitada||'')===salva;}
function getUsuarios(){const sh=getAba(),n=sh.getLastRow();return n<2?[]:sh.getRange(2,1,n-1,8).getValues();}
function usuarioEhAdmin(email,tipo){return String(email||'').trim().toLowerCase()===EMAIL_ADMIN||String(tipo||'').trim().toLowerCase()==='admin';}
function limparSessao(sh,linha){sh.getRange(linha,5,1,2).clearContent();}
function nomeCompletoValido(nome){return String(nome||'').trim().split(/\s+/).filter(Boolean).length>=2;}
function doGet(e){
  try{
    e=e||{};e.parameter=e.parameter||{};const action=String(e.parameter.action||'').trim(),acao=String(e.parameter.acao||'').trim();
    if(action.indexOf('comunidade')===0||action.indexOf('adminComunidade')===0)return comunidadeDoGet(e);
    if(action==='listarFotosComunidade')return listarFotosComunidade(e);
    if(action==='minhasFotosComunidade')return minhasFotosComunidade(e);
    if(action==='adminListarFotosComunidade')return adminListarFotosComunidade(e);
    if(action==='obterImagemInicio')return obterImagemInicioPublica(e);
    if(action==='obterFerramentasPublicas')return obterFerramentasPublicas(e);
    if(action==='obterImagemFerramenta')return obterImagemFerramenta(e);
    if(action==='adminListarFerramentas')return adminListarFerramentas(e);
    if(action==='obterLojaPublica')return obterLojaPublica(e);
    if(action==='obterImagemLoja')return obterImagemLoja(e);
    if(action==='adminListarLoja')return adminListarLoja(e);
    if(acao==='teste')return respostaJSON({sucesso:true,mensagem:'API MAPTORK funcionando'});
    if(acao==='obterPrecos')return respostaJSON({sucesso:true,precos:obterPrecosPlanos()});
    if(acao==='verificarPlano')return verificarPlano(e.parameter.email||'');
    if(acao==='criarCheckout')return criarCheckout(e.parameter.email||'',e.parameter.plano||'',e.parameter.retorno||'');
    if(acao==='confirmarPagamento')return confirmarPagamento(e.parameter.order_nsu||'',e.parameter.transaction_nsu||'',e.parameter.slug||'');
    if(Object.prototype.hasOwnProperty.call(e.parameter,'q'))return pesquisarManuais(e);
    if(action==='verificarToken')return verificarToken(e);
    if(action==='recuperar')return recuperarSenha(e);
    if(action==='adminListarUsuarios')return adminListarUsuarios(e);
    return fazerLogin(e);
  }catch(err){console.error('Erro doGet:',err);return resposta(false,'Erro interno do servidor: '+err.message);}
}

function doPost(e){
  try{
    e=e||{};e.parameter=e.parameter||{};
    if(e.postData&&e.postData.contents){const c=String(e.postData.contents||'').trim();if(c.startsWith('{'))try{const d=JSON.parse(c);if(d.order_nsu||d.transaction_nsu||d.invoice_slug){const r=processarPagamentoAprovado(String(d.order_nsu||''),String(d.transaction_nsu||''),String(d.invoice_slug||''),Number(d.amount||d.paid_amount||0));return respostaJSON({success:r.sucesso===true,message:r.mensagem||''});}}catch(_webhook){}}
    const action=String(e.parameter.action||'cadastro').trim();
    // Compatibilidade MAPTORK V15: estas rotas ficam no usuario.gs para funcionar
    // mesmo quando o arquivo ComunidadeFotos publicado ainda é uma versão anterior.
    if(action==='comunidadeEditarPost')return comunidadeEditarPostCompat_(e);
    if(action==='comunidadeExcluirFoto')return comunidadeExcluirFotoCompat_(e);
    if(action.indexOf('comunidade')===0||action.indexOf('adminComunidade')===0)return comunidadeDoPost(e);
    if(action==='enviarFotoComunidade')return enviarFotoComunidade(e);
    if(action==='excluirMinhaFotoComunidade')return excluirMinhaFotoComunidade(e);
    if(action==='adminModerarFotoComunidade')return adminModerarFotoComunidade(e);
    if(action==='adminSalvarImagemInicio'||action==='adminUploadImagemInicioArquivo')return adminSalvarImagemInicio(e);
    if(action==='adminRestaurarImagemInicio')return adminRestaurarImagemInicio(e);
    if(action==='adminSalvarFerramenta')return adminSalvarFerramenta(e);
    if(action==='adminExcluirFerramenta')return adminExcluirFerramenta(e);
    if(action==='abrirFerramentaDinamica')return abrirFerramentaDinamica(e);
    if(action==='adminSalvarProdutoLoja')return adminSalvarProdutoLoja(e);
    if(action==='adminExcluirProdutoLoja')return adminExcluirProdutoLoja(e);
    if(action==='alterarSenha')return alterarSenha(e);
    if(action==='atualizarNome')return atualizarNome(e);
    if(action==='atualizarPerfil')return atualizarPerfil(e);
    if(action==='logout')return fazerLogout(e);
    if(action==='excluirMinhaConta')return excluirMinhaConta(e);
    if(action==='adminAlterarStatus')return adminAlterarStatus(e);
    if(action==='adminRedefinirSenha')return adminRedefinirSenha(e);
    if(action==='adminSalvarPrecos')return adminSalvarPrecos(e);
    if(action==='adminRestaurarPrecos')return adminRestaurarPrecos(e);
    return cadastrarUsuario(e);
  }catch(err){console.error('Erro doPost:',err);return resposta(false,'Erro interno do servidor: '+err.message);}
}

function cadastrarUsuario(e){
  const nome=String(e.parameter.nome||'').trim(),email=String(e.parameter.email||'').trim().toLowerCase(),senha=String(e.parameter.senha||'').trim();
  if(!nome||!email||!senha)return resposta(false,'Preencha todos os campos.');
  if(!nomeCompletoValido(nome))return resposta(false,'Informe seu nome completo.');
  if(senha.length<8)return resposta(false,'A senha deve possuir pelo menos 8 caracteres.');
  const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][1]||'').trim().toLowerCase()===email)return resposta(false,'E-mail já cadastrado.');
  sh.appendRow([nome,email,hashSenha(senha),new Date(),'','',email===EMAIL_ADMIN?'admin':'cliente','ativo']);
  return resposta(true,'Cadastro realizado com sucesso!');
}

// Rota exclusiva para o nome. Não exige nem altera a senha.
function atualizarNome(e){
  const token=String(e.parameter.token||'').trim(),nome=String(e.parameter.nome||'').trim();
  if(!token)return resposta(false,'Sessão inválida.');
  if(nome.length<2)return resposta(false,'Digite seu nome.');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const sh=getAba(),u=getUsuarios();
    for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){
      const exp=new Date(u[i][5]),status=String(u[i][7]||'ativo').trim().toLowerCase();
      if(isNaN(exp.getTime())||Date.now()>exp.getTime())return resposta(false,'Sessão expirada.');
      if(status==='bloqueado')return resposta(false,'Conta bloqueada.');
      const email=String(u[i][1]||'').trim().toLowerCase();
      sh.getRange(i+2,1).setValue(nome);SpreadsheetApp.flush();
      migrarComunidadeEmail_(email,email,nome);
      return resposta(true,'Nome atualizado com sucesso.',{nome:nome});
    }
    return resposta(false,'Sessão inválida.');
  }catch(err){console.error('atualizarNome:',err);return resposta(false,'Não foi possível atualizar o nome.');}
  finally{try{lock.releaseLock();}catch(_){}}
}

function atualizarPerfil(e){
  const token=String(e.parameter.token||'').trim(),nome=String(e.parameter.nome||'').trim(),senhaAtual=String(e.parameter.senhaAtual||''),novaSenha=String(e.parameter.novaSenha||''),confirmar=String(e.parameter.confirmarSenha||'');
  const alterarNome=nome!=='';
  const alterarSenha=senhaAtual!==''||novaSenha!==''||confirmar!=='';
  if(!token)return resposta(false,'Sessão inválida.');
  if(!alterarNome&&!alterarSenha)return resposta(false,'Informe o nome ou os dados da nova senha.');
  if(alterarNome&&nome.length<2)return resposta(false,'Digite seu nome.');
  if(alterarSenha&&(!senhaAtual||!novaSenha||!confirmar))return resposta(false,'Preencha todos os campos de senha.');
  if(alterarSenha&&(novaSenha.length<8||novaSenha!==confirmar))return resposta(false,novaSenha.length<8?'A nova senha deve possuir pelo menos 8 caracteres.':'As novas senhas não coincidem.');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const sh=getAba(),u=getUsuarios();let indice=-1;
    for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){indice=i;break;}
    if(indice<0)return resposta(false,'Sessão inválida.');
    const linha=indice+2,exp=new Date(u[indice][5]),status=String(u[indice][7]||'ativo').toLowerCase();
    if(isNaN(exp.getTime())||Date.now()>exp.getTime())return resposta(false,'Sessão expirada.');
    if(status==='bloqueado')return resposta(false,'Conta bloqueada.');
    if(alterarSenha&&!senhaCorreta(senhaAtual,u[indice][2]))return resposta(false,'Senha atual incorreta.');
    const email=String(u[indice][1]||'').trim().toLowerCase();
    if(alterarNome)sh.getRange(linha,1).setValue(nome);
    if(alterarSenha)sh.getRange(linha,3).setValue(hashSenha(novaSenha));
    SpreadsheetApp.flush();
    if(alterarNome)migrarComunidadeEmail_(email,email,nome);
    return resposta(true,alterarNome&&alterarSenha?'Nome e senha atualizados.':alterarNome?'Nome atualizado com sucesso.':'Senha alterada com sucesso.',{nome:alterarNome?nome:String(u[indice][0]||'')});
  }catch(err){console.error('atualizarPerfil:',err);return resposta(false,'Não foi possível atualizar seus dados.');}finally{try{lock.releaseLock();}catch(_){}}
}

function migrarAssinaturaEmail_(emailAnterior,novoEmail){
  const ss=SpreadsheetApp.openById(CONFIG_ASSINATURAS.SPREADSHEET_ID),sh=ss.getSheetByName(CONFIG_ASSINATURAS.SHEET_NAME);if(!sh||sh.getLastRow()<2)return;
  const valores=sh.getRange(2,1,sh.getLastRow()-1,1).getValues();for(let i=0;i<valores.length;i++)if(String(valores[i][0]||'').trim().toLowerCase()===emailAnterior)sh.getRange(i+2,1).setValue(novoEmail);
}

function migrarComunidadeEmail_(emailAnterior,novoEmail,novoNome){
  try{
    const pastas=DriveApp.getFoldersByName('MAPTORK - Comunidade');if(!pastas.hasNext())return;const raiz=pastas.next(),arquivos=raiz.getFilesByName('comunidade_dados.json');if(!arquivos.hasNext())return;const arquivo=arquivos.next();
    const perfis=JSON.parse(String(arquivo.getBlob().getDataAsString('UTF-8')||'[]'));let mudou=false,pastaIds={};
    const usuarioId=comunidadeIdUsuarioPerfil_(emailAnterior);
    perfis.forEach(function(p){
      if(String(p.email||'').trim().toLowerCase()===emailAnterior){p.email=novoEmail;p.nome=novoNome||p.nome;p.atualizadoPerfil=Date.now();if(p.pastaId)pastaIds[String(p.pastaId)]=true;mudou=true;}
      (p.comentarios||[]).forEach(function(c){if(String(c.usuarioId||'')===usuarioId){c.nome=novoNome||c.nome;mudou=true;}});
    });
    if(mudou){arquivo.setContent(JSON.stringify(perfis));Object.keys(pastaIds).forEach(function(id){try{DriveApp.getFolderById(id).setName(novoEmail);}catch(_){}});}
  }catch(err){console.warn('Não foi possível migrar a Comunidade:',err);}
}

function comunidadeIdUsuarioPerfil_(email){const d=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(email||'').toLowerCase(),Utilities.Charset.UTF_8);return d.map(function(b){return('0'+(((b+256)%256).toString(16))).slice(-2);}).join('').slice(0,24);}

function fazerLogin(e){
  const email=String(e.parameter.email||'').trim().toLowerCase(),senha=String(e.parameter.senha||'').trim();if(!email||!senha)return resposta(false,'Informe e-mail e senha.');
  const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++){if(String(u[i][1]||'').trim().toLowerCase()!==email)continue;if(String(u[i][7]||'ativo').trim().toLowerCase()==='bloqueado')return resposta(false,'Sua conta está bloqueada.');if(!senhaCorreta(senha,u[i][2]))return resposta(false,'E-mail ou senha inválidos.');if(String(u[i][2]).indexOf('sha256$')!==0)sh.getRange(i+2,3).setValue(hashSenha(senha));const token=gerarToken(),expira=new Date();expira.setDate(expira.getDate()+30);sh.getRange(i+2,5).setValue(token);sh.getRange(i+2,6).setValue(expira);const admin=usuarioEhAdmin(email,u[i][6]);return resposta(true,'Login realizado com sucesso.',{nome:String(u[i][0]||''),email:email,token:token,tipo:admin?'admin':'cliente',admin:admin});}
  return resposta(false,'E-mail ou senha inválidos.');
}

function verificarToken(e){
  const token=String(e.parameter.token||'').trim();if(!token)return resposta(false,'Sessão inválida.');const sh=getAba(),u=getUsuarios();
  for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){if(String(u[i][7]||'ativo').trim().toLowerCase()==='bloqueado'){limparSessao(sh,i+2);return resposta(false,'Conta bloqueada.');}const exp=new Date(u[i][5]);if(isNaN(exp.getTime())||Date.now()>exp.getTime()){limparSessao(sh,i+2);return resposta(false,'Sessão expirada.');}const novaExpiracao=new Date();novaExpiracao.setDate(novaExpiracao.getDate()+30);sh.getRange(i+2,6).setValue(novaExpiracao);const email=String(u[i][1]||'').trim().toLowerCase(),admin=usuarioEhAdmin(email,u[i][6]);return resposta(true,'Sessão válida.',{nome:u[i][0],email:email,tipo:admin?'admin':'cliente',admin:admin});}
  return resposta(false,'Sessão inválida.');
}

function validarAdmin(token){token=String(token||'').trim();if(!token)return{ok:false};const u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){const exp=new Date(u[i][5]),status=String(u[i][7]||'ativo').trim().toLowerCase(),email=String(u[i][1]||'').trim().toLowerCase();if(isNaN(exp.getTime())||Date.now()>exp.getTime()||status==='bloqueado'||!usuarioEhAdmin(email,u[i][6]))return{ok:false};return{ok:true,linha:i+2,usuario:u[i]};}return{ok:false};}
function getMapaAssinaturasAdmin(){const mapa={},ss=SpreadsheetApp.openById(CONFIG_ASSINATURAS.SPREADSHEET_ID),sh=ss.getSheetByName(CONFIG_ASSINATURAS.SHEET_NAME);if(!sh||sh.getLastRow()<2)return mapa;const d=sh.getRange(2,1,sh.getLastRow()-1,7).getValues(),agora=new Date();d.forEach(function(l){const email=String(l[0]||'').trim().toLowerCase();if(!email)return;const v=new Date(l[3]),ativo=String(l[4]||'').trim().toUpperCase()==='ATIVO'&&!isNaN(v.getTime())&&v>=agora;mapa[email]={plano:String(l[1]||'')||null,ativo:ativo,vencimento:isNaN(v.getTime())?'':Utilities.formatDate(v,Session.getScriptTimeZone(),'dd/MM/yyyy'),diasRestantes:ativo?Math.max(0,Math.ceil((v-agora)/86400000)):0};});return mapa;}
function adminListarUsuarios(e){if(!validarAdmin(e.parameter.token).ok)return resposta(false,'Acesso administrativo negado.');const a=getMapaAssinaturasAdmin();const lista=getUsuarios().map(function(u){const email=String(u[1]||'').trim().toLowerCase(),p=a[email]||{plano:null,ativo:false,vencimento:'',diasRestantes:0};return{nome:String(u[0]||''),email:email,tipo:usuarioEhAdmin(email,u[6])?'admin':'cliente',status:String(u[7]||'ativo').trim().toLowerCase(),plano:p.plano,assinaturaAtiva:p.ativo,vencimento:p.vencimento,diasRestantes:p.diasRestantes};});return resposta(true,'Usuários carregados.',{usuarios:lista});}
function adminAlterarStatus(e){if(!validarAdmin(e.parameter.token).ok)return resposta(false,'Acesso administrativo negado.');const email=String(e.parameter.email||'').trim().toLowerCase(),status=String(e.parameter.status||'').trim().toLowerCase();if(!email||(status!=='ativo'&&status!=='bloqueado'))return resposta(false,'Dados inválidos.');if(email===EMAIL_ADMIN&&status==='bloqueado')return resposta(false,'A conta principal do administrador não pode ser bloqueada.');const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][1]||'').trim().toLowerCase()===email){sh.getRange(i+2,8).setValue(status);if(status==='bloqueado')limparSessao(sh,i+2);return resposta(true,status==='bloqueado'?'Usuário bloqueado.':'Usuário ativado.');}return resposta(false,'Usuário não encontrado.');}
function adminRedefinirSenha(e){if(!validarAdmin(e.parameter.token).ok)return resposta(false,'Acesso administrativo negado.');const email=String(e.parameter.email||'').trim().toLowerCase(),nova=String(e.parameter.novaSenha||'').trim(),conf=String(e.parameter.confirmarSenha||'').trim();if(!email||!nova||!conf)return resposta(false,'Preencha todos os campos.');if(nova.length<8)return resposta(false,'A senha deve possuir pelo menos 8 caracteres.');if(nova!==conf)return resposta(false,'As senhas não coincidem.');const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][1]||'').trim().toLowerCase()===email){sh.getRange(i+2,3).setValue(hashSenha(nova));limparSessao(sh,i+2);MailApp.sendEmail({to:email,subject:'Sua senha foi alterada - MAPTORK',htmlBody:'<h2>MAPTORK</h2><p>Olá, '+u[i][0]+'!</p><p>Sua nova senha é:</p><h1 style="color:#d50000">'+nova+'</h1>'});return resposta(true,'Senha alterada e enviada para o e-mail do usuário.');}return resposta(false,'Usuário não encontrado.');}
function adminSalvarPrecos(e){if(!validarAdmin(e.parameter.token).ok)return resposta(false,'Acesso administrativo negado.');const m=Number(e.parameter.mensal||0),t=Number(e.parameter.trimestral||0),a=Number(e.parameter.anual||0);if(!Number.isInteger(m)||!Number.isInteger(t)||!Number.isInteger(a)||m<=0||t<=0||a<=0)return resposta(false,'Valores dos planos inválidos.');salvarPrecosPlanos(m,t,a);return resposta(true,'Valores atualizados com sucesso.',{precos:obterPrecosPlanos()});}
function adminRestaurarPrecos(e){if(!validarAdmin(e.parameter.token).ok)return resposta(false,'Acesso administrativo negado.');restaurarPrecosPadrao();return resposta(true,'Valores padrão restaurados.',{precos:obterPrecosPlanos()});}
function alterarSenha(e){const token=String(e.parameter.token||'').trim(),atual=String(e.parameter.senhaAtual||'').trim(),nova=String(e.parameter.novaSenha||'').trim(),conf=String(e.parameter.confirmarSenha||'').trim();if(!token||!atual||!nova||!conf)return resposta(false,'Preencha todos os campos.');if(nova!==conf)return resposta(false,'As novas senhas não coincidem.');if(nova.length<8)return resposta(false,'A nova senha deve possuir pelo menos 8 caracteres.');const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){const exp=new Date(u[i][5]);if(isNaN(exp.getTime())||Date.now()>exp.getTime())return resposta(false,'Sua sessão expirou.');if(!senhaCorreta(atual,u[i][2]))return resposta(false,'Senha atual incorreta.');sh.getRange(i+2,3).setValue(hashSenha(nova));limparSessao(sh,i+2);return resposta(true,'Senha alterada com sucesso. Faça login novamente.');}return resposta(false,'Sessão inválida.');}
function fazerLogout(e){const token=String(e.parameter.token||'').trim();if(!token)return resposta(true,'Logout realizado.');const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){limparSessao(sh,i+2);break;}return resposta(true,'Logout realizado.');}
function recuperarSenha(e){try{const email=String(e.parameter.email||'').trim().toLowerCase();if(!email)return resposta(false,'Informe o e-mail.');const sh=getAba(),u=getUsuarios();for(let i=0;i<u.length;i++)if(String(u[i][1]||'').trim().toLowerCase()===email){const nova='TORK'+Math.floor(10000000+Math.random()*90000000);sh.getRange(i+2,3).setValue(hashSenha(nova));limparSessao(sh,i+2);MailApp.sendEmail({to:email,subject:'Recuperação de senha - MAPTORK',htmlBody:'<h2>MAPTORK</h2><p>Sua nova senha temporária é:</p><h1 style="color:#d50000">'+nova+'</h1>'});return resposta(true,'Nova senha enviada para seu e-mail.');}return resposta(false,'E-mail não encontrado.');}catch(err){return resposta(false,'Erro ao recuperar a senha.');}}
function excluirMinhaConta(e){const token=String(e.parameter.token||'').trim();if(!token)return resposta(false,'Sessão inválida.');const lock=LockService.getScriptLock();lock.waitLock(10000);try{const sh=getAba(),u=getUsuarios();let linha=-1,email='';for(let i=0;i<u.length;i++)if(String(u[i][4]||'').trim()===token){const exp=new Date(u[i][5]);if(isNaN(exp.getTime())||Date.now()>exp.getTime())return resposta(false,'Sua sessão expirou.');linha=i+2;email=String(u[i][1]||'').trim().toLowerCase();break;}if(linha<0)return resposta(false,'Sessão inválida.');if(email===EMAIL_ADMIN)return resposta(false,'A conta principal do administrador não pode ser excluída.');const ss=SpreadsheetApp.openById(CONFIG_ASSINATURAS.SPREADSHEET_ID),sa=ss.getSheetByName(CONFIG_ASSINATURAS.SHEET_NAME);if(sa&&sa.getLastRow()>=2){const d=sa.getRange(2,1,sa.getLastRow()-1,1).getValues();for(let i=d.length-1;i>=0;i--)if(String(d[i][0]||'').trim().toLowerCase()===email)sa.deleteRow(i+2);}sh.deleteRow(linha);SpreadsheetApp.flush();return resposta(true,'Sua conta foi excluída com sucesso.');}catch(err){return resposta(false,'Não foi possível excluir sua conta.');}finally{lock.releaseLock();}}
function testarEmail(){MailApp.sendEmail({to:EMAIL_ADMIN,subject:'Teste MAPTORK',htmlBody:'<h2>O envio de e-mails está funcionando.</h2>'});}



// =============================================================
// MAPTORK V15 - COMPATIBILIDADE DE EDIÇÃO DA COMUNIDADE
// Mantém editar post e excluir foto funcionando mesmo com um
// ComunidadeFotos.gs anterior que ainda não tenha essas rotas.
// =============================================================
function comunidadeEditarPostCompat_(e){
  try{
    const usuario=comunidadeValidarUsuario_(comunidadeParametro_(e,'token'),false);
    if(!usuario.ok)return comunidadeResposta_(false,usuario.mensagem);
    if(!comunidadeAssinaturaAtiva_(usuario.email))return comunidadeResposta_(false,'Somente usuários com assinatura ativa podem editar publicações.');

    const id=comunidadeParametro_(e,'id');
    const cabecalho=comunidadeParametro_(e,'cabecalho').slice(0,80);
    const descricao=comunidadeParametro_(e,'descricao').slice(0,600);
    const whatsapp=comunidadeParametro_(e,'whatsapp').replace(/\D/g,'').slice(0,15);
    const youtubeId=comunidadeYoutubeId_(comunidadeParametro_(e,'youtube'));

    if(!id)return comunidadeResposta_(false,'Publicação inválida.');
    if(!cabecalho)return comunidadeResposta_(false,'Informe o cabeçalho.');
    if(!descricao)return comunidadeResposta_(false,'Informe a descrição.');

    const perfis=comunidadeLerPerfis_();
    const email=String(usuario.email||'').trim().toLowerCase();
    const perfil=perfis.filter(function(p){
      return String(p.id||'')===id&&String(p.email||'').trim().toLowerCase()===email;
    })[0];
    if(!perfil)return comunidadeResposta_(false,'Publicação não encontrada.');

    perfil.nome=usuario.nome||perfil.nome||'Usuário';
    perfil.cabecalho=cabecalho;
    perfil.descricao=descricao;
    perfil.whatsapp=whatsapp;
    perfil.youtubeId=youtubeId;
    perfil.fotoPerfilId=String(perfil.fotoPerfilId||comunidadeObterFotoPerfilId_(usuario.email)||'');
    perfil.status='aprovado';
    perfil.atualizado=Date.now();
    comunidadeNormalizarPerfil_(perfil);
    comunidadeSalvarPerfis_(perfis);

    return comunidadeResposta_(true,'Publicação atualizada.',{post:comunidadePerfilPrivado_(perfil,usuario)});
  }catch(erro){
    console.error('comunidadeEditarPostCompat_:',erro);
    return comunidadeResposta_(false,String(erro&&erro.message||'Erro ao atualizar a publicação.'));
  }
}

function comunidadeExcluirFotoCompat_(e){
  try{
    const usuario=comunidadeValidarUsuario_(comunidadeParametro_(e,'token'),false);
    if(!usuario.ok)return comunidadeResposta_(false,usuario.mensagem);

    const fotoId=comunidadeParametro_(e,'fotoId');
    const postId=comunidadeParametro_(e,'postId');
    if(!fotoId)return comunidadeResposta_(false,'Foto inválida.');

    const perfis=comunidadeLerPerfis_();
    const email=String(usuario.email||'').trim().toLowerCase();
    const perfil=postId
      ? perfis.filter(function(p){return String(p.id||'')===postId&&String(p.email||'').trim().toLowerCase()===email;})[0]
      : comunidadeBuscarPorEmailEmLista_(perfis,usuario.email);
    if(!perfil||!Array.isArray(perfil.fotos))return comunidadeResposta_(false,'Publicação não encontrada.');

    const indice=perfil.fotos.findIndex(function(f){return String(f&&f.id||'')===fotoId;});
    if(indice<0)return comunidadeResposta_(false,'Foto não encontrada.');

    const removida=perfil.fotos.splice(indice,1)[0];
    comunidadeExcluirArquivo_(String(removida&&removida.id||fotoId));
    perfil.status='aprovado';
    perfil.atualizado=Date.now();
    comunidadeNormalizarPerfil_(perfil);
    comunidadeSalvarPerfis_(perfis);

    return comunidadeResposta_(true,'Foto excluída.',{
      post:comunidadePerfilPrivado_(perfil,usuario),
      perfil:comunidadePerfilPrivado_(perfil,usuario)
    });
  }catch(erro){
    console.error('comunidadeExcluirFotoCompat_:',erro);
    return comunidadeResposta_(false,String(erro&&erro.message||'Erro ao excluir a foto.'));
  }
}

// =============================================================
// MAPTORK V11 - FERRAMENTAS INTEGRADAS AO usuario.gs
// Corrige: adminSalvarFerramenta is not defined
// =============================================================

// =============================================================
// MAPTORK - FERRAMENTAS DINÂMICAS
// Cadastro pelo Admin + exibição pública + acesso só com plano ativo
// Este arquivo deve ficar no MESMO projeto Google Apps Script do usuario.gs.
// =============================================================

const MAPTORK_ABA_FERRAMENTAS = "Ferramentas";
const MAPTORK_PASTA_FERRAMENTAS = "MAPTORK - Ferramentas";
const MAPTORK_FERRAMENTA_MAX_BYTES = 3 * 1024 * 1024;

function obterAbaFerramentas_() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  let aba = planilha.getSheetByName(MAPTORK_ABA_FERRAMENTAS);

  if (!aba) {
    aba = planilha.insertSheet(MAPTORK_ABA_FERRAMENTAS);
    aba.getRange(1, 1, 1, 8).setValues([[
      "ID",
      "Titulo",
      "Texto",
      "Link",
      "ImagemFileId",
      "Status",
      "CriadoEm",
      "AtualizadoEm"
    ]]);
    aba.setFrozenRows(1);
  }

  return aba;
}

function lerFerramentas_() {
  const aba = obterAbaFerramentas_();
  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return [];

  return aba.getRange(2, 1, ultimaLinha - 1, 8).getValues().map(function(linha, indice) {
    return {
      linha: indice + 2,
      id: String(linha[0] || "").trim(),
      titulo: String(linha[1] || "").trim(),
      texto: String(linha[2] || "").trim(),
      link: String(linha[3] || "").trim(),
      imageFileId: String(linha[4] || "").trim(),
      status: String(linha[5] || "ativo").trim().toLowerCase(),
      criadoEm: linha[6],
      atualizadoEm: linha[7]
    };
  }).filter(function(item) {
    return !!item.id;
  });
}

function buscarFerramentaPorId_(id) {
  const alvo = String(id || "").trim();
  if (!alvo) return null;
  const lista = lerFerramentas_();
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id === alvo) return lista[i];
  }
  return null;
}

function obterFerramentasPublicas(e) {
  try {
    const ferramentas = lerFerramentas_()
      .filter(function(item) {
        return item.status === "ativo";
      })
      .map(function(item) {
        return {
          id: item.id,
          titulo: item.titulo,
          texto: item.texto,
          temImagem: !!item.imageFileId
        };
      });

    return resposta(true, "Ferramentas carregadas.", {
      ferramentas: ferramentas
    });
  } catch (erro) {
    console.error("Erro obterFerramentasPublicas:", erro);
    return resposta(false, "Não foi possível carregar as ferramentas.");
  }
}

function obterImagemFerramenta(e) {
  try {
    const id = String((e && e.parameter && e.parameter.id) || "").trim();
    const ferramenta = buscarFerramentaPorId_(id);

    if (!ferramenta || ferramenta.status !== "ativo") {
      return resposta(false, "Ferramenta não encontrada.");
    }

    if (!ferramenta.imageFileId) {
      return resposta(true, "Ferramenta sem imagem.", { dataUrl: "" });
    }

    const arquivo = DriveApp.getFileById(ferramenta.imageFileId);
    const blob = arquivo.getBlob();
    const mimeType = String(blob.getContentType() || "image/jpeg");
    const base64 = Utilities.base64Encode(blob.getBytes());

    return resposta(true, "Imagem carregada.", {
      dataUrl: "data:" + mimeType + ";base64," + base64
    });
  } catch (erro) {
    console.error("Erro obterImagemFerramenta:", erro);
    return resposta(false, "Não foi possível carregar a imagem da ferramenta.");
  }
}

function adminListarFerramentas(e) {
  try {
    const token = String((e && e.parameter && e.parameter.token) || "").trim();
    const admin = validarAdmin(token);

    if (!admin || !admin.ok) {
      return resposta(false, "Acesso administrativo negado.");
    }

    const ferramentas = lerFerramentas_().map(function(item) {
      return {
        id: item.id,
        titulo: item.titulo,
        texto: item.texto,
        link: item.link,
        status: item.status,
        temImagem: !!item.imageFileId
      };
    });

    return resposta(true, "Ferramentas carregadas.", {
      ferramentas: ferramentas
    });
  } catch (erro) {
    console.error("Erro adminListarFerramentas:", erro);
    return resposta(false, "Não foi possível carregar as ferramentas.");
  }
}

function adminSalvarFerramenta(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    e = e || {};
    e.parameter = e.parameter || {};

    const token = String(e.parameter.token || "").trim();
    const admin = validarAdmin(token);
    if (!admin || !admin.ok) {
      return resposta(false, "Acesso administrativo negado.");
    }

    const idRecebido = String(e.parameter.id || "").trim();
    const titulo = String(e.parameter.titulo || "").trim();
    const texto = String(e.parameter.texto || "").trim();
    const link = String(e.parameter.link || "").trim();
    const imageBase64 = String(e.parameter.imageBase64 || "").trim();
    const fileName = String(e.parameter.fileName || "ferramenta.jpg").trim();
    const mimeType = String(e.parameter.mimeType || "image/jpeg").trim().toLowerCase();

    if (!titulo || !texto || !link) {
      return resposta(false, "Preencha nome, texto e link.");
    }

    if (titulo.length > 80 || texto.length > 500) {
      return resposta(false, "Nome ou texto ultrapassou o limite permitido.");
    }

    if (!/^https?:\/\//i.test(link)) {
      return resposta(false, "O link precisa começar com http:// ou https://.");
    }

    const aba = obterAbaFerramentas_();
    const existente = idRecebido ? buscarFerramentaPorId_(idRecebido) : null;

    if (idRecebido && !existente) {
      return resposta(false, "Ferramenta não encontrada para edição.");
    }

    if (!existente && !imageBase64) {
      return resposta(false, "Selecione uma imagem para a nova ferramenta.");
    }

    let imageFileId = existente ? existente.imageFileId : "";
    let novoArquivoId = "";

    if (imageBase64) {
      if (mimeType.indexOf("image/") !== 0) {
        return resposta(false, "Tipo de imagem inválido.");
      }

      const bytes = Utilities.base64Decode(imageBase64);
      if (!bytes || !bytes.length) {
        return resposta(false, "Não foi possível decodificar a imagem.");
      }
      if (bytes.length > MAPTORK_FERRAMENTA_MAX_BYTES) {
        return resposta(false, "A imagem da ferramenta ficou muito grande.");
      }

      const pasta = obterPastaFerramentas_();
      const nomeSeguro = sanitizarNomeImagemFerramenta_(fileName, mimeType);
      const blob = Utilities.newBlob(bytes, mimeType, nomeSeguro);
      const arquivo = pasta.createFile(blob);
      novoArquivoId = arquivo.getId();
      imageFileId = novoArquivoId;
    }

    const agora = new Date();
    let id = idRecebido;

    if (existente) {
      aba.getRange(existente.linha, 2, 1, 7).setValues([[
        titulo,
        texto,
        link,
        imageFileId,
        "ativo",
        existente.criadoEm || agora,
        agora
      ]]);

      if (novoArquivoId && existente.imageFileId && existente.imageFileId !== novoArquivoId) {
        removerArquivoFerramenta_(existente.imageFileId);
      }
    } else {
      id = Utilities.getUuid();
      aba.appendRow([
        id,
        titulo,
        texto,
        link,
        imageFileId,
        "ativo",
        agora,
        agora
      ]);
    }

    SpreadsheetApp.flush();

    return resposta(true, existente ? "Ferramenta atualizada com sucesso." : "Ferramenta adicionada com sucesso.", {
      id: id
    });
  } catch (erro) {
    console.error("Erro adminSalvarFerramenta:", erro);
    return resposta(false, "Erro ao salvar a ferramenta: " + erro.message);
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function adminExcluirFerramenta(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    e = e || {};
    e.parameter = e.parameter || {};

    const token = String(e.parameter.token || "").trim();
    const id = String(e.parameter.id || "").trim();
    const admin = validarAdmin(token);

    if (!admin || !admin.ok) {
      return resposta(false, "Acesso administrativo negado.");
    }

    const ferramenta = buscarFerramentaPorId_(id);
    if (!ferramenta) {
      return resposta(false, "Ferramenta não encontrada.");
    }

    const aba = obterAbaFerramentas_();
    aba.deleteRow(ferramenta.linha);

    if (ferramenta.imageFileId) {
      removerArquivoFerramenta_(ferramenta.imageFileId);
    }

    SpreadsheetApp.flush();
    return resposta(true, "Ferramenta excluída.");
  } catch (erro) {
    console.error("Erro adminExcluirFerramenta:", erro);
    return resposta(false, "Não foi possível excluir a ferramenta.");
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function abrirFerramentaDinamica(e) {
  try {
    e = e || {};
    e.parameter = e.parameter || {};

    const token = String(e.parameter.token || "").trim();
    const id = String(e.parameter.id || "").trim();

    const usuario = obterUsuarioFerramentaPorToken_(token);
    if (!usuario.ok) {
      return resposta(false, usuario.mensagem || "Sessão inválida.", {
        codigo: "SESSAO_INVALIDA"
      });
    }

    const ferramenta = buscarFerramentaPorId_(id);
    if (!ferramenta || ferramenta.status !== "ativo") {
      return resposta(false, "Ferramenta não encontrada.");
    }

    const mapa = getMapaAssinaturasAdmin();
    const assinatura = mapa[usuario.email];

    if (!assinatura || assinatura.ativo !== true) {
      return resposta(false, "Este conteúdo é exclusivo para usuários com plano ativo.", {
        codigo: "SEM_PLANO"
      });
    }

    return resposta(true, "Acesso liberado.", {
      link: ferramenta.link,
      titulo: ferramenta.titulo
    });
  } catch (erro) {
    console.error("Erro abrirFerramentaDinamica:", erro);
    return resposta(false, "Não foi possível validar o acesso.");
  }
}

function obterUsuarioFerramentaPorToken_(token) {
  const valor = String(token || "").trim();
  if (!valor) return { ok: false, mensagem: "Sessão inválida." };

  const usuarios = getUsuarios();
  for (let i = 0; i < usuarios.length; i++) {
    if (String(usuarios[i][4] || "").trim() !== valor) continue;

    const expiracao = new Date(usuarios[i][5]);
    const status = String(usuarios[i][7] || "ativo").trim().toLowerCase();
    const email = String(usuarios[i][1] || "").trim().toLowerCase();

    if (status === "bloqueado") {
      return { ok: false, mensagem: "Conta bloqueada." };
    }

    if (isNaN(expiracao.getTime()) || Date.now() > expiracao.getTime()) {
      return { ok: false, mensagem: "Sessão expirada. Entre novamente." };
    }

    return { ok: true, email: email };
  }

  return { ok: false, mensagem: "Sessão inválida." };
}

function obterPastaFerramentas_() {
  const pastas = DriveApp.getFoldersByName(MAPTORK_PASTA_FERRAMENTAS);
  if (pastas.hasNext()) return pastas.next();
  return DriveApp.createFolder(MAPTORK_PASTA_FERRAMENTAS);
}

function sanitizarNomeImagemFerramenta_(nome, mimeType) {
  let base = String(nome || "ferramenta")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!base) base = "ferramenta";

  let ext = "jpg";
  if (mimeType === "image/png") ext = "png";
  if (mimeType === "image/webp") ext = "webp";

  return base + "." + ext;
}

function removerArquivoFerramenta_(fileId) {
  const id = String(fileId || "").trim();
  if (!id) return;
  try {
    DriveApp.getFileById(id).setTrashed(true);
  } catch (erro) {
    console.warn("Não foi possível remover imagem antiga da ferramenta:", erro);
  }
}

// =============================================================
// MAPTORK V16 - LOJA
// Cadastro pelo Admin + exibição pública + imagens no Google Drive
// =============================================================
const MAPTORK_ABA_LOJA = "Loja";
const MAPTORK_PASTA_LOJA = "MAPTORK - Loja";
const MAPTORK_LOJA_MAX_BYTES = 3 * 1024 * 1024;

function obterAbaLoja_() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  let aba = planilha.getSheetByName(MAPTORK_ABA_LOJA);
  if (!aba) {
    aba = planilha.insertSheet(MAPTORK_ABA_LOJA);
    aba.getRange(1, 1, 1, 9).setValues([[
      "ID",
      "Titulo",
      "Texto",
      "Preco",
      "Link",
      "ImagemFileId",
      "Status",
      "CriadoEm",
      "AtualizadoEm"
    ]]);
    aba.setFrozenRows(1);
  }
  return aba;
}

function lerLoja_() {
  const aba = obterAbaLoja_();
  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return [];
  return aba.getRange(2, 1, ultimaLinha - 1, 9).getValues().map(function(linha, indice) {
    return {
      linha: indice + 2,
      id: String(linha[0] || "").trim(),
      titulo: String(linha[1] || "").trim(),
      texto: String(linha[2] || "").trim(),
      preco: String(linha[3] || "").trim(),
      link: String(linha[4] || "").trim(),
      imageFileId: String(linha[5] || "").trim(),
      status: String(linha[6] || "ativo").trim().toLowerCase(),
      criadoEm: linha[7],
      atualizadoEm: linha[8]
    };
  }).filter(function(item) { return !!item.id; });
}

function buscarProdutoLojaPorId_(id) {
  const alvo = String(id || "").trim();
  if (!alvo) return null;
  const lista = lerLoja_();
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id === alvo) return lista[i];
  }
  return null;
}

function obterLojaPublica(e) {
  try {
    const produtos = lerLoja_()
      .filter(function(item) { return item.status === "ativo"; })
      .sort(function(a, b) {
        const ta = a.atualizadoEm instanceof Date ? a.atualizadoEm.getTime() : new Date(a.atualizadoEm || 0).getTime();
        const tb = b.atualizadoEm instanceof Date ? b.atualizadoEm.getTime() : new Date(b.atualizadoEm || 0).getTime();
        return (tb || 0) - (ta || 0);
      })
      .map(function(item) {
        return {
          id: item.id,
          titulo: item.titulo,
          texto: item.texto,
          preco: item.preco,
          link: item.link,
          temImagem: !!item.imageFileId
        };
      });
    return resposta(true, "Loja carregada.", { produtos: produtos });
  } catch (erro) {
    console.error("Erro obterLojaPublica:", erro);
    return resposta(false, "Não foi possível carregar a Loja.");
  }
}

function obterImagemLoja(e) {
  try {
    const id = String((e && e.parameter && e.parameter.id) || "").trim();
    const produto = buscarProdutoLojaPorId_(id);
    if (!produto || produto.status !== "ativo") return resposta(false, "Produto não encontrado.");
    if (!produto.imageFileId) return resposta(true, "Produto sem imagem.", { dataUrl: "" });
    const arquivo = DriveApp.getFileById(produto.imageFileId);
    const blob = arquivo.getBlob();
    const mimeType = String(blob.getContentType() || "image/jpeg");
    const base64 = Utilities.base64Encode(blob.getBytes());
    return resposta(true, "Imagem carregada.", { dataUrl: "data:" + mimeType + ";base64," + base64 });
  } catch (erro) {
    console.error("Erro obterImagemLoja:", erro);
    return resposta(false, "Não foi possível carregar a imagem do produto.");
  }
}

function adminListarLoja(e) {
  try {
    const token = String((e && e.parameter && e.parameter.token) || "").trim();
    const admin = validarAdmin(token);
    if (!admin || !admin.ok) return resposta(false, "Acesso administrativo negado.");
    const produtos = lerLoja_().map(function(item) {
      return {
        id: item.id,
        titulo: item.titulo,
        texto: item.texto,
        preco: item.preco,
        link: item.link,
        status: item.status,
        temImagem: !!item.imageFileId
      };
    });
    return resposta(true, "Produtos carregados.", { produtos: produtos });
  } catch (erro) {
    console.error("Erro adminListarLoja:", erro);
    return resposta(false, "Não foi possível carregar os produtos.");
  }
}

function adminSalvarProdutoLoja(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    e = e || {};
    e.parameter = e.parameter || {};
    const token = String(e.parameter.token || "").trim();
    const admin = validarAdmin(token);
    if (!admin || !admin.ok) return resposta(false, "Acesso administrativo negado.");

    const idRecebido = String(e.parameter.id || "").trim();
    const titulo = String(e.parameter.titulo || "").trim();
    const texto = String(e.parameter.texto || "").trim();
    const preco = String(e.parameter.preco || "").trim();
    const link = String(e.parameter.link || "").trim();
    const imageBase64 = String(e.parameter.imageBase64 || "").trim();
    const fileName = String(e.parameter.fileName || "produto.jpg").trim();
    const mimeType = String(e.parameter.mimeType || "image/jpeg").trim().toLowerCase();

    if (!titulo || !texto || !link) return resposta(false, "Preencha nome, descrição e link. O campo preço/chamada é opcional.");
    if (titulo.length > 80 || texto.length > 500 || preco.length > 80) return resposta(false, "Um dos campos ultrapassou o limite permitido.");
    if (!/^https?:\/\//i.test(link)) return resposta(false, "O link precisa começar com http:// ou https://.");

    const aba = obterAbaLoja_();
    const existente = idRecebido ? buscarProdutoLojaPorId_(idRecebido) : null;
    if (idRecebido && !existente) return resposta(false, "Produto não encontrado para edição.");
    if (!existente && !imageBase64) return resposta(false, "Selecione uma imagem para o novo produto.");

    let imageFileId = existente ? existente.imageFileId : "";
    let novoArquivoId = "";
    if (imageBase64) {
      if (mimeType.indexOf("image/") !== 0) return resposta(false, "Tipo de imagem inválido.");
      const bytes = Utilities.base64Decode(imageBase64);
      if (!bytes || !bytes.length) return resposta(false, "Não foi possível decodificar a imagem.");
      if (bytes.length > MAPTORK_LOJA_MAX_BYTES) return resposta(false, "A imagem do produto ficou muito grande.");
      const pasta = obterPastaLoja_();
      const nomeSeguro = sanitizarNomeImagemLoja_(fileName, mimeType);
      const blob = Utilities.newBlob(bytes, mimeType, nomeSeguro);
      const arquivo = pasta.createFile(blob);
      novoArquivoId = arquivo.getId();
      imageFileId = novoArquivoId;
    }

    const agora = new Date();
    let id = idRecebido;
    if (existente) {
      aba.getRange(existente.linha, 2, 1, 8).setValues([[
        titulo,
        texto,
        preco,
        link,
        imageFileId,
        "ativo",
        existente.criadoEm || agora,
        agora
      ]]);
      if (novoArquivoId && existente.imageFileId && existente.imageFileId !== novoArquivoId) removerArquivoLoja_(existente.imageFileId);
    } else {
      id = Utilities.getUuid();
      aba.appendRow([id, titulo, texto, preco, link, imageFileId, "ativo", agora, agora]);
    }
    SpreadsheetApp.flush();
    return resposta(true, existente ? "Produto atualizado com sucesso." : "Produto adicionado com sucesso.", { id: id });
  } catch (erro) {
    console.error("Erro adminSalvarProdutoLoja:", erro);
    return resposta(false, "Erro ao salvar o produto: " + erro.message);
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function adminExcluirProdutoLoja(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    e = e || {};
    e.parameter = e.parameter || {};
    const token = String(e.parameter.token || "").trim();
    const id = String(e.parameter.id || "").trim();
    const admin = validarAdmin(token);
    if (!admin || !admin.ok) return resposta(false, "Acesso administrativo negado.");
    const produto = buscarProdutoLojaPorId_(id);
    if (!produto) return resposta(false, "Produto não encontrado.");
    const aba = obterAbaLoja_();
    aba.deleteRow(produto.linha);
    if (produto.imageFileId) removerArquivoLoja_(produto.imageFileId);
    SpreadsheetApp.flush();
    return resposta(true, "Produto excluído.");
  } catch (erro) {
    console.error("Erro adminExcluirProdutoLoja:", erro);
    return resposta(false, "Não foi possível excluir o produto.");
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function obterPastaLoja_() {
  const pastas = DriveApp.getFoldersByName(MAPTORK_PASTA_LOJA);
  if (pastas.hasNext()) return pastas.next();
  return DriveApp.createFolder(MAPTORK_PASTA_LOJA);
}

function sanitizarNomeImagemLoja_(nome, mimeType) {
  let base = String(nome || "produto")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!base) base = "produto";
  let ext = "jpg";
  if (mimeType === "image/png") ext = "png";
  if (mimeType === "image/webp") ext = "webp";
  return base + "." + ext;
}

function removerArquivoLoja_(fileId) {
  const id = String(fileId || "").trim();
  if (!id) return;
  try { DriveApp.getFileById(id).setTrashed(true); }
  catch (erro) { console.warn("Não foi possível remover imagem antiga da Loja:", erro); }
}

