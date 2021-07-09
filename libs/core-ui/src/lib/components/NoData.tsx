// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import React from "react";

export class NoData extends React.Component {
  public render(): React.ReactNode {
    return localization.Core.NoData.Title;
  }
}
