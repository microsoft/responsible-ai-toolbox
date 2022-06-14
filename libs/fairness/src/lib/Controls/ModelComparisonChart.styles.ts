// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights,
  FontSizes
} from "@fluentui/react";

export interface IModelComparisonChartStyles {
  frame: IStyle;
  spinner: IStyle;
  doneButton: IStyle;
  infoButton: IStyle;
  modalContentHelp: IStyle;
  modalContentHelpText: IStyle;
  howTo: IStyle;
  mainRight: IStyle;
}

export const ModelComparisonChartStyles: () => IProcessedStyleSet<IModelComparisonChartStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IModelComparisonChartStyles>({
      doneButton: {
        color: theme.semanticColors.bodyText,
        fontSize: FontSizes.large,
        fontWeight: FontWeights.regular,
        height: "44px",
        lineHeight: "24px",
        margin: "auto",
        padding: "12px"
      },
      frame: {
        display: "flex",
        flex: 1,
        flexDirection: "column"
      },
      howTo: {
        paddingLeft: "100px",
        paddingTop: "20px"
      },
      infoButton: {
        border: "1px solid",
        borderRadius: "50%",
        color: theme.semanticColors.bodyText,
        float: "left",
        fontSize: "12px",
        fontWeight: "600",
        height: "15px",
        lineHeight: "14px",
        marginRight: "3px",
        marginTop: "3px",
        textAlign: "center",
        width: "15px"
      },
      mainRight: {
        padding: "30px 0 0 35px",
        width: "300px"
      },
      modalContentHelp: {
        float: "left",
        width: "250px"
      },
      modalContentHelpText: {
        padding: "0px 20px",
        textAlign: "center",
        wordWrap: "break-word"
      },
      spinner: {
        margin: "auto",
        padding: "40px"
      }
    });
  };
