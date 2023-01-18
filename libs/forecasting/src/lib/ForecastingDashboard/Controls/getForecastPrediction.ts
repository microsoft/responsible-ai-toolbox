// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  ICompositeFilter,
  IFilter,
  JointDataset,
  Operations
} from "@responsible-ai/core-ui";

import { Transformation } from "../Interfaces/Transformation";

export async function getForecastPrediction(
  cohort: Cohort,
  jointDataset: JointDataset,
  requestForecast:
    | ((request: any[], abortSignal: AbortSignal) => Promise<any[]>)
    | undefined,
  transformation?: Transformation
): Promise<number[] | undefined> {
  if (requestForecast === undefined) {
    return;
  }
  return await requestForecast(
    [
      decodeFilters(
        Cohort.getLabeledFilters(cohort.filters, jointDataset),
        jointDataset
      ),
      decodeCompositeFilters(
        Cohort.getLabeledCompositeFilters(
          cohort.compositeFilters,
          jointDataset
        ),
        jointDataset
      ),
      transformation
        ? [
            transformation.operation.key,
            jointDataset.metaDict[transformation.feature.key].label,
            jointDataset.getRawValue(
              transformation.value,
              transformation.feature.key
            )
          ]
        : []
    ],
    new AbortController().signal
  );
}

interface IFilterWithStringArgs extends Omit<IFilter, "arg"> {
  arg: (string | number)[];
}

type ICompositeFilterWithStringArgs =
  | IFilterWithStringArgs
  | {
      compositeFilters: ICompositeFilterWithStringArgs[];
      operation: Operations;
      method?: never;
    };

function decodeFilters(
  filters: IFilter[],
  jointDataset: JointDataset
): IFilterWithStringArgs[] {
  return filters.map((filter): IFilterWithStringArgs => {
    return {
      ...filter,
      arg: filter.arg.map(
        // getRawValue only returns undefined if v is undefined,
        // so we can safely cast to string | number
        (v) => jointDataset.getRawValue(v, filter.column) as string | number
      )
    };
  });
}

function decodeCompositeFilters(
  compositeFilters: ICompositeFilter[],
  jointDataset: JointDataset
): ICompositeFilterWithStringArgs[] {
  return compositeFilters.map(
    (compositeFilter): ICompositeFilterWithStringArgs => {
      if (compositeFilter.method) {
        // compositeFilter is a filter
        return decodeFilter(compositeFilter, jointDataset);
      }
      return {
        compositeFilters: decodeCompositeFilter(
          compositeFilter.compositeFilters,
          jointDataset
        ),
        operation: compositeFilter.operation
      };
    }
  );
}
