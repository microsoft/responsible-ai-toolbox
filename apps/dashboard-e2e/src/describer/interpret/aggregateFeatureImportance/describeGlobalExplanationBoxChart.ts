// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../../../util/BoxChart";
import { IInterpretData } from "../IInterpretData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBoxChart(
  dataShape: IInterpretData
): void {
  describe("Box chart", () => {
    const props = {
      chart: undefined as unknown as BoxChart,
      dataShape
    };
    beforeEach(() => {
      cy.get('#ChartTypeSelection label:contains("Box")').click();
      props.chart = new BoxChart("#FeatureImportanceBar");
    });
    describeGlobalExplanationChart(props);
  });
}
