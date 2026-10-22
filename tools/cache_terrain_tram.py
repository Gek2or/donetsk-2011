"""v6.7: SRTM relief along tram route 1, for the cab view (assets/tram3d.json uses the same local frame).
Downloads SRTM3 v2.1 tiles N47E037 and N48E037 (original product, Kurviger mirror of the USGS archive; the
N47E037 file is checked against the project's SHA-256), samples them bilinearly on a 30 m grid covering the
route corridor and writes photos/terrain/tram1.json with heights in decimetres above the lowest cell.
Frame: metres east/north of 48.02 N, 37.78 E. Runs from tools/cache_photos.py; does nothing once the file exists."""
import hashlib, io, json, math, os, struct, sys, time, urllib.request, zipfile

TILES = {"N47E037": ("https://srtm.kurviger.de/SRTM3/Eurasia/N47E037.hgt.zip", "3c78466e754f46435a656b0786b7058972a16ea6d262ea91b509673e22996d58"),
         "N48E037": ("https://srtm.kurviger.de/SRTM3/Eurasia/N48E037.hgt.zip", None)}
UA = "Donetsk2011-site/1.0 (https://gek2or.github.io/donetsk-2011/; terrain cache for the project site)"
OUT = "photos/terrain/tram1.json"
LAT0, LON0 = 48.02, 37.78
KX, KY = 111320 * math.cos(math.radians(LAT0)), 111180
X0, Y0, X1, Y1 = -2800, -4150, 2550, 4050
S = 30


def fetch(url):
    for attempt in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=180).read()
        except Exception as ex:  # noqa: BLE001
            print("retry", attempt + 1, ex, file=sys.stderr)
            time.sleep(10 * (attempt + 1))
    return None


def tile(name):
    url, sha = TILES[name]
    data = fetch(url)
    if not data:
        raise RuntimeError("download failed: " + name)
    got = hashlib.sha256(data).hexdigest()
    if sha and got != sha:
        raise RuntimeError("SHA-256 mismatch: " + name)
    z = zipfile.ZipFile(io.BytesIO(data))
    raw = z.read([n for n in z.namelist() if n.lower().endswith(".hgt")][0])
    n = int(math.isqrt(len(raw) // 2))
    return {"n": n, "v": struct.unpack(">%dh" % (n * n), raw), "sha": got}


def main():
    if os.path.exists(OUT):
        return
    T = {k: tile(k) for k in TILES}

    def px(t, r, c):
        n, v = t["n"], t["v"]
        r = min(n - 1, max(0, r)); c = min(n - 1, max(0, c)); h = v[r * n + c]
        if h > -1000:
            return h
        ok = [v[rr * n + cc] for rr in range(r - 2, r + 3) for cc in range(c - 2, c + 3) if 0 <= rr < n and 0 <= cc < n and v[rr * n + cc] > -1000]
        return sum(ok) / len(ok) if ok else 0

    def srtm(x, y):
        lat, lon = LAT0 + y / KY, LON0 + x / KX
        t = T["N48E037" if lat >= 48 else "N47E037"]; n = t["n"]; base = 49 if lat >= 48 else 48
        fr, fc = (base - lat) * (n - 1), (lon - 37) * (n - 1)
        r, c = int(fr), int(fc); u, w = fc - c, fr - r
        return (px(t, r, c) * (1 - u) + px(t, r, c + 1) * u) * (1 - w) + (px(t, r + 1, c) * (1 - u) + px(t, r + 1, c + 1) * u) * w

    nx, ny = (X1 - X0) // S + 1, (Y1 - Y0) // S + 1
    h = [srtm(X0 + i * S, Y0 + j * S) for j in range(ny) for i in range(nx)]
    ref = min(h)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"src": "SRTM3 v2.1 (2000) N47E037 + N48E037, srtm.kurviger.de", "sha256": {k: t["sha"] for k, t in T.items()},
               "o": [LAT0, LON0], "ref_m": round(ref, 1), "x": X0, "y": Y0, "s": S, "nx": nx, "ny": ny, "h": [round((v - ref) * 10) for v in h]},
              open(OUT, "w"), separators=(",", ":"))
    print(f"tram terrain: {nx}x{ny} cells, {min(h):.0f}-{max(h):.0f} m")


if __name__ == "__main__":
    main()
