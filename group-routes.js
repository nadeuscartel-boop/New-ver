"use strict";
// Dashboard routes for Lock GC name + Set ALL nicknames (+ more tools).
// Hooks into server.js with ONE line:  require("./group-routes")(app, () => S.api, () => S.uid);
// Must be called AFTER the app.use("/api", ...) password middleware so these routes are protected too.

const path = require("path");
const groupControls = require("./group-controls");

module.exports = function registerGroupRoutes(app, getApi, getUid) {
  const run = (fn) => async (q, r) => {
    try { r.json(Object.assign({ ok: true }, await fn(q))); }
    catch (e) { r.status(400).json({ ok: false, error: (e && e.message) || String(e) }); }
  };
  const act = (action, params) => groupControls.dashboardAction(getApi(), getUid(), action, params || {});

  app.get("/groups", (q, r) => r.sendFile(path.join(__dirname, "groups.html")));

  app.get("/api/groups", run(async () => {
    if (!getApi()) throw new Error("Bot is not connected");
    return { groups: await groupControls.listGroups(getApi()) };
  }));
  app.get("/api/group-active", run((q) => act("active", { feature: String(q.query.feature || "") })));
  app.post("/api/group/:action", run((q) => act(q.params.action, q.body)));
};
