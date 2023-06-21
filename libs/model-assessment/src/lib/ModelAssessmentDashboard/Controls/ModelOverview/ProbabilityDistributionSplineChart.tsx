// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IChoiceGroupOption, Spinner } from "@fluentui/react";
import {
  BasicHighChart,
  calculateSplinePlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext,
  ifEnableLargeData,
  IProbabilityBinCount,
  Cohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

interface IProbabilityDistributionSplineChartProps {
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
}

interface IProbabilityDistributionSplineChartState {
  probabilityBinCountArray: Array<IProbabilityBinCount[] | undefined>;
  selectedCohorts: ErrorCohort[];
}

export class ProbabilityDistributionSplineChart extends React.Component<
  IProbabilityDistributionSplineChartProps,
  IProbabilityDistributionSplineChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IProbabilityDistributionSplineChartProps) {
    super(props);
    this.state = {
      probabilityBinCountArray: [],
      selectedCohorts: this.props.selectedCohorts
    };
  }

  public componentDidMount(): void {
    this.calculateSplineDataIfNeeded();
  }

  public componentDidUpdate(
    prevProps: IProbabilityDistributionSplineChartProps
  ): void {
    this.calculateSplineDataIfNeeded(prevProps);
  }

  public async calculateSplineDataIfNeeded(
    prevProps?: IProbabilityDistributionSplineChartProps
  ): Promise<void> {
    if (
      prevProps === undefined ||
      !_.isEqual(prevProps.selectedCohorts, this.props.selectedCohorts) ||
      !_.isEqual(
        prevProps.probabilityOption?.id,
        this.props.probabilityOption?.id
      )
    ) {
      let splinePlotData = undefined;
      if (
        this.context.requestSplinePlotDistribution &&
        ifEnableLargeData(this.context.dataset)
      ) {
        splinePlotData = this.props.selectedCohorts.map(async (errorCohort) => {
          const filtersRelabeled = Cohort.getLabeledFilters(
            errorCohort.cohort.filters,
            errorCohort.jointDataset
          );

          const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
            errorCohort.cohort.compositeFilters,
            errorCohort.jointDataset
          );
          const data = [
            filtersRelabeled,
            compositeFiltersRelabeled,
            this.props.probabilityOption?.text
          ];
          const result = await this.context.requestSplinePlotDistribution?.(
            data,
            new AbortController().signal
          );
          return result;
        });
      } else {
        splinePlotData = this.props.selectedCohorts.map((cohort) => {
          return calculateSplinePlotDataFromErrorCohort(
            cohort,
            this.props.probabilityOption?.key
          ); // TODO: handle undefined case
        });
      }
      const data = await Promise.all(splinePlotData);
      this.setState({
        probabilityBinCountArray: data,
        selectedCohorts: this.props.selectedCohorts
      });
    }
  }

  public render(): React.ReactNode {
    const theme = getTheme();
    if (
      this.state.probabilityBinCountArray === undefined ||
      this.state.probabilityBinCountArray.length === 0
    ) {
      return <Spinner />;
    }

    return (
      <BasicHighChart
        id={"modelOverviewProbabilityDistributionSplineChart"}
        theme={theme}
        configOverride={{
          chart: {
            type: "spline"
          },
          legend: {
            align: "right",
            enabled: true,
            layout: "vertical",
            verticalAlign: "middle"
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            }
          },
          series: this.state.probabilityBinCountArray.map(
            (splineData, index) => {
              return {
                data: splineData?.map(
                  (probBinCount: { binCount: any }) => probBinCount.binCount
                ),
                name: this.state.selectedCohorts[index].cohort.name,
                type: "spline"
              };
            }
          ),
          xAxis: {
            categories: this.state.probabilityBinCountArray.map((splineData) =>
              splineData?.map(
                (probBinCount: { binName: any }) => probBinCount.binName
              )
            )[0],
            title: { text: this.props.probabilityOption?.text }
          },
          yAxis: {
            title: {
              text: localization.ModelAssessment.ModelOverview.countAxisLabel
            }
          }
        }}
      />
    );
  }
}
