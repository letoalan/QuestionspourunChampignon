import os
import glob
from pypdf import PdfReader

cours_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\cours\histoire\seconde"
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

def inspect_file(path, num_chars=3000):
    reader = PdfReader(path)
    print(f"\n========================================\nINSPECTION : {os.path.basename(path)} ({len(reader.pages)} pages)")
    full_text = ""
    for i in range(min(5, len(reader.pages))):
        full_text += f"\n--- PAGE {i+1} ---\n" + reader.pages[i].extract_text()
    print(full_text[:num_chars])

# Inspectons I.pdf, IIA.pdf et III.pdf qui contiennent le cours rédigé ou structuré.
inspect_file(os.path.join(cours_dir, "I.pdf"), 2000)
inspect_file(os.path.join(cours_dir, "IIA.pdf"), 2000)
inspect_file(os.path.join(cours_dir, "III.pdf"), 2000)
