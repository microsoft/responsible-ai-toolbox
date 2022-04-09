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
  IDropdownOption,
  Panel
} from "office-ui-fabric-react";
import React from "react";

interface IChartConfigurationFlyoutProps {
  isOpen: boolean;
  onDismissFlyout: () => void;
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
  updateDatasetCohortSelection: (selectedDatasetCohorts: number[]) => void;
  updateFeatureBasedCohortSelection: (selectedDatasetCohorts: number[]) => void;
}

class IChartConfigurationFlyoutState {}

const selectAllOptionKey = "selectAll";

export class ChartConfigurationFlyout extends React.Component<
  IChartConfigurationFlyoutProps,
  IChartConfigurationFlyoutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  componentDidUpdate(
    prevProps: IChartConfigurationFlyoutProps,
    _prevState: IChartConfigurationFlyoutState
  ) {
    if (
      this.props.featureBasedCohorts.length !==
        prevProps.featureBasedCohorts.length ||
      this.props.featureBasedCohorts.some(
        (value, index) =>
          value.cohort.name !== prevProps.featureBasedCohorts[index].cohort.name
      )
    ) {
      // Feature-based cohorts changed, so update state accordingly.
      // If there are at least 10 selected dataset cohorts
      // don't select feature-based cohorts by default
      this.props.updateFeatureBasedCohortSelection(
        this.props.selectedDatasetCohorts.length >= 10
          ? []
          : this.getAllFeatureBasedCohorts()
      );
    }
  }

  public render(): React.ReactNode {
    const selectAllOption = {
      key: selectAllOptionKey,
      text: localization.ModelAssessment.ModelOverview.selectAllCohortsOption
    };
    const datasetCohortOptions = this.props.datasetCohorts.map(
      (cohort, index) => {
        return { key: index.toString(), text: cohort.cohort.name };
      }
    );
    const featureBasedCohortOptions = this.props.featureBasedCohorts.map(
      (cohort, index) => {
        return { key: index.toString(), text: cohort.cohort.name };
      }
    );

    const noCohortSelected =
      this.props.selectedDatasetCohorts.length +
        this.props.selectedFeatureBasedCohorts.length ===
      0;

    const datasetCohortDropdownSelectedKeys: string[] =
      this.props.selectedDatasetCohorts.map((n) => n.toString());
    if (
      this.props.selectedDatasetCohorts.length > 0 &&
      this.props.selectedDatasetCohorts.length ===
        this.props.datasetCohorts.length
    ) {
      datasetCohortDropdownSelectedKeys.push(selectAllOptionKey);
    }

    const featureBasedCohortDropdownSelectedKeys: string[] =
      this.props.selectedFeatureBasedCohorts.map((n) => n.toString());
    if (
      this.props.featureBasedCohorts.length > 0 &&
      this.props.selectedFeatureBasedCohorts.length ===
        this.props.featureBasedCohorts.length
    ) {
      featureBasedCohortDropdownSelectedKeys.push(selectAllOptionKey);
    }

    return (
      <Panel
        isOpen={this.props.isOpen}
        closeButtonAriaLabel="Close"
        onDismiss={this.props.onDismissFlyout}
      >
        <Stack tokens={{ childrenGap: "10px" }}>
          <Dropdown
            label={
              localization.ModelAssessment.ModelOverview
                .dataCohortsChartSelectionHeader
            }
            multiSelect
            options={[selectAllOption, ...datasetCohortOptions]}
            styles={{ dropdown: { width: 250 } }}
            onChange={this.onChartDatasetCohortOptionSelectionChange}
            selectedKeys={datasetCohortDropdownSelectedKeys}
            errorMessage={
              noCohortSelected
                ? localization.ModelAssessment.ModelOverview
                    .chartCohortSelectionPlaceholder
                : undefined
            }
          />
          {this.props.featureBasedCohorts.length > 0 && (
            <Dropdown
              label={
                localization.ModelAssessment.ModelOverview
                  .featureBasedCohortsChartSelectionHeader
              }
              multiSelect
              options={[selectAllOption, ...featureBasedCohortOptions]}
              styles={{ dropdown: { width: 200 } }}
              onChange={this.onChartFeatureBasedCohortOptionSelectionChange}
              selectedKeys={featureBasedCohortDropdownSelectedKeys}
              errorMessage={
                noCohortSelected
                  ? localization.ModelAssessment.ModelOverview
                      .chartCohortSelectionPlaceholder
                  : undefined
              }
            />
          )}
        </Stack>
      </Panel>
    );
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
          this.props.datasetCohorts.map((_cohort, index) => index),
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
          this.props.featureBasedCohorts.map((_cohort, index) => index),
          item
        )
      );
    }
  };

  private makeChartCohortOptionSelectionChange = (
    currentlySelected: number[],
    allItems: number[],
    item: IDropdownOption
  ): number[] => {
    if (item.key === selectAllOptionKey) {
      // if all items were selected before then unselect all now
      // if at least some items were not selected before then select all now
      if (currentlySelected.length !== allItems.length) {
        return allItems;
      }
      return [];
    }
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
