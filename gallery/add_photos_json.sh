#!/bin/bash
# add_photos_json.sh
# 原 add_photos_json.bat 的 Linux 版本
# 编码：UTF-8

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

pause() {
    read -r -p "按回车键继续..." _ || true
}

echo "========================================"
echo "  生成相册清单 (photos.json)"
echo "  目录: $PWD"
echo "========================================"
echo

if [ ! -f "$SCRIPT_DIR/generate_manifest.py" ]; then
    echo "[错误] 找不到 $SCRIPT_DIR/generate_manifest.py"
    echo "当前目录内容:"
    ls -1
    echo
    pause
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/photos" ]; then
    echo "[提示] 没有 photos 文件夹，正在创建..."
    mkdir -p "$SCRIPT_DIR/photos"
fi

# ===== 探测 Python：跳过 WindowsApps 假存根，优先使用真实 python =====
PYEXE=""

# 候选命令列表：优先 python，其次 python3
for cmd in python python3; do
    candidate="$(command -v "$cmd" 2>/dev/null)" || continue

    # 关键：如果候选路径落在 WindowsApps 目录下，直接跳过
    case "$candidate" in
        */Microsoft/WindowsApps/*) continue ;;
    esac

    # 确认能真正输出版本号，避免其他残留问题
    if "$candidate" --version >/dev/null 2>&1; then
        PYEXE="$candidate"
        break
    fi
done

# 如果 PATH 里仍然找不到，就尝试你 bat 里写过的已知安装路径
if [ -z "$PYEXE" ]; then
    for p in \
        "/c/Users/Administrator/AppData/Local/Programs/Python/Python311/python.exe" \
        "/c/Program Files/Python311/python.exe" \
        "/c/Python311/python.exe"
    do
        if [ -x "$p" ] && "$p" --version >/dev/null 2>&1; then
            PYEXE="$p"
            break
        fi
    done
fi

echo "使用 Python: $PYEXE"
"$PYEXE" --version
echo

echo "正在执行: \"$PYEXE\" \"$SCRIPT_DIR/generate_manifest.py\""
echo "----------------------------------------"
"$PYEXE" "$SCRIPT_DIR/generate_manifest.py"
RC=$?
echo "----------------------------------------"
echo "返回码: $RC"
echo

if [ "$RC" -ne 0 ]; then
    echo "[失败] 生成出错，请查看上方输出。"
    pause
    exit "$RC"
fi

echo "[完成] photos.json 已更新。"
echo "提示: 浏览器里按 Ctrl + F5 强制刷新。"
echo
pause
exit 0