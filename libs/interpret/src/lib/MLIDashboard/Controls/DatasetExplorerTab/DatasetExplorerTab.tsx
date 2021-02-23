// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ExpandableText,
  JointDataset,
  ColumnCategories,
  cohortKey,
  Cohort,
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  IDropdownOption,
  Dropdown,
  DefaultButton,
  Text,
  IChoiceGroupOption
} from "office-ui-fabric-react";
import React from "react";

import { ChartTypes } from "../../ChartTypes";
import { IGenericChartProps } from "../../IGenericChartProps";
import { ISelectorConfig } from "../../NewExplanationDashboard";
import { newExplanationDashboardRowErrorSize } from "../../newExplanationDashboardRowErrorSize";
import { AxisConfigDialog } from "../AxisConfigurationDialog/AxisConfigDialog";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";
import { generatePlotlyProps } from "./generatePlotlyProps";
import { SidePanel } from "./SidePanel";

export interface IDatasetExplorerTabProps {
  theme?: string;
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohorts: Cohort[];
  initialCohortIndex?: number;
}

export interface IDatasetExplorerTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  colorDialogOpen: boolean;
  selectedCohortIndex: number;
  calloutVisible: boolean;
  chartProps?: IGenericChartProps;
}

export class DatasetExplorerTab extends React.PureComponent<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  private readonly chartAndConfigsId = "DatasetExplorerChart";

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);
    let initialCohortIndex = 0;
    if (this.props.initialCohortIndex !== undefined) {
      initialCohortIndex = this.props.initialCohortIndex;
    }
    this.state = {
      calloutVisible: false,
      chartProps: this.generateDefaultChartAxes(),
      colorDialogOpen: false,
      selectedCohortIndex: initialCohortIndex,
      xDialogOpen: false,
      yDialogOpen: false
    };
    if (!this.props.jointDataset.hasDataset) {
      return;
    }
  }
  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();

    if (!this.props.jointDataset.hasDataset) {
      return (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.Interpret.DatasetExplorer.missingParameters}
            </Text>
          </div>
        </div>
      );
    }
    if (this.state.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = generatePlotlyProps(
      this.props.jointDataset,
      this.state.chartProps,
      this.props.cohorts[this.state.selectedCohortIndex]
    );
    const cohortOptions =
      this.state.chartProps.xAxis.property !== cohortKey
        ? this.props.cohorts.map((cohort, index) => {
            return { key: index, text: cohort.name };
          })
        : undefined;
    const cohortLength = this.props.cohorts[this.state.selectedCohortIndex]
      .filteredData.length;
    const canRenderChart =
      cohortLength < newExplanationDashboardRowErrorSize ||
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
        <div className={classNames.cohortPickerWrapper}>
          <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
            {localization.Interpret.ModelPerformance.cohortPickerLabel}
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
                jointDataset={this.props.jointDataset}
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
                jointDataset={this.props.jointDataset}
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
                      {localization.Interpret.ValidationErrors.datasizeError}
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
          <SidePanel
            chartProps={this.state.chartProps}
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
    if (!this.props.jointDataset.hasDataset) {
      return;
    }
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
    return chartProps;
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
