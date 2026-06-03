import re

with open('engine.js', 'r') as f:
    engine_code = f.read()

with open('diatonic.js', 'r') as f:
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

print("Done checking intervals")
