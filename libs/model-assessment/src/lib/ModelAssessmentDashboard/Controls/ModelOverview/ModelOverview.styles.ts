// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  FontWeights
} from "@fluentui/react";
import {
  descriptionMaxWidth,
  flexLgDown,
  hideXlDown
} from "@responsible-ai/core-ui";

export interface IModelOverviewStyles {
  dropdown: IStyle;
  sectionStack: IStyle;
  configurationActionButton: IStyle;
  topLevelDescriptionText: IStyle;
  descriptionText: IStyle;
  generalText: IStyle;
  generalSemiBoldText: IStyle;
  selections: IStyle;
  slider: IStyle;
  smallDropdown: IStyle;
  tabs: IStyle;
}

export const modelOverviewStyles: () => IProcessedStyleSet<IModelOverviewStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IModelOverviewStyles>({
      configurationActionButton: {
        marginTop: "25px"
      },
      descriptionText: {
        color: theme.semanticColors.bodyText,
        maxWidth: descriptionMaxWidth
      },
      dropdown: {
        width: "400px"
      },
      generalSemiBoldText: {
        color: theme.semanticColors.bodyText,
        fontWeight: FontWeights.semibold,
        maxWidth: descriptionMaxWidth
      },
      generalText: {
        color: theme.semanticColors.bodyText
      },
      sectionStack: {
        padding: "0 40px 32px 40px"
      },
      selections: flexLgDown,
      slider: {
        width: "250px"
      },
      smallDropdown: {
        width: "150px"
      },
      tabs: {
        selectors: {
          "[role='tablist'].ms-Pivot": {
            display: "flex",
            flexWrap: "wrap",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }
        }
      },
      topLevelDescriptionText: {
        color: theme.semanticColors.bodyText,
        maxWidth: descriptionMaxWidth,
        ...hideXlDown
      }
    });
  };
