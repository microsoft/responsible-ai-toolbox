// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getRandomId } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Callout,
  Dropdown,
  IconButton,
  IDropdownOption,
  PrimaryButton
} from "office-ui-fabric-react";
import React from "react";

import { GlobalTabKeys } from "./ModelAssessmentEnums";
export interface IAddTabButtonProps {
  tabIndex: number;
  onAdd(index: number, tab: GlobalTabKeys): void;
}
interface IAddTabButtonState {
  isCalloutVisible: boolean;
  tabSelected: GlobalTabKeys | undefined;
}

export class AddTabButton extends React.Component<
  IAddTabButtonProps,
  IAddTabButtonState
> {
  private buttonId = getRandomId();
  private dropdownOptions: IDropdownOption[] = [
    {
      key: GlobalTabKeys.DataExplorerTab,
      text: localization.ModelAssessment.ComponentNames.DataExplorer
    },
    {
      key: GlobalTabKeys.GlobalExplanationTab,
      text: localization.ModelAssessment.ComponentNames.GlobalExplanation
    },
    {
      key: GlobalTabKeys.LocalExplanationTab,
      text: localization.ModelAssessment.ComponentNames.LocalExplanation
    },
    {
      key: GlobalTabKeys.ModelStatisticsTab,
      text: localization.ModelAssessment.ComponentNames.ModelStatistics
    },
    {
      key: GlobalTabKeys.CounterfactualsTab,
      text: localization.ModelAssessment.ComponentNames.Counterfactuals
    },
    {
      key: GlobalTabKeys.CausalAnalysisTab,
      text: localization.ModelAssessment.ComponentNames.CausalAnalysis
    }
  ];
  public constructor(props: IAddTabButtonProps) {
    super(props);
    this.state = {
      isCalloutVisible: false,
      tabSelected: undefined
    };
  }
  public render(): React.ReactNode {
    return (
      <>
        <IconButton
          id={this.buttonId}
          iconProps={{ iconName: "CircleAdditionSolid" }}
          onClick={this.toggleIsCalloutVisible}
        />
        {this.state.isCalloutVisible && (
          <Callout
            target={`#${this.buttonId}`}
            onDismiss={this.toggleIsCalloutVisible}
            role="status"
            aria-live="assertive"
          >
            {localization.ModelAssessment.AddingTab.CalloutContent}
            <Dropdown options={this.dropdownOptions} onChange={this.onChange} />
            <PrimaryButton
              onClick={this.addTab}
              text={localization.ModelAssessment.AddingTab.AddButtonText}
            />
          </Callout>
        )}
      </>
    );
  }

  private onChange = (
    _: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined
  ) => {
    if (!option) return;
    this.setState({ tabSelected: option.key as GlobalTabKeys });
  };

  private addTab = () => {
    if (!this.state.tabSelected) return;
    this.props.onAdd(this.props.tabIndex, this.state.tabSelected);
    this.setState({
      isCalloutVisible: false
    });
  };
  private toggleIsCalloutVisible = () => {
    this.setState((prev) => ({
      isCalloutVisible: !prev.isCalloutVisible,
      tabSelected: undefined
    }));
  };
}
