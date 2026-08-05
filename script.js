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


