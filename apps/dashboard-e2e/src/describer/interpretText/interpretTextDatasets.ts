// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IInterpretTextData } from "./IInterpretTextData";

const interpretTextDatasets = {
  newsgroupBinaryData: {
    localExplanations: [
      [0, 0],
      [-0.5, 0.5],
      [0, 0],
      [0, 0],
      [0.6, -0.6],
      [0, 0],
      [-0.4, 0.4],
      [0.9, -0.9],
      [0, 0],
      [0.3, -0.3],
      [0, 0],
      [0, 0],
      [-0.3, 0.3],
      [0, 0],
      [0, 0],
      [-0.4, 0.4],
      [0, 0],
      [0, 0],
      [0.2, -0.2],
      [0, 0],
      [0, 0],
      [-0.5, 0.5],
      [0, 0],
      [0, 0],
      [0.6, -0.6],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0.2, -0.2],
      [0, 0],
      [0, 0],
      [0, 0],
      [0.3, -0.3],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0]
    ],
    text: [
      "I",
      "went",
      "to",
      "the",
      "park",
      "with",
      "my",
      "dog",
      "named",
      "Bob",
      ".",
      "Now",
      "I'm",
      "trying",
      "to",
      "make",
      "this",
      "longer",
      "so",
      "we",
      "can",
      "see",
      "what",
      "that",
      "looks",
      "like",
      ".",
      "Do",
      "you",
      "think",
      "this",
      "is",
      "long",
      "enough",
      "?",
      "I",
      "sure",
      "hope",
      "so",
      "."
    ]
  }
};
const withType: {
  [key in keyof typeof interpretTextDatasets]: IInterpretTextData;
} = interpretTextDatasets;

export { withType as interpretTextDatasets };
