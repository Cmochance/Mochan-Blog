const modules = [];

function registerModules(app, context = {}) {
  modules.forEach((mod) => {
    if (mod && typeof mod.register === 'function') {
      mod.register(app, context);
    }
  });
}

module.exports = { registerModules };
