// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ErrorCohortStats,
  IErrorAnalysisMatrixNode,
  MetricCohortStats,
  Metrics
} from "@responsible-ai/core-ui";

/**
 * Temporary abstract class for aggregating cohort stats.
 */
export abstract class BaseStatsAggregator {
  public metricName: string;
  public totalCohortCount = 0;
  public totalGlobalCount = 0;
  public existsSelectedCell = false;
  public constructor(metricName: string) {
    this.metricName = metricName;
  }

  public updateCohort(value: IErrorAnalysisMatrixNode): void {
    this.updateCohortStats(value);
    this.updateCohortCount(value.count);
    this.existsSelectedCell = true;
  }

  public updateGlobal(value: IErrorAnalysisMatrixNode): void {
    this.updateGlobalStats(value);
    this.updateGlobalCount(value.count);
  }

  protected updateCohortCount(count: number): void {
    this.totalCohortCount += count;
  }

  protected updateGlobalCount(count: number): void {
    this.totalGlobalCount += count;
  }

  public abstract createCohortStats(): MetricCohortStats;

  protected abstract updateCohortStats(value: IErrorAnalysisMatrixNode): void;

  protected abstract updateGlobalStats(value: IErrorAnalysisMatrixNode): void;
}

/**
 * Temporary class for aggregating cohort stats for error rate.
 */
export class ErrorRateStatsAggregator extends BaseStatsAggregator {
  public falseCohortCount = 0;
  public falseGlobalCount = 0;

  public updateCohortStats(value: IErrorAnalysisMatrixNode): void {
    if (value.falseCount !== undefined) {
      this.falseCohortCount += value.falseCount;
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.falseCount !== undefined) {
      this.falseGlobalCount += value.falseCount;
    }
  }

  public createCohortStats(): MetricCohortStats {
    if (this.existsSelectedCell) {
      const metricValue = (this.falseCohortCount / this.totalCohortCount) * 100;
      return new ErrorCohortStats(
        this.falseCohortCount,
        this.totalCohortCount,
        this.falseGlobalCount,
        this.totalGlobalCount,
        metricValue,
        this.metricName
      );
    }
    const metricValue = (this.falseGlobalCount / this.totalGlobalCount) * 100;
    return new ErrorCohortStats(
      this.falseGlobalCount,
      this.totalGlobalCount,
      this.falseGlobalCount,
      this.totalGlobalCount,
      metricValue,
      this.metricName
    );
  }
}

/**
 * Temporary class for aggregating cohort stats for metrics.
 */
export class MetricStatsAggregator extends BaseStatsAggregator {
  public totalCohortError = 0;
  public totalGlobalError = 0;

  public updateCohortStats(value: IErrorAnalysisMatrixNode): void {
    if (value.metricValue !== undefined) {
      this.totalCohortError += value.metricValue * value.count;
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.metricValue !== undefined) {
      this.totalGlobalError += value.metricValue * value.count;
    }
  }

  public createCohortStats(): MetricCohortStats {
    if (this.existsSelectedCell) {
      const metricValue = this.totalCohortError / this.totalCohortCount;
      const coverage = (this.totalCohortError / this.totalGlobalError) * 100;
      return new MetricCohortStats(
        this.totalCohortCount,
        this.totalGlobalCount,
        metricValue,
        this.metricName,
        coverage
      );
    }
    const metricValue = this.totalGlobalError / this.totalGlobalCount;
    const coverage = 100;
    return new MetricCohortStats(
      this.totalCohortCount,
      this.totalGlobalCount,
      metricValue,
      this.metricName,
      coverage
    );
  }
}

/**
 * Temporary class for aggregating cohort stats for precision.
 */
export class PrecisionStatsAggregator extends BaseStatsAggregator {
  public totalCohortError = 0;
  public totalGlobalError = 0;
  public tpCohort: number[] = [];
  public tpGlobal: number[] = [];
  public fpCohort: number[] = [];
  public fpGlobal: number[] = [];

  public updateCohortStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalCohortError += value.error;
      if (this.tpCohort.length === 0) {
        this.tpCohort = [...value.tp];
      }
      this.tpCohort = this.tpCohort.map((num, idx) => num + value.tp[idx]);
      if (this.fpCohort.length === 0) {
        this.fpCohort = [...value.fp];
      }
      this.fpCohort = this.fpCohort.map((num, idx) => num + value.fp[idx]);
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalGlobalError += value.error;
    }
    if (this.tpGlobal.length === 0) {
      this.tpGlobal = [...value.tp];
    }
    this.tpGlobal = this.tpGlobal.map((num, idx) => num + value.tp[idx]);
    if (this.fpGlobal.length === 0) {
      this.fpGlobal = [...value.fp];
    }
    this.fpGlobal = this.fpGlobal.map((num, idx) => num + value.fp[idx]);
  }

  public createCohortStats(): MetricCohortStats {
    let metricValue = 0;
    let coverage = 0;
    if (this.existsSelectedCell) {
      metricValue = this.computeMetricValue(this.tpCohort, this.fpCohort);
      coverage = (this.totalCohortError / this.totalGlobalError) * 100;
    } else {
      metricValue = this.computeMetricValue(this.tpGlobal, this.fpGlobal);
      coverage = 100;
    }
    return new MetricCohortStats(
      this.totalCohortCount,
      this.totalGlobalCount,
      metricValue,
      this.metricName,
      coverage
    );
  }

  private computeMetricValue(tp: number[], fp: number[]) {
    let metricValue = 0;
    if (this.metricName === Metrics.PrecisionScore) {
      if (tp.length === 2) {
        // For binary case where negative and positive labels exist
        metricValue = tp[1] / (tp[1] + fp[1]);
      } else {
        // For binary case where only positive labels specified
        metricValue = tp[0] / (tp[0] + fp[0]);
      }
    } else if (this.metricName === Metrics.MicroPrecisionScore) {
      // Take aggregate across all classes
      const tpSum = tp.reduce((sum, value) => sum + value, 0);
      const fpSum = fp.reduce((sum, value) => sum + value, 0);
      metricValue = tpSum / (tpSum + fpSum);
    } else if (this.metricName === Metrics.MacroPrecisionScore) {
      // Compute per class and then average
      const perClassMetrics: number[] = [];
      tp.map((num, idx) => perClassMetrics.push(num / (num + fp[idx])));
      metricValue =
        perClassMetrics.reduce((sum, value) => sum + value, 0) /
        perClassMetrics.length;
    }
    return metricValue;
  }
}

/**
 * Temporary class for aggregating cohort stats for recall.
 */
export class RecallStatsAggregator extends BaseStatsAggregator {
  public totalCohortError = 0;
  public totalGlobalError = 0;
  public tpCohort: number[] = [];
  public tpGlobal: number[] = [];
  public fnCohort: number[] = [];
  public fnGlobal: number[] = [];

  public updateCohortStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalCohortError += value.error;
      if (this.tpCohort.length === 0) {
        this.tpCohort = [...value.tp];
      }
      this.tpCohort = this.tpCohort.map((num, idx) => num + value.tp[idx]);
      if (this.fnCohort.length === 0) {
        this.fnCohort = [...value.fn];
      }
      this.fnCohort = this.fnCohort.map((num, idx) => num + value.fn[idx]);
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalGlobalError += value.error;
    }
    if (this.tpGlobal.length === 0) {
      this.tpGlobal = [...value.tp];
    }
    this.tpGlobal = this.tpGlobal.map((num, idx) => num + value.tp[idx]);
    if (this.fnGlobal.length === 0) {
      this.fnGlobal = [...value.fn];
    }
    this.fnGlobal = this.fnGlobal.map((num, idx) => num + value.fn[idx]);
  }

  public createCohortStats(): MetricCohortStats {
    let metricValue = 0;
    let coverage = 0;
    if (this.existsSelectedCell) {
      metricValue = this.computeMetricValue(this.tpCohort, this.fnCohort);
      coverage = (this.totalCohortError / this.totalGlobalError) * 100;
    } else {
      metricValue = this.computeMetricValue(this.tpGlobal, this.fnGlobal);
      coverage = 100;
    }
    return new MetricCohortStats(
      this.totalCohortCount,
      this.totalGlobalCount,
      metricValue,
      this.metricName,
      coverage
    );
  }

  private computeMetricValue(tp: number[], fn: number[]) {
    let metricValue = 0;
    if (this.metricName === Metrics.RecallScore) {
      if (tp.length === 2) {
        // For binary case where negative and positive labels exist
        metricValue = tp[1] / (tp[1] + fn[1]);
      } else {
        // For binary case where only positive labels specified
        metricValue = tp[0] / (tp[0] + fn[0]);
      }
    } else if (this.metricName === Metrics.MicroRecallScore) {
      // Take aggregate across all classes
      const tpSum = tp.reduce((sum, value) => sum + value, 0);
      const fnSum = fn.reduce((sum, value) => sum + value, 0);
      metricValue = tpSum / (tpSum + fnSum);
    } else if (this.metricName === Metrics.MacroRecallScore) {
      // Compute per class and then average
      const perClassMetrics: number[] = [];
      tp.map((num, idx) => perClassMetrics.push(num / (num + fn[idx])));
      metricValue =
        perClassMetrics.reduce((sum, value) => sum + value, 0) /
        perClassMetrics.length;
    }
    return metricValue;
  }
}
