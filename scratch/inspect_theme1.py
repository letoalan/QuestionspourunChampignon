import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

path = os.path.join(sources_dir, "ra19lyceegtcom2histtheme1antiquitemoyenage1169453pdf-83022.pdf")
reader = PdfReader(path)
print(f"\n======================== {os.path.basename(path)} ========================")
text_sample = ""
for i in range(len(reader.pages)):
    text_sample += f"\n--- Page {i+1} ---\n" + reader.pages[i].extract_text()
print(text_sample[:4000])
