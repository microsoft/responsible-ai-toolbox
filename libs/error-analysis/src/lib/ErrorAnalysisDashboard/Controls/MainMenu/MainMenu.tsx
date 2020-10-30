// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CommandBar,
  Dropdown,
  ICommandBarItemProps,
  IDropdownStyles,
  IDropdownOption,
  IIconProps,
  ILabelStyles,
  Label,
  PrimaryButton,
  IButtonStyles
} from "office-ui-fabric-react";
import React from "react";

import {
  ViewTypeKeys,
  ErrorAnalysisOptions
} from "../../ErrorAnalysisDashboard";

import { mainMenuStyles } from "./MainMenu.styles";

export interface IMainMenuProps {
  viewExplanation: () => void;
  viewType: ViewTypeKeys;
  onInfoPanelClick: () => void;
  onSettingsPanelClick: () => void;
  onFeatureListClick: () => void;
  localUrl: string;
  setErrorDetector: (key: ErrorAnalysisOptions) => void;
}

export interface IMainMenuState {
  selectedOption: ErrorAnalysisOptions;
}

const settingsIcon: IIconProps = { iconName: "Settings" };
const infoIcon: IIconProps = { iconName: "Info" };
const featureListIcon: IIconProps = { iconName: "BulletedListMirrored" };
const fullscreenIcon: IIconProps = { iconName: "ScaleVolume" };

const dropdownStyles: Partial<IDropdownStyles> = {
  title: {
    borderTop: "0px solid black",
    borderRight: "0px solid black",
    borderLeft: "0px solid black"
  },
  dropdown: {
    width: 100
  },
  root: {
    alignSelf: "center"
  }
};
const buttonStyle: IButtonStyles = {
  root: { padding: "0px 4px" }
};
const labelStyle: ILabelStyles = {
  root: { alignSelf: "center", padding: "0px 10px 0px 0px" }
};
const explanationButtonStyle: IButtonStyles = {
  root: { alignSelf: "center", padding: "0px 4px" }
};

export class MainMenu extends React.PureComponent<
  IMainMenuProps,
  IMainMenuState
> {
  public constructor(props: IMainMenuProps) {
    super(props);
    this.state = {
      selectedOption: ErrorAnalysisOptions.TreeMap
    };
  }

  public render(): React.ReactNode {
    const errorAnalysisOptionsDropdown: IDropdownOption[] = [
      { key: ErrorAnalysisOptions.TreeMap, text: "Tree Map" },
      { key: ErrorAnalysisOptions.HeatMap, text: "Heat Map" }
    ];

    let items: ICommandBarItemProps[] = [];
    if (this.props.viewType === ViewTypeKeys.ErrorAnalysisView) {
      items = [
        {
          commandBarButtonAs: (): any => (
            <Label styles={labelStyle}>Error Detector:</Label>
          ),
          key: "errorDetectorLabel",
          text: "Error Detector Label"
        },
        {
          commandBarButtonAs: (): any => (
            <Dropdown
              defaultSelectedKey={this.state.selectedOption}
              options={errorAnalysisOptionsDropdown}
              styles={dropdownStyles}
              onChange={this.handleErrorDetectorChanged}
            />
          ),
          key: "errorDetector",
          text: "Error Detector"
        }
      ];
    } else {
      items = [
        {
          commandBarButtonAs: (): any => (
            <Label styles={labelStyle}>Explanation</Label>
          ),
          key: "explanationLabel",
          text: "Explanation"
        }
      ];
    }

    const farItems: ICommandBarItemProps[] = [];
    if (
      this.props.viewType === ViewTypeKeys.ErrorAnalysisView &&
      this.state.selectedOption === ErrorAnalysisOptions.TreeMap
    ) {
      farItems.push({
        buttonStyles: buttonStyle,
        iconProps: featureListIcon,
        key: "featureList",
        onClick: () => this.props.onFeatureListClick(),
        text: "Feature List"
      });
    }
    const helpItems: ICommandBarItemProps[] = [
      {
        buttonStyles: buttonStyle,
        iconProps: settingsIcon,
        key: "cohortSettings",
        onClick: (): any => this.props.onSettingsPanelClick(),
        text: "Cohort Settings"
      },
      {
        buttonStyles: buttonStyle,
        iconProps: infoIcon,
        key: "cohortInfo",
        onClick: (): any => this.props.onInfoPanelClick(),
        text: "Cohort Info"
      },
      {
        buttonStyles: buttonStyle,
        iconProps: fullscreenIcon,
        key: "fullscreen",
        onClick: (): any => window.open(this.props.localUrl),
        text: "Fullscreen"
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
            onClick={this.handleExplanationButtonClicked.bind(this)}
            allowDisabledFocus
            disabled={false}
            checked={false}
          />
        ),
        key: "explanation",
        text: "Explanation"
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

  private handleExplanationButtonClicked(): void {
    this.props.viewExplanation();
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
        this.setState({ selectedOption: selectedOptionHeatMap });
      } else {
        // Note comparison above is actually string comparison (key is string), we have to set the enum
        const selectedOptionTreeMap = ErrorAnalysisOptions.TreeMap;
        this.props.setErrorDetector(selectedOptionTreeMap);
        this.setState({ selectedOption: selectedOptionTreeMap });
      }
    }
  };
}
