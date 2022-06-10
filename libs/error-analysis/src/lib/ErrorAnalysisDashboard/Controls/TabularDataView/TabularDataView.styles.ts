// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface ITabularDataViewStyles {
  mainScrollBarPane: IStyle;
}

export const tabularDataViewStyles: () => IProcessedStyleSet<ITabularDataViewStyles> =
  () => {
    return mergeStyleSets<ITabularDataViewStyles>({
      mainScrollBarPane: {
        height: "800px",
        position: "relative"
      }
    });
  };
