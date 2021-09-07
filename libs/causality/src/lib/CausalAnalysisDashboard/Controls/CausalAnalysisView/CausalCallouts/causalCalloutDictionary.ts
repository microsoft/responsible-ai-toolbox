// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

interface ICausalInfo {
  title: string;
  description: string;
  linkUrl?: string;
}

const whyConfounding: ICausalInfo = {
  description: localization.CausalAnalysis.AggregateView.confoundingFeature,
  linkUrl: "https://www.microsoft.com/research/project/econml/#!how-to",
  title: localization.CausalAnalysis.AggregateView.unconfounding
};

export const causalCalloutDictionary: { [key: string]: ICausalInfo } = {
  confounding: whyConfounding
};
