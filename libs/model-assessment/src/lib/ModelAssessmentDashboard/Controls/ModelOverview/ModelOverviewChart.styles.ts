// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IModelOverviewChartStyles {
  rotatedVerticalBox: IStyle;
  horizontalAxis: IStyle;
  horizontalAxisNoExtraLeftPadding: IStyle;
  verticalAxis: IStyle;
  chart: IStyle;
  placeholderText: IStyle;
  chartConfigDropdown: IStyle;
  chartToggle: IStyle;
}

export const modelOverviewChartStyles: () => IProcessedStyleSet<IModelOverviewChartStyles> =
  () => {
    return mergeStyleSets<IModelOverviewChartStyles>({
      chart: {
        width: "100%"
      },
      chartConfigDropdown: {
        width: "250px"
      },
      horizontalAxis: {
        textAlign: "center",
        paddingLeft: "150px"
      },
      horizontalAxisNoExtraLeftPadding: {
        textAlign: "center",
        paddingLeft: "50px"
      },
      placeholderText: {
        marginBottom: "15px",
        marginTop: "15px"
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
        width: "65px"
      },
      chartToggle: {
        paddingLeft: "10px"
      }
    });
  };
