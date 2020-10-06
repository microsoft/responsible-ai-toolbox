// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { ScatterChart } from "../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

export function describeDataPointChart(dataShape: IInterpretData): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: (undefined as unknown) as ScatterChart,
      dataShape
    };
    beforeEach(() => {
      getMenu(
        "Individual Feature Importance & What-If",
        "#DashboardPivot"
      ).click();
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
    });
    it("should render right number of points", () => {
      expect(props.chart.Elements.length).equals(dataShape.datapoint);
    });

    describe("Click first datapoint", () => {
      it("should select none by default", () => {
        cy.get(
          '#IndividualFeatureContainer  div[class^="legendAndText"] div[class^="clickTarget"]'
        ).should("not.exist");
      });
      it("should select the first point", () => {
        props.chart.clickNthPoint(0);
        cy.get(
          '#IndividualFeatureContainer  div[class^="legendAndText"] div[class^="clickTarget"]'
        ).should("contain.text", "Row");
      });
    });
  });
}
