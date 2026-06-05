import re
import json

with open('engine.js', 'r') as f:
    content = f.read()

intervals = dict(re.findall(r"'([^']+)':\s*\[(.*?)\]", content.split('CHORD_INTERVAL_NAMES')[0]))
names = dict(re.findall(r"'([^']+)':\s*\[(.*?)\]", content.split('CHORD_INTERVAL_NAMES')[1]))

for k in intervals:
    i_len = len(intervals[k].split(','))
    n_len = len(names.get(k, '').split(','))
    if i_len != n_len:
        print(f"Mismatch for {k}: intervals={i_len}, names={n_len}")
