/* ================= 智賬 ================= */
'use strict';

const LS_KEY = 'zhizhang.v1';

const DEFAULT_CATS = {
  expense: [
    { id: 'food',      name: '餐飲', icon: '🍜' },
    { id: 'transport', name: '交通', icon: '🚗' },
    { id: 'shopping',  name: '購物', icon: '🛍️' },
    { id: 'fun',       name: '娛樂', icon: '🎮' },
    { id: 'daily',     name: '日用', icon: '🏠' },
    { id: 'bill',      name: '帳單', icon: '📄' },
    { id: 'medical',   name: '醫療', icon: '💊' },
    { id: 'beauty',    name: '美妝', icon: '💄' },
    { id: 'travel',    name: '旅行', icon: '✈️' },
    { id: 'fee',       name: '手續費', icon: '🏦' },
    { id: 'other',     name: '其他', icon: '📌' },
  ],
  income: [
    { id: 'salary', name: '薪資', icon: '💰' },
    { id: 'bonus',  name: '獎金', icon: '🎁' },
    { id: 'invest', name: '投資', icon: '📈' },
    { id: 'other',  name: '其他', icon: '📌' },
  ],
};
const TRANSFER_CAT = { name: '轉帳', icon: '🤝' };
const PALETTE = ['#3E8E7E', '#D96C5F', '#E0A458', '#6B7FB3', '#9C6BB3', '#5FA8D9', '#D95F8A', '#7FB36B', '#B3A16B', '#8A8F8C'];

/* ---------- 資料 ---------- */
function load() {
  let d = null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) d = JSON.parse(raw);
  } catch (e) { d = null; }
  if (!d || !Array.isArray(d.txs) || !d.members) d = { members: { p1: '我', p2: '男友' }, txs: [] };
  if (!d.categories || !Array.isArray(d.categories.expense) || !Array.isArray(d.categories.income)) {
    d.categories = JSON.parse(JSON.stringify(DEFAULT_CATS));
  }
  migrate(d);
  return d;
}
function migrate(d) {
  d.txs.forEach((t) => {
    // 舊版：成員間 repay → transfer(from/to)
    if (t.type === 'repay') {
      t.type = 'transfer';
      t.from = t.payer;
      t.to = t.payer === 'p1' ? 'p2' : 'p1';
      delete t.payer;
    }
    // 舊版：帳戶間轉帳（無成員資訊）→ 標記 legacy，不入結算
    if (t.type === 'transfer' && !t.from && t.fromAccount) t.legacy = true;
  });
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

let db = load();
const cats = (type) => db.categories[type] || [];

/* ---------- 小工具 ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const round2 = (n) => Math.round(n * 100) / 100;
const fmtN = (n) => round2(n).toLocaleString('zh-TW', { maximumFractionDigits: 2 });
const fmt = (n) => 'NT$ ' + fmtN(n);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const thisMonth = () => today().slice(0, 7);
const monthLabel = (ym) => `${ym.slice(0, 4)} 年 ${Number(ym.slice(5))} 月`;
const shiftMonth = (ym, d) => {
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(y, m - 1 + d, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};
const daysInMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};
const shiftDate = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const catOf = (tx) => {
  if (tx.type === 'transfer') return TRANSFER_CAT;
  return cats(tx.type).find((c) => c.id === tx.category) || { name: '其他', icon: '📌' };
};
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const weekdayOf = (d) => WEEKDAYS[new Date(d + 'T00:00:00').getDay()];

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
}

function txSort(a, b) { return b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0); }

function txSubtitle(tx) {
  if (tx.type === 'income') return `${esc(db.members[tx.payer] || '')} 收到`;
  if (tx.type === 'transfer') {
    if (tx.legacy) return `${esc(tx.fromAccount || '')} → ${esc(tx.toAccount || '')}`;
    return `${esc(db.members[tx.from] || '')} 轉給 ${esc(db.members[tx.to] || '')}`;
  }
  const payer = esc(db.members[tx.payer] || '');
  const parts = ['p1', 'p2'].filter((p) => tx.split && tx.split[p] > 0);
  if (parts.length === 0) return `${payer} 付款`;
  const splitTxt = parts.length === 2
    ? (Math.abs(tx.split.p1 - tx.split.p2) < 0.011 ? '兩人平分' : `${esc(db.members.p1)} ${fmtN(tx.split.p1)}／${esc(db.members.p2)} ${fmtN(tx.split.p2)}`)
    : `${esc(db.members[parts[0]])} 全額負擔`;
  return `${payer} 付款 · ${splitTxt}`;
}

function txItemHTML(tx, { showDate = false } = {}) {
  const c = catOf(tx);
  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : '';
  const datePrefix = showDate ? `${Number(tx.date.slice(5, 7))}/${Number(tx.date.slice(8))} · ` : '';
  return `
    <div class="tx-item" data-id="${tx.id}">
      <div class="tx-icon ${tx.type}">${c.icon}</div>
      <div class="tx-main">
        <div class="tx-title">${esc(c.name)}${tx.note ? ' · ' + esc(tx.note) : ''}</div>
        <div class="tx-sub">${datePrefix}${txSubtitle(tx)}</div>
      </div>
      <div class="tx-amount ${tx.type}">${sign}${fmtN(tx.amount)}</div>
    </div>`;
}

/* ==================================================
   記一筆（整頁）
================================================== */
const form = {
  type: 'expense', category: 'food',
  payer: 'p1',
  from: 'p1', to: 'p2',
  feeOn: false, feePayer: 'p1',
  participants: { p1: true, p2: true },
  splitMode: 'even', custom: { p1: '', p2: '' },
  expr: '', date: '',
};
let editId = null;
let keypadOpen = false;

/* ----- 計算鍵盤運算 ----- */
function evalExpr(expr) {
  const tokens = expr.match(/(\d+\.?\d*|\.\d+|[+−×÷])/g);
  if (!tokens) return NaN;
  const vals = [], ops = [];
  const prec = { '+': 1, '−': 1, '×': 2, '÷': 2 };
  const apply = () => {
    const op = ops.pop(), b = vals.pop(), a = vals.pop();
    if (a === undefined || b === undefined) { vals.push(NaN); return; }
    vals.push(op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : (b === 0 ? NaN : a / b));
  };
  let expectNum = true;
  for (const t of tokens) {
    if (prec[t]) {
      if (expectNum) return NaN;
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) apply();
      ops.push(t);
      expectNum = true;
    } else {
      vals.push(parseFloat(t));
      expectNum = false;
    }
  }
  if (expectNum) ops.pop(); // 結尾運算子 → 忽略
  while (ops.length) apply();
  return vals.length === 1 ? round2(vals[0]) : NaN;
}
const formAmount = () => {
  const v = evalExpr(form.expr);
  return isNaN(v) ? 0 : v;
};

function keypadPress(k) {
  const isOp = '＋+−×÷'.includes(k);
  if (k === '⌫') { form.expr = form.expr.slice(0, -1); }
  else if (isOp) {
    if (!form.expr) return;
    if ('+−×÷'.includes(form.expr.slice(-1))) form.expr = form.expr.slice(0, -1) + k;
    else form.expr += k;
  } else if (k === '.') {
    const seg = form.expr.split(/[+−×÷]/).pop();
    if (seg.includes('.')) return;
    form.expr += seg === '' ? '0.' : '.';
  } else {
    const seg = form.expr.split(/[+−×÷]/).pop();
    if (seg.replace('.', '').length + k.length > 10) return;
    if ((k === '00' || k === '000') && (seg === '' || seg === '0')) return;
    form.expr += k;
  }
  updateAmountUI();
}

function updateAmountUI() {
  const inp = $('#amountInput');
  if (inp.value !== form.expr) inp.value = form.expr;
  const hasOp = /[+−×÷]/.test(form.expr);
  const v = formAmount();
  $('#amountEval').textContent = hasOp && v ? '= ' + fmtN(v) : '';
  $('#amountRow').classList.toggle('active-row', keypadOpen);
  $('#btnKeypadToggle').classList.toggle('on', keypadOpen);
}

function splitSummary() {
  const parts = ['p1', 'p2'].filter((p) => form.participants[p]);
  if (parts.length === 0) return '未選擇';
  if (parts.length === 1) return `${db.members[parts[0]]} 全額負擔`;
  if (form.splitMode === 'even') return '兩人平分';
  const a = parseFloat(form.custom.p1) || 0, b = parseFloat(form.custom.p2) || 0;
  return `${db.members.p1} ${fmtN(a)}／${db.members.p2} ${fmtN(b)}`;
}

/* ----- 表單列 ----- */
function renderAddRows() {
  const rows = [];
  const chev = `<span class="chev">›</span>`;

  if (form.type === 'transfer') {
    rows.push(`
      <button type="button" class="form-row" data-row="from">
        <span class="ric">📤</span><span class="rlab">誰轉出</span>
        <span class="rval filled">${esc(db.members[form.from])}</span>${chev}
      </button>
      <button type="button" class="form-row" data-row="to">
        <span class="ric">📥</span><span class="rlab">轉給誰</span>
        <span class="rval filled">${esc(db.members[form.to])}</span>${chev}
      </button>`);
  } else {
    const c = cats(form.type).find((x) => x.id === form.category) || cats(form.type)[0] || { icon: '📌', name: '其他' };
    rows.push(`
      <button type="button" class="form-row" data-row="category">
        <span class="ric">${c.icon}</span><span class="rlab">類別</span>
        <span class="rval filled">${esc(c.name)}</span>${chev}
      </button>
      <button type="button" class="form-row" data-row="member">
        <span class="ric">👤</span><span class="rlab">${form.type === 'income' ? '誰收到' : '誰付的'}</span>
        <span class="rval filled">${esc(db.members[form.payer])}</span>${chev}
      </button>`);
    if (form.type === 'expense') {
      rows.push(`
        <button type="button" class="form-row" data-row="split">
          <span class="ric">🤝</span><span class="rlab">誰要分攤</span>
          <span class="rval filled">${esc(splitSummary())}</span>${chev}
        </button>`);
    }
  }
  $('#addRows').innerHTML = rows.join('');

  // 手續費卡（轉帳）
  $('#feeCard').hidden = form.type !== 'transfer';
  $('#feeToggle').checked = form.feeOn;
  $('#feeFields').hidden = !form.feeOn;
  $('#feePayerVal').textContent = db.members[form.feePayer];
}

/* ----- 分攤（彈窗） ----- */
function renderSplitWho() {
  $('#splitWho').innerHTML = ['p1', 'p2'].map((p) => `
    <label class="check-pill ${form.participants[p] ? 'checked' : ''}" data-part="${p}">
      <span class="box">✓</span>${esc(db.members[p])}
    </label>`).join('');
}

function renderSplitDetail() {
  $$('#segSplitMode .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === form.splitMode));
  const box = $('#splitDetail');
  const parts = ['p1', 'p2'].filter((p) => form.participants[p]);
  const amount = formAmount();

  if (parts.length === 0) {
    box.innerHTML = `<div class="split-even-hint">請至少勾選一位分攤成員</div>`;
    return;
  }
  if (form.splitMode === 'even') {
    const per = round2(amount / parts.length);
    box.innerHTML = amount > 0
      ? `<div class="split-even-hint">${parts.map((p) => esc(db.members[p])).join('、')} 每人約 <b>${fmt(per)}</b></div>`
      : `<div class="split-even-hint">輸入金額後自動平均分攤</div>`;
    return;
  }
  box.innerHTML = parts.map((p) => `
    <div class="split-custom-row">
      <span class="name">${esc(db.members[p])}</span>
      <input class="input custom-split" data-person="${p}" type="number" inputmode="decimal" min="0" step="0.01"
             placeholder="0" value="${form.custom[p]}">
    </div>`).join('') + `<div class="split-remain" id="splitRemain"></div>`;
  updateRemainHint();
}

function updateRemainHint() {
  const el = $('#splitRemain');
  if (!el) return;
  const amount = formAmount();
  const parts = ['p1', 'p2'].filter((p) => form.participants[p]);
  const sum = round2(parts.reduce((s, p) => s + (parseFloat(form.custom[p]) || 0), 0));
  const diff = round2(amount - sum);
  if (amount <= 0) { el.textContent = '請先輸入總金額'; el.className = 'split-remain'; return; }
  if (Math.abs(diff) < 0.005) { el.textContent = '✓ 分攤金額剛好等於總金額'; el.className = 'split-remain ok'; }
  else if (diff > 0) { el.textContent = `還剩 ${fmt(diff)} 未分配`; el.className = 'split-remain bad'; }
  else { el.textContent = `超出總金額 ${fmt(-diff)}`; el.className = 'split-remain bad'; }
}

function openSplit() {
  renderSplitWho();
  renderSplitDetail();
  $('#dlgSplit').showModal();
}

function updateDateBtn() {
  const d = form.date || today();
  $('#addDateBtn').innerHTML = `${d.replace(/-/g, '/')} 週${weekdayOf(d)} <span class="caret">▾</span>`;
}

function renderAddPage() {
  $$('#segAddType .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.type === form.type));
  renderAddRows();
  updateAmountUI();
  updateDateBtn();
}

/* ----- 日期選擇器（日 → 月 → 年 層級跳轉；mode: date | month） ----- */
let dpMode = 'date';        // date: 選到日；month: 選到月
let dpView = 'day';         // day | month | year
let dpMonth = thisMonth();  // 目前顯示的年月
let dpYearBase = 2020;      // 年份頁的起始年
let dpValue = '';           // 目前選取值（date 或 ym）
let dpOnPick = null;

function openDp(opts) {
  dpMode = opts.mode;
  dpValue = opts.value || (dpMode === 'date' ? today() : thisMonth());
  dpOnPick = opts.onPick;
  dpMonth = dpMode === 'date' ? dpValue.slice(0, 7) : dpValue;
  dpView = dpMode === 'date' ? 'day' : 'month';
  renderDp();
  $('#dlgDate').showModal();
}

function dpApply(v) {
  $('#dlgDate').close();
  if (dpOnPick) dpOnPick(v);
}

function renderDp() {
  const year = Number(dpMonth.slice(0, 4));
  $('#dpWeek').hidden = dpView !== 'day';
  $('#dpGrid').hidden = dpView !== 'day';
  $('#dpMonths').hidden = dpView !== 'month';
  $('#dpYears').hidden = dpView !== 'year';
  $('#dpYesterday').hidden = dpMode !== 'date';
  $('#dpToday').textContent = dpMode === 'date' ? '今天' : '本月';

  if (dpView === 'day') {
    $('#dpTitle').innerHTML = `${monthLabel(dpMonth)} <span class="caret">▾</span>`;
    renderDpDays();
  } else if (dpView === 'month') {
    $('#dpTitle').innerHTML = `${year} 年 <span class="caret">▾</span>`;
    renderDpMonths(year);
  } else {
    $('#dpTitle').textContent = `${dpYearBase} – ${dpYearBase + 11}`;
    renderDpYears();
  }
}

function renderDpDays() {
  const [y, m] = dpMonth.split('-').map(Number);
  const firstDow = new Date(y, m - 1, 1).getDay();
  const nDays = daysInMonth(dpMonth);
  const tdy = today();
  const cells = [];
  const prevN = daysInMonth(shiftMonth(dpMonth, -1));
  for (let i = 0; i < firstDow; i++) cells.push(`<span class="cal-day muted"><span class="num">${prevN - firstDow + 1 + i}</span></span>`);
  for (let d = 1; d <= nDays; d++) {
    const ds = `${dpMonth}-${String(d).padStart(2, '0')}`;
    cells.push(`
      <button type="button" class="cal-day ${ds === dpValue ? 'selected' : ''} ${ds === tdy ? 'today' : ''}" data-date="${ds}">
        <span class="num">${d}</span>
      </button>`);
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) cells.push(`<span class="cal-day muted"><span class="num">${i}</span></span>`);
  $('#dpGrid').innerHTML = cells.join('');
}

function renderDpMonths(year) {
  const curYm = dpMode === 'date' ? dpValue.slice(0, 7) : dpValue;
  const nowYm = thisMonth();
  $('#dpMonths').innerHTML = Array.from({ length: 12 }, (_, i) => {
    const ym = `${year}-${String(i + 1).padStart(2, '0')}`;
    return `<button type="button" class="dp-cell ${ym === curYm ? 'selected' : ''} ${ym === nowYm ? 'now' : ''}" data-ym="${ym}">${i + 1} 月</button>`;
  }).join('');
}

function renderDpYears() {
  const curY = dpMonth.slice(0, 4);
  const nowY = today().slice(0, 4);
  $('#dpYears').innerHTML = Array.from({ length: 12 }, (_, i) => {
    const yr = String(dpYearBase + i);
    return `<button type="button" class="dp-cell ${yr === curY ? 'selected' : ''} ${yr === nowY ? 'now' : ''}" data-year="${yr}">${yr}</button>`;
  }).join('');
}

function openDatePicker() {
  openDp({
    mode: 'date',
    value: form.date || today(),
    onPick: (ds) => { form.date = ds; updateDateBtn(); },
  });
}

function openAdd(editTx = null) {
  editId = editTx ? editTx.id : null;
  keypadOpen = false;
  $('#keypad').hidden = true;
  $('#addFoot').hidden = false;
  if (editTx) {
    form.type = editTx.type;
    form.expr = String(editTx.amount);
    form.category = editTx.category || (cats(editTx.type === 'transfer' ? 'expense' : editTx.type)[0] || {}).id;
    form.payer = editTx.payer || 'p1';
    form.from = editTx.from || 'p1';
    form.to = editTx.to || (form.from === 'p1' ? 'p2' : 'p1');
    form.feeOn = false;
    if (editTx.type === 'expense' && editTx.split) {
      form.participants = { p1: (editTx.split.p1 || 0) > 0, p2: (editTx.split.p2 || 0) > 0 };
      const both = form.participants.p1 && form.participants.p2;
      const even = both && Math.abs(editTx.split.p1 - editTx.split.p2) < 0.011;
      form.splitMode = (even || !both) ? 'even' : 'custom';
      form.custom = { p1: editTx.split.p1 || '', p2: editTx.split.p2 || '' };
    } else {
      form.participants = { p1: true, p2: true };
      form.splitMode = 'even';
      form.custom = { p1: '', p2: '' };
    }
    form.date = editTx.date;
    $('#addNote').value = editTx.note || '';
  } else {
    form.type = 'expense';
    form.expr = '';
    form.category = (cats('expense')[0] || {}).id;
    form.payer = 'p1';
    form.from = 'p1';
    form.to = 'p2';
    form.feeOn = false;
    form.feePayer = 'p1';
    form.participants = { p1: true, p2: true };
    form.splitMode = 'even';
    form.custom = { p1: '', p2: '' };
    form.date = today();
    $('#addNote').value = '';
    $('#feeAmount').value = '';
  }
  renderAddPage();
  $('#addPage').hidden = false;
}

function closeAdd() {
  $('#addPage').hidden = true;
  editId = null;
}

function saveTx(keepOpen) {
  const amount = formAmount();
  if (!amount || amount <= 0) { toast('請輸入金額'); openKeypad(); return; }
  const date = form.date || today();
  const note = $('#addNote').value.trim();
  const base = {
    id: editId || uid(),
    type: form.type, amount, date, note,
    createdAt: editId ? (db.txs.find((t) => t.id === editId)?.createdAt || Date.now()) : Date.now(),
  };
  let feeTx = null;

  if (form.type === 'transfer') {
    if (form.from === form.to) { toast('轉出與轉入不能是同一人'); return; }
    base.from = form.from;
    base.to = form.to;
    if (form.feeOn) {
      const feeAmt = round2(parseFloat($('#feeAmount').value) || 0);
      if (feeAmt > 0) {
        const split = { p1: 0, p2: 0 };
        split[form.feePayer] = feeAmt;
        feeTx = {
          id: uid(), type: 'expense', category: 'fee', amount: feeAmt,
          payer: form.feePayer, split, date, note: '轉帳手續費',
          createdAt: Date.now(),
        };
      }
    }
  } else {
    base.category = form.category;
    base.payer = form.payer;
    if (form.type === 'expense') {
      const parts = ['p1', 'p2'].filter((p) => form.participants[p]);
      if (parts.length === 0) { toast('請至少勾選一位分攤成員'); openSplit(); return; }
      const split = { p1: 0, p2: 0 };
      if (form.splitMode === 'even') {
        const per = round2(amount / parts.length);
        parts.forEach((p) => { split[p] = per; });
        split[parts[0]] = round2(split[parts[0]] + (amount - round2(per * parts.length)));
      } else {
        parts.forEach((p) => { split[p] = round2(parseFloat(form.custom[p]) || 0); });
        if (Math.abs(round2(split.p1 + split.p2) - amount) > 0.005) { toast('自訂分攤金額需等於總金額'); openSplit(); return; }
      }
      base.split = split;
    }
  }

  if (editId) {
    const i = db.txs.findIndex((t) => t.id === editId);
    if (i >= 0) db.txs[i] = base;
    toast('已更新');
  } else {
    db.txs.push(base);
    toast('已記錄 ' + fmt(amount));
  }
  if (feeTx) db.txs.push(feeTx);
  save();
  renderCurrentView();

  if (keepOpen) {
    editId = null;
    form.expr = '';
    // 分攤重設為預設：兩人平分
    form.participants = { p1: true, p2: true };
    form.splitMode = 'even';
    form.custom = { p1: '', p2: '' };
    form.feeOn = false;
    $('#addNote').value = '';
    $('#feeAmount').value = '';
    renderAddPage();
    openKeypad();
  } else {
    closeAdd();
  }
}

function openKeypad() {
  keypadOpen = true;
  $('#amountInput').blur();
  $('#keypad').hidden = false;
  $('#addFoot').hidden = true;
  updateAmountUI();
}
function closeKeypad() {
  keypadOpen = false;
  $('#keypad').hidden = true;
  $('#addFoot').hidden = false;
  updateAmountUI();
}

/* ----- 選擇器 ----- */
function openPicker(kind) {
  const dlg = $('#dlgPicker');
  const body = $('#pickerBody');
  if (kind === 'category') {
    $('#pickerTitle').textContent = '選擇類別';
    body.innerHTML = `<div class="picker-grid">` + cats(form.type).map((c) =>
      `<button class="chip ${c.id === form.category ? 'active' : ''}" data-val="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('') + `</div>`;
  } else {
    const titles = { member: form.type === 'income' ? '誰收到的錢' : '誰付的錢', from: '誰轉出', to: '轉給誰', feePayer: '手續費誰付的' };
    const curMap = { member: form.payer, from: form.from, to: form.to, feePayer: form.feePayer };
    $('#pickerTitle').textContent = titles[kind];
    body.innerHTML = `<div class="picker-grid">` + ['p1', 'p2'].map((p) =>
      `<button class="chip ${curMap[kind] === p ? 'active' : ''}" data-val="${p}">👤 ${esc(db.members[p])}</button>`).join('') + `</div>`;
  }
  dlg.dataset.kind = kind;
  dlg.showModal();
}

/* ==================================================
   Books
================================================== */
let booksMode = 'calendar';
let booksMonth = thisMonth();
let selectedDay = today();
let listFilter = 'io';

function txsOfMonth(ym) { return db.txs.filter((t) => t.date.startsWith(ym)).sort(txSort); }

function renderBooks() {
  $('#booksMonthText').textContent = monthLabel(booksMonth);
  $$('#segBooksMode .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === booksMode));
  $('#booksCalendar').hidden = booksMode !== 'calendar';
  $('#booksList').hidden = booksMode !== 'list';
  if (booksMode === 'calendar') renderCalendar();
  else renderTxList();
}

function renderCalendar() {
  const [y, m] = booksMonth.split('-').map(Number);
  const firstDow = new Date(y, m - 1, 1).getDay();
  const nDays = daysInMonth(booksMonth);
  const txs = txsOfMonth(booksMonth);
  const byDay = {};
  txs.forEach((t) => { (byDay[t.date] ||= []).push(t); });

  const cells = [];
  const prevN = daysInMonth(shiftMonth(booksMonth, -1));
  for (let i = 0; i < firstDow; i++) cells.push(`<span class="cal-day muted"><span class="num">${prevN - firstDow + 1 + i}</span></span>`);
  const tdy = today();
  for (let d = 1; d <= nDays; d++) {
    const ds = `${booksMonth}-${String(d).padStart(2, '0')}`;
    const dayTxs = byDay[ds] || [];
    const hasExp = dayTxs.some((t) => t.type === 'expense' || t.type === 'transfer');
    const hasInc = dayTxs.some((t) => t.type === 'income');
    const dots = (hasExp ? '<span class="cal-dot"></span>' : '') + (hasInc ? '<span class="cal-dot inc"></span>' : '');
    cells.push(`
      <button type="button" class="cal-day ${ds === selectedDay ? 'selected' : ''} ${ds === tdy ? 'today' : ''}" data-date="${ds}">
        <span class="num">${d}</span><span class="cal-dots">${dots}</span>
      </button>`);
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) cells.push(`<span class="cal-day muted"><span class="num">${i}</span></span>`);
  $('#calGrid').innerHTML = cells.join('');

  const dayTxs = (selectedDay.startsWith(booksMonth) ? (byDay[selectedDay] || []) : []);
  const dayExp = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const dayInc = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const head = selectedDay.startsWith(booksMonth)
    ? `<div class="day-detail-head">
         <span>${Number(selectedDay.slice(5, 7))}/${Number(selectedDay.slice(8))} 週${weekdayOf(selectedDay)}</span>
         <span>${dayExp ? '支出 ' + fmtN(dayExp) : ''}${dayExp && dayInc ? ' · ' : ''}${dayInc ? '收入 ' + fmtN(dayInc) : ''}</span>
       </div>`
    : '';
  $('#dayDetail').innerHTML = head + (dayTxs.length
    ? dayTxs.map((t) => txItemHTML(t)).join('')
    : `<div class="empty" style="padding:24px 0">這天沒有記錄</div>`);
}

function renderTxList() {
  $$('#segListFilter .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.filter === listFilter));
  const all = txsOfMonth(booksMonth);
  const txs = all.filter((t) =>
    listFilter === 'all' ? true :
    listFilter === 'transfer' ? t.type === 'transfer' :
    (t.type === 'expense' || t.type === 'income'));

  let exp = 0, inc = 0;
  all.forEach((t) => { if (t.type === 'expense') exp += t.amount; else if (t.type === 'income') inc += t.amount; });
  $('#listSummary').innerHTML = `
    <div class="inc">收入<b>${fmtN(inc)}</b></div>
    <div class="exp">支出<b>${fmtN(exp)}</b></div>
    <div>結餘<b>${fmtN(inc - exp)}</b></div>`;

  const listEl = $('#txList');
  if (txs.length === 0) {
    listEl.innerHTML = `<div class="empty"><div class="big">🗒️</div>這個月還沒有${listFilter === 'transfer' ? '轉帳' : ''}記錄</div>`;
    return;
  }
  const byDay = {};
  txs.forEach((t) => { (byDay[t.date] ||= []).push(t); });
  listEl.innerHTML = Object.keys(byDay).sort().reverse().map((d) => {
    const dayExp = byDay[d].filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return `<div class="day-group">
      <div class="day-head"><span>${Number(d.slice(5, 7))}/${Number(d.slice(8))} 週${weekdayOf(d)}</span><span>${dayExp ? '支出 ' + fmtN(dayExp) : ''}</span></div>
      ${byDay[d].map((t) => txItemHTML(t)).join('')}</div>`;
  }).join('');
}

/* ----- 搜尋 ----- */
function runSearch() {
  const q = $('#searchInput').value.trim().toLowerCase();
  const box = $('#searchResults');
  if (!q) {
    box.innerHTML = `<div class="empty"><div class="big">🔍</div>輸入關鍵字搜尋全部歷史記錄</div>`;
    return;
  }
  const hits = db.txs.filter((t) => {
    const c = catOf(t);
    const hay = [
      c.name, t.note || '',
      t.payer ? db.members[t.payer] : '',
      t.from ? db.members[t.from] : '', t.to ? db.members[t.to] : '',
      String(t.amount), t.date,
    ].join(' ').toLowerCase();
    return hay.includes(q);
  }).sort(txSort).slice(0, 100);
  box.innerHTML = hits.length
    ? `<div class="day-head" style="padding:6px 4px"><span>找到 ${hits.length} 筆</span></div>` +
      hits.map((t) => txItemHTML(t, { showDate: true })).join('')
    : `<div class="empty"><div class="big">🤷</div>沒有符合「${esc(q)}」的記錄</div>`;
}

/* ==================================================
   Reports（分類報表）
================================================== */
let repPeriod = 'month';
let repMonth = thisMonth();
let repYear = thisMonth().slice(0, 4);
let repRange = null;
let repKind = 'expense';

function periodFilter() {
  if (repPeriod === 'month') {
    const start = repMonth + '-01';
    const end = repMonth + '-' + String(daysInMonth(repMonth)).padStart(2, '0');
    return { start, end, label: monthLabel(repMonth) };
  }
  if (repPeriod === 'year') return { start: repYear + '-01-01', end: repYear + '-12-31', label: repYear + ' 年' };
  if (repRange) return repRange;
  return { start: '0000-01-01', end: '9999-12-31', label: '全部期間' };
}

function periodTxs() {
  const { start, end } = periodFilter();
  return db.txs.filter((t) => t.date >= start && t.date <= end);
}

function periodDays() {
  const { start, end } = periodFilter();
  const tdy = today();
  const s = start < '2000-01-01' ? (db.txs.length ? [...db.txs].sort((a, b) => a.date.localeCompare(b.date))[0].date : tdy) : start;
  const e = end > tdy ? tdy : end;
  const ms = new Date(e + 'T00:00:00') - new Date(s + 'T00:00:00');
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function renderReports() {
  $$('#segRepPeriod .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.period === repPeriod));
  $$('#repIOWrap .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.kind === repKind));
  $('#repTitle').textContent = periodFilter().label;
  const navVisible = repPeriod !== 'range';
  $('#repPrev').style.visibility = navVisible ? 'visible' : 'hidden';
  $('#repNext').style.visibility = navVisible ? 'visible' : 'hidden';

  const kindLabel = repKind === 'expense' ? '支出' : repKind === 'income' ? '收入' : '轉帳';
  const txs = periodTxs().filter((t) =>
    repKind === 'transfer' ? (t.type === 'transfer' && !t.legacy) : t.type === repKind);
  const total = txs.reduce((s, t) => s + t.amount, 0);
  const byKey = {};
  txs.forEach((t) => {
    const key = repKind === 'transfer' ? `${db.members[t.from]} 轉出` : catOf(t).name;
    byKey[key] = (byKey[key] || 0) + t.amount;
  });
  const rows = Object.entries(byKey).sort((a, b) => b[1] - a[1]);

  if (rows.length === 0) {
    $('#repBody').innerHTML = `<div class="empty"><div class="big">📊</div>此期間沒有${kindLabel}記錄</div>`;
    return;
  }

  let acc = 0;
  const stops = rows.map(([name, amt], i) => {
    const from = (acc / total) * 360;
    acc += amt;
    const to = (acc / total) * 360;
    return `${PALETTE[i % PALETTE.length]} ${from.toFixed(2)}deg ${to.toFixed(2)}deg`;
  }).join(', ');

  const legend = rows.map(([name], i) => `
    <div class="legend-row">
      <span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>
      <span class="nm">${esc(name)}</span>
    </div>`).join('');

  const rank = rows.map(([name, amt], i) => `
    <div class="rank-row">
      <span class="idx">${i + 1}</span>
      <span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>
      <span class="nm">${esc(name)}</span>
      <span class="amt">${fmtN(amt)}</span>
      <span class="pct">${((amt / total) * 100).toFixed(1)}%</span>
    </div>`).join('');

  $('#repBody').innerHTML = `
    <div class="card">
      <div class="donut-wrap">
        <div class="donut" style="background:conic-gradient(${stops})">
          <div class="donut-center"><span>${kindLabel}</span><b>${fmtN(total)}</b></div>
        </div>
        <div class="legend">${legend}</div>
      </div>
      <div class="rep-meta">
        <span>總計 <b>${fmtN(total)}</b></span>
        <span>日均 <b>${fmtN(total / periodDays())}</b></span>
      </div>
    </div>
    <div class="card">${rank}</div>`;
}

/* ==================================================
   Accounts（成員結算）
================================================== */
function balances() {
  // 正值 = 多付了錢（對方欠他）
  const bal = { p1: 0, p2: 0 };
  db.txs.forEach((t) => {
    if (t.type === 'expense' && t.split) {
      bal[t.payer] += t.amount;
      bal.p1 -= t.split.p1 || 0;
      bal.p2 -= t.split.p2 || 0;
    } else if (t.type === 'transfer' && t.from && t.to && !t.legacy) {
      bal[t.from] += t.amount;
      bal[t.to] -= t.amount;
    }
  });
  bal.p1 = round2(bal.p1); bal.p2 = round2(bal.p2);
  return bal;
}

let accMonth = thisMonth();

function renderAccounts() {
  const bal = balances();
  let hero;
  if (Math.abs(bal.p1) < 0.01) {
    hero = `<div class="card settle-hero"><div class="all-clear">✓ 目前互不相欠</div><div class="who">繼續好好記帳吧</div></div>`;
  } else {
    const debtor = bal.p1 < 0 ? 'p1' : 'p2';
    const creditor = debtor === 'p1' ? 'p2' : 'p1';
    hero = `<div class="card settle-hero">
      <div class="who">${esc(db.members[debtor])} 需要給 ${esc(db.members[creditor])}</div>
      <div class="amt">${fmt(Math.abs(bal[debtor]))}</div>
      <button id="btnSettle" class="btn btn-primary" data-debtor="${debtor}">結清</button>
    </div>`;
  }

  const share = { p1: 0, p2: 0 };
  const mShare = { p1: 0, p2: 0 };
  db.txs.forEach((t) => {
    if (t.type === 'expense' && t.split) {
      share.p1 += t.split.p1 || 0; share.p2 += t.split.p2 || 0;
      if (t.date.startsWith(accMonth)) {
        mShare.p1 += t.split.p1 || 0; mShare.p2 += t.split.p2 || 0;
      }
    }
  });
  const detail = ['p1', 'p2'].map((p) => `
    <div class="person-row">
      <span>${esc(db.members[p])}</span>
      <span class="amt">總花費 ${fmtN(share[p])}</span>
    </div>`).join('');

  const monthDetail = ['p1', 'p2'].map((p) => `
    <div class="person-row">
      <span>${esc(db.members[p])}</span>
      <span class="amt">總花費 ${fmtN(mShare[p])}</span>
    </div>`).join('') + `
    <div class="person-row"><span>合計</span><span class="amt">${fmtN(mShare.p1 + mShare.p2)}</span></div>`;

  $('#accountsBody').innerHTML = hero + `
    <div class="card">
      <h2 class="card-title">累計統計</h2>
      ${detail}
    </div>
    <div class="card">
      <h2 class="card-title">月份統計</h2>
      <div class="dp-head" style="margin:2px 0 6px">
        <button type="button" class="icon-btn" id="accPrev" aria-label="上個月">‹</button>
        <div class="month-title month-title-btn" id="accMonthTitle">${monthLabel(accMonth)} <span class="caret">▾</span></div>
        <button type="button" class="icon-btn" id="accNext" aria-label="下個月">›</button>
      </div>
      ${monthDetail}
    </div>
    <p class="hint" style="text-align:center">「總花費」為各自應負擔的分攤金額；按「結清」會自動新增一筆今天的轉帳記錄</p>`;
}

function doSettle(debtor) {
  const creditor = debtor === 'p1' ? 'p2' : 'p1';
  const amt = Math.abs(balances()[debtor]);
  if (amt < 0.01) return;
  db.txs.push({
    id: uid(), type: 'transfer', amount: amt,
    from: debtor, to: creditor,
    date: today(), note: '結清', createdAt: Date.now(),
  });
  save();
  toast(`已結清：${db.members[debtor]} 轉給 ${db.members[creditor]} ${fmt(amt)}`);
  renderCurrentView();
}

/* ==================================================
   Settings
================================================== */
let catPageType = 'expense';
let editingCatId = null;

function renderSettings() {
  $('#setMembersVal').textContent = `${db.members.p1}、${db.members.p2}`;
}

function renderCatTiles() {
  $$('#segCatType .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.type === catPageType));
  $('#catTiles').innerHTML = cats(catPageType).map((c) => `
    <button type="button" class="cat-tile" data-cat="${c.id}">
      <span class="em">${c.icon}</span><span class="nm">${esc(c.name)}</span>
    </button>`).join('') + `
    <button type="button" class="cat-tile add-tile" data-cat="__new">
      <span class="em">＋</span><span class="nm">新增</span>
    </button>`;
}

function openCatEdit(id) {
  editingCatId = id;
  const isNew = id === '__new';
  $('#catEditTitle').textContent = isNew ? '新增類別' : '編輯類別';
  $('#btnCatDelete').hidden = isNew;
  if (isNew) {
    $('#inpCatEmoji').value = '';
    $('#inpCatName').value = '';
  } else {
    const c = cats(catPageType).find((x) => x.id === id);
    if (!c) return;
    $('#inpCatEmoji').value = c.icon;
    $('#inpCatName').value = c.name;
  }
  $('#dlgCatEdit').showModal();
}

function saveCatEdit() {
  const name = $('#inpCatName').value.trim();
  const icon = $('#inpCatEmoji').value.trim() || '📌';
  if (!name) { toast('請輸入類別名稱'); return; }
  if (editingCatId === '__new') {
    db.categories[catPageType].push({ id: uid(), name, icon });
  } else {
    const c = cats(catPageType).find((x) => x.id === editingCatId);
    if (c) { c.name = name; c.icon = icon; }
  }
  save();
  $('#dlgCatEdit').close();
  renderCatTiles();
  toast('已儲存類別');
}

function deleteCat() {
  const id = editingCatId;
  if (!id || id === '__new') return;
  const used = db.txs.filter((t) => t.type === catPageType && t.category === id).length;
  const c = cats(catPageType).find((x) => x.id === id);
  const msg = used > 0
    ? `有 ${used} 筆記錄使用「${c?.name}」，刪除後這些記錄會顯示為「其他」。確定刪除？`
    : `確定刪除「${c?.name}」？`;
  if (!window.confirm(msg)) return;
  db.categories[catPageType] = cats(catPageType).filter((x) => x.id !== id);
  save();
  $('#dlgCatEdit').close();
  renderCatTiles();
  toast('已刪除類別');
}

/* ==================================================
   分頁 / 全域
================================================== */
let curView = 'books';
function switchView(name) {
  curView = name;
  $$('.view').forEach((v) => { v.hidden = v.id !== 'view-' + name; });
  $$('.tabbar .tab[data-view]').forEach((t) => t.classList.toggle('active', t.dataset.view === name));
  renderCurrentView();
}
function renderCurrentView() {
  if (curView === 'books') renderBooks();
  else if (curView === 'accounts') renderAccounts();
  else if (curView === 'reports') renderReports();
  else if (curView === 'settings') renderSettings();
}

/* ----- 匯出 / 匯入 ----- */
function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `zhizhang-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('已匯出備份');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || !Array.isArray(d.txs) || !d.members) throw new Error('bad');
      const map = new Map(db.txs.map((t) => [t.id, t]));
      d.txs.forEach((t) => {
        const cur = map.get(t.id);
        if (!cur || (t.createdAt || 0) >= (cur.createdAt || 0)) map.set(t.id, t);
      });
      db.txs = [...map.values()];
      db.members = d.members;
      if (d.categories && Array.isArray(d.categories.expense)) db.categories = d.categories;
      migrate(db);
      save();
      renderCurrentView();
      toast(`匯入完成，共 ${db.txs.length} 筆`);
    } catch (e) { toast('檔案格式不正確'); }
  };
  reader.readAsText(file);
}

/* ----- 記錄操作（編輯/刪除） ----- */
function openTxAction(id) {
  const tx = db.txs.find((t) => t.id === id);
  if (!tx) return;
  const dlg = $('#dlgTxAction');
  dlg.dataset.id = id;
  const c = catOf(tx);
  $('#txActionTitle').textContent = `${c.icon} ${c.name} ${fmt(tx.amount)}`;
  $('#btnTxEdit').hidden = !!tx.legacy;
  dlg.showModal();
}

/* ==================================================
   事件綁定
================================================== */
function bind() {
  $$('.tabbar .tab[data-view]').forEach((t) => t.addEventListener('click', () => switchView(t.dataset.view)));
  $('#btnAdd').addEventListener('click', () => openAdd());

  /* ---- 記一筆 ---- */
  $('#btnAddClose').addEventListener('click', closeAdd);
  $('#segAddType').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    form.type = b.dataset.type;
    if (form.type !== 'transfer' && !cats(form.type).some((c) => c.id === form.category)) {
      form.category = (cats(form.type)[0] || {}).id;
    }
    renderAddPage();
  });
  $('#addRows').addEventListener('click', (e) => {
    const row = e.target.closest('.form-row'); if (!row) return;
    const kind = row.dataset.row;
    closeKeypad();
    if (kind === 'split') { openSplit(); return; }
    openPicker(kind);
  });

  // 金額：手動輸入 + 計算鍵盤
  $('#btnKeypadToggle').addEventListener('click', () => { keypadOpen ? closeKeypad() : openKeypad(); });
  $('#amountInput').addEventListener('focus', () => { if (keypadOpen) closeKeypad(); });
  $('#amountInput').addEventListener('input', (e) => {
    const v = e.target.value
      .replace(/[xX*]/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
      .replace(/[^0-9.+−×÷]/g, '');
    if (e.target.value !== v) e.target.value = v;
    form.expr = v;
    const hasOp = /[+−×÷]/.test(v);
    const val = formAmount();
    $('#amountEval').textContent = hasOp && val ? '= ' + fmtN(val) : '';
  });

  // 日期：點了開自製日期選擇器
  $('#addDateBtn').addEventListener('click', () => { closeKeypad(); openDatePicker(); });
  $('#dpPrev').addEventListener('click', () => {
    if (dpView === 'day') dpMonth = shiftMonth(dpMonth, -1);
    else if (dpView === 'month') dpMonth = (Number(dpMonth.slice(0, 4)) - 1) + dpMonth.slice(4);
    else dpYearBase -= 12;
    renderDp();
  });
  $('#dpNext').addEventListener('click', () => {
    if (dpView === 'day') dpMonth = shiftMonth(dpMonth, 1);
    else if (dpView === 'month') dpMonth = (Number(dpMonth.slice(0, 4)) + 1) + dpMonth.slice(4);
    else dpYearBase += 12;
    renderDp();
  });
  // 點標題往上一層：日 → 月 → 年
  $('#dpTitle').addEventListener('click', () => {
    if (dpView === 'day') dpView = 'month';
    else if (dpView === 'month') { dpYearBase = Number(dpMonth.slice(0, 4)) - 5; dpView = 'year'; }
    renderDp();
  });
  $('#dpGrid').addEventListener('click', (e) => {
    const d = e.target.closest('.cal-day[data-date]');
    if (d) dpApply(d.dataset.date);
  });
  $('#dpMonths').addEventListener('click', (e) => {
    const b = e.target.closest('.dp-cell[data-ym]'); if (!b) return;
    if (dpMode === 'month') { dpApply(b.dataset.ym); return; }
    dpMonth = b.dataset.ym;
    dpView = 'day';
    renderDp();
  });
  $('#dpYears').addEventListener('click', (e) => {
    const b = e.target.closest('.dp-cell[data-year]'); if (!b) return;
    dpMonth = b.dataset.year + dpMonth.slice(4);
    dpView = 'month';
    renderDp();
  });
  $('#dpToday').addEventListener('click', () => dpApply(dpMode === 'date' ? today() : thisMonth()));
  $('#dpYesterday').addEventListener('click', () => dpApply(shiftDate(today(), -1)));
  $('#dpCancel').addEventListener('click', () => $('#dlgDate').close());
  $('#dlgDate').addEventListener('click', (e) => { if (e.target === $('#dlgDate')) $('#dlgDate').close(); });
  $('#dlgPicker').addEventListener('click', (e) => {
    const dlg = $('#dlgPicker');
    const chip = e.target.closest('.chip');
    if (!chip) { if (e.target === dlg) dlg.close(); return; }
    const kind = dlg.dataset.kind, val = chip.dataset.val;
    if (kind === 'category') form.category = val;
    else if (kind === 'member') form.payer = val;
    else if (kind === 'from') { form.from = val; if (form.to === val) form.to = val === 'p1' ? 'p2' : 'p1'; }
    else if (kind === 'to') { form.to = val; if (form.from === val) form.from = val === 'p1' ? 'p2' : 'p1'; }
    else if (kind === 'feePayer') form.feePayer = val;
    dlg.close();
    renderAddRows();
  });

  // 手續費開關
  $('#feeToggle').addEventListener('change', (e) => {
    form.feeOn = e.target.checked;
    $('#feeFields').hidden = !form.feeOn;
  });
  $('#feeCard').addEventListener('click', (e) => {
    const row = e.target.closest('.form-row[data-row="feePayer"]');
    if (row) openPicker('feePayer');
  });

  // 鍵盤
  $('#keypad').addEventListener('click', (e) => {
    const kp = e.target.closest('.kp'); if (!kp) return;
    if (kp.id === 'kpDone') { closeKeypad(); return; }
    keypadPress(kp.dataset.k);
  });

  // 分攤彈窗
  $('#splitWho').addEventListener('click', (e) => {
    const pill = e.target.closest('.check-pill'); if (!pill) return;
    e.preventDefault();
    form.participants[pill.dataset.part] = !form.participants[pill.dataset.part];
    renderSplitWho();
    renderSplitDetail();
  });
  $('#segSplitMode').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    form.splitMode = b.dataset.mode;
    renderSplitDetail();
  });
  $('#splitDetail').addEventListener('input', (e) => {
    const inp = e.target.closest('.custom-split'); if (!inp) return;
    form.custom[inp.dataset.person] = inp.value;
    updateRemainHint();
  });
  $('#btnSplitDone').addEventListener('click', () => {
    $('#dlgSplit').close();
    renderAddRows();
  });

  $('#btnSaveClose').addEventListener('click', () => saveTx(false));
  $('#btnSaveContinue').addEventListener('click', () => saveTx(true));

  /* ---- Books ---- */
  $('#segBooksMode').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    booksMode = b.dataset.mode;
    renderBooks();
  });
  $('#booksPrev').addEventListener('click', () => {
    booksMonth = shiftMonth(booksMonth, -1);
    selectedDay = booksMonth === thisMonth() ? today() : booksMonth + '-01';
    renderBooks();
  });
  $('#booksNext').addEventListener('click', () => {
    booksMonth = shiftMonth(booksMonth, 1);
    selectedDay = booksMonth === thisMonth() ? today() : booksMonth + '-01';
    renderBooks();
  });
  $('#calGrid').addEventListener('click', (e) => {
    const d = e.target.closest('.cal-day[data-date]'); if (!d) return;
    selectedDay = d.dataset.date;
    renderCalendar();
  });
  // 點月份標題 → 開年月選擇器
  $('#booksMonthTitle').addEventListener('click', () => {
    openDp({
      mode: 'month',
      value: booksMonth,
      onPick: (ym) => {
        booksMonth = ym;
        selectedDay = ym === thisMonth() ? today() : ym + '-01';
        renderBooks();
      },
    });
  });
  $('#segListFilter').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    listFilter = b.dataset.filter;
    renderTxList();
  });

  ['#txList', '#dayDetail', '#searchResults'].forEach((sel) => {
    $(sel).addEventListener('click', (e) => {
      const item = e.target.closest('.tx-item');
      if (item) openTxAction(item.dataset.id);
    });
  });

  $('#btnTxCancel').addEventListener('click', () => $('#dlgTxAction').close());
  $('#btnTxDelete').addEventListener('click', () => {
    const id = $('#dlgTxAction').dataset.id;
    db.txs = db.txs.filter((t) => t.id !== id);
    save();
    $('#dlgTxAction').close();
    toast('已刪除');
    renderCurrentView();
    if (!$('#searchPage').hidden) runSearch();
  });
  $('#btnTxEdit').addEventListener('click', () => {
    const tx = db.txs.find((t) => t.id === $('#dlgTxAction').dataset.id);
    $('#dlgTxAction').close();
    if (!tx || tx.legacy) return;
    $('#searchPage').hidden = true;
    openAdd(tx);
  });

  // 搜尋
  $('#btnSearch').addEventListener('click', () => {
    $('#searchPage').hidden = false;
    $('#searchInput').value = '';
    runSearch();
    $('#searchInput').focus();
  });
  $('#btnSearchClose').addEventListener('click', () => { $('#searchPage').hidden = true; });
  $('#searchInput').addEventListener('input', runSearch);

  /* ---- Accounts ---- */
  $('#accountsBody').addEventListener('click', (e) => {
    const b = e.target.closest('#btnSettle');
    if (b) { doSettle(b.dataset.debtor); return; }
    if (e.target.closest('#accPrev')) { accMonth = shiftMonth(accMonth, -1); renderAccounts(); return; }
    if (e.target.closest('#accNext')) { accMonth = shiftMonth(accMonth, 1); renderAccounts(); return; }
    if (e.target.closest('#accMonthTitle')) {
      openDp({ mode: 'month', value: accMonth, onPick: (ym) => { accMonth = ym; renderAccounts(); } });
    }
  });

  /* ---- Reports ---- */
  $('#segRepPeriod').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    const p = b.dataset.period;
    if (p === 'range') {
      $('#inpRangeStart').value = repRange ? repRange.start : shiftDate(today(), -29);
      $('#inpRangeEnd').value = repRange ? repRange.end : today();
      $('#dlgRange').showModal();
      return;
    }
    repPeriod = p;
    renderReports();
  });
  $('#repPrev').addEventListener('click', () => {
    if (repPeriod === 'month') repMonth = shiftMonth(repMonth, -1);
    else if (repPeriod === 'year') repYear = String(Number(repYear) - 1);
    renderReports();
  });
  $('#repNext').addEventListener('click', () => {
    if (repPeriod === 'month') repMonth = shiftMonth(repMonth, 1);
    else if (repPeriod === 'year') repYear = String(Number(repYear) + 1);
    renderReports();
  });
  $('#repIOWrap').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    repKind = b.dataset.kind;
    renderReports();
  });

  // 日期範圍
  $('#dlgRange').addEventListener('click', (e) => {
    const q = e.target.closest('[data-quick]');
    if (!q) return;
    const v = q.dataset.quick;
    if (v === 'all') repRange = null;
    else repRange = { start: shiftDate(today(), -(Number(v) - 1)), end: today(), label: `最近 ${v} 天` };
    repPeriod = 'range';
    $('#dlgRange').close();
    renderReports();
  });
  $('#btnRangeCancel').addEventListener('click', () => $('#dlgRange').close());
  $('#btnRangeApply').addEventListener('click', () => {
    const s = $('#inpRangeStart').value, e2 = $('#inpRangeEnd').value;
    if (!s || !e2 || s > e2) { toast('請選擇正確的日期範圍'); return; }
    repRange = { start: s, end: e2, label: `${s} ~ ${e2}` };
    repPeriod = 'range';
    $('#dlgRange').close();
    renderReports();
  });

  /* ---- Settings ---- */
  $('#view-settings').addEventListener('click', (e) => {
    const row = e.target.closest('.form-row[data-set]'); if (!row) return;
    const kind = row.dataset.set;
    if (kind === 'members') {
      $('#inpName1').value = db.members.p1;
      $('#inpName2').value = db.members.p2;
      $('#dlgMembers').showModal();
    } else if (kind === 'categories') {
      catPageType = 'expense';
      renderCatTiles();
      $('#catPage').hidden = false;
    } else if (kind === 'export') exportData();
    else if (kind === 'import') $('#fileImport').click();
  });
  $('#btnMembersCancel').addEventListener('click', () => $('#dlgMembers').close());
  $('#btnMembersSave').addEventListener('click', () => {
    db.members.p1 = $('#inpName1').value.trim() || '我';
    db.members.p2 = $('#inpName2').value.trim() || '另一半';
    save();
    $('#dlgMembers').close();
    toast('已儲存名稱');
    renderCurrentView();
  });
  $('#fileImport').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  // 類別管理
  $('#btnCatClose').addEventListener('click', () => { $('#catPage').hidden = true; });
  $('#segCatType').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    catPageType = b.dataset.type;
    renderCatTiles();
  });
  $('#catTiles').addEventListener('click', (e) => {
    const tile = e.target.closest('.cat-tile'); if (!tile) return;
    openCatEdit(tile.dataset.cat);
  });
  $('#btnCatCancel').addEventListener('click', () => $('#dlgCatEdit').close());
  $('#btnCatSave').addEventListener('click', saveCatEdit);
  $('#btnCatDelete').addEventListener('click', deleteCat);
}

/* ---------- 啟動 ---------- */
bind();
switchView('books');

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
