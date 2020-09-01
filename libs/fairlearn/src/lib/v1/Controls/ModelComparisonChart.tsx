import _ from "lodash";
import {
  AccessibleChart,
  ChartBuilder,
  IPlotlyProperty,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
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
import { AccuracyOptions } from "../../util/AccuracyMetrics";
import {
  IAccuracyPickerPropsV1,
  IFeatureBinPickerPropsV1,
  IParityPickerPropsV1
} from "../FairnessWizard";
import { FormatMetrics } from "../../util/FormatMetrics";
import { IFairnessContext } from "../../util/IFairnessContext";
import { PredictionTypes } from "../../IFairnessProps";
import { localization } from "../../Localization/localization";
import { MetricsCache } from "../../util/MetricsCache";
import { ParityModes } from "../../util/ParityMetrics";
import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";

const theme = getTheme();
export interface IModelComparisonProps {
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  modelCount: number;
  accuracyPickerProps: IAccuracyPickerPropsV1;
  parityPickerProps: IParityPickerPropsV1;
  featureBinPickerProps: IFeatureBinPickerPropsV1;
  onEditConfigs: () => void;
  onChartClick?: (data: any) => void;
}

export interface IState {
  accuracyArray?: Array<number | undefined>;
  disparityArray?: number[];
  disparityInOutcomes: boolean;
}

export class ModelComparisonChart extends React.PureComponent<
  IModelComparisonProps,
  IState
> {
  private readonly plotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      responsive: true,
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
      ]
    },
    data: [
      {
        datapointLevelAccessors: {
          customdata: {
            path: ["index"],
            plotlyPath: "customdata"
          }
        },
        mode: PlotlyMode.markers,
        marker: {
          size: 14
        },
        type: "scatter",
        xAccessor: "Accuracy",
        yAccessor: "Parity",
        hoverinfo: "text"
      }
    ],
    layout: {
      autosize: true,
      font: {
        size: 10
      },
      margin: {
        t: 4,
        r: 0
      },
      hovermode: "closest",
      xaxis: {
        automargin: true,
        fixedrange: true,
        mirror: true,
        linecolor: theme.semanticColors.disabledBorder,
        linewidth: 1,
        title: {
          text: "Error"
        }
      },
      yaxis: {
        automargin: true,
        fixedrange: true,
        title: {
          text: "Disparity"
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
      this.state.accuracyArray === undefined ||
      this.state.disparityArray === undefined
    ) {
      this.loadData();
      return (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.calculating}
        />
      );
    }
    const { disparityArray } = this.state;
    const data = this.state.accuracyArray.map((accuracy, index) => {
      return {
        Parity: disparityArray[index],
        Accuracy: accuracy,
        index
      };
    });

    let minAccuracy: number = Number.MAX_SAFE_INTEGER;
    let maxAccuracy: number = Number.MIN_SAFE_INTEGER;
    let maxDisparity: number = Number.MIN_SAFE_INTEGER;
    let minDisparity: number = Number.MAX_SAFE_INTEGER;
    let minAccuracyIndex = 0;
    let maxAccuracyIndex = this.state.accuracyArray[0];
    let minDisparityIndex = 0;
    this.state.accuracyArray.forEach((value, index) => {
      if (value === undefined) {
        return;
      }
      if (value >= maxAccuracy) {
        maxAccuracyIndex = index;
        maxAccuracy = value;
      }
      if (value <= minAccuracy) {
        minAccuracyIndex = index;
        minAccuracy = value;
      }
    });
    this.state.disparityArray.forEach((value, index) => {
      if (value >= maxDisparity) {
        maxDisparity = value;
      }
      if (value <= minDisparity) {
        minDisparityIndex = index;
        minDisparity = value;
      }
    });
    const formattedMinAccuracy = FormatMetrics.formatNumbers(
      minAccuracy,
      this.props.accuracyPickerProps.selectedAccuracyKey
    );
    const formattedMaxAccuracy = FormatMetrics.formatNumbers(
      maxAccuracy,
      this.props.accuracyPickerProps.selectedAccuracyKey
    );
    const formattedMinDisparity = FormatMetrics.formatNumbers(
      minDisparity,
      this.props.accuracyPickerProps.selectedAccuracyKey
    );
    const formattedMaxDisparity = FormatMetrics.formatNumbers(
      maxDisparity,
      this.props.accuracyPickerProps.selectedAccuracyKey
    );
    const selectedMetric =
      AccuracyOptions[this.props.accuracyPickerProps.selectedAccuracyKey] ||
      this.props.accuracyPickerProps.accuracyOptions.find(
        (metric) =>
          metric.key === this.props.accuracyPickerProps.selectedAccuracyKey
      ) ||
      this.props.accuracyPickerProps.accuracyOptions[0];
    const insights2 = localization.formatString(
      localization.ModelComparison.insightsText2,
      selectedMetric.title,
      formattedMinAccuracy,
      formattedMaxAccuracy,
      formattedMinDisparity,
      formattedMaxDisparity
    );
    const metricTitleAppropriateCase = selectedMetric.alwaysUpperCase
      ? selectedMetric.title
      : selectedMetric.title.toLowerCase();
    const insights3 = localization.formatString(
      localization.ModelComparison.insightsText3,
      metricTitleAppropriateCase,
      selectedMetric.isMinimization
        ? formattedMinAccuracy
        : formattedMaxAccuracy,
      FormatMetrics.formatNumbers(
        minAccuracyIndex === undefined || maxAccuracyIndex === undefined
          ? undefined
          : this.state.disparityArray[
              selectedMetric.isMinimization
                ? minAccuracyIndex
                : maxAccuracyIndex
            ],
        this.props.accuracyPickerProps.selectedAccuracyKey
      )
    );

    const insights4 = localization.formatString(
      localization.ModelComparison.insightsText4,
      metricTitleAppropriateCase,
      FormatMetrics.formatNumbers(
        this.state.accuracyArray[minDisparityIndex],
        this.props.accuracyPickerProps.selectedAccuracyKey
      ),
      formattedMinDisparity
    );

    const howToReadText = localization.formatString(
      localization.ModelComparison.howToReadText,
      this.props.modelCount.toString(),
      metricTitleAppropriateCase,
      selectedMetric.isMinimization
        ? localization.ModelComparison.lower
        : localization.ModelComparison.higher
    );

    const props = _.cloneDeep(this.plotlyProps);
    props.data = ChartBuilder.buildPlotlySeries(props.data[0], data).map(
      (series) => {
        series.name = this.props.dashboardContext.modelNames[series.name || ""];
        series.text = this.props.dashboardContext.modelNames;
        return series;
      }
    );
    const accuracyMetricTitle = selectedMetric.title;
    if (props.layout?.xaxis) {
      props.layout.xaxis.title = accuracyMetricTitle;
    }
    if (props.layout?.yaxis) {
      props.layout.yaxis.title = this.state.disparityInOutcomes
        ? localization.ModelComparison.disparityInOutcomes
        : localization.formatString(
            localization.ModelComparison.disparityInAccuracy,
            metricTitleAppropriateCase
          );
    }
    return (
      <Stack className={styles.frame}>
        <div className={styles.header}>
          <Text variant={"large"} className={styles.headerTitle} block>
            {localization.ModelComparison.title}
          </Text>
          <ActionButton
            iconProps={{ iconName: "Edit" }}
            onClick={this.props.onEditConfigs}
            className={styles.editButton}
            autoFocus={true}
          >
            {localization.Report.editConfiguration}
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
              {localization.ModelComparison.howToRead}
            </Text>
            <Text className={styles.rightText} block>
              {howToReadText}
            </Text>
            <Text className={styles.insights} block>
              {localization.ModelComparison.insightsLegacy}
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
              this.state.disparityInOutcomes ? "outcomes" : "accuracy"
            }
            options={[
              {
                key: "accuracy",
                text: localization.formatString(
                  localization.ModelComparison.disparityInAccuracy,
                  metricTitleAppropriateCase
                ) as string,
                styles: { choiceFieldWrapper: styles.radioOptions }
              },
              {
                key: "outcomes",
                text: localization.ModelComparison.disparityInOutcomes,
                styles: { choiceFieldWrapper: styles.radioOptions }
              }
            ]}
            onChange={this.disparityChanged}
            label={localization.ModelComparison.howToMeasureDisparity}
            required={false}
          ></ChoiceGroup>
        </div>
      </Stack>
    );
  }

  private async loadData(): Promise<void> {
    try {
      const accuracyPromises = new Array(this.props.modelCount)
        .fill(0)
        .map((_, modelIndex) => {
          return this.props.metricsCache.getMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            modelIndex,
            this.props.accuracyPickerProps.selectedAccuracyKey
          );
        });
      const disparityMetric = this.state.disparityInOutcomes
        ? this.props.dashboardContext.modelMetadata.PredictionType ===
          PredictionTypes.binaryClassification
          ? "selection_rate"
          : "average"
        : this.props.accuracyPickerProps.selectedAccuracyKey;
      const disparityPromises = new Array(this.props.modelCount)
        .fill(0)
        .map((_, modelIndex) => {
          return this.props.metricsCache.getDisparityMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            modelIndex,
            disparityMetric,
            ParityModes.difference
          );
        });

      const accuracyArray = (await Promise.all(accuracyPromises)).map(
        (metric) => metric.global
      );
      const disparityArray = await Promise.all(disparityPromises);
      this.setState({ accuracyArray, disparityArray });
    } catch {
      // todo;
    }
  }

  private readonly disparityChanged = (
    _ev?: React.FormEvent<HTMLInputElement | HTMLElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    const disparityInOutcomes = option?.key !== "accuracy";
    if (this.state.disparityInOutcomes !== disparityInOutcomes) {
      this.setState({ disparityInOutcomes, disparityArray: undefined });
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
