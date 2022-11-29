// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

import { FluentUIStyles } from "../util/FluentUIStyles";

export interface ILabelWithCalloutStyles {
  callout: IStyle;
  calloutWrapper: IStyle;
  calloutHeader: IStyle;
  calloutTitle: IStyle;
  calloutInner: IStyle;
  calloutActions: IStyle;
  calloutLink: IStyle;
  infoButton: IStyle;
  calloutContainer: IStyle;
  calloutText: IStyle;
}

export const labelWithCalloutStyles: () => IProcessedStyleSet<ILabelWithCalloutStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ILabelWithCalloutStyles>({
      callout: {
        backgroundColor: theme.semanticColors.bodyBackground,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: "10px 20px",
        width: "200px"
      },
      calloutActions: {
        marginTop: 20,
        position: "relative",
        whiteSpace: "nowrap",
        width: "100%"
      },
      calloutContainer: {
        display: "inline-flex",
        paddingTop: "10px"
      },
      calloutHeader: [FluentUIStyles.calloutHeader],
      calloutInner: [FluentUIStyles.calloutInner],
      calloutLink: [
        theme.fonts.medium,
        {
          color: theme.semanticColors.bodyText
        }
      ],
      calloutText: {
        fontWeight: "600",
        paddingTop: "5px"
      },
      calloutTitle: [FluentUIStyles.calloutTitle],
      calloutWrapper: [FluentUIStyles.calloutWrapper],
      infoButton: {
        margin: "5px",
        padding: "8px 10px",
        width: "fit-content"
      }
    });
  };
