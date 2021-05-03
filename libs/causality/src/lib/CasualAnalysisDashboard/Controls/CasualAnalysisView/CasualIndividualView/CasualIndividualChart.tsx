// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  AxisConfigDialog,
  ColumnCategories,
  JointDataset,
  Cohort,
  ModelExplanationUtils,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FabricStyles,
  InteractiveLegend,
  rowErrorSize
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IPlotlyProperty,
  PlotlyMode,
  IData
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  Text,
  DefaultButton,
  IDropdownOption
} from "office-ui-fabric-react";
import React from "react";

import { casualIndividualChartStyles } from "./CasualIndividualChartStyles";
import { CasualIndivisualConstants } from "./CasualIndivisualConstants";
import { IGlobalSeries } from "./IGlobalSeries";

export interface ICasualIndividualChartProps {
  test?: boolean;
}

export interface ICasualIndividualChartState {
  chartProps?: IGenericChartProps;
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
  topK: number;
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  selectedFeatureKey: string;
  crossClassInfoVisible: boolean;
  iceTooltipVisible: boolean;
}

export class CasualIndividualChart extends React.PureComponent<
  ICasualIndividualChartProps,
  ICasualIndividualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "CasualIndividualChart";

  private selectedFeatureImportance: IGlobalSeries[] = [];
  private validationErrors: { [key: string]: string | undefined } = {};
  private stringifiedValues: { [key: string]: string } = {};
  private temporaryPoint: { [key: string]: any } | undefined;

  public constructor(props: ICasualIndividualChartProps) {
    super(props);

    this.state = {
      crossClassInfoVisible: false,
      customPointIsActive: [],
      customPoints: [],
      editingDataCustomIndex: undefined,
      featuresOption: [],
      filteredFeatureList: [],
      iceTooltipVisible: false,
      pointIsActive: [],
      request: undefined,
      selectedCohortIndex: 0,
      selectedFeatureKey: JointDataset.DataLabelRoot + "0",
      selectedPointsIndexes: [],
      selectedWhatIfRootIndex: 0,
      showSelectionWarning: false,
      sortArray: [],
      sortingSeriesIndex: undefined,
      topK: 4,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount() {
    this.createCopyOfFirstRow();
    this.buildRowOptions(0);

    const featuresOption = new Array(
      this.context.jointDataset.datasetFeatureCount
    )
      .fill(0)
      .map((_, index) => {
        const key = JointDataset.DataLabelRoot + index.toString();
        const meta = this.context.jointDataset.metaDict[key];
        const options = meta.isCategorical
          ? meta.sortedCategoricalValues?.map((optionText, index) => {
              return { key: index, text: optionText };
            })
          : undefined;
        return {
          data: {
            categoricalOptions: options,
            fullLabel: meta.label.toLowerCase()
          },
          key,
          text: meta.abbridgedLabel
        };
      });

    this.setState({
      chartProps: this.generateDefaultChartAxes(),
      featuresOption,
      filteredFeatureList: featuresOption
    });
  }

  public componentDidUpdate(
    prevProps: ICasualIndividualChartProps,
    prevState: ICasualIndividualChartState
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
    if (!selectionsAreEqual) {
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
      !customActivePointsAreEqual
    ) {
      this.forceUpdate();
    }
    this.setState({ sortArray, sortingSeriesIndex });
  }

  public render(): React.ReactNode {
    const classNames = casualIndividualChartStyles();
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
    const cohortLength = this.context.errorCohorts[
      this.state.selectedCohortIndex
    ].cohort.filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      this.state.chartProps.chartType !== ChartTypes.Scatter;
    return (
      <div className={classNames.page}>
        <div className={classNames.mainArea}>
          <div className={classNames.chartsArea}>
            <div
              className={classNames.topArea}
              id={"CasualIndividualContainer"}
            >
              <div
                className={classNames.chartWithAxes}
                id={this.chartAndConfigsId}
              >
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
                    onAccept={this.onXSet}
                    onCancel={this.setXOpen.bind(this, false)}
                  />
                )}
                <div className={classNames.chartWithVertical}>
                  <div className={classNames.verticalAxis}>
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
                          color: FabricStyles.fabricColorPalette[rowIndex],
                          name: row.name,
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
                    {localization.CasualAnalysis.IndividualChart.selectionLimit}
                  </Text>
                )}
                {this.selectedFeatureImportance.length === 0 && (
                  <Text variant={"xSmall"} className={classNames.smallItalic}>
                    {localization.Interpret.WhatIfTab.noneSelectedYet}
                  </Text>
                )}
                {this.state.customPoints.length > 0 && (
                  <InteractiveLegend
                    items={this.state.customPoints.map((row, rowIndex) => {
                      return {
                        activated: this.state.customPointIsActive[rowIndex],
                        color:
                          FabricStyles.fabricColorPalette[
                            rowIndex + CasualIndivisualConstants.MAX_SELECTION + 1
                          ],
                        name: row[CasualIndivisualConstants.namePath],
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
                    {localization.Interpret.WhatIfTab.noneCreatedYet}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private getDefaultSelectedPointIndexes(cohort: Cohort): number[] {
    const indexes = cohort.unwrap(JointDataset.IndexLabel);
    if (indexes.length > 0) {
      return [indexes[0]];
    }
    return [];
  }


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


  private setTemporaryPointToCopyOfDatasetPoint(index: number): void {
    this.temporaryPoint = this.context.jointDataset.getRow(index);
    this.temporaryPoint[CasualIndivisualConstants.namePath] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      index
    );
    this.temporaryPoint[CasualIndivisualConstants.colorPath] =
      FabricStyles.fabricColorPalette[
        CasualIndivisualConstants.MAX_SELECTION + this.state.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifiedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      editingDataCustomIndex: undefined,
      selectedWhatIfRootIndex: index
    });
  }

  private setTemporaryPointToCustomPoint(index: number): void {
    this.temporaryPoint = _.cloneDeep(this.state.customPoints[index]);
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifiedValues[key] = this.temporaryPoint?.[key].toString();
      this.validationErrors[key] = undefined;
    });
    this.setState({
      editingDataCustomIndex: index,
      selectedWhatIfRootIndex: this.temporaryPoint[JointDataset.IndexLabel]
    });
  }

  private removeCustomPoint(index: number): void {
    this.setState((prevState) => {
      const customPoints = [...prevState.customPoints];
      customPoints.splice(index, 1);
      const customPointIsActive = [...prevState.customPointIsActive];
      customPointIsActive.splice(index, 1);
      return { customPointIsActive, customPoints };
    });
  }

  private createCopyOfFirstRow(): void {
    const indexes = this.getDefaultSelectedPointIndexes(
      this.context.errorCohorts[this.state.selectedCohortIndex].cohort
    );
    if (indexes.length === 0) {
      return undefined;
    }
    this.temporaryPoint = this.context.jointDataset.getRow(indexes[0]);
    this.temporaryPoint[CasualIndivisualConstants.namePath] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      indexes[0]
    );
    this.temporaryPoint[CasualIndivisualConstants.colorPath] =
      FabricStyles.fabricColorPalette[
        CasualIndivisualConstants.MAX_SELECTION + this.state.customPoints.length
      ];
    Object.keys(this.temporaryPoint).forEach((key) => {
      this.stringifiedValues[key] = this.temporaryPoint?.[key].toString();
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
      if (
        this.state.selectedPointsIndexes.length > CasualIndivisualConstants.MAX_SELECTION
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
  }

  private generatePlotlyProps(
    jointData: JointDataset,
    chartProps: IGenericChartProps,
    cohort: Cohort
  ): IPlotlyProperty {
    const plotlyProps = _.cloneDeep(CasualIndivisualConstants.basePlotlyProperties);
    plotlyProps.data[0].hoverinfo = "all";
    const indexes = cohort.unwrap(JointDataset.IndexLabel);
    plotlyProps.data[0].type = chartProps.chartType;
    plotlyProps.data[0].mode = PlotlyMode.Markers;
    plotlyProps.data[0].marker = {
      color: indexes.map((rowIndex) => {
        const selectionIndex = this.state.selectedPointsIndexes.indexOf(
          rowIndex
        );
        if (selectionIndex === -1) {
          return FabricStyles.fabricColorInactiveSeries;
        }
        return FabricStyles.fabricColorPalette[selectionIndex];
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
            FabricStyles.fabricColorPalette[
              CasualIndivisualConstants.MAX_SELECTION + 1 + i
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
            FabricStyles.fabricColorPalette[
              CasualIndivisualConstants.MAX_SELECTION + 1 + this.state.customPoints.length
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
      const metaX = this.context.jointDataset.metaDict[
        chartProps.xAxis.property
      ];
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
      const metaY = this.context.jointDataset.metaDict[
        chartProps.yAxis.property
      ];
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
    hovertemplate +=
      localization.Interpret.Charts.rowIndex + ": %{customdata.Index}<br>";
    hovertemplate += "<extra></extra>";
    trace.customdata = customdata as any;
    trace.hovertemplate = hovertemplate;
  }

  private generateDefaultChartAxes(): IGenericChartProps | undefined {
    const yKey = JointDataset.DataLabelRoot + "0";
    const yIsDithered = this.context.jointDataset.metaDict[yKey]
      .treatAsCategorical;
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Scatter,
      xAxis: {
        options: {},
        property: this.context.jointDataset.hasPredictedProbabilities
          ? JointDataset.ProbabilityYRoot + "0"
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
