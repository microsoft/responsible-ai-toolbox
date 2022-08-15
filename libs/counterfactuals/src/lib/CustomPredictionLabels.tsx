// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton, Text } from "@fluentui/react";
import {
  IExplanationModelMetadata,
  ModelTypes,
  JointDataset,
  ModelExplanationUtils
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CounterfactualConstants } from "./CounterfactualConstants";
import { counterfactualPanelStyles } from "./CounterfactualPanel.styles";

export interface ICustomPredictionLabelsProps {
  metadata: IExplanationModelMetadata;
  jointDataset: JointDataset;
  selectedWhatIfRootIndex: number;
  temporaryPoint: { [key: string]: string | number } | undefined;
}
export class CustomPredictionLabels extends React.Component<ICustomPredictionLabelsProps> {
  public render(): React.ReactNode {
    const classNames = counterfactualPanelStyles();
    if (this.props.metadata.modelType !== ModelTypes.Regression) {
      const predictedClass = this.props.jointDataset.hasPredictedY
        ? this.props.temporaryPoint?.[JointDataset.PredictedYLabel]
        : undefined;
      const predictedProb =
        this.props.jointDataset.hasPredictedProbabilities &&
        predictedClass !== undefined
          ? this.props.temporaryPoint?.[
              JointDataset.ProbabilityYRoot + predictedClass.toString()
            ]
          : undefined;
      if (predictedProb !== undefined) {
        const basePredictedProbs = JointDataset.predictProbabilitySlice(
          this.props.jointDataset.getRow(this.props.selectedWhatIfRootIndex),
          this.props.metadata.classNames.length
        );
        const predictedProbs = JointDataset.predictProbabilitySlice(
          this.props.temporaryPoint || [],
          this.props.metadata.classNames.length
        );
        const sortedProbs = ModelExplanationUtils.getSortIndices(predictedProbs)
          .reverse()
          .slice(0, CounterfactualConstants.MAX_CLASSES_TOOLTIP);
        const tooltipClasses = sortedProbs.map((index) => {
          const className =
            this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
              .sortedCategoricalValues?.[index];
          return (
            <Text block variant="small" key={index}>
              {className}
            </Text>
          );
        });
        const tooltipProbs = sortedProbs.map((index) => {
          const prob = predictedProbs[index];
          return (
            <Text block variant="small" key={index}>
              {prob.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </Text>
          );
        });
        const tooltipDeltas = sortedProbs.map((index) => {
          const delta = predictedProbs[index] - basePredictedProbs[index];
          if (delta < 0) {
            return (
              <Text
                className={classNames.negativeNumber}
                block
                variant="small"
                key={index}
              >
                {delta.toLocaleString(undefined, { maximumFractionDigits: 3 })}
              </Text>
            );
          }
          if (delta > 0) {
            return (
              <Text
                className={classNames.positiveNumber}
                block
                variant="small"
                key={index}
              >
                {`+${delta.toLocaleString(undefined, {
                  maximumFractionDigits: 3
                })}`}
              </Text>
            );
          }
          return (
            <Text block variant="small" key={index}>
              0
            </Text>
          );
        });
        return (
          <div className={classNames.predictedBlock}>
            <div className={classNames.tooltipWrapper}>
              <div className={classNames.tooltipTitle}>
                <Text variant="large">
                  {localization.Interpret.WhatIfTab.whatIfTooltipTitle}
                </Text>
              </div>
              <div className={classNames.tooltipTable}>
                <div className={classNames.tooltipColumn}>
                  <Text className={classNames.boldText}>
                    {localization.Interpret.WhatIfTab.classPickerLabel}
                  </Text>
                  {tooltipClasses}
                </div>
                <div className={classNames.tooltipColumn}>
                  <Text block className={classNames.boldText}>
                    {localization.Interpret.WhatIfTab.probabilityLabel}
                  </Text>
                  {tooltipProbs}
                </div>
                <div className={classNames.tooltipColumn}>
                  <Text block className={classNames.boldText}>
                    {localization.Interpret.WhatIfTab.deltaLabel}
                  </Text>
                  {tooltipDeltas}
                </div>
              </div>
            </div>
          </div>
        );
      }
      // loading predictions, show placeholders
      return (
        <div className={classNames.predictedBlock}>
          <div>
            <IconButton
              className={classNames.tooltipHost}
              iconProps={{ iconName: "More" }}
              disabled
            />
          </div>
          <div>
            <div>
              <Text variant="small">
                {localization.Interpret.WhatIfTab.loading}
              </Text>
            </div>
            <div>
              <Text variant="small">
                {localization.Interpret.WhatIfTab.loading}
              </Text>
            </div>
          </div>
        </div>
      );
    }
    const predictedValueString =
      this.props.temporaryPoint?.[JointDataset.PredictedYLabel] !== undefined
        ? this.props.temporaryPoint?.[
            JointDataset.PredictedYLabel
          ].toLocaleString(undefined, {
            maximumFractionDigits: 3
          })
        : localization.Interpret.WhatIfTab.loading;
    return (
      <div className={classNames.customPredictBlock}>
        <div>
          <Text className={classNames.boldText} variant="small">
            {localization.Interpret.WhatIfTab.newPredictedValue}
          </Text>
          <Text variant="small" id="WhatIfNewPredictedValue">
            {predictedValueString}
          </Text>
        </div>
      </div>
    );
  }
}
