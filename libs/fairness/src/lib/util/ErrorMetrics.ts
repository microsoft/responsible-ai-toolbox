// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

export interface IErrorOption {
  key: string;
  title: string;
  isMinimization: boolean;
  description?: string;
}

export const errorOptions: { [key: string]: IErrorOption } = {
  disabled: {
    description: localization.Fairness.Metrics.errorMetricDisabledDescription,
    isMinimization: false,
    key: "disabled",
    title: localization.Fairness.Metrics.errorMetricDisabled
  },
  enabled: {
    description: localization.Fairness.Metrics.errorMetricEnabledDescription,
    isMinimization: false,
    key: "enabled",
    title: localization.Fairness.Metrics.errorMetricEnabled
  }
};

export const defaultErrorMetricPrioritization = [
  // binary classification
  errorOptions.enabled.key,
  errorOptions.disabled.key
];
