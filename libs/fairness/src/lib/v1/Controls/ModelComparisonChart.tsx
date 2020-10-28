// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  ActionButton,
  ChoiceGroup,
  IChoiceGroupOption,
  Spinner,
  SpinnerSize,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTypes } from "../../IFairnessProps";
import { FormatMetrics } from "../../util/FormatMetrics";
import { IFairnessContext } from "../../util/IFairnessContext";
import { MetricsCache } from "../../util/MetricsCache";
import { FairnessModes } from "../../util/FairnessMetrics";
import { performanceOptions } from "../../util/PerformanceMetrics";
import {
  IPerformancePickerPropsV1,
  IFeatureBinPickerPropsV1,
  IFairnessPickerPropsV1
} from "../FairnessWizard";

import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";

const theme = getTheme();
export interface IModelComparisonProps {
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  modelCount: number;
  performancePickerProps: IPerformancePickerPropsV1;
  fairnessPickerProps: IFairnessPickerPropsV1;
  featureBinPickerProps: IFeatureBinPickerPropsV1;
  onEditConfigs: () => void;
  onChartClick?: (data: any) => void;
}

export interface IState {
  performanceArray?: Array<number | undefined>;
  fairnessArray?: number[];
  disparityInOutcomes: boolean;
}

export class ModelComparisonChart extends React.PureComponent<
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
        mode: PlotlyMode.Markers,
        type: "scatter",
        xAccessor: "Performance",
        yAccessor: "Fairness"
      }
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
        linecolor: theme.semanticColors.disabledBorder,
        linewidth: 1,
        mirror: true,
        title: {
          text: "Error"
        }
      },
      yaxis: {
        automargin: true,
        fixedrange: true,
        title: {
          text: "Fairness"
        }
      }
    } as any
  };

  public constructor(props: IModelComparisonProps) {
    super(props);
    this.state = {
      disparityInOutcomes: true
    };
  }

  public render(): React.ReactNode {
    const styles = ModelComparisonChartStyles();
    if (
      !this.state ||
      this.state.performanceArray === undefined ||
      this.state.fairnessArray === undefined
    ) {
      this.loadData();
      return (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.Fairness.calculating}
        />
      );
    }
    const { fairnessArray } = this.state;
    const data = this.state.performanceArray.map((performance, index) => {
      return {
        index,
        Fairness: fairnessArray[index],
        Performance: performance
      };
    });

    let minPerformance: number = Number.MAX_SAFE_INTEGER;
    let maxPerformance: number = Number.MIN_SAFE_INTEGER;
    let maxFairness: number = Number.MIN_SAFE_INTEGER;
    let minFairness: number = Number.MAX_SAFE_INTEGER;
    let minPerformanceIndex = 0;
    let maxPerformanceIndex = this.state.performanceArray[0];
    let minFairnessIndex = 0;
    this.state.performanceArray.forEach((value, index) => {
      if (value === undefined) {
        return;
      }
      if (value >= maxPerformance) {
        maxPerformanceIndex = index;
        maxPerformance = value;
      }
      if (value <= minPerformance) {
        minPerformanceIndex = index;
        minPerformance = value;
      }
    });
    this.state.fairnessArray.forEach((value, index) => {
      if (value >= maxFairness) {
        maxFairness = value;
      }
      if (value <= minFairness) {
        minFairnessIndex = index;
        minFairness = value;
      }
    });
    const formattedMinPerformance = FormatMetrics.formatNumbers(
      minPerformance,
      this.props.performancePickerProps.selectedPerformanceKey
    );
    const formattedMaxPerformance = FormatMetrics.formatNumbers(
      maxPerformance,
      this.props.performancePickerProps.selectedPerformanceKey
    );
    const formattedMinFairness = FormatMetrics.formatNumbers(
      minFairness,
      this.props.performancePickerProps.selectedPerformanceKey
    );
    const formattedMaxFairness = FormatMetrics.formatNumbers(
      maxFairness,
      this.props.performancePickerProps.selectedPerformanceKey
    );
    const selectedMetric =
      performanceOptions[
        this.props.performancePickerProps.selectedPerformanceKey
      ] ||
      this.props.performancePickerProps.performanceOptions.find(
        (metric) =>
          metric.key ===
          this.props.performancePickerProps.selectedPerformanceKey
      ) ||
      this.props.performancePickerProps.performanceOptions[0];
    const insights2 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText2,
      selectedMetric.title,
      formattedMinPerformance,
      formattedMaxPerformance,
      formattedMinFairness,
      formattedMaxFairness
    );
    const metricTitleAppropriateCase = selectedMetric.alwaysUpperCase
      ? selectedMetric.title
      : selectedMetric.title.toLowerCase();
    const insights3 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText3,
      metricTitleAppropriateCase,
      selectedMetric.isMinimization
        ? formattedMinPerformance
        : formattedMaxPerformance,
      localization.Fairness.ModelComparison.insightsText3v1FairnessMetric,
      FormatMetrics.formatNumbers(
        minPerformanceIndex === undefined || maxPerformanceIndex === undefined
          ? undefined
          : this.state.fairnessArray[
              selectedMetric.isMinimization
                ? minPerformanceIndex
                : maxPerformanceIndex
            ],
        this.props.performancePickerProps.selectedPerformanceKey
      )
    );

    const insights4 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText4,
      metricTitleAppropriateCase,
      FormatMetrics.formatNumbers(
        this.state.performanceArray[minFairnessIndex],
        this.props.performancePickerProps.selectedPerformanceKey
      ),
      formattedMinFairness
    );

    const howToReadText = localization.formatString(
      localization.Fairness.ModelComparison.howToReadText,
      this.props.modelCount.toString(),
      metricTitleAppropriateCase,
      selectedMetric.isMinimization
        ? localization.Fairness.ModelComparison.lower
        : localization.Fairness.ModelComparison.higher
    );

    const props = _.cloneDeep(this.plotlyProps);
    props.data = ChartBuilder.buildPlotlySeries(props.data[0], data).map(
      (series) => {
        series.name = this.props.dashboardContext.modelNames[series.name || ""];
        series.text = this.props.dashboardContext.modelNames;
        return series;
      }
    );
    const performanceMetricTitle = selectedMetric.title;
    if (props.layout?.xaxis) {
      props.layout.xaxis.title = performanceMetricTitle;
    }
    if (props.layout?.yaxis) {
      props.layout.yaxis.title = this.state.disparityInOutcomes
        ? localization.Fairness.ModelComparison.disparityInOutcomes
        : localization.formatString(
            localization.Fairness.ModelComparison.disparityInPerformance,
            metricTitleAppropriateCase
          );
    }
    return (
      <Stack className={styles.frame}>
        <div className={styles.header}>
          <Text variant={"large"} className={styles.headerTitle} block>
            {localization.Fairness.ModelComparison.title}
          </Text>
          <ActionButton
            iconProps={{ iconName: "Edit" }}
            onClick={this.props.onEditConfigs}
            className={styles.editButton}
            autoFocus={true}
          >
            {localization.Fairness.Report.editConfiguration}
          </ActionButton>
        </div>
        <div className={styles.main}>
          <div className={styles.chart}>
            <AccessibleChart
              plotlyProps={props}
              onClickHandler={this.props.onChartClick}
              theme={undefined}
            />
          </div>
          <div className={styles.mainRight}>
            <Text className={styles.rightTitle} block>
              {localization.Fairness.ModelComparison.howToRead}
            </Text>
            <Text className={styles.rightText} block>
              {howToReadText}
            </Text>
            <Text className={styles.insights} block>
              {localization.Fairness.ModelComparison.insightsLegacy}
            </Text>
            <div className={styles.insightsText}>
              <Text className={styles.textSection} block>
                {insights2}
              </Text>
              <Text className={styles.textSection} block>
                {insights3}
              </Text>
              <Text className={styles.textSection} block>
                {insights4}
              </Text>
            </div>
          </div>
        </div>
        <div>
          <ChoiceGroup
            className={styles.radio}
            selectedKey={
              this.state.disparityInOutcomes ? "outcomes" : "performance"
            }
            options={[
              {
                key: "performance",
                styles: { choiceFieldWrapper: styles.radioOptions },
                text: localization.formatString(
                  localization.Fairness.ModelComparison.disparityInPerformance,
                  metricTitleAppropriateCase
                )
              },
              {
                key: "outcomes",
                styles: { choiceFieldWrapper: styles.radioOptions },
                text: localization.Fairness.ModelComparison.disparityInOutcomes
              }
            ]}
            onChange={this.fairnessChanged}
            label={localization.Fairness.ModelComparison.howToMeasureDisparity}
            required={false}
          ></ChoiceGroup>
        </div>
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
            this.props.performancePickerProps.selectedPerformanceKey
          );
        });
      const fairnessMetric = this.getFairnessMetric();
      const fairnessPromises = new Array(this.props.modelCount)
        .fill(0)
        .map((_, modelIndex) => {
          return this.props.metricsCache.getFairnessMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            modelIndex,
            fairnessMetric,
            FairnessModes.Difference
          );
        });

      const performanceArray = (await Promise.all(performancePromises)).map(
        (metric) => metric.global
      );
      const fairnessArray = await Promise.all(fairnessPromises);
      this.setState({ fairnessArray, performanceArray });
    } catch {
      // todo;
    }
  }

  private getFairnessMetric(): string {
    if (this.state.disparityInOutcomes) {
      if (
        this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.BinaryClassification
      ) {
        return "selection_rate";
      }
      return "average";
    }
    return this.props.performancePickerProps.selectedPerformanceKey;
  }

  private readonly fairnessChanged = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    const disparityInOutcomes = option?.key !== "performance";
    if (this.state.disparityInOutcomes !== disparityInOutcomes) {
      this.setState({ fairnessArray: undefined, disparityInOutcomes });
    }
  };
  // TODO: Reuse if multiselect re-enters design
  // private readonly applySelections = (chartId: string, selectionIds: string[], plotlyProps: IPlotlyProperty) => {
  //     if (!plotlyProps.data || plotlyProps.data.length === 0) {
  //         return;
  //     }
  //     const customData: string[] = (plotlyProps.data[0] as any).customdata;
  //     if (!customData) {
  //         return;
  //     }
  //     const colors = customData.map(modelIndex => {
  //         const selectedIndex = this.props.selections.selectedIds.indexOf(modelIndex);
  //         if (selectedIndex !== -1) {
  //             return FabricStyles.plotlyColorPalette[selectedIndex % FabricStyles.plotlyColorPalette.length];
  //         }
  //         return "#111111";
  //     });
  //     const shapes = customData.map(modelIndex => {
  //         const selectedIndex = this.props.selections.selectedIds.indexOf(modelIndex);
  //         if (selectedIndex !== -1) {
  //             return 1
  //         }
  //         return 0;
  //     });
  //     Plotly.restyle(chartId, 'marker.color' as any, [colors] as any);
  //     Plotly.restyle(chartId, 'marker.symbol' as any, [shapes] as any);
  // }
}
