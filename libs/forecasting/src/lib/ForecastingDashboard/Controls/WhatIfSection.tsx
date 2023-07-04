// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PrimaryButton, Spinner, Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { Transformation } from "../Interfaces/Transformation";

import { TransformationsTable } from "./TransformationsTable";

export interface IWhatIfSectionProps {
  transformations: Map<string, Transformation>;
  onClickWhatIfButton: () => void;
}

export class WhatIfSection extends React.Component<IWhatIfSectionProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (
      this.context === undefined ||
      this.context.baseErrorCohort === undefined
    ) {
      return <Spinner />;
    }

    return (
      <>
        <Stack.Item>
          <PrimaryButton
            id={"ForecastingWhatIfTransformationCreationButton"}
            disabled={false}
            onClick={this.props.onClickWhatIfButton}
            text={localization.Forecasting.TransformationCreation.title}
          />
        </Stack.Item>

        {this.props.transformations.size > 0 && (
          <Stack.Item id="ForecastingWhatIfTransformationsTable">
            <TransformationsTable
              transformations={this.props.transformations}
              jointDataset={this.context.jointDataset}
            />
          </Stack.Item>
        )}
      </>
    );
  }
}
