// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import { descriptionMaxWidth } from "@responsible-ai/core-ui";

export interface IFeatureImportanceStyles {
  chevronButton: IStyle;
  header: IStyle;
  headerCount: IStyle;
  headerTitle: IStyle;
  infoWithText: IStyle;
  selectionCounter: IStyle;
  tabularDataView: IStyle;
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
      infoWithText: { maxWidth: descriptionMaxWidth, paddingLeft: 25 },
      selectionCounter: {
        paddingLeft: 25,
        paddingTop: 12
      },
      tabularDataView: { paddingLeft: 25 }
    });
  };
