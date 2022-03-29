// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  AxisConfigDialog,
  JointDataset,
  ColumnCategories,
  cohortKey,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  rowErrorSize,
  BasicHighChart
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  getTheme,
  IDropdownOption,
  Dropdown,
  DefaultButton,
  Text,
  IChoiceGroupOption,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { datasetExplorerTabStyles } from "./DatasetExplorerTab.styles";
import { generatePlotlyProps } from "./generatePlotlyProps";
import { getDatasetOption } from "./getDatasetOption";
import { SidePanel } from "./SidePanel";

export class IDatasetExplorerTabProps {}

export interface IDatasetExplorerTabState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  colorDialogOpen: boolean;
  selectedCohortIndex: number;
  chartProps?: IGenericChartProps;
}

export class DatasetExplorerTab extends React.Component<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "DatasetExplorerChart";

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);

    this.state = {
      colorDialogOpen: false,
      selectedCohortIndex: 0,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount(): void {
    const initialCohortIndex = 0;

    this.setState({
      chartProps: this.generateDefaultChartAxes(),
      selectedCohortIndex: initialCohortIndex
    });
  }

  public componentDidUpdate(
    _preProp: IDatasetExplorerTabProps,
    preState: IDatasetExplorerTabState
  ): void {
    if (preState.selectedCohortIndex >= this.context.errorCohorts.length) {
      this.setState({ selectedCohortIndex: 0 });
    }
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

    const selectedCohortIndex =
      this.state.selectedCohortIndex >= this.context.errorCohorts.length
        ? 0
        : this.state.selectedCohortIndex;

    const plotlyProps = generatePlotlyProps(
      this.context.jointDataset,
      this.state.chartProps,
      this.context.errorCohorts.map((errorCohort) => errorCohort.cohort)[
        selectedCohortIndex
      ]
    );
    const cohortOptions =
      this.state.chartProps.xAxis.property !== cohortKey
        ? this.context.errorCohorts.map((errorCohort, index) => {
            return { key: index, text: errorCohort.cohort.name };
          })
        : undefined;
    const cohortLength =
      this.context.errorCohorts[selectedCohortIndex].cohort.filteredData.length;
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
      <Stack
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1" }}
        className={classNames.page}
        id={this.chartAndConfigsId}
      >
        <Stack.Item className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.Interpret.DatasetExplorer.helperText}
          </Text>
        </Stack.Item>
        <Stack.Item className={classNames.cohortPickerWrapper}>
          <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
            {localization.Interpret.ModelPerformance.cohortPickerLabel}
          </Text>
          {cohortOptions && (
            <Dropdown
              className={classNames.cohortDropdown}
              id="dataExplorerCohortDropdown"
              options={cohortOptions}
              selectedKey={this.state.selectedCohortIndex}
              onChange={this.setSelectedCohort}
            />
          )}
        </Stack.Item>
        <Stack.Item>
          {this.state.yDialogOpen && (
            <AxisConfigDialog
              jointDataset={this.context.jointDataset}
              orderedGroupTitles={yAxisCategories}
              selectedColumn={this.state.chartProps.yAxis}
              canBin={false}
              mustBin={false}
              canDither={this.state.chartProps.chartType === ChartTypes.Scatter}
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
              canDither={this.state.chartProps.chartType === ChartTypes.Scatter}
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
              canBin
              mustBin={false}
              canDither={false}
              onAccept={this.onColorSet}
              onCancel={this.setColorClose}
            />
          )}
        </Stack.Item>
        <Stack.Item className={classNames.mainArea}>
          <Stack horizontal grow>
            <Stack.Item className={classNames.chartWithAxes}>
              <Stack horizontal className={classNames.chartWithVertical}>
                <Stack.Item className={classNames.verticalAxis}>
                  <div className={classNames.rotatedVerticalBox}>
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
                </Stack.Item>
                <Stack.Item className={classNames.chartContainer}>
                  {canRenderChart ? (
                    <BasicHighChart
                      configOverride={getDatasetOption(
                        plotlyProps,
                        this.context.jointDataset,
                        this.state.chartProps
                      )}
                      theme={getTheme()}
                    />
                  ) : (
                    <MissingParametersPlaceholder>
                      {localization.Interpret.ValidationErrors.datasizeError}
                    </MissingParametersPlaceholder>
                  )}
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack.Item className={classNames.sidePanel}>
              <SidePanel
                chartProps={this.state.chartProps}
                cohorts={this.context.errorCohorts.map(
                  (errorCohort) => errorCohort.cohort
                )}
                jointDataset={this.context.jointDataset}
                selectedCohortIndex={this.state.selectedCohortIndex}
                setColorOpen={this.setColorOpen}
                onChartTypeChange={this.onChartTypeChange}
              />
            </Stack.Item>
          </Stack>
          <div className={classNames.horizontalAxisWithPadding}>
            <div className={classNames.paddingDiv} />
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
        </Stack.Item>
      </Stack>
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
    const yKey = `${JointDataset.DataLabelRoot}0`;
    const yIsDithered =
      this.context.jointDataset.metaDict[yKey].treatAsCategorical;
    return {
      options: {
        bin: false,
        dither: yIsDithered
      },
      property: yKey
    };
  }
}
