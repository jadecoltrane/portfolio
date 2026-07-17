# Portfolio Case Content Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This editorial task is executed inline because repository instructions do not request subagent delegation.

**Goal:** Revise the four portfolio case studies so that the page budget is feasible, claims are evidence-led, AI safety logic is technically credible, and public-facing wording is consistent and non-sensitive.

**Architecture:** Treat `README.md` as the portfolio-level source of truth and each case directory as a self-contained narrative unit. Preserve unknown project facts as explicit verification prompts rather than inventing outcomes; remove internal drafting history from public-facing case copy.

**Tech Stack:** Markdown, Git diff, `rg` content checks.

---

### Task 1: Reframe the LLM cockpit Agent case

**Files:**
- Modify: `cases/02-LLM座舱Agent/README.md`
- Modify: `cases/02-LLM座舱Agent/正文草稿.md`
- Modify: `cases/02-LLM座舱Agent/demo方案.md`
- Modify: `cases/02-LLM座舱Agent/设计原则自检表.md`

- [x] Replace the five disconnected propositions with a safe-delegation loop: understand, propose, authorize, execute, recover.
- [x] Add a deterministic policy layer that combines action risk, vehicle state, user authorization, and intent ambiguity.
- [x] Treat confidence controls as demo test injection rather than production confidence truth.
- [x] Replace the small-sample “failure distribution” with an evidence table.
- [x] Add “park or reject” as a possible authorization outcome and correct the NHTSA wording.
- [x] Remove cancelled-case provenance from public-facing copy and reduce the target length to 16–18 pages.

**Verification:** Run `rg -n "20-25|失败类型分布|模型自报置信|案例③遗产|三级授权" cases/02-LLM座舱Agent` and expect no obsolete public-facing wording.

### Task 2: Tighten the production control-center case

**Files:**
- Modify: `cases/01-车企项目重包装/README.md`
- Modify: `cases/01-车企项目重包装/正文草稿.md`
- Modify: `cases/01-车企项目重包装/竞品拆解.md`
- Modify: `cases/01-车企项目重包装/素材清单.md`

- [x] Reduce the target length to 10–12 pages and compress competitor review and LLM extension.
- [x] Label the expanded competitor analysis as retrospective validation, not a historical design input.
- [x] Reframe results around verifiable delivery, rule reuse, and later feature intake.
- [x] Remove the obsolete three-case/case-③ narrative.
- [x] Keep all unresolved factual outcomes clearly marked for user verification.

**Verification:** Run `rg -n "15-20|三案例|案例③|竞品拆解.*深化" cases/01-车企项目重包装` and review every remaining match.

### Task 3: Strengthen the GAS adaptation case

**Files:**
- Modify: `cases/04-GAS规范适配/README.md`
- Modify: `cases/04-GAS规范适配/正文草稿.md`

- [x] Reduce the target length to 4–5 pages.
- [x] Separate AAOS platform terminology from GAS service-suite terminology.
- [x] Add approved-environment, access, retention, and human-review boundaries without inventing tool details.
- [x] Replace “should items basically retained” with documented, item-by-item assessment.
- [x] Add AI error categories and human-review criteria while preserving confidential specification content.

**Verification:** Run `rg -n "5-8|should 项基本保留|AAOS \\+ GAS|分级不是偷懒" cases/04-GAS规范适配` and expect no obsolete wording.

### Task 4: Correct the holiday easter-egg case

**Files:**
- Modify: `cases/05-车机节日彩蛋/README.md`
- Modify: `cases/05-车机节日彩蛋/正文.md`
- Modify: `cases/05-车机节日彩蛋/配图清单.md`

- [x] Use one anonymized brand label throughout public-facing copy.
- [x] Replace internal layer numbers with relative z-order.
- [x] Replace unsupported “mis-touch rate” and market-wide claims with scoped risk language.
- [x] Define event arbitration as continue, weaken, pause, or terminate.
- [x] Make cross-desktop behavior unambiguous and add stage-appropriate delivery results.
- [x] Reduce the PDF target to 4–5 pages.

**Verification:** Run `rg -n "Smart 车机|第 18 层|第 19 层|误触率|国内品牌均|当前桌面自然结束" cases/05-车机节日彩蛋` and expect no obsolete wording.

### Task 5: Align the portfolio overview and validate

**Files:**
- Modify: `README.md`

- [x] Set a feasible 40–44-page allocation and provide AI-first and HMI-first export orders.
- [x] Replace the obsolete three-case narrative with a four-case capability chain.
- [x] Remove cancelled-case process history from the portfolio overview.
- [x] Review `git diff --check`, targeted `rg` scans, Markdown links, and `git diff --stat`.
- [x] Inspect the remote `origin/gh-pages` source and report which website pages require a later synchronized publication update without switching branches or overwriting unrelated history.

**Verification:** `git diff --check` must exit 0; all relative Markdown links must resolve; targeted obsolete-wording scans must return no unexplained matches.
