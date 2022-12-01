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
import { Point, PointOptionsObject } from "highcharts";
import * as _ from "lodash";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";
import { wrapText } from "./StatsTableUtils";

interface IConfusionMatrixState {
  predictedY: number[];
  trueY: number[];
  allClasses: string[];
  selectedClasses: string[];
  selectedCohort: number;
}

interface IConfusionMatrixPoint extends Point {
  value: number;
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
  public constructor(
    props: Record<string, never> = {},
    context: React.ContextType<typeof ModelAssessmentContext>
  ) {
    super(props);

    const predictedY: number[] = context.dataset.predicted_y
      ? context.dataset.predicted_y
      : [];
    const trueY: number[] = context.dataset.true_y
      ? context.dataset.true_y
      : [];
    const allClasses: string[] = context.dataset.class_names
      ? context.dataset.class_names.map(String)
      : _.range(Math.max(...predictedY, ...trueY) + 1).map(
          (x: number) =>
            `${localization.ModelAssessment.ModelOverview.confusionMatrix.class} ${x}`
        );
    this.state = {
      allClasses,
      predictedY,
      selectedClasses: allClasses.slice(0, this.numberOfStartingClasses),
      selectedCohort: context.errorCohorts[0].cohort.getCohortID(),
      trueY
    };
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewChartStyles();

    const selectedIndices: number[] = [];

    this.context.errorCohorts.forEach((errorCohort: ErrorCohort) => {
      if (errorCohort.cohort.getCohortID() === this.state.selectedCohort) {
        selectedIndices.push(
          ...errorCohort.cohort.unwrap(JointDataset.IndexLabel)
        );
      }
    });
    const yPred: number[] = [];
    const yTrue: number[] = [];

    selectedIndices.forEach((idx) => {
      yPred.push(this.state.predictedY[idx]);
      yTrue.push(this.state.trueY[idx]);
    });

    const confusionMatrixData = calculateConfusionMatrixData(
      yTrue,
      yPred,
      this.state.allClasses,
      this.state.selectedClasses
    );

    const confusionMatrix: PointOptionsObject[] = [];
    const selectedLabels: string[] = [];

    if (confusionMatrixData !== undefined) {
      confusionMatrixData.confusionMatrix.forEach((row, rowIdx) =>
        row.forEach((it, colIdx) => {
          confusionMatrix.push({
            value: it,
            x: colIdx,
            y: rowIdx
          });
        })
      );
      selectedLabels.push(...confusionMatrixData.selectedLabels);
    }

    const theme = getTheme();

    let classSelectionErrorMessage: string | undefined;
    if (this.state.selectedClasses.length < this.minDisplayableClasses) {
      classSelectionErrorMessage = localization.formatString(
        localization.ModelAssessment.ModelOverview.confusionMatrix
          .confusionMatrixClassMinSelectionError,
        this.minDisplayableClasses
      );
    } else if (this.state.selectedClasses.length > this.maxDisplayableClasses) {
      classSelectionErrorMessage = localization.formatString(
        localization.ModelAssessment.ModelOverview.confusionMatrix
          .confusionMatrixClassMaxSelectionError,
        this.maxDisplayableClasses
      );
    }

    return (
      <Stack id="modelOverviewConfusionMatrix">
        <Stack horizontal>
          <StackItem className={classNames.dropdown}>
            <ComboBox
              id="confusionMatrixCohortDropdown"
              label={
                localization.ModelAssessment.ModelOverview.confusionMatrix
                  .confusionMatrixCohortSelectionLabel
              }
              selectedKey={this.state.selectedCohort}
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
                localization.ModelAssessment.ModelOverview.confusionMatrix
                  .confusionMatrixClassSelectionDefaultPlaceholder
              }
              label={
                localization.ModelAssessment.ModelOverview.confusionMatrix
                  .confusionMatrixClassSelectionLabel
              }
              selectedKey={this.state.selectedClasses}
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
        {this.state.selectedClasses.length >= this.minDisplayableClasses &&
          this.state.selectedClasses.length <= this.maxDisplayableClasses && (
            <StackItem className={classNames.chart}>
              <HeatmapHighChart
                id="ModelOverviewConfusionMatrix"
                configOverride={{
                  chart: {
                    height: this.state.selectedClasses.length * 40 + 200,
                    marginBottom: 80,
                    marginTop: 80,
                    plotBorderWidth: 1,
                    type: "heatmap",
                    width: this.state.selectedClasses.length * 40 + 200
                  },
                  colorAxis: {
                    maxColor: theme.palette.blue,
                    min: 0,
                    minColor: theme.palette.white
                  },
                  custom: {
                    minHeight: 300
                  },
                  legend: {
                    align: "right",
                    enabled: true,
                    layout: "vertical",
                    symbolHeight: this.state.selectedClasses.length * 40 + 40,
                    verticalAlign: "middle"
                  },
                  series: [
                    {
                      borderWidth: 1,
                      data: confusionMatrix,
                      dataLabels: {
                        color: theme.palette.black,
                        enabled: true
                      },
                      type: "heatmap"
                    }
                  ],
                  tooltip: {
                    formatter(): string | undefined {
                      const x = this.point.x ? this.point.x : 0;
                      const y = this.point.y ? this.point.y : 0;
                      const point: IConfusionMatrixPoint = this
                        .point as IConfusionMatrixPoint;
                      const pointValueBold = `<b>${point.value} </b>`;
                      const predictedClassBold = `<b>${this.series.xAxis.categories[x]}</b>`;
                      const trueClassBold = `<b>${this.series.yAxis.categories[y]}</b>`;
                      return wrapText(
                        localization.formatString(
                          localization.ModelAssessment.ModelOverview
                            .confusionMatrix.confusionMatrixHeatmapTooltip,
                          pointValueBold,
                          trueClassBold,
                          predictedClassBold
                        ),
                        40,
                        10
                      );
                    }
                  },
                  xAxis: {
                    categories: this.state.selectedClasses,
                    title: {
                      text: `<b>${localization.ModelAssessment.ModelOverview.confusionMatrix.confusionMatrixXAxisLabel}</b>`
                    }
                  },
                  yAxis: {
                    categories: this.state.selectedClasses,
                    reversed: true,
                    title: {
                      text: `<b>${localization.ModelAssessment.ModelOverview.confusionMatrix.confusionMatrixYAxisLabel}</b>`
                    }
                  }
                }}
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
      if (
        item.selected &&
        !this.state.selectedClasses.includes(selectedClass)
      ) {
        this.setState({
          selectedClasses: [...this.state.selectedClasses, selectedClass]
        });
      }
      if (
        !item.selected &&
        this.state.selectedClasses.includes(selectedClass)
      ) {
        this.setState({
          selectedClasses: this.state.selectedClasses.filter(
            (presentClass: string) => presentClass !== selectedClass
          )
        });
      }
    }
  };
}
