// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMetricResponse,
  IMetricRequest,
  IFairnessResponse
} from "@responsible-ai/core-ui";
import _, { max, min } from "lodash";

import { calculateFairnessMetric } from "./calculateFairnessMetric";
import { FairnessModes, fairnessOptions } from "./FairnessMetrics";

export class MetricsCache {
  // Top index is featureBin index, second index is model index. Third string key is metricKey
  private cache: Array<Array<{ [key: string]: IMetricResponse }>>;
  public constructor(
    private featureCount: number,
    private numberOfModels: number,
    private fetchMethod?: (request: IMetricRequest) => Promise<IMetricResponse>,
    precomputedCache?: Array<Array<{ [key: string]: IMetricResponse }>>
  ) {
    if (precomputedCache) {
      this.cache = precomputedCache;
    } else {
      this.cache = new Array(featureCount).fill(0).map(() =>
        new Array(numberOfModels).fill(0).map(() => {
          return {};
        })
      );
    }
  }

  public async getMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    errorBarsEnabled: boolean
  ): Promise<IMetricResponse> {
    let value = this.cache[featureIndex][modelIndex][key];
    if ((!value || (!value.bounds && errorBarsEnabled)) && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        errorBarsEnabled,
        metricKey: key,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][key] = value;
    }
    return this.cache[featureIndex][modelIndex][key];
  }

  public async getEqualizedOdds(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    fairnessMethod: FairnessModes,
    errorBarsEnabled: boolean
  ): Promise<IFairnessResponse> {
    const falsePositiveRateMetric = (
      await this.getFairnessMetric(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod === FairnessModes.Difference
          ? "false_positive_rate_difference"
          : "false_positive_rate_ratio",
        fairnessMethod,
        errorBarsEnabled
      )
    ).overall;
    const truePositiveRateMetric = (
      await this.getFairnessMetric(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod === FairnessModes.Difference
          ? "true_positive_rate_difference"
          : "true_positive_rate_ratio",
        fairnessMethod,
        errorBarsEnabled
      )
    ).overall;

    if (
      falsePositiveRateMetric === Number.NaN ||
      truePositiveRateMetric === Number.NaN
    ) {
      return { overall: Number.NaN };
    }

    if (fairnessMethod === FairnessModes.Difference) {
      const maxMetric = max([falsePositiveRateMetric, truePositiveRateMetric]);
      return { overall: maxMetric ?? Number.NaN };
    }

    // assumes FairnessModes.Ratio
    const minMetric = min([falsePositiveRateMetric, truePositiveRateMetric]);
    return { overall: minMetric ?? Number.NaN };
  }

  public async getFairnessMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    fairnessMethod: FairnessModes,
    errorBarsEnabled: boolean
  ): Promise<IFairnessResponse> {
    // Equalized Odds is calculated based on two other fairness metrics.
    if (key.startsWith("equalized_odds")) {
      return this.getEqualizedOdds(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod,
        errorBarsEnabled
      );
    }

    const metricKey = fairnessOptions[key].fairnessMetric;
    let value = this.cache[featureIndex][modelIndex][metricKey];
    if ((!value || (!value.bounds && errorBarsEnabled)) && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        errorBarsEnabled,
        metricKey,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][metricKey] = value;
    }
    if (!value || !value?.bins) {
      return { overall: Number.NaN };
    }

    return calculateFairnessMetric(value, fairnessMethod);
  }

  public async getFairnessMetricV1(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    fairnessMethod: FairnessModes
  ): Promise<number> {
    let value = this.cache[featureIndex][modelIndex][key];
    if (!value && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        metricKey: key,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][key] = value;
    }
    if (!value?.bins) {
      return Number.NaN;
    }

    const bins = value.bins
      .slice()
      .filter((x) => x !== undefined && !Number.isNaN(x));

    const min = _.min(bins);
    const max = _.max(bins);
    if (
      min === undefined ||
      max === undefined ||
      (max === 0 && fairnessMethod === FairnessModes.Ratio)
    ) {
      return Number.NaN;
    }
    return fairnessMethod === FairnessModes.Difference ? max - min : min / max;
  }

  public clearCache(binIndex?: number): void {
    if (binIndex !== undefined) {
      this.cache[binIndex] = new Array(this.numberOfModels).fill(0).map(() => {
        return {};
      });
    } else {
      this.cache = new Array(this.featureCount).fill(0).map(() =>
        new Array(this.numberOfModels).fill(0).map(() => {
          return {};
        })
      );
    }
  }
}
