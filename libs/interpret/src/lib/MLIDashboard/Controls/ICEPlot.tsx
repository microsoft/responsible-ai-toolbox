import _ from "lodash";
import * as memoize from "memoize-one";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  TextField
} from "office-ui-fabric-react";

import { Data } from "plotly.js/lib/core";
import React from "react";
import {
  AccessibleChart,
  ICategoricalRange,
  INumericRange,
  IPlotlyProperty,
  PlotlyMode,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import { localization } from "../../Localization/localization";
import { FabricStyles } from "../FabricStyles";
import { IExplanationContext, ModelTypes } from "../IExplanationContext";
import { ModelExplanationUtils } from "../ModelExplanationUtils";
import { NoDataMessage } from "../SharedComponents";
import { HelpMessageDict } from "../Interfaces/IStringsParam";
import "./ICEPlot.scss";

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
  ) => IPlotlyProperty | undefined = (memoize as any).default(
    (
      modelType: ModelTypes,
      featureName: string,
      classNames: string[],
      rangeType: RangeTypes,
      xData: Array<number | string>,
      yData: number[] | number[][]
    ): IPlotlyProperty | undefined => {
      if (yData === undefined || xData === undefined) {
        return undefined;
      }
      const transposedY: number[][] = Array.isArray(yData[0])
        ? ModelExplanationUtils.transpose2DArray(yData as number[][])
        : [yData as number[]];
      const data: Data[] = transposedY.map((singleClassValue, classIndex) => {
        return {
          hoverinfo: "text",
          mode:
            rangeType === RangeTypes.categorical
              ? PlotlyMode.markers
              : PlotlyMode.linesMarkers,
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
          y: singleClassValue,
          name: classNames[classIndex]
        };
      }) as any;
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
            b: 30
          },
          hovermode: "closest",
          showlegend: transposedY.length > 1,
          yaxis: {
            automargin: true,
            title:
              modelType === ModelTypes.regression
                ? localization.IcePlot.prediction
                : localization.IcePlot.predictedProbability
          },
          xaxis: {
            title: featureName,
            automargin: true
          }
        } as any
      };
    },
    _.isEqual.bind(window)
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
            text:
              props.explanationContext.modelMetadata.featureNames[featureIndex]
          };
        })
        .reverse();
    } else {
      this.featuresOption = props.explanationContext.modelMetadata.featureNames.map(
        (featureName, featureIndex) => {
          return { key: featureIndex, text: featureName };
        }
      );
    }
    this.state = {
      requestFeatureIndex: undefined,
      fetchedData: undefined,
      abortController: undefined,
      rangeView: undefined,
      requestedRange: undefined
    };
    this.fetchData = _.debounce(this.fetchData.bind(this), 500);
  }

  private static buildTextArray(
    modelType: ModelTypes,
    featureName: string,
    rangeType: RangeTypes,
    xData: Array<number | string>,
    yData: number[],
    className: string
  ): string[] {
    return xData.map((xValue, index) => {
      const yDatum = yData[index];
      if (yDatum === undefined) {
        return undefined;
      }
      const result = [];
      if (modelType !== ModelTypes.regression) {
        result.push(
          localization.formatString(localization.BarChart.classLabel, className)
        );
      }
      if (!isNaN(+xValue)) {
        const numericFormatter =
          rangeType === RangeTypes.numeric
            ? { minimumFractionDigits: 3 }
            : undefined;
        xValue = xValue.toLocaleString(undefined, numericFormatter);
      }
      result.push(`${featureName}: ${xValue}`);
      if (modelType === ModelTypes.regression) {
        result.push(
          localization.formatString(
            localization.IcePlot.predictionLabel,
            yData[index].toLocaleString(undefined, { minimumFractionDigits: 3 })
          )
        );
      } else {
        result.push(
          localization.formatString(
            localization.IcePlot.probabilityLabel,
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
      const explanationStrings = this.props.messages
        ? this.props.messages.PredictorReq
        : undefined;
      return <NoDataMessage explanationStrings={explanationStrings} />;
    } else {
      const featureRange =
        this.state.requestFeatureIndex !== undefined
          ? this.props.explanationContext.modelMetadata.featureRanges[
              this.state.requestFeatureIndex
            ].rangeType
          : RangeTypes.categorical;
      const plotlyProps = ICEPlot.buildPlotlyProps(
        this.props.explanationContext.modelMetadata.modelType,
        this.props.explanationContext.modelMetadata.featureNames[
          this.state.requestFeatureIndex
        ],
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
        <div className="ICE-wrapper">
          <div className="feature-pickers">
            <div className="feature-picker">
              <div className="path-selector">
                <ComboBox
                  options={this.featuresOption}
                  onChange={this.onFeatureSelected}
                  label={localization.IcePlot.featurePickerLabel}
                  ariaLabel="feature picker"
                  selectedKey={
                    this.state.rangeView
                      ? this.state.rangeView.featureIndex
                      : undefined
                  }
                  useComboBoxAsMenuWidth={true}
                  styles={FabricStyles.defaultDropdownStyle}
                />
              </div>
              {this.state.rangeView !== undefined && (
                <div className="rangeview">
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
                    />
                  )}
                  {this.state.rangeView.type !== RangeTypes.categorical && (
                    <div className="parameter-set">
                      <TextField
                        label={localization.IcePlot.minimumInputLabel}
                        styles={FabricStyles.textFieldStyle}
                        value={this.state.rangeView.min.toString()}
                        onChange={this.onMinRangeChanged}
                        errorMessage={this.state.rangeView.minErrorMessage}
                      />
                      <TextField
                        label={localization.IcePlot.maximumInputLabel}
                        styles={FabricStyles.textFieldStyle}
                        value={this.state.rangeView.max.toString()}
                        onChange={this.onMaxRangeChanged}
                        errorMessage={this.state.rangeView.maxErrorMessage}
                      />
                      <TextField
                        label={localization.IcePlot.stepInputLabel}
                        styles={FabricStyles.textFieldStyle}
                        value={this.state.rangeView.steps.toString()}
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
            <div className="loading">{localization.IcePlot.loadingMessage}</div>
          )}
          {this.state.errorMessage && (
            <div className="loading">{this.state.errorMessage}</div>
          )}
          {plotlyProps === undefined &&
            this.state.abortController === undefined && (
              <div className="charting-prompt">
                {localization.IcePlot.submitPrompt}
              </div>
            )}
          {hasError && (
            <div className="charting-prompt">
              {localization.IcePlot.topLevelErrorMessage}
            </div>
          )}
          {plotlyProps !== undefined &&
            this.state.abortController === undefined &&
            !hasError && (
              <div className="second-wrapper">
                <div className="chart-wrapper">
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
  }

  private buildRangeView(featureIndex: number): IRangeView {
    if (
      this.props.explanationContext.modelMetadata.featureIsCategorical[
        featureIndex
      ]
    ) {
      const summary = this.props.explanationContext.modelMetadata.featureRanges[
        featureIndex
      ] as ICategoricalRange;
      if (summary.uniqueValues) {
        return {
          featureIndex,
          selectedOptionKeys: summary.uniqueValues,
          categoricalOptions: summary.uniqueValues.map((text) => {
            return { key: text, text };
          }),
          type: RangeTypes.categorical
        };
      }
    } else {
      const summary = this.props.explanationContext.modelMetadata.featureRanges[
        featureIndex
      ] as INumericRange;
      return {
        featureIndex,
        min: summary.min,
        max: summary.max,
        steps: 20,
        type: summary.rangeType
      };
    }
  }

  private onFeatureSelected = (
    _event: React.FormEvent<IComboBox>,
    item: IDropdownOption
  ): void => {
    if (this.props.invokeModel === undefined) {
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
    _ev: React.FormEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    const val = +newValue;
    const rangeView = _.cloneDeep(this.state.rangeView);
    rangeView.min = +newValue;
    if (
      Number.isNaN(val) ||
      (this.state.rangeView.type === RangeTypes.integer &&
        !Number.isInteger(val))
    ) {
      rangeView.minErrorMessage =
        this.state.rangeView.type === RangeTypes.integer
          ? localization.IcePlot.integerError
          : localization.IcePlot.numericError;
      this.setState({ rangeView });
    } else {
      rangeView.minErrorMessage = undefined;
      this.setState({ rangeView }, () => {
        this.fetchData();
      });
    }
  };

  private onMaxRangeChanged = (
    _ev: React.FormEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    const val = +newValue;
    const rangeView = _.cloneDeep(this.state.rangeView);
    rangeView.max = +newValue;
    if (
      Number.isNaN(val) ||
      (this.state.rangeView.type === RangeTypes.integer &&
        !Number.isInteger(val))
    ) {
      rangeView.maxErrorMessage =
        this.state.rangeView.type === RangeTypes.integer
          ? localization.IcePlot.integerError
          : localization.IcePlot.numericError;
      this.setState({ rangeView });
    } else {
      rangeView.maxErrorMessage = undefined;
      this.setState({ rangeView }, () => {
        this.fetchData();
      });
    }
  };

  private onStepsRangeChanged = (
    _ev: React.FormEvent<HTMLInputElement>,
    newValue?: string
  ): void => {
    const val = +newValue;
    const rangeView = _.cloneDeep(this.state.rangeView);
    rangeView.steps = +newValue;
    if (!Number.isInteger(val)) {
      rangeView.stepsErrorMessage = localization.IcePlot.integerError;
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
      rangeView.categoricalOptions.push(newOption);
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

  private fetchData(): void {
    if (this.state.abortController !== undefined) {
      this.state.abortController.abort();
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
        requestedRange,
        requestFeatureIndex: this.state.rangeView.featureIndex,
        errorMessage: undefined
      },
      async () => {
        try {
          const fetchedData = await promise;
          if (Array.isArray(fetchedData)) {
            this.setState({ fetchedData, abortController: undefined });
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
              ) as string
            });
          }
        }
      }
    );
  }

  private buildRange(): Array<number | string> {
    if (
      this.state.rangeView === undefined ||
      this.state.rangeView.minErrorMessage !== undefined ||
      this.state.rangeView.maxErrorMessage !== undefined ||
      this.state.rangeView.stepsErrorMessage !== undefined
    ) {
      return [];
    }
    const min = +this.state.rangeView.min;
    const max = +this.state.rangeView.max;
    const steps = +this.state.rangeView.steps;

    if (
      this.state.rangeView.type === RangeTypes.categorical &&
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
          this.state.rangeView.type === RangeTypes.integer
            ? Math.round(min + i * delta)
            : min + i * delta
        )
      );
    } else {
      return [];
    }
  }

  private buildDataSpans(): Array<Array<number | string>> {
    const selectedRow = this.props.explanationContext.testDataset.dataset[
      this.props.datapointIndex
    ];
    return this.buildRange().map((val) => {
      const copy = _.cloneDeep(selectedRow);
      copy[this.state.rangeView.featureIndex] = val;
      return copy;
    });
  }
}
