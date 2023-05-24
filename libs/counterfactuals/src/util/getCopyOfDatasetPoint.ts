// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FluentUIStyles,
  IDataset,
  ifEnableLargeData,
  JointDataset
} from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";

export function getCopyOfDatasetPoint(
  index: number,
  jointDataset: JointDataset,
  dataset: IDataset,
  customPointLength: number,
  absoluteIndex?: number
): Dictionary<any> {
  const temporaryPoint: {
    [key: string]: any;
  } = jointDataset.getRow(index);
  temporaryPoint[WhatIfConstants.namePath] = localization.formatString(
    localization.Interpret.WhatIf.defaultCustomRootName,
    index
  );
  temporaryPoint[WhatIfConstants.colorPath] =
    FluentUIStyles.fluentUIColorPalette[
      WhatIfConstants.MAX_SELECTION + customPointLength
    ];
  if (ifEnableLargeData(dataset) && absoluteIndex) {
    temporaryPoint[WhatIfConstants.absoluteIndex] = absoluteIndex;
    temporaryPoint[WhatIfConstants.index] = index;
  }
  return temporaryPoint;
}
