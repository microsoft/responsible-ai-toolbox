// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IPivotItemProps,
  PivotItem,
  Pivot,
  MessageBar,
  MessageBarType,
  Text,
  Stack,
  getTheme
} from "@fluentui/react";
import {
  WeightVectorOption,
  Cohort,
  ModelAssessmentContext,
  IDataset,
  IModelExplanationData,
  ErrorCohort,
  CohortBar
} from "@responsible-ai/core-ui";
import { DatasetExplorerTab } from "@responsible-ai/dataset-explorer";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import {
  buildInitialExplanationContext,
  GlobalTabKeys,
  INewExplanationDashboardState
} from "./buildInitialExplanationContext";
import { GlobalExplanationTab } from "./Controls/GlobalExplanationTab/GlobalExplanationTab";
import { ModelPerformanceTab } from "./Controls/ModelPerformanceTab/ModelPerformanceTab";
import { WhatIfTab } from "./Controls/WhatIfTab/WhatIfTab";
import { IExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
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
      <ModelAssessmentContext.Provider
        value={{
          addCohort: this.addCohort,
          baseErrorCohort: new ErrorCohort(
            this.state.cohorts[0],
            this.state.jointDataset
          ),
          columnRanges: this.state.columnRanges,
          dataset: {} as IDataset,
          deleteCohort: (): void => undefined,
          editCohort: (): void => undefined,
          errorCohorts: this.state.cohorts.map(
            (cohort) => new ErrorCohort(cohort, this.state.jointDataset)
          ),
          jointDataset: this.state.jointDataset,
          modelExplanationData: {
            precomputedExplanations: this.props.precomputedExplanations
          } as IModelExplanationData,
          modelMetadata: this.state.modelMetadata,
          requestLocalFeatureExplanations:
            this.props.requestLocalFeatureExplanations,
          requestPredictions: this.state.requestPredictions,
          selectedErrorCohort: new ErrorCohort(
            this.state.selectedCohort,
            this.state.jointDataset
          ),
          setAsCategorical: this.setAsCategorical,
          shiftErrorCohort: this.shiftErrorCohort,
          telemetryHook:
            this.props.telemetryHook ||
            ((): void => {
              return;
            }),
          theme: getTheme()
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
            <ModelPerformanceTab />
          ) : (
            <Stack horizontal>
              <Stack.Item>
                <CohortBar
                  cohorts={this.state.cohorts}
                  onCohortsChange={this.onCohortsChange}
                  jointDataset={this.state.jointDataset}
                  modelMetadata={this.state.modelMetadata}
                  features={this.props.testData}
                />
              </Stack.Item>
              <Stack.Item grow>
                <>
                  <Pivot
                    selectedKey={this.state.activeGlobalTab}
                    onLinkClick={this.handleGlobalTabClick}
                    linkSize={"normal"}
                    headersOnly
                    id="DashboardPivot"
                    overflowBehavior="menu"
                  >
                    {this.pivotItems.map((props) => (
                      <PivotItem key={props.itemKey} {...props} />
                    ))}
                  </Pivot>
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.ModelPerformance && <ModelPerformanceTab />}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.DataExploration && <DatasetExplorerTab />}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.ExplanationTab && (
                    <GlobalExplanationTab
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
      </ModelAssessmentContext.Provider>
    );
  }

  private setAsCategorical = (
    column: string,
    treatAsCategorical: boolean
  ): void => {
    if (this.state.columnRanges) {
      const ranges = this.state.columnRanges;
      ranges[column].treatAsCategorical = treatAsCategorical;
      this.setState({ columnRanges: ranges });
    }
  };

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
        if (prediction === undefined) {
          throw new Error(" ");
        }
      } catch {
        this.setState({ requestPredictions: undefined });
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

  private shiftErrorCohort = (cohort: ErrorCohort): void => {
    this.setState({
      selectedCohort: cohort.cohort
    });
  };

  private addCohort = (cohort: Cohort): void => {
    this.setState((prev) => ({
      cohorts: [...prev.cohorts, cohort]
    }));
  };
}
