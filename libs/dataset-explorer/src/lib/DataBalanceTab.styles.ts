// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IDataBalanceTabStyles {
  page: IStyle;
  featureAndMeasurePickerWrapper: IStyle;
  featureAndMeasurePickerLabel: IStyle;
  leftLabel: IStyle;
}

export const dataBalanceTabStyles: () => IProcessedStyleSet<IDataBalanceTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataBalanceTabStyles>({
      featureAndMeasurePickerLabel: {
        fontWeight: "600",
        paddingRight: "8px"
      },
      featureAndMeasurePickerWrapper: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        height: "32px",
        paddingLeft: "63px",
        paddingTop: "13px"
      },
      leftLabel: {
        alignSelf: "left",
        fontWeight: "600",
        paddingRight: "8px"
      },
      page: {
        boxSizing: "border-box",
        color: theme.semanticColors.bodyText,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px 40px 0 14px",
        width: "100%"
      }
    });
  };
