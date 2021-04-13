// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

export class CausalInsightsTab extends React.PureComponent {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public constructor() {
    super({});
  }

  public render(): React.ReactNode {
    return (null);
  }
}
