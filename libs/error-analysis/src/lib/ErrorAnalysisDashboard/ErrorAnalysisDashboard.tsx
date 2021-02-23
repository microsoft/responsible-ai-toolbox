// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  ICompositeFilter,
  IFilter,
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  isTwoDimArray,
  isThreeDimArray,
  JointDataset,
  IExplanationModelMetadata,
  ModelTypes,
  WeightVectorOption,
  WeightVectors
} from "@responsible-ai/core-ui";
import {
  DatasetExplorerTab,
  GlobalExplanationTab
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";
import _, { Dictionary } from "lodash";
import * as memoize from "memoize-one";
import {
  IPivotItemProps,
  ISettings,
  Layer,
  LayerHost,
  PivotItem,
  Pivot,
  PivotLinkSize,
  mergeStyleSets,
  Customizer,
  getId
} from "office-ui-fabric-react";
import React from "react";

import { CohortStats } from "./CohortStats";
import { CohortInfo } from "./Controls/CohortInfo/CohortInfo";
import { CohortList } from "./Controls/CohortList/CohortList";
import { EditCohort } from "./Controls/EditCohort/EditCohort";
import { ErrorAnalysisView } from "./Controls/ErrorAnalysisView/ErrorAnalysisView";
import { FeatureList } from "./Controls/FeatureList/FeatureList";
import { InstanceView } from "./Controls/InstanceView/InstanceView";
import { MainMenu } from "./Controls/MainMenu/MainMenu";
import { MapShift } from "./Controls/MapShift/MapShift";
import { Navigation } from "./Controls/Navigation/Navigation";
import { SaveCohort } from "./Controls/SaveCohort/SaveCohort";
import { ShiftCohort } from "./Controls/ShiftCohort/ShiftCohort";
import { WhatIf } from "./Controls/WhatIf/WhatIf";
import { ErrorAnalysisDashboardStyles } from "./ErrorAnalysisDashboard.styles";
import {
  ErrorAnalysisOptions,
  GlobalTabKeys,
  PredictionTabKeys,
  ViewTypeKeys
} from "./ErrorAnalysisEnums";
import { ErrorCohort, ErrorDetectorCohortSource } from "./ErrorCohort";
import { IErrorAnalysisDashboardProps } from "./Interfaces/IErrorAnalysisDashboardProps";
import {
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  IMatrixAreaState,
  IMatrixFilterState
} from "./MatrixFilterState";
import { ModelExplanationUtils } from "./ModelExplanationUtils";
import {
  ITreeViewRendererState,
  createInitialTreeViewState
} from "./TreeViewState";

export interface IErrorAnalysisDashboardState {
  activeGlobalTab: GlobalTabKeys;
  cohorts: ErrorCohort[];
  customPoints: Array<{ [key: string]: any }>;
  viewType: ViewTypeKeys;
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  modelChartConfig?: IGenericChartProps;
  dataChartConfig?: IGenericChartProps;
  whatIfChartConfig?: IGenericChartProps;
  dependenceProps?: IGenericChartProps;
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  importances: number[];
  isGlobalImportanceDerivedFromLocal: boolean;
  sortVector?: number[];
  editingCohortIndex?: number;
  mapShiftErrorAnalysisOption: ErrorAnalysisOptions;
  openInfoPanel: boolean;
  openCohortListPanel: boolean;
  openEditCohort: boolean;
  openFeatureList: boolean;
  openMapShift: boolean;
  openSaveCohort: boolean;
  openShiftCohort: boolean;
  openWhatIf: boolean;
  predictionTab: PredictionTabKeys;
  selectedCohort: ErrorCohort;
  selectedWhatIfIndex: number | undefined;
  editedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  selectedFeatures: string[];
  treeViewState: ITreeViewRendererState;
  matrixAreaState: IMatrixAreaState;
  matrixFilterState: IMatrixFilterState;
  errorAnalysisOption: ErrorAnalysisOptions;
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
}

interface IGlobalExplanationProps {
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  isGlobalImportanceDerivedFromLocal: boolean;
}

export enum ChartTypes {
  Scatter = "scatter",
  Bar = "histogram",
  Box = "box"
}

export interface IGenericChartProps {
  chartType: ChartTypes;
  xAxis?: ISelectorConfig;
  yAxis?: ISelectorConfig;
  colorAxis?: ISelectorConfig;
  selectedCohortIndex?: number;
}

export interface ISelectorConfig {
  property: string;
  index?: number;
  options: {
    dither?: boolean;
    // this is only used in the ambiguous case of numeric values on color axis for scatter chart, when binned or unbinned are valid
    bin?: boolean;
  };
}

export class ErrorAnalysisDashboard extends React.PureComponent<
  IErrorAnalysisDashboardProps,
  IErrorAnalysisDashboardState
> {
  private static readonly classNames = mergeStyleSets({
    pivotWrapper: {
      display: "contents"
    }
  });

  private static getClassLength: (
    props: IErrorAnalysisDashboardProps
  ) => number = (memoize as any).default(
    (props: IErrorAnalysisDashboardProps): number => {
      if (
        props.precomputedExplanations &&
        props.precomputedExplanations.localFeatureImportance &&
        props.precomputedExplanations.localFeatureImportance.scores
      ) {
        const localImportances =
          props.precomputedExplanations.localFeatureImportance.scores;
        if (isThreeDimArray(localImportances)) {
          return localImportances.length;
        }
        // 2d is regression (could be a non-scikit convention binary, but that is not supported)
        return 1;
      }
      if (
        props.precomputedExplanations &&
        props.precomputedExplanations.globalFeatureImportance &&
        props.precomputedExplanations.globalFeatureImportance.scores
      ) {
        // determine if passed in vaules is 1D or 2D
        if (
          isTwoDimArray(
            props.precomputedExplanations.globalFeatureImportance.scores
          )
        ) {
          return (props.precomputedExplanations.globalFeatureImportance
            .scores as number[][]).length;
        }
      }
      if (
        props.probabilityY &&
        Array.isArray(props.probabilityY) &&
        Array.isArray(props.probabilityY[0]) &&
        props.probabilityY[0].length > 0
      ) {
        return props.probabilityY[0].length;
      }
      // default to regression case
      return 1;
    }
  );

  private pivotItems: IPivotItemProps[] = [];
  private layerHostId: string;

  public constructor(props: IErrorAnalysisDashboardProps) {
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
    const modelType = ErrorAnalysisDashboard.getModelType(props);
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
      featureNames = ErrorAnalysisDashboard.buildIndexedNames(
        featureLength,
        localization.ErrorAnalysis.defaultFeatureNames
      );
      featureNamesAbridged = featureNames;
    }
    let classNames = props.dataSummary.classNames;
    const classLength = ErrorAnalysisDashboard.getClassLength(props);
    if (!classNames || classNames.length !== classLength) {
      classNames = ErrorAnalysisDashboard.buildIndexedNames(
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

  private static buildIndexedNames(
    length: number,
    baseString: string
  ): string[] {
    return [...new Array(length).keys()].map(
      (i) => localization.formatString(baseString, i.toString()) as string
    );
  }

  private static getModelType(props: IErrorAnalysisDashboardProps): ModelTypes {
    // If python gave us a hint, use it
    if (props.modelInformation.method === "regressor") {
      return ModelTypes.Regression;
    }
    switch (ErrorAnalysisDashboard.getClassLength(props)) {
      case 1:
        return ModelTypes.Regression;
      case 2:
        return ModelTypes.Binary;
      default:
        return ModelTypes.Multiclass;
    }
  }

  private static buildGlobalProperties(
    props: IErrorAnalysisDashboardProps
  ): IGlobalExplanationProps {
    const result: IGlobalExplanationProps = {} as IGlobalExplanationProps;
    if (
      props.precomputedExplanations &&
      props.precomputedExplanations.globalFeatureImportance &&
      props.precomputedExplanations.globalFeatureImportance.scores
    ) {
      result.isGlobalImportanceDerivedFromLocal = false;
      if (
        isTwoDimArray(
          props.precomputedExplanations.globalFeatureImportance.scores
        )
      ) {
        result.globalImportance = props.precomputedExplanations
          .globalFeatureImportance.scores as number[][];
        result.globalImportanceIntercept = props.precomputedExplanations
          .globalFeatureImportance.intercept as number[];
      } else {
        result.globalImportance = (props.precomputedExplanations
          .globalFeatureImportance.scores as number[]).map((value) => [value]);
        result.globalImportanceIntercept = [
          props.precomputedExplanations.globalFeatureImportance
            .intercept as number
        ];
      }
    }
    return result;
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
    const globalProps = ErrorAnalysisDashboard.buildGlobalProperties(props);
    // consider taking filters in as param arg for programmatic users
    const cohorts = [
      new ErrorCohort(
        new Cohort(
          localization.ErrorAnalysis.Cohort.defaultLabel,
          jointDataset,
          []
        ),
        jointDataset
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
      selectedFeatures: props.features,
      selectedWeightVector:
        modelMetadata.modelType === ModelTypes.Multiclass
          ? WeightVectors.AbsAvg
          : 0,
      selectedWhatIfIndex: undefined,
      sortVector: undefined,
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
          onInfoPanelClick={(): void => this.setState({ openInfoPanel: true })}
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
            jointDataset={this.state.jointDataset}
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
            cohort={this.state.editedCohort}
            selectedCohort={this.state.selectedCohort}
            jointDataset={this.state.jointDataset}
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
            cohorts={this.state.cohorts.filter((cohort) => !cohort.isTemporary)}
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
                  theme={this.props.theme!}
                  messages={
                    this.props.stringParams
                      ? this.props.stringParams.contextualHelp
                      : undefined
                  }
                  getTreeNodes={this.props.requestDebugML}
                  getMatrix={this.props.requestMatrix}
                  updateSelectedCohort={this.updateSelectedCohort.bind(this)}
                  features={this.props.features}
                  selectedFeatures={this.state.selectedFeatures}
                  errorAnalysisOption={this.state.errorAnalysisOption}
                  selectedCohort={this.state.selectedCohort}
                  baseCohort={this.state.baseCohort}
                  treeViewState={this.state.treeViewState}
                  setTreeViewState={(treeViewState: ITreeViewRendererState) => {
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
                />
              )}
              {this.state.viewType === ViewTypeKeys.ExplanationView && (
                <div className={ErrorAnalysisDashboard.classNames.pivotWrapper}>
                  <Pivot
                    selectedKey={this.state.activeGlobalTab}
                    onLinkClick={this.handleGlobalTabClick.bind(this)}
                    linkSize={PivotLinkSize.normal}
                    headersOnly={true}
                    styles={{ root: classNames.pivotLabelWrapper }}
                  >
                    {this.pivotItems.map((props) => (
                      <PivotItem key={props.itemKey} {...props} />
                    ))}
                  </Pivot>
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.DataExplorerTab && (
                    <DatasetExplorerTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      cohorts={this.state.cohorts.map(
                        (errorCohort) => errorCohort.cohort
                      )}
                      initialCohortIndex={this.state.cohorts.findIndex(
                        (errorCohort) =>
                          errorCohort.cohort.name ===
                          this.state.selectedCohort.cohort.name
                      )}
                    />
                  )}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.GlobalExplanationTab && (
                    <GlobalExplanationTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      globalImportance={this.state.globalImportance}
                      isGlobalDerivedFromLocal={
                        this.state.isGlobalImportanceDerivedFromLocal
                      }
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
                      theme={this.props.theme}
                      messages={
                        this.props.stringParams
                          ? this.props.stringParams.contextualHelp
                          : undefined
                      }
                      jointDataset={this.state.jointDataset}
                      features={this.props.features}
                      metadata={this.state.modelMetadata}
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
                </div>
              )}
              <CohortInfo
                isOpen={this.state.openInfoPanel}
                currentCohort={this.state.selectedCohort}
                jointDataset={this.state.jointDataset}
                onDismiss={(): void => this.setState({ openInfoPanel: false })}
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
              />
              <CohortList
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
                jointDataset={this.state.jointDataset}
                metadata={this.state.modelMetadata}
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
              position: "relative"
            }}
          />
        </div>
      </div>
    );
  }

  private addCustomPoint(temporaryPoint: { [key: string]: any }): void {
    this.setState({
      customPoints: [...this.state.customPoints, temporaryPoint],
      openWhatIf: false,
      predictionTab: PredictionTabKeys.WhatIfDatapointsTab
    });
  }

  private updateSelectedCohort(
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource = ErrorDetectorCohortSource.None,
    cells: number,
    cohortStats: CohortStats | undefined
  ): void {
    // Need to relabel the filter names based on index in joint dataset
    const filtersRelabeled = ErrorCohort.getDataFilters(
      filters,
      this.props.features
    );

    let selectedCohortName = "";
    let addTemporaryCohort = true;
    if (
      source === ErrorDetectorCohortSource.TreeMap ||
      source === ErrorDetectorCohortSource.HeatMap
    ) {
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
    this.setState({ cohorts, selectedCohort });
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

  private handleGlobalTabClick(item: PivotItem | undefined): void {
    if (item !== undefined) {
      const itemKey: string = item.props.itemKey!;
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
}
