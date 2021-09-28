// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  CommandBar,
  ICommandBar,
  ICommandBarItemProps,
  IContextualMenuItem,
  IIconProps
} from "office-ui-fabric-react";
import React from "react";

import { ChangeGlobalCohort } from "../Cohort/ChangeGlobalCohort";
import { CohortSettingsPanel } from "../Cohort/CohortSettingsPanel";
import { CreateGlobalCohort } from "../Cohort/CreateGlobalCohort";
import { IModelAssessmentDashboardTab } from "../ModelAssessmentDashboardState";

import { DashboardSettings } from "./DashboardSettings";
import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  removeTab(index: number): void;
}
interface IMainMenuState {
  cohortSettingsPanelVisible: boolean;
  dashboardSettingsVisible: boolean;
  changeCohortVisible: boolean;
  createCohortVisible: boolean;
  selectedCohort?: ErrorCohort;
}

const settingsIcon: IIconProps = { iconName: "Settings" };
const navigationIcon: IIconProps = { iconName: "ViewList" };

export class MainMenu extends React.PureComponent<
  IMainMenuProps,
  IMainMenuState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  private menuFarItems: ICommandBarItemProps[];

  private commandBar = React.createRef<ICommandBar>();
  public constructor(props: IMainMenuProps) {
    super(props);
    this.state = {
      changeCohortVisible: false,
      cohortSettingsPanelVisible: false,
      createCohortVisible: false,
      dashboardSettingsVisible: false
    };
    this.menuFarItems = [
      {
        iconProps: settingsIcon,
        key: "cohortSettings",
        onClick: this.toggleCohortSettingsPanel,
        text: localization.ModelAssessment.MainMenu.cohortSettings
      },
      {
        iconProps: navigationIcon,
        key: "dashboardSettings",
        onClick: this.toggleDashboardSettings,
        text: localization.ModelAssessment.MainMenu.DashboardSettings
      }
    ];
  }

  public componentDidUpdate() {
    this.commandBar.current?.remeasure();
  }

  public render(): React.ReactNode {
    const classNames = mainMenuStyles();
    const menuItems: ICommandBarItemProps[] = [
      {
        className: classNames.mainMenuItem,
        key: "cohortName",
        subMenuProps: {
          items: this.getCohortStats()
        },
        text: this.getCohortName()
      },
      {
        iconProps: {
          iconName: "Switch"
        },
        key: "changeCohort",
        text: localization.ModelAssessment.CohortInformation.SwitchGlobalCohort
      },
      {
        iconProps: {
          iconName: "Add"
        },
        key: "addCohort",
        text: localization.ModelAssessment.CohortInformation.CreateNewCohort
      }
    ];
    return (
      <>
        <div className={classNames.banner}>
          <div className={classNames.mainMenu}>
            <CommandBar
              componentRef={this.commandBar}
              items={menuItems}
              farItems={this.menuFarItems}
            />
          </div>
        </div>
        <CohortSettingsPanel
          isOpen={this.state?.cohortSettingsPanelVisible}
          onDismiss={this.toggleCohortSettingsPanel}
        />
        <DashboardSettings
          isOpen={this.state.dashboardSettingsVisible}
          onDismiss={this.toggleDashboardSettings}
          activeGlobalTabs={this.props.activeGlobalTabs}
          removeTab={this.props.removeTab}
        />
        <ChangeGlobalCohort
          visible={this.state.changeCohortVisible}
          onDismiss={this.toggleChangeCohortVisibility}
        />
        <CreateGlobalCohort
          visible={this.state.createCohortVisible}
          onDismiss={this.toggleCreateCohortVisibility}
        />
      </>
    );
  }

  private getCohortStats = (): IContextualMenuItem[] => {
    const currentCohort = this.context.baseErrorCohort;
    const dataPointsCountString = `${
      localization.ModelAssessment.CohortInformation.DataPoints
    } = ${currentCohort.cohortStats.totalCohort.toString()}`;
    const filtersCountString = `${
      localization.ModelAssessment.CohortInformation.Filters
    } = ${currentCohort.cohort.filters.length.toString()}`;
    return [
      {
        key: "dataPoints",
        text: dataPointsCountString
      },
      { key: "filters", text: filtersCountString }
    ];
  };

  private getCohortName = (): string => {
    const currentCohort = this.context.baseErrorCohort;
    const cohortName = currentCohort.cohort.name;
    // add (default) if it's the default cohort
    let cohortInfoTitle =
      localization.ModelAssessment.CohortInformation.GlobalCohort + cohortName;
    if (
      currentCohort.cohort.filters.length === 0 &&
      currentCohort.cohort.name === localization.Interpret.Cohort.defaultLabel
    ) {
      cohortInfoTitle +=
        localization.ModelAssessment.CohortInformation.DefaultCohort;
    }
    return cohortInfoTitle;
  };

  private toggleCohortSettingsPanel = (): void =>
    this.setState((prev) => ({
      cohortSettingsPanelVisible: !prev.cohortSettingsPanelVisible
    }));

  private toggleDashboardSettings = (): void =>
    this.setState((prev) => ({
      dashboardSettingsVisible: !prev.dashboardSettingsVisible
    }));
  private toggleChangeCohortVisibility = () => {
    this.setState((prev) => ({
      changeCohortVisible: !prev.changeCohortVisible
    }));
  };
  private toggleCreateCohortVisibility = () => {
    this.setState((prev) => ({
      createCohortVisible: !prev.createCohortVisible
    }));
  };
}
