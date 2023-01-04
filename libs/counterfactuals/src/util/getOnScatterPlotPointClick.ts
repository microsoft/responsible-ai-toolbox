// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { responseTempLC } from "./responseTempLC";

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
  absoluteIndex: number,
  counterfactualsId?: string,
  requestLocalCounterfactuals?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any> {
  console.log("!!getLocalCounterfactualsFromSDK");
  const input = [counterfactualsId, absoluteIndex];
  console.log("!!input: ", input);
  const result: any = await requestLocalCounterfactuals?.(
    input,
    new AbortController().signal
  );

  console.log("!!getLocalCounterfactualsFromSDK result: ", result);

  return result;
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
