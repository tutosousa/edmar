(() => {
  const app = document.getElementById("app");
  const ui = { notice: null, filters: { cursos: {}, concursos: {}, materiais: {} }, lastPath: null };
  const PRIVATE = ["materiais/", "simulados", "progresso", "favoritos", "suporte"];
  const ADMIN_LINKS = [
    ["admin", "Painel"],
    ["admin/cursos", "Cursos"],
    ["admin/concursos", "Concursos"],
    ["admin/materiais", "Materiais"],
    ["admin/simulados", "Simulados"],
    ["admin/usuarios", "Usuários"],
    ["admin/relatorios", "Relatórios"],
    ["admin/auditoria", "Auditoria"],
    ["admin/suporte", "Suporte"]
  ];
  const STATUS_LABEL = { publicado: "Publicado", rascunho: "Rascunho" };
  const KIND_PATH = { curso: "cursos", concurso: "concursos", material: "materiais", simulado: "simulados" };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function br(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function money(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function flash(type, text) {
    ui.notice = { type, text };
  }

  function go(hash) {
    if (location.hash === hash) return route();
    location.hash = hash;
  }

  function takeNotice() {
    if (!ui.notice) return "";
    const { type, text } = ui.notice;
    ui.notice = null;
    return `<div class="notice ${type}" role="${type === "error" ? "alert" : "status"}">${esc(text)}</div>`;
  }

  function showError(text) {
    const target = app.querySelector(".admin-main, .main");
    if (!target) return;
    const old = target.querySelector(".notice");
    if (old) old.remove();
    target.insertAdjacentHTML("afterbegin", `<div class="notice error" role="alert">${esc(text)}</div>`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bar(value) {
    return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span style="width:${value}%"></span></div>`;
  }

  function selectOptions(options, selected, labels = {}, withAll = false) {
    const list = withAll ? ["Todas", ...options] : options;
    return list.map((item) => `<option value="${esc(item)}" ${item === selected ? "selected" : ""}>${esc(labels[item] || item)}</option>`).join("");
  }

  function empty(message) {
    return `<div class="empty"><p>${esc(message)}</p></div>`;
  }

  function pageHead(title, description, actions = "") {
    return `<div class="page-head row-head"><div><h1>${esc(title)}</h1>${description ? `<p class="muted">${esc(description)}</p>` : ""}</div>${actions}</div>`;
  }

  function filterForm(scope, placeholder) {
    const current = ui.filters[scope] || {};
    return `<form class="filter-form" data-scope="${scope}">
      <input type="search" name="q" value="${esc(current.q || "")}" placeholder="${esc(placeholder)}" aria-label="Pesquisar">
      <select name="categoria" aria-label="Categoria">${selectOptions(CC.CATEGORIES, current.categoria || "Todas", {}, true)}</select>
      <button class="btn btn-primary" type="submit">Filtrar</button>
    </form>`;
  }

  function header(user) {
    const isAdmin = user && user.role === "admin";
    const links = isAdmin
      ? ""
      : [["cursos", "Cursos"], ["concursos", "Concursos"], ["materiais", "Materiais"], ["simulados", "Simulados"], ["progresso", "Meu progresso"], ["favoritos", "Favoritos"], ["suporte", "Suporte"]]
          .map(([href, label]) => `<a href="#/${href}">${label}</a>`)
          .join("");
    const account = user
      ? `<span class="who">Olá, ${esc(user.nome.split(" ")[0])}${isAdmin ? " (equipe)" : ""}</span><button class="btn btn-ghost btn-sm" data-action="logout">Sair</button>`
      : `<a class="btn btn-ghost btn-sm" href="#/entrar">Entrar</a><a class="btn btn-accent btn-sm" href="#/cadastro">Criar conta</a>`;
    return `<header class="topbar">
      <div class="topbar-inner">
        <a href="#/" class="brand"><span class="brand-mark">CC</span><span>Cursos e Concursos</span></a>
        <nav class="menu" aria-label="Principal">${links}</nav>
        <div class="account">${account}</div>
      </div>
    </header>`;
  }

  function footer() {
    return `<footer class="footer">
      <p>CC — Cursos e Concursos · Projeto de demonstração, com dados fictícios.</p>
      <p class="small">Contas de teste: aluno@cc.demo / Aluno2026! · admin@cc.demo / Admin2026!</p>
    </footer>`;
  }

  function favoriteLabel(tipo, id) {
    const user = CC.currentUser();
    if (!user) return "Entre para salvar";
    return CC.isFavorite(user.id, tipo, id) ? "Remover dos favoritos" : "Salvar nos favoritos";
  }

  function courseCard(item) {
    return `<article class="card">
      <span class="tag">${esc(item.categoria)}</span>
      <h3><a href="#/cursos/${item.id}">${esc(item.titulo)}</a></h3>
      <p class="muted">${esc(item.descricao)}</p>
      <p class="small muted">${esc(item.modalidade)} · ${item.aulas} aulas</p>
      <a class="btn btn-secondary btn-sm" href="#/cursos/${item.id}">Ver curso</a>
    </article>`;
  }

  function contestCard(item) {
    const situation = CC.situacao(item);
    const badge = situation === "Inscrições abertas" ? "badge-open" : situation === "Em breve" ? "badge-soon" : "badge-closed";
    return `<article class="card">
      <span class="badge ${badge}">${esc(situation)}</span>
      <h3>${esc(item.nome)}</h3>
      <p class="muted">${esc(item.orgao)} · ${esc(item.cargo)}</p>
      <ul class="facts">
        <li><span>Vagas</span><strong>${item.vagas}</strong></li>
        <li><span>Remuneração</span><strong>${money(item.remuneracao)}</strong></li>
        <li><span>Inscrições</span><strong>${br(item.inicio)} a ${br(item.fim)}</strong></li>
      </ul>
      <button class="btn btn-secondary btn-sm" data-action="fav" data-tipo="concurso" data-id="${item.id}">${favoriteLabel("concurso", item.id)}</button>
    </article>`;
  }

  function home() {
    const openContests = CC.contests().filter((item) => CC.situacao(item) === "Inscrições abertas").length;
    return `
      <section class="hero">
        <div class="hero-inner">
          <p class="eyebrow">Cursos, concursos e materiais</p>
          <h1>Estude com organização, em um só lugar</h1>
          <p class="lead">Encontre cursos e concursos públicos, acompanhe seu progresso e pratique com simulados corrigidos automaticamente.</p>
          <div class="hero-actions">
            <a class="btn btn-accent" href="#/cursos">Ver cursos</a>
            <a class="btn btn-ghost-light" href="#/concursos">Ver concursos</a>
          </div>
        </div>
      </section>
      <section class="stats container">
        <div><strong>${CC.courses().length}</strong><span>cursos disponíveis</span></div>
        <div><strong>${openContests}</strong><span>concursos com inscrições abertas</span></div>
        <div><strong>${CC.materials().length}</strong><span>materiais de estudo</span></div>
        <div><strong>${CC.quizzes().length}</strong><span>simulados</span></div>
      </section>
      <section class="section container">
        <h2>Como funciona</h2>
        <ol class="steps">
          <li><h3>Crie sua conta</h3><p class="muted">Cadastro simples, com seus dados protegidos.</p></li>
          <li><h3>Escolha cursos e materiais</h3><p class="muted">Faça a matrícula e salve o que for útil.</p></li>
          <li><h3>Pratique e acompanhe</h3><p class="muted">Responda simulados e veja seu desempenho.</p></li>
        </ol>
      </section>
      <section class="section section-alt">
        <div class="container">
          <h2>Cursos em destaque</h2>
          <div class="grid">${CC.courses().slice(0, 3).map(courseCard).join("")}</div>
          <h2 class="gap-top">Concursos</h2>
          <div class="grid">${CC.contests().slice(0, 3).map(contestCard).join("")}</div>
        </div>
      </section>`;
  }

  function coursesPage() {
    const filter = ui.filters.cursos;
    const list = CC.courses(filter.q, filter.categoria);
    return `${pageHead("Cursos", "Cursos disponíveis para matrícula.")}
      ${filterForm("cursos", "Buscar por título ou descrição")}
      ${list.length ? `<div class="grid">${list.map(courseCard).join("")}</div>` : empty("Nenhum curso encontrado para esta busca.")}`;
  }

  function courseDetail(id, user) {
    const item = CC.course(id);
    if (!item || item.status !== "publicado" || !item.ativo) return empty("Este curso não está disponível.");
    const enrolled = user ? CC.enrollment(user.id, id) : null;
    const materials = CC.materials().filter((material) => material.cursoId === id);
    const lessons = Array.from({ length: item.aulas }, (_, index) => index + 1);
    const progress = user ? CC.progress(user.id, id) : 0;
    let action = `<a class="btn btn-primary" href="#/entrar">Entre para se matricular</a>`;
    if (user && !enrolled) action = `<button class="btn btn-primary" data-action="enroll" data-id="${id}">Fazer matrícula</button>`;
    if (user && enrolled) action = `<p class="notice success">Você está matriculada neste curso.</p>`;
    const lessonList = enrolled
      ? `<h2>Aulas</h2><ul class="lessons">${lessons
          .map((number) => {
            const done = enrolled.aulas.includes(number);
            return `<li><span>Aula ${number}</span><button class="btn btn-sm ${done ? "btn-accent" : "btn-secondary"}" data-action="lesson" data-id="${id}" data-n="${number}">${done ? "Concluída" : "Marcar como concluída"}</button></li>`;
          })
          .join("")}</ul>`
      : "";
    return `
      <a class="back" href="#/cursos">← Voltar aos cursos</a>
      <article class="detail">
        <span class="tag">${esc(item.categoria)}</span>
        <h1>${esc(item.titulo)}</h1>
        <p class="lead">${esc(item.descricao)}</p>
        <ul class="facts">
          <li><span>Modalidade</span><strong>${esc(item.modalidade)}</strong></li>
          <li><span>Aulas</span><strong>${item.aulas}</strong></li>
          <li><span>Requisitos</span><strong>${esc(item.requisitos || "Nenhum.")}</strong></li>
        </ul>
        ${user ? `<div class="progress-block"><p>Seu progresso: <strong>${progress}%</strong></p>${bar(progress)}</div>` : ""}
        <div class="actions">${action}</div>
        ${lessonList}
        ${materials.length ? `<h2>Materiais do curso</h2><ul class="plain">${materials.map((material) => `<li><a href="#/materiais/${material.id}">${esc(material.titulo)}</a></li>`).join("")}</ul>` : ""}
      </article>`;
  }

  function contestsPage() {
    const filter = ui.filters.concursos;
    const list = CC.contests(filter.q, filter.categoria);
    return `${pageHead("Concursos", "Informações de editais, prazos e vagas. Confirme sempre no edital oficial do órgão.")}
      ${filterForm("concursos", "Buscar por nome, órgão ou cargo")}
      ${list.length ? `<div class="grid">${list.map(contestCard).join("")}</div>` : empty("Nenhum concurso encontrado para esta busca.")}
      <p class="note small muted">Notas de corte ainda não divulgadas oficialmente não são exibidas nesta página.</p>`;
  }

  function materialsPage(user) {
    const filter = ui.filters.materiais;
    const list = CC.materials(filter.q, filter.categoria);
    return `${pageHead("Materiais de estudo", user ? "Abra os materiais para ler o conteúdo." : "Entre na sua conta para abrir os materiais.")}
      ${filterForm("materiais", "Buscar por título ou disciplina")}
      ${list.length ? `<div class="grid">${list.map((item) => `<article class="card">
        <span class="tag">${esc(item.disciplina)}</span>
        <h3>${esc(item.titulo)}</h3>
        <a class="btn btn-secondary btn-sm" href="#/materiais/${item.id}">${user ? "Abrir material" : "Entrar para abrir"}</a>
      </article>`).join("")}</div>` : empty("Nenhum material encontrado para esta busca.")}`;
  }

  function materialDetail(id, user) {
    const item = CC.material(id);
    if (!item || item.status !== "publicado" || !item.ativo) return empty("Este material não está disponível.");
    const favorite = CC.isFavorite(user.id, "material", id);
    const paragraphs = item.conteudo.split("\n\n").map((text) => `<p>${esc(text)}</p>`).join("");
    return `
      <a class="back" href="#/materiais">← Voltar aos materiais</a>
      <article class="detail">
        <span class="tag">${esc(item.disciplina)}</span>
        <h1>${esc(item.titulo)}</h1>
        <div class="material-body">${paragraphs}</div>
        <div class="actions"><button class="btn ${favorite ? "btn-accent" : "btn-secondary"}" data-action="fav" data-tipo="material" data-id="${id}">${favorite ? "Remover dos favoritos" : "Salvar nos favoritos"}</button></div>
      </article>`;
  }

  function quizzesPage(user) {
    const attempts = CC.attempts(user.id);
    return `${pageHead("Simulados", "Responda as questões e veja a correção na hora.")}
      <div class="grid">${CC.quizzes()
        .map((item) => {
          const last = attempts.find((attempt) => attempt.quizId === item.id);
          return `<article class="card">
            <span class="tag">${esc(item.categoria)}</span>
            <h3>${esc(item.titulo)}</h3>
            <p class="muted">${item.questoes.length} questões${last ? ` · última nota: ${last.percentual}%` : ""}</p>
            <a class="btn btn-primary btn-sm" href="#/simulados/${item.id}">Fazer simulado</a>
          </article>`;
        })
        .join("")}</div>`;
  }

  function quizDetail(id) {
    const item = CC.quiz(id);
    if (!item || item.status !== "publicado" || !item.ativo) return empty("Este simulado não está disponível.");
    const questions = item.questoes
      .map((question, index) => `<fieldset class="question">
        <legend>${index + 1}. ${esc(question.enunciado)}</legend>
        ${question.alternativas
          .map((alternative, option) => `<label class="option"><input type="radio" name="q${index}" value="${option}"> <span>${esc(alternative)}</span></label>`)
          .join("")}
      </fieldset>`)
      .join("");
    return `
      <a class="back" href="#/simulados">← Voltar aos simulados</a>
      ${pageHead(item.titulo, `${item.questoes.length} questões de múltipla escolha.`)}
      <form id="quiz-form" class="quiz" data-id="${id}" novalidate>
        ${questions}
        <button class="btn btn-primary" type="submit">Enviar respostas</button>
      </form>`;
  }

  function resultsPage(user) {
    const attempts = CC.attempts(user.id);
    if (!attempts.length) return `${pageHead("Resultados", "Seus simulados aparecem aqui.")}${empty("Você ainda não respondeu nenhum simulado.")}`;
    return `${pageHead("Resultados", "Histórico de simulados respondidos.")}
      <div class="table-wrap"><table>
        <thead><tr><th>Simulado</th><th>Data</th><th>Acertos</th><th>Desempenho</th></tr></thead>
        <tbody>${attempts
          .map((attempt) => {
            const quiz = CC.quiz(attempt.quizId);
            return `<tr><td>${esc(quiz ? quiz.titulo : "Simulado removido")}</td><td>${br(attempt.criadoEm)}</td><td>${attempt.acertos} de ${attempt.total}</td><td>${bar(attempt.percentual)} <span class="small">${attempt.percentual}%</span></td></tr>`;
          })
          .join("")}</tbody>
      </table></div>`;
  }

  function progressPage(user) {
    const entries = CC.enrolledCourses(user.id);
    const head = pageHead("Meu progresso", "Acompanhe as aulas dos cursos em que você está matriculada.");
    if (!entries.length) return `${head}${empty("Você ainda não está matriculada em nenhum curso.")}<p><a class="btn btn-primary" href="#/cursos">Ver cursos</a></p>`;
    return `${head}
      <div class="grid">${entries
        .map((entry) => {
          const item = CC.course(entry.courseId);
          const value = CC.progress(user.id, entry.courseId);
          return `<article class="card">
            <h3><a href="#/cursos/${item.id}">${esc(item.titulo)}</a></h3>
            <p class="muted">${entry.aulas.length} de ${item.aulas} aulas concluídas</p>
            ${bar(value)}
            <p class="small"><strong>${value}%</strong></p>
          </article>`;
        })
        .join("")}</div>`;
  }

  function favoritesPage(user) {
    const list = CC.favorites(user.id);
    if (!list.length) return `${pageHead("Favoritos", "Itens que você salvou para depois.")}${empty("Nenhum favorito salvo ainda.")}`;
    return `${pageHead("Favoritos", "Itens que você salvou para depois.")}
      <div class="grid">${list
        .map(({ tipo, item }) => {
          const title = item.titulo || item.nome;
          const link = tipo === "curso" ? `#/cursos/${item.id}` : tipo === "material" ? `#/materiais/${item.id}` : "#/concursos";
          return `<article class="card">
            <span class="tag">${esc(tipo)}</span>
            <h3><a href="${link}">${esc(title)}</a></h3>
            <button class="btn btn-ghost btn-sm" data-action="fav" data-tipo="${tipo}" data-id="${item.id}">Remover</button>
          </article>`;
        })
        .join("")}</div>`;
  }

  function supportPage(user) {
    const list = CC.tickets(user.id);
    return `${pageHead("Suporte", "Envie sua dúvida. A equipe responde por aqui.")}
      <div class="two-col">
        <form id="ticket-form" class="form card" novalidate>
          <h2>Nova solicitação</h2>
          <div class="field"><label for="t-assunto">Assunto</label><input id="t-assunto" name="assunto" required></div>
          <div class="field"><label for="t-mensagem">Mensagem</label><textarea id="t-mensagem" name="mensagem" rows="5" required></textarea></div>
          <button class="btn btn-primary" type="submit">Enviar</button>
        </form>
        <section>
          <h2>Minhas solicitações</h2>
          ${list.length ? `<ul class="tickets">${list.map(ticketItem).join("")}</ul>` : empty("Você ainda não enviou solicitações.")}
        </section>
      </div>`;
  }

  function ticketItem(ticket) {
    return `<li class="card">
      <div class="row"><strong>${esc(ticket.assunto)}</strong><span class="badge ${ticket.status === "respondido" ? "badge-open" : "badge-soon"}">${ticket.status === "respondido" ? "Respondido" : "Aberto"}</span></div>
      <p class="muted small">${br(ticket.criadoEm)}</p>
      <p>${esc(ticket.mensagem)}</p>
      ${ticket.resposta ? `<p class="reply"><strong>Resposta:</strong> ${esc(ticket.resposta)}</p>` : ""}
    </li>`;
  }

  function aboutPage() {
    return `${pageHead("Sobre a plataforma", "Um lugar para reunir cursos, concursos e materiais de estudo.")}
      <div class="grid">
        <article class="card"><h3>Para estudantes</h3><p class="muted">Busque cursos, faça matrícula, acompanhe o progresso e responda simulados.</p></article>
        <article class="card"><h3>Para a equipe</h3><p class="muted">Publique cursos, concursos e materiais, e responda às dúvidas dos alunos.</p></article>
        <article class="card"><h3>Dados protegidos</h3><p class="muted">Senhas são guardadas apenas como resumo criptográfico, e o acesso a áreas restritas exige login.</p></article>
      </div>`;
  }

  function loginPage() {
    return `<section class="auth">
      <div class="auth-card">
        <h1>Entrar</h1>
        <p class="muted small">Use uma das contas de teste exibidas no rodapé, ou crie a sua.</p>
        ${takeNotice()}
        <form id="login-form" class="form" novalidate>
          <div class="field"><label for="l-email">E-mail</label><input id="l-email" name="email" type="email" autocomplete="username" required></div>
          <div class="field"><label for="l-senha">Senha</label><input id="l-senha" name="senha" type="password" autocomplete="current-password" required></div>
          <div class="form-message" id="login-message" role="alert"></div>
          <button class="btn btn-primary btn-block" type="submit">Entrar</button>
        </form>
        <p class="small">Ainda não tem conta? <a href="#/cadastro">Criar conta</a></p>
      </div>
    </section>`;
  }

  function registerPage() {
    return `<section class="auth">
      <div class="auth-card">
        <h1>Criar conta</h1>
        <p class="muted small">A senha precisa ter 8 caracteres, com letras e números.</p>
        ${takeNotice()}
        <form id="register-form" class="form" novalidate>
          <div class="field"><label for="r-nome">Nome completo</label><input id="r-nome" name="nome" autocomplete="name" required></div>
          <div class="field"><label for="r-email">E-mail</label><input id="r-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="r-senha">Senha</label><input id="r-senha" name="senha" type="password" autocomplete="new-password" required></div>
          <label class="check"><input type="checkbox" name="consentimento" required> Aceito a política de privacidade e o uso dos meus dados para a plataforma.</label>
          <div class="form-message" id="register-message" role="alert"></div>
          <button class="btn btn-accent btn-block" type="submit">Criar conta</button>
        </form>
        <p class="small">Já tem conta? <a href="#/entrar">Entrar</a></p>
      </div>
    </section>`;
  }

  function fieldInput(name, label, value = "", type = "text", required = true) {
    return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value ?? "")}" ${required ? "required" : ""}></div>`;
  }

  function fieldArea(name, label, value = "", rows = 3, hint = "") {
    return `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" rows="${rows}" required>${esc(value ?? "")}</textarea>${hint ? `<p class="hint">${esc(hint)}</p>` : ""}</div>`;
  }

  function fieldSelect(name, label, options, selected, labels = {}) {
    return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${selectOptions(options, selected, labels)}</select></div>`;
  }

  function formActions(label, editing, backHref) {
    return `<div class="form-actions"><button class="btn btn-primary" type="submit">${editing ? "Salvar alterações" : label}</button>${editing ? `<a class="btn btn-ghost" href="${backHref}">Cancelar edição</a>` : ""}</div>`;
  }

  function rowActions(kind, id, visible) {
    const path = KIND_PATH[kind];
    return `<div class="row-actions">
      <a class="btn btn-ghost btn-sm" href="#/admin/${path}/${id}">Editar</a>
      <button class="btn btn-ghost btn-sm" data-action="toggle" data-kind="${kind}" data-id="${id}">${visible ? "Ocultar" : "Mostrar"}</button>
      <button class="btn btn-danger btn-sm" data-action="delete" data-kind="${kind}" data-id="${id}">Excluir</button>
    </div>`;
  }

  function adminHome() {
    const r = CC.reports();
    const recent = CC.auditLog().slice(0, 5);
    return `${pageHead("Painel administrativo", "Visão geral da plataforma e atalhos de gestão.")}
      <div class="kpis">
        <div class="kpi"><span>Alunos</span><strong>${r.alunos}</strong></div>
        <div class="kpi"><span>Cursos publicados</span><strong>${r.cursosPublicados}</strong></div>
        <div class="kpi"><span>Concursos com inscrições abertas</span><strong>${r.concursosAbertos}</strong></div>
        <div class="kpi"><span>Matrículas</span><strong>${r.matriculas}</strong></div>
        <div class="kpi"><span>Simulados respondidos</span><strong>${r.tentativas}</strong></div>
        <div class="kpi"><span>Solicitações abertas</span><strong>${r.ticketsAbertos}</strong></div>
      </div>
      <h2>Últimas ações</h2>
      ${recent.length ? auditTable(recent) : empty("Nenhuma ação registrada ainda.")}`;
  }

  function adminCourses(id) {
    const item = id ? CC.course(id) : null;
    if (id && !item) return empty("Curso não encontrado.");
    const form = `<form id="admin-form" class="card form" data-kind="curso" novalidate>
      <input type="hidden" name="id" value="${esc(item?.id || "")}">
      ${fieldInput("titulo", "Título", item?.titulo)}
      ${fieldArea("descricao", "Descrição", item?.descricao, 3)}
      ${fieldSelect("categoria", "Categoria", CC.CATEGORIES, item?.categoria || CC.CATEGORIES[0])}
      ${fieldSelect("modalidade", "Modalidade", CC.MODALITIES, item?.modalidade || CC.MODALITIES[0])}
      ${fieldInput("aulas", "Número de aulas", item?.aulas ?? "", "number")}
      ${fieldSelect("status", "Situação", CC.STATUSES, item?.status || "rascunho", STATUS_LABEL)}
      ${formActions("Cadastrar curso", item, "#/admin/cursos")}
    </form>`;
    const rows = CC.db.courses
      .map((c) => `<tr><td>${esc(c.titulo)}</td><td>${esc(c.categoria)}</td><td>${STATUS_LABEL[c.status]}</td><td>${c.ativo ? "Sim" : "Não"}</td><td>${rowActions("curso", c.id, c.ativo)}</td></tr>`)
      .join("");
    return `${pageHead("Cursos", "Cadastre, edite e publique cursos. Só cursos publicados e visíveis aparecem para os alunos.")}
      <div class="two-col">${form}<div class="table-wrap"><table>
        <thead><tr><th>Título</th><th>Categoria</th><th>Situação</th><th>Visível</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>`;
  }

  function adminContests(id) {
    const item = id ? CC.contest(id) : null;
    if (id && !item) return empty("Concurso não encontrado.");
    const form = `<form id="admin-form" class="card form" data-kind="concurso" novalidate>
      <input type="hidden" name="id" value="${esc(item?.id || "")}">
      ${fieldInput("nome", "Nome do concurso", item?.nome)}
      ${fieldInput("orgao", "Órgão responsável", item?.orgao)}
      ${fieldInput("cargo", "Cargo", item?.cargo)}
      ${fieldSelect("categoria", "Categoria", CC.CATEGORIES, item?.categoria || CC.CATEGORIES[0])}
      ${fieldInput("vagas", "Vagas", item?.vagas ?? "", "number")}
      ${fieldInput("remuneracao", "Remuneração (R$)", item?.remuneracao ?? "", "number")}
      ${fieldInput("inicio", "Início das inscrições", item?.inicio || "", "date")}
      ${fieldInput("fim", "Fim das inscrições", item?.fim || "", "date")}
      ${fieldInput("prova", "Data da prova", item?.prova || "", "date")}
      ${fieldSelect("status", "Situação", CC.STATUSES, item?.status || "rascunho", STATUS_LABEL)}
      ${formActions("Cadastrar concurso", item, "#/admin/concursos")}
    </form>`;
    const rows = CC.db.contests
      .map((c) => `<tr><td>${esc(c.nome)}</td><td>${esc(c.orgao)}</td><td>${br(c.inicio)} a ${br(c.fim)}</td><td>${STATUS_LABEL[c.status]}</td><td>${rowActions("concurso", c.id, c.ativo)}</td></tr>`)
      .join("");
    return `${pageHead("Concursos", "As notas de corte não são cadastradas aqui: só são exibidas quando divulgadas oficialmente.")}
      <div class="two-col">${form}<div class="table-wrap"><table>
        <thead><tr><th>Nome</th><th>Órgão</th><th>Inscrições</th><th>Situação</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>`;
  }

  function adminMaterials(id) {
    const item = id ? CC.material(id) : null;
    if (id && !item) return empty("Material não encontrado.");
    const courseOptions = `<option value="">Sem curso</option>${CC.db.courses
      .map((c) => `<option value="${c.id}" ${c.id === item?.cursoId ? "selected" : ""}>${esc(c.titulo)}</option>`)
      .join("")}`;
    const form = `<form id="admin-form" class="card form" data-kind="material" novalidate>
      <input type="hidden" name="id" value="${esc(item?.id || "")}">
      ${fieldInput("titulo", "Título", item?.titulo)}
      ${fieldInput("disciplina", "Disciplina", item?.disciplina)}
      ${fieldSelect("categoria", "Categoria", CC.CATEGORIES, item?.categoria || CC.CATEGORIES[0])}
      ${fieldSelect("tipo", "Tipo", ["PDF", "Resumo", "Apostila"], item?.tipo || "PDF")}
      <div class="field"><label for="f-cursoId">Curso vinculado</label><select id="f-cursoId" name="cursoId">${courseOptions}</select></div>
      ${fieldArea("conteudo", "Conteúdo", item?.conteudo, 6, "Separe parágrafos com uma linha em branco.")}
      ${fieldSelect("status", "Situação", CC.STATUSES, item?.status || "rascunho", STATUS_LABEL)}
      ${formActions("Cadastrar material", item, "#/admin/materiais")}
    </form>`;
    const rows = CC.db.materials
      .map((m) => `<tr><td>${esc(m.titulo)}</td><td>${esc(m.disciplina)}</td><td>${STATUS_LABEL[m.status]}</td><td>${m.ativo ? "Sim" : "Não"}</td><td>${rowActions("material", m.id, m.ativo)}</td></tr>`)
      .join("");
    return `${pageHead("Materiais", "Só materiais publicados e visíveis podem ser abertos pelos alunos.")}
      <div class="two-col">${form}<div class="table-wrap"><table>
        <thead><tr><th>Título</th><th>Disciplina</th><th>Situação</th><th>Visível</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>`;
  }

  function adminQuizzes() {
    const form = `<form id="admin-form" class="card form" data-kind="simulado" novalidate>
      <input type="hidden" name="id" value="">
      ${fieldInput("titulo", "Título do simulado")}
      ${fieldSelect("categoria", "Categoria", CC.CATEGORIES, CC.CATEGORIES[0])}
      ${fieldSelect("status", "Situação", CC.STATUSES, "rascunho", STATUS_LABEL)}
      ${fieldArea("questoes", "Questões", "", 8, "Uma questão por linha: enunciado | alternativa A | B | C | D | número da correta (1 a 4).")}
      ${formActions("Cadastrar simulado", null, "")}
    </form>`;
    const rows = CC.db.quizzes
      .map((q) => `<tr><td>${esc(q.titulo)}</td><td>${q.questoes.length}</td><td>${STATUS_LABEL[q.status]}</td><td>${q.ativo ? "Sim" : "Não"}</td><td><button class="btn btn-ghost btn-sm" data-action="toggle" data-kind="simulado" data-id="${q.id}">${q.ativo ? "Ocultar" : "Mostrar"}</button></td></tr>`)
      .join("");
    return `${pageHead("Simulados", "Crie simulados com gabarito. A correção é feita automaticamente.")}
      <div class="two-col">${form}<div class="table-wrap"><table>
        <thead><tr><th>Título</th><th>Questões</th><th>Situação</th><th>Visível</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>`;
  }

  function adminUsers(user) {
    const rows = CC.users()
      .map((item) => {
        const self = item.id === user.id;
        const actions = self
          ? `<span class="muted small">Você</span>`
          : `<div class="row-actions">
              <button class="btn btn-ghost btn-sm" data-action="user-active" data-id="${item.id}">${item.ativo ? "Desativar" : "Reativar"}</button>
              <button class="btn btn-ghost btn-sm" data-action="user-role" data-id="${item.id}" data-role="${item.role === "admin" ? "user" : "admin"}">${item.role === "admin" ? "Tornar aluno" : "Tornar administrador"}</button>
            </div>`;
        return `<tr><td>${esc(item.nome)}</td><td>${esc(item.email)}</td><td>${item.role === "admin" ? "Administrador" : "Aluno"}</td><td>${item.ativo ? "Ativo" : "Desativado"}</td><td>${actions}</td></tr>`;
      })
      .join("");
    return `${pageHead("Usuários", "Gerencie o acesso. Você não pode alterar a própria conta.")}
      <div class="table-wrap"><table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
  }

  function adminReports() {
    const r = CC.reports();
    return `${pageHead("Relatórios", "Indicadores calculados a partir dos dados registrados.")}
      <div class="kpis">
        <div class="kpi"><span>Alunos</span><strong>${r.alunos}</strong></div>
        <div class="kpi"><span>Alunos ativos</span><strong>${r.alunosAtivos}</strong></div>
        <div class="kpi"><span>Matrículas</span><strong>${r.matriculas}</strong></div>
        <div class="kpi"><span>Média nos simulados</span><strong>${r.mediaSimulados}%</strong></div>
      </div>
      <h2>Desempenho por simulado</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Simulado</th><th>Tentativas</th><th>Média</th></tr></thead>
        <tbody>${r.porSimulado.map((item) => `<tr><td>${esc(item.titulo)}</td><td>${item.tentativas}</td><td>${item.media}%</td></tr>`).join("")}</tbody>
      </table></div>`;
  }

  function auditTable(list) {
    return `<div class="table-wrap"><table>
      <thead><tr><th>Data</th><th>Responsável</th><th>Ação</th><th>Alvo</th></tr></thead>
      <tbody>${list
        .map((entry) => `<tr><td>${br(entry.criadoEm)}</td><td>${esc(CC.userName(entry.adminId))}</td><td>${esc(entry.acao)}</td><td>${esc(entry.alvo)}</td></tr>`)
        .join("")}</tbody>
    </table></div>`;
  }

  function adminAudit() {
    const list = CC.auditLog();
    return `${pageHead("Auditoria", "Registro das ações administrativas feitas na plataforma.")}
      ${list.length ? auditTable(list) : empty("Nenhuma ação registrada ainda.")}`;
  }

  function adminSupport() {
    const list = CC.allTickets();
    return `${pageHead("Suporte", "Responda às solicitações dos alunos.")}
      ${list.length ? `<ul class="tickets">${list
        .map((ticket) => `<li class="card">
          <div class="row"><strong>${esc(ticket.assunto)}</strong><span class="badge ${ticket.status === "respondido" ? "badge-open" : "badge-soon"}">${ticket.status === "respondido" ? "Respondido" : "Aberto"}</span></div>
          <p class="muted small">${esc(CC.userName(ticket.userId))} · ${br(ticket.criadoEm)}</p>
          <p>${esc(ticket.mensagem)}</p>
          ${ticket.resposta ? `<p class="reply"><strong>Resposta:</strong> ${esc(ticket.resposta)}</p>` : ""}
          <form class="answer-form" data-id="${ticket.id}" novalidate>
            <div class="field"><label for="a-${ticket.id}">Responder</label><textarea id="a-${ticket.id}" name="resposta" rows="2" required></textarea></div>
            <button class="btn btn-primary btn-sm" type="submit">Enviar resposta</button>
          </form>
        </li>`)
        .join("")}</ul>` : empty("Nenhuma solicitação recebida.")}`;
  }

  function adminPage(user, parts) {
    const [section = "", id = ""] = parts;
    if (section === "cursos") return adminCourses(id);
    if (section === "concursos") return adminContests(id);
    if (section === "materiais") return adminMaterials(id);
    if (section === "simulados") return adminQuizzes();
    if (section === "usuarios") return adminUsers(user);
    if (section === "relatorios") return adminReports();
    if (section === "auditoria") return adminAudit();
    if (section === "suporte") return adminSupport();
    return adminHome();
  }

  function shellPublic(user, html) {
    return `${header(user)}<main class="main">${takeNotice()}${html}</main>${footer()}`;
  }

  function shellAdmin(user, html, path) {
    const side = ADMIN_LINKS.map(([href, label]) => `<a href="#/${href}" class="${path === href ? "active" : ""}">${label}</a>`).join("");
    return `${header(user)}<div class="admin-layout"><aside class="admin-side">${side}</aside><main class="admin-main">${takeNotice()}${html}</main></div>${footer()}`;
  }

  function route() {
    const user = CC.currentUser();
    const path = location.hash.replace(/^#\/?/, "");
    const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
    const [first = "", second = ""] = parts;

    if ((first === "entrar" || first === "cadastro") && user) return go("#/");

    if (first === "admin") {
      if (!user) return go("#/entrar");
      if (user.role !== "admin") {
        flash("error", "Esta área é restrita à equipe.");
        return go("#/");
      }
      const html = adminPage(user, parts.slice(1));
      return paint(shellAdmin(user, html, path), path);
    }

    const isPrivate = PRIVATE.some((item) => (item.endsWith("/") ? path.startsWith(item) : path === item || path.startsWith(`${item}/`)));
    if (isPrivate && !user) {
      flash("error", "Entre na sua conta para acessar esta página.");
      return go("#/entrar");
    }

    let html;
    if (!first) html = home();
    else if (first === "cursos") html = second ? courseDetail(second, user) : coursesPage();
    else if (first === "concursos") html = contestsPage();
    else if (first === "materiais") html = second ? materialDetail(second, user) : materialsPage(user);
    else if (first === "simulados") html = second ? quizDetail(second) : quizzesPage(user);
    else if (first === "resultados") html = resultsPage(user);
    else if (first === "progresso") html = progressPage(user);
    else if (first === "favoritos") html = favoritesPage(user);
    else if (first === "suporte") html = supportPage(user);
    else if (first === "sobre") html = aboutPage();
    else if (first === "entrar") html = loginPage();
    else if (first === "cadastro") html = registerPage();
    else html = home();

    paint(shellPublic(user, html), path);
  }

  function paint(html, path) {
    app.innerHTML = html;
    if (ui.lastPath !== path) {
      window.scrollTo(0, 0);
      ui.lastPath = path;
    }
  }

  function setMessage(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  async function handleLogin(form) {
    const data = new FormData(form);
    const user = await CC.login(data.get("email"), data.get("senha"));
    if (!user) return setMessage("login-message", "E-mail ou senha incorretos.");
    CC.startSession(user);
    flash("success", `Bem-vinda, ${user.nome.split(" ")[0]}.`);
    go(user.role === "admin" ? "#/admin" : "#/");
  }

  async function handleRegister(form) {
    const data = new FormData(form);
    try {
      const user = await CC.register({
        nome: data.get("nome"),
        email: data.get("email"),
        senha: data.get("senha"),
        consentimento: data.get("consentimento") === "on"
      });
      CC.startSession(user);
      flash("success", "Conta criada com sucesso.");
      go("#/");
    } catch (error) {
      setMessage("register-message", error.message);
    }
  }

  function attempt(task, success, next) {
    try {
      task();
      if (success) flash("success", success);
    } catch (error) {
      flash("error", error.message);
    }
    if (next) go(next);
    else route();
  }

  function handleQuiz(form) {
    const id = form.dataset.id;
    const quiz = CC.quiz(id);
    const user = CC.currentUser();
    const data = new FormData(form);
    const answers = quiz.questoes.map((_, index) => {
      const value = data.get(`q${index}`);
      return value === null ? null : Number(value);
    });
    attempt(() => {
      const result = CC.submitQuiz(user.id, id, answers);
      flash("success", `Você acertou ${result.acertos} de ${result.total} questões (${result.percentual}%).`);
    }, "", "#/resultados");
  }

  function handleAnswer(form) {
    const data = new FormData(form);
    const user = CC.currentUser();
    attempt(() => CC.answerTicket(user.id, form.dataset.id, data.get("resposta")), "Resposta enviada.", "#/admin/suporte");
  }

  function handleTicket(form) {
    const data = new FormData(form);
    const user = CC.currentUser();
    attempt(() => CC.openTicket(user.id, data.get("assunto"), data.get("mensagem")), "Solicitação enviada.", "#/suporte");
  }

  function handleAdminForm(form) {
    const user = CC.currentUser();
    const kind = form.dataset.kind;
    const input = Object.fromEntries(new FormData(form).entries());
    try {
      CC.saveItem(kind, user.id, input);
      flash("success", "Alterações salvas.");
      go(`#/admin/${KIND_PATH[kind]}`);
    } catch (error) {
      showError(error.message);
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const user = CC.currentUser();
    const id = target.dataset.id;
    if (action === "logout") {
      CC.endSession();
      flash("success", "Sessão encerrada.");
      return go("#/");
    }
    if (!user) return go("#/entrar");
    if (action === "enroll") return attempt(() => CC.enroll(user.id, id), "Matrícula realizada.", `#/cursos/${id}`);
    if (action === "lesson") return attempt(() => CC.toggleLesson(user.id, id, Number(target.dataset.n)), "", `#/cursos/${id}`);
    if (action === "fav") return attempt(() => CC.toggleFavorite(user.id, target.dataset.tipo, id), "", null);
    if (user.role !== "admin") return go("#/");
    if (action === "toggle") return attempt(() => CC.toggleVisibility(target.dataset.kind, user.id, id), "Visibilidade atualizada.", null);
    if (action === "delete") {
      if (!confirm("Excluir este item? Esta ação não pode ser desfeita.")) return;
      return attempt(() => CC.removeItem(target.dataset.kind, user.id, id), "Item excluído.", `#/admin/${KIND_PATH[target.dataset.kind]}`);
    }
    if (action === "user-active") return attempt(() => CC.setUserActive(user.id, id), "Situação do usuário atualizada.", null);
    if (action === "user-role") return attempt(() => CC.setUserRole(user.id, id, target.dataset.role), "Perfil atualizado.", null);
  });

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const formId = form.getAttribute("id");
    if (formId === "login-form") return handleLogin(form);
    if (formId === "register-form") return handleRegister(form);
    if (formId === "quiz-form") return handleQuiz(form);
    if (formId === "ticket-form") return handleTicket(form);
    if (formId === "admin-form") return handleAdminForm(form);
    if (form.classList.contains("answer-form")) return handleAnswer(form);
    if (form.classList.contains("filter-form")) {
      const data = new FormData(form);
      ui.filters[form.dataset.scope] = { q: data.get("q"), categoria: data.get("categoria") };
      return route();
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();
