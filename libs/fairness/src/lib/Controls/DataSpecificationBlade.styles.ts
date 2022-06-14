// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "@fluentui/react";

export interface IDataSpecificationBladeStyles {
  title: IStyle;
  frame: IStyle;
  text: IStyle;
}

export const DataSpecificationBladeStyles: () => IProcessedStyleSet<IDataSpecificationBladeStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataSpecificationBladeStyles>({
      frame: {
        boxSizing: "content-box",
        paddingLeft: "60px",
        paddingTop: "35px",
        width: "120px"
      },
      text: {
        color: theme.semanticColors.bodyText
      },
      title: {
        color: theme.semanticColors.bodyText,
        height: "20px",
        paddingBottom: "10px"
      }
    });
  };
