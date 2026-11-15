@echo off
setlocal
chcp 65001 >nul

cd /d "%~dp0"

echo ========================================
echo   生成资料清单 (downloads.json)
echo   目录: %CD%
echo ========================================
echo.

if not exist "%~dp0generate_downloads_manifest.py" (
    echo [错误] 找不到 %~dp0generate_downloads_manifest.py
    echo 当前目录内容:
    dir /b
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0downloads" (
    echo [提示] 没有 downloads 文件夹，正在创建...
    mkdir "%~dp0downloads"
)

set "PYEXE="

for /f "delims=" %%i in ('where python 2^>nul') do (
    if not defined PYEXE set "PYEXE=%%i"
)

if not defined PYEXE (
    for /f "delims=" %%i in ('where py 2^>nul') do (
        if not defined PYEXE set "PYEXE=%%i"
    )
)

if not defined PYEXE (
    if exist "C:\Users\Administrator\AppData\Local\Programs\Python\Python311\python.exe" (
        set "PYEXE=C:\Users\Administrator\AppData\Local\Programs\Python\Python311\python.exe"
    )
)

if not defined PYEXE (
    echo [错误] 没找到 Python。请手动编辑本 bat，把 PYEXE 设成 python.exe 的完整路径。
    pause
    exit /b 1
)

echo 使用 Python: %PYEXE%
"%PYEXE%" --version
echo.

echo 正在执行: "%PYEXE%" "%~dp0generate_downloads_manifest.py"
echo ----------------------------------------
"%PYEXE%" "%~dp0generate_downloads_manifest.py"
set "RC=%errorlevel%"
echo ----------------------------------------
echo 返回码: %RC%
echo.

if not "%RC%"=="0" (
    echo [失败] 生成出错，请查看上方输出。
    pause
    exit /b %RC%
)

echo [完成] downloads.json 已更新。
echo 提示: 浏览器里按 Ctrl + F5 强制刷新。
echo.
pause
exit /b 0