# Build a deterministic filmstrip: python3 tools/film.py <spec.json> <out.png> [url]
# spec: {"setup": "js", "frames": [{"do": "js before stepping", "step": ms, "label": "run 1"} ...], "crop": [x0,y0,x1,y1], "cols": 4}
import json, sys, subprocess, os
from PIL import Image, ImageDraw
spec = json.load(open(sys.argv[1])); out = sys.argv[2]
url = sys.argv[3] if len(sys.argv) > 3 else 'http://localhost:8490/?autostart=120'
tmp = f'/private/tmp/inkwave-film/run-{os.getpid()}'; os.makedirs(tmp, exist_ok=True)   # per-run temp dir: parallel runs never share frames
steps = [{"until": "window.__inkwave && __inkwave.match && __inkwave.match.state==='playing' && __inkwave.match.local"},
         {"eval": "__inkwave.debug.freeze(); {" + spec.get('setup', '') + "}; 1"}]
for i, f in enumerate(spec['frames']):
    steps.append({"eval": "{" + f.get('do', '') + "};" + f"__inkwave.debug.step({f.get('step', 100)}); 1"})
    steps.append({"wait": 150})
    steps.append({"shot": f"{tmp}/f{i:02d}.png"})
json.dump(steps, open(f'{tmp}/steps.json', 'w'))
r = subprocess.run(['node', 'tools/play.mjs', url, f'{tmp}/steps.json', '--w', '1280', '--h', '720'], capture_output=True, text=True)
errs = [l for l in r.stdout.splitlines() if 'error' in l.lower() and 'Failed to fetch' not in l and '404' not in l]
if errs: print('\n'.join(errs[:10]))
crop = spec.get('crop', [320, 160, 960, 720]); cols = spec.get('cols', 4)
cw, ch = crop[2] - crop[0], crop[3] - crop[1]
sc = 360 / cw
tw, th = int(cw * sc), int(ch * sc)
n = len(spec['frames'])
sheet = Image.new('RGB', (tw * cols, (th + 22) * ((n + cols - 1) // cols)), (20, 20, 30))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(spec['frames']):
    im = Image.open(f'{tmp}/f{i:02d}.png').crop(crop).resize((tw, th))
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im, (x, y + 22))
    d.text((x + 6, y + 5), f"{i}: {f.get('label', '')}", fill=(255, 255, 255))
sheet.save(out); print('saved', out)
