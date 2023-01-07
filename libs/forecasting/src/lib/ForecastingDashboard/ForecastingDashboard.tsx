// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

export class ForecastingDashboard extends React.Component {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return <Text>Placeholder</Text>;
  }
}
