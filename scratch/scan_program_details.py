import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

for path in [
    os.path.join(sources_dir, "ra20lyceegt2histgeotheme2-xve-xvie-nouveau-rapport-monde1293851pdf-83025.pdf"),
    os.path.join(sources_dir, "ra20lyceegt2histgeotheme3-etat-epoque-moderne1293912pdf-83028.pdf"),
    os.path.join(sources_dir, "spe577annexe1corr1063699pdf-83007.pdf")
]:
    reader = PdfReader(path)
    print(f"\n======================== {os.path.basename(path)} ========================")
    full_text = ""
    for idx, page in enumerate(reader.pages):
        full_text += f"\n--- Page {idx+1} ---\n" + page.extract_text()
    
    # Recherche de mots clés comme "Valladolid", "Luther", "Érasme", "Villers-Cotterêts", "Colbert", etc.
    print(f"Longueur du texte : {len(full_text)}")
    for kw in ["Valladolid", "Las Casas", "Érasme", "Luther", "Sixtine", "Villers-Cotterêts", "Colbert", "Versailles", "Nantes", "Habeas Corpus", "Bill of Rights"]:
        count = full_text.lower().count(kw.lower())
        print(f"Occurrence de '{kw}': {count}")
