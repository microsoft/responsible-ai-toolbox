export function generateId(length?: number): string {
  // tslint:disable-next-line: insecure-random
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, length);
}
