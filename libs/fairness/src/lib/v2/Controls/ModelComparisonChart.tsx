// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  Modal,
  IIconProps,
  Icon
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTypes } from "../../IFairnessProps";
import { localization } from "../../Localization/localization";
import { accuracyOptions } from "../../util/AccuracyMetrics";
import { FormatMetrics } from "../../util/FormatMetrics";
import { IFairnessContext } from "../../util/IFairnessContext";
import { MetricsCache } from "../../util/MetricsCache";
import { parityOptions } from "../../util/ParityMetrics";
import {
  IAccuracyPickerPropsV2,
  IFeatureBinPickerPropsV2,
  IParityPickerPropsV2
} from "../FairnessWizard";

import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";

const theme = getTheme();
export interface IModelComparisonProps {
  showIntro: boolean;
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  modelCount: number;
  accuracyPickerProps: IAccuracyPickerPropsV2;
  parityPickerProps: IParityPickerPropsV2;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  onHideIntro: () => void;
  onEditConfigs: () => void;
  onChartClick?: (data?: any) => void;
}

export interface IState {
  showModalIntro?: boolean;
  showModalHelp?: boolean;
  featureKey?: string;
  accuracyKey?: string;
  parityKey?: string;
  accuracyArray?: number[];
  disparityArray?: number[];
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
        mode: PlotlyMode.TextMarkers,
        marker: {
          size: 14
        },
        textposition: "top",
        type: "scatter",
        xAccessor: "Accuracy",
        yAccessor: "Parity",
        hoverinfo: "text"
      } as any
    ],
    layout: {
      autosize: true,
      plot_bgcolor: theme.semanticColors.bodyFrameBackground,
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
        showgrid: false,
        title: {
          text: "Error"
        }
      },
      yaxis: {
        automargin: true,
        fixedrange: true,
        showgrid: false,
        title: {
          text: "Disparity"
        }
      }
    } as any
  };

  public constructor(props: IModelComparisonProps) {
    super(props);
    this.state = {
      showModalIntro: this.props.showIntro,
      accuracyKey: this.props.accuracyPickerProps.selectedAccuracyKey,
      parityKey: this.props.parityPickerProps.selectedParityKey
    };
  }

  public render(): React.ReactNode {
    const featureOptions: IDropdownOption[] = this.props.dashboardContext.modelMetadata.featureNames.map(
      (x) => {
        return { key: x, text: x };
      }
    );
    const accuracyDropDown: IDropdownOption[] = this.props.accuracyPickerProps.accuracyOptions.map(
      (x) => {
        return { key: x.key, text: x.title };
      }
    );
    const parityDropdown: IDropdownOption[] = this.props.parityPickerProps.parityOptions.map(
      (x) => {
        return { key: x.key, text: x.title };
      }
    );

    const dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { width: 180 },
      title: { borderRadius: "5px" }
    };

    const iconButtonStyles = {
      root: {
        color: theme.semanticColors.bodyText,
        marginLeft: "auto",
        marginTop: "4px",
        marginRight: "2px"
      },
      rootHovered: {
        color: theme.semanticColors.bodyBackgroundHovered
      }
    };

    const styles = ModelComparisonChartStyles();

    let mainChart;
    if (
      !this.state ||
      this.state.accuracyArray === undefined ||
      this.state.disparityArray === undefined
    ) {
      this.loadData();
      mainChart = (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.calculating}
        />
      );
    } else {
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
      let maxAccuracyIndex = 0;
      let minDisparityIndex = 0;
      this.state.accuracyArray.forEach((value, index) => {
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
        accuracyOptions[this.props.accuracyPickerProps.selectedAccuracyKey] ||
        this.props.accuracyPickerProps.accuracyOptions.find(
          (metric) =>
            metric.key === this.props.accuracyPickerProps.selectedAccuracyKey
        );

      const insights2 = localization.formatString(
        localization.ModelComparison.insightsText2,
        selectedMetric.title,
        formattedMinAccuracy,
        formattedMaxAccuracy,
        formattedMinDisparity,
        formattedMaxDisparity
      );

      const insights3 = localization.formatString(
        localization.ModelComparison.insightsText3,
        selectedMetric.title.toLowerCase(),
        selectedMetric.isMinimization
          ? formattedMinAccuracy
          : formattedMaxAccuracy,
        FormatMetrics.formatNumbers(
          this.state.disparityArray[
            selectedMetric.isMinimization ? minAccuracyIndex : maxAccuracyIndex
          ],
          this.props.accuracyPickerProps.selectedAccuracyKey
        )
      );

      const insights4 = localization.formatString(
        localization.ModelComparison.insightsText4,
        selectedMetric.title.toLowerCase(),
        FormatMetrics.formatNumbers(
          this.state.accuracyArray[minDisparityIndex],
          this.props.accuracyPickerProps.selectedAccuracyKey
        ),
        formattedMinDisparity
      );

      const props = _.cloneDeep(this.plotlyProps);
      props.data = ChartBuilder.buildPlotlySeries(props.data[0], data).map(
        (series) => {
          if (series.name) {
            series.name = this.props.dashboardContext.modelNames[series.name];
          }
          series.text = this.props.dashboardContext.modelNames;
          return series;
        }
      );

      const accuracyMetricTitle = selectedMetric.title;
      const parityMetricTitle =
        parityOptions[this.props.parityPickerProps.selectedParityKey].title;
      if (props.layout?.xaxis) {
        props.layout.xaxis.title = accuracyMetricTitle;
      }
      if (props.layout?.yaxis) {
        props.layout.yaxis.title = parityMetricTitle;
      }

      const cancelIcon: IIconProps = { iconName: "Cancel" };

      mainChart = (
        <div className={styles.main}>
          <div className={styles.mainLeft}>
            <div className={styles.howTo}>
              <Modal
                titleAriaId="intro modal"
                isOpen={this.state.showModalIntro}
                onDismiss={this.handleCloseModalIntro}
                isModeless={true}
                containerClassName={styles.modalContentIntro}
              >
                <div style={{ display: "flex" }}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close intro modal"
                    onClick={this.handleCloseModalIntro}
                  />
                </div>
                <p className={styles.modalContentIntroText}>
                  {localization.ModelComparison.introModalText}
                </p>
                <div style={{ display: "flex", paddingBottom: "20px" }}>
                  <PrimaryButton
                    className={styles.doneButton}
                    onClick={this.handleCloseModalIntro}
                  >
                    {localization.done}
                  </PrimaryButton>
                </div>
              </Modal>
              <ActionButton onClick={this.handleOpenModalHelp}>
                <div className={styles.infoButton}>i</div>
                {localization.ModelComparison.howToRead}
              </ActionButton>
              <Modal
                titleAriaId="help modal"
                isOpen={this.state.showModalHelp}
                onDismiss={this.handleCloseModalHelp}
                isModeless={true}
                containerClassName={styles.modalContentHelp}
              >
                <div style={{ display: "flex" }}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={this.handleCloseModalHelp}
                  />
                </div>
                <p className={styles.modalContentHelpText}>
                  {localization.ModelComparison.helpModalText1}
                  <br />
                  <br />
                  {localization.ModelComparison.helpModalText2}
                </p>
                <div style={{ display: "flex", paddingBottom: "20px" }}>
                  <PrimaryButton
                    className={styles.doneButton}
                    onClick={this.handleCloseModalHelp}
                  >
                    {localization.done}
                  </PrimaryButton>
                </div>
              </Modal>
            </div>
            <div className={styles.chart}>
              <AccessibleChart
                plotlyProps={props}
                onClickHandler={this.props.onChartClick}
                theme={undefined}
              />
            </div>
          </div>
          <div className={styles.mainRight}>
            <div className={styles.insights}>
              <Icon
                iconName="CRMCustomerInsightsApp"
                className={styles.insightsIcon}
              />
              <Text className={styles.insights} block>
                {localization.ModelComparison.insights}
              </Text>
            </div>
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
            <div className={styles.downloadReport}>
              <Icon iconName="Download" className={styles.downloadIcon} />
              <Text style={{ verticalAlign: "middle" }}>
                {localization.ModelComparison.downloadReport}
              </Text>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Stack className={styles.frame}>
        <div className={styles.header}>
          <Text variant={"large"} className={styles.headerTitle} block>
            {localization.ModelComparison.title} <b>assessment</b>
          </Text>
        </div>
        <div className={styles.headerOptions}>
          <Dropdown
            className={styles.dropDown}
            defaultSelectedKey={
              this.props.dashboardContext.modelMetadata.featureNames[
                this.props.featureBinPickerProps.selectedBinIndex
              ]
            }
            options={featureOptions}
            disabled={false}
            onChange={this.featureChanged}
            styles={dropdownStyles}
          />
          <Dropdown
            className={styles.dropDown}
            defaultSelectedKey={
              this.props.accuracyPickerProps.selectedAccuracyKey
            }
            options={accuracyDropDown}
            disabled={false}
            onChange={this.accuracyChanged}
            styles={dropdownStyles}
          />
          <Dropdown
            className={styles.dropDown}
            defaultSelectedKey={this.props.parityPickerProps.selectedParityKey}
            options={parityDropdown}
            disabled={false}
            onChange={this.parityChanged}
            styles={dropdownStyles}
          />
        </div>
        {mainChart}
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
      const parityOption =
        parityOptions[this.props.parityPickerProps.selectedParityKey];
      const disparityMetric =
        this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.BinaryClassification
          ? parityOption.parityMetric
          : "average";
      const parityMode = parityOption.parityMode;
      const disparityPromises = new Array(this.props.modelCount)
        .fill(0)
        .map((_, modelIndex) => {
          return this.props.metricsCache.getDisparityMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            modelIndex,
            disparityMetric,
            parityMode
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

  private readonly featureChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const featureKey = option.key.toString();
    if (this.state.featureKey !== featureKey) {
      this.props.featureBinPickerProps.selectedBinIndex = this.props.dashboardContext.modelMetadata.featureNames.indexOf(
        featureKey
      );
      this.setState({
        featureKey,
        accuracyArray: undefined,
        disparityArray: undefined
      });
    }
  };

  private readonly accuracyChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const accuracyKey = option.key.toString();
    if (this.state.accuracyKey !== accuracyKey) {
      this.props.accuracyPickerProps.onAccuracyChange(accuracyKey);
      this.setState({ accuracyKey, accuracyArray: undefined });
    }
  };

  private readonly parityChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const parityKey = option.key.toString();
    if (this.state.parityKey !== parityKey) {
      this.props.parityPickerProps.onParityChange(parityKey);
      this.setState({ parityKey, disparityArray: undefined });
    }
  };

  private readonly handleCloseModalIntro = (): void => {
    this.setState({ showModalIntro: false });
    this.props.onHideIntro();
  };

  private readonly handleOpenModalHelp = (): void => {
    this.setState({ showModalHelp: true });
  };

  private readonly handleCloseModalHelp = (): void => {
    this.setState({ showModalHelp: false });
  };
}
