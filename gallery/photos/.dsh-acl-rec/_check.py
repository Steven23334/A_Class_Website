import json, re, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
items = d["items"]
def key(it):
    m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:-(\d+))?$", it["title"])
    if m: return (int(m[1]), int(m[2]), int(m[3]), int(m[4] or 0))
    y,mo,da = map(int, it["date"].split("-")); return (y,mo,da,-1)
keys = [key(i) for i in items]
bad = [items[i]["file"] for i in range(1, len(keys)) if keys[i-1] < keys[i]]
print("count", len(items), "order_violations", len(bad), bad[:5])
print("first5", [i["file"] for i in items[:5]])
print("last5", [i["file"] for i in items[-5:]])
print("keys_ok_untouched", all(set(i) == {"file","title","date"} for i in items))
