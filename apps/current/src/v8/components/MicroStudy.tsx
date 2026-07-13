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
    </figure>
  );
}
