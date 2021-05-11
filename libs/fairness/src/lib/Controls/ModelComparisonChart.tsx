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
  ActionButton,
  PrimaryButton,
  IconButton,
  getTheme,
  Text,
  Spinner,
  SpinnerSize,
  Stack,
  Modal,
  IIconProps,
  IDropdownOption
} from "office-ui-fabric-react";
import React from "react";

import {
  IPerformancePickerPropsV2,
  IFeatureBinPickerPropsV2,
  IFairnessPickerPropsV2
} from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";

import { FairnessModes, fairnessOptions } from "./../util/FairnessMetrics";
import { IFairnessContext } from "./../util/IFairnessContext";
import { MetricsCache } from "./../util/MetricsCache";
import { performanceOptions } from "./../util/PerformanceMetrics";
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
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  onHideIntro: () => void;
  onEditConfigs: () => void;
  onChartClick?: (data?: any) => void;
}

export interface IState {
  showModalIntro?: boolean;
  showModalHelp?: boolean;
  featureKey?: string;
  performanceKey?: string;
  fairnessKey?: string;
  performanceArray?: number[];
  fairnessArray?: number[];
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
        yAccessor: "Fairness"
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
      fairnessKey: this.props.fairnessPickerProps.selectedFairnessKey,
      performanceKey: this.props.performancePickerProps.selectedPerformanceKey,
      showModalIntro: this.props.showIntro
    };
  }

  public render(): React.ReactNode {
    const styles = ModelComparisonChartStyles();
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
      const { fairnessArray } = this.state;
      const data = this.state.performanceArray.map((performance, index) => {
        return {
          Fairness: fairnessArray[index],
          index,
          Performance: performance
        };
      });

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
      props.data = ChartBuilder.buildPlotlySeries(props.data[0], data).map(
        (series) => {
          if (series.name)
            series.name = this.props.dashboardContext.modelNames[series.name];

          series.text = this.props.dashboardContext.modelNames;
          return series;
        }
      );

      const performanceMetricTitle = selectedMetric.title;
      const fairnessMetric =
        fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey];
      const fairnessMetricTitle = fairnessMetric.title;

      if (props.layout?.xaxis)
        props.layout.xaxis.title = performanceMetricTitle;

      if (props.layout?.yaxis) props.layout.yaxis.title = fairnessMetricTitle;

      const cancelIcon: IIconProps = { iconName: "Cancel" };

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

      mainChart = (
        <Stack horizontal>
          <Stack className={sharedStyles.mainLeft}>
            <Stack className={styles.howTo}>
              <ActionButton onClick={this.handleOpenModalHelp}>
                <div className={styles.infoButton}>i</div>
                {localization.Fairness.ModelComparison.howToRead}
              </ActionButton>
              <Modal
                titleAriaId="help modal"
                isOpen={this.state.showModalHelp}
                onDismiss={this.handleCloseModalHelp}
                isModeless={true}
                containerClassName={styles.modalContentHelp}
              >
                <IconButton
                  iconProps={cancelIcon}
                  ariaLabel="Close popup modal"
                  onClick={this.handleCloseModalHelp}
                />
                <p className={styles.modalContentHelpText}>
                  {localization.Fairness.ModelComparison.introModalText}
                  <br />
                  <br />
                  {helpModalText1}
                  <br />
                  <br />
                  {helpModalText2}
                </p>
                <div style={{ display: "flex", paddingBottom: "20px" }}>
                  <PrimaryButton
                    className={styles.doneButton}
                    onClick={this.handleCloseModalHelp}
                  >
                    {localization.Fairness.done}
                  </PrimaryButton>
                </div>
              </Modal>
            </Stack>
            <div id="FairnessPerformanceTradeoffChart">
              <AccessibleChart
                plotlyProps={props}
                onClickHandler={this.props.onChartClick}
                theme={getTheme()}
                themeOverride={{
                  axisGridColor: getTheme().semanticColors.disabledBorder
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
            this.props.performancePickerProps.selectedPerformanceKey
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
            fairnessOption.fairnessMode
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

  private readonly featureChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) return;

    const featureKey = option.key.toString();
    if (this.state.featureKey !== featureKey) {
      const index = this.props.dashboardContext.modelMetadata.featureNames.indexOf(
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
    if (!option) return;

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
    if (!option) return;

    const fairnessKey = option.key.toString();
    if (this.state.fairnessKey !== fairnessKey) {
      this.props.fairnessPickerProps.onFairnessChange(fairnessKey);
      this.setState({ fairnessArray: undefined, fairnessKey });
    }
  };

  private readonly handleOpenModalHelp = (): void => {
    this.setState({ showModalHelp: true });
  };

  private readonly handleCloseModalHelp = (): void => {
    this.setState({ showModalHelp: false });
  };
}
