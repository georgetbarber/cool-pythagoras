# UX walkthrough — a smart beginner's first run

_Role-play: I'm new to guitar and music theory, but I learn fast. I open the app cold and try to
actually get through the normal learning loop. Below is every place I stalled, got confused, or got
annoyed — in journey order — with what causes it in the code, a severity, and a fix._

Severity: **Blocker** (I literally can't proceed / don't know what happened) · **Obstacle** (I can
push through but it costs real effort or trust) · **Annoyance** (small friction / polish).

The template vagueness you already had me fix was one of these. There are more, and a few are worse.

---

## 1. The diagnostic (`app/App.tsx` → `Diagnostic`)

**1a. "Starting evidence" collects no evidence — and the default drops beginners mid-path. — Blocker (for a true beginner)**

The third panel is headed _"Starting evidence"_ and asks me to pick "Repair foundations / Early
intermediate / Confident foundations." As a beginner I have no idea which I am, and the app never
shows me anything to judge against — it's pure self-labelling, not a diagnostic. The default is
**"some" (Early intermediate)**, and here's the real damage: `nextUnit()` in `learning.ts` treats
the baseline as a permanent floor —

```ts
const startingOrder = state.settings.startingBaseline === "secure" ? 7 : ... === "some" ? 3 : 1;
return CURRICULUM.find((unit) => unit.order >= startingOrder && unitProgress < 100) ?? ...
```

So a beginner who leaves the default starts at **unit 03 (“Pulse before speed”)** and **units 01–02
(“Your musical baseline”, “Clean beginnings and endings”) never appear in Today or the daily session,
ever.** The most foundational material — making one clean note — is silently skipped in the guided
flow. It's reachable by manually digging into Path, but nothing tells me it's there or that I missed it.

_Fix:_ default to `repair`/unit-01, or add a clear _"Not sure? Start at the very beginning"_ option,
and reword "Starting evidence" → something honest like "Where would you like to start?". Consider
letting Today surface skipped earlier units as optional warm-ups instead of hiding them.

**1b. No sound check before I commit. — Obstacle**

The entire app leans on audio (hear the reference, hear the target). The onboarding never plays a
sound or asks me to confirm I can hear one. My first audio moment is buried inside my first activity,
so if my volume/output is wrong I don't discover it at the safe moment — I discover it when I'm
already trying to learn.

_Fix:_ add a one-tap "Play a test tone — can you hear this?" to the welcome panel.

---

## 2. First activity — the notation wall (`components/MicroStudy.tsx`, `ActivityPlayer.tsx`)

**2a. Tab / notation is never explained. — Blocker**

My first task shows a micro-study rendered as monospace lines:

```
e|--0---0---0---0--|
Count 1   2   3   4
```

Nothing anywhere tells me `e|` is the open high-E string, that `0` is an open string / `3` is the
3rd fret, that `x` is a mute, or how to read the count row. `MicroStudy` just prints `study.tab`
verbatim. A smart beginner _can_ learn tab in 60 seconds — but only if someone explains it once.
Right now the app assumes I already read tab. This is the single biggest "I can't actually do the
task" wall after the template wording.

_Fix:_ a dismissible "How to read this" legend on the micro-study (string names, fret numbers, `x` =
mute, rest/tie symbols), shown by default until first dismissed. One small component, huge payoff.

**2b. Dense vocabulary with no glossary. — Obstacle**

Within the first few screens I hit: tonic, mode, degree, interval, sustain/release, subdivision,
b3, voice leading, common tone, inversion, Mixolydian. The writing is precise and good, but there's
no tap-to-define anywhere. I either already know these or I'm bluffing.

_Fix:_ a lightweight glossary — even a `<abbr>`-style tap target or a single Explore "terms" card —
covering the ~20 recurring terms.

**2c. Audio has no visual confirmation. — Obstacle (Blocker when it silently fails)**

`audio/engine.ts` creates/resumes the `AudioContext` on play and emits notes, but the UI gives **no
signal that anything played** — no waveform, no "playing…", no note names lighting up, no captions.
When audio works I'm fine; when it silently fails (autoplay policy, muted device, Bluetooth routing)
I tap "Hear reference", get nothing, and have no idea whether it's broken or I'm doing it wrong.

_Fix:_ visual feedback on playback (a pulse / note labels / "♪ playing"), and a caption of what I
should be hearing ("tonic → 3rd, a rising major third"). Doubles as accessibility.

---

## 3. Reporting the outcome (`ActivityPlayer.tsx`)

**3a. "Reveal" silently downgrades my progress. — Obstacle (trust)**

Tapping "Reveal the reference" sets `assistance: "reveal"`, and `masteryFor()` only counts
`assistance === "none"` toward "secure"/"transfer-ready". So using the help quietly makes the attempt
not count — and the only hint of this is a small "reveal used" status chip whose consequence is never
stated. I'll feel punished for using help I was invited to use, without understanding why my progress
stalled.

_Fix:_ say it plainly at the moment of use ("Revealing means this attempt won't count toward
mastery — that's fine, it's still recorded"). Honesty here builds trust rather than eroding it.

**3b. Why something is / isn't "secure" is invisible. — Annoyance**

"Secure" needs 2 independent days + 2 contexts, "transfer-ready" also needs a transfer attempt
(`masteryFor`). Sensible model, but nowhere does it tell me _"1 more independent day in a new key to
reach Secure."_ Progress feels arbitrary.

_Fix:_ show the next threshold on each mastery chip.

---

## 4. Today screen (`features/Today.tsx`)

**4a. "Start with" can relaunch a finished activity. — Annoyance**

`first = session.items.find(not completed) ?? session.items[0]`. Once I finish all five session
items, the big CTA falls back to `items[0]` — a completed task — and re-opens it. After a good
session the headline action points backwards.

_Fix:_ when the session is complete, switch the CTA to "Session complete — start the next unit" (or
a reflection), not a redo.

---

## 5. Path screen (`features/Path.tsx`)

**5a. Tapping ahead shows a wall of greyed-out units. — Annoyance**

Curiosity click into Stage 5 and nearly everything reads "Build the prerequisite first" (disabled).
48 units is already a lot to scan; a screen of locked cards makes the map feel punitive rather than
inviting.

_Fix:_ collapse far-future stages to a summary, or show locked units as a faint "coming after X"
rather than dead buttons.

---

## 6. Practice screen (`features/Practice.tsx`)

**6a. "Train the weakest link" doesn't use my evidence. — Obstacle (trust)**

The header promises targeted, weakest-link practice. The actual recommendation is just _first
uncompleted activity of the chosen kind, in unit order_ (`available.find(!completed) ?? available[0]`).
It never reads `state.evidence` or `masteryFor` to find what's actually weak — that data is only used
in the read-only panel below. The promise and the behaviour don't match.

_Fix:_ either rank recommendations by lowest mastery / most retries, or soften the copy to match what
it does ("Practice by focus area").

**6b. Dead activity kind referenced. — Annoyance (code smell)**

`PRACTICE_MODES` and `buildSession` reference the `play-reveal` kind, but no template in
`curriculum.ts` ever produces one (the 9 templates don't include it). It's harmless (filters just
return nothing / fall back) but it's a latent trap and implies a mode that doesn't fully exist.

_Fix:_ remove `play-reveal` from the kind lists, or add the activity so the reference is real.

---

## 7. Create screen (`features/Create.tsx`)

**7a. The creative activity dumps me into an 8-panel studio with no "smallest step." — Obstacle**

A creative activity tells me "make two to four bars," taps "Open a new sketch," and drops me into the
studio: workflow bar (8 stages), intention box, chord track, rhythm track, bass, transformations,
notes, ambiguity notes, takes, recording. For a beginner this is overwhelming and there's no "do
this one thing first." I don't know whether I'm supposed to type, add a chord, or record.

_Fix:_ a first-run guided minimal path ("① name it ② add two chords ③ press Play"), collapsing the
advanced panels until asked for. Tie it back to the activity's new "Do this now" line.

---

## 8. What already works (so we don't regress it)

Genuinely strong foundations worth protecting: the calm, non-gamified tone; the evidence-over-points
philosophy; keyboard skip-link and aria labels; offline-first with optional sync; the reflective
"report the result" framing (now concrete after the template fix); and Explore as a real
sandbox. The problems above are mostly _onboarding and first-contact_ gaps, not architectural ones.

---

## Priority order (biggest learning payoff first)

1. **Notation legend on micro-studies (2a)** — removes the hardest "I can't do the task" wall.
2. **Diagnostic default / skipped foundational units (1a)** — stop dropping beginners mid-path.
3. **Audio visual confirmation + sound check (2c, 1b)** — kills silent dead-ends.
4. **Glossary for core terms (2b)** — makes the theory learnable, not just correct.
5. **Honest help + mastery thresholds (3a, 3b)** — align progress with felt effort.
6. **Practice recommendation truth-in-labelling (6a)** — match promise to behaviour.
7. **Create "smallest step" onboarding (7a)** — make the studio approachable.
8. Polish: Today CVA fallback (4a), locked-stage presentation (5a), dead `play-reveal` kind (6b).

---

## Resolution log — all findings fixed

Every item above was addressed in one pass. What changed, by finding:

- **1a — Diagnostic default / skipped foundations.** Default baseline is now `repair` (unit-01) in
  both `store.tsx` (`DEFAULT_STATE`) and the `Diagnostic` component. The baseline panel was reworded
  from "Starting evidence / choose the closest honest baseline" to "Where would you like to start?"
  with plain options ("Start from the beginning" / "Skip the basics" / "Jump ahead") and explicit
  "new or unsure? choose the first" guidance. Beginners no longer get dropped past units 01–02.
- **1b — Sound check.** The welcome panel now has a "Play a test tone" button (three rising notes)
  that confirms audio before the user commits (`App.tsx`).
- **2a — Notation legend.** `MicroStudy.tsx` now includes a "How to read this" legend (string names,
  fret numbers, `0` = open, `x` = mute, bar lines, the count row, and "no guitar? do it by ear").
- **2b — Glossary.** New `v8/glossary.ts` (22 plain-language terms) rendered as a "Terms, in everyday
  words" card at the bottom of Explore.
- **2c — Audio confirmation + captions.** `ActivityPlayer.tsx` shows a pulsing "♪" while audio plays
  and a caption of what to listen for ("You should hear home, then a major 3rd above home"), plus a
  "no sound? check volume" fallback message.
- **3a — Help honesty.** A note under the hint/reveal buttons states that assisted attempts are kept
  separate and don't count toward "Secure".
- **3b — Mastery thresholds.** New `masteryNextStep()` in `learning.ts`; each mastery chip in Practice
  now shows the concrete next step (e.g. "1 more independent success day to reach Secure").
- **4a — Today CTA.** When the day's session is complete the primary button becomes "Today's session
  is complete — explore your Path" instead of relaunching a finished activity.
- **5a — Locked stages.** Locked unit cards are dimmed and now read "Unlocks after Unit N" with a
  "Finish '<title>' first" note, instead of a dead "Build the prerequisite first".
- **6a — Practice recommendation.** New `recommendPractice()` ranks by real evidence (lowest mastery,
  most retries, unfinished first); the header copy now matches what it does.
- **6b — Dead `play-reveal` kind.** Removed from `PRACTICE_MODES`, `buildSession`, and the
  `ActivityPlayer` attempt-pad list.
- **7a — Create onboarding.** A dismissible "New here? Start with just this" guide appears on an empty
  sketch: name it → add two chords → press Play.

Verification: `tsc` clean; `validateCurriculum()` 0 errors; session stays 25 min / 5 items with a
creative-or-reflection item; `repair`→unit-01, `secure`→unit-07 preserved. Run `npm test` /
`npm run build` on macOS to confirm against the native toolchain (not runnable in this Linux sandbox).
