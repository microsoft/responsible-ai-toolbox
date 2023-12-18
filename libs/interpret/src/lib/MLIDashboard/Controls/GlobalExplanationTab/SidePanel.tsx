// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChoiceGroup,
  Dropdown,
  IChoiceGroupOption,
  IDropdownOption,
  Stack
} from "@fluentui/react";
import {
  Cohort,
  IExplanationModelMetadata,
  IsClassifier,
  WeightVectorOption,
  ChartTypes,
  ITelemetryEvent,
  ifEnableLargeData,
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import React from "react";

import { ClassImportanceWeights } from "../ClassImportanceWeights/ClassImportanceWeights";

import { globalTabStyles } from "./GlobalExplanationTab.styles";
import { IGlobalSeries } from "./IGlobalSeries";

export interface ISidePanelProps {
  weightOptions: WeightVectorOption[];
  metadata: IExplanationModelMetadata;
  weightLabels: Dictionary<string>;
  selectedWeightVector: WeightVectorOption;
  cohortSeries: IGlobalSeries[];
  seriesIsActive: boolean[];
  sortingSeriesIndex: number;
  cohorts: Cohort[];
  chartType: ChartTypes;
  loading?: boolean;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onWeightChange(option: WeightVectorOption): void;
  setSortIndex(option: number): void;
  toggleActivation(index: number): void;
  onChartTypeChange(chartType: ChartTypes): void;
}
interface ISidePanelState {
  weightOptions: IDropdownOption[] | undefined;
}
export class SidePanel extends React.Component<
  ISidePanelProps,
  ISidePanelState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private chartOptions: IChoiceGroupOption[] = [
    {
      key: ChartTypes.Bar,
      text: localization.Interpret.FeatureImportanceWrapper.barText
    },
    {
      key: ChartTypes.Box,
      text: localization.Interpret.FeatureImportanceWrapper.boxText
    }
  ];

  private readonly largeDataChartOptions: IChoiceGroupOption[] = [
    {
      key: ChartTypes.Bar,
      text: localization.Interpret.FeatureImportanceWrapper.barText
    }
  ];

  public constructor(props: ISidePanelProps) {
    super(props);
    this.state = {
      weightOptions: this.getWeightOptions()
    };
  }
  public render(): React.ReactNode {
    const classNames = globalTabStyles();
    return (
      <Stack className={classNames.legendAndSort}>
        <Dropdown
          label={localization.Interpret.GlobalTab.sortByCohort}
          selectedKey={this.props.sortingSeriesIndex}
          options={this.props.cohortSeries.map((row, rowIndex) => ({
            key: rowIndex,
            text: row.name
          }))}
          onChange={this.onSortChange}
          disabled={this.props.loading}
        />
        <ChoiceGroup
          label={localization.Interpret.DatasetExplorer.chartType}
          selectedKey={this.props.chartType}
          options={this.getChartOptions()}
          onChange={this.onChartTypeChange}
          id="ChartTypeSelection"
          disabled={this.props.loading}
        />
        {IsClassifier(this.props.metadata.modelType) &&
          this.state.weightOptions && (
            <div>
              <ClassImportanceWeights
                onWeightChange={this.props.onWeightChange}
                selectedWeightVector={this.props.selectedWeightVector}
                weightOptions={this.props.weightOptions}
                weightLabels={this.props.weightLabels}
                disabled={this.props.loading}
                telemetryHook={this.props.telemetryHook}
              />
            </div>
          )}
      </Stack>
    );
  }

  private onSortChange = (
    _event?: React.FormEvent,
    item?: IDropdownOption
  ): void => {
    if (typeof item?.key === "number") {
      this.props.setSortIndex(item.key);
    }
  };

  private onChartTypeChange = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key !== undefined) {
      this.props.onChartTypeChange(item.key as ChartTypes);
    }
  };

  private getWeightOptions(): IDropdownOption[] | undefined {
    if (IsClassifier(this.props.metadata.modelType)) {
      return this.props.weightOptions.map((option) => {
        return {
          key: option,
          text: this.props.weightLabels[option]
        };
      });
    }
    return undefined;
  }

  private getChartOptions(): IChoiceGroupOption[] {
    if (ifEnableLargeData(this.context.dataset)) {
      return this.largeDataChartOptions;
    }

    return this.chartOptions;
  }
}
