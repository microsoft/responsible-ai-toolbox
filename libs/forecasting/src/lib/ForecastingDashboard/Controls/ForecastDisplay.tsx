// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
// import { localization } from "@responsible-ai/localization";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import { ITransformation } from "../Interfaces/Transformation";

export interface IForecastDisplayProps {
  forecasts: Map<string, ITransformation>;
}

const stackTokens = {
  childrenGap: "l1"
};

export class ForecastDisplay extends React.Component<IForecastDisplayProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    // Stack of stacks for displaying
    const classNames = forecastingDashboardStyles();

    const forecastNames: string[] = [];
    const forecastTransformations: ITransformation[] = [];

    for (const [
      forecastName,
      forecastTransformation
    ] of this.props.forecasts.entries()) {
      forecastNames.push(forecastName);
      forecastTransformations.push(forecastTransformation);
    }

    return (
      <Stack tokens={stackTokens}>
        <Stack.Item>
          <Text className={classNames.mediumText}>
            What-if Forecasts ({this.props.forecasts.size})
          </Text>
        </Stack.Item>
        {this.props.forecasts.size !== 0 && (
          <React.Fragment>
            <Stack.Item>
              <Text className={classNames.subMediumText}>
                Current Cohort: {this.context.baseErrorCohort.cohort.name}
              </Text>
            </Stack.Item>
            <Stack.Item>
              <Stack horizontal tokens={stackTokens}>
                <Stack.Item>
                  <Stack>
                    <Text className={classNames.forecastCategoryText}>
                      Forecast name
                    </Text>
                    {forecastNames.map((forecastName) => (
                      <Text key={forecastName}>{forecastName}</Text>
                    ))}
                  </Stack>
                </Stack.Item>
                <Stack.Item>
                  <Stack>
                    <Text className={classNames.forecastCategoryText}>
                      Forecast function
                    </Text>
                    {forecastTransformations.map((transformation, idx) => {
                      return (
                        <Text key={forecastNames[idx]}>
                          {transformation.operation}, {transformation.feature},{" "}
                          {transformation.value}
                        </Text>
                      );
                    })}
                  </Stack>
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </React.Fragment>
        )}
      </Stack>
    );
  }
}
