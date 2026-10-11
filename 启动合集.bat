@echo off
chcp 65001 >nul
title 离线小游戏合集
cd /d "%~dp0"
set PORT=8137
start "" http://127.0.0.1:%PORT%/
where py >nul 2>nul && (py server.py %PORT% & goto :eof)
where python >nul 2>nul && (python server.py %PORT% & goto :eof)
echo [!] 未找到 Python，请安装 Python 3 后重试，详见 README.md
pause
