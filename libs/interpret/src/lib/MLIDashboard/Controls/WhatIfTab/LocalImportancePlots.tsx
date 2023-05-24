// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBox,
  ComboBox,
  IComboBoxOption,
  IDropdownOption,
  Dropdown,
  ChoiceGroup,
  IChoiceGroupOption,
  Slider,
  Text,
  Callout,
  Link,
  CommandBarButton,
  Label,
  Toggle,
  Stack
} from "@fluentui/react";
import {
  IExplanationModelMetadata,
  IsClassifier,
  IsMulticlass,
  ModelTypes,
  WeightVectorOption,
  JointDataset,
  ModelExplanationUtils,
  ChartTypes,
  MissingParametersPlaceholder,
  FluentUIStyles,
  FeatureImportanceBar,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName,
  getFeatureNamesAfterDrop
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ClassImportanceWeights } from "../ClassImportanceWeights/ClassImportanceWeights";
import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";
import { MultiICEPlot } from "../MultiICEPlot/MultiICEPlot";

import { WhatIfConstants } from "./WhatIfConstants";
import { whatIfTabStyles } from "./WhatIfTab.styles";

export interface ILocalImportancePlotsProps {
  includedFeatureImportance: IGlobalSeries[];
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  testableDatapoints: any[][];
  testableDatapointColors: string[];
  testableDatapointNames: string[];
  featuresOption: IDropdownOption[];
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  onWeightChange: (option: WeightVectorOption) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ILocalImportancePlotsState {
  topK: number;
  sortArray: number[];
  sortAbsolute: boolean;
  sortingSeriesIndex: number | undefined;
  secondaryChartChoice: string;
  selectedFeatureKey: string;
  selectedICEClass: number;
  iceTooltipVisible: boolean;
}

export class LocalImportancePlots extends React.Component<
  ILocalImportancePlotsProps,
  ILocalImportancePlotsState
> {
  private classOptions: IDropdownOption[] = this.props.metadata.classNames.map(
    (name, index) => {
      return { key: index, text: name };
    }
  );
  public constructor(props: ILocalImportancePlotsProps) {
    super(props);

    if (!this.props.jointDataset.hasDataset) {
      return;
    }
    this.state = {
      iceTooltipVisible: false,
      secondaryChartChoice: WhatIfConstants.featureImportanceKey,
      selectedFeatureKey: `${JointDataset.DataLabelRoot}0`,
      selectedICEClass: 0,
      sortAbsolute: true,
      sortArray: this.props.sortArray,
      sortingSeriesIndex: undefined,
      topK: 4
    };
  }

  public componentDidUpdate(prevProps: ILocalImportancePlotsProps): void {
    if (
      prevProps.sortArray !== this.props.sortArray ||
      prevProps.sortingSeriesIndex !== this.props.sortingSeriesIndex
    ) {
      this.setState({
        sortArray: this.getSortedArray(
          this.props.sortingSeriesIndex,
          this.state.sortAbsolute
        ),
        sortingSeriesIndex: this.props.sortingSeriesIndex
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
    let secondaryPlot: React.ReactNode;
    const featureImportanceSortOptions: IDropdownOption[] =
      this.props.includedFeatureImportance.map((item, index) => {
        return {
          key: index,
          text: item.name
        };
      });
    if (
      this.state.secondaryChartChoice === WhatIfConstants.featureImportanceKey
    ) {
      if (!this.props.jointDataset.hasLocalExplanations) {
        secondaryPlot = (
          <MissingParametersPlaceholder>
            {
              localization.Interpret.WhatIfTab
                .featureImportanceLackingParameters
            }
          </MissingParametersPlaceholder>
        );
      } else if (this.props.includedFeatureImportance.length === 0) {
        secondaryPlot = (
          <MissingParametersPlaceholder>
            {localization.Interpret.WhatIfTab.featureImportanceGetStartedText}
          </MissingParametersPlaceholder>
        );
      } else {
        const yAxisLabels: string[] = [
          localization.Interpret.featureImportance
        ];
        if (this.props.metadata.modelType !== ModelTypes.Regression) {
          yAxisLabels.push(
            this.props.weightLabels[this.props.selectedWeightVector]
          );
        }
        const featureNames = getFeatureNamesAfterDrop(
          this.props.metadata.featureNames,
          this.props.jointDataset.datasetMetaData?.featureMetaData
            ?.dropped_features
        );
        secondaryPlot = (
          <div className={classNames.featureImportanceArea}>
            <div className={classNames.featureImportanceControls}>
              <Slider
                label={localization.formatString(
                  localization.Interpret.GlobalTab.topAtoB,
                  this.state.topK
                )}
                className={classNames.startingK}
                ariaLabel={
                  localization.Interpret.AggregateImportance.topKFeatures
                }
                max={this.props.jointDataset.localExplanationFeatureCount}
                min={1}
                step={1}
                value={this.state.topK}
                onChange={this.setTopK}
                showValue={false}
              />
            </div>
            <div className={classNames.featureImportanceChartAndLegend}>
              <FeatureImportanceBar
                jointDataset={this.props.jointDataset}
                yAxisLabels={yAxisLabels}
                chartType={ChartTypes.Bar}
                sortArray={this.state.sortArray}
                unsortedX={featureNames}
                unsortedSeries={this.props.includedFeatureImportance}
                topK={this.state.topK}
              />
              <div className={classNames.featureImportanceLegend}>
                <Stack horizontal={false} tokens={{ childrenGap: "m1" }}>
                  <Stack.Item className={classNames.cohortPickerLabel}>
                    <Text variant={"medium"}>
                      {localization.Interpret.GlobalTab.sortBy}
                    </Text>
                  </Stack.Item>
                  <Stack.Item>
                    <Dropdown
                      styles={{ dropdown: { width: 150 } }}
                      options={featureImportanceSortOptions}
                      selectedKey={this.state.sortingSeriesIndex}
                      onChange={this.setSortIndex}
                      ariaLabel={localization.Interpret.GlobalTab.sortBy}
                    />
                  </Stack.Item>
                  <Stack.Item className={classNames.absoluteValueToggle}>
                    <Toggle
                      label={localization.Interpret.GlobalTab.absoluteValues}
                      inlineLabel
                      checked={this.state.sortAbsolute}
                      onChange={this.toggleSortAbsolute}
                    />
                  </Stack.Item>
                </Stack>

                {IsClassifier(this.props.metadata.modelType) && (
                  <div>
                    <ClassImportanceWeights
                      onWeightChange={this.props.onWeightChange}
                      selectedWeightVector={this.props.selectedWeightVector}
                      weightOptions={this.props.weightOptions}
                      weightLabels={this.props.weightLabels}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
    } else if (!this.props.invokeModel) {
      secondaryPlot = (
        <MissingParametersPlaceholder>
          {localization.Interpret.WhatIfTab.iceLackingParameters}
        </MissingParametersPlaceholder>
      );
    } else if (this.props.testableDatapoints.length === 0) {
      secondaryPlot = (
        <MissingParametersPlaceholder>
          {localization.Interpret.WhatIfTab.IceGetStartedText}
        </MissingParametersPlaceholder>
      );
    } else {
      secondaryPlot = (
        <div className={classNames.featureImportanceArea}>
          <div className={classNames.rightJustifiedContainer}>
            <CommandBarButton
              iconProps={{ iconName: "Info" }}
              id="explanation-info"
              className={classNames.infoButton}
              text={localization.Interpret.Charts.howToRead}
              onClick={this.toggleICETooltip}
            />
            {this.state.iceTooltipVisible && (
              <Callout
                doNotLayer
                target={"#explanation-info"}
                setInitialFocus
                onDismiss={this.toggleICETooltip}
                role="alertdialog"
                styles={{ container: FluentUIStyles.calloutContainer }}
              >
                <div className={classNames.calloutWrapper}>
                  <div className={classNames.calloutHeader}>
                    <Text className={classNames.calloutTitle}>
                      {localization.Interpret.WhatIfTab.icePlot}
                    </Text>
                  </div>
                  <div className={classNames.calloutInner}>
                    <Text>
                      {localization.Interpret.WhatIfTab.icePlotHelperText}
                    </Text>
                    <div className={classNames.calloutActions}>
                      <Link
                        className={classNames.calloutLink}
                        href={
                          "https://christophm.github.io/interpretable-ml-book/ice.html#ice"
                        }
                        target="_blank"
                      >
                        {localization.Interpret.ExplanationSummary.clickHere}
                      </Link>
                    </div>
                  </div>
                </div>
              </Callout>
            )}
          </div>
          <div className={classNames.featureImportanceChartAndLegend}>
            <MultiICEPlot
              invokeModel={this.props.invokeModel}
              datapoints={this.props.testableDatapoints}
              colors={this.props.testableDatapointColors}
              rowNames={this.props.testableDatapointNames}
              jointDataset={this.props.jointDataset}
              metadata={this.props.metadata}
              feature={this.state.selectedFeatureKey}
              selectedClass={this.state.selectedICEClass}
            />
            <div className={classNames.featureImportanceLegend}>
              <ComboBox
                autoComplete={"on"}
                className={classNames.iceFeatureSelection}
                options={this.props.featuresOption}
                onChange={this.onFeatureSelected}
                label={localization.Interpret.IcePlot.featurePickerLabel}
                ariaLabel="feature picker"
                selectedKey={this.state.selectedFeatureKey}
                useComboBoxAsMenuWidth
                calloutProps={FluentUIStyles.calloutProps}
                styles={FluentUIStyles.limitedSizeMenuDropdown}
              />
              {IsMulticlass(this.props.metadata.modelType) && (
                <ComboBox
                  autoComplete={"on"}
                  className={classNames.iceClassSelection}
                  options={this.classOptions}
                  onChange={this.onICEClassSelected}
                  label={localization.Interpret.WhatIfTab.classPickerLabel}
                  ariaLabel="class picker"
                  selectedKey={this.state.selectedICEClass}
                  useComboBoxAsMenuWidth
                  calloutProps={FluentUIStyles.calloutProps}
                  styles={FluentUIStyles.limitedSizeMenuDropdown}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    const secondaryPlotChoices = [
      {
        key: WhatIfConstants.featureImportanceKey,
        text: localization.Interpret.WhatIfTab.featureImportancePlot
      },
      {
        key: WhatIfConstants.IceKey,
        text: localization.Interpret.WhatIfTab.icePlot
      }
    ];
    return (
      <div id="subPlotContainer" className={classNames.subPlotContainer}>
        {this.props.invokeModel ? (
          <div className={classNames.choiceBoxArea} id="subPlotChoice">
            <Text variant="medium" className={classNames.boldText}>
              {localization.Interpret.WhatIfTab.showLabel}
            </Text>
            <ChoiceGroup
              styles={{
                flexContainer: classNames.choiceGroupFlexContainer
              }}
              className={classNames.choiceGroupLabel}
              options={secondaryPlotChoices}
              selectedKey={this.state.secondaryChartChoice}
              onChange={this.setSecondaryChart}
            />
          </div>
        ) : (
          <Label>
            {localization.Interpret.WhatIfTab.localFeatureImportanceForPoint}
          </Label>
        )}
        {secondaryPlot}
      </div>
    );
  }

  private setTopK = (newValue: number): void => {
    this.setState({ topK: newValue });
  };

  private onFeatureSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ selectedFeatureKey: item.key as string });
  };

  private onICEClassSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ selectedICEClass: item.key as number });
  };

  private setSortIndex = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    const newIndex = item.key as number;
    const sortArray = this.state.sortAbsolute
      ? ModelExplanationUtils.getAbsoluteSortIndices(
          this.props.includedFeatureImportance[newIndex].unsortedAggregateY
        ).reverse()
      : ModelExplanationUtils.getSortIndices(
          this.props.includedFeatureImportance[newIndex].unsortedAggregateY
        ).reverse();
    this.setState({ sortArray, sortingSeriesIndex: newIndex });
  };

  private setSecondaryChart = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ secondaryChartChoice: item.key });
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type:
        item.key === WhatIfConstants.featureImportanceKey
          ? TelemetryEventName.IndividualFeatureImportanceFeatureImportancePlotClick
          : TelemetryEventName.IndividualFeatureImportanceICEPlotClick
    });
  };

  private toggleICETooltip = (): void => {
    this.setState({ iceTooltipVisible: !this.state.iceTooltipVisible });
  };

  private toggleSortAbsolute = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ): void => {
    if (checked !== undefined) {
      const sortArray = this.getSortedArray(
        this.state.sortingSeriesIndex,
        checked
      );
      this.setState({ sortAbsolute: checked, sortArray });
    }
  };

  private getSortedArray = (
    sortIndex: number | undefined,
    checked: boolean
  ): number[] => {
    if (sortIndex !== undefined) {
      return checked
        ? ModelExplanationUtils.getAbsoluteSortIndices(
            this.props.includedFeatureImportance[sortIndex].unsortedAggregateY
          ).reverse()
        : ModelExplanationUtils.getSortIndices(
            this.props.includedFeatureImportance[sortIndex].unsortedAggregateY
          ).reverse();
    }
    return this.props.sortArray;
  };
}
