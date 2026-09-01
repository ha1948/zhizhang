/* ================= 智賬 ================= */
'use strict';

const APP_VER = 'v28';
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
const PALETTE = ['#3E8E7E', '#D96C5F', '#E0A458', '#6B7FB3', '#9C6BB3', '#5FA8D9', '#D95F8A', '#7FB36B', '#B3A16B', '#8A8F8C'];

/* ================= i18n ================= */
const STR = {
  zh: {
    calendar: '日曆', list: '列表', io: '收支', transfer: '轉帳', all: '全部',
    expense: '支出', income: '收入', balance: '結餘',
    emptyMonth: '這個月還沒有記錄', emptyMonthTransfer: '這個月還沒有轉帳記錄',
    dayEmpty: '這天沒有記錄',
    searchPh: '搜尋類別、備註、成員⋯', searchHint: '輸入關鍵字搜尋全部歷史記錄',
    searchFound: '找到 {n} 筆', searchNone: '沒有符合「{q}」的記錄',
    accountsTitle: '成員結算', allTime: '累計統計', monthStats: '月份統計',
    totalSpent: '總花費', subtotal: '合計',
    needPay: '{a} 需要給 {b}', allClear: '✓ 目前互不相欠', keepGoing: '繼續好好記帳吧',
    settle: '結清', settleDone: '已結清：{a} 轉給 {b} {amt}',
    accountsHint: '按「結清」會自動新增一筆今天的轉帳記錄',
    repMonth: '月', repYear: '年', repRange: '範圍',
    total: '總計', dailyAvg: '日均', repEmpty: '此期間沒有{k}記錄',
    transferOut: '{name} 轉出',
    settingsTitle: '設定', whoPaid: '誰付的', catManage: '類別管理',
    exportData: '匯出資料', importData: '匯入資料', cloudSync: '雲端同步',
    csvExport: '匯出 CSV', csvExported: '已匯出 CSV',
    checkUpdate: '檢查更新', updating: '更新中，即將重新載入⋯',
    trend: '每月趨勢', searchCapped: '僅顯示前 100 筆，請輸入更精確的關鍵字',
    amount: '金額', category: '類別', whoReceived: '誰收到', whoSplit: '誰要分攤',
    fromWho: '誰轉出', toWho: '轉給誰', fee: '手續費', notePh: '備註⋯',
    save: '儲存', saveContinue: '儲存並繼續', done: '完成', cancel: '取消', delete: '刪除', add: '新增',
    evenSplit: '平均分攤', customSplit: '自訂金額', splitMode: '分攤方式',
    bothEven: '兩人平分', fullBear: '{name} 全額負擔', notSelected: '未選擇',
    perPerson: '{names} 每人約 {amt}', enterAmtFirst: '輸入金額後自動平均分攤',
    pickOne: '請至少勾選一位分攤成員', enterTotalFirst: '請先輸入總金額',
    remainLeft: '還剩 {amt} 未分配', remainOver: '超出總金額 {amt}', remainOk: '✓ 分攤金額剛好等於總金額',
    payerPaid: '{name} 付款', received: '{name} 收到', sentTo: '{a} 轉給 {b}',
    lastUpdated: '最後更新', createdAtL: '建立於',
    yesterday: '昨天', today: '今天', thisMonthBtn: '本月',
    confirmDelTitle: '確定要刪除嗎？', deleted: '已刪除',
    recorded: '已記錄 {amt}', updated: '已更新', enterAmount: '請輸入金額',
    samePerson: '轉出與轉入不能是同一人', splitNotEqual: '自訂分攤金額需等於總金額',
    selCategory: '選擇類別', whoPaidQ: '誰付的錢', whoReceivedQ: '誰收到的錢', feeWho: '手續費誰付的',
    membersTitle: '成員名稱', member1: '成員一', member2: '成員二',
    defaultPayer: '預設付款人', namesSaved: '已儲存名稱', thisYearBtn: '今年',
    catEditNew: '新增類別', catEdit: '編輯類別', catName: '名稱', catNamePh: '類別名稱',
    catSaved: '已儲存類別', catDeleted: '已刪除類別', catNameReq: '請輸入類別名稱',
    catDelUsed: '有 {n} 筆記錄使用「{name}」，刪除後這些記錄會顯示為「其他」。確定刪除？',
    catDelConfirm: '確定刪除「{name}」？',
    catHint: '點類別可編輯名稱與 emoji；點右上「編輯」可刪除與拖曳排序',
    catHintEdit: '點「−」刪除類別；按住類別拖曳可調整順序',
    edit: '編輯',
    rangeTitle: '日期範圍', last7: '最近 7 天', last30: '最近 30 天', last90: '最近 90 天',
    allTimeRange: '全部期間', start: '開始', end: '結束', apply: '套用', rangeBad: '請選擇正確的日期範圍',
    syncTitle: '雲端即時同步', syncOn: '已連線 ✓', syncOffline: '未連線', syncNA: '未啟用',
    syncNAHint: '雲端同步尚未啟用（需要設定 Firebase 金鑰）。啟用後兩支手機可即時看到彼此的記錄。',
    syncOnHint: '已連線共享帳本，兩邊記錄即時同步。',
    syncCodeHint: '另一半在他手機的「雲端同步 → 加入帳本」輸入這組配對碼即可。',
    syncSetupHint: '建立一本共享帳本，或輸入另一半給你的配對碼加入。加入時兩邊既有記錄會自動合併。',
    createBook: '建立共享帳本', joinLabel: '加入帳本 — 輸入配對碼', join: '加入', disconnect: '中斷同步',
    gotIt: '知道了', creating: '建立中⋯', connecting: '連線中⋯',
    bookCreated: '共享帳本已建立', bookJoined: '已加入共享帳本', syncStopped: '已中斷同步（本機資料保留）',
    createFail: '建立失敗：{e}', joinFail: '加入失敗：{e}', enterCode: '請輸入配對碼',
    exported: '已匯出備份', imported: '匯入完成，共 {n} 筆', badFile: '檔案格式不正確',
    noEditLegacy: '此筆為舊格式，僅能左滑刪除',
    langSaved: '已切換為中文',
    signIn: '登入', signUp: '首次使用？註冊帳號', signOut: '登出',
    email: 'Email', password: '密碼',
    signedInAs: '已登入：{email}',
    loginHint: '啟用同步需先登入。只有被授權的帳號能使用這個資料庫，其他人即使打開這個網頁也無法讀寫。',
    loginDone: '登入成功', loginFail: '登入失敗：{e}', signupDone: '帳號已建立並登入',
    enterEmailPw: '請輸入 Email 與密碼', pwTooShort: '密碼至少 6 碼',
    signedOut: '已登出',
    waitingApprove: '已向帳本 {code} 送出加入申請，等待該帳本建立者同意⋯',
    reqTitle: '加入申請', approve: '同意', rejectBtn: '拒絕', blockBtn: '封鎖',
    approvedToast: '已同意 {email} 加入', rejectedToast: '已拒絕申請',
    blockedToast: '已封鎖 {email}', cancelReq: '取消申請', reqCancelled: '已取消申請',
    roomNotFound: '配對碼不存在，請確認後再試',
    createNotAllowed: '此站僅限站主建立帳本，請輸入配對碼加入；想自架請 fork 程式碼並換上自己的 Firebase 金鑰',
    syncPendingVerify: '待驗證', syncPendingApprove: '待同意',
    reqIncoming: '{email} 申請加入你的資料庫：',
  },
  en: {
    calendar: 'Calendar', list: 'List', io: 'In/Out', transfer: 'Transfer', all: 'All',
    expense: 'Expense', income: 'Income', balance: 'Balance',
    emptyMonth: 'No records this month', emptyMonthTransfer: 'No transfers this month',
    dayEmpty: 'No records on this day',
    searchPh: 'Search category, note, member…', searchHint: 'Type keywords to search all history',
    searchFound: '{n} results', searchNone: 'No records match "{q}"',
    accountsTitle: 'Settlement', allTime: 'All-time', monthStats: 'Monthly stats',
    totalSpent: 'Total spent', subtotal: 'Total',
    needPay: '{a} owes {b}', allClear: '✓ All settled', keepGoing: 'Keep up the good bookkeeping',
    settle: 'Settle up', settleDone: 'Settled: {a} → {b} {amt}',
    accountsHint: '"Settle up" adds a transfer record dated today.',
    repMonth: 'Month', repYear: 'Year', repRange: 'Range',
    total: 'Total', dailyAvg: 'Daily avg', repEmpty: 'No {k} records in this period',
    transferOut: '{name} sent',
    settingsTitle: 'Settings', whoPaid: 'Members', catManage: 'Categories',
    exportData: 'Export data', importData: 'Import data', cloudSync: 'Cloud sync',
    csvExport: 'Export CSV', csvExported: 'CSV exported',
    checkUpdate: 'Check for updates', updating: 'Updating — reloading…',
    trend: 'Monthly trend', searchCapped: 'Showing first 100 — refine your search',
    amount: 'Amount', category: 'Category', whoReceived: 'Received by', whoSplit: 'Split between',
    fromWho: 'From', toWho: 'To', fee: 'Fee', notePh: 'Memo…',
    save: 'Save', saveContinue: 'Save & Continue', done: 'Done', cancel: 'Cancel', delete: 'Delete', add: 'Add',
    evenSplit: 'Split evenly', customSplit: 'Custom', splitMode: 'Split method',
    bothEven: 'Split evenly', fullBear: '{name} pays all', notSelected: 'None',
    perPerson: '{names} ≈ {amt} each', enterAmtFirst: 'Enter amount to split evenly',
    pickOne: 'Select at least one person', enterTotalFirst: 'Enter the total first',
    remainLeft: '{amt} left to assign', remainOver: '{amt} over the total', remainOk: '✓ Split equals the total',
    payerPaid: '{name} paid', received: '{name} received', sentTo: '{a} → {b}',
    lastUpdated: 'Last updated', createdAtL: 'Created',
    yesterday: 'Yesterday', today: 'Today', thisMonthBtn: 'This month',
    confirmDelTitle: 'Delete this record?', deleted: 'Deleted',
    recorded: 'Saved {amt}', updated: 'Updated', enterAmount: 'Enter an amount',
    samePerson: 'Sender and receiver must differ', splitNotEqual: 'Custom split must equal the total',
    selCategory: 'Choose category', whoPaidQ: 'Who paid', whoReceivedQ: 'Who received', feeWho: 'Who paid the fee',
    membersTitle: 'Member names', member1: 'Member 1', member2: 'Member 2',
    defaultPayer: 'Default payer', namesSaved: 'Names saved', thisYearBtn: 'This year',
    catEditNew: 'New category', catEdit: 'Edit category', catName: 'Name', catNamePh: 'Category name',
    catSaved: 'Category saved', catDeleted: 'Category deleted', catNameReq: 'Enter a category name',
    catDelUsed: '{n} records use "{name}". They will show as "Other". Delete?',
    catDelConfirm: 'Delete "{name}"?',
    catHint: 'Tap a category to edit its name & emoji. Use "Edit" (top right) to delete or reorder',
    catHintEdit: 'Tap "−" to delete; press and drag a tile to reorder',
    edit: 'Edit',
    rangeTitle: 'Date range', last7: 'Last 7 days', last30: 'Last 30 days', last90: 'Last 90 days',
    allTimeRange: 'All time', start: 'Start', end: 'End', apply: 'Apply', rangeBad: 'Pick a valid range',
    syncTitle: 'Real-time cloud sync', syncOn: 'Connected ✓', syncOffline: 'Not connected', syncNA: 'Not set up',
    syncNAHint: 'Cloud sync is not set up yet (Firebase key required).',
    syncOnHint: 'Connected to a shared book — records sync in real time.',
    syncCodeHint: 'Your partner enters this pairing code under "Cloud sync → Join".',
    syncSetupHint: 'Create a shared book, or join with the pairing code from your partner. Existing records merge automatically.',
    createBook: 'Create shared book', joinLabel: 'Join — enter pairing code', join: 'Join', disconnect: 'Disconnect',
    gotIt: 'Got it', creating: 'Creating…', connecting: 'Connecting…',
    bookCreated: 'Shared book created', bookJoined: 'Joined shared book', syncStopped: 'Sync stopped (local data kept)',
    createFail: 'Create failed: {e}', joinFail: 'Join failed: {e}', enterCode: 'Enter the pairing code',
    exported: 'Backup exported', imported: 'Imported — {n} records total', badFile: 'Invalid file format',
    noEditLegacy: 'Legacy record — swipe left to delete',
    langSaved: 'Switched to English',
    signIn: 'Sign in', signUp: 'First time? Create account', signOut: 'Sign out',
    email: 'Email', password: 'Password',
    signedInAs: 'Signed in: {email}',
    loginHint: 'Sign in to enable sync. Only authorized accounts can use this database — strangers cannot read or write even with this page open.',
    loginDone: 'Signed in', loginFail: 'Sign-in failed: {e}', signupDone: 'Account created & signed in',
    enterEmailPw: 'Enter email and password', pwTooShort: 'Password must be 6+ characters',
    signedOut: 'Signed out',
    waitingApprove: 'Join request sent to book {code} — waiting for its owner to approve…',
    reqTitle: 'Join requests', approve: 'Approve', rejectBtn: 'Reject', blockBtn: 'Block',
    approvedToast: 'Approved {email}', rejectedToast: 'Request rejected',
    blockedToast: 'Blocked {email}', cancelReq: 'Cancel request', reqCancelled: 'Request cancelled',
    roomNotFound: 'Pairing code not found — please check and retry',
    createNotAllowed: 'Only the site owner can create books here. Join with a pairing code, or fork the code with your own Firebase key.',
    syncPendingVerify: 'Verify email', syncPendingApprove: 'Awaiting approval',
    reqIncoming: '{email} requests access to your database:',
  },
};
const WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function L(key, vars) {
  const lang = db && db.lang === 'en' ? 'en' : 'zh';
  let s = (STR[lang][key] ?? STR.zh[key] ?? key);
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll('{' + k + '}', v); });
  return s;
}

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
  if (d.lang !== 'en') d.lang = 'zh';
  if (d.defaultPayer !== 'p2') d.defaultPayer = 'p1';
  migrate(d);
  return d;
}
function migrate(d) {
  d.txs.forEach((t) => {
    if (t.type === 'repay') {
      t.type = 'transfer';
      t.from = t.payer;
      t.to = t.payer === 'p1' ? 'p2' : 'p1';
      delete t.payer;
    }
    if (t.type === 'transfer' && !t.from && t.fromAccount) t.legacy = true;
  });
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

let db = load();
window.db = db; // 供 sync.js 模組存取（db 不會被重新賦值）
const cats = (type) => db.categories[type] || [];

/* 雲端同步掛鉤（sync.js 未載入或未連線時皆為 no-op） */
const syncUpsert = (tx) => { try { window.Sync?.upsertTx(tx); } catch (e) { /* 離線忽略 */ } };
const syncDelete = (id) => { try { window.Sync?.deleteTx(id); } catch (e) { /* 離線忽略 */ } };
const syncConfig = () => { try { window.Sync?.saveConfig(); } catch (e) { /* 離線忽略 */ } };

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
const monthLabel = (ym) => db.lang === 'en'
  ? `${MON_EN[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`
  : `${ym.slice(0, 4)} 年 ${Number(ym.slice(5))} 月`;
const yearLabel = (y) => db.lang === 'en' ? String(y) : `${y} 年`;
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
const wd = (dateStr) => {
  const i = new Date(dateStr + 'T00:00:00').getDay();
  return db.lang === 'en' ? WEEK_EN[i] : '週' + WEEK_ZH[i];
};
const fmtDT = (ms) => {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const TRANSFER_CAT = () => ({ name: L('transfer'), icon: '🤝' });
const catOf = (tx) => {
  if (tx.type === 'transfer') return TRANSFER_CAT();
  return cats(tx.type).find((c) => c.id === tx.category) || { name: db.lang === 'en' ? 'Other' : '其他', icon: '📌' };
};

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
}

function lockScroll() {
  const anyOpen = ['#addPage', '#searchPage', '#catPage', '#repDetailPage'].some((s) => !$(s).hidden);
  document.documentElement.classList.toggle('locked', anyOpen);
}

function txSort(a, b) { return b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0); }

function txSubtitle(tx) {
  if (tx.type === 'income') return L('received', { name: esc(db.members[tx.payer] || '') });
  if (tx.type === 'transfer') {
    if (tx.legacy) return `${esc(tx.fromAccount || '')} → ${esc(tx.toAccount || '')}`;
    return L('sentTo', { a: esc(db.members[tx.from] || ''), b: esc(db.members[tx.to] || '') });
  }
  const payerTxt = L('payerPaid', { name: esc(db.members[tx.payer] || '') });
  const parts = ['p1', 'p2'].filter((p) => tx.split && tx.split[p] > 0);
  if (parts.length === 0) return payerTxt;
  const splitTxt = parts.length === 2
    ? (Math.abs(tx.split.p1 - tx.split.p2) < 0.011 ? L('bothEven') : `${esc(db.members.p1)} ${fmtN(tx.split.p1)}／${esc(db.members.p2)} ${fmtN(tx.split.p2)}`)
    : L('fullBear', { name: esc(db.members[parts[0]]) });
  return `${payerTxt} · ${splitTxt}`;
}

function txItemHTML(tx, { showDate = false } = {}) {
  const c = catOf(tx);
  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : '';
  const datePrefix = showDate ? `${Number(tx.date.slice(5, 7))}/${Number(tx.date.slice(8))} · ` : '';
  return `
    <div class="tx-swipe">
      <button type="button" class="tx-del" data-delid="${tx.id}">${L('delete')}</button>
      <div class="tx-item" data-id="${tx.id}">
        <div class="tx-icon ${tx.type}">${c.icon}</div>
        <div class="tx-main">
          <div class="tx-title">${esc(c.name)}${tx.note ? ' · ' + esc(tx.note) : ''}</div>
          <div class="tx-sub">${datePrefix}${txSubtitle(tx)}</div>
        </div>
        <div class="tx-amount ${tx.type}">${sign}${fmtN(tx.amount)}</div>
      </div>
    </div>`;
}

/* ==================================================
   左滑刪除（全域觸控手勢）
================================================== */
let swEl = null, swStartX = 0, swStartY = 0, swBase = 0, swAxis = null, swMoved = false, swOpen = null;
let swSuppressUntil = 0; // 滑動剛結束的短暫時間內吞掉誤觸點擊
function closeSwipe() {
  if (swOpen) { swOpen.style.transform = ''; swOpen = null; }
}
function swStart(target, x, y) {
  if (target.closest('.tx-del')) return; // 按刪除鈕時不要收合，讓點擊完整發生
  const item = target.closest('.tx-item');
  if (swOpen && swOpen !== item) closeSwipe();
  if (!item) return;
  swEl = item;
  swStartX = x;
  swStartY = y;
  swBase = (item === swOpen) ? -76 : 0;
  swAxis = null;
  swMoved = false;
  item.style.transition = 'none';
}
function swMove(x, y) {
  if (!swEl) return false;
  const dx = x - swStartX;
  const dy = y - swStartY;
  if (!swAxis) {
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) swAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    else return false;
  }
  if (swAxis !== 'x') return false;
  swMoved = true;
  const px = Math.min(0, Math.max(-76, swBase + dx));
  swEl.style.transform = `translateX(${px}px)`;
  return true;
}
function swEnd() {
  if (!swEl) return;
  const el = swEl;
  swEl = null;
  el.style.transition = '';
  const m = /translateX\((-?\d+\.?\d*)px\)/.exec(el.style.transform);
  const x = m ? parseFloat(m[1]) : 0;
  if (x < -38) { el.style.transform = 'translateX(-76px)'; swOpen = el; }
  else { el.style.transform = ''; if (swOpen === el) swOpen = null; }
  if (swMoved) swSuppressUntil = Date.now() + 400;
  swMoved = false;
}
document.addEventListener('touchstart', (e) => { if (e.touches && e.touches.length) swStart(e.target, e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
document.addEventListener('touchmove', (e) => { if (e.touches && e.touches.length) swMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
document.addEventListener('touchend', swEnd);
// 滑鼠拖曳（桌面版也能左滑刪除）
document.addEventListener('mousedown', (e) => { if (e.button === 0) swStart(e.target, e.clientX, e.clientY); });
document.addEventListener('mousemove', (e) => { if (swEl && swMove(e.clientX, e.clientY)) e.preventDefault(); });
document.addEventListener('mouseup', swEnd);

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
  if (expectNum) ops.pop();
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
  const tg = $('#btnKeypadToggle');
  if (tg) tg.classList.toggle('on', keypadOpen);
}

function splitSummary() {
  const parts = ['p1', 'p2'].filter((p) => form.participants[p]);
  if (parts.length === 0) return L('notSelected');
  if (parts.length === 1) return L('fullBear', { name: db.members[parts[0]] });
  if (form.splitMode === 'even') return L('bothEven');
  const a = parseFloat(form.custom.p1) || 0, b = parseFloat(form.custom.p2) || 0;
  return `${db.members.p1} ${fmtN(a)}／${db.members.p2} ${fmtN(b)}`;
}

function renderAddRows() {
  const rows = [];
  const chev = `<span class="chev">›</span>`;

  if (form.type === 'transfer') {
    rows.push(`
      <button type="button" class="form-row" data-row="from">
        <span class="ric">📤</span><span class="rlab">${L('fromWho')}</span>
        <span class="rval filled">${esc(db.members[form.from])}</span>${chev}
      </button>
      <button type="button" class="form-row" data-row="to">
        <span class="ric">📥</span><span class="rlab">${L('toWho')}</span>
        <span class="rval filled">${esc(db.members[form.to])}</span>${chev}
      </button>`);
  } else {
    const c = cats(form.type).find((x) => x.id === form.category) || cats(form.type)[0] || { icon: '📌', name: '' };
    rows.push(`
      <button type="button" class="form-row" data-row="category">
        <span class="ric">${c.icon}</span><span class="rlab">${L('category')}</span>
        <span class="rval filled">${esc(c.name)}</span>${chev}
      </button>
      <button type="button" class="form-row" data-row="member">
        <span class="ric">👤</span><span class="rlab">${form.type === 'income' ? L('whoReceived') : L('whoPaid')}</span>
        <span class="rval filled">${esc(db.members[form.payer])}</span>${chev}
      </button>`);
    if (form.type === 'expense') {
      rows.push(`
        <button type="button" class="form-row" data-row="split">
          <span class="ric">🤝</span><span class="rlab">${L('whoSplit')}</span>
          <span class="rval filled">${esc(splitSummary())}</span>${chev}
        </button>`);
    }
  }
  $('#addRows').innerHTML = rows.join('');

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
    box.innerHTML = `<div class="split-even-hint">${L('pickOne')}</div>`;
    return;
  }
  if (form.splitMode === 'even') {
    const per = round2(amount / parts.length);
    box.innerHTML = amount > 0
      ? `<div class="split-even-hint">${L('perPerson', { names: parts.map((p) => esc(db.members[p])).join('、'), amt: `<b>${fmt(per)}</b>` })}</div>`
      : `<div class="split-even-hint">${L('enterAmtFirst')}</div>`;
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
  if (amount <= 0) { el.textContent = L('enterTotalFirst'); el.className = 'split-remain'; return; }
  if (Math.abs(diff) < 0.005) { el.textContent = L('remainOk'); el.className = 'split-remain ok'; }
  else if (diff > 0) { el.textContent = L('remainLeft', { amt: fmt(diff) }); el.className = 'split-remain bad'; }
  else { el.textContent = L('remainOver', { amt: fmt(-diff) }); el.className = 'split-remain bad'; }
}

function openSplit() {
  renderSplitWho();
  renderSplitDetail();
  $('#dlgSplit').showModal();
}

function updateDateBtn() {
  const d = form.date || today();
  const label = db.lang === 'en'
    ? `${wd(d)}, ${d.replace(/-/g, '/')}`
    : `${d.replace(/-/g, '/')} ${wd(d)}`;
  $('#addDateBtn').innerHTML = `${label} <span class="caret">▾</span>`;
}

function renderAddPage() {
  $$('#segAddType .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.type === form.type));
  renderAddRows();
  updateAmountUI();
  updateDateBtn();
}

/* ----- 日期選擇器（日 → 月 → 年；mode: date | month） ----- */
let dpMode = 'date';
let dpView = 'day';
let dpMonth = thisMonth();
let dpYearBase = 2020;
let dpValue = '';
let dpOnPick = null;

function openDp(opts) {
  dpMode = opts.mode; // date | month | year
  dpValue = opts.value || (dpMode === 'date' ? today() : dpMode === 'year' ? today().slice(0, 4) : thisMonth());
  dpOnPick = opts.onPick;
  if (dpMode === 'date') { dpMonth = dpValue.slice(0, 7); dpView = 'day'; }
  else if (dpMode === 'year') { dpMonth = dpValue + '-01'; dpYearBase = Number(dpValue) - 5; dpView = 'year'; }
  else { dpMonth = dpValue; dpView = 'month'; }
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
  $('#dpToday').textContent = dpMode === 'date' ? L('today') : dpMode === 'year' ? L('thisYearBtn') : L('thisMonthBtn');

  if (dpView === 'day') {
    $('#dpTitle').innerHTML = `${monthLabel(dpMonth)} <span class="caret">▾</span>`;
    renderDpDays();
  } else if (dpView === 'month') {
    $('#dpTitle').innerHTML = `${yearLabel(year)} <span class="caret">▾</span>`;
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
    const label = db.lang === 'en' ? MON_EN[i] : `${i + 1} 月`;
    return `<button type="button" class="dp-cell ${ym === curYm ? 'selected' : ''} ${ym === nowYm ? 'now' : ''}" data-ym="${ym}">${label}</button>`;
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
  closeSwipe();
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
    $('#feeAmount').value = '';
    $('#lastUpdated').hidden = false;
    $('#lastUpdated').textContent = `${L('lastUpdated')}：${fmtDT(editTx.updatedAt || editTx.createdAt)}`;
  } else {
    form.type = 'expense';
    form.expr = '';
    form.category = (cats('expense')[0] || {}).id;
    form.payer = db.defaultPayer;
    form.from = db.defaultPayer;
    form.to = db.defaultPayer === 'p1' ? 'p2' : 'p1';
    form.feeOn = false;
    form.feePayer = db.defaultPayer;
    form.participants = { p1: true, p2: true };
    form.splitMode = 'even';
    form.custom = { p1: '', p2: '' };
    form.date = selectedDay || today(); // 帶入日曆目前選中的日期
    $('#addNote').value = '';
    $('#feeAmount').value = '';
    $('#lastUpdated').hidden = true;
  }
  renderAddPage();
  $('#addPage').hidden = false;
  lockScroll();
}

function closeAdd() {
  $('#addPage').hidden = true;
  editId = null;
  lockScroll();
}

let lastSaveAt = 0;
function saveTx(keepOpen) {
  if (Date.now() - lastSaveAt < 600) return; // 防連點重複記帳
  const amount = formAmount();
  if (!amount || amount <= 0) { toast(L('enterAmount')); openKeypad(); return; }
  const date = form.date || today();
  const note = $('#addNote').value.trim();
  const now = Date.now();
  const base = {
    id: editId || uid(),
    type: form.type, amount, date, note,
    createdAt: editId ? (db.txs.find((t) => t.id === editId)?.createdAt || now) : now,
    updatedAt: now,
  };
  let feeTx = null;

  if (form.type === 'transfer') {
    if (form.from === form.to) { toast(L('samePerson')); return; }
    base.from = form.from;
    base.to = form.to;
    if (form.feeOn) {
      const feeAmt = round2(parseFloat($('#feeAmount').value) || 0);
      if (feeAmt > 0) {
        const split = { p1: 0, p2: 0 };
        split[form.feePayer] = feeAmt;
        feeTx = {
          id: uid(), type: 'expense', category: 'fee', amount: feeAmt,
          payer: form.feePayer, split, date, note: db.lang === 'en' ? 'Transfer fee' : '轉帳手續費',
          createdAt: now, updatedAt: now,
        };
      }
    }
  } else {
    base.category = form.category;
    base.payer = form.payer;
    if (form.type === 'expense') {
      const parts = ['p1', 'p2'].filter((p) => form.participants[p]);
      if (parts.length === 0) { toast(L('pickOne')); openSplit(); return; }
      const split = { p1: 0, p2: 0 };
      if (form.splitMode === 'even') {
        const per = round2(amount / parts.length);
        parts.forEach((p) => { split[p] = per; });
        split[parts[0]] = round2(split[parts[0]] + (amount - round2(per * parts.length)));
      } else {
        parts.forEach((p) => { split[p] = round2(parseFloat(form.custom[p]) || 0); });
        if (Math.abs(round2(split.p1 + split.p2) - amount) > 0.005) { toast(L('splitNotEqual')); openSplit(); return; }
      }
      base.split = split;
    }
  }

  lastSaveAt = Date.now();
  if (editId) {
    const i = db.txs.findIndex((t) => t.id === editId);
    if (i >= 0) db.txs[i] = base;
    toast(L('updated'));
  } else {
    db.txs.push(base);
    toast(L('recorded', { amt: fmt(amount) }));
  }
  if (feeTx) db.txs.push(feeTx);
  save();
  syncUpsert(base);
  if (feeTx) syncUpsert(feeTx);
  renderCurrentView();

  if (keepOpen) {
    editId = null;
    form.expr = '';
    form.participants = { p1: true, p2: true };
    form.splitMode = 'even';
    form.custom = { p1: '', p2: '' };
    form.feeOn = false;
    $('#addNote').value = '';
    $('#feeAmount').value = '';
    $('#lastUpdated').hidden = true;
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
    $('#pickerTitle').textContent = L('selCategory');
    body.innerHTML = `<div class="cat-tiles pick-grid">` + cats(form.type).map((c) => `
      <button type="button" class="cat-tile ${c.id === form.category ? 'active' : ''}" data-val="${c.id}">
        <span class="em">${c.icon}</span><span class="nm">${esc(c.name)}</span>
      </button>`).join('') + `</div>`;
  } else if (kind === 'lang') {
    $('#pickerTitle').textContent = 'Language';
    body.innerHTML = `<div class="picker-grid">
      <button class="chip ${db.lang !== 'en' ? 'active' : ''}" data-val="zh">中文</button>
      <button class="chip ${db.lang === 'en' ? 'active' : ''}" data-val="en">English</button>
    </div>`;
  } else {
    const titles = { member: form.type === 'income' ? L('whoReceivedQ') : L('whoPaidQ'), from: L('fromWho'), to: L('toWho'), feePayer: L('feeWho') };
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
  const prevYm = shiftMonth(booksMonth, -1);
  const nextYm = shiftMonth(booksMonth, 1);
  const prevN = daysInMonth(prevYm);
  const tdy = today();
  // 上個月的尾巴（灰字、可點擊直接跳月）
  for (let i = 0; i < firstDow; i++) {
    const d = prevN - firstDow + 1 + i;
    cells.push(`<button type="button" class="cal-day muted" data-date="${prevYm}-${String(d).padStart(2, '0')}"><span class="num">${d}</span></button>`);
  }
  for (let d = 1; d <= nDays; d++) {
    const ds = `${booksMonth}-${String(d).padStart(2, '0')}`;
    const dayTxs = byDay[ds] || [];
    const hasExp = dayTxs.some((t) => t.type === 'expense' || t.type === 'transfer');
    const hasInc = dayTxs.some((t) => t.type === 'income');
    const dots = (hasExp ? '<span class="cal-dot"></span>' : '') + (hasInc ? '<span class="cal-dot inc"></span>' : '');
    const isToday = ds === tdy;
    cells.push(`
      <button type="button" class="cal-day ${ds === selectedDay ? 'selected' : ''} ${isToday ? 'today' : ''}" data-date="${ds}">
        <span class="num ${isToday ? 'today-lab' : ''}">${isToday ? L('today') : d}</span><span class="cal-dots">${dots}</span>
      </button>`);
  }
  // 下個月的開頭（灰字、可點擊直接跳月）
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    cells.push(`<button type="button" class="cal-day muted" data-date="${nextYm}-${String(i).padStart(2, '0')}"><span class="num">${i}</span></button>`);
  }
  $('#calGrid').innerHTML = cells.join('');

  const dayTxs = (selectedDay.startsWith(booksMonth) ? (byDay[selectedDay] || []) : []);
  const dayExp = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const dayInc = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const head = selectedDay.startsWith(booksMonth)
    ? `<div class="day-detail-head">
         <span>${Number(selectedDay.slice(5, 7))}/${Number(selectedDay.slice(8))} ${wd(selectedDay)}</span>
         <span>${dayExp ? L('expense') + ' ' + fmtN(dayExp) : ''}${dayExp && dayInc ? ' · ' : ''}${dayInc ? L('income') + ' ' + fmtN(dayInc) : ''}</span>
       </div>`
    : '';
  $('#dayDetail').innerHTML = head + (dayTxs.length
    ? dayTxs.map((t) => txItemHTML(t)).join('')
    : `<div class="empty" style="padding:24px 0">${L('dayEmpty')}</div>`);
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
    <div class="inc">${L('income')}<b>${fmtN(inc)}</b></div>
    <div class="exp">${L('expense')}<b>${fmtN(exp)}</b></div>
    <div>${L('balance')}<b>${fmtN(inc - exp)}</b></div>`;

  const listEl = $('#txList');
  if (txs.length === 0) {
    listEl.innerHTML = `<div class="empty"><div class="big">🗒️</div>${listFilter === 'transfer' ? L('emptyMonthTransfer') : L('emptyMonth')}</div>`;
    return;
  }
  const byDay = {};
  txs.forEach((t) => { (byDay[t.date] ||= []).push(t); });
  listEl.innerHTML = Object.keys(byDay).sort().reverse().map((d) => {
    const dayExp = byDay[d].filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return `<div class="day-group">
      <div class="day-head"><span>${Number(d.slice(5, 7))}/${Number(d.slice(8))} ${wd(d)}</span><span>${dayExp ? L('expense') + ' ' + fmtN(dayExp) : ''}</span></div>
      ${byDay[d].map((t) => txItemHTML(t)).join('')}</div>`;
  }).join('');
}

/* ----- 搜尋 ----- */
function runSearch() {
  const q = $('#searchInput').value.trim().toLowerCase();
  const box = $('#searchResults');
  if (!q) {
    box.innerHTML = `<div class="empty"><div class="big">🔍</div>${L('searchHint')}</div>`;
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
    ? `<div class="day-head" style="padding:6px 4px"><span>${L('searchFound', { n: hits.length })}</span></div>` +
      hits.map((t) => txItemHTML(t, { showDate: true })).join('') +
      (hits.length === 100 ? `<p class="hint" style="text-align:center">${L('searchCapped')}</p>` : '')
    : `<div class="empty"><div class="big">🤷</div>${L('searchNone', { q: esc(q) })}</div>`;
}

/* ==================================================
   Reports
================================================== */
let repPeriod = 'month';
let repMonth = thisMonth();
let repYear = thisMonth().slice(0, 4);
let repRange = null;
let repKind = 'expense';
let repDetailKey = null;

function periodFilter() {
  if (repPeriod === 'month') {
    const start = repMonth + '-01';
    const end = repMonth + '-' + String(daysInMonth(repMonth)).padStart(2, '0');
    return { start, end, label: monthLabel(repMonth) };
  }
  if (repPeriod === 'year') return { start: repYear + '-01-01', end: repYear + '-12-31', label: yearLabel(repYear) };
  if (repRange) return repRange;
  return { start: '0000-01-01', end: '9999-12-31', label: L('allTimeRange') };
}

function periodTxs() {
  const { start, end } = periodFilter();
  return db.txs.filter((t) => t.date >= start && t.date <= end);
}

function periodDays() {
  const { start, end } = periodFilter();
  const tdy = today();
  const s = start < '2000-01-01' ? (db.txs.length ? [...db.txs].sort((a, b) => a.date.localeCompare(b.date))[0].date : tdy) : start;
  const e = end < tdy ? end : tdy;
  const ms = new Date(e + 'T00:00:00') - new Date(s + 'T00:00:00');
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

const repKindTxs = () => periodTxs().filter((t) =>
  repKind === 'transfer' ? (t.type === 'transfer' && !t.legacy) : t.type === repKind);
const repKeyOf = (t) => repKind === 'transfer' ? L('transferOut', { name: db.members[t.from] }) : catOf(t).name;

function renderReports() {
  $$('#segRepPeriod .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.period === repPeriod));
  $$('#repIOWrap .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.kind === repKind));
  $('#repTitle').innerHTML = `${esc(periodFilter().label)} <span class="caret">▾</span>`;
  const navVisible = repPeriod !== 'range';
  $('#repPrev').style.visibility = navVisible ? 'visible' : 'hidden';
  $('#repNext').style.visibility = navVisible ? 'visible' : 'hidden';

  const kindLabel = L(repKind);
  const txs = repKindTxs();
  const total = txs.reduce((s, t) => s + t.amount, 0);
  const byKey = {};
  txs.forEach((t) => {
    const key = repKeyOf(t);
    byKey[key] = (byKey[key] || 0) + t.amount;
  });
  const rows = Object.entries(byKey).sort((a, b) => b[1] - a[1]);

  if (rows.length === 0) {
    $('#repBody').innerHTML = `<div class="empty"><div class="big">📊</div>${L('repEmpty', { k: kindLabel })}</div>`;
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
    <button type="button" class="rank-row" data-key="${esc(name)}">
      <span class="idx">${i + 1}</span>
      <span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>
      <span class="nm">${esc(name)}</span>
      <span class="amt">${fmtN(amt)}</span>
      <span class="pct">${((amt / total) * 100).toFixed(1)}%</span>
      <span class="chev">›</span>
    </button>`).join('');

  // 年檢視 → 每月趨勢長條圖（點長條跳到該月）
  let trendHTML = '';
  if (repPeriod === 'year') {
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const ym = `${repYear}-${String(i + 1).padStart(2, '0')}`;
      return txs.filter((t) => t.date.startsWith(ym)).reduce((s, t) => s + t.amount, 0);
    });
    const maxM = Math.max(...monthly, 1);
    trendHTML = `
      <div class="card">
        <h2 class="card-title">${L('trend')}</h2>
        <div class="trend">${monthly.map((v, i) => `
          <button type="button" class="trend-col" data-m="${String(i + 1).padStart(2, '0')}" title="${fmtN(v)}">
            <span class="trend-track"><span class="trend-bar" style="height:${v ? Math.max(4, (v / maxM) * 100) : 0}%"></span></span>
            <span class="trend-lab">${i + 1}</span>
          </button>`).join('')}
        </div>
      </div>`;
  }

  $('#repBody').innerHTML = trendHTML + `
    <div class="card">
      <div class="donut-wrap">
        <div class="donut" style="background:conic-gradient(${stops})">
          <div class="donut-center"><span>${kindLabel}</span><b>${fmtN(total)}</b></div>
        </div>
        <div class="legend">${legend}</div>
      </div>
      <div class="rep-meta">
        <span>${L('total')} <b>${fmtN(total)}</b></span>
        <span>${L('dailyAvg')} <b>${fmtN(total / periodDays())}</b></span>
      </div>
    </div>
    <div class="card">${rank}</div>`;
}

/* ----- Reports 明細 ----- */
function openRepDetail(key) {
  repDetailKey = key;
  renderRepDetail();
  $('#repDetailPage').hidden = false;
  lockScroll();
}
function closeRepDetail() {
  $('#repDetailPage').hidden = true;
  repDetailKey = null;
  lockScroll();
}
function renderRepDetail() {
  if (repDetailKey == null) return;
  const txs = repKindTxs().filter((t) => repKeyOf(t) === repDetailKey).sort(txSort);
  const total = txs.reduce((s, t) => s + t.amount, 0);
  $('#repDetailTitle').textContent = repDetailKey;
  $('#repDetailSummary').innerHTML = `
    <div>${esc(periodFilter().label)}</div>
    <div>${L('total')}<b>${fmtN(total)}</b></div>
    <div>${txs.length} ${db.lang === 'en' ? 'records' : '筆'}</div>`;
  $('#repDetailList').innerHTML = txs.length
    ? txs.map((t) => txItemHTML(t, { showDate: true })).join('')
    : `<div class="empty">${L('repEmpty', { k: L(repKind) })}</div>`;
  if (!txs.length && !$('#repDetailPage').hidden) closeRepDetail();
}

/* ==================================================
   Accounts（成員結算）
================================================== */
let accMonth = thisMonth();

function balances() {
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

function renderAccounts() {
  const bal = balances();
  let hero;
  if (Math.abs(bal.p1) < 0.01) {
    hero = `<div class="card settle-hero"><div class="all-clear">${L('allClear')}</div><div class="who">${L('keepGoing')}</div></div>`;
  } else {
    const debtor = bal.p1 < 0 ? 'p1' : 'p2';
    const creditor = debtor === 'p1' ? 'p2' : 'p1';
    hero = `<div class="card settle-hero">
      <div class="who">${L('needPay', { a: esc(db.members[debtor]), b: esc(db.members[creditor]) })}</div>
      <div class="amt">${fmt(Math.abs(bal[debtor]))}</div>
      <button id="btnSettle" class="btn btn-primary" data-debtor="${debtor}">${L('settle')}</button>
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
      <span class="amt">${L('totalSpent')} ${fmtN(share[p])}</span>
    </div>`).join('');

  const monthDetail = ['p1', 'p2'].map((p) => `
    <div class="person-row">
      <span>${esc(db.members[p])}</span>
      <span class="amt">${L('totalSpent')} ${fmtN(mShare[p])}</span>
    </div>`).join('') + `
    <div class="person-row"><span>${L('subtotal')}</span><span class="amt">${fmtN(mShare.p1 + mShare.p2)}</span></div>`;

  $('#accountsBody').innerHTML = hero + `
    <div class="card">
      <h2 class="card-title">${L('allTime')}</h2>
      ${detail}
    </div>
    <div class="card" id="accMonthCard">
      <h2 class="card-title">${L('monthStats')}</h2>
      <div class="dp-head" style="margin:2px 0 6px">
        <button type="button" class="icon-btn" id="accPrev" aria-label="上個月">‹</button>
        <div class="month-title month-title-btn" id="accMonthTitle">${monthLabel(accMonth)} <span class="caret">▾</span></div>
        <button type="button" class="icon-btn" id="accNext" aria-label="下個月">›</button>
      </div>
      ${monthDetail}
    </div>
    <p class="hint" style="text-align:center">${L('accountsHint')}</p>`;
}

function doSettle(debtor) {
  const creditor = debtor === 'p1' ? 'p2' : 'p1';
  const amt = Math.abs(balances()[debtor]);
  if (amt < 0.01) return;
  const now = Date.now();
  const tx = {
    id: uid(), type: 'transfer', amount: amt,
    from: debtor, to: creditor,
    date: today(), note: db.lang === 'en' ? 'Settle up' : '結清',
    createdAt: now, updatedAt: now,
  };
  db.txs.push(tx);
  save();
  syncUpsert(tx);
  toast(L('settleDone', { a: db.members[debtor], b: db.members[creditor], amt: fmt(amt) }));
  renderCurrentView();
}

/* ==================================================
   Settings
================================================== */
let catPageType = 'expense';
let editingCatId = null;

let tmpDefPayer = 'p1';
function renderDefPayerRow() {
  const n1 = $('#inpName1').value.trim() || db.members.p1;
  const n2 = $('#inpName2').value.trim() || db.members.p2;
  $('#defPayerRow').innerHTML = [['p1', n1], ['p2', n2]].map(([p, n]) => `
    <label class="check-pill ${tmpDefPayer === p ? 'checked' : ''}" data-def="${p}">
      <span class="box">✓</span>${esc(n)}
    </label>`).join('');
}

function renderSettings() {
  $('#setMembersVal').textContent = `${db.members.p1}、${db.members.p2}`;
  $('#setLangVal').textContent = db.lang === 'en' ? 'English' : '中文';
  const S = window.Sync;
  let st;
  if (!S || !S.configured) st = L('syncNA');
  else if (!S.signedIn) st = L('syncOffline');
  else if (S.enabled) st = L('syncOn');
  else if (S.pending) st = L('syncPendingApprove');
  else st = L('syncOffline');
  $('#setSyncVal').textContent = st;
  $('#verLabel').textContent = '智賬 ' + APP_VER;
}

function syncNotice(msg) {
  const body = $('#syncBody');
  let n = body.querySelector('.sync-notice');
  if (!n) {
    n = document.createElement('p');
    n.className = 'sync-notice';
    body.prepend(n);
  }
  n.textContent = msg;
}

function syncReqBlock(S) {
  if (!S.isOwner || !S.requests.length) return '';
  return `<div class="card-flat" style="margin-bottom:14px">
    <h2 class="card-title" style="margin-bottom:8px">${L('reqTitle')}</h2>
    ${S.requests.map((r) => `
      <p class="hint" style="margin:0 0 8px">${L('reqIncoming', { email: esc(r.email) })}</p>
      <div class="dialog-actions" style="margin-bottom:6px">
        <button class="btn btn-primary btn-sm" data-approve="${esc(r.email)}">${L('approve')}</button>
        <button class="btn btn-ghost btn-sm" data-reject="${esc(r.email)}">${L('rejectBtn')}</button>
        <button class="btn btn-danger btn-sm" data-block="${esc(r.email)}">${L('blockBtn')}</button>
      </div>`).join('')}
  </div>`;
}

function renderSyncDialog() {
  const S = window.Sync;
  const body = $('#syncBody');
  if (!S || !S.configured) {
    body.innerHTML = `
      <p class="hint" style="margin-top:0">${L('syncNAHint')}</p>
      <div class="dialog-actions"><button class="btn btn-primary btn-block" id="btnSyncClose">${L('gotIt')}</button></div>`;
  } else if (!S.signedIn) {
    body.innerHTML = `
      <p class="hint" style="margin-top:0">${L('loginHint')}</p>
      <div class="field" style="margin-bottom:10px">
        <label class="field-label" for="inpSyncEmail">${L('email')}</label>
        <input id="inpSyncEmail" class="input" type="email" inputmode="email" autocomplete="username" autocapitalize="none">
      </div>
      <div class="field" style="margin-bottom:10px">
        <label class="field-label" for="inpSyncPw">${L('password')}</label>
        <input id="inpSyncPw" class="input" type="password" autocomplete="current-password">
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary btn-block" id="btnSyncLogin">${L('signIn')}</button>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-ghost btn-block" id="btnSyncSignup">${L('signUp')}</button>
      </div>`;
  } else if (S.pending) {
    body.innerHTML = `
      <p class="hint" style="margin-top:0">${L('waitingApprove', { code: esc(S.pendingCode || '') })}</p>
      <div class="sync-code">${esc(S.pendingCode || '')}</div>
      <div class="dialog-actions">
        <button class="btn btn-ghost" id="btnSyncCancelReq">${L('cancelReq')}</button>
        <button class="btn btn-ghost" id="btnSyncLogout">${L('signOut')}</button>
      </div>`;
  } else if (S.enabled) {
    body.innerHTML = syncReqBlock(S) + `
      <p class="hint" style="margin-top:0">${L('syncOnHint')}</p>
      <div class="sync-code">${esc(S.roomId)}</div>
      <p class="hint">${L('syncCodeHint')}</p>
      <p class="hint">${L('signedInAs', { email: esc(S.userEmail || '') })}</p>
      <div class="dialog-actions">
        <button class="btn btn-danger" id="btnSyncOff">${L('disconnect')}</button>
        <button class="btn btn-primary" id="btnSyncClose">${L('done')}</button>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-ghost btn-block" id="btnSyncLogout">${L('signOut')}</button>
      </div>`;
  } else {
    body.innerHTML = syncReqBlock(S) + `
      <p class="hint" style="margin-top:0">${L('syncSetupHint')}</p>
      <p class="hint" style="margin-top:0">${L('signedInAs', { email: esc(S.userEmail || '') })}</p>
      <button class="btn btn-primary btn-block" id="btnSyncCreate" style="margin-bottom:14px">${L('createBook')}</button>
      <div class="field" style="margin-bottom:10px">
        <label class="field-label" for="inpSyncCode">${L('joinLabel')}</label>
        <input id="inpSyncCode" class="input" maxlength="12" placeholder="AB12CD34" autocapitalize="characters" autocomplete="off">
      </div>
      <div class="dialog-actions">
        <button class="btn btn-primary btn-block" id="btnSyncJoin">${L('join')}</button>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-ghost btn-block" id="btnSyncLogout">${L('signOut')}</button>
      </div>`;
  }
}

let catEditMode = false;

function renderCatTiles() {
  $$('#segCatType .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.type === catPageType));
  $('#btnCatEditMode').textContent = catEditMode ? L('done') : L('edit');
  $('#catHintText').textContent = catEditMode ? L('catHintEdit') : L('catHint');
  const box = $('#catTiles');
  box.classList.toggle('editing', catEditMode);
  box.innerHTML = cats(catPageType).map((c) => `
    <button type="button" class="cat-tile" data-cat="${c.id}">
      ${catEditMode ? `<span class="cat-minus" data-del="${c.id}">−</span>` : ''}
      <span class="em">${c.icon}</span><span class="nm">${esc(c.name)}</span>
    </button>`).join('') + (catEditMode ? '' : `
    <button type="button" class="cat-tile add-tile" data-cat="__new">
      <span class="em">＋</span><span class="nm">${L('add')}</span>
    </button>`);
}

function openCatEdit(id) {
  editingCatId = id;
  const isNew = id === '__new';
  $('#catEditTitle').textContent = isNew ? L('catEditNew') : L('catEdit');
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

/* ----- 類別拖拉排序（編輯模式中直接拖曳） ----- */
let cdTile = null, cdGhost = null, cdDragging = false, cdOffX = 0, cdOffY = 0;
let cdStartX = 0, cdStartY = 0, cdSuppressUntil = 0;

function cdStart(tile, touch) {
  cdDragging = true;
  const r = tile.getBoundingClientRect();
  cdGhost = tile.cloneNode(true);
  cdGhost.classList.add('cat-ghost');
  cdGhost.style.width = r.width + 'px';
  cdGhost.style.height = r.height + 'px';
  cdGhost.style.left = r.left + 'px';
  cdGhost.style.top = r.top + 'px';
  document.body.appendChild(cdGhost);
  cdOffX = touch.clientX - r.left;
  cdOffY = touch.clientY - r.top;
  tile.classList.add('drag-src');
  if (navigator.vibrate) navigator.vibrate(10);
}
function cdMove(touch) {
  cdGhost.style.left = (touch.clientX - cdOffX) + 'px';
  cdGhost.style.top = (touch.clientY - cdOffY) + 'px';
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const over = el && el.closest('.cat-tile:not(.add-tile)');
  if (over && over !== cdTile && over.parentElement === cdTile.parentElement) {
    const tiles = [...cdTile.parentElement.children];
    if (tiles.indexOf(cdTile) < tiles.indexOf(over)) over.after(cdTile);
    else over.before(cdTile);
  }
}
function cdEnd() {
  if (cdGhost) cdGhost.remove();
  cdGhost = null;
  if (cdTile) cdTile.classList.remove('drag-src');
  if (cdDragging) {
    cdSuppressUntil = Date.now() + 400; // 拖曳剛結束，吞掉緊接著的誤觸點擊
    const order = [...document.querySelectorAll('#catTiles .cat-tile:not(.add-tile)')].map((t) => t.dataset.cat);
    db.categories[catPageType].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    save();
    syncConfig();
  }
  cdTile = null;
  cdDragging = false;
}
function bindCatDrag() {
  const box = $('#catTiles');
  box.addEventListener('touchstart', (e) => {
    if (!catEditMode) return;
    if (e.target.closest('.cat-minus')) return; // 按 − 是刪除，不拖曳
    const tile = e.target.closest('.cat-tile:not(.add-tile)');
    if (!tile) return;
    cdTile = tile;
    cdStartX = e.touches[0].clientX;
    cdStartY = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener('touchmove', (e) => {
    if (!cdTile) return;
    const t = e.touches[0];
    if (!cdDragging) {
      const dist = Math.hypot(t.clientX - cdStartX, t.clientY - cdStartY);
      if (dist < 6) return; // 容許手指微晃
      cdStart(cdTile, t);
    }
    e.preventDefault();
    cdMove(t);
  }, { passive: false });
  box.addEventListener('touchend', cdEnd);
  box.addEventListener('touchcancel', cdEnd);
  // 滑鼠拖曳（桌面版）
  box.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || !catEditMode) return;
    if (e.target.closest('.cat-minus')) return;
    const tile = e.target.closest('.cat-tile:not(.add-tile)');
    if (!tile) return;
    cdTile = tile;
    cdStartX = e.clientX;
    cdStartY = e.clientY;
  });
  document.addEventListener('mousemove', (e) => {
    if (!cdTile) return;
    if (!cdDragging) {
      if (Math.hypot(e.clientX - cdStartX, e.clientY - cdStartY) < 6) return;
      cdStart(cdTile, e);
    }
    e.preventDefault();
    cdMove(e);
  });
  document.addEventListener('mouseup', () => { if (cdTile) cdEnd(); });
}

function saveCatEdit() {
  const name = $('#inpCatName').value.trim();
  const icon = $('#inpCatEmoji').value.trim() || '📌';
  if (!name) { toast(L('catNameReq')); return; }
  if (editingCatId === '__new') {
    db.categories[catPageType].push({ id: uid(), name, icon });
  } else {
    const c = cats(catPageType).find((x) => x.id === editingCatId);
    if (c) { c.name = name; c.icon = icon; }
  }
  save();
  syncConfig();
  $('#dlgCatEdit').close();
  renderCatTiles();
  toast(L('catSaved'));
}

function openCatDelConfirm(id) {
  const used = db.txs.filter((t) => t.type === catPageType && t.category === id).length;
  const c = cats(catPageType).find((x) => x.id === id);
  if (!c) return;
  $('#catDelDesc').textContent = used > 0
    ? L('catDelUsed', { n: used, name: c.name })
    : L('catDelConfirm', { name: c.name });
  const dlg = $('#dlgCatDel');
  dlg.dataset.id = id;
  dlg.showModal();
}
function deleteCat(id) {
  db.categories[catPageType] = cats(catPageType).filter((x) => x.id !== id);
  save();
  syncConfig();
  renderCatTiles();
  toast(L('catDeleted'));
}

/* ==================================================
   i18n 套用
================================================== */
function weekHeaderHTML() {
  const names = db.lang === 'en' ? WEEK_EN : WEEK_ZH;
  return names.map((n) => `<span>${n}</span>`).join('');
}
function applyLang() {
  document.documentElement.lang = db.lang === 'en' ? 'en' : 'zh-Hant';
  $$('[data-i18n]').forEach((el) => { el.textContent = L(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = L(el.dataset.i18nPh); });
  $('#calWeek').innerHTML = weekHeaderHTML();
  $('#dpWeek').innerHTML = weekHeaderHTML();
}

/* ----- 通用：水平滑動換月 ----- */
function bindHSwipe(container, opts) {
  let sx = 0, sy = 0, on = false;
  container.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches.length) return;
    if (opts.within && !e.target.closest(opts.within)) return;
    if (opts.except && e.target.closest(opts.except)) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    on = true;
  }, { passive: true });
  container.addEventListener('touchend', (e) => {
    if (!on) return;
    on = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) opts.onSwipe(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* ==================================================
   分頁 / 全域
================================================== */
let curView = 'books';
function switchView(name) {
  curView = name;
  closeSwipe();
  window.scrollTo(0, 0);
  $$('.view').forEach((v) => { v.hidden = v.id !== 'view-' + name; });
  $$('.tabbar .tab[data-view]').forEach((t) => t.classList.toggle('active', t.dataset.view === name));
  renderCurrentView();
}
function renderCurrentView() {
  if (curView === 'books') renderBooks();
  else if (curView === 'accounts') renderAccounts();
  else if (curView === 'reports') renderReports();
  else if (curView === 'settings') renderSettings();
  if (!$('#repDetailPage').hidden) renderRepDetail();
  if (!$('#searchPage').hidden) runSearch();
}

/* ----- 匯出 / 匯入 ----- */
function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `zhizhang-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(L('exported'));
}

function exportCSV() {
  const q = (v) => {
    v = String(v ?? '');
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const en = db.lang === 'en';
  const header = en
    ? ['Date', 'Type', 'Category', 'Amount', 'Paid by / From', 'Received by / To', `${db.members.p1} share`, `${db.members.p2} share`, 'Memo', 'Created']
    : ['日期', '類型', '類別', '金額', '付款人/轉出', '收款人/轉入', `${db.members.p1}分攤`, `${db.members.p2}分攤`, '備註', '建立時間'];
  const rows = [...db.txs].sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0)).map((t) => {
    const c = catOf(t);
    const from = t.type === 'transfer' ? (t.legacy ? (t.fromAccount || '') : db.members[t.from] || '') : (db.members[t.payer] || '');
    const to = t.type === 'transfer' ? (t.legacy ? (t.toAccount || '') : db.members[t.to] || '') : '';
    return [
      t.date, L(t.type), c.name, t.amount, from, to,
      t.split ? (t.split.p1 || 0) : '', t.split ? (t.split.p2 || 0) : '',
      t.note || '', fmtDT(t.createdAt),
    ].map(q).join(',');
  });
  const csv = '﻿' + header.map(q).join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `zhizhang-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(L('csvExported'));
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
      db.txs.forEach(syncUpsert);
      syncConfig();
      renderCurrentView();
      toast(L('imported', { n: db.txs.length }));
    } catch (e) { toast(L('badFile')); }
  };
  reader.readAsText(file);
}

/* ----- 刪除（左滑 → 二次確認） ----- */
function openConfirmDel(id) {
  const tx = db.txs.find((t) => t.id === id);
  if (!tx) return;
  const c = catOf(tx);
  $('#delDesc').textContent = `${c.icon} ${c.name} ${fmt(tx.amount)}${tx.note ? ' · ' + tx.note : ''} (${tx.date})`;
  const dlg = $('#dlgConfirmDel');
  dlg.dataset.id = id;
  dlg.showModal();
}

/* ==================================================
   事件綁定
================================================== */
function bind() {
  $$('.tabbar .tab[data-view]').forEach((t) => t.addEventListener('click', () => {
    const name = t.dataset.view;
    if (name === curView) {
      // 已在此分頁 → 再點一次回到當月
      if (name === 'books') { booksMonth = thisMonth(); selectedDay = today(); renderBooks(); }
      else if (name === 'reports') { repPeriod = 'month'; repMonth = thisMonth(); renderReports(); }
      else if (name === 'accounts') { accMonth = thisMonth(); renderAccounts(); }
      return;
    }
    switchView(name);
  }));
  $('#btnAdd').addEventListener('click', () => openAdd());

  // 所有 dialog：點背景關閉 + ✕ 按鈕
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('.dialog-x')) d.close();
    });
  });

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
  $('#dlgPicker').addEventListener('click', (e) => {
    const dlg = $('#dlgPicker');
    const chip = e.target.closest('[data-val]');
    if (!chip) return;
    const kind = dlg.dataset.kind, val = chip.dataset.val;
    if (kind === 'category') form.category = val;
    else if (kind === 'member') form.payer = val;
    else if (kind === 'from') { form.from = val; if (form.to === val) form.to = val === 'p1' ? 'p2' : 'p1'; }
    else if (kind === 'to') { form.to = val; if (form.from === val) form.from = val === 'p1' ? 'p2' : 'p1'; }
    else if (kind === 'feePayer') form.feePayer = val;
    else if (kind === 'lang') {
      db.lang = val;
      save();
      applyLang();
      renderSettings();
      renderCurrentView();
      toast(L('langSaved'));
    }
    dlg.close();
    if (!$('#addPage').hidden) renderAddRows();
  });

  $('#feeToggle').addEventListener('change', (e) => {
    form.feeOn = e.target.checked;
    $('#feeFields').hidden = !form.feeOn;
  });
  $('#feeCard').addEventListener('click', (e) => {
    const row = e.target.closest('.form-row[data-row="feePayer"]');
    if (row) openPicker('feePayer');
  });

  // 金額：系統鍵盤打字 + 常駐運算列 + 計算機鍵盤，三者並存
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
  // 運算列：touchstart + preventDefault 才不會讓 iOS 先把輸入框失焦、收鍵盤
  const opBarPress = (e) => {
    const b = e.target.closest('[data-op]'); if (!b) return;
    e.preventDefault();
    const inp = $('#amountInput');
    const op = b.dataset.op;
    const focused = document.activeElement === inp;
    let start = focused ? (inp.selectionStart ?? inp.value.length) : inp.value.length;
    let end = focused ? (inp.selectionEnd ?? start) : start;
    let before = inp.value.slice(0, start);
    const after = inp.value.slice(end);
    if (op === '⌫') {
      if (start === end && start > 0) before = before.slice(0, -1);
      inp.value = before + after;
      start = before.length;
    } else {
      if (before === '' && after === '') return; // 空值不先放運算符
      if (start === end && /[+−×÷]$/.test(before)) before = before.slice(0, -1); // 連按 → 取代
      inp.value = before + op + after;
      start = before.length + op.length;
    }
    form.expr = inp.value;
    if (focused) inp.setSelectionRange(start, start);
    const hasOp = /[+−×÷]/.test(form.expr);
    const val = formAmount();
    $('#amountEval').textContent = hasOp && val ? '= ' + fmtN(val) : '';
  };
  $('#opBar').addEventListener('touchstart', opBarPress, { passive: false });
  $('#opBar').addEventListener('mousedown', (e) => {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return; // 觸控裝置已由 touchstart 處理
    opBarPress(e);
  });

  // 日期
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
    if (dpMode === 'year') { dpApply(b.dataset.year); return; }
    dpMonth = b.dataset.year + dpMonth.slice(4);
    dpView = 'month';
    renderDp();
  });
  $('#dpToday').addEventListener('click', () => dpApply(dpMode === 'date' ? today() : dpMode === 'year' ? today().slice(0, 4) : thisMonth()));
  $('#dpYesterday').addEventListener('click', () => dpApply(shiftDate(today(), -1)));
  $('#dpCancel').addEventListener('click', () => $('#dlgDate').close());

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
    const p = inp.dataset.person;
    form.custom[p] = inp.value;
    // 填一格，另一格自動帶入剩餘金額
    const amount = formAmount();
    const parts = ['p1', 'p2'].filter((x) => form.participants[x]);
    if (amount > 0 && parts.length === 2) {
      const other = p === 'p1' ? 'p2' : 'p1';
      const v = parseFloat(inp.value);
      form.custom[other] = isNaN(v) ? '' : String(round2(Math.max(0, amount - v)));
      const otherInp = $(`#splitDetail .custom-split[data-person="${other}"]`);
      if (otherInp) otherInp.value = form.custom[other];
    }
    updateRemainHint();
  });
  $('#btnSplitDone').addEventListener('click', () => {
    $('#dlgSplit').close();
    renderAddRows();
  });
  $('#dlgSplit').addEventListener('close', () => { if (!$('#addPage').hidden) renderAddRows(); });

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
    const ds = d.dataset.date;
    selectedDay = ds;
    if (!ds.startsWith(booksMonth)) { booksMonth = ds.slice(0, 7); renderBooks(); } // 點到前後月 → 直接切換
    else renderCalendar();
  });
  // 日曆左右滑動切換月份
  let calSwX = 0, calSwY = 0, calSwOn = false;
  const calCard = $('#booksCalendar .cal-card');
  calCard.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches.length) return;
    calSwX = e.touches[0].clientX;
    calSwY = e.touches[0].clientY;
    calSwOn = true;
  }, { passive: true });
  calCard.addEventListener('touchend', (e) => {
    if (!calSwOn) return;
    calSwOn = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - calSwX, dy = t.clientY - calSwY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      booksMonth = shiftMonth(booksMonth, dx < 0 ? 1 : -1);
      selectedDay = booksMonth === thisMonth() ? today() : booksMonth + '-01';
      renderBooks();
    }
  }, { passive: true });
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

  // 點記錄 → 直接編輯；左滑刪除鈕 → 二次確認
  ['#txList', '#dayDetail', '#searchResults', '#repDetailList'].forEach((sel) => {
    $(sel).addEventListener('click', (e) => {
      const del = e.target.closest('.tx-del');
      if (del) { openConfirmDel(del.dataset.delid); return; }
      const item = e.target.closest('.tx-item');
      if (!item) return;
      if (Date.now() < swSuppressUntil) return;   // 剛滑動完，不觸發編輯
      if (swOpen) { closeSwipe(); return; }        // 有展開的刪除鈕 → 先收合
      const tx = db.txs.find((t) => t.id === item.dataset.id);
      if (!tx) return;
      if (tx.legacy) { toast(L('noEditLegacy')); return; }
      $('#searchPage').hidden = true;
      lockScroll();
      openAdd(tx);
    });
  });

  $('#btnDelCancel').addEventListener('click', () => $('#dlgConfirmDel').close());
  $('#btnDelOk').addEventListener('click', () => {
    const id = $('#dlgConfirmDel').dataset.id;
    db.txs = db.txs.filter((t) => t.id !== id);
    save();
    syncDelete(id);
    $('#dlgConfirmDel').close();
    closeSwipe();
    toast(L('deleted'));
    renderCurrentView();
  });

  // 搜尋
  $('#btnSearch').addEventListener('click', () => {
    $('#searchPage').hidden = false;
    $('#searchInput').value = '';
    runSearch();
    lockScroll();
    $('#searchInput').focus();
  });
  $('#btnSearchClose').addEventListener('click', () => { $('#searchPage').hidden = true; lockScroll(); });
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
  function openRangeDlg() {
    $('#inpRangeStart').value = repRange ? repRange.start : shiftDate(today(), -29);
    $('#inpRangeEnd').value = repRange ? repRange.end : today();
    $('#dlgRange').showModal();
  }
  $('#segRepPeriod').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    const p = b.dataset.period;
    if (p === 'range') { openRangeDlg(); return; }
    repPeriod = p;
    renderReports();
  });
  // 點報表標題 → 直接跳任意月／年／範圍
  $('#repTitle').addEventListener('click', () => {
    if (repPeriod === 'month') {
      openDp({ mode: 'month', value: repMonth, onPick: (ym) => { repMonth = ym; renderReports(); } });
    } else if (repPeriod === 'year') {
      openDp({ mode: 'year', value: repYear, onPick: (y) => { repYear = String(y); renderReports(); } });
    } else {
      openRangeDlg();
    }
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
  $('#repBody').addEventListener('click', (e) => {
    const col = e.target.closest('.trend-col[data-m]');
    if (col) {
      repMonth = `${repYear}-${col.dataset.m}`;
      repPeriod = 'month';
      renderReports();
      return;
    }
    const row = e.target.closest('.rank-row[data-key]');
    if (row) openRepDetail(row.dataset.key);
  });
  $('#btnRepDetailClose').addEventListener('click', closeRepDetail);

  // Reports 圓餅圖／排行榜區左右滑動換月（年檢視則換年）
  bindHSwipe($('#repBody'), {
    onSwipe: (dir) => {
      if (repPeriod === 'month') repMonth = shiftMonth(repMonth, dir);
      else if (repPeriod === 'year') repYear = String(Number(repYear) + dir);
      else return;
      renderReports();
    },
  });
  // Accounts 月份統計卡片左右滑動換月
  bindHSwipe($('#accountsBody'), {
    within: '#accMonthCard',
    onSwipe: (dir) => { accMonth = shiftMonth(accMonth, dir); renderAccounts(); },
  });
  // Books 列表模式左右滑動換月（明細項目上滑動是刪除手勢，排除）
  bindHSwipe($('#booksList'), {
    except: '.tx-swipe',
    onSwipe: (dir) => {
      booksMonth = shiftMonth(booksMonth, dir);
      selectedDay = booksMonth === thisMonth() ? today() : booksMonth + '-01';
      renderBooks();
    },
  });

  // 日期範圍
  $('#dlgRange').addEventListener('click', (e) => {
    const q = e.target.closest('[data-quick]');
    if (!q) return;
    const v = q.dataset.quick;
    if (v === 'all') repRange = null;
    else repRange = { start: shiftDate(today(), -(Number(v) - 1)), end: today(), label: L('last' + v) };
    repPeriod = 'range';
    $('#dlgRange').close();
    renderReports();
  });
  $('#btnRangeApply').addEventListener('click', () => {
    const s = $('#inpRangeStart').value, e2 = $('#inpRangeEnd').value;
    if (!s || !e2 || s > e2) { toast(L('rangeBad')); return; }
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
      tmpDefPayer = db.defaultPayer;
      renderDefPayerRow();
      $('#dlgMembers').showModal();
    } else if (kind === 'categories') {
      catPageType = 'expense';
      renderCatTiles();
      $('#catPage').hidden = false;
      lockScroll();
    } else if (kind === 'lang') {
      openPicker('lang');
    } else if (kind === 'sync') {
      renderSyncDialog();
      $('#dlgSync').showModal();
    } else if (kind === 'export') exportData();
    else if (kind === 'csv') exportCSV();
    else if (kind === 'import') $('#fileImport').click();
    else if (kind === 'update') {
      // 強制更新：清除 service worker 與快取後重新載入（記帳資料不受影響）
      toast(L('updating'));
      (async () => {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (err) { /* 盡力而為 */ }
        location.reload();
      })();
    }
  });
  $('#defPayerRow').addEventListener('click', (e) => {
    const pill = e.target.closest('.check-pill'); if (!pill) return;
    e.preventDefault();
    tmpDefPayer = pill.dataset.def;
    renderDefPayerRow();
  });
  $('#btnMembersSave').addEventListener('click', () => {
    db.members.p1 = $('#inpName1').value.trim() || (db.lang === 'en' ? 'Me' : '我');
    db.members.p2 = $('#inpName2').value.trim() || (db.lang === 'en' ? 'Partner' : '另一半');
    db.defaultPayer = tmpDefPayer === 'p2' ? 'p2' : 'p1';
    save();
    syncConfig();
    $('#dlgMembers').close();
    toast(L('namesSaved'));
    renderCurrentView();
  });
  $('#fileImport').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  // 雲端同步彈窗
  $('#dlgSync').addEventListener('click', async (e) => {
    const S = window.Sync;
    if (e.target.closest('#btnSyncClose')) { $('#dlgSync').close(); return; }
    if (e.target.closest('#btnSyncLogin') || e.target.closest('#btnSyncSignup')) {
      const isSignup = !!e.target.closest('#btnSyncSignup');
      const email = ($('#inpSyncEmail')?.value || '').trim();
      const pw = $('#inpSyncPw')?.value || '';
      if (!email || !pw) { toast(L('enterEmailPw')); return; }
      if (pw.length < 6) { toast(L('pwTooShort')); return; }
      try {
        toast(L('connecting'));
        if (isSignup) await S.signUp(email, pw);
        else await S.signIn(email, pw);
        renderSyncDialog();
        renderSettings();
        toast(isSignup ? L('signupDone') : L('loginDone'));
      } catch (err) {
        toast(L('loginFail', { e: (err.code || err.message || '').replace('auth/', '') }));
      }
      return;
    }
    if (e.target.closest('#btnSyncLogout')) {
      try { await S.signOutUser(); } catch (err) { /* 忽略 */ }
      renderSyncDialog();
      renderSettings();
      toast(L('signedOut'));
      return;
    }
    const ap = e.target.closest('[data-approve]');
    if (ap) {
      try {
        await S.approve(ap.dataset.approve);
        toast(L('approvedToast', { email: ap.dataset.approve }));
        renderSyncDialog();
      } catch (err) { toast(L('loginFail', { e: err.message })); }
      return;
    }
    const rj = e.target.closest('[data-reject]');
    if (rj) {
      try { await S.reject(rj.dataset.reject); toast(L('rejectedToast')); renderSyncDialog(); }
      catch (err) { toast(L('loginFail', { e: err.message })); }
      return;
    }
    if (e.target.closest('#btnSyncCreate')) {
      try {
        toast(L('creating'));
        await S.create();
        renderSyncDialog();
        renderSettings();
        toast(L('bookCreated'));
      } catch (err) {
        syncNotice(String(err.code || '').includes('permission-denied') ? L('createNotAllowed') : L('createFail', { e: err.message }));
      }
      return;
    }
    if (e.target.closest('#btnSyncJoin')) {
      const code = $('#inpSyncCode')?.value || '';
      if (!code.trim()) { syncNotice(L('enterCode')); return; }
      try {
        toast(L('connecting'));
        const res = await S.join(code);
        renderSyncDialog();
        renderSettings();
        renderCurrentView();
        if (!res || !res.pending) toast(L('bookJoined'));
      } catch (err) {
        syncNotice(err.code === 'room-not-found' ? L('roomNotFound') : L('joinFail', { e: err.message }));
      }
      return;
    }
    if (e.target.closest('#btnSyncCancelReq')) {
      await S.cancelJoin();
      renderSyncDialog();
      renderSettings();
      toast(L('reqCancelled'));
      return;
    }
    const bk = e.target.closest('[data-block]');
    if (bk) {
      try { await S.block(bk.dataset.block); toast(L('blockedToast', { email: bk.dataset.block })); renderSyncDialog(); }
      catch (err) { toast(L('loginFail', { e: err.message })); }
      return;
    }
    if (e.target.closest('#btnSyncOff')) {
      S.disconnect();
      renderSyncDialog();
      renderSettings();
      toast(L('syncStopped'));
    }
  });

  // 類別管理
  $('#btnCatClose').addEventListener('click', () => { catEditMode = false; $('#catPage').hidden = true; lockScroll(); });
  $('#btnCatEditMode').addEventListener('click', () => { catEditMode = !catEditMode; renderCatTiles(); });
  $('#segCatType').addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    catPageType = b.dataset.type;
    renderCatTiles();
  });
  $('#catTiles').addEventListener('click', (e) => {
    if (Date.now() < cdSuppressUntil) return; // 拖曳剛結束，不觸發點擊
    const minus = e.target.closest('.cat-minus');
    if (minus) { openCatDelConfirm(minus.dataset.del); return; }
    if (catEditMode) return; // 編輯模式下點磚不動作
    const tile = e.target.closest('.cat-tile'); if (!tile) return;
    openCatEdit(tile.dataset.cat);
  });
  bindCatDrag();
  $('#btnCatSave').addEventListener('click', saveCatEdit);
  $('#btnCatDelCancel').addEventListener('click', () => $('#dlgCatDel').close());
  $('#btnCatDelOk').addEventListener('click', () => {
    const id = $('#dlgCatDel').dataset.id;
    $('#dlgCatDel').close();
    deleteCat(id);
  });
}

/* ---------- 啟動 ---------- */
bind();
applyLang();
switchView('books');

// 同步狀態改變（登入/驗證/獲准/新申請）時刷新開著的同步彈窗
window.onSyncChanged = () => { if ($('#dlgSync').open) renderSyncDialog(); };

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.update().catch(() => {});
    // 每次回到前景都主動檢查更新
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch(() => {});
  // 新版 service worker 接手時自動重新載入，讓更新在重開一次後即生效
  let swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swReloaded || !navigator.serviceWorker.controller) return;
    swReloaded = true;
    location.reload();
  });
}
