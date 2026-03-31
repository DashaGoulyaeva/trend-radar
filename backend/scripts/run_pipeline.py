from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Ensure local deps and src are available when running from repo root
repo_root = Path(__file__).resolve().parents[2]
local_deps = repo_root / "backend" / ".deps"
src_path = repo_root / "backend" / "src"
if local_deps.exists():
    sys.path.insert(0, str(local_deps))
if src_path.exists():
    sys.path.insert(0, str(src_path))

from trend_radar.pipeline import run_pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Trend Radar pipeline")
    parser.add_argument("--output", type=Path, default=None, help="Output JSON path")
    args = parser.parse_args()

    payload = run_pipeline(args.output)
    print(f"Generated {len(payload.get('items', []))} trend items")


if __name__ == "__main__":
    main()
