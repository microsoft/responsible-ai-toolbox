// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface ICounterfactualsTabStyles {
  container: IStyle;
}

export const counterfactualsTabStyles: () => IProcessedStyleSet<ICounterfactualsTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICounterfactualsTabStyles>({
      container: {
        color: theme.semanticColors.bodyText
      }
    });
  };
