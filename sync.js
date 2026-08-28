/* ================= 智賬 — 雲端即時同步（多帳本模式） =================
   模型：每本共享帳本（room）有自己的建立者（owner）與成員名單（members）。
   - 任何已驗證的登入者都可建立自己的帳本，成為該帳本的建立者
   - 憑配對碼申請加入某本帳，由該帳本的建立者在 App 內同意／拒絕／封鎖
   - Firestore 規則以帳本根文件的 owner / members / blocked 判斷權限
   此檔為 ES module；離線或未設定 FIREBASE_CONFIG 時載入失敗不影響主程式。 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch, getDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, sendEmailVerification,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const cfg = window.FIREBASE_CONFIG;
const LSK = 'zhizhang.sync';

let fs = null;
let auth = null;
let user = null;

let roomId = null;        // 已連線的帳本
let roomOwner = null;     // 該帳本建立者 email
let started = false;
let unsubs = [];          // txs / config 監聽
let reqUnsub = null;      // （建立者）加入申請監聽
let requests = [];

let pendingRoomId = null; // 申請中、等待同意的帳本
let pendingUnsub = null;

const getState = () => { try { return JSON.parse(localStorage.getItem(LSK)) || {}; } catch (e) { return {}; } };
const setState = (s) => localStorage.setItem(LSK, JSON.stringify(s));

function genCode(len = 8) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => alphabet[b % alphabet.length]).join('');
}

function ensureInit() {
  if (!cfg) throw new Error('尚未設定 Firebase');
  if (!fs) {
    const app = initializeApp(cfg);
    fs = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    auth = getAuth(app);
  }
}

function notify() {
  window.renderSettings?.();
  window.onSyncChanged?.();
}

function err(code, msg) {
  const e = new Error(msg);
  e.code = code;
  return e;
}

/* ---------- 資料上傳 / 監聽 ---------- */
async function uploadLocal(id, { withConfig = true } = {}) {
  const txs = window.db.txs;
  for (let i = 0; i < txs.length; i += 400) {
    const batch = writeBatch(fs);
    txs.slice(i, i + 400).forEach((t) => batch.set(doc(fs, 'rooms', id, 'txs', t.id), t));
    await batch.commit();
  }
  if (withConfig) {
    await setDoc(doc(fs, 'rooms', id, 'meta', 'config'), {
      members: window.db.members,
      categories: window.db.categories,
      updatedAt: Date.now(),
    }, { merge: true });
  }
}

function listen(id) {
  unsubs.push(onSnapshot(collection(fs, 'rooms', id, 'txs'), (snap) => {
    let changed = false;
    snap.docChanges().forEach((ch) => {
      if (ch.type === 'removed') {
        const next = window.db.txs.filter((x) => x.id !== ch.doc.id);
        if (next.length !== window.db.txs.length) { window.db.txs = next; changed = true; }
      } else {
        const t = ch.doc.data();
        const i = window.db.txs.findIndex((x) => x.id === ch.doc.id);
        if (i < 0) { window.db.txs.push(t); changed = true; }
        else if (JSON.stringify(window.db.txs[i]) !== JSON.stringify(t)) {
          // 衝突解法：比較更新時間，較新的版本獲勝
          const local = window.db.txs[i];
          const tIn = t.updatedAt || t.createdAt || 0;
          const tLoc = local.updatedAt || local.createdAt || 0;
          if (tIn >= tLoc) { window.db.txs[i] = t; changed = true; }
          else setDoc(doc(fs, 'rooms', id, 'txs', local.id), local).catch(() => {});
        }
      }
    });
    if (changed) { window.save(); window.renderCurrentView(); }
  }, (e) => console.warn('sync txs listener:', e)));

  unsubs.push(onSnapshot(doc(fs, 'rooms', id, 'meta', 'config'), (snap) => {
    const d = snap.data();
    if (!d || !d.members) return;
    const cur = JSON.stringify({ m: window.db.members, c: window.db.categories });
    const inc = JSON.stringify({ m: d.members, c: d.categories });
    if (cur !== inc) {
      window.db.members = d.members;
      if (d.categories) window.db.categories = d.categories;
      window.save();
      window.renderCurrentView();
    }
  }, (e) => console.warn('sync config listener:', e)));
}

function watchRequests(id) {
  if (reqUnsub) return;
  reqUnsub = onSnapshot(collection(fs, 'rooms', id, 'requests'), (snap) => {
    requests = snap.docs.map((d) => d.data()).filter((r) => r && r.email);
    notify();
  }, (e) => console.warn('sync requests listener:', e));
}

function stopRoom() {
  unsubs.forEach((u) => u());
  unsubs = [];
  if (reqUnsub) { reqUnsub(); reqUnsub = null; }
  requests = [];
  started = false;
  roomId = null;
  roomOwner = null;
}

function stopPending() {
  if (pendingUnsub) { pendingUnsub(); pendingUnsub = null; }
  pendingRoomId = null;
}

/* ---------- 開啟帳本 ---------- */
async function openRoom(id, { upload = false, withConfig = true, claimLegacy = false } = {}) {
  ensureInit();
  if (!user) throw err('not-signed-in', '請先登入');
  const email = user.email;
  const rootRef = doc(fs, 'rooms', id);
  const rd = await getDoc(rootRef);

  let data;
  if (!rd.exists()) {
    if (!claimLegacy) throw err('room-not-found', '配對碼不存在');
    // 舊版帳本（無根文件）→ 自動升級，重連者成為建立者
    data = { owner: email, members: { [email]: true }, createdAt: Date.now() };
    await setDoc(rootRef, data, { merge: true });
  } else {
    data = rd.data();
  }

  if (!data.members || data.members[email] !== true) {
    // 不是成員 → 轉為申請流程
    await setDoc(doc(fs, 'rooms', id, 'requests', email), { email, at: Date.now() });
    startPendingWatch(id);
    setState({ pendingRoomId: id });
    notify();
    return { pending: true };
  }

  roomId = id;
  roomOwner = data.owner || email;
  if (upload) await uploadLocal(id, { withConfig });
  listen(id);
  if (roomOwner === email) watchRequests(id);
  started = true;
  setState({ roomId: id });
  notify();
  return { pending: false };
}

function startPendingWatch(id) {
  stopPending();
  pendingRoomId = id;
  pendingUnsub = onSnapshot(doc(fs, 'rooms', id), (snap) => {
    const d = snap.data();
    if (d && user && d.members && d.members[user.email] === true) {
      stopPending();
      openRoom(id, { upload: true, withConfig: false })
        .then(() => window.renderCurrentView?.())
        .catch((e) => console.warn('sync join finalize:', e));
    }
  }, (e) => console.warn('sync pending listener:', e));
}

/* ---------- 登入狀態 ---------- */
async function onAuth(u) {
  user = u;
  stopRoom();
  stopPending();
  if (!user) { notify(); return; }
  try { await user.reload(); } catch (e) { /* 離線忽略 */ }
  user = auth.currentUser;
  if (!user) { notify(); return; }
  try { await user.getIdToken(true); } catch (e) { /* 忽略 */ }

  const st = getState();
  if (st.roomId) {
    try { await openRoom(st.roomId, { claimLegacy: true }); }
    catch (e) { console.warn('sync reconnect:', e); }
  } else if (st.pendingRoomId) {
    try {
      await setDoc(doc(fs, 'rooms', st.pendingRoomId, 'requests', user.email), { email: user.email, at: Date.now() });
      startPendingWatch(st.pendingRoomId);
    } catch (e) { console.warn('sync pending resume:', e); }
  }
  notify();
}

/* ---------- 對外 API ---------- */
window.Sync = {
  get configured() { return !!cfg; },
  get enabled() { return started; },
  get signedIn() { return !!user; },
  get emailVerified() { return !!user && user.emailVerified; },
  get userEmail() { return user ? user.email : null; },
  get isOwner() { return started && !!user && roomOwner === user.email; },
  get requests() { return requests; },
  get pending() { return !!pendingRoomId; },
  get pendingCode() { return pendingRoomId; },
  get roomId() { return roomId; },

  async signIn(email, pw) {
    ensureInit();
    await signInWithEmailAndPassword(auth, email, pw);
  },
  async signUp(email, pw) {
    ensureInit();
    await createUserWithEmailAndPassword(auth, email, pw);
    try { await sendEmailVerification(auth.currentUser); } catch (e) { console.warn(e); }
  },
  async resendVerification() {
    if (auth?.currentUser) await sendEmailVerification(auth.currentUser);
  },
  async recheck() { await onAuth(auth?.currentUser || null); },
  async signOutUser() {
    stopRoom();
    stopPending();
    if (auth) await signOut(auth);
  },

  async create() {
    ensureInit();
    if (!user) throw err('not-signed-in', '請先登入');
    const id = genCode(8);
    await setDoc(doc(fs, 'rooms', id), {
      owner: user.email,
      members: { [user.email]: true },
      createdAt: Date.now(),
    });
    await openRoom(id, { upload: true });
    return id;
  },
  async join(code) {
    const id = String(code).trim().toUpperCase();
    if (id.length < 6) throw err('bad-code', '配對碼格式不正確');
    return openRoom(id, { upload: true, withConfig: false, claimLegacy: false });
  },
  async cancelJoin() {
    const id = pendingRoomId;
    stopPending();
    setState({});
    if (id && user) await deleteDoc(doc(fs, 'rooms', id, 'requests', user.email)).catch(() => {});
    notify();
  },

  /* 建立者操作 */
  async approve(email) {
    await setDoc(doc(fs, 'rooms', roomId), { members: { [email]: true } }, { merge: true });
    await deleteDoc(doc(fs, 'rooms', roomId, 'requests', email)).catch(() => {});
  },
  async reject(email) {
    await deleteDoc(doc(fs, 'rooms', roomId, 'requests', email));
  },
  async block(email) {
    await setDoc(doc(fs, 'rooms', roomId), { blocked: { [email]: true } }, { merge: true });
    await deleteDoc(doc(fs, 'rooms', roomId, 'requests', email)).catch(() => {});
  },

  upsertTx(t) {
    if (started) setDoc(doc(fs, 'rooms', roomId, 'txs', t.id), t).catch((e) => console.warn('sync upsert:', e));
  },
  deleteTx(id) {
    if (started) deleteDoc(doc(fs, 'rooms', roomId, 'txs', id)).catch((e) => console.warn('sync delete:', e));
  },
  saveConfig() {
    if (started) setDoc(doc(fs, 'rooms', roomId, 'meta', 'config'), {
      members: window.db.members,
      categories: window.db.categories,
      updatedAt: Date.now(),
    }, { merge: true }).catch((e) => console.warn('sync config:', e));
  },
  disconnect() {
    stopRoom();
    stopPending();
    setState({});
    notify();
  },
};

if (cfg) {
  try {
    ensureInit();
    onAuthStateChanged(auth, (u) => { onAuth(u); });
  } catch (e) { console.warn('sync init:', e); }
}
