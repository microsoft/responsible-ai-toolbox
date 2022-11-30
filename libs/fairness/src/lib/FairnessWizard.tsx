// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  PivotItem,
  Stack,
  loadTheme,
  MessageBar,
  MessageBarType,
  Text
} from "@fluentui/react";
import { defaultTheme } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { EmptyHeader } from "./Controls/EmptyHeader";
import { FairnessWizardStyles } from "./FairnessWizard.styles";
import {
  flights,
  getFairnessWizardState,
  IWizardStateV2
} from "./FairnessWizardState";
import { FairnessWizardTabs } from "./FairnessWizardTabs";
import { IFairnessProps } from "./IFairnessProps";
import { IFairnessOption } from "./util/FairnessMetrics";
import { IBinnedResponse } from "./util/IBinnedResponse";
import { IPerformanceOption } from "./util/PerformanceMetrics";
import { WizardBuilder } from "./util/WizardBuilder";

export interface IPerformancePickerPropsV2 {
  performanceOptions: IPerformanceOption[];
  selectedPerformanceKey: string;
  onPerformanceChange: (newKey: string) => void;
}

export interface IFairnessPickerPropsV2 {
  fairnessOptions: IFairnessOption[];
  selectedFairnessKey: string;
  onFairnessChange: (newKey: string) => void;
}

export interface IErrorPickerProps {
  errorBarsEnabled: boolean;
  onErrorChange: (newKey: boolean) => void;
}

export interface IFeatureBinPickerPropsV2 {
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  onBinChange: (index: number) => void;
}

export class FairnessWizard extends React.PureComponent<
  IFairnessProps,
  IWizardStateV2
> {
  public constructor(props: IFairnessProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    loadTheme(props.theme || defaultTheme);
    this.state = getFairnessWizardState(props);
  }

  public componentDidUpdate(prev: IFairnessProps): void {
    if (prev.theme !== this.props.theme) {
      loadTheme(this.props.theme || defaultTheme);
    }
    if (this.props.locale && prev.locale !== this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
  }

  public render(): React.ReactNode {
    const styles = FairnessWizardStyles();
    if (!this.state.selectedPerformanceKey) {
      return (
        <MessageBar messageBarType={MessageBarType.warning}>
          <Text>
            {localization.Fairness.ValidationErrors.missingPerformanceMetric}
          </Text>
        </MessageBar>
      );
    }
    if (!this.state.selectedFairnessKey) {
      return (
        <MessageBar messageBarType={MessageBarType.warning}>
          <Text>
            {localization.Fairness.ValidationErrors.missingFairnessMetric}
          </Text>
        </MessageBar>
      );
    }
    if (this.state.featureBins.length === 0) {
      return (
        <Stack className={styles.frame}>
          <EmptyHeader />
        </Stack>
      );
    }
    return (
      <Stack className={styles.frame}>
        <EmptyHeader />
        <FairnessWizardTabs
          predictedY={this.props.predictedY}
          showIntro={this.state.showIntro}
          activeTabKey={this.state.activeTabKey}
          selectedModelId={this.state.selectedModelId}
          dashboardContext={this.state.dashboardContext}
          performanceMetrics={this.state.performanceMetrics}
          fairnessMetrics={this.state.fairnessMetrics}
          selectedPerformanceKey={this.state.selectedPerformanceKey}
          selectedFairnessKey={this.state.selectedFairnessKey}
          errorBarsEnabled={this.state.errorBarsEnabled}
          featureBins={this.state.featureBins}
          selectedBinIndex={this.state.selectedBinIndex}
          metricCache={this.state.metricCache}
          hideIntro={this.hideIntro}
          setTab={this.setTab}
          onSelectModel={this.onSelectModel}
          setPerformanceKey={this.setPerformanceKey}
          setFairnessKey={this.setFairnessKey}
          setErrorBarsEnabled={this.setErrorBarsEnabled}
          setBinIndex={this.setBinIndex}
          saveBin={this.saveBin}
          handleTabClick={this.handleTabClick}
        />
      </Stack>
    );
  }

  private readonly hideIntro = (): void => {
    this.setState({ showIntro: false });
  };

  private readonly setTab = (key: string): void => {
    this.setState({ activeTabKey: key });
  };

  private readonly onSelectModel = (data: any): void => {
    if (!data) {
      this.setState({ selectedModelId: undefined });
      return;
    }
    if (data.points && data.points[0]) {
      this.setState({ selectedModelId: data.points[0].customdata.modelId });
    }
  };

  private readonly setPerformanceKey = (key: string): void => {
    const value: Partial<IWizardStateV2> = { selectedPerformanceKey: key };
    if (flights.skipFairness) {
      value.selectedFairnessKey = key;
    }
    this.setState(value as IWizardStateV2);
  };

  private readonly setFairnessKey = (key: string): void => {
    this.setState({ selectedFairnessKey: key });
  };

  private readonly setErrorBarsEnabled = (key: boolean): void => {
    this.setState({ errorBarsEnabled: key });
  };

  private readonly setBinIndex = (index: number): void => {
    if (this.props.precomputedMetrics) {
      const newContext = _.cloneDeep(this.state.dashboardContext);

      newContext.binVector = this.props.precomputedFeatureBins[index].binVector;
      newContext.groupNames =
        this.props.precomputedFeatureBins[index].binLabels;

      this.setState({ dashboardContext: newContext, selectedBinIndex: index });
    } else {
      this.binningSet(this.state.featureBins[index]);
    }
  };

  private readonly handleTabClick = (item?: PivotItem): void => {
    if (item?.props?.itemKey) {
      this.setState({ activeTabKey: item.props.itemKey });
    }
  };

  private readonly binningSet = (value: IBinnedResponse): void => {
    if (!value || value.hasError || value.array.length === 0) {
      return;
    }
    const newContext = _.cloneDeep(this.state.dashboardContext);

    newContext.binVector = WizardBuilder.generateBinVectorForBin(
      value,
      this.state.dashboardContext.dataset
    );
    newContext.groupNames = value.labelArray;

    this.setState({
      dashboardContext: newContext,
      selectedBinIndex: value.featureIndex
    });
  };

  private readonly saveBin = (bin: IBinnedResponse): void => {
    const newBin = [...this.state.featureBins];
    newBin[bin.featureIndex] = bin;
    this.setState({ featureBins: newBin });
    this.state.metricCache.clearCache(bin.featureIndex);
    this.binningSet(bin);
  };
}
