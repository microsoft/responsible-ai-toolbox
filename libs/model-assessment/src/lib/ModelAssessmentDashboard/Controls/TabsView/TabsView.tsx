// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CausalInsightsTab } from "@responsible-ai/causality";
import {
  WeightVectorOption,
  ModelTypes,
  WeightVectors
} from "@responsible-ai/core-ui";
import { CounterfactualsTab } from "@responsible-ai/counterfactuals";
import { DatasetExplorerTab } from "@responsible-ai/dataset-explorer";
import {
  ErrorAnalysisOptions,
  ErrorAnalysisViewTab,
  MapShift,
  MatrixArea,
  MatrixFilter,
  TreeViewRenderer
} from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";
import _, { Dictionary } from "lodash";
import { DefaultEffects, PivotItem, Stack, Text } from "office-ui-fabric-react";
import * as React from "react";

import { AddTabButton } from "../../AddTabButton";
import { GlobalTabKeys } from "../../ModelAssessmentEnums";
import { FeatureImportancesTab } from "../FeatureImportances";
import { ModelOverview } from "../ModelOverview";

import { tabsViewStyles } from "./TabsView.styles";
import { ITabsViewProps } from "./TabsViewProps";

export interface ITabsViewState {
  errorAnalysisOption: ErrorAnalysisOptions;
  importances: number[];
  mapShiftErrorAnalysisOption: ErrorAnalysisOptions;
  mapShiftVisible: boolean;
  selectedFeatures: string[];
  selectedWeightVector: WeightVectorOption;
  weightVectorLabels: Dictionary<string>;
  weightVectorOptions: WeightVectorOption[];
}

export class TabsView extends React.PureComponent<
  ITabsViewProps,
  ITabsViewState
> {
  public constructor(props: ITabsViewProps) {
    super(props);
    const weightVectorLabels = {
      [WeightVectors.AbsAvg]: localization.Interpret.absoluteAverage
    };
    const weightVectorOptions = [];
    if (props.modelMetadata.modelType === ModelTypes.Multiclass) {
      weightVectorOptions.push(WeightVectors.AbsAvg);
    }
    props.modelMetadata.classNames.forEach((name, index) => {
      weightVectorLabels[index] = localization.formatString(
        localization.Interpret.WhatIfTab.classLabel,
        name
      );
      weightVectorOptions.push(index);
    });
    const importances = props.errorAnalysisData?.[0]?.importances ?? [];
    this.state = {
      errorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      importances,
      mapShiftErrorAnalysisOption: ErrorAnalysisOptions.TreeMap,
      mapShiftVisible: false,
      selectedFeatures: props.dataset.feature_names,
      selectedWeightVector:
        props.modelMetadata.modelType === ModelTypes.Multiclass
          ? WeightVectors.AbsAvg
          : 0,
      weightVectorLabels,
      weightVectorOptions
    };
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
      this.props.baseCohort.cohort.name !==
        localization.ErrorAnalysis.Cohort.defaultLabel;
    const classNames = tabsViewStyles();
    return (
      <Stack tokens={{ padding: "l1" }}>
        {this.props.activeGlobalTabs[0]?.key !==
          GlobalTabKeys.ErrorAnalysisTab && (
          <Stack.Item className={classNames.buttonSection}>
            <AddTabButton
              tabIndex={0}
              onAdd={this.props.addTab}
              availableTabs={this.props.addTabDropdownOptions}
            />
          </Stack.Item>
        )}
        {this.props.activeGlobalTabs.map((t, i) => (
          <>
            <Stack.Item
              key={i}
              className={classNames.section}
              styles={{ root: { boxShadow: DefaultEffects.elevation4 } }}
            >
              {t.key === GlobalTabKeys.ErrorAnalysisTab &&
                this.props.errorAnalysisData?.[0] && (
                  <>
                    <div
                      className={classNames.sectionHeader}
                      id="errorAnalysisHeader"
                    >
                      <Text variant={"xxLarge"}>
                        {
                          localization.ModelAssessment.ComponentNames
                            .ErrorAnalysis
                        }
                      </Text>
                    </div>
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
                      updateSelectedCohort={this.props.updateSelectedCohort}
                      features={
                        this.props.errorAnalysisData[0].tree_features ||
                        this.props.dataset.feature_names
                      }
                      selectedFeatures={this.state.selectedFeatures}
                      errorAnalysisOption={this.state.errorAnalysisOption}
                      selectedCohort={this.props.selectedCohort}
                      baseCohort={this.props.baseCohort}
                      selectFeatures={(features: string[]): void =>
                        this.setState({ selectedFeatures: features })
                      }
                      importances={this.state.importances}
                      onSaveCohortClick={(): void => {
                        this.props.setSaveCohortVisible();
                      }}
                      showCohortName={false}
                      handleErrorDetectorChanged={
                        this.handleErrorDetectorChanged
                      }
                      selectedKey={this.state.errorAnalysisOption}
                    />
                  </>
                )}
              {t.key === GlobalTabKeys.ModelOverviewTab && (
                <>
                  <div className={classNames.sectionHeader}>
                    <Text variant={"xxLarge"} id="modelStatisticsHeader">
                      {
                        localization.ModelAssessment.ComponentNames
                          .ModelOverview
                      }
                    </Text>
                  </div>
                  <ModelOverview />
                </>
              )}
              {t.key === GlobalTabKeys.DataExplorerTab && (
                <>
                  <div className={classNames.sectionHeader}>
                    <Text variant={"xxLarge"} id="dataExplorerHeader">
                      {localization.ModelAssessment.ComponentNames.DataExplorer}
                    </Text>
                  </div>
                  <DatasetExplorerTab />
                </>
              )}
              {t.key === GlobalTabKeys.FeatureImportancesTab &&
                this.props.modelExplanationData?.[0] && (
                  <>
                    <div className={classNames.sectionHeader}>
                      <Text variant={"xxLarge"} id="featureImportanceHeader">
                        {
                          localization.ModelAssessment.ComponentNames
                            .FeatureImportances
                        }
                      </Text>
                    </div>
                    <FeatureImportancesTab
                      modelMetadata={this.props.modelMetadata}
                      modelExplanationData={this.props.modelExplanationData}
                      selectedWeightVector={this.state.selectedWeightVector}
                      weightVectorOptions={this.state.weightVectorOptions}
                      weightVectorLabels={this.state.weightVectorLabels}
                      requestPredictions={this.props.requestPredictions}
                      onWeightVectorChange={this.onWeightVectorChange}
                    />
                  </>
                )}
              {t.key === GlobalTabKeys.CausalAnalysisTab &&
                this.props.causalAnalysisData?.[0] && (
                  <>
                    <div className={classNames.sectionHeader}>
                      <Text variant={"xxLarge"} id="causalInsightsTab">
                        {
                          localization.ModelAssessment.ComponentNames
                            .CausalAnalysis
                        }
                      </Text>
                    </div>
                    <CausalInsightsTab
                      data={this.props.causalAnalysisData?.[0]}
                    />
                  </>
                )}

              {t.key === GlobalTabKeys.CounterfactualsTab &&
                this.props.counterfactualData?.[0] && (
                  <>
                    <div className={classNames.sectionHeader}>
                      <Text variant={"xxLarge"}>
                        {
                          localization.ModelAssessment.ComponentNames
                            .Counterfactuals
                        }
                      </Text>
                    </div>
                    <CounterfactualsTab
                      data={this.props.counterfactualData?.[0]}
                    />
                  </>
                )}
            </Stack.Item>
            <Stack.Item className={classNames.buttonSection}>
              <AddTabButton
                tabIndex={i + 1}
                onAdd={this.props.addTab}
                availableTabs={this.props.addTabDropdownOptions}
              />
            </Stack.Item>
          </>
        ))}
        {this.state.mapShiftVisible && (
          <MapShift
            currentOption={this.state.mapShiftErrorAnalysisOption}
            isOpen={this.state.mapShiftVisible}
            onDismiss={(): void =>
              this.setState({
                errorAnalysisOption: this.state.errorAnalysisOption,
                mapShiftVisible: false
              })
            }
            onSave={(): void => {
              this.setState({
                mapShiftVisible: false
              });
              this.props.setSaveCohortVisible();
            }}
            onShift={(): void => {
              // reset all states on shift
              MatrixFilter.resetState();
              MatrixArea.resetState();
              TreeViewRenderer.resetState();
              this.setState({
                errorAnalysisOption: this.state.mapShiftErrorAnalysisOption,
                mapShiftVisible: false
              });
              this.props.setSelectedCohort(this.props.baseCohort);
            }}
          />
        )}
      </Stack>
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.props.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.props.cohorts.forEach((errorCohort) =>
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
    if (this.props.selectedCohort.isTemporary) {
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
}
