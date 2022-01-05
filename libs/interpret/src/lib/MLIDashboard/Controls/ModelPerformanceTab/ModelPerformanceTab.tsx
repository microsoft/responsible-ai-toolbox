// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IGenericChartProps,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { Text } from "office-ui-fabric-react";
import React from "react";

import { modelPerformanceTabStyles } from "./ModelPerformanceTab.styles";

interface IModelPerformanceTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  selectedCohortIndex: number;
  chartProps: IGenericChartProps | undefined;
}

class ModelPerformanceTabProps {}

export class ModelPerformanceTab extends React.PureComponent<
  ModelPerformanceTabProps,
  IModelPerformanceTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ModelPerformanceTabProps) {
    super(props);
    this.state = {
      chartProps: undefined,
      selectedCohortIndex: 0,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public render(): React.ReactNode {
    const classNames = modelPerformanceTabStyles();
    if (!this.context.jointDataset.hasPredictedY) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.Interpret.ModelPerformance.helperText}
          </Text>
        </div>
        <OverallMetricChart />
      </div>
    );
  }
}
