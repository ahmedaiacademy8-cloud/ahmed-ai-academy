# CHANGELOG
## 2026-10-17 — Phase 0/2 (non-breaking)
- Backup: `ahmed-ai-academy-ORIGINAL-backup.zip` (untouched original). Restore = unzip it over the project.
- Added `tools/build_pages.py`: generates `lessons/<slug>/index.html` (26 indexable static pages) and regenerates `sitemap.xml`. Run: `python3 tools/build_pages.py` after any lesson change.
- Added `data/roadmap/planned-topics.json`: topic skeleton only, no encyclopedia text, no fake videos.
- Modified: `sitemap.xml` (now lists lesson pages). No existing file/ID/route removed; `academy.html#lesson/...` unchanged.
- NOT done (needs your decisions): free-vs-PRO conflict, removing DEMO-1234, access-code protection, encyclopedia licensing.
- Not browser-tested: pages were generated and checked structurally only.
## 2026-10-17 — Phase 3 (non-breaking)
- Added `data/glossary.json` (20 terms, original wording, status draft) and generated `glossary/index.html`.
- Lesson pages now show clear placeholders: "الفيديو قريبًا" / review files. `tools/build_pages.py` and `sitemap.xml` updated (29 URLs).
- Still pending your decision: free-vs-PRO conflict, DEMO-1234 removal, access-code protection, encyclopedia licensing.
## 2026-10-17 — Facebook link + policy pages
- `index.html`: replaced the closed Facebook profile link (4 places) with the new profile.
- Added draft `privacy/`, `terms/`, `copyright/` pages describing actual current behavior (localStorage only, Google Fonts, no analytics found). Review with a legal professional. Added to sitemap.
- Footer links added in index.html (privacy, terms, copyright, glossary).
## 2026-10-17 — Verification pass (static checks only; no browser)
- All JSON files parse; all JS files pass `node --check`.
- Local href/src check: only `components/header.html` and `components/footer.html` have missing refs (`assets/images/logo.png`, `index.html`); these components are reference-only, not loaded by the site.
- Lessons: 26 of 26 are `published`; `courses.json` lists no locked/paid items, so no free lesson needed activation. Not tested in a browser.
- Facebook links: 4 in `index.html`, all `target=_blank rel=noopener`, point to the new profile.
- Added `tools/set_whatsapp.py OLD NEW` to change the WhatsApp number across the project (numbers currently appear in `index.html`, `js/router.js`, `js/access.js`).
- NOT verified: runtime behavior of search, quizzes, progress, bookmarks, copy buttons; mobile layout; console errors; link reachability (no network here).
## 2026-10-17 — Real browser smoke test (Playwright/Chromium, local server, offline)
- Loaded `/`, `/academy.html`, `#path/ai-fundamentals`, `#lesson/what-is-ai`, `/lessons/what-is-ai/`, `/glossary/`, `/privacy/` at 1280px and 390px: all render with an H1; no JavaScript errors. The only failed requests were Google Fonts (sandbox has no internet).
- Lesson route in the SPA renders the lesson text; the search page shows 2 inputs.
- BUG FIXED: homepage header/nav and footer columns were cut off on mobile (elements extended past the viewport). Added responsive rules at the end of `css/home.css`; re-measured at 360/390/768/900/1280px.
- BUG FIXED: skip-link was hidden with `right:-999px`, which could widen the page in RTL; now hidden above the viewport (`top:-120px`) and verified visible on keyboard focus.
- NOT tested: quizzes, progress, favorites, comments, certificates, copy buttons, real tap behavior on a phone, Facebook/WhatsApp destinations, fonts online.

## 2026-10-17 — Facebook link updated again
- `index.html`: all 4 Facebook links now use https://www.facebook.com/share/19s7jFEU2E/ (a share link; if Facebook stops it working, replace with the page's permanent address). Not opened in a browser (no internet in the build environment).
## 2026-10-17 — Conversion + free/paid alignment
- `data/plans.json`: all 26 current lessons are now listed as FREE (previously the 17 prompt-engineering lessons were listed as PRO-only although the site could not protect them). PRO now describes future paid courses/workshops, priced via WhatsApp. Verified the pricing page in the browser shows the new text.
- `index.html`: new section `#join` (3 honest steps: learn free → ask about paid courses via prefilled WhatsApp message → agree details), placed before pricing. States that a WhatsApp message is an information request, not enrollment or payment.
- `index.html` FAQ: corrected two misleading answers (certificate is an academy completion certificate, not officially accredited; there is no monthly subscription at present).
- `css/home.css`: styles for `#join`; fixed hero glow (::before, 700px) that made the page 545px wide on phones (`.hero{overflow-x:clip}`); verified page width equals viewport at 360/390/768/1280px.
- Browser-checked: homepage on mobile (screenshot reviewed), no JS errors, WhatsApp prefilled link present. NOT checked: actual WhatsApp/Facebook destinations (no internet).
- No new lessons were added in this step; new original lessons are still to be written.
## 2026-10-18 — New free path: "الذكاء الاصطناعي عمليًا: الأدوات والفرص" (4 original lessons)
- Lessons (all free, `status: published`): `what-can-you-do-with-ai`, `top-ai-tools`, `make-money-with-ai`, `ai-whats-new`. Written from scratch from general knowledge plus a web search for 2026 trends; no encyclopedia text. Definition of AI already exists in `what-is-ai` and is linked, not duplicated.
- Files: `data/lessons/ai-in-practice.json` (generated by `tools/add_ai_in_practice.py`), `data/courses.json` (new path entry), `js/data.js` and `js/router.js` (path wired in), `academy.html` (card + nav link), `data/plans.json`, regenerated static pages + `sitemap.xml` (36 URLs).
- Tested in Chromium: path page lists 4 unlocked steps; each lesson opens (13 sections); quizzes score correctly (4/4, 4/4, 4/4, 3/3); search finds the new lesson; no JS errors; no mobile overflow on the academy home.
- Content status: `reviewStatus: original-content-needs-human-review`. Tool names/official domains are common ones I am confident about but were NOT opened (no internet); no prices stated. Trend lesson is a general summary of public articles, not official announcements. Social-media platforms themselves could not be searched; only general web results were used.
## 2026-10-18 — 4 more original lessons (path now has 8)
- Added to `ai-in-practice`: `ai-for-studying`, `fact-checking-ai`, `ai-automation-agents`, `ai-privacy-safety` (via `tools/add_ai_in_practice.py`). Topics chosen from the 2026 web search themes (study tools, agents/automation, responsible use) plus common beginner gaps; no encyclopedia text.
- Totals updated: 34 lessons (site.json stat, plans.json, courses.json, academy home card), sitemap 40 URLs, static pages regenerated.
- Tested in Chromium: path shows 8 unlocked steps; all 8 lessons open; quizzes score; next-lesson chain works; no JS errors; no mobile overflow on academy home.
- No "locked" lessons exist in this project's data (verified: `locked`/`paid` appear only in unused router code and `access.js`). The 2 lessons of the original 19-lesson prompt path are not present in the ZIP, and their titles are not recorded anywhere I could find.
- Still `reviewStatus: original-content-needs-human-review`. Not opened: official tool sites (no internet).
## 2026-10-18 — Official-site check (web_fetch)
- OPENED and confirmed: openai.com (product link points to chatgpt.com, which also opened), anthropic.com (links to claude.ai, claude.com/pricing), copilot.microsoft.com.
- Fixed: ChatGPT official link in `top-ai-tools` changed from openai.com/chatgpt to chatgpt.com.
- Added to `ai-whats-new`: dated example from the official sites (OpenAI GPT-6 and Anthropic Haiku 5.5 announced 7 Oct 2026).
- NOT opened (the fetch tool only opens URLs surfaced by search; search did not return their official pages): gemini.google.com, notebooklm.google.com, perplexity.ai, canva.com, capcut.com, notion.so. They are well-known domains but remain unverified; no prices stated anywhere.
## 2026-10-18 — All 9 official tool sites checked (web_fetch)
OPENED and confirmed: chatgpt.com + openai.com; claude.ai (via anthropic.com); copilot.microsoft.com; gemini.google (official site; its "Try Gemini" button leads to gemini.google.com); perplexity.ai; canva.com (canva-ai page); capcut.com (ai-video-editor page); notion.com (Notion pages open; notion.so appears only as a legal-terms link); NotebookLM -> notebook.google (opened).
IMPORTANT FINDING: Google renamed NotebookLM to "Gemini Notebook" on 16 July 2026 (Google blog + notebook.google). The lessons now say "Gemini Notebook (NotebookLM سابقًا)" with domain notebook.google. Your content workflow note about NotebookLM still applies to the same product under its new name.
Fixed: Notion domain notion.so -> notion.com. Added sourced notes: Canva says AI output may not be exclusive and you must check commercial suitability; CapCut says some features are region-limited.
No prices were added. Prices and plans change; every lesson tells readers to check the official site.
## 2026-10-21 — Tools news section (manual, sourced)
- Added `data/news.json` (6 items, each with an official source URL and `verifiedOn` date), generated `news/index.html` by `tools/build_pages.py`, footer link on the homepage, sitemap now 41 URLs. Manual workflow documented in `tools/NEWS_WORKFLOW.md`.
- Tested in Chromium at 1280px and 390px: 6 cards, 6 source links, no overflow, no JS errors.
- NOT implemented (and not claimed): automatic updates (RSS/API), AI assistant/chatbot (needs a backend + API key kept off the public files), admin dashboard (none exists in this static project), service request forms with order tracking, payment gateway, user accounts.
