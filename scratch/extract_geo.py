import fitz
import os

base = r'c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon'

# Course PDF
course_path = os.path.join(base, 'modules', 'cours', 'geo', 'seconde', 'I.pdf')
doc = fitz.open(course_path)
print("=== COURS GEO SECONDE ===")
for page in doc:
    print(page.get_text())
doc.close()

# Source PDFs
sources_dir = os.path.join(base, 'modules', 'sources', 'geo', 'seconde')
for fname in sorted(os.listdir(sources_dir)):
    if fname.endswith('.pdf'):
        fpath = os.path.join(sources_dir, fname)
        print(f"\n=== SOURCE: {fname} ===")
        doc = fitz.open(fpath)
        for page in doc:
            print(page.get_text())
        doc.close()
