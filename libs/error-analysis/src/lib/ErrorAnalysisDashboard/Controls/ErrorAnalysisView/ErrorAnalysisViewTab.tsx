// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  CommandBarButton,
  Dropdown,
  IButtonStyles,
  IDropdownOption,
  IDropdownStyles,
  IIconProps,
  ILabelStyles,
  Label,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisEnums";
import { IStringsParam } from "../../Interfaces/IStringsParam";
import { FeatureList } from "../FeatureList/FeatureList";

import {
  ErrorAnalysisView,
  IErrorAnalysisViewProps
} from "./ErrorAnalysisView";

/* ErrorAnalysisViewTab wraps ErrorAnalysisView to provide its functionality
 * together with the map selector and feature list control. This way all
 * error analysis specific components can be plugged into a larger dashboard.
 */

const labelStyle: ILabelStyles = {
  root: { alignSelf: "center", padding: "0px 10px 0px 0px" }
};
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
const featureListIcon: IIconProps = { iconName: "BulletedListMirrored" };

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

export interface IErrorAnalysisViewTabProps extends IErrorAnalysisViewProps {
  stringParams?: IStringsParam;
  handleErrorDetectorChanged: (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ) => void;
  selectFeatures: (features: string[]) => void;
  importances: number[];
}

interface IErrorAnalysisViewTabState {
  openFeatureList: boolean;
}

export class ErrorAnalysisViewTab extends React.PureComponent<
  IErrorAnalysisViewTabProps,
  IErrorAnalysisViewTabState
> {
  constructor(props: IErrorAnalysisViewTabProps) {
    super(props);
    this.state = { openFeatureList: false };
  }

  public render(): React.ReactNode {
    return (
      <Stack grow={true}>
        <Stack
          horizontal={true}
          tokens={{ childrenGap: "10px", padding: "16px 24px" }}
        >
          <Stack horizontal={true}>
            <Label styles={labelStyle}>
              {localization.ErrorAnalysis.MainMenu.errorExplorerLabel}
            </Label>
            <Dropdown
              selectedKey={this.props.errorAnalysisOption}
              options={errorAnalysisOptionsDropdown}
              styles={dropdownStyles}
              onChange={this.props.handleErrorDetectorChanged}
            />
          </Stack>
          {this.props.errorAnalysisOption === ErrorAnalysisOptions.TreeMap && (
            <CommandBarButton
              styles={buttonStyle}
              iconProps={featureListIcon}
              key={"featureList"}
              onClick={(): void => this.setState({ openFeatureList: true })}
              text={localization.ErrorAnalysis.MainMenu.featureList}
            />
          )}
        </Stack>
        <ErrorAnalysisView {...this.props} />
        <FeatureList
          isOpen={this.state.openFeatureList}
          onDismiss={(): void => this.setState({ openFeatureList: false })}
          saveFeatures={this.saveFeatures.bind(this)}
          features={this.props.features}
          importances={this.props.importances}
        />
      </Stack>
    );
  }

  private saveFeatures(features: string[]) {
    this.props.selectFeatures(features);
    this.setState({ openFeatureList: false });
  }
}
