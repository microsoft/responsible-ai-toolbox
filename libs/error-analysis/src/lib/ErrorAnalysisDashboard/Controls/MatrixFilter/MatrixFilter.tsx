// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFilter, ICompositeFilter } from "@responsible-ai/interpret";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IStackTokens,
  ITheme,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { MatrixArea } from "../MatrixArea/MatrixArea";
import { MatrixLegend } from "../MatrixLegend/MatrixLegend";

import { matrixFilterStyles } from "./MatrixFilter.styles";

export interface IMatrixFilterProps {
  theme?: ITheme;
  features: string[];
  getMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource,
    cells: number
  ) => void;
  selectedCohort: ErrorCohort;
}

export interface IMatrixFilterState {
  selectedFeature1?: string;
  selectedFeature2?: string;
}

const stackTokens: IStackTokens = { childrenGap: 5 };

export class MatrixFilter extends React.PureComponent<
  IMatrixFilterProps,
  IMatrixFilterState
> {
  private options: IComboBoxOption[];
  public constructor(props: IMatrixFilterProps) {
    super(props);
    this.state = {
      selectedFeature1: undefined,
      selectedFeature2: undefined
    };
    this.options = props.features.map((feature, index) => {
      return { key: index, text: feature };
    });
  }

  public render(): React.ReactNode {
    const classNames = matrixFilterStyles();
    return (
      <div className={classNames.matrixFilter}>
        <Stack tokens={stackTokens}>
          <MatrixLegend selectedCohort={this.props.selectedCohort} />
          <Stack horizontal tokens={stackTokens} horizontalAlign="start">
            <Stack.Item key="feature1key">
              <ComboBox
                placeholder="No Feature"
                label="X-Axis: Feature 1"
                options={this.options}
                dropdownMaxWidth={300}
                useComboBoxAsMenuWidth
                onChange={this.handleFeature1Changed}
                calloutProps={{
                  calloutMaxHeight: 300,
                  directionalHintFixed: true
                }}
              />
            </Stack.Item>
            <Stack.Item key="feature2key">
              <ComboBox
                placeholder="No Feature"
                label="Y-Axis: Feature 2"
                options={this.options}
                dropdownMaxWidth={300}
                useComboBoxAsMenuWidth
                onChange={this.handleFeature2Changed}
                calloutProps={{
                  calloutMaxHeight: 300,
                  directionalHintFixed: true
                }}
              />
            </Stack.Item>
          </Stack>
          <MatrixArea
            theme={this.props.theme}
            features={this.props.features}
            getMatrix={this.props.getMatrix}
            selectedFeature1={this.state.selectedFeature1}
            selectedFeature2={this.state.selectedFeature2}
            updateSelectedCohort={this.props.updateSelectedCohort}
            selectedCohort={this.props.selectedCohort}
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
      this.setState({ selectedFeature1: item.text });
    }
  };

  private handleFeature2Changed = (
    _?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item !== undefined) {
      this.setState({ selectedFeature2: item.text });
    }
  };
}
