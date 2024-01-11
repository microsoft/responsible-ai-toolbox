// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  IDropdownOption,
  TextField
} from "@fluentui/react";
import {
  IExplanationContext,
  ModelTypes,
  ModelExplanationUtils,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  ICategoricalRange,
  IData,
  INumericRange,
  IPlotlyProperty,
  PlotlyMode,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _, { toNumber } from "lodash";
import memoize from "memoize-one";
import React from "react";

import { HelpMessageDict } from "../Interfaces/IStringsParam";
import { NoDataMessage } from "../SharedComponents/NoDataMessage";

import { iCEPlotStyles } from "./ICEPlot.styles";

export interface IIcePlotProps {
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  datapointIndex: number;
  explanationContext: IExplanationContext;
  messages?: HelpMessageDict;
  theme?: string;
}

export interface IIcePlotState {
  requestFeatureIndex: number | undefined;
  fetchedData: any[] | undefined;
  requestedRange: Array<string | number> | undefined;
  abortController: AbortController | undefined;
  rangeView: IRangeView | undefined;
  errorMessage?: string;
}

export interface IRangeView {
  key?: string;
  featureIndex: number;
  type: RangeTypes;
  min?: number;
  minErrorMessage?: string;
  max?: number;
  maxErrorMessage?: string;
  steps?: number;
  stepsErrorMessage?: string;
  selectedOptionKeys?: Array<string | number>;
  categoricalOptions?: IComboBoxOption[];
}

export class ICEPlot extends React.Component<IIcePlotProps, IIcePlotState> {
  private static buildPlotlyProps: (
    modelType: ModelTypes,
    featureName: string,
    classNames: string[],
    rangeType: RangeTypes,
    xData?: Array<number | string>,
    yData?: number[] | number[][]
  ) => IPlotlyProperty | undefined = memoize(
    (
      modelType: ModelTypes,
      featureName: string,
      classNames: string[],
      rangeType: RangeTypes,
      xData?: Array<number | string>,
      yData?: number[] | number[][]
    ): IPlotlyProperty | undefined => {
      if (yData === undefined || xData === undefined) {
        return undefined;
      }
      const transposedY: number[][] = Array.isArray(yData[0])
        ? ModelExplanationUtils.transpose2DArray(yData as number[][])
        : [yData as number[]];
      const data: IData[] = transposedY.map((singleClassValue, classIndex) => {
        return {
          hoverinfo: "text",
          mode:
            rangeType === RangeTypes.Categorical
              ? PlotlyMode.Markers
              : PlotlyMode.LinesMarkers,
          name: classNames[classIndex],
          text: ICEPlot.buildTextArray(
            modelType,
            featureName,
            rangeType,
            xData,
            singleClassValue,
            classNames[classIndex]
          ),
          type: "scatter",
          x: xData,
          y: singleClassValue
        };
      }) as any;
      return {
        config: { displaylogo: false, displayModeBar: false, responsive: true },
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
            t: 10
          },
          showlegend: transposedY.length > 1,
          xaxis: {
            automargin: true,
            title: featureName
          },
          yaxis: {
            automargin: true,
            title:
              modelType === ModelTypes.Regression
                ? localization.Interpret.IcePlot.prediction
                : localization.Interpret.IcePlot.predictedProbability
          }
        } as any
      };
    }
  );

  private featuresOption: IDropdownOption[];

  public constructor(props: IIcePlotProps) {
    super(props);
    if (
      props.explanationContext.localExplanation &&
      props.explanationContext.localExplanation.values
    ) {
      // Sort features in the order of local explanation importance
      this.featuresOption = ModelExplanationUtils.buildSortedVector(
        props.explanationContext.localExplanation.values[
          this.props.datapointIndex
        ]
      )
        .map((featureIndex) => {
          return {
            key: featureIndex,
            text: props.explanationContext.modelMetadata.featureNames[
              featureIndex
            ]
          };
        })
        .reverse();
    } else {
      this.featuresOption =
        props.explanationContext.modelMetadata.featureNames.map(
          (featureName, featureIndex) => {
            return { key: featureIndex, text: featureName };
          }
        );
    }
    this.state = {
      abortController: undefined,
      fetchedData: undefined,
      rangeView: undefined,
      requestedRange: undefined,
      requestFeatureIndex: undefined
    };
    this.fetchData = _.debounce(this.fetchData, 500);
  }

  private static buildTextArray(
    modelType: ModelTypes,
    featureName: string,
    rangeType: RangeTypes,
    xData: Array<number | string>,
    yData: number[],
    className: string
  ): Array<string | undefined> {
    return xData.map((xValue, index) => {
      const yDatum = yData[index];
      if (yDatum === undefined) {
        return undefined;
      }
      const result = [];
      if (modelType !== ModelTypes.Regression) {
        result.push(
          localization.formatString(
            localization.Interpret.BarChart.classLabel,
            className
          )
        );
      }
      if (!Number.isNaN(+xValue)) {
        const numericFormatter =
          rangeType === RangeTypes.Numeric
            ? { minimumFractionDigits: 3 }
            : undefined;
        xValue = xValue.toLocaleString(undefined, numericFormatter);
      }
      result.push(`${featureName}: ${xValue}`);
      if (modelType === ModelTypes.Regression) {
        result.push(
          localization.formatString(
            localization.Interpret.IcePlot.predictionLabel,
            yData[index].toLocaleString(undefined, { minimumFractionDigits: 3 })
          )
        );
      } else {
        result.push(
          localization.formatString(
            localization.Interpret.IcePlot.probabilityLabel,
            yData[index].toLocaleString(undefined, { minimumFractionDigits: 3 })
          )
        );
      }

      return result.join("<br>");
    });
  }

  public componentDidMount(): void {
    if (this.featuresOption.length > 0) {
      this.setState(
        {
          rangeView: this.buildRangeView(this.featuresOption[0].key as number)
        },
        () => {
          this.fetchData();
        }
      );
    }
  }

  public componentDidUpdate(prevProps: IIcePlotProps): void {
    if (this.props.datapointIndex !== prevProps.datapointIndex) {
      this.fetchData();
    }
  }

  public componentWillUnmount(): void {
    if (this.state.abortController !== undefined) {
      this.state.abortController.abort();
    }
  }

  public render(): React.ReactNode {
    if (this.props.invokeModel === undefined) {
      return (
        <NoDataMessage explanationStrings={this.props.messages?.PredictorReq} />
      );
    }
    const featureRange =
      this.state.requestFeatureIndex !== undefined
        ? this.props.explanationContext.modelMetadata.featureRanges[
            this.state.requestFeatureIndex
          ].rangeType
        : RangeTypes.Categorical;
    const plotlyProps = ICEPlot.buildPlotlyProps(
      this.props.explanationContext.modelMetadata.modelType,
      this.state.requestFeatureIndex !== undefined
        ? this.props.explanationContext.modelMetadata.featureNames[
            this.state.requestFeatureIndex
          ]
        : "",
      this.props.explanationContext.modelMetadata.classNames,
      featureRange,
      this.state.requestedRange,
      this.state.fetchedData
    );
    const hasError =
      this.state.rangeView !== undefined &&
      (this.state.rangeView.maxErrorMessage !== undefined ||
        this.state.rangeView.minErrorMessage !== undefined ||
        this.state.rangeView.stepsErrorMessage !== undefined);
    return (
      <div className={iCEPlotStyles.iceWrapper}>
        <div>
          <div className={iCEPlotStyles.featurePicker}>
            <div>
              <ComboBox
                options={this.featuresOption}
                onChange={this.onFeatureSelected}
                label={localization.Interpret.IcePlot.featurePickerLabel}
                ariaLabel="feature picker"
                selectedKey={
                  this.state.rangeView
                    ? this.state.rangeView.featureIndex
                    : undefined
                }
                useComboBoxAsMenuWidth
                styles={FluentUIStyles.defaultDropdownStyle}
              />
            </div>
            {this.state.rangeView !== undefined && (
              <div className={iCEPlotStyles.rangeView}>
                {this.state.rangeView.type === RangeTypes.Categorical && (
                  <ComboBox
                    multiSelect
                    selectedKey={
                      this.state.rangeView.selectedOptionKeys as string[]
                    }
                    allowFreeform
                    autoComplete="on"
                    options={this.state.rangeView.categoricalOptions || []}
                    onChange={this.onCategoricalRangeChanged}
                    styles={FluentUIStyles.defaultDropdownStyle}
                  />
                )}
                {this.state.rangeView.type !== RangeTypes.Categorical && (
                  <div className={iCEPlotStyles.parameterSet}>
                    <TextField
                      label={localization.Interpret.IcePlot.minimumInputLabel}
                      styles={FluentUIStyles.textFieldStyle}
                      value={this.state.rangeView.min?.toString()}
                      onChange={this.onMinRangeChanged}
                      errorMessage={this.state.rangeView.minErrorMessage}
                    />
                    <TextField
                      label={localization.Interpret.IcePlot.maximumInputLabel}
                      styles={FluentUIStyles.textFieldStyle}
                      value={this.state.rangeView.max?.toString()}
                      onChange={this.onMaxRangeChanged}
                      errorMessage={this.state.rangeView.maxErrorMessage}
                    />
                    <TextField
                      label={localization.Interpret.IcePlot.stepInputLabel}
                      styles={FluentUIStyles.textFieldStyle}
                      value={this.state.rangeView.steps?.toString()}
                      onChange={this.onStepsRangeChanged}
                      errorMessage={this.state.rangeView.stepsErrorMessage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {this.state.abortController !== undefined && (
          <div className={iCEPlotStyles.loading}>
            {localization.Interpret.IcePlot.loadingMessage}
          </div>
        )}
        {this.state.errorMessage && (
          <div className={iCEPlotStyles.loading}>{this.state.errorMessage}</div>
        )}
        {plotlyProps === undefined &&
          this.state.abortController === undefined && (
            <div>{localization.Interpret.IcePlot.submitPrompt}</div>
          )}
        {hasError && (
          <div>{localization.Interpret.IcePlot.topLevelErrorMessage}</div>
        )}
        {plotlyProps !== undefined &&
          this.state.abortController === undefined &&
          !hasError && (
            <div className={iCEPlotStyles.secondWrapper}>
              <div className={iCEPlotStyles.chartWrapper}>
                <AccessibleChart
                  plotlyProps={plotlyProps}
                  theme={this.props.theme}
                />
              </div>
            </div>
          )}
      </div>
    );
  }

  private buildRangeView(featureIndex: number): IRangeView {
    if (
      this.props.explanationContext.modelMetadata.featureIsCategorical?.[
        featureIndex
      ]
    ) {
      const summary = this.props.explanationContext.modelMetadata.featureRanges[
        featureIndex
      ] as ICategoricalRange;
      if (summary.uniqueValues) {
        return {
          categoricalOptions: summary.uniqueValues.map((text) => {
            return { key: text, text };
          }),
          featureIndex,
          selectedOptionKeys: summary.uniqueValues,
          type: RangeTypes.Categorical
        };
      }
    }
    const summary = this.props.explanationContext.modelMetadata.featureRanges[
      featureIndex
    ] as INumericRange;
    return {
      featureIndex,
      max: summary.max,
      min: summary.min,
      steps: 20,
      type: summary.rangeType
    };
  }

  private onFeatureSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (this.props.invokeModel === undefined) {
      return;
    }
    if (item?.key === undefined) {
      return;
    }
    this.setState(
      { rangeView: this.buildRangeView(item.key as number) },
      () => {
        this.fetchData();
      }
    );
  };

  private onMinRangeChanged = (
    _ev: React.FormEvent,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    rangeView.min = val;
    if (
      Number.isNaN(val) ||
      (rangeView.type === RangeTypes.Integer && !Number.isInteger(val))
    ) {
      rangeView.minErrorMessage =
        rangeView.type === RangeTypes.Integer
          ? localization.Interpret.IcePlot.integerError
          : localization.Interpret.IcePlot.numericError;
      this.setState({ rangeView });
    } else {
      rangeView.minErrorMessage = undefined;
      this.setState({ rangeView }, () => {
        this.fetchData();
      });
    }
  };

  private onMaxRangeChanged = (
    _ev: React.FormEvent,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    rangeView.max = val;
    if (
      Number.isNaN(val) ||
      (rangeView.type === RangeTypes.Integer && !Number.isInteger(val))
    ) {
      rangeView.maxErrorMessage =
        rangeView.type === RangeTypes.Integer
          ? localization.Interpret.IcePlot.integerError
          : localization.Interpret.IcePlot.numericError;
      this.setState({ rangeView });
    } else {
      rangeView.maxErrorMessage = undefined;
      this.setState({ rangeView }, () => {
        this.fetchData();
      });
    }
  };

  private onStepsRangeChanged = (
    _ev: React.FormEvent,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    const rangeView = _.cloneDeep(this.state.rangeView);
    if (!rangeView) {
      return;
    }
    rangeView.steps = val;
    if (!Number.isInteger(val)) {
      rangeView.stepsErrorMessage = localization.Interpret.IcePlot.integerError;
      this.setState({ rangeView });
    } else {
      rangeView.stepsErrorMessage = undefined;
      this.setState({ rangeView }, () => {
        this.fetchData();
      });
    }
  };

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
    this.setState({ rangeView }, () => {
      this.fetchData();
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

  private fetchData = (): void => {
    if (this.state.abortController !== undefined) {
      this.state.abortController.abort();
    }
    if (!this.state.rangeView || !this.props.invokeModel) {
      return;
    }
    const abortController = new AbortController();
    const requestedRange = this.buildRange();
    const promise = this.props.invokeModel(
      this.buildDataSpans(),
      abortController.signal
    );
    this.setState(
      {
        abortController,
        errorMessage: undefined,
        requestedRange,
        requestFeatureIndex: this.state.rangeView.featureIndex
      },
      async () => {
        try {
          const fetchedData = await promise;
          if (Array.isArray(fetchedData)) {
            this.setState({ abortController: undefined, fetchedData });
          }
        } catch (error) {
          if (error.name === "AbortError") {
            return;
          }
          if (error.name === "PythonError") {
            this.setState({
              errorMessage: localization.formatString(
                localization.Interpret.IcePlot.errorPrefix,
                error.message
              )
            });
          }
        }
      }
    );
  };

  private buildRange(): Array<number | string> {
    if (
      this.state.rangeView === undefined ||
      this.state.rangeView.minErrorMessage !== undefined ||
      this.state.rangeView.maxErrorMessage !== undefined ||
      this.state.rangeView.stepsErrorMessage !== undefined
    ) {
      return [];
    }
    const min = toNumber(this.state.rangeView.min);
    const max = toNumber(this.state.rangeView.max);
    const steps = toNumber(this.state.rangeView.steps);
    const rangeView = this.state.rangeView;

    if (
      this.state.rangeView.type === RangeTypes.Categorical &&
      Array.isArray(this.state.rangeView.selectedOptionKeys)
    ) {
      return this.state.rangeView.selectedOptionKeys;
    } else if (
      !Number.isNaN(min) &&
      !Number.isNaN(max) &&
      Number.isInteger(steps)
    ) {
      const delta = steps > 0 ? (max - min) / steps : max - min;
      return _.uniq(
        Array.from({ length: steps }, (_x, i) =>
          rangeView.type === RangeTypes.Integer
            ? Math.round(min + i * delta)
            : min + i * delta
        )
      );
    }
    return [];
  }

  private buildDataSpans(): Array<Array<number | string>> {
    if (
      !this.props.explanationContext.testDataset.dataset ||
      !this.state.rangeView
    ) {
      return [];
    }
    const rangeView = this.state.rangeView;
    const selectedRow =
      this.props.explanationContext.testDataset.dataset[
        this.props.datapointIndex
      ];
    return this.buildRange().map((val) => {
      const copy = _.cloneDeep(selectedRow);
      copy[rangeView.featureIndex] = val;
      return copy;
    });
  }
}
