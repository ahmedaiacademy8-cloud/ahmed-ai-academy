#!/usr/bin/env python3
"""Generates static, indexable lesson pages + sitemap.xml from data/lessons/*.json.
Run from project root:  python3 tools/build_pages.py
The hash-router app (academy.html#lesson/<slug>) is untouched and keeps working."""
import json, glob, html, os, datetime, re
BASE = "https://ahmedmohmedabdullah.github.io/ahmed-ai-academy/"
today = datetime.date.today().isoformat()
esc = lambda s: html.escape(s or "", quote=True)
urls = [("", "1.0"), ("academy.html", "0.9")]
for f in sorted(glob.glob("data/lessons/*.json")):
    d = json.load(open(f, encoding="utf8"))
    for l in d["lessons"]:
        if l.get("status") != "published": continue
        slug = l["slug"]
        desc = re.sub(r"<[^>]+>", " ", l.get("description") or "")
        desc = re.sub(r"\s+", " ", desc).strip()[:155]
        body = "\n".join(s["html"] for s in l["sections"] if s["key"] != "quiz")
        url = f"{BASE}lessons/{slug}/"
        ld = json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": l["title"],
            "inLanguage": "ar", "url": url, "isPartOf": d["pathTitle"],
            "publisher": {"@type": "EducationalOrganization", "name": "Ahmed AI Academy"}}, ensure_ascii=False)
        page = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(l['title'])} — Ahmed AI Academy</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<link rel="icon" href="../../assets/favicon/favicon.ico">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;800&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap">
<link rel="stylesheet" href="../../css/global.css"><link rel="stylesheet" href="../../css/academy.css">
<script type="application/ld+json">{ld}</script></head>
<body><main style="max-width:860px;margin:0 auto;padding:24px 16px">
<nav aria-label="مسار التنقل"><a href="../../index.html">الرئيسية</a> › <a href="../../academy.html#path/{esc(d['pathId'])}">{esc(d['pathTitle'])}</a></nav>
<h1>{esc(l['title'])}</h1>
<p><a class="btn btn-gold" href="../../academy.html#lesson/{esc(slug)}">افتح النسخة التفاعلية (اختبار وتقدم)</a></p>
{body}
<section aria-label="وسائط الدرس"><h2>فيديو الدرس</h2><p>الفيديو التعليمي قريبًا.</p><h2>ملفات المراجعة</h2><p>ستُضاف هنا.</p></section>
</main></body></html>"""
        os.makedirs(f"lessons/{slug}", exist_ok=True)
        open(f"lessons/{slug}/index.html", "w", encoding="utf8").write(page)
        urls.append((f"lessons/{slug}/", "0.8"))
g=json.load(open("data/glossary.json",encoding="utf8"))
items="\n".join(f"<dt><strong>{esc(x['t'])}</strong></dt><dd>{esc(x['d'])}</dd>" for x in g["terms"])
os.makedirs("glossary",exist_ok=True)
open("glossary/index.html","w",encoding="utf8").write(f'''<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>قاموس مصطلحات الذكاء الاصطناعي — Ahmed AI Academy</title>
<meta name="description" content="شرح مبسط لأهم مصطلحات الذكاء الاصطناعي بالعربية.">
<link rel="canonical" href="{BASE}glossary/"><link rel="stylesheet" href="../css/global.css"><link rel="stylesheet" href="../css/academy.css"></head>
<body><main style="max-width:860px;margin:0 auto;padding:24px 16px"><p><a href="../index.html">الرئيسية</a></p>
<h1>قاموس مصطلحات الذكاء الاصطناعي</h1><p>مسودة قيد المراجعة؛ تُراجع التعريفات مع المصادر الرسمية قبل اعتمادها.</p><dl>{items}</dl></main></body></html>''')
urls.append(("glossary/","0.7"))
nw=json.load(open("data/news.json",encoding="utf8"))["items"]
nw.sort(key=lambda x:x["date"],reverse=True)
cards="\n".join(f'''<article style="border:1px solid var(--border);border-radius:14px;padding:18px;margin:14px 0"><p><small>{esc(n["date"])} · {esc(n["category"])} · {esc(n["tool"])}</small></p><h2 style="font-size:1.15rem">{esc(n["title"])}</h2><p>{esc(n["summary"])}</p><p><small>المصدر الرسمي: <a href="{esc(n["source"])}" target="_blank" rel="noopener">{esc(n["source"])}</a> · آخر تحقق: {esc(n["verifiedOn"])}</small></p></article>''' for n in nw)
os.makedirs("news",exist_ok=True)
open("news/index.html","w",encoding="utf8").write(f'''<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>أخبار أدوات الذكاء الاصطناعي — Ahmed AI Academy</title><meta name="description" content="آخر أخبار أدوات الذكاء الاصطناعي من مصادرها الرسمية مع تاريخ آخر تحقق.">
<link rel="canonical" href="{BASE}news/"><link rel="stylesheet" href="../css/global.css"><link rel="stylesheet" href="../css/academy.css"></head>
<body><main style="max-width:860px;margin:0 auto;padding:24px 16px;line-height:1.9"><p><a href="../index.html">الرئيسية</a></p>
<h1>أخبار أدوات الذكاء الاصطناعي</h1><p>كل خبر مربوط بمصدره الرسمي وتاريخ آخر تحقق. التحديث يدوي ويخضع للمراجعة، والخطط والأسعار تتغير فراجع الموقع الرسمي.</p>{cards}</main></body></html>''')
urls.append(("news/","0.6"))

for _p in ("privacy/","terms/","copyright/"): urls.append((_p,"0.3"))
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u, p in urls:
    sm.append(f"  <url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>")
sm.append("</urlset>")
open("sitemap.xml", "w", encoding="utf8").write("\n".join(sm) + "\n")
print(len(urls) - 2, "lesson pages generated; sitemap urls:", len(urls))
