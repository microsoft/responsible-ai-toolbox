// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface ICohortFiltersStyles {
  header: IStyle;
  section: IStyle;
  subsection: IStyle;
  tableData: IStyle;
}

export const cohortFiltersStyles: () => IProcessedStyleSet<ICohortFiltersStyles> =
  () => {
    return mergeStyleSets<ICohortFiltersStyles>({
      header: {
        fontSize: "14px",
        fontWeight: "600"
      },
      section: {
        paddingBottom: "10px !important",
        paddingLeft: "20px",
        paddingTop: "10px !important"
      },
      subsection: {},
      tableData: {
        fontSize: "16px"
      }
    });
  };
