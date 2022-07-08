// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Slider, Label } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { InfoCallout } from "../InfoCallout/InfoCallout";

import { treeViewParametersStyles } from "./TreeViewParameters.styles";

export interface ITreeViewParametersProps {
  updateMaxDepth: (maxDepth: number) => void;
  updateNumLeaves: (numLeaves: number) => void;
  updateMinChildSamples: (minChildSamples: number) => void;
  maxDepth: number;
  numLeaves: number;
  minChildSamples: number;
  isEnabled: boolean;
}

export interface ITreeViewParametersState {
  maxDepth: number;
  numLeaves: number;
  minChildSamples: number;
}

export class TreeViewParameters extends React.Component<
  ITreeViewParametersProps,
  ITreeViewParametersState
> {
  private readonly _maximumDepthIconId = "maximumDepthIconId";
  private readonly _numLeavesIconId = "numLeavesIconId";
  private readonly _minChildSamplesIconId = "minChildSamplesIconId";

  public render(): React.ReactNode {
    const classNames = treeViewParametersStyles();
    return (
      <div>
        <Label
          className={classNames.sliderLabelStyle}
          disabled={!this.props.isEnabled}
        >
          {localization.ErrorAnalysis.TreeViewParameters.maximumDepth}
          <InfoCallout
            iconId={this._maximumDepthIconId}
            infoText={
              localization.ErrorAnalysis.TreeViewParameters.maximumDepthInfoText
            }
            title={
              localization.ErrorAnalysis.TreeViewParameters.maximumDepthTitle
            }
          />
        </Label>
        <Slider
          max={10}
          min={1}
          step={1}
          value={this.props.maxDepth}
          showValue
          onChange={this.onMaxDepthSliderChanged}
          disabled={!this.props.isEnabled}
        />
        <Label
          className={classNames.sliderLabelStyle}
          disabled={!this.props.isEnabled}
        >
          {localization.ErrorAnalysis.TreeViewParameters.numLeaves}
          <InfoCallout
            iconId={this._numLeavesIconId}
            infoText={
              localization.ErrorAnalysis.TreeViewParameters.numLeavesInfoText
            }
            title={localization.ErrorAnalysis.TreeViewParameters.numLeavesTitle}
          />
        </Label>
        <Slider
          max={100}
          min={1}
          step={1}
          value={this.props.numLeaves}
          showValue
          onChange={this.onNumLeavesSliderChanged}
          disabled={!this.props.isEnabled}
        />
        <Label
          className={classNames.sliderLabelStyle}
          disabled={!this.props.isEnabled}
        >
          {localization.ErrorAnalysis.TreeViewParameters.minDataInLeaf}
          <InfoCallout
            iconId={this._minChildSamplesIconId}
            infoText={
              localization.ErrorAnalysis.TreeViewParameters
                .minDataInLeafInfoText
            }
            title={
              localization.ErrorAnalysis.TreeViewParameters.minDataInLeafTitle
            }
          />
        </Label>
        <Slider
          max={100}
          min={1}
          step={1}
          value={this.props.minChildSamples}
          showValue
          onChange={this.onMinChildSamplesSliderChanged}
          disabled={!this.props.isEnabled}
        />
      </div>
    );
  }

  private onMaxDepthSliderChanged = (value: number): void => {
    this.props.updateMaxDepth(value);
  };

  private onNumLeavesSliderChanged = (value: number): void => {
    this.props.updateNumLeaves(value);
  };

  private onMinChildSamplesSliderChanged = (value: number): void => {
    this.props.updateMinChildSamples(value);
  };
}
