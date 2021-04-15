// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  AxisConfigDialog,
  ExpandableText,
  JointDataset,
  ColumnCategories,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  rowErrorSize
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  DefaultButton,
  IChoiceGroupOption
} from "office-ui-fabric-react";
import React from "react";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";
import { generatePlotlyProps } from "./generatePlotlyProps";
import { SidePanel } from "./SidePanel";

export class IDatasetExplorerTabProps {}

export interface IDatasetExplorerTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  colorDialogOpen: boolean;
  calloutVisible: boolean;
  chartProps?: IGenericChartProps;
}

export class DatasetExplorerTab extends React.PureComponent<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "DatasetExplorerChart";

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);
    this.state = {
      calloutVisible: false,
      colorDialogOpen: false,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount() {
    this.setState({ chartProps: this.generateDefaultChartAxes() });
  }

  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();

    if (!this.context.jointDataset.hasDataset) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.DatasetExplorer.missingParameters}
        </MissingParametersPlaceholder>
      );
    }
    if (this.state.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = generatePlotlyProps(
      this.context.jointDataset,
      this.state.chartProps,
      this.context.selectedCohort.cohort
    );
    const cohortLength = this.context.selectedCohort.cohort.filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      this.state.chartProps.chartType !== ChartTypes.Scatter;
    const yAxisCategories = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    if (this.state.chartProps.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.None);
    }
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <ExpandableText
            expandedText={localization.Interpret.DatasetExplorer.helperText}
            iconName="Info"
          >
            {localization.Interpret.DatasetExplorer.collapsedHelperText}
          </ExpandableText>
        </div>
        <div className={classNames.mainArea} id={this.chartAndConfigsId}>
          <div className={classNames.chartWithAxes}>
            {this.state.yDialogOpen && (
              <AxisConfigDialog
                jointDataset={this.context.jointDataset}
                orderedGroupTitles={yAxisCategories}
                selectedColumn={this.state.chartProps.yAxis}
                canBin={false}
                mustBin={false}
                canDither={
                  this.state.chartProps.chartType === ChartTypes.Scatter
                }
                onAccept={this.onYSet}
                onCancel={this.setYOpen.bind(this, false)}
              />
            )}
            {this.state.xDialogOpen && (
              <AxisConfigDialog
                jointDataset={this.context.jointDataset}
                orderedGroupTitles={[
                  ColumnCategories.Index,
                  ColumnCategories.Dataset,
                  ColumnCategories.Outcome
                ]}
                selectedColumn={this.state.chartProps.xAxis}
                canBin={
                  this.state.chartProps.chartType === ChartTypes.Histogram ||
                  this.state.chartProps.chartType === ChartTypes.Box
                }
                mustBin={
                  this.state.chartProps.chartType === ChartTypes.Histogram ||
                  this.state.chartProps.chartType === ChartTypes.Box
                }
                canDither={
                  this.state.chartProps.chartType === ChartTypes.Scatter
                }
                onAccept={this.onXSet}
                onCancel={this.setXOpen.bind(this, false)}
              />
            )}
            {this.state.colorDialogOpen && this.state.chartProps.colorAxis && (
              <AxisConfigDialog
                jointDataset={this.context.jointDataset}
                orderedGroupTitles={[
                  ColumnCategories.Index,
                  ColumnCategories.Dataset,
                  ColumnCategories.Outcome
                ]}
                selectedColumn={this.state.chartProps.colorAxis}
                canBin={true}
                mustBin={false}
                canDither={false}
                onAccept={this.onColorSet}
                onCancel={this.setColorClose}
              />
            )}
            <div className={classNames.chartWithVertical}>
              <div className={classNames.verticalAxis}>
                <div className={classNames.rotatedVerticalBox}>
                  <div>
                    <DefaultButton
                      onClick={this.setYOpen.bind(this, true)}
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
              {canRenderChart ? (
                <AccessibleChart plotlyProps={plotlyProps} theme={getTheme()} />
              ) : (
                <MissingParametersPlaceholder>
                  {localization.Interpret.ValidationErrors.datasizeError}
                </MissingParametersPlaceholder>
              )}
            </div>
            <div className={classNames.horizontalAxisWithPadding}>
              <div className={classNames.paddingDiv}></div>
              <div className={classNames.horizontalAxis}>
                <div>
                  <DefaultButton
                    onClick={this.setXOpen.bind(this, true)}
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
          <SidePanel
            chartProps={this.state.chartProps}
            setColorOpen={this.setColorOpen}
            onChartTypeChange={this.onChartTypeChange}
          />
        </div>
      </div>
    );
  }

  private onChartTypeChange = (
    _ev?: React.SyntheticEvent<HTMLElement>,
    item?: IChoiceGroupOption
  ): void => {
    const newProps = _.cloneDeep(this.state.chartProps);
    if (item?.key === undefined || !newProps) {
      return;
    }
    newProps.chartType = item.key as ChartTypes;
    if (newProps.yAxis.property === ColumnCategories.None) {
      newProps.yAxis = this.generateDefaultYAxis();
    }
    this.setState({ chartProps: newProps });
  };

  private readonly setXOpen = (val: boolean): void => {
    if (val && this.state.xDialogOpen === false) {
      this.setState({ xDialogOpen: true });
      return;
    }
    this.setState({ xDialogOpen: false });
  };

  private readonly setColorOpen = (): void => {
    this.setState({ colorDialogOpen: true });
  };

  private readonly setColorClose = (): void => {
    this.setState({ colorDialogOpen: false });
  };

  private readonly setYOpen = (val: boolean): void => {
    if (val && this.state.yDialogOpen === false) {
      this.setState({ yDialogOpen: true });
      return;
    }
    this.setState({ yDialogOpen: false });
  };

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.xAxis = value;
    this.setState({ chartProps: newProps, xDialogOpen: false });
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.yAxis = value;
    this.setState({ chartProps: newProps, yDialogOpen: false });
  };

  private onColorSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.colorAxis = value;
    this.setState({ chartProps: newProps, colorDialogOpen: false });
  };

  private generateDefaultChartAxes(): IGenericChartProps | undefined {
    if (!this.context.jointDataset.hasDataset) {
      return;
    }
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Histogram,
      colorAxis: {
        options: {},
        property: this.context.jointDataset.hasPredictedY
          ? JointDataset.PredictedYLabel
          : JointDataset.IndexLabel
      },
      xAxis: {
        options: {},
        property: JointDataset.IndexLabel
      },
      yAxis: this.generateDefaultYAxis()
    };
    return chartProps;
  }

  private generateDefaultYAxis(): ISelectorConfig {
    const yKey = JointDataset.DataLabelRoot + "0";
    const yIsDithered = this.context.jointDataset.metaDict[yKey]
      .treatAsCategorical;
    return {
      options: {
        bin: false,
        dither: yIsDithered
      },
      property: yKey
    };
  }
}
