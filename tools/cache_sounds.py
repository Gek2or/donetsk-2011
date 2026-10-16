"""Download the Wikimedia Commons recordings listed in sound/radio.json,
cut each one into a seamless loop and keep it as photos/radio/<id>.mp3
(photos/ is the folder the site's GitHub workflow commits back).
Authors and licences are credited under every station on the Sounds page.
Runs at the end of tools/cache_photos.py; needs ffmpeg, which it installs on the runner if missing."""
import array, json, math, os, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request

UA = "Donetsk2011-site/1.0 (https://gek2or.github.io/donetsk-2011/; sound cache for the project site)"
SR = 44100
FADE = 2.0  # seconds of crossfade where the loop wraps around
OUT = "photos/radio"


def ensure_ffmpeg():
    if shutil.which("ffmpeg"):
        return True
    try:
        subprocess.run(["sudo", "apt-get", "update", "-qq"], check=True)
        subprocess.run(["sudo", "apt-get", "install", "-y", "-qq", "ffmpeg"], check=True)
    except Exception as ex:  # noqa: BLE001
        print("no ffmpeg:", ex, file=sys.stderr)
    return bool(shutil.which("ffmpeg"))


def fetch(name, url=None):
    url = url or "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(name.replace(" ", "_"))
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=120).read()
        except Exception as ex:  # noqa: BLE001
            print("retry", attempt + 1, name, ex, file=sys.stderr)
            time.sleep(5 * (attempt + 1))
    return None


def decode(data, start, length):
    with tempfile.NamedTemporaryFile(delete=False) as f:
        f.write(data)
        src = f.name
    try:
        raw = subprocess.run(
            ["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(length + FADE), "-i", src,
             "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
            check=True, capture_output=True).stdout
    finally:
        os.unlink(src)
    x = array.array("f")
    x.frombytes(raw[: len(raw) // 4 * 4])
    if sys.byteorder != "little":
        x.byteswap()
    return x


def make_loop(x):
    """The last FADE seconds are blended into the first ones, so the clip repeats without a click."""
    n = int(FADE * SR)
    if len(x) < 3 * n:
        return x
    body, tail = x[:-n], x[-n:]
    for i in range(n):
        r = i / n
        body[i] = body[i] * math.sqrt(r) + tail[i] * math.sqrt(1.0 - r)
    return body


def level(x, target_db=-20.0):
    ss = sum(v * v for v in x[::8]) / max(1, len(x[::8]))
    gain = 10 ** (target_db / 20) / (math.sqrt(ss) or 1e-9)
    peak = max(abs(v) for v in x) * gain or 1.0
    if peak > 0.95:
        gain *= 0.95 / peak
    return array.array("f", (v * gain for v in x))


def encode(x, path):
    if sys.byteorder != "little":
        x = array.array("f", x)
        x.byteswap()
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-c:a", "libmp3lame", "-b:a", "96k", path],
        input=x.tobytes(), check=True)


def main():
    if not os.path.exists("sound/radio.json"):
        return
    items = json.load(open("sound/radio.json", encoding="utf-8"))["items"]
    os.makedirs(OUT, exist_ok=True)
    todo = [k for k in items if not os.path.exists(f"{OUT}/{k}.mp3")]
    new, failed = 0, []
    if todo and not ensure_ffmpeg():
        failed = todo
        todo = []
    for key in todo:
        e = items[key]
        data = fetch(e["file"], e.get("url"))
        if not data:
            failed.append(e["file"])
            continue
        try:
            encode(level(make_loop(decode(data, e.get("start", 0), e.get("len", 60)))), f"{OUT}/{key}.mp3")
            new += 1
        except Exception as ex:  # noqa: BLE001
            print("FAILED to convert", e["file"], ex, file=sys.stderr)
            failed.append(e["file"])
        time.sleep(1.5)
    have = sorted(k for k in items if os.path.exists(f"{OUT}/{k}.mp3"))
    json.dump(have, open(f"{OUT}/have.json", "w"))
    print(f"sounds: new {new}, cached {len(have)} of {len(items)}, failed {len(failed)}")
    for name in failed:
        print("FAILED", name)


if __name__ == "__main__":
    main()
