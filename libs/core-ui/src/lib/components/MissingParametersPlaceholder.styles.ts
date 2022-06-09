// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

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
        textAlign: "center",
        width: "100%"
      },
      missingParametersPlaceholderSpacer: {
        color: theme.semanticColors.bodyText,
        margin: "25px auto 0 auto",
        maxWidth: "400px",
        padding: "23px",
        width: "fit-content"
      }
    });
  };
