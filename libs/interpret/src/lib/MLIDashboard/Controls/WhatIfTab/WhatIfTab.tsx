// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IDropdownOption,
  Dropdown,
  getTheme,
  Text,
  DefaultButton
} from "@fluentui/react";
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
  InteractiveLegend,
  rowErrorSize,
  getFeatureOptions,
  ErrorDialog
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IPlotlyProperty,
  PlotlyMode,
  IData
} from "@responsible-ai/mlchartlib";
import _, { Dictionary } from "lodash";
import React from "react";

import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";

import { LocalImportancePlots } from "./LocalImportancePlots";
import { WhatIfConstants } from "./WhatIfConstants";
import { WhatIfPanel } from "./WhatIfPanel";
import { whatIfTabStyles } from "./WhatIfTab.styles";

export interface IWhatIfTabProps {
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface IWhatIfTabState {
  chartProps?: IGenericChartProps;
  isPanelOpen: boolean;
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  selectedWhatIfRootIndex: number;
  editingDataCustomIndex?: number;
  showSelectionWarning: boolean;
  customPoints: Array<{ [key: string]: any }>;
  selectedCohortIndex: number;
  featuresOption: IDropdownOption[];
  filteredFeatureList: IDropdownOption[];
  request?: AbortController;
  selectedPointsIndexes: number[];
  pointIsActive: boolean[];
  customPointIsActive: boolean[];
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  errorMessage?: string;
}

export class WhatIfTab extends React.PureComponent<
  IWhatIfTabProps,
  IWhatIfTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "IndividualFeatureImportanceChart";

  private includedFeatureImportance: IGlobalSeries[] = [];
  private selectedFeatureImportance: IGlobalSeries[] = [];
  private validationErrors: { [key: string]: string | undefined } = {};
  private stringifiedValues: { [key: string]: string } = {};
  private selectedDatapoints: any[][] = [];
  private customDatapoints: any[][] = [];
  private testableDatapoints: any[][] = [];
  private temporaryPoint: { [key: string]: any } | undefined;
  private testableDatapointColors: string[] =
    FluentUIStyles.fluentUIColorPalette;
  private testableDatapointNames: string[] = [];
  private rowOptions: IDropdownOption[] | undefined;

  public constructor(props: IWhatIfTabProps) {
    super(props);

    this.state = {
      customPointIsActive: [],
      customPoints: [],
      editingDataCustomIndex: undefined,
      featuresOption: [],
      filteredFeatureList: [],
      isPanelOpen: this.props.invokeModel !== undefined,
      pointIsActive: [],
      request: undefined,
      selectedCohortIndex: 0,
      selectedPointsIndexes: [],
      selectedWhatIfRootIndex: 0,
      showSelectionWarning: false,
      sortArray: [],
      sortingSeriesIndex: undefined,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount(): void {
    if (!this.context.jointDataset.hasDataset) {
      return;
    }
    this.createCopyOfFirstRow();
    this.buildRowOptions(0);

    this.fetchData = _.debounce(this.fetchData, 400);

    const featuresOption = getFeatureOptions(this.context.jointDataset);

    this.setState({
      chartProps: this.generateDefaultChartAxes(),
      featuresOption,
      filteredFeatureList: featuresOption
    });
  }

  public componentDidUpdate(
    prevProps: IWhatIfTabProps,
    prevState: IWhatIfTabState
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
    const activePointsAreEqual = _.isEqual(
      this.state.pointIsActive,
      prevState.pointIsActive
    );
    const customPointsAreEqual =
      this.state.customPoints === prevState.customPoints;
    const customActivePointsAreEqual = _.isEqual(
      this.state.customPointIsActive,
      prevState.customPointIsActive
    );
    if (!selectionsAreEqual || !weightVectorsAreEqual) {
      this.selectedFeatureImportance = this.state.selectedPointsIndexes.map(
        (rowIndex, colorIndex) => {
          const row = this.context.jointDataset.getRow(rowIndex);
          return {
            colorIndex,
            id: rowIndex,
            name: localization.formatString(
              localization.Interpret.WhatIfTab.rowLabel,
              rowIndex.toString()
            ),
            unsortedAggregateY: JointDataset.localExplanationSlice(
              row,
              this.context.jointDataset.localExplanationFeatureCount
            ) as number[],
            unsortedFeatureValues: JointDataset.datasetSlice(
              row,
              this.context.jointDataset.metaDict,
              this.context.jointDataset.localExplanationFeatureCount
            )
          };
        }
      );
      this.selectedDatapoints = this.state.selectedPointsIndexes.map(
        (rowIndex) => {
          const row = this.context.jointDataset.getRow(rowIndex);
          return JointDataset.datasetSlice(
            row,
            this.context.jointDataset.metaDict,
            this.context.jointDataset.datasetFeatureCount
          );
        }
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
    if (!customPointsAreEqual) {
      this.customDatapoints = this.state.customPoints.map((row) => {
        return JointDataset.datasetSlice(
          row,
          this.context.jointDataset.metaDict,
          this.context.jointDataset.datasetFeatureCount
        );
      });
    }
    if (
      !selectionsAreEqual ||
      !activePointsAreEqual ||
      !customPointsAreEqual ||
      !customActivePointsAreEqual ||
      !weightVectorsAreEqual
    ) {
      this.includedFeatureImportance = this.selectedFeatureImportance.filter(
        (_f, i) => this.state.pointIsActive[i]
      );
      const includedColors = this.includedFeatureImportance.map(
        (item) => FluentUIStyles.fluentUIColorPalette[item.colorIndex]
      );
      const includedNames = this.includedFeatureImportance.map(
        (item) => item.name
      );
      const includedRows = this.selectedDatapoints.filter(
        (_f, i) => this.state.pointIsActive[i]
      );
      const includedCustomRows = this.customDatapoints.filter((_f, i) => {
        if (this.state.pointIsActive[i]) {
          includedColors.push(
            FluentUIStyles.fluentUIColorPalette[
              WhatIfConstants.MAX_SELECTION + i + 1
            ]
          );
          includedColors.push(
            FluentUIStyles.fluentUIColorPalette[
              WhatIfConstants.MAX_SELECTION + i + 1
            ]
          );
          includedNames.push(
            this.state.customPoints[i][WhatIfConstants.namePath]
          );
          return true;
        }
        return false;
      });
      this.testableDatapoints = [...includedRows, ...includedCustomRows];
      this.testableDatapointColors = includedColors;
      this.testableDatapointNames = includedNames;
      this.forceUpdate();
    }
    this.setState({ sortArray, sortingSeriesIndex });
  }

  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
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
    const plotlyProps = this.generatePlotlyProps(
      this.context.jointDataset,
      this.state.chartProps,
      this.context.errorCohorts[this.state.selectedCohortIndex].cohort
    );
    const cohortLength =
      this.context.errorCohorts[this.state.selectedCohortIndex].cohort
        .filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      this.state.chartProps.chartType !== ChartTypes.Scatter;
    const cohortOptions: IDropdownOption[] = this.context.errorCohorts.map(
      (errorCohort, index) => {
        return { key: index, text: errorCohort.cohort.name };
      }
    );
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.Interpret.WhatIfTab.helperText}
          </Text>
        </div>
        <div className={classNames.mainArea}>
          <WhatIfPanel
            dismissPanel={this.dismissPanel}
            filterFeatures={this.filterFeatures}
            filteredFeatureList={this.state.filteredFeatureList}
            isPanelOpen={this.state.isPanelOpen}
            isInPanel={false}
            jointDataset={this.context.jointDataset}
            metadata={this.context.modelMetadata}
            openPanel={this.openPanel}
            rowOptions={this.rowOptions}
            saveAsPoint={this.saveAsPoint}
            savePoint={this.savePoint}
            selectedWhatIfRootIndex={this.state.selectedWhatIfRootIndex}
            setCustomRowProperty={this.setCustomRowProperty}
            setCustomRowPropertyDropdown={this.setCustomRowPropertyDropdown}
            setSelectedIndex={this.setSelectedIndex}
            stringifiedValues={this.stringifiedValues}
            temporaryPoint={this.temporaryPoint}
            validationErrors={this.validationErrors}
            editingDataCustomIndex={this.state.editingDataCustomIndex}
            invokeModel={this.props.invokeModel}
          />
          <div className={classNames.chartsArea}>
            {cohortOptions && (
              <div className={classNames.cohortPickerWrapper}>
                <Text
                  variant="mediumPlus"
                  className={classNames.cohortPickerLabel}
                >
                  {localization.Interpret.WhatIfTab.cohortPickerLabel}
                </Text>
                <Dropdown
                  styles={{
                    callout: {
                      selectors: {
                        ".ms-Button-flexContainer": {
                          width: "100%"
                        }
                      }
                    },
                    dropdown: {
                      width: 150
                    }
                  }}
                  options={cohortOptions}
                  selectedKey={this.state.selectedCohortIndex}
                  onChange={this.setSelectedCohort}
                />
              </div>
            )}
            <div
              className={classNames.topArea}
              id={"IndividualFeatureContainer"}
            >
              <div
                className={classNames.chartWithAxes}
                id={this.chartAndConfigsId}
              >
                {this.state.yDialogOpen && (
                  <AxisConfigDialog
                    orderedGroupTitles={[
                      ColumnCategories.Index,
                      ColumnCategories.Dataset,
                      ColumnCategories.Outcome
                    ]}
                    selectedColumn={this.state.chartProps.yAxis}
                    canBin={false}
                    mustBin={false}
                    allowTreatAsCategorical
                    canDither={
                      this.state.chartProps.chartType === ChartTypes.Scatter
                    }
                    onAccept={this.onYSet}
                    onCancel={this.setYClose}
                  />
                )}
                {this.state.xDialogOpen && (
                  <AxisConfigDialog
                    orderedGroupTitles={[
                      ColumnCategories.Index,
                      ColumnCategories.Dataset,
                      ColumnCategories.Outcome
                    ]}
                    selectedColumn={this.state.chartProps.xAxis}
                    canBin={
                      this.state.chartProps.chartType ===
                        ChartTypes.Histogram ||
                      this.state.chartProps.chartType === ChartTypes.Box
                    }
                    mustBin={
                      this.state.chartProps.chartType ===
                        ChartTypes.Histogram ||
                      this.state.chartProps.chartType === ChartTypes.Box
                    }
                    canDither={
                      this.state.chartProps.chartType === ChartTypes.Scatter
                    }
                    allowTreatAsCategorical
                    onAccept={this.onXSet}
                    onCancel={this.setXClose}
                  />
                )}
                <div className={classNames.chartWithVertical}>
                  <div className={classNames.verticalAxis}>
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
                  </div>
                  {!canRenderChart && (
                    <MissingParametersPlaceholder>
                      {localization.Interpret.ValidationErrors.datasizeError}
                    </MissingParametersPlaceholder>
                  )}
                  {canRenderChart && (
                    <AccessibleChart
                      plotlyProps={plotlyProps}
                      theme={getTheme() as any}
                      onClickHandler={this.selectPointFromChart}
                    />
                  )}
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
              <div className={classNames.legendAndText}>
                <div className={classNames.legendHlepWrapper}>
                  <Text variant={"small"} className={classNames.legendHelpText}>
                    {localization.Interpret.WhatIfTab.scatterLegendText}
                  </Text>
                </div>
                <Text
                  variant={"small"}
                  block
                  className={classNames.legendLabel}
                >
                  {localization.Interpret.WhatIfTab.realPoint}
                </Text>
                {this.selectedFeatureImportance.length > 0 && (
                  <InteractiveLegend
                    items={this.selectedFeatureImportance.map(
                      (row, rowIndex) => {
                        return {
                          activated: this.state.pointIsActive[rowIndex],
                          color: FluentUIStyles.fluentUIColorPalette[rowIndex],
                          index: rowIndex,
                          name: row.name,
                          onClick: this.toggleActivation,
                          onDelete: this.toggleSelectionOfPoint
                        };
                      }
                    )}
                  />
                )}
                {this.state.showSelectionWarning && (
                  <Text variant={"xSmall"} className={classNames.errorText}>
                    {localization.Interpret.WhatIfTab.selectionLimit}
                  </Text>
                )}
                {this.selectedFeatureImportance.length === 0 && (
                  <Text variant={"xSmall"} className={classNames.smallItalic}>
                    {localization.Interpret.WhatIfTab.noneSelectedYet}
                  </Text>
                )}
                {this.props.invokeModel && (
                  <Text
                    variant={"small"}
                    block
                    className={classNames.legendLabel}
                  >
                    {localization.Interpret.WhatIfTab.whatIfDatapoints}
                  </Text>
                )}
                {this.state.customPoints.length > 0 && (
                  <InteractiveLegend
                    items={this.state.customPoints.map((row, rowIndex) => {
                      return {
                        activated: this.state.customPointIsActive[rowIndex],
                        color:
                          FluentUIStyles.fluentUIColorPalette[
                            rowIndex + WhatIfConstants.MAX_SELECTION + 1
                          ],
                        index: rowIndex,
                        name: row[WhatIfConstants.namePath],
                        onClick: this.toggleCustomActivation,
                        onDelete: this.removeCustomPoint,
                        onEdit: this.setTemporaryPointToCustomPoint
                      };
                    })}
                  />
                )}
                {this.state.customPoints.length === 0 && (
                  <Text variant={"xSmall"} className={classNames.smallItalic}>
                    {localization.Interpret.WhatIfTab.noneCreatedYet}
                  </Text>
                )}
              </div>
            </div>
            <LocalImportancePlots
              includedFeatureImportance={this.includedFeatureImportance}
              jointDataset={this.context.jointDataset}
              metadata={this.context.modelMetadata}
              selectedWeightVector={this.props.selectedWeightVector}
              weightOptions={this.props.weightOptions}
              weightLabels={this.props.weightLabels}
              invokeModel={this.props.invokeModel}
              onWeightChange={this.props.onWeightChange}
              testableDatapoints={this.testableDatapoints}
              testableDatapointNames={this.testableDatapointNames}
              testableDatapointColors={this.testableDatapointColors}
              featuresOption={this.state.featuresOption}
              sortArray={this.state.sortArray}
              sortingSeriesIndex={this.state.sortingSeriesIndex}
            />
          </div>
          {this.state.errorMessage && this.renderErrorDialog()}
        </div>
      </div>
    );
  }

  private readonly renderErrorDialog = (): React.ReactNode => {
    return (
      <ErrorDialog
        title={localization.Interpret.IcePlot.pythonError}
        subText={localization.formatString(
          localization.Interpret.IcePlot.errorPrefix,
          this.state.errorMessage
        )}
        cancelButtonText={localization.Interpret.IcePlot.close}
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

  private setSelectedCohort = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.buildRowOptions(item.key as number);
    this.setState({
      selectedCohortIndex: item.key as number,
      selectedPointsIndexes: [],
      showSelectionWarning: false
    });
  };

  private buildRowOptions(cohortIndex: number): void {
    this.context.errorCohorts[cohortIndex].cohort.sort(JointDataset.IndexLabel);
    this.rowOptions = this.context.errorCohorts[cohortIndex].cohort
      .unwrap(JointDataset.IndexLabel)
      .map((index) => {
        return {
          key: index,
          text: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            index.toString()
          )
        };
      })
      .reverse();
  }

  private setSelectedIndex = (
    _event: React.FormEvent,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setTemporaryPointToCopyOfDatasetPoint(item.key as number);
    }
  };

  private setTemporaryPointToCopyOfDatasetPoint(index: number): void {
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
      this.stringifiedValues[key] = this.temporaryPoint?.[key]?.toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      editingDataCustomIndex: undefined,
      selectedWhatIfRootIndex: index
    });
  }

  private setTemporaryPointToCustomPoint = (index: number): void => {
    this.temporaryPoint = _.cloneDeep(this.state.customPoints[index]);
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifiedValues[key] = this.temporaryPoint?.[key]?.toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      editingDataCustomIndex: index,
      selectedWhatIfRootIndex: this.temporaryPoint[JointDataset.IndexLabel]
    });
    this.openPanel();
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

  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void => {
    if (!this.temporaryPoint || !newValue) {
      return;
    }
    const editingData = this.temporaryPoint;
    this.stringifiedValues[key] = newValue;
    if (isString) {
      editingData[key] = newValue;
      this.forceUpdate();
    } else {
      const asNumber = +newValue;
      // because " " evaluates to 0 in js
      const isWhitespaceOnly = /^\s*$/.test(newValue);
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

  private setCustomRowPropertyDropdown = (
    key: string | number,
    option?: IComboBoxOption,
    value?: string
  ): void => {
    if (!this.temporaryPoint || (!value && !option)) {
      return;
    }
    const editingData = this.temporaryPoint;
    if (option) {
      // User selected/de-selected an existing option
      editingData[key] = option.key;
    } else if (value !== undefined) {
      // User typed a freeform option
      const featureOption = this.state.featuresOption.find(
        (feature) => feature.key === key
      );
      if (featureOption) {
        featureOption.data.categoricalOptions.push({ key: value, text: value });
      }
      editingData[key] = value;
    }

    this.forceUpdate();
    this.fetchData(editingData);
  };

  private savePoint = (): void => {
    const customPoints = [...this.state.customPoints];
    if (this.state.editingDataCustomIndex && this.temporaryPoint) {
      customPoints[this.state.editingDataCustomIndex] = this.temporaryPoint;
    }
    this.temporaryPoint = _.cloneDeep(this.temporaryPoint);
    this.setState({ customPoints });
  };

  private saveAsPoint = (): void => {
    const editingDataCustomIndex =
      this.state.editingDataCustomIndex !== undefined
        ? this.state.editingDataCustomIndex
        : this.state.customPoints.length;
    const customPoints = [...this.state.customPoints];
    const customPointIsActive = [...this.state.customPointIsActive];
    if (this.temporaryPoint) {
      customPoints.push(this.temporaryPoint);
    }
    customPointIsActive.push(true);
    this.temporaryPoint = _.cloneDeep(this.temporaryPoint);
    this.setState({
      customPointIsActive,
      customPoints,
      editingDataCustomIndex
    });
  };

  private createCopyOfFirstRow(): void {
    const indexes = this.getDefaultSelectedPointIndexes(
      this.context.errorCohorts[this.state.selectedCohortIndex].cohort
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
      this.stringifiedValues[key] = this.temporaryPoint?.[key]?.toString();
      this.validationErrors[key] = undefined;
    });
  }

  private toggleActivation = (index: number): void => {
    const pointIsActive = [...this.state.pointIsActive];
    pointIsActive[index] = !pointIsActive[index];
    this.setState({ pointIsActive });
  };

  private toggleCustomActivation = (index: number): void => {
    const customPointIsActive = [...this.state.customPointIsActive];
    customPointIsActive[index] = !customPointIsActive[index];
    this.setState({ customPointIsActive });
  };

  private dismissPanel = (): void => {
    this.setState({ isPanelOpen: false });
    window.dispatchEvent(new Event("resize"));
  };

  private openPanel = (): void => {
    this.setState({ isPanelOpen: true });
    window.dispatchEvent(new Event("resize"));
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

  private filterFeatures = (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    if (newValue === undefined || newValue === null || !/\S/.test(newValue)) {
      this.setState({ filteredFeatureList: this.state.featuresOption });
      return;
    }
    const filteredFeatureList = this.state.featuresOption.filter((item) => {
      return item.data.fullLabel.includes(newValue.toLowerCase());
    });
    this.setState({ filteredFeatureList });
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
    const trace = data.points[0];
    // custom point
    if (trace.curveNumber === 1) {
      this.setTemporaryPointToCustomPoint(trace.pointNumber);
    } else {
      const index = trace.customdata[JointDataset.IndexLabel];
      this.setTemporaryPointToCopyOfDatasetPoint(index);
      this.toggleSelectionOfPoint(index);
    }
  };

  private toggleSelectionOfPoint = (index?: number): void => {
    if (index === undefined) {
      return;
    }
    const indexOf = this.state.selectedPointsIndexes.indexOf(index);
    const newSelections = [...this.state.selectedPointsIndexes];
    const pointIsActive = [...this.state.pointIsActive];
    if (indexOf === -1) {
      if (
        this.state.selectedPointsIndexes.length > WhatIfConstants.MAX_SELECTION
      ) {
        this.setState({ showSelectionWarning: true });
        return;
      }
      newSelections.push(index);
      pointIsActive.push(true);
    } else {
      newSelections.splice(indexOf, 1);
      pointIsActive.splice(indexOf, 1);
    }
    this.setState({
      pointIsActive,
      selectedPointsIndexes: newSelections,
      showSelectionWarning: false
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

    this.setState({ request: abortController }, async () => {
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
    });
  };

  private generatePlotlyProps(
    jointData: JointDataset,
    chartProps: IGenericChartProps,
    cohort: Cohort
  ): IPlotlyProperty {
    const plotlyProps = _.cloneDeep(WhatIfConstants.basePlotlyProperties);
    plotlyProps.data[0].hoverinfo = "all";
    const indexes = cohort.unwrap(JointDataset.IndexLabel);
    plotlyProps.data[0].type = chartProps.chartType as ChartTypes;
    plotlyProps.data[0].mode = PlotlyMode.Markers;
    plotlyProps.data[0].marker = {
      color: indexes.map((rowIndex) => {
        const selectionIndex =
          this.state.selectedPointsIndexes.indexOf(rowIndex);
        if (selectionIndex === -1) {
          return FluentUIStyles.fabricColorInactiveSeries;
        }
        return FluentUIStyles.fluentUIColorPalette[selectionIndex];
      }) as any,
      size: 8,
      symbol: indexes.map((i) =>
        this.state.selectedPointsIndexes.includes(i) ? "square" : "circle"
      ) as any
    };

    plotlyProps.data[1] = {
      marker: {
        color: this.state.customPoints.map(
          (_, i) =>
            FluentUIStyles.fluentUIColorPalette[
              WhatIfConstants.MAX_SELECTION + 1 + i
            ]
        ),
        size: 12,
        symbol: "star"
      },
      mode: PlotlyMode.Markers,
      type: "scatter"
    };

    plotlyProps.data[2] = {
      hoverinfo: "text",
      marker: {
        color: "rgba(0,0,0,0)",
        line: {
          color:
            FluentUIStyles.fluentUIColorPalette[
              WhatIfConstants.MAX_SELECTION + 1 + this.state.customPoints.length
            ],
          width: 2
        },
        opacity: 0.5,
        size: 12,
        symbol: "star"
      },
      mode: PlotlyMode.Markers,
      text: "Editable What-If point",
      type: "scatter"
    };

    if (chartProps.xAxis) {
      if (jointData.metaDict[chartProps.xAxis.property]?.treatAsCategorical) {
        const xLabels =
          jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues;
        const xLabelIndexes = xLabels?.map((_, index) => index);
        _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
        _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
      }
    }
    if (chartProps.yAxis) {
      if (jointData.metaDict[chartProps.yAxis.property]?.treatAsCategorical) {
        const yLabels =
          jointData.metaDict[chartProps.yAxis.property].sortedCategoricalValues;
        const yLabelIndexes = yLabels?.map((_, index) => index);
        _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
        _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
      }
    }

    this.generateDataTrace(
      cohort.filteredData,
      chartProps,
      plotlyProps.data[0]
    );
    this.generateDataTrace(
      this.state.customPoints,
      chartProps,
      plotlyProps.data[1]
    );
    if (this.temporaryPoint) {
      this.generateDataTrace(
        [this.temporaryPoint],
        chartProps,
        plotlyProps.data[2]
      );
    }
    return plotlyProps;
  }

  private generateDataTrace(
    dictionary: Array<{ [key: string]: string | number }>,
    chartProps: IGenericChartProps,
    trace: IData
  ): void {
    const customdata = JointDataset.unwrap(
      dictionary,
      JointDataset.IndexLabel
    ).map((val) => {
      const dict: Dictionary<any> = {};
      dict[JointDataset.IndexLabel] = val;
      return dict;
    });
    let hovertemplate = "";
    if (chartProps.xAxis) {
      const metaX =
        this.context.jointDataset.metaDict[chartProps.xAxis.property];
      const rawX = JointDataset.unwrap(dictionary, chartProps.xAxis.property);
      hovertemplate += `${metaX.label}: %{customdata.X}<br>`;

      rawX.forEach((val, index) => {
        if (metaX?.treatAsCategorical) {
          customdata[index].X = metaX.sortedCategoricalValues?.[val];
        } else {
          customdata[index].X = (val as number).toLocaleString(undefined, {
            maximumSignificantDigits: 5
          });
        }
      });
      if (chartProps.xAxis.options.dither) {
        const dither = JointDataset.unwrap(
          dictionary,
          JointDataset.DitherLabel
        );
        trace.x = dither.map((ditherVal, index) => {
          return rawX[index] + ditherVal;
        });
      } else {
        trace.x = rawX;
      }
    }
    if (chartProps.yAxis) {
      const metaY =
        this.context.jointDataset.metaDict[chartProps.yAxis.property];
      const rawY = JointDataset.unwrap(dictionary, chartProps.yAxis.property);
      hovertemplate += `${metaY.label}: %{customdata.Y}<br>`;
      rawY.forEach((val, index) => {
        if (metaY?.treatAsCategorical) {
          customdata[index].Y = metaY.sortedCategoricalValues?.[val];
        } else {
          customdata[index].Y = (val as number).toLocaleString(undefined, {
            maximumSignificantDigits: 5
          });
        }
      });
      if (chartProps.yAxis.options.dither) {
        const dither = JointDataset.unwrap(
          dictionary,
          JointDataset.DitherLabel2
        );
        trace.y = dither.map((ditherVal, index) => {
          return rawY[index] + ditherVal;
        });
      } else {
        trace.y = rawY;
      }
    }
    hovertemplate += `${localization.Interpret.Charts.rowIndex}: %{customdata.Index}<br>`;
    hovertemplate += "<extra></extra>";
    trace.customdata = customdata as any;
    trace.hovertemplate = hovertemplate;
  }

  private generateDefaultChartAxes(): IGenericChartProps | undefined {
    const yKey = `${JointDataset.DataLabelRoot}0`;
    const yIsDithered =
      this.context.jointDataset.metaDict[yKey]?.treatAsCategorical;
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Scatter,
      xAxis: {
        options: {},
        property: this.context.jointDataset.hasPredictedProbabilities
          ? `${JointDataset.ProbabilityYRoot}0`
          : JointDataset.IndexLabel
      },
      yAxis: {
        options: {
          bin: false,
          dither: yIsDithered
        },
        property: yKey
      }
    };
    return chartProps;
  }
}
