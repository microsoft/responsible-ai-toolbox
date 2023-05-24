// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  BasicHighChart,
  ICausalAnalysisSingleData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { isEqual } from "lodash";
import React from "react";

import { getErrorBarChartOptions } from "./getErrorBarChartOptions";

export interface ICausalAggregateChartProps {
  data?: ICausalAnalysisSingleData[];
}

export class CausalAggregateChart extends React.PureComponent<ICausalAggregateChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <BasicHighChart
        configOverride={getErrorBarChartOptions(getTheme(), this.props.data)}
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
