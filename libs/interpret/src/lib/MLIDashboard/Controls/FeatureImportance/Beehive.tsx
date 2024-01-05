// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  DefaultButton,
  IconButton,
  Callout,
  Slider
} from "@fluentui/react";
import {
  IExplanationContext,
  IsBinary,
  IsMulticlass,
  ModelTypes,
  ModelExplanationUtils,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ChartBuilder,
  AccessibleChart,
  PlotlyMode,
  IPlotlyProperty
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import memoize from "memoize-one";
import Plotly, { PlotMarker } from "plotly.js";
import React from "react";

import { LoadingSpinner } from "../../SharedComponents/LoadingSpinner";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";
import { PlotlyUtils } from "../../SharedComponents/PlotlyUtils";
import { ScatterUtils } from "../Scatter/ScatterUtils";

import { beehiveStyles } from "./Beehive.styles";
import { FeatureImportanceModes } from "./FeatureImportanceModes";
import { IGlobalFeatureImportanceProps } from "./FeatureImportanceWrapper";

export interface IBeehiveState {
  calloutContent?: React.ReactNode;
  calloutId?: string;
  selectedColorOption?: string;
  plotlyProps: IPlotlyProperty | undefined;
}

interface IProjectedData {
  rowIndex: string;
  normalizedFeatureValue: number | undefined;
  featureIndex: number;
  ditheredFeatureIndex: number;
  featureImportance: number;
  predictedClass?: string | number;
  predictedClassIndex?: number;
  trueClass?: string | number;
  trueClassIndex?: number;
  tooltip: string;
}

export class Beehive extends React.PureComponent<
  IGlobalFeatureImportanceProps,
  IBeehiveState
> {
  // To present all colors on a uniform color scale, the min and max of each feature are calculated
  // once per dataset and
  private static populateMappers: (
    data: IExplanationContext
  ) => Array<(value: number | string) => number> = memoize(
    (data: IExplanationContext): Array<(value: number | string) => number> => {
      return data.modelMetadata.featureNames.map((_val, featureIndex) => {
        if (data.modelMetadata.featureIsCategorical?.[featureIndex]) {
          const values = _.uniq(
            data.testDataset.dataset?.map((row) => row[featureIndex])
          ).sort();
          return (value: string | number): number => {
            return values.length > 1
              ? values.indexOf(value) / (values.length - 1)
              : 0;
          };
        }
        const featureArray =
          data.testDataset.dataset?.map((row: number[]) => row[featureIndex]) ||
          [];
        const min = _.min(featureArray) || 0;
        const max = _.max(featureArray) || 0;
        const range = max - min;
        return (value: string | number): number => {
          return range !== 0 && typeof value === "number"
            ? (value - min) / range
            : 0;
        };
      });
    }
  );

  private static BasePlotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      displayModeBar: false,
      responsive: true
    },
    data: [
      {
        datapointLevelAccessors: {
          customdata: {
            path: ["rowIndex"],
            plotlyPath: "customdata"
          },
          text: {
            path: ["tooltip"],
            plotlyPath: "text"
          }
        },
        hoverinfo: "text",
        mode: PlotlyMode.Markers,
        type: "scattergl",
        xAccessor: "ditheredFeatureIndex",
        yAccessor: "featureImportance"
      }
    ],
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        b: 30,
        t: 10
      },
      showlegend: false,
      xaxis: {
        automargin: true
      },
      yaxis: {
        automargin: true,
        title: localization.Interpret.featureImportance
      }
    }
  };
  private static maxFeatures = 30;

  private static generateSortVector: (data: IExplanationContext) => number[] =
    memoize((data: IExplanationContext): number[] => {
      return data.globalExplanation?.perClassFeatureImportances
        ? ModelExplanationUtils.buildSortedVector(
            data.globalExplanation.perClassFeatureImportances
          )
        : [];
    });

  private static projectData: (
    data: IExplanationContext,
    sortVector: number[]
  ) => IProjectedData[] = memoize(
    (data: IExplanationContext, sortVector: number[]): IProjectedData[] => {
      const mappers: Array<(value: string | number) => number> | undefined =
        data.testDataset.dataset !== undefined
          ? Beehive.populateMappers(data)
          : undefined;
      const isClassifier =
        data.modelMetadata.modelType !== ModelTypes.Regression;
      return sortVector
        .map((featureIndex, sortVectorIndex) => {
          return (
            data.localExplanation?.flattenedValues?.map((row, rowIndex) => {
              const predictedClassIndex = data.testDataset.predictedY
                ? data.testDataset.predictedY[rowIndex]
                : undefined;
              const predictedClass = Beehive.getPredictedClass(
                data,
                isClassifier,
                predictedClassIndex
              );
              const trueClassIndex = data.testDataset.trueY
                ? data.testDataset.trueY[rowIndex]
                : undefined;
              const trueClass = Beehive.getTrueClass(
                data,
                isClassifier,
                trueClassIndex
              );
              return {
                ditheredFeatureIndex:
                  sortVectorIndex + (0.2 * Math.random() - 0.1),
                featureImportance: row[featureIndex],
                featureIndex: sortVectorIndex,
                normalizedFeatureValue:
                  mappers !== undefined &&
                  data.testDataset.dataset?.[rowIndex][featureIndex]
                    ? mappers[featureIndex](
                        data.testDataset.dataset[rowIndex][featureIndex]
                      )
                    : undefined,
                predictedClass,
                predictedClassIndex,
                rowIndex: rowIndex.toString(),
                tooltip: Beehive.buildTooltip(data, rowIndex, featureIndex),
                trueClass,
                trueClassIndex
              };
            }) || []
          );
        })
        .reduce((prev, curr) => {
          prev.push(...curr);
          return prev;
        }, []);
    }
  );

  private static buildPlotlyProps: (
    explanationContext: IExplanationContext,
    sortVector: number[],
    selectedOption: IComboBoxOption | undefined
  ) => IPlotlyProperty = memoize(
    (
      explanationContext: IExplanationContext,
      sortVector: number[],
      selectedOption: IComboBoxOption | undefined
    ): IPlotlyProperty => {
      const plotlyProps = _.cloneDeep(Beehive.BasePlotlyProps);
      const rows = Beehive.projectData(explanationContext, sortVector);
      _.set(
        plotlyProps,
        "layout.xaxis.ticktext",
        sortVector.map(
          (i) => explanationContext.modelMetadata.featureNamesAbridged[i]
        )
      );
      _.set(
        plotlyProps,
        "layout.xaxis.tickvals",
        sortVector.map((_, index) => index)
      );
      if (IsBinary(explanationContext.modelMetadata.modelType)) {
        _.set(
          plotlyProps,
          "layout.yaxis.title",
          `${localization.Interpret.featureImportance}<br> ${localization.Interpret.ExplanationScatter.class} ${explanationContext.modelMetadata.classNames[0]}`
        );
      }
      if (selectedOption === undefined || selectedOption.key === "none") {
        PlotlyUtils.clearColorProperties(plotlyProps);
      } else {
        PlotlyUtils.setColorProperty(
          plotlyProps,
          selectedOption,
          explanationContext.modelMetadata,
          selectedOption.text
        );
        if (selectedOption.data.isNormalized && plotlyProps.data[0].marker) {
          (plotlyProps.data[0].marker as Partial<PlotMarker>).colorscale = [
            [0, "rgba(0,0,255,0.5)"],
            [1, "rgba(255,0,0,0.5)"]
          ];
          _.set(plotlyProps.data[0], "marker.colorbar.tickvals", [0, 1]);
          _.set(plotlyProps.data[0], "marker.colorbar.ticktext", [
            localization.Interpret.AggregateImportance.low,
            localization.Interpret.AggregateImportance.high
          ]);
        } else {
          _.set(plotlyProps.data[0], "marker.opacity", 0.6);
        }
      }
      plotlyProps.data = ChartBuilder.buildPlotlySeries(
        plotlyProps.data[0],
        rows
      );
      return plotlyProps;
    }
  );

  private readonly _crossClassIconId = "cross-class-icon-id";
  private readonly _globalSortIconId = "global-sort-icon-id";
  private colorOptions: IComboBoxOption[];
  private rowCount: number;

  public constructor(props: IGlobalFeatureImportanceProps) {
    super(props);
    this.colorOptions = this.buildColorOptions();
    this.rowCount =
      this.props.dashboardContext.explanationContext.localExplanation
        ?.flattenedValues?.length || 0;
    const selectedColorIndex =
      this.colorOptions.length > 1 && this.rowCount < 500 ? 1 : 0;
    this.state = {
      plotlyProps: undefined,
      selectedColorOption: this.colorOptions[selectedColorIndex].key as string
    };
  }

  private static getTrueClass(
    data: IExplanationContext,
    isClassifier: boolean,
    trueClassIndex: number | undefined
  ): string | number | undefined {
    if (data.testDataset.trueY) {
      if (isClassifier && trueClassIndex !== undefined) {
        return (
          data.modelMetadata.classNames[trueClassIndex] ||
          `class ${trueClassIndex}`
        );
      }
      return trueClassIndex;
    }
    return undefined;
  }

  private static getPredictedClass(
    data: IExplanationContext,
    isClassifier: boolean,
    predictedClassIndex: number | undefined
  ): string | number | undefined {
    if (data.testDataset.predictedY) {
      if (isClassifier && predictedClassIndex !== undefined) {
        return (
          data.modelMetadata.classNames[predictedClassIndex] ||
          `class ${predictedClassIndex}`
        );
      }
      return predictedClassIndex;
    }
    return undefined;
  }

  private static getFormattedImportance(
    data: IExplanationContext,
    rowIndex: number,
    featureIndex: number
  ): string | number {
    if (!data.localExplanation?.flattenedValues) {
      return "";
    }
    if ((data.localExplanation?.flattenedValues?.length || 0) > 500) {
      return data.localExplanation.flattenedValues[rowIndex][featureIndex];
    }
    return data.localExplanation.flattenedValues[rowIndex][
      featureIndex
    ].toLocaleString(undefined, {
      minimumFractionDigits: 3
    });
  }

  private static buildTooltip(
    data: IExplanationContext,
    rowIndex: number,
    featureIndex: number
  ): string {
    const result = [];
    // The formatString imputes are keys to loc object. This is because format string tries to use them as keys first, and only uses the passed in string after
    // trowing an exception in a try block. This is very slow for repeated calls.
    result.push(
      localization.formatString(
        "AggregateImportance.featureLabel",
        data.modelMetadata.featureNames[featureIndex]
      )
    );
    if (data.testDataset.dataset) {
      result.push(
        localization.formatString(
          "AggregateImportance.valueLabel",
          data.testDataset.dataset[rowIndex][featureIndex]
        )
      );
    }
    // formatting strings is slow, only do for small numbers
    const formattedImportance = Beehive.getFormattedImportance(
      data,
      rowIndex,
      featureIndex
    );
    result.push(
      localization.formatString(
        "AggregateImportance.importanceLabel",
        formattedImportance
      )
    );
    if (data.modelMetadata.modelType === ModelTypes.Regression) {
      if (data.testDataset.predictedY) {
        result.push(
          localization.formatString(
            "AggregateImportance.predictedOutputTooltip",
            data.testDataset.predictedY[rowIndex]
          )
        );
      }
      if (data.testDataset.trueY) {
        result.push(
          localization.formatString(
            "AggregateImportance.trueOutputTooltip",
            data.testDataset.trueY[rowIndex]
          )
        );
      }
    } else {
      if (data.testDataset.predictedY) {
        const classIndex = data.testDataset.predictedY[rowIndex];
        const className =
          data.modelMetadata.classNames[classIndex] || "unknown class";
        result.push(
          localization.formatString(
            "AggregateImportance.predictedClassTooltip",
            className
          )
        );
      }
      if (data.testDataset.trueY) {
        const classIndex = data.testDataset.trueY[rowIndex];
        const className =
          data.modelMetadata.classNames[classIndex] || "unknown class";
        result.push(
          localization.formatString(
            "AggregateImportance.trueClassTooltip",
            className
          )
        );
      }
    }
    return result.join("<br>");
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
      if (this.rowCount > 10000) {
        return (
          <NoDataMessage
            explanationStrings={[
              {
                displayText:
                  localization.Interpret.AggregateImportance.tooManyRows,
                format: "text"
              }
            ]}
          />
        );
      }
      if (this.state.plotlyProps === undefined) {
        this.loadProps();
        return <LoadingSpinner />;
      }
      let plotlyProps = this.state.plotlyProps;
      const weightContext = this.props.dashboardContext.weightContext;
      const relayoutArg: Partial<Plotly.Layout> = {
        "xaxis.range": [-0.5, this.props.config.topK - 0.5]
      };
      _.set(plotlyProps, "layout.xaxis.range", [
        -0.5,
        this.props.config.topK - 0.5
      ]);
      plotlyProps = ScatterUtils.updatePropsForSelections(
        plotlyProps,
        this.props.selectedRow
      );
      const modelMetadata =
        this.props.dashboardContext.explanationContext.modelMetadata;
      return (
        <div className={beehiveStyles.aggregateChart}>
          <div className={beehiveStyles.topControls}>
            <ComboBox
              label={localization.Interpret.FeatureImportanceWrapper.chartType}
              className={beehiveStyles.pathSelector}
              selectedKey={FeatureImportanceModes.Beehive}
              onChange={this.setChart}
              options={this.props.chartTypeOptions || []}
              ariaLabel={"chart type picker"}
              useComboBoxAsMenuWidth
              styles={FluentUIStyles.smallDropdownStyle}
            />
            {this.colorOptions.length > 1 && (
              <ComboBox
                label={localization.Interpret.ExplanationScatter.colorValue}
                className={beehiveStyles.pathSelector}
                selectedKey={this.state.selectedColorOption}
                onChange={this.setColor}
                options={this.colorOptions}
                ariaLabel={"color picker"}
                useComboBoxAsMenuWidth
                styles={FluentUIStyles.smallDropdownStyle}
              />
            )}
            <div className={beehiveStyles.sliderControl}>
              <div className={beehiveStyles.sliderLabel}>
                <span className={beehiveStyles.labelText}>
                  {localization.Interpret.AggregateImportance.topKFeatures}
                </span>
                {this.props.dashboardContext.explanationContext
                  .isGlobalDerived && (
                  <IconButton
                    id={this._globalSortIconId}
                    iconProps={{ iconName: "Info" }}
                    title={localization.Interpret.AggregateImportance.topKInfo}
                    onClick={this.showGlobalSortInfo}
                    styles={{
                      root: { color: "rgb(0, 120, 212)", marginBottom: -3 }
                    }}
                  />
                )}
              </div>
              <Slider
                className={beehiveStyles.featureSlider}
                ariaLabel={
                  localization.Interpret.AggregateImportance.topKFeatures
                }
                max={Math.min(
                  Beehive.maxFeatures,
                  modelMetadata.featureNames.length
                )}
                min={1}
                step={1}
                value={this.props.config.topK}
                onChange={(value: number): void => this.setK(value)}
                showValue
              />
            </div>
            {IsMulticlass(modelMetadata.modelType) && (
              <div>
                <div className={beehiveStyles.selectorLabel}>
                  <span>{localization.Interpret.CrossClass.label}</span>
                  <IconButton
                    id={this._crossClassIconId}
                    iconProps={{ iconName: "Info" }}
                    title={localization.Interpret.CrossClass.info}
                    onClick={this.showCrossClassInfo}
                    styles={{
                      root: { color: "rgb(0, 120, 212)", marginBottom: -3 }
                    }}
                  />
                </div>
                <ComboBox
                  className={beehiveStyles.pathSelector}
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
              <div className={beehiveStyles.calloutInfo}>
                {this.state.calloutContent}
                <DefaultButton
                  onClick={this.onDismiss}
                  className={beehiveStyles.calloutButton}
                >
                  {localization.Interpret.CrossClass.close}
                </DefaultButton>
              </div>
            </Callout>
          )}
          <AccessibleChart
            plotlyProps={plotlyProps}
            onClickHandler={this.handleClick}
            theme={this.props.theme}
            relayoutArg={relayoutArg}
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

  private loadProps(): void {
    setTimeout(() => {
      const sortVector = Beehive.generateSortVector(
        this.props.dashboardContext.explanationContext
      )
        .slice(-1 * Beehive.maxFeatures)
        .reverse();
      const props = Beehive.buildPlotlyProps(
        this.props.dashboardContext.explanationContext,
        sortVector,
        this.colorOptions.find(
          (option) => option.key === this.state.selectedColorOption
        )
      );
      this.setState({ plotlyProps: props });
    }, 1);
  }

  private handleClick = (data: any): void => {
    const clickedId = (data.points[0] as any).customdata;
    const selections: string[] =
      this.props.selectionContext.selectedIds.slice();
    const existingIndex = selections.indexOf(clickedId);
    if (existingIndex !== -1) {
      selections.splice(existingIndex, 1);
    } else {
      selections.push(clickedId);
    }
    this.props.selectionContext.onSelect(selections);
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
      const modelMetadata =
        this.props.dashboardContext.explanationContext.modelMetadata;
      const calloutContent = (
        <div>
          <span>
            {
              localization.Interpret.FeatureImportanceWrapper
                .globalImportanceExplanation
            }
          </span>
          {IsMulticlass(modelMetadata.modelType) && (
            <span>
              {
                localization.Interpret.FeatureImportanceWrapper
                  .multiclassImportanceAddendum
              }
            </span>
          )}
          <div>
            <br />
          </div>
        </div>
      );
      this.setState({ calloutContent, calloutId: this._globalSortIconId });
    }
  };

  private buildColorOptions(): IComboBoxOption[] {
    const isRegression =
      this.props.dashboardContext.explanationContext.modelMetadata.modelType ===
      ModelTypes.Regression;
    const result: IComboBoxOption[] = [
      {
        key: "none",
        text: localization.Interpret.AggregateImportance.noColor
      }
    ];
    if (this.props.dashboardContext.explanationContext.testDataset.dataset) {
      result.push({
        data: { isCategorical: false, isNormalized: true },
        key: "normalizedFeatureValue",
        text: localization.Interpret.AggregateImportance.scaledFeatureValue
      });
    }
    if (this.props.dashboardContext.explanationContext.testDataset.predictedY) {
      result.push({
        data: {
          isCategorical: !isRegression,
          sortProperty: !isRegression ? "predictedClassIndex" : undefined
        },
        key: "predictedClass",
        text: isRegression
          ? localization.Interpret.AggregateImportance.predictedValue
          : localization.Interpret.AggregateImportance.predictedClass
      });
    }
    if (this.props.dashboardContext.explanationContext.testDataset.trueY) {
      result.push({
        data: {
          isCategorical: !isRegression,
          sortProperty: !isRegression ? "trueClassIndex" : undefined
        },
        key: "trueClass",
        text: isRegression
          ? localization.Interpret.AggregateImportance.trueValue
          : localization.Interpret.AggregateImportance.trueClass
      });
    }
    return result;
  }

  private setChart = (
    _event?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!item?.key) {
      return;
    }
    const newConfig = _.cloneDeep(this.props.config);
    newConfig.displayMode = item.key as any;
    this.props.onChange(newConfig, this.props.config.id);
  };

  private onDismiss = (): void => {
    this.setState({ calloutContent: undefined, calloutId: undefined });
  };

  private setColor = (
    _event?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!item?.key) {
      return;
    }
    this.setState({
      plotlyProps: undefined,
      selectedColorOption: item.key as string
    });
  };

  private setK = (newValue: number): void => {
    const newConfig = _.cloneDeep(this.props.config);
    newConfig.topK = newValue;
    this.props.onChange(newConfig, this.props.config.id);
  };
}
