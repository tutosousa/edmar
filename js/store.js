const CC = (() => {
  const KEY = "cc-exemplo-v2";
  const SESSION_KEY = "cc-sessao";
  const CATEGORIES = ["Concursos gerais", "Exatas", "Língua portuguesa", "Informática", "Direito", "Idiomas"];
  const MODALITIES = ["Online", "Presencial", "Híbrido"];
  const STATUSES = ["publicado", "rascunho"];
  const COLLECTIONS = { curso: "courses", concurso: "contests", material: "materials", simulado: "quizzes" };

  const seed = () => ({
    users: [
      { id: "u1", nome: "Administradora", email: "admin@cc.demo", role: "admin", ativo: true, salt: "k3v9a1", hash: "b420ee3d834042852e29407c3d97677f510c0a84cb52fd973828db5458526beb" },
      { id: "u2", nome: "Ana Lima", email: "aluno@cc.demo", role: "user", ativo: true, salt: "q8m2z5", hash: "bce41f55e6512fa112420f25e6b3369a728c0a41c4295e71318a91d327251103" }
    ],
    courses: [
      { id: "c1", titulo: "Matemática básica para concursos", descricao: "Porcentagem, frações e regra de três com exercícios resolvidos.", categoria: "Exatas", modalidade: "Online", aulas: 8, requisitos: "Ensino fundamental completo.", status: "publicado", ativo: true },
      { id: "c2", titulo: "Português para concursos", descricao: "Interpretação de texto, ortografia, concordância e regência.", categoria: "Língua portuguesa", modalidade: "Online", aulas: 10, requisitos: "Ensino médio completo.", status: "publicado", ativo: true },
      { id: "c3", titulo: "Informática essencial", descricao: "Sistema operacional, pacote de escritório, navegadores e segurança.", categoria: "Informática", modalidade: "Híbrido", aulas: 6, requisitos: "Nenhum.", status: "publicado", ativo: true },
      { id: "c4", titulo: "Direito administrativo", descricao: "Princípios da administração pública, atos administrativos e licitações.", categoria: "Direito", modalidade: "Online", aulas: 12, requisitos: "Ensino médio completo.", status: "publicado", ativo: true },
      { id: "c5", titulo: "Inglês instrumental", descricao: "Leitura de textos técnicos e vocabulário de editais.", categoria: "Idiomas", modalidade: "Online", aulas: 8, requisitos: "Nenhum.", status: "rascunho", ativo: true }
    ],
    contests: [
      { id: "p1", nome: "Concurso Prefeitura de Vale Verde 2026", orgao: "Prefeitura de Vale Verde", cargo: "Auxiliar administrativo", categoria: "Concursos gerais", vagas: 12, remuneracao: 2100, inicio: "2026-11-02", fim: "2026-12-05", prova: "2027-01-24", status: "publicado", ativo: true, notaCorte: null },
      { id: "p2", nome: "Concurso Tribunal Regional de Exemplo 2026", orgao: "Tribunal Regional de Exemplo", cargo: "Técnico judiciário", categoria: "Direito", vagas: 30, remuneracao: 4800, inicio: "2026-10-10", fim: "2026-11-20", prova: "2026-12-13", status: "publicado", ativo: true, notaCorte: null },
      { id: "p3", nome: "Seleção Secretaria de Educação de Exemplo 2026", orgao: "Secretaria de Educação de Exemplo", cargo: "Professor de matemática", categoria: "Exatas", vagas: 8, remuneracao: 3900, inicio: "2026-08-01", fim: "2026-09-10", prova: "2026-10-04", status: "publicado", ativo: true, notaCorte: null }
    ],
    materials: [
      { id: "m1", titulo: "Resumo: frações e porcentagem", disciplina: "Matemática", categoria: "Exatas", tipo: "Resumo", cursoId: "c1", conteudo: "Para transformar uma fração em porcentagem, multiplique o numerador por 100 e divida pelo denominador. Exemplo: 3/4 = 75%.\n\nPara calcular 25% de um valor, divida-o por 4.", status: "publicado", ativo: true },
      { id: "m2", titulo: "Apostila: ortografia e acentuação", disciplina: "Português", categoria: "Língua portuguesa", tipo: "Apostila", cursoId: "c2", conteudo: "Palavras paroxítonas terminadas em L, N, R, X, PS e ditongos são acentuadas.\n\nO trema foi eliminado da língua portuguesa, exceto em nomes próprios e derivados.", status: "publicado", ativo: true },
      { id: "m3", titulo: "Resumo: atos administrativos", disciplina: "Direito administrativo", categoria: "Direito", tipo: "Resumo", cursoId: "c4", conteudo: "Atos administrativos têm presunção de legitimidade, imperatividade e autoexecutoriedade.\n\nSão elementos: competência, finalidade, forma, motivo e objeto.", status: "publicado", ativo: true },
      { id: "m4", titulo: "Material em revisão", disciplina: "Informática", categoria: "Informática", tipo: "PDF", cursoId: "c3", conteudo: "Conteúdo ainda em revisão pela equipe.", status: "rascunho", ativo: true }
    ],
    quizzes: [
      { id: "s1", titulo: "Simulado de matemática básica", categoria: "Exatas", status: "publicado", ativo: true, questoes: [
        { enunciado: "Quanto é 25% de 240?", alternativas: ["40", "50", "60", "80"], gabarito: 2 },
        { enunciado: "Qual fração equivale a 0,75?", alternativas: ["1/4", "3/4", "3/5", "7/10"], gabarito: 1 },
        { enunciado: "Um produto custa R$ 80,00 e tem 15% de desconto. Quanto ele custa?", alternativas: ["R$ 60,00", "R$ 66,00", "R$ 68,00", "R$ 72,00"], gabarito: 2 }
      ] },
      { id: "s2", titulo: "Simulado de português", categoria: "Língua portuguesa", status: "publicado", ativo: true, questoes: [
        { enunciado: "Assinale a forma correta:", alternativas: ["Há dois anos", "Há dois ano", "A dois anos", "Ha dois anos"], gabarito: 0 },
        { enunciado: "Plural de cidadão:", alternativas: ["cidadões", "cidadãos", "cidadães", "cidadans"], gabarito: 1 }
      ] }
    ],
    enrollments: [{ id: "e1", userId: "u2", courseId: "c1", aulas: [1, 2] }],
    favorites: [{ id: "f1", userId: "u2", tipo: "material", itemId: "m1" }],
    attempts: [{ id: "t1", userId: "u2", quizId: "s1", respostas: [2, 1, 0], acertos: 2, total: 3, percentual: 67, criadoEm: "2026-10-12" }],
    tickets: [{ id: "k1", userId: "u2", assunto: "Dúvida sobre matrícula", mensagem: "Consigo acessar as aulas depois de me matricular?", resposta: "Sim. Assim que a matrícula é feita, as aulas ficam disponíveis no seu progresso.", status: "respondido", criadoEm: "2026-10-08" }],
    audit: [{ id: "a1", adminId: "u1", acao: "Curso publicado", alvo: "Matemática básica para concursos", criadoEm: "2026-10-01" }]
  });

  let db = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const data = seed();
    persist(data);
    return data;
  }

  function persist(data = db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }

  function fail(message) {
    throw new Error(message);
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function today() {
    const d = new Date();
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function bytes(length) {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function digest(text) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function match(item, query, category, fields) {
    const term = String(query || "").trim().toLowerCase();
    const inText = !term || fields.some((field) => String(item[field] || "").toLowerCase().includes(term));
    const inCategory = !category || category === "Todas" || item.categoria === category;
    return inText && inCategory;
  }

  function published(list) {
    return list.filter((item) => item.status === "publicado" && item.ativo);
  }

  function byId(list, id) {
    return list.find((item) => item.id === id);
  }

  function req(value, min, max, label) {
    const cleaned = String(value ?? "").trim();
    if (cleaned.length < min || cleaned.length > max) fail(`${label} deve ter entre ${min} e ${max} caracteres.`);
    return cleaned;
  }

  function num(value, min, max, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) fail(`${label} deve ser um número entre ${min} e ${max}.`);
    return number;
  }

  function pick(value, list, label) {
    if (!list.includes(value)) fail(`${label} inválido.`);
    return value;
  }

  function isoDate(value, label) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) fail(`${label} inválida.`);
    return value;
  }

  function situacao(contest) {
    const now = today();
    if (now < contest.inicio) return "Em breve";
    if (now > contest.fim) return "Inscrições encerradas";
    return "Inscrições abertas";
  }

  function courses(query, category) {
    return published(db.courses).filter((item) => match(item, query, category, ["titulo", "descricao"]));
  }

  function contests(query, category) {
    return published(db.contests).filter((item) => match(item, query, category, ["nome", "orgao", "cargo"]));
  }

  function materials(query, category) {
    return published(db.materials).filter((item) => match(item, query, category, ["titulo", "disciplina"]));
  }

  function quizzes() {
    return published(db.quizzes);
  }

  function course(id) {
    return byId(db.courses, id);
  }

  function contest(id) {
    return byId(db.contests, id);
  }

  function material(id) {
    return byId(db.materials, id);
  }

  function quiz(id) {
    return byId(db.quizzes, id);
  }

  function enrollment(userId, courseId) {
    return db.enrollments.find((item) => item.userId === userId && item.courseId === courseId);
  }

  function progress(userId, courseId) {
    const entry = enrollment(userId, courseId);
    const item = course(courseId);
    if (!entry || !item) return 0;
    return Math.round((entry.aulas.length / item.aulas) * 100);
  }

  function enrolledCourses(userId) {
    return db.enrollments.filter((item) => item.userId === userId && course(item.courseId));
  }

  function enroll(userId, courseId) {
    const item = course(courseId);
    if (!item || !published([item]).length) fail("Este curso não está disponível para matrícula.");
    if (enrollment(userId, courseId)) fail("Você já está matriculada neste curso.");
    db.enrollments.push({ id: uid(), userId, courseId, aulas: [] });
    persist();
  }

  function toggleLesson(userId, courseId, lesson) {
    const entry = enrollment(userId, courseId);
    if (!entry) fail("Faça a matrícula para acompanhar o progresso.");
    entry.aulas = entry.aulas.includes(lesson)
      ? entry.aulas.filter((item) => item !== lesson)
      : [...entry.aulas, lesson].sort((a, b) => a - b);
    persist();
  }

  function isFavorite(userId, tipo, itemId) {
    return db.favorites.some((item) => item.userId === userId && item.tipo === tipo && item.itemId === itemId);
  }

  function toggleFavorite(userId, tipo, itemId) {
    if (isFavorite(userId, tipo, itemId)) {
      db.favorites = db.favorites.filter((item) => !(item.userId === userId && item.tipo === tipo && item.itemId === itemId));
    } else {
      db.favorites.push({ id: uid(), userId, tipo, itemId });
    }
    persist();
  }

  function favorites(userId) {
    return db.favorites
      .filter((item) => item.userId === userId)
      .map((item) => {
        const source = item.tipo === "curso" ? course(item.itemId) : item.tipo === "concurso" ? contest(item.itemId) : material(item.itemId);
        return source ? { ...item, item: source } : null;
      })
      .filter(Boolean);
  }

  function attempts(userId) {
    return db.attempts.filter((item) => item.userId === userId).reverse();
  }

  function submitQuiz(userId, quizId, answers) {
    const item = quiz(quizId);
    if (!item || !published([item]).length) fail("Simulado indisponível.");
    if (answers.length !== item.questoes.length || answers.some((value) => !Number.isInteger(value))) {
      fail("Responda todas as questões antes de enviar.");
    }
    const acertos = item.questoes.reduce((sum, question, index) => sum + (answers[index] === question.gabarito ? 1 : 0), 0);
    const total = item.questoes.length;
    const result = { id: uid(), userId, quizId, respostas: answers, acertos, total, percentual: Math.round((acertos / total) * 100), criadoEm: today() };
    db.attempts.push(result);
    persist();
    return result;
  }

  function tickets(userId) {
    return db.tickets.filter((item) => item.userId === userId).reverse();
  }

  function openTicket(userId, assunto, mensagem) {
    if (String(assunto).trim().length < 4) fail("Informe um assunto com pelo menos 4 caracteres.");
    if (String(mensagem).trim().length < 10) fail("Descreva sua dúvida com pelo menos 10 caracteres.");
    db.tickets.push({ id: uid(), userId, assunto: String(assunto).trim(), mensagem: String(mensagem).trim(), resposta: "", status: "aberto", criadoEm: today() });
    persist();
  }

  function allTickets() {
    return db.tickets.slice().reverse();
  }

  function answerTicket(adminId, ticketId, reply) {
    adminUser(adminId);
    const ticket = byId(db.tickets, ticketId);
    if (!ticket) fail("Solicitação não encontrada.");
    ticket.resposta = req(reply, 2, 1000, "Resposta");
    ticket.status = "respondido";
    audit(adminId, "Solicitação respondida", ticket.assunto);
    persist();
  }

  function adminUser(adminId) {
    const user = byId(db.users, adminId);
    if (!user || user.role !== "admin" || !isActive(user)) fail("Acesso restrito a administradores.");
    return user;
  }

  function audit(adminId, acao, alvo) {
    db.audit.unshift({ id: uid(), adminId, acao, alvo, criadoEm: today() });
    db.audit = db.audit.slice(0, 300);
  }

  function auditLog() {
    return db.audit;
  }

  function parseQuestions(raw) {
    const lines = String(raw || "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) fail("Inclua ao menos uma questão.");
    return lines.map((line, index) => {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length !== 6 || parts.slice(1, 5).some((part) => !part)) {
        fail(`Questão ${index + 1}: use enunciado | alternativa A | B | C | D | número da correta (1 a 4).`);
      }
      return {
        enunciado: req(parts[0], 5, 300, `Enunciado da questão ${index + 1}`),
        alternativas: parts.slice(1, 5),
        gabarito: num(parts[5], 1, 4, `Gabarito da questão ${index + 1}`) - 1
      };
    });
  }

  function saveItem(kind, adminId, input) {
    adminUser(adminId);
    const collectionName = COLLECTIONS[kind];
    if (!collectionName) fail("Tipo de conteúdo inválido.");
    let data;
    if (kind === "curso") {
      data = {
        titulo: req(input.titulo, 5, 120, "Título"),
        descricao: req(input.descricao, 10, 500, "Descrição"),
        categoria: pick(input.categoria, CATEGORIES, "Categoria"),
        modalidade: pick(input.modalidade, MODALITIES, "Modalidade"),
        aulas: num(input.aulas, 1, 100, "Número de aulas"),
        status: pick(input.status, STATUSES, "Situação")
      };
    } else if (kind === "concurso") {
      const inicio = isoDate(input.inicio, "Início das inscrições");
      const fim = isoDate(input.fim, "Fim das inscrições");
      if (inicio > fim) fail("O fim das inscrições precisa ser depois do início.");
      data = {
        nome: req(input.nome, 5, 140, "Nome do concurso"),
        orgao: req(input.orgao, 3, 120, "Órgão responsável"),
        cargo: req(input.cargo, 2, 80, "Cargo"),
        categoria: pick(input.categoria, CATEGORIES, "Categoria"),
        vagas: num(input.vagas, 0, 10000, "Vagas"),
        remuneracao: num(input.remuneracao, 0, 1000000, "Remuneração"),
        inicio,
        fim,
        prova: isoDate(input.prova, "Data da prova"),
        status: pick(input.status, STATUSES, "Situação")
      };
    } else if (kind === "material") {
      if (input.cursoId && !course(input.cursoId)) fail("Curso vinculado não encontrado.");
      data = {
        titulo: req(input.titulo, 5, 120, "Título"),
        disciplina: req(input.disciplina, 3, 60, "Disciplina"),
        categoria: pick(input.categoria, CATEGORIES, "Categoria"),
        tipo: pick(input.tipo, ["PDF", "Resumo", "Apostila"], "Tipo"),
        cursoId: input.cursoId || "",
        conteudo: req(input.conteudo, 20, 2000, "Conteúdo"),
        status: pick(input.status, STATUSES, "Situação")
      };
    } else {
      data = {
        titulo: req(input.titulo, 5, 120, "Título"),
        categoria: pick(input.categoria, CATEGORIES, "Categoria"),
        status: pick(input.status, STATUSES, "Situação"),
        questoes: parseQuestions(input.questoes)
      };
    }
    const collection = db[collectionName];
    const existing = input.id ? byId(collection, input.id) : null;
    if (input.id && !existing) fail("Item não encontrado.");
    const label = data.titulo || data.nome;
    if (existing) {
      Object.assign(existing, data);
      audit(adminId, "Conteúdo atualizado", label);
    } else {
      collection.push({ id: uid(), ...data, ativo: true, ...(kind === "concurso" ? { notaCorte: null } : {}) });
      audit(adminId, "Conteúdo criado", label);
    }
    persist();
  }

  function toggleVisibility(kind, adminId, id) {
    adminUser(adminId);
    const item = byId(db[COLLECTIONS[kind]] || [], id);
    if (!item) fail("Item não encontrado.");
    item.ativo = !item.ativo;
    audit(adminId, item.ativo ? "Conteúdo exibido" : "Conteúdo ocultado", item.titulo || item.nome);
    persist();
  }

  function removeItem(kind, adminId, id) {
    adminUser(adminId);
    const collectionName = COLLECTIONS[kind];
    const item = byId(db[collectionName] || [], id);
    if (!item) fail("Item não encontrado.");
    db[collectionName] = db[collectionName].filter((entry) => entry.id !== id);
    if (kind === "curso") {
      db.enrollments = db.enrollments.filter((entry) => entry.courseId !== id);
      db.materials.forEach((entry) => {
        if (entry.cursoId === id) entry.cursoId = "";
      });
    }
    if (kind === "curso" || kind === "concurso" || kind === "material") {
      const tipo = kind === "curso" ? "curso" : kind === "concurso" ? "concurso" : "material";
      db.favorites = db.favorites.filter((entry) => !(entry.tipo === tipo && entry.itemId === id));
    }
    audit(adminId, "Conteúdo excluído", item.titulo || item.nome);
    persist();
  }

  function isActive(user) {
    return user.ativo !== false;
  }

  function setUserActive(adminId, userId) {
    adminUser(adminId);
    if (adminId === userId) fail("Você não pode desativar a própria conta.");
    const user = byId(db.users, userId);
    if (!user) fail("Usuário não encontrado.");
    user.ativo = !isActive(user);
    audit(adminId, user.ativo ? "Usuário reativado" : "Usuário desativado", user.email);
    persist();
  }

  function setUserRole(adminId, userId, role) {
    adminUser(adminId);
    if (adminId === userId) fail("Você não pode alterar o próprio perfil.");
    pick(role, ["admin", "user"], "Perfil");
    const user = byId(db.users, userId);
    if (!user) fail("Usuário não encontrado.");
    user.role = role;
    audit(adminId, `Perfil alterado para ${role === "admin" ? "administrador" : "usuário"}`, user.email);
    persist();
  }

  function reports() {
    const students = db.users.filter((item) => item.role === "user");
    const scores = db.attempts.map((item) => item.percentual);
    return {
      alunos: students.length,
      alunosAtivos: students.filter(isActive).length,
      cursosPublicados: published(db.courses).length,
      concursosAbertos: published(db.contests).filter((item) => situacao(item) === "Inscrições abertas").length,
      matriculas: db.enrollments.length,
      tentativas: db.attempts.length,
      mediaSimulados: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0,
      ticketsAbertos: db.tickets.filter((item) => item.status === "aberto").length,
      porSimulado: db.quizzes.map((quiz) => {
        const list = db.attempts.filter((item) => item.quizId === quiz.id);
        const media = list.length ? Math.round(list.reduce((sum, item) => sum + item.percentual, 0) / list.length) : 0;
        return { titulo: quiz.titulo, tentativas: list.length, media };
      })
    };
  }

  async function register(input) {
    const nome = req(input.nome, 3, 80, "Nome");
    const email = String(input.email || "").trim().toLowerCase();
    const senha = String(input.senha || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Informe um e-mail válido.");
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) fail("A senha precisa ter 8 caracteres, com letras e números.");
    if (!input.consentimento) fail("Aceite a política de privacidade para criar a conta.");
    if (db.users.some((item) => item.email === email)) fail("Não foi possível concluir o cadastro. Tente outro e-mail ou entre na sua conta.");
    const salt = bytes(6);
    const user = { id: uid(), nome, email, role: "user", ativo: true, salt, hash: await digest(`${salt}:${senha}`) };
    db.users.push(user);
    persist();
    return publicUser(user);
  }

  async function login(email, senha) {
    const normalized = String(email || "").trim().toLowerCase();
    const user = db.users.find((item) => item.email === normalized);
    const hash = await digest(`${user ? user.salt : "x"}:${String(senha || "")}`);
    if (!user || !isActive(user) || hash !== user.hash) return null;
    return publicUser(user);
  }

  function publicUser(user) {
    return { id: user.id, nome: user.nome, email: user.email, role: user.role, ativo: isActive(user) };
  }

  function currentUser() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      const user = session && byId(db.users, session.id);
      return user && isActive(user) ? publicUser(user) : null;
    } catch {
      return null;
    }
  }

  function startSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
  }

  function endSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function users() {
    return db.users.map(publicUser);
  }

  function userName(id) {
    const user = byId(db.users, id);
    return user ? user.nome : "Usuário removido";
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    sessionStorage.removeItem(SESSION_KEY);
    db = load();
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const data = seed();
    persist(data);
    return data;
  }

  return {
    CATEGORIES,
    MODALITIES,
    STATUSES,
    courses,
    contests,
    materials,
    quizzes,
    course,
    contest,
    material,
    quiz,
    progress,
    enrollment,
    enrolledCourses,
    enroll,
    toggleLesson,
    isFavorite,
    toggleFavorite,
    favorites,
    attempts,
    submitQuiz,
    tickets,
    openTicket,
    allTickets,
    answerTicket,
    saveItem,
    toggleVisibility,
    removeItem,
    setUserActive,
    setUserRole,
    reports,
    auditLog,
    register,
    login,
    currentUser,
    startSession,
    endSession,
    users,
    userName,
    situacao,
    today,
    reset,
    get db() {
      return db;
    }
  };
})();
