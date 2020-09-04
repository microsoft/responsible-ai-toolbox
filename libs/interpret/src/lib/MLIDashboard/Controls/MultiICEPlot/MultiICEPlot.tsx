import React from "react";
import _, { toNumber, map } from "lodash";
import {
  IPlotlyProperty,
  RangeTypes,
  AccessibleChart,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import {
  IComboBox,
  IComboBoxOption,
  ComboBox,
  SpinButton,
  Text,
  getTheme
} from "office-ui-fabric-react";
import { Data } from "plotly.js";
import { IsTwoDimArray } from "@responsible-ai/core-ui";
import { JointDataset } from "../../JointDataset";
import { IRangeView } from "../ICEPlot";
import { localization } from "../../../Localization/localization";
import { NoDataMessage } from "../../SharedComponents/NoDataMessage";
import {
  ModelTypes,
  IExplanationModelMetadata
} from "../../IExplanationContext";
import { FabricStyles } from "../../FabricStyles";
import { ModelExplanationUtils } from "../../ModelExplanationUtils";
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
      yAxes: [],
      abortControllers: [],
      rangeView,
      xAxisArray
    };

    this.debounceFetchData = _.debounce(this.fetchData.bind(this), 500);
  }
  private static buildYAxis(
    metadata: IExplanationModelMetadata,
    selectedClass: number
  ): string {
    if (metadata.modelType === ModelTypes.regression) {
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
        const transposedY: number[][] = IsTwoDimArray(singleRow)
          ? ModelExplanationUtils.transpose2DArray(singleRow)
          : [singleRow];
        const predictionLabel =
          metadata.modelType === ModelTypes.regression
            ? localization.IcePlot.prediction
            : localization.IcePlot.predictedProbability +
              ": " +
              metadata.classNames[selectedClass];
        const hovertemplate = `%{customdata.Name}<br>${featureName}: %{x}<br>${predictionLabel}: %{customdata.Yformatted}<br><extra></extra>`;
        return {
          mode:
            rangeType === RangeTypes.categorical
              ? PlotlyMode.markers
              : PlotlyMode.linesMarkers,
          type: "scatter",
          hovertemplate,
          hoverinfo: "all",
          x: xData,
          y: transposedY[selectedClass],
          marker: {
            color: colors[rowIndex]
          },
          name: rowNames[rowIndex],
          customdata: transposedY[selectedClass].map((predY) => {
            return {
              Name: rowNames[rowIndex],
              Yformatted: predY.toLocaleString(undefined, {
                maximumFractionDigits: 3
              })
            };
          })
        };
      }
    ) as any;
    return {
      config: { displaylogo: false, responsive: true, displayModeBar: false },
      data,
      layout: {
        dragmode: false,
        autosize: true,
        font: {
          size: 10
        },
        margin: {
          t: 10,
          b: 30,
          r: 10
        },
        hovermode: "closest",
        showlegend: false,
        yaxis: {
          automargin: true,
          title: MultiICEPlot.buildYAxis(metadata, selectedClass)
        },
        xaxis: {
          title: featureName,
          automargin: true
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
            {this.state.rangeView.type === RangeTypes.categorical && (
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
            {this.state.rangeView.type !== RangeTypes.categorical && (
              <div className={classNames.parameterList}>
                <SpinButton
                  styles={{
                    spinButtonWrapper: { maxWidth: "68px" },
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "78px"
                        }
                      }
                    }
                  }}
                  label={localization.WhatIfTab.minLabel}
                  value={this.state.rangeView.min?.toString()}
                  onIncrement={this.onMinRangeChanged.bind(this, 1)}
                  onDecrement={this.onMinRangeChanged.bind(this, -1)}
                  onValidate={this.onMinRangeChanged.bind(this, 0)}
                />
                <SpinButton
                  styles={{
                    spinButtonWrapper: { maxWidth: "68px" },
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "78px"
                        }
                      }
                    }
                  }}
                  label={localization.WhatIfTab.maxLabel}
                  value={this.state.rangeView.max?.toString()}
                  onIncrement={this.onMaxRangeChanged.bind(this, 1)}
                  onDecrement={this.onMaxRangeChanged.bind(this, -1)}
                  onValidate={this.onMaxRangeChanged.bind(this, 0)}
                />
                <SpinButton
                  styles={{
                    spinButtonWrapper: { maxWidth: "68px" },
                    labelWrapper: { alignSelf: "center" },
                    root: {
                      display: "inline-flex",
                      float: "right",
                      selectors: {
                        "> div": {
                          maxWidth: "78px"
                        }
                      }
                    }
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
        rangeView,
        xAxisArray,
        yAxes: undefined,
        abortControllers: [new AbortController()]
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
        rangeView,
        xAxisArray,
        yAxes: undefined,
        abortControllers: [new AbortController()]
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
        rangeView,
        xAxisArray,
        yAxes: undefined,
        abortControllers: [new AbortController()]
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

    this.setState({ yAxes, errorMessage: undefined }, async () => {
      try {
        const fetchedData = await Promise.all(promises);
        if (
          Array.isArray(fetchedData) &&
          fetchedData.every((prediction) => Array.isArray(prediction))
        ) {
          this.setState({
            yAxes: fetchedData,
            abortControllers: this.props.datapoints.map(() => undefined)
          });
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        if (err.name === "PythonError") {
          this.setState({
            errorMessage: localization.formatString(
              localization.IcePlot.errorPrefix,
              err.message
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
          key: featureKey,
          featureIndex: summary.index,
          selectedOptionKeys: summary.sortedCategoricalValues,
          categoricalOptions: summary.sortedCategoricalValues?.map((text) => {
            return { key: text, text };
          }),
          type: RangeTypes.categorical
        };
      }
      // Columns that were integers that are flagged in the UX as categorical should still be integers when
      // calling predict on the model.
      return {
        key: featureKey,
        featureIndex: summary.index,
        selectedOptionKeys: summary.sortedCategoricalValues?.map((x) => +x),
        categoricalOptions: summary.sortedCategoricalValues?.map((text) => {
          return { key: +text, text: text.toString() };
        }),
        type: RangeTypes.categorical
      };
    }
    return {
      key: featureKey,
      featureIndex: summary.index,
      min: summary.featureRange?.min,
      max: summary.featureRange?.max,
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
      rangeView.type === RangeTypes.categorical &&
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
          rangeView.type === RangeTypes.integer
            ? Math.round(min + i * delta)
            : min + i * delta
        )
      );
    }
    return [];
  }
}
