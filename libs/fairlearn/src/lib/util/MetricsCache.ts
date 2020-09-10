import _ from "lodash";
import { IMetricResponse, IMetricRequest } from "../IFairnessProps";
import { ParityModes } from "./ParityMetrics";

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
    key: string
  ): Promise<IMetricResponse> {
    let value = this.cache[featureIndex][modelIndex][key];
    if (value === undefined && this.fetchMethod) {
      value = await this.fetchMethod({
        metricKey: key,
        binVector: binIndexVector,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][key] = value;
    }
    return this.cache[featureIndex][modelIndex][key];
  }

  public async getDisparityMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    disparityMethod: ParityModes
  ): Promise<number> {
    let value = this.cache[featureIndex][modelIndex][key];
    if (value === undefined && this.fetchMethod) {
      value = await this.fetchMethod({
        metricKey: key,
        binVector: binIndexVector,
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
      (max === 0 && disparityMethod === ParityModes.ratio)
    ) {
      return Number.NaN;
    }
    return disparityMethod === ParityModes.difference ? max - min : min / max;
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
