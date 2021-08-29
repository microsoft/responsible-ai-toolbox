// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  CommandBar,
  ICommandBarItemProps,
  IIconProps,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { ChangeGlobalCohortButton } from "../Cohort/ChangeGlobalCohortButton";
import { CohortSettingsPanel } from "../Cohort/CohortSettingsPanel";
import { CreateGlobalCohortButton } from "../Cohort/CreateGlobalCohortButton";
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
  private menuItems: ICommandBarItemProps[];
  public constructor(props: IMainMenuProps) {
    super(props);
    this.state = {
      cohortSettingsPanelVisible: false,
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
    this.menuItems = [
      {
        key: "cohort",
        onRender: this.renderCohort,
        text: ""
      }
    ];
  }

  public render(): React.ReactNode {
    const classNames = mainMenuStyles();
    return (
      <>
        <div className={classNames.banner}>
          <div className={classNames.mainMenu}>
            <CommandBar items={this.menuItems} farItems={this.menuFarItems} />
          </div>
        </div>
        <CohortSettingsPanel
          errorCohorts={this.context.errorCohorts}
          isOpen={this.state?.cohortSettingsPanelVisible}
          onDismiss={this.toggleCohortSettingsPanel}
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

  private renderCohort = (): React.ReactNode => {
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
    const dataPointsCountString = `${
      localization.ModelAssessment.CohortInformation.DataPoints
    } = ${currentCohort.cohortStats.totalCohort.toString()}`;
    const filtersCountString = `${
      localization.ModelAssessment.CohortInformation.Filters
    } = ${currentCohort.cohort.filters.length.toString()}`;
    return (
      <Stack horizontal tokens={{ childrenGap: "l1" }}>
        <Text variant={"xLarge"}>{cohortInfoTitle}</Text>
        <Stack>
          <Text>{dataPointsCountString}</Text>
          <Text>{filtersCountString}</Text>
        </Stack>
        <ChangeGlobalCohortButton />
        <CreateGlobalCohortButton />
      </Stack>
    );
  };

  private toggleCohortSettingsPanel = (): void =>
    this.setState((prev) => ({
      cohortSettingsPanelVisible: !prev.cohortSettingsPanelVisible
    }));

  private toggleDashboardSettings = (): void =>
    this.setState((prev) => ({
      dashboardSettingsVisible: !prev.dashboardSettingsVisible
    }));
}
