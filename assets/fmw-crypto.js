// FMW Hub: unlocks the encrypted briefing in the browser.
// The briefing and files are stored encrypted (AES-256-GCM). The key is unlocked
// with the username and password (PBKDF2-SHA256), so nothing readable is published.
window.FMW = (function () {
  var enc = new TextEncoder();
  var dec = new TextDecoder();
  var STORE = "fmw_keys";

  function b64d(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function sha256hex(text) {
    var h = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text)));
    return Array.prototype.map.call(h, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }
  async function derive(pass, salt, iter) {
    var base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64d(salt), iterations: iter, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  }
  async function aesDecrypt(key, iv, ct) {
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64d(iv) }, key, b64d(ct));
  }

  function save(obj, hours) {
    obj.exp = Date.now() + hours * 3600 * 1000;
    try { localStorage.setItem(STORE, JSON.stringify(obj)); } catch (e) {}
    try { sessionStorage.setItem(STORE, JSON.stringify(obj)); } catch (e) {}
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) {}
    if (!raw) { try { raw = sessionStorage.getItem(STORE); } catch (e) {} }
    try {
      var o = JSON.parse(raw || "null");
      if (!o || !o.k || Date.now() > o.exp) { clear(); return null; }
      return o;
    } catch (e) { return null; }
  }
  function clear() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    try { sessionStorage.removeItem(STORE); } catch (e) {}
  }

  async function login(user, pass) {
    var kf = await (await fetch("/data/keys.json", { cache: "no-store" })).json();
    var id = await sha256hex("fmw:" + String(user).trim().toLowerCase());
    var entry = kf.users[id];
    var key = await derive(pass, entry ? entry.salt : kf.dummySalt, kf.iter);
    if (!entry) return null;
    try {
      var obj = JSON.parse(dec.decode(await aesDecrypt(key, entry.iv, entry.ct)));
      save(obj, kf.hours || 12);
      return obj;
    } catch (e) {
      return null;
    }
  }

  async function decryptFile(url, keyB64) {
    var j = await (await fetch(url, { cache: "no-store" })).json();
    var key = await crypto.subtle.importKey("raw", b64d(keyB64), { name: "AES-GCM" }, false, ["decrypt"]);
    return aesDecrypt(key, j.iv, j.ct);
  }

  return { login: login, load: load, clear: clear, decryptFile: decryptFile, text: function (buf) { return dec.decode(buf); } };
})();
