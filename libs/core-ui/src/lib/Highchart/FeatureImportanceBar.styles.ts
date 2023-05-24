// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

import { fullLgDown } from "../util/getCommonStyles";

export interface IFeatureImportanceBarStyles {
  chart: IStyle;
  chartWithVertical: IStyle;
  noData: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  boldText: IStyle;
}

export const getFeatureImportanceBarStyles: () => IProcessedStyleSet<IFeatureImportanceBarStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IFeatureImportanceBarStyles>({
      boldText: {
        fontWeight: "600"
      },
      chart: {
        backgroundColor: theme.semanticColors.bodyBackground,
        width: "95%"
      },
      chartWithVertical: {
        width: "100%",
        ...fullLgDown
      },
      noData: {
        flex: "1",
        margin: "100px auto 0 auto"
      },
      rotatedVerticalBox: {
        marginLeft: "28px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "64px"
      }
    });
  };
