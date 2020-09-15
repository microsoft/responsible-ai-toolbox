// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { localization } from "../../Localization/localization";
import { ModelTypes } from "../IExplanationContext";
import { predictionLabelStyles } from "./PredictionLabel.styles";

export interface IPredictionLabelProps {
  modelType: ModelTypes;
  prediction: number;
  classNames: string[];
  predictedProbabilities?: number[];
}

export class PredictionLabel extends React.Component<IPredictionLabelProps> {
  public render(): React.ReactNode {
    return (
      <div className={predictionLabelStyles.predictionArea}>
        <div className={predictionLabelStyles.probabilityLabel}>
          {this.makePredictionLabel()}
        </div>
        {this.props.predictedProbabilities !== undefined && (
          <div className={predictionLabelStyles.probabilityLabel}>
            {this.makeProbabilityLabel()}
          </div>
        )}
      </div>
    );
  }

  private makePredictionLabel(): string {
    if (this.props.modelType === ModelTypes.Regression) {
      return localization.formatString(
        localization.PredictionLabel.predictedValueLabel,
        this.props.prediction.toLocaleString(undefined, {
          minimumFractionDigits: 3
        })
      );
    }
    return localization.formatString(
      localization.PredictionLabel.predictedClassLabel,
      this.props.classNames[this.props.prediction]
    );
  }

  private makeProbabilityLabel(): string {
    const probability = this.props.predictedProbabilities?.[
      this.props.prediction
    ];
    return localization.formatString(
      localization.IcePlot.probabilityLabel,
      probability?.toLocaleString(undefined, { minimumFractionDigits: 3 })
    );
  }
}
