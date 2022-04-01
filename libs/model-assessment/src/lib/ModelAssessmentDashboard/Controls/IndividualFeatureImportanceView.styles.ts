// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IFeatureImportanceStyles {
  chevronButton: IStyle;
  header: IStyle;
  headerCount: IStyle;
  headerTitle: IStyle;
  selectionCounter: IStyle;
}

export const individualFeatureImportanceViewStyles: () => IProcessedStyleSet<IFeatureImportanceStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets({
      chevronButton: {
        marginLeft: 48,
        paddingTop: 6,
        width: 36
      },
      header: {
        margin: `8px 0`,
        padding: 8,
        // Overlay the sizer bars
        position: "relative",
        zIndex: 100
      },
      headerCount: [
        "headerCount",
        theme.fonts.medium,
        {
          paddingTop: 4
        }
      ],
      headerTitle: [
        theme.fonts.medium,
        {
          paddingTop: 4
        }
      ],
      selectionCounter: {
        paddingTop: 12
      }
    });
  };
