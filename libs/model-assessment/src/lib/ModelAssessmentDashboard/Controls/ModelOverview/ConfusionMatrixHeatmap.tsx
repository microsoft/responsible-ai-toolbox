// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  StackItem,
  ComboBox,
  IComboBoxOption,
  IComboBox
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

    this.state = {
      allClasses: context.dataset.class_names
        ? context.dataset.class_names
        : _.range(Math.max(...predictedY, ...trueY) + 1).map(
            (x: number) => `Class ${x}`
          ),
      predictedY,
      selectedClasses: [],
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

    return (
      <Stack id="modelOverviewConfusionMatrix">
        <Stack horizontal>
          <StackItem className={classNames.dropdown}>
            <ComboBox
              id="confusionMatrixClassDropdown"
              label={
                localization.ModelAssessment.ModelOverview
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
                localization.ModelAssessment.ModelOverview
                  .confusionMatrixClassSelectionDefaultPlaceholder
              }
              label={
                localization.ModelAssessment.ModelOverview
                  .confusionMatrixClassSelectionLabel
              }
              selectedKey={this.state.selectedClasses}
              options={this.state.allClasses.map((category: string) => {
                return { key: category, text: category };
              })}
              errorMessage={
                this.state.selectedClasses.length < 2 ||
                this.state.selectedClasses.length > 10
                  ? localization.ModelAssessment.ModelOverview
                      .confusionMatrixClassSelectionError
                  : undefined
              }
              onChange={this.onSelectClasses}
              multiSelect
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
          </StackItem>
        </Stack>
        {this.state.selectedClasses.length >= 2 &&
          this.state.selectedClasses.length <= 10 && (
            <StackItem className={classNames.chart}>
              <HeatmapHighChart
                id="ModelOverviewConfusionMatrix"
                configOverride={{
                  chart: {
                    height: this.state.selectedClasses.length * 80 + 200,
                    marginBottom: 80,
                    marginTop: 80,
                    plotBorderWidth: 1,
                    type: "heatmap",
                    width: this.state.selectedClasses.length * 80 + 200
                  },
                  colorAxis: {
                    maxColor: "#2f7ed8",
                    min: 0,
                    minColor: "#FFFFFF"
                  },
                  custom: {
                    minHeight: 300
                  },
                  legend: {
                    align: "right",
                    enabled: true,
                    layout: "vertical",
                    symbolHeight: this.state.selectedClasses.length * 80 + 40,
                    verticalAlign: "middle"
                  },
                  series: [
                    {
                      borderWidth: 1,
                      data: confusionMatrix,
                      dataLabels: {
                        color: "#000000",
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
                            .confusionMatrixHeatmapTooltip,
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
                    categories: selectedLabels
                  },
                  yAxis: {
                    categories: selectedLabels,
                    reversed: true
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
    if (item) {
      const selectedClass = item.key.toString();
      if (item.selected) {
        this.setState({
          selectedClasses: [...this.state.selectedClasses, selectedClass]
        });
      }
      if (!item.selected) {
        this.setState({
          selectedClasses: this.state.selectedClasses.filter(
            (presentClass: string) => presentClass !== selectedClass
          )
        });
      }
    }
  };
}
