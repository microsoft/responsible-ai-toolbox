// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { getSpan } from "../../../../util/getSpan";
import { ScatterChartErrorBars } from "../../../../util/ScatterChartErrorBars";
import { getTableColumnsValues } from "../../../../util/Table";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeAggregateCausalAffects(
  dataShape: IModelAssessmentData
): void {
  describe("Aggregate Causal effects", () => {
    const props = {
      chart: undefined as unknown as ScatterChartErrorBars,
      dataShape
    };
    beforeEach(() => {
      props.chart = new ScatterChartErrorBars("#CausalAggregateChart");
    });
    it("should have causal analysis for decision making notebooks", () => {
      cy.get(Locators.CausalAnalysisHeader).should("exist");
    });

    it("should render information on clicking on info icon", () => {
      getSpan(localization.CausalAnalysis.MainMenu.why).click();
      cy.get(Locators.CausalCalloutHeader).should(
        "contain",
        localization.CausalAnalysis.AggregateView.unconfounding
      );
      cy.get(Locators.CausalCalloutInner).should(
        "contain",
        localization.CausalAnalysis.AggregateView.confoundingFeature
      );
      getSpan(localization.CausalAnalysis.MainMenu.why).click();
    });
    describe("Table", () => {
      it("should render", () => {
        cy.get(Locators.CausalAnalysisTable).should("exist");
      });

      it("should render features in the “feature” column", () => {
        cy.get(Locators.CausalAnalysisTable).should("exist");
        getTableColumnsValues(
          ["Feature"],
          Locators.CausalAnalysisTable
        ).forEach((column) => {
          dataShape.causalAnalysisData?.featureListInCausalTable?.includes(
            column[0]
          );
        });
      });
    });
    describe("Chart", () => {
      it("should render", () => {
        expect(props.chart.Elements.length).greaterThan(0);
      });

      it("should render feature names on x-axis that are passed in from SDK", () => {
        cy.get(Locators.CausalChartXAxisValues).should(
          "have.length",
          dataShape.causalAnalysisData?.featureListInCausalTable?.length
        );
        cy.get(`${Locators.CausalChartXAxisValues}`)
          .last()
          .invoke("text")
          .then((text) => {
            expect(
              dataShape.causalAnalysisData?.featureListInCausalTable
            ).include(text);
          });
      });
      it("should have continuous and binary treatment definitions", () => {
        cy.get(Locators.CausalAggregateView).should(
          "contain",
          dataShape.causalAnalysisData?.continuousDescription
        );
        cy.get(Locators.CausalAggregateView).should(
          "contain",
          dataShape.causalAnalysisData?.binaryDescription
        );
      });
      it("should have details about lasso", () => {
        cy.get(Locators.CausalAggregateView).should(
          "contain",
          localization.CausalAnalysis.AggregateView.lasso
        );
      });
    });
  });
}
