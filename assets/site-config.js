// FMW Next site settings. Safe to edit; no rebuild needed.
window.FMW_SITE = {
  name: "Lakhshit",
  // Slack: paste your member ID (Slack > your profile > More (⋮) > Copy member ID), e.g. "U0123ABCD" or "W0123ABCD".
  slackMemberId: "",
  // Slack: your workspace address as shown in the browser, e.g. "https://yourco.slack.com"
  // or, for an Enterprise org, "https://yourorg.enterprise.slack.com".
  slackWorkspaceUrl: "",
  // Optional: workspace (team) ID starting with T, e.g. "T0123ABCD". Lets the Slack app open the chat directly.
  slackTeamId: ""
};

// Every element with data-slack opens a Slack chat with you.
(function () {
  function links() {
    var c = window.FMW_SITE, id = (c.slackMemberId || "").trim(), ws = (c.slackWorkspaceUrl || "").trim().replace(/\/+$/, "");
    var web = "https://slack.com/signin";
    if (ws && id) web = ws + (/enterprise\.slack\.com/i.test(ws) ? "/user/@" + id : "/team/" + id);
    var app = (c.slackTeamId && id) ? "slack://user?team=" + encodeURIComponent(c.slackTeamId) + "&id=" + encodeURIComponent(id) : null;
    return { web: web, app: app };
  }
  function openSlack() {
    var l = links();
    if (!l.app) { window.open(l.web, "_blank", "noopener"); return; }
    var left = false;
    function gone() { left = true; }
    window.addEventListener("blur", gone, { once: true });
    document.addEventListener("visibilitychange", gone, { once: true });
    window.location.href = l.app;
    setTimeout(function () { if (!left) window.open(l.web, "_blank", "noopener"); }, 1400);
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-slack]");
    if (!el) return;
    e.preventDefault();
    openSlack();
  });
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-slack]").forEach(function (el) {
      if (el.tagName === "A") el.setAttribute("href", links().web);
      el.setAttribute("title", "Opens Slack");
    });
  });
})();
