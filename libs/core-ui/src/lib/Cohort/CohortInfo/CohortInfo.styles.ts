// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface ICohortInfoStyles {
  cohortinfo: IStyle;
  divider: IStyle;
  section: IStyle;
  subsection: IStyle;
  header: IStyle;
  tableData: IStyle;
}

export const cohortInfoStyles: () => IProcessedStyleSet<ICohortInfoStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICohortInfoStyles>({
      cohortinfo: {
        backgroundColor: theme.palette.white,
        border: "1px solid #C8C8C8",
        boxSizing: "border-box",
        color: theme.palette.black
      },
      divider: {
        borderTop: "1px solid #DADADA",
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
