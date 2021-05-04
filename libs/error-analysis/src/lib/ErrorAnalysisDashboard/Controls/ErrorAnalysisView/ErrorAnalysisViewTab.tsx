// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  CommandBarButton,
  IButtonStyles,
  IIconProps,
  Text,
  Pivot,
  PivotItem,
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

const buttonStyle: IButtonStyles = {
  root: { padding: "0px 4px" }
};
const featureListIcon: IIconProps = { iconName: "BulletedListMirrored" };

export interface IErrorAnalysisViewTabProps extends IErrorAnalysisViewProps {
  stringParams?: IStringsParam;
  handleErrorDetectorChanged?: (
    item?: PivotItem,
    ev?: React.MouseEvent<HTMLElement>
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
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  constructor(props: IErrorAnalysisViewTabProps) {
    super(props);
    this.state = { openFeatureList: false };
  }

  public render(): React.ReactNode {
    return (
      <Stack grow={true} tokens={{ padding: "16px 24px" }}>
        <Text variant={"xLarge"}>
          {localization.ErrorAnalysis.MainMenu.errorAnalysisLabel}
        </Text>
        <Stack horizontal={true} tokens={{ childrenGap: "10px" }}>
          <Pivot onLinkClick={this.props.handleErrorDetectorChanged}>
            <PivotItem
              itemKey={ErrorAnalysisOptions.TreeMap}
              headerText={localization.ErrorAnalysis.MainMenu.treeMap}
            />
            <PivotItem
              itemKey={ErrorAnalysisOptions.HeatMap}
              headerText={localization.ErrorAnalysis.MainMenu.heatMap}
            />
          </Pivot>
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
          isEnabled={true}
          selectedFeatures={this.props.features}
        />
      </Stack>
    );
  }

  private saveFeatures(features: string[]) {
    this.props.selectFeatures(features);
    this.setState({ openFeatureList: false });
  }
}
