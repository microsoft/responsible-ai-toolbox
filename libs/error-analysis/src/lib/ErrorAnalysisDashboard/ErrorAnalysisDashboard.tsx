// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  isThreeDimArray,
  JointDataset,
  IExplanationModelMetadata,
  ModelTypes,
  WeightVectors,
  CohortInfoPanel,
  CohortListPanel,
  ErrorCohort,
  SaveCohort,
  buildGlobalProperties,
  buildIndexedNames,
  getModelType,
  getClassLength,
  ModelAssessmentContext,
  IDataset,
  IModelExplanationData,
  CohortSource,
  MetricCohortStats,
  ICompositeFilter,
  IFilter,
  WeightVectorOption,
  EditCohort,
  ShiftCohort
} from "@responsible-ai/core-ui";
import { DatasetExplorerTab } from "@responsible-ai/dataset-explorer";
import { GlobalExplanationTab } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  IPivotItemProps,
  ISettings,
  Layer,
  LayerHost,
  Customizer,
  getId,
  PivotItem,
  Pivot,
  PivotLinkSize,
  mergeStyleSets
} from "office-ui-fabric-react";
import React from "react";

import { ErrorAnalysisView } from "./Controls/ErrorAnalysisView/ErrorAnalysisView";
import { FeatureList } from "./Controls/FeatureList/FeatureList";
import { InstanceView } from "./Controls/InstanceView/InstanceView";
import { MainMenu } from "./Controls/MainMenu/MainMenu";
import { MapShift } from "./Controls/MapShift/MapShift";
import { Navigation } from "./Controls/Navigation/Navigation";
import { WhatIf } from "./Controls/WhatIf/WhatIf";
import { ErrorAnalysisDashboardStyles } from "./ErrorAnalysisDashboard.styles";
import {
  ErrorAnalysisOptions,
  GlobalTabKeys,
  PredictionTabKeys,
  ViewTypeKeys
} from "./ErrorAnalysisEnums";
import { IErrorAnalysisDashboardProps } from "./Interfaces/IErrorAnalysisDashboardProps";
import { IErrorAnalysisDashboardState } from "./Interfaces/IErrorAnalysisDashboardState";
import {
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  IMatrixAreaState,
  IMatrixFilterState
} from "./MatrixFilterState";
import {
  ITreeViewRendererState,
  createInitialTreeViewState
} from "./TreeViewState";

export class ErrorAnalysisDashboard extends React.PureComponent<
  IErrorAnalysisDashboardProps,
  IErrorAnalysisDashboardState
> {
  private static readonly classNames = mergeStyleSets({
    pivotWrapper: {
      display: "contents"
    }
  });

  private pivotItems: IPivotItemProps[] = [];
  private layerHostId: string;

  public constructor(props: IErrorAnalysisDashboardProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    this.state = ErrorAnalysisDashboard.buildInitialExplanationContext(
      _.cloneDeep(props)
    );

    this.pivotItems.push({
      headerText: localization.ErrorAnalysis.dataExplorerView,
      itemKey: GlobalTabKeys.DataExplorerTab
    });
    this.pivotItems.push({
      headerText: localization.ErrorAnalysis.globalExplanationView,
      itemKey: GlobalTabKeys.GlobalExplanationTab
    });
    this.pivotItems.push({
      headerText: localization.ErrorAnalysis.localExplanationView,
      itemKey: GlobalTabKeys.LocalExplanationTab
    });
    this.layerHostId = getId("cohortsLayerHost");
    if (this.props.requestImportances) {
      this.props
        .requestImportances([], new AbortController().signal)
        .then((result) => {
          this.setState({ importances: result });
        });
    }
  }

  private static buildModelMetadata(
    props: IErrorAnalysisDashboardProps
  ): IExplanationModelMetadata {
    const modelType = getModelType(
      props.modelInformation.method,
      props.precomputedExplanations,
      props.probabilityY
    );
    let featureNames = props.dataSummary.featureNames;
    let featureNamesAbridged: string[];
    const maxLength = 18;
    if (featureNames !== undefined) {
      if (!featureNames.every((name) => typeof name === "string")) {
        featureNames = featureNames.map((x) => x.toString());
      }
      featureNamesAbridged = featureNames.map((name) => {
        return name.length <= maxLength
          ? name
          : `${name.slice(0, maxLength)}...`;
      });
    } else {
      let featureLength = 0;
      if (props.testData && props.testData[0] !== undefined) {
        featureLength = props.testData[0].length;
      } else if (
        props.precomputedExplanations &&
        props.precomputedExplanations.globalFeatureImportance
      ) {
        featureLength =
          props.precomputedExplanations.globalFeatureImportance.scores.length;
      } else if (
        props.precomputedExplanations &&
        props.precomputedExplanations.localFeatureImportance
      ) {
        const localImportances =
          props.precomputedExplanations.localFeatureImportance.scores;
        if (isThreeDimArray(localImportances)) {
          featureLength = (props.precomputedExplanations.localFeatureImportance
            .scores[0][0] as number[]).length;
        } else {
          featureLength = (props.precomputedExplanations.localFeatureImportance
            .scores[0] as number[]).length;
        }
      } else if (
        props.precomputedExplanations &&
        props.precomputedExplanations.ebmGlobalExplanation
      ) {
        featureLength =
          props.precomputedExplanations.ebmGlobalExplanation.feature_list
            .length;
      }
      featureNames = buildIndexedNames(
        featureLength,
        localization.ErrorAnalysis.defaultFeatureNames
      );
      featureNamesAbridged = featureNames;
    }
    let classNames = props.dataSummary.classNames;
    const classLength = getClassLength(
      props.precomputedExplanations,
      props.probabilityY
    );
    if (!classNames || classNames.length !== classLength) {
      classNames = buildIndexedNames(
        classLength,
        localization.ErrorAnalysis.defaultClassNames
      );
    }
    const featureIsCategorical = ModelMetadata.buildIsCategorical(
      featureNames.length,
      props.testData,
      props.dataSummary.categoricalMap
    );
    const featureRanges =
      ModelMetadata.buildFeatureRanges(
        props.testData,
        featureIsCategorical,
        props.dataSummary.categoricalMap
      ) || [];
    return {
      classNames,
      featureIsCategorical,
      featureNames,
      featureNamesAbridged,
      featureRanges,
      modelType
    };
  }

  private static buildInitialExplanationContext(
    props: IErrorAnalysisDashboardProps
  ): IErrorAnalysisDashboardState {
    const modelMetadata = ErrorAnalysisDashboard.buildModelMetadata(props);

    let localExplanations:
      | IMultiClassLocalFeatureImportance
      | ISingleClassLocalFeatureImportance
      | undefined = undefined;
    if (
      props &&
      props.precomputedExplanations &&
      props.precomputedExplanations.localFeatureImportance &&
      props.precomputedExplanations.localFeatureImportance.scores
    ) {
      localExplanations = props.precomputedExplanations.localFeatureImportance;
    }
    const jointDataset = new JointDataset({
      dataset: props.testData,
      localExplanations,
      metadata: modelMetadata,
      predictedProbabilities: props.probabilityY,
      predictedY: props.predictedY,
      trueY: props.trueY
    });
    const globalProps = buildGlobalProperties(props.precomputedExplanations);
    // consider taking filters in as param arg for programmatic users
    let metricStats: MetricCohortStats | undefined = undefined;
    if (props.rootStats) {
      metricStats = new MetricCohortStats(
        props.rootStats.totalSize,
        props.rootStats.totalSize,
        props.rootStats.metricValue,
        props.rootStats.metricName,
        props.rootStats.errorCoverage
      );
    }
    const cohorts = [
      new ErrorCohort(
        new Cohort(
          localization.ErrorAnalysis.Cohort.defaultLabel,
          jointDataset,
          []
        ),
        jointDataset,
        0,
        CohortSource.None,
        false,
        metricStats
      )
    ];
    const weightVectorLabels = {
      [WeightVectors.AbsAvg]: localization.Interpret.absoluteAverage
    };
    const weightVectorOptions = [];
    if (modelMetadata.modelType === ModelTypes.Multiclass) {
      weightVectorOptions.push(WeightVectors.AbsAvg);
    }
    modelMetadata.classNames.forEach((name, index) => {
      weightVectorLabels[index] = localization.formatString(
        localization.Interpret.WhatIfTab.classLabel,
        name
      );
      weightVectorOptions.push(index);
    });
    let selectedFeatures = props.features;
    if (props.requestDebugML === undefined) {
      selectedFeatures = props.staticDebugML.features;
    }
    return {
      activeGlobalTab: GlobalTabKeys.DataExplorerTab,
      baseCohort: cohorts[0],
      cohorts,
      customPoints: [],
      dataChartConfig: undefined,
      dependenceProps: undefined,
      editedCohort: cohorts[0],
      errorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      globalImportance: globalProps.globalImportance,
      globalImportanceIntercept: globalProps.globalImportanceIntercept,
      importances: [],
      isGlobalImportanceDerivedFromLocal:
        globalProps.isGlobalImportanceDerivedFromLocal,
      jointDataset,
      mapShiftErrorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      matrixAreaState: createInitialMatrixAreaState(),
      matrixFilterState: createInitialMatrixFilterState(),
      modelChartConfig: undefined,
      modelMetadata,
      openCohortListPanel: false,
      openEditCohort: false,
      openFeatureList: false,
      openInfoPanel: false,
      openMapShift: false,
      openSaveCohort: false,
      openShiftCohort: false,
      openWhatIf: false,
      predictionTab: PredictionTabKeys.CorrectPredictionTab,
      selectedCohort: cohorts[0],
      selectedFeatures,
      selectedWeightVector:
        modelMetadata.modelType === ModelTypes.Multiclass
          ? WeightVectors.AbsAvg
          : 0,
      selectedWhatIfIndex: undefined,
      treeViewState: createInitialTreeViewState(),
      viewType: ViewTypeKeys.ErrorAnalysisView,
      weightVectorLabels,
      weightVectorOptions,
      whatIfChartConfig: undefined
    };
  }

  public render(): React.ReactNode {
    const cohortIDs = this.state.cohorts.map((errorCohort) =>
      errorCohort.cohort.getCohortID().toString()
    );
    const classNames = ErrorAnalysisDashboardStyles();
    return (
      <ModelAssessmentContext.Provider
        value={{
          baseErrorCohort: this.state.baseCohort,
          dataset: {} as IDataset,
          errorCohorts: this.state.cohorts,
          jointDataset: this.state.jointDataset,
          modelExplanationData: {
            precomputedExplanations: this.props.precomputedExplanations
          } as IModelExplanationData,
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
        <div className={classNames.page}>
          <Navigation
            updateViewState={this.updateViewState.bind(this)}
            updatePredictionTabState={this.updatePredictionTabState.bind(this)}
            viewType={this.state.viewType}
            activeGlobalTab={this.state.activeGlobalTab}
            activePredictionTab={this.state.predictionTab}
          />
          <MainMenu
            viewExplanation={this.viewExplanation.bind(this)}
            onInfoPanelClick={(): void =>
              this.setState({ openInfoPanel: true })
            }
            onCohortListPanelClick={(): void =>
              this.setState({ openCohortListPanel: true })
            }
            onFeatureListClick={(): void =>
              this.setState({ openFeatureList: true })
            }
            onSaveCohortClick={(): void =>
              this.setState({ openSaveCohort: true })
            }
            onShiftCohortClick={(): void =>
              this.setState({ openShiftCohort: true })
            }
            onWhatIfClick={(): void => this.setState({ openWhatIf: true })}
            localUrl={this.props.localUrl}
            viewType={this.state.viewType}
            setErrorDetector={(key: ErrorAnalysisOptions): void => {
              if (this.state.selectedCohort.isTemporary) {
                this.setState({
                  mapShiftErrorAnalysisOption: key,
                  openFeatureList: false,
                  openMapShift: true
                });
              } else {
                this.setState({
                  errorAnalysisOption: key,
                  openFeatureList: false
                });
              }
            }}
            errorAnalysisOption={this.state.errorAnalysisOption}
            temporaryCohort={this.state.selectedCohort}
            activeGlobalTab={this.state.activeGlobalTab}
            activePredictionTab={this.state.predictionTab}
            isEnabled={this.props.requestDebugML !== undefined}
          />
          {this.state.openSaveCohort && (
            <SaveCohort
              isOpen={this.state.openSaveCohort}
              onDismiss={(): void => this.setState({ openSaveCohort: false })}
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
                  cohorts: [...cohorts, editedCohort],
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
              errorCohort={this.state.editedCohort}
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
                  cohorts: [...cohorts, selectedCohort],
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
                {this.state.viewType === ViewTypeKeys.ErrorAnalysisView && (
                  <ErrorAnalysisView
                    messages={
                      this.props.stringParams
                        ? this.props.stringParams.contextualHelp
                        : undefined
                    }
                    getTreeNodes={this.props.requestDebugML}
                    getMatrix={this.props.requestMatrix}
                    staticTreeNodes={this.props.staticDebugML}
                    staticMatrix={this.props.staticMatrix}
                    updateSelectedCohort={this.updateSelectedCohort.bind(this)}
                    features={this.props.features}
                    selectedFeatures={this.state.selectedFeatures}
                    errorAnalysisOption={this.state.errorAnalysisOption}
                    selectedCohort={this.state.selectedCohort}
                    baseCohort={this.state.baseCohort}
                    treeViewState={this.state.treeViewState}
                    setTreeViewState={this.setTreeViewState}
                    matrixAreaState={this.state.matrixAreaState}
                    matrixFilterState={this.state.matrixFilterState}
                    setMatrixAreaState={this.setMatrixAreaState}
                    setMatrixFilterState={this.setMatrixFilterState}
                    showCohortName
                  />
                )}
                {this.state.viewType === ViewTypeKeys.ExplanationView && (
                  <div
                    className={ErrorAnalysisDashboard.classNames.pivotWrapper}
                  >
                    <Pivot
                      selectedKey={this.state.activeGlobalTab}
                      onLinkClick={this.handleGlobalTabClick}
                      linkSize={PivotLinkSize.normal}
                      headersOnly
                      styles={{ root: classNames.pivotLabelWrapper }}
                    >
                      {this.pivotItems.map((props) => (
                        <PivotItem key={props.itemKey} {...props} />
                      ))}
                    </Pivot>
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.DataExplorerTab && (
                      <DatasetExplorerTab showCohortSelection={false} />
                    )}
                    {this.state.activeGlobalTab ===
                      GlobalTabKeys.GlobalExplanationTab && (
                      <GlobalExplanationTab
                        cohorts={this.state.cohorts.map(
                          (errorCohort) => errorCohort.cohort
                        )}
                        cohortIDs={cohortIDs}
                        selectedWeightVector={this.state.selectedWeightVector}
                        weightOptions={this.state.weightVectorOptions}
                        weightLabels={this.state.weightVectorLabels}
                        onWeightChange={this.onWeightVectorChange}
                        explanationMethod={this.props.explanationMethod}
                        initialCohortIndex={this.state.cohorts.findIndex(
                          (errorCohort) =>
                            errorCohort.cohort.name ===
                            this.state.selectedCohort.cohort.name
                        )}
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
                        features={this.props.features}
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
                        setWhatIfDatapoint={this.setWhatIfDatapoint}
                      />
                    )}
                  </div>
                )}
                <CohortInfoPanel
                  isOpen={this.state.openInfoPanel}
                  currentCohort={this.state.selectedCohort}
                  onDismiss={(): void =>
                    this.setState({ openInfoPanel: false })
                  }
                  onSaveCohortClick={(): void =>
                    this.setState({ openSaveCohort: true })
                  }
                />
                <FeatureList
                  isOpen={this.state.openFeatureList}
                  onDismiss={(): void =>
                    this.setState({ openFeatureList: false })
                  }
                  saveFeatures={(features: string[]): void =>
                    this.setState({ selectedFeatures: features })
                  }
                  features={this.props.features}
                  importances={this.state.importances}
                  isEnabled={this.props.requestDebugML !== undefined}
                  selectedFeatures={this.state.selectedFeatures}
                />
                <CohortListPanel
                  isOpen={this.state.openCohortListPanel}
                  cohorts={this.state.cohorts}
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
                  addCustomPoint={this.addCustomPoint}
                  selectedIndex={this.state.selectedWhatIfIndex}
                />
              </Layer>
            </Customizer>
            <LayerHost
              id={this.layerHostId}
              style={{
                height: "1100px",
                overflow: "hidden",
                position: "relative"
              }}
            />
          </div>
        </div>
      </ModelAssessmentContext.Provider>
    );
  }
  private setTreeViewState = (treeViewState: ITreeViewRendererState): void => {
    if (this.state.selectedCohort !== this.state.baseCohort) {
      this.setState({ treeViewState });
    }
  };
  private setMatrixAreaState = (matrixAreaState: IMatrixAreaState): void => {
    if (this.state.selectedCohort !== this.state.baseCohort) {
      this.setState({ matrixAreaState });
    }
  };
  private setMatrixFilterState = (
    matrixFilterState: IMatrixFilterState
  ): void => {
    if (this.state.selectedCohort !== this.state.baseCohort) {
      this.setState({ matrixFilterState });
    }
  };
  private setWhatIfDatapoint = (index: number): void =>
    this.setState({ selectedWhatIfIndex: index });

  private addCustomPoint = (temporaryPoint: { [key: string]: any }): void => {
    this.setState({
      customPoints: [...this.state.customPoints, temporaryPoint],
      openWhatIf: false,
      predictionTab: PredictionTabKeys.WhatIfDatapointsTab
    });
  };

  private updateSelectedCohort(
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource = CohortSource.None,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ): void {
    // Need to relabel the filter names based on index in joint dataset
    const filtersRelabeled = ErrorCohort.getDataFilters(
      filters,
      this.props.features
    );

    let selectedCohortName = "";
    let addTemporaryCohort = true;
    if (source === CohortSource.TreeMap || source === CohortSource.HeatMap) {
      selectedCohortName = "Unsaved";
    } else {
      selectedCohortName = this.state.baseCohort.cohort.name;
      addTemporaryCohort = false;
    }
    const baseCohortFilters = this.state.baseCohort.cohort.filters;
    const baseCohortCompositeFilters = this.state.baseCohort.cohort
      .compositeFilters;
    const selectedCohort: ErrorCohort = new ErrorCohort(
      new Cohort(
        selectedCohortName,
        this.state.jointDataset,
        baseCohortFilters.concat(filtersRelabeled),
        baseCohortCompositeFilters.concat(compositeFilters)
      ),
      this.state.jointDataset,
      cells,
      source,
      addTemporaryCohort,
      cohortStats
    );
    let cohorts = this.state.cohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
    );
    if (addTemporaryCohort) {
      cohorts = [...cohorts, selectedCohort];
    }
    this.setState({
      cohorts,
      selectedCohort
    });
  }

  private handleGlobalTabClick = (item: PivotItem | undefined): void => {
    if (item?.props.itemKey) {
      const itemKey: string = item.props.itemKey;
      const index: GlobalTabKeys = GlobalTabKeys[itemKey];
      const predictionTab = PredictionTabKeys.CorrectPredictionTab;
      this.setState({
        activeGlobalTab: index,
        openWhatIf: false,
        predictionTab
      });
    }
  };

  private viewExplanation(): void {
    this.setState({
      openFeatureList: false,
      viewType: ViewTypeKeys.ExplanationView
    });
  }

  private updateViewState(viewType: ViewTypeKeys): void {
    if (viewType !== ViewTypeKeys.ExplanationView) {
      const predictionTab = PredictionTabKeys.CorrectPredictionTab;
      this.setState({ openWhatIf: false, predictionTab, viewType });
    } else {
      this.setState({ viewType });
    }
  }

  private updatePredictionTabState(predictionTab: PredictionTabKeys): void {
    this.setState({ predictionTab });
  }

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
