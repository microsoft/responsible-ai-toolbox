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
  DefaultButton,
  Dropdown,
  getTheme,
  IDropdownOption,
  Panel,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IProbabilityDistributionChartProps {
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
  onChooseCohorts: () => void;
}

interface IProbabilityDistributionChartState {
  probabilityOption?: IDropdownOption;
  probabilityFlyoutIsVisible: boolean;
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
    this.state = { probabilityFlyoutIsVisible: false };
  }

  // componentDidUpdate(
  //   prevProps: IProbabilityDistributionChartProps,
  //   _prevState: IProbabilityDistributionChartState
  // ) {
  //   if (this.props.featureBasedCohorts !== prevProps.featureBasedCohorts) {
  //     // feature-based cohorts changed, update state
  //     this.setState({
  //       selectedFeatureBasedCohorts: this.getAllFeatureBasedCohorts()
  //     });
  //   }
  // }

  public render(): React.ReactNode {
    const classNames = modelOverviewChartStyles();
    if (!this.context.jointDataset.hasPredictedProbabilities) {
      return;
    }
    const theme = getTheme();

    const selectedDatasetCohorts = this.props.datasetCohorts.filter(
      (_cohort, index) => {
        return this.props.selectedDatasetCohorts.includes(index);
      }
    );
    const selectedFeatureBasedCohorts = this.props.featureBasedCohorts.filter(
      (_cohort, index) => {
        return this.props.selectedFeatureBasedCohorts.includes(index);
      }
    );
    const selectedCohorts = selectedDatasetCohorts.concat(
      selectedFeatureBasedCohorts
    );
    const selectedCohortNames = selectedCohorts.map(
      (cohort) => cohort.cohort.name
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
      return;
    }

    if (this.state.probabilityOption === undefined) {
      this.setState({ probabilityOption: probabilityOptions[0] });
      return;
    }

    const boxplotData = selectedCohorts.map((cohort, index) => {
      return this.getBoxPlotData(
        cohort,
        index,
        this.state.probabilityOption!.key.toString()
      );
    });
    const outlierData = boxplotData
      .map((cohortDict) => cohortDict.outliers)
      .map((outlierProbs, cohortIndex) => {
        return outlierProbs.map((prob) => [cohortIndex, prob]);
      })
      .reduce((list1, list2) => list1.concat(list2), []);

    const noCohortSelected =
      this.props.selectedDatasetCohorts.length +
        this.props.selectedFeatureBasedCohorts.length ===
      0;

    return (
      <>
        <Stack horizontal>
          {!noCohortSelected && (
            <Stack.Item className={classNames.verticalAxis}>
              <DefaultButton
                className={classNames.rotatedVerticalBox}
                text={
                  localization.ModelAssessment.ModelOverview
                    .cohortSelectionButton
                }
                onClick={this.props.onChooseCohorts}
              />
            </Stack.Item>
          )}
          <Stack.Item className={classNames.chart}>
            {noCohortSelected && (
              <div className={classNames.placeholderText}>
                <Text>Select at least one cohort to view the box plot.</Text>
              </div>
            )}
            {!noCohortSelected && (
              <Stack>
                <BasicHighChart
                  id={"ProbabilityDistributionChart"}
                  theme={theme}
                  configOverride={{
                    chart: {
                      height: selectedCohorts.length * 40 + 120,
                      inverted: true,
                      type: "boxplot"
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
                        data: boxplotData,
                        fillColor: "#c8cffc",
                        name: localization.ModelAssessment.ModelOverview.boxPlot
                          .boxPlotSeriesLabel,
                        tooltip: {
                          pointFormatter() {
                            return `<span style="color:${this.color}">●</span>
                            <b> ${this.series.name}</b><br/>
                            ${localization.ModelAssessment.ModelOverview.boxPlot.upperFence}: ${this.options.high}<br/>
                            ${localization.ModelAssessment.ModelOverview.boxPlot.upperQuartile}: ${this.options.q3}<br/>
                            ${localization.ModelAssessment.ModelOverview.boxPlot.median}: ${this.options.median}<br/>
                            ${localization.ModelAssessment.ModelOverview.boxPlot.lowerQuartile}: ${this.options.q1}<br/>
                            ${localization.ModelAssessment.ModelOverview.boxPlot.lowerFence}: ${this.options.low}<br/>`;
                          }
                        },
                        type: "boxplot"
                      },
                      {
                        data: outlierData,
                        name: localization.ModelAssessment.ModelOverview.boxPlot
                          .outlierLabel,
                        tooltip: {
                          pointFormatter() {
                            return `${localization.ModelAssessment.ModelOverview.boxPlot.outlierProbability}: <b>${this.y}</b>`;
                          }
                        },
                        type: "scatter"
                      }
                    ],
                    xAxis: {
                      categories: selectedCohortNames
                    },
                    yAxis: {
                      title: { text: this.state.probabilityOption!.text }
                    }
                  }}
                />
                <Stack.Item className={classNames.horizontalAxis}>
                  <DefaultButton
                    text={
                      localization.ModelAssessment.ModelOverview
                        .probabilityLabelSelectionButton
                    }
                    onClick={() =>
                      this.setState({
                        probabilityFlyoutIsVisible: true
                      })
                    }
                  />
                </Stack.Item>
              </Stack>
            )}
          </Stack.Item>
        </Stack>
        <Panel
          isOpen={this.state.probabilityFlyoutIsVisible}
          closeButtonAriaLabel="Close"
          onDismiss={() => {
            this.setState({ probabilityFlyoutIsVisible: false });
          }}
        >
          <Dropdown
            label={
              localization.ModelAssessment.ModelOverview
                .probabilityForClassSelectionHeader
            }
            options={probabilityOptions}
            styles={{ dropdown: { width: 250 } }}
            onChange={this.onProbabilityOptionSelectionChange}
            selectedKey={this.state.probabilityOption!.key}
          />
        </Panel>
      </>
    );
  }

  private onProbabilityOptionSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({ probabilityOption: item });
    }
  };

  private getPercentile(sortedData: number[], percentile: number) {
    const index = (percentile / 100) * sortedData.length;
    let result;
    if (Math.floor(index) === index) {
      result = (sortedData[index - 1] + sortedData[index]) / 2;
    } else {
      result = sortedData[Math.floor(index)];
    }
    return result;
  }

  private getBoxPlotData(errorCohort: ErrorCohort, index: number, key: string) {
    // key is the identifier for the column (e.g., probability)
    const sortedData: number[] = cloneDeep(
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
      high: upperWhisker,
      low: lowerWhisker,
      max,
      median,
      min,
      outliers,
      q1: firstQuartile,
      q3: thirdQuartile,
      x: index
    };
  }
}
