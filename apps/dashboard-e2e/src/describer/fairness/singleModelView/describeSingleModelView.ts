// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../../util/getSpan";
import { ScatterChart } from "../../../util/ScatterChart";
import { IFairnessMetadata } from "../IFairnessMetadata";
import { getToModelComparisonPageWithDefaults } from "../utils";

export function describeSingleModelView(data: IFairnessMetadata): void {
  describe("single model view", () => {
    const props = {
      chart: (undefined as unknown) as ScatterChart
    };
    beforeEach(() => {
      // move to the single model view
      getToModelComparisonPageWithDefaults()
        .get("#FairnessPerformanceTradeoffChart .trace.scatter:eq(0) .points")
        .then(() => {
          // click on model point in model comparison view
          props.chart = new ScatterChart("#FairnessPerformanceTradeoffChart");
          props.chart.clickNthPoint(0);
        });
    });
    it("should find single model view", () => {
      getSpan("Assessment results").should("exist");

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

      // table should contain corresponding metrics
      cy.get(".ms-DetailsList").should(
        "contain.text",
        data.defaultPerformanceMetric
      );
      cy.get(".ms-DetailsList").should(
        "contain.text",
        data.defaultFairnessMetric
      );
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
      cy.get("#chartSelectionDropdown").should("contain.text", data.charts[0]);

      cy.get("#outcomePlot").should("exist");
      data.sensitiveFeatures[Object.keys(data.sensitiveFeatures)[0]].forEach(
        (sensitiveFeatureValue: string) => {
          cy.get("#outcomePlot")
            .contains(sensitiveFeatureValue)
            .should("exist");
        }
      );

      // dropdown switch to other chart
      if (data.charts.length > 1) {
        cy.get("#chartSelectionDropdown").click();
        cy.get("#chartSelectionDropdown-list1").click();

        cy.get("#performancePlot").should("exist");
        cy.get("#chartSelectionDropdown").should(
          "contain.text",
          data.charts[1]
        );
      }
    });
  });
}
