// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { descriptionMaxWidth } from "@responsible-ai/core-ui";
import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IModelOverviewStyles {
  dropdown: IStyle;
  sectionStack: IStyle;
  descriptionText: IStyle;
  generalText: IStyle;
}

export const modelOverviewStyles: () => IProcessedStyleSet<IModelOverviewStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IModelOverviewStyles>({
      descriptionText: {
        color: theme.semanticColors.bodyText,
        maxWidth: descriptionMaxWidth
      },
      generalText: {
        color: theme.semanticColors.bodyText
      },
      dropdown: {
        width: "400px"
      },
      sectionStack: {
        padding: "0 40px 10px 40px"
      }
    });
  };
