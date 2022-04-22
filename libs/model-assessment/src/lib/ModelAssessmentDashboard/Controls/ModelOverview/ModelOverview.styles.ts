// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IModelOverviewStyles {
  dropdown: IStyle;
  sectionStack: IStyle;
}

export const modelOverviewStyles: () => IProcessedStyleSet<IModelOverviewStyles> =
  () => {
    return mergeStyleSets<IModelOverviewStyles>({
      dropdown: {
        width: "400px"
      },
      sectionStack: {
        padding: "0 40px 10px 40px"
      }
    });
  };
