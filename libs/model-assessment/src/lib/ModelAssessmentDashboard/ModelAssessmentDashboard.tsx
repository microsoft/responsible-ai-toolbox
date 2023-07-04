// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IDropdownOption, loadTheme, Stack } from "@fluentui/react";
import {
  CohortBasedComponent,
  ModelAssessmentContext,
  ErrorCohort,
  CohortSource,
  Cohort,
  SaveCohort,
  defaultTheme,
  TelemetryLevels,
  TelemetryEventName,
  Announce,
  DatasetCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import * as React from "react";

import { getAvailableTabs } from "./AvailableTabs";
import { buildInitialModelAssessmentContext } from "./Context/buildModelAssessmentContext";
import { MainMenu } from "./Controls/MainMenu";
import { TabsView } from "./Controls/TabsView/TabsView";
import { modelAssessmentDashboardStyles } from "./ModelAssessmentDashboard.styles";
import { IModelAssessmentDashboardProps } from "./ModelAssessmentDashboardProps";
import { IModelAssessmentDashboardState } from "./ModelAssessmentDashboardState";
import { GlobalTabKeys } from "./ModelAssessmentEnums";
import { addTabMessage } from "./utils/addTabMessage";

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
    loadTheme(props.theme || defaultTheme);
    this.addTabDropdownOptions = getAvailableTabs(this.props, true);
  }
  public componentDidUpdate(prev: IModelAssessmentDashboardProps): void {
    if (prev.theme !== this.props.theme) {
      loadTheme(this.props.theme || defaultTheme);
    }
    if (this.props.locale && prev.locale !== this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
  }

  public render(): React.ReactNode {
    const classNames = modelAssessmentDashboardStyles();
    return (
      <ModelAssessmentContext.Provider
        value={{
          addCohort: this.addCohort,
          baseDatasetCohort: this.state.baseDatasetCohort,
          baseErrorCohort: this.state.baseCohort,
          causalAnalysisData: this.props.causalAnalysisData?.[0],
          columnRanges: this.state.columnRanges,
          counterfactualData: this.props.counterfactualData?.[0],
          dataset: this.props.dataset,
          datasetCohorts: this.state.datasetCohorts,
          deleteCohort: this.deleteCohort,
          editCohort: this.editCohort,
          errorAnalysisData: this.props.errorAnalysisData?.[0],
          errorCohorts: this.state.cohorts,
          featureFlights: this.props.featureFlights,
          jointDataset: this.state.jointDataset,
          modelExplanationData: this.props.modelExplanationData?.[0]
            ? {
                ...this.props.modelExplanationData?.[0],
                predictedY: this.props.dataset.predicted_y,
                probabilityY: this.props.dataset.probability_y
              }
            : undefined,
          modelMetadata: this.state.modelMetadata,
          requestBoxPlotDistribution: this.props.requestBoxPlotDistribution,
          requestBubblePlotData: this.props.requestBubblePlotData,
          requestCausalWhatIf: this.props.requestCausalWhatIf,
          requestDatasetAnalysisBarChart:
            this.props.requestDatasetAnalysisBarChart,
          requestDatasetAnalysisBoxChart:
            this.props.requestDatasetAnalysisBoxChart,
          requestExp: this.props.requestExp,
          requestForecast: this.props.requestForecast,
          requestGlobalCausalEffects: this.props.requestGlobalCausalEffects,
          requestGlobalCausalPolicy: this.props.requestGlobalCausalPolicy,
          requestGlobalExplanations: this.props.requestGlobalExplanations,
          requestLocalCausalEffects: this.props.requestLocalCausalEffects,
          requestLocalCounterfactuals: this.props.requestLocalCounterfactuals,
          requestLocalExplanations: this.props.requestLocalExplanations,
          requestLocalFeatureExplanations:
            this.props.requestLocalFeatureExplanations,
          requestMetrics: this.props.requestMetrics,
          requestObjectDetectionMetrics:
            this.props.requestObjectDetectionMetrics,
          requestPredictions: this.props.requestPredictions,
          requestQuestionAnsweringMetrics:
            this.props.requestQuestionAnsweringMetrics,
          requestSplinePlotDistribution:
            this.props.requestSplinePlotDistribution,
          requestTestDataRow: this.props.requestTestDataRow,
          selectedDatasetCohort: this.state.selectedDatasetCohort,
          selectedErrorCohort: this.state.selectedCohort,
          setAsCategorical: this.setAsCategorical,
          shiftErrorCohort: this.shiftErrorCohort,
          telemetryHook:
            this.props.telemetryHook ||
            ((): void => {
              return;
            }),
          theme: getTheme()
        }}
      >
        <Stack id="ModelAssessmentDashboard" className={classNames.page}>
          <MainMenu
            activeGlobalTabs={this.state.activeGlobalTabs}
            removeTab={this.removeTab}
            telemetryHook={this.props.telemetryHook}
          />
          <Stack.Item className={classNames.mainContent}>
            <TabsView
              modelExplanationData={this.props.modelExplanationData}
              causalAnalysisData={this.props.causalAnalysisData}
              counterfactualData={this.props.counterfactualData}
              errorAnalysisData={this.props.errorAnalysisData}
              cohortData={this.props.cohortData}
              cohorts={this.state.cohorts}
              jointDataset={this.state.jointDataset}
              activeGlobalTabs={this.state.activeGlobalTabs}
              baseCohort={this.state.baseCohort}
              selectedCohort={this.state.selectedCohort}
              dataset={this.props.dataset}
              onClearCohortSelectionClick={this.clearCohortSelection}
              requestExp={this.props.requestExp}
              requestObjectDetectionMetrics={
                this.props.requestObjectDetectionMetrics
              }
              requestPredictions={this.props.requestPredictions}
              requestQuestionAnsweringMetrics={
                this.props.requestQuestionAnsweringMetrics
              }
              requestDebugML={this.props.requestDebugML}
              requestImportances={this.props.requestImportances}
              requestMatrix={this.props.requestMatrix}
              stringParams={this.props.stringParams}
              telemetryHook={this.props.telemetryHook}
              updateSelectedCohort={this.updateSelectedCohort}
              setSaveCohortVisible={this.setSaveCohortVisible}
              setSelectedCohort={this.setSelectedCohort}
              modelMetadata={this.state.modelMetadata}
              addTabDropdownOptions={this.addTabDropdownOptions}
              addTab={this.addTab}
            />
            <Announce message={this.state.onAddMessage} />
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
        </Stack>
      </ModelAssessmentContext.Provider>
    );
  }

  private setAsCategorical = (
    column: string,
    treatAsCategorical: boolean
  ): void => {
    if (this.state.columnRanges) {
      const ranges = this.state.columnRanges;
      ranges[column].treatAsCategorical = treatAsCategorical;
      this.setState({ columnRanges: ranges });
    }
  };

  private setSaveCohortVisible = (): void => {
    this.setState({ saveCohortVisible: true });
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.ErrorAnalysisTreeMapSaveAsNewCohortClick
    });
  };

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
    this.setState({ activeGlobalTabs: tabs, onAddMessage: addTabMessage(tab) });
  };

  private removeTab = (index: number): void => {
    const tabs = [...this.state.activeGlobalTabs];
    tabs.splice(index, 1);
    this.setState({ activeGlobalTabs: tabs });
  };

  private shiftErrorCohort = (cohort: ErrorCohort): void => {
    this.setState({
      baseCohort: cohort,
      selectedCohort: cohort
    });
  };

  private setSelectedCohort = (cohort: ErrorCohort): void => {
    this.setState({
      selectedCohort: cohort
    });
  };

  private clearCohortSelection = (): void => {
    const cohorts = this.state.cohorts.filter(
      (errorCohort) => !errorCohort.isTemporary
    );
    this.setState({
      cohorts,
      selectedCohort: this.state.baseCohort
    });
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.ErrorAnalysisTreeMapClearSelection
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
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.ErrorAnalysisTreeMapCohortSaved
    });
  };

  private addCohort = (
    manuallyCreatedCohort: Cohort,
    datasetCohort?: DatasetCohort,
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
    if (datasetCohort) {
      let newDatasetCohorts = this.state.datasetCohorts
        ? [...this.state.datasetCohorts, datasetCohort]
        : [datasetCohort];
      newDatasetCohorts = newDatasetCohorts.filter(
        (cohort) => !cohort?.isTemporary
      );
      this.setState((prevState) => ({
        baseDatasetCohort: switchNew
          ? datasetCohort
          : prevState.baseDatasetCohort,
        datasetCohorts: newDatasetCohorts,
        selectedDatasetCohort: switchNew
          ? datasetCohort
          : prevState.selectedDatasetCohort
      }));
    }
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.NewCohortAdded
    });
  };

  private editCohort = (
    editCohort: Cohort,
    datasetCohort?: DatasetCohort,
    switchNew?: boolean
  ): void => {
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

    if (switchNew) {
      this.setState({
        baseCohort: newCohorts[editIndex],
        cohorts: newCohorts,
        selectedCohort: newCohorts[editIndex]
      });
    } else {
      this.setState({ cohorts: newCohorts });
    }
    if (datasetCohort) {
      let newDatasetCohorts = this.state.datasetCohorts || [];
      newDatasetCohorts[editIndex] = datasetCohort;
      newDatasetCohorts = newDatasetCohorts.filter(
        (cohort) => !cohort.isTemporary
      );
      if (switchNew) {
        this.setState({
          baseDatasetCohort: newDatasetCohorts[editIndex],
          datasetCohorts: newDatasetCohorts,
          selectedDatasetCohort: newDatasetCohorts[editIndex]
        });
      } else {
        this.setState({ datasetCohorts: newDatasetCohorts });
      }
    }
  };

  private deleteCohort = (cohort: ErrorCohort): void => {
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
