// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CausalInsightsTab } from "@responsible-ai/causality";
import {
  CohortBasedComponent,
  ModelAssessmentContext,
  ErrorCohort,
  WeightVectorOption,
  CohortSource,
  Cohort,
  SaveCohort
} from "@responsible-ai/core-ui";
import { CounterfactualsTab } from "@responsible-ai/counterfactuals";
import { DatasetExplorerTab } from "@responsible-ai/dataset-explorer";
import {
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  createInitialTreeViewState,
  ErrorAnalysisOptions,
  ErrorAnalysisViewTab,
  IMatrixAreaState,
  IMatrixFilterState,
  ITreeViewRendererState,
  MapShift
} from "@responsible-ai/error-analysis";
import { ModelPerformanceTab } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  DefaultEffects,
  IDropdownOption,
  PivotItem,
  Stack,
  Text
} from "office-ui-fabric-react";
import * as React from "react";

import { AddTabButton } from "./AddTabButton";
import { getAvailableTabs } from "./AvailableTabs";
import { buildInitialModelAssessmentContext } from "./Context/buildModelAssessmentContext";
import { FeatureImportancesTab } from "./Controls/FeatureImportances";
import { MainMenu } from "./Controls/MainMenu";
import { modelAssessmentDashboardStyles } from "./ModelAssessmentDashboard.styles";
import { IModelAssessmentDashboardProps } from "./ModelAssessmentDashboardProps";
import { IModelAssessmentDashboardState } from "./ModelAssessmentDashboardState";
import { GlobalTabKeys } from "./ModelAssessmentEnums";

export class ModelAssessmentDashboard extends CohortBasedComponent<
  IModelAssessmentDashboardProps,
  IModelAssessmentDashboardState
> {
  private addTabDropdownOptions: IDropdownOption[];

  public constructor(props: IModelAssessmentDashboardProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    this.state = buildInitialModelAssessmentContext(_.cloneDeep(props));

    this.addTabDropdownOptions = getAvailableTabs(this.props, true);

    if (this.props.requestImportances) {
      this.props
        .requestImportances([], new AbortController().signal)
        .then((result) => {
          this.setState({ importances: result });
        });
    }
  }

  public render(): React.ReactNode {
    const disabledView =
      this.props.requestDebugML === undefined &&
      this.props.requestMatrix === undefined &&
      this.state.baseCohort.cohort.name !==
        localization.ErrorAnalysis.Cohort.defaultLabel;
    return (
      <ModelAssessmentContext.Provider
        value={{
          addCohort: this.addCohort,
          baseErrorCohort: this.state.baseCohort,
          causalAnalysisData: this.props.causalAnalysisData?.[0],
          counterfactualData: this.props.counterfactualData?.[0],
          dataset: this.props.dataset,
          deleteCohort: this.deleteCohort,
          editCohort: this.editCohort,
          errorAnalysisData: this.props.errorAnalysisData?.[0],
          errorCohorts: this.state.cohorts,
          jointDataset: this.state.jointDataset,
          modelExplanationData: this.props.modelExplanationData?.[0]
            ? {
                ...this.props.modelExplanationData?.[0],
                predictedY: this.props.dataset.predicted_y,
                probabilityY: this.props.dataset.probability_y
              }
            : undefined,
          modelMetadata: this.state.modelMetadata,
          requestCausalWhatIf: this.props.requestCausalWhatIf,
          requestLocalFeatureExplanations:
            this.props.requestLocalFeatureExplanations,
          requestPredictions: this.props.requestPredictions,
          selectedErrorCohort: this.state.selectedCohort,
          shiftErrorCohort: this.shiftErrorCohort,
          telemetryHook:
            this.props.telemetryHook ||
            ((): void => {
              return;
            }),
          theme: this.props.theme
        }}
      >
        <Stack
          id="ModelAssessmentDashboard"
          className={modelAssessmentDashboardStyles.page}
        >
          <MainMenu
            activeGlobalTabs={this.state.activeGlobalTabs}
            removeTab={this.removeTab}
          />
          <Stack.Item className={modelAssessmentDashboardStyles.mainContent}>
            <Stack tokens={{ childrenGap: "10px", padding: "50px 0 0 0" }}>
              {this.state.activeGlobalTabs[0]?.key !==
                GlobalTabKeys.ErrorAnalysisTab && (
                <Stack.Item
                  className={modelAssessmentDashboardStyles.buttonSection}
                >
                  <AddTabButton
                    tabIndex={0}
                    onAdd={this.addTab}
                    availableTabs={this.addTabDropdownOptions}
                  />
                </Stack.Item>
              )}
              {this.state.activeGlobalTabs.map((t, i) => (
                <>
                  <Stack.Item
                    key={i}
                    className={modelAssessmentDashboardStyles.section}
                    styles={{ root: { boxShadow: DefaultEffects.elevation4 } }}
                  >
                    {t.key === GlobalTabKeys.ErrorAnalysisTab &&
                      this.props.errorAnalysisData?.[0] && (
                        <ErrorAnalysisViewTab
                          disabledView={disabledView}
                          tree={this.props.errorAnalysisData[0].tree}
                          matrix={this.props.errorAnalysisData[0].matrix}
                          matrixFeatures={
                            this.props.errorAnalysisData[0].matrix_features
                          }
                          messages={this.props.stringParams?.contextualHelp}
                          getTreeNodes={this.props.requestDebugML}
                          getMatrix={this.props.requestMatrix}
                          updateSelectedCohort={this.updateSelectedCohort}
                          features={
                            this.props.errorAnalysisData[0].tree_features ||
                            this.props.dataset.feature_names
                          }
                          selectedFeatures={this.state.selectedFeatures}
                          errorAnalysisOption={this.state.errorAnalysisOption}
                          selectedCohort={this.state.selectedCohort}
                          baseCohort={this.state.baseCohort}
                          treeViewState={this.state.treeViewState}
                          setTreeViewState={(
                            treeViewState: ITreeViewRendererState
                          ): void => {
                            if (
                              this.state.selectedCohort !==
                              this.state.baseCohort
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
                              this.state.selectedCohort !==
                              this.state.baseCohort
                            ) {
                              this.setState({ matrixAreaState });
                            }
                          }}
                          setMatrixFilterState={(
                            matrixFilterState: IMatrixFilterState
                          ): void => {
                            if (
                              this.state.selectedCohort !==
                              this.state.baseCohort
                            ) {
                              this.setState({ matrixFilterState });
                            }
                          }}
                          selectFeatures={(features: string[]): void =>
                            this.setState({ selectedFeatures: features })
                          }
                          importances={this.state.importances}
                          onSaveCohortClick={(): void => {
                            this.setState({ saveCohortVisible: true });
                          }}
                          showCohortName={false}
                          handleErrorDetectorChanged={
                            this.handleErrorDetectorChanged
                          }
                          selectedKey={this.state.errorAnalysisOption}
                        />
                      )}
                    {t.key === GlobalTabKeys.ModelStatisticsTab && (
                      <>
                        <div
                          className={
                            modelAssessmentDashboardStyles.sectionHeader
                          }
                        >
                          <Text variant={"xxLarge"}>
                            {
                              localization.ModelAssessment.ComponentNames
                                .ModelStatistics
                            }
                          </Text>
                        </div>
                        <ModelPerformanceTab />
                      </>
                    )}
                    {t.key === GlobalTabKeys.DataExplorerTab && (
                      <>
                        <div
                          className={
                            modelAssessmentDashboardStyles.sectionHeader
                          }
                        >
                          <Text variant={"xxLarge"}>
                            {
                              localization.ModelAssessment.ComponentNames
                                .DataExplorer
                            }
                          </Text>
                        </div>
                        <DatasetExplorerTab />
                      </>
                    )}
                    {t.key === GlobalTabKeys.FeatureImportancesTab &&
                      this.props.modelExplanationData?.[0] && (
                        <FeatureImportancesTab
                          modelMetadata={this.state.modelMetadata}
                          modelExplanationData={this.props.modelExplanationData}
                          selectedWeightVector={this.state.selectedWeightVector}
                          weightVectorOptions={this.state.weightVectorOptions}
                          weightVectorLabels={this.state.weightVectorLabels}
                          requestPredictions={this.props.requestPredictions}
                          onWeightVectorChange={this.onWeightVectorChange}
                        />
                      )}
                    {t.key === GlobalTabKeys.CausalAnalysisTab &&
                      this.props.causalAnalysisData?.[0] && (
                        <CausalInsightsTab
                          data={this.props.causalAnalysisData?.[0]}
                        />
                      )}

                    {t.key === GlobalTabKeys.CounterfactualsTab &&
                      this.props.counterfactualData?.[0] && (
                        <CounterfactualsTab
                          data={this.props.counterfactualData?.[0]}
                        />
                      )}
                  </Stack.Item>
                  <Stack.Item
                    className={modelAssessmentDashboardStyles.buttonSection}
                  >
                    <AddTabButton
                      tabIndex={i + 1}
                      onAdd={this.addTab}
                      availableTabs={this.addTabDropdownOptions}
                    />
                  </Stack.Item>
                </>
              ))}
            </Stack>
          </Stack.Item>
          {this.state.saveCohortVisible && (
            <SaveCohort
              isOpen={this.state.saveCohortVisible}
              onDismiss={(): void =>
                this.setState({ saveCohortVisible: false })
              }
              onSave={this.onSaveCohort}
              temporaryCohort={this.state.selectedCohort}
              baseCohort={this.state.baseCohort}
            />
          )}
          {this.state.mapShiftVisible && (
            <MapShift
              isOpen={this.state.mapShiftVisible}
              onDismiss={(): void =>
                this.setState({
                  errorAnalysisOption: this.state.errorAnalysisOption,
                  mapShiftVisible: false
                })
              }
              onSave={(): void => {
                this.setState({
                  mapShiftVisible: false,
                  saveCohortVisible: true
                });
              }}
              onShift={(): void => {
                this.setState({
                  errorAnalysisOption: this.state.mapShiftErrorAnalysisOption,
                  mapShiftVisible: false,
                  matrixAreaState: createInitialMatrixAreaState(),
                  matrixFilterState: createInitialMatrixFilterState(),
                  selectedCohort: this.state.baseCohort,
                  treeViewState: createInitialTreeViewState()
                });
              }}
            />
          )}
        </Stack>
      </ModelAssessmentContext.Provider>
    );
  }

  private addTab = (index: number, tab: GlobalTabKeys): void => {
    const tabs = [...this.state.activeGlobalTabs];
    let dataCount: number;
    if (index > 0) {
      dataCount = tabs[index - 1].dataCount;
    } else {
      dataCount = this.state.baseCohort.cohortStats.totalCohort;
    }
    tabs.splice(index, 0, {
      dataCount,
      key: tab,
      name:
        this.addTabDropdownOptions.find(({ key }) => key === tab)?.text || ""
    });
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

  private handleErrorDetectorChanged = (item?: PivotItem): void => {
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
    if (this.state.selectedCohort.isTemporary) {
      this.setState({
        mapShiftErrorAnalysisOption: key,
        mapShiftVisible: true
      });
    } else {
      this.setState({
        errorAnalysisOption: key
      });
    }
  };

  private shiftErrorCohort = (cohort: ErrorCohort) => {
    this.setState({
      baseCohort: cohort,
      selectedCohort: cohort
    });
  };

  private onSaveCohort = (
    savedCohort: ErrorCohort,
    switchNew?: boolean
  ): void => {
    if (
      this.state.cohorts.some((c) => c.cohort.name === savedCohort.cohort.name)
    ) {
      return;
    }
    let newCohorts = [...this.state.cohorts, savedCohort];
    newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
    this.setState((preState) => ({
      baseCohort: switchNew ? savedCohort : preState.baseCohort,
      cohorts: newCohorts,
      selectedCohort: switchNew ? savedCohort : preState.selectedCohort
    }));
  };

  private addCohort = (
    manuallyCreatedCohort: Cohort,
    switchNew?: boolean
  ): void => {
    if (
      this.state.cohorts.some(
        (c) => c.cohort.name === manuallyCreatedCohort.name
      )
    ) {
      return;
    }
    const newErrorCohort = new ErrorCohort(
      manuallyCreatedCohort,
      this.state.jointDataset,
      0,
      CohortSource.ManuallyCreated
    );
    let newCohorts = [...this.state.cohorts, newErrorCohort];
    newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
    this.setState((prevState) => ({
      baseCohort: switchNew ? newErrorCohort : prevState.baseCohort,
      cohorts: newCohorts,
      selectedCohort: switchNew ? newErrorCohort : prevState.selectedCohort
    }));
  };

  private editCohort = (editCohort: Cohort): void => {
    const editIndex = this.state.cohorts.findIndex(
      (c) => c.cohort.name === editCohort.name
    );
    if (editIndex === -1) {
      return;
    }
    const newErrorCohort = new ErrorCohort(
      editCohort,
      this.state.jointDataset,
      0,
      CohortSource.ManuallyCreated
    );
    let newCohorts = [...this.state.cohorts];
    newCohorts[editIndex] = newErrorCohort;
    newCohorts = newCohorts.filter((cohort) => !cohort.isTemporary);
    this.setState({
      cohorts: newCohorts
    });
  };

  private deleteCohort = (cohort: ErrorCohort) => {
    if (
      this.state.baseCohort.cohort.name === cohort.cohort.name ||
      this.state.selectedCohort.cohort.name === cohort.cohort.name
    ) {
      return;
    }
    const newCohorts = [...this.state.cohorts].filter(
      (t) => t.cohort.name !== cohort.cohort.name
    );
    this.setState({
      cohorts: newCohorts
    });
  };
}
