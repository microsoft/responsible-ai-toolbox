// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Utils } from "@responsible-ai/interpret-text";

import { Locators } from "../../../util/Constants";
import { IInterpretTextData } from "../IInterpretTextData";

export function describeBarChart(dataShape: IInterpretTextData): void {
  describe("Sub bar chart", () => {
    it("should have right number of bars", () => {
      cy.get(
        `${Locators.TextExplanationChart} svg g.highcharts-series-group rect`
      ).should(
        "have.length",
        Math.ceil(
          Utils.countNonzeros(
            dataShape.localExplanations.map(
              (perClassValues) => perClassValues[0]
            )
          ) / 2
        )
      );
    });
    it("should have y axis with matched value", () => {
      cy.get(`${Locators.TextExplanationChart} .highcharts-axis-title`).should(
        "contain.text",
        "Feature importance"
      );
    });
    it("should have right number of x axis labels", () => {
      cy.get(`${Locators.TextExplanationChart} g.highcharts-xaxis-labels text`)
        .its("length")
        .should(
          "be",
          Math.ceil(
            Utils.countNonzeros(
              dataShape.localExplanations.map(
                (perClassValues) => perClassValues[0]
              )
            ) / 2
          )
        );
    });
  });
}
