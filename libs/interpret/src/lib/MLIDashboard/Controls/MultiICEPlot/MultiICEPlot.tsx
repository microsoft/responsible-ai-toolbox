// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isTwoDimArray } from "@responsible-ai/core-ui";
import {
  IPlotlyProperty,
  RangeTypes,
  AccessibleChart,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import _, { toNumber, map } from "lodash";
import {
  IComboBox,
  IComboBoxOption,
  ComboBox,
  SpinButton,
  Text,
  getTheme
} from "office-ui-fabric-react";
import { Data } from "plotly.js";
import React from "react";

import { localization } from "../../../Localization/localization";
import { FabricStyles } from "../../FabricStyles";
import {
  ModelTypes,
  IExplanationModelMetadata
} from "../../IExplanationContext";
import { JointDataset } from "../../JointDataset";
import { ModelExplanationUtils } from "../../ModelExplanationUtils";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";
import { IRangeView } from "../ICEPlot";

import { multiIcePlotStyles } from "./MultiICEPlot.styles";

export interface IMultiICEPlotProps {
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  datapoints: Array<Array<string | number>>;
  rowNames: string[];
  colors: string[];
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  feature: string;
  selectedClass: number;
}

export interface IMultiICEPlotState {
  yAxes: number[][] | number[][][] | undefined;
  xAxisArray: string[] | number[];
  abortControllers: Array<AbortController | undefined>;
  rangeView: IRangeView | undefined;
  errorMessage?: string;
}

export class MultiICEPlot extends React.PureComponent<
  IMultiICEPlotProps,
  IMultiICEPlotState
> {
  private debounceFetchData: () => void;
  public constructor(props: IMultiICEPlotProps) {
    super(props);
    const rangeView = this.buildRangeView(this.props.feature);
    const xAxisArray = this.buildRange(rangeView);
    this.state = {
      abortControllers: [],
      rangeView,
      xAxisArray,
      yAxes: []
    };

    this.debounceFetchData = _.debounce(this.fetchData.bind(this), 500);
  }
  private static buildYAxis(
    metadata: IExplanationModelMetadata,
    selectedClass: number
  ): string {
    if (metadata.modelType === ModelTypes.Regression) {
      return localization.IcePlot.prediction;
    }
    return (
      localization.IcePlot.predictedProbability +
      "<br>" +
      localization.formatString(
        localization.WhatIfTab.classLabel,
        metadata.classNames[selectedClass]
      )
    );
  }
  private static buildPlotlyProps(
    metadata: IExplanationModelMetadata,
    featureName: string,
    selectedClass: number,
    colors: string[],
    rowNames: string[],
    rangeType?: RangeTypes,
    xData?: Array<number | string>,
    yData?: number[][] | number[][][]
  ): IPlotlyProperty | undefined {
    if (
      yData === undefined ||
      xData === undefined ||
      yData.length === 0 ||
      yData.some((row: number[] | number[][]) => row === undefined)
    ) {
      return undefined;
    }
    const data: Data[] = map<number[] | number[][]>(
      yData,
      (singleRow: number[] | number[][], rowIndex: number) => {
        const transposedY: number[][] = isTwoDimArray(singleRow)
          ? ModelExplanationUtils.transpose2DArray(singleRow)
          : [singleRow];
        const predictionLabel =
          metadata.modelType === ModelTypes.Regression
            ? localization.IcePlot.prediction
            : localization.IcePlot.predictedProbability +
              ": " +
              metadata.classNames[selectedClass];
        const hovertemplate = `%{customdata.Name}<br>${featureName}: %{x}<br>${predictionLabel}: %{customdata.Yformatted}<br><extra></extra>`;
        return {
          customdata: transposedY[selectedClass].map((predY) => {
            return {
              Name: rowNames[rowIndex],
              Yformatted: predY.toLocaleString(undefined, {
                maximumFractionDigits: 3
              })
            };
          }),
          hoverinfo: "all",
          hovertemplate,
          marker: {
            color: colors[rowIndex]
          },
          mode:
            rangeType === RangeTypes.Categorical
              ? PlotlyMode.Markers
              : PlotlyMode.LinesMarkers,
          name: rowNames[rowIndex],
          type: "scatter",
          x: xData,
          y: transposedY[selectedClass]
        };
      }
    ) as any;
    return {
      config: { displayModeBar: false, displaylogo: false, responsive: true },
      data,
      layout: {
        autosize: true,
        dragmode: false,
        font: {
          size: 10
        },
        hovermode: "closest",
        margin: {
          b: 30,
          r: 10,
          t: 10
        },
        showlegend: false,
        xaxis: {
          automargin: true,
          title: featureName
        },
        yaxis: {
          automargin: true,
          title: MultiICEPlot.buildYAxis(metadata, selectedClass)
        }
      }
    };
  }

  public componentDidMount(): void {
    this.fetchData();
  }

  public componentDidUpdate(prevProps: IMultiICEPlotProps): void {
    if (this.props.datapoints !== prevProps.datapoints) {
      this.fetchData();
    }
    if (this.props.feature !== prevProps.feature) {
      this.onFeatureSelected();
    }
  }

  public componentWillUnmount(): void {
    this.state.abortControllers.forEach((abortController) => {
      if (abortController !== undefined) {
        abortController.abort();
      }
    });
  }

  public render(): React.ReactNode {
    if (this.props.invokeModel === undefined) {
      return <NoDataMessage />;
    }
    const classNames = multiIcePlotStyles();
    const hasOutgoingRequest = this.state.abortControllers.some(
      (x) => x !== undefined
    );
    const plotlyProps = this.state.rangeView
      ? MultiICEPlot.buildPlotlyProps(
          this.props.metadata,
          this.props.jointDataset.metaDict[this.props.feature].label,
          this.props.selectedClass,
          this.props.colors,
          this.props.rowNames,
          this.state.rangeView.type,
          this.state.xAxisArray,
          this.state.yAxes
        )
      : undefined;
    const hasError =
      this.state.rangeView !== undefined &&
      (this.state.rangeView.maxErrorMessage !== undefined ||
        this.state.rangeView.minErrorMessage !== undefined ||
        this.state.rangeView.stepsErrorMessage !== undefined);
    return (
      <div className={classNames.iceWrapper}>
        {this.state.rangeView !== undefined && (
          <div className={classNames.controlArea}>
            {this.state.rangeView.type === RangeTypes.Categorical && (
              <ComboBox
                multiSelect
                selectedKey={
                  this.state.rangeView.selectedOptionKeys as string[]
                }
                allowFreeform={true}
                autoComplete="on"
                options={this.state.rangeView.categoricalOptions}
                onChange={this.onCategoricalRangeChanged}
                styles={FabricStyles.defaultDropdownStyle}
                calloutProps={FabricStyles.calloutProps}
              />
            )}
            {this.state.rangeView.type !== RangeTypes.Categorical && (
              <div className={classNames.parameterList}>
                <SpinButton
                  styles={{
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "78px"
                        }
                      }
                    },
                    spinButtonWrapper: { maxWidth: "68px" }
                  }}
                  label={localization.WhatIfTab.minLabel}
                  value={this.state.rangeView.min?.toString()}
                  onIncrement={this.onMinRangeChanged.bind(this, 1)}
                  onDecrement={this.onMinRangeChanged.bind(this, -1)}
                  onValidate={this.onMinRangeChanged.bind(this, 0)}
                />
                <SpinButton
                  styles={{
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "78px"
                        }
                      }
                    },
                    spinButtonWrapper: { maxWidth: "68px" }
                  }}
                  label={localization.WhatIfTab.maxLabel}
                  value={this.state.rangeView.max?.toString()}
                  onIncrement={this.onMaxRangeChanged.bind(this, 1)}
                  onDecrement={this.onMaxRangeChanged.bind(this, -1)}
                  onValidate={this.onMaxRangeChanged.bind(this, 0)}
                />
                <SpinButton
                  styles={{
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "78px"
                        }
                      }
                    },
                    spinButtonWrapper: { maxWidth: "68px" }
                  }}
                  label={localization.WhatIfTab.stepsLabel}
                  value={this.state.rangeView.steps?.toString()}
                  onIncrement={this.onStepsRangeChanged.bind(this, 1)}
                  onDecrement={this.onStepsRangeChanged.bind(this, -1)}
                  onValidate={this.onStepsRangeChanged.bind(this, 0)}
                />
              </div>
            )}
          </div>
        )}
        {hasOutgoingRequest && (
          <div className={classNames.placeholder}>
            <Text>{localization.IcePlot.loadingMessage}</Text>
          </div>
        )}
        {this.state.errorMessage && (
          <div className={classNames.placeholder}>
            <Text>{this.state.errorMessage}</Text>
          </div>
        )}
        {plotlyProps === undefined && !hasOutgoingRequest && (
          <div className={classNames.placeholder}>
            <Text>{localization.IcePlot.submitPrompt}</Text>
          </div>
        )}
        {hasError && (
          <div className={classNames.placeholder}>
            <Text>{localization.IcePlot.topLevelErrorMessage}</Text>
          </div>
        )}
        {plotlyProps !== undefined && !hasOutgoingRequest && !hasError && (
          <div className={classNames.chartWrapper}>
            <AccessibleChart plotlyProps={plotlyProps} theme={getTheme()} />
          </div>
        )}
      </div>
    );
  }

  private onFeatureSelected(): void {
    const rangeView = this.buildRangeView(this.props.feature);
    const xAxisArray = this.buildRange(rangeView);
    this.setState({ rangeView, xAxisArray }, () => {
      this.debounceFetchData();
    });
  }

  private onMinRangeChanged(delta: number, stringVal: string): string | void {
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    if (delta === 0 || rangeView.min === undefined) {
      const numberVal = +stringVal;
      if (Number.isNaN(numberVal)) {
        return rangeView.min?.toString();
      }
      rangeView.min = numberVal;
    } else {
      rangeView.min += delta;
    }
    if (
      rangeView.max !== undefined &&
      rangeView.min !== undefined &&
      rangeView.max <= rangeView.min
    ) {
      return rangeView.min?.toString();
    }
    const xAxisArray = this.buildRange(rangeView);
    this.setState(
      {
        abortControllers: [new AbortController()],
        rangeView,
        xAxisArray,
        yAxes: undefined
      },
      () => {
        this.debounceFetchData();
      }
    );
  }

  private onMaxRangeChanged(delta: number, stringVal: string): string | void {
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    if (delta === 0 || rangeView.max === undefined) {
      const numberVal = +stringVal;
      if (Number.isNaN(numberVal)) {
        return rangeView.max?.toString();
      }
      rangeView.max = numberVal;
    } else {
      rangeView.max += delta;
    }
    if (
      rangeView.max !== undefined &&
      rangeView.min !== undefined &&
      rangeView.max <= rangeView.min
    ) {
      return rangeView.max.toString();
    }
    const xAxisArray = this.buildRange(rangeView);
    this.setState(
      {
        abortControllers: [new AbortController()],
        rangeView,
        xAxisArray,
        yAxes: undefined
      },
      () => {
        this.debounceFetchData();
      }
    );
  }

  private onStepsRangeChanged(delta: number, stringVal: string): string | void {
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    if (delta === 0 || rangeView.steps === undefined) {
      const numberVal = +stringVal;
      if (!Number.isInteger(numberVal)) {
        return rangeView.steps?.toString();
      }
      rangeView.steps = numberVal;
    } else {
      rangeView.steps += delta;
    }
    if (rangeView.steps <= 0) {
      return rangeView.steps.toString();
    }
    const xAxisArray = this.buildRange(rangeView);
    this.setState(
      {
        abortControllers: [new AbortController()],
        rangeView,
        xAxisArray,
        yAxes: undefined
      },
      () => {
        this.debounceFetchData();
      }
    );
  }

  private onCategoricalRangeChanged = (
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string
  ): void => {
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    const currentSelectedKeys = rangeView.selectedOptionKeys || [];
    if (option) {
      // User selected/de-selected an existing option
      rangeView.selectedOptionKeys = this.updateSelectedOptionKeys(
        currentSelectedKeys,
        option
      );
    } else if (value !== undefined) {
      // User typed a freeform option
      const newOption: IComboBoxOption = { key: value, text: value };
      rangeView.selectedOptionKeys = [
        ...currentSelectedKeys,
        newOption.key as string
      ];
      rangeView.categoricalOptions?.push(newOption);
    }
    const xAxisArray = this.buildRange(rangeView);
    this.setState({ rangeView, xAxisArray }, () => {
      this.debounceFetchData();
    });
  };

  private updateSelectedOptionKeys = (
    selectedKeys: Array<string | number>,
    option: IComboBoxOption
  ): Array<string | number> => {
    selectedKeys = [...selectedKeys]; // modify a copy
    const index = selectedKeys.indexOf(option.key as string);
    if (option.selected && index < 0) {
      selectedKeys.push(option.key as string);
    } else {
      selectedKeys.splice(index, 1);
    }
    return selectedKeys;
  };

  private fetchData(): void {
    if (!this.props.invokeModel) {
      return;
    }
    const invokeModel = this.props.invokeModel;
    this.state.abortControllers.forEach((abortController) => {
      if (abortController !== undefined) {
        abortController.abort();
      }
    });
    const promises = this.props.datapoints.map((row, index) => {
      const newController = [...this.state.abortControllers];
      const abortController = new AbortController();
      newController[index] = abortController;
      this.setState({ abortControllers: newController });
      const permutations = this.buildDataSpans(row, this.state.xAxisArray);
      return invokeModel(permutations, abortController.signal);
    });
    const yAxes = undefined;

    this.setState({ errorMessage: undefined, yAxes }, async () => {
      try {
        const fetchedData = await Promise.all(promises);
        if (
          Array.isArray(fetchedData) &&
          fetchedData.every((prediction) => Array.isArray(prediction))
        ) {
          this.setState({
            abortControllers: this.props.datapoints.map(() => undefined),
            yAxes: fetchedData
          });
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        if (error.name === "PythonError") {
          this.setState({
            errorMessage: localization.formatString(
              localization.IcePlot.errorPrefix,
              error.message
            )
          });
        }
      }
    });
  }

  private buildDataSpans(
    row: Array<string | number>,
    range: Array<string | number>
  ): Array<Array<number | string>> {
    if (!this.state.rangeView) {
      return [];
    }
    const rangeView = this.state.rangeView;
    return range.map((val: number | string) => {
      const copy = _.cloneDeep(row);
      copy[rangeView.featureIndex] = val;
      return copy;
    });
  }

  private buildRangeView(featureKey: string): IRangeView | undefined {
    const summary = this.props.jointDataset.metaDict[featureKey];
    if (!summary || summary.index === undefined || !summary.featureRange) {
      return undefined;
    }
    if (summary.treatAsCategorical) {
      // Columns that are passed in as categorical strings should be strings when passed to predict
      if (summary.isCategorical) {
        return {
          categoricalOptions: summary.sortedCategoricalValues?.map((text) => {
            return { key: text, text };
          }),
          featureIndex: summary.index,
          key: featureKey,
          selectedOptionKeys: summary.sortedCategoricalValues,
          type: RangeTypes.Categorical
        };
      }
      // Columns that were integers that are flagged in the UX as categorical should still be integers when
      // calling predict on the model.
      return {
        categoricalOptions: summary.sortedCategoricalValues?.map((text) => {
          return { key: +text, text: text.toString() };
        }),
        featureIndex: summary.index,
        key: featureKey,
        selectedOptionKeys: summary.sortedCategoricalValues?.map((x) => +x),
        type: RangeTypes.Categorical
      };
    }
    return {
      featureIndex: summary.index,
      key: featureKey,
      max: summary.featureRange?.max,
      min: summary.featureRange?.min,
      steps: 20,
      type: summary.featureRange.rangeType
    };
  }

  private buildRange(rangeView: IRangeView | undefined): number[] | string[] {
    if (
      rangeView === undefined ||
      rangeView.minErrorMessage !== undefined ||
      rangeView.maxErrorMessage !== undefined ||
      rangeView.stepsErrorMessage !== undefined
    ) {
      return [];
    }
    const min = toNumber(rangeView.min);
    const max = toNumber(rangeView.max);
    const steps = toNumber(rangeView.steps);

    if (
      rangeView.type === RangeTypes.Categorical &&
      Array.isArray(rangeView.selectedOptionKeys)
    ) {
      return rangeView.selectedOptionKeys as string[];
    } else if (
      !Number.isNaN(min) &&
      !Number.isNaN(max) &&
      Number.isInteger(steps)
    ) {
      const delta = steps > 0 ? (max - min) / steps : max - min;
      return _.uniq(
        Array.from({ length: steps }, (_, i) =>
          rangeView.type === RangeTypes.Integer
            ? Math.round(min + i * delta)
            : min + i * delta
        )
      );
    }
    return [];
  }
}
