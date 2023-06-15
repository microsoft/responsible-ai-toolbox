// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text } from "@fluentui/react";
import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { modelPerformanceTabStyles } from "./ModelPerformanceTab.styles";

class ModelPerformanceTabProps {}

export class ModelPerformanceTab extends React.PureComponent<ModelPerformanceTabProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

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
