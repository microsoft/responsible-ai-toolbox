// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, IStyle } from "office-ui-fabric-react";

export interface IModelAssessmentDashboardStyles {
  page: IStyle;
  section: IStyle;
}

export const modelAssessmentDashboardStyles = mergeStyleSets<
  IModelAssessmentDashboardStyles
>({
  page: {
    boxSizing: "border-box",
    padding: "16px 40px 0 14px",
    width: "100%"
  },
  section: {
    textAlign: "left"
  }
});
