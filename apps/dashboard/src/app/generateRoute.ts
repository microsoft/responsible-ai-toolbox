export function generateRoute(params: readonly string[]): string {
  return params.map((p) => `/:${p}?`).join("");
}
