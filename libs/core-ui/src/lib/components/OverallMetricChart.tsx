// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  DefaultButton,
  IDropdownOption,
  Dropdown,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { cohortKey } from "../cohortKey";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "../Context/ModelAssessmentContext";
import { ModelTypes } from "../Interfaces/IExplanationContext";
import {
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig
} from "../util/IGenericChartProps";
import { ITelemetryEvent } from "../util/ITelemetryEvent";
import { ColumnCategories } from "../util/JointDatasetUtils";

import { AxisConfigDialog } from "./AxisConfigDialog";
import { MissingParametersPlaceholder } from "./MissingParametersPlaceholder";
import { overallMetricChartStyles } from "./OverallMetricChart.styles";
import {
  generateDefaultChartAxes,
  generateMetricsList,
  generatePlotlyProps
} from "./OverallMetricChartUtils";

interface IOverallMetricChartState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  selectedCohortIndex: number;
  chartProps: IGenericChartProps | undefined;
}

class IOverallMetricChartProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class OverallMetricChart extends React.PureComponent<
  IOverallMetricChartProps,
  IOverallMetricChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "OverallMetricChart";

  public constructor(props: IOverallMetricChartProps) {
    super(props);
    this.state = {
      chartProps: undefined,
      selectedCohortIndex: 0,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount(): void {
    this.setState({ chartProps: generateDefaultChartAxes(this.context) });
  }

  public render(): React.ReactNode {
    const classNames = overallMetricChartStyles();
    if (!this.context.jointDataset.hasPredictedY) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }
    if (this.state.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = generatePlotlyProps(
      this.context.jointDataset,
      this.state.chartProps,
      this.context.errorCohorts.map((errorCohort) => errorCohort.cohort),
      this.state.selectedCohortIndex
    );
    const metricsList = generateMetricsList(
      this.context,
      this.state.selectedCohortIndex,
      this.state.chartProps.yAxis.property,
      this.state.chartProps
    ).reverse();
    const height = `${Math.max(400, 160 * metricsList.length)}px`;
    const cohortOptions =
      this.state.chartProps.yAxis.property !== cohortKey
        ? this.context.errorCohorts.map((errorCohort, index) => {
            return { key: index, text: errorCohort.cohort.name };
          })
        : undefined;
    return (
      <>
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
              id={"modelPerformanceCohortPicker"}
            />
          </div>
        )}
        <div className={classNames.chartWithAxes} id={this.chartAndConfigsId}>
          {this.state.yDialogOpen && (
            <AxisConfigDialog
              jointDataset={this.context.jointDataset}
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
              onCancel={this.setYClose}
              telemetryHook={this.props.telemetryHook}
            />
          )}
          {this.state.xDialogOpen && (
            <AxisConfigDialog
              jointDataset={this.context.jointDataset}
              orderedGroupTitles={[ColumnCategories.Outcome]}
              selectedColumn={this.state.chartProps.xAxis}
              canBin={false}
              mustBin={false}
              canDither={this.state.chartProps.chartType === ChartTypes.Scatter}
              onAccept={this.onXSet}
              onCancel={this.setXClose}
              telemetryHook={this.props.telemetryHook}
            />
          )}
          <div className={classNames.chartWithVertical}>
            <div className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <div>
                  <DefaultButton
                    onClick={this.setYOpen}
                    text={
                      this.context.jointDataset.metaDict[
                        this.state.chartProps.yAxis.property
                      ].abbridgedLabel
                    }
                    title={
                      this.context.jointDataset.metaDict[
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
                {this.context.modelMetadata.modelType !==
                  ModelTypes.Multiclass && (
                  <div className={classNames.rightPanel}>
                    {!this.context.jointDataset.hasTrueY && (
                      <MissingParametersPlaceholder>
                        {localization.Interpret.ModelPerformance.missingTrueY}
                      </MissingParametersPlaceholder>
                    )}
                    {this.context.jointDataset.hasTrueY &&
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
            <div className={classNames.paddingDiv} />
            <div className={classNames.horizontalAxis}>
              <div>
                <DefaultButton
                  onClick={this.setXOpen}
                  text={
                    this.context.jointDataset.metaDict[
                      this.state.chartProps.xAxis.property
                    ].abbridgedLabel
                  }
                  title={
                    this.context.jointDataset.metaDict[
                      this.state.chartProps.xAxis.property
                    ].label
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </>
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

  private readonly setXOpen = (): void => {
    if (this.state.xDialogOpen === false) {
      this.setState({ xDialogOpen: true });
      return;
    }
    this.setState({ xDialogOpen: false });
  };

  private readonly setXClose = (): void => {
    this.setState({ xDialogOpen: false });
  };

  private readonly setYOpen = (): void => {
    if (this.state.yDialogOpen === false) {
      this.setState({ yDialogOpen: true });
      return;
    }
    this.setState({ yDialogOpen: false });
  };

  private readonly setYClose = (): void => {
    this.setState({ yDialogOpen: false });
  };

  private onXSet = (value: ISelectorConfig): void => {
    const newProps = _.cloneDeep(this.state.chartProps);
    if (!newProps) {
      return;
    }
    newProps.xAxis = value;
    newProps.chartType = this.context.jointDataset.metaDict[value.property]
      ?.treatAsCategorical
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
}
