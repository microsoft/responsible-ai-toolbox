// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  WeightVectorOption,
  JointDataset,
  ModelExplanationUtils,
  ChartTypes,
  IGenericChartProps,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles,
  rowErrorSize,
  ICounterfactualData,
  ITelemetryEvent
} from "@responsible-ai/core-ui";
import { WhatIfConstants, IGlobalSeries } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { generateDefaultChartAxes } from "../util/generateDefaultChartAxes";
import { getDefaultSelectedPointIndexes } from "../util/getDefaultSelectedPointIndexes";
import { getSelectedFeatureImportance } from "../util/getSelectedFeatureImportance";

import { CounterfactualChartWithLegend } from "./CounterfactualChartWithLegend";
import { CounterfactualErrorDialog } from "./CounterfactualErrorDialog";
import { CounterfactualLocalImportanceChart } from "./CounterfactualLocalImportanceChart";
export interface ICounterfactualComponentProps {
  data: ICounterfactualData;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  onWeightChange: (option: WeightVectorOption) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ICounterfactualComponentState {
  chartProps?: IGenericChartProps;
  customPointLength: number;
  request?: AbortController;
  selectedPointsIndexes: number[];
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  errorMessage?: string;
}

export class CounterfactualComponent extends React.PureComponent<
  ICounterfactualComponentProps,
  ICounterfactualComponentState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private selectedFeatureImportance: IGlobalSeries[] = [];
  private validationErrors: { [key: string]: string | undefined } = {};
  private temporaryPoint: { [key: string]: any } | undefined;

  public constructor(props: ICounterfactualComponentProps) {
    super(props);

    this.state = {
      customPointLength: 0,
      request: undefined,
      selectedPointsIndexes: [],
      sortArray: [],
      sortingSeriesIndex: undefined
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
    prevProps: ICounterfactualComponentProps,
    prevState: ICounterfactualComponentState
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
        <CounterfactualChartWithLegend
          {...this.props}
          chartProps={this.state.chartProps}
          selectedPointsIndexes={this.state.selectedPointsIndexes}
          temporaryPoint={this.temporaryPoint}
          onChartPropsUpdated={this.onChartPropsUpdated}
          onCustomPointLengthUpdated={this.onCustomPointLengthUpdated}
          onSelectedPointsIndexesUpdated={this.onSelectedPointsIndexesUpdated}
          setCustomRowProperty={this.setCustomRowProperty}
          setCustomRowPropertyComboBox={this.setCustomRowPropertyComboBox}
          setTemporaryPointToCopyOfDatasetPoint={
            this.setTemporaryPointToCopyOfDatasetPoint
          }
        />
        <CounterfactualLocalImportanceChart
          data={this.props.data}
          selectedPointsIndexes={this.state.selectedPointsIndexes}
        />
        {this.state.errorMessage && (
          <CounterfactualErrorDialog
            errorMessage={this.state.errorMessage}
            onClose={this.onClose}
          />
        )}
      </Stack>
    );
  }

  private readonly onClose = (): void => {
    this.setState({ errorMessage: undefined });
  };

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
        WhatIfConstants.MAX_SELECTION + this.state.customPointLength
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.validationErrors[key] = undefined;
    });
  };

  private createCopyOfFirstRow(): void {
    const indexes = getDefaultSelectedPointIndexes(
      this.context.selectedErrorCohort.cohort
    );
    if (indexes.length === 0) {
      return undefined;
    }
    this.setTemporaryPointToCopyOfDatasetPoint(indexes[0]);
  }

  private onChartPropsUpdated = (newProps: IGenericChartProps): void => {
    this.setState({ chartProps: newProps });
  };

  private onSelectedPointsIndexesUpdated = (newSelection: number[]) => {
    this.setState({ selectedPointsIndexes: newSelection });
  };

  private onCustomPointLengthUpdated = (customPointLength: number) => {
    this.setState({ customPointLength });
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
}
