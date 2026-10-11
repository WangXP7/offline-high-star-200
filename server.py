# -*- coding: utf-8 -*-
"""离线小游戏合集本地服务器（纯标准库，无依赖）
路由：
  /              -> 合集导航主页
  /games/<path>  -> games/<path>
  /<slug>/<path> -> games/<slug>/<path>   (兼容按仓库名绝对路径引用的构建产物)
用法：python server.py [端口]   默认 8137
"""
import os, sys, socketserver
from http.server import SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))
GAMES = os.path.join(ROOT, "games")
SLUGS = {d for d in os.listdir(GAMES) if os.path.isdir(os.path.join(GAMES, d))}

EXT_MAP = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".json": "application/json", ".wasm": "application/wasm", ".png": "image/png",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
    ".ico": "image/x-icon", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav",
    ".m4a": "audio/mp4", ".mp4": "video/mp4", ".ttf": "font/ttf", ".otf": "font/otf",
    ".woff": "font/woff", ".woff2": "font/woff2", ".map": "application/json",
    ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8",
    ".pdf": "application/pdf", ".xml": "application/xml", ".webp": "image/webp",
    ".webm": "video/webm", ".csv": "text/csv", ".atlas": "text/plain", ".fnt": "text/plain",
    ".tmx": "application/xml", ".tsx": "text/plain", ".unityweb": "application/octet-stream",
    ".data": "application/octet-stream", ".mem": "application/octet-stream",
    ".cur": "image/x-icon", ".anis": "text/plain", ".zip": "application/zip",
}

class Handler(SimpleHTTPRequestHandler):
    def _game_html_bytes(self, path):
        """游戏目录下的 .html/.htm -> 读取并注入中文化层；否则返回 None"""
        real = path
        if not (real.lower().endswith(".html") or real.lower().endswith(".htm")):
            return None
        if not real.startswith(GAMES):
            return None
        try:
            with open(real, "rb") as f:
                data = f.read()
        except OSError:
            return None
        html = data.decode("utf-8", "ignore")
        if "__i18n.js" in html:
            return data
        tag = '<script src="/games/__i18n.js"></script>'
        low = html.lower()
        i = low.rfind("</body>")
        html = (html[:i] + tag + html[i:]) if i != -1 else html + tag
        return html.encode("utf-8")

    def do_GET(self):
        # 先按路由规则解析真实路径（同 translate_path，但保留结果供注入判断）
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        parts = [p for p in path.split("/") if p not in ("", ".")]
        if not parts:
            self.translate_path_raw = os.path.join(ROOT, "index.html")
        else:
            head, rest = parts[0], parts[1:]
            if head == "games":
                self.translate_path_raw = os.path.join(GAMES, *rest) if rest else GAMES
            elif head in SLUGS:
                self.translate_path_raw = os.path.join(GAMES, head, *rest) if rest else os.path.join(GAMES, head)
            else:
                self.translate_path_raw = os.path.join(ROOT, *parts)
        raw = self.translate_path_raw
        if os.path.isdir(raw):
            raw = os.path.join(raw, "index.html")
        injected = self._game_html_bytes(raw)
        if injected is not None:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(injected)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(injected)
            return
        super().do_GET()

    def translate_path(self, path):
        path = path.split("?", 1)[0].split("#", 1)[0]
        parts = [p for p in path.split("/") if p not in ("", ".")]
        if not parts:
            return os.path.join(ROOT, "index.html")
        head, rest = parts[0], parts[1:]
        if head == "games":
            return os.path.join(GAMES, *rest) if rest else GAMES
        if head in SLUGS:
            return os.path.join(GAMES, head, *rest) if rest else os.path.join(GAMES, head)
        return os.path.join(ROOT, *parts)

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        if ext in EXT_MAP:
            return EXT_MAP[ext]
        return super().guess_type(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
    with Server(("127.0.0.1", port), Handler) as httpd:
        print(f"小游戏合集已启动: http://127.0.0.1:{port}  (Ctrl+C 退出)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
