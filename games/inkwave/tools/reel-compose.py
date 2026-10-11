# Compose reel captures (tools/reel.mjs) into a captioned MP4.
# usage: python3 tools/reel-compose.py <out.mp4> <captureDir> [<captureDir> ...] [--title T] [--subtitle S] [--backend ffmpeg|avf]
# Each capture dir holds seg-<order>.json + frames; segments play in `order`. Adds a title card, a caption per segment
# (fade in/out), 10-frame crossfades between segments and an end card. 1280x720 @ 30 fps, H.264.
import sys, os, glob, json, math, argparse
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('out'); ap.add_argument('dirs', nargs='+')
ap.add_argument('--title', default='INKWAVE'); ap.add_argument('--subtitle', default='Animation system')
ap.add_argument('--tagline', default='Work in progress · every frame captured from the live engine')
ap.add_argument('--end', default='All animation is procedural and runs in real time')
ap.add_argument('--backend', default='ffmpeg'); ap.add_argument('--fps', type=int, default=30)
a = ap.parse_args()
W, H, FPS, XF = 1280, 720, a.fps, 10

BOLD = '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'
ROUND = '/System/Library/Fonts/SFNSRounded.ttf'
def font(path, size):
    try: return ImageFont.truetype(path, size)
    except Exception: return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', size)
ORANGE, BLUE = (255, 138, 20), (47, 91, 255)

segs = []
for d in a.dirs:
    for sj in glob.glob(os.path.join(d, 'seg-*.json')):
        m = json.load(open(sj))
        m['files'] = sorted(glob.glob(os.path.join(m['dir'], 'f-*.jpg')))
        if m['files']: segs.append(m)
segs.sort(key=lambda m: m['order'])
N = len(segs)
print(N, 'segments,', sum(len(s['files']) for s in segs), 'frames')

def load(f):
    im = cv2.imread(f, cv2.IMREAD_COLOR)
    if im.shape[1] != W or im.shape[0] != H: im = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
    return im.astype(np.float32)

def pil_to_bgra(img):
    arr = np.asarray(img.convert('RGBA')).astype(np.float32) / 255.0
    return arr[..., [2, 1, 0]] * 255.0, arr[..., 3:4]

def caption_overlay(idx, title, sub, top=False):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ft, fs, fn = font(BOLD, 38), font(ROUND, 21), font(BOLD, 15)
    tw = d.textlength(title, font=ft); sw = d.textlength(sub, font=fs)
    pw = int(max(tw, sw) + 64); ph = 104
    x0 = 40; y0 = 40 if top else H - ph - 40
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x0 + 4, y0 + 6, x0 + pw + 4, y0 + ph + 6), 22, fill=(0, 0, 0, 90))
    img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), 22, fill=(14, 16, 30, 205))
    d.rounded_rectangle((x0, y0, x0 + 8, y0 + ph), 4, fill=ORANGE + (255,))
    d.text((x0 + 30, y0 + 13), f'{idx:02d} / {N:02d}', font=fn, fill=(255, 176, 90, 255))
    d.text((x0 + 30, y0 + 31), title, font=ft, fill=(255, 255, 255, 255))
    d.text((x0 + 31, y0 + 74), sub, font=fs, fill=(214, 222, 244, 255))
    # watermark
    wm = 'INKWAVE  ·  animation system  ·  work in progress'
    d.text((W - d.textlength(wm, font=fn) - 28, H - 30 if top else 22), wm, font=fn, fill=(255, 255, 255, 150))
    return pil_to_bgra(img)

def card(bg_bgr, lines, t):
    """Title/end card over a blurred, darkened frame. lines = [(text, font, color, gap)]."""
    base = Image.fromarray(cv2.cvtColor(np.clip(bg_bgr, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)).filter(ImageFilter.GaussianBlur(18))
    base = Image.blend(base, Image.new('RGB', (W, H), (10, 12, 26)), 0.62).convert('RGBA')
    blobs = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(blobs)
    for (cx, cy, r, col) in [(170, 150, 210, ORANGE), (1120, 590, 250, BLUE), (1010, 120, 120, ORANGE), (240, 610, 140, BLUE)]:
        dx = 18 * math.sin(t * 0.9 + cx); dy = 14 * math.cos(t * 0.7 + cy)
        bd.ellipse((cx - r + dx, cy - r + dy, cx + r + dx, cy + r + dy), fill=col + (70,))
    base = Image.alpha_composite(base, blobs.filter(ImageFilter.GaussianBlur(60)))
    d = ImageDraw.Draw(base)
    total = sum(f.size + g for (_, f, _, g) in lines)
    y = (H - total) / 2
    for (text, f, col, gap) in lines:
        tw = d.textlength(text, font=f)
        d.text(((W - tw) / 2 + 3, y + 4), text, font=f, fill=(0, 0, 0, 120))
        d.text(((W - tw) / 2, y), text, font=f, fill=col)
        y += f.size + gap
    return cv2.cvtColor(np.asarray(base.convert('RGB')), cv2.COLOR_RGB2BGR).astype(np.float32)

fourcc = cv2.VideoWriter_fourcc(*'avc1')
if a.backend == 'avf': vw = cv2.VideoWriter(a.out, cv2.CAP_AVFOUNDATION, fourcc, FPS, (W, H))
else: vw = cv2.VideoWriter(a.out, cv2.CAP_FFMPEG, fourcc, FPS, (W, H))
assert vw.isOpened(), 'video writer failed to open'
count = 0
def emit(fr):
    global count
    vw.write(np.clip(fr, 0, 255).astype(np.uint8)); count += 1

# ---- title card (fade in from black, hold, crossfade into segment 1)
first = load(segs[0]['files'][0])
T_TITLE = int(2.8 * FPS)
title_lines = [(a.title, font(BOLD, 112), (255, 255, 255), 6), (a.subtitle, font(BOLD, 44), (255, 196, 120), 26), (a.tagline, font(ROUND, 22), (205, 214, 240), 0)]
title_frames = [card(first, title_lines, i / FPS) for i in range(T_TITLE)]
for i, fr in enumerate(title_frames[:-XF]):
    k = min(1.0, i / (0.6 * FPS))
    emit(fr * k)
tail = title_frames[-XF:]

# ---- segments with captions + crossfades
for si, s in enumerate(segs):
    top = s['order'] >= 90
    ov_rgb, ov_a = caption_overlay(si + 1, s['title'], s['sub'], top)
    files = s['files']; n = len(files)
    last_block = si == N - 1
    body_end = n if last_block else n - XF
    for fi in range(0, body_end):
        fr = load(files[fi])
        ca = min(1.0, max(0.0, (fi - 5) / 9.0)) * min(1.0, max(0.0, (n - 1 - fi) / 9.0))
        if ca > 0: fr = fr * (1 - ov_a * ca) + ov_rgb * (ov_a * ca)
        if fi < XF and tail is not None:
            w = (fi + 1) / (XF + 1)
            fr = tail[fi] * (1 - w) + fr * w
        emit(fr)
    if not last_block:
        tail = []
        for fi in range(n - XF, n):
            fr = load(files[fi])
            ca = min(1.0, max(0.0, (n - 1 - fi) / 9.0))
            if ca > 0: fr = fr * (1 - ov_a * ca) + ov_rgb * (ov_a * ca)
            tail.append(fr)

# ---- end card (crossfade from the last frame, hold, fade to black)
last = load(segs[-1]['files'][-1])
T_END = int(3.2 * FPS)
end_lines = [(a.title, font(BOLD, 84), (255, 255, 255), 14), (a.end, font(ROUND, 26), (214, 222, 244), 0)]
for i in range(T_END):
    fr = card(last, end_lines, i / FPS)
    if i < XF: w = (i + 1) / (XF + 1); fr = last * (1 - w) + fr * w
    k = min(1.0, (T_END - 1 - i) / (0.7 * FPS))
    emit(fr * k)
vw.release()
print(f'wrote {a.out}: {count} frames, {count / FPS:.1f} s, {os.path.getsize(a.out) / 1e6:.1f} MB')
