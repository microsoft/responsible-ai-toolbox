// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const localExplanationData = [
  [0, 0],
  [-0.005633711814880371, 0.005633684573695064],
  [-0.016269147396087646, 0.016269136918708682],
  [-0.010049201548099518, 0.010049237171187997],
  [0.009819332510232925, -0.009819337516091764],
  [0.05134781077504158, -0.05134780355729163],
  [-0.013548329472541809, 0.01354830723721534],
  [0.004447728395462036, -0.004447765881195664],
  [0, 0]
];

export const textExplanationData = {
  classNames: ["0", "1"],
  expandCorrect: true,
  expectedFeaturesValues: {
    allFeaturesExpectedValues: 3,
    negativeFeaturesExpectedValues: 3,
    positiveFeaturesExpectedValues: 3
  },
  explanationIndex: 19,
  localExplanations: localExplanationData,
  text: ["", "Maximilian", ", ", "and ", "other ", "poems", ", ", "etc", ""]
};
