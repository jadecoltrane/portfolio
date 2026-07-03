# AGENTS.md — AI 协作与记忆库规则

本仓库由多个 AI 工具(Claude Code、Gemini CLI 等)共用,所有 AI 遵循这同一套规则。

## 记忆库(memory/)

`memory/` 是本仓库的长期记忆库:纯 Markdown + Obsidian 双链,不绑定任何工具。
文件名就是一句话结论,正文是简短的"为什么"。

### 开工时(必做)

1. 读 `memory/index.md`(索引,每条记忆一行)
2. 只按需打开与当前任务相关的记忆文件,不要全量阅读

### 收工时(必做)

判断本次会话是否产生了值得沉淀的记忆。满足其一才写:

| 情况 | 写入位置 |
|---|---|
| 做出了一个决定或约定 | `memory/decisions/` |
| 踩了一个坑,且找到了原因和解法 | `memory/pitfalls/` |
| 形成了一个可复用的判断 | `memory/insights/`(必须标 confidence) |
| 发现了一个重要但尚未解决的问题 | `memory/questions/` |

**不要写**:代码里 grep 就能查到的事实、一次性任务细节、没有复用价值的流水账。
写完后运行 `python3 scripts/build_memory_index.py` 重新生成索引,和记忆一起提交。

### 记忆文件格式

- **文件名 = 一句话结论**,必须不打开文件就能看懂(索引里只展示文件名)
- **正文** = 简短的"为什么" + 证据/来源 + 何时会失效
- 用 Obsidian 双链 `[[目录/另一条记忆的文件名]]` 关联相关记忆
- frontmatter:

```yaml
---
type: decision | pitfall | insight | question
created: YYYY-MM-DD
last-verified: YYYY-MM-DD
confidence: high | medium | low   # insight 必填,其余可省
supersedes: 被本条取代的记忆文件名  # 可选
---
```

### 三条铁律(反信息茧房)

1. **现实优先**:记忆与代码或实测结果冲突时,以现实为准,并当场修正该记忆、更新 `last-verified`。记忆是缓存,缓存必须能失效。
2. **记忆是先验,不是真理**:依赖 `insights/` 里的判断时带着它的 confidence;low confidence 的记忆在依赖前先验证。
3. **人类有否决权**:用户说某条记忆不对,直接删除或修正,不要辩护。

## Memory GC(垃圾回收,约每周一次)

1. 合并内容重复的记忆:新文件用 `supersedes` 标记,删除旧文件
2. `last-verified` 超过 60 天的 insight,confidence 降一级;已经是 low 的,移入 `questions/` 或删除
3. 没有任何双链指向、也想不出使用场景的记忆,评估后删除
4. 重新生成索引并提交;向用户输出一句话摘要(动了什么、为什么)
5. 无事可做则保持沉默,不打扰用户
