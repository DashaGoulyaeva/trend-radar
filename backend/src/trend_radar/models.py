from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Iterable, Any


@dataclass
class Axis:
    label: str
    value: str


@dataclass
class Evidence:
    source_key: str
    url: str | None = None
    note: str | None = None


@dataclass
class TrendItem:
    id: str
    title: str
    window: str
    score: int
    predictive_score: int
    verdict: str
    evidence: list[Evidence]
    emotion: str = ""
    confidence: float | None = None
    source: str = ""
    source_url: str = ""
    captured_at: str | None = None
    updated_at: str | None = None
    admin_score: int | None = None
    admin_notes: list[str] | None = None
    admin_note: str = ""
    why_live: str = ""
    scene: str = ""
    risk: str = ""
    locale: str = "ru-RU"
    region_bias_score: float = 0.0
    works: list[str] | None = None
    avoid: list[str] | None = None
    angles: list[str] | None = None
    axes: list[Axis] | None = None

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["admin_notes"] = self.admin_notes or []
        payload["works"] = self.works or []
        payload["avoid"] = self.avoid or []
        payload["angles"] = self.angles or []
        payload["axes"] = [axis for axis in payload["axes"]] if payload["axes"] else []
        payload["evidence"] = [ev for ev in payload["evidence"]]
        if not payload.get("source") and payload["evidence"]:
            payload["source"] = payload["evidence"][0].get("source_key", "")
        if not payload.get("source_url") and payload["evidence"]:
            payload["source_url"] = payload["evidence"][0].get("url") or ""
        return payload


TrendItems = Iterable[TrendItem]
