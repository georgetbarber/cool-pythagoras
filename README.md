# Guitar Academy

Guitar Academy is a relationship-first guitar-learning project. It teaches how
sound, intervals, scale degrees, chord tones, harmonic function, and fretboard
shapes connect, rather than presenting theory as facts to memorise.

The repository contains one current application and six preserved development
milestones. Start with the current app; use the history when you want to
understand why the product and architecture changed.

## Start Here

1. Read the [project history](docs/PROJECT_HISTORY.md) for the complete journey.
2. Read the [learning model](docs/LEARNING_MODEL.md) for the teaching philosophy.
3. Open the [current application guide](apps/current/README.md) to run the app.
4. Use the [architecture](docs/ARCHITECTURE.md) and
   [development guide](docs/DEVELOPMENT.md) before changing code.
5. Review [lessons learned](docs/LESSONS_LEARNED.md) and the
   [roadmap](docs/ROADMAP.md) before proposing a large new feature.
6. See [additional note takeaways](docs/additional-notes/README.md) for useful
   personal project thoughts that were checked against the current product.

## Run the Current App

Requirements: Node.js 20 or newer and npm.

```bash
cd apps/current
npm install
npm run dev
```

Open [http://localhost:4184](http://localhost:4184), or double-click
`start.command` at the repository root on macOS after installing dependencies.

## Repository Map

```text
.
├── README.md                 First-stop project orientation
├── CONTRIBUTING.md           Safe contribution workflow
├── AGENTS.md                 Project rules for coding agents
├── start.command             macOS launcher for the current app
├── apps/
│   ├── README.md             Application directory guide
│   ├── current/              Current product (iteration 07 / V7)
│   └── history/              Six runnable historical milestones
├── docs/
│   ├── README.md             Documentation index
│   ├── PROJECT_HISTORY.md     Origin, iteration timeline, and current state
│   ├── LEARNING_MODEL.md      Pedagogy and music-theory principles
│   ├── ARCHITECTURE.md        Current application structure and data flow
│   ├── LESSONS_LEARNED.md     Product and engineering conclusions
│   ├── DEVELOPMENT.md         Setup, testing, and working conventions
│   ├── ROADMAP.md             Evidence-based future directions
│   ├── additional-notes/      Relevant takeaways from informal project notes
│   └── reviews/               Detailed product-review source material
└── scripts/
    └── verify-all.sh          Validate every preserved iteration
```

## Current State

`apps/current` is iteration 07, the recommended and only active development
target. It combines a shared tonal context, relationship-labelled fretboard,
guided learning, contextual ear work, adaptive retrieval, chord discovery,
exact guitar voicings, progression analysis, browser-local recording, and a
practice-first guitar coach.

The historical apps remain intentionally isolated. They are evidence of the
decisions made along the way, not packages that the current app imports.

## What Is Deliberately Not in Git

Installed dependencies, production builds, browser binaries, test reports,
TypeScript build caches, and operating-system metadata are generated locally
and ignored. Source, tests, documentation, dependency manifests, and lockfiles
are the portable project record.
