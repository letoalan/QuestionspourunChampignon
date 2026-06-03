import os
import json
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

# Essayons d'extraire tout le texte de IIA.pdf et IIB.pdf
iia_text = ""
reader = PdfReader(os.path.join(cours_dir, "IIA.pdf"))
for page in reader.pages:
    iia_text += page.extract_text() + "\n"

print("--- IIA.pdf (premiers 4000 caractères) ---")
print(iia_text[:4000])

iib_text = ""
reader = PdfReader(os.path.join(cours_dir, "IIB.pdf"))
for page in reader.pages:
    iib_text += page.extract_text() + "\n"

print("\n--- IIB.pdf (premiers 4000 caractères) ---")
print(iib_text[:4000])
