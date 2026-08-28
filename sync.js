/* ================= 智賬 — 雲端即時同步（Firebase Firestore + Auth 白名單） =================
   安全模型：
   - Firestore 規則要求「已登入 + email 已驗證 + （是建立者 或 在 /allow 白名單中）」
   - 建立者身分寫死在規則裡（不出現在公開程式碼中）
   - 新成員登入後自動送出加入申請（/requests），建立者在 App 內點「同意」寫入 /allow
   陌生人拿到網址與程式碼也無法讀寫資料庫。
   此檔為 ES module；離線或未設定 FIREBASE_CONFIG 時載入失敗不影響主程式。 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch, getDoc, getDocs,
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
let roomId = null;
let unsubs = [];
let started = false;

let allowed = false;
let owner = false;
let aclReady = false;
let requests = [];
let reqUnsub = null;
let allowUnsub = null;

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
        if (i >= 0) {
          if (JSON.stringify(window.db.txs[i]) !== JSON.stringify(t)) { window.db.txs[i] = t; changed = true; }
        } else { window.db.txs.push(t); changed = true; }
      }
    });
    if (changed) { window.save(); window.renderCurrentView(); }
  }, (err) => console.warn('sync txs listener:', err)));

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
  }, (err) => console.warn('sync config listener:', err)));
}

async function connect(id, { upload = false, withConfig = true } = {}) {
  ensureInit();
  if (!user) throw new Error('請先登入');
  if (!allowed) throw new Error('尚未獲得授權');
  roomId = id;
  if (upload) await uploadLocal(id, { withConfig });
  listen(id);
  started = true;
  setState({ roomId: id });
}

function stopListening() {
  unsubs.forEach((u) => u());
  unsubs = [];
  started = false;
  roomId = null;
}

function stopAclWatch() {
  if (reqUnsub) { reqUnsub(); reqUnsub = null; }
  if (allowUnsub) { allowUnsub(); allowUnsub = null; }
}

function watchRequests() {
  if (reqUnsub) return;
  reqUnsub = onSnapshot(collection(fs, 'requests'), (snap) => {
    requests = snap.docs.map((d) => d.data()).filter((r) => r && r.email);
    notify();
  }, (err) => console.warn('sync requests listener:', err));
}

function watchOwnAllow() {
  if (allowUnsub || !user) return;
  allowUnsub = onSnapshot(doc(fs, 'allow', user.email), (snap) => {
    if (snap.exists() && !allowed) {
      allowed = true;
      const st = getState();
      if (st.roomId && !started) connect(st.roomId).then(() => window.renderCurrentView?.()).catch((e) => console.warn(e));
      notify();
    }
  }, (err) => console.warn('sync allow listener:', err));
}

async function refreshAccess() {
  aclReady = false;
  allowed = false;
  owner = false;
  requests = [];
  stopAclWatch();
  if (!user) { aclReady = true; notify(); return; }
  try { await user.reload(); } catch (e) { /* 離線忽略 */ }
  user = auth.currentUser;
  if (!user || !user.emailVerified) { aclReady = true; notify(); return; }
  try { await user.getIdToken(true); } catch (e) { /* 忽略 */ }

  // 建立者可讀 /requests 清單；非建立者會被規則擋下
  try {
    await getDocs(collection(fs, 'requests'));
    owner = true;
  } catch (e) { owner = false; }

  if (owner) {
    allowed = true;
    watchRequests();
  } else {
    try {
      const s = await getDoc(doc(fs, 'allow', user.email));
      allowed = s.exists();
    } catch (e) { allowed = false; }
    if (!allowed) {
      // 自動送出加入申請並監聽是否被同意
      setDoc(doc(fs, 'requests', user.email), { email: user.email, at: Date.now() }).catch(() => {});
      watchOwnAllow();
    }
  }
  aclReady = true;
  if (allowed) {
    const st = getState();
    if (st.roomId && !started) {
      try { await connect(st.roomId); window.renderCurrentView?.(); } catch (e) { console.warn('sync reconnect:', e); }
    }
  }
  notify();
}

window.Sync = {
  get configured() { return !!cfg; },
  get enabled() { return started; },
  get signedIn() { return !!user; },
  get emailVerified() { return !!user && user.emailVerified; },
  get userEmail() { return user ? user.email : null; },
  get allowed() { return allowed; },
  get isOwner() { return owner; },
  get aclReady() { return aclReady; },
  get requests() { return requests; },
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
  async recheck() { await refreshAccess(); },
  async signOutUser() {
    stopListening();
    stopAclWatch();
    if (auth) await signOut(auth);
  },
  async approve(email) {
    await setDoc(doc(fs, 'allow', email), { email, at: Date.now() });
    await deleteDoc(doc(fs, 'requests', email)).catch(() => {});
  },
  async reject(email) {
    await deleteDoc(doc(fs, 'requests', email));
  },
  async create() {
    const id = genCode(8);
    await connect(id, { upload: true });
    return id;
  },
  async join(code) {
    const id = String(code).trim().toUpperCase();
    if (id.length < 6) throw new Error('配對碼格式不正確');
    await connect(id, { upload: true, withConfig: false });
    return id;
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
    stopListening();
    setState({});
  },
};

if (cfg) {
  try {
    ensureInit();
    onAuthStateChanged(auth, (u) => {
      user = u;
      refreshAccess();
    });
  } catch (e) { console.warn('sync init:', e); }
}
