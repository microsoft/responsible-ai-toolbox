export function getScatterColors(): string[] {
  const colors = [];
  for (let i = 0; i < 5; i++) {
    colors.push("#6D8EF7", "#CA397E", "#F3B33E");
  }
  return colors;
}

export function getScatterSymbols(): string[] {
  const symbols = [];
  for (let i = 0; i < 3; i++) {
    symbols.push("circle", "square", "diamond", "triangle", "triangle-down");
  }
  return symbols;
}
