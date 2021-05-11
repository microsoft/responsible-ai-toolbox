// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CohortInfo,
  CohortList,
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
  editCohortVisible: boolean;
  mapShiftVisible: boolean;
  saveCohortVisible: boolean;
  shiftCohortVisible: boolean;
  dashboardSettingsVisible: boolean;
  editedCohort: ErrorCohort;
}

const settingsIcon: IIconProps = { iconName: "Settings" };
const infoIcon: IIconProps = { iconName: "Info" };

const buttonStyle: IButtonStyles = {
  root: { padding: "0px 4px" }
};

export class MainMenu extends React.PureComponent<
  IMainMenuProps,
  IMainMenuState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;
  public componentDidMount(): void {
    this.setState({
      editedCohort: this.context.errorCohorts[0]
    });
  }
  public render(): React.ReactNode {
    if (!this.state) {
      return React.Fragment;
    }
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
              text: localization.ErrorAnalysis.MainMenu.shiftCohort
            },
            {
              iconProps: { iconName: "Save" },
              key: "saveCohort",
              onClick: this.toggleSaveCohort,
              text: localization.ErrorAnalysis.MainMenu.saveCohort
            },
            {
              iconProps: { iconName: "PageList" },
              key: "cohortList",
              onClick: this.toggleCohortListPanel,
              text: localization.ErrorAnalysis.MainMenu.cohortList
            }
          ]
        },
        text: localization.ErrorAnalysis.MainMenu.cohortSettings
      },
      {
        buttonStyles: buttonStyle,
        iconProps: infoIcon,
        key: "cohortInfo",
        onClick: this.toggleInfoPanel,
        text: localization.ErrorAnalysis.MainMenu.cohortInfo
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

  private toggleInfoPanel = (): void =>
    this.setState((prev) => ({ infoPanelVisible: !prev.infoPanelVisible }));
  private toggleCohortListPanel = (): void =>
    this.setState((prev) => ({
      cohortListPanelVisible: !prev.cohortListPanelVisible
    }));

  private openEditCohort = (editedCohort: ErrorCohort): void =>
    this.setState({ editCohortVisible: true, editedCohort });
  private closeEditCohort = (): void =>
    this.setState({ editCohortVisible: true });
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

  private toggleShiftCohort = (): void =>
    this.setState((prev) => ({ shiftCohortVisible: !prev.shiftCohortVisible }));

  private toggleSaveCohort = (): void =>
    this.setState((prev) => ({ saveCohortVisible: !prev.saveCohortVisible }));

  private toggleDashboardSettings = (): void =>
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
}
