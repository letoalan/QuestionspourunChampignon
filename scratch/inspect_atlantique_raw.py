import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')
cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"

reader = PdfReader(os.path.join(cours_dir, "III.pdf"))
print("Metadata de III.pdf:")
print(reader.metadata)

print("\nTexte brut extrait de toutes les pages :")
for idx, page in enumerate(reader.pages):
    print(f"--- PAGE {idx+1} ---")
    print(repr(page.extract_text()))
