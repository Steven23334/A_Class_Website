#!/bin/bash
# start_local_server.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

PORT=32767
HOST=127.0.0.1
URL="http://${HOST}:${PORT}/index.html"

# ===== 探测 Python：跳过 WindowsApps 假存根 =====
PYTHON=""
for cmd in python python3; do
    candidate="$(command -v "$cmd" 2>/dev/null)" || continue
    case "$candidate" in
        */Microsoft/WindowsApps/*) continue ;;
    esac
    if "$candidate" --version >/dev/null 2>&1; then
        PYTHON="$candidate"
        break
    fi
done

if [ -z "$PYTHON" ]; then
    for p in \
        "/c/Users/Administrator/AppData/Local/Programs/Python/Python311/python.exe" \
        "/c/Program Files/Python311/python.exe" \
        "/c/Python311/python.exe"
    do
        if [ -x "$p" ] && "$p" --version >/dev/null 2>&1; then
            PYTHON="$p"
            break
        fi
    done
fi

if [ -z "$PYTHON" ]; then
    echo "[错误] 未找到可用的 Python，无法启动 http.server。"
    exit 1
fi

# ===== 检查端口是否已被占用 =====
if command -v netstat >/dev/null 2>&1; then
    if netstat -ano 2>/dev/null | grep -q ":${PORT} .*LISTENING"; then
        echo "[错误] 端口 ${PORT} 已被占用。"
        echo "查看占用: netstat -ano | grep :${PORT}"
        echo "杀掉占用: taskkill //PID <PID> //F"
        exit 1
    fi
fi

echo "使用 Python: $PYTHON"
echo "正在启动本地服务器: $URL"
echo "按 Ctrl + C 或关闭此窗口即可停止服务。"
echo

# 延迟 0.8 秒后打开浏览器（用真 Python 的 webbrowser 模块，最稳）
(
    sleep 0.8
    "$PYTHON" -m webbrowser "$URL" >/dev/null 2>&1
) &

# 前台启动服务器：显式绑定 127.0.0.1，-u 让输出不缓冲
"$PYTHON" -u -m http.server "$PORT" --bind "$HOST"