#!/usr/bin/env python3
"""扫描指定文件夹，生成 photos.json 供 gallery.html 使用。

排序规则：按时间从新到旧（越晚越靠前）。
时间取值优先级：
  1. 文件名的日期 + 末尾序号（如 2026-09-24-22.MP4 → 2026-09-24 22 号，越大越晚）
  2. 文件修改时间（文件名解析不出日期时）
同一目录下文件名日期为主、序号为辅排序，保证序号大的排在前面。
"""

import json
import os
import re
import sys
from datetime import datetime

EXTS = {".jpg", ".jpeg", ".png", ".mp4"}
FOLDER = "photos"
OUT = "photos.json"

# 文件名：YYYY-MM-DD 或 YYYY-MM-DD-N（N 为序号，越大越晚）
NAME_RE = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:-(\d+))?$")


def parse_name(title):
    """从文件名（不含扩展名）解析出 (日期, 序号)。

    解析失败返回 None。没有序号的文件视为 0 号，即当天最早。
    """
    m = NAME_RE.match(title)
    if not m:
        return None
    year, month, day = int(m.group(1)), int(m.group(2)), int(m.group(3))
    seq = int(m.group(4)) if m.group(4) else 0
    try:
        date = datetime(year, month, day)
    except ValueError:
        return None
    return date, seq


def collect(folder):
    """扫描文件夹，返回 (items, skipped)。

    items 中每项已带上用于排序的私有字段 _date / _seq / _mtime。
    """
    items = []
    skipped = []
    for name in os.listdir(folder):
        path = os.path.join(folder, name)
        if not os.path.isfile(path):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext not in EXTS:
            continue

        title = os.path.splitext(name)[0]
        mtime = datetime.fromtimestamp(os.path.getmtime(path))
        parsed = parse_name(title)

        if parsed:
            date, seq = parsed
            date_str = date.strftime("%Y-%m-%d")
            # 同一序号内按修改时间兜底，保证排序稳定
            sort_key = (date.year, date.month, date.day, seq, mtime)
        else:
            # 文件名没有日期：退回使用修改时间
            sort_key = (mtime.year, mtime.month, mtime.day, -1, mtime)
            date_str = mtime.strftime("%Y-%m-%d")
            skipped.append(name)

        items.append({
            "file": name,
            "title": title,
            "date": date_str,
            "_sort": sort_key,
        })
    return items, skipped


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else FOLDER
    out = sys.argv[2] if len(sys.argv) > 2 else OUT

    if not os.path.isdir(folder):
        print(f"文件夹不存在：{folder}")
        sys.exit(1)

    items, skipped = collect(folder)

    # 从新到旧：日期晚的在前，同一天序号大的在前
    items.sort(key=lambda x: x["_sort"], reverse=True)
    for it in items:
        del it["_sort"]

    with open(out, "w", encoding="utf-8") as f:
        json.dump(
            {"folder": folder.replace(os.sep, "/") + "/", "items": items},
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"已生成 {out}，共 {len(items)} 个文件（按时间从新到旧排序）。")
    if skipped:
        print(f"提示：{len(skipped)} 个文件名不含日期，已按修改时间排序：")
        for name in sorted(skipped):
            print(f"  - {name}")


if __name__ == "__main__":
    main()
