// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  CommandBar,
  Dropdown,
  ICommandBarItemProps,
  IDropdownStyles,
  IDropdownOption,
  IIconProps,
  ILabelStyles,
  Label,
  IButtonStyles
} from "office-ui-fabric-react";
import React from "react";

import {
  ErrorAnalysisOptions,
  GlobalTabKeys,
  PredictionTabKeys
} from "../../ModelAssessmentDashboard";
import { ErrorCohort } from "@responsible-ai/error-analysis";

import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  onInfoPanelClick: () => void;
  onCohortListPanelClick: () => void;
  onFeatureListClick: () => void;
  onSaveCohortClick: () => void;
  onShiftCohortClick: () => void;
  onWhatIfClick: () => void;
  localUrl: string;
  setErrorDetector: (key: ErrorAnalysisOptions) => void;
  temporaryCohort: ErrorCohort;
  activeGlobalTab: GlobalTabKeys;
  activePredictionTab: PredictionTabKeys;
  errorAnalysisOption: ErrorAnalysisOptions;
}

const settingsIcon: IIconProps = { iconName: "Settings" };
const infoIcon: IIconProps = { iconName: "Info" };
const featureListIcon: IIconProps = { iconName: "BulletedListMirrored" };
const fullscreenIcon: IIconProps = { iconName: "ScaleVolume" };
const whatIfIcon: IIconProps = { iconName: "ExploreData" };

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: {
    width: 100
  },
  root: {
    alignSelf: "center"
  },
  title: {
    borderLeft: "0px solid black",
    borderRight: "0px solid black",
    borderTop: "0px solid black"
  }
};
const buttonStyle: IButtonStyles = {
  root: { padding: "0px 4px" }
};
const labelStyle: ILabelStyles = {
  root: { alignSelf: "center", padding: "0px 10px 0px 0px" }
};

export class MainMenu extends React.PureComponent<IMainMenuProps> {
  public render(): React.ReactNode {
    const errorAnalysisOptionsDropdown: IDropdownOption[] = [
      {
        key: ErrorAnalysisOptions.TreeMap,
        text: localization.ErrorAnalysis.MainMenu.treeMap
      },
      {
        key: ErrorAnalysisOptions.HeatMap,
        text: localization.ErrorAnalysis.MainMenu.heatMap
      }
    ];

    let items: ICommandBarItemProps[] = [];
    if (this.props.activeGlobalTab === GlobalTabKeys.ErrorAnalysisTab) {
      items = [
        {
          commandBarButtonAs: (): any => (
            <Label styles={labelStyle}>
              {localization.ErrorAnalysis.MainMenu.errorDetectorLabel}
            </Label>
          ),
          key: "errorDetectorLabel",
          text: "Error Detector Label"
        },
        {
          commandBarButtonAs: (): any => (
            <Dropdown
              selectedKey={this.props.errorAnalysisOption}
              options={errorAnalysisOptionsDropdown}
              styles={dropdownStyles}
              onChange={this.handleErrorDetectorChanged}
            />
          ),
          key: "errorDetector",
          text: localization.ErrorAnalysis.MainMenu.errorDetector
        }
      ];
    } else {
      items = [
        {
          commandBarButtonAs: (): any => (
            <Label styles={labelStyle}>
              Explanation: {this.props.temporaryCohort.cohort.name}
            </Label>
          ),
          key: "explanationLabel",
          text: `Explanation: ${this.props.temporaryCohort.cohort.name}`
        }
      ];
    }

    const farItems: ICommandBarItemProps[] = [
      {
        buttonStyles: buttonStyle,
        iconProps: fullscreenIcon,
        key: "fullscreen",
        onClick: (): any => window.open(this.props.localUrl),
        text: localization.ErrorAnalysis.MainMenu.fullscreen
      }
    ];
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
    if (
      this.props.activeGlobalTab === GlobalTabKeys.ErrorAnalysisTab &&
      this.props.errorAnalysisOption === ErrorAnalysisOptions.TreeMap
    ) {
      farItems.push({
        buttonStyles: buttonStyle,
        iconProps: featureListIcon,
        key: "featureList",
        onClick: () => this.props.onFeatureListClick(),
        text: localization.ErrorAnalysis.MainMenu.featureList
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
            items={items}
            farItems={farItems}
            ariaLabel="Use left and right arrow keys to navigate between commands"
          />
        </div>
      </div>
    );
  }

  private handleErrorDetectorChanged = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      if (item.key === ErrorAnalysisOptions.HeatMap) {
        // Note comparison above is actually string comparison (key is string), we have to set the enum
        const selectedOptionHeatMap = ErrorAnalysisOptions.HeatMap;
        this.props.setErrorDetector(selectedOptionHeatMap);
      } else {
        // Note comparison above is actually string comparison (key is string), we have to set the enum
        const selectedOptionTreeMap = ErrorAnalysisOptions.TreeMap;
        this.props.setErrorDetector(selectedOptionTreeMap);
      }
    }
  };
}
