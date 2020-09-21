// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ITilesListStyles {
  container: IStyle;
  itemCell: IStyle;
  iconClass: IStyle;
  title: IStyle;
  description: IStyle;
}

export const TileListStyles: () => IProcessedStyleSet<
  ITilesListStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<ITilesListStyles>({
    container: {
      borderBottom: "1px solid",
      borderBottomColor: theme.semanticColors.bodyDivider,
      display: "inline-flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between"
    },
    description: {
      color: theme.semanticColors.bodySubtext,
      paddingTop: "10px"
    },
    iconClass: {
      color: theme.semanticColors.accentButtonBackground,
      position: "absolute",
      right: "10px",
      top: "10px"
    },
    itemCell: {
      backgroundColor: theme.semanticColors.bodyDivider,
      boxSizing: "border-box",
      cursor: "pointer",
      float: "left",
      marginBottom: "10px",
      marginRight: "10px",
      padding: "15px",
      position: "relative",
      selectors: {
        "&:hover": { background: theme.semanticColors.bodyBackgroundHovered }
      },
      width: "235px"
    },
    title: {
      color: theme.semanticColors.bodyText,
      margin: 0,
      paddingRight: "16px"
    }
  });
};
