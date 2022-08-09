// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
export interface IDatasetExplorerTab {
  cohortDropdown: IStyle;
  cohortPickerLabel: IStyle;
  cohortPickerLabelWrapper: IStyle;
  line: IStyle;
  searchBox: IStyle;
  filterButton: IStyle;
  toolBarContainer: IStyle;
  mainContainer: IStyle;
<<<<<<< HEAD
  mainImageContainer: IStyle;
=======
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
  halfContainer: IStyle;
  imageListContainer: IStyle;
  slider: IStyle;
  tabs: IStyle;
}

export const visionExplanationDashboardStyles: () => IProcessedStyleSet<IDatasetExplorerTab> =
  () => {
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
        border: "1px solid #D2D4D6",
        height: "100%",
        overflow: "scroll"
      },
      line: {
        borderTop: "1px solid #EDEBE9"
      },
      mainContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
      },
<<<<<<< HEAD
      mainImageContainer: {
        height: "650px"
      },
=======
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
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
