import os
from pypdf import PdfReader

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"
reader = PdfReader(os.path.join(cours_dir, "III.pdf"))
print(f"Nombre d'images par page dans III.pdf:")
for idx, page in enumerate(reader.pages):
    print(f"Page {idx+1}: {len(page.images)} images")
