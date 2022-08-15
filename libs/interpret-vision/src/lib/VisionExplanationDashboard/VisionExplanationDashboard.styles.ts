// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
export interface IDatasetExplorerTab {
  cohortDropdown: IStyle;
  cohortPickerLabel: IStyle;
  cohortPickerLabelWrapper: IStyle;
  searchBox: IStyle;
  filterButton: IStyle;
  toolBarContainer: IStyle;
  mainContainer: IStyle;
  mainImageContainer: IStyle;
  halfContainer: IStyle;
  imageListContainer: IStyle;
  slider: IStyle;
  tabs: IStyle;
}

export const visionExplanationDashboardStyles: () => IProcessedStyleSet<IDatasetExplorerTab> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDatasetExplorerTab>({
      cohortDropdown: {
        width: "300px"
      },
      cohortPickerLabel: {
        fontWeight: "600"
      },
      cohortPickerLabelWrapper: {
        paddingBottom: "5px"
      },
      filterButton: {
        height: "32px"
      },
      halfContainer: {
        height: "100%",
        width: "50%"
      },
      imageListContainer: {
        border: `1px solid ${theme.semanticColors.disabledBorder}`,
        height: "100%",
        overflow: "scroll"
      },
      mainContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
      },
      mainImageContainer: {
        height: "650px"
      },
      searchBox: {
        width: "300px"
      },
      slider: {
        width: "320px"
      },
      tabs: {
        display: "flex",
        flexDirection: "row",
        left: "-10px",
        position: "relative"
      },
      toolBarContainer: {
        width: "100%"
      }
    });
  };
