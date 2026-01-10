# Modules Slot

该目录用于预留 MCP 模块能力。

- 每个模块导出 `register(app, context)` 函数。
- 在 `backend/src/modules/index.js` 中统一注册。
- 保持模块独立，避免耦合主应用。
