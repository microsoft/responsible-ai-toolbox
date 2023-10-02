// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  JointDataset,
  ITextExplanationDashboardData,
  WeightVectorOption,
  ModelTypes
} from "@responsible-ai/core-ui";
import {
  ITextExplanationViewProps,
  TextExplanationView
} from "@responsible-ai/interpret-text";
import React from "react";

export interface ITextLocalImportancePlotsProps {
  jointDataset: JointDataset;
  selectedItems: IObjectWithKey[];
  onWeightChange: (option: WeightVectorOption) => void;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  isQA?: boolean;
}

export interface ITextFeatureImportances {
  text: string[];
  importances: number[][] | number[][][];
  baseValues?: number[][];
  prediction: number[];
  predictedY?: number[] | number[][] | string[] | string | number;
  trueY?: number[] | number[][] | string[] | string | number;
}

export class TextLocalImportancePlots extends React.Component<ITextLocalImportancePlotsProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const textFeatureImportances = this.getTextFeatureImportances()[0];
    if (!textFeatureImportances) {
      return <div />;
    }
    const classNames = this.props.jointDataset.getModelClasses();
    const textExplanationDashboardData: ITextExplanationDashboardData = {
      baseValues: textFeatureImportances.baseValues,
      classNames,
      localExplanations: textFeatureImportances.importances,
      predictedY: textFeatureImportances.predictedY,
      prediction: textFeatureImportances.prediction,
      text: textFeatureImportances.text,
      trueY: textFeatureImportances.trueY
    };
    const dashboardProp: ITextExplanationViewProps = {
      dataSummary: textExplanationDashboardData,
      isQA:
        this.context.modelMetadata.modelType === ModelTypes.QuestionAnswering,
      onWeightChange: this.props.onWeightChange,
      selectedWeightVector: this.props.selectedWeightVector,
      weightLabels: this.props.weightLabels,
      weightOptions: this.props.weightOptions
    };
    return <TextExplanationView {...dashboardProp} />;
  }

  private getTextFeatureImportances(): ITextFeatureImportances[] {
    const featureImportances = this.props.selectedItems.map((row) => {
      const textFeatureImportance =
        this.context.modelExplanationData?.precomputedExplanations
          ?.textFeatureImportance?.[row[0]];
      if (!textFeatureImportance) {
        return { baseValues: [], importances: [], prediction: [], text: [] };
      }
      const text = textFeatureImportance?.text;
      const rowDict = this.props.jointDataset.getRow(row[0]);
      const prediction = new Array(this.props.jointDataset.predictionClassCount)
        .fill(0)
        .map((_, index) => {
          const key = JointDataset.ProbabilityYRoot + index.toString();
          return rowDict[key];
        });
      const importances: number[][] | number[][][] =
        textFeatureImportance?.localExplanations;
      const baseValues = textFeatureImportance?.baseValues;
      const trueY = this.context.dataset.true_y[row[0]];
      const predictedY = this.context.dataset.predicted_y?.[row[0]];
      return {
        baseValues,
        importances,
        predictedY,
        prediction,
        text,
        trueY
      };
    });
    return featureImportances;
  }
}
