// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  ICompositeFilter,
  CohortSource,
  ErrorCohort,
  CohortStats
} from "@responsible-ai/core-ui";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IStackTokens,
  ITheme,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { noFeature } from "../../Constants";
import { IMatrixAreaState, IMatrixFilterState } from "../../MatrixFilterState";
import { MatrixArea } from "../MatrixArea/MatrixArea";
import { MatrixLegend } from "../MatrixLegend/MatrixLegend";

import { matrixFilterStyles } from "./MatrixFilter.styles";

export interface IMatrixFilterProps {
  theme?: ITheme;
  features: string[];
  getMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  staticMatrix?: any;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: CohortStats | undefined
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
  private selectedKey1: number;
  private selectedKey2: number;
  public constructor(props: IMatrixFilterProps) {
    super(props);
    this.state = this.props.state;
    this.options = [{ key: 0, text: noFeature }].concat(
      props.features.map((feature, index) => {
        return { key: index + 1, text: feature };
      })
    );
    this.selectedKey1 = 0;
    this.selectedKey2 = 0;
    if (!this.props.isEnabled) {
      const features = this.props.staticMatrix.features;
      this.state = {
        matrixLegendState: this.state.matrixLegendState,
        selectedFeature1: features[0],
        selectedFeature2: features[1]
      };
    }
    if (this.state.selectedFeature1 !== noFeature) {
      this.selectedKey1 = this.options.findIndex(
        (option) => option.text === this.state.selectedFeature1
      );
    }
    if (this.state.selectedFeature2 !== noFeature) {
      this.selectedKey2 = this.options.findIndex(
        (option) => option.text === this.state.selectedFeature2
      );
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
            max={this.state.matrixLegendState.maxError}
          />
          <Stack horizontal tokens={stackTokens} horizontalAlign="start">
            <Stack.Item key="feature1key">
              <ComboBox
                selectedKey={this.selectedKey1}
                label="X-Axis: Feature 1"
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
                selectedKey={this.selectedKey2}
                label="Y-Axis: Feature 2"
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
            staticMatrixData={this.props.staticMatrix.data}
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
    if (item !== undefined) {
      if (item.text !== noFeature) {
        this.selectedKey1 = this.options.findIndex(
          (option) => option.text === item.text
        );
      } else {
        this.selectedKey1 = 0;
      }
      this.setState({ selectedFeature1: item.text });
    }
  };

  private handleFeature2Changed = (
    _?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item !== undefined) {
      if (item.text !== noFeature) {
        this.selectedKey2 = this.options.findIndex(
          (option) => option.text === item.text
        );
      } else {
        this.selectedKey2 = 0;
      }
      this.setState({ selectedFeature2: item.text });
    }
  };

  private updateMatrixLegendState = (maxError: number): void => {
    this.setState({ matrixLegendState: { maxError } });
  };
}
