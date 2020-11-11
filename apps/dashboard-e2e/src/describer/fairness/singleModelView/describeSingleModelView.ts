// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "apps/dashboard-e2e/src/util/getSpan";
import { ScatterChart } from "../../../util/ScatterChart";
import { IFairnessMetadata } from "../IFairnessMetadata";
import { getToModelComparisonPageWithDefaults } from "../utils";

export function describeSingleModelView(data: IFairnessMetadata): void {
  describe.only("single model view", () => {
    const props = {
      chart: (undefined as unknown) as ScatterChart
    };
    beforeEach(() => {
      // move to the single model view
      getToModelComparisonPageWithDefaults();

      // click on model point in model comparison view
      props.chart = new ScatterChart("#FairnessPerformanceTradeoffChart");
      props.chart.clickNthPoint(1);
    });
    it("should find single model view", () => {
      getSpan("Assessment results").should("exist");

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
      data.sensitiveFeatures[Object.keys(data.sensitiveFeatures)[0]].forEach(
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
