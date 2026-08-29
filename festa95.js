(function () {
  const $ = (id) => document.getElementById(id);
  const desktop = $("desktop");
  let z = 30;
  let path = ["MEUS DOCUMENTOS"];
  const NOTE = [
    "LEIA-ME.TXT",
    "===========",
    "",
    "Você está convidado para a festa de 50 anos",
    "de Clayton Luiz de Melo Liberato.",
    "",
    "Data: domingo, 06 de setembro de 2026",
    "",
    "Para começar a instalação da festa:",
    "  MEUS DOCUMENTOS \\ FESTAS \\ 1976 \\ 2026 \\ 50_ANOS.EXE",
    "",
    "Não existe botão NÃO.",
    "Clayton.exe não aceita recusa.",
    "",
    "(C) 1976-2026 Festa95"
  ].join("\n");

  const TREE = {
    "MEU COMPUTADOR": [{ name: "Disco local (C:)", type: "drive" }],
    "C:": [{ name: "MEUS DOCUMENTOS", type: "folder" }],
    "MEUS DOCUMENTOS": [{ name: "FESTAS", type: "folder" }],
    "FESTAS": [{ name: "1976", type: "folder" }],
    "1976": [{ name: "2026", type: "folder" }],
    "2026": [
      { name: "50_ANOS.EXE", type: "exe" },
      { name: "LEIA-ME.TXT", type: "txt" }
    ]
  };

  const ICONS = {
    folder: '<svg class="pic" viewBox="0 0 32 32"><path fill="#ffd24d" stroke="#000" d="M4 10h8l2 3h14v13H4z"/><path fill="#ffe27a" stroke="#000" d="M4 10h8l2-3h6v3"/></svg>',
    drive: '<svg class="pic" viewBox="0 0 32 32"><rect x="4" y="10" width="24" height="14" fill="#c0c0c0" stroke="#000"/><rect x="6" y="12" width="20" height="6" fill="#000"/><rect x="20" y="20" width="4" height="2" fill="#0c0"/></svg>',
    exe: '<svg class="pic" viewBox="0 0 32 32"><rect x="5" y="6" width="22" height="20" fill="#c0c0c0" stroke="#000"/><rect x="5" y="6" width="22" height="5" fill="#000080"/><text x="16" y="22" text-anchor="middle" font-size="9" font-family="Tahoma" font-weight="700">50</text></svg>',
    txt: '<svg class="pic" viewBox="0 0 32 32"><path fill="#fff" stroke="#000" d="M8 4h10l6 6v18H8z"/><path fill="#c0c0c0" stroke="#000" d="M18 4v6h6"/><path d="M11 16h10M11 19h10M11 22h7" stroke="#000"/></svg>'
  };

  function here() { return path[path.length - 1]; }
  function addr() {
    if (path[0] === "MEU COMPUTADOR" && path.length === 1) return "Meu Computador";
    if (path[0] === "MEU COMPUTADOR") {
      const rest = path.slice(1).join("\\");
      return rest === "C:" ? "C:\\" : "C:\\" + path.slice(2).join("\\");
    }
    return "C:\\" + path.join("\\");
  }

  const tasksEl = $("tasks");
  const taskButtons = {};
  function ensureTask(id, label) {
    if (taskButtons[id]) return taskButtons[id];
    const b = document.createElement("button");
    b.className = "btn task";
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => {
      const w = $(id);
      if (w.classList.contains("open") && w.style.display !== "none" && !w.classList.contains("idle")) minimize(id);
      else openWin(id);
    });
    tasksEl.appendChild(b);
    taskButtons[id] = b;
    return b;
  }
  function dropTask(id) {
    if (taskButtons[id]) { taskButtons[id].remove(); delete taskButtons[id]; }
  }
  function markTasks() {
    Object.keys(taskButtons).forEach((id) => {
      const w = $(id);
      const on = w && w.classList.contains("open") && w.style.display !== "none" && !w.classList.contains("idle");
      taskButtons[id].classList.toggle("active", !!on);
    });
  }
  function focusWin(id) {
    const w = $(id);
    if (!w) return;
    document.querySelectorAll(".window").forEach((n) => {
      if (n.id === "dlg-festa" || n.id === "dlg-msg" || n.id === "dlg-ok") return;
      n.classList.add("idle");
    });
    if (id !== "dlg-festa" && id !== "dlg-msg" && id !== "dlg-ok") w.classList.remove("idle");
    w.style.zIndex = ++z;
    markTasks();
  }
  function openWin(id, opts) {
    const w = $(id);
    w.classList.add("open");
    w.style.display = "flex";
    if (opts && opts.center) center(w);
    focusWin(id);
    if (id === "win-explorer") ensureTask(id, here());
    if (id === "win-festa") ensureTask(id, "50_ANOS.EXE");
    if (id === "win-note") ensureTask(id, "LEIA-ME.TXT");
    markTasks();
  }
  function closeWin(id) {
    const w = $(id);
    w.classList.remove("open");
    w.style.display = "none";
    dropTask(id);
    markTasks();
  }
  function minimize(id) {
    const w = $(id);
    w.style.display = "none";
    w.classList.add("idle");
    markTasks();
  }
  function center(w) {
    const r = w.getBoundingClientRect();
    const dw = window.innerWidth;
    const dh = window.innerHeight - 28;
    w.style.left = Math.max(4, (dw - r.width) / 2) + "px";
    w.style.top = Math.max(4, (dh - r.height) / 3) + "px";
  }
  function renderExplorer() {
    const items = TREE[here()] || [];
    $("ex-title").textContent = here();
    $("ex-path").value = addr();
    $("ex-status").textContent = items.length + " objeto(s)";
    $("ex-up").disabled = path.length <= 1;
    if (taskButtons["win-explorer"]) taskButtons["win-explorer"].textContent = here();
    const grid = $("ex-grid");
    grid.innerHTML = "";
    items.forEach((it) => {
      const b = document.createElement("button");
      b.className = "item";
      b.type = "button";
      b.innerHTML = (ICONS[it.type] || ICONS.folder) + '<span class="cap"></span>';
      b.querySelector(".cap").textContent = it.name;
      b.addEventListener("click", () => openItem(it));
      grid.appendChild(b);
    });
  }
  function openFolder(name) { path.push(name); renderExplorer(); openWin("win-explorer"); }
  function openItem(it) {
    if (it.type === "folder" || it.type === "drive") {
      if (it.name === "Disco local (C:)") openFolder("C:");
      else openFolder(it.name);
      return;
    }
    if (it.type === "txt") { $("note-text").value = NOTE; openWin("win-note", { center: true }); return; }
    if (it.type === "exe") launchExe();
  }
  function goUp() { if (path.length > 1) { path.pop(); renderExplorer(); } }
  function openDocs() { path = ["MEUS DOCUMENTOS"]; renderExplorer(); openWin("win-explorer"); center($("win-explorer")); }
  function openPc() { path = ["MEU COMPUTADOR"]; renderExplorer(); openWin("win-explorer"); center($("win-explorer")); }
  function launchExe() {
    desktop.classList.add("wait");
    setTimeout(() => {
      desktop.classList.remove("wait");
      $("scrim").classList.add("on");
      openWin("dlg-festa", { center: true });
      $("btn-sim").focus();
    }, 480);
  }
  function startFesta() {
    $("scrim").classList.remove("on");
    closeWin("dlg-festa");
    openWin("win-festa", { center: true });
    const saved = localStorage.getItem("festagrok-rsvp");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.guest) $("guest").value = d.guest;
        if (d.other) $("other-text").value = d.other;
        document.querySelectorAll('input[name="bebida"]').forEach((c) => { c.checked = (d.drinks || []).includes(c.value); });
      } catch (e) {}
    }
    $("guest").focus();
  }
  function alertBox(title, text, kind) {
    $("msg-title").textContent = title;
    $("msg-text").textContent = text;
    const ico = $("msg-ico");
    ico.className = kind === "err" ? "x-icon" : "i-icon";
    ico.textContent = kind === "err" ? "×" : "i";
    $("scrim").classList.add("on");
    openWin("dlg-msg", { center: true });
  }
  function closeMsg() {
    $("dlg-msg").classList.remove("open");
    $("dlg-msg").style.display = "none";
    const festaOn = $("dlg-festa").classList.contains("open") && $("dlg-festa").style.display !== "none";
    const okOn = $("dlg-ok").classList.contains("open") && $("dlg-ok").style.display !== "none";
    if (!festaOn && !okOn) $("scrim").classList.remove("on");
  }
  function tick() {
    const n = new Date();
    const hh = String(n.getHours()).padStart(2, "0");
    const mm = String(n.getMinutes()).padStart(2, "0");
    $("tray").textContent = hh + ":" + mm + "  06/09/2026";
  }
  tick();
  setInterval(tick, 15000);
  $("icon-docs").addEventListener("click", openDocs);
  $("icon-pc").addEventListener("click", openPc);
  $("icon-bin").addEventListener("click", () => { alertBox("Lixeira", "A Lixeira está vazia.\nOs 50 anos não voltam.", "info"); });
  $("ex-up").addEventListener("click", goUp);
  $("ex-help").addEventListener("click", () => { alertBox("Ajuda", "Abra FESTAS → 1976 → 2026 → 50_ANOS.EXE", "info"); });
  $("btn-sim").addEventListener("click", startFesta);
  $("btn-claro").addEventListener("click", startFesta);
  $("festa-x").addEventListener("click", () => {
    const w = $("dlg-festa");
    const left = parseFloat(w.style.left) || 0;
    const top = parseFloat(w.style.top) || 0;
    w.style.left = Math.max(8, left + 18) + "px";
    w.style.top = Math.max(8, top + 14) + "px";
    alertBox("50_ANOS.EXE", "Esta festa não aceita recusa.", "err");
  });
  $("festa-sobre").addEventListener("click", () => { alertBox("Sobre", "Festa95  ·  Clayton Luiz de Melo Liberato  ·  50.0\nCompilado em 1976. Relançado em 2026.", "info"); });
  document.querySelectorAll("[data-act=msg-close]").forEach((b) => b.addEventListener("click", closeMsg));
  $("ok-btn").addEventListener("click", () => { $("dlg-ok").style.display = "none"; $("dlg-ok").classList.remove("open"); $("scrim").classList.remove("on"); });
  $("ok-x").addEventListener("click", () => { $("ok-btn").click(); });
  $("rsvp-cancel").addEventListener("click", () => { alertBox("50_ANOS.EXE", "Não é possível cancelar esta instalação.", "err"); });
  $("rsvp").addEventListener("submit", (e) => {
    e.preventDefault();
    const drinks = [...document.querySelectorAll('input[name="bebida"]:checked')].map((c) => c.value);
    const other = $("other-text").value.trim();
    if (!drinks.length) { alertBox("50_ANOS.EXE", "Selecione o que você prefere beber.", "err"); return; }
    if (drinks.includes("Other") && !other) { alertBox("50_ANOS.EXE", "Preencha o campo Other.", "err"); $("other-text").focus(); return; }
    const guest = $("guest").value.trim();
    const listed = drinks.map((d) => d === "Other" ? ("Other: " + other) : d);
    localStorage.setItem("festagrok-rsvp", JSON.stringify({ guest, drinks, other, at: Date.now() }));
    $("ok-text").textContent = (guest ? guest + ", presença confirmada.\n\n" : "Presença confirmada.\n\n") + "Bebida: " + listed.join(", ") + "\n\n" + "Clayton.exe recebeu o seu RSVP.\n06/09/2026 — Festa95";
    $("scrim").classList.add("on");
    openWin("dlg-ok", { center: true });
    $("ok-btn").focus();
  });
  $("bebida-other").addEventListener("change", () => { if ($("bebida-other").checked) $("other-text").focus(); });
  const startBtn = $("start-btn");
  const startMenu = $("start-menu");
  function setStart(on) {
    startMenu.classList.toggle("open", on);
    startBtn.classList.toggle("on", on);
    startBtn.setAttribute("aria-expanded", on ? "true" : "false");
  }
  startBtn.addEventListener("click", (e) => { e.stopPropagation(); setStart(!startMenu.classList.contains("open")); });
  document.addEventListener("click", (e) => { if (!startMenu.contains(e.target) && e.target !== startBtn) setStart(false); });
  $("sm-docs").addEventListener("click", () => { setStart(false); openDocs(); });
  $("sm-exe").addEventListener("click", () => { setStart(false); launchExe(); });
  $("sm-run").addEventListener("click", () => { setStart(false); alertBox("Executar", "Digite: C:\\MEUS DOCUMENTOS\\FESTAS\\1976\\2026\\50_ANOS.EXE", "info"); });
  $("sm-off").addEventListener("click", () => { setStart(false); alertBox("Desligar o sistema", "Não dá para desligar a festa.\nEscolha Reiniciar o copo.", "err"); });
  desktop.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-win]");
    if (!btn) return;
    const id = btn.getAttribute("data-win");
    const act = btn.getAttribute("data-act");
    if (act === "close") closeWin(id);
    if (act === "min") minimize(id);
    if (act === "max") {
      const w = $(id);
      if (w.dataset.max === "1") {
        w.style.left = w.dataset.l; w.style.top = w.dataset.t; w.style.width = w.dataset.w; w.style.height = w.dataset.h; w.dataset.max = "0";
      } else {
        w.dataset.l = w.style.left; w.dataset.t = w.style.top; w.dataset.w = w.style.width; w.dataset.h = w.style.height;
        w.style.left = "0px"; w.style.top = "0px"; w.style.width = "100%"; w.style.height = "calc(100vh - 28px)"; w.dataset.max = "1";
      }
    }
  });
  document.querySelectorAll(".window").forEach((w) => { w.addEventListener("mousedown", () => focusWin(w.id)); });
  let drag = null;
  desktop.addEventListener("pointerdown", (e) => {
    const bar = e.target.closest(".titlebar");
    if (!bar || e.target.closest(".t-btn")) return;
    const id = bar.getAttribute("data-drag");
    const w = $(id);
    if (!w) return;
    const r = w.getBoundingClientRect();
    drag = { w, dx: e.clientX - r.left, dy: e.clientY - r.top };
    bar.setPointerCapture(e.pointerId);
  });
  desktop.addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.w.style.left = Math.min(window.innerWidth - 80, Math.max(-40, e.clientX - drag.dx)) + "px";
    drag.w.style.top = Math.min(window.innerHeight - 60, Math.max(0, e.clientY - drag.dy)) + "px";
  });
  desktop.addEventListener("pointerup", () => { drag = null; });
  document.querySelectorAll(".desk-icon").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".desk-icon").forEach((n) => n.classList.remove("sel"));
      el.classList.add("sel");
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setStart(false);
    if (e.key === "Enter" && $("dlg-festa").classList.contains("open") && $("dlg-festa").style.display !== "none") {
      e.preventDefault(); startFesta();
    }
  });
  function ready() { $("boot").classList.add("gone"); }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) ready();
  else setTimeout(ready, 2200);
})();
