// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  FontWeights
} from "@fluentui/react";
import { descriptionMaxWidth, flexLgDown } from "@responsible-ai/core-ui";

export interface IForecastingDashboardStyles {
  dropdown: IStyle;
  sectionStack: IStyle;
  configurationActionButton: IStyle;
  topLevelDescriptionText: IStyle;
  descriptionText: IStyle;
  generalText: IStyle;
  generalSemiBoldText: IStyle;
  selections: IStyle;
  smallDropdown: IStyle;
  mediumText: IStyle;
  forecastCategoryText: IStyle;
  subMediumText: IStyle;
  smallTextField: IStyle;
  errorText: IStyle;
}

export const forecastingDashboardStyles: () => IProcessedStyleSet<IForecastingDashboardStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IForecastingDashboardStyles>({
      configurationActionButton: {
        marginTop: "25px"
      },
      descriptionText: {
        color: theme.semanticColors.bodyText,
        maxWidth: descriptionMaxWidth
      },
      dropdown: {
        selectors: {
          "@media screen and (min-width: 1024px)": {
            width: "600px"
          }
        },
        width: "auto"
      },
      errorText: {
        color: theme.semanticColors.errorText,
        maxWidth: "200px"
      },
      forecastCategoryText: {
        fontSize: "14px",
        fontWeight: "600",
        lineHeight: "20px",
        marginBottom: "20px"
      },
      generalSemiBoldText: {
        color: theme.semanticColors.bodyText,
        fontWeight: FontWeights.semibold,
        maxWidth: descriptionMaxWidth
      },
      generalText: {
        color: theme.semanticColors.bodyText
      },
      mediumText: {
        fontSize: "20px",
        fontWeight: "600",
        maxWidth: "200px"
      },
      sectionStack: {
        padding: "0 40px 40px 40px"
      },
      selections: flexLgDown,
      smallDropdown: {
        width: "200px"
      },
      smallTextField: {
        width: "320px"
      },
      subMediumText: {
        fontSize: "16px",
        fontWeight: "600",
        lineHeight: "20px"
      },
      topLevelDescriptionText: {
        color: theme.semanticColors.bodyText,
        maxWidth: descriptionMaxWidth
      }
    });
  };
