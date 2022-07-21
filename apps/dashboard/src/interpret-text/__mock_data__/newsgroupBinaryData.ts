// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITextExplanationDashboardData } from "@responsible-ai/core-ui";

export const newsgroupBinaryData: ITextExplanationDashboardData = {
  classNames: ["spam", "not spam"],
  localExplanations: [
    0, 0.5, 0, 0, -0.6, 0, 0.4, -0.9, 0, -0.3, 0, 0, 0.3, 0, 0, 0.4, 0, 0, -0.2,
    0, 0, 0.5, 0, 0, -0.6, 0, 0, 0, 0, -0.2, 0, 0, 0, -0.3, 0, 0, 0, 0, 0, 0
  ],
  prediction: [0, 1],
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
};
