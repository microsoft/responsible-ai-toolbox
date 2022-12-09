// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { responseTempLC } from "./responseTempLC";

// export async function getOnScatterPlotPointClick(
//   data: any,
//   requestLocalCounterfactuals?: (
//     request: any,
//     abortSignal: AbortSignal
//   ) => Promise<any>,
//   selectPointFromChart?: (data: any) => void,
//   selectPointFromChartLargeData?: (data: any) => void
// ): Promise<any | undefined> {
//   console.log(
//     "!!getOnScatterPlotPointClick requestLocalCounterfactuals",
//     requestLocalCounterfactuals,
//     data
//   );
//   if (requestLocalCounterfactuals) {
//     const localCounterfactualsData = await getLocalCounterfactualsFromSDK(
//       data,
//       requestLocalCounterfactuals
//     );
//     selectPointFromChartLargeData &&
//       selectPointFromChartLargeData(localCounterfactualsData);
//     return;
//   }
//   selectPointFromChart && selectPointFromChart(data);
// }

export async function getLocalCounterfactualsFromSDK(
  data: any,
  counterfactualsId?: string,
  requestLocalCounterfactuals?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any> {
  console.log("!!getLocalCounterfactualsFromSDK");
  const input = [counterfactualsId, data.customData.AbsoluteIndex];
  console.log("!!input: ", input);
  const result: any = await requestLocalCounterfactuals?.(
    input,
    new AbortController().signal
  );

  console.log("!!getLocalCounterfactualsFromSDK result: ", result);

  return responseTempLC;
}

// export async function getLocalCounterfactualData(
//   counterfactualsId: string,
//   data: any,
//   requestLocalCounterfactuals?: (
//     request: any,
//     abortSignal: AbortSignal
//   ) => Promise<any>
// ): Promise<any | undefined> {
//   console.log(
//     "!!getOnScatterPlotPointClick requestLocalCounterfactuals",
//     requestLocalCounterfactuals,
//     data
//   );
//   if (requestLocalCounterfactuals) {
//     const localCounterfactualsData = await getLocalCounterfactualsFromSDK(
//       data,
//       requestLocalCounterfactuals
//     );
//     return localCounterfactualsData;
//   }
// }
