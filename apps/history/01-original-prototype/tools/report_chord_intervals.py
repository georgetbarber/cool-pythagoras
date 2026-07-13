import re
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]

with (APP_ROOT / 'src' / 'core' / 'engine.js').open('r') as f:
    engine_code = f.read()

with (APP_ROOT / 'src' / 'core' / 'diatonic.js').open('r') as f:
    diatonic_code = f.read()

# Parse CHORD_INTERVAL_NAMES
names_match = re.search(r'export const CHORD_INTERVAL_NAMES = \{(.*?)\};', engine_code, re.DOTALL)
dict_content = names_match.group(1)
intervals_dict = {}
for match in re.finditer(r"'([^']+)'\s*:\s*\[(.*?)\]", dict_content):
    quality = match.group(1)
    intervals = [i.strip().strip("'\"") for i in match.group(2).split(',')]
    intervals_dict[quality] = ", ".join(intervals)

# Parse diatonic chords
qualities = set(re.findall(r"quality:\s*'([^']+)'", diatonic_code))

for q in qualities:
    if q not in intervals_dict:
        print(f"Missing in dict: {q}")
    elif not intervals_dict[q]:
        print(f"Empty string for: {q}")
    else:
        # print(f"{q} -> {intervals_dict[q]}")
        pass

print("Original dashboard interval report is complete.")
