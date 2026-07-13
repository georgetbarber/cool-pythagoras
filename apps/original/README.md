# Original Dashboard

This folder contains the original dependency-free browser application.

## Run

Double-click `start.command`, or run:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Folder Guide

```text
src/
  app.js       Main dashboard controller
  core/        Music theory and voicing calculations
  features/    Audio, games, lessons, and voice control
  styles/      Application stylesheets
  ui/          Fretboard rendering and view navigation
tests/         Legacy data validation
tools/         Developer reporting utilities
```

## Validate

```bash
python3 tests/validate_chord_data.py
```

This version is preserved for comparison. Active development should generally
target `../v2`.
