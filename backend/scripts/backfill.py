from __future__ import annotations

import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill Trend Radar sources")
    parser.add_argument("--days", type=int, default=7)
    parser.parse_args()
    print("Backfill placeholder. Implement source ingestion here.")


if __name__ == "__main__":
    main()
