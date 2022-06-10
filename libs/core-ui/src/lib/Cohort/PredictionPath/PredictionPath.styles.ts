// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IPredictionPathStyles {
  filterCircle: IStyle;
  stepBar: IStyle;
}

export const predictionPathStyles: () => IProcessedStyleSet<IPredictionPathStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IPredictionPathStyles>({
      filterCircle: {
        backgroundColor: theme.palette.blue,
        border: "1px solid #C8C8C8",
        borderRadius: "10px",
        boxSizing: "border-box",
        color: theme.palette.blue,
        height: "16px",
        width: "16px"
      },
      stepBar: {
        backgroundColor: theme.palette.neutralTertiaryAlt,
        height: "20px",
        marginBottom: "4px",
        marginLeft: "12px",
        marginTop: "4px",
        width: "2px"
      }
    });
  };
