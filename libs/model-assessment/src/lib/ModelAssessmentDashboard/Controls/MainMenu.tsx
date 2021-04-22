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
import {
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  createInitialTreeViewState,
  ErrorAnalysisOptions,
  MapShift
} from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";
import {
  CommandBar,
  ICommandBarItemProps,
  IIconProps,
  IButtonStyles
} from "office-ui-fabric-react";
import React from "react";

import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  localUrl: string;
  temporaryCohort: ErrorCohort;
  errorAnalysisOption: ErrorAnalysisOptions;
}
interface IMainMenuState {
  infoPanelVisible: boolean;
  cohortListPanelVisible: boolean;
  editCohortVisible: boolean;
  mapShiftVisible: boolean;
  saveCohortVisible: boolean;
  shiftCohortVisible: boolean;
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
  public render(): React.ReactNode {
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
              onClick: this.openShiftCohort,
              text: localization.ErrorAnalysis.MainMenu.shiftCohort
            },
            {
              iconProps: { iconName: "Save" },
              key: "saveCohort",
              onClick: this.openSaveCohort,
              text: localization.ErrorAnalysis.MainMenu.saveCohort
            },
            {
              iconProps: { iconName: "PageList" },
              key: "cohortList",
              onClick: this.openCohortListPanel,
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
        onClick: this.openInfoPanel,
        text: localization.ErrorAnalysis.MainMenu.cohortInfo
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
          currentCohort={this.props.temporaryCohort}
          onDismiss={this.closeInfoPanel}
          onSaveCohortClick={this.openSaveCohort}
        />
        <CohortList
          cohorts={this.context.errorCohorts}
          isOpen={this.state?.cohortListPanelVisible}
          onDismiss={this.closeCohortListPanel}
          onEditCohortClick={this.openEditCohort}
        />
        <SaveCohort
          isOpen={this.state.saveCohortVisible}
          onDismiss={this.closeSaveCohort}
          onSave={(savedCohort: ErrorCohort): void => {
            let newCohorts = [savedCohort, ...this.context.errorCohorts];
            newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
            this.setState({
              cohorts: newCohorts,
              selectedCohort: savedCohort
            });
          }}
          temporaryCohort={this.props.temporaryCohort}
          baseCohort={this.state.baseCohort}
        />
        <MapShift
          isOpen={this.state.mapShiftVisible}
          onDismiss={this.closeMapShift}
          onSave={(): void => {
            this.setState({
              openMapShift: false,
              openSaveCohort: true
            });
          }}
          onShift={(): void => {
            this.setState({
              errorAnalysisOption: this.state.mapShiftErrorAnalysisOption,
              matrixAreaState: createInitialMatrixAreaState(),
              matrixFilterState: createInitialMatrixFilterState(),
              openMapShift: false,
              selectedCohort: this.state.baseCohort,
              treeViewState: createInitialTreeViewState()
            });
          }}
        />
        <EditCohort
          isOpen={this.state.editCohortVisible}
          onDismiss={this.closeEditCohort}
          onSave={(
            originalCohort: ErrorCohort,
            editedCohort: ErrorCohort
          ): void => {
            const cohorts = this.context.errorCohorts.filter(
              (errorCohort) =>
                errorCohort.cohort.name !== originalCohort.cohort.name
            );
            let selectedCohort = this.props.temporaryCohort;
            if (originalCohort.cohort.name === selectedCohort.cohort.name) {
              selectedCohort = editedCohort;
            }
            this.setState({
              cohorts: [editedCohort, ...cohorts],
              selectedCohort
            });
          }}
          onDelete={(deletedCohort: ErrorCohort): void => {
            const cohorts = this.context.errorCohorts.filter(
              (errorCohort) =>
                errorCohort.cohort.name !== deletedCohort.cohort.name
            );
            this.setState({
              cohorts
            });
          }}
          errorCohort={this.state.editedCohort}
          selectedCohort={this.props.temporaryCohort}
        />
        <ShiftCohort
          isOpen={this.state.shiftCohortVisible}
          onDismiss={this.closeShiftCohort}
          onApply={(selectedCohort: ErrorCohort): void => {
            let cohorts = this.context.errorCohorts;
            cohorts = cohorts.filter(
              (cohort) => cohort.cohort.name !== selectedCohort.cohort.name
            );
            this.setState({
              baseCohort: selectedCohort,
              cohorts: [selectedCohort, ...cohorts],
              selectedCohort
            });
          }}
        />
      </>
    );
  }

  private openInfoPanel = () => this.setState({ infoPanelVisible: true });
  private closeInfoPanel = () => this.setState({ infoPanelVisible: true });
  private openCohortListPanel = () =>
    this.setState({ cohortListPanelVisible: true });
  private closeCohortListPanel = () =>
    this.setState({ cohortListPanelVisible: true });

  private openEditCohort = (editedCohort: ErrorCohort) =>
    this.setState({ editCohortVisible: true, editedCohort });
  private closeEditCohort = () => this.setState({ editCohortVisible: true });

  private openMapShift = () => this.setState({ mapShiftVisible: true });
  private closeMapShift = () => this.setState({ mapShiftVisible: true });

  private openSaveCohort = () => this.setState({ saveCohortVisible: true });
  private closeSaveCohort = () => this.setState({ saveCohortVisible: true });

  private openShiftCohort = () => this.setState({ shiftCohortVisible: true });
  private closeShiftCohort = () => this.setState({ shiftCohortVisible: true });
}
