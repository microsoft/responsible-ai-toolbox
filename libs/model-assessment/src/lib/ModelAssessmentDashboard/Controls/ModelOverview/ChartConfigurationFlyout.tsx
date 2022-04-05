// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Dropdown,
  Stack,
  DefaultButton,
  IDropdownOption
} from "office-ui-fabric-react";
import React from "react";

interface IChartConfigurationFlyoutProps {
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
  updateDatasetCohortSelection: (selectedDatasetCohorts: number[]) => void;
  updateFeatureBasedCohortSelection: (selectedDatasetCohorts: number[]) => void;
}

class IChartConfigurationFlyoutState {}

export class ChartConfigurationFlyout extends React.Component<
  IChartConfigurationFlyoutProps,
  IChartConfigurationFlyoutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IChartConfigurationFlyoutProps) {
    super(props);
    this.state = {
      selectedDatasetCohorts: this.getAllDatasetCohorts(),
      selectedFeatureBasedCohorts: this.getAllFeatureBasedCohorts()
    };
  }

  componentDidUpdate(
    prevProps: IChartConfigurationFlyoutProps,
    _prevState: IChartConfigurationFlyoutState
  ) {
    if (this.props.featureBasedCohorts !== prevProps.featureBasedCohorts) {
      // feature-based cohorts changed, update state
      this.setState({
        selectedFeatureBasedCohorts: this.getAllFeatureBasedCohorts()
      });
    }
  }

  public render(): React.ReactNode {
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

    const noCohortSelected =
      this.props.selectedDatasetCohorts.length +
        this.props.selectedFeatureBasedCohorts.length ===
      0;

    return (
      <Stack tokens={{ childrenGap: "10px" }}>
        <Stack tokens={{ childrenGap: "10px" }}>
          <Dropdown
            label={
              localization.ModelAssessment.ModelOverview
                .dataCohortsChartSelectionHeader
            }
            multiSelect
            options={datasetCohortOptions}
            styles={{ dropdown: { width: 250 } }}
            onChange={this.onChartDatasetCohortOptionSelectionChange}
            selectedKeys={this.props.selectedDatasetCohorts}
            errorMessage={
              noCohortSelected
                ? localization.ModelAssessment.ModelOverview
                    .chartCohortSelectionPlaceholder
                : undefined
            }
          />
          <Stack horizontal tokens={{ childrenGap: "10px" }}>
            <DefaultButton
              text={localization.ModelAssessment.ModelOverview.selectAllButton}
              onClick={() =>
                this.props.updateDatasetCohortSelection(
                  this.getAllDatasetCohorts()
                )
              }
            />
            <DefaultButton
              text={
                localization.ModelAssessment.ModelOverview.unselectAllButton
              }
              onClick={() => this.props.updateDatasetCohortSelection([])}
            />
          </Stack>
        </Stack>
        {this.props.featureBasedCohorts.length > 0 && (
          <Stack tokens={{ childrenGap: "10px" }}>
            <Dropdown
              label={
                localization.ModelAssessment.ModelOverview
                  .featureBasedCohortsChartSelectionHeader
              }
              multiSelect
              options={featureBasedCohortOptions}
              styles={{ dropdown: { width: 200 } }}
              onChange={this.onChartFeatureBasedCohortOptionSelectionChange}
              selectedKeys={this.props.selectedFeatureBasedCohorts}
              errorMessage={
                noCohortSelected
                  ? localization.ModelAssessment.ModelOverview
                      .chartCohortSelectionPlaceholder
                  : undefined
              }
            />
            <Stack horizontal tokens={{ childrenGap: "10px" }}>
              <DefaultButton
                text={
                  localization.ModelAssessment.ModelOverview.selectAllButton
                }
                onClick={() =>
                  this.props.updateFeatureBasedCohortSelection(
                    this.getAllFeatureBasedCohorts()
                  )
                }
              />
              <DefaultButton
                text={
                  localization.ModelAssessment.ModelOverview.unselectAllButton
                }
                onClick={() => this.props.updateFeatureBasedCohortSelection([])}
              />
            </Stack>
          </Stack>
        )}
      </Stack>
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
      this.props.updateDatasetCohortSelection(
        this.makeChartCohortOptionSelectionChange(
          this.props.selectedDatasetCohorts,
          item
        )
      );
    }
  };

  private onChartFeatureBasedCohortOptionSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.props.updateFeatureBasedCohortSelection(
        this.makeChartCohortOptionSelectionChange(
          this.props.selectedFeatureBasedCohorts,
          item
        )
      );
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
}
