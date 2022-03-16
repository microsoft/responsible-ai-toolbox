// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CohortInfo,
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  CommandBarButton,
  IIconProps,
  Text,
  Pivot,
  PivotItem,
  Stack,
  Separator
} from "office-ui-fabric-react";
import React from "react";

import { ErrorAnalysisOptions } from "../../ErrorAnalysisEnums";
import { FeatureList } from "../FeatureList/FeatureList";

import { errorAnalysisStyles } from "./ErrorAnalysis.styles";
import {
  ErrorAnalysisView,
  IErrorAnalysisViewProps
} from "./ErrorAnalysisView";

/* ErrorAnalysisViewTab wraps ErrorAnalysisView to provide its functionality
 * together with the map selector and feature list control. This way all
 * error analysis specific components can be plugged into a larger dashboard.
 */

export interface IErrorAnalysisViewTabProps extends IErrorAnalysisViewProps {
  handleErrorDetectorChanged: (
    item?: PivotItem,
    ev?: React.MouseEvent<HTMLElement>
  ) => void;
  selectFeatures: (features: string[]) => void;
  importances: number[];
  onSaveCohortClick: () => void;
  selectedKey: ErrorAnalysisOptions;
}

interface IErrorAnalysisViewTabState {
  openFeatureList: boolean;
}

export class ErrorAnalysisViewTab extends React.Component<
  IErrorAnalysisViewTabProps,
  IErrorAnalysisViewTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IErrorAnalysisViewTabProps) {
    super(props);
    this.state = {
      openFeatureList: false
    };
  }

  public render(): React.ReactNode {
    const classNames = errorAnalysisStyles();
    const featureListIcon: IIconProps = { iconName: "BulletedListMirrored" };
    return (
      <Stack horizontal>
        <Stack
          grow
          tokens={{ padding: "l1" }}
          className={classNames.errorAnalysis}
        >
          <Text variant={"xxLarge"} id="errorAnalysisHeader">
            {localization.ErrorAnalysis.MainMenu.errorAnalysisLabel}
          </Text>
          <Stack horizontal>
            <Stack.Item>
              <Pivot
                onLinkClick={this.handleTabClick}
                selectedKey={this.props.selectedKey}
              >
                <PivotItem
                  itemKey={ErrorAnalysisOptions.TreeMap}
                  headerText={localization.ErrorAnalysis.MainMenu.treeMap}
                />
                <PivotItem
                  itemKey={ErrorAnalysisOptions.HeatMap}
                  headerText={localization.ErrorAnalysis.MainMenu.heatMap}
                />
              </Pivot>
            </Stack.Item>
            <Stack.Item>
              {this.props.errorAnalysisOption ===
                ErrorAnalysisOptions.TreeMap && (
                <CommandBarButton
                  className={classNames.featureList}
                  iconProps={featureListIcon}
                  key={"featureList"}
                  onClick={this.handleFeatureListClick}
                  text={localization.ErrorAnalysis.MainMenu.featureList}
                />
              )}
            </Stack.Item>
          </Stack>
          <ErrorAnalysisView
            tree={this.props.tree}
            messages={this.props.messages}
            disabledView={this.props.disabledView}
            features={this.props.features}
            selectedFeatures={this.props.selectedFeatures}
            getTreeNodes={this.props.getTreeNodes}
            getMatrix={this.props.getMatrix}
            matrix={this.props.matrix}
            matrixFeatures={this.props.matrixFeatures}
            errorAnalysisOption={this.props.errorAnalysisOption}
            updateSelectedCohort={this.props.updateSelectedCohort}
            selectedCohort={this.props.selectedCohort}
            baseCohort={this.props.baseCohort}
            showCohortName={this.props.showCohortName}
          />
          <FeatureList
            isOpen={this.state.openFeatureList}
            onDismiss={(): void => this.setState({ openFeatureList: false })}
            saveFeatures={this.saveFeatures}
            features={this.props.features}
            importances={this.props.importances}
            isEnabled={this.props.getTreeNodes !== undefined}
            selectedFeatures={this.props.features}
          />
        </Stack>
        <Stack tokens={{ padding: "l1" }}>
          <Separator vertical styles={{ root: { height: "100%" } }} />
        </Stack>
        <Stack className={classNames.cohortInfo} tokens={{ padding: "l1" }}>
          <CohortInfo
            currentCohort={this.context.selectedErrorCohort}
            onSaveCohortClick={this.props.onSaveCohortClick}
            includeDividers={false}
            disabledView={this.props.disabledView}
          />
        </Stack>
      </Stack>
    );
  }

  private saveFeatures = (features: string[]) => {
    this.props.selectFeatures(features);
    this.setState({ openFeatureList: false });
  };

  private readonly handleTabClick = (item?: PivotItem): void => {
    if (item?.props.itemKey === ErrorAnalysisOptions.HeatMap) {
      this.setState({ openFeatureList: false });
    }
    this.props.handleErrorDetectorChanged(item);
  };

  private readonly handleFeatureListClick = (): void => {
    this.setState((prev) => ({ openFeatureList: !prev.openFeatureList }));
  };
}
