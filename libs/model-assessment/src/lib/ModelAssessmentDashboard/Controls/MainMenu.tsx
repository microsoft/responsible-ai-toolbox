// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CommandBar,
  CommandButton,
  ICommandBar,
  ICommandBarItemProps,
  Text,
  IIconProps,
  Stack,
  TooltipHost
} from "@fluentui/react";
import {
  DatasetTaskType,
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ITelemetryEvent,
  ModelAssessmentContext,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ChangeGlobalCohort } from "../Cohort/ChangeGlobalCohort";
import { CohortSettingsPanel } from "../Cohort/CohortSettingsPanel";
import { CreateGlobalCohort } from "../Cohort/CreateGlobalCohort";
import { IModelAssessmentDashboardTab } from "../ModelAssessmentDashboardState";

import { DashboardSettings } from "./DashboardSettings";
import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  telemetryHook?: (message: ITelemetryEvent) => void;
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
        ariaLabel: "cohortSettings",
        iconOnly: true,
        iconProps: settingsIcon,
        id: "cohortSettings",
        key: "cohortSettings",
        onClick: this.toggleCohortSettingsPanel,
        text: localization.ModelAssessment.MainMenu.cohortSettings
      },
      {
        ariaLabel: "dashboardSettings",
        iconOnly: true,
        iconProps: navigationIcon,
        id: "dashboardSettings",
        key: "dashboardSettings",
        onClick: this.toggleDashboardSettings,
        text: localization.ModelAssessment.MainMenu.DashboardSettings
      }
    ];
  }

  public componentDidUpdate(): void {
    this.commandBar.current?.remeasure();
  }

  public render(): React.ReactNode {
    const classNames = mainMenuStyles();
    let allowCohortEditing = true;
    let showAllDataCohort = true;
    let menuItems: ICommandBarItemProps[] = [
      {
        className: classNames.mainMenuItem,
        key: "cohortName",
        onRender: this.getCohortName
      },
      {
        iconProps: {
          iconName: "Switch"
        },
        key: "changeCohort",
        onClick: this.toggleChangeCohortVisibility,
        text: localization.ModelAssessment.CohortInformation.ShiftCohort
      },
      {
        iconProps: {
          iconName: "Add"
        },
        key: "addCohort",
        onClick: this.toggleCreateCohortVisibility,
        text: localization.ModelAssessment.CohortInformation.NewCohort
      }
    ];

    if (this.context.dataset.task_type === DatasetTaskType.Forecasting) {
      // Creating and switching cohorts is handled differently for forecasting
      // since we need to work with time series as cohorts only.
      menuItems = [];
      allowCohortEditing = false;
      showAllDataCohort = false;
    }

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
          allowCohortEditing={allowCohortEditing}
          showAllDataCohort={showAllDataCohort}
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
          showAllDataCohort={showAllDataCohort}
        />
        <CreateGlobalCohort
          visible={this.state.createCohortVisible}
          onDismiss={this.toggleCreateCohortVisibility}
        />
      </>
    );
  }

  private getCohortStats = (): JSX.Element => {
    const currentCohort = this.context.baseErrorCohort;
    const dataPointsCountString = `${
      localization.ModelAssessment.CohortInformation.DataPoints
    } = ${currentCohort.cohortStats.totalCohort.toString()}`;
    const filtersCountString = `${
      localization.ModelAssessment.CohortInformation.Filters
    } = ${currentCohort.cohort.filters.length.toString()}`;
    return (
      <Stack>
        <Text>{dataPointsCountString}</Text>
        <Text>{filtersCountString}</Text>
      </Stack>
    );
  };

  private getCohortName = (): React.ReactNode => {
    const classNames = mainMenuStyles();
    const currentCohort = this.context.baseErrorCohort;
    const cohortName = currentCohort.cohort.name;
    // add (default) if it's the default cohort
    let cohortInfoTitle =
      localization.ModelAssessment.CohortInformation.GlobalCohort + cohortName;
    if (currentCohort.isAllDataCohort) {
      cohortInfoTitle +=
        localization.ModelAssessment.CohortInformation.DefaultCohort;
    }

    return (
      <TooltipHost content={this.getCohortStats()}>
        <CommandButton
          className={classNames.mainMenuItem}
          // cursor should not change when hovering because we don't want users to think that something will happen if they click
          styles={{ rootHovered: { cursor: "default" } }}
        >
          <h2>{cohortInfoTitle}</h2>
        </CommandButton>
      </TooltipHost>
    );
  };

  private toggleCohortSettingsPanel = (): void => {
    if (!this.state.cohortSettingsPanelVisible) {
      this.logButtonClick(TelemetryEventName.MainMenuCohortSettingsClick);
    }
    this.setState((prev) => ({
      cohortSettingsPanelVisible: !prev.cohortSettingsPanelVisible
    }));
  };

  private toggleDashboardSettings = (): void => {
    if (!this.state.dashboardSettingsVisible) {
      this.logButtonClick(
        TelemetryEventName.MainMenuDashboardConfigurationClick
      );
    }
    this.setState((prev) => ({
      dashboardSettingsVisible: !prev.dashboardSettingsVisible
    }));
  };

  private toggleChangeCohortVisibility = (): void => {
    if (!this.state.changeCohortVisible) {
      this.logButtonClick(TelemetryEventName.MainMenuSwitchCohortClick);
    }
    this.setState((prev) => ({
      changeCohortVisible: !prev.changeCohortVisible
    }));
  };
  private toggleCreateCohortVisibility = (): void => {
    if (!this.state.createCohortVisible) {
      this.logButtonClick(TelemetryEventName.MainMenuNewCohortClick);
    }
    this.setState((prev) => ({
      createCohortVisible: !prev.createCohortVisible
    }));
  };
  private logButtonClick = (eventName: TelemetryEventName): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };
}
