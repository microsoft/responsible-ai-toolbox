import { getScatterColors, getScatterSymbols } from "./ScatterUtils";

describe("ScatterUtils", () => {
  it("should generate correct colors", () => {
    const expectedColors = [
      "#6D8EF7",
      "#CA397E",
      "#F3B33E",
      "#6D8EF7",
      "#CA397E",
      "#F3B33E",
      "#6D8EF7",
      "#CA397E",
      "#F3B33E",
      "#6D8EF7",
      "#CA397E",
      "#F3B33E",
      "#6D8EF7",
      "#CA397E",
      "#F3B33E"
    ];
    expect(getScatterColors()).toEqual(expectedColors);
  });

  it("should generate correct symbols", () => {
    const expectedSymbols = [
      "circle",
      "square",
      "diamond",
      "triangle",
      "triangle-down",
      "circle",
      "square",
      "diamond",
      "triangle",
      "triangle-down",
      "circle",
      "square",
      "diamond",
      "triangle",
      "triangle-down"
    ];
    expect(getScatterSymbols()).toEqual(expectedSymbols);
  });
});
