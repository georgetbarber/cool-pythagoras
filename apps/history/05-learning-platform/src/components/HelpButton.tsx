import { useState } from "react";

export function HelpButton({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="help-wrap">
      <button
        type="button"
        className="help-button"
        aria-label={`Explain ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ?
      </button>
      {open && (
        <span className="help-popover" role="note">
          <strong>{title}</strong>
          <span>{body}</span>
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </span>
      )}
    </span>
  );
}
