// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const routeKey = [
  "application",
  "dataset",
  "theme",
  "language",
  "version",
  "featureFlights"
] as const;
export type IAppSetting = {
  [key in typeof routeKey[number]]?: string;
};
