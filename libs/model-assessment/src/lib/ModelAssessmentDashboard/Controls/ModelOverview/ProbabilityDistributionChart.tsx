// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  defaultModelAssessmentContext,
  ErrorCohort,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { cloneDeep } from "lodash";
import {
  Dropdown,
  getTheme,
  IDropdownOption,
  Stack,
  Text,
  DefaultButton
} from "office-ui-fabric-react";
import React from "react";

interface IProbabilityDistributionChartProps {
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
}

interface IProbabilityDistributionChartState {
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
  probabilityOption?: IDropdownOption;
}

export class ProbabilityDistributionChart extends React.Component<
  IProbabilityDistributionChartProps,
  IProbabilityDistributionChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IProbabilityDistributionChartProps) {
    super(props);
    this.state = {
      selectedDatasetCohorts: this.getAllDatasetCohorts(),
      selectedFeatureBasedCohorts: this.getAllFeatureBasedCohorts()
    };
  }

  componentDidUpdate(
    prevProps: IProbabilityDistributionChartProps,
    _prevState: IProbabilityDistributionChartState
  ) {
    if (this.props.featureBasedCohorts !== prevProps.featureBasedCohorts) {
      // feature-based cohorts changed, update state
      this.setState({
        selectedFeatureBasedCohorts: this.getAllFeatureBasedCohorts()
      });
    }
  }

  public render(): React.ReactNode {
    if (!this.context.jointDataset.hasPredictedProbabilities) {
      return <></>;
    }
    const theme = getTheme();

    const selectedDatasetCohorts = this.props.datasetCohorts.filter(
      (_cohort, index) => {
        return this.state.selectedDatasetCohorts.includes(index);
      }
    );
    const selectedFeatureBasedCohorts = this.props.featureBasedCohorts.filter(
      (_cohort, index) => {
        return this.state.selectedFeatureBasedCohorts.includes(index);
      }
    );
    const selectedCohorts = selectedDatasetCohorts.concat(
      selectedFeatureBasedCohorts
    );
    const selectedCohortNames = selectedCohorts.map(
      (cohort) => cohort.cohort.name
    );

    const datasetCohortOptions = this.props.datasetCohorts.map(
      (cohort, index) => {
        return { key: index, text: cohort.cohort.name };
      }
    );
    const featureBasedCohortOptions = this.props.featureBasedCohorts.map(
      (cohort, index) => {
        return { key: index, text: cohort.cohort.name };
      }
    );

    const probabilityOptions: IDropdownOption[] = new Array(
      this.context.jointDataset.predictionClassCount
    )
      .fill(0)
      .map((_, index) => {
        const key = JointDataset.ProbabilityYRoot + index.toString();
        return {
          key,
          text: this.context.jointDataset.metaDict[key].label
        };
      });

    if (probabilityOptions.length === 0) {
      return <></>;
    }

    if (this.state.probabilityOption === undefined) {
      this.setState({ probabilityOption: probabilityOptions[0] });
      return <></>;
    }

    const boxplotData = selectedCohorts.map((cohort, index) => {
      return this.getBoxPlotData(
        cohort,
        index,
        this.state.probabilityOption!.key.toString()
      );
    });
    const outlierData = boxplotData
      .map((cohortDict) => cohortDict["outliers"])
      .map((outlierProbs, cohortIndex) => {
        return outlierProbs.map((prob) => [cohortIndex, prob]);
      })
      .reduce((list1, list2) => list1.concat(list2));

    const noCohortSelected =
      this.state.selectedDatasetCohorts.length +
        this.state.selectedFeatureBasedCohorts.length ===
      0;

    return (
      <>
        <Dropdown
          label={
            localization.ModelAssessment.ModelOverview
              .probabilityForClassSelectionHeader
          }
          options={probabilityOptions}
          styles={{ dropdown: { width: 400 } }}
          onChange={this.onProbabilityOptionSelectionChange}
          selectedKey={this.state.probabilityOption!.key}
        />
        <Stack horizontal>
          <Stack.Item styles={{ root: { width: "90%" } }}>
            {noCohortSelected && (
              <Text>Select at least one cohort to view the box plot.</Text>
            )}
            {!noCohortSelected && (
              <BasicHighChart
                id={"ProbabilityDistributionChart"}
                theme={theme}
                configOverride={{
                  chart: {
                    type: "boxplot",
                    inverted: true,
                    height: selectedCohorts.length * 40 + 120
                  },
                  xAxis: {
                    categories: selectedCohortNames
                  },
                  yAxis: {
                    title: { text: this.state.probabilityOption!.text }
                  },
                  plotOptions: {
                    bar: {
                      dataLabels: {
                        enabled: true
                      }
                    }
                  },
                  series: [
                    {
                      name: "Box Plot",
                      data: boxplotData,
                      type: "boxplot",
                      fillColor: "#c8cffc",
                      tooltip: {
                        pointFormatter: function () {
                          return `<span style="color:${this.color}">●</span>
                            <b> ${this.series.name}</b><br/>
                            Upper fence: ${this.options.high}<br/>
                            Upper quartile: ${this.options.q3}<br/>
                            Median: ${this.options.median}<br/>
                            Lower quartile: ${this.options.q1}<br/>
                            Lower fence: ${this.options.low}<br/>`;
                        }
                      }
                    },
                    {
                      name: "Outliers",
                      type: "scatter",
                      data: outlierData,
                      tooltip: {
                        pointFormatter: function () {
                          return `probability: <b>${this.y}</b>`;
                        }
                      }
                    }
                  ]
                }}
              />
            )}
          </Stack.Item>
          <Stack tokens={{ childrenGap: "10px" }}>
            <Stack tokens={{ childrenGap: "10px" }}>
              <Dropdown
                label={"Dataset cohorts"}
                multiSelect
                options={datasetCohortOptions}
                styles={{ dropdown: { width: 250 } }}
                onChange={this.onChartDatasetCohortOptionSelectionChange}
                selectedKeys={this.state.selectedDatasetCohorts}
                errorMessage={
                  noCohortSelected
                    ? "Select at least one cohort overall to view the box plot."
                    : undefined
                }
              />
              <Stack horizontal tokens={{ childrenGap: "10px" }}>
                <DefaultButton
                  text="Select all"
                  onClick={() =>
                    this.setState({
                      selectedDatasetCohorts: this.getAllDatasetCohorts()
                    })
                  }
                />
                <DefaultButton
                  text="Unselect all"
                  onClick={() =>
                    this.setState({
                      selectedDatasetCohorts: []
                    })
                  }
                />
              </Stack>
            </Stack>
            {this.props.featureBasedCohorts.length > 0 && (
              <Stack tokens={{ childrenGap: "10px" }}>
                <Dropdown
                  label={"Feature-based cohorts"}
                  multiSelect
                  options={featureBasedCohortOptions}
                  styles={{ dropdown: { width: 200 } }}
                  onChange={this.onChartFeatureBasedCohortOptionSelectionChange}
                  selectedKeys={this.state.selectedFeatureBasedCohorts}
                  errorMessage={
                    noCohortSelected
                      ? "Select at least one cohort overall to view the box plot."
                      : undefined
                  }
                />
                <Stack horizontal tokens={{ childrenGap: "10px" }}>
                  <DefaultButton
                    text="Select all"
                    onClick={() =>
                      this.setState({
                        selectedFeatureBasedCohorts:
                          this.getAllFeatureBasedCohorts()
                      })
                    }
                  />
                  <DefaultButton
                    text="Unselect all"
                    onClick={() =>
                      this.setState({
                        selectedFeatureBasedCohorts: []
                      })
                    }
                  />
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </>
    );
  }

  private getAllDatasetCohorts() {
    return this.props.datasetCohorts.map((_cohort, index) => {
      return index;
    });
  }

  private getAllFeatureBasedCohorts() {
    return this.props.featureBasedCohorts.map((_cohort, index) => {
      return index;
    });
  }

  private onChartDatasetCohortOptionSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({
        selectedDatasetCohorts: this.makeChartCohortOptionSelectionChange(
          this.state.selectedDatasetCohorts,
          item
        )
      });
    }
  };

  private onChartFeatureBasedCohortOptionSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({
        selectedFeatureBasedCohorts: this.makeChartCohortOptionSelectionChange(
          this.state.selectedFeatureBasedCohorts,
          item
        )
      });
    }
  };

  private makeChartCohortOptionSelectionChange = (
    currentlySelected: number[],
    item: IDropdownOption
  ): number[] => {
    const key = Number(item.key);

    if (item.selected && !currentlySelected.includes(key)) {
      // update with newly selected item
      return currentlySelected.concat([key]);
    } else if (!item.selected && currentlySelected.includes(key)) {
      // update by removing the unselected item
      return currentlySelected.filter((idx) => idx !== key);
    }

    return currentlySelected;
  };

  private onProbabilityOptionSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({ probabilityOption: item });
    }
  };

  private getPercentile(sortedData: number[], percentile: number) {
    var index = (percentile / 100) * sortedData.length;
    var result;
    if (Math.floor(index) == index) {
      result = (sortedData[index - 1] + sortedData[index]) / 2;
    } else {
      result = sortedData[Math.floor(index)];
    }
    return result;
  }

  private getBoxPlotData(errorCohort: ErrorCohort, index: number, key: string) {
    // key is the identifier for the column (e.g., probability)
    let sortedData: number[] = cloneDeep(
      errorCohort.cohort.filteredData.map((dict) => dict[key])
    ).sort((number1: number, number2: number) => {
      return number1 - number2;
    });
    const min = sortedData[0];
    const max = sortedData[sortedData.length - 1];
    const firstQuartile = this.getPercentile(sortedData, 25);
    const median = this.getPercentile(sortedData, 50);
    const thirdQuartile = this.getPercentile(sortedData, 75);
    const interquartileRange = thirdQuartile - firstQuartile;
    const lowerFence = firstQuartile - interquartileRange * 1.5;
    const upperFence = thirdQuartile + interquartileRange * 1.5;
    const nonOutliers = sortedData.filter(
      (element) => element >= lowerFence && element <= upperFence
    );
    const outliers = sortedData.filter(
      (element) => element < lowerFence || element > upperFence
    );
    const lowerWhisker = nonOutliers[0];
    const upperWhisker = nonOutliers[nonOutliers.length - 1];
    return {
      x: index,
      min,
      max,
      outliers,
      q1: firstQuartile,
      median,
      q3: thirdQuartile,
      low: lowerWhisker,
      high: upperWhisker
    };
  }
}
