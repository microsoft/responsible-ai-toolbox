// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@fluentui/react";

export interface ILocalImportanceChartStyles {
  localImportanceChart: IStyle;
  absoluteValueToggle: IStyle;
  legendAndText: IStyle;
  buttonStyle: IStyle;
  featureImportanceControls: IStyle;
  startingK: IStyle;
}

export const localImportanceChartStyles: () => IProcessedStyleSet<ILocalImportanceChartStyles> =
  () => {
    return mergeStyleSets<ILocalImportanceChartStyles>({
      absoluteValueToggle: {
        width: "170px"
      },
      buttonStyle: {
        marginBottom: "10px",
        marginTop: "10px",
        paddingBottom: "10px",
        paddingTop: "10px"
      },
      featureImportanceControls: {
        display: "flex",
        flexDirection: "row",
        padding: "18px 30px 4px 67px",
        selectors: {
          "@media screen and (max-width: 639px)": {
            flexFlow: "wrap",
            padding: "18px 0 4px 0"
          }
        }
      },
      legendAndText: {
        boxSizing: "border-box",
        height: "100%",
        paddingLeft: "10px",
        paddingRight: "10px"
      },
      localImportanceChart: {
        width: "85%"
      },
      startingK: {
        flex: 1,
        selectors: {
          "@media screen and (min-width: 1024px)": {
            paddingRight: "160px"
          }
        }
      }
    });
  };
