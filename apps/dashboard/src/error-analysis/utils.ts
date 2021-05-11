// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { dummyMatrixData } from "./__mock_data__/dummyMatrix";
import { dummyMatrix1dInterval } from "./__mock_data__/dummyMatrixOnedInterval";
import { dummyMatrix2dInterval } from "./__mock_data__/dummyMatrixTwodInterval";
import { dummyTreeAdultCensusIncomeData } from "./__mock_data__/dummyTreeAdultCensusIncome";
import { dummyTreeBreastCancerData } from "./__mock_data__/dummyTreeBreastCancer";

export function getJsonMatrix(): any {
  return {
    data: _.cloneDeep(dummyMatrix2dInterval),
    features: ["mean radius", "mean texture"]
  };
}

export function getJsonTreeBreastCancer(): any {
  return {
    data: getJsonTree(true),
    features: generateFeatures().filter((feature) => feature.startsWith("mean"))
  };
}

export function getJsonTreeAdultCensusIncome(featureNames: string[]): any {
  return {
    data: getJsonTree(false),
    features: featureNames.filter(
      (feature) =>
        feature.startsWith("a") ||
        feature.startsWith("c") ||
        feature.startsWith("m") ||
        feature.startsWith("e")
    )
  };
}

export function getJsonTree(isBreastCancer: boolean): any {
  if (isBreastCancer) return _.cloneDeep(dummyTreeBreastCancerData);

  return _.cloneDeep(dummyTreeAdultCensusIncomeData);
}

export function generateJsonTree(
  _data: any[],
  signal: AbortSignal,
  isBreastCancer: boolean
): Promise<any> {
  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (isBreastCancer) resolve(_.cloneDeep(dummyTreeBreastCancerData));
      else resolve(_.cloneDeep(dummyTreeAdultCensusIncomeData));
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
  return generateJsonTree(_data, signal, true);
}

export function generateJsonTreeAdultCensusIncome(
  _data: any[],
  signal: AbortSignal
): Promise<any> {
  return generateJsonTree(_data, signal, false);
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
      )
        resolve(_.cloneDeep(dummyMatrix2dInterval));
      else if (data[0][0] === "mean radius" || data[0][1] === "mean radius")
        resolve(_.cloneDeep(dummyMatrix1dInterval));
      else resolve(_.cloneDeep(dummyMatrixData));
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
  isBreastCancer: boolean
) {
  return (_data: any[], signal: AbortSignal): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (isBreastCancer)
          resolve(generateFeatures().map(() => Math.random()));
        else resolve(featureNames.map(() => Math.random()));
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

export function generateFeatures(): string[] {
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
