// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  isTwoDimArray,
  isThreeDimArray,
  IExplanationModelMetadata,
  JointDataset,
  ModelTypes,
  WeightVectorOption,
  WeightVectors,
  Cohort,
  ICompositeFilter,
  IFilter,
  IOfficeFabricProps,
  IMetricRequest,
  IMetricResponse,
  IDataset,
  IModelExplanationData,
  getDatasetSummary
} from "@responsible-ai/core-ui";
import {
  CohortInfo,
  CohortList,
  CohortStats,
  ErrorAnalysisOptions,
  EditCohort,
  ErrorCohort,
  ErrorDetectorCohortSource,
  ErrorAnalysisView,
  ErrorAnalysisDashboardStyles,
  FeatureList,
  InstanceView,
  MapShift,
  ModelExplanationUtils,
  SaveCohort,
  ShiftCohort,
  WhatIf,
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  IMatrixAreaState,
  IMatrixFilterState,
  ITreeViewRendererState,
  createInitialTreeViewState,
  IStringsParam
} from "@responsible-ai/error-analysis";
import { FairnessWizardV2 } from "@responsible-ai/fairness";
import {
  DatasetExplorerTab,
  GlobalExplanationTab
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";
import _, { Dictionary } from "lodash";
import * as memoize from "memoize-one";
import {
  INavLinkGroup,
  ISettings,
  Layer,
  LayerHost,
  mergeStyleSets,
  Customizer,
  getId,
  Nav,
  INavLink,
  Stack,
  Text,
  getTheme,
  Dropdown,
  IDropdownOption,
  Label,
  ILabelStyles,
  IDropdownStyles,
  CommandBarButton,
  IIconProps,
  IButtonStyles
} from "office-ui-fabric-react";
import * as React from "react";

import { MainMenu } from "./Controls/MainMenu/MainMenu";
import { GlobalTabKeys, PredictionTabKeys } from "./ModelAssessmentEnums";

export interface IModelAssessmentDashboardProps extends IOfficeFabricProps {
  locale?: string;
  stringParams?: IStringsParam;

  dataset: IDataset;
  modelExplanationData: IModelExplanationData;

  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestLocalFeatureExplanations?: (
    request: any[],
    abortSignal: AbortSignal,
    explanationAlgorithm?: string
  ) => Promise<any[]>;
  requestDebugML?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  requestMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  requestImportances?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestMetrics?: (
    request: IMetricRequest,
    abortSignal?: AbortSignal
  ) => Promise<IMetricResponse>;
  localUrl: string;

  // TODO figure out how to persist starting tab for fairness
  startingTabIndex?: number;

  supportedBinaryClassificationPerformanceKeys: string[];
  supportedRegressionPerformanceKeys: string[];
  supportedProbabilityPerformanceKeys: string[];
}

export interface IModelAssessmentDashboardState {
  activeGlobalTab: GlobalTabKeys;
  cohorts: ErrorCohort[];
  customPoints: Array<{ [key: string]: any }>;
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

export class ModelAssessmentDashboard extends React.PureComponent<
  IModelAssessmentDashboardProps,
  IModelAssessmentDashboardState
> {
  private static readonly classNames = mergeStyleSets({
    navWrapper: {
      display: "contents",
      width: "calc(100% - 300px)"
    }
  });

  private static getClassLength: (
    props: IModelAssessmentDashboardProps
  ) => number = (memoize as any).default(
    (props: IModelAssessmentDashboardProps): number => {
      if (
        props.modelExplanationData.precomputedExplanations &&
        props.modelExplanationData.precomputedExplanations
          .localFeatureImportance &&
        props.modelExplanationData.precomputedExplanations
          .localFeatureImportance.scores
      ) {
        const localImportances =
          props.modelExplanationData.precomputedExplanations
            .localFeatureImportance.scores;
        if (isThreeDimArray(localImportances)) {
          return localImportances.length;
        }
        // 2d is regression (could be a non-scikit convention binary, but that is not supported)
        return 1;
      }
      if (
        props.modelExplanationData.precomputedExplanations &&
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance &&
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance.scores
      ) {
        // determine if passed in values is 1D or 2D
        if (
          isTwoDimArray(
            props.modelExplanationData.precomputedExplanations
              .globalFeatureImportance.scores
          )
        ) {
          return (props.modelExplanationData.precomputedExplanations
            .globalFeatureImportance.scores as number[][]).length;
        }
      }
      if (
        props.modelExplanationData.probabilityY &&
        Array.isArray(props.modelExplanationData.probabilityY) &&
        Array.isArray(props.modelExplanationData.probabilityY[0]) &&
        props.modelExplanationData.probabilityY[0].length > 0
      ) {
        return props.modelExplanationData.probabilityY[0].length;
      }
      // default to regression case
      return 1;
    }
  );

  private navLinkGroups: INavLinkGroup[] = [];
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
    this.state = ModelAssessmentDashboard.buildInitialExplanationContext(
      _.cloneDeep(props)
    );

    this.navLinkGroups.push({
      // TODO move to localization
      links: [
        // TODO add model statistics
        // {
        //   name: "Model statistics",
        //   url: "",
        //   key: "causal",
        //   target: "_blank",
        //   onClick: this.handleGlobalTabClick
        // },
        {
          key: GlobalTabKeys.DataExplorerTab,
          name: localization.ErrorAnalysis.dataExplorerView,
          onClick: this.handleGlobalTabClick.bind(this),
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.ErrorAnalysisTab,
          name: localization.ErrorAnalysis.Navigation.errorExplorer,
          onClick: this.handleGlobalTabClick.bind(this),
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.FairnessTab,
          name: localization.Fairness.Header.title,
          onClick: this.handleGlobalTabClick.bind(this),
          target: "_blank",
          url: ""
        }
      ],
      name: "Identify"
    });
    this.navLinkGroups.push({
      links: [
        {
          key: GlobalTabKeys.GlobalExplanationTab,
          name: localization.ErrorAnalysis.globalExplanationView,
          onClick: this.handleGlobalTabClick.bind(this),
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.LocalExplanationTab,
          name: localization.ErrorAnalysis.localExplanationView,
          onClick: this.handleGlobalTabClick.bind(this),
          target: "_blank",
          url: ""
        }
      ],
      name: "Diagnose"
    });
    // TODO: add causal analysis
    // this.navLinkGroups.push({
    //   name: "Actionable Insights",
    //   links: [
    //     {
    //       name: "Causal analysis",
    //       url: "",
    //       key: "causal",
    //       target: "_blank",
    //       onClick: this.handleGlobalTabClick
    //     }
    //   ]
    // });

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
    props: IModelAssessmentDashboardProps
  ): IExplanationModelMetadata {
    const modelType = ModelAssessmentDashboard.getModelType(props);
    let featureNames = props.dataset.featureNames;
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
      if (props.dataset.features && props.dataset.features[0] !== undefined) {
        featureLength = props.dataset.features[0].length;
      } else if (
        props.modelExplanationData.precomputedExplanations &&
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance
      ) {
        featureLength =
          props.modelExplanationData.precomputedExplanations
            .globalFeatureImportance.scores.length;
      } else if (
        props.modelExplanationData.precomputedExplanations &&
        props.modelExplanationData.precomputedExplanations
          .localFeatureImportance
      ) {
        const localImportances =
          props.modelExplanationData.precomputedExplanations
            .localFeatureImportance.scores;
        if (isThreeDimArray(localImportances)) {
          featureLength = (props.modelExplanationData.precomputedExplanations
            .localFeatureImportance.scores[0][0] as number[]).length;
        } else {
          featureLength = (props.modelExplanationData.precomputedExplanations
            .localFeatureImportance.scores[0] as number[]).length;
        }
      } else if (
        props.modelExplanationData.precomputedExplanations &&
        props.modelExplanationData.precomputedExplanations.ebmGlobalExplanation
      ) {
        featureLength =
          props.modelExplanationData.precomputedExplanations
            .ebmGlobalExplanation.feature_list.length;
      }
      featureNames = ModelAssessmentDashboard.buildIndexedNames(
        featureLength,
        localization.ErrorAnalysis.defaultFeatureNames
      );
      featureNamesAbridged = featureNames;
    }
    let classNames = props.dataset.classNames;
    const classLength = ModelAssessmentDashboard.getClassLength(props);
    if (!classNames || classNames.length !== classLength) {
      classNames = ModelAssessmentDashboard.buildIndexedNames(
        classLength,
        localization.ErrorAnalysis.defaultClassNames
      );
    }
    const featureIsCategorical = ModelMetadata.buildIsCategorical(
      featureNames.length,
      props.dataset.features,
      props.dataset.categoricalMap
    );
    const featureRanges =
      ModelMetadata.buildFeatureRanges(
        props.dataset.features,
        featureIsCategorical,
        props.dataset.categoricalMap
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

  private static getModelType(
    props: IModelAssessmentDashboardProps
  ): ModelTypes {
    // If python gave us a hint, use it
    if (props.modelExplanationData.method === "regressor") {
      return ModelTypes.Regression;
    }
    switch (ModelAssessmentDashboard.getClassLength(props)) {
      case 1:
        return ModelTypes.Regression;
      case 2:
        return ModelTypes.Binary;
      default:
        return ModelTypes.Multiclass;
    }
  }

  private static buildGlobalProperties(
    props: IModelAssessmentDashboardProps
  ): IGlobalExplanationProps {
    const result: IGlobalExplanationProps = {} as IGlobalExplanationProps;
    if (
      props.modelExplanationData.precomputedExplanations &&
      props.modelExplanationData.precomputedExplanations
        .globalFeatureImportance &&
      props.modelExplanationData.precomputedExplanations.globalFeatureImportance
        .scores
    ) {
      result.isGlobalImportanceDerivedFromLocal = false;
      if (
        isTwoDimArray(
          props.modelExplanationData.precomputedExplanations
            .globalFeatureImportance.scores
        )
      ) {
        result.globalImportance = props.modelExplanationData
          .precomputedExplanations.globalFeatureImportance.scores as number[][];
        result.globalImportanceIntercept = props.modelExplanationData
          .precomputedExplanations.globalFeatureImportance
          .intercept as number[];
      } else {
        result.globalImportance = (props.modelExplanationData
          .precomputedExplanations.globalFeatureImportance
          .scores as number[]).map((value) => [value]);
        result.globalImportanceIntercept = [
          props.modelExplanationData.precomputedExplanations
            .globalFeatureImportance.intercept as number
        ];
      }
    }
    return result;
  }

  private static buildInitialExplanationContext(
    props: IModelAssessmentDashboardProps
  ): IModelAssessmentDashboardState {
    const modelMetadata = ModelAssessmentDashboard.buildModelMetadata(props);

    let localExplanations:
      | IMultiClassLocalFeatureImportance
      | ISingleClassLocalFeatureImportance
      | undefined = undefined;
    if (
      props &&
      props.modelExplanationData.precomputedExplanations &&
      props.modelExplanationData.precomputedExplanations
        .localFeatureImportance &&
      props.modelExplanationData.precomputedExplanations.localFeatureImportance
        .scores
    ) {
      localExplanations =
        props.modelExplanationData.precomputedExplanations
          .localFeatureImportance;
    }
    const jointDataset = new JointDataset({
      dataset: props.dataset.features,
      localExplanations,
      metadata: modelMetadata,
      predictedProbabilities: props.modelExplanationData.probabilityY,
      predictedY: props.modelExplanationData.predictedY,
      trueY: props.dataset.trueY
    });
    const globalProps = ModelAssessmentDashboard.buildGlobalProperties(props);
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
      selectedFeatures: props.dataset.featureNames,
      selectedWeightVector:
        modelMetadata.modelType === ModelTypes.Multiclass
          ? WeightVectors.AbsAvg
          : 0,
      selectedWhatIfIndex: undefined,
      sortVector: undefined,
      treeViewState: createInitialTreeViewState(),
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

    const labelStyle: ILabelStyles = {
      root: { alignSelf: "center", padding: "0px 10px 0px 0px" }
    };
    const dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: {
        width: 100
      },
      root: {
        alignSelf: "center"
      },
      title: {
        borderLeft: "0px solid black",
        borderRight: "0px solid black",
        borderTop: "0px solid black"
      }
    };
    const buttonStyle: IButtonStyles = {
      root: { padding: "0px 4px" }
    };
    const featureListIcon: IIconProps = { iconName: "BulletedListMirrored" };

    const errorAnalysisOptionsDropdown: IDropdownOption[] = [
      {
        key: ErrorAnalysisOptions.TreeMap,
        text: localization.ErrorAnalysis.MainMenu.treeMap
      },
      {
        key: ErrorAnalysisOptions.HeatMap,
        text: localization.ErrorAnalysis.MainMenu.heatMap
      }
    ];

    return (
      <div className={classNames.page}>
        <MainMenu
          onInfoPanelClick={(): void => this.setState({ openInfoPanel: true })}
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
                cohorts: [selectedCohort, ...cohorts],
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
              <Stack horizontal={true}>
                <Nav
                  selectedKey={this.state.activeGlobalTab}
                  onLinkClick={this.handleGlobalTabClick.bind(this)}
                  styles={{ root: { width: 300 } }}
                  groups={this.navLinkGroups}
                  onRenderGroupHeader={onRenderGroupHeader}
                  onRenderLink={onRenderLink}
                />
                <div className={ModelAssessmentDashboard.classNames.navWrapper}>
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.ErrorAnalysisTab && (
                    <Stack grow={true}>
                      <Stack
                        horizontal={true}
                        tokens={{ childrenGap: "10px", padding: "16px 24px" }}
                      >
                        <Stack horizontal={true}>
                          <Label styles={labelStyle}>
                            {
                              localization.ErrorAnalysis.MainMenu
                                .errorExplorerLabel
                            }
                          </Label>
                          <Dropdown
                            selectedKey={this.state.errorAnalysisOption}
                            options={errorAnalysisOptionsDropdown}
                            styles={dropdownStyles}
                            onChange={this.handleErrorDetectorChanged}
                          />
                        </Stack>
                        {this.state.errorAnalysisOption ===
                          ErrorAnalysisOptions.TreeMap && (
                          <CommandBarButton
                            styles={buttonStyle}
                            iconProps={featureListIcon}
                            key={"featureList"}
                            onClick={(): void =>
                              this.setState({ openFeatureList: true })
                            }
                            text={
                              localization.ErrorAnalysis.MainMenu.featureList
                            }
                          />
                        )}
                      </Stack>
                      <ErrorAnalysisView
                        theme={this.props.theme!}
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
                      />
                    </Stack>
                  )}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.DataExplorerTab && (
                    <DatasetExplorerTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      cohorts={this.state.cohorts.map(
                        (errorCohort) => errorCohort.cohort
                      )}
                    />
                  )}
                  {this.state.activeGlobalTab ===
                    GlobalTabKeys.GlobalExplanationTab && (
                    <GlobalExplanationTab
                      jointDataset={this.state.jointDataset}
                      metadata={this.state.modelMetadata}
                      cohorts={this.state.cohorts.map(
                        (errorCohort) => errorCohort.cohort
                      )}
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
                      theme={this.props.theme}
                      messages={
                        this.props.stringParams
                          ? this.props.stringParams.contextualHelp
                          : undefined
                      }
                      jointDataset={this.state.jointDataset}
                      features={this.props.dataset.featureNames}
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
                  {this.state.activeGlobalTab === GlobalTabKeys.FairnessTab && (
                    <FairnessWizardV2
                      predictedY={[this.props.modelExplanationData.predictedY!]}
                      trueY={this.props.dataset.trueY}
                      dataSummary={getDatasetSummary(this.props.dataset, true)}
                      supportedBinaryClassificationPerformanceKeys={
                        this.props.supportedBinaryClassificationPerformanceKeys
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
                features={this.props.dataset.featureNames}
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
              position: "relative",
              width: "100%"
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
      this.props.dataset.featureNames
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
      cohorts = [selectedCohort, ...cohorts];
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
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      if (item.key === ErrorAnalysisOptions.HeatMap) {
        // Note comparison above is actually string comparison (key is string), we have to set the enum
        const selectedOptionHeatMap = ErrorAnalysisOptions.HeatMap;
        this.setErrorDetector(selectedOptionHeatMap);
      } else {
        // Note comparison above is actually string comparison (key is string), we have to set the enum
        const selectedOptionTreeMap = ErrorAnalysisOptions.TreeMap;
        this.setErrorDetector(selectedOptionTreeMap);
      }
    }
  };

  private setErrorDetector = (key: ErrorAnalysisOptions): void => {
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
  };
}

function onRenderGroupHeader(group?: INavLinkGroup) {
  return (
    <h6 style={{ paddingLeft: "20px" }}>
      {group ? group.name?.toUpperCase() : ""}
    </h6>
  );
}

function onRenderLink(link?: INavLink) {
  const theme = getTheme();
  return (
    <Text
      variant={"mediumPlus"}
      style={{ color: theme.semanticColors.bodyText }}
    >
      {link ? link.name : ""}
    </Text>
  );
}
