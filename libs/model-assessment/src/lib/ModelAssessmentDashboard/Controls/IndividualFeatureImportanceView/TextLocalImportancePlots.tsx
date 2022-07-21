// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  JointDataset,
  ITextExplanationDashboardData
} from "@responsible-ai/core-ui";
import {
  ITextExplanationDashboardProps,
  TextExplanationDashboard
} from "@responsible-ai/interpret-text";
import React from "react";

export interface ITextLocalImportancePlotsProps {
  jointDataset: JointDataset;
  selectedItems: IObjectWithKey[];
}

export interface ITextFeatureImportances {
  text: string[];
  importances: number[];
  prediction: number[];
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
      classNames,
      localExplanations: textFeatureImportances.importances,
      prediction: textFeatureImportances.prediction,
      text: textFeatureImportances.text
    };
    const dashboardProp: ITextExplanationDashboardProps = {
      dataSummary: textExplanationDashboardData
    };
    return <TextExplanationDashboard {...dashboardProp} />;
  }

  private getTextFeatureImportances(): ITextFeatureImportances[] {
    const featureImportances = this.props.selectedItems.map((row) => {
      const textFeatureImportance =
        this.context.modelExplanationData?.precomputedExplanations
          ?.textFeatureImportance?.[row[0]];
      if (!textFeatureImportance)
        return { importances: [], prediction: [], text: [] };
      const text = textFeatureImportance?.text;
      const importances = textFeatureImportance?.localExplanations;
      const rowDict = this.props.jointDataset.getRow(row[0]);
      const prediction = [rowDict[JointDataset.PredictedYLabel]];
      return {
        importances,
        prediction,
        text
      };
    });
    return featureImportances;
  }
}
