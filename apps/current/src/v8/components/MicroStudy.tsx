import type { MicroStudy as MicroStudyType } from "../types";

export function MicroStudy({ study }: { study: MicroStudyType }) {
  return (
    <figure className="micro-study" aria-label={`${study.title}. ${study.purpose}`}>
      <figcaption>
        <span>Original micro-study</span>
        <strong>{study.title}</strong>
        <small>{study.tempo} BPM · {study.metre} · {study.rhythm}</small>
      </figcaption>
      <div className="tab-staff" role="img" aria-label={`Tab and performance guide: ${study.tab.join(". ")}`}>
        {study.tab.map((line) => <code key={line}>{line}</code>)}
      </div>
      <details className="tab-legend">
        <summary>How to read this</summary>
        <ul>
          <li>Each row is a guitar string. Low to high, the six strings are <b>E A D G B e</b> (the last <b>e</b> is the thinnest).</li>
          <li>A number is the fret to press on that string. <b>0</b> means play the string open (no finger). <b>3</b> means the 3rd fret.</li>
          <li><b>x</b> means mute or don't sound that string. <b>|</b> is just a bar line dividing the beats.</li>
          <li>Read left to right in time. A <b>Count</b> row (e.g. “1 + 2 +”) shows where each beat and off-beat falls.</li>
          <li>No guitar to hand? You can still do the listening and singing tasks by ear.</li>
        </ul>
      </details>
    </figure>
  );
}
