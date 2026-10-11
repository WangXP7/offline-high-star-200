# Character-lab filmstrip: python3 tools/character-lab.film.py <spec.json | inline json> <out.png>
# spec: {"q": "&lod=hero", "go": {lab.go options}, "setup": "js after go", "frames": [{"do": "js", "step": seconds, "label": "…"}],
#        "crop": [x0, y0, x1, y1], "cols": 4, "w": 1280, "h": 720, "tile": 360}
# Deterministic: the lab is frozen by lab.go(); each frame runs `do`, steps the sim `step` s at 60 Hz, renders, shoots.
import json, sys, subprocess, os
from PIL import Image, ImageDraw
raw = sys.argv[1]
spec = json.load(open(raw)) if os.path.exists(raw) else json.loads(raw)
out = sys.argv[2]
W, H = spec.get('w', 1280), spec.get('h', 720)
url = f"http://localhost:8490/tools/character-lab.html?ui=0&bloom=1{spec.get('q', '')}"
tmp = f'/private/tmp/inkwave-film/lab-{os.getpid()}'; os.makedirs(tmp, exist_ok=True)
steps = [{"until": "window.lab && window.lab.hero"},
         {"eval": "lab.go(" + json.dumps(spec.get('go', {})) + "); {" + spec.get('setup', '') + "}; 1"}]
for i, f in enumerate(spec['frames']):
    steps.append({"eval": "{" + f.get('do', '') + "}; lab.step(" + str(f.get('step', 0.1)) + "); " + (f.get('log', '1'))})
    steps.append({"wait": 60})
    steps.append({"shot": f"{tmp}/f{i:02d}.png"})
json.dump(steps, open(f'{tmp}/steps.json', 'w'))
r = subprocess.run(['node', 'tools/play.mjs', url, f'{tmp}/steps.json', '--w', str(W), '--h', str(H)], capture_output=True, text=True)
for l in r.stdout.splitlines():
    if 'eval ->' in l and l.strip() != 'eval -> 1': print(l)
errs = [l for l in r.stdout.splitlines() if ('error' in l.lower() or 'timeout' in l.lower()) and 'Failed to fetch' not in l and '404' not in l]
if errs: print('\n'.join(errs[:12]))
crop = spec.get('crop', [0, 0, W, H]); cols = spec.get('cols', 4)
cw, ch = crop[2] - crop[0], crop[3] - crop[1]
sc = spec.get('tile', 360) / cw
tw, th = int(cw * sc), int(ch * sc)
n = len(spec['frames'])
sheet = Image.new('RGB', (tw * min(cols, n), (th + 20) * ((n + cols - 1) // cols)), (20, 20, 30))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(spec['frames']):
    p = f'{tmp}/f{i:02d}.png'
    if not os.path.exists(p): continue
    im = Image.open(p).crop(crop).resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 20)
    sheet.paste(im, (x, y + 20))
    d.text((x + 6, y + 4), f"{i}: {f.get('label', '')}", fill=(255, 255, 255))
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sheet.save(out); print('saved', out)
