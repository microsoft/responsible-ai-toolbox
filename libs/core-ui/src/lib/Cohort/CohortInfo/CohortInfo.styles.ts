// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface ICohortInfoStyles {
  button: IStyle;
  container: IStyle;
}

export const cohortInfoStyles: () => IProcessedStyleSet<ICohortInfoStyles> =
  () => {
    return mergeStyleSets<ICohortInfoStyles>({
      button: {
        minWidth: "120px"
      },
      container: {
        padding: "65px 0 0 20px"
      }
    });
  };
