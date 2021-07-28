// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  ModelTypes,
  WeightVectorOption,
  JointDataset,
  ModelExplanationUtils,
  ChartTypes,
  MissingParametersPlaceholder,
  FabricStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ChoiceGroup,
  IChoiceGroupOption,
  Slider,
  Text,
  ComboBox,
  IComboBox,
  DirectionalHint,
  Callout,
  Link,
  IconButton,
  CommandBarButton,
  Dropdown,
  IDropdownOption,
  Label
} from "office-ui-fabric-react";
import React from "react";

import { FeatureImportanceBar } from "../FeatureImportanceBar/FeatureImportanceBar";
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
}

export interface ILocalImportancePlotsState {
  topK: number;
  sortArray: number[];
  sortingSeriesIndex: number | undefined;
  secondaryChartChoice: string;
  selectedFeatureKey: string;
  selectedICEClass: number;
  crossClassInfoVisible: boolean;
  iceTooltipVisible: boolean;
}

export class LocalImportancePlots extends React.Component<
  ILocalImportancePlotsProps,
  ILocalImportancePlotsState
> {
  private weightOptions: IDropdownOption[] | undefined;
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
    if (this.props.metadata.modelType === ModelTypes.Multiclass) {
      this.weightOptions = this.props.weightOptions.map((option) => {
        return {
          key: option,
          text: this.props.weightLabels[option]
        };
      });
    }
    this.state = {
      crossClassInfoVisible: false,
      iceTooltipVisible: false,
      secondaryChartChoice: WhatIfConstants.featureImportanceKey,
      selectedFeatureKey: JointDataset.DataLabelRoot + "0",
      selectedICEClass: 0,
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
        sortArray: this.props.sortArray,
        sortingSeriesIndex: this.props.sortingSeriesIndex
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
    let secondaryPlot: React.ReactNode;
    const featureImportanceSortOptions: IDropdownOption[] = this.props.includedFeatureImportance.map(
      (item, index) => {
        return {
          key: index,
          text: item.name
        };
      }
    );
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
        secondaryPlot = (
          <div className={classNames.featureImportanceArea}>
            <div className={classNames.featureImportanceControls}>
              <Text variant="medium" className={classNames.sliderLabel}>
                {localization.formatString(
                  localization.Interpret.GlobalTab.topAtoB,
                  1,
                  this.state.topK
                )}
              </Text>
              <Slider
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
                unsortedX={this.props.metadata.featureNamesAbridged}
                unsortedSeries={this.props.includedFeatureImportance}
                topK={this.state.topK}
              />
              <div className={classNames.featureImportanceLegend}>
                <Text
                  variant={"medium"}
                  className={classNames.cohortPickerLabel}
                >
                  {localization.Interpret.GlobalTab.sortBy}
                </Text>
                <Dropdown
                  styles={{ dropdown: { width: 150 } }}
                  options={featureImportanceSortOptions}
                  selectedKey={this.state.sortingSeriesIndex}
                  onChange={this.setSortIndex}
                />
                {this.props.metadata.modelType === ModelTypes.Multiclass && (
                  <div>
                    <div className={classNames.multiclassWeightLabel}>
                      <Text
                        variant={"medium"}
                        className={classNames.multiclassWeightLabelText}
                      >
                        {localization.Interpret.GlobalTab.weightOptions}
                      </Text>
                      <IconButton
                        id={"cross-class-weight-info"}
                        iconProps={{ iconName: "Info" }}
                        title={localization.Interpret.CrossClass.info}
                        onClick={this.toggleCrossClassInfo}
                      />
                    </div>
                    {this.weightOptions && (
                      <Dropdown
                        options={this.weightOptions}
                        selectedKey={this.props.selectedWeightVector}
                        onChange={this.setWeightOption}
                      />
                    )}
                    {this.state.crossClassInfoVisible && (
                      <Callout
                        doNotLayer
                        target={"#cross-class-weight-info"}
                        setInitialFocus
                        onDismiss={this.toggleCrossClassInfo}
                        directionalHint={DirectionalHint.leftCenter}
                        role="alertdialog"
                        styles={{ container: FabricStyles.calloutContainer }}
                      >
                        <div className={classNames.calloutWrapper}>
                          <div className={classNames.calloutHeader}>
                            <Text className={classNames.calloutTitle}>
                              {
                                localization.Interpret.CrossClass
                                  .crossClassWeights
                              }
                            </Text>
                          </div>
                          <div className={classNames.calloutInner}>
                            <Text>
                              {localization.Interpret.CrossClass.overviewInfo}
                            </Text>
                            <ul>
                              <li>
                                <Text>
                                  {
                                    localization.Interpret.CrossClass
                                      .absoluteValInfo
                                  }
                                </Text>
                              </li>
                              <li>
                                <Text>
                                  {
                                    localization.Interpret.CrossClass
                                      .enumeratedClassInfo
                                  }
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
                styles={{ container: FabricStyles.calloutContainer }}
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
                calloutProps={FabricStyles.calloutProps}
                styles={FabricStyles.limitedSizeMenuDropdown}
              />
              {this.props.metadata.modelType === ModelTypes.Multiclass && (
                <ComboBox
                  autoComplete={"on"}
                  className={classNames.iceClassSelection}
                  options={this.classOptions}
                  onChange={this.onICEClassSelected}
                  label={localization.Interpret.WhatIfTab.classPickerLabel}
                  ariaLabel="class picker"
                  selectedKey={this.state.selectedICEClass}
                  useComboBoxAsMenuWidth
                  calloutProps={FabricStyles.calloutProps}
                  styles={FabricStyles.limitedSizeMenuDropdown}
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
      <div id="subPlotContainer">
        {this.props.invokeModel ? (
          <div className={classNames.choiceBoxArea} id="subPlotChoice">
            <Text variant="medium" className={classNames.boldText}>
              {localization.Interpret.WhatIfTab.showLabel}
            </Text>
            <ChoiceGroup
              className={classNames.choiceGroup}
              styles={{
                flexContainer: classNames.choiceGroupFlexContainer
              }}
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
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ selectedFeatureKey: item.key as string });
  };

  private onICEClassSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IDropdownOption
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
    const sortArray = ModelExplanationUtils.getSortIndices(
      this.props.includedFeatureImportance[newIndex].unsortedAggregateY
    ).reverse();
    this.setState({ sortArray, sortingSeriesIndex: newIndex });
  };

  private setWeightOption = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    const newIndex = item.key as WeightVectorOption;
    this.props.onWeightChange(newIndex);
  };

  private setSecondaryChart = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    this.setState({ secondaryChartChoice: item.key });
  };

  private toggleCrossClassInfo = (): void => {
    this.setState({ crossClassInfoVisible: !this.state.crossClassInfoVisible });
  };

  private toggleICETooltip = (): void => {
    this.setState({ iceTooltipVisible: !this.state.iceTooltipVisible });
  };
}
