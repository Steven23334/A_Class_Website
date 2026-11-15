#!/usr/bin/env python3
"""扫描脚本所在目录下的 downloads 文件夹，生成 downloads.json 供 information.html 使用。"""

import json
import os
import sys
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FOLDER_NAME = "downloads"
OUT_NAME = "downloads.json"


def main():
    folder_name = sys.argv[1] if len(sys.argv) > 1 else FOLDER_NAME
    out_name = sys.argv[2] if len(sys.argv) > 2 else OUT_NAME

    folder = os.path.join(BASE_DIR, folder_name)
    out = os.path.join(BASE_DIR, out_name)

    if not os.path.isdir(folder):
        print(f"文件夹不存在：{folder}")
        sys.exit(1)

    items = []
    for name in os.listdir(folder):
        if name.startswith("."):
            continue
        path = os.path.join(folder, name)
        if not os.path.isfile(path):
            continue
        ext = os.path.splitext(name)[1].lower().lstrip(".")
        mtime = datetime.fromtimestamp(os.path.getmtime(path))
        items.append({
            "file": name,
            "title": os.path.splitext(name)[0],
            "ext": ext,
            "size": os.path.getsize(path),
            "date": mtime.strftime("%Y-%m-%d"),
            "_mtime": mtime.timestamp(),
        })

    items.sort(key=lambda x: x["_mtime"], reverse=True)
    for it in items:
        it.pop("_mtime", None)

    with open(out, "w", encoding="utf-8") as f:
        json.dump(
            {"folder": folder_name.replace(os.sep, "/") + "/", "items": items},
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"已生成 {out}，共 {len(items)} 个文件。")


if __name__ == "__main__":
    main()