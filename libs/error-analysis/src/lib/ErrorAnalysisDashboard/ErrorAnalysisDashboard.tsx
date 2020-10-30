// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";
import { initializeIcons } from "@uifabric/icons";
import { getId } from "@uifabric/utilities";
import _ from "lodash";
import * as memoize from "memoize-one";
import { IPivotItemProps, IPartialTheme } from "office-ui-fabric-react";
import { Layer, LayerHost } from "office-ui-fabric-react/lib/Layer";
import {
  PivotItem,
  Pivot,
  PivotLinkSize
} from "office-ui-fabric-react/lib/Pivot";
import { mergeStyleSets, loadTheme } from "office-ui-fabric-react/lib/Styling";
import { Customizer } from "office-ui-fabric-react/lib/Utilities";
import React from "react";

import { Cohort } from "./Cohort";
import { CohortInfo } from "./Controls/CohortInfo/CohortInfo";
import { CohortSettings } from "./Controls/CohortSettings/CohortSettings";
import { ErrorAnalysisView } from "./Controls/ErrorAnalysisView/ErrorAnalysisView";
import { FeatureList } from "./Controls/FeatureList/FeatureList";
import { InstanceView } from "./Controls/InstanceView/InstanceView";
import { MainMenu } from "./Controls/MainMenu/MainMenu";
import { Navigation } from "./Controls/Navigation/Navigation";
import { ErrorAnalysisDashboardStyles } from "./ErrorAnalysisDashboard.styles";
import { IExplanationModelMetadata, ModelTypes } from "./IExplanationContext";
import { IErrorAnalysisDashboardProps } from "./Interfaces/IErrorAnalysisDashboardProps";
import { JointDataset } from "./JointDataset";
import { ModelExplanationUtils } from "./ModelExplanationUtils";

export interface IErrorAnalysisDashboardState {
  cohorts: Cohort[];
  activeGlobalTab: GlobalTabKeys;
  viewType: ViewTypeKeys;
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  modelChartConfig?: IGenericChartProps;
  dataChartConfig?: IGenericChartProps;
  whatIfChartConfig?: IGenericChartProps;
  dependenceProps?: IGenericChartProps;
  globalImportanceIntercept: number;
  globalImportance: number[];
  isGlobalImportanceDerivedFromLocal: boolean;
  sortVector?: number[];
  editingCohortIndex?: number;
  openInfoPanel: boolean;
  openSettingsPanel: boolean;
  openFeatureList: boolean;
  selectedFeatures: string[];
  errorAnalysisOption: ErrorAnalysisOptions;
}

interface IGlobalExplanationProps {
  globalImportanceIntercept: number;
  globalImportance: number[];
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

export enum GlobalTabKeys {
  DataExplorerTab = "DataExplorerTab",
  GlobalExplanationTab = "GlobalExplanationTab",
  LocalExplanationTab = "LocalExplanationTab"
}

export enum ViewTypeKeys {
  ErrorAnalysisView = "ErrorAnalysisView",
  ExplanationView = "ExplanationView"
}

export enum ErrorAnalysisOptions {
  TreeMap = "TreeMap",
  HeatMap = "HeatMap"
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
  private static iconsInitialized = false;

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
        if (
          (localImportances as number[][][]).every((dim1) => {
            return dim1.every((dim2) => Array.isArray(dim2));
          })
        ) {
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
          (props.precomputedExplanations.globalFeatureImportance
            .scores as number[][]).every((dim1) => Array.isArray(dim1))
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
    ErrorAnalysisDashboard.initializeIcons(props);
    loadTheme(props.theme as IPartialTheme);
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
        if (
          (localImportances as number[][][]).every((dim1) => {
            return dim1.every((dim2) => Array.isArray(dim2));
          })
        ) {
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
    const featureRanges = ModelMetadata.buildFeatureRanges(
      props.testData,
      featureIsCategorical,
      props.dataSummary.categoricalMap
    );
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

  private static initializeIcons(props: IErrorAnalysisDashboardProps): void {
    if (
      ErrorAnalysisDashboard.iconsInitialized === false &&
      props.shouldInitializeIcons !== false
    ) {
      initializeIcons(props.iconUrl);
      ErrorAnalysisDashboard.iconsInitialized = true;
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
        (props.precomputedExplanations.globalFeatureImportance
          .scores as number[][]).every((dim1) => Array.isArray(dim1))
      ) {
        result.globalImportance = (props.precomputedExplanations
          .globalFeatureImportance.scores as number[][]).map(
          (classArray) => classArray.reduce((a, b) => a + b),
          0
        );
        result.globalImportanceIntercept = (props.precomputedExplanations
          .globalFeatureImportance.intercept as number[]).reduce(
          (a, b) => a + b,
          0
        );
      } else {
        result.globalImportance = props.precomputedExplanations
          .globalFeatureImportance.scores as number[];
        result.globalImportanceIntercept = props.precomputedExplanations
          .globalFeatureImportance.intercept as number;
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
    // consider taking filters in as param arg for programatic users
    const cohorts = [
      new Cohort(
        localization.ErrorAnalysis.Cohort.defaultLabel,
        jointDataset,
        []
      )
    ];
    return {
      activeGlobalTab: GlobalTabKeys.DataExplorerTab,
      cohorts,
      dataChartConfig: undefined,
      dependenceProps: undefined,
      errorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      globalImportance: globalProps.globalImportance,
      globalImportanceIntercept: globalProps.globalImportanceIntercept,
      isGlobalImportanceDerivedFromLocal:
        globalProps.isGlobalImportanceDerivedFromLocal,
      jointDataset,
      modelChartConfig: undefined,
      modelMetadata,
      openFeatureList: false,
      openInfoPanel: false,
      openSettingsPanel: false,
      selectedFeatures: props.features,
      sortVector: undefined,
      viewType: ViewTypeKeys.ErrorAnalysisView,
      whatIfChartConfig: undefined
    };
  }

  public render(): React.ReactNode {
    const classNames = ErrorAnalysisDashboardStyles();
    return (
      <div className={classNames.page} style={{ maxHeight: "1000px" }}>
        <Navigation
          updateViewState={this.updateViewState.bind(this)}
          viewType={this.state.viewType}
        />
        <MainMenu
          viewExplanation={this.viewExplanation.bind(this)}
          onInfoPanelClick={(): void => this.setState({ openInfoPanel: true })}
          onSettingsPanelClick={(): void =>
            this.setState({ openSettingsPanel: true })
          }
          onFeatureListClick={(): void =>
            this.setState({ openFeatureList: true })
          }
          localUrl={this.props.localUrl}
          viewType={this.state.viewType}
          setErrorDetector={(key: ErrorAnalysisOptions): void =>
            this.setState({ errorAnalysisOption: key })
          }
        />
        <div>
          <Customizer settings={{ hostId: this.layerHostId }}>
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
                  features={this.props.features}
                  selectedFeatures={this.state.selectedFeatures}
                  errorAnalysisOption={this.state.errorAnalysisOption}
                />
              )}
              {this.state.viewType === ViewTypeKeys.ExplanationView && (
                <div
                  className={ErrorAnalysisDashboard.classNames.pivotWrapper}
                  style={{ height: "820px" }}
                >
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
                    />
                  )}
                </div>
              )}
              <CohortInfo
                isOpen={this.state.openInfoPanel}
                onDismiss={(): void => this.setState({ openInfoPanel: false })}
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
              />
              <CohortSettings
                isOpen={this.state.openSettingsPanel}
                onDismiss={(): void =>
                  this.setState({ openSettingsPanel: false })
                }
              />
            </Layer>
          </Customizer>
          <LayerHost
            id={this.layerHostId}
            style={{
              height: "820px",
              overflow: "hidden",
              position: "relative"
            }}
          />
        </div>
      </div>
    );
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
      this.setState({ activeGlobalTab: index });
    }
  }

  private setSortVector(): void {
    this.setState({
      sortVector: ModelExplanationUtils.getSortIndices(
        this.state.cohorts[0].calculateAverageImportance()
      ).reverse()
    });
  }

  private viewExplanation(): void {
    this.setState({ viewType: ViewTypeKeys.ExplanationView });
  }

  private updateViewState(viewType: ViewTypeKeys): void {
    this.setState({ viewType });
  }
}
