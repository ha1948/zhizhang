/* ================= 智賬 — 雲端即時同步（Firebase Firestore） =================
   以「共享帳本配對碼」為單位同步：兩支手機輸入同一組配對碼即即時互通。
   此檔為 ES module；離線或未設定 FIREBASE_CONFIG 時載入失敗不影響主程式。 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const cfg = window.FIREBASE_CONFIG;
const LSK = 'zhizhang.sync';

let fs = null;
let roomId = null;
let unsubs = [];
let started = false;

const getState = () => { try { return JSON.parse(localStorage.getItem(LSK)) || {}; } catch (e) { return {}; } };
const setState = (s) => localStorage.setItem(LSK, JSON.stringify(s));

function genCode(len = 8) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 去除易混淆字元
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
  }
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
  roomId = id;
  if (upload) await uploadLocal(id, { withConfig });
  listen(id);
  started = true;
  setState({ roomId: id });
}

window.Sync = {
  get configured() { return !!cfg; },
  get enabled() { return started; },
  get roomId() { return roomId; },

  async create() {
    const id = genCode(8);
    await connect(id, { upload: true });
    return id;
  },
  async join(code) {
    const id = String(code).trim().toUpperCase();
    if (id.length < 6) throw new Error('配對碼格式不正確');
    // 上傳本機既有記錄合併，但成員/類別設定以雲端（建立方）為準
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
    unsubs.forEach((u) => u());
    unsubs = [];
    started = false;
    roomId = null;
    setState({});
  },
};

// 之前配對過 → 自動重連
const st = getState();
if (cfg && st.roomId) {
  connect(st.roomId).then(() => {
    if (window.renderCurrentView) window.renderCurrentView();
  }).catch((e) => console.warn('sync reconnect:', e));
}
