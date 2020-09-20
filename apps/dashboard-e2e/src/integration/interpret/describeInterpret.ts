// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describeAggregateFeatureImportance } from "./aggregateFeatureImportance/describeAggregateFeatureImportance";
import { interpretDatasets } from "./interpretDatasets";

export function describeInterpret(name: keyof typeof interpretDatasets): void {
  describe(name, () => {
    if (!interpretDatasets[name].noFeatureImportance) {
      describeAggregateFeatureImportance(name, interpretDatasets[name]);
    }
  });
}
