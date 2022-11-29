// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  IStackTokens,
  ITheme,
  MessageBar,
  MessageBarType,
  Stack,
  Text
} from "@fluentui/react";
import {
  IFilter,
  ICompositeFilter,
  CohortSource,
  defaultModelAssessmentContext,
  ErrorCohort,
  MetricCohortStats,
  ModelAssessmentContext,
  IErrorAnalysisMatrix,
  ITelemetryEvent
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { MetricSelector } from "../../MetricSelector/MetricSelector";
import { MatrixArea } from "../MatrixArea/MatrixArea";
import {
  createInitialMatrixFilterState,
  IMatrixFilterState
} from "../MatrixFilterState";
import { MatrixLegend } from "../MatrixLegend/MatrixLegend";
import { MatrixSummary } from "../MatrixSummary/MatrixSummary";

import { matrixFilterStyles } from "./MatrixFilter.styles";

export interface IMatrixFilterProps {
  disabledView: boolean;
  theme?: ITheme;
  features: string[];
  getMatrix?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisMatrix>;
  matrix?: IErrorAnalysisMatrix;
  matrixFeatures?: string[];
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  isEnabled: boolean;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

const stackTokens: IStackTokens = { childrenGap: "l1" };

export class MatrixFilter extends React.PureComponent<
  IMatrixFilterProps,
  IMatrixFilterState
> {
  public static contextType = ModelAssessmentContext;
  private static savedState: IMatrixFilterState | undefined;
  private static saveStateOnUnmount = true;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private options: IComboBoxOption[];
  public constructor(props: IMatrixFilterProps) {
    super(props);
    if (
      this.props.selectedCohort !== this.props.baseCohort &&
      MatrixFilter.savedState
    ) {
      this.state = MatrixFilter.savedState;
    } else {
      this.state = createInitialMatrixFilterState();
    }
    this.options = [
      { key: "", text: localization.ErrorAnalysis.noFeature },
      ...props.features.map((feature) => {
        return { key: feature, text: feature };
      })
    ];
    if (!this.props.isEnabled && this.props.matrixFeatures) {
      const features = this.props.matrixFeatures;
      this.state = {
        matrixLegendState: this.state.matrixLegendState,
        selectedFeature1: features[0],
        selectedFeature2: features[1]
      };
    }
    MatrixFilter.saveStateOnUnmount = true;
  }

  public static resetState(): void {
    MatrixFilter.saveStateOnUnmount = false;
  }

  public componentWillUnmount(): void {
    if (MatrixFilter.saveStateOnUnmount) {
      MatrixFilter.savedState = this.state;
    } else {
      MatrixFilter.savedState = undefined;
    }
  }

  public render(): React.ReactNode {
    const classNames = matrixFilterStyles();
    const featuresUnselected =
      !this.state.selectedFeature1 && !this.state.selectedFeature2;
    return (
      <div className={classNames.matrixFilter}>
        <Stack tokens={stackTokens}>
          <MatrixSummary isEnabled={this.props.isEnabled} />
          {this.props.disabledView && (
            <MessageBar messageBarType={MessageBarType.warning}>
              <Text>
                {localization.ErrorAnalysis.MatrixFilter.disabledWarning}
              </Text>
            </MessageBar>
          )}
          <Stack.Item>
            <MatrixLegend
              selectedCohort={this.props.selectedCohort}
              baseCohort={this.props.baseCohort}
              max={this.state.matrixLegendState.maxMetricValue}
              isErrorMetric={this.state.matrixLegendState.isErrorMetric}
              disabledView={this.props.disabledView}
            />
          </Stack.Item>
          <Stack.Item>
            <Stack
              horizontal
              tokens={stackTokens}
              horizontalAlign="start"
              className={classNames.selections}
            >
              <Stack.Item grow>
                <MetricSelector
                  isEnabled={this.props.isEnabled && !featuresUnselected}
                  setMetric={this.setMetric}
                  telemetryHook={this.props.telemetryHook}
                />
              </Stack.Item>
              <Stack.Item grow>
                <Stack horizontal className={classNames.featureSelections}>
                  <Stack.Item
                    key="feature1key"
                    className={classNames.rowSelection}
                  >
                    <ComboBox
                      defaultSelectedKey={this.state.selectedFeature1 || ""}
                      label={
                        localization.ErrorAnalysis.MetricSelector
                          .feature1SelectorLabel
                      }
                      options={this.options}
                      dropdownMaxWidth={300}
                      useComboBoxAsMenuWidth
                      onChange={this.handleFeature1Changed}
                      calloutProps={{
                        calloutMaxHeight: 300,
                        directionalHintFixed: true
                      }}
                      disabled={!this.props.isEnabled}
                    />
                  </Stack.Item>
                  <Stack.Item key="feature2key">
                    <ComboBox
                      defaultSelectedKey={this.state.selectedFeature2 || ""}
                      label={
                        localization.ErrorAnalysis.MetricSelector
                          .feature2SelectorLabel
                      }
                      options={this.options}
                      dropdownMaxWidth={300}
                      useComboBoxAsMenuWidth
                      onChange={this.handleFeature2Changed}
                      calloutProps={{
                        calloutMaxHeight: 300,
                        directionalHintFixed: true
                      }}
                      defaultValue={this.state.selectedFeature2}
                      disabled={!this.props.isEnabled}
                    />
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            </Stack>
          </Stack.Item>
          {!this.props.disabledView && (
            <Stack.Item>
              <MatrixArea
                theme={this.props.theme}
                features={this.props.features}
                getMatrix={this.props.getMatrix}
                matrix={this.props.matrix}
                selectedFeature1={this.state.selectedFeature1}
                selectedFeature2={this.state.selectedFeature2}
                updateSelectedCohort={this.props.updateSelectedCohort}
                selectedCohort={this.props.selectedCohort}
                baseCohort={this.props.baseCohort}
                updateMatrixLegendState={this.updateMatrixLegendState}
                isEnabled={this.props.isEnabled}
                metric={this.context.errorAnalysisData?.metric}
                telemetryHook={this.props.telemetryHook}
              />
            </Stack.Item>
          )}
        </Stack>
      </div>
    );
  }

  private handleFeature1Changed = (
    _?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key == "string") {
      this.setState({ selectedFeature1: item.key });
    }
  };

  private handleFeature2Changed = (
    _?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key == "string") {
      this.setState({ selectedFeature2: item.key });
    }
  };

  private setMetric = (metric: string): void => {
    if (this.context.errorAnalysisData) {
      this.context.errorAnalysisData.metric = metric;
    }
    this.forceUpdate();
  };

  private updateMatrixLegendState = (
    maxMetricValue: number,
    isErrorMetric: boolean
  ): void => {
    this.setState({
      matrixLegendState: { isErrorMetric, maxMetricValue }
    });
  };
}
