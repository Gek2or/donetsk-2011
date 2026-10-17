"""v5.5: SRTM relief for the 3D reference map (4.37 x 2.84 km around the quarter).
Downloads the same SRTM3 v2.1 tile the project already uses (N47E037, original non-void-filled product,
Kurviger mirror of the USGS archive), checks its SHA-256 against the project's terrain record, samples it
bilinearly on a 30 m grid in the quarter's local metres and writes photos/terrain/district.json.
Heights are relative to the quarter's own terrain: the script fits one vertical offset against the quarter
grid (QG below, from q3d.json) and stores the fit error, so the map and the quarter meet without a step.
Runs at the end of tools/cache_photos.py in the site workflow; does nothing once the file exists."""
import hashlib, io, json, math, os, struct, sys, time, urllib.request, zipfile

URL = "https://srtm.kurviger.de/SRTM3/Eurasia/N47E037.hgt.zip"
SHA = "3c78466e754f46435a656b0786b7058972a16ea6d262ea91b509673e22996d58"
UA = "Donetsk2011-site/1.0 (https://gek2or.github.io/donetsk-2011/; terrain cache for the project site)"
OUT = "photos/terrain/district.json"
LAT0, LON0 = 47.9925931, 37.8184382
KX, KY = 111320 * math.cos(math.radians(LAT0)), 110574
FRAME = [-2008, -1572, 2354, 1257]  # x0, y0, x1, y1 in local metres (assets/district.json f)
S = 30
QG = {"x": -210, "y": -570, "s": 30, "h": [[1.7, 0.1, 0.4, -0.1, -1.3, -2.8, -5.3, -7.6, -9, -8.2, -6.9, -7.4, -9.8, -11.2], [6.8, 4, 3.5, 2.7, -0.6, -3.4, -4.8, -5.7, -7, -7.4, -6.7, -6.7, -7.9, -10.6], [11.3, 7.4, 5.8, 4.1, 0.3, -2, -3.3, -4.6, -6.9, -8.2, -8.4, -8.9, -10.4, -12], [12, 8.9, 5.6, 3.6, 0.8, -0.1, -0.7, -2.6, -5.4, -8, -10.4, -11.8, -12.4, -13.5], [9.7, 7.9, 5.7, 4.1, 2.4, 1.2, 0.8, -1.4, -4.2, -7.1, -10, -11.8, -11.9, -11.1], [8.7, 7.3, 6.2, 5.7, 4.3, 2.9, 1.6, -1.1, -4, -6.9, -9, -10.1, -10.1, -9.9], [9.4, 7.3, 6.7, 6.3, 5.6, 4.2, 2.7, 0.4, -3.2, -6.1, -8.7, -9.7, -10.4, -10.8], [9.8, 7.9, 7.1, 6.9, 6.8, 5.8, 3.6, 1, -2.2, -4.7, -7.2, -9.3, -10.6, -11.8], [10.4, 8.9, 7.7, 7.3, 7.3, 6.6, 4, 1.1, -1.8, -3.5, -5.3, -7.3, -9.7, -11.5], [11.4, 9.4, 7.9, 6.8, 7.3, 6.6, 3.4, 0.5, -1.7, -2.9, -4, -5.8, -8.7, -11.1], [11.9, 9.5, 7.4, 6.4, 6.8, 6.1, 3, -0.4, -2.9, -3.6, -4.3, -5.2, -8.2, -11], [11.4, 9.5, 7.3, 6.3, 6.3, 5.3, 2.5, -0.5, -3.1, -4.1, -4.7, -5, -7.1, -9.3], [10.6, 9.5, 7.8, 6.4, 6.2, 4.8, 2.7, 0.3, -1, -3.6, -4.6, -5.4, -6, -7.7], [10.2, 9.1, 8.1, 7, 6.1, 4.7, 3.2, 1, -0.7, -3.3, -5.1, -5.7, -5.7, -6.7], [9.7, 8.8, 8.6, 7.9, 6.6, 5.2, 3.7, 1.3, -1.6, -3.5, -5.1, -5.7, -5.7, -6.7], [9.3, 9.6, 9.2, 8.4, 7.5, 5.5, 3.8, 1.6, -1.1, -3.4, -5.1, -6.3, -6.7, -7.5], [9.1, 9.8, 9.2, 8.5, 7.7, 5, 2.9, 1.9, -0.5, -3.5, -6.3, -7.8, -8.2, -8.3], [8.8, 9.1, 8.5, 7.4, 6.5, 4.4, 2.7, 1.7, -0.8, -4.1, -7.3, -8.7, -8.7, -8.8], [9.5, 8.6, 6.8, 5.1, 4.6, 3.3, 3, 1.1, -1.8, -5.1, -7.4, -8.3, -8.5, -8.7], [10.1, 8.4, 5.8, 3.6, 3, 2, 1.7, 0, -3, -6, -7.1, -7.3, -7.9, -8.7], [9.9, 7.7, 4.9, 2.8, 2, 1.3, 0.4, -1.2, -4.2, -5.9, -6.7, -6.4, -7.3, -8.8], [9.1, 7.1, 4.3, 1.6, 1.1, 1.1, 0.2, -1.5, -4, -5.5, -5.9, -5.5, -7.1, -8.7], [9.2, 7.8, 5.4, 1.5, 0.1, 0.1, -0.6, -2, -3.3, -4.3, -4.6, -5.1, -6.4, -7.7], [9.4, 8.9, 7.4, 3.2, -0.2, -0.6, -0.7, -1.9, -2.4, -3.7, -5.2, -5.7, -5.7, -5.7], [10.3, 10, 9.4, 5.6, 1.6, -0.1, -0.8, -1.3, -1.4, -3, -4.6, -5.7, -5.7, -5.7], [11.3, 11.2, 10.3, 6.9, 2.7, 0.2, -1.2, -0.9, -1.5, -2.8, -4.3, -5.5, -5.7, -5.7], [11.2, 10.3, 10.2, 7, 3.6, 1.9, 0.6, -1.6, -2.4, -2.8, -4.3, -4.7, -5.7, -5.7]], "ref": 143.7}


def fetch():
    for attempt in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": UA}), timeout=180).read()
        except Exception as ex:  # noqa: BLE001
            print("retry", attempt + 1, ex, file=sys.stderr)
            time.sleep(10 * (attempt + 1))
    return None


def main():
    if os.path.exists(OUT):
        return
    data = fetch()
    if not data:
        print("terrain: download failed"); return
    if hashlib.sha256(data).hexdigest() != SHA:
        print("terrain: SHA-256 mismatch, not used"); return
    z = zipfile.ZipFile(io.BytesIO(data))
    raw = z.read([n for n in z.namelist() if n.lower().endswith(".hgt")][0])
    n = int(math.isqrt(len(raw) // 2))
    v = list(struct.unpack(">%dh" % (n * n), raw))

    def px(r, c):
        r = min(n - 1, max(0, r)); c = min(n - 1, max(0, c)); h = v[r * n + c]
        if h > -1000:
            return h
        ok = [v[rr * n + cc] for rr in range(r - 2, r + 3) for cc in range(c - 2, c + 3)
              if 0 <= rr < n and 0 <= cc < n and v[rr * n + cc] > -1000]
        return sum(ok) / len(ok) if ok else 0

    def srtm(x, y):
        lat, lon = LAT0 + y / KY, LON0 + x / KX
        fr, fc = (48 - lat) * (n - 1), (lon - 37) * (n - 1)
        r, c = int(fr), int(fc); u, w = fc - c, fr - r
        return (px(r, c) * (1 - u) + px(r, c + 1) * u) * (1 - w) + (px(r + 1, c) * (1 - u) + px(r + 1, c + 1) * u) * w

    d = [srtm(QG["x"] + i * QG["s"], QG["y"] + j * QG["s"]) - QG["h"][j][i] for j in range(len(QG["h"])) for i in range(len(QG["h"][0]))]
    off = sum(d) / len(d)
    rms = math.sqrt(sum((e - off) ** 2 for e in d) / len(d))
    x0, y0 = FRAME[0] - 60, FRAME[1] - 60
    nx, ny = math.ceil((FRAME[2] + 60 - x0) / S) + 1, math.ceil((FRAME[3] + 60 - y0) / S) + 1
    h = [round((srtm(x0 + i * S, y0 + j * S) - off) * 10) for j in range(ny) for i in range(nx)]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"src": "SRTM3 v2.1 N47E037 (2000), " + URL, "sha256": SHA, "note": "decimetres relative to the quarter terrain (q3d.json t)",
               "offset_m": round(off, 2), "fit_rms_m": round(rms, 2), "x": x0, "y": y0, "s": S, "nx": nx, "ny": ny, "h": h},
              open(OUT, "w"), separators=(",", ":"))
    print(f"terrain: {nx}x{ny} cells, offset {off:.2f} m, fit rms {rms:.2f} m against the quarter grid")


if __name__ == "__main__":
    main()
