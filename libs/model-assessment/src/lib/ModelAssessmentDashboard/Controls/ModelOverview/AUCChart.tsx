// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Stack,
  StackItem,
  getTheme
} from "@fluentui/react";
import {
  BasicHighChart,
  ErrorCohort,
  FluentUIStyles,
  ITelemetryEvent,
  ModelAssessmentContext,
  // calculateAUCData,
  defaultModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { getAUCChartOptions } from "./getAUCChartOptions";
import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IAUCChartProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class AUCChart extends React.PureComponent<
  IAUCChartProps,
  { selectedCohort?: number }
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  // public constructor(props: Record<string, never> = {}) {
  //   super(props);

  //   this.state = {
  //     selectedCohort: 0
  //   };
  // }
  public render(): React.ReactNode {
    const theme = getTheme();
    const classNames = modelOverviewChartStyles();

    if (
      this.context.dataset.predicted_y === undefined ||
      this.context.dataset.true_y === undefined
    ) {
      return React.Fragment;
    }
    const yLength = this.context.dataset.predicted_y.length;
    if (this.context.dataset.true_y.length !== yLength) {
      return React.Fragment;
    }
    // const allData = calculateAUCData(
    //   this.state.selectedCohort ?? 0,
    //   this.context
    // );
    const plotData = getAUCChartOptions([], theme);

    // let selectedCohort = this.context.errorCohorts.find(
    //   (errorCohort) =>
    //     errorCohort.cohort.getCohortID() === this.state.selectedCohort
    // );
    // if (selectedCohort === undefined) {
    //   // if previously selected cohort does not exist use globally selected cohort
    //   selectedCohort = this.context.errorCohorts[0];
    // }
    const aucLocString = localization.ModelAssessment.ModelOverview.AUCChart;
    console.log(aucLocString.aucCohortSelectionLabel);
    return (
      <Stack id="modelOverviewAUCChart">
        <StackItem className={classNames.dropdown}>
          <ComboBox
            id="AUCCohortDropdown"
            label={aucLocString.aucCohortSelectionLabel}
            selectedKey={0}
            options={this.context.errorCohorts.map(
              (errorCohort: ErrorCohort) => {
                return {
                  key: errorCohort.cohort.getCohortID(),
                  text: errorCohort.cohort.name
                };
              }
            )}
            onChange={this.onSelectCohort}
            styles={FluentUIStyles.limitedSizeMenuDropdown}
          />
        </StackItem>
        <StackItem className={classNames.chart}>
          <BasicHighChart
            configOverride={plotData}
            theme={theme}
            id="AUCChart"
          />
        </StackItem>
      </Stack>
    );
  }
  private onSelectCohort = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.setState({ selectedCohort: Number(item.key) });
    }
  };
}
