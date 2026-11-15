@echo off
chcp 65001 >nul
setlocal EnableExtensions

cd /d "%~dp0"

set "PORT=32767"
set "HOST=127.0.0.1"
set "URL=http://%HOST%:%PORT%/index.html"

set "PYTHON="

rem ===== 1) 优先尝试 py launcher =====
where py >nul 2>&1
if not errorlevel 1 (
    py --version >nul 2>&1
    if not errorlevel 1 set "PYTHON=py"
)

rem ===== 2) where python / python3，跳过 WindowsApps 假存根 =====
if not defined PYTHON (
    for %%C in (python.exe python3.exe) do (
        if not defined PYTHON (
            for /f "delims=" %%P in ('where %%C 2^>nul') do (
                if not defined PYTHON (
                    echo %%P | findstr /i /c:"\WindowsApps\" >nul
                    if errorlevel 1 (
                        "%%P" --version >nul 2>&1
                        if not errorlevel 1 set "PYTHON=%%P"
                    )
                )
            )
        )
    )
)

rem ===== 3) 回退到常见安装路径（含用户目录、多版本） =====
if not defined PYTHON (
    for %%P in (
        "%LocalAppData%\Programs\Python\Python313\python.exe"
        "%LocalAppData%\Programs\Python\Python312\python.exe"
        "%LocalAppData%\Programs\Python\Python311\python.exe"
        "%LocalAppData%\Programs\Python\Python310\python.exe"
        "C:\Program Files\Python313\python.exe"
        "C:\Program Files\Python312\python.exe"
        "C:\Program Files\Python311\python.exe"
        "C:\Python313\python.exe"
        "C:\Python312\python.exe"
        "C:\Python311\python.exe"
    ) do (
        if not defined PYTHON (
            if exist "%%~P" (
                "%%~P" --version >nul 2>&1
                if not errorlevel 1 set "PYTHON=%%~P"
            )
        )
    )
)

if not defined PYTHON (
    echo [错误] 未找到可用的 Python，无法启动 http.server。
    echo 请安装 Python 3，或把 python.exe 所在目录加入 PATH。
    echo.
    pause
    exit /b 1
)

rem ===== 端口占用检查（字面匹配 + 二次过滤 LISTENING） =====
netstat -ano 2>nul | findstr /i /c:":%PORT% " | findstr /i "LISTENING" >nul
if not errorlevel 1 (
    echo [错误] 端口 %PORT% 已被占用。
    echo 查看占用: netstat -ano ^| findstr ":%PORT%"
    echo 杀掉占用: taskkill /PID ^<PID^> /F
    echo.
    pause
    exit /b 1
)

echo 使用 Python: %PYTHON%
echo 正在启动本地服务器: %URL%
echo 按 Ctrl + C 或关闭此窗口即可停止服务。
echo.

rem 延迟 0.8 秒后用 Python 的 webbrowser 打开浏览器
start "" /b "%PYTHON%" -c "import time,webbrowser;time.sleep(0.8);webbrowser.open('%URL%')"

rem 前台启动服务器：显式绑定 127.0.0.1，-u 不缓冲输出
"%PYTHON%" -u -m http.server %PORT% --bind %HOST%

endlocal