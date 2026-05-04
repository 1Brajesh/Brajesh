import {
  createBrajeshClient,
  requireBrajeshAdmin,
  sendBrajeshMagicLink,
  signOutBrajesh,
} from "./brajesh-auth.js";

const db = createBrajeshClient();

const state = {
  user: null,
  affirmations: [],
  selectedTheme: "random",
  editingId: null,
  displayQueue: [],
  currentDisplayId: null,
};
let pageLoadPromise = null;
let pageReloadQueued = false;

const elements = {
  pageStatus: document.querySelector("#pageStatus"),
  loginPanel: document.querySelector("#loginPanel"),
  loginForm: document.querySelector("#loginForm"),
  loginLogoutButton: document.querySelector("#loginLogoutButton"),
  sessionHint: document.querySelector("#sessionHint"),
  logoutButton: document.querySelector("#logoutButton"),
  startDisplayTop: document.querySelector("#startDisplayTop"),
  appShell: document.querySelector("#appShell"),
  form: document.querySelector("#affirmationForm"),
  saveAffirmationButton: document.querySelector("#saveAffirmationButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  editorModeBadge: document.querySelector("#editorModeBadge"),
  editorSummary: document.querySelector("#editorSummary"),
  editorStatus: document.querySelector("#editorStatus"),
  themeSelect: document.querySelector("#affirmationForm select[name='theme']"),
  csvFileInput: document.querySelector("#csvFileInput"),
  importCsvButton: document.querySelector("#importCsvButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  csvStatus: document.querySelector("#csvStatus"),
  affirmationList: document.querySelector("#affirmationList"),
  themeFilterBar: document.querySelector("#themeFilterBar"),
  displayThemeBar: document.querySelector("#displayThemeBar"),
  selectedThemeBadge: document.querySelector("#selectedThemeBadge"),
  previewThemeBadge: document.querySelector("#previewThemeBadge"),
  themeSummary: document.querySelector("#themeSummary"),
  libraryCountBadge: document.querySelector("#libraryCountBadge"),
  libraryThemeMessage: document.querySelector("#libraryThemeMessage"),
  previewQuote: document.querySelector("#previewQuote"),
  displayMode: document.querySelector("#displayMode"),
  displayBody: document.querySelector("#displayBody"),
  displayStage: document.querySelector("#displayStage"),
  displayText: document.querySelector("#displayText"),
  displayAnnouncer: document.querySelector("#displayAnnouncer"),
  startDisplay: document.querySelector("#startDisplay"),
  exitDisplay: document.querySelector("#exitDisplay"),
};
let displayFitFrame = 0;

function setStatusElement(element, text, tone = "") {
  if (!element) return;
  element.textContent = text;
  element.dataset.tone = tone;
}

function scheduleDisplayFit() {
  if (typeof window.requestAnimationFrame !== "function") {
    fitDisplayText();
    return;
  }

  if (displayFitFrame) {
    window.cancelAnimationFrame(displayFitFrame);
  }

  displayFitFrame = window.requestAnimationFrame(() => {
    displayFitFrame = window.requestAnimationFrame(() => {
      displayFitFrame = 0;
      fitDisplayText();
    });
  });
}

function createDisplayMeasure(sourceElement, availableWidth) {
  const styles = window.getComputedStyle(sourceElement);
  const measure = document.createElement("div");
  measure.textContent = sourceElement.textContent || "";
  measure.style.position = "fixed";
  measure.style.left = "-100000px";
  measure.style.top = "0";
  measure.style.visibility = "hidden";
  measure.style.pointerEvents = "none";
  measure.style.boxSizing = "border-box";
  measure.style.width = `${availableWidth}px`;
  measure.style.maxWidth = `${availableWidth}px`;
  measure.style.margin = "0";
  measure.style.padding = "0";
  measure.style.border = "0";
  measure.style.fontFamily = styles.fontFamily;
  measure.style.fontWeight = styles.fontWeight;
  measure.style.fontStyle = styles.fontStyle;
  measure.style.lineHeight = styles.lineHeight;
  measure.style.letterSpacing = styles.letterSpacing;
  measure.style.textAlign = styles.textAlign;
  measure.style.whiteSpace = styles.whiteSpace;
  measure.style.wordBreak = styles.wordBreak;
  measure.style.overflowWrap = styles.overflowWrap;
  measure.style.userSelect = "none";
  document.body.appendChild(measure);
  return measure;
}

function setPageStatus(text, tone = "") {
  setStatusElement(elements.pageStatus, text, tone);
}

function setEditorStatus(text, tone = "") {
  setStatusElement(elements.editorStatus, text, tone);
}

function setCSVStatus(text, tone = "") {
  setStatusElement(elements.csvStatus, text, tone);
}

function titleCase(value) {
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getThemeLabel(theme) {
  return theme === "random" ? "Random" : titleCase(theme);
}

function cleanAffirmationBody(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeAffirmationFingerprint(value) {
  return cleanAffirmationBody(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function buildAffirmationPayload(body, theme) {
  const cleanBody = cleanAffirmationBody(body);
  const cleanTheme = slugify(theme);

  return {
    body: cleanBody,
    theme: cleanTheme,
    body_normalized: normalizeAffirmationFingerprint(cleanBody),
  };
}

function getAffirmationKey(item) {
  const bodyFingerprint = item.body_normalized || normalizeAffirmationFingerprint(item.body);
  return `${slugify(item.theme)}::${bodyFingerprint}`;
}

function getAffirmationKeySet() {
  return new Set(state.affirmations.map(getAffirmationKey));
}

function getThemes() {
  const themes = [...new Set(state.affirmations.map((item) => item.theme))].sort();
  return ["random", ...themes];
}

function getFilteredAffirmations(theme = state.selectedTheme) {
  if (theme === "random") {
    return [...state.affirmations];
  }

  return state.affirmations.filter((item) => item.theme === theme);
}

function getThemeSummary(theme = state.selectedTheme) {
  if (theme === "random") {
    return "Showing affirmations from every theme.";
  }

  return `Showing affirmations tagged “${titleCase(theme)}”.`;
}

function getAffirmationById(id) {
  return state.affirmations.find((item) => item.id === id) || null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shuffle(list) {
  const rows = [...list];

  for (let index = rows.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [rows[index], rows[swapIndex]] = [rows[swapIndex], rows[index]];
  }

  return rows;
}

function renderThemeOptions() {
  const themes = getThemes().filter((theme) => theme !== "random");
  const availableThemes = themes.length ? themes : ["personal"];
  const currentValue = elements.themeSelect.value;

  elements.themeSelect.innerHTML = availableThemes.map((theme) => `
    <option value="${theme}">${titleCase(theme)}</option>
  `).join("");

  if (availableThemes.includes(currentValue)) {
    elements.themeSelect.value = currentValue;
    return;
  }

  if (availableThemes.includes(state.selectedTheme)) {
    elements.themeSelect.value = state.selectedTheme;
    return;
  }

  elements.themeSelect.value = availableThemes[0];
}

function renderThemePills(target, currentTheme, onSelect) {
  const themes = getThemes();

  target.innerHTML = themes.map((theme) => `
    <button
      class="theme-pill ${theme === "random" ? "is-random" : ""}"
      type="button"
      data-theme="${theme}"
      aria-pressed="${String(theme === currentTheme)}"
    >${getThemeLabel(theme)}</button>
  `).join("");

  target.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.theme));
  });
}

function showLogin() {
  elements.loginPanel.hidden = false;
  elements.appShell.hidden = true;
  if (elements.startDisplayTop) {
    elements.startDisplayTop.hidden = true;
  }
  elements.logoutButton.hidden = !state.user;
  closeDisplayMode();
}

function showApp() {
  elements.loginPanel.hidden = true;
  elements.appShell.hidden = false;
  if (elements.startDisplayTop) {
    elements.startDisplayTop.hidden = false;
  }
  elements.logoutButton.hidden = false;
}

function updateIdentityUI() {
  if (state.user?.email) {
    elements.sessionHint.textContent = `Signed in as ${state.user.email}. Use a different email if needed.`;
    elements.loginLogoutButton.hidden = false;
    return;
  }

  elements.sessionHint.textContent = "A sign-in link will be emailed to your approved admin address.";
  elements.loginLogoutButton.hidden = true;
}

function setLoginBusy(isBusy) {
  const submitButton = elements.loginForm.querySelector("button[type='submit']");
  elements.loginForm.elements.email.disabled = isBusy;
  elements.loginLogoutButton.disabled = isBusy;
  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? "Sending Link..." : "Send Magic Link";
}

function setSaveButtonBusy(isBusy) {
  const idleText = state.editingId ? "Update Affirmation" : "Save Affirmation";
  elements.saveAffirmationButton.disabled = isBusy;
  elements.cancelEditButton.disabled = isBusy;
  elements.saveAffirmationButton.textContent = isBusy
    ? (state.editingId ? "Updating..." : "Saving...")
    : idleText;
}

function setImportExportBusy(isBusy) {
  elements.importCsvButton.disabled = isBusy;
  elements.exportCsvButton.disabled = isBusy;
}

function resetEditor(options = {}) {
  state.editingId = null;
  elements.form.reset();
  renderThemeOptions();

  if (options.keepTheme && [...elements.themeSelect.options].some((option) => option.value === options.keepTheme)) {
    elements.themeSelect.value = options.keepTheme;
  }

  elements.cancelEditButton.hidden = true;
  elements.editorModeBadge.textContent = "Mode: Add";
  elements.editorSummary.textContent = "Add a new affirmation or load an existing one into the form for editing.";
  elements.saveAffirmationButton.textContent = "Save Affirmation";
  elements.saveAffirmationButton.disabled = false;

  if (!options.keepStatus) {
    setEditorStatus("Add a new affirmation or import a CSV.");
  }
}

function loadAffirmationIntoEditor(affirmationId) {
  const record = getAffirmationById(affirmationId);
  if (!record) return;

  state.editingId = record.id;
  elements.form.elements.body.value = record.body;
  renderThemeOptions();
  elements.form.elements.theme.value = record.theme;
  elements.form.elements.newTheme.value = "";
  elements.cancelEditButton.hidden = false;
  elements.editorModeBadge.textContent = "Mode: Edit";
  elements.editorSummary.textContent = "Editing an existing affirmation. Save to update it, or cancel to go back to add mode.";
  elements.saveAffirmationButton.textContent = "Update Affirmation";
  setEditorStatus(`Loaded ${titleCase(record.theme)} affirmation for editing.`, "ok");
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function syncPageStateAfterLoad() {
  const themes = getThemes();

  if (state.selectedTheme !== "random" && !themes.includes(state.selectedTheme)) {
    state.selectedTheme = "random";
  }

  if (state.editingId && !getAffirmationById(state.editingId)) {
    resetEditor();
  }

  if (state.currentDisplayId && !getAffirmationById(state.currentDisplayId)) {
    state.currentDisplayId = null;
  }

  renderControls();
  renderLibrary();
}

function renderLibrary() {
  const rows = getFilteredAffirmations();

  elements.selectedThemeBadge.textContent = `Selected: ${getThemeLabel(state.selectedTheme)}`;
  elements.themeSummary.textContent = getThemeSummary();
  elements.libraryThemeMessage.textContent = `Filter: ${getThemeLabel(state.selectedTheme)}`;
  elements.libraryCountBadge.textContent = `${rows.length} ${rows.length === 1 ? "item" : "items"}`;

  if (elements.previewThemeBadge) {
    elements.previewThemeBadge.textContent = `Theme: ${getThemeLabel(state.selectedTheme)}`;
  }

  if (elements.previewQuote) {
    elements.previewQuote.textContent = (rows[0] || state.affirmations[0] || {}).body || "No affirmations yet.";
  }

  if (!rows.length) {
    elements.affirmationList.innerHTML = '<div class="empty">No affirmations in this theme yet.</div>';
    return;
  }

  elements.affirmationList.innerHTML = rows.map((item) => `
    <article class="affirmation-card">
      <blockquote>${escapeHtml(item.body)}</blockquote>
      <footer>
        <span class="badge">${titleCase(item.theme)}</span>
        <span class="card-actions">
          <button type="button" data-action="display-affirmation" data-id="${item.id}">Display</button>
          <button type="button" data-action="edit-affirmation" data-id="${item.id}">Edit</button>
          <button type="button" data-action="delete-affirmation" data-id="${item.id}">Delete</button>
        </span>
      </footer>
    </article>
  `).join("");
}

function renderControls() {
  renderThemeOptions();

  renderThemePills(elements.themeFilterBar, state.selectedTheme, (theme) => {
    state.selectedTheme = theme;
    renderControls();
    renderLibrary();
  });

  renderThemePills(elements.displayThemeBar, state.selectedTheme, (theme) => {
    state.selectedTheme = theme;
    state.displayQueue = [];
    renderControls();
    renderLibrary();
    showNextAffirmation();
  });
}

async function loadAffirmations(options = {}) {
  if (!options.silent) {
    setPageStatus("Loading affirmations.");
  }

  const { data, error } = await db
    .from("brajesh_affirmations")
    .select("id, theme, body, body_normalized, created_at, updated_at")
    .order("theme", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  state.affirmations = data || [];
  showApp();
  syncPageStateAfterLoad();
  if (!options.silent) {
    setPageStatus("");
  }
}

async function loadPage(options = {}) {
  try {
    if (!options.silent) {
      setPageStatus("Checking access.");
    }

    const { user, isAdmin } = await requireBrajeshAdmin(db);
    state.user = user;
    updateIdentityUI();

    if (!user) {
      state.affirmations = [];
      resetEditor();
      showLogin();
      if (!options.silent) {
        setPageStatus("Enter your email to receive a magic link.");
      }
      return;
    }

    if (!isAdmin) {
      state.affirmations = [];
      resetEditor();
      showLogin();
      setPageStatus(`${user.email} is signed in, but this email does not have affirmations access.`, "error");
      return;
    }

    await loadAffirmations(options);
  } catch (error) {
    showLogin();
    setPageStatus(error.message || "Could not load affirmations.", "error");
  }
}

async function requestPageLoad(options = {}) {
  if (pageLoadPromise) {
    pageReloadQueued = true;
    return pageLoadPromise;
  }

  pageLoadPromise = loadPage(options)
    .finally(async () => {
      pageLoadPromise = null;

      if (pageReloadQueued) {
        pageReloadQueued = false;
        await requestPageLoad({ silent: true });
      }
    });

  return pageLoadPromise;
}

function escapeCSVField(value) {
  const text = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function parseCSVRows(text) {
  const rows = [];
  const normalized = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[index + 1] === '"') {
          currentCell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (char === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length || currentRow.length) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => String(cell || "").trim() !== ""));
}

function resolveCSVColumns(rows) {
  if (!rows.length) {
    return { rows: [], bodyIndex: 0, themeIndex: 1 };
  }

  const headers = rows[0].map((value) => String(value || "").trim().toLowerCase());
  const bodyIndex = headers.findIndex((value) => ["affirmation", "body", "text", "quote"].includes(value));
  const themeIndex = headers.findIndex((value) => ["theme", "tag", "category"].includes(value));

  if (bodyIndex !== -1 && themeIndex !== -1) {
    return {
      rows: rows.slice(1),
      bodyIndex,
      themeIndex,
    };
  }

  return {
    rows,
    bodyIndex: 0,
    themeIndex: 1,
  };
}

async function importCSVText(text, filename = "CSV") {
  const parsedRows = parseCSVRows(text);
  const { rows, bodyIndex, themeIndex } = resolveCSVColumns(parsedRows);
  const keySet = getAffirmationKeySet();
  const payloads = [];
  let duplicates = 0;
  let invalid = 0;

  rows.forEach((row) => {
    const payload = buildAffirmationPayload(row[bodyIndex], row[themeIndex]);

    if (!payload.body || !payload.theme) {
      invalid += 1;
      return;
    }

    const key = `${payload.theme}::${payload.body_normalized}`;
    if (keySet.has(key)) {
      duplicates += 1;
      return;
    }

    keySet.add(key);
    payloads.push(payload);
  });

  if (!parsedRows.length) {
    setCSVStatus(`${filename} was empty.`, "warn");
    return;
  }

  let added = 0;

  if (payloads.length) {
    setImportExportBusy(true);

    try {
      const { data, error } = await db
        .from("brajesh_affirmations")
        .upsert(payloads, {
          onConflict: "theme,body_normalized",
          ignoreDuplicates: true,
        })
        .select("id");

      if (error) {
        throw error;
      }

      added = data?.length || payloads.length;
      duplicates += Math.max(0, payloads.length - added);
      await loadAffirmations({ silent: true });
    } finally {
      setImportExportBusy(false);
    }
  }

  const parts = [];
  if (added) parts.push(`imported ${added} new affirmation${added === 1 ? "" : "s"}`);
  if (duplicates) parts.push(`skipped ${duplicates} duplicate${duplicates === 1 ? "" : "s"}`);
  if (invalid) parts.push(`skipped ${invalid} invalid row${invalid === 1 ? "" : "s"}`);

  if (!parts.length) {
    setCSVStatus(`No rows were imported from ${filename}.`, "warn");
    return;
  }

  setCSVStatus(`${parts.join(", ")} from ${filename}.`, added ? "ok" : "warn");
}

function exportCSV() {
  const rows = [...state.affirmations].sort((left, right) => {
    const themeCompare = left.theme.localeCompare(right.theme);
    if (themeCompare !== 0) return themeCompare;
    return left.body.localeCompare(right.body);
  });

  const csv = [
    ["affirmation", "theme"],
    ...rows.map((item) => [item.body, item.theme]),
  ].map((row) => row.map(escapeCSVField).join(",")).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "affirmations-export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setCSVStatus(`Exported ${rows.length} affirmation${rows.length === 1 ? "" : "s"} to affirmations-export.csv.`, "ok");
}

function renderDisplayItem(item) {
  if (!item) {
    elements.displayText.textContent = "No affirmations in this theme yet.";
    elements.displayAnnouncer.textContent = "No affirmations available.";
    scheduleDisplayFit();
    return;
  }

  state.currentDisplayId = item.id;
  elements.displayText.textContent = item.body;
  elements.displayAnnouncer.textContent = item.body;
  scheduleDisplayFit();
}

function buildDisplayQueue() {
  const rows = getFilteredAffirmations().filter((item) => item.id !== state.currentDisplayId);
  state.displayQueue = shuffle(rows);
}

function getNextAffirmation() {
  if (!state.displayQueue.length) {
    buildDisplayQueue();
  }

  if (!state.displayQueue.length) {
    return null;
  }

  return state.displayQueue.shift();
}

function fitDisplayText() {
  const stage = elements.displayStage;
  const text = elements.displayText;

  let fontSize = Math.min(window.innerWidth * 0.13, window.innerHeight * 0.18, 180);
  const minSize = 26;
  const horizontalSafety = Math.max(18, stage.clientWidth * 0.06);
  const verticalSafety = Math.max(20, stage.clientHeight * 0.04);
  const availableWidth = Math.max(120, stage.clientWidth - horizontalSafety * 2);
  const availableHeight = Math.max(120, stage.clientHeight - verticalSafety * 2);
  const measure = createDisplayMeasure(text, availableWidth);

  try {
    while (fontSize > minSize) {
      measure.style.fontSize = `${fontSize}px`;
      const exceedsWidth = measure.scrollWidth > availableWidth + 1;
      const exceedsHeight = measure.scrollHeight > availableHeight + 1;

      if (!exceedsWidth && !exceedsHeight) {
        break;
      }

      fontSize -= 2;
    }
  } finally {
    measure.remove();
  }

  text.style.fontSize = `${fontSize}px`;
  if (text.scrollWidth > text.clientWidth + 1 && fontSize > minSize) {
    fontSize = Math.max(minSize, fontSize - 4);
    text.style.fontSize = `${fontSize}px`;
  }
}

function showNextAffirmation() {
  renderDisplayItem(getNextAffirmation());
}

function openDisplayMode(startItem = null) {
  elements.displayMode.hidden = false;
  document.body.style.overflow = "hidden";
  state.displayQueue = [];

  if (startItem) {
    state.displayQueue = shuffle(
      getFilteredAffirmations().filter((item) => item.id !== startItem.id)
    );
    renderDisplayItem(startItem);
  } else {
    showNextAffirmation();
  }

  elements.displayBody.focus();
}

function closeDisplayMode() {
  elements.displayMode.hidden = true;
  document.body.style.overflow = "";
}

function clearAuthHash() {
  if (!window.location.hash) return;

  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);

  if (params.has("access_token") || params.has("refresh_token") || params.has("error_description")) {
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  }
}

async function handleSignOut(successMessage = "Signed out.") {
  let signOutFailed = false;

  try {
    await signOutBrajesh(db);
  } catch (error) {
    signOutFailed = true;
    setPageStatus(error.message || "Could not sign out.", "error");
  }

  if (signOutFailed) {
    return;
  }

  state.user = null;
  state.affirmations = [];
  state.displayQueue = [];
  state.currentDisplayId = null;
  resetEditor();
  updateIdentityUI();
  showLogin();
  setPageStatus(successMessage, "ok");
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = String(new FormData(form).get("email") || "");

  setLoginBusy(true);
  setPageStatus("Sending magic link.");

  try {
    const normalizedEmail = await sendBrajeshMagicLink(db, email, "/affirmations/");
    form.reset();
    setPageStatus(`Check ${normalizedEmail} for your sign-in link.`, "ok");
  } catch (error) {
    setPageStatus(error.message || "Could not send magic link.", "error");
  } finally {
    setLoginBusy(false);
  }
});

elements.loginLogoutButton.addEventListener("click", async () => {
  await handleSignOut("Signed out. You can request a new magic link with a different email.");
});

elements.logoutButton.addEventListener("click", async () => {
  await handleSignOut();
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const existingTheme = String(data.get("theme") || "").trim();
  const newTheme = slugify(data.get("newTheme") || "");
  const targetTheme = newTheme || existingTheme;
  const payload = buildAffirmationPayload(data.get("body"), targetTheme);

  if (!payload.body || !payload.theme) {
    setEditorStatus("Add both an affirmation and a valid theme before saving.", "error");
    return;
  }

  setSaveButtonBusy(true);

  try {
    if (state.editingId) {
      const { error } = await db
        .from("brajesh_affirmations")
        .update(payload)
        .eq("id", state.editingId);

      if (error) throw error;

      state.selectedTheme = payload.theme;
      await loadAffirmations({ silent: true });
      resetEditor({ keepTheme: payload.theme, keepStatus: true });
      setEditorStatus(`Updated ${titleCase(payload.theme)} affirmation.`, "ok");
    } else {
      const { error } = await db
        .from("brajesh_affirmations")
        .insert(payload);

      if (error) throw error;

      state.selectedTheme = payload.theme;
      await loadAffirmations({ silent: true });
      resetEditor({ keepTheme: payload.theme, keepStatus: true });
      setEditorStatus(`Saved a new ${titleCase(payload.theme)} affirmation.`, "ok");
    }
  } catch (error) {
    if (error.code === "23505") {
      setEditorStatus("That affirmation already exists in this theme.", "warn");
    } else {
      setEditorStatus(error.message || "Could not save that affirmation.", "error");
    }
  } finally {
    setSaveButtonBusy(false);
  }
});

elements.cancelEditButton.addEventListener("click", () => {
  resetEditor({ keepTheme: state.selectedTheme !== "random" ? state.selectedTheme : undefined });
});

elements.importCsvButton.addEventListener("click", () => {
  elements.csvFileInput.click();
});

elements.exportCsvButton.addEventListener("click", exportCSV);

elements.csvFileInput.addEventListener("change", async (event) => {
  const [file] = event.currentTarget.files || [];
  if (!file) return;

  try {
    const text = await file.text();
    await importCSVText(text, file.name);
  } catch (error) {
    setCSVStatus(error.message || "Could not read that CSV file.", "error");
  } finally {
    event.currentTarget.value = "";
  }
});

elements.affirmationList.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const affirmationId = target.dataset.id;
  const record = getAffirmationById(affirmationId);
  if (!record) return;

  if (target.dataset.action === "display-affirmation") {
    state.selectedTheme = record.theme;
    renderControls();
    renderLibrary();
    openDisplayMode(record);
    return;
  }

  if (target.dataset.action === "edit-affirmation") {
    loadAffirmationIntoEditor(affirmationId);
    return;
  }

  if (target.dataset.action === "delete-affirmation") {
    if (!window.confirm("Delete this affirmation?")) return;

    try {
      const { error } = await db
        .from("brajesh_affirmations")
        .delete()
        .eq("id", affirmationId);

      if (error) throw error;

      if (state.editingId === affirmationId) {
        resetEditor({ keepTheme: record.theme, keepStatus: true });
      }

      await loadAffirmations({ silent: true });
      setEditorStatus("Affirmation deleted.", "ok");
    } catch (error) {
      setEditorStatus(error.message || "Could not delete that affirmation.", "error");
    }
  }
});

function startDisplayFromCurrentTheme() {
  openDisplayMode();
}

elements.startDisplay.addEventListener("click", startDisplayFromCurrentTheme);
if (elements.startDisplayTop) {
  elements.startDisplayTop.addEventListener("click", startDisplayFromCurrentTheme);
}
elements.exitDisplay.addEventListener("click", closeDisplayMode);

elements.displayBody.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  showNextAffirmation();
});

document.addEventListener("keydown", (event) => {
  if (elements.displayMode.hidden) return;

  if (event.key === "Escape") {
    closeDisplayMode();
    return;
  }

  if (event.key === " " || event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    showNextAffirmation();
  }
});

window.addEventListener("resize", () => {
  if (!elements.displayMode.hidden) {
    scheduleDisplayFit();
  }
});

db.auth.onAuthStateChange((event) => {
  if (event === "INITIAL_SESSION") {
    return;
  }

  clearAuthHash();
  void requestPageLoad({ silent: true });
});

updateIdentityUI();
resetEditor({ keepStatus: true });
setEditorStatus("Add a new affirmation or import a CSV.");
setCSVStatus("CSV format: first column = affirmation, second column = theme.");
requestPageLoad().finally(() => {
  clearAuthHash();
});
