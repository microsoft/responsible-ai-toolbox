// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  BasicHighChart,
  getErrorBarChartOptions,
  ICausalAnalysisSingleData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import _, { isEqual } from "lodash";
import { getTheme } from "office-ui-fabric-react";
import React from "react";

export interface ICausalAggregateChartProps {
  data: ICausalAnalysisSingleData[];
}

export class CausalAggregateChart extends React.PureComponent<ICausalAggregateChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <BasicHighChart
        configOverride={getErrorBarChartOptions(this.props.data, getTheme())}
        theme={getTheme()}
        id="CausalAggregateChart"
      />
    );
  }

  public componentDidUpdate(prevProps: ICausalAggregateChartProps): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.forceUpdate();
    }
  }
}
