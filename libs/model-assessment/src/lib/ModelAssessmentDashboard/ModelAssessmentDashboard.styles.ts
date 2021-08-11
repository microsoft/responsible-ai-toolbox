// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, IStyle } from "office-ui-fabric-react";

export interface IModelAssessmentDashboardStyles {
  page: IStyle;
  section: IStyle;
  buttonSection: IStyle;
  sectionHeader: IStyle;
  mainContent: IStyle;
}

export const modelAssessmentDashboardStyles =
  mergeStyleSets<IModelAssessmentDashboardStyles>({
    buttonSection: {
      textAlign: "center"
    },
    mainContent: {
      height: "100%",
      overflowY: "scroll",
      position: "relative"
    },
    page: {
      boxSizing: "border-box",
      height: "100%",
      padding: "16px 14px 0 14px",
      width: "100%"
    },
    section: {
      textAlign: "left"
    },
    sectionHeader: {
      padding: "16px 24px 16px 40px"
    }
  });
