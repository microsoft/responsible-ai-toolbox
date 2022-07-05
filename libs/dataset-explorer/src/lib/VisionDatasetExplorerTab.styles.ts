// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
export interface IDatasetExplorerTabStyles {
  cohortDropdown: IStyle;
  cohortPickerLabel: IStyle;
  cohortPickerLabelWrapper: IStyle;
  line: IStyle;
  page: IStyle;
  searchBox: IStyle;
  filterButton: IStyle;
  toolBarContainer: IStyle;
  mainContainer: IStyle;
  halfContainer: IStyle;
  imageListContainer: IStyle;
  slider: IStyle;
  tabs: IStyle;
}

export const visionDatasetExplorerTabStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      cohortDropdown: {
        width: "300px"
      },
      cohortPickerLabel: {
        fontWeight: "600",
      },
      cohortPickerLabelWrapper: {
        paddingBottom: "5px",
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
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      },
      page: {
        color: theme.semanticColors.bodyText,
        height: "100%",
        padding: "0 40px 10px 40px",
        width: "100%"
      },
      searchBox: {
        width: '300px'
      },
      slider: {
        width: '320px',
      },
      tabs: {
        display: "flex",
        flexDirection: "row",
        left: "-10px",
        position: "relative"
      },
      toolBarContainer: {
        width: '100%',
      },
    });
  };
