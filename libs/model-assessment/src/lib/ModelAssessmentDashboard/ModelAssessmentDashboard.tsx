// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  WeightVectorOption,
  getDatasetSummary,
  CohortInfo,
  CohortList,
  EditCohort,
  ErrorCohort,
  SaveCohort,
  ShiftCohort,
  CohortBasedComponent,
  IGenericChartProps,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import {
  ErrorAnalysisOptions,
  ErrorAnalysisViewTab,
  ErrorAnalysisDashboardStyles,
  InstanceView,
  MapShift,
  ModelExplanationUtils,
  WhatIf,
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  IMatrixAreaState,
  IMatrixFilterState,
  ITreeViewRendererState,
  createInitialTreeViewState
} from "@responsible-ai/error-analysis";
import { FairnessWizardV2 } from "@responsible-ai/fairness";
import {
  DatasetExplorerTab,
  GlobalExplanationTab,
  ModelPerformanceTab
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  ISettings,
  Layer,
  LayerHost,
  mergeStyleSets,
  Customizer,
  getId,
  INavLink,
  Stack,
  PivotItem
} from "office-ui-fabric-react";
import * as React from "react";

import { buildInitialModelAssessmentContext } from "./Context/buildModelAssessmentContext";
import { MainMenu } from "./Controls/MainMenu";
import { Navigation } from "./Controls/Navigation";
import { IModelAssessmentDashboardProps } from "./ModelAssessmentDashboardProps";
import { IModelAssessmentDashboardState } from "./ModelAssessmentDashboardState";
import { GlobalTabKeys, PredictionTabKeys } from "./ModelAssessmentEnums";

export class ModelAssessmentDashboard extends CohortBasedComponent<
  IModelAssessmentDashboardProps,
  IModelAssessmentDashboardState
> {
  private static readonly classNames = mergeStyleSets({
    navWrapper: {
      display: "contents",
      width: "calc(100% - 300px)"
    }
  });

  private layerHostId: string;

  public constructor(props: IModelAssessmentDashboardProps) {
    super(props);
    this.onModelConfigChanged = this.onModelConfigChanged.bind(this);
    this.onConfigChanged = this.onConfigChanged.bind(this);
    this.onWhatIfConfigChanged = this.onWhatIfConfigChanged.bind(this);
    this.onDependenceChange = this.onDependenceChange.bind(this);
    this.handleGlobalTabClick = this.handleGlobalTabClick.bind(this);
    this.setSortVector = this.setSortVector.bind(this);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    this.state = buildInitialModelAssessmentContext(_.cloneDeep(props));

    this.layerHostId = getId("cohortsLayerHost");
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
    const classNames = ErrorAnalysisDashboardStyles();

    return (
      <ModelAssessmentContext.Provider
        value={{
          cohorts: this.state.cohorts.map(
            (cohort: ErrorCohort) => cohort.cohort
          ),
          dataset: this.props.dataset,
          modelExplanationData: this.props.modelExplanationData,
          theme: this.props.theme,
          cohorts: this.state.cohorts,
          jointDataset: this.state.jointDataset,
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
            })
        }}
      >
        <div className={classNames.page}>
          <MainMenu
            onInfoPanelClick={(): void =>
              this.setState({ openInfoPanel: true })
            }
            onCohortListPanelClick={(): void =>
              this.setState({ openCohortListPanel: true })
            }
            onSaveCohortClick={(): void =>
              this.setState({ openSaveCohort: true })
            }
            onShiftCohortClick={(): void =>
              this.setState({ openShiftCohort: true })
            }
            onWhatIfClick={(): void => this.setState({ openWhatIf: true })}
            localUrl={this.props.localUrl}
            errorAnalysisOption={this.state.errorAnalysisOption}
            temporaryCohort={this.state.selectedCohort}
            activeGlobalTab={this.state.activeGlobalTab}
            activePredictionTab={this.state.predictionTab}
          />
          {this.state.openSaveCohort && (
            <SaveCohort
              isOpen={this.state.openSaveCohort}
              onDismiss={(): void => this.setState({ openSaveCohort: false })}
              onSave={(savedCohort: ErrorCohort): void => {
                let newCohorts = [savedCohort, ...this.state.cohorts];
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
          {this.state.openMapShift && (
            <MapShift
              isOpen={this.state.openMapShift}
              onDismiss={(): void => this.setState({ openMapShift: false })}
              onSave={(): void => {
                this.setState({
                  openMapShift: false,
                  openSaveCohort: true
                });
              }}
              onShift={(): void => {
                this.setState({
                  errorAnalysisOption: this.state.mapShiftErrorAnalysisOption,
                  matrixAreaState: createInitialMatrixAreaState(),
                  matrixFilterState: createInitialMatrixFilterState(),
                  openMapShift: false,
                  selectedCohort: this.state.baseCohort,
                  treeViewState: createInitialTreeViewState()
                });
              }}
            />
          )}
          {this.state.openEditCohort && (
            <EditCohort
              isOpen={this.state.openEditCohort}
              onDismiss={(): void => this.setState({ openEditCohort: false })}
              onSave={(
                originalCohort: ErrorCohort,
                editedCohort: ErrorCohort
              ): void => {
                const cohorts = this.state.cohorts.filter(
                  (errorCohort) =>
                    errorCohort.cohort.name !== originalCohort.cohort.name
                );
                let selectedCohort = this.state.selectedCohort;
                if (originalCohort.cohort.name === selectedCohort.cohort.name) {
                  selectedCohort = editedCohort;
                }
                this.setState({
                  cohorts: [editedCohort, ...cohorts],
                  selectedCohort
                });
              }}
              onDelete={(deletedCohort: ErrorCohort): void => {
                const cohorts = this.state.cohorts.filter(
                  (errorCohort) =>
                    errorCohort.cohort.name !== deletedCohort.cohort.name
                );
                this.setState({
                  cohorts
                });
              }}
              cohort={this.state.editedCohort}
              selectedCohort={this.state.selectedCohort}
            />
          )}
          {this.state.openShiftCohort && (
            <ShiftCohort
              isOpen={this.state.openShiftCohort}
              onDismiss={(): void => this.setState({ openShiftCohort: false })}
              onApply={(selectedCohort: ErrorCohort): void => {
                let cohorts = this.state.cohorts;
                cohorts = cohorts.filter(
                  (cohort) => cohort.cohort.name !== selectedCohort.cohort.name
                );
                this.setState({
                  baseCohort: selectedCohort,
                  cohorts: [selectedCohort, ...cohorts],
                  selectedCohort
                });
              }}
            />
          )}
          <div>
            <Customizer
              settings={(currentSettings): ISettings => ({
                ...currentSettings,
                hostId: this.layerHostId
              })}
            >
              <Layer>
                <Stack horizontal={true}>
                  <Navigation
                    activeGlobalTab={this.state.activeGlobalTab}
                    handleGlobalTabClick={this.handleGlobalTabClick.bind(this)}
                  />
                  <div
                    className={ModelAssessmentDashboard.classNames.navWrapper}
                  >
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.ErrorAnalysisTab && (
                      <ErrorAnalysisViewTab
                        messages={
                          this.props.stringParams
                            ? this.props.stringParams.contextualHelp
                            : undefined
                        }
                        getTreeNodes={this.props.requestDebugML}
                        getMatrix={this.props.requestMatrix}
                        updateSelectedCohort={this.updateSelectedCohort.bind(
                          this
                        )}
                        features={this.props.dataset.featureNames}
                        selectedFeatures={this.state.selectedFeatures}
                        errorAnalysisOption={this.state.errorAnalysisOption}
                        selectedCohort={this.state.selectedCohort}
                        baseCohort={this.state.baseCohort}
                        treeViewState={this.state.treeViewState}
                        setTreeViewState={(
                          treeViewState: ITreeViewRendererState
                        ) => {
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
                        ) => {
                          if (
                            this.state.selectedCohort !== this.state.baseCohort
                          ) {
                            this.setState({ matrixAreaState });
                          }
                        }}
                        setMatrixFilterState={(
                          matrixFilterState: IMatrixFilterState
                        ) => {
                          if (
                            this.state.selectedCohort !== this.state.baseCohort
                          ) {
                            this.setState({ matrixFilterState });
                          }
                        }}
                        handleErrorDetectorChanged={this.handleErrorDetectorChanged.bind(
                          this
                        )}
                        stringParams={this.props.stringParams}
                        selectFeatures={(features: string[]): void =>
                          this.setState({ selectedFeatures: features })
                        }
                        importances={this.state.importances}
                      />
                    )}
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.ModelStatisticsTab && (
                      <ModelPerformanceTab />
                    )}
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.DataExplorerTab && <DatasetExplorerTab />}
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.GlobalExplanationTab && (
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
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.LocalExplanationTab && (
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
                        setWhatIfDatapoint={(index: number) =>
                          this.setState({ selectedWhatIfIndex: index })
                        }
                      />
                    )}
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.FairnessTab && (
                      <FairnessWizardV2
                        predictedY={[
                          this.props.modelExplanationData.predictedY!
                        ]}
                        trueY={this.props.dataset.trueY}
                        dataSummary={getDatasetSummary(
                          this.props.dataset,
                          true
                        )}
                        supportedBinaryClassificationPerformanceKeys={
                          this.props
                            .supportedBinaryClassificationPerformanceKeys
                        }
                        supportedProbabilityPerformanceKeys={
                          this.props.supportedProbabilityPerformanceKeys
                        }
                        supportedRegressionPerformanceKeys={
                          this.props.supportedRegressionPerformanceKeys
                        }
                        requestMetrics={this.props.requestMetrics}
                        testData={this.props.dataset.sensitiveFeatures!}
                        locale={this.props.locale}
                        theme={this.props.theme}
                      />
                    )}
                  </div>
                </Stack>
                <CohortInfo
                  isOpen={this.state.openInfoPanel}
                  currentCohort={this.state.selectedCohort}
                  onDismiss={(): void =>
                    this.setState({ openInfoPanel: false })
                  }
                  onSaveCohortClick={(): void =>
                    this.setState({ openSaveCohort: true })
                  }
                />
                <CohortList
                  cohorts={this.state.cohorts}
                  isOpen={this.state.openCohortListPanel}
                  onDismiss={(): void =>
                    this.setState({ openCohortListPanel: false })
                  }
                  onEditCohortClick={(editedCohort: ErrorCohort): void =>
                    this.setState({
                      editedCohort,
                      openEditCohort: true
                    })
                  }
                />
                <WhatIf
                  isOpen={this.state.openWhatIf}
                  onDismiss={(): void => this.setState({ openWhatIf: false })}
                  currentCohort={this.state.selectedCohort}
                  invokeModel={this.props.requestPredictions}
                  customPoints={this.state.customPoints}
                  addCustomPoint={this.addCustomPoint.bind(this)}
                  selectedIndex={this.state.selectedWhatIfIndex}
                />
              </Layer>
            </Customizer>
            <LayerHost
              id={this.layerHostId}
              style={{
                height: "1100px",
                overflow: "hidden",
                position: "relative",
                width: "100%"
              }}
            />
          </div>
        </div>
      </ModelAssessmentContext.Provider>
    );
  }

  private addCustomPoint(temporaryPoint: { [key: string]: any }): void {
    this.setState({
      customPoints: [...this.state.customPoints, temporaryPoint],
      openWhatIf: false,
      predictionTab: PredictionTabKeys.WhatIfDatapointsTab
    });
  }

  private onConfigChanged(newConfig: IGenericChartProps): void {
    this.setState({ dataChartConfig: newConfig });
  }

  private onModelConfigChanged(newConfig: IGenericChartProps): void {
    this.setState({ modelChartConfig: newConfig });
  }

  private onWhatIfConfigChanged(newConfig: IGenericChartProps): void {
    this.setState({ whatIfChartConfig: newConfig });
  }

  private onDependenceChange(newConfig: IGenericChartProps): void {
    this.setState({ dependenceProps: newConfig });
  }

  private handleGlobalTabClick(_ev?: any, item?: INavLink | undefined): void {
    if (item !== undefined) {
      const itemKey: string = item.key!;
      const index: GlobalTabKeys = GlobalTabKeys[itemKey];
      const predictionTab = PredictionTabKeys.CorrectPredictionTab;
      this.setState({
        activeGlobalTab: index,
        openWhatIf: false,
        predictionTab
      });
    }
  }

  private setSortVector(): void {
    this.setState({
      sortVector: ModelExplanationUtils.getSortIndices(
        this.state.cohorts[0].cohort.calculateAverageImportance()
      ).reverse()
    });
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
