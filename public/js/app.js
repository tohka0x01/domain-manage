/**
 * Domain Manager - Modern Glass UI
 * Handles interactions, data fetching, and dynamic rendering.
 */

const API_BASE = "/api";

// Access verification state
let isAccessVerified = false;

// State
let domains = [];
let settings = {};
let editingDomainId = null;
let deletingDomainId = null;
// Pagination state
let currentPage = 1;
let pageSize = 10;

// Template Presets
const templatePresets = {
  default: `⚠️ 域名到期提醒 | Domain Expiry Alert

🌐 域名 Domain: {domain}
📋 注册商 Registrar: {registrar}
📅 到期时间 Expiry: {expire_date}
⏰ 剩余天数 Days Left: {days_left} 天

请及时续费！Please renew in time!`,

  simple: `⚠️ 域名 {domain} 即将到期！
剩余 {days_left} 天`,

  detailed: `🔔 域名到期提醒

📌 域名信息：
  • 域名：{domain}
  • 注册商：{registrar}
  • 到期时间：{expire_date}
  • 剩余天数：{days_left} 天

⚡️ 操作建议：
  1. 登录注册商后台
  2. 检查域名状态
  3. 及时完成续费

💡 提示：建议开启自动续费功能，避免域名过期。`,

  urgent: `🚨🚨🚨 紧急提醒 🚨🚨🚨

⚠️ 域名 {domain} 即将到期！
📅 到期日期：{expire_date}
⏰ 仅剩 {days_left} 天！

📋 注册商：{registrar}

⚡️ 请立即续费，避免域名被释放！`,
};

// DOM Elements Cache
let elements = {};

function initElements() {
  elements = {
    // Layout
    siteTitle: document.getElementById("siteTitle"),
    loadingState: document.getElementById("loadingState"),
    emptyState: document.getElementById("emptyState"),
    domainList: document.getElementById("domainList"),

    // Stats
    statTotal: document.getElementById("statTotal"),
    statExpiring30: document.getElementById("statExpiring30"),
    statExpiring7: document.getElementById("statExpiring7"),
    statExpired: document.getElementById("statExpired"),

    // Search & Filter
    searchInput: document.getElementById("searchInput"),
    filterBtn: document.getElementById("filterBtn"),
    filterPanel: document.getElementById("filterPanel"),
    suffixFilters: document.getElementById("suffixFilters"),
    registrarFilters: document.getElementById("registrarFilters"),
    hostingFilters: document.getElementById("hostingFilters"),
    clearFilters: document.getElementById("clearFilters"),
    applyFilters: document.getElementById("applyFilters"),

    // Modals
    domainModal: document.getElementById("domainModal"),
    settingsModal: document.getElementById("settingsModal"),
    deleteModal: document.getElementById("deleteModal"),

    // Forms
    domainForm: document.getElementById("domainForm"),
    settingsForm: document.getElementById("settingsForm"),

    // Domain Form Inputs
    modalTitle: document.getElementById("modalTitle"),
    domainName: document.getElementById("domainName"),
    registrar: document.getElementById("registrar"),
    registrarUrl: document.getElementById("registrarUrl"),
    hostingProvider: document.getElementById("hostingProvider"),
    hostingUrl: document.getElementById("hostingUrl"),
    currencySymbol: document.getElementById("currencySymbol"),
    purchasePrice: document.getElementById("purchasePrice"),
    renewalPrice: document.getElementById("renewalPrice"),
    purchasePeriod: document.getElementById("purchasePeriod"),
    renewalPeriod: document.getElementById("renewalPeriod"),
    expireDate: document.getElementById("expireDate"),
    noExpireBtn: document.getElementById("noExpireBtn"),
    notes: document.getElementById("notes"),

    // Settings Form Inputs
    siteName: document.getElementById("siteName"),
    notifyDays: document.getElementById("notifyDays"),
    telegramBotToken: document.getElementById("telegramBotToken"),
    telegramChatId: document.getElementById("telegramChatId"),
    telegramNotifyTemplate: document.getElementById("telegramNotifyTemplate"),
    templatePreset: document.getElementById("templatePreset"),

    // Delete Modal Inputs
    deleteDomainName: document.getElementById("deleteDomainName"),

    // Toast
    toastContainer: document.getElementById("toastContainer"),
  };
}

/* ========== Translations ========== */
// ... (translations object remains same, skipping for brevity in replacement if possible, but replace_file_content needs contiguous block)
// Since I can't skip, I will target the `elements` definition and `DOMContentLoaded` block separately.

/* ========== Initialization ========== */
function init() {
  console.log("Initializing App...");

  // ⚠️ SECURITY: 先检查验证状态，只初始化 UI，不加载数据
  // 数据加载会在验证通过后由 hideAccessOverlay() 函数触发
  checkAccessVerification();

  initElements();
  initEventListeners();
  initFlatpickr();
  updateUIText();

  // ✅ 如果已经验证过（localStorage 中有记录），则加载数据
  // 如果未验证，数据会在 hideAccessOverlay() 中加载
  if (isAccessVerified) {
    loadData();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* ========== Translations ========== */
const translations = {
  en: {
    siteTitle: "Domain Manager",
    newDomain: "New Domain",
    totalDomains: "Total Domains",
    expiring30: "Expiring (30d)",
    expiring7: "Expiring (7d)",
    expired: "Expired",
    searchPlaceholder: "Search domains...",
    filter: "Filter",
    filterTld: "TLD",
    filterRegistrar: "Registrar",
    filterHosting: "Hosting",
    clear: "Clear",
    apply: "Apply",
    loading: "Loading your digital assets...",
    emptyTitle: "No Domains Found",
    emptyText: "Start your collection by adding a new domain.",
    headerDomain: "Domain",
    headerHosting: "Hosting",
    headerPurchase: "Purchase",
    headerRenewal: "Renewal",
    headerExpiry: "Expiry Date",
    headerActions: "Actions",
    modalAddTitle: "Add New Domain",
    modalEditTitle: "Edit Domain",
    labelDomain: "Domain Name",
    labelRegistrar: "Registrar",
    labelRegistrarUrl: "Registrar URL",
    labelHosting: "Hosting",
    labelHostingUrl: "Hosting URL",
    labelCurrency: "Currency",
    labelPurchase: "Purchase Price",
    labelRenewal: "Renewal Price",
    labelExpiry: "Expiry Date",
    labelIndefinite: "Indefinite",
    labelNotes: "Notes",
    btnCancel: "Cancel",
    btnSave: "Save Domain",
    modalSettingsTitle: "Settings",
    labelSiteName: "Site Name",
    labelNotify: "Notification Days",
    hintNotify: "Comma separated days, e.g. 30,7",
    labelToken: "Telegram Bot Token",
    labelTemplate: "Notification Template",
    hintTemplate:
      "Variables: {domain}, {registrar}, {expire_date}, {days_left}",
    btnSaveSettings: "Save Settings",
    modalDeleteTitle: "Confirm Delete",
    textDelete: "Are you sure you want to delete",
    textDeleteSuffix: "? This action cannot be undone.",
    btnDelete: "Delete",
    toastAdded: "Domain added successfully",
    toastUpdated: "Domain updated successfully",
    toastDeleted: "Domain deleted",
    toastSettingsSaved: "Settings saved",
    toastError: "Operation failed",
    toastNetworkError: "Network error, please try again",
    toastRequired: "Domain name is required",
    toastTestSuccess: "Connection successful!",
    toastTestFail: "Connection failed",
    daysLeft: "days left",
    expiresIn: "Expires in",
    expiredAgo: "Expired",
    ago: "d ago",
    indefinite: "Indefinite",
    noRegistrar: "No Registrar",
    // Template Preset Dropdown
    templatePresetPlaceholder: "📋 Select Preset...",
    templatePresetDefault: "⚠️ Default (Bilingual)",
    templatePresetSimple: "💬 Simple",
    templatePresetDetailed: "📝 Detailed",
    templatePresetUrgent: "🚨 Urgent Alert",
    priceFree: "Free",
  },
  zh: {
    siteTitle: "域名管理",
    newDomain: "新增域名",
    totalDomains: "域名总数",
    expiring30: "即将到期 (30天)",
    expiring7: "即将到期 (7天)",
    expired: "已过期",
    searchPlaceholder: "搜索域名...",
    filter: "筛选",
    filterTld: "后缀",
    filterRegistrar: "注册商",
    filterHosting: "托管商",
    clear: "清除",
    apply: "应用",
    loading: "正在加载您的数字资产...",
    emptyTitle: "未找到域名",
    emptyText: "开始添加您的第一个域名吧。",
    headerDomain: "域名",
    headerHosting: "托管商",
    headerPurchase: "购买价格",
    headerRenewal: "续费价格",
    headerExpiry: "到期日期",
    headerActions: "操作",
    modalAddTitle: "新增域名",
    modalEditTitle: "编辑域名",
    labelDomain: "域名",
    labelRegistrar: "注册商",
    labelRegistrarUrl: "注册商链接",
    labelHosting: "托管商",
    labelHostingUrl: "托管商链接",
    labelCurrency: "货币符号",
    labelPurchase: "购买价格",
    labelRenewal: "续费价格",
    labelExpiry: "到期日期",
    labelIndefinite: "永久/长期",
    labelNotes: "备注",
    btnCancel: "取消",
    btnSave: "保存域名",
    modalSettingsTitle: "设置",
    labelSiteName: "站点名称",
    labelNotify: "通知提醒 (天)",
    hintNotify: "用逗号分隔，例如 30,7",
    labelToken: "Telegram Bot Token",
    labelTemplate: "通知模板",
    hintTemplate: "可用变量: {domain}, {registrar}, {expire_date}, {days_left}",
    btnSaveSettings: "保存设置",
    modalDeleteTitle: "确认删除",
    textDelete: "您确定要删除",
    textDeleteSuffix: "吗？此操作无法撤销。",
    btnDelete: "删除",
    toastAdded: "域名添加成功",
    toastUpdated: "域名更新成功",
    toastDeleted: "域名已删除",
    toastSettingsSaved: "设置已保存",
    toastError: "操作失败",
    toastNetworkError: "网络错误，请重试",
    toastRequired: "域名不能为空",
    toastTestSuccess: "连接成功！",
    toastTestFail: "连接失败",
    daysLeft: "天后到期",
    expiresIn: "剩余",
    expiredAgo: "已过期",
    ago: "天",
    indefinite: "永久",
    noRegistrar: "无注册商",
    // Template Preset Dropdown
    templatePresetPlaceholder: "📋 选择预设模板...",
    templatePresetDefault: "⚠️ 默认模板（双语）",
    templatePresetSimple: "💬 简洁版",
    templatePresetDetailed: "📝 详细版",
    templatePresetUrgent: "🚨 紧急提醒",
    priceFree: "免费",
  },
};

let currentLang = "zh"; // Default to Chinese

function t(key) {
  return translations[currentLang][key] || key;
}

function toggleLanguage() {
  currentLang = currentLang === "zh" ? "en" : "zh";
  document.querySelector("#langBtn .lang-text").textContent =
    currentLang === "zh" ? "CN" : "EN";
  updateUIText();
  renderDomainList(); // Re-render list to update dynamic text
  loadStats(); // Re-render stats text
}

// Update template preset dropdown options
function updateTemplatePresetOptions() {
  if (!elements.templatePreset) return;

  const currentValue = elements.templatePreset.value; // Save current selection

  elements.templatePreset.innerHTML = `
    <option value="">${t("templatePresetPlaceholder")}</option>
    <option value="default">${t("templatePresetDefault")}</option>
    <option value="simple">${t("templatePresetSimple")}</option>
    <option value="detailed">${t("templatePresetDetailed")}</option>
    <option value="urgent">${t("templatePresetUrgent")}</option>
  `;

  // Restore selection if it was set
  if (currentValue) {
    elements.templatePreset.value = currentValue;
  }
}

function updateUIText() {
  // Static Elements
  elements.siteTitle.textContent = settings.site_name || t("siteTitle");
  document.getElementById("addDomainBtn").querySelector("span").textContent =
    t("newDomain");

  // Template Preset Dropdown
  updateTemplatePresetOptions();

  // Stats Labels
  document.querySelectorAll(".stat-label")[0].textContent = t("totalDomains");
  document.querySelectorAll(".stat-label")[1].textContent = t("expiring30");
  document.querySelectorAll(".stat-label")[2].textContent = t("expiring7");
  document.querySelectorAll(".stat-label")[3].textContent = t("expired");

  // Search & Filter
  elements.searchInput.placeholder = t("searchPlaceholder");
  document.getElementById("filterBtn").querySelector("span").textContent =
    t("filter");
  document.querySelectorAll(".filter-label")[0].textContent = t("filterTld");
  document.querySelectorAll(".filter-label")[1].textContent =
    t("filterRegistrar");
  document.querySelectorAll(".filter-label")[2].textContent =
    t("filterHosting");
  elements.clearFilters.textContent = t("clear");
  elements.applyFilters.textContent = t("apply");

  // List Header
  const headers = document.querySelectorAll(".header-col");
  if (headers.length > 0) {
    headers[0].textContent = t("headerDomain");
    headers[1].textContent = t("filterRegistrar"); // Reusing existing translation
    headers[2].textContent = t("headerHosting");
    headers[3].textContent = t("headerPurchase");
    headers[4].textContent = t("headerRenewal");
    headers[5].textContent = t("headerExpiry");
    headers[6].textContent = t("headerActions");
  }

  // Empty/Loading
  document.querySelector("#loadingState p").textContent = t("loading");
  document.querySelector("#emptyState h3").textContent = t("emptyTitle");
  document.querySelector("#emptyState p").textContent = t("emptyText");

  // Modals - Add/Edit
  document.querySelector("label[for='domainName']").textContent =
    t("labelDomain");
  document.querySelector("label[for='registrar']").textContent =
    t("labelRegistrar");
  document.querySelector("label[for='registrarUrl']").textContent =
    t("labelRegistrarUrl");
  document.querySelector("label[for='hostingProvider']").textContent =
    t("labelHosting");
  document.querySelector("label[for='hostingUrl']").textContent =
    t("labelHostingUrl");
  document.querySelector("label[for='currencySymbol']").textContent =
    t("labelCurrency");
  document.querySelector("label[for='purchasePrice']").textContent =
    t("labelPurchase");
  document.querySelector("label[for='renewalPrice']").textContent =
    t("labelRenewal");
  document.querySelector("label[for='expireDate']").textContent =
    t("labelExpiry");
  document.querySelector("#noExpireBtn .text").textContent =
    t("labelIndefinite");
  document.querySelector("label[for='notes']").textContent = t("labelNotes");
  document.getElementById("modalCancel").textContent = t("btnCancel");
  document.getElementById("modalSubmit").textContent = t("btnSave");

  // Modals - Settings
  document.querySelector("#settingsModal h2").textContent =
    t("modalSettingsTitle");
  document.querySelector("label[for='siteName']").textContent =
    t("labelSiteName");
  document.querySelector("label[for='notifyDays']").textContent =
    t("labelNotify");
  // Fix: Select hint relative to input, not label
  const notifyHint = document.querySelector("#notifyDays + .form-hint");
  if (notifyHint) notifyHint.textContent = t("hintNotify");

  document.querySelector("label[for='telegramBotToken']").textContent =
    t("labelToken");
  document.querySelector("label[for='telegramNotifyTemplate']").textContent =
    t("labelTemplate");

  const templateHint = document.querySelector(
    "#telegramNotifyTemplate + .form-hint"
  );
  if (templateHint) templateHint.textContent = t("hintTemplate");
  document.getElementById("settingsCancel").textContent = t("btnCancel");
  document.getElementById("settingsSave").textContent = t("btnSaveSettings");

  // Modals - Delete
  document.querySelector("#deleteModal h2").textContent = t("modalDeleteTitle");
  document.getElementById("deleteCancel").textContent = t("btnCancel");
  document.getElementById("deleteConfirm").textContent = t("btnDelete");
}

/* ========== Initialization ========== */

/* ========== Data Loading ========== */
/* ========== Data Loading ========== */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function loadData() {
  console.log("loadData called");
  try {
    // 1. Load Domains FIRST (Critical)
    await loadDomains();

    // Hide loading state immediately after domains attempt
    if (elements.loadingState) elements.loadingState.style.display = "none";

    // 2. Load other data in background (Non-blocking)
    loadStats();
    loadSettings();

    console.log("loadData initiated");
  } catch (error) {
    console.error("Critical error in loadData:", error);
    showToast(t("toastError"), "error");
  } finally {
    // Double safety
    if (elements.loadingState) elements.loadingState.style.display = "none";
  }
}

async function loadDomains() {
  console.log("loadDomains called");
  try {
    const response = await fetchWithTimeout(`${API_BASE}/domains`);
    const result = await response.json();
    if (response.ok) {
      console.log("Domains loaded:", result.data ? result.data.length : 0);
      domains = result.data || [];
      renderDomainList();
      updateFilters();
    } else {
      throw new Error(result.error || "Failed to fetch domains");
    }
  } catch (e) {
    console.error("Error loading domains:", e);
    showToast(t("toastError"), "error");
    // Ensure we render empty state on error
    domains = [];
    renderDomainList();
  }
}

async function loadSettings() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/settings`);
    const result = await response.json();
    if (response.ok) {
      settings = result.data || {};
      applySettings();
    }
  } catch (error) {
    console.error("Settings load error:", error);
  }
}

async function loadStats() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/stats`);
    const result = await response.json();
    if (response.ok) {
      const stats = result.data;
      animateNumber(elements.statTotal, stats.total);
      animateNumber(elements.statExpiring30, stats.expiring_30_days);
      animateNumber(elements.statExpiring7, stats.expiring_7_days);
      animateNumber(elements.statExpired, stats.expired);
    }
  } catch (error) {
    console.error("Stats load error:", error);
  }
}

function applySettings() {
  if (settings.site_name) {
    elements.siteTitle.textContent = settings.site_name;
    document.title = settings.site_name;
  } else {
    elements.siteTitle.textContent = t("siteTitle");
    document.title = t("siteTitle");
  }
}

/* ========== Flatpickr Initialization ========== */
let datePicker = null;

function initFlatpickr() {
  if (!elements.expireDate || typeof flatpickr === "undefined") {
    console.warn("Flatpickr not loaded or expireDate element not found");
    return;
  }

  // Initialize Flatpickr (manual input only, no calendar popup)
  datePicker = flatpickr(elements.expireDate, {
    dateFormat: "Y-m-d",
    allowInput: true,
    clickOpens: false, // Disable calendar popup - manual input only
    disableMobile: true,
    minDate: "today",
    onChange: function (selectedDates, dateStr, instance) {
      // Auto-deactivate "Indefinite" button when a date is entered
      if (dateStr && elements.noExpireBtn.classList.contains("active")) {
        elements.noExpireBtn.classList.remove("active");
        elements.expireDate.disabled = false;
      }
    },
  });
}

/* ========== Event Listeners ========== */
function initEventListeners() {
  // Language Toggle
  document.getElementById("langBtn").addEventListener("click", toggleLanguage);

  // --- Modals ---
  // Close modals on backdrop click
  [elements.domainModal, elements.settingsModal, elements.deleteModal].forEach(
    (modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  );

  // Domain Modal
  document.getElementById("addDomainBtn").addEventListener("click", () => {
    openAddModal();
  });
  document.getElementById("modalCancel").addEventListener("click", () => {
    closeModal(elements.domainModal);
  });
  elements.domainForm.addEventListener("submit", handleDomainSubmit);

  // Settings Modal
  document.getElementById("settingsBtn").addEventListener("click", () => {
    openSettingsModal();
  });
  document.getElementById("settingsCancel").addEventListener("click", () => {
    closeModal(elements.settingsModal);
  });
  elements.settingsForm.addEventListener("submit", handleSettingsSubmit);

  // Backup & Import
  document.getElementById("btnBackup").addEventListener("click", handleBackup);
  document.getElementById("btnImport").addEventListener("click", () => {
    document.getElementById("importFileInput").click();
  });
  document
    .getElementById("importFileInput")
    .addEventListener("change", handleImport);

  // Delete Modal
  document
    .getElementById("deleteCancel")
    .addEventListener("click", () => closeModal(elements.deleteModal));
  document
    .getElementById("deleteConfirm")
    .addEventListener("click", confirmDelete);

  // Search & Filter
  elements.searchInput.addEventListener("input", () => {
    currentPage = 1; // Reset to page 1 when searching
    renderDomainList();
  });
  elements.filterBtn.addEventListener("click", () => {
    elements.filterPanel.classList.toggle("show");
  });

  elements.clearFilters.addEventListener("click", clearAllFilters);
  elements.applyFilters.addEventListener("click", () => {
    currentPage = 1; // Reset to page 1 when applying filters
    elements.filterPanel.classList.remove("show");
    renderDomainList();
  });

  // Telegram Test
  document
    .getElementById("testTelegramBtn")
    .addEventListener("click", handleTelegramTest);

  // Template Preset Selection
  elements.templatePreset.addEventListener("change", (e) => {
    const selectedPreset = e.target.value;
    if (selectedPreset && templatePresets[selectedPreset]) {
      elements.telegramNotifyTemplate.value = templatePresets[selectedPreset];
    }
  });

  // Indefinite Expiry Toggle Button
  elements.noExpireBtn.addEventListener("click", function () {
    this.classList.toggle("active");

    if (this.classList.contains("active")) {
      // Button active: disable date input and clear value
      elements.expireDate.disabled = true;
      elements.expireDate.value = "";
      if (datePicker) {
        datePicker.clear();
      }
    } else {
      // Button inactive: enable date input
      elements.expireDate.disabled = false;
    }
  });
}

/* ========== Rendering ========== */
function renderDomainList() {
  const filtered = filterDomains();

  if (filtered.length === 0) {
    elements.emptyState.style.display = "block";
    elements.domainList.style.display = "none";
    document.getElementById("pagination")?.remove();
    return;
  }

  elements.emptyState.style.display = "none";
  elements.domainList.style.display = "flex"; // Changed to flex for row layout

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filtered.slice(startIndex, endIndex);

  elements.domainList.innerHTML = paginatedData.map(createDomainCard).join("");

  // Re-attach event listeners to dynamic buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      openDeleteModal(btn.dataset.id, btn.dataset.name)
    );
  });

  // Render pagination
  renderPagination(filtered.length, totalPages);
}

// Pagination rendering
function renderPagination(totalItems, totalPages) {
  // Remove existing pagination if any
  document.getElementById("pagination")?.remove();

  // Don't show pagination if only one page
  if (totalPages <= 1) return;

  // Create pagination container
  const paginationContainer = document.createElement("div");
  paginationContainer.id = "pagination";
  paginationContainer.className = "pagination-container";

  // Create pagination HTML
  let paginationHTML = `
    <div class="pagination">
      <button 
        class="pagination-btn" 
        ${currentPage === 1 ? "disabled" : ""}
        onclick="changePage(${currentPage - 1})"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div class="pagination-info">
        <span class="current-page">${currentPage}</span>
        <span class="page-separator">/</span>
        <span class="total-pages">${totalPages}</span>
      </div>
      
      <button 
        class="pagination-btn" 
        ${currentPage === totalPages ? "disabled" : ""}
        onclick="changePage(${currentPage + 1})"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  `;

  paginationContainer.innerHTML = paginationHTML;

  // Insert after domain list
  const domainList = document.getElementById("domainList");
  if (domainList) {
    domainList.parentElement.insertBefore(
      paginationContainer,
      domainList.nextSibling
    );
  }
}

// Change page handler
function changePage(newPage) {
  const filtered = filterDomains();
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Validate page number
  if (newPage < 1 || newPage > totalPages) return;

  currentPage = newPage;
  renderDomainList();

  // Scroll to top of domain list
  document.getElementById("domainList")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function createDomainCard(domain) {
  const expireInfo = calculateExpireInfo(domain.expire_date);
  const currency =
    domain.currency_symbol || settings.default_currency_symbol || "¥";

  return `
    <div class="domain-card" style="--status-color: var(--color-${
      expireInfo.status === "normal" ? "success" : expireInfo.status
    })">
      <!-- Col 1: Main Info -->
      <div class="col-main">
        <a href="${
          domain.registrar_url || domain.hosting_url || "#"
        }" target="_blank" class="domain-name">
          ${escapeHtml(domain.domain_name)}
        </a>
      </div>

      <!-- Col 2: Registrar -->
      <div class="col-detail mobile-hide">
        ${
          domain.registrar && domain.registrar_url
            ? `<a href="${
                domain.registrar_url
              }" target="_blank" class="detail-link">${escapeHtml(
                domain.registrar
              )}</a>`
            : `<span class="detail-value">${
                domain.registrar ? escapeHtml(domain.registrar) : "-"
              }</span>`
        }
      </div>

      <!-- Col 3: Hosting -->
      <div class="col-detail mobile-hide">
        ${
          domain.hosting_provider && domain.hosting_url
            ? `<a href="${
                domain.hosting_url
              }" target="_blank" class="detail-link">${escapeHtml(
                domain.hosting_provider
              )}</a>`
            : `<span class="detail-value">${
                escapeHtml(domain.hosting_provider) || "-"
              }</span>`
        }
      </div>

      <!-- Col 4: Purchase -->
      <div class="col-detail mobile-hide">
        <span class="detail-value">${
          domain.purchase_price === -1
            ? t("priceFree")
            : domain.purchase_price
            ? formatPrice(
                domain.purchase_price,
                currency,
                domain.purchase_period
              )
            : "-"
        }</span>
      </div>

      <!-- Col 5: Renewal -->
      <div class="col-detail mobile-hide">
        <span class="detail-value">${
          domain.renewal_price === -1
            ? t("priceFree")
            : domain.renewal_price
            ? formatPrice(domain.renewal_price, currency, domain.renewal_period)
            : "-"
        }</span>
      </div>

      <!-- Col 6: Status -->
      <div class="col-status">
        <div class="expiry-header">
          <div class="expiry-date">${expireInfo.dateText}</div>
          <span class="days-left ${expireInfo.status}">${
    expireInfo.daysText
  }</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${expireInfo.status}" style="width: ${
    expireInfo.percent
  }%"></div>
        </div>
      </div>

      <!-- Col 6: Actions -->
      <div class="col-actions">
        <button class="action-btn edit-btn" data-id="${domain.id}" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="action-btn delete delete-btn" data-id="${
          domain.id
        }" data-name="${escapeHtml(domain.domain_name)}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0,0 1-2,2H7a2,2 0,0 1-2-2V6m3,0V4a2,2 0,0 1,2-2h4a2,2 0,0 1,2,2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/* ========== Logic & Helpers ========== */

function calculateExpireInfo(expireDate) {
  if (!expireDate) {
    return {
      dateText: t("indefinite"),
      daysText: "∞",
      status: "indefinite", // 永久域名使用独特的蓝色样式
      percent: 100,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expire = new Date(expireDate);
  expire.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expire - today) / (1000 * 60 * 60 * 24));

  // Calculate percentage (assuming 365 days as full cycle for visualization)
  let percent = Math.max(0, Math.min(100, (diffDays / 365) * 100));

  if (diffDays < 0)
    return {
      dateText: formatDate(expireDate),
      daysText: `${t("expiredAgo")} ${Math.abs(diffDays)}${t("ago")}`,
      status: "danger",
      percent: 0,
    };
  if (diffDays <= 7)
    return {
      dateText: formatDate(expireDate),
      daysText: `${t("expiresIn")} ${diffDays}${t("ago")}`,
      status: "danger",
      percent: percent,
    };
  if (diffDays <= 30)
    return {
      dateText: formatDate(expireDate),
      daysText: `${t("expiresIn")} ${diffDays}${t("ago")}`,
      status: "warning",
      percent: percent,
    };

  return {
    dateText: formatDate(expireDate),
    daysText: `${diffDays} ${t("daysLeft")}`,
    status: "success",
    percent: percent,
  };
}

function filterDomains() {
  const term = elements.searchInput.value.toLowerCase();
  const activeSuffixes = getActiveFilters("suffixFilters");
  const activeRegistrars = getActiveFilters("registrarFilters");
  const activeHosts = getActiveFilters("hostingFilters");

  return domains.filter((d) => {
    const matchesTerm =
      d.domain_name.toLowerCase().includes(term) ||
      (d.notes && d.notes.toLowerCase().includes(term));

    const suffix = "." + d.domain_name.split(".").pop();
    const matchesSuffix =
      activeSuffixes.length === 0 || activeSuffixes.includes(suffix);
    const matchesRegistrar =
      activeRegistrars.length === 0 || activeRegistrars.includes(d.registrar);
    const matchesHost =
      activeHosts.length === 0 || activeHosts.includes(d.hosting_provider);

    return matchesTerm && matchesSuffix && matchesRegistrar && matchesHost;
  });
}

function updateFilters() {
  console.log("🔍 updateFilters() called");
  const suffixes = [
    ...new Set(domains.map((d) => "." + d.domain_name.split(".").pop())),
  ].sort();
  const registrars = [
    ...new Set(domains.map((d) => d.registrar).filter(Boolean)),
  ].sort();
  const hosts = [
    ...new Set(domains.map((d) => d.hosting_provider).filter(Boolean)),
  ].sort();

  console.log("📊 Filter data:", { suffixes, registrars, hosts });
  console.log("📦 Filter containers:", {
    suffixFilters: elements.suffixFilters,
    registrarFilters: elements.registrarFilters,
    hostingFilters: elements.hostingFilters,
  });

  renderFilterTags(elements.suffixFilters, suffixes);
  renderFilterTags(elements.registrarFilters, registrars);
  renderFilterTags(elements.hostingFilters, hosts);
}

function renderFilterTags(container, items) {
  console.log("🏷️  renderFilterTags() called", {
    container,
    itemCount: items.length,
  });

  if (!container) {
    console.error("❌ Container is null or undefined!");
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `<span class="filter-tag" data-value="${item}">${item}</span>`
    )
    .join("");

  const tags = container.querySelectorAll(".filter-tag");
  console.log(`✅ Generated ${tags.length} filter tags`);

  tags.forEach((tag, index) => {
    tag.addEventListener("click", () => {
      console.log(`🖱️  Filter tag clicked: ${tag.dataset.value}`);
      tag.classList.toggle("active");
      currentPage = 1; // Reset to first page when filter changes
      renderDomainList();
    });
  });

  console.log(`🎯 Event listeners attached to ${tags.length} tags`);
}

function getActiveFilters(containerId) {
  return Array.from(
    document.getElementById(containerId).querySelectorAll(".filter-tag.active")
  ).map((el) => el.dataset.value);
}

function clearAllFilters() {
  document
    .querySelectorAll(".filter-tag.active")
    .forEach((el) => el.classList.remove("active"));
  elements.searchInput.value = "";
  currentPage = 1; // Reset to first page
  renderDomainList();
}

function handleSearch() {
  currentPage = 1; // Reset to first page
  renderDomainList();
}

/* ========== Modal Actions ========== */
function openAddModal() {
  editingDomainId = null;
  elements.modalTitle.textContent = t("modalAddTitle");
  elements.domainForm.reset();
  elements.expireDate.disabled = false;
  elements.noExpireBtn.classList.remove("active");
  openModal(elements.domainModal);
}

function openEditModal(id) {
  const domain = domains.find((d) => d.id === parseInt(id));
  if (!domain) return;

  editingDomainId = domain.id;
  elements.modalTitle.textContent = t("modalEditTitle");

  elements.domainName.value = domain.domain_name;
  elements.registrar.value = domain.registrar || "";
  elements.registrarUrl.value = domain.registrar_url || "";
  elements.hostingProvider.value = domain.hosting_provider || "";
  elements.hostingUrl.value = domain.hosting_url || "";
  elements.purchasePrice.value = domain.purchase_price || "";
  elements.renewalPrice.value = domain.renewal_price || "";
  elements.purchasePeriod.value = domain.purchase_period || "";
  elements.renewalPeriod.value = domain.renewal_period || "";
  elements.currencySymbol.value = domain.currency_symbol || "¥";
  elements.notes.value = domain.notes || "";

  if (domain.expire_date) {
    elements.expireDate.value = domain.expire_date;
    elements.expireDate.disabled = false;
    elements.noExpireBtn.classList.remove("active");
  } else {
    elements.expireDate.value = "";
    elements.expireDate.disabled = true;
    elements.noExpireBtn.classList.add("active");
  }

  openModal(elements.domainModal);
}

function openDeleteModal(id, name) {
  deletingDomainId = id;
  elements.deleteDomainName.textContent = name;
  document.querySelector("#deleteModal p").innerHTML = `${t(
    "textDelete"
  )} <strong class="text-highlight">${name}</strong>${t("textDeleteSuffix")}`;
  openModal(elements.deleteModal);
}

function openSettingsModal() {
  elements.siteName.value = settings.site_name || t("siteTitle");
  elements.notifyDays.value = settings.notify_days || "30,7";
  elements.telegramBotToken.value = settings.telegram_bot_token || "";
  elements.telegramChatId.value = settings.telegram_chat_id || "";
  elements.telegramNotifyTemplate.value =
    settings.telegram_notify_template || "";
  openModal(elements.settingsModal);
}

function openModal(modal) {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

/* ========== API Actions ========== */
async function handleDomainSubmit(e) {
  e.preventDefault();

  const data = {
    domain_name: elements.domainName.value.trim(),
    registrar: elements.registrar.value.trim() || null,
    registrar_url: elements.registrarUrl.value.trim() || null,
    hosting_provider: elements.hostingProvider.value.trim() || null,
    hosting_url: elements.hostingUrl.value.trim() || null,
    purchase_price: elements.purchasePrice.value
      ? parseFloat(elements.purchasePrice.value)
      : null,
    renewal_price: elements.renewalPrice.value
      ? parseFloat(elements.renewalPrice.value)
      : null,
    purchase_period: elements.purchasePeriod.value.trim() || null,
    renewal_period: elements.renewalPeriod.value.trim() || null,
    currency_symbol: elements.currencySymbol.value.trim() || "¥",
    expire_date: elements.noExpireBtn.classList.contains("active")
      ? null
      : elements.expireDate.value || null,
    notes: elements.notes.value.trim() || null,
  };

  if (!data.domain_name) {
    showToast(t("toastRequired"), "warning");
    return;
  }

  try {
    const url = editingDomainId
      ? `${API_BASE}/domains/${editingDomainId}`
      : `${API_BASE}/domains`;
    const method = editingDomainId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showToast(
        editingDomainId ? t("toastUpdated") : t("toastAdded"),
        "success"
      );
      closeModal(elements.domainModal);
      await Promise.all([loadDomains(), loadStats()]);
    } else {
      showToast(result.error || t("toastError"), "error");
    }
  } catch (error) {
    showToast(t("toastNetworkError"), "error");
  }
}

async function confirmDelete() {
  if (!deletingDomainId) return;

  try {
    const response = await fetch(`${API_BASE}/domains/${deletingDomainId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      showToast(t("toastDeleted"), "success");
      closeModal(elements.deleteModal);
      await Promise.all([loadDomains(), loadStats()]);
    } else {
      const result = await response.json();
      showToast(result.error || t("toastError"), "error");
    }
  } catch (error) {
    showToast(t("toastError"), "error");
  }
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  const data = {
    site_name: elements.siteName.value.trim(),
    notify_days: elements.notifyDays.value.trim(),
    telegram_bot_token: elements.telegramBotToken.value.trim(),
    telegram_chat_id: elements.telegramChatId.value.trim(),
    telegram_notify_template: elements.telegramNotifyTemplate.value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      showToast(t("toastSettingsSaved"), "success");
      closeModal(elements.settingsModal);
      settings = { ...settings, ...data };
      applySettings();
    } else {
      showToast(t("toastError"), "error");
    }
  } catch (error) {
    showToast(t("toastError"), "error");
  }
}

async function handleTelegramTest() {
  const token = elements.telegramBotToken.value.trim();
  const chatId = elements.telegramChatId.value.trim();

  if (!token) {
    showToast(t("toastError"), "warning");
    return;
  }

  const btn = document.getElementById("testTelegramBtn");
  const originalContent = btn.innerHTML;
  btn.innerHTML =
    '<div class="loader" style="width:16px;height:16px;border-width:2px;margin:0"></div>';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/test-telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, chatId }),
    });
    const result = await response.json();

    if (response.ok) {
      // Show different messages based on whether a message was sent
      if (result.messageSent) {
        showToast("✅ " + (result.message || t("toastTestSuccess")), "success");
      } else {
        showToast(result.message || t("toastTestSuccess"), "success");
      }
    } else {
      showToast(result.error || t("toastTestFail"), "error");
    }
  } catch (error) {
    showToast(t("toastTestFail"), "error");
  } finally {
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }
}

/**
 * 处理备份功能
 */
async function handleBackup() {
  const btn = document.getElementById("btnBackup");
  const originalContent = btn.innerHTML;
  btn.innerHTML =
    '<div class="loader" style="width:16px;height:16px;border-width:2px;margin:0"></div>';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/backup`, {
      method: "GET",
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // 从响应头获取文件名，如果没有则使用默认文件名
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `domain-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast("✅ 备份成功！", "success");
    } else {
      const result = await response.json();
      showToast(result.error || "❌ 备份失败", "error");
    }
  } catch (error) {
    console.error("备份失败:", error);
    showToast("❌ 备份失败: " + error.message, "error");
  } finally {
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }
}

/**
 * 处理导入功能
 */
async function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 验证文件类型
  if (!file.name.endsWith(".json")) {
    showToast("❌ 请选择 JSON 文件", "error");
    event.target.value = ""; // 清空文件选择
    return;
  }

  // 确认导入操作
  if (
    !confirm(
      "⚠️ 导入将覆盖所有现有数据！\n\n确定要继续吗？\n\n建议先进行备份以防数据丢失。"
    )
  ) {
    event.target.value = ""; // 清空文件选择
    return;
  }

  const btn = document.getElementById("btnImport");
  const originalContent = btn.innerHTML;
  btn.innerHTML =
    '<div class="loader" style="width:16px;height:16px;border-width:2px;margin:0"></div>';
  btn.disabled = true;

  try {
    // 读取文件内容
    const fileContent = await file.text();
    const backupData = JSON.parse(fileContent);

    // 发送导入请求
    const response = await fetch(`${API_BASE}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backupData),
    });

    const result = await response.json();

    if (response.ok) {
      showToast(
        `✅ 导入成功！设置: ${result.imported.settings} 项，域名: ${result.imported.domains} 个`,
        "success"
      );

      // 关闭设置弹窗
      closeModal(elements.settingsModal);

      // 重新加载数据
      await Promise.all([loadSettings(), loadDomains(), loadStats()]);
      applySettings();
    } else {
      showToast(result.error || "❌ 导入失败", "error");
    }
  } catch (error) {
    console.error("导入失败:", error);
    if (error instanceof SyntaxError) {
      showToast("❌ 无效的 JSON 文件格式", "error");
    } else {
      showToast("❌ 导入失败: " + error.message, "error");
    }
  } finally {
    btn.innerHTML = originalContent;
    btn.disabled = false;
    event.target.value = ""; // 清空文件选择，允许重新选择同一文件
  }
}

/* ========== Utilities ========== */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString();
}

function formatPrice(price, symbol, period) {
  // 保留用户输入的原始格式，不强制保留两位小数
  const numPrice = parseFloat(price);
  const formattedPrice = `${symbol}${numPrice}`;
  return period ? `${formattedPrice}/${period}` : formattedPrice;
}

function animateNumber(element, target) {
  const current = parseInt(element.textContent) || 0;
  const duration = 1000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

    element.textContent = Math.round(current + (target - current) * ease);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

/* ========== Access Verification ========== */

/**
 * Check if access is already verified
 * If not, show the verification overlay
 */
function checkAccessVerification() {
  // Check localStorage for verification status
  const verified = localStorage.getItem("access_verified");

  if (verified === "true") {
    isAccessVerified = true;
    hideAccessOverlay();
  } else {
    isAccessVerified = false;
    showAccessOverlay();
  }
}

/**
 * Show access verification overlay
 */
function showAccessOverlay() {
  const overlay = document.getElementById("accessVerifyOverlay");
  if (overlay) {
    overlay.style.display = "flex";

    // Initialize event listeners for verification form
    initAccessVerificationListeners();
  }
}

/**
 * Hide access verification overlay
 */
function hideAccessOverlay() {
  const overlay = document.getElementById("accessVerifyOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }

  // ⚠️ SECURITY: 验证通过后显示主内容
  const appContainer = document.querySelector(".app-container");
  if (appContainer) {
    appContainer.classList.add("verified");
  }

  // ✅ 验证通过后加载数据
  loadData();
}

/**
 * Initialize event listeners for access verification
 */
function initAccessVerificationListeners() {
  const form = document.getElementById("accessVerifyForm");
  const input = document.getElementById("accessKeyInput");
  const toggleBtn = document.getElementById("toggleVisibilityBtn");
  const errorDiv = document.getElementById("accessVerifyError");

  // Prevent multiple event listener bindings
  if (form && !form.dataset.listenerBound) {
    form.dataset.listenerBound = "true";

    // Form submit handler
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleAccessVerification();
    });

    // Toggle password visibility
    if (toggleBtn && input) {
      toggleBtn.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";

        const eyeOff = toggleBtn.querySelector(".eye-off");
        const eyeOn = toggleBtn.querySelector(".eye-on");

        if (eyeOff && eyeOn) {
          if (isPassword) {
            eyeOff.style.display = "none";
            eyeOn.style.display = "block";
          } else {
            eyeOff.style.display = "block";
            eyeOn.style.display = "none";
          }
        }
      });
    }

    // Clear error on input
    if (input && errorDiv) {
      input.addEventListener("input", () => {
        errorDiv.style.display = "none";
      });
    }
  }
}

/**
 * Handle access key verification
 */
async function handleAccessVerification() {
  const input = document.getElementById("accessKeyInput");
  const btn = document.getElementById("accessVerifyBtn");
  const btnText = btn.querySelector(".btn-text");
  const btnLoading = btn.querySelector(".btn-loading");
  const errorDiv = document.getElementById("accessVerifyError");

  const accessKey = input.value.trim();

  if (!accessKey) {
    showAccessError("请输入访问密钥");
    return;
  }

  // Show loading state
  btn.disabled = true;
  btnText.style.display = "none";
  btnLoading.style.display = "flex";
  errorDiv.style.display = "none";

  try {
    const response = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessKey }),
    });

    const data = await response.json();

    if (data.success) {
      // Verification successful
      isAccessVerified = true;
      localStorage.setItem("access_verified", "true");

      // Hide overlay with animation
      setTimeout(() => {
        hideAccessOverlay();
        showToast("验证成功，欢迎使用！", "success");
      }, 500);
    } else {
      // Verification failed
      showAccessError(data.error || "访问密钥错误");
      input.value = "";
      input.focus();
    }
  } catch (error) {
    console.error("Verification error:", error);
    showAccessError("验证失败，请稍后重试");
  } finally {
    // Reset button state
    btn.disabled = false;
    btnText.style.display = "inline";
    btnLoading.style.display = "none";
  }
}

/**
 * Show error message in verification form
 */
function showAccessError(message) {
  const errorDiv = document.getElementById("accessVerifyError");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";

    // Shake animation
    const container = document.querySelector(".access-verify-container");
    if (container) {
      container.classList.add("shake");
      setTimeout(() => {
        container.classList.remove("shake");
      }, 500);
    }
  }
}
