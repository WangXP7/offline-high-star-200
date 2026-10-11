#!/usr/bin/env bash
# 离线小游戏合集启动器（Git Bash / Linux / macOS）
cd "$(dirname "$0")"
PORT="${1:-8137}"
python server.py "$PORT" &
sleep 1
( xdg-open "http://127.0.0.1:$PORT/" 2>/dev/null || open "http://127.0.0.1:$PORT/" 2>/dev/null || start "http://127.0.0.1:$PORT/" 2>/dev/null ) &
wait
