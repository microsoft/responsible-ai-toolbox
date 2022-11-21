// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  PrimaryButton,
  IDropdownOption,
  Pivot,
  PivotItem,
  IPivotItemProps,
  initializeIcons
} from "@fluentui/react";
import {
  FluentUIStyles,
  isTwoDimArray,
  IExplanationContext,
  IExplanationGenerators,
  IGlobalExplanation,
  ILocalExplanation,
  IExplanationModelMetadata,
  ITestDataset,
  ModelExplanationUtils,
  ModelTypes,
  IFeatureValueExplanation,
  IWeightedDropdownContext,
  WeightVectorOption,
  WeightVectors,
  JointDataset,
  IMultiClassBoundedCoordinates,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  IPlotlyProperty,
  SelectionContext,
  ModelMetadata
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import memoize from "memoize-one";
import React from "react";

import { FeatureImportanceModes } from "./Controls/FeatureImportance/FeatureImportanceModes";
import {
  IFeatureImportanceConfig,
  globalFeatureImportanceId,
  barId
} from "./Controls/FeatureImportance/FeatureImportanceWrapper";
import { ICEPlot } from "./Controls/ICEPlot";
import { PerturbationExploration } from "./Controls/PerturbationExploration";
import {
  localBarId,
  SinglePointFeatureImportance
} from "./Controls/SinglePointFeatureImportance";
import { explanationDashboardStyles } from "./ExplanationDashboard.styles";
import { ExplanationDashboardActiveTabs } from "./ExplanationDashboardActiveTabs";
import { IExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";
import { IBarChartConfig } from "./SharedComponents/IBarChartConfig";
import { validateInputs } from "./validateInputs";

const rowIndex = "rowIndex";

export interface IDashboardContext {
  explanationContext: IExplanationContext;
  weightContext: IWeightedDropdownContext;
}

export interface IDashboardState {
  dashboardContext: IDashboardContext;
  activeGlobalTab: number;
  activeLocalTab: number;
  configs: {
    [key: string]: IPlotlyProperty | IFeatureImportanceConfig | IBarChartConfig;
  };
  selectedRow: number | undefined;
}

export class ExplanationDashboard extends React.Component<
  IExplanationDashboardProps,
  IDashboardState
> {
  private static iconsInitialized = false;

  private static globalTabKeys: string[] = [
    "dataExploration",
    "globalImportance",
    "explanationExploration",
    "summaryImportance",
    "modelExplanation",
    "customVisualization"
  ];

  private static localTabKeys: string[] = [
    "featureImportance",
    "perturbationExploration",
    "ICE"
  ];

  private static buildWeightDropdownOptions: (
    explanationContext: IExplanationContext
  ) => IDropdownOption[] = memoize(
    (explanationContext: IExplanationContext): IDropdownOption[] => {
      const result: IDropdownOption[] = [
        {
          key: WeightVectors.AbsAvg,
          text: localization.Interpret.absoluteAverage
        }
      ];
      if (explanationContext.testDataset.predictedY) {
        result.push({
          key: WeightVectors.Predicted,
          text: localization.Interpret.predictedClass
        });
      }
      explanationContext.modelMetadata.classNames.forEach((name, index) => {
        result.push({ key: index, text: name });
      });
      return result;
    }
  );

  private static getClassLength: (props: IExplanationDashboardProps) => number =
    memoize((props: IExplanationDashboardProps): number => {
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
          (
            props.precomputedExplanations.globalFeatureImportance
              .scores as number[][]
          ).every((dim1) => Array.isArray(dim1))
        ) {
          return (
            props.precomputedExplanations.globalFeatureImportance
              .scores as number[][]
          )[0].length;
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
    });

  private readonly selectionContext = new SelectionContext(rowIndex, 1);
  private selectionSubscription: string | undefined;

  private pivotItems: IPivotItemProps[];

  public constructor(props: IExplanationDashboardProps) {
    super(props);
    ExplanationDashboard.initializeIcons(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    const explanationContext: IExplanationContext =
      ExplanationDashboard.buildInitialExplanationContext(props);
    const defaultTopK = Math.min(
      8,
      explanationContext.modelMetadata.featureNames.length
    );
    this.pivotItems = [];
    if (explanationContext.testDataset.dataset !== undefined) {
      this.pivotItems.push({
        headerText: localization.Interpret.dataExploration,
        itemKey: ExplanationDashboard.globalTabKeys[0]
      });
    }
    if (explanationContext.globalExplanation !== undefined) {
      this.pivotItems.push({
        headerText: localization.Interpret.globalImportance,
        itemKey: ExplanationDashboard.globalTabKeys[1]
      });
    }
    if (
      explanationContext.localExplanation !== undefined &&
      explanationContext.testDataset.dataset !== undefined
    ) {
      this.pivotItems.push({
        headerText: localization.Interpret.explanationExploration,
        itemKey: ExplanationDashboard.globalTabKeys[2]
      });
    }
    if (explanationContext.localExplanation !== undefined) {
      this.pivotItems.push({
        headerText: localization.Interpret.summaryImportance,
        itemKey: ExplanationDashboard.globalTabKeys[3]
      });
    }
    if (explanationContext.ebmExplanation !== undefined) {
      this.pivotItems.push({
        headerText: localization.Interpret.summaryImportance,
        itemKey: ExplanationDashboard.globalTabKeys[4]
      });
    }
    if (explanationContext.customVis !== undefined) {
      this.pivotItems.push({
        headerText: localization.Interpret.summaryImportance,
        itemKey: ExplanationDashboard.globalTabKeys[5]
      });
    }

    this.state = {
      activeGlobalTab:
        this.pivotItems.length > 0 && this.pivotItems[0].itemKey
          ? ExplanationDashboard.globalTabKeys.indexOf(
              this.pivotItems[0].itemKey
            )
          : 0,
      activeLocalTab:
        explanationContext.localExplanation === undefined &&
        this.props.requestPredictions
          ? 1
          : 0,
      configs: {
        [barId]: {
          displayMode: FeatureImportanceModes.Bar,
          id: barId,
          topK: defaultTopK
        },
        [globalFeatureImportanceId]: {
          displayMode: FeatureImportanceModes.Beehive,
          id: globalFeatureImportanceId,
          topK: defaultTopK
        },
        [localBarId]: { topK: defaultTopK }
      },
      dashboardContext: {
        explanationContext,
        weightContext: {
          onSelection: this.onClassSelect,
          options:
            ExplanationDashboard.buildWeightDropdownOptions(explanationContext),
          selectedKey: props.predictedY
            ? WeightVectors.Predicted
            : WeightVectors.AbsAvg
        }
      },
      selectedRow: undefined
    };
  }
  public static buildInitialExplanationContext(
    props: IExplanationDashboardProps
  ): IExplanationContext {
    const explanationGenerators: IExplanationGenerators = {
      requestLocalFeatureExplanations: props.requestLocalFeatureExplanations,
      requestPredictions: props.requestPredictions
    };
    const modelMetadata = ExplanationDashboard.buildModelMetadata(props);
    const errorMessage = validateInputs(props, modelMetadata);
    if (errorMessage !== undefined) {
      if (props.telemetryHook !== undefined) {
        props.telemetryHook({
          context: errorMessage,
          level: TelemetryLevels.Error,
          message: "Invalid inputs"
        });
      }
      return {
        customVis: undefined,
        ebmExplanation: undefined,
        explanationGenerators,
        globalExplanation: undefined,
        inputError: errorMessage,
        isGlobalDerived: false,
        jointDataset: undefined,
        localExplanation: undefined,
        modelMetadata,
        testDataset: {}
      };
    }
    const testDataset: ITestDataset = {
      dataset: props.testData,
      predictedY: props.predictedY,
      probabilityY: props.probabilityY,
      trueY: props.trueY
    };
    let localExplanation: ILocalExplanation | undefined;
    if (
      props.precomputedExplanations &&
      props.precomputedExplanations.localFeatureImportance !== undefined &&
      props.precomputedExplanations.localFeatureImportance.scores !==
        undefined &&
      testDataset
    ) {
      const weighting = props.predictedY
        ? WeightVectors.Predicted
        : WeightVectors.AbsAvg;
      const localFeatureMatrix = JointDataset.buildLocalFeatureMatrix(
        props.precomputedExplanations.localFeatureImportance.scores,
        modelMetadata.modelType
      );
      const flattenedFeatureMatrix =
        ExplanationDashboard.buildLocalFlattenMatrix(
          localFeatureMatrix,
          modelMetadata.modelType,
          testDataset,
          weighting
        );
      const intercepts = undefined;
      // if (props.precomputedExplanations.localFeatureImportance.intercept) {
      //     intercepts = (modelMetadata.modelType === ModelTypes.regression ?
      //         [props.precomputedExplanations.localFeatureImportance.intercept] :
      //         props.precomputedExplanations.localFeatureImportance.intercept) as number[];
      // }
      localExplanation = {
        flattenedValues: flattenedFeatureMatrix,
        intercepts,
        values: localFeatureMatrix
      };
    }

    let globalExplanation: IGlobalExplanation | undefined;
    let isGlobalDerived = false;
    if (
      props.precomputedExplanations &&
      props.precomputedExplanations.globalFeatureImportance !== undefined &&
      props.precomputedExplanations.globalFeatureImportance.scores !== undefined
    ) {
      const intercepts = undefined;
      // if (props.precomputedExplanations.globalFeatureImportance.intercept) {
      //     intercepts = props.precomputedExplanations.globalFeatureImportance.intercept;
      // }
      // determine if passed in vaules is 1D or 2D
      // Use the global explanation if its been computed and is 2D
      if (
        (
          props.precomputedExplanations.globalFeatureImportance
            .scores as number[][]
        ).every((dim1) => Array.isArray(dim1))
      ) {
        globalExplanation = {};
        globalExplanation.perClassFeatureImportances = props
          .precomputedExplanations.globalFeatureImportance.scores as number[][];
        globalExplanation.flattenedFeatureImportances =
          globalExplanation.perClassFeatureImportances.map(
            (classArray) => classArray.reduce((a, b) => a + b),
            0
          );
        globalExplanation.intercepts = intercepts;
      } else if (localExplanation === undefined) {
        // Take the global if we can't build better from local
        globalExplanation = {};
        globalExplanation.flattenedFeatureImportances = props
          .precomputedExplanations.globalFeatureImportance.scores as number[];
        globalExplanation.intercepts = intercepts;
      }
    }
    if (globalExplanation === undefined && localExplanation !== undefined) {
      globalExplanation =
        ExplanationDashboard.buildGlobalExplanationFromLocal(localExplanation);
      isGlobalDerived = true;
    }

    let ebmExplanation: IFeatureValueExplanation | undefined;
    if (
      props.precomputedExplanations &&
      props.precomputedExplanations.ebmGlobalExplanation !== undefined
    ) {
      ebmExplanation = {
        displayParameters: {
          interpolation: "vh"
        },
        featureList:
          props.precomputedExplanations.ebmGlobalExplanation.feature_list
            .map((featureExplanation) => {
              if (featureExplanation.type !== "univariate") {
                return undefined;
              }
              if (
                featureExplanation.scores &&
                isTwoDimArray(featureExplanation.scores)
              ) {
                return {
                  lowerBounds: featureExplanation.lower_bounds
                    ? featureExplanation.lower_bounds
                    : undefined,
                  names: featureExplanation.names,
                  scores: featureExplanation.scores,
                  type: "univariate",
                  upperBounds: featureExplanation.upper_bounds
                    ? featureExplanation.upper_bounds
                    : undefined
                } as IMultiClassBoundedCoordinates;
              }
              return {
                lowerBounds: featureExplanation.lower_bounds
                  ? [featureExplanation.lower_bounds]
                  : undefined,
                names: featureExplanation.names,
                scores: [featureExplanation.scores],
                type: "univariate",
                upperBounds: featureExplanation.upper_bounds
                  ? [featureExplanation.upper_bounds]
                  : undefined
              } as IMultiClassBoundedCoordinates;
            })
            .filter((featureExplanation) => featureExplanation !== undefined)
      };
    }

    const jointDataset = new JointDataset({
      dataset: props.testData,
      metadata: modelMetadata,
      predictedY: props.predictedY,
      trueY: props.trueY
    });
    const customVis =
      props.precomputedExplanations && props.precomputedExplanations.customVis
        ? props.precomputedExplanations.customVis
        : undefined;

    return {
      customVis,
      ebmExplanation,
      explanationGenerators,
      globalExplanation,
      isGlobalDerived,
      jointDataset,
      localExplanation,
      modelMetadata,
      testDataset
    };
  }

  private static initializeIcons(props: IExplanationDashboardProps): void {
    if (
      ExplanationDashboard.iconsInitialized === false &&
      props.shouldInitializeIcons !== false
    ) {
      initializeIcons(props.iconUrl);
      ExplanationDashboard.iconsInitialized = true;
    }
  }

  private static buildLocalFlattenMatrix(
    localExplanations: number[][][] | undefined,
    modelType: ModelTypes,
    testData: ITestDataset,
    weightVector: WeightVectorOption
  ): number[][] | undefined {
    if (!localExplanations) {
      return undefined;
    }
    switch (modelType) {
      case ModelTypes.Regression: {
        // no need to flatten what is already flat
        return localExplanations.map((featuresByClasses) => {
          return featuresByClasses.map((classArray) => {
            return classArray[0];
          });
        });
      }
      case ModelTypes.Multiclass:
      case ModelTypes.Binary:
      default: {
        return localExplanations.map((featuresByClasses, rowIndex) => {
          return featuresByClasses.map((classArray) => {
            switch (weightVector) {
              case WeightVectors.Equal: {
                return classArray.reduce((a, b) => a + b) / classArray.length;
              }
              case WeightVectors.Predicted: {
                if (testData.predictedY) {
                  return classArray[testData.predictedY[rowIndex]];
                }
                return 0;
              }
              case WeightVectors.AbsAvg: {
                return (
                  classArray.reduce((a, b) => a + Math.abs(b), 0) /
                  classArray.length
                );
              }
              default: {
                return classArray[weightVector];
              }
            }
          });
        });
      }
    }
  }

  private static buildGlobalExplanationFromLocal(
    localExplanation: ILocalExplanation
  ): IGlobalExplanation {
    return {
      perClassFeatureImportances: ModelExplanationUtils.absoluteAverageTensor(
        localExplanation.values
      )
      // intercepts: localExplanation.intercepts ? localExplanation.intercepts.map(val => Math.abs(val)) : undefined
    };
  }

  private static buildModelMetadata(
    props: IExplanationDashboardProps
  ): IExplanationModelMetadata {
    const modelType = ExplanationDashboard.getModelType(props);
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
        props.precomputedExplanations.globalFeatureImportance &&
        props.precomputedExplanations.globalFeatureImportance.scores
      ) {
        featureLength =
          props.precomputedExplanations.globalFeatureImportance.scores.length;
      } else if (
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
          featureLength = (
            props.precomputedExplanations.localFeatureImportance
              .scores[0][0] as number[]
          ).length;
        } else {
          featureLength = (
            props.precomputedExplanations.localFeatureImportance
              .scores[0] as number[]
          ).length;
        }
      } else if (
        props.precomputedExplanations &&
        props.precomputedExplanations.ebmGlobalExplanation
      ) {
        featureLength =
          props.precomputedExplanations.ebmGlobalExplanation.feature_list
            .length;
      }
      featureNames = ExplanationDashboard.buildIndexedNames(
        featureLength,
        localization.Interpret.defaultFeatureNames
      );
      featureNamesAbridged = featureNames;
    }
    let classNames = props.dataSummary.classNames;
    const classLength = ExplanationDashboard.getClassLength(props);
    if (!classNames || classNames.length !== classLength) {
      classNames = ExplanationDashboard.buildIndexedNames(
        classLength,
        localization.Interpret.defaultClassNames
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
    return [...new Array(length).keys()].map((i) =>
      localization.formatString(baseString, i.toString())
    );
  }

  private static getModelType(props: IExplanationDashboardProps): ModelTypes {
    // If python gave us a hint, use it
    if (props.modelInformation.method === "regressor") {
      return ModelTypes.Regression;
    }
    switch (ExplanationDashboard.getClassLength(props)) {
      case 1:
        return ModelTypes.Regression;
      case 2:
        return ModelTypes.Binary;
      default:
        return ModelTypes.Multiclass;
    }
  }

  public componentDidMount(): void {
    this.selectionSubscription = this.selectionContext.subscribe({
      selectionCallback: (selections) => {
        let selectedRow: number | undefined;
        if (selections && selections.length > 0) {
          const numericValue = Number.parseInt(selections[0]);
          if (!Number.isNaN(numericValue)) {
            selectedRow = numericValue;
          }
        }
        this.setState({ selectedRow });
      }
    });
    this.fetchExplanations();
  }

  public componentDidUpdate(prevProps: IExplanationDashboardProps): void {
    if (this.props.locale && prevProps.locale !== this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    if (_.isEqual(prevProps, this.props)) {
      return;
    }
    const newState = _.cloneDeep(this.state);
    newState.dashboardContext.explanationContext =
      ExplanationDashboard.buildInitialExplanationContext(this.props);
    if (newState.dashboardContext.explanationContext.localExplanation) {
      (
        newState.configs[globalFeatureImportanceId] as IFeatureImportanceConfig
      ).displayMode = FeatureImportanceModes.Box;
    }
    this.setState(newState);
    this.fetchExplanations();
  }

  public componentWillUnmount(): void {
    if (this.selectionSubscription) {
      this.selectionContext.unsubscribe(this.selectionSubscription);
    }
  }

  public render(): React.ReactNode {
    if (this.state.dashboardContext.explanationContext.inputError) {
      return (
        <div>{this.state.dashboardContext.explanationContext.inputError}</div>
      );
    }
    if (this.pivotItems.length === 0) {
      return <div>No valid views. Incomplete data.</div>;
    }
    return (
      <div className={explanationDashboardStyles.explainerDashboard}>
        <div className={explanationDashboardStyles.chartsWrapper}>
          <div className={explanationDashboardStyles.globalChartsWrapper}>
            <Pivot
              id={"globalPivot"}
              selectedKey={
                ExplanationDashboard.globalTabKeys[this.state.activeGlobalTab]
              }
              onLinkClick={this.handleGlobalTabClick}
              linkFormat={"tabs"}
              linkSize={"normal"}
              headersOnly
              styles={FluentUIStyles.verticalTabsStyle}
              overflowBehavior="menu"
            >
              {this.pivotItems.map((props) => (
                <PivotItem key={props.itemKey} {...props} />
              ))}
            </Pivot>
            <ExplanationDashboardActiveTabs
              activeGlobalTab={this.state.activeGlobalTab}
              configs={this.state.configs}
              dashboardContext={this.state.dashboardContext}
              selectedRow={this.state.selectedRow}
              selectionContext={this.selectionContext}
              theme={this.props.theme as any}
              onConfigChanged={this.onConfigChanged}
              stringParams={this.props.stringParams}
            />
          </div>
          {this.state.dashboardContext.explanationContext.localExplanation && (
            <div className={explanationDashboardStyles.localChartsWrapper}>
              {this.state.selectedRow === undefined && (
                <div className={explanationDashboardStyles.localPlaceholder}>
                  <div className={explanationDashboardStyles.placeholderText}>
                    {localization.Interpret.selectPoint}
                  </div>
                </div>
              )}
              {this.state.selectedRow !== undefined && (
                <div className={explanationDashboardStyles.tabbedViewer}>
                  <Pivot
                    selectedKey={
                      ExplanationDashboard.localTabKeys[
                        this.state.activeLocalTab
                      ]
                    }
                    onLinkClick={this.handleLocalTabClick}
                    linkFormat={"tabs"}
                    linkSize={"normal"}
                    headersOnly
                    styles={FluentUIStyles.verticalTabsStyle}
                  >
                    <PivotItem
                      headerText={localization.Interpret.localFeatureImportance}
                      itemKey={ExplanationDashboard.localTabKeys[0]}
                    />
                    {this.props.requestPredictions !== undefined &&
                      this.state.dashboardContext.explanationContext.testDataset
                        .dataset && (
                        <PivotItem
                          headerText={
                            localization.Interpret.perturbationExploration
                          }
                          itemKey={ExplanationDashboard.localTabKeys[1]}
                        />
                      )}{" "}
                    {this.props.requestPredictions !== undefined &&
                      this.state.dashboardContext.explanationContext.testDataset
                        .dataset && (
                        <PivotItem
                          headerText={localization.Interpret.ice}
                          itemKey={ExplanationDashboard.localTabKeys[2]}
                        />
                      )}
                  </Pivot>
                  <div className={explanationDashboardStyles.viewPanel}>
                    <div className={explanationDashboardStyles.localCommands}>
                      <PrimaryButton
                        className={explanationDashboardStyles.clearButton}
                        onClick={this.onClearSelection}
                        text={localization.Interpret.clearSelection}
                      />
                    </div>
                    {this.state.activeLocalTab === 0 && (
                      <SinglePointFeatureImportance
                        explanationContext={
                          this.state.dashboardContext.explanationContext
                        }
                        selectedRow={this.state.selectedRow}
                        config={
                          this.state.configs[localBarId] as IBarChartConfig
                        }
                        onChange={this.onConfigChanged}
                        messages={
                          this.props.stringParams
                            ? this.props.stringParams.contextualHelp
                            : undefined
                        }
                        theme={this.props.theme as any}
                      />
                    )}
                    {this.state.activeLocalTab === 1 && (
                      <PerturbationExploration
                        explanationContext={
                          this.state.dashboardContext.explanationContext
                        }
                        invokeModel={this.props.requestPredictions}
                        datapointIndex={+this.selectionContext.selectedIds[0]}
                        theme={this.props.theme as any}
                        messages={
                          this.props.stringParams
                            ? this.props.stringParams.contextualHelp
                            : undefined
                        }
                      />
                    )}
                    {this.state.activeLocalTab === 2 && (
                      <ICEPlot
                        explanationContext={
                          this.state.dashboardContext.explanationContext
                        }
                        invokeModel={this.props.requestPredictions}
                        datapointIndex={+this.selectionContext.selectedIds[0]}
                        theme={this.props.theme as any}
                        messages={
                          this.props.stringParams
                            ? this.props.stringParams.contextualHelp
                            : undefined
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  private fetchExplanations(): void {
    const expContext = this.state.dashboardContext.explanationContext;
    const modelMetadata = expContext.modelMetadata;
    if (
      !expContext.explanationGenerators.requestLocalFeatureExplanations ||
      !expContext.testDataset ||
      !expContext.testDataset.dataset ||
      !expContext.localExplanation?.values
    ) {
      return;
    }
    const requestLocalFeatureExplanations =
      expContext.explanationGenerators.requestLocalFeatureExplanations;
    const testDataset = expContext.testDataset;
    const dataset = expContext.testDataset.dataset;
    this.setState(
      (prevState) => {
        const newState = _.cloneDeep(prevState);
        if (newState.dashboardContext.explanationContext) {
          newState.dashboardContext.explanationContext.localExplanation = {
            // a mock number, we can impl a progress bar if desired.
            percentComplete: 10,
            values: []
          };
        }
        return newState;
      },
      () => {
        requestLocalFeatureExplanations(
          dataset,
          new AbortController().signal
        ).then((result) => {
          if (!result) {
            return;
          }
          this.setState((prevState) => {
            const weighting =
              prevState.dashboardContext.weightContext.selectedKey;
            const localFeatureMatrix = JointDataset.buildLocalFeatureMatrix(
              result,
              modelMetadata.modelType
            );
            const flattenedFeatureMatrix =
              ExplanationDashboard.buildLocalFlattenMatrix(
                localFeatureMatrix,
                modelMetadata.modelType,
                testDataset,
                weighting
              );
            const newState = _.cloneDeep(prevState);
            newState.dashboardContext.explanationContext.localExplanation = {
              flattenedValues: flattenedFeatureMatrix,
              percentComplete: undefined,
              values: localFeatureMatrix
            };
            if (
              prevState.dashboardContext.explanationContext
                .globalExplanation === undefined
            ) {
              newState.dashboardContext.explanationContext.globalExplanation =
                ExplanationDashboard.buildGlobalExplanationFromLocal(
                  newState.dashboardContext.explanationContext.localExplanation
                );
              newState.dashboardContext.explanationContext.isGlobalDerived =
                true;
            }
            return newState;
          });
        });
      }
    );
  }

  private onClassSelect = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (!item) {
      return;
    }
    this.setState((prevState) => {
      const newWeightContext = _.cloneDeep(
        prevState.dashboardContext.weightContext
      );
      newWeightContext.selectedKey = item.key as any;

      const flattenedFeatureMatrix =
        ExplanationDashboard.buildLocalFlattenMatrix(
          prevState.dashboardContext.explanationContext.localExplanation
            ?.values,
          prevState.dashboardContext.explanationContext.modelMetadata.modelType,
          prevState.dashboardContext.explanationContext.testDataset,
          item.key as any
        );
      return {
        dashboardContext: {
          explanationContext: {
            explanationGenerators:
              prevState.dashboardContext.explanationContext
                .explanationGenerators,
            globalExplanation:
              prevState.dashboardContext.explanationContext.globalExplanation,
            isGlobalDerived:
              prevState.dashboardContext.explanationContext.isGlobalDerived,
            jointDataset:
              prevState.dashboardContext.explanationContext.jointDataset,
            localExplanation: {
              flattenedValues: flattenedFeatureMatrix,
              intercepts:
                prevState.dashboardContext.explanationContext.localExplanation
                  ?.intercepts,
              values:
                prevState.dashboardContext.explanationContext.localExplanation
                  ?.values || []
            },
            modelMetadata:
              prevState.dashboardContext.explanationContext.modelMetadata,
            testDataset:
              prevState.dashboardContext.explanationContext.testDataset
          },
          weightContext: newWeightContext
        }
      };
    });
  };

  private onConfigChanged = (
    newConfig: IPlotlyProperty | IFeatureImportanceConfig | IBarChartConfig,
    configId: string
  ): void => {
    this.setState((prevState) => {
      const newConfigs = _.cloneDeep(prevState.configs);
      newConfigs[configId] = newConfig;
      return { configs: newConfigs };
    });
  };

  private handleGlobalTabClick = (item?: PivotItem): void => {
    let index =
      typeof item?.props.itemKey == "string"
        ? ExplanationDashboard.globalTabKeys.indexOf(item.props.itemKey)
        : 0;
    if (index === -1) {
      index = 0;
    }
    this.setState({ activeGlobalTab: index });
  };

  private handleLocalTabClick = (item?: PivotItem): void => {
    let index =
      typeof item?.props.itemKey == "string"
        ? ExplanationDashboard.localTabKeys.indexOf(item.props.itemKey)
        : 0;
    if (index === -1) {
      index = 0;
    }
    this.setState({ activeLocalTab: index });
  };

  private onClearSelection = (): void => {
    this.selectionContext.onSelect([]);
    this.setState({ activeLocalTab: 0 });
    (document.querySelector("#globalPivot button") as any).focus();
  };
}
