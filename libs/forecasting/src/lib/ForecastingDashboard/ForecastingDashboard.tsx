// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ForecastComparison } from "./Controls/ForecastComparison";
import { forecastingDashboardStyles } from "./ForecastingDashboard.styles";

export class IForecastingDashboardProps {}

export class IForecastingDashboardState {}

export class ForecastingDashboard extends React.Component<
  IForecastingDashboardProps,
  IForecastingDashboardState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    if (
      this.context === undefined ||
      this.context.baseErrorCohort === undefined
    ) {
      return;
    }

    // "All data" cohort selected, so no particular time series selected yet.
    // special case: only 1 time series in dataset, needs to be handled! TODO
    const noCohortSelected =
      this.context.baseErrorCohort.cohort.name ===
      localization.ErrorAnalysis.Cohort.defaultLabel;

    const dropdownOptions: IDropdownOption[] = this.context.errorCohorts
      .filter(
        (cohort) =>
          cohort.cohort.name !== localization.ErrorAnalysis.Cohort.defaultLabel
      )
      .map((cohort) => {
        return {
          key: cohort.cohort.getCohortID(),
          text: cohort.cohort.name
        };
      });

    return (
      <Stack
        className={classNames.sectionStack}
        tokens={{ childrenGap: "24px", padding: "0 0 100px 0" }}
        id="ForecastingDashboard"
      >
        <Stack.Item className={classNames.topLevelDescriptionText}>
          <Text>{localization.Forecasting.whatIfDescription}</Text>
        </Stack.Item>
        <Stack.Item>
          <Dropdown
            label={localization.Forecasting.timeSeries}
            className={classNames.dropdown}
            options={dropdownOptions}
            onChange={this.onChangeCohort}
            selectedKey={
              this.context.baseErrorCohort.cohort.name ===
              localization.ErrorAnalysis.Cohort.defaultLabel
                ? undefined
                : this.context.baseErrorCohort.cohort.getCohortID()
            }
            placeholder={localization.Forecasting.selectTimeSeries}
          />
        </Stack.Item>
        {!noCohortSelected && (
          <Stack.Item>
            <ForecastComparison />
          </Stack.Item>
        )}
      </Stack>
    );
  }

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
}
