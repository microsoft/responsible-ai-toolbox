// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Utils } from "@responsible-ai/interpret-text";

export function getDefaultTopKWords(localExplanations: number[][]): number {
  return Math.ceil(
    Utils.countNonzeros(
      localExplanations.map((perClassValues) => perClassValues[0])
    ) / 2
  );
}
