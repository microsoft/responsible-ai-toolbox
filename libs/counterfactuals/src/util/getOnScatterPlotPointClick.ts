// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export async function getOnScatterPlotPointClick(
  data: any,
  requestLocalCounterfactuals?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>,
  selectPointFromChart?: (data: any) => void,
  selectPointFromChartLargeData?: (data: any) => void
): Promise<any | undefined> {
  console.log(
    "!!getOnScatterPlotPointClick requestLocalCounterfactuals",
    requestLocalCounterfactuals,
    data
  );
  if (requestLocalCounterfactuals) {
    const localCounterfactualsData = await getLocalCounterfactualsFromSDK(
      data,
      requestLocalCounterfactuals
    );
    selectPointFromChartLargeData &&
      selectPointFromChartLargeData(localCounterfactualsData);
    return;
  }
  selectPointFromChart && selectPointFromChart(data);
}

export async function getLocalCounterfactualsFromSDK(
  data: any,
  requestLocalCounterfactuals: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any> {
  console.log("!!calculateBubblePlotDataFromSDK");
  const input = [data.customData.AbsoluteIndex];
  console.log("!!input: ", input);
  const result: any = await requestLocalCounterfactuals?.(
    input,
    new AbortController().signal
  );

  console.log("!!calculateBubblePlotDataFromSDK result: ", result);

  return result;
}

export async function getLocalCounterfactualData(
  data: any,
  requestLocalCounterfactuals?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any | undefined> {
  console.log(
    "!!getOnScatterPlotPointClick requestLocalCounterfactuals",
    requestLocalCounterfactuals,
    data
  );
  if (requestLocalCounterfactuals) {
    const localCounterfactualsData = await getLocalCounterfactualsFromSDK(
      data,
      requestLocalCounterfactuals
    );
    return localCounterfactualsData;
  }
}
