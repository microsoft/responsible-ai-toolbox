// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { strict as assert } from "assert";

import _ from "lodash";

import { dummyMatrixData } from "./__mock_data__/dummyMatrix";
import { dummyMatrixBostonData } from "./__mock_data__/dummyMatrixBoston";
import { dummyMatrix1dInterval } from "./__mock_data__/dummyMatrixOnedInterval";
import { dummyMatrixPrecisionBreastCancer } from "./__mock_data__/dummyMatrixPrecisionBreastCancer";
import { dummyMatrix2dInterval } from "./__mock_data__/dummyMatrixTwodInterval";
import { dummyTreeAdultCensusIncomeData } from "./__mock_data__/dummyTreeAdultCensusIncome";
import { dummyTreeBostonData } from "./__mock_data__/dummyTreeBoston";
import { dummyTreeBreastCancerData } from "./__mock_data__/dummyTreeBreastCancer";
import { dummyTreeBreastCancerPrecisionData } from "./__mock_data__/dummyTreeBreastCancerPrecision";
import { dummyTreeBreastCancerRecallData } from "./__mock_data__/dummyTreeBreastCancerRecall";
import { dummyTreeWineData } from "./__mock_data__/dummyTreeWine";

export enum DatasetName {
  AdultCensusIncome = 1,
  BreastCancer,
  Boston,
  BreastCancerPrecision,
  BreastCancerRecall,
  Wine
}

export function getJsonMatrix(): any {
  return {
    data: _.cloneDeep(dummyMatrix2dInterval),
    features: ["mean radius", "mean texture"]
  };
}

export function getJsonTreeBreastCancer(featureNames: string[]): any {
  return {
    data: getJsonTree(DatasetName.BreastCancer),
    features: featureNames.filter((feature) => feature.startsWith("mean"))
  };
}

export function getJsonTreeBreastCancerRecall(featureNames: string[]): any {
  return {
    data: getJsonTree(DatasetName.BreastCancerRecall),
    features: featureNames.filter((feature) => feature.startsWith("mean"))
  };
}

export function getJsonTreeBreastCancerPrecision(featureNames: string[]): any {
  return {
    data: getJsonTree(DatasetName.BreastCancerPrecision),
    features: featureNames.filter((feature) => feature.startsWith("mean"))
  };
}

export function getJsonTreeAdultCensusIncome(featureNames: string[]): any {
  return {
    data: getJsonTree(DatasetName.AdultCensusIncome),
    features: featureNames.filter(
      (feature) =>
        feature.startsWith("a") ||
        feature.startsWith("c") ||
        feature.startsWith("m") ||
        feature.startsWith("e")
    )
  };
}

export function getJsonTreeBoston(featureNames: string[]): any {
  return {
    data: getJsonTree(DatasetName.Boston),
    features: featureNames
  };
}

export function getJsonTreeWine(featureNames: string[]): any {
  return {
    data: getJsonTree(DatasetName.Wine),
    features: featureNames
  };
}

export function getJsonTree(dataset: DatasetName): any {
  if (dataset === DatasetName.BreastCancer) {
    return _.cloneDeep(dummyTreeBreastCancerData);
  } else if (dataset === DatasetName.Boston) {
    return _.cloneDeep(dummyTreeBostonData);
  } else if (dataset === DatasetName.BreastCancerPrecision) {
    return _.cloneDeep(dummyTreeBreastCancerPrecisionData);
  } else if (dataset === DatasetName.BreastCancerRecall) {
    return _.cloneDeep(dummyTreeBreastCancerRecallData);
  } else if (dataset === DatasetName.Wine) {
    return _.cloneDeep(dummyTreeWineData);
  }
  return _.cloneDeep(dummyTreeAdultCensusIncomeData);
}

export function generateJsonTree(
  _data: any[],
  signal: AbortSignal,
  dataset: DatasetName
): Promise<any> {
  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (dataset === DatasetName.BreastCancer) {
        resolve(_.cloneDeep(dummyTreeBreastCancerData));
      } else if (dataset === DatasetName.AdultCensusIncome) {
        resolve(_.cloneDeep(dummyTreeAdultCensusIncomeData));
      } else if (dataset === DatasetName.BreastCancerPrecision) {
        resolve(_.cloneDeep(dummyTreeBreastCancerPrecisionData));
      } else if (dataset === DatasetName.BreastCancerRecall) {
        resolve(_.cloneDeep(dummyTreeBreastCancerRecallData));
      } else if (dataset === DatasetName.Wine) {
        resolve(_.cloneDeep(dummyTreeWineData));
      } else {
        resolve(_.cloneDeep(dummyTreeBostonData));
      }
    }, 300);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return promise;
}

export function generateJsonTreeBreastCancer(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, DatasetName.BreastCancer);
}

export function generateJsonTreeBreastCancerRecall(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, DatasetName.BreastCancerRecall);
}

export function generateJsonTreeBreastCancerPrecision(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, DatasetName.BreastCancerPrecision);
}

export function generateJsonTreeAdultCensusIncome(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, DatasetName.AdultCensusIncome);
}

export function generateJsonTreeBoston(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, DatasetName.Boston);
}

export function generateJsonTreeWine(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, DatasetName.Wine);
}

export function generateJsonMatrix(dataset: DatasetName) {
  return (data: any[], signal: AbortSignal): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (
          data.length === 5 &&
          data[0][0] === "mean radius" &&
          data[0][1] === "mean texture"
        ) {
          resolve(_.cloneDeep(dummyMatrix2dInterval));
        } else if (
          dataset !== DatasetName.BreastCancerPrecision &&
          (data[0][0] === "mean radius" || data[0][1] === "mean radius")
        ) {
          resolve(_.cloneDeep(dummyMatrix1dInterval));
        } else if (
          data[0][0] === "mean radius" ||
          data[0][1] === "mean radius"
        ) {
          resolve(_.cloneDeep(dummyMatrixPrecisionBreastCancer));
        } else if (
          data.length === 5 &&
          data[0][0] === "CRIM" &&
          data[0][1] === "ZN"
        ) {
          resolve(_.cloneDeep(dummyMatrixBostonData));
        } else {
          resolve(_.cloneDeep(dummyMatrixData));
        }
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  };
}

export function createJsonImportancesGenerator(
  featureNames: string[],
  dataset: DatasetName
) {
  return (_data: any[], signal: AbortSignal): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        assert(
          dataset === DatasetName.BreastCancer ||
            dataset === DatasetName.AdultCensusIncome ||
            dataset === DatasetName.Boston ||
            dataset === DatasetName.BreastCancerPrecision ||
            dataset === DatasetName.BreastCancerRecall ||
            dataset === DatasetName.Wine
        );
        resolve(featureNames.map(() => Math.random()));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  };
}

export function createPredictionsRequestGenerator(
  classDimension?: 1 | 2 | 3
): ((data: any[], signal: AbortSignal) => Promise<any[]>) | undefined {
  if (!classDimension) {
    return undefined;
  }
  return (data: any[], signal: AbortSignal): Promise<any[]> => {
    return classDimension === 1
      ? generateRandomScore(data, signal)
      : generateRandomProbs(classDimension, data, signal);
  };
}

export function generateRandomScore(
  data: any[],
  signal: AbortSignal
): Promise<any[]> {
  const promise = new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(data.map(() => Math.random()));
    }, 300);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return promise;
}

export function generateRandomProbs(
  classDimensions: 2 | 3,
  data: any[],
  signal: AbortSignal
): Promise<any[]> {
  const promise = new Promise<any[]>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(
        data.map(() =>
          Array.from({ length: classDimensions }, () => Math.random())
        )
      );
    }, 300);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return promise;
}
