import { useMemo, useState } from "react";
import { buildToneRowMatrix, parsePrimeRow } from "../../domain/serialism";

export function Systems() {
  const [input, setInput] = useState("0 1 4 2 7 5 9 8 3 10 11 6");
  const parsed = useMemo(() => {
    try {
      const row = parsePrimeRow(input);
      return { matrix: buildToneRowMatrix(row), error: "" };
    } catch (error) {
      return {
        matrix: [],
        error: error instanceof Error ? error.message : "Invalid row."
      };
    }
  }, [input]);

  return (
    <div className="feature-page">
      <section className="panel feature-header">
        <div>
          <p className="eyebrow">Beyond functional harmony</p>
          <h1>World Systems</h1>
          <p>
            These tools are separated from tonal analysis so that one framework is
            not presented as a universal theory of music.
          </p>
        </div>
      </section>

      <section className="panel reading-panel">
        <p className="eyebrow">Twelve-tone serialism</p>
        <h2>Prime-row matrix</h2>
        <p>
          A row orders all twelve pitch classes before any is repeated. The matrix
          exposes prime, inversion, retrograde, and retrograde-inversion forms.
        </p>
        <label>
          Prime row
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
          />
        </label>
        {parsed.error ? (
          <p className="error-message">{parsed.error}</p>
        ) : (
          <div className="matrix-scroll">
            <table className="tone-row-matrix">
              <tbody>
                {parsed.matrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((value, columnIndex) => (
                      <td key={columnIndex}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel reading-panel">
        <p className="eyebrow">Context matters</p>
        <h2>Ragas, maqams, and microtonal practice</h2>
        <p>
          Pitch inventory alone cannot describe these traditions. Characteristic
          motion, intonation, ornament, register, rhythm, and cultural context are
          part of the musical system.
        </p>
        <p>
          A standard equal-tempered guitar can approximate selected material, but
          this dashboard does not claim to model those traditions faithfully.
          Future modules should be developed with specialist review and
          tradition-specific representations.
        </p>
      </section>
    </div>
  );
}
