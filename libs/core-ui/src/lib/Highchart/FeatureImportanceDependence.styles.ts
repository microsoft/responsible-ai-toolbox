// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle,
  getTheme
} from "@fluentui/react";

export interface IDependencePlotStyles {
  boldText: IStyle;
  chart: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  DependencePlot: IStyle;
  faintText: IStyle;
  horizontalAxis: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  placeholderWrapper: IStyle;
  placeholder: IStyle;
  rotatedVerticalBox: IStyle;
  secondaryChartPlaceholderBox: IStyle;
  secondaryChartPlaceholderSpacer: IStyle;
  verticalAxis: IStyle;
}

export const dependencePlotStyles: () => IProcessedStyleSet<IDependencePlotStyles> =
  () => {
    const theme = getTheme();

    return mergeStyleSets<IDependencePlotStyles>({
      boldText: {
        fontWeight: "600"
      },
      chart: {
        backgroundColor: theme.semanticColors.bodyBackground,
        width: "95%"
      },
      chartWithAxes: {
        display: "flex",
        flex: "1",
        flexDirection: "column",
        padding: "5px 20px 0 20px"
      },
      chartWithVertical: {
        width: "100%"
      },
      DependencePlot: {
        width: "100%"
      },
      faintText: {
        fontWeight: "350"
      },
      horizontalAxis: {
        flex: 1,
        textAlign: "center"
      },
      horizontalAxisWithPadding: {
        display: "flex",
        flexDirection: "row"
      },
      paddingDiv: {
        width: "50px"
      },
      placeholder: {
        maxWidth: "70%"
      },
      placeholderWrapper: {
        margin: "100px auto 0 auto"
      },
      rotatedVerticalBox: {
        marginLeft: "15px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      secondaryChartPlaceholderBox: {
        flex: 1,
        height: "400px"
      },
      secondaryChartPlaceholderSpacer: {
        boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.2)",
        margin: "25px auto 0 auto",
        padding: "23px",
        width: "fit-content"
      },
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "50px"
      }
    });
  };
