// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CommandBar,
  Dropdown,
  ICommandBarItemProps,
  IContextualMenuItem,
  IDropdownStyles,
  IDropdownOption,
  IIconProps,
  ILabelStyles,
  Label,
  PrimaryButton,
  IButtonStyles
} from "@fluentui/react";
import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  ViewTypeKeys,
  ErrorAnalysisOptions,
  GlobalTabKeys,
  PredictionTabKeys
} from "../../ErrorAnalysisEnums";

import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  viewExplanation: () => void;
  viewType: ViewTypeKeys;
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
  isEnabled: boolean;
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
  root: { alignSelf: "center", fontSize: "24px", padding: "0px 10px 0px 0px" }
};
const explanationButtonStyle: IButtonStyles = {
  root: { alignSelf: "center", padding: "0px 4px" }
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
    if (this.props.viewType === ViewTypeKeys.ErrorAnalysisView) {
      items = [
        {
          commandBarButtonAs: (): any => (
            <Label styles={labelStyle}>
              {localization.ErrorAnalysis.MainMenu.errorExplorerLabel}
            </Label>
          ),
          key: "errorExplorerLabel",
          text: "Error explorer label"
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
          key: "errorExplorer",
          text: localization.ErrorAnalysis.MainMenu.errorExplorer
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
      this.props.viewType === ViewTypeKeys.ExplanationView &&
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
      this.props.viewType === ViewTypeKeys.ErrorAnalysisView &&
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
    const subMenuPropItems: IContextualMenuItem[] = [];
    if (this.props.isEnabled) {
      subMenuPropItems.push({
        iconProps: { iconName: "Import" },
        key: "shiftCohort",
        onClick: (): any => this.props.onShiftCohortClick(),
        text: localization.ErrorAnalysis.MainMenu.shiftCohort
      });
    }
    subMenuPropItems.push({
      iconProps: { iconName: "Save" },
      key: "saveCohort",
      onClick: (): any => this.props.onSaveCohortClick(),
      text: localization.ErrorAnalysis.MainMenu.newCohort
    });
    subMenuPropItems.push({
      iconProps: { iconName: "PageList" },
      key: "cohortList",
      onClick: (): any => this.props.onCohortListPanelClick(),
      text: localization.ErrorAnalysis.MainMenu.cohortList
    });

    const helpItems: ICommandBarItemProps[] = [
      {
        buttonStyles: buttonStyle,
        iconProps: settingsIcon,
        key: "cohortSettings",
        subMenuProps: {
          items: subMenuPropItems
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
    if (this.props.viewType === ViewTypeKeys.ErrorAnalysisView) {
      farItems.push({
        buttonStyles: buttonStyle,
        commandBarButtonAs: () => (
          <PrimaryButton
            text="Explanation"
            styles={explanationButtonStyle}
            onClick={this.handleExplanationButtonClicked}
            allowDisabledFocus
            disabled={false}
            checked={false}
          />
        ),
        key: "explanation",
        text: localization.ErrorAnalysis.MainMenu.explanation
      });
    }
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

  private handleExplanationButtonClicked = (): void => {
    this.props.viewExplanation();
  };

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
