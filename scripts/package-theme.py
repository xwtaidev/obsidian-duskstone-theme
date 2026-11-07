"""Build a manual-install ZIP containing only the theme and its license."""
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "manifest.json").read_text())
name, version = manifest["name"], manifest["version"]
output = root / "dist" / f"{name}-{version}.zip"
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
    for filename in ("manifest.json", "theme.css", "LICENSE"):
        archive.write(root / filename, f"{name}/{filename}")
with zipfile.ZipFile(output) as archive:
    if archive.testzip() is not None:
        raise SystemExit("ZIP integrity check failed")
    for filename in ("manifest.json", "theme.css", "LICENSE"):
        if archive.read(f"{name}/{filename}") != (root / filename).read_bytes():
            raise SystemExit(f"ZIP content mismatch: {filename}")
print(output)
