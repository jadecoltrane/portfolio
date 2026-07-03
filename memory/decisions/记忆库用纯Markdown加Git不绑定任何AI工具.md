---
type: decision
created: 2026-07-03
last-verified: 2026-07-03
---

# 为什么

记忆系统的真身是本 git 仓库里的 `memory/` 文件夹——纯 Markdown、无 MCP、无私有格式。
Claude Code 和 Gemini CLI 通过各自的 CLAUDE.md / GEMINI.md 指向同一份 AGENTS.md 规则,共用同一个记忆库。
Obsidian 只是查看器(免费得到双链图谱),iCloud 只负责用户自己设备之间的同步,GitHub 是 AI 和用户之间唯一的桥梁。

# 何时失效

如果将来某个 AI 工具无法读取仓库内约定文件,需要为它单独适配。

相关:[[insights/AI自写自读的记忆回路需要人工否决权]]、[[pitfalls/git仓库放iCloud目录可能因大量小文件同步冲突]]
