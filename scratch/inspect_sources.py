import os
from pypdf import PdfReader

sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

for path in [
    os.path.join(sources_dir, "ra19lyceegtcom2histtheme1antiquitemoyenage1169453pdf-83022.pdf"),
    os.path.join(sources_dir, "ra20lyceegt2histgeotheme2-xve-xvie-nouveau-rapport-monde1293851pdf-83025.pdf"),
    os.path.join(sources_dir, "ra20lyceegt2histgeotheme3-etat-epoque-moderne1293912pdf-83028.pdf"),
    os.path.join(sources_dir, "spe577annexe1corr1063699pdf-83007.pdf")
]:
    reader = PdfReader(path)
    print(f"\n======================== {os.path.basename(path)} ========================")
    text_sample = ""
    for i in range(min(4, len(reader.pages))):
        text_sample += f"\n--- Page {i+1} ---\n" + reader.pages[i].extract_text()
    print(text_sample[:1500])
