// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  ICompositeFilter,
  CohortSource,
  ErrorCohort,
  MetricCohortStats,
  IErrorAnalysisMatrix
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IStackTokens,
  ITheme,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { IMatrixAreaState, IMatrixFilterState } from "../../MatrixFilterState";
import { MatrixArea } from "../MatrixArea/MatrixArea";
import { MatrixLegend } from "../MatrixLegend/MatrixLegend";

import { matrixFilterStyles } from "./MatrixFilter.styles";

export interface IMatrixFilterProps {
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
  state: IMatrixFilterState;
  matrixAreaState: IMatrixAreaState;
  setMatrixAreaState: (matrixAreaState: IMatrixAreaState) => void;
  setMatrixFilterState: (matrixFilterState: IMatrixFilterState) => void;
  isEnabled: boolean;
}

const stackTokens: IStackTokens = { childrenGap: 5 };

export class MatrixFilter extends React.PureComponent<
  IMatrixFilterProps,
  IMatrixFilterState
> {
  private options: IComboBoxOption[];
  public constructor(props: IMatrixFilterProps) {
    super(props);
    this.state = this.props.state;
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
  }

  public componentWillUnmount(): void {
    this.props.setMatrixFilterState(this.state);
  }

  public render(): React.ReactNode {
    const classNames = matrixFilterStyles();
    return (
      <div className={classNames.matrixFilter}>
        <Stack tokens={stackTokens}>
          <MatrixLegend
            selectedCohort={this.props.selectedCohort}
            baseCohort={this.props.baseCohort}
            max={this.state.matrixLegendState.maxMetricValue}
          />
          <Stack horizontal tokens={stackTokens} horizontalAlign="start">
            <Stack.Item key="feature1key">
              <ComboBox
                defaultSelectedKey=""
                label="Y-Axis: Feature 1"
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
                defaultSelectedKey=""
                label="X-Axis: Feature 2"
                options={this.options}
                dropdownMaxWidth={300}
                useComboBoxAsMenuWidth
                onChange={this.handleFeature2Changed}
                calloutProps={{
                  calloutMaxHeight: 300,
                  directionalHintFixed: true
                }}
                disabled={!this.props.isEnabled}
              />
            </Stack.Item>
          </Stack>
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
            state={this.props.matrixAreaState}
            setMatrixAreaState={this.props.setMatrixAreaState}
          />
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

  private updateMatrixLegendState = (maxMetricValue: number): void => {
    this.setState({ matrixLegendState: { maxMetricValue } });
  };
}
