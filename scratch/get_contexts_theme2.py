import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')
sources_dir = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\modules\sources\histoire\seconde"

print_contexts("ra20lyceegt2histgeotheme2-xve-xvie-nouveau-rapport-monde1293851pdf-83025.pdf", ["Valladolid", "Las Casas", "Érasme", "Luther", "Sixtine"])
