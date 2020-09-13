import React from "react";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  Dropdown,
  Icon,
  Text,
  IconButton,
  DirectionalHint,
  Callout,
  CommandBarButton,
  Link,
  Slider
} from "office-ui-fabric-react";

import { JointDataset } from "../../JointDataset";
import {
  IExplanationModelMetadata,
  ModelTypes
} from "../../IExplanationContext";
import { localization } from "../../../Localization/localization";
import { DependencePlot } from "../DependencePlot/DependencePlot";
import { ChartTypes } from "../../ChartTypes";
import { IGenericChartProps } from "../../IGenericChartProps";
import { ModelExplanationUtils } from "../../ModelExplanationUtils";
import { FabricStyles } from "../../FabricStyles";
import { Cohort } from "../../Cohort";
import { FeatureImportanceBar } from "../FeatureImportanceBar/FeatureImportanceBar";
import { WeightVectorOption } from "../../IWeightedDropdownContext";
import { GlobalOnlyChart } from "../GlobalOnlyChart/GlobalOnlyChart";
import { explainerCalloutDictionary } from "../ExplainerCallouts/explainerCalloutDictionary";
import { InteractiveLegend } from "../InteractiveLegend/InteractiveLegend";
import { globalTabStyles } from "./GlobalExplanationTab.styles";
import { IGlobalSeries } from "./IGlobalSeries";
import { Settings } from "./Settings";

export interface IGlobalBarSettings {
  topK: number;
  startingK: number;
  sortOption: string;
  includeOverallGlobal: boolean;
}

export interface IGlobalExplanationTabProps {
  globalBarSettings?: IGlobalBarSettings;
  sortVector?: number[];
  jointDataset: JointDataset;
  dependenceProps?: IGenericChartProps;
  metadata: IExplanationModelMetadata;
  globalImportance?: number[][];
  isGlobalDerivedFromLocal: boolean;
  cohorts: Cohort[];
  cohortIDs: string[];
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  explanationMethod?: string;
  onChange: (props: IGlobalBarSettings) => void;
  onDependenceChange: (props: IGenericChartProps) => void;
  onWeightChange: (option: WeightVectorOption) => void;
}

interface IGlobalExplanationTabState {
  startingK: number;
  topK: number;
  minK: number;
  maxK: number;
  sortingSeriesIndex: number;
  sortArray: number[];
  seriesIsActive: boolean[];
  selectedCohortIndex: number;
  selectedFeatureIndex?: number;
  dependenceTooltipVisible: boolean;
  crossClassInfoVisible: boolean;
  explanationTooltipVisible: boolean;
  chartType: ChartTypes;
}

export class GlobalExplanationTab extends React.PureComponent<
  IGlobalExplanationTabProps,
  IGlobalExplanationTabState
> {
  private cohortSeries: IGlobalSeries[];
  private activeSeries: IGlobalSeries[];
  private weightOptions: IDropdownOption[] | undefined;
  private readonly hasDataset = this.props.jointDataset.hasDataset;
  private readonly explainerCalloutInfo = this.props.explanationMethod
    ? explainerCalloutDictionary[this.props.explanationMethod]
    : undefined;

  public constructor(props: IGlobalExplanationTabProps) {
    super(props);

    if (!this.props.jointDataset.hasLocalExplanations) {
      this.activeSeries = [];
      this.cohortSeries = [];
      return;
    }

    const minK = Math.min(
      4,
      this.props.jointDataset.localExplanationFeatureCount
    );
    this.state = {
      startingK: 0,
      topK: minK,
      minK,
      maxK: Math.min(30, this.props.jointDataset.localExplanationFeatureCount),
      selectedCohortIndex: 0,
      sortingSeriesIndex: 0,
      sortArray: ModelExplanationUtils.getSortIndices(
        this.props.cohorts[0].calculateAverageImportance()
      ).reverse(),
      seriesIsActive: props.cohorts.map(() => true),
      dependenceTooltipVisible: false,
      crossClassInfoVisible: false,
      explanationTooltipVisible: false,
      chartType: ChartTypes.Bar
    };

    if (this.props.globalBarSettings === undefined) {
      this.setDefaultSettings();
    }
    if (this.props.metadata.modelType === ModelTypes.Multiclass) {
      this.weightOptions = this.props.weightOptions.map((option) => {
        return {
          text: this.props.weightLabels[option],
          key: option
        };
      });
    }
    this.cohortSeries = this.getGlobalSeries();
    this.activeSeries = this.getActiveCohortSeries(
      this.state.sortArray.map(() => true)
    );
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

    if (!this.props.jointDataset.hasLocalExplanations) {
      if (this.props.globalImportance !== undefined) {
        return (
          <GlobalOnlyChart
            metadata={this.props.metadata}
            globalImportance={this.props.globalImportance}
          />
        );
      }
      return (
        <div className={classNames.missingParametersPlaceholder}>
          <div className={classNames.missingParametersPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.GlobalTab.missingParameters}
            </Text>
          </div>
        </div>
      );
    }

    const maxStartingK = Math.max(
      0,
      this.props.jointDataset.localExplanationFeatureCount - this.state.topK
    );
    if (this.props.globalBarSettings === undefined) {
      return <div />;
    }
    const cohortOptions: IDropdownOption[] = this.props.cohorts.map(
      (cohort, index) => {
        return { key: index, text: cohort.name };
      }
    );
    const featureOptions: IDropdownOption[] = [];
    for (let i = 0; i < this.props.jointDataset.datasetFeatureCount; i++) {
      const key = JointDataset.DataLabelRoot + i.toString();
      featureOptions.push({
        key,
        text: this.props.jointDataset.metaDict[key].label
      });
    }

    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Icon iconName="Info" className={classNames.infoIcon} />
          <Text variant="medium" className={classNames.helperText}>
            {localization.GlobalTab.helperText}
          </Text>
        </div>
        <div className={classNames.globalChartControls}>
          <Text variant="medium" className={classNames.sliderLabel}>
            {localization.formatString(
              localization.GlobalTab.topAtoB,
              this.state.startingK + 1,
              this.state.startingK + this.state.topK
            )}
          </Text>
          <Slider
            className={classNames.startingK}
            ariaLabel={localization.AggregateImportance.topKFeatures}
            max={maxStartingK}
            min={0}
            step={1}
            value={this.state.startingK}
            onChange={this.setStartingK}
            showValue={false}
          />
        </div>
        <div className={classNames.rightJustifiedContainer}>
          {this.explainerCalloutInfo && (
            <CommandBarButton
              iconProps={{ iconName: "Info" }}
              id="explanation-info"
              className={classNames.infoButton}
              text={localization.ExplanationSummary.whatDoExplanationsMean}
              onClick={this.toggleExplanationTooltip}
            />
          )}
          {this.state.explanationTooltipVisible && this.explainerCalloutInfo && (
            <Callout
              doNotLayer={true}
              target={"#explanation-info"}
              setInitialFocus={true}
              onDismiss={this.toggleExplanationTooltip}
              role="alertdialog"
              styles={{ container: FabricStyles.calloutContainer }}
            >
              <div className={classNames.calloutWrapper}>
                <div className={classNames.calloutHeader}>
                  <Text className={classNames.calloutTitle}>
                    {this.explainerCalloutInfo.title}
                  </Text>
                </div>
                <div className={classNames.calloutInner}>
                  <Text>{this.explainerCalloutInfo.description}</Text>
                  {this.explainerCalloutInfo.linkUrl && (
                    <div className={classNames.calloutActions}>
                      <Link
                        className={classNames.calloutLink}
                        href={this.explainerCalloutInfo.linkUrl}
                        target="_blank"
                      >
                        {localization.ExplanationSummary.clickHere}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Callout>
          )}
          <Settings
            minK={this.state.minK}
            maxK={this.state.maxK}
            topK={this.state.topK}
            setTopK={this.setTopK}
            chartType={this.state.chartType}
            onChartTypeChange={this.onChartTypeChange}
          />
        </div>
        <div className={classNames.globalChartWithLegend}>
          <FeatureImportanceBar
            jointDataset={this.props.jointDataset}
            yAxisLabels={[localization.GlobalTab.aggregateFeatureImportance]}
            sortArray={this.state.sortArray}
            chartType={this.state.chartType}
            startingK={this.state.startingK}
            unsortedX={this.props.metadata.featureNamesAbridged}
            unsortedSeries={this.activeSeries}
            topK={this.state.topK}
            onFeatureSelection={this.handleFeatureSelection}
            selectedFeatureIndex={this.state.selectedFeatureIndex}
          />
          <div className={classNames.legendAndSort}>
            <Text
              variant={"mediumPlus"}
              block
              className={classNames.cohortLegend}
            >
              {localization.GlobalTab.datasetCohorts}
            </Text>
            <Text variant={"small"} className={classNames.legendHelpText}>
              {localization.GlobalTab.legendHelpText}
            </Text>
            <InteractiveLegend
              items={this.cohortSeries.map((row, rowIndex) => {
                return {
                  name: row.name,
                  color: FabricStyles.fabricColorPalette[row.colorIndex],
                  activated: this.state.seriesIsActive[rowIndex],
                  onClick: this.toggleActivation.bind(this, rowIndex)
                };
              })}
            />
            <Text variant={"medium"} className={classNames.cohortLegend}>
              {localization.GlobalTab.sortBy}
            </Text>
            <Dropdown
              options={cohortOptions}
              selectedKey={this.state.sortingSeriesIndex}
              onChange={this.setSortIndex}
            />
            {this.props.metadata.modelType === ModelTypes.Multiclass &&
              this.weightOptions && (
                <div>
                  <div className={classNames.multiclassWeightLabel}>
                    <Text
                      variant={"medium"}
                      className={classNames.multiclassWeightLabelText}
                    >
                      {localization.GlobalTab.weightOptions}
                    </Text>
                    <IconButton
                      id={"cross-class-weight-info"}
                      iconProps={{ iconName: "Info" }}
                      title={localization.CrossClass.info}
                      onClick={this.toggleCrossClassInfo}
                    />
                  </div>
                  <Dropdown
                    options={this.weightOptions}
                    selectedKey={this.props.selectedWeightVector}
                    onChange={this.setWeightOption}
                  />
                  {this.state.crossClassInfoVisible && (
                    <Callout
                      doNotLayer={true}
                      target={"#cross-class-weight-info"}
                      setInitialFocus={true}
                      onDismiss={this.toggleCrossClassInfo}
                      directionalHint={DirectionalHint.leftCenter}
                      role="alertdialog"
                      styles={{ container: FabricStyles.calloutContainer }}
                    >
                      <div className={classNames.calloutWrapper}>
                        <div className={classNames.calloutHeader}>
                          <Text className={classNames.calloutTitle}>
                            {localization.CrossClass.crossClassWeights}
                          </Text>
                        </div>
                        <div className={classNames.calloutInner}>
                          <Text>{localization.CrossClass.overviewInfo}</Text>
                          <ul>
                            <li>
                              <Text>
                                {localization.CrossClass.absoluteValInfo}
                              </Text>
                            </li>
                            <li>
                              <Text>
                                {localization.CrossClass.enumeratedClassInfo}
                              </Text>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </Callout>
                  )}
                </div>
              )}
          </div>
        </div>
        {!this.hasDataset && (
          <div className={classNames.missingParametersPlaceholder}>
            <div className={classNames.missingParametersPlaceholderSpacer}>
              <Text variant="large" className={classNames.faintText}>
                {localization.GlobalTab.datasetRequired}
              </Text>
            </div>
          </div>
        )}
        {this.hasDataset && (
          <div>
            <div className={classNames.rightJustifiedContainer}>
              <CommandBarButton
                iconProps={{ iconName: "Info" }}
                id="dependence-plot-info"
                className={classNames.infoButton}
                text={localization.Charts.howToRead}
                onClick={this.toggleDependencePlotTooltip}
              />
              {this.state.dependenceTooltipVisible && (
                <Callout
                  doNotLayer={true}
                  target={"#dependence-plot-info"}
                  setInitialFocus={true}
                  onDismiss={this.toggleDependencePlotTooltip}
                  role="alertdialog"
                  styles={{ container: FabricStyles.calloutContainer }}
                >
                  <div className={classNames.calloutWrapper}>
                    <div className={classNames.calloutHeader}>
                      <Text className={classNames.calloutTitle}>
                        {localization.GlobalTab.dependencePlotTitle}
                      </Text>
                    </div>
                    <div className={classNames.calloutInner}>
                      <Text>
                        {localization.GlobalTab.dependencePlotHelperText}
                      </Text>
                    </div>
                  </div>
                </Callout>
              )}
            </div>
            <div className={classNames.secondaryChartAndLegend}>
              <DependencePlot
                chartProps={this.props.dependenceProps}
                cohortIndex={this.state.selectedCohortIndex}
                cohort={this.props.cohorts[this.state.selectedCohortIndex]}
                jointDataset={this.props.jointDataset}
                metadata={this.props.metadata}
                onChange={this.props.onDependenceChange}
                selectedWeight={this.props.selectedWeightVector}
                selectedWeightLabel={
                  this.props.weightLabels[this.props.selectedWeightVector]
                }
              />
              <div className={classNames.legendAndSort}>
                <Text
                  variant={"medium"}
                  block
                  className={classNames.cohortLegend}
                >
                  {localization.GlobalTab.viewDependencePlotFor}
                </Text>
                {featureOptions && (
                  <ComboBox
                    useComboBoxAsMenuWidth={true}
                    options={featureOptions}
                    allowFreeform={false}
                    autoComplete={"on"}
                    placeholder={
                      localization.GlobalTab
                        .dependencePlotFeatureSelectPlaceholder
                    }
                    selectedKey={
                      this.props.dependenceProps
                        ? this.props.dependenceProps.xAxis.property
                        : undefined
                    }
                    onChange={this.onXSet}
                    calloutProps={FabricStyles.calloutProps}
                    styles={FabricStyles.defaultDropdownStyle}
                  />
                )}
                <Text
                  variant={"medium"}
                  block
                  className={classNames.cohortLegendWithTop}
                >
                  {localization.GlobalTab.datasetCohortSelector}
                </Text>
                {cohortOptions && (
                  <Dropdown
                    options={cohortOptions}
                    selectedKey={this.state.selectedCohortIndex}
                    onChange={this.setSelectedCohort}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  private setSelectedCohort = (
    _event: React.FormEvent,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedCohortIndex: item.key as number });
    }
  };

  private setStartingK = (newValue: number): void => {
    this.setState({ startingK: newValue });
  };

  private setTopK = (newValue: number): void => {
    this.setState({ topK: newValue });
  };

  private toggleDependencePlotTooltip = (): void => {
    this.setState({
      dependenceTooltipVisible: !this.state.dependenceTooltipVisible
    });
  };

  private toggleCrossClassInfo = (): void => {
    this.setState({ crossClassInfoVisible: !this.state.crossClassInfoVisible });
  };

  private toggleExplanationTooltip = (): void => {
    this.setState({
      explanationTooltipVisible: !this.state.explanationTooltipVisible
    });
  };

  private onChartTypeChange = (chartType: ChartTypes): void => {
    this.setState({ chartType });
  };

  private toggleActivation(index: number): void {
    const seriesIsActive = [...this.state.seriesIsActive];
    seriesIsActive[index] = !seriesIsActive[index];
    this.activeSeries = this.getActiveCohortSeries(seriesIsActive);
    this.setState({ seriesIsActive });
  }

  private getGlobalSeries(): IGlobalSeries[] {
    return this.props.cohorts.map((cohort, i) => {
      return {
        name: cohort.name,
        unsortedIndividualY: cohort.transposedLocalFeatureImportances(),
        unsortedAggregateY: cohort.calculateAverageImportance(),
        colorIndex: i
      };
    });
  }

  // This can probably be done cheaper by passing the active array to the charts, and zeroing
  // the series in the plotlyProps. Later optimization.
  private getActiveCohortSeries(activeArray: boolean[]): IGlobalSeries[] {
    return this.cohortSeries.filter((_series, idx) => activeArray[idx]);
  }

  private updateIncludedCohortsOnCohortEdit(): void {
    let selectedCohortIndex = this.state.selectedCohortIndex;
    if (selectedCohortIndex >= this.props.cohorts.length) {
      selectedCohortIndex = 0;
    }
    const seriesIsActive: boolean[] = this.props.cohorts.map(() => true);
    this.cohortSeries = this.getGlobalSeries();
    this.activeSeries = this.getActiveCohortSeries(seriesIsActive);
    this.setState({ selectedCohortIndex, seriesIsActive });
  }

  private setDefaultSettings(): void {
    const result: IGlobalBarSettings = {} as IGlobalBarSettings;
    result.topK = Math.min(
      this.props.jointDataset.localExplanationFeatureCount,
      4
    );
    result.startingK = 0;
    result.sortOption = "global";
    result.includeOverallGlobal = !this.props.isGlobalDerivedFromLocal;
    this.props.onChange(result);
  }

  private setSortIndex = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      const newIndex = item.key as number;
      const sortArray = ModelExplanationUtils.getSortIndices(
        this.cohortSeries[newIndex].unsortedAggregateY
      ).reverse();
      this.setState({ sortingSeriesIndex: newIndex, sortArray });
    }
  };

  private setWeightOption = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      const newIndex = item.key as WeightVectorOption;
      this.props.onWeightChange(newIndex);
    }
  };

  private onXSet = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const key = item.key as string;
      const index = this.props.jointDataset.metaDict[key].index;
      if (index !== undefined) {
        this.handleFeatureSelection(this.state.selectedCohortIndex, index);
      }
    }
  };

  private handleFeatureSelection = (
    cohortIndex: number,
    featureIndex: number
  ): void => {
    // set to dependence plot initially, can be changed if other feature importances available
    const xKey = JointDataset.DataLabelRoot + featureIndex.toString();
    const xIsDithered = this.props.jointDataset.metaDict[xKey]
      .treatAsCategorical;
    const yKey =
      JointDataset.ReducedLocalImportanceRoot + featureIndex.toString();
    const chartProps: IGenericChartProps = {
      chartType: ChartTypes.Scatter,
      xAxis: {
        property: xKey,
        options: {
          dither: xIsDithered,
          bin: false
        }
      },
      yAxis: {
        property: yKey,
        options: {}
      }
    };
    this.props.onDependenceChange(chartProps);
    this.setState({
      selectedCohortIndex: cohortIndex,
      selectedFeatureIndex: featureIndex
    });
  };
}
