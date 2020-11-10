// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessMetadata } from '../IFairnessMetadata';
import { getToModelComparisonPageWithDefaults } from '../utils';

export function describeSingleModelView(data: IFairnessMetadata): void {
  describe("single model view", () => {
    before(() => {
      // move to the model comparison view
      getToModelComparisonPageWithDefaults();
    });
    it("should find single model view", () => {
      cy.get(".point").first().click();
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

      // table should contain corresponding metrics
      cy.get(".ms-DetailsList").should(
        "contain.text",
        data.performanceMetrics[0]
      );
      cy.get(".ms-DetailsList").should("contain.text", data.fairnessMetrics[0]);
      cy.get(".ms-DetailsList").should("contain.text", "Overall");
      data.sensitiveFeatures[data.performanceMetrics[0]].forEach(
        (sensitiveFeatureValue: string) => {
          cy.get(".ms-DetailsList").should(
            "contain.text",
            sensitiveFeatureValue
          );
        }
      );

      // chart dropdown
      cy.get("#chartSelectionDropdown").should(
        "contain.text",
        Object.keys(data.sensitiveFeatures)[0]
      );
      // cy.contains(/presentationArea-.*/)
      //   .contains(Object.keys(data.sensitiveFeatures)[0])
      //   .should("exist");
      // data.sensitiveFeatures[data.performanceMetrics[0]].forEach(
      //   (sensitiveFeatureValue: string) => {
      //     cy.contains(/presentationArea-.*/)
      //       .contains(sensitiveFeatureValue)
      //       .should("exist");
      //   }
      // );
    });
  });
}
