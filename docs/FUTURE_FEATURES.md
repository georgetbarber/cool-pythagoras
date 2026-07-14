# Future Features

This is the working backlog for additions that are intentionally not part of
the current Guitar Academy release. A feature belongs here before it becomes a
build task. The current app should remain relationship-first, playable, and
honest about what it can hear, display, and assess.

## Carried forward from the theory remediation plan

These were explicitly deferred from the completed review and are planned
future additions rather than missing fixes:

- [ ] Add triplet notation and explain how it relates to the pulse.
- [ ] Add optional swing audio, with a clear long-short eighth-note model.
- [ ] Add harmonic-minor and melodic-minor modes only when their teaching
      sequence and chord labelling are clear. The current raised-leading-tone
      V/V7 treatment in minor remains the deliberately smaller step.
- [ ] Build a fuller diagnostic placement system that can recommend units from
      demonstrated evidence, rather than only choosing the initial starting
      point.
- [ ] Author activity content more specifically for all 48 units. The current
      release only replaces the generic prompts where they were clearly
      misleading.

## Learning and musical depth

- [ ] Add optional staff-pitch literacy without making notation a gate for the
      relationship-first path.
- [ ] Replace placeholder browser-synth examples with reviewed original
      performances where phrasing, tone, or articulation matters.
- [ ] Add more activity-specific assessment only where the result can be
      musically honest and reliable.
- [ ] Extend fingering-aware voicing search and transition ranking using
      observed hand-position data.
- [ ] Support alternate tunings through tuning-aware interval geometry.
- [ ] Add richer unit variations after the curriculum data model has been used
      and observed in practice.

## Product and platform additions

- [ ] Test and improve cross-device conflict resolution with larger real
      histories.
- [ ] Improve export/import for substantial Sketchbook histories.
- [ ] Consider encrypted upload of explicitly selected finished-project takes
      only if device-only recordings prove limiting in real use.
- [ ] Consider offline-first improvements after the current PWA workflow has
      been observed on real devices.

## Guardrails

These are not planned additions unless a later review finds a reliable,
relationship-first way to implement them:

- Unreliable polyphonic chord recognition.
- Numerical creativity scores or progress based on clicks alone.
- Analytics or automatic recording uploads.
- Licensed repertoire as a dependency of the core curriculum.
- New top-level workspaces where contextual disclosure would be clearer.

## How to promote an item into development

Before implementation, write down the learner relationship, the observable
musical action, the owning domain logic, the evidence it records, and what can
remain hidden until it becomes useful. Then give the item a small acceptance
test and move it into the roadmap or a dated implementation plan.
