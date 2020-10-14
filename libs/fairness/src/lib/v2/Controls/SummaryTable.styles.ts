// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights
} from "office-ui-fabric-react";

export interface ISummaryTableStyles {
  minMaxLabel: IStyle;
  groupCol: IStyle;
  groupLabel: IStyle;
  flexCol: IStyle;
  binBox: IStyle;
  binTitle: IStyle;
  metricCol: IStyle;
  metricBox: IStyle;
  metricLabel: IStyle;
  frame: IStyle;
}

export const SummaryTableStyles: () => IProcessedStyleSet<
  ISummaryTableStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<ISummaryTableStyles>({
    binBox: {
      borderBottom: "0.5px dashed",
      borderColor: theme.semanticColors.bodyDivider,
      display: "flex",
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      width: "130px"
    },
    binTitle: {
      color: theme.semanticColors.bodyText
    },
    flexCol: {
      borderBottom: "1px solid",
      borderColor: theme.semanticColors.bodyDivider,
      borderTop: "1px solid",
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    frame: {
      display: "flex",
      paddingBottom: "19px"
    },
    groupCol: {
      borderRight: "1px solid",
      borderColor: theme.semanticColors.disabledBorder,
      display: "inline-flex",
      flexDirection: "column",
      height: "100%",
      width: "max-content"
    },
    groupLabel: {
      color: theme.semanticColors.bodyText,
      height: "26px"
    },
    metricBox: {
      borderBottom: "0.5px dashed",
      borderColor: theme.semanticColors.bodyDivider,
      borderLeft: "0.5px dashed",
      color: theme.semanticColors.bodyText,
      display: "flex",
      flex: 1,
      flexDirection: "column",
      fontWeight: FontWeights.light,
      justifyContent: "center",
      paddingLeft: "10px"
    },
    metricCol: {
      display: "inline-flex",
      flexDirection: "column",
      height: "100%",
      width: "120px"
    },
    metricLabel: {
      color: theme.semanticColors.bodyText,
      height: "26px",
      paddingLeft: "10px"
    },
    minMaxLabel: {
      backgroundColor: theme.semanticColors.bodyStandoutBackground,
      color: theme.semanticColors.bodySubtext,
      marginTop: "4px",
      padding: "1px 9px"
    }
  });
};
