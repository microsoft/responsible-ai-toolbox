// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const pseudolocMapping = new Map([
  ["A", "Á"],
  ["B", "β"],
  ["C", "Ç"],
  ["D", "Đ"],
  ["E", "È"],
  ["F", "Ḟ"],
  ["G", "Ģ"],
  ["H", "Ĥ"],
  ["I", "Î"],
  ["J", "Ĵ"],
  ["K", "Ķ"],
  ["L", "£"],
  ["M", "Ḿ"],
  ["N", "Ñ"],
  ["O", "Ó"],
  ["P", "Ƥ"],
  ["Q", "𝑄"],
  ["R", "Ř"],
  ["S", "§"],
  ["T", "Ţ"],
  ["U", "Ù"],
  ["V", "٧"],
  ["W", "Ŵ"],
  ["X", "𝔛"],
  ["Y", "Ÿ"],
  ["Z", "Ž"],
  ["a", "ą"],
  ["b", "ƃ"],
  ["c", "¢"],
  ["d", "ƌ"],
  ["e", "ε"],
  ["f", "ƒ"],
  ["g", "ğ"],
  ["h", "ĥ"],
  ["i", "į"],
  ["j", "ĵ"],
  ["k", "ĸ"],
  ["l", "ł"],
  ["m", "ḿ"],
  ["n", "ņ"],
  ["o", "ő"],
  ["p", "ṕ"],
  ["q", "գ"],
  ["r", "ŗ"],
  ["s", "ş"],
  ["t", "ţ"],
  ["u", "µ"],
  ["v", "𝑣"],
  ["w", "ŵ"],
  ["x", "𝖝"],
  ["y", "ŷ"],
  ["z", "ź"]
]);

const identifierStart = "{";
const identifierEnd = "}";
const stretchFactor = 0.3; // Stretch each string by adding additional characters

export class Pseudoloc {
  public static pseudolocalizeStrings<T>(locStrings: T): T {
    const pseudolocStrings = {};
    for (const key of Object.keys(locStrings)) {
      const value = locStrings[key];
      switch (typeof value) {
        case "object":
          pseudolocStrings[key] = Pseudoloc.pseudolocalizeStrings(value);
          break;
        case "string":
          pseudolocStrings[key] = Pseudoloc.pseudolocalizeString(
            locStrings[key]
          );
          break;
        default:
          throw new Error("Not supported type");
      }
    }
    return pseudolocStrings as T;
  }

  private static pseudolocalizeString(locString: string): string {
    const pseudoloc = ["[!"];

    const additionalHyphens = Math.ceil(stretchFactor * locString.length);
    for (let i = 0; i < additionalHyphens - additionalHyphens / 2; i++) {
      pseudoloc.push("-");
    }

    let inIdentifier = false;
    for (const c of locString) {
      if (c === identifierStart) {
        inIdentifier = true;
      }

      if (!inIdentifier) {
        pseudoloc.push(pseudolocMapping.get(c) || c);
      } else {
        pseudoloc.push(c);
      }

      if (c === identifierEnd) {
        inIdentifier = false;
      }
    }

    for (let i = 0; i < additionalHyphens / 2; i++) {
      pseudoloc.push("-");
    }

    pseudoloc.push("]");
    return pseudoloc.join("");
  }
}
