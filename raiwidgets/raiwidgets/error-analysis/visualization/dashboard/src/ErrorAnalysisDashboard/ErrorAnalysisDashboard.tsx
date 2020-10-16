import React from "react";
import {
  IErrorAnalysisDashboardProps,
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance
} from "./Interfaces";
import { JointDataset } from "./JointDataset";
import { ModelMetadata } from "mlchartlib";
import { localization } from "../Localization/localization";
import { IExplanationModelMetadata, ModelTypes } from "./IExplanationContext";
import * as memoize from "memoize-one";
import {
  IPivot,
  IPivotItemProps,
  PivotItem,
  Pivot,
  PivotLinkSize
} from "office-ui-fabric-react/lib/Pivot";
import { Layer, LayerHost } from "office-ui-fabric-react/lib/Layer";
import _ from "lodash";
import { mergeStyleSets, loadTheme } from "office-ui-fabric-react/lib/Styling";
import { Customizer } from "office-ui-fabric-react/lib/Utilities";
import { ModelExplanationUtils } from "./ModelExplanationUtils";
import { Cohort } from "./Cohort";
import { initializeIcons } from "@uifabric/icons";
import { defaultTheme } from "./Themes";
import { MainMenu } from "./Controls/MainMenu/MainMenu";
import { Navigation } from "./Controls/Navigation/Navigation";
import { ErrorAnalysisDashboardStyles } from "./ErrorAnalysisDashboard.styles";
import { ValidateProperties } from "./ValidateProperties";
import { ErrorAnalysisView } from "./Controls/ErrorAnalysisView";
import { InstanceView } from "./Controls/InstanceView/InstanceView";
import { CohortInfo } from "./Controls/CohortInfo/CohortInfo";
import { CohortSettings } from "./Controls/CohortSettings/CohortSettings";
import { FeatureList } from "./Controls/FeatureList/FeatureList";
import { getId } from "@uifabric/utilities/lib/getId";

export interface IErrorAnalysisDashboardState {
  cohorts: Cohort[];
  activeGlobalTab: globalTabKeys;
  viewType: viewTypeKeys;
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  modelChartConfig: IGenericChartProps;
  dataChartConfig: IGenericChartProps;
  whatIfChartConfig: IGenericChartProps;
  dependenceProps: IGenericChartProps;
  globalImportanceIntercept: number;
  globalImportance: number[];
  isGlobalImportanceDerivedFromLocal: boolean;
  sortVector: number[];
  editingCohortIndex?: number;
  openInfoPanel: boolean;
  openSettingsPanel: boolean;
  openFeatureList: boolean;
  selectedFeatures: string[];
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestDebugML?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
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

export enum globalTabKeys {
  dataExplorerTab = "dataExplorerTab",
  globalExplanationTab = "globalExplanationTab",
  localExplanationTab = "localExplanationTab"
}

export enum viewTypeKeys {
  errorAnalysisView = "errorAnalysisView",
  explanationView = "explanationView"
}

export class ErrorAnalysisDashboard extends React.PureComponent<
  IErrorAnalysisDashboardProps,
  IErrorAnalysisDashboardState
> {
  private static iconsInitialized = false;

  private static initializeIcons(props: IErrorAnalysisDashboardProps): void {
    if (
      ErrorAnalysisDashboard.iconsInitialized === false &&
      props.shouldInitializeIcons !== false
    ) {
      initializeIcons(props.iconUrl);
      ErrorAnalysisDashboard.iconsInitialized = true;
    }
  }

  private static readonly classNames = mergeStyleSets({
    pivotWrapper: {
      display: "contents"
    }
  });

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
        localization.defaultFeatureNames
      );
      featureNamesAbridged = featureNames;
    }
    let classNames = props.dataSummary.classNames;
    const classLength = ErrorAnalysisDashboard.getClassLength(props);
    if (!classNames || classNames.length !== classLength) {
      classNames = ErrorAnalysisDashboard.buildIndexedNames(
        classLength,
        localization.defaultClassNames
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
      featureNames,
      featureNamesAbridged,
      classNames,
      featureIsCategorical,
      featureRanges,
      modelType
    };
  }

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
        } else {
          // 2d is regression (could be a non-scikit convention binary, but that is not supported)
          return 1;
        }
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

  private static buildIndexedNames(
    length: number,
    baseString: string
  ): string[] {
    return Array.from(Array(length).keys()).map(
      (i) => localization.formatString(baseString, i.toString()) as string
    );
  }

  private static getModelType(props: IErrorAnalysisDashboardProps): ModelTypes {
    // If python gave us a hint, use it
    if (props.modelInformation.method === "regressor") {
      return ModelTypes.regression;
    }
    switch (ErrorAnalysisDashboard.getClassLength(props)) {
      case 1:
        return ModelTypes.regression;
      case 2:
        return ModelTypes.binary;
      default:
        return ModelTypes.multiclass;
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

  public static buildInitialExplanationContext(
    props: IErrorAnalysisDashboardProps
  ): IErrorAnalysisDashboardState {
    const modelMetadata = ErrorAnalysisDashboard.buildModelMetadata(props);
    const validationCheck = new ValidateProperties(props, modelMetadata);

    let localExplanations:
      | IMultiClassLocalFeatureImportance
      | ISingleClassLocalFeatureImportance;
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
      predictedY: props.predictedY,
      predictedProbabilities: props.probabilityY,
      trueY: props.trueY,
      localExplanations,
      metadata: modelMetadata
    });
    const globalProps = ErrorAnalysisDashboard.buildGlobalProperties(props);
    // consider taking filters in as param arg for programatic users
    const cohorts = [
      new Cohort(localization.Cohort.defaultLabel, jointDataset, [])
    ];
    return {
      cohorts,
      activeGlobalTab: globalTabKeys.dataExplorerTab,
      viewType: viewTypeKeys.errorAnalysisView,
      jointDataset,
      modelMetadata,
      modelChartConfig: undefined,
      dataChartConfig: undefined,
      whatIfChartConfig: undefined,
      dependenceProps: undefined,
      globalImportanceIntercept: globalProps.globalImportanceIntercept,
      globalImportance: globalProps.globalImportance,
      isGlobalImportanceDerivedFromLocal:
        globalProps.isGlobalImportanceDerivedFromLocal,
      sortVector: undefined,
      openInfoPanel: false,
      openSettingsPanel: false,
      openFeatureList: false,
      selectedFeatures: props.features,
      requestDebugML: props.requestDebugML
    };
  }

  private pivotItems: IPivotItemProps[] = [];
  private pivotRef: IPivot;
  private layerHostId: string;
  constructor(props: IErrorAnalysisDashboardProps) {
    super(props);
    ErrorAnalysisDashboard.initializeIcons(props);
    loadTheme(props.theme || defaultTheme);
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
      headerText: localization.dataExplorerView,
      itemKey: globalTabKeys.dataExplorerTab
    });
    this.pivotItems.push({
      headerText: localization.globalExplanationView,
      itemKey: globalTabKeys.globalExplanationTab
    });
    this.pivotItems.push({
      headerText: localization.localExplanationView,
      itemKey: globalTabKeys.localExplanationTab
    });
    this.layerHostId = getId("cohortsLayerHost");
  }

  render(): React.ReactNode {
    const cohortIDs = this.state.cohorts.map((cohort) =>
      cohort.getCohortID().toString()
    );
    const classNames = ErrorAnalysisDashboardStyles();
    return (
      <div className={classNames.page} style={{ maxHeight: "1000px" }}>
        <Navigation
          updateViewState={this.updateViewState.bind(this)}
          viewType={this.state.viewType}
        />
        <MainMenu
          viewExplanation={this.viewExplanation.bind(this)}
          onInfoPanelClick={() => this.setState({ openInfoPanel: true })}
          onSettingsPanelClick={() =>
            this.setState({ openSettingsPanel: true })
          }
          onFeatureListClick={() => this.setState({ openFeatureList: true })}
          localUrl={this.props.localUrl}
          viewType={this.state.viewType}
        />
        <div>
          <Customizer settings={{ hostId: this.layerHostId }}>
            <Layer>
              {this.state.viewType === viewTypeKeys.errorAnalysisView && (
                <ErrorAnalysisView
                  theme={this.props.theme}
                  messages={
                    this.props.stringParams
                      ? this.props.stringParams.contextualHelp
                      : undefined
                  }
                  getTreeNodes={this.state.requestDebugML}
                  features={this.props.features}
                  selectedFeatures={this.state.selectedFeatures}
                />
              )}
              {this.state.viewType === viewTypeKeys.explanationView && (
                <div
                  className={ErrorAnalysisDashboard.classNames.pivotWrapper}
                  style={{ height: "820px" }}
                >
                  <Pivot
                    componentRef={(ref) => {
                      this.pivotRef = ref;
                    }}
                    selectedKey={this.state.activeGlobalTab}
                    onLinkClick={this.handleGlobalTabClick}
                    linkSize={PivotLinkSize.normal}
                    headersOnly={true}
                    styles={{ root: classNames.pivotLabelWrapper }}
                  >
                    {this.pivotItems.map((props) => (
                      <PivotItem key={props.itemKey} {...props} />
                    ))}
                  </Pivot>
                  {this.state.activeGlobalTab ===
                    globalTabKeys.localExplanationTab && (
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
                onDismiss={() => this.setState({ openInfoPanel: false })}
              />
              <FeatureList
                isOpen={this.state.openFeatureList}
                onDismiss={() => this.setState({ openFeatureList: false })}
                saveFeatures={(features: string[]) =>
                  this.setState({ selectedFeatures: features })
                }
                features={this.props.features}
              />
              <CohortSettings
                isOpen={this.state.openSettingsPanel}
                onDismiss={() => this.setState({ openSettingsPanel: false })}
              />
            </Layer>
          </Customizer>
          <LayerHost
            id={this.layerHostId}
            style={{
              position: "relative",
              overflow: "hidden",
              height: "820px"
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

  private handleGlobalTabClick(item: PivotItem): void {
    let index: globalTabKeys = globalTabKeys[item.props.itemKey];
    this.setState({ activeGlobalTab: index });
  }

  private setSortVector(): void {
    this.setState({
      sortVector: ModelExplanationUtils.getSortIndices(
        this.state.cohorts[0].calculateAverageImportance()
      ).reverse()
    });
  }

  private viewExplanation(): void {
    this.setState({ viewType: viewTypeKeys.explanationView });
  }

  private updateViewState(viewType: viewTypeKeys): void {
    this.setState({ viewType: viewType });
  }
}
