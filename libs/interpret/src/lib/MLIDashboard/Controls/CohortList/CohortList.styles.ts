// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface ICohortListStyles {
  banner: IStyle;
  summaryLabel: IStyle;
  mediumText: IStyle;
  summaryBox: IStyle;
  summaryItemText: IStyle;
  cohortList: IStyle;
  cohortBox: IStyle;
  cohortLabelWrapper: IStyle;
  cohortLabel: IStyle;
  overflowButton: IStyle;
  commandButton: IStyle;
  menuIcon: IStyle;
}

export const cohortListStyles: () => IProcessedStyleSet<
  ICohortListStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<ICohortListStyles>({
    banner: {
      backgroundColor: theme.palette.neutralPrimary,
      boxSizing: "border-box",
      color: theme.palette.white,
      display: "flex",
      flexDirection: "row",
      height: "105px",
      paddingLeft: "34px",
      paddingTop: "10px",
      width: "100%"
    },
    cohortBox: {
      boxSizing: "border-box",
      display: "inline-block",
      paddingRight: "10px",
      width: "150px"
    },
    cohortLabel: {
      flexGrow: 1
    },
    cohortLabelWrapper: {
      display: "flex",
      flexDirection: "row",
      maxWidth: "100%"
    },
    cohortList: {},
    commandButton: {
      alignSelf: "stretch",
      backgroundColor: "transparent",
      height: 20,
      padding: "4px 0",
      width: 20
    },
    mediumText: {
      maxWidth: "200px"
    },
    menuIcon: {
      color: theme.palette.white,
      fontSize: "20px"
    },
    overflowButton: {
      backgroundColor: theme.palette.neutralPrimary,
      border: "none"
    },
    summaryBox: {
      width: "141px"
    },
    summaryItemText: {
      fontSize: "11px",
      lineHeight: "19px"
    },
    summaryLabel: {
      fontVariant: "small-caps",
      fontWeight: "300",
      marginBottom: "2px"
    }
  });
};
