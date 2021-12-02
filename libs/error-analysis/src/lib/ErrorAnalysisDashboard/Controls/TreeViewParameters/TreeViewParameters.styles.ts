// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface ITreeViewParametersStyles {
  sliderLabelStyle: IStyle;
  sliderStackStyle: IStyle;
  infoCallout: IStyle;
}

export const treeViewParametersStyles: () => IProcessedStyleSet<ITreeViewParametersStyles> =
  () => {
    return mergeStyleSets<ITreeViewParametersStyles>({
      infoCallout: {
        zIndex: 1
      },
      sliderLabelStyle: {
        padding: 0
      },
      sliderStackStyle: {
        minWidth: 200
      }
    });
  };
