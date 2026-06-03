import os
import glob
from pypdf import PdfReader

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

print("--- COURS ---")
for pdf_path in glob.glob(os.path.join(cours_dir, "*.pdf")):
    try:
        reader = PdfReader(pdf_path)
        print(f"\nFichier: {os.path.basename(pdf_path)} - {len(reader.pages)} pages")
        # Afficher les 200 premiers caractères de la première page pour voir le sujet
        txt = reader.pages[0].extract_text()
        print(txt[:400].replace('\n', ' | '))
    except Exception as e:
        print(f"Erreur sur {pdf_path}: {e}")

print("\n--- SOURCES ---")
for pdf_path in glob.glob(os.path.join(sources_dir, "*.pdf")):
    try:
        reader = PdfReader(pdf_path)
        print(f"\nFichier: {os.path.basename(pdf_path)} - {len(reader.pages)} pages")
        txt = reader.pages[0].extract_text()
        print(txt[:400].replace('\n', ' | '))
    except Exception as e:
        print(f"Erreur sur {pdf_path}: {e}")
