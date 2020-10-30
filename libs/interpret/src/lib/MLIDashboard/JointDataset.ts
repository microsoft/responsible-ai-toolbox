// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  INumericRange,
  ICategoricalRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { cohortKey } from "./cohortKey";
import { IExplanationModelMetadata, ModelTypes } from "./IExplanationContext";
import { WeightVectors, WeightVectorOption } from "./IWeightedDropdownContext";

export interface IJointDatasetArgs {
  dataset?: any[][];
  predictedY?: number[];
  predictedProbabilities?: number[][];
  trueY?: number[];
  localExplanations?:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance;
  metadata: IExplanationModelMetadata;
}

export enum ColumnCategories {
  Outcome = "outcome",
  Dataset = "dataset",
  Index = "index",
  Explanation = "explanation",
  Cohort = "cohort",
  None = "none"
}

export enum ClassificationEnum {
  TrueNegative = 0,
  FalsePositive = 1,
  FalseNegative = 2,
  TruePositive = 3
}

// The object that will store user-facing strings and associated metadata
// It stores the categorical labels for any numeric bins
export interface IJointMeta {
  label: string;
  abbridgedLabel: string;
  isCategorical: boolean;
  // used to allow user to treat integers as categorical (but switch back as convenient...)
  treatAsCategorical?: boolean;
  sortedCategoricalValues?: string[];
  featureRange?: INumericRange;
  category: ColumnCategories;
  index?: number;
}

// this is the single source for data, it should hold all raw data and be how data for presentation is
// accessed. It shall apply filters to the raw table and persist the filtered table for presenting to
// charts and dashboards. It shall sort indexed rows by a selected column.
// Filtering will create a copy of the underlying dataset and sorting should be in place on this copy.
// projection should create a copy of values.
//
export class JointDataset {
  public static readonly IndexLabel = "Index";
  public static readonly DataLabelRoot = "Data";
  public static readonly PredictedYLabel = "PredictedY";
  public static readonly ProbabilityYRoot = "ProbabilityClass";
  public static readonly TrueYLabel = "TrueY";
  public static readonly DitherLabel = "Dither";
  public static readonly DitherLabel2 = "Dither2";
  public static readonly ClassificationError = "ClassificationError";
  public static readonly RegressionError = "RegressionError";
  public static readonly ReducedLocalImportanceRoot = "LocalImportance";
  public static readonly ReducedLocalImportanceIntercept =
    "LocalImportanceIntercept";
  public static readonly ReducedLocalImportanceSortIndexRoot =
    "LocalImportanceSortIndex";

  public rawLocalImportance: number[][][] | undefined;
  public metaDict: { [key: string]: IJointMeta } = {};

  public hasDataset = false;
  public hasLocalExplanations = false;
  public hasPredictedY = false;
  public hasPredictedProbabilities = false;
  public hasTrueY = false;
  public datasetFeatureCount = 0;
  public predictionClassCount = 0;
  public datasetRowCount = 0;
  public localExplanationFeatureCount = 0;

  // these properties should only be accessed by Cohort class,
  // which enables independent filtered views of this data
  public dataDict: Array<{ [key: string]: number }> | undefined;
  public binDict: { [key: string]: number[] | undefined } = {};

  private readonly _modelMeta: IExplanationModelMetadata;
  // private readonly _localExplanationIndexesComputed: boolean[];
  // The user elected to treat numeric columns as categorical. Store the unaltered values here in case they toggle back.
  private numericValuedColumnsCache: Array<{ [key: string]: number }> = [];

  // Can add method to set dither scale in future, update charts on change.
  private readonly ditherScale = 0.1;

  public constructor(args: IJointDatasetArgs) {
    this._modelMeta = args.metadata;
    if (args.dataset && args.dataset.length > 0) {
      this.initializeDataDictIfNeeded(args.dataset);
      this.datasetRowCount = args.dataset.length;
      this.datasetFeatureCount = args.dataset[0].length;
      // first set metadata
      args.dataset[0].forEach((_, colIndex) => {
        const key = JointDataset.DataLabelRoot + colIndex.toString();
        if (args.metadata.featureIsCategorical?.[colIndex]) {
          const sortedUnique = (args.metadata.featureRanges[
            colIndex
          ] as ICategoricalRange).uniqueValues
            .concat()
            .sort();
          this.metaDict[key] = {
            abbridgedLabel: args.metadata.featureNamesAbridged[colIndex],
            category: ColumnCategories.Dataset,
            index: colIndex,
            isCategorical: true,
            label: args.metadata.featureNames[colIndex],
            sortedCategoricalValues: sortedUnique,
            treatAsCategorical: true
          };
        } else {
          this.metaDict[key] = {
            abbridgedLabel: args.metadata.featureNamesAbridged[colIndex],
            category: ColumnCategories.Dataset,
            featureRange: args.metadata.featureRanges[
              colIndex
            ] as INumericRange,
            index: colIndex,
            isCategorical: false,
            label: args.metadata.featureNames[colIndex]
          };
        }
      });
      args.dataset.forEach((row, index) => {
        row.forEach((val, colIndex) => {
          const key = JointDataset.DataLabelRoot + colIndex.toString();
          if (this.dataDict) {
            // store the index for categorical values rather than the actual value. Makes dataset uniform numeric and enables dithering
            if (args.metadata.featureIsCategorical?.[colIndex]) {
              this.dataDict[index][key] =
                this.metaDict[key].sortedCategoricalValues?.indexOf(val) || 0;
            } else {
              this.dataDict[index][key] = val;
            }
          }
        });
      });
      this.hasDataset = true;
    }
    if (args.predictedY) {
      this.initializeDataDictIfNeeded(args.predictedY);
      args.predictedY.forEach((val, index) => {
        if (this.dataDict) {
          this.dataDict[index][JointDataset.PredictedYLabel] = val;
        }
      });
      this.metaDict[JointDataset.PredictedYLabel] = {
        abbridgedLabel: localization.Interpret.ExplanationScatter.predictedY,
        category: ColumnCategories.Outcome,
        isCategorical: args.metadata.modelType !== ModelTypes.Regression,
        label: localization.Interpret.ExplanationScatter.predictedY,
        sortedCategoricalValues:
          args.metadata.modelType !== ModelTypes.Regression
            ? args.metadata.classNames
            : undefined,
        treatAsCategorical: args.metadata.modelType !== ModelTypes.Regression
      };
      if (args.metadata.modelType === ModelTypes.Regression) {
        this.metaDict[JointDataset.PredictedYLabel].featureRange = {
          max: Math.max(...args.predictedY),
          min: Math.min(...args.predictedY),
          rangeType: RangeTypes.Numeric
        };
      }
      this.hasPredictedY = true;
    }
    if (args.predictedProbabilities) {
      const predictedProbabilities = args.predictedProbabilities;
      if (args.metadata.modelType !== ModelTypes.Regression) {
        args.predictedProbabilities.forEach((predictionArray, index) => {
          predictionArray.forEach((val, classIndex) => {
            if (this.dataDict) {
              this.dataDict[index][
                JointDataset.ProbabilityYRoot + classIndex.toString()
              ] = val;
            }
          });
        });
        // create metadata for each class
        args.metadata.classNames.forEach((className, classIndex) => {
          const label = localization.formatString(
            localization.Interpret.ExplanationScatter.probabilityLabel,
            className
          );
          const projection = predictedProbabilities.map(
            (row) => row[classIndex]
          );
          this.metaDict[
            JointDataset.ProbabilityYRoot + classIndex.toString()
          ] = {
            abbridgedLabel: label,
            category: ColumnCategories.Outcome,
            featureRange: {
              max: Math.max(...projection),
              min: Math.min(...projection),
              rangeType: RangeTypes.Numeric
            },
            isCategorical: false,
            label,
            sortedCategoricalValues: undefined,
            treatAsCategorical: false
          };
        });
        this.hasPredictedProbabilities = true;
        this.predictionClassCount = args.metadata.classNames.length;
      }
    }
    if (args.trueY) {
      this.initializeDataDictIfNeeded(args.trueY);
      args.trueY.forEach((val, index) => {
        if (this.dataDict) {
          this.dataDict[index][JointDataset.TrueYLabel] = val;
        }
      });
      this.metaDict[JointDataset.TrueYLabel] = {
        abbridgedLabel: localization.Interpret.ExplanationScatter.trueY,
        category: ColumnCategories.Outcome,
        isCategorical: args.metadata.modelType !== ModelTypes.Regression,
        label: localization.Interpret.ExplanationScatter.trueY,
        sortedCategoricalValues:
          args.metadata.modelType !== ModelTypes.Regression
            ? args.metadata.classNames
            : undefined,
        treatAsCategorical: args.metadata.modelType !== ModelTypes.Regression
      };
      if (args.metadata.modelType === ModelTypes.Regression) {
        this.metaDict[JointDataset.TrueYLabel].featureRange = {
          max: Math.max(...args.trueY),
          min: Math.min(...args.trueY),
          rangeType: RangeTypes.Numeric
        };
      }
      this.hasTrueY = true;
    }
    // include error columns if applicable
    if (this.hasPredictedY && this.hasTrueY) {
      this.dataDict?.forEach((row) => {
        JointDataset.setErrorMetrics(row, this._modelMeta.modelType);
      });
      // Set appropriate metadata
      if (args.metadata.modelType === ModelTypes.Regression && this.dataDict) {
        const regressionErrorArray = this.dataDict.map(
          (row) => row[JointDataset.RegressionError]
        );
        this.metaDict[JointDataset.RegressionError] = {
          abbridgedLabel: localization.Interpret.Columns.error,
          category: ColumnCategories.Outcome,
          featureRange: {
            max: Math.max(...regressionErrorArray),
            min: Math.min(...regressionErrorArray),
            rangeType: RangeTypes.Numeric
          },
          isCategorical: false,
          label: localization.Interpret.Columns.regressionError,
          sortedCategoricalValues: undefined
        };
      }
      if (args.metadata.modelType === ModelTypes.Binary) {
        this.metaDict[JointDataset.ClassificationError] = {
          abbridgedLabel: localization.Interpret.Columns.classificationOutcome,
          category: ColumnCategories.Outcome,
          isCategorical: true,
          label: localization.Interpret.Columns.classificationOutcome,
          sortedCategoricalValues: [
            localization.Interpret.Columns.trueNegative,
            localization.Interpret.Columns.falsePositive,
            localization.Interpret.Columns.falseNegative,
            localization.Interpret.Columns.truePositive
          ],
          treatAsCategorical: true
        };
      }
    }
    if (args.localExplanations) {
      this.rawLocalImportance = JointDataset.buildLocalFeatureMatrix(
        args.localExplanations.scores,
        args.metadata.modelType
      );
      this.localExplanationFeatureCount = this.rawLocalImportance[0].length;
      this.initializeDataDictIfNeeded(this.rawLocalImportance);
      // this._localExplanationIndexesComputed = new Array(
      //   this.localExplanationFeatureCount
      // ).fill(false);
      this.buildLocalFlattenMatrix(WeightVectors.AbsAvg);
      this.hasLocalExplanations = true;
    }
    if (this.dataDict === undefined) {
      this.initializeDataDictIfNeeded([]);
    }
  }

  // creating public static methods of the class instance methonds.
  // This is to enable prototyping the cohort concept, where we don't have a single
  // datasource as initially envisioned but an array of them, all build off of the true datasource
  public static unwrap(
    dataset: Array<{ [key: string]: any }>,
    key: string,
    binVector?: number[]
  ): any[] {
    if (binVector) {
      return dataset.map((row) => {
        const rowValue = row[key];
        return binVector.findIndex((upperLimit) => upperLimit >= rowValue);
      });
    }
    return dataset.map((row) => row[key]);
  }

  // recover the array representation of just the eval dataset values from a row
  // This includes subbing categorical values back in in place of indexes
  public static datasetSlice(
    row: { [key: string]: any },
    metaDict: { [key: string]: IJointMeta },
    length: number
  ): any[] {
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
      const key = JointDataset.DataLabelRoot + i.toString();
      if (metaDict[key].isCategorical) {
        result[i] = metaDict[key].sortedCategoricalValues?.[row[key]];
      } else {
        result[i] = row[key];
      }
    }
    return result;
  }

  // recover the array representation of just the local explanations from a row
  public static localExplanationSlice(
    row: { [key: string]: any },
    length: number
  ): number[] {
    const result: number[] = new Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = row[JointDataset.ReducedLocalImportanceRoot + i.toString()];
    }
    return result;
  }

  public static predictProbabilitySlice(
    row: { [key: string]: any },
    length: number
  ): number[] {
    const result: number[] = new Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = row[JointDataset.ProbabilityYRoot + i.toString()];
    }
    return result;
  }

  // set the appropriate error value in the keyed column
  public static setErrorMetrics(
    row: { [key: string]: any },
    modelType: ModelTypes
  ): void {
    if (modelType === ModelTypes.Regression) {
      row[JointDataset.RegressionError] =
        row[JointDataset.TrueYLabel] - row[JointDataset.PredictedYLabel];
      return;
    }
    if (modelType === ModelTypes.Binary) {
      // sum pred and 2*true to map to ints 0 - 3,
      // 0: TN
      // 1: FP
      // 2: FN
      // 3: TP
      const predictionCategory =
        2 * row[JointDataset.TrueYLabel] + row[JointDataset.PredictedYLabel];
      row[JointDataset.ClassificationError] = predictionCategory;
      return;
    }
  }

  private static buildLocalFeatureMatrix(
    localExplanationRaw: number[][] | number[][][],
    modelType: ModelTypes
  ): number[][][] {
    switch (modelType) {
      case ModelTypes.Regression: {
        return (localExplanationRaw as number[][]).map((featureArray) =>
          featureArray.map((val) => [val])
        );
      }
      case ModelTypes.Binary: {
        return JointDataset.transposeLocalImportanceMatrix(
          localExplanationRaw as number[][][]
        ).map((featuresByClasses) =>
          featuresByClasses.map((classArray) => classArray.slice(0, 1))
        );
      }
      case ModelTypes.Multiclass:
      default: {
        return JointDataset.transposeLocalImportanceMatrix(
          localExplanationRaw as number[][][]
        );
      }
    }
  }

  private static transposeLocalImportanceMatrix(
    input: number[][][]
  ): number[][][] {
    const numClasses = input.length;
    const numRows = input[0].length;
    const numFeatures = input[0][0].length;
    const result: number[][][] = new Array(numRows)
      .fill(0)
      .map(() =>
        new Array(numFeatures).fill(0).map(() => new Array(numClasses).fill(0))
      );
    input.forEach((rowByFeature, classIndex) => {
      rowByFeature.forEach((featureArray, rowIndex) => {
        featureArray.forEach((value, featureIndex) => {
          result[rowIndex][featureIndex][classIndex] = value;
        });
      });
    });
    return result;
  }

  public getRow(index: number): { [key: string]: number } {
    return { ...this.dataDict?.[index] };
  }

  public unwrap(key: string, binVector?: number[]): any[] {
    if (this.dataDict) {
      return JointDataset.unwrap(this.dataDict, key, binVector);
    }
    return [];
  }

  public setTreatAsCategorical(key: string, value: boolean): void {
    const metadata = this.metaDict[key];
    metadata.treatAsCategorical = value;
    if (value) {
      const values = this.dataDict?.map((row) => row[key]);
      const sortedUniqueValues = _.uniq(values).sort((a, b) => {
        return a - b;
      });
      metadata.sortedCategoricalValues = sortedUniqueValues.map((num) =>
        num.toString()
      );
      this.dataDict?.forEach((row, rowIndex) => {
        const numVal = row[key];
        row[key] = sortedUniqueValues.indexOf(numVal);
        this.numericValuedColumnsCache[rowIndex][key] = numVal;
      });
    } else {
      this.dataDict?.forEach((row, rowIndex) => {
        row[key] = this.numericValuedColumnsCache[rowIndex][key];
      });
      this.addBin(key);
    }
  }

  public addBin(key: string, binCountIn?: number): void {
    const meta = this.metaDict[key];
    if (!meta.featureRange) {
      return;
    }
    const featureRange = meta.featureRange;
    // use data-dict for undefined binCount (building default bin)
    // use filtered data for user provided binCount
    let binCount = 5;
    if (binCountIn === undefined) {
      if (featureRange.rangeType === RangeTypes.Integer) {
        const uniqueValues = _.uniq(this.dataDict?.map((row) => row[key]));
        binCount = Math.min(5, uniqueValues.length);
      }
    }
    const delta = featureRange.max - featureRange.min;
    if (delta === 0 || binCount === 0) {
      this.binDict[key] = [featureRange.max];
      meta.sortedCategoricalValues = [
        `${featureRange.min} - ${featureRange.max}`
      ];
      return;
    }
    // make uniform bins in these cases
    if (featureRange.rangeType === RangeTypes.Numeric || delta < binCount - 1) {
      const binDelta = delta / binCount;
      const array = new Array(binCount).fill(0).map((_, index) => {
        return index !== binCount - 1
          ? featureRange.min + binDelta * (1 + index)
          : featureRange.max;
      });
      let prevMax = featureRange.min;
      const labelArray = array.map((num) => {
        const label = `${prevMax.toLocaleString(undefined, {
          maximumSignificantDigits: 3
        })} - ${num?.toLocaleString(undefined, {
          maximumSignificantDigits: 3
        })}`;
        prevMax = num;
        return label;
      });
      this.binDict[key] = array;
      meta.sortedCategoricalValues = labelArray;
      return;
    }
    // handle integer case, increment delta since we include the ends as discrete values
    const intDelta = delta / binCount;
    const array = new Array(binCount).fill(0).map((_, index) => {
      if (index === binCount - 1) {
        return featureRange.max;
      }
      return Math.ceil(featureRange.min - 1 + intDelta * (index + 1));
    });
    let previousVal = featureRange.min;
    const labelArray = array.map((num) => {
      const label =
        previousVal === num
          ? previousVal.toLocaleString(undefined, {
              maximumSignificantDigits: 3
            })
          : `${previousVal.toLocaleString(undefined, {
              maximumSignificantDigits: 3
            })} - ${num.toLocaleString(undefined, {
              maximumSignificantDigits: 3
            })}`;
      previousVal = num + 1;
      return label;
    });
    this.binDict[key] = array;
    meta.sortedCategoricalValues = labelArray;
  }

  // project the 3d array based on the selected vector weights. Costly to do, so avoid when possible.
  public buildLocalFlattenMatrix(weightVector: WeightVectorOption): void {
    if (!this.rawLocalImportance) {
      return;
    }
    const featuresMinArray = new Array(this.rawLocalImportance[0].length).fill(
      Number.MAX_SAFE_INTEGER
    );
    const featuresMaxArray = new Array(this.rawLocalImportance[0].length).fill(
      Number.MIN_SAFE_INTEGER
    );
    switch (this._modelMeta.modelType) {
      case ModelTypes.Regression:
      case ModelTypes.Binary: {
        // no need to flatten what is already flat
        this.rawLocalImportance.forEach((featuresByClasses, rowIndex) => {
          featuresByClasses.forEach((classArray, featureIndex) => {
            const val = classArray[0];
            if (val > featuresMaxArray[featureIndex]) {
              featuresMaxArray[featureIndex] = val;
            }
            if (val < featuresMinArray[featureIndex]) {
              featuresMinArray[featureIndex] = val;
            }
            if (this.dataDict) {
              this.dataDict[rowIndex][
                JointDataset.ReducedLocalImportanceRoot +
                  featureIndex.toString()
              ] = classArray[0];
            }
            // this._localExplanationIndexesComputed[rowIndex] = false;
          });
        });
        break;
      }
      case ModelTypes.Multiclass: {
        this.rawLocalImportance.forEach((featuresByClasses, rowIndex) => {
          featuresByClasses.forEach((classArray, featureIndex) => {
            // this._localExplanationIndexesComputed[rowIndex] = false;
            let value: number;
            switch (weightVector) {
              case WeightVectors.Equal: {
                value = classArray.reduce((a, b) => a + b) / classArray.length;
                break;
              }
              // case WeightVectors.predicted: {
              //     return classArray[this.predictedY[rowIndex]];
              // }
              case WeightVectors.AbsAvg: {
                value =
                  classArray.reduce((a, b) => a + Math.abs(b), 0) /
                  classArray.length;
                break;
              }
              default: {
                value = classArray[weightVector];
              }
            }
            if (value > featuresMaxArray[featureIndex]) {
              featuresMaxArray[featureIndex] = value;
            }
            if (value < featuresMinArray[featureIndex]) {
              featuresMinArray[featureIndex] = value;
            }
            if (this.dataDict) {
              this.dataDict[rowIndex][
                JointDataset.ReducedLocalImportanceRoot +
                  featureIndex.toString()
              ] = value;
            }
          });
        });
        break;
      }
      default:
    }
    this.rawLocalImportance[0].forEach((_classArray, featureIndex) => {
      const featureLabel = this._modelMeta.featureNames[featureIndex];
      const key =
        JointDataset.ReducedLocalImportanceRoot + featureIndex.toString();
      this.metaDict[key] = {
        abbridgedLabel: localization.formatString(
          localization.Interpret.featureImportanceOf,
          featureLabel
        ),
        category: ColumnCategories.Explanation,
        featureRange: {
          max: featuresMaxArray[featureIndex],
          min: featuresMinArray[featureIndex],
          rangeType: RangeTypes.Numeric
        },
        isCategorical: false,
        label: localization.formatString(
          localization.Interpret.featureImportanceOf,
          featureLabel
        )
      };
      this.binDict[key] = undefined;
    });
  }

  private initializeDataDictIfNeeded(arr: any[]): void {
    if (arr === undefined) {
      return;
    }
    if (this.dataDict !== undefined) {
      if (this.dataDict.length !== arr.length) {
        throw new Error(
          "Differing length inputs. Ensure data matches explanations and predictions."
        );
      }
      return;
    }
    this.dataDict = Array.from({ length: arr.length }).map((_, index) => {
      const dict = {};
      dict[JointDataset.IndexLabel] = index;
      dict[JointDataset.DitherLabel] =
        2 * this.ditherScale * Math.random() - this.ditherScale;
      dict[JointDataset.DitherLabel2] =
        2 * this.ditherScale * Math.random() - this.ditherScale;
      return dict;
    });
    this.numericValuedColumnsCache = Array.from({
      length: arr.length
    }).map(() => {
      return {};
    });
    this.metaDict[JointDataset.IndexLabel] = {
      abbridgedLabel: localization.Interpret.ExplanationScatter.index,
      category: ColumnCategories.Index,
      featureRange: {
        max: arr.length - 1,
        min: 0,
        rangeType: RangeTypes.Integer
      },
      isCategorical: false,
      label: localization.Interpret.ExplanationScatter.index
    };
    this.metaDict[cohortKey] = {
      abbridgedLabel: localization.Interpret.Cohort.cohort,
      category: ColumnCategories.Cohort,
      isCategorical: true,
      label: localization.Interpret.Cohort.cohort,
      treatAsCategorical: true
    };
    this.metaDict[ColumnCategories.None] = {
      abbridgedLabel: localization.Interpret.Columns.none,
      category: ColumnCategories.None,
      isCategorical: true,
      label: localization.Interpret.Columns.none,
      treatAsCategorical: true
    };
  }
}
