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
  DatasetCohort,
  isFlightActive,
  RefactorFlight
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
  private isRefactorFlightOn = isFlightActive(
    RefactorFlight,
    this.props.featureFlights
  );

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
          isRefactorFlightOn: this.isRefactorFlightOn,
          jointDataset: this.state.jointDataset,
          modelExplanationData: this.props.modelExplanationData?.[0]
            ? {
                ...this.props.modelExplanationData?.[0],
                predictedY: this.props.dataset.predicted_y,
                probabilityY: this.props.dataset.probability_y
              }
            : undefined,
          modelMetadata: this.state.modelMetadata,
          modelType: this.state.modelType,
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
          requestPredictions: this.props.requestPredictions,
          requestSplinePlotDistribution:
            this.props.requestSplinePlotDistribution,
          requestTestDataRow: this.props.requestTestDataRow,
          selectedDatasetCohort: this.state.selectedDatasetCohort,
          selectedErrorCohort: this.state.selectedCohort,
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
              requestPredictions={this.props.requestPredictions}
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

  private shiftErrorCohort = (
    cohort: ErrorCohort,
    datasetCohort?: DatasetCohort
  ): void => {
    this.setState({
      baseCohort: cohort,
      selectedCohort: cohort
    });
    if (datasetCohort) {
      this.setState({
        baseDatasetCohort: datasetCohort,
        selectedDatasetCohort: datasetCohort
      });
    }
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
    cohort: Cohort,
    switchNew?: boolean,
    datasetCohort?: DatasetCohort
  ): void => {
    if (
      !this.isRefactorFlightOn &&
      this.state.cohorts.some((c) => c.cohort.name === cohort.name)
    ) {
      return;
    }
    if (
      this.isRefactorFlightOn &&
      (this.state.datasetCohorts === undefined ||
        this.state.datasetCohorts.some((c) => c.name === cohort.name))
    ) {
      return;
    }
    // update errorCohorts
    const newErrorCohort = new ErrorCohort(
      cohort as Cohort,
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
    // update datasetCohorts
    if (datasetCohort && this.state.datasetCohorts) {
      let newDatasetCohorts = [...this.state.datasetCohorts, datasetCohort];
      newDatasetCohorts = newDatasetCohorts.filter(
        (datasetCohort) => !datasetCohort.isTemporary
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
    switchNew?: boolean,
    editDatasetCohort?: DatasetCohort
  ): void => {
    const editIndex = this.isRefactorFlightOn
      ? this.state.datasetCohorts?.findIndex(
          (c) => c.name === editCohort.name
        ) || -1
      : this.state.cohorts.findIndex((c) => c.cohort.name === editCohort.name);
    if (editIndex === -1) {
      return;
    }
    // edit errorCohort
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
        cohorts: newCohorts,
        selectedCohort: newCohorts[editIndex]
      });
    } else {
      this.setState({ cohorts: newCohorts });
    }

    if (
      this.state.datasetCohorts === undefined ||
      editDatasetCohort === undefined
    ) {
      return;
    }
    let newDatasetCohorts = [...this.state.datasetCohorts];
    newDatasetCohorts[editIndex] = editDatasetCohort;
    newDatasetCohorts = newDatasetCohorts.filter(
      (cohort) => !cohort.isTemporary
    );
    if (switchNew) {
      this.setState({
        datasetCohorts: newDatasetCohorts,
        selectedDatasetCohort: newDatasetCohorts[editIndex]
      });
    } else {
      this.setState({ datasetCohorts: newDatasetCohorts });
    }
  };

  private deleteCohort = (
    cohort: ErrorCohort | DatasetCohort,
    isErrorCohort?: boolean
  ): void => {
    if (isErrorCohort) {
      if (
        this.state.baseCohort.cohort.name ===
          (cohort as ErrorCohort).cohort.name ||
        this.state.selectedCohort.cohort.name ===
          (cohort as ErrorCohort).cohort.name
      ) {
        return;
      }
      const newCohorts = [...this.state.cohorts].filter(
        (t) => t.cohort.name !== (cohort as ErrorCohort).cohort.name
      );
      this.setState({
        cohorts: newCohorts
      });
    } else {
      if (
        this.state.baseDatasetCohort?.name === (cohort as DatasetCohort).name ||
        this.state.selectedDatasetCohort?.name ===
          (cohort as DatasetCohort).name
      ) {
        return;
      }

      const newDatasetCohorts = this.state.datasetCohorts?.filter(
        (item) => item.name !== (cohort as DatasetCohort).name
      );
      this.setState({
        datasetCohorts: newDatasetCohorts
      });
    }
  };
}
