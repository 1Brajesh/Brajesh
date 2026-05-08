import {
  createBrajeshClient,
  requireBrajeshAdmin,
  sendBrajeshMagicLink,
  signOutBrajesh,
} from "./brajesh-auth.js";

const db = createBrajeshClient();
const BUILTIN_THEMES = ["long"];
const DISPLAY_SKINS = [
  {
    id: "sunlit",
    fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif',
    fontWeight: "600",
    lineHeight: "0.95",
    letterSpacing: "-0.02em",
    textColor: "#fff3db",
    accentColor: "#f4cc8a",
    accentStrong: "#fff7e8",
    surface: "rgba(255, 247, 230, 0.08)",
    surfaceBorder: "rgba(244, 204, 138, 0.2)",
    surfaceText: "rgba(255, 248, 235, 0.92)",
    textShadow: "0 12px 34px rgba(0, 0, 0, 0.42)",
    bgStart: "#120904",
    bgEnd: "#010101",
    glowA: "rgba(244, 204, 138, 0.24)",
    glowB: "rgba(255, 173, 93, 0.14)",
    glowC: "rgba(255, 246, 220, 0.08)",
    motifColor: "rgba(255, 229, 171, 0.24)",
    motifs: ["sun", "flower", "ribbon"],
  },
  {
    id: "meadow",
    fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    fontWeight: "600",
    lineHeight: "0.97",
    letterSpacing: "-0.01em",
    textColor: "#effceb",
    accentColor: "#9fd7b0",
    accentStrong: "#f6fff3",
    surface: "rgba(235, 255, 241, 0.08)",
    surfaceBorder: "rgba(159, 215, 176, 0.18)",
    surfaceText: "rgba(240, 255, 245, 0.92)",
    textShadow: "0 12px 34px rgba(0, 0, 0, 0.4)",
    bgStart: "#061108",
    bgEnd: "#010202",
    glowA: "rgba(113, 184, 139, 0.18)",
    glowB: "rgba(204, 255, 218, 0.08)",
    glowC: "rgba(144, 214, 177, 0.1)",
    motifColor: "rgba(191, 236, 203, 0.2)",
    motifs: ["leaf", "flower", "wave"],
  },
  {
    id: "dawn",
    fontFamily: '"Baskerville", "Times New Roman", serif',
    fontWeight: "600",
    lineHeight: "0.94",
    letterSpacing: "-0.025em",
    textColor: "#ffe7ef",
    accentColor: "#ffb8ca",
    accentStrong: "#fff4f7",
    surface: "rgba(255, 239, 245, 0.08)",
    surfaceBorder: "rgba(255, 184, 202, 0.18)",
    surfaceText: "rgba(255, 241, 246, 0.92)",
    textShadow: "0 14px 36px rgba(0, 0, 0, 0.42)",
    bgStart: "#13050c",
    bgEnd: "#010101",
    glowA: "rgba(255, 157, 183, 0.18)",
    glowB: "rgba(255, 213, 159, 0.12)",
    glowC: "rgba(255, 232, 239, 0.08)",
    motifColor: "rgba(255, 207, 222, 0.22)",
    motifs: ["flower", "star", "ribbon"],
  },
  {
    id: "tide",
    fontFamily: '"Iowan Old Style", "Palatino Linotype", Palatino, serif',
    fontWeight: "600",
    lineHeight: "0.96",
    letterSpacing: "-0.015em",
    textColor: "#eaf8ff",
    accentColor: "#8bc8ff",
    accentStrong: "#f4fbff",
    surface: "rgba(235, 247, 255, 0.08)",
    surfaceBorder: "rgba(139, 200, 255, 0.18)",
    surfaceText: "rgba(236, 249, 255, 0.92)",
    textShadow: "0 12px 34px rgba(0, 0, 0, 0.42)",
    bgStart: "#041019",
    bgEnd: "#010203",
    glowA: "rgba(139, 200, 255, 0.18)",
    glowB: "rgba(173, 236, 255, 0.12)",
    glowC: "rgba(233, 249, 255, 0.08)",
    motifColor: "rgba(173, 229, 255, 0.22)",
    motifs: ["wave", "sun", "star"],
  },
];
const DISPLAY_MOTIFS = {
  sun: `
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <circle cx="36" cy="36" r="11"></circle>
      <path d="M36 8v11M36 53v11M8 36h11M53 36h11M16 16l8 8M48 48l8 8M16 56l8-8M48 24l8-8"></path>
    </svg>
  `,
  flower: `
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <circle cx="36" cy="18" r="10"></circle>
      <circle cx="52" cy="28" r="10"></circle>
      <circle cx="46" cy="48" r="10"></circle>
      <circle cx="26" cy="48" r="10"></circle>
      <circle cx="20" cy="28" r="10"></circle>
      <circle class="fill" cx="36" cy="36" r="5"></circle>
    </svg>
  `,
  leaf: `
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <path d="M56 12c-20 3-34 17-38 38 21-3 35-17 38-38Z"></path>
      <path d="M22 50c7-8 16-17 27-28"></path>
    </svg>
  `,
  wave: `
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <path d="M10 40c7-8 13-8 20 0s13 8 20 0 13-8 20 0"></path>
      <path d="M10 28c7-8 13-8 20 0s13 8 20 0 13-8 20 0"></path>
    </svg>
  `,
  star: `
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <path d="M36 12l6.5 14.1L58 28l-11 10.7L49.8 54 36 46.1 22.2 54 25 38.7 14 28l15.5-1.9L36 12Z"></path>
    </svg>
  `,
  ribbon: `
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <path d="M13 47c9-17 16-28 24-28 7 0 9 17 17 17 5 0 8-5 11-12"></path>
      <path d="M11 31c6-4 10-4 13-1 3 3 4 8 8 11 4 3 9 2 18-3"></path>
    </svg>
  `,
};
const DISPLAY_MOTIF_LAYOUTS = [
  { left: "14%", top: "18%", size: 114, opacity: "0.16", rotation: -8, driftX: 14, driftY: 18, driftRotate: 10, duration: 24 },
  { left: "86%", top: "16%", size: 104, opacity: "0.14", rotation: 10, driftX: -12, driftY: 16, driftRotate: -8, duration: 29 },
  { left: "16%", top: "78%", size: 124, opacity: "0.13", rotation: -14, driftX: 18, driftY: -16, driftRotate: 12, duration: 31 },
  { left: "84%", top: "76%", size: 118, opacity: "0.15", rotation: 12, driftX: -16, driftY: -18, driftRotate: -11, duration: 27 },
  { left: "50%", top: "14%", size: 92, opacity: "0.1", rotation: 0, driftX: 0, driftY: 14, driftRotate: 6, duration: 33 },
  { left: "50%", top: "82%", size: 102, opacity: "0.1", rotation: 0, driftX: 0, driftY: -14, driftRotate: -6, duration: 35 },
];
const FILLED_DISPLAY_MOTIFS = new Set(["flower"]);

const state = {
  user: null,
  affirmations: [],
  selectedTheme: "random",
  editingId: null,
  displayQueue: [],
  displayIndex: -1,
  currentDisplayId: null,
  displaySequence: null,
  displaySkinId: null,
  lastDisplaySkinId: null,
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
  displayMotifLayer: document.querySelector("#displayMotifLayer"),
  displayStage: document.querySelector("#displayStage"),
  displayFrame: document.querySelector("#displayFrame"),
  displayText: document.querySelector("#displayText"),
  displayAnnouncer: document.querySelector("#displayAnnouncer"),
  displayFooter: document.querySelector("#displayFooter"),
  displayProgressFill: document.querySelector("#displayProgressFill"),
  displayProgressLabel: document.querySelector("#displayProgressLabel"),
  startDisplay: document.querySelector("#startDisplay"),
  skipDisplay: document.querySelector("#skipDisplay"),
  exitDisplay: document.querySelector("#exitDisplay"),
};
let displayFitFrame = 0;
let displayTouchStart = null;
let suppressDisplayClickUntil = 0;

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

function getRenderedTextMetrics(textElement, frameElement) {
  const frameRect = frameElement.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(textElement);
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);

  if (!rects.length) {
    return null;
  }

  let minLeft = Number.POSITIVE_INFINITY;
  let maxRight = Number.NEGATIVE_INFINITY;
  let minTop = Number.POSITIVE_INFINITY;
  let maxBottom = Number.NEGATIVE_INFINITY;

  rects.forEach((rect) => {
    minLeft = Math.min(minLeft, rect.left);
    maxRight = Math.max(maxRight, rect.right);
    minTop = Math.min(minTop, rect.top);
    maxBottom = Math.max(maxBottom, rect.bottom);
  });

  return {
    leftOverflow: Math.max(0, frameRect.left - minLeft),
    rightOverflow: Math.max(0, maxRight - frameRect.right),
    renderedHeight: maxBottom - minTop,
    frameHeight: frameRect.height,
  };
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
  const themes = [...new Set([...BUILTIN_THEMES, ...state.affirmations.map((item) => item.theme)])].sort();
  return ["random", ...themes];
}

function getFilteredAffirmations(theme = state.selectedTheme) {
  if (theme === "random") {
    return [...state.affirmations];
  }

  return state.affirmations.filter((item) => item.theme === theme);
}

function getDisplayAffirmations(theme = state.selectedTheme) {
  const rows = getFilteredAffirmations(theme);

  if (theme === "random") {
    return rows.filter((item) => item.theme !== "long");
  }

  return rows;
}

function getThemeSummary(theme = state.selectedTheme) {
  if (theme === "random") {
    return "Showing affirmations from every short theme. Long stays separate.";
  }

  if (theme === "long") {
    return "Showing long affirmations one line at a time with progress.";
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

function pickRandom(list) {
  if (!list.length) {
    return null;
  }

  return list[Math.floor(Math.random() * list.length)] || null;
}

function chooseDisplaySkin() {
  const pool = DISPLAY_SKINS.length > 1 && state.lastDisplaySkinId
    ? DISPLAY_SKINS.filter((skin) => skin.id !== state.lastDisplaySkinId)
    : DISPLAY_SKINS;

  return pickRandom(pool) || DISPLAY_SKINS[0] || null;
}

function renderDisplayMotifs(skin) {
  if (!elements.displayMotifLayer) {
    return;
  }

  const availableIcons = shuffle((skin?.motifs || []).filter((name) => DISPLAY_MOTIFS[name]));
  const availableLayouts = shuffle(DISPLAY_MOTIF_LAYOUTS);
  const motifCount = Math.min(availableLayouts.length, availableIcons.length, 3);

  if (!motifCount) {
    elements.displayMotifLayer.innerHTML = "";
    return;
  }

  elements.displayMotifLayer.innerHTML = availableIcons.slice(0, motifCount).map((name, index) => {
    const layout = availableLayouts[index];
    const filledClass = FILLED_DISPLAY_MOTIFS.has(name) ? " is-filled" : "";
    return `
      <span
        class="display-motif${filledClass}"
        style="left:${layout.left};top:${layout.top};--size:${layout.size}px;--opacity:${layout.opacity};--rotation:${layout.rotation}deg;--drift-x:${layout.driftX}px;--drift-y:${layout.driftY}px;--drift-rotate:${layout.driftRotate}deg;--duration:${layout.duration}s;"
      >${DISPLAY_MOTIFS[name]}</span>
    `;
  }).join("");
}

function applyDisplaySkin() {
  const skin = chooseDisplaySkin();
  if (!skin) {
    return;
  }

  state.displaySkinId = skin.id;
  state.lastDisplaySkinId = skin.id;
  elements.displayMode.dataset.skin = skin.id;

  const style = elements.displayMode.style;
  style.setProperty("--display-bg-start", skin.bgStart);
  style.setProperty("--display-bg-end", skin.bgEnd);
  style.setProperty("--display-text", skin.textColor);
  style.setProperty("--display-accent", skin.accentColor);
  style.setProperty("--display-accent-strong", skin.accentStrong);
  style.setProperty("--display-surface", skin.surface);
  style.setProperty("--display-surface-border", skin.surfaceBorder);
  style.setProperty("--display-surface-text", skin.surfaceText);
  style.setProperty("--display-font", skin.fontFamily);
  style.setProperty("--display-font-weight", skin.fontWeight);
  style.setProperty("--display-line-height", skin.lineHeight);
  style.setProperty("--display-letter-spacing", skin.letterSpacing);
  style.setProperty("--display-text-shadow", skin.textShadow);
  style.setProperty("--display-glow-a", skin.glowA);
  style.setProperty("--display-glow-b", skin.glowB);
  style.setProperty("--display-glow-c", skin.glowC);
  style.setProperty("--display-motif", skin.motifColor);

  renderDisplayMotifs(skin);
}

function isLongAffirmation(item) {
  return item?.theme === "long";
}

function getLongAffirmationSteps(body) {
  const steps = cleanAffirmationBody(body)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return steps.length ? steps : [""];
}

function hasSkippableLongSequence() {
  return Boolean(state.displaySequence && state.displaySequence.steps.length > 1);
}

function getWrappedDisplayIndex(index) {
  const total = state.displayQueue.length;
  if (!total) {
    return -1;
  }

  return ((index % total) + total) % total;
}

function renderThemeOptions() {
  const themes = getThemes().filter((theme) => theme !== "random");
  const availableThemes = [...new Set(["personal", ...themes])];
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
    state.displaySequence = null;
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
    state.currentDisplayId = null;
    state.displaySequence = null;
    buildDisplayQueue();
    renderControls();
    renderLibrary();
    renderDisplayItem(getCurrentDisplayAffirmation());
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

function hideDisplayProgress() {
  elements.displayFooter.hidden = true;
  elements.displayProgressFill.style.width = "0%";
  elements.displayProgressLabel.textContent = "";
}

function syncDisplayControls() {
  if (!elements.skipDisplay) {
    return;
  }

  const canSkip = hasSkippableLongSequence();
  elements.skipDisplay.hidden = !canSkip;
  elements.skipDisplay.disabled = !canSkip;
}

function updateDisplayProgress(stepIndex, totalSteps, label = "Line", options = {}) {
  const hideWhenSingle = options.hideWhenSingle ?? false;

  if (totalSteps <= 0 || (hideWhenSingle && totalSteps <= 1)) {
    hideDisplayProgress();
    return;
  }

  const currentStep = Math.min(Math.max(stepIndex + 1, 1), totalSteps);
  const progress = (currentStep / totalSteps) * 100;
  elements.displayFooter.hidden = false;
  elements.displayProgressFill.style.width = `${progress}%`;
  elements.displayProgressLabel.textContent = `${label} ${currentStep} of ${totalSteps}.`;
}

function renderLongSequenceStep(item) {
  const sequence = state.displaySequence;

  if (!item || !sequence) {
    return;
  }

  const line = sequence.steps[sequence.index] || "";
  elements.displayText.textContent = line;
  elements.displayAnnouncer.textContent = `Line ${sequence.index + 1} of ${sequence.steps.length}. ${line}`;
  updateDisplayProgress(sequence.index, sequence.steps.length, "Line", { hideWhenSingle: true });
  syncDisplayControls();
  scheduleDisplayFit();
}

function renderRegularDisplayProgress() {
  if (state.displayIndex < 0 || !state.displayQueue.length) {
    hideDisplayProgress();
    return;
  }

  updateDisplayProgress(state.displayIndex, state.displayQueue.length, "Affirmation");
}

function renderDisplayItem(item, options = {}) {
  const startAtEnd = options.startAtEnd ?? false;

  if (!item) {
    state.displaySequence = null;
    state.currentDisplayId = null;
    elements.displayText.textContent = "No affirmations in this theme yet.";
    elements.displayAnnouncer.textContent = "No affirmations available.";
    hideDisplayProgress();
    syncDisplayControls();
    scheduleDisplayFit();
    return;
  }

  state.currentDisplayId = item.id;

  if (isLongAffirmation(item)) {
    const steps = getLongAffirmationSteps(item.body);
    state.displaySequence = {
      itemId: item.id,
      steps,
      index: startAtEnd ? steps.length - 1 : 0,
    };
    renderLongSequenceStep(item);
    return;
  }

  state.displaySequence = null;
  elements.displayText.textContent = item.body;
  elements.displayAnnouncer.textContent = `Affirmation ${state.displayIndex + 1} of ${state.displayQueue.length}. ${item.body}`;
  renderRegularDisplayProgress();
  syncDisplayControls();
  scheduleDisplayFit();
}

function buildDisplayQueue(startItem = null) {
  const rows = startItem
    ? getDisplayAffirmations(startItem.theme)
    : getDisplayAffirmations();

  if (!rows.length) {
    state.displayQueue = [];
    state.displayIndex = -1;
    return;
  }

  if (startItem) {
    state.displayQueue = [startItem, ...shuffle(rows.filter((item) => item.id !== startItem.id))];
    state.displayIndex = 0;
    return;
  }

  state.displayQueue = shuffle(rows);
  state.displayIndex = 0;
}

function getCurrentDisplayAffirmation() {
  if (state.displayIndex < 0 || state.displayIndex >= state.displayQueue.length) {
    return null;
  }

  return state.displayQueue[state.displayIndex] || null;
}

function getNextAffirmation() {
  if (!state.displayQueue.length) {
    return null;
  }

  if (state.displayIndex < 0) {
    state.displayIndex = 0;
    return getCurrentDisplayAffirmation();
  }

  state.displayIndex = getWrappedDisplayIndex(state.displayIndex + 1);
  return getCurrentDisplayAffirmation();
}

function getPreviousAffirmation() {
  if (!state.displayQueue.length) {
    return null;
  }

  if (state.displayIndex < 0) {
    state.displayIndex = state.displayQueue.length - 1;
    return getCurrentDisplayAffirmation();
  }

  state.displayIndex = getWrappedDisplayIndex(state.displayIndex - 1);
  return getCurrentDisplayAffirmation();
}

function fitDisplayText() {
  const stage = elements.displayStage;
  const frame = elements.displayFrame;
  const text = elements.displayText;

  if (!stage || !frame || !text) {
    return;
  }

  let fontSize = Math.min(frame.clientWidth * 0.42, stage.clientHeight * 0.24, 180);
  const minSize = 26;
  const verticalSafety = Math.max(18, stage.clientHeight * 0.035);
  const availableWidth = Math.max(120, frame.clientWidth);
  const availableHeight = Math.max(120, frame.clientHeight - verticalSafety * 2);
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

  const edgeTolerance = 2;

  text.style.fontSize = `${fontSize}px`;
  while (fontSize > minSize) {
    const metrics = getRenderedTextMetrics(text, frame);
    const exceedsWidth = metrics
      ? metrics.leftOverflow > edgeTolerance || metrics.rightOverflow > edgeTolerance
      : false;
    const exceedsHeight = metrics
      ? metrics.renderedHeight > metrics.frameHeight - verticalSafety
      : false;

    if (!exceedsWidth && !exceedsHeight) {
      break;
    }

    fontSize = Math.max(minSize, fontSize - 2);
    text.style.fontSize = `${fontSize}px`;
  }
}

function showNextAffirmation() {
  if (state.displaySequence && state.displaySequence.index < state.displaySequence.steps.length - 1) {
    state.displaySequence.index += 1;
    renderLongSequenceStep(getAffirmationById(state.displaySequence.itemId));
    return;
  }

  state.displaySequence = null;
  renderDisplayItem(getNextAffirmation());
}

function showPreviousAffirmation() {
  if (state.displaySequence && state.displaySequence.index > 0) {
    state.displaySequence.index -= 1;
    renderLongSequenceStep(getAffirmationById(state.displaySequence.itemId));
    return;
  }

  state.displaySequence = null;
  renderDisplayItem(getPreviousAffirmation(), { startAtEnd: true });
}

function skipCurrentAffirmation() {
  if (!hasSkippableLongSequence()) {
    return;
  }

  state.displaySequence = null;
  renderDisplayItem(getNextAffirmation());
}

function openDisplayMode(startItem = null) {
  elements.displayMode.hidden = false;
  document.body.style.overflow = "hidden";
  state.displayQueue = [];
  state.displayIndex = -1;
  state.currentDisplayId = null;
  state.displaySequence = null;
  applyDisplaySkin();

  if (startItem) {
    buildDisplayQueue(startItem);
    renderDisplayItem(getCurrentDisplayAffirmation());
  } else {
    buildDisplayQueue();
    renderDisplayItem(getCurrentDisplayAffirmation());
  }

  elements.displayBody.focus();
  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      if (!elements.displayMode.hidden) {
        scheduleDisplayFit();
      }
    });
  }
}

function closeDisplayMode() {
  elements.displayMode.hidden = true;
  document.body.style.overflow = "";
  state.displayQueue = [];
  state.displayIndex = -1;
  state.currentDisplayId = null;
  state.displaySequence = null;
  state.displaySkinId = null;
  hideDisplayProgress();
  syncDisplayControls();
  displayTouchStart = null;
  if (elements.displayMotifLayer) {
    elements.displayMotifLayer.innerHTML = "";
  }
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
  state.displayIndex = -1;
  state.currentDisplayId = null;
  state.displaySequence = null;
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

function getDisplayDirectionForPoint(clientX) {
  const bounds = elements.displayBody.getBoundingClientRect();
  if (!bounds.width) {
    return 1;
  }

  return clientX < bounds.left + (bounds.width / 2) ? -1 : 1;
}

elements.startDisplay.addEventListener("click", startDisplayFromCurrentTheme);
if (elements.startDisplayTop) {
  elements.startDisplayTop.addEventListener("click", startDisplayFromCurrentTheme);
}
elements.skipDisplay.addEventListener("click", skipCurrentAffirmation);
elements.exitDisplay.addEventListener("click", closeDisplayMode);

elements.displayBody.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  if (Date.now() < suppressDisplayClickUntil) return;
  const direction = getDisplayDirectionForPoint(event.clientX);
  if (direction < 0) {
    showPreviousAffirmation();
    return;
  }

  showNextAffirmation();
});

elements.displayBody.addEventListener("touchstart", (event) => {
  if (!hasSkippableLongSequence() || event.touches.length !== 1) {
    displayTouchStart = null;
    return;
  }

  const touch = event.touches[0];
  displayTouchStart = {
    x: touch.clientX,
    y: touch.clientY,
  };
}, { passive: true });

elements.displayBody.addEventListener("touchend", (event) => {
  if (!hasSkippableLongSequence() || !displayTouchStart || event.changedTouches.length !== 1) {
    displayTouchStart = null;
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - displayTouchStart.x;
  const deltaY = touch.clientY - displayTouchStart.y;
  displayTouchStart = null;

  if (deltaX > -70) return;
  if (Math.abs(deltaY) > 48) return;
  if (Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;

  suppressDisplayClickUntil = Date.now() + 500;
  skipCurrentAffirmation();
}, { passive: true });

elements.displayBody.addEventListener("touchcancel", () => {
  displayTouchStart = null;
});

document.addEventListener("keydown", (event) => {
  if (elements.displayMode.hidden) return;

  if (event.key === "Escape") {
    closeDisplayMode();
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    showPreviousAffirmation();
    return;
  }

  if (event.key === " " || event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    showNextAffirmation();
    return;
  }

  if ((event.key === "n" || event.key === "N") && hasSkippableLongSequence()) {
    event.preventDefault();
    skipCurrentAffirmation();
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
