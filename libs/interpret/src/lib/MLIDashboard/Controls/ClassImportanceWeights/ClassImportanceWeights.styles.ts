// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { FluentUIStyles } from "@responsible-ai/core-ui";

export interface ILabelWithCalloutStyles {
  calloutHeader: IStyle;
  calloutInner: IStyle;
  calloutTitle: IStyle;
  calloutWrapper: IStyle;
  multiclassWeightLabel: IStyle;
  multiclassWeightLabelText: IStyle;
}

export const classImportanceWeightsStyles: () => IProcessedStyleSet<ILabelWithCalloutStyles> =
  () => {
    return mergeStyleSets<ILabelWithCalloutStyles>({
      calloutHeader: [FluentUIStyles.calloutHeader],
      calloutInner: [FluentUIStyles.calloutInner],
      calloutTitle: [FluentUIStyles.calloutTitle],
      calloutWrapper: [FluentUIStyles.calloutWrapper],
      multiclassWeightLabel: {
        display: "inline-flex",
        paddingTop: "10px"
      },
      multiclassWeightLabelText: {
        fontWeight: "600",
        paddingTop: "5px"
      }
    });
  };
