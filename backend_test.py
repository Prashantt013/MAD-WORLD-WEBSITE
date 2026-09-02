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
            return response.status, json.loads(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw}
        return exc.code, payload


def check(label, condition, detail):
    if condition:
        print(f"PASS: {label} ({detail})")
    else:
        print(f"FINDING: {label} ({detail})")


def main():
    status, payload = request("GET", "")
    check("GET /api summary", status == 200 and all(k in payload for k in ("stats", "titleCount", "characterCount", "quoteCount")), f"HTTP {status}, keys={list(payload)}")

    status, payload = request("GET", "/titles")
    titles = payload.get("titles", []) if isinstance(payload, dict) else []
    check("GET /api/titles", status == 200 and bool(titles) and any("GTA Vice City" in json.dumps(item) for item in titles), f"HTTP {status}, count={len(titles)}")

    status, payload = request("GET", "/characters")
    characters = payload.get("characters", []) if isinstance(payload, dict) else []
    check("GET /api/characters", status == 200 and bool(characters), f"HTTP {status}, count={len(characters)}")

    status, payload = request("GET", "/quotes")
    quotes = payload.get("quotes", []) if isinstance(payload, dict) else []
    check("GET /api/quotes", status == 200 and bool(quotes), f"HTTP {status}, count={len(quotes)}")

    status, payload = request("GET", "/hall-of-fame")
    hall = payload.get("titles", []) if isinstance(payload, dict) else []
    check("GET /api/hall-of-fame", status == 200 and bool(hall), f"HTTP {status}, count={len(hall)}")

    status, payload = request("POST", "", {"name": "Testing Entry", "title": "Game", "status": "Want to Play"})
    check("POST /api valid title", status == 201 and payload.get("ok") is True and bool(payload.get("title", {}).get("id")), f"HTTP {status}, id={payload.get('title', {}).get('id')}")

    status, payload = request("POST", "", {"title": "Game", "status": "Want to Play"})
    check("POST /api missing name", status == 400, f"HTTP {status}")


if __name__ == "__main__":
    main()
