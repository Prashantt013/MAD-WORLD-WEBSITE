#!/usr/bin/env python3
"""
MAD WORLD - Google Sheet -> data/*.json sync

Pulls the public MAD WORLD master spreadsheet and merges it into the local JSON
archive. The sheet is the source of truth for poster URLs (fixes poster
mismatches), famous quotes, Prashant notes, summaries and ratings.

Existing ids / slugs / hall_of_fame flags in the JSON are preserved. Titles that
exist in the sheet but not in the JSON are appended with new ids.

Usage:  python3 scripts/sync_sheet.py
"""
import csv
import io
import json
import os
import re
import sys
import urllib.request

SHEET_ID = os.environ.get("MADWORLD_SHEET_ID", "1gncSPbMEYNIHIcCdKYUWnxUiC14h_TdMPfeVApwhM34")
TABS = {
    "games": 1895541514,
    "anime": 305524185,
    "english": 319273709,
    "indian": 1424944920,
    "horror": 980715377,
    "characters": 796195342,
}
ROOT = os.path.join(os.path.dirname(__file__), "..")
DATA = os.path.join(ROOT, "data")
URL_RE = re.compile(r"^https?://", re.I)


def fetch(gid):
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={gid}"
    with urllib.request.urlopen(url, timeout=30) as response:
        text = response.read().decode("utf-8")
    rows = list(csv.reader(io.StringIO(text)))
    header_index = next(i for i, row in enumerate(rows) if row and row[0].strip() in ("Title", "Character Name"))
    header = [cell.strip() for cell in rows[header_index]]
    records = []
    for row in rows[header_index + 1:]:
        if not row or not row[0].strip():
            continue
        row = row + [""] * (len(header) - len(row))
        records.append(dict(zip(header, [cell.strip() for cell in row])))
    return records


def slugify(value):
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def normalize(value):
    return re.sub(r"[^a-z0-9]", "", value.lower().replace("&", "and"))


def poster_from(record):
    """Return the first http(s) URL found in any poster-like column (handles shifted rows)."""
    for key in ("Poster Link", "Cover/Poster", "Poster", "Hall of Fame"):
        value = record.get(key, "")
        if URL_RE.match(value):
            return value
    return None


def parse_rating(value):
    match = re.search(r"(\d+(?:\.\d+)?)", value or "")
    return float(match.group(1)) if match else None


def split_genre(value):
    return [part.strip() for part in re.split(r"[,/]", value or "") if part.strip()]


def load(name):
    with open(os.path.join(DATA, f"{name}.json"), encoding="utf-8") as handle:
        return json.load(handle)


def save(name, payload):
    with open(os.path.join(DATA, f"{name}.json"), "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def merge_titles(existing, records, category, extra):
    by_key = {normalize(item["title"]): item for item in existing}
    next_id = max([item["id"] for item in existing] + [0]) + 1
    updated, added = 0, 0
    for record in records:
        title = record.get("Title", "").strip()
        if not title:
            continue
        item = by_key.get(normalize(title))
        poster = poster_from(record)
        if item is None:
            item = {
                "id": next_id, "slug": slugify(title), "title": title, "category": category, "status": None, "genre": [],
                "rating_external": None, "rating_external_num": None, "cover_url": None, "local_cover": None, "summary": None,
                "famous_quote": None, "prashant_note": None, "why_in_madworld": None, "hall_of_fame": False, "hof_rank": None,
                "hof_induction_note": None, "personal_rating": None, "date_added": None, "date_completed": None, "tags": [],
            }
            next_id += 1
            existing.append(item)
            by_key[normalize(title)] = item
            added += 1
        else:
            updated += 1
        # Poster: sheet URL wins. Keep the previous local file as a fallback.
        if poster:
            if item.get("cover_url") and not URL_RE.match(item["cover_url"]):
                item["local_cover"] = item["cover_url"]
            item["cover_url"] = poster
        elif item.get("cover_url") and not URL_RE.match(item["cover_url"]):
            item["local_cover"] = item["cover_url"]
        # Text fields: sheet value wins when present.
        for sheet_key, json_key in (("Status", "status"), ("Summary", "summary"), ("Famous Quote", "famous_quote"), ("Prashant Note", "prashant_note")):
            value = record.get(sheet_key, "").strip()
            if value:
                item[json_key] = value
        if record.get("Genre", "").strip():
            item["genre"] = split_genre(record["Genre"])
        if record.get("Rating", "").strip():
            item["rating_external"] = record["Rating"].strip()
            item["rating_external_num"] = parse_rating(record["Rating"])
        extra(item, record)
    return updated, added


def anime_extra(item, record):
    if record.get("Episodes"):
        item["episode_count"] = parse_rating(record["Episodes"]) or record["Episodes"]
    if record.get("Season"):
        item["season"] = record["Season"]
    if record.get("Up to Date (*)"):
        item["up_to_date"] = record["Up to Date (*)"].lower().startswith("y")
    if record.get("Favorite Character"):
        item["favorite_character"] = record["Favorite Character"]
    if record.get("Favorite Moment"):
        item["favorite_moment"] = record["Favorite Moment"]


def show_extra(language):
    def apply(item, record):
        item["language"] = language
        if record.get("Season"):
            item["season"] = record["Season"]
        if record.get("Episodes"):
            item["episode_count"] = record["Episodes"]
        if record.get("Up to Date (*)"):
            item["up_to_date"] = record["Up to Date (*)"].lower().startswith("y")
    return apply


def merge_characters(existing, records):
    by_key = {normalize(item["name"]): item for item in existing}
    next_id = max([item["id"] for item in existing] + [0]) + 1
    updated, added = 0, 0
    for record in records:
        name = record.get("Character Name", "").strip()
        if not name:
            continue
        item = by_key.get(normalize(name))
        if item is None:
            item = {"id": next_id, "slug": slugify(name), "name": name, "franchise": None, "title_id": None, "type": None, "famous_line": None, "bio": None, "screen_time": None, "favorite_rank": None, "cover_url": None, "local_cover": None}
            next_id += 1
            existing.append(item)
            by_key[normalize(name)] = item
            added += 1
        else:
            updated += 1
        poster = poster_from(record)
        if item.get("cover_url") and not URL_RE.match(item["cover_url"]):
            item["local_cover"] = item["cover_url"]
        if poster:
            item["cover_url"] = poster
        for sheet_key, json_key in (("Franchise", "franchise"), ("Type", "type"), ("Famous Line", "famous_line"), ("Approx Screen Time", "screen_time"), ("Character Bio", "bio")):
            if record.get(sheet_key, "").strip():
                item[json_key] = record[sheet_key].strip()
    return updated, added


def main():
    print("Fetching MAD WORLD master sheet...")
    sheet = {name: fetch(gid) for name, gid in TABS.items()}

    games = load("games")
    print("games:   updated/added", merge_titles(games, sheet["games"], "games", lambda *_: None))
    save("games", games)

    anime = load("anime")
    print("anime:   updated/added", merge_titles(anime, sheet["anime"], "anime", anime_extra))
    save("anime", anime)

    shows = load("shows")
    print("english: updated/added", merge_titles(shows, sheet["english"], "shows", show_extra("English")))
    print("indian:  updated/added", merge_titles(shows, sheet["indian"], "shows", show_extra("Indian")))
    save("shows", shows)

    horror = load("horror")
    print("horror:  updated/added", merge_titles(horror, sheet["horror"], "horror", lambda *_: None))
    save("horror", horror)

    characters = load("characters")
    print("chars:   updated/added", merge_characters(characters, sheet["characters"]))
    save("characters", characters)

    # Rebuild quotes from famous quotes so the Quote Room always reflects the sheet.
    quotes = load("quotes")
    known = {(quote["title_id"], normalize(quote["text"])) for quote in quotes}
    next_id = max([quote["id"] for quote in quotes] + [0]) + 1
    added = 0
    for collection in (games, anime, shows):
        for item in collection:
            quote = (item.get("famous_quote") or "").strip()
            if quote and (item["id"], normalize(quote)) not in known:
                quotes.append({"id": next_id, "text": quote, "title_id": item["id"], "title_slug": item["slug"], "title_name": item["title"], "category_ref": item["category"], "character_id": None, "quote_category": "iconic"})
                known.add((item["id"], normalize(quote)))
                next_id += 1
                added += 1
    save("quotes", quotes)
    print("quotes:  added", added, "total", len(quotes))
    print("Done.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # pragma: no cover
        print("Sync failed:", error)
        sys.exit(1)
