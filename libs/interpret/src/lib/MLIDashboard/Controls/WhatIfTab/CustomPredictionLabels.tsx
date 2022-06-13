// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DirectionalHint,
  IconButton,
  ITooltipProps,
  Text,
  TooltipDelay,
  TooltipHost
} from "@fluentui/react";
import {
  IExplanationModelMetadata,
  ModelTypes,
  JointDataset,
  ModelExplanationUtils
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { WhatIfConstants } from "./WhatIfConstants";
import { whatIfTabStyles } from "./WhatIfTab.styles";

export interface ICustomPredictionLabelsProps {
  metadata: IExplanationModelMetadata;
  jointDataset: JointDataset;
  selectedWhatIfRootIndex: number;
  temporaryPoint: { [key: string]: any } | undefined;
}
export class CustomPredictionLabels extends React.Component<ICustomPredictionLabelsProps> {
  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
    if (this.props.metadata.modelType !== ModelTypes.Regression) {
      const predictedClass = this.props.jointDataset.hasPredictedY
        ? this.props.temporaryPoint?.[JointDataset.PredictedYLabel]
        : undefined;
      const predictedClassName =
        predictedClass !== undefined
          ? this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
              .sortedCategoricalValues?.[predictedClass]
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
          .slice(0, WhatIfConstants.MAX_CLASSES_TOOLTIP);
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
        const tooltipProps: ITooltipProps = {
          onRenderContent: () => (
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
          )
        };
        return (
          <div className={classNames.predictedBlock}>
            <TooltipHost
              tooltipProps={tooltipProps}
              delay={TooltipDelay.zero}
              id={WhatIfConstants.whatIfPredictionTooltipIds}
              directionalHint={DirectionalHint.leftCenter}
              styles={{ root: { display: "inline-block" } }}
            >
              <IconButton
                className={classNames.tooltipHost}
                iconProps={{ iconName: "More" }}
              />
            </TooltipHost>
            <div>
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.Interpret.WhatIfTab.newPredictedClass}
                </Text>
                <Text variant="small">{predictedClassName}</Text>
              </div>
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.Interpret.WhatIfTab.newProbability}
                </Text>
                <Text variant="small" id="WhatIfNewProbability">
                  {predictedProb.toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })}
                </Text>
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
