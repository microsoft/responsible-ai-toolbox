// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const routeKey = ["modelId"] as const;
export type IFairnessRouteProps = {
  [key in typeof routeKey[number]]?: string;
};
