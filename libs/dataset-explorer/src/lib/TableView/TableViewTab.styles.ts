// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";
import { descriptionMaxWidth, hideXlDown } from "@responsible-ai/core-ui";

export interface ITableViewTabStyles {
  infoWithText: IStyle;
}

export const tableViewTabStyles: () => IProcessedStyleSet<ITableViewTabStyles> =
  () => {
    return mergeStyleSets({
      infoWithText: {
        maxWidth: descriptionMaxWidth,
        paddingLeft: 25,
        ...hideXlDown
      }
    });
  };
