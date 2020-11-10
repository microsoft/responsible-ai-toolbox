// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessMetadata } from '../IFairnessMetadata';
import { getSpan } from 'apps/dashboard-e2e/src/util/getSpan';
import { getToModelComparisonPageWithDefaults } from '../utils';

export function describeModelComparisonView(data: IFairnessMetadata): void {
  describe("model comparison view", () => {
    before(() => {
      // move to the model comparison view
      getToModelComparisonPageWithDefaults();
    });
    it("should find model comparison view", () => {
      cy.get("#sensitiveFeatureDropdown").should(
        "contain.text",
        Object.keys(data.sensitiveFeatures)[0]
      );
      cy.get("#performanceMetricDropdown").should(
        "contain.text",
        data.performanceMetrics[0]
      );
      cy.get("#fairnessMetricDropdown").should(
        "contain.text",
        data.fairnessMetrics[0]
      );
      getSpan("How to read this chart").should("exist");
      // assert that the plot has the right number of points for models
      cy.get(".point").should("have.length", data.numberOfModels);
      getSpan("Key insights").should("exist");
    });
  });
}
