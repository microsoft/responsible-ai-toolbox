// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeTextIndividualFeatureImportance,
  IInterpretTextData
} from "@responsible-ai/e2e";

const testName = "Interpret text unit test for feature importance";

export function describeInterpretTextIndividualFeatureImportance(
  name: string,
  datasetShape: IInterpretTextData
): void {
  describe(testName, () => {
    before(() => {
      cy.visit(`#/interpretText/${name}/light/english/Version-1`);
    });
    describeTextIndividualFeatureImportance(datasetShape);
  });
}
