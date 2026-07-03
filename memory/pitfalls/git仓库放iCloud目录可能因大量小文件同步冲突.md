---
type: pitfall
created: 2026-07-03
last-verified: 2026-07-03
---

# 症状

git 仓库 clone 进 iCloud 云盘目录(如 Obsidian 的 iCloud vault)后,操作变慢、偶发文件冲突副本。

# 原因

`.git` 目录内含大量小文件,iCloud 同步机制对此不友好,可能与 git 写入竞争。

# 解法

小仓库通常没事,可先直接用;出问题时改为:仓库放本地普通目录,手机端用 Working Copy 挂给 Obsidian 移动版,或使用 Obsidian Sync。

相关:[[decisions/记忆库用纯Markdown加Git不绑定任何AI工具]]
