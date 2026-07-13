"""Validate the original app's chord formulas and interval labels."""

from pathlib import Path
import re
import sys


APP_ROOT = Path(__file__).resolve().parents[1]
ENGINE_PATH = APP_ROOT / "src" / "core" / "engine.js"
DIATONIC_PATH = APP_ROOT / "src" / "core" / "diatonic.js"


def parse_maps(source: str) -> tuple[dict[str, str], dict[str, str]]:
    before_names, after_names = source.split("CHORD_INTERVAL_NAMES", maxsplit=1)
    formula_pattern = r"'([^']+)':\s*\[(.*?)\]"
    return (
        dict(re.findall(formula_pattern, before_names)),
        dict(re.findall(formula_pattern, after_names)),
    )


def item_count(items: str) -> int:
    return len([item for item in items.split(",") if item.strip()])


def main() -> int:
    engine = ENGINE_PATH.read_text(encoding="utf-8")
    diatonic = DIATONIC_PATH.read_text(encoding="utf-8")
    formulas, labels = parse_maps(engine)
    used_qualities = set(re.findall(r"quality:\s*'([^']+)'", diatonic))

    errors: list[str] = []
    missing_formulas = sorted(used_qualities - formulas.keys())
    missing_labels = sorted(used_qualities - labels.keys())
    if missing_formulas:
        errors.append(f"Missing chord formulas: {', '.join(missing_formulas)}")
    if missing_labels:
        errors.append(f"Missing interval labels: {', '.join(missing_labels)}")

    for quality, formula in formulas.items():
        if quality in labels and item_count(formula) != item_count(labels[quality]):
            errors.append(
                f"{quality}: {item_count(formula)} formula tones but "
                f"{item_count(labels[quality])} interval labels"
            )

    if errors:
        print("Original dashboard validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "Original dashboard chord data is consistent "
        f"({len(used_qualities)} qualities checked)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
