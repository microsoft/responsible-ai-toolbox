// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WeightVectorOption, Cohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  IPivotItemProps,
  PivotItem,
  Pivot,
  PivotLinkSize,
  MessageBar,
  MessageBarType,
  Text,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { buildInitialExplanationContext } from "./buildInitialExplanationContext";
import { InterpretContext } from "./context/InterpretContext";
import { CohortBar } from "./Controls/Cohort/CohortBar";
import { DatasetExplorerTab } from "./Controls/DatasetExplorerTab/DatasetExplorerTab";
import { GlobalExplanationTab } from "./Controls/GlobalExplanationTab/GlobalExplanationTab";
import { ModelPerformanceTab } from "./Controls/ModelPerformanceTab/ModelPerformanceTab";
import { WhatIfTab } from "./Controls/WhatIfTab/WhatIfTab";
import {
  GlobalTabKeys,
  IExplanationDashboardProps,
  INewExplanationDashboardState
} from "./Interfaces/IExplanationDashboardProps";
import { explanationDashboardStyles } from "./NewExplanationDashboard.styles";

export class NewExplanationDashboard extends React.PureComponent<
  IExplanationDashboardProps,
  INewExplanationDashboardState
> {
  private pivotItems: IPivotItemProps[] = [];
  public constructor(props: IExplanationDashboardProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    this.state = buildInitialExplanationContext(_.cloneDeep(props));
    this.validatePredictMethod();

    this.pivotItems.push({
      headerText: localization.Interpret.modelPerformance,
      itemKey: GlobalTabKeys.ModelPerformance
    });
    this.pivotItems.push({
      headerText: localization.Interpret.datasetExplorer,
      itemKey: GlobalTabKeys.DataExploration
    });
    this.pivotItems.push({
      headerText: localization.Interpret.aggregateFeatureImportance,
      itemKey: GlobalTabKeys.ExplanationTab
    });
    this.pivotItems.push({
      headerText: this.props.requestPredictions
        ? localization.Interpret.individualAndWhatIf
        : localization.Interpret.individualImportance,
      itemKey: GlobalTabKeys.WhatIfTab
    });
  }

  public componentDidUpdate(prev: IExplanationDashboardProps): void {
    if (this.props.locale && prev.locale !== this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
  }

  public render(): React.ReactNode {
    const cohortIDs = this.state.cohorts.map((cohort) =>
      cohort.getCohortID().toString()
    );
    const classNames = explanationDashboardStyles();
    return (
      <InterpretContext.Provider
        value={{
          cohorts: this.state.cohorts,
          globalImportance: this.state.globalImportance,
          globalImportanceIntercept: this.state.globalImportanceIntercept,
          jointDataset: this.state.jointDataset,
          requestLocalFeatureExplanations: this.props
            .requestLocalFeatureExplanations,
          requestPredictions: this.state.requestPredictions,
          telemetryHook:
            this.props.telemetryHook ||
            ((): void => {
              return;
            })
        }}
      >
        <div className={classNames.page}>
          {this.state.showingDataSizeWarning && (
            <MessageBar
              onDismiss={this.clearSizeWarning}
              dismissButtonAriaLabel="Close"
              messageBarType={MessageBarType.warning}
            >
              <Text>
                {localization.Interpret.ValidationErrors.datasizeWarning}
              </Text>
            </MessageBar>
          )}
          {this.state.validationWarnings.length !== 0 && (
            <MessageBar
              id="ErrorMessage"
              onDismiss={this.clearWarning}
              dismissButtonAriaLabel="Close"
              messageBarType={MessageBarType.warning}
            >
              <Text>{localization.Interpret.ValidationErrors.errorHeader}</Text>
              {this.state.validationWarnings.map((message, idx) => {
                return (
                  <Text block key={idx}>
                    {message}
                  </Text>
                );
              })}
            </MessageBar>
          )}
          {this.props.dashboardType === "ModelPerformance" ? (
            <ModelPerformanceTab
              jointDataset={this.state.jointDataset}
              metadata={this.state.modelMetadata}
              cohorts={this.state.cohorts}
            />
          ) : (
            <Stack horizontal={true}>
              <Stack.Item>
                <CohortBar
                  cohorts={this.state.cohorts}
                  onCohortsChange={this.onCohortsChange}
                  jointDataset={this.state.jointDataset}
                  modelMetadata={this.state.modelMetadata}
                />
              </Stack.Item>
              <Stack.Item grow>
                <>
                  <Pivot
                    selectedKey={this.state.activeGlobalTab}
                    onLinkClick={this.handleGlobalTabClick}
                    linkSize={PivotLinkSize.normal}
                    headersOnly={true}
                    id="DashboardPivot"
                  >
                    {this.pivotItems.map((props) => (
                      <PivotItem key={props.itemKey} {...props} />
                    ))}
                  </Pivot>
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.ModelPerformance && (
                    <ModelPerformanceTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      cohorts={this.state.cohorts}
                    />
                  )}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.DataExploration && (
                    <DatasetExplorerTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      cohorts={this.state.cohorts}
                    />
                  )}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.ExplanationTab && (
                    <GlobalExplanationTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      globalImportance={this.state.globalImportance}
                      isGlobalDerivedFromLocal={
                        this.state.isGlobalImportanceDerivedFromLocal
                      }
                      cohorts={this.state.cohorts}
                      cohortIDs={cohortIDs}
                      selectedWeightVector={this.state.selectedWeightVector}
                      weightOptions={this.state.weightVectorOptions}
                      weightLabels={this.state.weightVectorLabels}
                      onWeightChange={this.onWeightVectorChange}
                      explanationMethod={this.props.explanationMethod}
                    />
                  )}
                  {this.state.activeGlobalTab === GlobalTabKeys.WhatIfTab && (
                    <WhatIfTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      cohorts={this.state.cohorts}
                      invokeModel={this.state.requestPredictions}
                      selectedWeightVector={this.state.selectedWeightVector}
                      weightOptions={this.state.weightVectorOptions}
                      weightLabels={this.state.weightVectorLabels}
                      onWeightChange={this.onWeightVectorChange}
                    />
                  )}
                </>
              </Stack.Item>
            </Stack>
          )}
        </div>
      </InterpretContext.Provider>
    );
  }

  private async validatePredictMethod(): Promise<void> {
    if (
      this.props.requestPredictions &&
      this.props.testData !== undefined &&
      this.props.testData.length > 0
    ) {
      try {
        const abortController = new AbortController();
        const prediction = await this.props.requestPredictions(
          [this.props.testData[0]],
          abortController.signal
        );
        if (prediction !== undefined) {
          this.setState({ requestPredictions: this.props.requestPredictions });
        }
      } catch {
        return;
      }
    }
  }

  private handleGlobalTabClick = (item?: PivotItem): void => {
    if (item?.props.itemKey) {
      this.setState({ activeGlobalTab: item.props.itemKey as GlobalTabKeys });
    }
  };

  private onCohortsChange = (cohorts: Cohort[]): void => {
    this.setState({ cohorts });
  };

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.state.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.state.cohorts.forEach((cohort) => cohort.clearCachedImportances());
    this.setState({ selectedWeightVector: weightOption });
  };

  private clearWarning = (): void => {
    this.setState({ validationWarnings: [] });
  };

  private clearSizeWarning = (): void => {
    this.setState({ showingDataSizeWarning: false });
  };
}
