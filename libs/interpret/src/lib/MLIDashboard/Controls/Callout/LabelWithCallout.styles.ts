// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FabricStyles } from "@responsible-ai/core-ui";
import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

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
      calloutHeader: [FabricStyles.calloutHeader],
      calloutInner: [FabricStyles.calloutInner],
      calloutLink: [
        theme.fonts.medium,
        {
          color: theme.palette.neutralPrimary
        }
      ],
      calloutText: {
        fontWeight: "600",
        paddingTop: "5px"
      },
      calloutTitle: [FabricStyles.calloutTitle],
      calloutWrapper: [FabricStyles.calloutWrapper],
      infoButton: {
        margin: "5px",
        padding: "8px 10px",
        width: "fit-content"
      }
    });
  };
