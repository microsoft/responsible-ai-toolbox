// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@fluentui/react";

export interface ILocalImportanceChartStyles {
  localImportanceChart: IStyle;
  absoluteValueToggle: IStyle;
  legendAndText: IStyle;
  buttonStyle: IStyle;
}

export const localImportanceChartStyles: () => IProcessedStyleSet<ILocalImportanceChartStyles> =
  () => {
    return mergeStyleSets<ILocalImportanceChartStyles>({
      buttonStyle: {
        marginBottom: "10px",
        marginTop: "10px",
        paddingBottom: "10px",
        paddingTop: "10px"
      },
      absoluteValueToggle: {
        width: "170px"
      },
      legendAndText: {
        boxSizing: "border-box",
        height: "100%",
        paddingLeft: "10px",
        paddingRight: "10px"
      },
      localImportanceChart: {
        width: "85%"
      }
    });
  };
