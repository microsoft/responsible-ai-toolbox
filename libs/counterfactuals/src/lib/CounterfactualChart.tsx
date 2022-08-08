// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, DefaultButton, Stack } from "@fluentui/react";
import {
  AxisConfigDialog,
  ColumnCategories,
  WeightVectorOption,
  JointDataset,
  Cohort,
  ModelExplanationUtils,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles,
  rowErrorSize,
  ICounterfactualData,
  BasicHighChart,
  ErrorDialog,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { WhatIfConstants, IGlobalSeries } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { generateDefaultChartAxes } from "../util/generateDefaultChartAxes";
import { generatePlotlyProps } from "../util/generatePlotlyProps";
import { getCurrentLabel } from "../util/getCurrentLabel";
import { getSelectedFeatureImportance } from "../util/getSelectedFeatureImportance";

import { counterfactualChartStyles } from "./CounterfactualChart.styles";
import { CounterfactualChartLegend } from "./CounterfactualChartLegend";
import { CounterfactualPanel } from "./CounterfactualPanel";
import { getCounterfactualChartOptions } from "./getCounterfactualChartOptions";
import { LocalImportanceChart } from "./LocalImportanceChart";
export interface ICounterfactualChartProps {
  data: ICounterfactualData;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  onWeightChange: (option: WeightVectorOption) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ICounterfactualChartState {
  chartProps?: IGenericChartProps;
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  isPanelOpen: boolean;
  customPoints: Array<{ [key: string]: any }>;
  request?: AbortController;
  selectedPointsIndexes: number[];
  pointIsActive: boolean[];
  customPointIsActive: boolean[];
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  originalData?: { [key: string]: string | number };
  errorMessage?: string;
}

export class CounterfactualChart extends React.PureComponent<
  ICounterfactualChartProps,
  ICounterfactualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "IndividualFeatureImportanceChart";

  private selectedFeatureImportance: IGlobalSeries[] = [];
  private validationErrors: { [key: string]: string | undefined } = {};
  private temporaryPoint: { [key: string]: any } | undefined;

  public constructor(props: ICounterfactualChartProps) {
    super(props);

    this.state = {
      customPointIsActive: [],
      customPoints: [],
      isPanelOpen: false,
      originalData: undefined,
      pointIsActive: [],
      request: undefined,
      selectedPointsIndexes: [],
      sortArray: [],
      sortingSeriesIndex: undefined,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount(): void {
    this.createCopyOfFirstRow();
    this.buildRowOptions(0);

    this.fetchData = _.debounce(this.fetchData, 400);

    this.setState({
      chartProps: generateDefaultChartAxes(this.context.jointDataset)
    });
  }

  public componentDidUpdate(
    prevProps: ICounterfactualChartProps,
    prevState: ICounterfactualChartState
  ): void {
    if (!this.state) {
      return;
    }
    let sortingSeriesIndex = this.state.sortingSeriesIndex;
    let sortArray = this.state.sortArray;
    const selectionsAreEqual = _.isEqual(
      this.state.selectedPointsIndexes,
      prevState.selectedPointsIndexes
    );
    const weightVectorsAreEqual =
      this.props.selectedWeightVector === prevProps.selectedWeightVector;
    if (!selectionsAreEqual || !weightVectorsAreEqual) {
      this.selectedFeatureImportance = getSelectedFeatureImportance(
        this.state.selectedPointsIndexes,
        this.context.jointDataset
      );
      if (
        this.state.sortingSeriesIndex === undefined ||
        !this.state.selectedPointsIndexes.includes(
          this.state.sortingSeriesIndex
        )
      ) {
        if (this.state.selectedPointsIndexes.length !== 0) {
          sortingSeriesIndex = 0;
          sortArray = ModelExplanationUtils.getSortIndices(
            this.selectedFeatureImportance[0].unsortedAggregateY
          ).reverse();
        } else {
          sortingSeriesIndex = undefined;
        }
      } else if (!weightVectorsAreEqual) {
        sortArray = ModelExplanationUtils.getSortIndices(
          this.selectedFeatureImportance[0].unsortedAggregateY
        ).reverse();
      }
    }
    this.setState({ sortArray, sortingSeriesIndex });
  }

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    if (!this.context.jointDataset.hasDataset) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.WhatIfTab.missingParameters}
        </MissingParametersPlaceholder>
      );
    }
    if (this.state.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = generatePlotlyProps(
      this.context.jointDataset,
      this.state.chartProps,
      this.context.selectedErrorCohort.cohort,
      this.state.selectedPointsIndexes,
      this.state.customPoints
    );
    const cohortLength =
      this.context.selectedErrorCohort.cohort.filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      this.state.chartProps.chartType !== ChartTypes.Scatter;
    if (!canRenderChart) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ValidationErrors.datasizeError}
        </MissingParametersPlaceholder>
      );
    }

    return (
      <Stack horizontal={false}>
        <Stack.Item>
          <Stack horizontal id={"IndividualFeatureContainer"}>
            <Stack.Item className={classNames.chartWithAxes}>
              {this.state.originalData && (
                <CounterfactualPanel
                  originalData={this.state.originalData}
                  selectedIndex={this.state.selectedPointsIndexes[0] || 0}
                  closePanel={this.togglePanel}
                  saveAsPoint={this.saveAsPoint}
                  setCustomRowProperty={this.setCustomRowProperty}
                  setCustomRowPropertyComboBox={
                    this.setCustomRowPropertyComboBox
                  }
                  temporaryPoint={this.temporaryPoint}
                  isPanelOpen={this.state.isPanelOpen}
                  data={this.context.counterfactualData}
                  telemetryHook={this.props.telemetryHook}
                />
              )}
              {this.state.yDialogOpen && (
                <AxisConfigDialog
                  jointDataset={this.context.jointDataset}
                  orderedGroupTitles={[
                    ColumnCategories.Index,
                    ColumnCategories.Dataset,
                    ColumnCategories.Outcome
                  ]}
                  selectedColumn={this.state.chartProps.yAxis}
                  canBin={false}
                  mustBin={false}
                  canDither={
                    this.state.chartProps.chartType === ChartTypes.Scatter
                  }
                  onAccept={this.onYSet}
                  onCancel={this.setYClose}
                  telemetryHook={this.props.telemetryHook}
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
                  onCancel={this.setXClose}
                  telemetryHook={this.props.telemetryHook}
                />
              )}
              <Stack horizontal={false}>
                <Stack.Item className={classNames.chartWithVertical}>
                  <Stack horizontal id={this.chartAndConfigsId}>
                    <Stack.Item className={classNames.verticalAxis}>
                      <div className={classNames.rotatedVerticalBox}>
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
                    </Stack.Item>
                    <Stack.Item className={classNames.mainChartContainer}>
                      <BasicHighChart
                        configOverride={getCounterfactualChartOptions(
                          plotlyProps,
                          this.selectPointFromChart
                        )}
                        theme={getTheme()}
                        id="CounterfactualChart"
                      />
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
                <Stack className={classNames.horizontalAxisWithPadding}>
                  <div className={classNames.horizontalAxis}>
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
                </Stack>
              </Stack>
            </Stack.Item>
            <CounterfactualChartLegend
              {...this.props}
              customPointIsActive={this.state.customPointIsActive}
              customPoints={this.state.customPoints}
              selectedPointsIndexes={this.state.selectedPointsIndexes}
              removeCustomPoint={this.removeCustomPoint}
              setTemporaryPointToCopyOfDatasetPoint={
                this.setTemporaryPointToCopyOfDatasetPoint
              }
              toggleCustomActivation={this.toggleCustomActivation}
              togglePanel={this.togglePanel}
              toggleSelectionOfPoint={this.toggleSelectionOfPoint}
            />
          </Stack>
        </Stack.Item>
        <Stack.Item className={classNames.lowerChartContainer}>
          <LocalImportanceChart
            rowNumber={this.state.selectedPointsIndexes[0]}
            currentClass={getCurrentLabel(
              this.context.dataset.task_type,
              this.props.data.desired_range,
              this.props.data.desired_class
            )}
            data={this.props.data}
          />
        </Stack.Item>
        <Stack.Item>
          {this.state.errorMessage && this.renderErrorDialog()}
        </Stack.Item>
      </Stack>
    );
  }

  private readonly renderErrorDialog = (): React.ReactNode => {
    return (
      <ErrorDialog
        title={localization.Counterfactuals.ErrorDialog.PythonError}
        subText={localization.formatString(
          localization.Counterfactuals.ErrorDialog.ErrorPrefix,
          this.state.errorMessage
        )}
        cancelButtonText={localization.Counterfactuals.ErrorDialog.Close}
        onClose={this.onClose}
      />
    );
  };

  private readonly onClose = (): void => {
    this.setState({ errorMessage: undefined });
  };

  private getDefaultSelectedPointIndexes(cohort: Cohort): number[] {
    const indexes = cohort.unwrap(JointDataset.IndexLabel);
    if (indexes.length > 0) {
      return [indexes[0]];
    }
    return [];
  }

  private buildRowOptions(cohortIndex: number): void {
    this.context.errorCohorts[cohortIndex].cohort.sort(JointDataset.IndexLabel);
  }

  private setTemporaryPointToCopyOfDatasetPoint = (index: number): void => {
    this.temporaryPoint = this.context.jointDataset.getRow(index);
    this.temporaryPoint[WhatIfConstants.namePath] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      index
    );
    this.temporaryPoint[WhatIfConstants.colorPath] =
      FluentUIStyles.fluentUIColorPalette[
        WhatIfConstants.MAX_SELECTION + this.state.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.validationErrors[key] = undefined;
    });
  };

  private createCopyOfFirstRow(): void {
    const indexes = this.getDefaultSelectedPointIndexes(
      this.context.selectedErrorCohort.cohort
    );
    if (indexes.length === 0) {
      return undefined;
    }
    this.temporaryPoint = this.context.jointDataset.getRow(indexes[0]);
    this.temporaryPoint[WhatIfConstants.namePath] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      indexes[0]
    );
    this.temporaryPoint[WhatIfConstants.colorPath] =
      FluentUIStyles.fluentUIColorPalette[
        WhatIfConstants.MAX_SELECTION + this.state.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.validationErrors[key] = undefined;
    });
  }

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

  private selectPointFromChart = (data: any): void => {
    const index = data.customdata[JointDataset.IndexLabel];
    this.setTemporaryPointToCopyOfDatasetPoint(index);
    this.toggleSelectionOfPoint(index);
    this.logTelemetryEvent(
      TelemetryEventName.CounterfactualNewDatapointSelectedFromChart
    );
  };

  private getOriginalData(
    index: number
  ): { [key: string]: string | number } | undefined {
    const row = this.context.jointDataset.getRow(index);
    const dataPoint = JointDataset.datasetSlice(
      row,
      this.context.jointDataset.metaDict,
      this.context.jointDataset.datasetFeatureCount
    );
    const data = {
      row: localization.formatString(
        localization.Counterfactuals.referenceDatapoint,
        index
      )
    };
    const featureNames = this.context.dataset.feature_names;
    featureNames.forEach((f, index) => {
      data[f] = dataPoint[index];
    });
    const targetLabel = this.context.dataset.target_column || "y";
    data[targetLabel] = row[JointDataset.TrueYLabel];
    return data;
  }

  private toggleSelectionOfPoint = (index?: number): void => {
    if (index === undefined) {
      return;
    }
    const indexOf = this.state.selectedPointsIndexes.indexOf(index);
    let newSelections = [...this.state.selectedPointsIndexes];
    let pointIsActive = [...this.state.pointIsActive];
    let originalData;
    if (indexOf === -1) {
      newSelections = [index];
      pointIsActive = [true];
      originalData = this.getOriginalData(index);
    } else {
      newSelections.splice(indexOf, 1);
      pointIsActive.splice(indexOf, 1);
    }
    this.setState({
      originalData,
      pointIsActive,
      selectedPointsIndexes: newSelections
    });
  };

  // fetch prediction for temporary point
  private fetchData = (fetchingReference: { [key: string]: any }): void => {
    if (!this.props.invokeModel) {
      return;
    }
    if (this.state.request !== undefined) {
      this.state.request.abort();
    }
    const abortController = new AbortController();
    const rawData = JointDataset.datasetSlice(
      fetchingReference,
      this.context.jointDataset.metaDict,
      this.context.jointDataset.datasetFeatureCount
    );
    fetchingReference[JointDataset.PredictedYLabel] = undefined;
    const promise = this.props.invokeModel([rawData], abortController.signal);

    this.setState(
      { errorMessage: undefined, request: abortController },
      async () => {
        try {
          const fetchedData = await promise;
          // returns predicted probabilities
          if (Array.isArray(fetchedData[0])) {
            const predictionVector = fetchedData[0];
            let predictedClass = 0;
            let maxProb = Number.MIN_SAFE_INTEGER;
            for (const [i, element] of predictionVector.entries()) {
              fetchingReference[JointDataset.ProbabilityYRoot + i.toString()] =
                element;
              if (element > maxProb) {
                predictedClass = i;
                maxProb = element;
              }
            }
            fetchingReference[JointDataset.PredictedYLabel] = predictedClass;
          } else {
            // prediction is a scalar, no probabilities
            fetchingReference[JointDataset.PredictedYLabel] = fetchedData[0];
          }
          if (this.context.jointDataset.hasTrueY) {
            JointDataset.setErrorMetrics(
              fetchingReference,
              this.context.modelMetadata.modelType
            );
          }
          this.setState({ request: undefined });
        } catch (error) {
          if (error.name === "AbortError") {
            return;
          }
          if (error.name === "PythonError") {
            this.setState({ errorMessage: error.message });
          }
        }
      }
    );
  };

  private toggleCustomActivation = (index: number): void => {
    const customPointIsActive = [...this.state.customPointIsActive];
    customPointIsActive[index] = !customPointIsActive[index];
    this.setState({ customPointIsActive });
  };

  private removeCustomPoint = (index: number): void => {
    this.setState((prevState) => {
      const customPoints = [...prevState.customPoints];
      customPoints.splice(index, 1);
      const customPointIsActive = [...prevState.customPointIsActive];
      customPointIsActive.splice(index, 1);
      return { customPointIsActive, customPoints };
    });
  };

  private saveAsPoint = (): void => {
    const customPoints = [...this.state.customPoints];
    const customPointIsActive = [...this.state.customPointIsActive];
    if (this.temporaryPoint) {
      customPoints.push(this.temporaryPoint);
    }
    customPointIsActive.push(true);
    this.temporaryPoint = _.cloneDeep(this.temporaryPoint);
    this.setState({
      customPointIsActive,
      customPoints
    });
  };

  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    newValue?: string | number
  ): void => {
    if (!this.temporaryPoint || (!newValue && newValue !== 0)) {
      return;
    }
    const editingData = this.temporaryPoint;
    if (isString) {
      editingData[key] = newValue;
      this.forceUpdate();
    } else {
      const asNumber = +newValue;
      // because " " evaluates to 0 in js
      const isWhitespaceOnly = /^\s*$/.test(newValue?.toString());
      if (Number.isNaN(asNumber) || isWhitespaceOnly) {
        this.validationErrors[key] =
          localization.Interpret.WhatIfTab.nonNumericValue;
        this.forceUpdate();
      } else {
        editingData[key] = asNumber;
        this.validationErrors[key] = undefined;
        this.forceUpdate();
        this.fetchData(editingData);
      }
    }
  };

  private setCustomRowPropertyComboBox = (
    key: string | number,
    index?: number,
    value?: string
  ): void => {
    if (!this.temporaryPoint || (!value && !index)) {
      return;
    }
    const editingData = this.temporaryPoint;
    if (index !== undefined) {
      // User selected/de-selected an existing option
      editingData[key] = index;
    }

    this.forceUpdate();
    this.fetchData(editingData);
  };

  private togglePanel = (): void => {
    if (!this.state.isPanelOpen) {
      this.logTelemetryEvent(
        TelemetryEventName.CounterfactualCreateWhatIfCounterfactualClick
      );
    }
    this.setState((preState) => {
      return { isPanelOpen: !preState.isPanelOpen };
    });
  };

  private logTelemetryEvent = (eventName: TelemetryEventName) => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };
}
