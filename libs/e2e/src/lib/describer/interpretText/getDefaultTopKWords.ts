// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MaxImportantWords, Utils } from "@responsible-ai/interpret-text";

export function getDefaultTopKWords(localExplanations: number[][]): number {
  return Math.min(
    MaxImportantWords,
    Math.ceil(
      Utils.countNonzeros(
        localExplanations.map((perClassValues) => perClassValues[0])
      ) / 2
    )
  );
}
