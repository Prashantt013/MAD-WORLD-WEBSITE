import json
import os
import urllib.request
import urllib.error

BASE = os.environ.get("NEXT_PUBLIC_BASE_URL", "https://cinematic-archive-10.preview.emergentagent.com").rstrip("/") + "/api"

def request(method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(BASE + path, data=data, method=method, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            raw = response.read().decode()
            try: payload = json.loads(raw)
            except json.JSONDecodeError: payload = {"raw": raw}
            return response.status, payload, dict(response.headers)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try: payload = json.loads(raw)
        except json.JSONDecodeError: payload = {"raw": raw}
        return exc.code, payload, dict(exc.headers)

def check(label, condition, detail):
    print(("PASS" if condition else "FINDING") + f": {label} ({detail})")

def main():
    status, archive, _ = request("GET", "/archive")
    check("GET /api/archive", status == 200 and all(k in archive for k in ("titles", "characters", "quotes", "stats")), f"HTTP {status}, keys={list(archive) if isinstance(archive, dict) else type(archive)}")
    game = {"kind":"game","name":"Backend Test Game","status":"Want to Play","genre":"RPG","rating":"8.4","summary":"test","poster":"/images/hero-bg.jpg","hallOfFame":False}
    status, created, _ = request("POST", "/archive", game)
    game_id = created.get("id") if isinstance(created, dict) else None
    check("POST game", status == 201 and isinstance(game_id, str) and len(game_id) >= 20, f"HTTP {status}, id={game_id}")
    status, archive2, _ = request("GET", "/archive")
    found = any(x.get("name") == game["name"] for x in archive2.get("titles", [])) if isinstance(archive2, dict) else False
    check("GET archive includes game", status == 200 and found, f"HTTP {status}, found={found}")
    status, _, _ = request("POST", "/archive", game)
    check("duplicate game", status == 409, f"HTTP {status}")
    for label, payload in (("missing kind", {"name":"No Kind"}), ("missing name", {"kind":"game"})):
        status, _, _ = request("POST", "/archive", payload)
        check(label, status == 400, f"HTTP {status}")
    anime = {"kind":"anime","name":"Backend Test Anime","episodes":"24","seasons":"2","studio":"Bones"}
    status, anime_out, _ = request("POST", "/archive", anime)
    check("POST anime fields", status == 201 and anime_out.get("episode_count") == "24" and anime_out.get("season") == "2" and anime_out.get("studio") == "Bones", f"HTTP {status}, payload={anime_out}")
    show = {"kind":"show","name":"Backend Test Show","language":"English"}
    status, show_out, _ = request("POST", "/archive", show)
    check("POST show language", status == 201 and show_out.get("language") == "English", f"HTTP {status}, payload={show_out}")
    character = {"kind":"character","name":"Backend Test Character","franchise":"MAD WORLD","quote":"A test line"}
    status, _, _ = request("POST", "/archive", character)
    status2, archive3, _ = request("GET", "/archive")
    found_char = any(x.get("name") == character["name"] for x in archive3.get("characters", [])) if isinstance(archive3, dict) else False
    check("POST character persists", status == 201 and status2 == 200 and found_char, f"POST {status}, GET {status2}, found={found_char}")
    export_payload = None
    for endpoint in ("/archive/export", "/archive/backup"):
        status, payload, headers = request("GET", endpoint)
        if export_payload is None: export_payload = payload
        check(f"GET {endpoint}", status == 200 and payload.get("format") == "mad-world-v5-archive" and isinstance(payload.get("entries"), list) and "attachment" in headers.get("Content-Disposition", "").lower(), f"HTTP {status}, format={payload.get('format')}, entries={len(payload.get('entries', [])) if isinstance(payload, dict) else 'n/a'}")
    restore = dict(export_payload or {})
    restore["mode"] = "merge"
    status, restored, _ = request("POST", "/archive/restore", restore)
    check("restore merge", status == 200 and isinstance(restored.get("restored"), int), f"HTTP {status}, payload={restored}")
    status, _, _ = request("POST", "/archive/restore", {"format":"invalid","entries":[],"mode":"merge"})
    check("invalid restore", status == 400, f"HTTP {status}")
    for path in ("", "/titles", "/hall-of-fame"):
        status, _, _ = request("GET", path)
        check(f"legacy GET /api{path}", status == 200, f"HTTP {status}")

if __name__ == "__main__":
    main()
