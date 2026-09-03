#!/usr/bin/env python3
"""Resolve award-winner posters from Wikipedia infoboxes once and bake stable
upload.wikimedia.org URLs into data/awards.json (runtime stays keyless & fast).
Usage: python3 scripts/resolve_award_posters.py [--force]"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
FILE = os.path.join(ROOT, "data", "awards.json")
UA = {"User-Agent": "MADWORLD-Archive/7.0 (personal archive poster resolver)"}
FORCE = "--force" in sys.argv


def get(url, as_json=True):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as response:
                if not as_json:
                    return response.geturl()
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            if error.code == 429:
                time.sleep(8 * (attempt + 1))
                continue
            raise
    return None


def infobox_image(page):
    data = get(f"https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&rvsection=0&format=json&redirects=1&titles={urllib.parse.quote(page)}")
    if not data:
        return None
    node = list(data["query"]["pages"].values())[0]
    text = node.get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "")
    match = re.search(r"\|\s*(?:image|cover|key_visual)\s*=\s*(?:\[\[(?:File|Image):)?([^|\]\n]+\.(?:jpe?g|png|webp))", text, re.I)
    return match.group(1).strip() if match else None


def file_url(filename):
    return get(f"https://en.wikipedia.org/wiki/Special:FilePath/{urllib.parse.quote(filename.replace(' ', '_'))}", as_json=False)


def main():
    with open(FILE, encoding="utf-8") as handle:
        awards = json.load(handle)
    for track, config in awards["tracks"].items():
        for winner in config["winners"]:
            if winner.get("poster") and not FORCE:
                continue
            for page in [winner["wiki"], winner.get("fallbackWiki")]:
                if not page:
                    continue
                try:
                    filename = infobox_image(page)
                    if filename:
                        url = file_url(filename)
                        if url and "upload.wikimedia.org" in url:
                            winner["poster"] = url
                            print(f"[{track}] {winner['year']} {winner['title']} -> {filename}")
                            break
                    print(f"[{track}] {winner['year']} {winner['title']} :: no infobox image on {page}")
                except Exception as error:
                    print(f"[{track}] {winner['year']} {winner['title']} !! {error}")
                time.sleep(2.5)
            with open(FILE, "w", encoding="utf-8") as handle:
                json.dump(awards, handle, indent=2, ensure_ascii=False)
                handle.write("\n")
    print("done")


if __name__ == "__main__":
    main()
