// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  StackItem,
  ComboBox,
  IComboBoxOption,
  IComboBox,
  getTheme
} from "@fluentui/react";
import {
  JointDataset,
  FluentUIStyles,
  calculateConfusionMatrixData,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import * as _ from "lodash";
import React from "react";

import { getHeatmapConfig } from "./ConfusionMatrixHeatmapConfig";
import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IConfusionMatrixState {
  selectedClasses: string[];
  allClasses: string[];
  selectedCohort?: number;
}

export class ConfusionMatrixHeatmap extends React.Component<
  Record<string, never>,
  IConfusionMatrixState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private maxDisplayableClasses = 20;
  private minDisplayableClasses = 2;
  private numberOfStartingClasses = 3;

  public constructor(props: Record<string, never> = {}) {
    super(props);

    this.state = {
      allClasses: [],
      selectedClasses: []
    };
  }

  public componentDidMount(): void {
    const allClasses = this.getAllClasses();
    this.setState({
      allClasses,
      selectedClasses: allClasses.slice(0, this.numberOfStartingClasses)
    });
  }

  public render(): React.ReactNode {
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

    let selectedCohort = this.context.errorCohorts.find(
      (errorCohort) =>
        errorCohort.cohort.getCohortID() === this.state.selectedCohort
    );
    if (selectedCohort === undefined) {
      // if previously selected cohort does not exist use globally selected cohort
      selectedCohort = this.context.baseErrorCohort;
    }

    const confusionMatrixData = calculateConfusionMatrixData(
      selectedCohort.cohort.unwrap(JointDataset.TrueYLabel),
      selectedCohort.cohort.unwrap(JointDataset.PredictedYLabel),
      this.state.allClasses,
      this.state.selectedClasses
    );
    const confusionMatrix: PointOptionsObject[] = [];
    const selectedLabels: string[] = [];
    if (confusionMatrixData !== undefined) {
      confusionMatrixData.confusionMatrix.forEach((row, rowIdx) =>
        row.forEach((count, colIdx) => {
          confusionMatrix.push({
            value: count,
            x: colIdx,
            y: rowIdx
          });
        })
      );
      selectedLabels.push(...confusionMatrixData.selectedLabels);
    }

    const theme = getTheme();
    const confusionMatrixLocString =
      localization.ModelAssessment.ModelOverview.confusionMatrix;
    let classSelectionErrorMessage: string | undefined;
    if (this.state.selectedClasses.length < this.minDisplayableClasses) {
      classSelectionErrorMessage = localization.formatString(
        confusionMatrixLocString.confusionMatrixClassMinSelectionError,
        this.minDisplayableClasses
      );
    } else if (this.state.selectedClasses.length > this.maxDisplayableClasses) {
      classSelectionErrorMessage = localization.formatString(
        confusionMatrixLocString.confusionMatrixClassMaxSelectionError,
        this.maxDisplayableClasses
      );
    }
    const selectedClasses = this.state.selectedClasses;

    return (
      <Stack id="modelOverviewConfusionMatrix">
        <Stack horizontal>
          <StackItem className={classNames.dropdown}>
            <ComboBox
              id="confusionMatrixCohortDropdown"
              label={
                confusionMatrixLocString.confusionMatrixCohortSelectionLabel
              }
              selectedKey={selectedCohort.cohort.getCohortID()}
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
          <StackItem className={classNames.dropdown}>
            <ComboBox
              id="confusionMatrixClassDropdown"
              placeholder={
                confusionMatrixLocString.confusionMatrixClassSelectionDefaultPlaceholder
              }
              label={
                confusionMatrixLocString.confusionMatrixClassSelectionLabel
              }
              selectedKey={selectedClasses}
              options={this.state.allClasses.map((category: string) => {
                return { key: category, text: category };
              })}
              errorMessage={classSelectionErrorMessage}
              onChange={this.onSelectClasses}
              multiSelect
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
          </StackItem>
        </Stack>
        {selectedClasses.length >= this.minDisplayableClasses &&
          selectedClasses.length <= this.maxDisplayableClasses && (
            <StackItem className={classNames.chart}>
              <HeatmapHighChart
                id="ModelOverviewConfusionMatrix"
                configOverride={getHeatmapConfig(
                  confusionMatrix,
                  selectedLabels,
                  theme
                )}
              />
            </StackItem>
          )}
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

  private onSelectClasses = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item && item.selected !== undefined) {
      const selectedClass = item.key.toString();
      const alreadySelectedClass =
        this.state.selectedClasses.includes(selectedClass);
      if (item.selected && !alreadySelectedClass) {
        this.setState({
          selectedClasses: [...this.state.selectedClasses, selectedClass]
        });
      }
      if (!item.selected && alreadySelectedClass) {
        this.setState({
          selectedClasses: this.state.selectedClasses.filter(
            (presentClass: string) => presentClass !== selectedClass
          )
        });
      }
    }
  };

  private getAllClasses(): string[] {
    if (this.context.dataset.class_names) {
      return this.context.dataset.class_names;
    }
    if (this.context.dataset.predicted_y && this.context.dataset.true_y) {
      const allClasses = _.uniq([
        ...this.context.dataset.true_y,
        ...this.context.dataset.predicted_y
      ]).map(
        (category) =>
          `${localization.ModelAssessment.ModelOverview.confusionMatrix.class} ${category}`
      );
      return allClasses;
    }
    return [];
  }
}
