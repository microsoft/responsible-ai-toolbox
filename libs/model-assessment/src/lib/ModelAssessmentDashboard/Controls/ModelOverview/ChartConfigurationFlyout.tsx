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
  Panel,
  PrimaryButton,
  DefaultButton
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IChartConfigurationFlyoutProps {
  isOpen: boolean;
  onDismissFlyout: () => void;
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  selectedDatasetCohorts?: number[];
  selectedFeatureBasedCohorts?: number[];
  updateCohortSelection: (
    selectedDatasetCohorts: number[],
    selectedFeatureBasedCohorts: number[]
  ) => void;
}

interface IChartConfigurationFlyoutState {
  newlySelectedDatasetCohorts: number[];
  newlySelectedFeatureBasedCohorts: number[];
}

const selectAllOptionKey = "selectAll";

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
      newlySelectedDatasetCohorts:
        this.props.selectedDatasetCohorts ??
        this.props.datasetCohorts.map((_, index) => index),
      newlySelectedFeatureBasedCohorts:
        this.props.selectedFeatureBasedCohorts ??
        this.props.featureBasedCohorts.map((_, index) => index)
    };
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewChartStyles();

    const selectAllOption = {
      key: selectAllOptionKey,
      text: localization.ModelAssessment.ModelOverview.selectAllCohortsOption
    };
    const datasetCohortOptions = this.getIndexAndNames(
      this.props.datasetCohorts
    );
    const featureBasedCohortOptions = this.getIndexAndNames(
      this.props.featureBasedCohorts
    );

    const noCohortSelected =
      (this.props.selectedDatasetCohorts?.length ?? 0) +
        (this.props.selectedFeatureBasedCohorts?.length ?? 0) ===
      0;

    const datasetCohortDropdownSelectedKeys: string[] =
      this.state.newlySelectedDatasetCohorts.map((n) => n.toString());
    if (
      this.state.newlySelectedDatasetCohorts.length > 0 &&
      this.state.newlySelectedDatasetCohorts.length ===
        this.props.datasetCohorts.length
    ) {
      datasetCohortDropdownSelectedKeys.push(selectAllOptionKey);
    }

    const featureBasedCohortDropdownSelectedKeys: string[] =
      this.state.newlySelectedFeatureBasedCohorts.map((n) => n.toString());
    if (
      this.state.newlySelectedFeatureBasedCohorts.length > 0 &&
      this.state.newlySelectedFeatureBasedCohorts.length ===
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
            className={classNames.chartConfigDropdown}
            label={
              localization.ModelAssessment.ModelOverview
                .dataCohortsChartSelectionHeader
            }
            multiSelect
            options={[selectAllOption, ...datasetCohortOptions]}
            onChange={this.onChartDatasetCohortOptionSelectionChange}
            selectedKeys={datasetCohortDropdownSelectedKeys}
            errorMessage={
              noCohortSelected
                ? localization.ModelAssessment.ModelOverview
                    .chartCohortSelectionPlaceholder
                : undefined
            }
            placeholder={
              localization.ModelAssessment.ModelOverview
                .chartConfigDatasetCohortSelectionPlaceholder
            }
          />
          {this.props.featureBasedCohorts.length > 0 && (
            <Dropdown
              className={classNames.chartConfigDropdown}
              label={
                localization.ModelAssessment.ModelOverview
                  .featureBasedCohortsChartSelectionHeader
              }
              multiSelect
              options={[selectAllOption, ...featureBasedCohortOptions]}
              onChange={this.onChartFeatureBasedCohortOptionSelectionChange}
              selectedKeys={featureBasedCohortDropdownSelectedKeys}
              errorMessage={
                noCohortSelected
                  ? localization.ModelAssessment.ModelOverview
                      .chartCohortSelectionPlaceholder
                  : undefined
              }
              placeholder={
                localization.ModelAssessment.ModelOverview
                  .chartConfigFeatureBasedCohortSelectionPlaceholder
              }
            />
          )}
          <PrimaryButton
            onClick={this.onConfirm}
            text={localization.ModelAssessment.ModelOverview.chartConfigConfirm}
          />
          <DefaultButton
            onClick={this.props.onDismissFlyout}
            text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
          />
        </Stack>
      </Panel>
    );
  }

  // private getAllFeatureBasedCohorts() {
  //   return this.props.featureBasedCohorts.map((_cohort, index) => {
  //     return index;
  //   });
  // }

  private onConfirm = () => {
    this.props.updateCohortSelection(
      this.state.newlySelectedDatasetCohorts,
      this.state.newlySelectedFeatureBasedCohorts
    );
  };

  private onChartDatasetCohortOptionSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({
        newlySelectedDatasetCohorts: this.makeChartCohortOptionSelectionChange(
          this.state.newlySelectedDatasetCohorts,
          this.props.datasetCohorts.map((_cohort, index) => index),
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
        newlySelectedFeatureBasedCohorts:
          this.makeChartCohortOptionSelectionChange(
            this.state.newlySelectedFeatureBasedCohorts,
            this.props.featureBasedCohorts.map((_cohort, index) => index),
            item
          )
      });
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

  private getIndexAndNames(errorCohorts: ErrorCohort[]) {
    return errorCohorts.map((cohort, index) => {
      return { key: index.toString(), text: cohort.cohort.name };
    });
  }
}
