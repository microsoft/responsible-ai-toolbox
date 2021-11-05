// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../../../../util/getSpan";
import { IFairnessMetadata } from "../IFairnessMetadata";
import { getToModelComparisonPageWithDefaults } from "../utils";

export function describeModelComparisonView(
  data: IFairnessMetadata,
  checkErrorBars: boolean
): void {
  describe("model comparison view", () => {
    it("should find model comparison view", () => {
      // move to the model comparison view
      getToModelComparisonPageWithDefaults();

      cy.get("#sensitiveFeatureDropdown").should(
        "contain.text",
        Object.keys(data.sensitiveFeatures)[0]
      );
      cy.get("#performanceMetricDropdown").should(
        "contain.text",
        data.defaultPerformanceMetric
      );
      cy.get("#fairnessMetricDropdown").should(
        "contain.text",
        data.defaultFairnessMetric
      );
      cy.get('button:contains("How to read this chart")').should("exist");
      // assert that the plot has the right number of points for models
      cy.get(".point").should("have.length", data.numberOfModels);
      if (checkErrorBars) {
        cy.get(".yerror").should("have.length", data.numberOfModels);
        cy.get(".xerror").should("have.length", data.numberOfModels);
      }
      getSpan("Key insights").should("exist");
    });
  });
}
