"""Validate the files consumed by the Obsidian theme directory and releases."""
import argparse
import json
from pathlib import Path
import re
import struct

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--tag", help="Release tag; must match manifest.version exactly")
args = parser.parse_args()


def require(condition, message):
    if not condition:
        raise SystemExit(message)


manifest = json.loads((ROOT / "manifest.json").read_text())
for key in ("name", "version", "minAppVersion", "author"):
    require(isinstance(manifest.get(key), str) and manifest[key].strip(), f"Missing {key}")
require(re.fullmatch(r"[A-Za-z0-9 +()\-]+", manifest["name"]), "Invalid theme name")
for key in ("version", "minAppVersion"):
    require(re.fullmatch(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)", manifest[key]), f"Invalid {key}")
if args.tag is not None:
    require(args.tag == manifest["version"], "Tag must match manifest.version without a v prefix")
versions = json.loads((ROOT / "versions.json").read_text())
require(versions.get(manifest["version"]) == manifest["minAppVersion"], "Update versions.json")
package = json.loads((ROOT / "package.json").read_text())
require(package["version"] == manifest["version"], "package.json version must match manifest")
for name in ("theme.css", "README.md", "README.zh-CN.md", "LICENSE", "CHANGELOG.md", "images/light.png", "images/dark.png"):
    require((ROOT / name).is_file() and (ROOT / name).stat().st_size > 0, f"Missing {name}")
css = (ROOT / "theme.css").read_text()
require("body.theme-light" in css and "body.theme-dark" in css, "Both color schemes are required")
require(not re.search(r"@import\b|url\(\s*['\"]?(?:https?:)?//", css, re.I), "Theme must not load remote resources")
png = (ROOT / "screenshot.png").read_bytes()
require(png[:8] == b"\x89PNG\r\n\x1a\n", "screenshot.png must be a PNG")
require(struct.unpack(">II", png[16:24]) == (512, 288), "Store screenshot must be 512 x 288")
for name in ("README.md", "README.zh-CN.md"):
    for link in re.findall(r"\]\(([^)]+)\)", (ROOT / name).read_text()):
        if "://" not in link and not link.startswith("#"):
            require((ROOT / link.split("#")[0]).is_file(), f"Broken link in {name}: {link}")
print(f"Validated {manifest['name']} {manifest['version']} for Obsidian {manifest['minAppVersion']}+")
