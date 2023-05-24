// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "../Cohort/ErrorCohort";

export interface IProbabilityBinCount {
  binName: string;
  binCount: number;
}

export function calculateSplinePlotDataFromErrorCohort(
  errorCohort: ErrorCohort,
  key: string | undefined
): IProbabilityBinCount[] | undefined {
  // key is the identifier for the column (e.g., probability)
  if (!key) {
    return undefined;
  }
  return calculateLinePlotData(
    errorCohort.cohort.filteredData.map((dict) => dict[key])
  );
}

export function calculateLinePlotData(
  data: number[]
): IProbabilityBinCount[] | undefined {
  if (data.length === 0) {
    return undefined;
  }

  const numberOfBins = 10;
  const binCounts: number[] = new Array<number>(numberOfBins).fill(0);

  data.forEach((prob) => {
    let binIndex = Math.floor(prob * numberOfBins);
    if (binIndex > numberOfBins - 1) {
      // special case: map 100% to the last bin
      binIndex = binIndex - 1;
    }
    binCounts[binIndex] = binCounts[binIndex] + 1;
  });
  return binCounts.map(
    (binCount: number, index: number): IProbabilityBinCount => {
      return {
        binCount,
        binName: `${index * numberOfBins}-${(index + 1) * numberOfBins}%`
      };
    }
  );
}
