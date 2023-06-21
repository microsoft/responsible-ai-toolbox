// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dropdown,
  IDropdownOption,
  Spinner,
  Stack,
  Text
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  featureColumnsExist,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ForecastComparison } from "./Controls/ForecastComparison";
import { TransformationCreationDialog } from "./Controls/TransformationCreationDialog";
import { WhatIfSection } from "./Controls/WhatIfSection";
import { forecastingDashboardStyles } from "./ForecastingDashboard.styles";
import { Transformation } from "./Interfaces/Transformation";

export class IForecastingDashboardProps {}

export interface IForecastingDashboardState {
  transformations?: Map<number, Map<string, Transformation>>;
  isTransformationCreatorVisible: boolean;
  timeSeriesOptions?: IDropdownOption[];
  whatIfEnabled: boolean;
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

    this.state = {
      isTransformationCreatorVisible: false,
      whatIfEnabled: true
    };
  }

  public componentDidMount(): void {
    const timeSeries = this.context.errorCohorts.filter(
      (cohort) => !cohort.isAllDataCohort
    );
    const dropdownOptions: IDropdownOption[] = timeSeries.map((cohort) => {
      return {
        key: cohort.cohort.getCohortID(),
        text: cohort.cohort.name
      };
    });
    // If there is only 1 time series, switch to the corresponding cohort.
    if (timeSeries.length === 1) {
      this.context.shiftErrorCohort(timeSeries[0]);
    }
    // If the dataset only has a time column and time series identifying columns
    // there is nothing to transform with what-if.
    const whatIfEnabled = featureColumnsExist(
      this.context.dataset.feature_names,
      this.context.dataset.feature_metadata
    );

    this.setState({ timeSeriesOptions: dropdownOptions, whatIfEnabled });
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    if (
      this.context === undefined ||
      this.context.baseErrorCohort === undefined ||
      this.state.timeSeriesOptions === undefined
    ) {
      return <Spinner />;
    }

    // "All data" cohort selected, so no particular time series selected yet.
    // Special case: if there's only 1 time series then it is selected by default.
    const noCohortSelected =
      this.context.baseErrorCohort.isAllDataCohort &&
      this.state.timeSeriesOptions.length > 1;

    const cohortTransformations =
      this.state.transformations?.get(
        this.context.baseErrorCohort.cohort.getCohortID()
      ) ?? new Map<string, Transformation>();

    const description = this.getDescription();

    return (
      <>
        <Stack
          className={classNames.sectionStack}
          tokens={{ childrenGap: "24px", padding: "0 0 100px 0" }}
          id="ForecastingDashboard"
        >
          <Stack.Item className={classNames.topLevelDescriptionText}>
            <Text>{description}</Text>
          </Stack.Item>
          <Stack.Item>
            {this.state.timeSeriesOptions.length <= 1 ? (
              <Text>
                {localization.formatString(
                  localization.Forecasting.singleTimeSeries,
                  this.context.baseErrorCohort.cohort.name
                )}
              </Text>
            ) : (
              <Dropdown
                label={localization.Forecasting.timeSeries}
                className={classNames.dropdown}
                options={this.state.timeSeriesOptions}
                onChange={this.onChangeCohort}
                selectedKey={
                  this.context.baseErrorCohort.isAllDataCohort
                    ? undefined
                    : this.context.baseErrorCohort.cohort.getCohortID()
                }
                placeholder={localization.Forecasting.selectTimeSeries}
                disabled={false}
                calloutProps={{ doNotLayer: true }}
              />
            )}
          </Stack.Item>
          {!noCohortSelected && (
            <Stack tokens={{ childrenGap: "20pt" }}>
              {this.state.whatIfEnabled && (
                <WhatIfSection
                  transformations={cohortTransformations}
                  onClickWhatIfButton={(): void => {
                    this.setState({ isTransformationCreatorVisible: true });
                  }}
                />
              )}
              <ForecastComparison transformations={cohortTransformations} />
            </Stack>
          )}
        </Stack>
        <TransformationCreationDialog
          addTransformation={this.addTransformation}
          transformations={cohortTransformations}
          isVisible={this.state.isTransformationCreatorVisible}
          onDismiss={(): void =>
            this.setState({ isTransformationCreatorVisible: false })
          }
        />
      </>
    );
  }

  private getDescription = (): string => {
    let description = this.state.whatIfEnabled
      ? localization.Forecasting.whatIfForecastingDescription
      : localization.Forecasting.forecastDescription;
    if (
      this.state.timeSeriesOptions &&
      this.state.timeSeriesOptions.length > 1
    ) {
      description += ` ${localization.Forecasting.whatIfForecastingChooseTimeSeries}`;
    }
    return description;
  };

  private onChangeCohort = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption<string> | undefined
  ): void => {
    if (option) {
      const newCohortId = option.key as number;
      const newCohort = this.context.errorCohorts.find(
        (cohort) => cohort.cohort.getCohortID() === newCohortId
      );
      if (newCohort) {
        this.context.shiftErrorCohort(newCohort);
      }
    }
  };

  private addTransformation = (
    name: string,
    transformation: Transformation
  ): void => {
    const currentCohortID = this.context.baseErrorCohort.cohort.getCohortID();
    const newMap =
      this.state.transformations ??
      new Map<number, Map<string, Transformation>>();
    const cohortMap =
      this.state.transformations?.get(currentCohortID) ??
      new Map<string, Transformation>();
    cohortMap.set(name, transformation);
    newMap.set(currentCohortID, cohortMap);
    this.setState({
      isTransformationCreatorVisible: false,
      transformations: newMap
    });
  };
}
