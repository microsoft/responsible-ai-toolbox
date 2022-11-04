// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  IDropdownOption,
  Dropdown,
  Text,
  Link,
  Slider,
  Stack,
  Toggle
} from "@fluentui/react";
import {
  Cohort,
  JointDataset,
  WeightVectorOption,
  ModelExplanationUtils,
  ChartTypes,
  IGenericChartProps,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles,
  LabelWithCallout,
  FeatureImportanceDependence,
  FeatureImportanceBar,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import { Dictionary } from "lodash";
import React from "react";

import { explainerCalloutDictionary } from "../ExplainerCallouts/explainerCalloutDictionary";
import { GlobalOnlyChart } from "../GlobalOnlyChart/GlobalOnlyChart";

import { globalTabStyles } from "./GlobalExplanationTab.styles";
import { IGlobalSeries } from "./IGlobalSeries";
import { SidePanel } from "./SidePanel";

export interface IGlobalBarSettings {
  topK: number;
  sortOption: string;
  includeOverallGlobal: boolean;
}

export interface IGlobalExplanationTabProps {
  cohorts: Cohort[];
  cohortIDs: string[];
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: Dictionary<string>;
  explanationMethod?: string;
  initialCohortIndex?: number;
  onWeightChange: (option: WeightVectorOption) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

interface IGlobalExplanationTabState {
  topK: number;
  sortingSeriesIndex: number;
  sortArray: number[];
  seriesIsActive: boolean[];
  selectedCohortIndex: number;
  selectedFeatureIndex?: number;
  chartType: ChartTypes;
  globalBarSettings?: IGlobalBarSettings;
  dependenceProps?: IGenericChartProps;
  cohortSeries: IGlobalSeries[];
  logarithmicScaling: boolean;
}

export class GlobalExplanationTab extends React.PureComponent<
  IGlobalExplanationTabProps,
  IGlobalExplanationTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly explainerCalloutInfo = this.props.explanationMethod
    ? explainerCalloutDictionary[this.props.explanationMethod]
    : undefined;

  private depPlot = React.createRef<HTMLDivElement>();

  private defaultMinK = 4;

  public constructor(props: IGlobalExplanationTabProps) {
    super(props);

    let initialCohortIndex = 0;
    if (this.props.initialCohortIndex !== undefined) {
      initialCohortIndex = this.props.initialCohortIndex;
    }
    this.state = {
      chartType: ChartTypes.Bar,
      cohortSeries: [],
      logarithmicScaling: false,
      selectedCohortIndex: initialCohortIndex,
      seriesIsActive: this.props.cohorts.map(() => true),
      sortArray: [],
      sortingSeriesIndex: 0,
      topK: this.defaultMinK
    };
  }

  public componentDidMount(): void {
    if (!this.context.jointDataset.hasLocalExplanations) {
      return;
    }

    const sortArray = ModelExplanationUtils.getSortIndices(
      this.props.cohorts[
        this.state.selectedCohortIndex
      ].calculateAverageImportance()
    ).reverse();

    const cohortSeries = this.getGlobalSeries();
    this.setState({
      cohortSeries,
      globalBarSettings: this.getDefaultSettings(),
      sortArray
    });
  }

  public componentDidUpdate(prevProps: IGlobalExplanationTabProps): void {
    if (
      this.props.cohorts !== prevProps.cohorts ||
      this.props.selectedWeightVector !== prevProps.selectedWeightVector
    ) {
      this.updateIncludedCohortsOnCohortEdit();
    }
  }

  public render(): React.ReactNode {
    const classNames = globalTabStyles();

    if (!this.context.jointDataset.hasLocalExplanations) {
      return <GlobalOnlyChart />;
    }

    if (this.state.globalBarSettings === undefined) {
      return <div />;
    }
    const cohortOptions: IDropdownOption[] = this.props.cohorts.map(
      (cohort, index) => {
        return { key: index, text: cohort.name };
      }
    );
    const featureOptions: IDropdownOption[] = [];
    for (let i = 0; i < this.context.jointDataset.datasetFeatureCount; i++) {
      const key = JointDataset.DataLabelRoot + i.toString();
      featureOptions.push({
        key,
        text: this.context.jointDataset.metaDict[key].label
      });
    }
    const selectedMeta = this.state.dependenceProps?.xAxis.property
      ? this.context.jointDataset.metaDict[
          this.state.dependenceProps?.xAxis.property
        ]
      : undefined;

    return (
      <Stack horizontal={false} className={classNames.page}>
        <Stack.Item className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.Interpret.GlobalTab.helperText}
          </Text>
        </Stack.Item>
        <Stack.Item className={classNames.topK}>
          <div id="TopKSliderContainer">
            <Slider
              label={localization.formatString(
                localization.Interpret.GlobalTab.topAtoB,
                this.state.topK
              )}
              ariaLabel={
                localization.Interpret.AggregateImportance.topKFeatures
              }
              max={this.context.jointDataset.localExplanationFeatureCount}
              min={1}
              step={1}
              value={this.state.topK}
              onChange={this.setTopK}
              showValue={false}
            />
          </div>
        </Stack.Item>
        <Stack.Item className={classNames.chartCallout}>
          {this.explainerCalloutInfo && (
            <LabelWithCallout
              label={
                localization.Interpret.ExplanationSummary.whatDoFeatureMean
              }
              calloutTitle={this.explainerCalloutInfo.title}
              type="button"
              calloutEventName={
                TelemetryEventName.FeatureImportancesWhatDoValuesMeanCalloutClick
              }
              telemetryHook={this.props.telemetryHook}
            >
              <Text block>{this.explainerCalloutInfo.description}</Text>
              {this.explainerCalloutInfo.linkUrl && (
                <Link href={this.explainerCalloutInfo.linkUrl} target="_blank">
                  {localization.Interpret.ExplanationSummary.clickHere}
                </Link>
              )}
            </LabelWithCallout>
          )}
        </Stack.Item>
        <Stack.Item>
          <Stack
            horizontal
            id="featureImportanceChartContainer"
            className={classNames.chartContainer}
          >
            <Stack.Item className={classNames.chartLeftPart}>
              <FeatureImportanceBar
                jointDataset={this.context.jointDataset}
                yAxisLabels={[
                  localization.Interpret.GlobalTab.aggregateFeatureImportance
                ]}
                sortArray={this.state.sortArray}
                chartType={this.state.chartType}
                unsortedX={this.context.modelMetadata.featureNames}
                originX={this.context.modelMetadata.featureNames}
                unsortedSeries={this.getActiveCohortSeries(
                  this.state.seriesIsActive
                )}
                topK={this.state.topK}
                onFeatureSelection={this.onFeatureSelection}
                selectedFeatureIndex={this.state.selectedFeatureIndex}
              />
            </Stack.Item>
            <Stack.Item>
              <SidePanel
                cohortSeries={this.state.cohortSeries}
                cohorts={this.props.cohorts}
                metadata={this.context.modelMetadata}
                onWeightChange={this.props.onWeightChange}
                selectedWeightVector={this.props.selectedWeightVector}
                seriesIsActive={this.state.seriesIsActive}
                setSortIndex={this.setSortIndex}
                sortingSeriesIndex={this.state.sortingSeriesIndex}
                toggleActivation={this.toggleActivation}
                weightLabels={this.props.weightLabels}
                weightOptions={this.props.weightOptions}
                onChartTypeChange={this.onChartTypeChange}
                chartType={this.state.chartType}
                telemetryHook={this.props.telemetryHook}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        {!this.context.jointDataset.hasDataset && (
          <Stack.Item>
            <MissingParametersPlaceholder>
              {localization.Interpret.GlobalTab.datasetRequired}
            </MissingParametersPlaceholder>
          </Stack.Item>
        )}
        {this.context.jointDataset.hasDataset && (
          <>
            <Stack.Item className={classNames.chartCallout}>
              <LabelWithCallout
                label={localization.Interpret.Charts.howToRead}
                calloutTitle={
                  localization.Interpret.GlobalTab.dependencePlotTitle
                }
                type="button"
                telemetryHook={this.props.telemetryHook}
                calloutEventName={
                  TelemetryEventName.FeatureImportancesHowToReadChartCalloutClick
                }
              >
                <Text>
                  {localization.Interpret.GlobalTab.dependencePlotHelperText}
                </Text>
              </LabelWithCallout>
            </Stack.Item>
            <Stack.Item>
              <Stack
                horizontal
                className={classNames.dependencePlotChartContainer}
              >
                <Stack.Item className={classNames.chartLeftPart}>
                  <div
                    id="DependencePlot"
                    className={classNames.secondaryChartAndLegend}
                    ref={this.depPlot}
                  >
                    <FeatureImportanceDependence
                      chartProps={this.state.dependenceProps}
                      cohortIndex={this.state.selectedCohortIndex}
                      cohort={
                        this.props.cohorts[this.state.selectedCohortIndex]
                      }
                      jointDataset={this.context.jointDataset}
                      logarithmicScaling={this.state.logarithmicScaling}
                      metadata={this.context.modelMetadata}
                      selectedWeight={this.props.selectedWeightVector}
                      selectedWeightLabel={
                        this.props.weightLabels[this.props.selectedWeightVector]
                      }
                    />
                  </div>
                </Stack.Item>
                <Stack.Item className={classNames.legendAndSort}>
                  {featureOptions && (
                    <ComboBox
                      id="DependencePlotFeatureSelection"
                      label={
                        localization.Interpret.GlobalTab.viewDependencePlotFor
                      }
                      options={featureOptions}
                      allowFreeform={false}
                      autoComplete="on"
                      placeholder={
                        localization.Interpret.GlobalTab
                          .dependencePlotFeatureSelectPlaceholder
                      }
                      selectedKey={this.state.dependenceProps?.xAxis.property}
                      onChange={this.onXSet}
                      calloutProps={FluentUIStyles.calloutProps}
                    />
                  )}
                  {cohortOptions && (
                    <Dropdown
                      label={
                        localization.Interpret.GlobalTab.datasetCohortSelector
                      }
                      options={cohortOptions}
                      selectedKey={this.state.selectedCohortIndex}
                      onChange={this.setSelectedCohort}
                    />
                  )}
                  {featureOptions &&
                    (selectedMeta?.featureRange?.rangeType ===
                      RangeTypes.Integer ||
                      selectedMeta?.featureRange?.rangeType ===
                        RangeTypes.Numeric) && (
                      <Toggle
                        key="logarithmic-scaling-toggle"
                        label={
                          localization.Interpret.AxisConfigDialog
                            .logarithmicScaling
                        }
                        inlineLabel
                        checked={this.state.logarithmicScaling}
                        onChange={this.setLogarithmicScaling}
                      />
                    )}
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </>
        )}
      </Stack>
    );
  }

  private readonly setLogarithmicScaling = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    if (checked === undefined || checked === this.state.logarithmicScaling) {
      return;
    }
    this.setState({ logarithmicScaling: checked });
  };

  private setSelectedCohort = (
    _event: React.FormEvent,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedCohortIndex: item.key as number });
    }
  };

  private setTopK = (newValue: number): void => {
    this.setState({ topK: newValue });
  };

  private onChartTypeChange = (chartType: ChartTypes): void => {
    this.setState({ chartType });
  };

  private toggleActivation = (index: number): void => {
    const seriesIsActive = [...this.state.seriesIsActive];
    seriesIsActive[index] = !seriesIsActive[index];
    this.setState({
      seriesIsActive
    });
  };

  private getGlobalSeries(): IGlobalSeries[] {
    return this.props.cohorts.map((cohort, i) => {
      return {
        colorIndex: i,
        name: cohort.name,
        unsortedAggregateY: cohort.calculateAverageImportance(),
        unsortedIndividualY: cohort.transposedLocalFeatureImportances()
      };
    });
  }

  // This can probably be done cheaper by passing the active array to the charts, and zeroing
  // the series in the plotlyProps. Later optimization.
  private getActiveCohortSeries(
    activeArray: boolean[],
    cohortSeries?: IGlobalSeries[]
  ): IGlobalSeries[] {
    // In the initial call this.state.cohortSeries isn't set yet.
    // The cohortSeries optional arg solves that problem.
    if (cohortSeries) {
      return cohortSeries.filter((_series, idx) => activeArray[idx]);
    }
    return this.state.cohortSeries.filter((_series, idx) => activeArray[idx]);
  }

  private updateIncludedCohortsOnCohortEdit(): void {
    let selectedCohortIndex = this.state.selectedCohortIndex;
    if (selectedCohortIndex >= this.props.cohorts.length) {
      selectedCohortIndex = 0;
    }
    const seriesIsActive: boolean[] = this.props.cohorts.map(() => true);
    this.setState({
      cohortSeries: this.getGlobalSeries(),
      selectedCohortIndex,
      seriesIsActive
    });
  }

  private getDefaultSettings(): IGlobalBarSettings | undefined {
    const result: IGlobalBarSettings = {} as IGlobalBarSettings;
    result.topK = Math.min(
      this.context.jointDataset.localExplanationFeatureCount,
      4
    );
    result.sortOption = "global";
    result.includeOverallGlobal = true;
    return result;
  }

  private setSortIndex = (newIndex: number): void => {
    const sortArray = ModelExplanationUtils.getSortIndices(
      this.state.cohortSeries[newIndex].unsortedAggregateY
    ).reverse();
    this.setState({ sortArray, sortingSeriesIndex: newIndex });
  };

  private onXSet = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const key = item.key;
      const index = this.context.jointDataset.metaDict[key].index;
      if (index !== undefined) {
        this.handleFeatureSelection(this.state.selectedCohortIndex, index);
      }
    }
  };
  private onFeatureSelection = (
    cohortIndex: number,
    featureIndex: number
  ): void => {
    for (let i = 0; i < this.state.seriesIsActive.length; i++) {
      if (!this.state.seriesIsActive[i]) {
        continue;
      }
      if (cohortIndex-- === 0) {
        this.props.telemetryHook?.({
          level: TelemetryLevels.ButtonClick,
          type: TelemetryEventName.AggregateFeatureImportanceNewDependenceSelected
        });
        this.handleFeatureSelection(i, featureIndex);
        return;
      }
    }
  };

  private handleFeatureSelection = (
    cohortIndex: number,
    featureIndex: number
  ): void => {
    // set to dependence plot initially, can be changed if other feature importances available
    const xKey = JointDataset.DataLabelRoot + featureIndex.toString();
    const xIsDithered =
      this.context.jointDataset.metaDict[xKey]?.treatAsCategorical;
    const yKey =
      JointDataset.ReducedLocalImportanceRoot + featureIndex.toString();
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Scatter,
      xAxis: {
        options: {
          bin: false,
          dither: xIsDithered
        },
        property: xKey
      },
      yAxis: {
        options: {},
        property: yKey
      }
    };
    this.setState({
      dependenceProps: chartProps,
      selectedCohortIndex: cohortIndex,
      selectedFeatureIndex: featureIndex
    });
    // some how scroll does not work in studio under certain reslution
    // put a manual timeout to handle the issue
    setTimeout(() => {
      this.depPlot.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }, 0.5);
  };
}
