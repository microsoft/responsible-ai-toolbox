// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  ChartBuilder,
  IPlotlyProperty,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  Text,
  Spinner,
  SpinnerSize,
  Stack,
  IDropdownOption
} from "office-ui-fabric-react";
import { Datum } from "plotly.js";
import React from "react";

import {
  IPerformancePickerPropsV2,
  IFeatureBinPickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerProps
} from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";

import { FairnessModes, fairnessOptions } from "./../util/FairnessMetrics";
import { IFairnessContext } from "./../util/IFairnessContext";
import { MetricsCache } from "./../util/MetricsCache";
import { performanceOptions } from "./../util/PerformanceMetrics";
import { CalloutHelpBar } from "./CalloutHelpBar";
import { DropdownBar } from "./DropdownBar";
import { Insights } from "./Insights";
import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";

export interface IModelComparisonProps {
  showIntro: boolean;
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  modelCount: number;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  errorPickerProps: IErrorPickerProps;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  onHideIntro: () => void;
  onEditConfigs: () => void;
  onChartClick?: (data?: any) => void;
}

export interface IState {
  showCalloutHelpBar?: boolean;
  featureKey?: string;
  performanceKey?: string;
  fairnessKey?: string;
  performanceArray?: number[];
  performanceBounds?: Array<IBounds | undefined>;
  fairnessArray?: number[];
  fairnessBounds?: Array<IBounds | undefined>;
  errorBarsEnabled?: boolean;
}

export class ModelComparisonChart extends React.Component<
  IModelComparisonProps,
  IState
> {
  private readonly plotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      modeBarButtonsToRemove: [
        "toggleSpikelines",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
        "zoom2d",
        "pan2d",
        "select2d",
        "lasso2d",
        "zoomIn2d",
        "zoomOut2d",
        "autoScale2d",
        "resetScale2d"
      ],
      responsive: true
    },
    data: [
      {
        datapointLevelAccessors: {
          customdata: {
            path: ["index"],
            plotlyPath: "customdata"
          }
        },
        hoverinfo: "text",
        marker: {
          size: 14
        },
        mode: PlotlyMode.TextMarkers,
        textposition: "top",
        type: "scatter",
        xAccessor: "Performance",
        xAccessorLowerBound: "PerformanceLowerBound",
        xAccessorUpperBound: "PerformanceUpperBound",
        yAccessor: "Fairness",
        yAccessorLowerBound: "FairnessLowerBound",
        yAccessorUpperBound: "FairnessUpperBound"
      } as any
    ],
    layout: {
      autosize: true,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        r: 0,
        t: 4
      },
      xaxis: {
        automargin: true,
        fixedrange: true,
        linewidth: 1,
        mirror: true,
        showgrid: true,
        title: {
          text: "Error"
        }
      },
      yaxis: {
        automargin: true,
        fixedrange: true,
        linewidth: 1,
        mirror: true,
        showgrid: true,
        title: {
          text: "Fairness"
        }
      }
    } as any
  };

  public constructor(props: IModelComparisonProps) {
    super(props);
    this.state = {
      errorBarsEnabled: this.props.errorPickerProps.errorBarsEnabled,
      fairnessKey: this.props.fairnessPickerProps.selectedFairnessKey,
      performanceKey: this.props.performancePickerProps.selectedPerformanceKey
    };
  }

  public render(): React.ReactNode {
    const styles = ModelComparisonChartStyles();
    const theme = getTheme();
    const sharedStyles = SharedStyles();

    let mainChart;
    if (
      !this.state ||
      this.state.performanceArray === undefined ||
      this.state.fairnessArray === undefined
    ) {
      this.loadData();
      mainChart = (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.Fairness.calculating}
        />
      );
    } else {
      const {
        fairnessArray,
        fairnessBounds,
        performanceBounds,
        errorBarsEnabled
      } = this.state;
      const data = this.state.performanceArray.map((performance, index) => {
        return {
          Fairness: fairnessArray[index],
          FairnessLowerBound: 0,
          FairnessUpperBound: 0,
          index,
          Performance: performance,
          PerformanceLowerBound: 0,
          PerformanceUpperBound: 0
        };
      });

      if (errorBarsEnabled) {
        if (_.isArray(performanceBounds)) {
          performanceBounds.forEach((bounds, index) => {
            if (bounds !== undefined) {
              data[index].PerformanceLowerBound =
                data[index].Performance - bounds.lower;
              data[index].PerformanceUpperBound =
                bounds.upper - data[index].Performance;
            }
          });
        }

        if (_.isArray(fairnessBounds)) {
          fairnessBounds.forEach((bounds, index) => {
            if (bounds !== undefined) {
              data[index].FairnessLowerBound =
                data[index].Fairness - bounds.lower;
              data[index].FairnessUpperBound =
                bounds.upper - data[index].Fairness;
            }
          });
        }
      }

      const selectedMetric =
        performanceOptions[
          this.props.performancePickerProps.selectedPerformanceKey
        ] ||
        this.props.performancePickerProps.performanceOptions.find(
          (metric) =>
            metric.key ===
            this.props.performancePickerProps.selectedPerformanceKey
        );

      const selectedFairnessMetric =
        fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey] ||
        this.props.fairnessPickerProps.fairnessOptions.find(
          (metric) =>
            metric.key === this.props.fairnessPickerProps.selectedFairnessKey
        );

      const props = _.cloneDeep(this.plotlyProps);

      const performanceMetricTitle = selectedMetric.title;
      const fairnessMetric =
        fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey];
      const fairnessMetricTitle = fairnessMetric.title;
      props.data = ChartBuilder.buildPlotlySeries(props.data[0], data).map(
        (series) => {
          if (series.name) {
            series.name = this.props.dashboardContext.modelNames[series.name];
          }

          series.customdata = [] as unknown as Datum[];
          const digitsOfPrecision = 4;

          for (let modelId = 0; modelId < data.length; modelId++) {
            const tempX = series.x ? series.x[modelId] : undefined;
            const tempY = series.y ? series.y[modelId] : undefined;
            const lowerErrorX =
              series?.error_x?.type === "data"
                ? series.error_x.arrayminus?.[modelId]
                : undefined;
            const upperErrorX =
              series?.error_x?.type === "data"
                ? series.error_x.array?.[modelId]
                : undefined;
            const lowerErrorY =
              series?.error_y?.type === "data"
                ? series.error_y.arrayminus?.[modelId]
                : undefined;
            const upperErrorY =
              series?.error_y?.type === "data"
                ? series.error_y.array?.[modelId]
                : undefined;

            const x =
              series.x && tempX !== undefined && typeof tempX == "number"
                ? tempX
                : undefined;
            const y =
              series.y && tempY !== undefined && typeof tempY == "number"
                ? tempY
                : undefined;

            const xBounds = this.formatBoundsTooltip(
              lowerErrorX,
              upperErrorX,
              digitsOfPrecision,
              x
            );
            const yBounds = this.formatBoundsTooltip(
              lowerErrorY,
              upperErrorY,
              digitsOfPrecision,
              y
            );

            series.customdata.push({
              modelId,
              x: x?.toFixed(digitsOfPrecision),
              xBounds,
              y: y?.toFixed(digitsOfPrecision),
              yBounds
            } as unknown as Datum);
            series.hovertemplate =
              "%{text} <br>%{xaxis.title.text}: %{customdata.x} %{customdata.xBounds}<br> %{yaxis.title.text}: %{customdata.y} %{customdata.yBounds}<extra></extra>";
          }

          series.text = this.props.dashboardContext.modelNames;
          return series;
        }
      );

      if (props.layout?.xaxis) {
        props.layout.xaxis.title = performanceMetricTitle;
      }
      if (props.layout?.yaxis) {
        props.layout.yaxis.title = fairnessMetricTitle;
      }

      // The help text for performance metrics needs to indicate
      // that a lower/higher value is better in the corresponding cases.
      const helpModalText1 = localization.formatString(
        localization.Fairness.ModelComparison.helpModalText1,
        selectedMetric.isMinimization
          ? localization.Fairness.ModelComparison.lower
          : localization.Fairness.ModelComparison.higher
      );

      /* The following modal text needs to indicate whether lower or higher
      is preferable given the selected fairness metric. For difference and
      maximum based metrics lower is preferable, for ratio and minimum based
      metrics higher is better. */
      const helpModalText2 = localization.formatString(
        localization.Fairness.ModelComparison.helpModalText2,
        new Set([FairnessModes.Difference, FairnessModes.Max]).has(
          fairnessMetric.fairnessMode
        )
          ? localization.Fairness.ModelComparison.lower
          : localization.Fairness.ModelComparison.higher
      );

      const helpString = [
        localization.Fairness.ModelComparison.introModalText,
        helpModalText1,
        helpModalText2
      ];

      mainChart = (
        <Stack horizontal>
          <Stack className={sharedStyles.mainLeft}>
            <CalloutHelpBar
              graphCalloutStrings={helpString}
              errorPickerProps={this.props.errorPickerProps}
              performanceBounds={this.state.performanceBounds}
              fairnessBounds={this.state.fairnessBounds}
              parentErrorChanged={this.errorChanged}
            />
            <div id="FairnessPerformanceTradeoffChart">
              <AccessibleChart
                plotlyProps={props}
                onClickHandler={this.props.onChartClick}
                theme={theme}
                themeOverride={{
                  axisGridColor: theme.semanticColors.disabledBorder
                }}
              />
            </div>
          </Stack>
          <Insights
            fairnessArray={this.state.fairnessArray}
            performanceArray={this.state.performanceArray}
            selectedMetric={selectedMetric}
            selectedFairnessMetric={selectedFairnessMetric}
            selectedPerformanceKey={
              this.props.performancePickerProps.selectedPerformanceKey
            }
          />
        </Stack>
      );
    }

    return (
      <Stack className={styles.frame}>
        <div className={sharedStyles.header} style={{ padding: "0 90px" }}>
          <Text variant={"large"} className={sharedStyles.headerTitle} block>
            {localization.Fairness.ModelComparison.title} <b>assessment</b>
          </Text>
        </div>
        <DropdownBar
          dashboardContext={this.props.dashboardContext}
          performancePickerProps={this.props.performancePickerProps}
          fairnessPickerProps={this.props.fairnessPickerProps}
          featureBinPickerProps={this.props.featureBinPickerProps}
          parentFeatureChanged={this.featureChanged}
          parentFairnessChanged={this.fairnessChanged}
          parentPerformanceChanged={this.performanceChanged}
        />
        {mainChart}
      </Stack>
    );
  }

  private async loadData(): Promise<void> {
    try {
      const performancePromises = new Array(this.props.modelCount)
        .fill(0)
        .map((_, modelIndex) => {
          return this.props.metricsCache.getMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            modelIndex,
            this.props.performancePickerProps.selectedPerformanceKey,
            this.props.errorPickerProps.errorBarsEnabled
          );
        });
      const fairnessOption =
        fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey];
      const fairnessPromises = new Array(this.props.modelCount)
        .fill(0)
        .map((_, modelIndex) => {
          return this.props.metricsCache.getFairnessMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            modelIndex,
            this.props.fairnessPickerProps.selectedFairnessKey,
            fairnessOption.fairnessMode,
            this.props.errorPickerProps.errorBarsEnabled
          );
        });

      const performanceResponse = await Promise.all(performancePromises);
      const fairnessResponse = await Promise.all(fairnessPromises);

      const performanceArray = performanceResponse.map((metric) => {
        return metric.global;
      });

      const performanceBounds = performanceResponse.map((metric) => {
        return metric.bounds;
      });

      const fairnessArray = fairnessResponse.map((metric) => {
        return metric.overall;
      });

      const fairnessBounds = fairnessResponse.map((metric) => {
        return metric.bounds;
      });

      this.setState({
        fairnessArray,
        fairnessBounds,
        performanceArray,
        performanceBounds
      });
    } catch {
      // todo;
    }
  }

  private readonly featureChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const featureKey = option.key.toString();
    if (this.state.featureKey !== featureKey) {
      const index =
        this.props.dashboardContext.modelMetadata.featureNames.indexOf(
          featureKey
        );
      this.props.featureBinPickerProps.selectedBinIndex = index;
      this.props.featureBinPickerProps.onBinChange(index);
      this.setState({
        fairnessArray: undefined,
        featureKey,
        performanceArray: undefined
      });
    }
  };

  private readonly performanceChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const performanceKey = option.key.toString();
    if (this.state.performanceKey !== performanceKey) {
      this.props.performancePickerProps.onPerformanceChange(performanceKey);
      this.setState({ performanceArray: undefined, performanceKey });
    }
  };

  private readonly fairnessChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const fairnessKey = option.key.toString();
    if (this.state.fairnessKey !== fairnessKey) {
      this.props.fairnessPickerProps.onFairnessChange(fairnessKey);
      this.setState({ fairnessArray: undefined, fairnessKey });
    }
  };

  private readonly errorChanged = (
    _ev: React.MouseEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    const errorBarsEnabled = checked;
    if (this.state.errorBarsEnabled !== errorBarsEnabled) {
      this.props.errorPickerProps.onErrorChange(errorBarsEnabled ?? false);
      this.setState({ errorBarsEnabled });
    }
  };

  private formatBoundsTooltip = (
    lowerError: Datum | undefined,
    upperError: Datum | undefined,
    digitsOfPrecision: number,
    baseMetric: number | undefined
  ): string => {
    return lowerError !== 0 &&
      upperError !== 0 &&
      typeof lowerError == "number" &&
      typeof upperError == "number" &&
      baseMetric !== undefined
      ? `[${(baseMetric - lowerError).toFixed(digitsOfPrecision)}, ${(
          baseMetric + upperError
        ).toFixed(digitsOfPrecision)}]`
      : "";
  };
}
