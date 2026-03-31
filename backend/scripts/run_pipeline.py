from __future__ import annotations

import argparse
from pathlib import Path

from trend_radar.pipeline import run_pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Trend Radar pipeline")
    parser.add_argument("--output", type=Path, default=None, help="Output JSON path")
    args = parser.parse_args()

    payload = run_pipeline(args.output)
    print(f"Generated {len(payload.get('items', []))} trend items")


if __name__ == "__main__":
    main()
