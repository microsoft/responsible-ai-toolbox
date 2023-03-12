// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton, PrimaryButton, Stack, Panel } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { DatasetCohort } from "../../DatasetCohort";
import { ICompositeFilter, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";
import { Cohort } from "../Cohort";
import { CohortSource } from "../Constants";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { CohortEditorPanelContent } from "./CohortEditorPanelContent";
import { EmptyCohortDialog } from "./EmptyCohortDialog";

export interface ICohortEditorProps {
  jointDataset: JointDataset;
  cohortName: string;
  isNewCohort: boolean;
  deleteIsDisabled: boolean;
  disableEditName?: boolean;
  existingCohortNames?: string[];
  onSave: (
    newCohort: Cohort,
    newDatasetCohort?: DatasetCohort,
    switchNew?: boolean
  ) => void;
  closeCohortEditor: () => void;
  closeCohortEditorPanel: () => void;
  legacyFilterList?: IFilter[];
  filterList?: IFilter[];
  compositeFilters?: ICompositeFilter[];
  onDelete?: () => void;
}

export interface ICohortEditorState {
  legacyFilters: IFilter[];
  filters: IFilter[];
  compositeFilters: ICompositeFilter[];
  cohortName?: string;
  showConfirmation: boolean;
  showEmptyCohortError: boolean;
}

export class CohortEditor extends React.PureComponent<
  ICohortEditorProps,
  ICohortEditorState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ICohortEditorProps) {
    super(props);
    this.state = {
      cohortName: this.props.cohortName,
      compositeFilters: this.props.compositeFilters || [],
      filters: this.props.filterList || [],
      legacyFilters: this.props.legacyFilterList || [],
      showConfirmation: false,
      showEmptyCohortError: false
    };
  }

  public render(): React.ReactNode {
    return (
      <>
        <Panel
          onOuterClick={(): number => {
            return 0;
          }} // https://github.com/microsoft/fluentui/issues/6476
          id="cohortEditPanel"
          isOpen
          onDismiss={this.props.closeCohortEditorPanel}
          onRenderFooter={this.renderFooter}
          isFooterAtBottom
          isLightDismiss
          closeButtonAriaLabel={localization.Common.close}
        >
          <CohortEditorPanelContent
            {...this.props}
            cohortName={this.state.cohortName}
            compositeFilters={this.state.compositeFilters}
            legacyFilters={this.state.legacyFilters}
            filters={this.state.filters}
            onCohortNameUpdated={this.onCohortNameUpdated}
            onCompositeFiltersUpdated={this.onCompositeFiltersUpdated}
            onFiltersUpdated={this.onFilterUpdated}
            dataset={this.context.dataset}
            activeFlights={this.context.featureFlights}
            columnRanges={this.context.columnRanges}
            modelType={this.context.modelType}
          />
        </Panel>
        {this.renderCancelDialog()}
        {this.renderEmptyCohortDialog()}
      </>
    );
  }
  private renderFooter = (): JSX.Element => {
    const styles = cohortEditorStyles();
    return (
      <Stack horizontal tokens={{ childrenGap: "l1", padding: "l1" }}>
        {!this.props.isNewCohort && !this.props.disableEditName && (
          <DefaultButton
            disabled={this.props.deleteIsDisabled}
            onClick={this.deleteCohort}
            className={styles.deleteCohort}
          >
            {localization.Interpret.CohortEditor.delete}
          </DefaultButton>
        )}
        <PrimaryButton
          onClick={(): void => this.saveCohort()}
          disabled={this.isSaveDisabled()}
        >
          {localization.Interpret.CohortEditor.save}
        </PrimaryButton>
        <DefaultButton
          onClick={(): void => this.saveCohort(true)}
          disabled={this.isSaveDisabled()}
        >
          {localization.Interpret.CohortEditor.saveAndSwitch}
        </DefaultButton>
        <DefaultButton onClick={this.onCancelClick}>
          {localization.Interpret.CohortEditor.cancel}
        </DefaultButton>
      </Stack>
    );
  };

  private readonly renderCancelDialog = (): React.ReactNode => {
    if (!this.state.showConfirmation) {
      return undefined;
    }
    return (
      <ConfirmationDialog
        title={localization.Interpret.CohortEditor.cancelTitle}
        subText={
          this.props.isNewCohort
            ? localization.Interpret.CohortEditor.cancelNewCohort
            : localization.Interpret.CohortEditor.cancelExistingCohort
        }
        confirmButtonText={localization.Interpret.CohortEditor.cancelYes}
        cancelButtonText={localization.Interpret.CohortEditor.cancelNo}
        onConfirm={this.onCancelConfirm}
        onClose={this.onCancelClose}
      />
    );
  };

  private readonly renderEmptyCohortDialog = (): React.ReactNode => {
    if (!this.state.showEmptyCohortError) {
      return undefined;
    }
    return <EmptyCohortDialog onClose={this.onEmptyCohortClose} />;
  };

  private isSaveDisabled = (): boolean => {
    const filters = this.context.isRefactorFlightOn
      ? this.state.filters
      : this.state.legacyFilters;
    return (
      this.isDuplicate() ||
      (!this.state.compositeFilters?.length && !filters?.length)
    );
  };

  private isDuplicate = (): boolean => {
    return !!(
      this.props.isNewCohort &&
      this.state.cohortName &&
      this.props.existingCohortNames?.includes(this.state.cohortName)
    );
  };

  private deleteCohort = (): void => {
    if (this.props.onDelete) {
      this.props.onDelete();
    }
  };

  private readonly onCancelClick = (): void => {
    this.setState({ showConfirmation: true });
  };

  private readonly onCancelConfirm = async (): Promise<void> => {
    const callback = this.props.isNewCohort
      ? this.props.closeCohortEditorPanel
      : this.props.closeCohortEditor;
    callback();
    this.setState({ showConfirmation: false });
  };

  private readonly onCancelClose = (): void => {
    this.setState({ showConfirmation: false });
  };

  private readonly onEmptyCohortClose = (): void => {
    this.setState({ showEmptyCohortError: false });
  };

  private saveCohort = (switchNew?: boolean): void => {
    if (this.state.cohortName?.length) {
      const newDatasetCohort = new DatasetCohort(
        this.state.cohortName,
        this.context.dataset,
        this.state.filters,
        this.context.modelType,
        this.context.columnRanges,
        CohortSource.ManuallyCreated
      );
      const newCohort = new Cohort(
        this.state.cohortName,
        this.props.jointDataset,
        this.state.legacyFilters,
        this.state.compositeFilters
      );
      const filteredResultsLength = this.context.isRefactorFlightOn
        ? newDatasetCohort.selectedIndexes.length
        : newCohort.filteredData.length;
      if (filteredResultsLength === 0) {
        this.setState({ showEmptyCohortError: true });
      } else {
        this.props.onSave(newCohort, newDatasetCohort, switchNew);
      }
    }
  };

  private onCohortNameUpdated = (cohortName?: string): void => {
    this.setState({ cohortName });
  };

  private onCompositeFiltersUpdated = (
    compositeFilters: ICompositeFilter[]
  ): void => {
    this.setState({ compositeFilters });
  };

  private onFilterUpdated = (filters: IFilter[], isLegacy: boolean): void => {
    isLegacy
      ? this.setState({ legacyFilters: filters })
      : this.setState({ filters });
  };
}
