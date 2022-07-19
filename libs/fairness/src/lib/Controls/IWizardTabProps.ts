// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFairnessContext } from "../util/IFairnessContext";

export interface IWizardTabProps {
  dashboardContext: IFairnessContext;
  onSetTab: (key: string) => void;
}
