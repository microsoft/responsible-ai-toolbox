// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../../../util/BoxChart";
import { getMenu } from "../../../../../util/getMenu";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBoxChart(
  dataShape: IModelAssessmentData
): void {
  describe("Box chart", () => {
    const props = {
      chart: undefined as unknown as BoxChart,
      dataShape
    };
    before(() => {
      getMenu("Aggregate feature importance").click();
    });
    beforeEach(() => {
      cy.get("*[id*=ChartTypeSelection] label:contains('Box')").click();
      props.chart = new BoxChart("#FeatureImportanceBar");
    });
    describeGlobalExplanationChart(props);
  });
}
