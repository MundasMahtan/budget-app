'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  categories: [],
  subcategoryMap: new Map(), // subcategoryId → { categoryId, categoryType, categoryName }
  // Transactions (always current month, no selector)
  year:  new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  transactions: [],
  // Dashboard
  dashboardYear:           new Date().getFullYear(),
  dashboardMonth:          new Date().getMonth() + 1,
  dashboardSelectorOffset: 0,
  // Budget
  budgetYear:           new Date().getFullYear(),
  budgetMonth:          new Date().getMonth() + 1,
  budgetSelectorOffset: 0,
  // Navigation
  screen:       null,
  screenParams: {},
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSubcategoryMap(categories) {
  const map = new Map();
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      map.set(sub.id, {
        categoryId:   cat.id,
        categoryType: cat.type,
        categoryName: cat.name,
      });
    }
  }
  return map;
}

// ── Navigation ────────────────────────────────────────────────────────────────
const PRIMARY_SCREENS = ['transactions', 'dashboard', 'budget'];

function navigate(screen, params = {}) {
  state.screen = screen;
  state.screenParams = params;

  const container = document.getElementById('screen-container');
  container.innerHTML = '';

  if (PRIMARY_SCREENS.includes(screen)) {
    showTabBar(screen);
  } else {
    hideTabBar();
  }

  switch (screen) {
    case 'transactions':    renderTransactionsScreen();              break;
    case 'dashboard':       renderDashboardScreen();                 break;
    case 'budget':          renderBudgetScreen();                    break;
    case 'editTransaction': renderEditTransactionScreen(params.id);  break;
    case 'drillIn':         renderDrillInScreen(params.categoryId);  break;
  }
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
function showTabBar(activeScreen) {
  const bar = document.getElementById('tab-bar');
  bar.classList.remove('hidden');
  bar.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === activeScreen);
  });
}

function hideTabBar() {
  document.getElementById('tab-bar').classList.add('hidden');
}

function initTabBar() {
  document.getElementById('tab-bar').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) navigate(tab.dataset.screen);
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let _toastTimer = null;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function showModal(buildFn) {
  const overlay = document.getElementById('modal-overlay');
  const dialog  = document.getElementById('modal-dialog');
  dialog.innerHTML = '';
  buildFn(dialog);
  overlay.classList.remove('hidden');
  overlay.onclick = e => { if (e.target === overlay) hideModal(); };
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ── Shared components ─────────────────────────────────────────────────────────
function buildSubcategorySelect(id, cls, selectedSubId) {
  const sel = document.createElement('select');
  sel.id = id;
  sel.className = cls;

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = STRINGS.transactions.subcategoryPlaceholder;
  sel.appendChild(defaultOpt);

  for (const cat of state.categories) {
    const group = document.createElement('optgroup');
    group.label = cat.name;
    for (const sub of cat.subcategories) {
      const opt = document.createElement('option');
      opt.value = String(sub.id);
      opt.textContent = sub.name;
      if (selectedSubId != null && sub.id === selectedSubId) opt.selected = true;
      group.appendChild(opt);
    }
    sel.appendChild(group);
  }
  return sel;
}

function buildProgressBar(spent, projected, thin = false) {
  const pct = projected > 0 ? Math.min(100, (spent / projected) * 100) : 0;
  const over = projected > 0 && spent > projected;
  const track = document.createElement('div');
  track.className = 'progress-track' + (thin ? ' thin' : '');
  const fill = document.createElement('div');
  fill.className = 'progress-fill' + (over ? ' over-budget' : '');
  fill.style.width = pct + '%';
  track.appendChild(fill);
  return track;
}

// ── Screen 1: Συναλλαγές ─────────────────────────────────────────────────────
async function renderTransactionsScreen() {
  const container = document.getElementById('screen-container');

  // Header
  const header = document.createElement('div');
  header.className = 'screen-header';

  const title = document.createElement('span');
  title.className = 'screen-header-title';
  title.textContent = STRINGS.transactions.title;

  const meta = document.createElement('span');
  meta.className = 'screen-header-meta';
  meta.textContent = formatMonthLabel(state.year, state.month);

  header.appendChild(title);
  header.appendChild(meta);
  container.appendChild(header);

  // Quick-add panel
  container.appendChild(buildQuickAddPanel());

  // Transaction list (shows skeleton while loading)
  const listEl = document.createElement('div');
  listEl.id = 'tx-list';
  listEl.innerHTML = '<div class="empty-state">Φόρτωση…</div>';
  container.appendChild(listEl);

  try {
    state.transactions = await api.transactions.list(state.year, state.month);
    renderTransactionList(listEl, state.transactions);
  } catch {
    listEl.innerHTML = `<div class="empty-state">${STRINGS.errors.generic}</div>`;
  }
}

function buildQuickAddPanel() {
  const qa = document.createElement('div');
  qa.className = 'quick-add';

  const label = document.createElement('div');
  label.className = 'quick-add-label';
  label.textContent = STRINGS.transactions.quickAddLabel;
  qa.appendChild(label);

  // Row 1: amount + description
  const row1 = document.createElement('div');
  row1.className = 'quick-add-row';

  const amountInput = document.createElement('input');
  amountInput.type = 'text';
  amountInput.inputMode = 'decimal';
  amountInput.id = 'qa-amount';
  amountInput.className = 'input input-amount';
  amountInput.placeholder = STRINGS.transactions.amountPlaceholder;

  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.id = 'qa-description';
  descInput.className = 'input input-flex';
  descInput.placeholder = STRINGS.transactions.descriptionPlaceholder;

  row1.appendChild(amountInput);
  row1.appendChild(descInput);
  qa.appendChild(row1);

  // Row 2: subcategory select
  const row2 = document.createElement('div');
  row2.className = 'quick-add-row';
  row2.appendChild(buildSubcategorySelect('qa-subcategory', 'input input-full', null));
  qa.appendChild(row2);

  // Row 3: submit button
  const row3 = document.createElement('div');
  row3.className = 'quick-add-row';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'qa-submit';
  btn.className = 'btn btn-primary';
  btn.textContent = STRINGS.transactions.submitButton;
  btn.addEventListener('click', handleQuickAdd);
  row3.appendChild(btn);
  qa.appendChild(row3);

  return qa;
}

function renderTransactionList(listEl, transactions) {
  listEl.innerHTML = '';

  if (transactions.length === 0) {
    listEl.innerHTML = `<div class="empty-state">${STRINGS.transactions.emptyState}</div>`;
    return;
  }

  // Group by date — API already returns newest-first, so insertion order gives newest-first groups
  const groups = new Map();
  for (const tx of transactions) {
    if (!groups.has(tx.date)) groups.set(tx.date, []);
    groups.get(tx.date).push(tx);
  }

  for (const [date, txs] of groups) {
    const dateHeader = document.createElement('div');
    dateHeader.className = 'date-header';
    dateHeader.textContent = formatDateHeader(date);
    listEl.appendChild(dateHeader);

    txs.forEach((tx, idx) => {
      listEl.appendChild(buildTransactionRow(tx, idx === txs.length - 1));
    });
  }
}

function buildTransactionRow(tx, isLastInGroup) {
  const catInfo  = state.subcategoryMap.get(tx.subcategoryId);
  const isIncome = catInfo && catInfo.categoryType === 'INCOME';

  const row = document.createElement('div');
  row.className = 'list-row tappable';
  if (isLastInGroup) row.style.borderBottom = 'none';
  row.dataset.id = tx.id;

  // Left: description + category name
  const left = document.createElement('div');
  left.className = 'list-row-left';

  const titleEl = document.createElement('div');
  titleEl.className = 'row-title';
  titleEl.textContent = tx.description || tx.subcategoryName;

  const subtitleEl = document.createElement('div');
  subtitleEl.className = 'row-subtitle';
  subtitleEl.textContent = catInfo ? catInfo.categoryName : tx.subcategoryName;

  left.appendChild(titleEl);
  left.appendChild(subtitleEl);

  // Right: signed amount
  const right = document.createElement('div');
  right.className = 'list-row-right';

  const amountEl = document.createElement('div');
  amountEl.className = 'amount ' + (isIncome ? 'amount-income' : 'amount-expense');
  amountEl.textContent = (isIncome ? '+' : '−') + formatMoney(parseFloat(tx.amount));

  right.appendChild(amountEl);

  row.appendChild(left);
  row.appendChild(right);

  row.addEventListener('click', () => navigate('editTransaction', { id: tx.id }));

  return row;
}

async function handleQuickAdd() {
  const amountInput = document.getElementById('qa-amount');
  const subSelect   = document.getElementById('qa-subcategory');
  const btn         = document.getElementById('qa-submit');

  const amount = parseMoney(amountInput.value.trim());
  const description = document.getElementById('qa-description').value.trim() || null;
  const subcategoryId = subSelect.value;

  // Client-side validation
  if (!amount || amount <= 0) {
    amountInput.classList.add('error');
    amountInput.focus();
    return;
  }
  amountInput.classList.remove('error');

  if (!subcategoryId) {
    subSelect.classList.add('error');
    return;
  }
  subSelect.classList.remove('error');

  btn.disabled = true;

  try {
    const newTx = await api.transactions.create({
      date: todayISO(),
      amount,
      description,
      subcategoryId: parseInt(subcategoryId),
    });

    // Prepend and keep sorted (date DESC, id DESC)
    state.transactions.unshift(newTx);
    state.transactions.sort((a, b) =>
      b.date !== a.date ? b.date.localeCompare(a.date) : b.id - a.id
    );

    renderTransactionList(document.getElementById('tx-list'), state.transactions);

    amountInput.value = '';
    document.getElementById('qa-description').value = '';
    subSelect.value = '';
  } catch (err) {
    showToast(err.message || STRINGS.errors.generic, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ── Shared: month selector ────────────────────────────────────────────────────
// Reused by dashboard and budget screens.
// Callbacks read/write state directly so the closure stays correct across rebuilds.
function buildMonthSelector({ getYear, getMonth, getOffset, onSelect, onEarlier }) {
  const now       = new Date();
  const baseYear  = now.getFullYear();
  const baseMonth = now.getMonth() + 1;

  const sel = document.createElement('select');
  sel.className = 'month-select';

  function populate() {
    const offset   = getOffset();
    const selYear  = getYear();
    const selMonth = getMonth();
    sel.innerHTML  = '';
    let hasSelected = false;

    for (let i = offset; i < offset + 12; i++) {
      const d = new Date(baseYear, baseMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const opt       = document.createElement('option');
      opt.value       = `${y}-${m}`;
      opt.textContent = formatMonthLabel(y, m);
      if (y === selYear && m === selMonth) { opt.selected = true; hasSelected = true; }
      sel.appendChild(opt);
    }
    if (!hasSelected && sel.options.length > 0) sel.options[0].selected = true;

    const earlier       = document.createElement('option');
    earlier.value       = '__earlier__';
    earlier.textContent = 'Νωρίτερα…';
    sel.appendChild(earlier);
  }

  populate();

  sel.addEventListener('change', () => {
    if (sel.value === '__earlier__') {
      onEarlier();
      populate();
    } else {
      const [y, m] = sel.value.split('-').map(Number);
      onSelect(y, m);
    }
  });

  return sel;
}

// ── Screen 2: Πίνακας ────────────────────────────────────────────────────────
async function renderDashboardScreen() {
  const container = document.getElementById('screen-container');

  const header = document.createElement('div');
  header.className = 'screen-header';

  const title = document.createElement('span');
  title.className = 'screen-header-title';
  title.textContent = STRINGS.dashboard.title;

  const contentEl = document.createElement('div');

  const monthSel = buildMonthSelector({
    getYear:   () => state.dashboardYear,
    getMonth:  () => state.dashboardMonth,
    getOffset: () => state.dashboardSelectorOffset,
    onSelect:  async (y, m) => {
      state.dashboardYear  = y;
      state.dashboardMonth = m;
      await loadDashboardContent(y, m, contentEl);
    },
    onEarlier: () => { state.dashboardSelectorOffset += 12; },
  });

  header.appendChild(title);
  header.appendChild(monthSel);
  container.appendChild(header);
  container.appendChild(contentEl);

  await loadDashboardContent(state.dashboardYear, state.dashboardMonth, contentEl);
}

async function loadDashboardContent(year, month, contentEl) {
  contentEl.innerHTML = '<div class="empty-state">Φόρτωση…</div>';
  try {
    const summary = await api.summary.get(year, month);
    renderDashboardContent(contentEl, summary);
  } catch {
    contentEl.innerHTML = `<div class="empty-state">${STRINGS.errors.generic}</div>`;
  }
}

function renderDashboardContent(contentEl, summary) {
  contentEl.innerHTML = '';

  contentEl.appendChild(buildSummaryCards(summary));

  const divider = document.createElement('div');
  divider.className = 'section-divider';
  divider.textContent = STRINGS.dashboard.categories;
  contentEl.appendChild(divider);

  const expenseRows = buildExpenseCategoryBreakdown(summary.categoryBreakdown);
  for (const cat of expenseRows) {
    contentEl.appendChild(buildCategoryRow(cat));
  }
}

function buildSummaryCards(summary) {
  const income   = parseFloat(summary.totalIncome)   || 0;
  const expenses = parseFloat(summary.totalExpenses) || 0;
  const projected = parseFloat(summary.totalProjectedExpenses) || 0;
  const balance  = parseFloat(summary.balance)       || 0;

  const cards = document.createElement('div');
  cards.className = 'summary-cards';

  function makeCard(label, amount, amountClass, prefix) {
    const card = document.createElement('div');
    card.className = 'summary-card';

    const labelEl = document.createElement('div');
    labelEl.className = 'summary-card-label';
    labelEl.textContent = label;

    const amountEl = document.createElement('div');
    amountEl.className = `summary-card-amount ${amountClass}`;
    amountEl.textContent = prefix + formatMoney(amount);

    card.appendChild(labelEl);
    card.appendChild(amountEl);
    return card;
  }

  function makeExpensesCard(spent, projectedTotal) {
    const overBudget = projectedTotal > 0 && spent > projectedTotal
    const card = makeCard(STRINGS.dashboard.expenses, spent, overBudget ? 'text-danger' : '', ''
    );

    if (projectedTotal > 0) {
      const denomEl = document.createElement('div');
      denomEl.className = 'summary-card-denominator';
      denomEl.textContent = ' / ' + formatMoney(projectedTotal);
      card.appendChild(denomEl);
      card.appendChild(buildProgressBar(spent, projectedTotal, true)); // thin bar
    }

    return card;
  }

  const balanceAbs    = Math.abs(balance);
  const balanceClass  = balance >= 0 ? 'text-success' : 'text-danger';
  const balancePrefix = balance >= 0 ? '+' : '−';

  cards.appendChild(makeCard(STRINGS.dashboard.income,   income,      'text-success', ''));
  cards.appendChild(makeExpensesCard(expenses, projected));
  cards.appendChild(makeCard(STRINGS.dashboard.balance,  balanceAbs,  balanceClass,  balancePrefix));

  return cards;
}

function buildExpenseCategoryBreakdown(categoryBreakdown) {
  return categoryBreakdown
    .filter(c => {
      const cat = state.categories.find(sc => sc.id === c.categoryId);
      return cat && cat.type === 'EXPENSE';
    })
    .sort((a, b) => {
      const orderA = (state.categories.find(c => c.id === a.categoryId) || {}).displayOrder || 0;
      const orderB = (state.categories.find(c => c.id === b.categoryId) || {}).displayOrder || 0;
      return orderA - orderB;
    });
}

function buildCategoryRow(cat) {
  const spent      = parseFloat(cat.totalSpent)    || 0;
  const projected  = parseFloat(cat.projectedTotal) || 0;
  const hasProjected = projected > 0;
  const overBudget   = spent > projected; // any spend is "over" when projected = 0

  const row = document.createElement('div');
  row.className = 'category-row';

  const main = document.createElement('div');
  main.className = 'category-row-main';

  const nameEl = document.createElement('span');
  nameEl.className = 'category-row-name';
  nameEl.textContent = cat.categoryName;

  const amountsEl = document.createElement('div');
  amountsEl.className = 'category-row-amounts';

  const spentEl = document.createElement('span');
  spentEl.className = 'fw-500' + (overBudget ? ' text-danger' : '');
  spentEl.textContent = formatMoney(spent);

  const projectedEl = document.createElement('span');
  projectedEl.className = 'text-secondary';
  projectedEl.textContent = ' / ' + (hasProjected ? formatMoney(projected) : STRINGS.drillIn.noBudget);

  amountsEl.appendChild(spentEl);
  amountsEl.appendChild(projectedEl);
  main.appendChild(nameEl);
  main.appendChild(amountsEl);
  row.appendChild(main);

  if (hasProjected) {
    row.appendChild(buildProgressBar(spent, projected));
  }

  row.addEventListener('click', () =>
    navigate('drillIn', {
      categoryId: cat.categoryId,
      year:       state.dashboardYear,
      month:      state.dashboardMonth,
    })
  );

  return row;
}

// ── Screen 3: Προϋπολογισμός ─────────────────────────────────────────────────
async function renderBudgetScreen() {
  const container = document.getElementById('screen-container');

  // Header
  const header = document.createElement('div');
  header.className = 'screen-header';

  const title = document.createElement('span');
  title.className = 'screen-header-title';
  title.textContent = STRINGS.budget.title;

  const contentEl = document.createElement('div');

  const monthSel = buildMonthSelector({
    getYear:   () => state.budgetYear,
    getMonth:  () => state.budgetMonth,
    getOffset: () => state.budgetSelectorOffset,
    onSelect:  async (y, m) => {
      state.budgetYear  = y;
      state.budgetMonth = m;
      await loadBudgetContent(y, m, contentEl, bannerTotalEl);
    },
    onEarlier: () => { state.budgetSelectorOffset += 12; },
  });

  header.appendChild(title);
  header.appendChild(monthSel);
  container.appendChild(header);

  // Carry-forward banner
  const banner = document.createElement('div');
  banner.className = 'budget-banner';

  const bannerLeft = document.createElement('div');
  const bannerLabel = document.createElement('div');
  bannerLabel.className = 'budget-banner-label';
  bannerLabel.textContent = STRINGS.budget.monthTotal;
  const bannerTotalEl = document.createElement('div');
  bannerTotalEl.className = 'budget-banner-total';
  bannerTotalEl.textContent = formatMoney(0);
  bannerLeft.appendChild(bannerLabel);
  bannerLeft.appendChild(bannerTotalEl);

  const fillBtn = document.createElement('button');
  fillBtn.className = 'btn btn-secondary';
  fillBtn.textContent = STRINGS.budget.fillBlanks;
  fillBtn.addEventListener('click', () =>
    showFillBlanksConfirm(state.budgetYear, state.budgetMonth, async () => {
      await loadBudgetContent(state.budgetYear, state.budgetMonth, contentEl, bannerTotalEl);
    })
  );

  banner.appendChild(bannerLeft);
  banner.appendChild(fillBtn);
  container.appendChild(banner);
  container.appendChild(contentEl);

  await loadBudgetContent(state.budgetYear, state.budgetMonth, contentEl, bannerTotalEl);
}

async function loadBudgetContent(year, month, contentEl, bannerTotalEl) {
  contentEl.innerHTML = '<div class="empty-state">Φόρτωση…</div>';
  bannerTotalEl.textContent = formatMoney(0);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear  = month === 1 ? year - 1 : year;

  try {
    // Fetch current and previous month in parallel for the change indicator
    const [budgets, prevBudgets] = await Promise.all([
      api.budgets.list(year, month),
      api.budgets.list(prevYear, prevMonth),
    ]);
    renderBudgetContent(contentEl, budgets, prevBudgets, year, month, bannerTotalEl);
  } catch {
    contentEl.innerHTML = `<div class="empty-state">${STRINGS.errors.generic}</div>`;
  }
}

function renderBudgetContent(contentEl, budgets, prevBudgets, year, month, bannerTotalEl) {
  contentEl.innerHTML = '';

  const budgetMap = new Map();
  for (const b of budgets) budgetMap.set(b.subcategoryId, parseFloat(b.projectedAmount));

  const prevBudgetMap = new Map();
  for (const b of prevBudgets) prevBudgetMap.set(b.subcategoryId, parseFloat(b.projectedAmount));

  bannerTotalEl.textContent = formatMoney(calcBannerTotal(budgetMap));

  function updateTotals() {
    bannerTotalEl.textContent = formatMoney(calcBannerTotal(budgetMap));
    contentEl.querySelectorAll('[data-subtotal-cat]').forEach(el => {
      el.textContent = formatMoney(calcCategorySubtotal(parseInt(el.dataset.subtotalCat), budgetMap));
    });
  }

  const sorted = [...state.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  for (const cat of sorted) {
    contentEl.appendChild(
      buildBudgetCategorySection(cat, budgetMap, prevBudgetMap, year, month, updateTotals)
    );
  }
}

function buildBudgetCategorySection(cat, budgetMap, prevBudgetMap, year, month, updateTotals) {
  const section = document.createElement('div');

  // Section header: category name left + live subtotal right
  const header = document.createElement('div');
  header.className = 'section-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'section-header-label fw-500';
  nameEl.textContent = cat.name;

  const subtotalEl = document.createElement('span');
  subtotalEl.className = 'section-header-value';
  subtotalEl.dataset.subtotalCat = cat.id;
  subtotalEl.textContent = formatMoney(calcCategorySubtotal(cat.id, budgetMap));

  header.appendChild(nameEl);
  header.appendChild(subtotalEl);
  section.appendChild(header);

  for (const sub of cat.subcategories) {
    section.appendChild(
      buildBudgetSubcategoryRow(sub, budgetMap, prevBudgetMap, year, month, updateTotals)
    );
  }
  return section;
}

function buildBudgetSubcategoryRow(sub, budgetMap, prevBudgetMap, year, month, updateTotals) {
  const currAmount = budgetMap.has(sub.id) ? budgetMap.get(sub.id) : null;
  const prevAmount = prevBudgetMap.has(sub.id) ? prevBudgetMap.get(sub.id) : null;

  const prevHas = prevAmount !== null;
  const currHas = currAmount !== null;
  const showIndicator = (prevHas !== currHas) ||
    (prevHas && currHas && Math.abs(prevAmount - currAmount) > 0.001);

  const row = document.createElement('div');
  row.className = 'budget-row';

  // 3px left-edge indicator
  const indicator = document.createElement('div');
  indicator.className = 'budget-row-indicator';
  indicator.style.backgroundColor = showIndicator ? 'var(--text-info)' : 'transparent';
  row.appendChild(indicator);

  // Subcategory name (grayed when no budget)
  const nameEl = document.createElement('span');
  nameEl.className = 'budget-row-name' + (currHas ? '' : ' empty');
  nameEl.textContent = sub.name;
  row.appendChild(nameEl);

  // Numeric input
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.className = 'input input-budget';
  input.placeholder = '—';
  if (currHas) {
    input.value = currAmount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Gray out name while input is empty
  input.addEventListener('input', () => {
    nameEl.className = 'budget-row-name' + (input.value.trim() ? '' : ' empty');
  });

  // Auto-save on blur (silent — no spinner per spec)
  input.addEventListener('blur', async () => {
    const amount = parseMoney(input.value.trim());
    const saved  = budgetMap.has(sub.id) ? budgetMap.get(sub.id) : null;

    if (!amount || amount <= 0) {
      // Reset display to last known saved value; don't call API
      if (saved !== null) {
        input.value = saved.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        nameEl.className = 'budget-row-name';
      } else {
        input.value = '';
        nameEl.className = 'budget-row-name empty';
      }
      return;
    }

    if (saved !== null && Math.abs(amount - saved) < 0.001) return; // no change

    try {
      await api.budgets.upsert(year, month, sub.id, amount);
      budgetMap.set(sub.id, amount);

      // Recalculate indicator based on previous month
      const newCurrHas = true;
      const newShowIndicator = (prevHas !== newCurrHas) ||
        (prevHas && Math.abs(prevAmount - amount) > 0.001);
      indicator.style.backgroundColor = newShowIndicator ? 'var(--text-info)' : 'transparent';

      updateTotals();
    } catch {
      input.classList.add('error');
      showToast(STRINGS.errors.saveFailed, 'error');
      setTimeout(() => input.classList.remove('error'), 3000);
      // Revert to saved value
      if (saved !== null) {
        input.value = saved.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        nameEl.className = 'budget-row-name';
      } else {
        input.value = '';
        nameEl.className = 'budget-row-name empty';
      }
    }
  });

  row.appendChild(input);

  const suffix = document.createElement('span');
  suffix.className = 'budget-row-suffix';
  suffix.textContent = '€';
  row.appendChild(suffix);

  return row;
}

function calcCategorySubtotal(categoryId, budgetMap) {
  const cat = state.categories.find(c => c.id === categoryId);
  if (!cat) return 0;
  return cat.subcategories.reduce((sum, sub) => sum + (budgetMap.get(sub.id) || 0), 0);
}

function calcBannerTotal(budgetMap) {
  let total = 0;
  for (const val of budgetMap.values()) total += val || 0;
  return total;
}

function showFillBlanksConfirm(year, month, onFilled) {
  showModal(dialog => {
    const body = document.createElement('div');
    body.className = 'modal-body';

    const titleEl = document.createElement('div');
    titleEl.className = 'modal-title';
    titleEl.textContent = STRINGS.budget.fillBlanksConfirmTitle;

    const desc = document.createElement('div');
    desc.className = 'modal-description';
    desc.textContent = STRINGS.budget.fillBlanksConfirmBody;

    body.appendChild(titleEl);
    body.appendChild(desc);

    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn';
    cancelBtn.textContent = STRINGS.budget.cancel;
    cancelBtn.addEventListener('click', hideModal);

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn modal-btn-info';
    confirmBtn.textContent = STRINGS.budget.confirm;
    confirmBtn.addEventListener('click', async () => {
      hideModal();
      try {
        await api.budgets.fillBlanks(year, month);
        await onFilled();
      } catch {
        showToast(STRINGS.errors.generic, 'error');
      }
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    dialog.appendChild(body);
    dialog.appendChild(footer);
  });
}

// ── Screen 4: Edit transaction ────────────────────────────────────────────────
async function renderEditTransactionScreen(id) {
  const container = document.getElementById('screen-container');
  container.innerHTML = '<div class="empty-state">Φόρτωση…</div>';

  let tx;
  try {
    tx = await api.transactions.get(id);
  } catch {
    container.innerHTML = `<div class="empty-state">${STRINGS.errors.generic}</div>`;
    return;
  }

  container.innerHTML = '';

  // Navigate back to wherever we came from (transactions for now; drillIn added in Screen 6)
  function goBack() {
    const { from, categoryId } = state.screenParams;
    if (from === 'drillIn' && categoryId) {
      navigate('drillIn', { categoryId });
    } else {
      navigate('transactions');
    }
  }

  // Collect the current form state and call the update API.
  // silent=true suppresses the success toast (used for auto-save on blur).
  // Returns true on success so the explicit save button can navigate away.
  async function performSave(silent = false) {
    const amount      = parseMoney(document.getElementById('edit-amount').value.trim());
    const description = document.getElementById('edit-description').value.trim() || null;
    const subIdStr    = document.getElementById('edit-subcategory').value;
    const dateISO     = parseDate(document.getElementById('edit-date').value.trim());

    if (!amount || amount <= 0 || !subIdStr || !dateISO) {
      if (!silent) showToast(STRINGS.errors.generic, 'error');
      return false;
    }

    try {
      await api.transactions.update(id, {
        date: dateISO,
        amount,
        description,
        subcategoryId: parseInt(subIdStr),
      });
      if (!silent) showToast(STRINGS.errors.saved, 'success');
      return true;
    } catch (err) {
      if (!silent) showToast(err.message || STRINGS.errors.generic, 'error');
      return false;
    }
  }

  // ── Three-column header ──────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'screen-header-3col';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-text btn-text-secondary header-left';
  cancelBtn.textContent = STRINGS.editTransaction.cancel;
  cancelBtn.addEventListener('click', goBack);

  const centerTitle = document.createElement('span');
  centerTitle.className = 'header-center';
  centerTitle.textContent = STRINGS.editTransaction.title;

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-text btn-text-info header-right';
  saveBtn.textContent = STRINGS.editTransaction.save;
  saveBtn.addEventListener('click', async () => {
    const ok = await performSave(false);
    if (ok) goBack();
  });

  header.appendChild(cancelBtn);
  header.appendChild(centerTitle);
  header.appendChild(saveBtn);
  container.appendChild(header);

  // ── Form body ────────────────────────────────────────────────────────────────
  const form = document.createElement('div');
  form.className = 'form-body';

  function makeField(labelText) {
    const field = document.createElement('div');
    field.className = 'field';
    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = labelText;
    field.appendChild(label);
    return field;
  }

  // Amount
  const amountField = makeField(STRINGS.editTransaction.amount);
  const amountRow   = document.createElement('div');
  amountRow.className = 'amount-row';
  const amountInput = document.createElement('input');
  amountInput.type       = 'text';
  amountInput.inputMode  = 'decimal';
  amountInput.id         = 'edit-amount';
  amountInput.className  = 'input input-flex';
  amountInput.style.textAlign   = 'right';
  amountInput.style.fontWeight  = '500';
  amountInput.value = parseFloat(tx.amount)
    .toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  amountInput.addEventListener('blur', () => performSave(true));
  const amountSuffix = document.createElement('span');
  amountSuffix.className   = 'amount-suffix';
  amountSuffix.textContent = '€';
  amountRow.appendChild(amountInput);
  amountRow.appendChild(amountSuffix);
  amountField.appendChild(amountRow);
  form.appendChild(amountField);

  // Description
  const descField = makeField(STRINGS.editTransaction.description);
  const descInput = document.createElement('input');
  descInput.type      = 'text';
  descInput.id        = 'edit-description';
  descInput.className = 'input input-full';
  descInput.value     = tx.description || '';
  descInput.addEventListener('blur', () => performSave(true));
  descField.appendChild(descInput);
  form.appendChild(descField);

  // Subcategory
  const subField  = makeField(STRINGS.editTransaction.subcategory);
  const subSelect = buildSubcategorySelect('edit-subcategory', 'input input-full', tx.subcategoryId);
  subSelect.addEventListener('blur', () => performSave(true));
  subField.appendChild(subSelect);
  form.appendChild(subField);

  // Date
  const dateField = makeField(STRINGS.editTransaction.date);
  const dateInput = document.createElement('input');
  dateInput.type        = 'text';
  dateInput.id          = 'edit-date';
  dateInput.className   = 'input input-full';
  dateInput.placeholder = 'dd/mm/yyyy';
  dateInput.value       = formatDate(tx.date);
  dateInput.addEventListener('blur', () => performSave(true));
  dateField.appendChild(dateInput);
  form.appendChild(dateField);

  // Read-only createdAt
  const createdAtEl = document.createElement('div');
  createdAtEl.className   = 'created-at-footer';
  createdAtEl.textContent = `${STRINGS.editTransaction.createdAt} ${formatInstant(tx.createdAt)}`;
  form.appendChild(createdAtEl);

  container.appendChild(form);

  // ── Delete section ────────────────────────────────────────────────────────────
  const deleteSection = document.createElement('div');
  deleteSection.className = 'delete-section';
  const deleteBtn = document.createElement('button');
  deleteBtn.className   = 'btn btn-danger';
  deleteBtn.textContent = STRINGS.editTransaction.deleteButton;
  deleteBtn.addEventListener('click', () =>
    showDeleteConfirm(id, () => navigate('transactions'))
  );
  deleteSection.appendChild(deleteBtn);
  container.appendChild(deleteSection);
}

// ── Screen 5: Delete confirmation ─────────────────────────────────────────────
function showDeleteConfirm(id, onDeleted) {
  showModal(dialog => {
    const body = document.createElement('div');
    body.className = 'modal-body';

    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = STRINGS.deleteConfirm.title;

    const desc = document.createElement('div');
    desc.className = 'modal-description';
    desc.textContent = STRINGS.deleteConfirm.body;

    body.appendChild(modalTitle);
    body.appendChild(desc);

    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn';
    cancelBtn.textContent = STRINGS.deleteConfirm.cancel;
    cancelBtn.addEventListener('click', hideModal);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'modal-btn modal-btn-danger';
    deleteBtn.textContent = STRINGS.deleteConfirm.confirm;
    deleteBtn.addEventListener('click', async () => {
      try {
        await api.transactions.delete(id);
        hideModal();
        onDeleted();
      } catch {
        hideModal();
        showToast(STRINGS.errors.generic, 'error');
      }
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(deleteBtn);
    dialog.appendChild(body);
    dialog.appendChild(footer);
  });
}

// ── Screen 6: Category drill-in ───────────────────────────────────────────────
async function renderDrillInScreen(categoryId) {
  const year  = state.screenParams.year  || state.dashboardYear;
  const month = state.screenParams.month || state.dashboardMonth;
  const cat   = state.categories.find(c => c.id === categoryId);
  if (!cat) { navigate('dashboard'); return; }

  const container = document.getElementById('screen-container');

  // ── Three-column header ──────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'screen-header-3col';

  const backBtn = document.createElement('button');
  backBtn.className = 'btn-text btn-text-secondary header-left';
  backBtn.textContent = STRINGS.drillIn.back;
  backBtn.addEventListener('click', () => navigate('dashboard'));

  const centerTitle = document.createElement('span');
  centerTitle.className = 'header-center';
  centerTitle.textContent = cat.name;

  const spacer = document.createElement('span');
  spacer.className = 'drillIn-header-spacer';

  header.appendChild(backBtn);
  header.appendChild(centerTitle);
  header.appendChild(spacer);
  container.appendChild(header);

  // ── Content (loading state while fetching) ───────────────────────────────────
  const contentEl = document.createElement('div');
  contentEl.innerHTML = '<div class="empty-state">Φόρτωση…</div>';
  container.appendChild(contentEl);

  try {
    // Fetch transactions + budgets for the selected month in parallel
    const [transactions, budgets] = await Promise.all([
      api.transactions.list(year, month),
      api.budgets.list(year, month),
    ]);

    // Filter transactions to this category via subcategoryMap
    const catTransactions = transactions.filter(tx => {
      const info = state.subcategoryMap.get(tx.subcategoryId);
      return info && info.categoryId === categoryId;
    });

    // Per-subcategory spend totals
    const subSpentMap = new Map();
    for (const tx of catTransactions) {
      subSpentMap.set(tx.subcategoryId, (subSpentMap.get(tx.subcategoryId) || 0) + parseFloat(tx.amount));
    }

    // Per-subcategory projected amounts (from budget data for this category)
    const subBudgetMap = new Map();
    for (const b of budgets) {
      if (b.categoryId === categoryId) {
        subBudgetMap.set(b.subcategoryId, parseFloat(b.projectedAmount));
      }
    }

    const totalSpent     = catTransactions.reduce((s, tx) => s + parseFloat(tx.amount), 0);
    const totalProjected = [...subBudgetMap.values()].reduce((s, v) => s + v, 0);

    renderDrillInContent(contentEl, cat, catTransactions, subSpentMap, subBudgetMap, totalSpent, totalProjected, year, month);
  } catch {
    contentEl.innerHTML = `<div class="empty-state">${STRINGS.errors.generic}</div>`;
  }
}

function renderDrillInContent(contentEl, cat, catTransactions, subSpentMap, subBudgetMap, totalSpent, totalProjected, year, month) {
  contentEl.innerHTML = '';

  // Category total card
  contentEl.appendChild(buildDrillInTotalCard(totalSpent, totalProjected));

  // Subcategories section
  const subHeader = document.createElement('div');
  subHeader.className = 'section-header';
  const subLabel = document.createElement('span');
  subLabel.className = 'section-header-label';
  subLabel.textContent = STRINGS.drillIn.subcategories;
  subHeader.appendChild(subLabel);
  contentEl.appendChild(subHeader);

  for (const sub of cat.subcategories) {
    const spent     = subSpentMap.get(sub.id) || 0;
    const projected = subBudgetMap.get(sub.id) || 0;
    contentEl.appendChild(buildDrillInSubRow(sub, spent, projected));
  }

  // Filtered transactions section
  const txHeader = document.createElement('div');
  txHeader.className = 'section-header';
  const txLabel = document.createElement('span');
  txLabel.className = 'section-header-label';
  txLabel.textContent = STRINGS.drillIn.transactions;
  txHeader.appendChild(txLabel);
  contentEl.appendChild(txHeader);

  if (catTransactions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = STRINGS.transactions.emptyState;
    contentEl.appendChild(empty);
  } else {
    for (const tx of catTransactions) {
      contentEl.appendChild(buildDrillInTxRow(tx, cat.id, year, month));
    }
  }
}

function buildDrillInTotalCard(totalSpent, totalProjected) {
  const hasProjected = totalProjected > 0;
  const overBudget   = totalSpent > totalProjected;

  const card = document.createElement('div');
  card.className = 'drillIn-total-card';

  const row = document.createElement('div');
  row.className = 'drillIn-total-row';

  // Left: Σύνολο μήνα
  const left = document.createElement('div');
  const leftLabel = document.createElement('div');
  leftLabel.className = 'drillIn-total-label';
  leftLabel.textContent = STRINGS.drillIn.monthTotal;
  const leftAmount = document.createElement('div');
  leftAmount.className = 'drillIn-total-amount ' + (overBudget ? 'text-danger' : '');
  leftAmount.textContent = formatMoney(totalSpent);
  left.appendChild(leftLabel);
  left.appendChild(leftAmount);

  // Right: Προϋπολογισμός
  const right = document.createElement('div');
  right.style.textAlign = 'right';
  const rightLabel = document.createElement('div');
  rightLabel.className = 'drillIn-total-label';
  rightLabel.textContent = STRINGS.drillIn.budget;
  const rightAmount = document.createElement('div');
  rightAmount.className = 'drillIn-projected-amount text-secondary';
  rightAmount.textContent = hasProjected ? formatMoney(totalProjected) : STRINGS.drillIn.noBudget;
  right.appendChild(rightLabel);
  right.appendChild(rightAmount);

  row.appendChild(left);
  row.appendChild(right);
  card.appendChild(row);

  if (hasProjected) {
    card.appendChild(buildProgressBar(totalSpent, totalProjected));
  }

  if (overBudget && hasProjected) {
    const overEl = document.createElement('div');
    overEl.className = 'drillIn-overbudget';
    overEl.textContent = `${STRINGS.drillIn.overBudget} ${formatMoney(totalSpent - totalProjected)}`;
    card.appendChild(overEl);
  }

  return card;
}

function buildDrillInSubRow(sub, spent, projected) {
  const hasProjected = projected > 0;
  const overBudget   = spent > projected;

  const row = document.createElement('div');
  row.className = 'sub-row';

  const main = document.createElement('div');
  main.className = 'sub-row-main';

  const nameEl = document.createElement('span');
  nameEl.className = 'sub-row-name';
  nameEl.textContent = sub.name;

  const amountsEl = document.createElement('div');
  amountsEl.className = 'sub-row-amounts';

  const spentEl = document.createElement('span');
  spentEl.className = 'fw-500 ' + (overBudget ? 'text-danger' : '');
  spentEl.textContent = formatMoney(spent);

  const projEl = document.createElement('span');
  projEl.className = 'text-secondary';
  projEl.textContent = ' / ' + (hasProjected ? formatMoney(projected) : STRINGS.drillIn.noBudget);

  amountsEl.appendChild(spentEl);
  amountsEl.appendChild(projEl);
  main.appendChild(nameEl);
  main.appendChild(amountsEl);
  row.appendChild(main);

  if (hasProjected) {
    row.appendChild(buildProgressBar(spent, projected, true)); // thin bar
  }

  return row;
}

function buildDrillInTxRow(tx, categoryId, year, month) {
  const row = document.createElement('div');
  row.className = 'tx-row';

  const left = document.createElement('div');
  left.className = 'tx-row-left';

  const titleEl = document.createElement('div');
  titleEl.className = 'tx-row-title';
  titleEl.textContent = tx.description || tx.subcategoryName;

  const subtitleEl = document.createElement('div');
  subtitleEl.className = 'tx-row-subtitle';
  subtitleEl.textContent = `${formatShortDate(tx.date)} · ${tx.subcategoryName}`;

  left.appendChild(titleEl);
  left.appendChild(subtitleEl);

  const right = document.createElement('div');
  right.className = 'tx-row-right';

  const amountEl = document.createElement('div');
  amountEl.className = 'tx-row-amount';
  amountEl.textContent = '−' + formatMoney(parseFloat(tx.amount));

  right.appendChild(amountEl);
  row.appendChild(left);
  row.appendChild(right);

  // Pass from/categoryId/year/month so edit screen can navigate back here
  row.addEventListener('click', () =>
    navigate('editTransaction', {
      id: tx.id,
      from: 'drillIn',
      categoryId,
      year,
      month,
    })
  );

  return row;
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  initTabBar();

  try {
    state.categories = await api.categories.list();
    state.subcategoryMap = buildSubcategoryMap(state.categories);
  } catch {
    document.getElementById('screen-container').innerHTML =
      `<div class="empty-state">${STRINGS.errors.generic}</div>`;
    return;
  }

  navigate('transactions');
}

document.addEventListener('DOMContentLoaded', init);
