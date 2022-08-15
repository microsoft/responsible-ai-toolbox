// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@fluentui/react";

export interface IDependencePlotStyles {
  DependencePlot: IStyle;
  chartWithAxes: IStyle;
  chart: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  horizontalAxis: IStyle;
  placeholderWrapper: IStyle;
  placeholder: IStyle;
  secondaryChartPlaceholderBox: IStyle;
  secondaryChartPlaceholderSpacer: IStyle;
  faintText: IStyle;
}

export const dependencePlotStyles: () => IProcessedStyleSet<IDependencePlotStyles> =
  () => {
    return mergeStyleSets<IDependencePlotStyles>({
      chart: {
        flex: 1,
        height: "100%"
      },
      chartWithAxes: {
        display: "flex",
        flex: "1",
        flexDirection: "column",
        padding: "5px 20px 0 20px"
      },
      chartWithVertical: {
        display: "flex",
        flexDirection: "row",
        height: "400px",
        width: "100%"
      },
      DependencePlot: {
        display: "flex",
        flexDirection: "row",
        flexGrow: "1"
      },
      faintText: {
        fontWeight: "350" as any
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
