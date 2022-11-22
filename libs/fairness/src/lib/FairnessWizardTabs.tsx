// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StackItem, Stack, Pivot, PivotItem } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { FairnessTab } from "./Controls/FairnessTab";
import { FeatureTab } from "./Controls/FeatureTab";
import { IntroTab } from "./Controls/IntroTab";
import { ModelComparisonChart } from "./Controls/ModelComparisonChart";
import { PerformanceTab } from "./Controls/PerformanceTab";
import { FairnessWizardStyles } from "./FairnessWizard.styles";
import {
  introTabKey,
  featureBinTabKey,
  performanceTabKey,
  fairnessTabKey,
  reportTabKey,
  flights
} from "./FairnessWizardState";
import { IFairnessOption } from "./util/FairnessMetrics";
import { IBinnedResponse } from "./util/IBinnedResponse";
import { IFairnessContext } from "./util/IFairnessContext";
import { MetricsCache } from "./util/MetricsCache";
import { IPerformanceOption } from "./util/PerformanceMetrics";
import { WizardReport } from "./WizardReport";

interface IFairnessWizardTabsProps {
  predictedY: number[][];
  showIntro: boolean;
  activeTabKey: string;
  selectedModelId: number | undefined;
  dashboardContext: IFairnessContext;
  performanceMetrics: IPerformanceOption[];
  fairnessMetrics: IFairnessOption[];
  selectedPerformanceKey: string;
  selectedFairnessKey: string;
  errorBarsEnabled: boolean;
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  metricCache: MetricsCache;
  hideIntro(): void;
  setTab(key: string): void;
  onSelectModel(data: any): void;
  setPerformanceKey(key: string): void;
  setFairnessKey(key: string): void;
  setErrorBarsEnabled(key: boolean): void;
  setBinIndex(index: number): void;
  saveBin(bin: IBinnedResponse): void;
  handleTabClick(item?: PivotItem): void;
}

export class FairnessWizardTabs extends React.Component<IFairnessWizardTabsProps> {
  public render(): React.ReactNode {
    const styles = FairnessWizardStyles();
    const performancePickerProps = {
      onPerformanceChange: this.props.setPerformanceKey,
      performanceOptions: this.props.performanceMetrics,
      selectedPerformanceKey: this.props.selectedPerformanceKey
    };
    const fairnessPickerProps = {
      fairnessOptions: this.props.fairnessMetrics,
      onFairnessChange: this.props.setFairnessKey,
      selectedFairnessKey: this.props.selectedFairnessKey
    };
    const errorPickerProps = {
      errorBarsEnabled: this.props.errorBarsEnabled,
      onErrorChange: this.props.setErrorBarsEnabled
    };
    const featureBinPickerProps = {
      featureBins: this.props.featureBins,
      onBinChange: this.props.setBinIndex,
      selectedBinIndex: this.props.selectedBinIndex
    };
    return (
      <>
        {this.props.activeTabKey === introTabKey && (
          <StackItem grow={2}>
            <IntroTab
              featureBinTabKey={featureBinTabKey}
              onNext={this.props.setTab}
            />
          </StackItem>
        )}
        {(this.props.activeTabKey === featureBinTabKey ||
          this.props.activeTabKey === performanceTabKey ||
          this.props.activeTabKey === fairnessTabKey) && (
          <Stack.Item grow={2}>
            <Pivot
              className={styles.pivot}
              styles={{
                itemContainer: {
                  height: "100%"
                }
              }}
              selectedKey={this.props.activeTabKey}
              onLinkClick={this.props.handleTabClick}
              overflowBehavior="menu"
            >
              <PivotItem
                headerText={localization.Fairness.sensitiveFeatures}
                itemKey={featureBinTabKey}
                style={{ height: "100%", paddingLeft: "8px" }}
              >
                <FeatureTab
                  dashboardContext={this.props.dashboardContext}
                  nextTabKey={performanceTabKey}
                  selectedFeatureChange={this.props.setBinIndex}
                  selectedFeatureIndex={this.props.selectedBinIndex}
                  featureBins={this.props.featureBins.filter((x) => !!x)}
                  onSetTab={this.props.setTab}
                  saveBin={this.props.saveBin}
                />
              </PivotItem>
              <PivotItem
                headerText={localization.Fairness.performanceMetric}
                itemKey={performanceTabKey}
                style={{ height: "100%", paddingLeft: "8px" }}
              >
                <PerformanceTab
                  dashboardContext={this.props.dashboardContext}
                  nextTabKey={
                    flights.skipFairness ? reportTabKey : fairnessTabKey
                  }
                  performancePickerProps={performancePickerProps}
                  previousTabKey={featureBinTabKey}
                  onSetTab={this.props.setTab}
                />
              </PivotItem>
              {flights.skipFairness === false && (
                <PivotItem
                  headerText={localization.Fairness.fairnessMetric}
                  itemKey={fairnessTabKey}
                  style={{ height: "100%", paddingLeft: "8px" }}
                >
                  <FairnessTab
                    dashboardContext={this.props.dashboardContext}
                    fairnessPickerProps={fairnessPickerProps}
                    nextTabKey={reportTabKey}
                    previousTabKey={performanceTabKey}
                    onSetTab={this.props.setTab}
                  />
                </PivotItem>
              )}
            </Pivot>
          </Stack.Item>
        )}
        {this.props.activeTabKey === reportTabKey &&
          this.props.selectedModelId !== undefined && (
            <WizardReport
              showIntro={this.props.showIntro}
              dashboardContext={this.props.dashboardContext}
              metricsCache={this.props.metricCache}
              modelCount={this.props.predictedY.length}
              performancePickerProps={performancePickerProps}
              onChartClick={this.props.onSelectModel}
              fairnessPickerProps={fairnessPickerProps}
              errorPickerProps={errorPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              selectedModelIndex={this.props.selectedModelId}
              onHideIntro={this.props.hideIntro}
            />
          )}
        {this.props.activeTabKey === reportTabKey &&
          this.props.selectedModelId === undefined && (
            <ModelComparisonChart
              showIntro={this.props.showIntro}
              dashboardContext={this.props.dashboardContext}
              metricsCache={this.props.metricCache}
              onChartClick={this.props.onSelectModel}
              modelCount={this.props.predictedY.length}
              performancePickerProps={performancePickerProps}
              fairnessPickerProps={fairnessPickerProps}
              errorPickerProps={errorPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              onHideIntro={this.props.hideIntro}
            />
          )}
      </>
    );
  }
}
