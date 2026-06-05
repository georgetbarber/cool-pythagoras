import re

with open('diatonic.js', 'r') as f:
    diatonic = f.read()

with open('engine.js', 'r') as f:
    engine = f.read()

diat_qualities = set(re.findall(r"quality:\s*'([^']+)'", diatonic))
engine_qualities = set(re.findall(r"'([^']+)':\s*\[", engine.split('CHORD_INTERVAL_NAMES')[1]))

missing = diat_qualities - engine_qualities
print("Missing qualities in engine.js:", missing)
