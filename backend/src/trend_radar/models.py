from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


@dataclass(frozen=True)
class RawItem:
    uid: str
    title: str
    url: str
    source: str
    published_at: datetime
    summary: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class TrendItem:
    uid: str
    title: str
    url: str
    source: str
    published_at: datetime
    score: float
    explanation: str | None = None


class TrendItemDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: str
    title: str
    url: str
    source: str
    published_at: datetime
    score: float
    explanation: str | None = None
