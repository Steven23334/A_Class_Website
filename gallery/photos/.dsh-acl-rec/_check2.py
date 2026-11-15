import datetime, json, os, sys
sys.path.insert(0, r"I:\HTML\Class_News\gallery")
import generate_manifest as g
print("NAME_RE ->", [(t, g.parse_name(t)) for t in
    ["2026-09-24-22", "2026-09-24", "2026-9-3", "2026-13-01", "IMG_001", "2026-11-06-11", "2026-04-01-3"]])
# 模拟：无日期文件退回修改时间
print("fallback sort key for IMG_001 ->", g.parse_name("IMG_001"))
