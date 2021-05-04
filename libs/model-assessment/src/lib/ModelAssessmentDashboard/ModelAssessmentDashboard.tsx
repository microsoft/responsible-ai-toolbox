// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CausalInsightsTab } from "@responsible-ai/causality";
import {
  WeightVectorOption,
  CohortBasedComponent,
  ModelAssessmentContext,
  ErrorCohort
} from "@responsible-ai/core-ui";
// import { CounterfactualsTab } from "@responsible-ai/counterfactuals";
import { DatasetExplorerTab } from "@responsible-ai/dataset-explorer";
import {
  ErrorAnalysisViewTab,
  InstanceView,
  IMatrixAreaState,
  IMatrixFilterState,
  ITreeViewRendererState
} from "@responsible-ai/error-analysis";
import {
  GlobalExplanationTab,
  ModelPerformanceTab
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { Stack } from "office-ui-fabric-react";
import * as React from "react";

import { AddTabButton } from "./AddTabButton";
import { buildInitialModelAssessmentContext } from "./Context/buildModelAssessmentContext";
import { MainMenu } from "./Controls/MainMenu";
import { modelAssessmentDashboardStyles } from "./ModelAssessmentDashboard.styles";
import { IModelAssessmentDashboardProps } from "./ModelAssessmentDashboardProps";
import { IModelAssessmentDashboardState } from "./ModelAssessmentDashboardState";
import { GlobalTabKeys, PredictionTabKeys } from "./ModelAssessmentEnums";

export class ModelAssessmentDashboard extends CohortBasedComponent<
  IModelAssessmentDashboardProps,
  IModelAssessmentDashboardState
> {
  public constructor(props: IModelAssessmentDashboardProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    this.state = buildInitialModelAssessmentContext(_.cloneDeep(props));

    if (this.props.requestImportances) {
      this.props
        .requestImportances([], new AbortController().signal)
        .then((result) => {
          this.setState({ importances: result });
        });
    }
  }

  public render(): React.ReactNode {
    const cohortIDs = this.state.cohorts.map((errorCohort) =>
      errorCohort.cohort.getCohortID().toString()
    );
    return (
      <ModelAssessmentContext.Provider
        value={{
          baseErrorCohort: this.state.baseCohort,
          dataset: this.props.dataset,
          errorCohorts: this.state.cohorts,
          jointDataset: this.state.jointDataset,
          modelExplanationData: this.props.modelExplanationData,
          modelMetadata: this.state.modelMetadata,
          precomputedExplanations: this.props.modelExplanationData
            .precomputedExplanations,
          requestLocalFeatureExplanations: this.props
            .requestLocalFeatureExplanations,
          requestPredictions: this.props.requestPredictions,
          selectedErrorCohort: this.state.selectedCohort,
          telemetryHook:
            this.props.telemetryHook ||
            ((): void => {
              return;
            }),
          theme: this.props.theme,
          updateErrorCohorts: this.updateErrorCohorts
        }}
      >
        <div className={modelAssessmentDashboardStyles.page}>
          <MainMenu
            localUrl={this.props.localUrl}
            activeGlobalTabs={this.state.activeGlobalTabs}
            removeTab={this.removeTab}
          />
          <Stack>
            {this.state.activeGlobalTabs[0]?.key !==
              GlobalTabKeys.ErrorAnalysisTab && (
              <div className={modelAssessmentDashboardStyles.section}>
                <AddTabButton tabIndex={0} onAdd={this.addTab} />
              </div>
            )}
            {this.state.activeGlobalTabs.map((t, i) => (
              <div key={i} className={modelAssessmentDashboardStyles.section}>
                {t.key === GlobalTabKeys.ErrorAnalysisTab && (
                  <ErrorAnalysisViewTab
                    messages={
                      this.props.stringParams
                        ? this.props.stringParams.contextualHelp
                        : undefined
                    }
                    getTreeNodes={this.props.requestDebugML}
                    getMatrix={this.props.requestMatrix}
                    updateSelectedCohort={this.updateSelectedCohort}
                    features={this.props.dataset.featureNames}
                    selectedFeatures={this.state.selectedFeatures}
                    errorAnalysisOption={this.state.errorAnalysisOption}
                    selectedCohort={this.state.selectedCohort}
                    baseCohort={this.state.baseCohort}
                    treeViewState={this.state.treeViewState}
                    setTreeViewState={(
                      treeViewState: ITreeViewRendererState
                    ) => {
                      if (this.state.selectedCohort !== this.state.baseCohort) {
                        this.setState({ treeViewState });
                      }
                    }}
                    matrixAreaState={this.state.matrixAreaState}
                    matrixFilterState={this.state.matrixFilterState}
                    setMatrixAreaState={(matrixAreaState: IMatrixAreaState) => {
                      if (this.state.selectedCohort !== this.state.baseCohort) {
                        this.setState({ matrixAreaState });
                      }
                    }}
                    setMatrixFilterState={(
                      matrixFilterState: IMatrixFilterState
                    ) => {
                      if (this.state.selectedCohort !== this.state.baseCohort) {
                        this.setState({ matrixFilterState });
                      }
                    }}
                    stringParams={this.props.stringParams}
                    selectFeatures={(features: string[]): void =>
                      this.setState({ selectedFeatures: features })
                    }
                    importances={this.state.importances}
                  />
                )}
                {t.key === GlobalTabKeys.ModelStatisticsTab && (
                  <ModelPerformanceTab />
                )}
                {t.key === GlobalTabKeys.DataExplorerTab && (
                  <DatasetExplorerTab />
                )}
                {t.key === GlobalTabKeys.GlobalExplanationTab && (
                  <GlobalExplanationTab
                    cohorts={this.state.cohorts.map((cohort) => cohort.cohort)}
                    cohortIDs={cohortIDs}
                    selectedWeightVector={this.state.selectedWeightVector}
                    weightOptions={this.state.weightVectorOptions}
                    weightLabels={this.state.weightVectorLabels}
                    onWeightChange={this.onWeightVectorChange}
                    explanationMethod={
                      this.props.modelExplanationData.explanationMethod
                    }
                  />
                )}
                {t.key === GlobalTabKeys.LocalExplanationTab && (
                  <InstanceView
                    messages={
                      this.props.stringParams
                        ? this.props.stringParams.contextualHelp
                        : undefined
                    }
                    features={this.props.dataset.featureNames}
                    invokeModel={this.props.requestPredictions}
                    selectedWeightVector={this.state.selectedWeightVector}
                    weightOptions={this.state.weightVectorOptions}
                    weightLabels={this.state.weightVectorLabels}
                    onWeightChange={this.onWeightVectorChange}
                    activePredictionTab={this.state.predictionTab}
                    setActivePredictionTab={(key: PredictionTabKeys): void => {
                      this.setState({
                        predictionTab: key
                      });
                    }}
                    customPoints={this.state.customPoints}
                    selectedCohort={this.state.selectedCohort}
                    setWhatIfDatapoint={(index: number) =>
                      this.setState({ selectedWhatIfIndex: index })
                    }
                  />
                )}
                {t.key === GlobalTabKeys.CausalAnalysisTab && (
                  <CausalInsightsTab data={this.props.casualAnalysisData} />
                )}
                {/* 
                {t.key === GlobalTabKeys.CounterfactualsTab && (
                  <CounterfactualsTab />
                )} */}
                <AddTabButton tabIndex={i + 1} onAdd={this.addTab} />
              </div>
            ))}
          </Stack>
        </div>
      </ModelAssessmentContext.Provider>
    );
  }
  private addTab = (index: number, tab: GlobalTabKeys) => {
    const tabs = [...this.state.activeGlobalTabs];
    tabs.splice(index, 0, { dataCount: 0, key: tab });
    this.setState({ activeGlobalTabs: tabs });
  };
  private removeTab = (index: number) => {
    const tabs = [...this.state.activeGlobalTabs];
    tabs.splice(index, 1);
    this.setState({ activeGlobalTabs: tabs });
  };

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.state.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.state.cohorts.forEach((errorCohort) =>
      errorCohort.cohort.clearCachedImportances()
    );
    this.setState({ selectedWeightVector: weightOption });
  };

  private updateErrorCohorts = (
    cohorts: ErrorCohort[],
    selectedCohort: ErrorCohort,
    baseCohort?: ErrorCohort
  ): void => {
    this.setState({
      baseCohort: baseCohort || this.state.baseCohort,
      cohorts,
      selectedCohort
    });
  };
}
