let logoData = null;
let propostaAtualId = null;
let idParaExcluir = null;

function execCmd(cmd) {
    document.execCommand(cmd, false, null);
    atualizarStatusBotoes();
    atualizarPreview();
}

window.onload = () => {
    configurarEventos();
    carregarPropostas();
    atualizarPreview();
};

function configurarEventos() {
    const inputs = document.querySelectorAll('input, #intro');
    inputs.forEach(el => el.addEventListener('input', atualizarPreview));

    document.getElementById('logoUpload').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = () => { logoData = reader.result; atualizarPreview(); };
    reader.readAsDataURL(e.target.files[0]);
  });
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', atualizarPreview);
});
document.getElementById('intro').addEventListener('input', atualizarPreview);

atualizarPreview();

function atualizarStatusBotoes() {
    ['bold', 'italic', 'underline'].forEach(cmd => {
        const btn = document.getElementById(`btn-${cmd}`);
        if (document.queryCommandState(cmd)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function abrirModalExcluir(id, e) {
    e.stopPropagation(); // Evita carregar a proposta ao clicar no lixo
    idParaExcluir = id;
    document.getElementById('modalExcluir').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalExcluir').style.display = 'none';
    idParaExcluir = null;
}

function confirmarExclusao() {
    let propostas = JSON.parse(localStorage.getItem('propostas')) || [];
    propostas = propostas.filter(p => p.id !== idParaExcluir);
    localStorage.setItem('propostas', JSON.stringify(propostas));
    
    if (propostaAtualId === idParaExcluir) novaProposta();
    
    fecharModal();
    carregarPropostas();
}

// Lógica do Editor
function travarCampos(status) {
    const inputs = document.querySelectorAll('.editor input');
    inputs.forEach(i => i.disabled = status);
    document.getElementById('intro').contentEditable = !status;
    
    document.getElementById('btnSalvar').style.display = status ? 'none' : 'block';
    document.getElementById('btnEditar').style.display = status ? 'block' : 'none';
}

function editarProposta() {
    travarCampos(false);
}

document.querySelectorAll('input').forEach(i => i.addEventListener('input', atualizarPreview));
document.getElementById('intro').addEventListener('input', atualizarPreview);
document.getElementById('intro').addEventListener('keyup', atualizarStatusBotoes);
document.getElementById('intro').addEventListener('mouseup', atualizarStatusBotoes);
document.getElementById('intro').addEventListener('mousedown', atualizarStatusBotoes);

function atualizarPreview() {
    const getVal = (id) => document.getElementById(id).value;
    const dataF = getVal('dataProposta') ? getVal('dataProposta').split('-').reverse().join('/') : '--/--/----';

    document.getElementById('previewContent').innerHTML = `
        <div class="doc-header">
            <div class="doc-logo">
                ${logoData ? `<img src="${logoData}">` : '<b>LOGO</b>'}
            </div>

            <div class="doc-info-center">
                ${getVal('telefone') ? `<b>Contato:</b> ${getVal('telefone')}<br>` : ''}
                ${getVal('email') ? `<b>E-mail:</b> ${getVal('email')}<br>` : ''}
                ${getVal('website') ? `<b>Website:</b> ${getVal('website')}` : ''}
            </div>

            <div class="doc-info-right">
                ${getVal('youtube') ? `youtube.com/@${getVal('youtube')}<br>` : ''}
                ${getVal('instagram') ? `instagram: ${getVal('instagram')}<br>` : ''}
                ${getVal('tiktok') ? `tiktok: ${getVal('tiktok')}<br>` : ''}
                ${getVal('twitter') ? `x: ${getVal('twitter')}` : ''}
            </div>
        </div>

        <div class="doc-banner">
            <h1>${getVal('titulo').toUpperCase() || 'PROPOSTA COMERCIAL'}</h1>
        </div>

        <div class="doc-meta">
            <div><div class="meta-label">DATA DA PROPOSTA:</div><div class="meta-value">${dataF}</div></div>
            <div><div class="meta-label">RESPONSÁVEL:</div><div class="meta-value">${getVal('empresa') || 'Sua Empresa'}</div></div>
        </div>

        <div class="doc-content">
            <div class="client-name">${getVal('cliente') || 'Nome do Cliente'}</div>
            <div class="project-subtitle">${getVal('subtitulo') || 'TÍTULO DO PROJETO'}</div>
            <div style="margin-top: 15px; color: #444;">${document.getElementById('intro').innerHTML}</div>
        </div>
    `;
}

function salvarProposta() {
    const dados = {
        id: propostaAtualId || Date.now(),
        logo: logoData,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        website: document.getElementById('website').value,
        instagram: document.getElementById('instagram').value,
        youtube: document.getElementById('youtube').value,
        tiktok: document.getElementById('tiktok').value,
        twitter: document.getElementById('twitter').value,
        empresa: document.getElementById('empresa').value,
        cliente: document.getElementById('cliente').value,
        titulo: document.getElementById('titulo').value,
        subtitulo: document.getElementById('subtitulo').value,
        dataProposta: document.getElementById('dataProposta').value,
        intro: document.getElementById('intro').innerHTML
    };

    let propostas = JSON.parse(localStorage.getItem('propostas')) || [];
    if (propostaAtualId) {
        propostas = propostas.map(p => p.id === propostaAtualId ? dados : p);
    } else {
        propostas.push(dados);
    }

    localStorage.setItem('propostas', JSON.stringify(propostas));
    propostaAtualId = dados.id;
    
    travarCampos(true);
    carregarPropostas();
    alert("Salvo!");
}

function carregarPropostas() {
    const lista = document.getElementById('listaPropostas');
    const propostas = JSON.parse(localStorage.getItem('propostas')) || [];
    lista.innerHTML = "";
    
    propostas.forEach(p => {
        const container = document.createElement('div');
        container.className = 'proposta-item-container';
        container.onclick = () => carregarNoEditor(p);
        
        container.innerHTML = `
            <span class="proposta-texto">${p.titulo || 'Sem Título'}</span>
            <button class="btn-excluir" onclick="abrirModalExcluir(${p.id}, event)">🗑</button>
        `;
        lista.appendChild(container);
    });
}

function carregarNoEditor(p) {
    propostaAtualId = p.id;
    logoData = p.logo || "";
    document.getElementById('email').value = p.email || "";
    document.getElementById('telefone').value = p.telefone || "";
    document.getElementById('website').value = p.website || "";
    document.getElementById('instagram').value = p.instagram || "";
    document.getElementById('youtube').value = p.youtube || "";
    document.getElementById('tiktok').value = p.tiktok || "";
    document.getElementById('twitter').value = p.twitter || "";
    document.getElementById('empresa').value = p.empresa || "";
    document.getElementById('cliente').value = p.cliente || "";
    document.getElementById('titulo').value = p.titulo || "";
    document.getElementById('subtitulo').value = p.subtitulo || "";
    document.getElementById('dataProposta').value = p.dataProposta || "";
    document.getElementById('intro').innerHTML = p.intro || "";
    
    travarCampos(true);
    atualizarPreview();
}

function novaProposta() {
    window.location.reload();
}
function editarProposta() { /* Lógica para habilitar campos se necessário */ }