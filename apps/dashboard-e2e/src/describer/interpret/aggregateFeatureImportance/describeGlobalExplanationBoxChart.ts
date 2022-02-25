// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxHighchart } from "../../../util/BoxHighchart";
import { IInterpretData } from "../IInterpretData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBoxChart(
  dataShape: IInterpretData
): void {
  describe("Box chart", () => {
    const props = {
      chart: undefined as unknown as BoxHighchart,
      dataShape
    };
    beforeEach(() => {
      cy.get('#ChartTypeSelection label:contains("Box")').click();
      props.chart = new BoxHighchart("#FeatureImportanceBar");
    });
    describeGlobalExplanationChart(props);
  });
}
