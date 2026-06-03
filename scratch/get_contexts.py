import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

def print_contexts(pdf_name, keywords):
    path = os.path.join(sources_dir, pdf_name)
    reader = PdfReader(path)
    full_text = ""
    for idx, page in enumerate(reader.pages):
        full_text += f"\n[Page {idx+1}]\n" + page.extract_text()
    
    print(f"\n===== CONTEXTES DANS {pdf_name} =====")
    for kw in keywords:
        print(f"\n--- Mot-clé: {kw} ---")
        start = 0
        while True:
            pos = full_text.lower().find(kw.lower(), start)
            if pos == -1:
                break
            # Prendre une fenêtre autour du mot clé
            win_start = max(0, pos - 150)
            win_end = min(len(full_text), pos + 150)
            print(f"...{full_text[win_start:win_end].strip().replace('\n', ' | ')}...")
            start = pos + len(kw)

print_contexts("ra20lyceegt2histgeotheme2-xve-xvie-nouveau-rapport-monde1293851pdf-83025.pdf", ["Valladolid", "Las Casas", "Érasme", "Luther", "Sixtine"])
print_contexts("ra20lyceegt2histgeotheme3-etat-epoque-moderne1293912pdf-83028.pdf", ["Villers-Cotterêts", "Colbert", "Versailles", "Nantes", "Habeas Corpus", "Bill of Rights"])
