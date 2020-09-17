// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AggregateFeatureImportanceDescriber } from "./aggregateFeatureImportance/AggregateFeatureImportanceDescriber";

const aggregateFeatureImportanceDescriber = new AggregateFeatureImportanceDescriber(
  "automlMimicAdult",
  {
    totalFeatures: 14
  }
);
describe("AutomlMimicAdult", () => {
  aggregateFeatureImportanceDescriber.describeTabHeader();
  aggregateFeatureImportanceDescriber.describeGlobalExplanationChart();
});
