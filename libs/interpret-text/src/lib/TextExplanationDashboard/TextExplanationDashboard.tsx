// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import React from "react";

import { TextExplanationView } from "./Control/TextExplanationView/TextExplanationView";
import { ITextExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";

export interface ITextExplanationDashboardState {
  /*
   * Holds the state of the dashboard
   */
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
  isQA?: boolean;
}

export class TextExplanationDashboard extends React.PureComponent<
  ITextExplanationDashboardProps,
  ITextExplanationDashboardState
> {
  public constructor(props: ITextExplanationDashboardProps) {
    /*
     * Initializes the dashboard with its state
     */
    super(props);
    const weightVectorLabels = {
      [WeightVectors.AbsAvg]: localization.Interpret.absoluteAverage
    };
    const weightVectorOptions = [];
    weightVectorOptions.push(WeightVectors.AbsAvg);
    props.dataSummary.classNames?.forEach((name, index) => {
      weightVectorLabels[index] = localization.formatString(
        localization.Interpret.WhatIfTab.classLabel,
        name
      );
      weightVectorOptions.push(index);
    });
    this.state = {
      isQA: false,
      selectedWeightVector: WeightVectors.AbsAvg,
      weightVectorLabels,
      weightVectorOptions
    };
  }

  public render(): React.ReactNode {
    return (
      <TextExplanationView
        dataSummary={this.props.dataSummary}
        onWeightChange={this.onWeightVectorChange}
        selectedWeightVector={this.state.selectedWeightVector}
        weightOptions={this.state.weightVectorOptions}
        weightLabels={this.state.weightVectorLabels}
        isQA={this.state.isQA}
      />
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.setState({ selectedWeightVector: weightOption });
  };
}
