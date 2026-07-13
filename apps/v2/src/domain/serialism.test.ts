import { describe, expect, it } from "vitest";
import { buildToneRowMatrix, parsePrimeRow } from "./serialism";

describe("serialism matrix", () => {
  it("rejects duplicate or incomplete rows", () => {
    expect(() => parsePrimeRow("0 1 2")).toThrow();
    expect(() => parsePrimeRow("0 1 2 3 4 5 6 7 8 9 10 10")).toThrow();
  });

  it("creates twelve unique pitch classes in every row and column", () => {
    const row = parsePrimeRow("0 1 4 2 7 5 9 8 3 10 11 6");
    const matrix = buildToneRowMatrix(row);
    expect(matrix).toHaveLength(12);
    matrix.forEach((matrixRow) => expect(new Set(matrixRow).size).toBe(12));
    for (let column = 0; column < 12; column += 1) {
      expect(new Set(matrix.map((matrixRow) => matrixRow[column])).size).toBe(12);
    }
  });
});
