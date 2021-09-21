// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface ILoadingSpinnerStyles {
  explanationSpinner: IStyle;
}

export const loadingSpinnerStyles: IProcessedStyleSet<ILoadingSpinnerStyles> =
  mergeStyleSets<ILoadingSpinnerStyles>({
    explanationSpinner: {
      margin: "auto",
      padding: "40px"
    }
  });
