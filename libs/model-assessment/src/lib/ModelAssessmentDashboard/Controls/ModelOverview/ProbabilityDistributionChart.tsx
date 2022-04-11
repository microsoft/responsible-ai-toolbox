// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
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
import { PointOptionsObject } from "highcharts";

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

  public componentDidMount(): void {
    if (this.state.probabilityOption === undefined) {
      const probabilityOptions = this.getProbabilityOptions();
      if (probabilityOptions.length > 0) {
        this.setState({ probabilityOption: probabilityOptions[0] });
      }
    }
  }

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

    const probabilityOptions = this.getProbabilityOptions();

    if (probabilityOptions.length === 0) {
      return React.Fragment;
    }

    if (this.state.probabilityOption === undefined) {
      this.setState({ probabilityOption: probabilityOptions[0] });
      return React.Fragment;
    }

    const boxplotData = selectedCohorts.map((cohort, index) => {
      return calculateBoxPlotDataFromErrorCohort(
        cohort,
        index,
        this.state.probabilityOption!.key.toString()
      );
    });
    // map to highcharts-specific naming convention
    const boxData = boxplotData.map((cohortBoxPlotData) => {
      return {
        q1: cohortBoxPlotData.lowerQuartile,
        q3: cohortBoxPlotData.upperQuartile,
        high: cohortBoxPlotData.upperFence,
        low: cohortBoxPlotData.lowerFence,
        median: cohortBoxPlotData.median
      } as PointOptionsObject;
    });
    const outlierData = boxplotData
      .map((cohortBoxPlotData) => cohortBoxPlotData.outliers)
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
                <Text>
                  {
                    localization.ModelAssessment.ModelOverview.boxPlot
                      .boxPlotPlaceholder
                  }
                </Text>
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
                        data: boxData,
                        fillColor: "#b2d6f2",
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

  private getProbabilityOptions(): IDropdownOption[] {
    return new Array(this.context.jointDataset.predictionClassCount)
      .fill(0)
      .map((_, index) => {
        const key = JointDataset.ProbabilityYRoot + index.toString();
        return {
          key,
          text: this.context.jointDataset.metaDict[key].label
        };
      });
  }
}
