import os
from pypdf import PdfReader

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"

for name in ["I.pdf", "III.pdf"]:
    path = os.path.join(cours_dir, name)
    reader = PdfReader(path)
    print(f"\n======================== {name} ========================")
    for i, p in enumerate(reader.pages):
        txt = p.extract_text().strip()
        lines = [line.strip() for line in txt.split('\n') if line.strip()]
        # Filtrer les lignes de header/footer de Sutori
        clean_lines = [l for l in lines if "Sutori" not in l and "sur 26" not in l and "sur 7" not in l and "03/06/2026" not in l]
        if clean_lines:
            print(f"Page {i+1}: {' '.join(clean_lines[:5])}...")
