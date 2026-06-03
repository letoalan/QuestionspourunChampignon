import os
from pypdf import PdfReader

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"

def print_pdf_pages(filename, start_p, end_p):
    path = os.path.join(cours_dir, filename)
    reader = PdfReader(path)
    print(f"\n===== PAGES {start_p} à {end_p} de {filename} =====")
    for p in range(start_p - 1, min(end_p, len(reader.pages))):
        print(f"\n--- PAGE {p+1} ---")
        print(reader.pages[p].extract_text())

# Regardons quelques pages de I.pdf (l'antiquité méditerranéenne) et de III.pdf (l'ouverture atlantique)
print_pdf_pages("I.pdf", 6, 12)
print_pdf_pages("III.pdf", 6, 7)
