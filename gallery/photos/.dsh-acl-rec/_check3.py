import json, sys, os
sys.path.insert(0, r"I:\HTML\Class_News\gallery")
import generate_manifest as g
import tempfile, shutil
root = r"I:\HTML\Class_News\gallery\photos\.dsh-acl-rec\_sandbox"
os.makedirs(root, exist_ok=True)
for n in ["IMG_2024.jpg", "2026-09-24-3.jpg", "2026-09-24-10.jpg", "2026-9-4.JPG", "notes.txt", "2026-09-24-1.mp4"]:
    open(os.path.join(root, n), "wb").close()
items, skipped = g.collect(root)
print("skipped:", skipped)
items.sort(key=lambda x: x["_sort"], reverse=True)
print("order:", [i["file"] for i in items])
shutil.rmtree(root)
