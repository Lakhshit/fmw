// Interactive hero map: tooltips on each part, and a short AI incident story that repeats.
(function () {
  var svg = document.getElementById("heroArt");
  if (!svg) return;
  var wrap = svg.parentNode;
  wrap.classList.add("herowrap");

  // ---- tooltips ----
  var tip = document.createElement("div");
  tip.className = "htip";
  wrap.appendChild(tip);
  function place(el) {
    var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    var x = r.left - w.left + r.width / 2, y = r.top - w.top;
    tip.style.left = Math.max(0, Math.min(w.width - tip.offsetWidth, x - tip.offsetWidth / 2)) + "px";
    tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + "px";
  }
  svg.querySelectorAll("a.hot").forEach(function (a) {
    function show() { tip.innerHTML = a.getAttribute("data-tip") + "<small>Click to open</small>"; tip.classList.add("on"); place(a); }
    function hide() { tip.classList.remove("on"); }
    a.addEventListener("mouseenter", show);
    a.addEventListener("focus", show);
    a.addEventListener("mouseleave", hide);
    a.addEventListener("blur", hide);
  });
  var hint = document.createElement("div");
  hint.className = "hhint";
  hint.textContent = "Tip: click any part of the map";
  wrap.appendChild(hint);

  // ---- AI incident story ----
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var t1 = document.getElementById("bT1"), t2 = document.getElementById("bT2"), ic = document.getElementById("bIcon");
  var STORIES = [
    ["Heap leak detected on Server 2", "AIOps: rolling restart suggested", "Resolved: heap back to normal"],
    ["JDBC pool exhausted on Server 2", "AIOps: slow SQL found, pool tuned", "Resolved: response time normal"],
    ["Stuck threads on Server 2", "AIOps: thread dumps captured", "Resolved: blocking call fixed"]
  ];
  var i = 0;
  function setState(s) { svg.classList.remove("s-warn", "s-alert", "s-fixed"); if (s) svg.classList.add(s); }
  function run() {
    if (document.hidden) { setTimeout(run, 2000); return; }
    var st = STORIES[i++ % STORIES.length];
    t1.textContent = st[0]; t2.textContent = st[1]; ic.textContent = "!";
    setState("s-warn");
    setTimeout(function () { setState("s-alert"); }, 1300);
    setTimeout(function () { t1.textContent = st[2]; t2.textContent = "Handled automatically by AIOps"; ic.textContent = "✓"; setState("s-fixed"); }, 5200);
    setTimeout(function () { setState(""); }, 7600);
    setTimeout(run, 13000);
  }
  if (reduce) {
    if (svg.pauseAnimations) svg.pauseAnimations();
  } else {
    setTimeout(run, 2500);
  }
})();
