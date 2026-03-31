from __future__ import annotations

from ..models import Axis, Evidence, TrendItem


def collect_samples() -> list[TrendItem]:
    return [
        TrendItem(
            id="late-night-comfort",
            title="Late night comfort: warm delivery is rising",
            window="today",
            score=92,
            predictive_score=74,
            verdict="live",
            evidence=[Evidence(source_key="telegram")],
            admin_score=None,
            admin_notes=[],
            why_live="Recurring mentions + stable demand.",
            scene="Late evening routine, wants a small comfort.",
            risk="Can slip into generic night-food clichés.",
            locale="ru-RU",
            region_bias_score=0.2,
            works=["Comfort", "Low effort", "Everyday scene"],
            avoid=["Meme-only angle", "Overhyped urgency"],
            angles=["One more episode and something warm"],
            axes=[Axis(label="Native", value="high")],
        ),
        TrendItem(
            id="meal-prep",
            title="Weekly meal prep kits",
            window="week",
            score=86,
            predictive_score=68,
            verdict="live but narrow",
            evidence=[Evidence(source_key="tiktok")],
            admin_score=None,
            admin_notes=[],
            why_live="Stable growth in mentions.",
            scene="Morning planning, wants clarity and order.",
            risk="Can turn into diet-heavy messaging.",
            locale="ru-RU",
            region_bias_score=0.15,
            works=["Routine", "Control"],
            avoid=["Too rational tone"],
            angles=["Normal food without extra effort"],
            axes=[Axis(label="Native", value="medium")],
        ),
    ]
