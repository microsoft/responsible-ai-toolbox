// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  FontSizes
} from "@fluentui/react";
//import { descriptionMaxWidth, FabricStyles } from "@responsible-ai/core-ui";

export interface IDatasetExplorerTabStyles {
  list: IStyle;
  tile: IStyle;
  sizer: IStyle;
  padder: IStyle;
  label: IStyle;
  image: IStyle;
}

export const tableListStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      list: {
        overflow: 'scroll', 
        fontSize: 0, 
        position: 'relative',
      },
      tile: {
        textAlign: 'center',
        position: 'relative',
        float: 'left',
        paddingLeft: '1%',
        paddingRight: '1%',
        marginTop: '0.5%',
        selectors: {
          'focus:after': {
            content: '',
            position: 'absolute',
            left: 2,
            right: 2,
            top: 2,
            bottom: 2,
            boxSizing: 'border-box',
            border: `1px solid ${theme.palette.themePrimary}`
          }
        }
      },
      sizer: {
        paddingBottom: '100%'
      },
      padder: {
        position: 'absolute',
        left: 2,
        top: 2,
        right: 2,
        bottom: 2
      },
      label: {
        justifySelf: 'center',
        paddingBottom: "100%",
        color: "black",
        width: "100%",
        fontSize: FontSizes.small,
      },
      image: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
      }
    });
  };
