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

export enum Dataset {
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

export function getJsonTreeBreastCancer(): any {
  return {
    data: getJsonTree(Dataset.BreastCancer),
    features: generateBreastCancerFeatures().filter((feature) =>
      feature.startsWith("mean")
    )
  };
}

export function getJsonTreeAdultCensusIncome(featureNames: string[]): any {
  return {
    data: getJsonTree(Dataset.AdultCensusIncome),
    features: featureNames.filter(
      (feature) =>
        feature.startsWith("a") ||
        feature.startsWith("c") ||
        feature.startsWith("m") ||
        feature.startsWith("e")
    )
  };
}

export function getJsonTreeBoston(): any {
  return {
    data: getJsonTree(Dataset.Boston),
    features: generateBostonFeatures()
  };
}

export function getJsonTree(dataset: Dataset): any {
  if (dataset === Dataset.BreastCancer) {
    return _.cloneDeep(dummyTreeBreastCancerData);
  } else if (dataset === Dataset.Boston) {
    return _.cloneDeep(dummyTreeBostonData);
  }
  return _.cloneDeep(dummyTreeAdultCensusIncomeData);
}

export function generateJsonTree(
  _data: any[],
  signal: AbortSignal,
  dataset: Dataset
): Promise<any> {
  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (dataset === Dataset.BreastCancer) {
        resolve(_.cloneDeep(dummyTreeBreastCancerData));
      } else if (dataset === Dataset.AdultCensusIncome) {
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
  return generateJsonTree(_data, signal, Dataset.BreastCancer);
}

export function generateJsonTreeAdultCensusIncome(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, Dataset.AdultCensusIncome);
}

export function generateJsonTreeBoston(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, Dataset.Boston);
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
  dataset: Dataset
) {
  return (_data: any[], signal: AbortSignal): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (dataset === Dataset.BreastCancer) {
          resolve(generateBreastCancerFeatures().map(() => Math.random()));
        } else if (dataset === Dataset.AdultCensusIncome) {
          resolve(featureNames.map(() => Math.random()));
        } else {
          resolve(generateBostonFeatures().map(() => Math.random()));
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

export function generateBreastCancerFeatures(): string[] {
  return [
    "mean radius",
    "mean texture",
    "mean perimeter",
    "mean area",
    "mean smoothness",
    "mean compactness",
    "mean concavity",
    "mean concave points",
    "mean symmetry",
    "mean fractal dimension",
    "radius error",
    "texture error",
    "perimeter error",
    "area error",
    "smoothness error",
    "compactness error",
    "concavity error",
    "concave points error",
    "symmetry error",
    "fractal dimension error",
    "worst radius",
    "worst texture",
    "worst perimeter",
    "worst area",
    "worst smoothness",
    "worst compactness",
    "worst concavity",
    "worst concave points",
    "worst symmetry",
    "worst fractal dimension"
  ];
}

export function generateBostonFeatures(): string[] {
  return [
    "CRIM",
    "ZN",
    "INDUS",
    "CHAS",
    "NOX",
    "RM",
    "AGE",
    "DIS",
    "RAD",
    "TAX",
    "PTRATIO",
    "B",
    "LSTAT"
  ];
}
