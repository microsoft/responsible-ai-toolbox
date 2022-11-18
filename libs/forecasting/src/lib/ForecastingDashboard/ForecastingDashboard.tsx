// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { ForecastCompare } from "./Controls/ForecastCompare";
import { ForecastCreator } from "./Controls/ForecastCreator";
import { ForecastDisplay } from "./Controls/ForecastDisplay";
import { forecastingDashboardStyles } from "./ForecastingDashboard.styles";
import { ITransformation } from "./Interfaces/Transformation";

export interface IForecastingDashboardProps {
  baseErrorCohortName: string;
}

export interface IForecastingDashboardState {
  allForecasts: Map<string, Map<string, ITransformation>>;
}

export class ForecastingDashboard extends React.Component<
  IForecastingDashboardProps,
  IForecastingDashboardState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IForecastingDashboardProps) {
    super(props);
    const allForecasts = new Map<string, Map<string, ITransformation>>();
    allForecasts.set(
      props.baseErrorCohortName,
      new Map<string, ITransformation>()
    );
    this.state = {
      allForecasts
    };
  }

  public componentDidUpdate(prevProps: IForecastingDashboardProps): void {
    if (this.props.baseErrorCohortName !== prevProps.baseErrorCohortName) {
      const newMap = this.state.allForecasts;
      if (!newMap.has(this.props.baseErrorCohortName)) {
        newMap.set(
          this.props.baseErrorCohortName,
          new Map<string, ITransformation>()
        );
      }
      this.setState({ allForecasts: newMap });
    }
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    const cohortForecasts = this.state.allForecasts.get(
      this.context.baseErrorCohort.cohort.name
    );

    return (
      <Stack
        className={classNames.sectionStack}
        tokens={{ childrenGap: "24px" }}
        id="ForecastingDashboard"
      >
        <Stack.Item>
          <Text className={classNames.topLevelDescriptionText}>
            What-if allows you to perturb features for any input and observe how
            the model's prediction changes. You can perturb features manually or
            simply specify the desired prediction (e.g., class label for a
            classifier) to see a list of closest data points to the original
            input that would lead to the desired prediction. Also known as
            prediction counterfactuals, you can use them for exploring the
            relationships learnt by the model; understanding important,
            necessary features for the model's predictions; or debug edge-cases
            for the model. To start, choose input points from the data table or
            scatter plot.
          </Text>
        </Stack.Item>
        {cohortForecasts !== undefined && (
          <React.Fragment>
            <Stack.Item>
              <ForecastCreator
                addTransformation={this.addTransformation}
                forecasts={cohortForecasts}
              />
            </Stack.Item>
            <Stack.Item>
              <ForecastDisplay forecasts={cohortForecasts} />
            </Stack.Item>
            <Stack.Item>
              <ForecastCompare
                cohortName={this.props.baseErrorCohortName}
                forecasts={cohortForecasts}
              />
            </Stack.Item>
          </React.Fragment>
        )}
      </Stack>
    );
  }

  private addTransformation = (
    name: string,
    transformation: ITransformation
  ): void => {
    const cohortMap = this.state.allForecasts.get(
      this.props.baseErrorCohortName
    );
    if (cohortMap === undefined) {
      return;
    }
    cohortMap.set(name, transformation);
    const newMap = this.state.allForecasts;
    newMap.set(this.props.baseErrorCohortName, cohortMap);
    this.setState({ allForecasts: newMap });
  };
}
