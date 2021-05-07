// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  CohortEditor,
  CohortInfo,
  CohortList,
  CohortSource,
  defaultModelAssessmentContext,
  EditCohort,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext,
  SaveCohort,
  ShiftCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  CommandBar,
  ICommandBarItemProps,
  IIconProps,
  IButtonStyles
} from "office-ui-fabric-react";
import React from "react";

import { IModelAssessmentDashboardTab } from "../ModelAssessmentDashboardState";

import { DashboardSettings } from "./DashboardSettings";
import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  localUrl: string;
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  removeTab(index: number): void;
}
interface IMainMenuState {
  infoPanelVisible: boolean;
  cohortListPanelVisible: boolean;
  createCohortVisible: boolean;
  editCohortVisible: boolean;
  mapShiftVisible: boolean;
  saveCohortVisible: boolean;
  shiftCohortVisible: boolean;
  dashboardSettingsVisible: boolean;
  editedCohort: ErrorCohort;
}

const settingsIcon: IIconProps = { iconName: "Settings" };

const buttonStyle: IButtonStyles = {
  root: { padding: "0px 4px" }
};

export class MainMenu extends React.PureComponent<
  IMainMenuProps,
  IMainMenuState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public componentDidMount() {
    this.setState({
      editedCohort: this.context.errorCohorts[0]
    });
  }
  public render(): React.ReactNode {
    if (!this.state) return React.Fragment;
    const farItems: ICommandBarItemProps[] = [];
    const helpItems: ICommandBarItemProps[] = [
      {
        buttonStyles: buttonStyle,
        iconProps: settingsIcon,
        key: "cohortSettings",
        subMenuProps: {
          items: [
            {
              iconProps: { iconName: "Import" },
              key: "shiftCohort",
              onClick: this.toggleShiftCohort,
              text: localization.ModelAssessment.MainMenu.shiftCohort
            },
            {
              iconProps: { iconName: "Save" },
              key: "saveCohort",
              onClick: this.toggleSaveCohort,
              text: localization.ModelAssessment.MainMenu.saveCohort
            },
            {
              iconProps: { iconName: "PageList" },
              key: "cohortList",
              onClick: this.toggleCohortListPanel,
              text: localization.ModelAssessment.MainMenu.cohortList
            },
            {
              iconProps: { iconName: "Add" },
              key: "createCohort",
              onClick: this.toggleCohortEditor,
              text: localization.ModelAssessment.MainMenu.createCohort
            },
            {
              iconProps: { iconName: "Info" },
              key: "cohortInfo",
              onClick: this.toggleInfoPanel,
              text: localization.ModelAssessment.MainMenu.cohortInfo
            }
          ]
        },
        text: localization.ModelAssessment.MainMenu.cohortSettings
      },
      {
        buttonStyles: buttonStyle,
        iconProps: settingsIcon,
        key: "dashboardSettings",
        onClick: this.toggleDashboardSettings,
        text: localization.ModelAssessment.MainMenu.DashboardSettings
      }
    ];
    farItems.push(...helpItems);
    const classNames = mainMenuStyles();
    return (
      <>
        <div className={classNames.banner}>
          <div className={classNames.mainMenu}>
            <CommandBar
              items={[]}
              farItems={farItems}
              ariaLabel="Use left and right arrow keys to navigate between commands"
            />
          </div>
        </div>
        <CohortInfo
          isOpen={this.state?.infoPanelVisible}
          currentCohort={this.context.selectedErrorCohort}
          onDismiss={this.toggleInfoPanel}
          onSaveCohortClick={this.toggleSaveCohort}
        />
        <CohortList
          cohorts={this.context.errorCohorts}
          isOpen={this.state?.cohortListPanelVisible}
          onDismiss={this.toggleCohortListPanel}
          onEditCohortClick={this.openEditCohort}
        />
        {this.state.createCohortVisible && (
          <CohortEditor
            // We're only using it for new cohorts here, so we can
            // ignore cases such as deletion or editing cohorts.
            jointDataset={this.context.jointDataset}
            filterList={this.context.selectedErrorCohort.cohort.filters}
            cohortName={this.context.selectedErrorCohort.cohort.name}
            isNewCohort={true}
            deleteIsDisabled={true}
            onSave={this.saveManuallyCreatedCohort}
            closeCohortEditor={this.toggleCohortEditor}
            closeCohortEditorPanel={this.toggleCohortEditor}
            onDelete={() => {}}
          />
        )}
        <SaveCohort
          isOpen={this.state.saveCohortVisible}
          onDismiss={this.toggleSaveCohort}
          onSave={this.saveCohort}
          temporaryCohort={this.context.selectedErrorCohort}
          baseCohort={this.context.baseErrorCohort}
        />
        <EditCohort
          isOpen={this.state.editCohortVisible}
          onDismiss={this.closeEditCohort}
          onSave={this.saveEditCohort}
          onDelete={this.deleteEditCohort}
          errorCohort={this.state.editedCohort}
          selectedCohort={this.context.selectedErrorCohort}
        />
        <ShiftCohort
          isOpen={this.state.shiftCohortVisible}
          onDismiss={this.toggleShiftCohort}
          onApply={this.applyShiftCohort}
        />
        <DashboardSettings
          isOpen={this.state.dashboardSettingsVisible}
          onDismiss={this.toggleDashboardSettings}
          activeGlobalTabs={this.props.activeGlobalTabs}
          removeTab={this.props.removeTab}
        />
      </>
    );
  }

  private toggleInfoPanel = () =>
    this.setState((prev) => ({ infoPanelVisible: !prev.infoPanelVisible }));

  private toggleCohortListPanel = () =>
    this.setState((prev) => ({
      cohortListPanelVisible: !prev.cohortListPanelVisible
    }));

  private toggleCohortEditor = () =>
    this.setState((prev) => ({
      createCohortVisible: !prev.createCohortVisible
    }));

  private openEditCohort = (editedCohort: ErrorCohort) =>
    this.setState({ editCohortVisible: true, editedCohort });

  private closeEditCohort = () => this.setState({ editCohortVisible: true });

  private saveEditCohort = (
    originalCohort: ErrorCohort,
    editedCohort: ErrorCohort
  ): void => {
    const cohorts = this.context.errorCohorts.filter(
      (errorCohort) => errorCohort.cohort.name !== originalCohort.cohort.name
    );
    let selectedCohort = this.context.selectedErrorCohort;
    if (originalCohort.cohort.name === selectedCohort.cohort.name) {
      selectedCohort = editedCohort;
    }
    this.context.updateErrorCohorts([editedCohort, ...cohorts], selectedCohort);
  };

  private deleteEditCohort = (deletedCohort: ErrorCohort): void => {
    const cohorts = this.context.errorCohorts.filter(
      (errorCohort) => errorCohort.cohort.name !== deletedCohort.cohort.name
    );
    this.context.updateErrorCohorts(
      cohorts,
      cohorts.includes(this.context.selectedErrorCohort)
        ? this.context.selectedErrorCohort
        : cohorts[0]
    );
  };

  private toggleShiftCohort = () =>
    this.setState((prev) => ({ shiftCohortVisible: !prev.shiftCohortVisible }));

  private toggleSaveCohort = () =>
    this.setState((prev) => ({ saveCohortVisible: !prev.saveCohortVisible }));

  private toggleDashboardSettings = () =>
    this.setState((prev) => ({
      dashboardSettingsVisible: !prev.dashboardSettingsVisible
    }));

  private applyShiftCohort = (selectedCohort: ErrorCohort): void => {
    let cohorts = this.context.errorCohorts;
    cohorts = cohorts.filter(
      (cohort) => cohort.cohort.name !== selectedCohort.cohort.name
    );
    this.context.updateErrorCohorts(
      [selectedCohort, ...cohorts],
      selectedCohort,
      selectedCohort
    );
  };

  private saveCohort = (savedCohort: ErrorCohort): void => {
    let newCohorts = [savedCohort, ...this.context.errorCohorts];
    newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
    this.context.updateErrorCohorts(newCohorts, savedCohort);
  };

  private saveManuallyCreatedCohort = (manuallyCreatedCohort: Cohort): void => {
    let newErrorCohort = new ErrorCohort(
      manuallyCreatedCohort,
      this.context.jointDataset,
      0,
      CohortSource.ManuallyCreated
    );
    let newCohorts = [...this.context.errorCohorts, newErrorCohort];
    newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
    this.context.updateErrorCohorts(newCohorts, newErrorCohort, newErrorCohort);
    this.toggleCohortEditor();
  };
}
