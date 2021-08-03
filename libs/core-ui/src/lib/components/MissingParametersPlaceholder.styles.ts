// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IMissingParametersPlaceholderStyles {
  missingParametersPlaceholder: IStyle;
  missingParametersPlaceholderSpacer: IStyle;
  faintText: IStyle;
}

export const missingParametersPlaceholderStyles: () => IProcessedStyleSet<IMissingParametersPlaceholderStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IMissingParametersPlaceholderStyles>({
      faintText: {
        fontWeight: "350"
      },
      missingParametersPlaceholder: {
        height: "300px",
        width: "100%"
      },
      missingParametersPlaceholderSpacer: {
        boxShadow: theme.effects.elevation4,
        margin: "25px auto 0 auto",
        maxWidth: "400px",
        padding: "23px",
        width: "fit-content"
      }
    });
  };
