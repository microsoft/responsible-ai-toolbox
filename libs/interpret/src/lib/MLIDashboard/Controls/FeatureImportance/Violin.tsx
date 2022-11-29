// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  DefaultButton,
  IconButton,
  Callout,
  IDropdownOption,
  Slider
} from "@fluentui/react";
import {
  IExplanationContext,
  IsMulticlass,
  ModelTypes,
  ModelExplanationUtils,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ChartBuilder,
  AccessibleChart,
  IPlotlyProperty
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import memoize from "memoize-one";
import React from "react";

import {
  FeatureKeys,
  FeatureSortingKey
} from "../../SharedComponents/IBarChartConfig";
import { LoadingSpinner } from "../../SharedComponents/LoadingSpinner";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";

import { FeatureImportanceModes } from "./FeatureImportanceModes";
import { IGlobalFeatureImportanceProps } from "./FeatureImportanceWrapper";
import { violinStyles } from "./Violin.styles";

export enum GroupByOptions {
  None = "none",
  PredictedY = "predictedY",
  TrueY = "trueY"
}

export interface IViolinState {
  groupBy: GroupByOptions;
  selectedSorting: FeatureSortingKey;
  calloutContent?: React.ReactNode;
  calloutId?: string;
}

export class Violin extends React.PureComponent<
  IGlobalFeatureImportanceProps,
  IViolinState
> {
  private static maxFeatures = 30;
  private static maxDefaultSeries = 3;

  private static buildBoxPlotlyProps: (
    data: IExplanationContext,
    sortVector: number[],
    groupBy: GroupByOptions
  ) => IPlotlyProperty = memoize(
    (
      data: IExplanationContext,
      sortVector: number[],
      groupBy: GroupByOptions
    ): IPlotlyProperty => {
      const plotlyProps = _.cloneDeep(Violin.boxPlotlyProps);
      const classesArray = Violin.getClassesArray(data, groupBy);
      const mappedData =
        data.localExplanation?.flattenedValues?.map(
          (featureArray, rowIndex) => {
            return {
              class: data.modelMetadata.classNames[classesArray[rowIndex]],
              classIndex: classesArray[rowIndex],
              x: sortVector.map(
                (featureIndex) => data.modelMetadata.featureNames[featureIndex]
              ),
              y: sortVector.map((featureIndex) => featureArray[featureIndex])
            };
          }
        ) || [];
      const computedSeries = ChartBuilder.buildPlotlySeries(
        plotlyProps.data[0],
        mappedData
      );
      if (computedSeries.length === 1 && plotlyProps.layout) {
        plotlyProps.layout.showlegend = false;
      }
      plotlyProps.data = computedSeries;
      return plotlyProps;
    }
  );

  private static buildViolinPlotlyProps: (
    data: IExplanationContext,
    sortVector: number[],
    groupBy: GroupByOptions
  ) => IPlotlyProperty = memoize(
    (
      data: IExplanationContext,
      sortVector: number[],
      groupBy: GroupByOptions
    ): IPlotlyProperty => {
      const plotlyProps = _.cloneDeep(Violin.violinPlotlyProps);
      const classesArray = Violin.getClassesArray(data, groupBy);
      const featuresByRows = data.localExplanation?.flattenedValues
        ? ModelExplanationUtils.transpose2DArray(
            data.localExplanation.flattenedValues
          )
        : [];
      const computedSeries = sortVector
        .map((featureIndex) => {
          const baseSeries: any = _.cloneDeep(plotlyProps.data[0]);
          baseSeries.scalegroup = featureIndex.toString();
          // Only add a legend item for the first instance
          if (featureIndex !== 0) {
            baseSeries.showlegend = false;
          }
          const rowItems = featuresByRows[featureIndex].map(
            (value, rowIndex) => {
              return {
                class: data.modelMetadata.classNames[classesArray[rowIndex]],
                y: value
              };
            }
          );
          baseSeries.x0 = data.modelMetadata.featureNames[featureIndex];
          baseSeries.alignmentgroup = featureIndex;
          const series = ChartBuilder.buildPlotlySeries(baseSeries, rowItems);
          series.forEach((singleSeries: any) => {
            const className = singleSeries.name;
            let classIndex = data.modelMetadata.classNames.indexOf(className);
            if (classIndex === -1) {
              classIndex = 0;
            }
            singleSeries.legendgroup = className;
            singleSeries.alignmentgroup = featureIndex;
            singleSeries.offsetgroup = className;
            singleSeries.line = {
              color:
                FluentUIStyles.plotlyColorPalette[
                  classIndex % FluentUIStyles.plotlyColorPalette.length
                ]
            };
            if (classIndex >= Violin.maxDefaultSeries) {
              singleSeries.visible = "legendonly";
            }
          });
          return series;
        })
        .reduce((prev, curr) => {
          prev.push(...curr);
          return prev;
        }, []);
      computedSeries.sort((a, b) => {
        return (
          (a.name ? data.modelMetadata.classNames.indexOf(a.name) : 0) -
          (b.name ? data.modelMetadata.classNames.indexOf(b.name) : 0)
        );
      });
      plotlyProps.data = computedSeries;
      // a single series, no need for a legend
      if (computedSeries.length === sortVector.length && plotlyProps.layout) {
        plotlyProps.layout.showlegend = false;
      }
      return plotlyProps;
    }
  );

  private static getClassesArray: (
    data: IExplanationContext,
    groupBy: GroupByOptions
  ) => number[] = memoize(
    (data: IExplanationContext, groupBy: GroupByOptions): number[] => {
      switch (groupBy) {
        case GroupByOptions.PredictedY: {
          return data.testDataset.predictedY || [];
        }
        case GroupByOptions.TrueY: {
          return data.testDataset.trueY || [];
        }
        case GroupByOptions.None:
        default:
          return new Array(data.localExplanation?.values.length).fill(0);
      }
    }
  );

  private static violinPlotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      displayModeBar: false,
      responsive: true
    } as any,
    data: [
      {
        box: {
          visible: true
        },
        groupBy: "class",
        hoveron: "points+kde",
        meanline: {
          visible: true
        },
        scalemode: "count",
        span: [0],
        spanmode: "hard",
        type: "violin" as any,
        yAccessor: "y"
      }
    ] as any[],
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      legend: {
        tracegroupgap: 0
      },
      margin: {
        b: 30,
        t: 10
      },
      showlegend: true,
      violingap: 40,
      violingroupgap: 0,
      violinmode: "group",
      xaxis: {
        automargin: true
      },
      yaxis: {
        automargin: true,
        title: localization.Interpret.featureImportance
      }
    } as any
  };

  private static boxPlotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      displayModeBar: false,
      responsive: true
    } as any,
    data: [
      {
        boxmean: "sd",
        boxpoints: "Outliers",
        groupBy: "class",
        type: "box" as any,
        xAccessor: "x",
        xAccessorPrefix: "sort_by(@, &classIndex)",
        yAccessor: "y"
      }
    ] as any[],
    layout: {
      autosize: true,
      boxmode: "group",
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        b: 30,
        t: 10
      },
      showlegend: true,
      xaxis: {
        automargin: true
      },
      yaxis: {
        automargin: true,
        title: localization.Interpret.featureImportance
      }
    } as any
  };

  private groupByOptions: IDropdownOption[];
  private readonly _crossClassIconId = "cross-class-icon-id";
  private readonly _globalSortIconId = "global-sort-icon-id";

  public constructor(props: IGlobalFeatureImportanceProps) {
    super(props);
    this.groupByOptions = this.buildGroupOptions();
    this.state = {
      groupBy:
        props.dashboardContext.explanationContext.modelMetadata.modelType ===
          ModelTypes.Regression ||
        props.dashboardContext.explanationContext.testDataset.predictedY ===
          undefined
          ? GroupByOptions.None
          : GroupByOptions.PredictedY,
      selectedSorting: FeatureKeys.AbsoluteGlobal
    };
  }

  public render(): React.ReactNode {
    if (
      this.props.dashboardContext.explanationContext.testDataset !==
        undefined &&
      this.props.dashboardContext.explanationContext.localExplanation !==
        undefined &&
      this.props.dashboardContext.explanationContext.localExplanation.values !==
        undefined
    ) {
      const sortVector = this.getSortVector()
        .slice(-1 * Violin.maxFeatures)
        .reverse();

      const plotlyProps =
        this.props.config.displayMode === FeatureImportanceModes.Violin
          ? Violin.buildViolinPlotlyProps(
              this.props.dashboardContext.explanationContext,
              sortVector,
              this.state.groupBy
            )
          : Violin.buildBoxPlotlyProps(
              this.props.dashboardContext.explanationContext,
              sortVector,
              this.state.groupBy
            );
      const weightContext = this.props.dashboardContext.weightContext;
      const relayoutArg = {
        "xaxis.range": [-0.5, this.props.config.topK - 0.5]
      };
      _.set(plotlyProps, "layout.xaxis.range", [
        -0.5,
        this.props.config.topK - 0.5
      ]);
      const modelMetadata =
        this.props.dashboardContext.explanationContext.modelMetadata;
      return (
        <div className={violinStyles.aggregateChart}>
          <div className={violinStyles.topControls}>
            <ComboBox
              label={localization.Interpret.FeatureImportanceWrapper.chartType}
              className={violinStyles.pathSelector}
              selectedKey={this.props.config.displayMode}
              onChange={this.setChart}
              options={this.props.chartTypeOptions || []}
              ariaLabel={"chart type picker"}
              useComboBoxAsMenuWidth
              styles={FluentUIStyles.smallDropdownStyle}
            />
            {modelMetadata.modelType !== ModelTypes.Regression &&
              this.groupByOptions.length > 1 && (
                <ComboBox
                  label={localization.Interpret.Violin.groupBy}
                  className={violinStyles.pathSelector}
                  selectedKey={this.state.groupBy}
                  onChange={this.onGroupSelect}
                  options={this.groupByOptions}
                  ariaLabel={"chart type picker"}
                  useComboBoxAsMenuWidth
                  styles={FluentUIStyles.smallDropdownStyle}
                />
              )}
            <div className={violinStyles.sliderControl}>
              <div className={violinStyles.sliderLabel}>
                <span className={violinStyles.labelText}>
                  {localization.Interpret.AggregateImportance.topKFeatures}
                </span>
                <IconButton
                  id={this._globalSortIconId}
                  iconProps={{ iconName: "Info" }}
                  title={localization.Interpret.CrossClass.info}
                  ariaLabel="Info"
                  onClick={this.showGlobalSortInfo}
                  styles={{
                    root: { color: "rgb(0, 120, 212)", marginBottom: -3 }
                  }}
                />
              </div>
              <Slider
                className={violinStyles.featureSlider}
                max={Math.min(
                  Violin.maxFeatures,
                  modelMetadata.featureNames.length
                )}
                min={1}
                step={1}
                value={this.props.config.topK}
                onChange={this.setTopK}
                showValue
              />
            </div>
            {IsMulticlass(modelMetadata.modelType) && (
              <div>
                <div className={violinStyles.selectorLabel}>
                  <span className={violinStyles.selectorSpan}>
                    {localization.Interpret.CrossClass.label}
                  </span>
                  <IconButton
                    id={this._crossClassIconId}
                    iconProps={{ iconName: "Info" }}
                    title={localization.Interpret.CrossClass.info}
                    ariaLabel="Info"
                    onClick={this.showCrossClassInfo}
                    styles={{
                      root: { color: "rgb(0, 120, 212)", marginBottom: -3 }
                    }}
                  />
                </div>
                <ComboBox
                  className={violinStyles.pathSelector}
                  selectedKey={weightContext.selectedKey}
                  onChange={weightContext.onSelection}
                  options={weightContext.options}
                  ariaLabel={"Cross-class weighting selector"}
                  useComboBoxAsMenuWidth
                  styles={FluentUIStyles.smallDropdownStyle}
                />
              </div>
            )}
          </div>
          {this.state.calloutContent && (
            <Callout
              target={`#${this.state.calloutId}`}
              setInitialFocus
              onDismiss={this.onDismiss}
              role="alertdialog"
            >
              <div className={violinStyles.calloutInfo}>
                {this.state.calloutContent}
                <DefaultButton
                  className={violinStyles.calloutButton}
                  onClick={this.onDismiss}
                >
                  {localization.Interpret.CrossClass.close}
                </DefaultButton>
              </div>
            </Callout>
          )}
          <AccessibleChart
            plotlyProps={plotlyProps}
            theme={this.props.theme}
            relayoutArg={relayoutArg as any}
          />
        </div>
      );
    }
    if (
      this.props.dashboardContext.explanationContext.localExplanation &&
      this.props.dashboardContext.explanationContext.localExplanation
        .percentComplete !== undefined
    ) {
      return <LoadingSpinner />;
    }

    const explanationStrings = this.props.messages
      ? this.props.messages.LocalExpAndTestReq
      : undefined;
    return <NoDataMessage explanationStrings={explanationStrings} />;
  }

  private getSortVector(): number[] {
    if (this.state.selectedSorting === FeatureKeys.AbsoluteGlobal) {
      return this.props.dashboardContext.explanationContext.globalExplanation
        ?.perClassFeatureImportances
        ? ModelExplanationUtils.buildSortedVector(
            this.props.dashboardContext.explanationContext.globalExplanation
              .perClassFeatureImportances
          )
        : [];
    }
    if (this.state.groupBy === GroupByOptions.None) {
      return this.props.dashboardContext.explanationContext.localExplanation
        ?.flattenedValues
        ? ModelExplanationUtils.buildSortedVector(
            this.props.dashboardContext.explanationContext.localExplanation
              .flattenedValues
          )
        : [];
    }
    const classLabels = Violin.getClassesArray(
      this.props.dashboardContext.explanationContext,
      this.state.groupBy
    );
    const importanceSums =
      this.props.dashboardContext.explanationContext.localExplanation?.flattenedValues
        ?.filter((_, index) => {
          return classLabels[index] === this.state.selectedSorting;
        })
        .reduce((prev: number[], current: number[]) => {
          return prev.map((featureImp, featureIndex) => {
            return featureImp + current[featureIndex];
          });
        }, new Array(this.props.dashboardContext.explanationContext.modelMetadata.featureNames.length).fill(0));
    return ModelExplanationUtils.getSortIndices(importanceSums || []);
  }

  private buildGroupOptions(): IDropdownOption[] {
    if (
      this.props.dashboardContext.explanationContext.modelMetadata.modelType ===
      ModelTypes.Regression
    ) {
      return [];
    }
    const result: IDropdownOption[] = [
      {
        key: GroupByOptions.None,
        text: localization.Interpret.Violin.groupNone
      }
    ];
    if (
      this.props.dashboardContext.explanationContext.testDataset &&
      this.props.dashboardContext.explanationContext.testDataset.predictedY !==
        undefined
    ) {
      result.push({
        key: GroupByOptions.PredictedY,
        text: localization.Interpret.Violin.groupPredicted
      });
    }
    if (
      this.props.dashboardContext.explanationContext.testDataset &&
      this.props.dashboardContext.explanationContext.testDataset.trueY !==
        undefined
    ) {
      result.push({
        key: GroupByOptions.TrueY,
        text: localization.Interpret.Violin.groupTrue
      });
    }
    return result;
  }

  private setChart = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!item) {
      return;
    }
    const newConfig = _.cloneDeep(this.props.config);
    newConfig.displayMode = item.key as any;
    this.props.onChange(newConfig, this.props.config.id);
  };

  private setTopK = (newValue: number): void => {
    const newConfig = _.cloneDeep(this.props.config);
    newConfig.topK = newValue;
    this.props.onChange(newConfig, this.props.config.id);
  };

  private showCrossClassInfo = (): void => {
    if (this.state.calloutContent) {
      this.onDismiss();
    } else {
      const calloutContent = (
        <div>
          <span>{localization.Interpret.CrossClass.overviewInfo}</span>
          <ul>
            <li>{localization.Interpret.CrossClass.absoluteValInfo}</li>
            <li>{localization.Interpret.CrossClass.predictedClassInfo}</li>
            <li>{localization.Interpret.CrossClass.enumeratedClassInfo}</li>
          </ul>
        </div>
      );
      this.setState({ calloutContent, calloutId: this._crossClassIconId });
    }
  };

  private showGlobalSortInfo = (): void => {
    if (this.state.calloutContent) {
      this.onDismiss();
    } else {
      const calloutContent = (
        <div>
          <span>
            {
              localization.Interpret.FeatureImportanceWrapper
                .globalImportanceExplanation
            }
          </span>
          {IsMulticlass(
            this.props.dashboardContext.explanationContext.modelMetadata
              .modelType
          ) && (
            <span>
              {
                localization.Interpret.FeatureImportanceWrapper
                  .multiclassImportanceAddendum
              }
            </span>
          )}
        </div>
      );
      this.setState({ calloutContent, calloutId: this._globalSortIconId });
    }
  };

  private onDismiss = (): void => {
    this.setState({ calloutContent: undefined, calloutId: undefined });
  };

  // private onSortSelect(_event: React.FormEvent<IComboBox>, item: IComboBoxOption): void {
  //     this.setState({ selectedSorting: item.key as any });
  // }

  private onGroupSelect = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!item) {
      return;
    }
    this.setState({ groupBy: item.key as any });
  };
}
