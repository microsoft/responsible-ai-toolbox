// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ColumnCategories,
  ExpandableText,
  JointDataset,
  ModelTypes,
  IExplanationModelMetadata,
  cohortKey
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  DefaultButton,
  IDropdownOption,
  Dropdown,
  Text
} from "office-ui-fabric-react";
import { Transform } from "plotly.js";
import React from "react";

import { ChartTypes } from "../../ChartTypes";
import { Cohort } from "../../Cohort";
import { FabricStyles } from "../../FabricStyles";
import { IGenericChartProps } from "../../IGenericChartProps";
import { ISelectorConfig } from "../../NewExplanationDashboard";
import { ILabeledStatistic, generateMetrics } from "../../StatisticsUtils";
import { AxisConfigDialog } from "../AxisConfigurationDialog/AxisConfigDialog";

import { modelPerformanceTabStyles } from "./ModelPerformanceTab.styles";

export interface IModelPerformanceTabProps {
  theme?: string;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohorts: Cohort[];
}

export interface IModelPerformanceTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  selectedCohortIndex: number;
  chartProps: IGenericChartProps | undefined;
}

export class ModelPerformanceTab extends React.PureComponent<
  IModelPerformanceTabProps,
  IModelPerformanceTabState
> {
  private readonly chartAndConfigsId = "chart-and-axis-config-id";

  public constructor(props: IModelPerformanceTabProps) {
    super(props);
    this.state = {
      chartProps: this.generateDefaultChartAxes(),
      selectedCohortIndex: 0,
      xDialogOpen: false,
      yDialogOpen: false
    };
    if (!this.props.jointDataset.hasPredictedY) {
      return;
    }
  }

  private static generatePlotlyProps(
    jointData: JointDataset,
    chartProps: IGenericChartProps,
    cohorts: Cohort[],
    selectedCohortIndex: number
  ): IPlotlyProperty {
    // In this view, y will always be categorical (including a binned numberic variable), and could be
    // iterations over the cohorts. We can set y and the y labels before the rest of the char properties.
    const plotlyProps: IPlotlyProperty = {
      config: { displaylogo: false, displayModeBar: false, responsive: true },
      data: [{}],
      layout: {
        autosize: true,
        dragmode: false,
        hovermode: "closest",
        margin: {
          b: 20,
          l: 10,
          t: 25
        },
        showlegend: false,
        xaxis: {
          color: FabricStyles.chartAxisColor,
          gridcolor: "#e5e5e5",
          mirror: true,
          showgrid: true,
          showline: true,
          side: "bottom",
          tickfont: {
            family: FabricStyles.fontFamilies,
            size: 11
          }
        },
        yaxis: {
          automargin: true,
          color: FabricStyles.chartAxisColor,
          showline: true,
          tickfont: {
            family: FabricStyles.fontFamilies,
            size: 11
          }
        }
      } as any
    };
    let rawX: number[];
    let rawY: number[];
    let yLabels: string[] | undefined;
    let yLabelIndexes: number[] | undefined;
    const yMeta = jointData.metaDict[chartProps.yAxis.property];
    const yAxisName = yMeta.label;
    if (chartProps.yAxis.property === cohortKey) {
      rawX = [];
      rawY = [];
      yLabels = [];
      yLabelIndexes = [];
      cohorts.forEach((cohort, cohortIndex) => {
        const cohortXs = cohort.unwrap(
          chartProps.xAxis.property,
          chartProps.chartType === ChartTypes.Histogram
        );
        const cohortY = new Array(cohortXs.length).fill(cohortIndex);
        rawX.push(...cohortXs);
        rawY.push(...cohortY);
        yLabels?.push(cohort.name);
        yLabelIndexes?.push(cohortIndex);
      });
    } else {
      const cohort = cohorts[selectedCohortIndex];
      rawY = cohort.unwrap(chartProps.yAxis.property, true);
      rawX = cohort.unwrap(
        chartProps.xAxis.property,
        chartProps.chartType === ChartTypes.Histogram
      );
      yLabels = yMeta.sortedCategoricalValues;
      yLabelIndexes = yLabels?.map((_, index) => index);
    }

    // The bounding box for the labels on y axis are too small, add some white space as buffer
    yLabels = yLabels?.map((val) => {
      const len = val.length;
      let result = " ";
      for (let i = 0; i < len; i += 5) {
        result += " ";
      }
      return result + val;
    });
    plotlyProps.data[0].hoverinfo = "all";
    plotlyProps.data[0].orientation = "h";
    switch (chartProps.chartType) {
      case ChartTypes.Box: {
        // Uncomment to turn off tooltips on box plots
        // plotlyProps.layout.hovermode = false;
        plotlyProps.data[0].type = "box" as any;
        plotlyProps.data[0].x = rawX;
        plotlyProps.data[0].y = rawY;
        plotlyProps.data[0].marker = {
          color: FabricStyles.fabricColorPalette[0]
        };
        _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
        _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
        break;
      }
      case ChartTypes.Histogram: {
        // for now, treat all bar charts as histograms, the issue with plotly implemented histogram is
        // it tries to bin the data passed to it(we'd like to apply the user specified bins.)
        // We also use the selected Y property as the series prop, since all histograms will just be a count.
        plotlyProps.data[0].type = "bar";
        const x = new Array(rawY.length).fill(1);
        plotlyProps.data[0].text = rawY.map((index) => yLabels?.[index] || "");
        plotlyProps.data[0].hoverinfo = "all";
        plotlyProps.data[0].hovertemplate = ` ${yAxisName}:%{y}<br> ${localization.Interpret.Charts.count}: %{x}<br>`;
        plotlyProps.data[0].y = rawY;
        plotlyProps.data[0].x = x;
        plotlyProps.data[0].marker = {};
        _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
        _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
        const styles = jointData.metaDict[
          chartProps.xAxis.property
        ].sortedCategoricalValues?.map((label, index) => {
          return {
            target: index,
            value: {
              marker: {
                color: FabricStyles.fabricColorPalette[index]
              },
              name: label
            }
          };
        });
        const transforms: Array<Partial<Transform>> = [
          {
            aggregations: [{ func: "sum", target: "x" }],
            groups: rawY,
            type: "aggregate"
          },
          {
            groups: rawX,
            styles,
            type: "groupby"
          }
        ];
        if (plotlyProps.layout) {
          plotlyProps.layout.showlegend = true;
        }
        plotlyProps.data[0].transforms = transforms;
        break;
      }
      default:
    }
    return plotlyProps;
  }

  public render(): React.ReactNode {
    const classNames = modelPerformanceTabStyles();
    if (!this.props.jointDataset.hasPredictedY) {
      return (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.Interpret.ModelPerformance.missingParameters}
            </Text>
          </div>
        </div>
      );
    }
    if (this.state.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = ModelPerformanceTab.generatePlotlyProps(
      this.props.jointDataset,
      this.state.chartProps,
      this.props.cohorts,
      this.state.selectedCohortIndex
    );
    const metricsList = this.generateMetrics().reverse();
    const height = Math.max(400, 160 * metricsList.length) + "px";
    const cohortOptions =
      this.state.chartProps.yAxis.property !== cohortKey
        ? this.props.cohorts.map((cohort, index) => {
            return { key: index, text: cohort.name };
          })
        : undefined;
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <ExpandableText
            iconName="Info"
            expandedText={localization.Interpret.ModelPerformance.helperText}
          >
            {localization.Interpret.ModelPerformance.collapsedHelperText}
          </ExpandableText>
        </div>
        {cohortOptions && (
          <div className={classNames.cohortPickerWrapper}>
            <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
              {localization.Interpret.ModelPerformance.cohortPickerLabel}
            </Text>
            <Dropdown
              styles={{ dropdown: { width: 150 } }}
              options={cohortOptions}
              selectedKey={this.state.selectedCohortIndex}
              onChange={this.setSelectedCohort}
            />
          </div>
        )}
        <div className={classNames.chartWithAxes} id={this.chartAndConfigsId}>
          {this.state.yDialogOpen && (
            <AxisConfigDialog
              jointDataset={this.props.jointDataset}
              orderedGroupTitles={[
                ColumnCategories.Cohort,
                ColumnCategories.Dataset
              ]}
              selectedColumn={this.state.chartProps.yAxis}
              canBin={
                this.state.chartProps.chartType === ChartTypes.Histogram ||
                this.state.chartProps.chartType === ChartTypes.Box
              }
              mustBin={
                this.state.chartProps.chartType === ChartTypes.Histogram ||
                this.state.chartProps.chartType === ChartTypes.Box
              }
              canDither={this.state.chartProps.chartType === ChartTypes.Scatter}
              onAccept={this.onYSet}
              onCancel={this.setYOpen.bind(this, false)}
            />
          )}
          {this.state.xDialogOpen && (
            <AxisConfigDialog
              jointDataset={this.props.jointDataset}
              orderedGroupTitles={[ColumnCategories.Outcome]}
              selectedColumn={this.state.chartProps.xAxis}
              canBin={false}
              mustBin={false}
              canDither={this.state.chartProps.chartType === ChartTypes.Scatter}
              onAccept={this.onXSet}
              onCancel={this.setXOpen.bind(this, false)}
            />
          )}
          <div className={classNames.chartWithVertical}>
            <div className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <div>
                  <DefaultButton
                    onClick={this.setYOpen.bind(this, true)}
                    text={
                      this.props.jointDataset.metaDict[
                        this.state.chartProps.yAxis.property
                      ].abbridgedLabel
                    }
                    title={
                      this.props.jointDataset.metaDict[
                        this.state.chartProps.yAxis.property
                      ].label
                    }
                  />
                </div>
              </div>
            </div>
            <div className={classNames.scrollableWrapper}>
              <div className={classNames.scrollContent} style={{ height }}>
                <div className={classNames.chart}>
                  <AccessibleChart
                    plotlyProps={plotlyProps}
                    theme={getTheme() as any}
                  />
                </div>
                {this.props.metadata.modelType !== ModelTypes.Multiclass && (
                  <div className={classNames.rightPanel}>
                    {!this.props.jointDataset.hasTrueY && (
                      <div className={classNames.missingParametersPlaceholder}>
                        <div
                          className={
                            classNames.missingParametersPlaceholderNeutralSpacer
                          }
                        >
                          <Text
                            variant="large"
                            className={classNames.faintText}
                          >
                            {
                              localization.Interpret.ModelPerformance
                                .missingTrueY
                            }
                          </Text>
                        </div>
                      </div>
                    )}
                    {this.props.jointDataset.hasTrueY &&
                      metricsList.map((stats, index) => {
                        return (
                          <div className={classNames.statsBox} key={index}>
                            {stats.map((labeledStat, statIndex) => {
                              return (
                                <Text block key={statIndex}>
                                  {localization.formatString(
                                    labeledStat.label,
                                    labeledStat.stat.toLocaleString(undefined, {
                                      maximumFractionDigits: 3
                                    })
                                  )}
                                </Text>
                              );
                            })}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={classNames.horizontalAxisWithPadding}>
            <div className={classNames.paddingDiv}></div>
            <div className={classNames.horizontalAxis}>
              <div>
                <DefaultButton
                  onClick={this.setXOpen.bind(this, true)}
                  text={
                    this.props.jointDataset.metaDict[
                      this.state.chartProps.xAxis.property
                    ].abbridgedLabel
                  }
                  title={
                    this.props.jointDataset.metaDict[
                      this.state.chartProps.xAxis.property
                    ].label
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private setSelectedCohort = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (typeof item?.key === "number") {
      this.setState({ selectedCohortIndex: item.key });
    }
  };

  private readonly setXOpen = (val: boolean): void => {
    if (val && this.state.xDialogOpen === false) {
      this.setState({ xDialogOpen: true });
      return;
    }
    this.setState({ xDialogOpen: false });
  };

  private readonly setYOpen = (val: boolean): void => {
    if (val && this.state.yDialogOpen === false) {
      this.setState({ yDialogOpen: true });
      return;
    }
    this.setState({ yDialogOpen: false });
  };

  private onXSet = (value: ISelectorConfig): void => {
    const newProps = _.cloneDeep(this.state.chartProps);
    if (!newProps) {
      return;
    }
    newProps.xAxis = value;
    newProps.chartType = this.props.jointDataset.metaDict[value.property]
      .treatAsCategorical
      ? ChartTypes.Histogram
      : ChartTypes.Box;

    this.setState({ chartProps: newProps, xDialogOpen: false });
  };

  private onYSet = (value: ISelectorConfig): void => {
    const newProps = _.cloneDeep(this.state.chartProps);
    if (!newProps) {
      return;
    }
    newProps.yAxis = value;

    this.setState({ chartProps: newProps, yDialogOpen: false });
  };

  private generateDefaultChartAxes(): IGenericChartProps | undefined {
    if (!this.props.jointDataset.hasPredictedY) {
      return undefined;
    }
    let bestModelMetricKey: string;
    if (
      this.props.metadata.modelType === ModelTypes.Binary &&
      this.props.jointDataset.hasPredictedProbabilities
    ) {
      bestModelMetricKey = JointDataset.ProbabilityYRoot + "0";
    } else if (this.props.metadata.modelType === ModelTypes.Regression) {
      if (
        this.props.jointDataset.hasPredictedY &&
        this.props.jointDataset.hasTrueY
      ) {
        bestModelMetricKey = JointDataset.RegressionError;
      } else {
        bestModelMetricKey = JointDataset.PredictedYLabel;
      }
    } else {
      bestModelMetricKey = JointDataset.PredictedYLabel;
    } // not handling multiclass at this time

    const chartProps: IGenericChartProps = {
      chartType: this.props.jointDataset.metaDict[bestModelMetricKey]
        .isCategorical
        ? ChartTypes.Histogram
        : ChartTypes.Box,
      xAxis: {
        options: {
          bin: false
        },
        property: bestModelMetricKey
      },
      yAxis: {
        options: {},
        property: cohortKey
      }
    };
    return chartProps;
  }

  private generateMetrics(): ILabeledStatistic[][] {
    if (!this.state.chartProps) {
      return [];
    }
    if (this.state.chartProps.yAxis.property === cohortKey) {
      const indexes = this.props.cohorts.map((cohort) =>
        cohort.unwrap(JointDataset.IndexLabel)
      );
      return generateMetrics(
        this.props.jointDataset,
        indexes,
        this.props.metadata.modelType
      );
    }
    const cohort = this.props.cohorts[this.state.selectedCohortIndex];
    const yValues = cohort.unwrap(this.state.chartProps.yAxis.property, true);
    const indexArray = cohort.unwrap(JointDataset.IndexLabel);
    const sortedCategoricalValues = this.props.jointDataset.metaDict[
      this.state.chartProps.yAxis.property
    ].sortedCategoricalValues;
    const indexes = sortedCategoricalValues?.map((_, labelIndex) => {
      return indexArray.filter((_, index) => {
        return yValues[index] === labelIndex;
      });
    });
    return generateMetrics(
      this.props.jointDataset,
      indexes || [],
      this.props.metadata.modelType
    );
  }
}
