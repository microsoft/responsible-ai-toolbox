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

export interface IExistingPredictionLabelsProps {
  metadata: IExplanationModelMetadata;
  jointDataset: JointDataset;
  selectedWhatIfRootIndex: number;
}
export class ExistingPredictionLabels extends React.Component<IExistingPredictionLabelsProps> {
  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
    if (this.props.metadata.modelType !== ModelTypes.Regression) {
      const row = this.props.jointDataset.getRow(
        this.props.selectedWhatIfRootIndex
      );
      const trueClass = this.props.jointDataset.hasTrueY
        ? row[JointDataset.TrueYLabel]
        : undefined;
      const predictedClass = this.props.jointDataset.hasPredictedY
        ? row[JointDataset.PredictedYLabel]
        : undefined;
      const predictedClassName =
        predictedClass !== undefined
          ? this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
              .sortedCategoricalValues?.[predictedClass]
          : undefined;
      if (this.props.jointDataset.hasPredictedProbabilities) {
        let predictedProb: number | string;
        let tempPredictedProb: number | undefined | string = undefined;
        if (
          this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
            ?.treatAsCategorical
        ) {
          const categoricalValues =
            this.props.jointDataset.metaDict[JointDataset.PredictedYLabel]
              .sortedCategoricalValues;
          const categoricalClassIndex = categoricalValues?.indexOf(
            predictedClass as unknown as string
          );
          tempPredictedProb =
            row[
              JointDataset.ProbabilityYRoot + categoricalClassIndex?.toString()
            ];
        }
        if (!tempPredictedProb) {
          predictedProb =
            row[JointDataset.ProbabilityYRoot + predictedClass?.toString()];
        } else {
          predictedProb = tempPredictedProb;
        }
        const predictedProbs = JointDataset.predictProbabilitySlice(
          row,
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
        const tooltipProbs = sortedProbs.map((index, key) => {
          const prob = predictedProbs[index];
          return (
            <Text block variant="small" key={key}>
              {prob.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </Text>
          );
        });
        const tooltipTitle =
          predictedProbs.length > WhatIfConstants.MAX_CLASSES_TOOLTIP
            ? localization.Interpret.WhatIfTab.tooltipTitleMany
            : localization.Interpret.WhatIfTab.tooltipTitleFew;
        const tooltipProps: ITooltipProps = {
          onRenderContent: () => (
            <div className={classNames.tooltipWrapper}>
              <div className={classNames.tooltipTitle}>
                <Text variant="large">{tooltipTitle}</Text>
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
              </div>
            </div>
          )
        };
        return (
          <div className={classNames.predictedBlock}>
            <TooltipHost
              tooltipProps={tooltipProps}
              delay={TooltipDelay.zero}
              id={WhatIfConstants.basePredictionTooltipIds}
              directionalHint={DirectionalHint.leftCenter}
              styles={{ root: { display: "inline-block" } }}
            >
              <IconButton
                className={classNames.tooltipHost}
                iconProps={{ iconName: "More" }}
              />
            </TooltipHost>
            <div>
              {trueClass !== undefined && (
                <div>
                  <Text className={classNames.boldText} variant="small">
                    {localization.Interpret.WhatIfTab.trueClass}
                  </Text>
                  <Text variant="small">
                    {
                      this.props.jointDataset.metaDict[
                        JointDataset.PredictedYLabel
                      ].sortedCategoricalValues?.[trueClass]
                    }
                  </Text>
                </div>
              )}
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.Interpret.WhatIfTab.predictedClass}
                </Text>
                <Text variant="small">{predictedClassName}</Text>
              </div>
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.Interpret.WhatIfTab.probability}
                </Text>
                <Text variant="small">
                  {predictedProb.toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })}
                </Text>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={classNames.predictedBlock}>
          <div>
            {trueClass !== undefined && (
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.Interpret.WhatIfTab.trueClass}
                </Text>
                <Text variant="small">
                  {
                    this.props.jointDataset.metaDict[
                      JointDataset.PredictedYLabel
                    ].sortedCategoricalValues?.[trueClass]
                  }
                </Text>
              </div>
            )}
            {predictedClass !== undefined && (
              <div>
                <Text className={classNames.boldText} variant="small">
                  {localization.Interpret.WhatIfTab.predictedClass}
                </Text>
                <Text variant="small">{predictedClassName}</Text>
              </div>
            )}
          </div>
        </div>
      );
    }
    const row = this.props.jointDataset.getRow(
      this.props.selectedWhatIfRootIndex
    );
    const trueValue = this.props.jointDataset.hasTrueY
      ? row[JointDataset.TrueYLabel]
      : undefined;
    const predictedValue = this.props.jointDataset.hasPredictedY
      ? row[JointDataset.PredictedYLabel]
      : undefined;
    return (
      <div className={classNames.predictedBlock}>
        <div>
          {trueValue !== undefined && (
            <div>
              <Text className={classNames.boldText} variant="small">
                {localization.Interpret.WhatIfTab.trueValue}
              </Text>
              <Text variant="small">{trueValue}</Text>
            </div>
          )}
          {predictedValue !== undefined && (
            <div>
              <Text className={classNames.boldText} variant="small">
                {localization.Interpret.WhatIfTab.predictedValue}
              </Text>
              <Text variant="small">
                {predictedValue.toLocaleString(undefined, {
                  maximumFractionDigits: 3
                })}
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  }
}
