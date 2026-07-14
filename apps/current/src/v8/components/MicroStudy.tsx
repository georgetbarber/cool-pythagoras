import type { MicroStudy as MicroStudyType } from "../types";
import { labelLines, legendFor, NOTATION_LABEL } from "../notation";

export function MicroStudy({ study }: { study: MicroStudyType }) {
  const lines = labelLines(study.tab);
  const legend = legendFor(lines);
  return (
    <figure className="micro-study" aria-label={`${study.title}. ${study.purpose}`}>
      <figcaption>
        <span>Original micro-study</span>
        <strong>{study.title}</strong>
        <small>{study.tempo} BPM · {study.metre} · {study.rhythm}</small>
      </figcaption>
      <div className="tab-staff" role="img" aria-label={`Notation guide: ${lines.map((line) => `${NOTATION_LABEL[line.type] || "guide"}: ${line.text}`).join(". ")}`}>
        {lines.map((line, index) => (
          <div className="tab-line" key={`${line.text}-${index}`}>
            {NOTATION_LABEL[line.type] && <span className={`line-label label-${line.type}`}>{NOTATION_LABEL[line.type]}</span>}
            <code>{line.text}</code>
          </div>
        ))}
      </div>
      <details className="tab-legend">
        <summary>How to read this</summary>
        <ul>
          {legend.map((entry) => <li key={entry}>{entry}</li>)}
        </ul>
      </details>
    </figure>
  );
}
