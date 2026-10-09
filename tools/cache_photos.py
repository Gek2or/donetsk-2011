"""Download the Wikimedia Commons photos listed in photos/manifest.json,
shrink them to the size the site needs and keep them in photos/<hash>.jpg.
Authors and licences stay credited next to every photo on the site."""
import io, json, os, sys, time, urllib.request
from PIL import Image

UA = "Donetsk2011-site/1.0 (https://gek2or.github.io/donetsk-2011/; photo cache for the project site)"
M = json.load(open("photos/manifest.json", encoding="utf-8"))["items"]
new, failed = 0, []
for h, e in M.items():
    path = f"photos/{h}.jpg"
    if os.path.exists(path):
        continue
    data = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(e["url"], headers={"User-Agent": UA})
            data = urllib.request.urlopen(req, timeout=60).read()
            break
        except Exception as ex:  # noqa: BLE001
            print("retry", attempt + 1, e["url"], ex, file=sys.stderr)
            time.sleep(4 * (attempt + 1))
    if not data:
        failed.append(e["url"])
        continue
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w = int(e.get("w", 1280))
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(path, "JPEG", quality=80, optimize=True, progressive=True)
    new += 1
    time.sleep(1.2)
have = sorted(f[:-4] for f in os.listdir("photos") if f.endswith(".jpg") and f[:-4] in M)
# WebP copies: full size and 640 px for thumbnails and phones
webp = []
for h in have:
    full, small = f"photos/{h}.webp", f"photos/{h}-640.webp"
    if not (os.path.exists(full) and os.path.exists(small)):
        im = Image.open(f"photos/{h}.jpg").convert("RGB")
        im.save(full, "WEBP", quality=76, method=6)
        sm = im if im.width <= 640 else im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
        sm.save(small, "WEBP", quality=74, method=6)
    webp.append(h)
open("photos/have.js", "w").write("window.__PHHAVE=" + json.dumps(have) + ";window.__PHW=" + json.dumps(webp) + ";\n")
print(f"new {new}, cached {len(have)} of {len(M)}, failed {len(failed)}")
for u in failed:
    print("FAILED", u)
