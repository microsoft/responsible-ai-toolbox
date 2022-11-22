// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ErrorCohortStats,
  IErrorAnalysisMatrixNode,
  MetricCohortStats,
  Metrics
} from "@responsible-ai/core-ui";

/**
 * Temporary abstract class for cohort statistics.
 */
export abstract class BaseStats {
  public metricName: string;
  public constructor(metricName: string) {
    this.metricName = metricName;
  }

  public abstract updateCohort(value: IErrorAnalysisMatrixNode): void;

  public abstract updateGlobal(value: IErrorAnalysisMatrixNode): void;

  public abstract createCohortStats(): MetricCohortStats;
}

/**
 * Temporary abstract class for aggregating cohort stats.
 */
export abstract class BaseStatsAggregator extends BaseStats {
  public totalCohortCount = 0;
  public totalGlobalCount = 0;
  public existsSelectedCell = false;

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
      } else {
        this.tpCohort = this.tpCohort.map((num, idx) => num + value.tp[idx]);
      }
      if (this.fpCohort.length === 0) {
        this.fpCohort = [...value.fp];
      } else {
        this.fpCohort = this.fpCohort.map((num, idx) => num + value.fp[idx]);
      }
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalGlobalError += value.error;
    }
    if (this.tpGlobal.length === 0) {
      this.tpGlobal = [...value.tp];
    } else {
      this.tpGlobal = this.tpGlobal.map((num, idx) => num + value.tp[idx]);
    }
    if (this.fpGlobal.length === 0) {
      this.fpGlobal = [...value.fp];
    } else {
      this.fpGlobal = this.fpGlobal.map((num, idx) => num + value.fp[idx]);
    }
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

  private computeMetricValue(tp: number[], fp: number[]): number {
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
      } else {
        this.tpCohort = this.tpCohort.map((num, idx) => num + value.tp[idx]);
      }
      if (this.fnCohort.length === 0) {
        this.fnCohort = [...value.fn];
      } else {
        this.fnCohort = this.fnCohort.map((num, idx) => num + value.fn[idx]);
      }
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalGlobalError += value.error;
    }
    if (this.tpGlobal.length === 0) {
      this.tpGlobal = [...value.tp];
    } else {
      this.tpGlobal = this.tpGlobal.map((num, idx) => num + value.tp[idx]);
    }
    if (this.fnGlobal.length === 0) {
      this.fnGlobal = [...value.fn];
    } else {
      this.fnGlobal = this.fnGlobal.map((num, idx) => num + value.fn[idx]);
    }
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

  private computeMetricValue(tp: number[], fn: number[]): number {
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

/**
 * Temporary class for aggregating cohort stats for F1 score.
 */
export class F1ScoreStatsAggregator extends BaseStats {
  public precisionAggregator: PrecisionStatsAggregator;
  public recallAggregator: RecallStatsAggregator;
  public constructor(metricName: string) {
    super(metricName);
    let precisionMetric: string = Metrics.PrecisionScore;
    let recallMetric: string = Metrics.RecallScore;
    if (metricName === Metrics.MicroF1Score) {
      precisionMetric = Metrics.MicroPrecisionScore;
      recallMetric = Metrics.MicroRecallScore;
    } else if (metricName === Metrics.MacroF1Score) {
      precisionMetric = Metrics.MacroPrecisionScore;
      recallMetric = Metrics.MacroRecallScore;
    }
    this.precisionAggregator = new PrecisionStatsAggregator(precisionMetric);
    this.recallAggregator = new RecallStatsAggregator(recallMetric);
  }

  public updateCohort(value: IErrorAnalysisMatrixNode): void {
    this.precisionAggregator.updateCohort(value);
    this.recallAggregator.updateCohort(value);
  }

  public updateGlobal(value: IErrorAnalysisMatrixNode): void {
    this.precisionAggregator.updateGlobal(value);
    this.recallAggregator.updateGlobal(value);
  }

  public createCohortStats(): MetricCohortStats {
    let metricValue = 0;
    const precisionCohortStats = this.precisionAggregator.createCohortStats();
    const recallCohortStats = this.recallAggregator.createCohortStats();
    if (this.metricName !== Metrics.MacroF1Score) {
      const precisionMetric = precisionCohortStats.metricValue;
      const recallMetric = recallCohortStats.metricValue;
      metricValue =
        (2 * (precisionMetric * recallMetric)) /
        (precisionMetric + recallMetric);
    } else if (this.precisionAggregator.existsSelectedCell) {
      metricValue = this.computeMacroF1MetricValue(
        this.precisionAggregator.tpCohort,
        this.precisionAggregator.fpCohort,
        this.recallAggregator.fnCohort
      );
    } else {
      metricValue = this.computeMacroF1MetricValue(
        this.precisionAggregator.tpGlobal,
        this.precisionAggregator.fpGlobal,
        this.recallAggregator.fnGlobal
      );
    }
    return new MetricCohortStats(
      precisionCohortStats.totalCohort,
      precisionCohortStats.totalAll,
      metricValue,
      this.metricName,
      precisionCohortStats.errorCoverage
    );
  }

  public computeMacroF1MetricValue(
    tp: number[],
    fp: number[],
    fn: number[]
  ): number {
    const perClassPrecision: number[] = [];
    tp.map((num, idx) => perClassPrecision.push(num / (num + fp[idx])));
    const perClassRecall: number[] = [];
    tp.map((num, idx) => perClassRecall.push(num / (num + fn[idx])));
    const perClassF1Score: number[] = [];
    perClassPrecision.forEach((precision, idx) => {
      const recall = perClassRecall[idx];
      const f1Score = (2 * precision * recall) / (precision + recall);
      perClassF1Score.push(f1Score);
    });
    return (
      perClassF1Score.reduce((sum, value) => sum + value, 0) /
      perClassF1Score.length
    );
  }
}

/**
 * Temporary class for aggregating cohort stats for accuracy.
 */
export class AccuracyStatsAggregator extends BaseStatsAggregator {
  public totalCohortError = 0;
  public totalGlobalError = 0;
  public tpCohort: number[] = [];
  public tpGlobal: number[] = [];
  public tnCohort: number[] = [];
  public tnGlobal: number[] = [];
  public fpCohort: number[] = [];
  public fpGlobal: number[] = [];
  public fnCohort: number[] = [];
  public fnGlobal: number[] = [];

  public updateCohortStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalCohortError += value.error;
      if (this.tpCohort.length === 0) {
        this.tpCohort = [...value.tp];
      } else {
        this.tpCohort = this.tpCohort.map((num, idx) => num + value.tp[idx]);
      }
      if (this.tnCohort.length === 0) {
        this.tnCohort = [...value.tn];
      } else {
        this.tnCohort = this.tnCohort.map((num, idx) => num + value.tn[idx]);
      }
      if (this.fpCohort.length === 0) {
        this.fpCohort = [...value.fp];
      } else {
        this.fpCohort = this.fpCohort.map((num, idx) => num + value.fp[idx]);
      }
      if (this.fnCohort.length === 0) {
        this.fnCohort = [...value.fn];
      } else {
        this.fnCohort = this.fnCohort.map((num, idx) => num + value.fn[idx]);
      }
    }
  }

  public updateGlobalStats(value: IErrorAnalysisMatrixNode): void {
    if (value.error !== undefined) {
      this.totalGlobalError += value.error;
    }
    if (this.tpGlobal.length === 0) {
      this.tpGlobal = [...value.tp];
    } else {
      this.tpGlobal = this.tpGlobal.map((num, idx) => num + value.tp[idx]);
    }
    if (this.tnGlobal.length === 0) {
      this.tnGlobal = [...value.tn];
    } else {
      this.tnGlobal = this.tnGlobal.map((num, idx) => num + value.tn[idx]);
    }
    if (this.fpGlobal.length === 0) {
      this.fpGlobal = [...value.fp];
    } else {
      this.fpGlobal = this.fpGlobal.map((num, idx) => num + value.fp[idx]);
    }
    if (this.fnGlobal.length === 0) {
      this.fnGlobal = [...value.fn];
    } else {
      this.fnGlobal = this.fnGlobal.map((num, idx) => num + value.fn[idx]);
    }
  }

  public createCohortStats(): MetricCohortStats {
    let metricValue = 0;
    let coverage = 0;
    if (this.existsSelectedCell) {
      metricValue = this.computeMetricValue(
        this.tpCohort,
        this.tnCohort,
        this.fpCohort,
        this.fnCohort
      );
      coverage = (this.totalCohortError / this.totalGlobalError) * 100;
    } else {
      metricValue = this.computeMetricValue(
        this.tpGlobal,
        this.tnGlobal,
        this.fpGlobal,
        this.fnGlobal
      );
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

  private computeMetricValue(
    tp: number[],
    tn: number[],
    fp: number[],
    fn: number[]
  ): number {
    let metricValue = 0;
    if (tp.length === 1) {
      // For binary case where only positive labels specified
      metricValue = (tp[0] + tn[0]) / (tp[0] + tn[0] + fp[0] + fn[0]);
    } else {
      // When all labels specified
      const tpSum = tp.reduce((sum, value) => sum + value, 0);
      metricValue = tpSum / (tp[0] + tn[0] + fp[0] + fn[0]);
    }
    return metricValue;
  }
}
