// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton, PrimaryButton, Stack, Panel } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { ICompositeFilter, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";
import { Cohort } from "../Cohort";

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
  onSave: (newCohort: Cohort, switchNew?: boolean) => void;
  closeCohortEditor: () => void;
  closeCohortEditorPanel: () => void;
  filterList?: IFilter[];
  compositeFilters?: ICompositeFilter[];
  onDelete?: () => void;
}

export interface ICohortEditorState {
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
  public constructor(props: ICohortEditorProps) {
    super(props);
    this.state = {
      cohortName: this.props.cohortName,
      compositeFilters: this.props.compositeFilters || [],
      filters: this.props.filterList || [],
      showConfirmation: false,
      showEmptyCohortError: false
    };
  }

  public render(): React.ReactNode {
    console.log("okok state:", this.state);
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
        >
          <CohortEditorPanelContent
            {...this.props}
            cohortName={this.state.cohortName}
            compositeFilters={this.state.compositeFilters}
            filters={this.state.filters}
            onCohortNameUpdated={this.onCohortNameUpdated}
            onCompositeFiltersUpdated={this.onCompositeFiltersUpdated}
            onFiltersUpdated={this.onFilterUpdated}
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
          onClick={() => this.saveCohort()}
          disabled={this.isSaveDisabled()}
        >
          {localization.Interpret.CohortEditor.save}
        </PrimaryButton>
        <DefaultButton
          onClick={() => this.saveCohort(true)}
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
    return (
      this.isDuplicate() ||
      (!this.state.compositeFilters?.length && !this.state.filters?.length)
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
      const newCohort = new Cohort(
        this.state.cohortName,
        this.props.jointDataset,
        this.state.filters,
        this.state.compositeFilters
      );
      if (newCohort.filteredData.length === 0) {
        this.setState({ showEmptyCohortError: true });
      } else {
        this.props.onSave(newCohort, switchNew);
      }
    }
  };

  private onCohortNameUpdated = (cohortName?: string) => {
    this.setState({ cohortName });
  };

  private onCompositeFiltersUpdated = (
    compositeFilters: ICompositeFilter[]
  ) => {
    this.setState({ compositeFilters });
  };

  private onFilterUpdated = (filters: IFilter[]) => {
    this.setState({ filters });
  };
}
