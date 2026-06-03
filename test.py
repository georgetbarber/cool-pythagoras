import re

with open('engine.js', 'r') as f:
    engine_code = f.read()

with open('diatonic.js', 'r') as f:
    diatonic_code = f.read()

# Extract keys from CHORD_INTERVAL_NAMES
names_match = re.search(r'export const CHORD_INTERVAL_NAMES = \{(.*?)\};', engine_code, re.DOTALL)
if names_match:
    dict_content = names_match.group(1)
    keys = re.findall(r"'([^']+)'\s*:", dict_content)
    print("Keys in engine.js:", keys)
else:
    print("Could not find CHORD_INTERVAL_NAMES")
    keys = []

# Extract qualities from diatonic.js
qualities = set(re.findall(r"quality:\s*'([^']+)'", diatonic_code))
print("Qualities in diatonic.js:", qualities)

missing = [q for q in qualities if q not in keys]
print("Missing qualities:", missing)
