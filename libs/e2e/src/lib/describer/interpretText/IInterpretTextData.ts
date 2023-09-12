// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IInterpretTextData {
  text: string[];
  localExplanations: number[][];
  classNames: string[];
  expectedFeaturesValues?: {
    allFeaturesExpectedValues: number;
    negativeFeaturesExpectedValues: number;
    positiveFeaturesExpectedValues: number;
  };
  explanationIndex: number;
  expandCorrect?: boolean;
}
