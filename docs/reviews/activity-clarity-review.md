# Activity clarity review

_What "do the task" and "an answer" mean, per activity — and the fix applied._

## The problem

Every activity in the app is generated from **9 templates** (`ACTIVITY_TEMPLATE` in
`src/v8/curriculum.ts`), so all 432 activities inherited the same two weaknesses. On a phone,
with no keyboard and no time to read carefully, they made it genuinely unclear what to do.

1. **Instructions were concept sentences, not actions.** e.g. the "relationship" activity read
   _"Name what stays constant… Focus on <topic>."_ True, but there is no concrete step — nothing
   that tells you what to tap, play, or say _right now_.

2. **The three outcome buttons were generic.** "Successful today" was defined, for every single
   task, as _"I completed the observable action deliberately."_ There was no per-activity "you're
   done when ___", so standing there you couldn't tell what "Successful today" vs "Partly there"
   actually meant for _this_ question.

Net effect: the app assumed you already knew the practice routine. A first-time user (or you,
demoing to a friend) had no concrete "do X, you're finished when Y" to hold onto.

## The fix

Because everything is templated, fixing the 9 templates fixes all 432 activities at once. Two new
pieces of text now attach to every activity, both second-person and self-contained:

- **`action`** — a concrete "Do this now" step. What to tap, play, or say.
- **`observable`** — repurposed into a specific "You've succeeded when ___" criterion.

The outcome buttons now point at that criterion instead of restating a generic sentence.

### Per-kind before / after

| Kind | Before (all you saw) | After — Do this now | After — Succeeded when |
|---|---|---|---|
| listen-compare | "Hear the relationship. Focus on X." | Tap "Hear reference and target", listen twice, say out loud what changes. | you can describe how the target differs from the reference. |
| sing-predict | "Predict before playback." | Sing/hum your prediction first, then tap to hear it and compare. | you predicted out loud before listening, and can say how close it was. |
| technique | "Put it under the hands." | Play slowly on the guitar, then tap "Play the task now". | you played it with controlled attack and clean release, no excess tension. |
| rhythm | "Place it in time." | Count the beat out loud, play in time, tap "Play the task now". | you kept a steady pulse through the whole pattern, including rests. |
| relationship | "Name what stays constant." | Play/hear the example, name the one thing that stays constant. | you can name the relationship that moves this to another key/position. |
| variation | "Change one dimension." | Play the original, then play it again changing exactly one thing. | you changed one dimension while the idea stayed recognisable. |
| creative | "Make a small musical object." | Open a new sketch, make 2–4 bars, come back and describe it. | you saved a 2–4 bar sketch that uses the idea for a real purpose. |
| transfer | "Move it somewhere new." | Play it again in a new key, neck region or tempo, tap "Play the task now". | the idea still sounds like itself in the new context. |
| reflection | "Listen back and decide." | Write one improvement, one uncertainty, one choice to keep. Save. | you wrote a specific observation and a concrete next action. |

### Outcome buttons — before / after

| Button | Before (every task) | After |
|---|---|---|
| Needs another pass | "I could not yet control or explain it." | "Not yet — I couldn't do the success action above this time." |
| Partly there | "Some of it worked, but not reliably." | "Some of it worked, but not the whole thing or not reliably." |
| Successful today | "I completed the observable action deliberately." | "Yes — I did the success action above, deliberately." |

## Where it shows up

In the activity screen (`src/v8/components/ActivityPlayer.tsx`):

- A new **"Do this now"** callout appears under "How to answer".
- The right panel now leads with **"You've succeeded when ___"** (the activity's own criterion),
  a one-line "Pick the option that matches what just happened", then the three buttons.

## Verification

- `tsc` (app project): clean.
- `validateCurriculum()`: 0 errors — still 48 units × 9 activities = 432, activity contract intact.
- Every activity confirmed to carry a non-empty `action` and `observable`.
- Full `vitest`/`vite build` weren't run here because this Linux sandbox can't load the macOS
  native binaries in `node_modules`; run `npm test` and `npm run build` on your Mac to confirm.

## Files changed

- `src/v8/types.ts` — added `action: string` to `ActivityDefinition`.
- `src/v8/curriculum.ts` — added concrete `action` + specific `observable` to all 9 templates.
- `src/v8/components/ActivityPlayer.tsx` — "Do this now" callout, success-criterion framing,
  reworded outcome buttons.
- `src/styles/app.css` — styles for `.do-now`, `.success-criterion`, `.outcome-lead`.
