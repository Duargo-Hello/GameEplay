const STORAGE = "doramas";
let editId = null,
  modoFavoritos = false,
  imagemTemp = null,
  detalheAtual = null,
  descricaoExpandida = false;

const $ = id => document.getElementById(id);

/* ================= STORAGE ================= */

if (!localStorage.getItem(STORAGE)) {
  localStorage.setItem(STORAGE, JSON.stringify([]));
}

/* ================= IMAGEM ================= */

if ($("imagemFileInput")) {
  $("imagemFileInput").onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => (imagemTemp = r.result);
    r.readAsDataURL(f);
  };
}

/* ================= HELPERS ================= */

function classeStatus(txt = "") {
  return "status-" + txt.toLowerCase().replace(/\s+/g, "");
}

function converterYoutube(url) {
  if (!url) return "";
  const reg = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const m = url.match(reg);
  return m ? `https://www.youtube.com/embed/${m[1]}` : "";
}

/* ================= RENDER ================= */

function renderizar() {
  let d = JSON.parse(localStorage.getItem(STORAGE));

  if (buscaTexto.value) {
    const t = buscaTexto.value.toLowerCase();
    d = d.filter(x =>
      x.titulo.toLowerCase().includes(t) ||
      (x.descricao || "").toLowerCase().includes(t)
    );
  }

  if (filtroCategoria.value)
    d = d.filter(x => x.categoria === filtroCategoria.value);

  if (modoFavoritos)
    d = d.filter(x => x.favorito);

  if (ordenarPor.value === "titulo")
    d.sort((a, b) => a.titulo.localeCompare(b.titulo));

  if (ordenarPor.value === "ano")
    d.sort((a, b) => (b.ano || 0) - (a.ano || 0));

  listaDoramas.innerHTML = "";

  d.forEach(x => {
    listaDoramas.innerHTML += `
    <div class="dorama-card" data-id="${x.id}">
      <button class="favorito">${x.favorito ? "❤️" : "🤍"}</button>

      <img src="${x.imagem}">
      <h3>${x.titulo}</h3>

      <p class="info">📅 ${x.ano || "—"} • 📂 ${x.categoria}</p>

      <p class="info">
        <span class="status ${classeStatus(x.status)}">
          📺 ${x.status}
        </span>
      </p>

      <p class="info estrelas-card">
        <span class="estrela-cheia">${"★".repeat(x.avaliacao || 0)}</span>
        <span class="estrela-vazia">${"☆".repeat(5 - (x.avaliacao || 0))}</span>
      </p>

      <div class="card-acoes">
        <button class="editar">✏️</button>
        <button class="excluir">🗑️</button>
      </div>
    </div>`;
  });
}

/* ================= EVENTOS ================= */

document.addEventListener("click", e => {
  const c = e.target.closest(".dorama-card");
  if (!c) return;

  let d = JSON.parse(localStorage.getItem(STORAGE));
  const x = d.find(v => v.id == c.dataset.id);

  if (e.target.closest(".favorito")) {
    x.favorito = !x.favorito;
    localStorage.setItem(STORAGE, JSON.stringify(d));
    renderizar();
    return;
  }

  if (e.target.closest(".editar")) {
    abrirEdicao(x.id);
    return;
  }

  if (e.target.closest(".excluir")) {
    if (confirm("Excluir dorama?")) {
      d = d.filter(v => v.id != x.id);
      localStorage.setItem(STORAGE, JSON.stringify(d));
      renderizar();
    }
    return;
  }

  if (e.target.closest("button") || e.target.closest("a")) return;

  abrirDetalhes(c);
});

btnFavoritos.onclick = () => {
  modoFavoritos = !modoFavoritos;
  renderizar();
};

buscaTexto.oninput =
  filtroCategoria.onchange =
  ordenarPor.onchange =
    renderizar;

/* ================= MODAIS ================= */

function abrirCadastro() {
  editId = null;
  tituloModal.innerText = "Novo Dorama";
  document.querySelectorAll("#modalCadastro input, textarea").forEach(i => {
    if (i.type !== "file") i.value = "";
  });
  statusInput.value = "Planejo assistir";
  imagemTemp = null;
  imagemFileInput.value = "";
  modalCadastro.style.display = "flex";
}

function abrirEdicao(id) {
  editId = id;
  const x = JSON.parse(localStorage.getItem(STORAGE)).find(d => d.id === id);

  tituloModal.innerText = "Editar Dorama";
  Object.assign(window, {
    tituloInput: tituloInput,
    anoInput,
    temporadasInput,
    tipoQtdInput,
    qtdInput,
    categoriaInput,
    descricaoInput,
    linkInput,
    trailerInput,
    imagemUrlInput,
    statusInput
  });

  tituloInput.value = x.titulo;
  anoInput.value = x.ano;
  temporadasInput.value = x.temporadas;
  tipoQtdInput.value = x.tipo;
  qtdInput.value = x.qtd;
  categoriaInput.value = x.categoria;
  descricaoInput.value = x.descricao;
  linkInput.value = x.link;
  trailerInput.value = x.trailer;
  imagemUrlInput.value = x.imagem;
  statusInput.value = x.status;

  imagemTemp = null;
  imagemFileInput.value = "";
  modalCadastro.style.display = "flex";
}

function salvarDorama() {
  let d = JSON.parse(localStorage.getItem(STORAGE));
  let fav = false,
    av = 0;

  if (editId) {
    const o = d.find(x => x.id == editId);
    fav = o.favorito;
    av = o.avaliacao;
    d = d.filter(x => x.id != editId);
  }

  d.push({
    id: editId || Date.now(),
    titulo: tituloInput.value,
    ano: +anoInput.value,
    temporadas: +temporadasInput.value || 1,
    tipo: tipoQtdInput.value,
    qtd: +qtdInput.value || 0,
    categoria: categoriaInput.value,
    descricao: descricaoInput.value,
    link: linkInput.value,
    trailer: trailerInput.value,
    imagem:
      imagemTemp ||
      imagemUrlInput.value ||
      "https://via.placeholder.com/400x600",
    favorito: fav,
    status: statusInput.value,
    avaliacao: av
  });

  localStorage.setItem(STORAGE, JSON.stringify(d));
  editId = null;
  fecharModal();
  renderizar();
}

/* ================= DETALHES ================= */

function abrirDetalhes(c) {
  detalheAtual = JSON.parse(localStorage.getItem(STORAGE)).find(
    x => x.id == c.dataset.id
  );

  detalheImagem.src = detalheAtual.imagem;
  detalheTitulo.innerText = detalheAtual.titulo;
  detalheMeta.innerText = `📅 ${detalheAtual.ano || "—"} • 📂 ${detalheAtual.categoria}`;

  detalheInfo.innerHTML = `
    📺 <b>Status:</b> ${detalheAtual.status}
    / <b>Temporadas:</b> ${detalheAtual.temporadas || 1}
    / 📊 <b>${detalheAtual.tipo}:</b> ${detalheAtual.qtd || 0}
  `;

  detalheDescricao.innerText = detalheAtual.descricao || "Sem descrição.";
  detalheDescricao.classList.add("descricao-curta");
  descricaoExpandida = false;

  btnLerMais.style.display =
    detalheAtual.descricao && detalheAtual.descricao.length > 100
      ? "inline"
      : "none";

  detalheLink.href = detalheAtual.link || "#";
  detalheLink.style.display = detalheAtual.link ? "inline-block" : "none";

  modalDetalhes.style.display = "flex";
  renderizarEstrelas();
}

/* ================= AVALIAÇÃO ================= */

function renderizarEstrelas() {
  avaliacaoEstrelas.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("span");
    s.className = "estrela" + (i <= detalheAtual.avaliacao ? " ativa" : "");
    s.innerText = "★";
    s.onclick = () => {
      detalheAtual.avaliacao = i;
      const d = JSON.parse(localStorage.getItem(STORAGE));
      d.find(x => x.id == detalheAtual.id).avaliacao = i;
      localStorage.setItem(STORAGE, JSON.stringify(d));
      renderizar();
      renderizarEstrelas();
    };
    avaliacaoEstrelas.appendChild(s);
  }
}

/* ================= FECHAR ================= */

function fecharModal() {
  modalCadastro.style.display = "none";
}
function fecharDetalhes() {
  modalDetalhes.style.display = "none";
}
function abrirTrailer() {
  if (!detalheAtual.trailer) return alert("Trailer não disponível");
  iframeTrailer.src = converterYoutube(detalheAtual.trailer);
  modalTrailer.style.display = "flex";
}
function fecharTrailer() {
  modalTrailer.style.display = "none";
  iframeTrailer.src = "";
}

function toggleDescricao() {
  descricaoExpandida = !descricaoExpandida;
  detalheDescricao.classList.toggle("descricao-curta", !descricaoExpandida);
  btnLerMais.innerText = descricaoExpandida ? "Ler menos" : "Ler mais";
}

renderizar();
