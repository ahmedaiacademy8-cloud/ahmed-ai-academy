#!/usr/bin/env python3
"""Change the WhatsApp number everywhere at once.
Usage: python3 tools/set_whatsapp.py OLD_NUMBER NEW_NUMBER   (digits only, with country code, e.g. 201157356164)"""
import sys, glob, re
old, new = sys.argv[1], sys.argv[2]
assert re.fullmatch(r"\d{8,15}", old) and re.fullmatch(r"\d{8,15}", new), "digits only"
n = 0
for f in glob.glob("**/*", recursive=True):
    if not re.search(r"\.(html|js|json|md)$", f): continue
    t = open(f, encoding="utf8").read()
    if old in t:
        open(f, "w", encoding="utf8").write(t.replace(old, new)); n += 1; print("updated", f)
print(n, "files updated")
