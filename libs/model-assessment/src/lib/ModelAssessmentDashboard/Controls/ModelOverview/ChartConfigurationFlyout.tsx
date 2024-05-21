// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dropdown,
  Text,
  ChoiceGroup,
  Stack,
  IDropdownOption,
  Panel,
  PrimaryButton,
  DefaultButton,
  IChoiceGroupOption
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IChartConfigurationFlyoutProps } from "./ChartConfigurationFlyoutProps";
import { IChartConfigurationFlyoutState } from "./ChartConfigurationFlyoutState";
import {
  getInitialNewlySelectedDatasetCohorts,
  getInitialNewlySelectedFeatureCohorts,
  makeChartCohortOptionSelectionChange,
  selectAllOptionKey,
  getIndexAndNames,
  getIdAndNames,
  getMaxCohortId,
  noCohortIsSelected
} from "./ChartConfigurationFlyoutUtils";
import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

export class ChartConfigurationFlyout extends React.Component<
  IChartConfigurationFlyoutProps,
  IChartConfigurationFlyoutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private datasetCohortsChoiceGroupOption = "datasetCohorts";
  private featureBasedCohortsChoiceGroupOption = "featureBasedCohorts";

  public constructor(props: IChartConfigurationFlyoutProps) {
    super(props);
    this.state = {
      datasetCohortViewIsNewlySelected: this.props.datasetCohortViewIsSelected,
      newlySelectedDatasetCohorts: getInitialNewlySelectedDatasetCohorts(
        this.props.selectedDatasetCohorts,
        this.props.datasetCohorts
      ),
      newlySelectedFeatureBasedCohorts: getInitialNewlySelectedFeatureCohorts(
        this.props.selectedFeatureBasedCohorts,
        this.props.featureBasedCohorts
      )
    };
  }

  public componentDidUpdate(prevProps: IChartConfigurationFlyoutProps): void {
    // update dataset cohorts if any new ones were created
    const prevMaxCohortID = getMaxCohortId(prevProps.datasetCohorts);
    const currMaxCohortID = getMaxCohortId(this.props.datasetCohorts);
    let newCohorts: number[] = [];
    if (currMaxCohortID > prevMaxCohortID) {
      // A cohort has a higher ID than the previously recorded
      // maximum which indicates that new cohorts were created.
      newCohorts = this.props.datasetCohorts
        .filter(
          (errorCohort) => errorCohort?.cohort?.getCohortID() > prevMaxCohortID
        )
        .map((errorCohort) => errorCohort?.cohort?.getCohortID());
    }

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
    if (featureBasedCohortsChanged) {
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
    const viewChanged =
      this.state.datasetCohortViewIsNewlySelected !==
      datasetCohortViewIsSelected;
    const featureBasedCohortSelectionChanged =
      this.state.newlySelectedFeatureBasedCohorts.length !==
        newlySelectedFeatureBasedCohorts.length ||
      this.state.newlySelectedFeatureBasedCohorts.some(
        (num, index) => num !== newlySelectedFeatureBasedCohorts[index]
      );
    if (
      viewChanged ||
      featureBasedCohortSelectionChanged ||
      newCohorts.length > 0
    ) {
      this.setState({
        ...this.state,
        datasetCohortViewIsNewlySelected: datasetCohortViewIsSelected,
        newlySelectedDatasetCohorts:
          this.state.newlySelectedDatasetCohorts.concat(newCohorts),
        newlySelectedFeatureBasedCohorts
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewChartStyles();

    const selectAllOption = {
      key: selectAllOptionKey,
      text: localization.ModelAssessment.ModelOverview.selectAllCohortsOption
    };
    const datasetCohortOptions = getIdAndNames(this.props.datasetCohorts);
    const featureBasedCohortOptions = getIndexAndNames(
      this.props.featureBasedCohorts
    );

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
        disabled: this.props.featureBasedCohorts.length === 0,
        key: this.featureBasedCohortsChoiceGroupOption,
        text: localization.ModelAssessment.ModelOverview
          .featureBasedCohortsChartSelectionHeader
      }
    ];

    const noCohortSelected = noCohortIsSelected(
      this.state.datasetCohortViewIsNewlySelected,
      this.state.newlySelectedDatasetCohorts,
      this.state.newlySelectedFeatureBasedCohorts
    );

    return (
      <Panel
        isOpen={this.props.isOpen}
        closeButtonAriaLabel="Close"
        onDismiss={this.onDismiss}
        onRenderFooterContent={this.onRenderFooterContent}
        isFooterAtBottom
      >
        <Stack tokens={{ childrenGap: "10px" }}>
          <Text variant="xLarge">
            {
              localization.ModelAssessment.ModelOverview.cohortSelection
                .flyoutHeader
            }
          </Text>
          <Text>
            {
              localization.ModelAssessment.ModelOverview.cohortSelection
                .flyoutDescription
            }
          </Text>
          <ChoiceGroup
            options={choiceGroupOptions}
            onChange={this.onChoiceGroupChange}
            selectedKey={
              this.state.datasetCohortViewIsNewlySelected
                ? this.datasetCohortsChoiceGroupOption
                : this.featureBasedCohortsChoiceGroupOption
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
            ariaLabel={
              localization.ModelAssessment.ModelOverview
                .dataCohortsChartSelectionHeader
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
              ariaLabel={
                localization.ModelAssessment.ModelOverview
                  .featureBasedCohortsChartSelectionHeader
              }
            />
          )}
        </Stack>
      </Panel>
    );
  }

  private onDismiss = (): void => {
    this.setState({
      newlySelectedDatasetCohorts: getInitialNewlySelectedDatasetCohorts(
        this.props.selectedDatasetCohorts,
        this.props.datasetCohorts
      ),
      newlySelectedFeatureBasedCohorts: getInitialNewlySelectedFeatureCohorts(
        this.props.selectedFeatureBasedCohorts,
        this.props.featureBasedCohorts
      )
    });
    this.props.onDismissFlyout();
  };

  private onRenderFooterContent = (): React.ReactElement => {
    return (
      <Stack horizontal tokens={{ childrenGap: "10px" }}>
        <PrimaryButton
          onClick={this.onConfirm}
          text={localization.ModelAssessment.ModelOverview.chartConfigApply}
          disabled={noCohortIsSelected(
            this.state.datasetCohortViewIsNewlySelected,
            this.state.newlySelectedDatasetCohorts,
            this.state.newlySelectedFeatureBasedCohorts
          )}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigApply
          }
        />
        <DefaultButton
          onClick={this.onDismiss}
          text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigCancel
          }
        />
      </Stack>
    );
  };

  private onChoiceGroupChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    option?: IChoiceGroupOption | undefined
  ): void => {
    if (option) {
      if (option.key === this.datasetCohortsChoiceGroupOption) {
        this.setState({ datasetCohortViewIsNewlySelected: true });
      }
      if (option.key === this.featureBasedCohortsChoiceGroupOption) {
        this.setState({ datasetCohortViewIsNewlySelected: false });
      }
    }
  };

  private onConfirm = (): void => {
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
        newlySelectedDatasetCohorts: makeChartCohortOptionSelectionChange(
          this.state.newlySelectedDatasetCohorts,
          this.props.datasetCohorts.map((errorCohort) =>
            errorCohort.cohort.getCohortID()
          ),
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
        newlySelectedFeatureBasedCohorts: makeChartCohortOptionSelectionChange(
          this.state.newlySelectedFeatureBasedCohorts,
          this.props.featureBasedCohorts.map((_cohort, index) => index),
          item
        )
      });
    }
  };
}
