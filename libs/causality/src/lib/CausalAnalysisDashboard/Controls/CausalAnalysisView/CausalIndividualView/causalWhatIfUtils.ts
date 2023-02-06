// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  ColumnCategories,
  ICausalWhatIfData,
  IDataset,
  ifEnableLargeData,
  JointDataset
} from "@responsible-ai/core-ui";
import _ from "lodash";

export async function getTreatmentValue(
  dataset: IDataset,
  cohort: Cohort,
  selectedIndex: number,
  featureName: string,
  setTestDataRow: (testDataRow: any) => void,
  absoluteIndex?: number,
  requestTestDataRow?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<number> {
  const featureKey =
    JointDataset.DataLabelRoot + dataset.feature_names.indexOf(featureName);
  let treatmentValue = cohort.getRow(selectedIndex)[featureKey];

  if (ifEnableLargeData(dataset)) {
    const testDataRow = await getTestDataRow(
      setTestDataRow,
      absoluteIndex,
      requestTestDataRow
    );
    const parsedTestDataRow = JSON.parse(testDataRow)[0];
    setTestDataRow(parsedTestDataRow);
    treatmentValue = parsedTestDataRow[featureName];
  }
  return treatmentValue;
}

export async function getTestDataRow(
  setTestDataRow: (testDataRow: any) => void,
  absoluteIndex?: number,
  requestTestDataRow?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any> {
  if (!requestTestDataRow || !absoluteIndex) {
    return;
  }
  setTestDataRow(undefined);
  return await requestTestDataRow?.(
    absoluteIndex,
    new AbortController().signal
  );
}

export async function getWhatIf(
  dataset: IDataset,
  jointDataset: JointDataset,
  cohort: Cohort,
  testDataRow: any,
  setNewOutcome: (newOutcome?: ICausalWhatIfData) => void,
  causalAnalysisDataId?: string,
  newTreatmentValue?: number,
  newTreatmentRawValue?: string | number,
  selectedIndex?: number,
  treatmentFeature?: string,
  requestCausalWhatIf?:
    | ((
        id: string,
        features: unknown[],
        featureName: string,
        newValue: unknown[],
        target: unknown[],
        abortSignal: AbortSignal
      ) => Promise<ICausalWhatIfData[]>)
    | undefined
): Promise<void> {
  if (
    !causalAnalysisDataId ||
    !treatmentFeature ||
    selectedIndex === undefined ||
    newTreatmentValue === undefined ||
    !requestCausalWhatIf
  ) {
    return;
  }
  setNewOutcome(undefined);
  const data = getFeaturesData(
    dataset,
    cohort,
    jointDataset,
    testDataRow,
    selectedIndex
  );
  const targetColumn = getTargetColumn(dataset);
  const targetValue =
    ifEnableLargeData(dataset) && targetColumn
      ? testDataRow[targetColumn]
      : cohort.getRow(selectedIndex)[JointDataset.TrueYLabel];

  const result = await requestCausalWhatIf(
    causalAnalysisDataId,
    [data],
    treatmentFeature,
    [newTreatmentRawValue],
    [targetValue],
    new AbortController().signal
  );
  setNewOutcome(result[0]);
}

export function getFeaturesData(
  dataset: IDataset,
  cohort: Cohort,
  jointDataset: JointDataset,
  testDataRow: any,
  selectedIndex?: number
): _.Dictionary<string | number | undefined> | undefined {
  if (selectedIndex === undefined) {
    return;
  }
  let data;
  if (!ifEnableLargeData(dataset)) {
    data = _.chain(cohort.getRow(selectedIndex))
      .pickBy(
        (_, k) =>
          jointDataset.metaDict[k]?.category === ColumnCategories.Dataset
      )
      .mapValues(jointDataset.getRawValue)
      .mapKeys((_, k) => jointDataset.metaDict[k].label)
      .value();
  } else {
    const tempTestDataRow = _.cloneDeep(testDataRow);
    const targetColumn = getTargetColumn(dataset);
    if (targetColumn) {
      delete tempTestDataRow[targetColumn];
    }
    data = tempTestDataRow;
  }
  return data;
}

export function getTargetColumn(dataset: IDataset): string | undefined {
  const targetColumn = Array.isArray(dataset.target_column)
    ? dataset.target_column?.[0]
    : dataset.target_column;
  return targetColumn;
}
