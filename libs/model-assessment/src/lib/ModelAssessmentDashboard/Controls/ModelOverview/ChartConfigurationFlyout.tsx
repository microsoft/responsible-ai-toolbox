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
  ChoiceGroup,
  Stack,
  IDropdownOption,
  Panel,
  PrimaryButton,
  DefaultButton,
  IChoiceGroupOption
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
    selectedFeatureBasedCohorts: number[],
    datasetCohortChartIsSelected: boolean
  ) => void;
  datasetCohortViewIsSelected: boolean;
}

interface IChartConfigurationFlyoutState {
  newlySelectedDatasetCohorts: number[];
  newlySelectedFeatureBasedCohorts: number[];
  datasetCohortViewIsNewlySelected: boolean;
}

const selectAllOptionKey = "selectAll";

export class ChartConfigurationFlyout extends React.Component<
  IChartConfigurationFlyoutProps,
  IChartConfigurationFlyoutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private datasetCohortsChoiceGroupOption = "datasetCohorts";
  private featureBasecCohortsChoiceGroupOption = "featureBasedCohorts";

  constructor(props: IChartConfigurationFlyoutProps) {
    super(props);
    this.state = {
      newlySelectedDatasetCohorts:
        this.props.selectedDatasetCohorts ??
        this.props.datasetCohorts.map((_, index) => index),
      newlySelectedFeatureBasedCohorts:
        this.props.selectedFeatureBasedCohorts ??
        this.props.featureBasedCohorts.map((_, index) => index),
      datasetCohortViewIsNewlySelected: this.props.datasetCohortViewIsSelected
    };
  }

  public componentDidUpdate(prevProps: IChartConfigurationFlyoutProps) {
    // reset feature-based cohort selection if the underlying feature-based cohorts changed
    let newlySelectedFeatureBasedCohorts =
      this.state.newlySelectedFeatureBasedCohorts;
    const featureBasedCohortsChanged =
      prevProps.featureBasedCohorts.length !==
        this.props.featureBasedCohorts.length ||
      prevProps.featureBasedCohorts.some(
        (errorCohort, index) =>
          errorCohort.cohort.name !==
          this.props.featureBasedCohorts[index].cohort.name
      );
    const selectedFeatureBasedCohortsChanged =
      (prevProps.selectedFeatureBasedCohorts === undefined &&
        this.props.selectedFeatureBasedCohorts !== undefined) ||
      (prevProps.selectedFeatureBasedCohorts &&
        this.props.selectedFeatureBasedCohorts &&
        (this.props.selectedFeatureBasedCohorts.length !==
          prevProps.selectedFeatureBasedCohorts.length ||
          prevProps.selectedFeatureBasedCohorts.some(
            (num, index) =>
              num !== this.props.selectedFeatureBasedCohorts?.[index]
          )));
    if (featureBasedCohortsChanged || selectedFeatureBasedCohortsChanged) {
      newlySelectedFeatureBasedCohorts = this.props.featureBasedCohorts.map(
        (_, index) => index
      );
    }

    let datasetCohortViewIsSelected =
      this.state.datasetCohortViewIsNewlySelected;
    if (
      prevProps.datasetCohortViewIsSelected !==
      this.props.datasetCohortViewIsSelected
    ) {
      datasetCohortViewIsSelected = this.props.datasetCohortViewIsSelected;
    }

    // update state only if there are changes
    if (
      this.state.datasetCohortViewIsNewlySelected !==
        datasetCohortViewIsSelected ||
      (this.state.newlySelectedFeatureBasedCohorts.length !==
        newlySelectedFeatureBasedCohorts.length ||
        this.state.newlySelectedFeatureBasedCohorts.some(
          (num, index) => num !== newlySelectedFeatureBasedCohorts[index]
        ))
    )
      this.setState({
        ...this.state,
        datasetCohortViewIsNewlySelected: datasetCohortViewIsSelected,
        newlySelectedFeatureBasedCohorts: newlySelectedFeatureBasedCohorts
      });
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
      (this.state.datasetCohortViewIsNewlySelected &&
        this.state.newlySelectedDatasetCohorts.length === 0) ||
      (!this.state.datasetCohortViewIsNewlySelected &&
        this.state.newlySelectedFeatureBasedCohorts.length === 0);

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

    const choiceGroupOptions = [
      {
        key: this.datasetCohortsChoiceGroupOption,
        text: localization.ModelAssessment.ModelOverview
          .dataCohortsChartSelectionHeader
      },
      {
        key: this.featureBasecCohortsChoiceGroupOption,
        text: localization.ModelAssessment.ModelOverview
          .featureBasedCohortsChartSelectionHeader,
        disabled: this.props.featureBasedCohorts.length === 0
      }
    ];

    return (
      <Panel
        isOpen={this.props.isOpen}
        closeButtonAriaLabel="Close"
        onDismiss={this.props.onDismissFlyout}
      >
        <Stack tokens={{ childrenGap: "10px" }}>
          <ChoiceGroup
            options={choiceGroupOptions}
            onChange={this.onChoiceGroupChange}
            selectedKey={
              this.state.datasetCohortViewIsNewlySelected
                ? this.datasetCohortsChoiceGroupOption
                : this.featureBasecCohortsChoiceGroupOption
            }
          />
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
              noCohortSelected && this.state.datasetCohortViewIsNewlySelected
                ? localization.ModelAssessment.ModelOverview
                    .chartCohortSelectionPlaceholder
                : undefined
            }
            placeholder={
              localization.ModelAssessment.ModelOverview
                .chartConfigDatasetCohortSelectionPlaceholder
            }
            disabled={!this.state.datasetCohortViewIsNewlySelected}
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
                noCohortSelected && !this.state.datasetCohortViewIsNewlySelected
                  ? localization.ModelAssessment.ModelOverview
                      .chartCohortSelectionPlaceholder
                  : undefined
              }
              placeholder={
                localization.ModelAssessment.ModelOverview
                  .chartConfigFeatureBasedCohortSelectionPlaceholder
              }
              disabled={this.state.datasetCohortViewIsNewlySelected}
            />
          )}
          <Stack horizontal tokens={{ childrenGap: "10px" }}>
            <PrimaryButton
              onClick={this.onConfirm}
              text={
                localization.ModelAssessment.ModelOverview.chartConfigConfirm
              }
              disabled={noCohortSelected}
            />
            <DefaultButton
              onClick={this.props.onDismissFlyout}
              text={
                localization.ModelAssessment.ModelOverview.chartConfigCancel
              }
            />
          </Stack>
        </Stack>
      </Panel>
    );
  }

  private onChoiceGroupChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    if (option) {
      if (option.key === this.datasetCohortsChoiceGroupOption) {
        this.setState({ datasetCohortViewIsNewlySelected: true });
      }
      if (option.key === this.featureBasecCohortsChoiceGroupOption) {
        this.setState({ datasetCohortViewIsNewlySelected: false });
      }
    }
  };

  private onConfirm = () => {
    this.props.updateCohortSelection(
      this.state.newlySelectedDatasetCohorts,
      this.state.newlySelectedFeatureBasedCohorts,
      this.state.datasetCohortViewIsNewlySelected
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
