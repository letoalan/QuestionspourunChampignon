import os
from pypdf import PdfReader

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"

for name in ["I.pdf", "III.pdf"]:
    path = os.path.join(cours_dir, name)
    reader = PdfReader(path)
    print(f"\n======================== {name} ========================")
    for i, p in enumerate(reader.pages):
        txt = p.extract_text().strip()
        # Imprimer toute page ayant du texte significatif
        if len(txt) > 100:
            print(f"\nPage {i+1} ({len(txt)} chars):")
            print(txt[:600])
