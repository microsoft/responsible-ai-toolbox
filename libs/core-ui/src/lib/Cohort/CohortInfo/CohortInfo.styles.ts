// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface ICohortInfoStyles {
  button: IStyle;
  container: IStyle;
  divider: IStyle;
  section: IStyle;
  header: IStyle;
  tableData: IStyle;
}

export const cohortInfoStyles: () => IProcessedStyleSet<ICohortInfoStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICohortInfoStyles>({
      button: {
        minWidth: "120px"
      },
      container: {
        color: theme.semanticColors.bodyText
      },
      divider: {
        borderTop: "1px solid",
        left: "50%",
        margin: "0",
        marginRight: "-50%",
        position: "absolute",
        transform: "translate(-50%, 0%)",
        width: "100%"
      },
      header: {
        fontSize: "14px",
        fontWeight: "600"
      },
      section: {
        padding: "10px 0 10px 20px"
      },
      tableData: {
        fontSize: "16px"
      }
    });
  };
