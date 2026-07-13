# Guitar Academy Dashboards

The repository contains seven separate applications:

| Folder | Purpose | Recommended use |
| --- | --- | --- |
| [`apps/original`](apps/original) | Preserved dependency-free prototype | Reference and comparison |
| [`apps/v2`](apps/v2) | First typed React rebuild | Reference and comparison |
| [`apps/v3`](apps/v3) | Relationship-first learning dashboard | Current development |
| [`apps/v4`](apps/v4) | Connected overview dashboard and learning system | Current development |
| [`apps/v5`](apps/v5) | Ground-up relationship curriculum, practice, and play-along system | Current development |
| [`apps/v6`](apps/v6) | Playing-based learning, chord discovery, recording, and performance feedback | Preserved reference |
| [`apps/v7`](apps/v7) | Practice-first coach, chord connections, and progression experimentation | Recommended |

## Quick Start

### Original version

```bash
cd apps/original
./start.command
```

Runs at [http://localhost:8000](http://localhost:8000).

### Version 2

```bash
cd apps/v2
npm install
npm run dev
```

Or double-click `apps/v2/start.command`.

Runs at [http://localhost:4173](http://localhost:4173).

### Version 3

```bash
cd apps/v3
npm install
npm run dev
```

Or double-click `apps/v3/start.command`.

Runs at [http://localhost:4176](http://localhost:4176).

### Version 4

```bash
cd apps/v4
npm install
npm run dev
```

Or double-click `apps/v4/start.command`.

Runs at [http://localhost:4178](http://localhost:4178).

### Version 5

```bash
cd apps/v5
npm install
npm run dev
```

Or double-click `apps/v5/start.command`.

Runs at [http://localhost:4180](http://localhost:4180).

### Version 7

Double-click `start-v7.command` in the repository root, or run:

```bash
cd apps/v7
./start.command
```

Runs at [http://localhost:4184](http://localhost:4184).

## Repository Layout

```text
apps/
  original/    Original static application
  v2/          First React and TypeScript rebuild
  v3/          Relationship-first React and TypeScript application
  v4/          Connected overview and specialist learning application
  v5/          Relationship curriculum, adaptive practice, and play-along application
  v6/          Playing-based learning and chord-discovery application
  v7/          Practice-first coach and chord-connection application
docs/
  reviews/     Product and learning-design reports
```

Each application has its own README with its architecture, commands, and tests.
