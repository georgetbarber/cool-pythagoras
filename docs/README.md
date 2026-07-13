# Documentation Guide

Use this directory as the durable explanation of the project. App-specific
implementation details remain beside the relevant app; cross-project decisions
live here.

## Read in This Order

1. [Project history](PROJECT_HISTORY.md) — how the project began, all seven
   iterations, and where it is now.
2. [Learning model](LEARNING_MODEL.md) — what the product is trying to teach and
   the constraints that follow.
3. [Architecture](ARCHITECTURE.md) — how the current app turns those principles
   into code.
4. [Lessons learned](LESSONS_LEARNED.md) — conclusions from the successive
   prototypes and reviews.
5. [Development](DEVELOPMENT.md) — setup, commands, testing, and repository
   conventions.
6. [Roadmap](ROADMAP.md) — evidence-based next directions and non-goals.

## Detailed Source Material

- [Stage 1 product and learning review](reviews/stage-1-product-learning-review.md)
  is the detailed critique that established the beginner learning sequence and
  progressive-disclosure requirements.
- `apps/current/docs/` contains current feature diagnostics and playing-layer
  notes.
- Each folder under `apps/history/` has a README describing that milestone in
  its original context.

Documentation should be updated in the same change as any behaviour or
architecture that makes it inaccurate.
