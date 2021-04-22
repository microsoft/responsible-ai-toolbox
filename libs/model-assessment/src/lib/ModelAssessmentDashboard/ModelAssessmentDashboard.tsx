// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CausalInsightsTab } from "@responsible-ai/causality";
import {
  WeightVectorOption,
  CohortBasedComponent,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { CounterfactualsTab } from "@responsible-ai/counterfactuals";
import { DatasetExplorerTab } from "@responsible-ai/dataset-explorer";
import {
  ErrorAnalysisOptions,
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
import { Stack, PivotItem, IconButton } from "office-ui-fabric-react";
import * as React from "react";

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
          telemetryHook:
            this.props.telemetryHook ||
            ((): void => {
              return;
            }),
          theme: this.props.theme
        }}
      >
        <div className={modelAssessmentDashboardStyles.page}>
          <MainMenu
            localUrl={this.props.localUrl}
            errorAnalysisOption={this.state.errorAnalysisOption}
            temporaryCohort={this.state.selectedCohort}
          />
          <Stack>
            {this.state.activeGlobalTabs.map((t, i) => (
              <div key={i} className={modelAssessmentDashboardStyles.section}>
                {t === GlobalTabKeys.ErrorAnalysisTab && (
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
                    handleErrorDetectorChanged={this.handleErrorDetectorChanged}
                    stringParams={this.props.stringParams}
                    selectFeatures={(features: string[]): void =>
                      this.setState({ selectedFeatures: features })
                    }
                    importances={this.state.importances}
                  />
                )}
                {t === GlobalTabKeys.ModelStatisticsTab && (
                  <ModelPerformanceTab />
                )}
                {t === GlobalTabKeys.DataExplorerTab && <DatasetExplorerTab />}
                {t === GlobalTabKeys.GlobalExplanationTab && (
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
                {t === GlobalTabKeys.LocalExplanationTab && (
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
                {t === GlobalTabKeys.CausalInsightsTab && <CausalInsightsTab />}

                {t === GlobalTabKeys.CounterfactualsTab && (
                  <CounterfactualsTab />
                )}
                <IconButton iconProps={{ iconName: "CircleAdditionSolid" }} />
              </div>
            ))}
          </Stack>
        </div>
      </ModelAssessmentContext.Provider>
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.state.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.state.cohorts.forEach((errorCohort) =>
      errorCohort.cohort.clearCachedImportances()
    );
    this.setState({ selectedWeightVector: weightOption });
  };

  private handleErrorDetectorChanged = (
    item?: PivotItem,
    _ev?: React.MouseEvent<HTMLElement>
  ): void => {
    if (item && item.props.itemKey) {
      // Note comparison below is actually string comparison (key is string), we have to set the enum
      if (item.props.itemKey === ErrorAnalysisOptions.HeatMap) {
        const selectedOptionHeatMap = ErrorAnalysisOptions.HeatMap;
        this.setErrorDetector(selectedOptionHeatMap);
      } else {
        const selectedOptionTreeMap = ErrorAnalysisOptions.TreeMap;
        this.setErrorDetector(selectedOptionTreeMap);
      }
    }
  };

  private setErrorDetector = (key: ErrorAnalysisOptions): void => {
    alert(this.state.selectedCohort.isTemporary);
    if (this.state.selectedCohort.isTemporary) {
      this.setState({
        mapShiftErrorAnalysisOption: key,
        openMapShift: true
      });
    } else {
      this.setState({
        errorAnalysisOption: key
      });
    }
  };
}
