// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  IDropdownOption,
  Dropdown,
  DefaultButton,
  Icon,
  Text,
  IChoiceGroupOption
} from "office-ui-fabric-react";
import React from "react";

import { localization } from "../../../Localization/localization";
import { ChartTypes } from "../../ChartTypes";
import { Cohort } from "../../Cohort";
import { cohortKey } from "../../cohortKey";
import { FabricStyles } from "../../FabricStyles";
import { IExplanationModelMetadata } from "../../IExplanationContext";
import { IGenericChartProps } from "../../IGenericChartProps";
import { JointDataset, ColumnCategories } from "../../JointDataset";
import { ISelectorConfig } from "../../NewExplanationDashboard";
import { newExplanationDashboardRowErrorSize } from "../../newExplanationDashboardRowErrorSize";
import { AxisConfigDialog } from "../AxisConfigurationDialog/AxisConfigDialog";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";
import { generatePlotlyProps } from "./generatePlotlyProps";
import { SidePanel } from "./SidePanel";

export interface IDatasetExplorerTabProps {
  chartProps?: IGenericChartProps;
  theme?: string;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohorts: Cohort[];
  onChange: (props: IGenericChartProps) => void;
}

export interface IDatasetExplorerTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  colorDialogOpen: boolean;
  selectedCohortIndex: number;
  calloutVisible: boolean;
}

export class DatasetExplorerTab extends React.PureComponent<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  public static basePlotlyProperties: IPlotlyProperty = {
    config: { displaylogo: false, displayModeBar: false, responsive: true },
    data: [{}],
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        b: 20,
        l: 20,
        r: 0,
        t: 0
      },
      showlegend: false,
      xaxis: {
        color: FabricStyles.chartAxisColor,
        mirror: true,
        tickfont: {
          family: FabricStyles.fontFamilies,
          size: 11
        },
        zeroline: true
      },
      yaxis: {
        automargin: true,
        color: FabricStyles.chartAxisColor,
        gridcolor: "#e5e5e5",
        showgrid: true,
        tickfont: {
          family: "Roboto, Helvetica Neue, sans-serif",
          size: 11
        },
        zeroline: true
      }
    } as any
  };

  private readonly chartAndConfigsId = "DatasetExplorerChart";

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);
    this.state = {
      calloutVisible: false,
      colorDialogOpen: false,
      selectedCohortIndex: 0,
      xDialogOpen: false,
      yDialogOpen: false
    };
    if (!this.props.jointDataset.hasDataset) {
      return;
    }
    if (props.chartProps === undefined) {
      this.generateDefaultChartAxes();
    }
  }
  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();

    if (!this.props.jointDataset.hasDataset) {
      return (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.DatasetExplorer.missingParameters}
            </Text>
          </div>
        </div>
      );
    }
    if (this.props.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = generatePlotlyProps(
      this.props.jointDataset,
      this.props.chartProps,
      this.props.cohorts[this.state.selectedCohortIndex]
    );
    const cohortOptions =
      this.props.chartProps.xAxis.property !== cohortKey
        ? this.props.cohorts.map((cohort, index) => {
            return { key: index, text: cohort.name };
          })
        : undefined;
    const cohortLength = this.props.cohorts[this.state.selectedCohortIndex]
      .filteredData.length;
    const canRenderChart =
      cohortLength < newExplanationDashboardRowErrorSize ||
      this.props.chartProps.chartType !== ChartTypes.Scatter;
    const yAxisCategories = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    if (this.props.chartProps.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.None);
    }
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Icon iconName="Info" className={classNames.infoIcon} />
          <Text variant="medium" className={classNames.helperText}>
            {localization.DatasetExplorer.helperText}
          </Text>
        </div>
        <div className={classNames.cohortPickerWrapper}>
          <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
            {localization.ModelPerformance.cohortPickerLabel}
          </Text>
          {cohortOptions && (
            <Dropdown
              styles={{ dropdown: { width: 150 } }}
              options={cohortOptions}
              selectedKey={this.state.selectedCohortIndex}
              onChange={this.setSelectedCohort}
            />
          )}
        </div>
        <div className={classNames.mainArea} id={this.chartAndConfigsId}>
          <div className={classNames.chartWithAxes}>
            {this.state.yDialogOpen && (
              <AxisConfigDialog
                jointDataset={this.props.jointDataset}
                orderedGroupTitles={yAxisCategories}
                selectedColumn={this.props.chartProps.yAxis}
                canBin={false}
                mustBin={false}
                canDither={
                  this.props.chartProps.chartType === ChartTypes.Scatter
                }
                onAccept={this.onYSet}
                onCancel={this.setYOpen.bind(this, false)}
              />
            )}
            {this.state.xDialogOpen && (
              <AxisConfigDialog
                jointDataset={this.props.jointDataset}
                orderedGroupTitles={[
                  ColumnCategories.Index,
                  ColumnCategories.Dataset,
                  ColumnCategories.Outcome
                ]}
                selectedColumn={this.props.chartProps.xAxis}
                canBin={
                  this.props.chartProps.chartType === ChartTypes.Histogram ||
                  this.props.chartProps.chartType === ChartTypes.Box
                }
                mustBin={
                  this.props.chartProps.chartType === ChartTypes.Histogram ||
                  this.props.chartProps.chartType === ChartTypes.Box
                }
                canDither={
                  this.props.chartProps.chartType === ChartTypes.Scatter
                }
                onAccept={this.onXSet}
                onCancel={this.setXOpen.bind(this, false)}
              />
            )}
            {this.state.colorDialogOpen && this.props.chartProps.colorAxis && (
              <AxisConfigDialog
                jointDataset={this.props.jointDataset}
                orderedGroupTitles={[
                  ColumnCategories.Index,
                  ColumnCategories.Dataset,
                  ColumnCategories.Outcome
                ]}
                selectedColumn={this.props.chartProps.colorAxis}
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
                        this.props.jointDataset.metaDict[
                          this.props.chartProps.yAxis.property
                        ].abbridgedLabel
                      }
                      title={
                        this.props.jointDataset.metaDict[
                          this.props.chartProps.yAxis.property
                        ].label
                      }
                    />
                  </div>
                </div>
              </div>
              {canRenderChart ? (
                <AccessibleChart plotlyProps={plotlyProps} theme={getTheme()} />
              ) : (
                <div className={classNames.missingParametersPlaceholder}>
                  <div
                    className={classNames.missingParametersPlaceholderSpacer}
                  >
                    <Text
                      block
                      variant="large"
                      className={classNames.faintText}
                    >
                      {localization.ValidationErrors.datasizeError}
                    </Text>
                  </div>
                </div>
              )}
            </div>
            <div className={classNames.horizontalAxisWithPadding}>
              <div className={classNames.paddingDiv}></div>
              <div className={classNames.horizontalAxis}>
                <div>
                  <DefaultButton
                    onClick={this.setXOpen.bind(this, true)}
                    text={
                      this.props.jointDataset.metaDict[
                        this.props.chartProps.xAxis.property
                      ].abbridgedLabel
                    }
                    title={
                      this.props.jointDataset.metaDict[
                        this.props.chartProps.xAxis.property
                      ].label
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <SidePanel
            chartProps={this.props.chartProps}
            cohorts={this.props.cohorts}
            jointDataset={this.props.jointDataset}
            selectedCohortIndex={this.state.selectedCohortIndex}
            setColorOpen={this.setColorOpen}
            onChartTypeChange={this.onChartTypeChange}
          />
        </div>
      </div>
    );
  }

  private setSelectedCohort = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedCohortIndex: item.key as number });
    }
  };

  private onChartTypeChange = (
    _ev?: React.SyntheticEvent<HTMLElement>,
    item?: IChoiceGroupOption
  ): void => {
    const newProps = _.cloneDeep(this.props.chartProps);
    if (item?.key === undefined || !newProps) {
      return;
    }
    newProps.chartType = item.key as ChartTypes;
    if (newProps.yAxis.property === ColumnCategories.None) {
      newProps.yAxis = this.generateDefaultYAxis();
    }
    this.props.onChange(newProps);
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
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.xAxis = value;
    this.props.onChange(newProps);
    this.setState({ xDialogOpen: false });
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.yAxis = value;
    this.props.onChange(newProps);
    this.setState({ yDialogOpen: false });
  };

  private onColorSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.colorAxis = value;
    this.props.onChange(newProps);
    this.setState({ colorDialogOpen: false });
  };

  private generateDefaultChartAxes(): void {
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Histogram,
      colorAxis: {
        options: {},
        property: this.props.jointDataset.hasPredictedY
          ? JointDataset.PredictedYLabel
          : JointDataset.IndexLabel
      },
      xAxis: {
        options: {},
        property: JointDataset.IndexLabel
      },
      yAxis: this.generateDefaultYAxis()
    };
    this.props.onChange(chartProps);
  }

  private generateDefaultYAxis(): ISelectorConfig {
    const yKey = JointDataset.DataLabelRoot + "0";
    const yIsDithered = this.props.jointDataset.metaDict[yKey]
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
