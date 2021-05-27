// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { dummyMatrixData } from "./__mock_data__/dummyMatrix";
import { dummyMatrixBostonData } from "./__mock_data__/dummyMatrixBoston";
import { dummyMatrix1dInterval } from "./__mock_data__/dummyMatrixOnedInterval";
import { dummyMatrix2dInterval } from "./__mock_data__/dummyMatrixTwodInterval";
import { dummyTreeAdultCensusIncomeData } from "./__mock_data__/dummyTreeAdultCensusIncome";
import { dummyTreeBostonData } from "./__mock_data__/dummyTreeBoston";
import { dummyTreeBreastCancerData } from "./__mock_data__/dummyTreeBreastCancer";

export enum DatasetName {
  AdultCensusIncome = 1,
  BreastCancer,
  Boston
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

export function getJsonTree(dataset: DatasetName): any {
  if (dataset === DatasetName.BreastCancer) {
    return _.cloneDeep(dummyTreeBreastCancerData);
  } else if (dataset === DatasetName.Boston) {
    return _.cloneDeep(dummyTreeBostonData);
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

export function generateJsonMatrix(
  data: any[],
  signal: AbortSignal
): Promise<any> {
  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (
        data.length === 3 &&
        data[0][0] === "mean radius" &&
        data[0][1] === "mean texture"
      ) {
        resolve(_.cloneDeep(dummyMatrix2dInterval));
      } else if (data[0][0] === "mean radius" || data[0][1] === "mean radius") {
        resolve(_.cloneDeep(dummyMatrix1dInterval));
      } else if (
        data.length === 3 &&
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
}

export function createJsonImportancesGenerator(
  featureNames: string[],
  dataset: DatasetName
) {
  return (_data: any[], signal: AbortSignal): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (dataset === DatasetName.BreastCancer) {
          resolve(featureNames.map(() => Math.random()));
        } else if (dataset === DatasetName.AdultCensusIncome) {
          resolve(featureNames.map(() => Math.random()));
        } else {
          resolve(featureNames.map(() => Math.random()));
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

export function createPredictionsRequestGenerator(classDimension?: 1 | 2 | 3) {
  return (data: any[], signal: AbortSignal): Promise<any[]> => {
    return !classDimension || classDimension === 1
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
