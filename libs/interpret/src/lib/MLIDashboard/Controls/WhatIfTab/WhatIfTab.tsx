// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  getTheme,
  ChoiceGroup,
  IChoiceGroupOption,
  Icon,
  Slider,
  Text,
  ComboBox,
  IComboBox,
  ITooltipProps,
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
  Callout,
  IComboBoxOption,
  Link,
  DefaultButton,
  IconButton,
  PrimaryButton,
  CommandBarButton,
  Dropdown,
  IDropdownOption,
  SearchBox,
  TextField
} from "office-ui-fabric-react";
import _ from "lodash";
import {
  AccessibleChart,
  IPlotlyProperty,
  PlotlyMode,
  IData
} from "@responsible-ai/mlchartlib";

import React from "react";
import { localization } from "../../../Localization/localization";
import { Cohort } from "../../Cohort";
import { FabricStyles } from "../../FabricStyles";
import {
  IExplanationModelMetadata,
  ModelTypes
} from "../../IExplanationContext";
import { ColumnCategories, JointDataset } from "../../JointDataset";
import { MultiICEPlot } from "../MultiICEPlot/MultiICEPlot";
import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";
import { ModelExplanationUtils } from "../../ModelExplanationUtils";
import { ISelectorConfig } from "../../NewExplanationDashboard";
import { ChartTypes } from "../../ChartTypes";
import { IGenericChartProps } from "../../IGenericChartProps";
import { AxisConfigDialog } from "../AxisConfigurationDialog/AxisConfigDialog";
import { FeatureImportanceBar } from "../FeatureImportanceBar/FeatureImportanceBar";
import { InteractiveLegend } from "../InteractiveLegend/InteractiveLegend";
import { WeightVectorOption } from "../../IWeightedDropdownContext";
import { newExplanationDashboardRowErrorSize } from "../../newExplanationDashboardRowErrorSize";
import { IWhatIfTabStyles, whatIfTabStyles } from "./WhatIfTab.styles";

export interface IWhatIfTabProps {
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  cohorts: Cohort[];
  chartProps?: IGenericChartProps;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onChange: (config: IGenericChartProps) => void;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  editCohort: (index: number) => void;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface IWhatIfTabState {
  isPanelOpen: boolean;
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  selectedWhatIfRootIndex: number;
  editingDataCustomIndex?: number;
  showSelectionWarning: boolean;
  customPoints: Array<{ [key: string]: any }>;
  selectedCohortIndex: number;
  filteredFeatureList: IDropdownOption[];
  request?: AbortController;
  selectedPointsIndexes: number[];
  pointIsActive: boolean[];
  customPointIsActive: boolean[];
  startingK: number;
  topK: number;
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  secondaryChartChoice: string;
  selectedFeatureKey: string;
  selectedICEClass: number;
  crossClassInfoVisible: boolean;
  iceTooltipVisible: boolean;
}

export class WhatIfTab extends React.PureComponent<
  IWhatIfTabProps,
  IWhatIfTabState
> {
  public static basePlotlyProperties: IPlotlyProperty = {
    config: { displaylogo: false, responsive: true, displayModeBar: false },
    data: [{}],
    layout: {
      dragmode: false,
      autosize: true,
      font: {
        size: 10
      },
      margin: {
        t: 10,
        l: 10,
        b: 20,
        r: 0
      },
      hovermode: "closest",
      showlegend: false,
      yaxis: {
        automargin: true
      }
    } as any
  };
  private static readonly MAX_SELECTION = 2;
  private static readonly MAX_CLASSES_TOOLTIP = 5;
  private static readonly colorPath = "Color";
  private static readonly namePath = "Name";
  private static readonly IceKey = "ice";
  private static readonly featureImportanceKey = "feature-importance";
  private static readonly basePredictionTooltipIds = "predict-tooltip";
  private static readonly whatIfPredictionTooltipIds = "whatif-predict-tooltip";
  private static readonly secondaryPlotChoices: IChoiceGroupOption[] = [
    {
      key: WhatIfTab.featureImportanceKey,
      text: localization.WhatIfTab.featureImportancePlot
    },
    { key: WhatIfTab.IceKey, text: localization.WhatIfTab.icePlot }
  ];

  private readonly chartAndConfigsId = "chart-and-axis-config-id";

  private includedFeatureImportance: IGlobalSeries[] = [];
  private selectedFeatureImportance: IGlobalSeries[] = [];
  private validationErrors: { [key: string]: string | undefined } = {};
  private stringifedValues: { [key: string]: string } = {};
  private selectedDatapoints: any[][] = [];
  private customDatapoints: any[][] = [];
  private testableDatapoints: any[][] = [];
  private temporaryPoint: { [key: string]: any } | undefined;
  private testableDatapointColors: string[] = FabricStyles.fabricColorPalette;
  private testableDatapointNames: string[] = [];
  private weightOptions: IDropdownOption[] | undefined;
  private rowOptions: IDropdownOption[] | undefined;
  private featuresOption: IDropdownOption[] = new Array(
    this.props.jointDataset.datasetFeatureCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      const meta = this.props.jointDataset.metaDict[key];
      const options = meta.isCategorical
        ? meta.sortedCategoricalValues?.map((optionText, index) => {
            return { key: index, text: optionText };
          })
        : undefined;
      return {
        key,
        text: meta.abbridgedLabel,
        data: {
          categoricalOptions: options,
          fullLabel: meta.label.toLowerCase()
        }
      };
    });
  private classOptions: IDropdownOption[] = this.props.metadata.classNames.map(
    (name, index) => {
      return { key: index, text: name };
    }
  );

  public constructor(props: IWhatIfTabProps) {
    super(props);

    if (!this.props.jointDataset.hasDataset) {
      return;
    }
    if (this.props.metadata.modelType === ModelTypes.Multiclass) {
      this.weightOptions = this.props.weightOptions.map((option) => {
        return {
          text: this.props.weightLabels[option],
          key: option
        };
      });
    }
    this.state = {
      isPanelOpen: this.props.invokeModel !== undefined,
      xDialogOpen: false,
      yDialogOpen: false,
      selectedWhatIfRootIndex: 0,
      editingDataCustomIndex: undefined,
      customPoints: [],
      selectedCohortIndex: 0,
      request: undefined,
      filteredFeatureList: this.featuresOption,
      selectedPointsIndexes: [],
      pointIsActive: [],
      customPointIsActive: [],
      startingK: 0,
      topK: 4,
      sortArray: [],
      sortingSeriesIndex: undefined,
      secondaryChartChoice: WhatIfTab.featureImportanceKey,
      selectedFeatureKey: JointDataset.DataLabelRoot + "0",
      showSelectionWarning: false,
      selectedICEClass: 0,
      crossClassInfoVisible: false,
      iceTooltipVisible: false
    };

    if (props.chartProps === undefined) {
      this.generateDefaultChartAxes();
    }
    this.createCopyOfFirstRow();
    this.buildRowOptions(0);

    this.fetchData = _.debounce(this.fetchData.bind(this), 400);
  }

  public componentDidUpdate(
    prevProps: IWhatIfTabProps,
    prevState: IWhatIfTabState
  ): void {
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
          const row = this.props.jointDataset.getRow(rowIndex);
          return {
            colorIndex,
            id: rowIndex,
            name: localization.formatString(
              localization.WhatIfTab.rowLabel,
              rowIndex.toString()
            ),
            unsortedFeatureValues: JointDataset.datasetSlice(
              row,
              this.props.jointDataset.metaDict,
              this.props.jointDataset.localExplanationFeatureCount
            ),
            unsortedAggregateY: JointDataset.localExplanationSlice(
              row,
              this.props.jointDataset.localExplanationFeatureCount
            ) as number[]
          };
        }
      );
      this.selectedDatapoints = this.state.selectedPointsIndexes.map(
        (rowIndex) => {
          const row = this.props.jointDataset.getRow(rowIndex);
          return JointDataset.datasetSlice(
            row,
            this.props.jointDataset.metaDict,
            this.props.jointDataset.datasetFeatureCount
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
          this.props.jointDataset.metaDict,
          this.props.jointDataset.datasetFeatureCount
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
        (item) => FabricStyles.fabricColorPalette[item.colorIndex]
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
            FabricStyles.fabricColorPalette[WhatIfTab.MAX_SELECTION + i + 1]
          );
          includedColors.push(
            FabricStyles.fabricColorPalette[WhatIfTab.MAX_SELECTION + i + 1]
          );
          includedNames.push(this.state.customPoints[i][WhatIfTab.namePath]);
          return true;
        }
        return false;
      });
      this.testableDatapoints = [...includedRows, ...includedCustomRows];
      this.testableDatapointColors = includedColors;
      this.testableDatapointNames = includedNames;
      this.forceUpdate();
    }
    this.setState({ sortingSeriesIndex, sortArray });
  }

  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
    if (!this.props.jointDataset.hasDataset) {
      return (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.WhatIfTab.missingParameters}
            </Text>
          </div>
        </div>
      );
    }
    if (this.props.chartProps === undefined) {
      return <div />;
    }
    const plotlyProps = this.generatePlotlyProps(
      this.props.jointDataset,
      this.props.chartProps,
      this.props.cohorts[this.state.selectedCohortIndex]
    );
    const cohortLength = this.props.cohorts[this.state.selectedCohortIndex]
      .filteredData.length;
    const canRenderChart =
      cohortLength < newExplanationDashboardRowErrorSize ||
      this.props.chartProps.chartType !== ChartTypes.Scatter;
    const cohortOptions: IDropdownOption[] = this.props.cohorts.map(
      (cohort, index) => {
        return { key: index, text: cohort.name };
      }
    );
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Icon iconName="Info" className={classNames.infoIcon} />
          <Text variant="medium" className={classNames.helperText}>
            {localization.WhatIfTab.helperText}
          </Text>
        </div>
        <div className={classNames.mainArea}>
          <div
            className={
              this.state.isPanelOpen
                ? classNames.expandedPanel
                : classNames.collapsedPanel
            }
          >
            {this.state.isPanelOpen && this.props.invokeModel === undefined && (
              <div>
                <div className={classNames.panelIconAndLabel}>
                  <IconButton
                    iconProps={{ iconName: "ChevronRight" }}
                    onClick={this.dismissPanel}
                    className={classNames.blackIcon}
                  />
                  <Text variant={"medium"} className={classNames.boldText}>
                    {localization.WhatIfTab.whatIfDatapoint}
                  </Text>
                </div>
                <div className={classNames.panelPlaceholderWrapper}>
                  <div
                    className={classNames.missingParametersPlaceholderSpacer}
                  >
                    <Text>{localization.WhatIfTab.panelPlaceholder}</Text>
                  </div>
                </div>
              </div>
            )}
            {this.state.isPanelOpen && this.props.invokeModel !== undefined && (
              <div>
                <div className={classNames.panelIconAndLabel}>
                  <IconButton
                    iconProps={{ iconName: "ChevronRight" }}
                    onClick={this.dismissPanel}
                    className={classNames.blackIcon}
                  />
                  <Text variant={"medium"} className={classNames.boldText}>
                    {localization.WhatIfTab.whatIfDatapoint}
                  </Text>
                </div>
                <div className={classNames.upperWhatIfPanel}>
                  <Text variant={"small"} className={classNames.legendHelpText}>
                    {localization.WhatIfTab.whatIfHelpText}
                  </Text>
                  {this.rowOptions && (
                    <Dropdown
                      label={localization.WhatIfTab.indexLabel}
                      options={this.rowOptions}
                      selectedKey={this.state.selectedWhatIfRootIndex}
                      onChange={this.setSelectedIndex}
                    />
                  )}
                  {this.buildExistingPredictionLabels(classNames)}
                  <TextField
                    label={localization.WhatIfTab.whatIfNameLabel}
                    value={this.temporaryPoint?.[WhatIfTab.namePath]}
                    onChange={this.setCustomRowProperty.bind(
                      this,
                      WhatIfTab.namePath,
                      true
                    )}
                    styles={{ fieldGroup: { width: 200 } }}
                  />
                  {this.buildCustomPredictionLabels(classNames)}
                </div>
                <div className={classNames.parameterList}>
                  <Text variant="medium" className={classNames.boldText}>
                    {localization.WhatIfTab.featureValues}
                  </Text>
                  <SearchBox
                    className={classNames.featureSearch}
                    placeholder={localization.WhatIf.filterFeaturePlaceholder}
                    onChange={this.filterFeatures}
                  />
                  <div className={classNames.featureList}>
                    {this.state.filteredFeatureList.map((item) => {
                      const metaInfo = this.props.jointDataset.metaDict[
                        item.key
                      ];
                      if (item.data && item.data.categoricalOptions) {
                        return (
                          <ComboBox
                            key={item.key}
                            label={metaInfo.abbridgedLabel}
                            autoComplete={"on"}
                            allowFreeform={true}
                            selectedKey={this.temporaryPoint?.[item.key]}
                            options={item.data.categoricalOptions}
                            onChange={this.setCustomRowPropertyDropdown.bind(
                              this,
                              item.key
                            )}
                            calloutProps={FabricStyles.calloutProps}
                            styles={FabricStyles.limitedSizeMenuDropdown}
                          />
                        );
                      }
                      return (
                        <TextField
                          key={item.key}
                          label={metaInfo.abbridgedLabel}
                          value={this.stringifedValues[item.key]}
                          onChange={this.setCustomRowProperty.bind(
                            this,
                            item.key,
                            false
                          )}
                          styles={{ fieldGroup: { width: 100 } }}
                          errorMessage={this.validationErrors[item.key]}
                        />
                      );
                    })}
                  </div>
                </div>
                {this.state.editingDataCustomIndex !== undefined && (
                  <PrimaryButton
                    className={classNames.saveButton}
                    disabled={
                      this.temporaryPoint?.[JointDataset.PredictedYLabel] ===
                      undefined
                    }
                    text={localization.WhatIfTab.saveChanges}
                    onClick={this.savePoint}
                  />
                )}
                <PrimaryButton
                  className={classNames.saveButton}
                  disabled={
                    this.temporaryPoint?.[JointDataset.PredictedYLabel] ===
                    undefined
                  }
                  text={localization.WhatIfTab.saveAsNewPoint}
                  onClick={this.saveAsPoint}
                />
                <div className={classNames.disclaimerWrapper}>
                  <Text variant={"xSmall"}>
                    {localization.WhatIfTab.disclaimer}
                  </Text>
                </div>
              </div>
            )}
            {!this.state.isPanelOpen && (
              <IconButton
                iconProps={{ iconName: "ChevronLeft" }}
                onClick={this.openPanel}
              />
            )}
          </div>
          <div className={classNames.chartsArea}>
            {cohortOptions && (
              <div className={classNames.cohortPickerWrapper}>
                <Text
                  variant="mediumPlus"
                  className={classNames.cohortPickerLabel}
                >
                  {localization.WhatIfTab.cohortPickerLabel}
                </Text>
                <Dropdown
                  styles={{ dropdown: { width: 150 } }}
                  options={cohortOptions}
                  selectedKey={this.state.selectedCohortIndex}
                  onChange={this.setSelectedCohort}
                />
              </div>
            )}
            <div className={classNames.topArea}>
              <div
                className={classNames.chartWithAxes}
                id={this.chartAndConfigsId}
              >
                {this.state.yDialogOpen && (
                  <AxisConfigDialog
                    jointDataset={this.props.jointDataset}
                    orderedGroupTitles={[
                      ColumnCategories.Index,
                      ColumnCategories.Dataset,
                      ColumnCategories.Outcome
                    ]}
                    selectedColumn={this.props.chartProps.yAxis}
                    canBin={false}
                    mustBin={false}
                    canDither={
                      this.props.chartProps.chartType === ChartTypes.Scatter
                    }
                    onAccept={this.onYSet}
                    onCancel={this.setYOpen.bind(this, false)}
                    target={`#${this.chartAndConfigsId}`}
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
                      this.props.chartProps.chartType ===
                        ChartTypes.Histogram ||
                      this.props.chartProps.chartType === ChartTypes.Box
                    }
                    mustBin={
                      this.props.chartProps.chartType ===
                        ChartTypes.Histogram ||
                      this.props.chartProps.chartType === ChartTypes.Box
                    }
                    canDither={
                      this.props.chartProps.chartType === ChartTypes.Scatter
                    }
                    onAccept={this.onXSet}
                    onCancel={this.setXOpen.bind(this, false)}
                    target={`#${this.chartAndConfigsId}`}
                  />
                )}
                <div className={classNames.chartWithVertical}>
                  <div className={classNames.verticalAxis}>
                    <div className={classNames.rotatedVerticalBox}>
                      <Text
                        block
                        variant="mediumPlus"
                        className={classNames.boldText}
                      >
                        {localization.Charts.yValue}
                      </Text>
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
                  {!canRenderChart && (
                    <div className={classNames.missingParametersPlaceholder}>
                      <div
                        className={
                          classNames.missingParametersPlaceholderSpacer
                        }
                      >
                        <Text
                          block
                          variant="large"
                          className={classNames.faintText}
                        >
                          {localization.ValidationErrors.datasizeError}
                        </Text>
                        <PrimaryButton onClick={this.editCohort}>
                          {localization.ValidationErrors.addFilters}
                        </PrimaryButton>
                      </div>
                    </div>
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
                  <div className={classNames.paddingDiv}></div>
                  <div className={classNames.horizontalAxis}>
                    <div>
                      <Text
                        block
                        variant="mediumPlus"
                        className={classNames.boldText}
                      >
                        {localization.Charts.xValue}
                      </Text>
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
              <div className={classNames.legendAndText}>
                <div className={classNames.legendHlepWrapper}>
                  <Text variant={"small"} className={classNames.legendHelpText}>
                    {localization.WhatIfTab.scatterLegendText}
                  </Text>
                </div>
                <Text
                  variant={"small"}
                  block
                  className={classNames.legendLabel}
                >
                  {localization.WhatIfTab.realPoint}
                </Text>
                {this.selectedFeatureImportance.length > 0 && (
                  <InteractiveLegend
                    items={this.selectedFeatureImportance.map(
                      (row, rowIndex) => {
                        return {
                          name: row.name,
                          color: FabricStyles.fabricColorPalette[rowIndex],
                          activated: this.state.pointIsActive[rowIndex],
                          onClick: this.toggleActivation.bind(this, rowIndex),
                          onDelete: this.toggleSelectionOfPoint.bind(
                            this,
                            row.id
                          )
                        };
                      }
                    )}
                  />
                )}
                {this.state.showSelectionWarning && (
                  <Text variant={"xSmall"} className={classNames.errorText}>
                    {localization.WhatIfTab.selectionLimit}
                  </Text>
                )}
                {this.selectedFeatureImportance.length === 0 && (
                  <Text variant={"xSmall"} className={classNames.smallItalic}>
                    {localization.WhatIfTab.noneSelectedYet}
                  </Text>
                )}
                <Text
                  variant={"small"}
                  block
                  className={classNames.legendLabel}
                >
                  {localization.WhatIfTab.whatIfDatapoints}
                </Text>
                {this.state.customPoints.length > 0 && (
                  <InteractiveLegend
                    items={this.state.customPoints.map((row, rowIndex) => {
                      return {
                        name: row[WhatIfTab.namePath],
                        color:
                          FabricStyles.fabricColorPalette[
                            rowIndex + WhatIfTab.MAX_SELECTION + 1
                          ],
                        activated: this.state.customPointIsActive[rowIndex],
                        onClick: this.toggleCustomActivation.bind(
                          this,
                          rowIndex
                        ),
                        onDelete: this.removeCustomPoint.bind(this, rowIndex),
                        onEdit: this.setTemporaryPointToCustomPoint.bind(
                          this,
                          rowIndex
                        )
                      };
                    })}
                  />
                )}
                {this.state.customPoints.length === 0 && (
                  <Text variant={"xSmall"} className={classNames.smallItalic}>
                    {localization.WhatIfTab.noneCreatedYet}
                  </Text>
                )}
              </div>
            </div>
            {this.buildSecondaryArea(classNames)}
          </div>
        </div>
      </div>
    );
  }

  private editCohort = (): void => {
    this.props.editCohort(this.state.selectedCohortIndex);
  };

  private buildSecondaryArea(
    classNames: IProcessedStyleSet<IWhatIfTabStyles>
  ): React.ReactNode {
    let secondaryPlot: React.ReactNode;
    const featureImportanceSortOptions: IDropdownOption[] = this.includedFeatureImportance.map(
      (item, index) => {
        return {
          key: index,
          text: item.name
        };
      }
    );
    if (this.state.secondaryChartChoice === WhatIfTab.featureImportanceKey) {
      if (!this.props.jointDataset.hasLocalExplanations) {
        secondaryPlot = (
          <div className={classNames.missingParametersPlaceholder}>
            <div className={classNames.missingParametersPlaceholderSpacer}>
              <Text variant="large" className={classNames.faintText}>
                {localization.WhatIfTab.featureImportanceLackingParameters}
              </Text>
            </div>
          </div>
        );
      } else if (this.includedFeatureImportance.length === 0) {
        secondaryPlot = (
          <div className={classNames.missingParametersPlaceholder}>
            <div className={classNames.missingParametersPlaceholderSpacer}>
              <Text variant="large" className={classNames.faintText}>
                {localization.WhatIfTab.featureImportanceGetStartedText}
              </Text>
            </div>
          </div>
        );
      } else {
        const yAxisLabels: string[] = [localization.featureImportance];
        if (this.props.metadata.modelType !== ModelTypes.Regression) {
          yAxisLabels.push(
            this.props.weightLabels[this.props.selectedWeightVector]
          );
        }
        const maxStartingK = Math.max(
          0,
          this.props.jointDataset.localExplanationFeatureCount - this.state.topK
        );
        secondaryPlot = (
          <div className={classNames.featureImportanceArea}>
            <div className={classNames.featureImportanceControls}>
              <Text variant="medium" className={classNames.sliderLabel}>
                {localization.formatString(
                  localization.GlobalTab.topAtoB,
                  this.state.startingK + 1,
                  this.state.startingK + this.state.topK
                )}
              </Text>
              <Slider
                className={classNames.startingK}
                ariaLabel={localization.AggregateImportance.topKFeatures}
                max={maxStartingK}
                min={0}
                step={1}
                value={this.state.startingK}
                onChange={this.setStartingK}
                showValue={false}
              />
            </div>
            <div className={classNames.featureImportanceChartAndLegend}>
              <FeatureImportanceBar
                jointDataset={this.props.jointDataset}
                yAxisLabels={yAxisLabels}
                chartType={ChartTypes.Bar}
                sortArray={this.state.sortArray}
                startingK={this.state.startingK}
                unsortedX={this.props.metadata.featureNamesAbridged}
                unsortedSeries={this.includedFeatureImportance}
                topK={this.state.topK}
              />
              <div className={classNames.featureImportanceLegend}>
                <Text
                  variant={"medium"}
                  className={classNames.cohortPickerLabel}
                >
                  {localization.GlobalTab.sortBy}
                </Text>
                <Dropdown
                  styles={{ dropdown: { width: 150 } }}
                  options={featureImportanceSortOptions}
                  selectedKey={this.state.sortingSeriesIndex}
                  onChange={this.setSortIndex}
                />
                {this.props.metadata.modelType === ModelTypes.Multiclass && (
                  <div>
                    <div className={classNames.multiclassWeightLabel}>
                      <Text
                        variant={"medium"}
                        className={classNames.multiclassWeightLabelText}
                      >
                        {localization.GlobalTab.weightOptions}
                      </Text>
                      <IconButton
                        id={"cross-class-weight-info"}
                        iconProps={{ iconName: "Info" }}
                        title={localization.CrossClass.info}
                        onClick={this.toggleCrossClassInfo}
                      />
                    </div>
                    {this.weightOptions && (
                      <Dropdown
                        options={this.weightOptions}
                        selectedKey={this.props.selectedWeightVector}
                        onChange={this.setWeightOption}
                      />
                    )}
                    {this.state.crossClassInfoVisible && (
                      <Callout
                        doNotLayer={true}
                        target={"#cross-class-weight-info"}
                        setInitialFocus={true}
                        onDismiss={this.toggleCrossClassInfo}
                        directionalHint={DirectionalHint.leftCenter}
                        role="alertdialog"
                        styles={{ container: FabricStyles.calloutContainer }}
                      >
                        <div className={classNames.calloutWrapper}>
                          <div className={classNames.calloutHeader}>
                            <Text className={classNames.calloutTitle}>
                              {localization.CrossClass.crossClassWeights}
                            </Text>
                          </div>
                          <div className={classNames.calloutInner}>
                            <Text>{localization.CrossClass.overviewInfo}</Text>
                            <ul>
                              <li>
                                <Text>
                                  {localization.CrossClass.absoluteValInfo}
                                </Text>
                              </li>
                              <li>
                                <Text>
                                  {localization.CrossClass.enumeratedClassInfo}
                                </Text>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Callout>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
    } else if (!this.props.invokeModel) {
      secondaryPlot = (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.WhatIfTab.iceLackingParameters}
            </Text>
          </div>
        </div>
      );
    } else if (this.testableDatapoints.length === 0) {
      secondaryPlot = (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.WhatIfTab.IceGetStartedText}
            </Text>
          </div>
        </div>
      );
    } else {
      secondaryPlot = (
        <div className={classNames.featureImportanceArea}>
          <div className={classNames.rightJustifiedContainer}>
            <CommandBarButton
              iconProps={{ iconName: "Info" }}
              id="explanation-info"
              className={classNames.infoButton}
              text={localization.Charts.howToRead}
              onClick={this.toggleICETooltip}
            />
            {this.state.iceTooltipVisible && (
              <Callout
                doNotLayer={true}
                target={"#explanation-info"}
                setInitialFocus={true}
                onDismiss={this.toggleICETooltip}
                role="alertdialog"
                styles={{ container: FabricStyles.calloutContainer }}
              >
                <div className={classNames.calloutWrapper}>
                  <div className={classNames.calloutHeader}>
                    <Text className={classNames.calloutTitle}>
                      {localization.WhatIfTab.icePlot}
                    </Text>
                  </div>
                  <div className={classNames.calloutInner}>
                    <Text>{localization.WhatIfTab.icePlotHelperText}</Text>
                    <div className={classNames.calloutActions}>
                      <Link
                        className={classNames.calloutLink}
                        href={
                          "https://christophm.github.io/interpretable-ml-book/ice.html#ice"
                        }
                        target="_blank"
                      >
                        {localization.ExplanationSummary.clickHere}
                      </Link>
                    </div>
                  </div>
                </div>
              </Callout>
            )}
          </div>
          <div className={classNames.featureImportanceChartAndLegend}>
            <MultiICEPlot
              invokeModel={this.props.invokeModel}
              datapoints={this.testableDatapoints}
              colors={this.testableDatapointColors}
              rowNames={this.testableDatapointNames}
              jointDataset={this.props.jointDataset}
              metadata={this.props.metadata}
              feature={this.state.selectedFeatureKey}
              selectedClass={this.state.selectedICEClass}
            />
            <div className={classNames.featureImportanceLegend}>
              <ComboBox
                autoComplete={"on"}
                className={classNames.iceFeatureSelection}
                options={this.featuresOption}
                onChange={this.onFeatureSelected}
                label={localization.IcePlot.featurePickerLabel}
                ariaLabel="feature picker"
                selectedKey={this.state.selectedFeatureKey}
                useComboBoxAsMenuWidth={true}
                calloutProps={FabricStyles.calloutProps}
                styles={FabricStyles.limitedSizeMenuDropdown}
              />
              {this.props.metadata.modelType === ModelTypes.Multiclass && (
                <ComboBox
                  autoComplete={"on"}
                  className={classNames.iceClassSelection}
                  options={this.classOptions}
                  onChange={this.onICEClassSelected}
                  label={localization.WhatIfTab.classPickerLabel}
                  ariaLabel="class picker"
                  selectedKey={this.state.selectedICEClass}
                  useComboBoxAsMenuWidth={true}
                  calloutProps={FabricStyles.calloutProps}
                  styles={FabricStyles.limitedSizeMenuDropdown}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={classNames.choiceBoxArea}>
          <Text variant="medium" className={classNames.boldText}>
            {localization.WhatIfTab.showLabel}
          </Text>
          <ChoiceGroup
            className={classNames.choiceGroup}
            styles={{
              flexContainer: classNames.choiceGroupFlexContainer
            }}
            options={WhatIfTab.secondaryPlotChoices}
            selectedKey={this.state.secondaryChartChoice}
            onChange={this.setSecondaryChart}
          />
        </div>
        {secondaryPlot}
      </div>
    );
  }

  private buildExistingPredictionLabels(
    classNames: IProcessedStyleSet<IWhatIfTabStyles>
  ): React.ReactNode {
    if (this.props.metadata.modelType !== ModelTypes.Regression) {
      const row = this.props.jointDataset.getRow(
        this.state.selectedWhatIfRootIndex
      );
      const trueClass = this.props.jointDataset.hasTrueY
        ? row[JointDataset.TrueYLabel]
        : undefined;
      const predictedClass = this.props.jointDataset.hasPredictedY
        ? row[JointDataset.PredictedYLabel]
        : undefined;
      const predictedClassName =
        predictedClass !== undefined
          ? this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
              .sortedCategoricalValues?.[predictedClass]
          : undefined;
      if (this.props.jointDataset.hasPredictedProbabilities) {
        const predictedProb =
          row[JointDataset.ProbabilityYRoot + predictedClass?.toString()];
        const predictedProbs = JointDataset.predictProbabilitySlice(
          row,
          this.props.metadata.classNames.length
        );
        const sortedProbs = ModelExplanationUtils.getSortIndices(predictedProbs)
          .reverse()
          .slice(0, WhatIfTab.MAX_CLASSES_TOOLTIP);
        const tooltipClasses = sortedProbs.map((index) => {
          const className = this.props.jointDataset.metaDict[
            JointDataset.PredictedYLabel
          ].sortedCategoricalValues?.[index];
          return (
            <Text block variant="small" key={index}>
              {className}
            </Text>
          );
        });
        const tooltipProbs = sortedProbs.map((index, key) => {
          const prob = predictedProbs[index];
          return (
            <Text block variant="small" key={key}>
              {prob.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </Text>
          );
        });
        const tooltipTitle =
          predictedProbs.length > WhatIfTab.MAX_CLASSES_TOOLTIP
            ? localization.WhatIfTab.tooltipTitleMany
            : localization.WhatIfTab.tooltipTitleFew;
        const tooltipProps: ITooltipProps = {
          onRenderContent: () => (
            <div className={classNames.tooltipWrapper}>
              <div className={classNames.tooltipTitle}>
                <Text variant="large">{tooltipTitle}</Text>
              </div>
              <div className={classNames.tooltipTable}>
                <div className={classNames.tooltipColumn}>
                  <Text className={classNames.boldText}>
                    {localization.WhatIfTab.classPickerLabel}
                  </Text>
                  {tooltipClasses}
                </div>
                <div className={classNames.tooltipColumn}>
                  <Text block className={classNames.boldText}>
                    {localization.WhatIfTab.probabilityLabel}
                  </Text>
                  {tooltipProbs}
                </div>
              </div>
            </div>
          )
        };
        return (
          <div className={classNames.predictedBlock}>
            <TooltipHost
              tooltipProps={tooltipProps}
              delay={TooltipDelay.zero}
              id={WhatIfTab.basePredictionTooltipIds}
              directionalHint={DirectionalHint.leftCenter}
              styles={{ root: { display: "inline-block" } }}
            >
              <IconButton
                className={classNames.tooltipHost}
                iconProps={{ iconName: "More" }}
              ></IconButton>
            </TooltipHost>
            <div>
              {trueClass !== undefined && (
                <div>
                  <Text className={classNames.boldText} variant="small">
                    {localization.WhatIfTab.trueClass}
                  </Text>
                  <Text variant="small">
                    {
                      this.props.jointDataset.metaDict[
                        JointDataset.PredictedYLabel
                      ].sortedCategoricalValues?.[trueClass]
                    }
                  </Text>
                </div>
              )}
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.WhatIfTab.predictedClass}
                </Text>
                <Text variant="small">{predictedClassName}</Text>
              </div>
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.WhatIfTab.probability}
                </Text>
                <Text variant="small">
                  {predictedProb.toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })}
                </Text>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={classNames.predictedBlock}>
          <div>
            {trueClass !== undefined && (
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.WhatIfTab.trueClass}
                </Text>
                <Text variant="small">
                  {
                    this.props.jointDataset.metaDict[
                      JointDataset.PredictedYLabel
                    ].sortedCategoricalValues?.[trueClass]
                  }
                </Text>
              </div>
            )}
            {predictedClass !== undefined && (
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.WhatIfTab.predictedClass}
                </Text>
                <Text variant="small">{predictedClassName}</Text>
              </div>
            )}
          </div>
        </div>
      );
    }
    const row = this.props.jointDataset.getRow(
      this.state.selectedWhatIfRootIndex
    );
    const trueValue = this.props.jointDataset.hasTrueY
      ? row[JointDataset.TrueYLabel]
      : undefined;
    const predictedValue = this.props.jointDataset.hasPredictedY
      ? row[JointDataset.PredictedYLabel]
      : undefined;
    return (
      <div className={classNames.predictedBlock}>
        <div>
          {trueValue !== undefined && (
            <div>
              <Text className={classNames.boldText} variant="small">
                {localization.WhatIfTab.trueValue}
              </Text>
              <Text variant="small">{trueValue}</Text>
            </div>
          )}
          {predictedValue !== undefined && (
            <div>
              <Text className={classNames.boldText} variant="small">
                {localization.WhatIfTab.predictedValue}
              </Text>
              <Text variant="small">
                {predictedValue.toLocaleString(undefined, {
                  maximumFractionDigits: 3
                })}
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  }

  private buildCustomPredictionLabels(
    classNames: IProcessedStyleSet<IWhatIfTabStyles>
  ): React.ReactNode {
    if (this.props.metadata.modelType !== ModelTypes.Regression) {
      const predictedClass = this.props.jointDataset.hasPredictedY
        ? this.temporaryPoint?.[JointDataset.PredictedYLabel]
        : undefined;
      const predictedClassName =
        predictedClass !== undefined
          ? this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
              .sortedCategoricalValues?.[predictedClass]
          : undefined;
      const predictedProb =
        this.props.jointDataset.hasPredictedProbabilities &&
        predictedClass !== undefined
          ? this.temporaryPoint?.[
              JointDataset.ProbabilityYRoot + predictedClass.toString()
            ]
          : undefined;
      if (predictedProb !== undefined) {
        const basePredictedProbs = JointDataset.predictProbabilitySlice(
          this.props.jointDataset.getRow(this.state.selectedWhatIfRootIndex),
          this.props.metadata.classNames.length
        );
        const predictedProbs = JointDataset.predictProbabilitySlice(
          this.temporaryPoint || [],
          this.props.metadata.classNames.length
        );
        const sortedProbs = ModelExplanationUtils.getSortIndices(predictedProbs)
          .reverse()
          .slice(0, WhatIfTab.MAX_CLASSES_TOOLTIP);
        const tooltipClasses = sortedProbs.map((index) => {
          const className = this.props.jointDataset.metaDict[
            JointDataset.PredictedYLabel
          ].sortedCategoricalValues?.[index];
          return (
            <Text block variant="small" key={index}>
              {className}
            </Text>
          );
        });
        const tooltipProbs = sortedProbs.map((index) => {
          const prob = predictedProbs[index];
          return (
            <Text block variant="small" key={index}>
              {prob.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </Text>
          );
        });
        const tooltipDeltas = sortedProbs.map((index) => {
          const delta = predictedProbs[index] - basePredictedProbs[index];
          if (delta < 0) {
            return (
              <Text
                className={classNames.negativeNumber}
                block
                variant="small"
                key={index}
              >
                {delta.toLocaleString(undefined, { maximumFractionDigits: 3 })}
              </Text>
            );
          }
          if (delta > 0) {
            return (
              <Text
                className={classNames.positiveNumber}
                block
                variant="small"
                key={index}
              >
                {"+" +
                  delta.toLocaleString(undefined, { maximumFractionDigits: 3 })}
              </Text>
            );
          }
          return (
            <Text block variant="small" key={index}>
              0
            </Text>
          );
        });
        const tooltipProps: ITooltipProps = {
          onRenderContent: () => (
            <div className={classNames.tooltipWrapper}>
              <div className={classNames.tooltipTitle}>
                <Text variant="large">
                  {localization.WhatIfTab.whatIfTooltipTitle}
                </Text>
              </div>
              <div className={classNames.tooltipTable}>
                <div className={classNames.tooltipColumn}>
                  <Text className={classNames.boldText}>
                    {localization.WhatIfTab.classPickerLabel}
                  </Text>
                  {tooltipClasses}
                </div>
                <div className={classNames.tooltipColumn}>
                  <Text block className={classNames.boldText}>
                    {localization.WhatIfTab.probabilityLabel}
                  </Text>
                  {tooltipProbs}
                </div>
                <div className={classNames.tooltipColumn}>
                  <Text block className={classNames.boldText}>
                    {localization.WhatIfTab.deltaLabel}
                  </Text>
                  {tooltipDeltas}
                </div>
              </div>
            </div>
          )
        };
        return (
          <div className={classNames.predictedBlock}>
            <TooltipHost
              tooltipProps={tooltipProps}
              delay={TooltipDelay.zero}
              id={WhatIfTab.whatIfPredictionTooltipIds}
              directionalHint={DirectionalHint.leftCenter}
              styles={{ root: { display: "inline-block" } }}
            >
              <IconButton
                className={classNames.tooltipHost}
                iconProps={{ iconName: "More" }}
              ></IconButton>
            </TooltipHost>
            <div>
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.WhatIfTab.newPredictedClass}
                </Text>
                <Text variant="small">{predictedClassName}</Text>
              </div>
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.WhatIfTab.newProbability}
                </Text>
                <Text variant="small">
                  {predictedProb.toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })}
                </Text>
              </div>
            </div>
          </div>
        );
      }
      // loading predictions, show placeholders
      return (
        <div className={classNames.predictedBlock}>
          <div>
            <IconButton
              className={classNames.tooltipHost}
              iconProps={{ iconName: "More" }}
              disabled={true}
            ></IconButton>
          </div>
          <div>
            <div>
              <Text variant="small">{localization.WhatIfTab.loading}</Text>
            </div>
            <div>
              <Text variant="small">{localization.WhatIfTab.loading}</Text>
            </div>
          </div>
        </div>
      );
    }
    const predictedValueString =
      this.temporaryPoint?.[JointDataset.PredictedYLabel] !== undefined
        ? this.temporaryPoint?.[JointDataset.PredictedYLabel].toLocaleString(
            undefined,
            {
              maximumFractionDigits: 3
            }
          )
        : localization.WhatIfTab.loading;
    return (
      <div className={classNames.customPredictBlock}>
        <div>
          <Text className={classNames.boldText} variant="small">
            {localization.WhatIfTab.newPredictedValue}
          </Text>
          <Text variant="small">{predictedValueString}</Text>
        </div>
      </div>
    );
  }

  private setStartingK = (newValue: number): void => {
    this.setState({ startingK: newValue });
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
    this.props.cohorts[cohortIndex].sort(JointDataset.IndexLabel);
    this.rowOptions = this.props.cohorts[cohortIndex]
      .unwrap(JointDataset.IndexLabel)
      .map((index) => {
        return {
          key: index,
          text: localization.formatString(
            localization.WhatIfTab.rowLabel,
            index.toString()
          )
        };
      })
      .reverse();
  }

  private onFeatureSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ selectedFeatureKey: item.key as string });
  };

  private onICEClassSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ selectedICEClass: item.key as number });
  };

  private setSortIndex = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    const newIndex = item.key as number;
    const sortArray = ModelExplanationUtils.getSortIndices(
      this.includedFeatureImportance[newIndex].unsortedAggregateY
    ).reverse();
    this.setState({ sortingSeriesIndex: newIndex, sortArray });
  };

  private setWeightOption = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    const newIndex = item.key as WeightVectorOption;
    this.props.onWeightChange(newIndex);
  };

  private setSecondaryChart = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ secondaryChartChoice: item.key });
  };

  private setSelectedIndex = (
    _event: React.FormEvent,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setTemporaryPointToCopyOfDatasetPoint(item.key as number);
    }
  };

  private toggleCrossClassInfo = (): void => {
    this.setState({ crossClassInfoVisible: !this.state.crossClassInfoVisible });
  };

  private toggleICETooltip = (): void => {
    this.setState({ iceTooltipVisible: !this.state.iceTooltipVisible });
  };

  private setTemporaryPointToCopyOfDatasetPoint(index: number): void {
    this.temporaryPoint = this.props.jointDataset.getRow(index);
    this.temporaryPoint[WhatIfTab.namePath] = localization.formatString(
      localization.WhatIf.defaultCustomRootName,
      index
    );
    this.temporaryPoint[WhatIfTab.colorPath] =
      FabricStyles.fabricColorPalette[
        WhatIfTab.MAX_SELECTION + this.state.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      selectedWhatIfRootIndex: index,
      editingDataCustomIndex: undefined
    });
  }

  private setTemporaryPointToCustomPoint(index: number): void {
    this.temporaryPoint = _.cloneDeep(this.state.customPoints[index]);
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      selectedWhatIfRootIndex: this.temporaryPoint[JointDataset.IndexLabel],
      editingDataCustomIndex: index
    });
    this.openPanel();
  }

  private removeCustomPoint(index: number): void {
    this.setState((prevState) => {
      const customPoints = [...prevState.customPoints];
      customPoints.splice(index, 1);
      const customPointIsActive = [...prevState.customPointIsActive];
      customPointIsActive.splice(index, 1);
      return { customPoints, customPointIsActive };
    });
  }

  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    if (!this.temporaryPoint || !newValue) {
      return;
    }
    const editingData = this.temporaryPoint;
    this.stringifedValues[key] = newValue;
    if (isString) {
      editingData[key] = newValue;
      this.forceUpdate();
    } else {
      const asNumber = +newValue;
      // because " " evaluates to 0 in js
      const isWhitespaceOnly = /^\s*$/.test(newValue);
      if (Number.isNaN(asNumber) || isWhitespaceOnly) {
        this.validationErrors[key] = localization.WhatIfTab.nonNumericValue;
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
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string
  ): void => {
    if (!this.temporaryPoint || !value) {
      return;
    }
    const editingData = this.temporaryPoint;
    if (option) {
      // User selected/de-selected an existing option
      editingData[key] = option.key;
    } else if (value !== undefined) {
      // User typed a freeform option
      const featureOption = this.featuresOption.find(
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
      editingDataCustomIndex,
      customPoints,
      customPointIsActive
    });
  };

  private createCopyOfFirstRow(): void {
    const indexes = this.getDefaultSelectedPointIndexes(
      this.props.cohorts[this.state.selectedCohortIndex]
    );
    if (indexes.length === 0) {
      return undefined;
    }
    this.temporaryPoint = this.props.jointDataset.getRow(indexes[0]);
    this.temporaryPoint[WhatIfTab.namePath] = localization.formatString(
      localization.WhatIf.defaultCustomRootName,
      indexes[0]
    );
    this.temporaryPoint[WhatIfTab.colorPath] =
      FabricStyles.fabricColorPalette[
        WhatIfTab.MAX_SELECTION + this.state.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
  }

  private toggleActivation(index: number): void {
    const pointIsActive = [...this.state.pointIsActive];
    pointIsActive[index] = !pointIsActive[index];
    this.setState({ pointIsActive });
  }

  private toggleCustomActivation(index: number): void {
    const customPointIsActive = [...this.state.customPointIsActive];
    customPointIsActive[index] = !customPointIsActive[index];
    this.setState({ customPointIsActive });
  }

  private dismissPanel = (): void => {
    this.setState({ isPanelOpen: false });
    window.dispatchEvent(new Event("resize"));
  };

  private openPanel = (): void => {
    this.setState({ isPanelOpen: true });
    window.dispatchEvent(new Event("resize"));
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

  private filterFeatures = (
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    if (newValue === undefined || newValue === null || !/\S/.test(newValue)) {
      this.setState({ filteredFeatureList: this.featuresOption });
      return;
    }
    const filteredFeatureList = this.featuresOption.filter((item) => {
      return item.data.fullLabel.includes(newValue.toLowerCase());
    });
    this.setState({ filteredFeatureList });
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

  private toggleSelectionOfPoint(index?: number): void {
    if (index === undefined) {
      return;
    }
    const indexOf = this.state.selectedPointsIndexes.indexOf(index);
    const newSelections = [...this.state.selectedPointsIndexes];
    const pointIsActive = [...this.state.pointIsActive];
    if (indexOf === -1) {
      if (this.state.selectedPointsIndexes.length > WhatIfTab.MAX_SELECTION) {
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
      selectedPointsIndexes: newSelections,
      pointIsActive,
      showSelectionWarning: false
    });
  }

  // fetch prediction for temporary point
  private fetchData(fetchingReference: { [key: string]: any }): void {
    if (!this.props.invokeModel) {
      return;
    }
    if (this.state.request !== undefined) {
      this.state.request.abort();
    }
    const abortController = new AbortController();
    const rawData = JointDataset.datasetSlice(
      fetchingReference,
      this.props.jointDataset.metaDict,
      this.props.jointDataset.datasetFeatureCount
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
            fetchingReference[
              JointDataset.ProbabilityYRoot + i.toString()
            ] = element;
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
        if (this.props.jointDataset.hasTrueY) {
          JointDataset.setErrorMetrics(
            fetchingReference,
            this.props.metadata.modelType
          );
        }
        this.setState({ request: undefined });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        if (error.name === "PythonError") {
          alert(
            localization.formatString(
              localization.IcePlot.errorPrefix,
              error.message
            )
          );
        }
      }
    });
  }

  private generatePlotlyProps(
    jointData: JointDataset,
    chartProps: IGenericChartProps,
    cohort: Cohort
  ): IPlotlyProperty {
    const plotlyProps = _.cloneDeep(WhatIfTab.basePlotlyProperties);
    plotlyProps.data[0].hoverinfo = "all";
    const indexes = cohort.unwrap(JointDataset.IndexLabel);
    plotlyProps.data[0].type = chartProps.chartType;
    plotlyProps.data[0].mode = PlotlyMode.Markers;
    plotlyProps.data[0].marker = {
      symbol: indexes.map((i) =>
        this.state.selectedPointsIndexes.includes(i) ? "square" : "circle"
      ) as any,
      color: indexes.map((rowIndex) => {
        const selectionIndex = this.state.selectedPointsIndexes.indexOf(
          rowIndex
        );
        if (selectionIndex === -1) {
          return FabricStyles.fabricColorInactiveSeries;
        }
        return FabricStyles.fabricColorPalette[selectionIndex];
      }) as any,
      size: 8
    };

    plotlyProps.data[1] = {
      type: "scatter",
      mode: PlotlyMode.Markers,
      marker: {
        symbol: "star",
        size: 12,
        color: this.state.customPoints.map(
          (_, i) =>
            FabricStyles.fabricColorPalette[WhatIfTab.MAX_SELECTION + 1 + i]
        )
      }
    };

    plotlyProps.data[2] = {
      type: "scatter",
      mode: PlotlyMode.Markers,
      text: "Editable What-If point",
      hoverinfo: "text",
      marker: {
        opacity: 0.5,
        symbol: "star",
        size: 12,
        color: "rgba(0,0,0,0)",
        line: {
          color:
            FabricStyles.fabricColorPalette[
              WhatIfTab.MAX_SELECTION + 1 + this.state.customPoints.length
            ],
          width: 2
        }
      }
    };

    if (chartProps.xAxis) {
      if (jointData.metaDict[chartProps.xAxis.property].treatAsCategorical) {
        const xLabels =
          jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues;
        const xLabelIndexes = xLabels?.map((_, index) => index);
        _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
        _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
      }
    }
    if (chartProps.yAxis) {
      if (jointData.metaDict[chartProps.yAxis.property].treatAsCategorical) {
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
    dictionary: Array<{ [key: string]: number }>,
    chartProps: IGenericChartProps,
    trace: IData
  ): void {
    const customdata = JointDataset.unwrap(
      dictionary,
      JointDataset.IndexLabel
    ).map((val) => {
      const dict = {};
      dict[JointDataset.IndexLabel] = val;
      return dict;
    });
    let hovertemplate = "";
    if (chartProps.xAxis) {
      const metaX = this.props.jointDataset.metaDict[chartProps.xAxis.property];
      const rawX = JointDataset.unwrap(dictionary, chartProps.xAxis.property);
      hovertemplate += metaX.label + ": %{customdata.X}<br>";

      rawX.forEach((val, index) => {
        if (metaX.treatAsCategorical) {
          customdata[index]["X"] = metaX.sortedCategoricalValues?.[val];
        } else {
          customdata[index]["X"] = (val as number).toLocaleString(undefined, {
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
      const metaY = this.props.jointDataset.metaDict[chartProps.yAxis.property];
      const rawY = JointDataset.unwrap(dictionary, chartProps.yAxis.property);
      hovertemplate += metaY.label + ": %{customdata.Y}<br>";
      rawY.forEach((val, index) => {
        if (metaY.treatAsCategorical) {
          customdata[index]["Y"] = metaY.sortedCategoricalValues?.[val];
        } else {
          customdata[index]["Y"] = (val as number).toLocaleString(undefined, {
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
    hovertemplate += localization.Charts.rowIndex + ": %{customdata.Index}<br>";
    hovertemplate += "<extra></extra>";
    trace.customdata = customdata as any;
    trace.hovertemplate = hovertemplate;
  }

  private generateDefaultChartAxes(): void {
    const yKey = JointDataset.DataLabelRoot + "0";
    const yIsDithered = this.props.jointDataset.metaDict[yKey]
      .treatAsCategorical;
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Scatter,
      xAxis: {
        property: this.props.jointDataset.hasPredictedProbabilities
          ? JointDataset.ProbabilityYRoot + "0"
          : JointDataset.IndexLabel,
        options: {}
      },
      yAxis: {
        property: yKey,
        options: {
          dither: yIsDithered,
          bin: false
        }
      }
    };
    this.props.onChange(chartProps);
  }
}
