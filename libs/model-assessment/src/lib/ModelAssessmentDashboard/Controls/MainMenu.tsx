// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CohortSettingsPanel,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
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
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  removeTab(index: number): void;
}
interface IMainMenuState {
  cohortSettingsPanelVisible: boolean;
  dashboardSettingsVisible: boolean;
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

  public constructor(props: IMainMenuProps) {
    super(props);
    this.state = {
      cohortSettingsPanelVisible: false,
      dashboardSettingsVisible: false
    };
  }

  public render(): React.ReactNode {
    const farItems: ICommandBarItemProps[] = [];
    const helpItems: ICommandBarItemProps[] = [
      {
        buttonStyles: buttonStyle,
        iconProps: settingsIcon,
        key: "cohortSettings",
        onClick: this.toggleCohortSettingsPanel,
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

  private toggleCohortSettingsPanel = () =>
    this.setState((prev) => ({
      cohortSettingsPanelVisible: !prev.cohortSettingsPanelVisible
    }));

  private toggleDashboardSettings = () =>
    this.setState((prev) => ({
      dashboardSettingsVisible: !prev.dashboardSettingsVisible
    }));
}
