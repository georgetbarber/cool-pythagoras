import re

with open('diatonic.js', 'r') as f:
    diatonic = f.read()

with open('engine.js', 'r') as f:
    engine = f.read()

engine_names = dict(re.findall(r"'([^']+)':\s*\[(.*?)\]", engine.split('CHORD_INTERVAL_NAMES')[1]))

diat_qualities = set(re.findall(r"quality:\s*'([^']+)'", diatonic))

missing = []
for q in diat_qualities:
    if q not in engine_names:
        missing.append(q)

print("Missing in CHORD_INTERVAL_NAMES:", missing)
