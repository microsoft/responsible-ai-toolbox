// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";
import {
  CommandBar,
  ICommandBarItemProps,
  IIconProps,
  IButtonStyles
} from "office-ui-fabric-react";
import React from "react";

import { GlobalTabKeys, PredictionTabKeys } from "../ModelAssessmentEnums";

import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  onInfoPanelClick: () => void;
  onCohortListPanelClick: () => void;
  onSaveCohortClick: () => void;
  onShiftCohortClick: () => void;
  onWhatIfClick: () => void;
  localUrl: string;
  temporaryCohort: ErrorCohort;
  activeGlobalTab: GlobalTabKeys;
  activePredictionTab: PredictionTabKeys;
  errorAnalysisOption: ErrorAnalysisOptions;
}

const settingsIcon: IIconProps = { iconName: "Settings" };
const infoIcon: IIconProps = { iconName: "Info" };
const whatIfIcon: IIconProps = { iconName: "ExploreData" };

const buttonStyle: IButtonStyles = {
  root: { padding: "0px 4px" }
};

export class MainMenu extends React.PureComponent<IMainMenuProps> {
  public render(): React.ReactNode {
    const farItems: ICommandBarItemProps[] = [];
    if (
      this.props.activeGlobalTab === GlobalTabKeys.LocalExplanationTab &&
      this.props.activePredictionTab !== PredictionTabKeys.InspectionTab
    ) {
      farItems.push({
        buttonStyles: buttonStyle,
        iconProps: whatIfIcon,
        key: "whatIf",
        onClick: () => this.props.onWhatIfClick(),
        text: localization.ErrorAnalysis.MainMenu.whatIf
      });
    }
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
              onClick: (): any => this.props.onShiftCohortClick(),
              text: localization.ErrorAnalysis.MainMenu.shiftCohort
            },
            {
              iconProps: { iconName: "Save" },
              key: "saveCohort",
              onClick: (): any => this.props.onSaveCohortClick(),
              text: localization.ErrorAnalysis.MainMenu.saveCohort
            },
            {
              iconProps: { iconName: "PageList" },
              key: "cohortList",
              onClick: (): any => this.props.onCohortListPanelClick(),
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
        onClick: (): any => this.props.onInfoPanelClick(),
        text: localization.ErrorAnalysis.MainMenu.cohortInfo
      }
    ];
    farItems.push(...helpItems);
    const classNames = mainMenuStyles();
    return (
      <div className={classNames.banner}>
        <div className={classNames.mainMenu}>
          <CommandBar
            items={[]}
            farItems={farItems}
            ariaLabel="Use left and right arrow keys to navigate between commands"
          />
        </div>
      </div>
    );
  }
}
