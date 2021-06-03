// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CausalInsightsTab } from "@responsible-ai/causality";
import {
  WeightVectorOption,
  CohortBasedComponent,
  ModelAssessmentContext,
  ErrorCohort,
  CohortInfoSection,
  ShiftCohort,
  CohortEditor,
  CohortSource,
  Cohort,
  SaveCohort
} from "@responsible-ai/core-ui";
import { CounterfactualsTab } from "@responsible-ai/counterfactuals";
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
          causalAnalysisData: this.props.causalAnalysisData?.[0],
          counterfactualData: this.props.counterfactualData?.[0],
          dataset: this.props.dataset,
          errorAnalysisConfig: this.props.errorAnalysisConfig?.[0],
          errorCohorts: this.state.cohorts,
          jointDataset: this.state.jointDataset,
          modelExplanationData: this.props.modelExplanationData?.[0]
            ? {
                ...this.props.modelExplanationData?.[0],
                predictedY: this.props.dataset.predictedY,
                probabilityY: this.props.dataset.probabilityY
              }
            : undefined,
          modelMetadata: this.state.modelMetadata,
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
            activeGlobalTabs={this.state.activeGlobalTabs}
            removeTab={this.removeTab}
            toggleShiftCohortVisibility={() => {
              this.setState((prev) => ({
                shiftCohortVisible: !prev.shiftCohortVisible
              }));
            }}
            toggleCreateCohortVisibility={() => {
              this.setState((prev) => ({
                createCohortVisible: !prev.createCohortVisible
              }));
            }}
            onEditCohortClick={(_: ErrorCohort) => {}}
          />
          <Stack>
            <Stack.Item className={modelAssessmentDashboardStyles.section}>
              <CohortInfoSection
                toggleShiftCohortVisibility={() => {
                  this.setState((prev) => ({
                    shiftCohortVisible: !prev.shiftCohortVisible
                  }));
                }}
                toggleCreateCohortVisibility={() => {
                  this.setState((prev) => ({
                    createCohortVisible: !prev.createCohortVisible
                  }));
                }}
              />
            </Stack.Item>
            {this.state.activeGlobalTabs[0]?.key !==
              GlobalTabKeys.ErrorAnalysisTab && (
              <Stack.Item
                className={modelAssessmentDashboardStyles.buttonSection}
              >
                <AddTabButton tabIndex={0} onAdd={this.addTab} />
              </Stack.Item>
            )}
            {this.state.activeGlobalTabs.map((t, i) => (
              <>
                <Stack.Item
                  key={i}
                  className={modelAssessmentDashboardStyles.section}
                >
                  {t.key === GlobalTabKeys.ErrorAnalysisTab &&
                    this.props.errorAnalysisConfig?.[0] && (
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
                        ): void => {
                          if (
                            this.state.selectedCohort !== this.state.baseCohort
                          ) {
                            this.setState({ treeViewState });
                          }
                        }}
                        matrixAreaState={this.state.matrixAreaState}
                        matrixFilterState={this.state.matrixFilterState}
                        setMatrixAreaState={(
                          matrixAreaState: IMatrixAreaState
                        ): void => {
                          if (
                            this.state.selectedCohort !== this.state.baseCohort
                          ) {
                            this.setState({ matrixAreaState });
                          }
                        }}
                        setMatrixFilterState={(
                          matrixFilterState: IMatrixFilterState
                        ): void => {
                          if (
                            this.state.selectedCohort !== this.state.baseCohort
                          ) {
                            this.setState({ matrixFilterState });
                          }
                        }}
                        stringParams={this.props.stringParams}
                        selectFeatures={(features: string[]): void =>
                          this.setState({ selectedFeatures: features })
                        }
                        importances={this.state.importances}
                        onSaveCohortClick={() => {
                          this.setState({ saveCohortVisible: true });
                        }}
                      />
                    )}
                  {t.key === GlobalTabKeys.ModelStatisticsTab && (
                    <ModelPerformanceTab />
                  )}
                  {t.key === GlobalTabKeys.DataExplorerTab && (
                    <DatasetExplorerTab showCohortSelection={false} />
                  )}
                  {t.key === GlobalTabKeys.GlobalExplanationTab &&
                    this.props.modelExplanationData?.[0] && (
                      <GlobalExplanationTab
                        cohorts={this.state.cohorts.map(
                          (cohort) => cohort.cohort
                        )}
                        cohortIDs={cohortIDs}
                        selectedWeightVector={this.state.selectedWeightVector}
                        weightOptions={this.state.weightVectorOptions}
                        weightLabels={this.state.weightVectorLabels}
                        onWeightChange={this.onWeightVectorChange}
                        explanationMethod={
                          this.props.modelExplanationData[0].explanationMethod
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
                      setActivePredictionTab={(
                        key: PredictionTabKeys
                      ): void => {
                        this.setState({
                          predictionTab: key
                        });
                      }}
                      customPoints={this.state.customPoints}
                      selectedCohort={this.state.selectedCohort}
                      setWhatIfDatapoint={(index: number): void =>
                        this.setState({ selectedWhatIfIndex: index })
                      }
                    />
                  )}
                  {t.key === GlobalTabKeys.CausalAnalysisTab &&
                    this.props.causalAnalysisData?.[0] && (
                      <CausalInsightsTab
                        data={this.props.causalAnalysisData?.[0]}
                      />
                    )}

                  {t.key === GlobalTabKeys.CounterfactualsTab &&
                    this.props.causalAnalysisData?.[0] && (
                      <CounterfactualsTab
                        data={this.props.causalAnalysisData?.[0]}
                      />
                    )}
                </Stack.Item>
                <Stack.Item
                  className={modelAssessmentDashboardStyles.buttonSection}
                >
                  <AddTabButton tabIndex={0} onAdd={this.addTab} />
                </Stack.Item>
              </>
            ))}
          </Stack>
          {this.state.shiftCohortVisible && (
            <ShiftCohort
              isOpen={this.state.shiftCohortVisible}
              onDismiss={() => {
                this.setState((prev) => ({
                  shiftCohortVisible: !prev.shiftCohortVisible
                }));
              }}
              onApply={(selectedCohort: ErrorCohort): void => {
                this.setState({
                  baseCohort: selectedCohort,
                  cohorts: this.state.cohorts,
                  selectedCohort
                });
              }}
              defaultCohort={this.state.baseCohort}
            />
          )}
          {this.state.createCohortVisible && (
            <CohortEditor
              jointDataset={this.state.jointDataset}
              filterList={this.state.baseCohort.cohort.filters}
              cohortName={
                localization.Interpret.Cohort.cohort +
                " " +
                (this.state.cohorts.length + 1).toString()
              }
              onSave={(manuallyCreatedCohort: Cohort): void => {
                const newErrorCohort = new ErrorCohort(
                  manuallyCreatedCohort,
                  this.state.jointDataset,
                  0,
                  CohortSource.ManuallyCreated
                );
                let newCohorts = [...this.state.cohorts, newErrorCohort];
                newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
                this.updateErrorCohorts(
                  newCohorts,
                  newErrorCohort,
                  newErrorCohort
                );
                this.setState((prev) => ({
                  createCohortVisible: !prev.createCohortVisible
                }));
              }}
              isNewCohort={true}
              deleteIsDisabled={true}
              closeCohortEditor={() => {
                this.setState((prev) => ({
                  createCohortVisible: !prev.createCohortVisible
                }));
              }}
              closeCohortEditorPanel={() => {
                this.setState((prev) => ({
                  createCohortVisible: !prev.createCohortVisible
                }));
              }}
            />
          )}
          {this.state.saveCohortVisible && (
            <SaveCohort
              isOpen={this.state.saveCohortVisible}
              onDismiss={(): void =>
                this.setState({ saveCohortVisible: false })
              }
              onSave={(savedCohort: ErrorCohort): void => {
                let newCohorts = [...this.state.cohorts, savedCohort];
                newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
                this.setState({
                  cohorts: newCohorts,
                  selectedCohort: savedCohort
                });
              }}
              temporaryCohort={this.state.selectedCohort}
              baseCohort={this.state.baseCohort}
            />
          )}
        </div>
      </ModelAssessmentContext.Provider>
    );
  }
  private addTab = (index: number, tab: GlobalTabKeys): void => {
    const tabs = [...this.state.activeGlobalTabs];
    tabs.splice(index, 0, { dataCount: 0, key: tab });
    this.setState({ activeGlobalTabs: tabs });
  };
  private removeTab = (index: number): void => {
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
