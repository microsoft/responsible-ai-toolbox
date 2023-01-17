// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { flexMdDown, noPaddingMdDown } from "@responsible-ai/core-ui";

export interface IModelOverviewChartStyles {
  dropdown: IStyle;
  dropdownText: IStyle;
  horizontalAxis: IStyle;
  horizontalAxisNoExtraLeftPadding: IStyle;
  chart: IStyle;
  placeholderText: IStyle;
  chartConfigDropdown: IStyle;
  chartToggle: IStyle;
  splineButtons: IStyle;
  cohortSelectionButton: IStyle;
}

export const modelOverviewChartStyles: () => IProcessedStyleSet<IModelOverviewChartStyles> =
  () => {
    return mergeStyleSets<IModelOverviewChartStyles>({
      chart: {
        overflowX: "auto",
        width: "100%"
      },
      chartConfigDropdown: {
        width: "250px"
      },
      chartToggle: {
        paddingLeft: "10px"
      },
      cohortSelectionButton: {
        padding: "15px"
      },
      dropdown: {
        padding: "15px",
        width: "300px"
      },
      dropdownText: {
        padding: "15px"
      },
      horizontalAxis: {
        paddingLeft: "150px",
        textAlign: "center",
        ...noPaddingMdDown
      },
      horizontalAxisNoExtraLeftPadding: {
        paddingLeft: "50px",
        textAlign: "center",
        ...noPaddingMdDown
      },
      placeholderText: {
        marginBottom: "15px",
        marginTop: "15px"
      },
      splineButtons: flexMdDown
    });
  };
