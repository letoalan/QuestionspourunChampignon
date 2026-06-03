import os
import json
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')
cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"

print("--- LECTURE DES PREMIÈRES PAGES DE III.pdf (OUVERTURE ATLANTIQUE) ---")
reader = PdfReader(os.path.join(cours_dir, "III.pdf"))
for idx, page in enumerate(reader.pages):
    txt = page.extract_text().strip()
    if len(txt) > 20:
        print(f"\nPage {idx+1}:")
        print(txt[:1000])
