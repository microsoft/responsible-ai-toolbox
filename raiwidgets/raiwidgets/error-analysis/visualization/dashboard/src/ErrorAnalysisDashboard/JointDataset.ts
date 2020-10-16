import { IExplanationModelMetadata, ModelTypes } from "./IExplanationContext";
import { INumericRange, ICategoricalRange, RangeTypes } from "mlchartlib";
import { localization } from "../Localization/localization";
import { IFilter, FilterMethods } from "./Interfaces/IFilter";
import _ from "lodash";
import { IMultiClassLocalFeatureImportance, ISingleClassLocalFeatureImportance } from "./Interfaces";
import { WeightVectors, WeightVectorOption } from "./IWeightedDropdownContext";
import { Cohort } from "./Cohort";

export interface IJointDatasetArgs {
    dataset?: any[][];
    predictedY?: number[];
    predictedProbabilities?: number[][];
    trueY?: number[];
    localExplanations?: IMultiClassLocalFeatureImportance | ISingleClassLocalFeatureImportance;
    metadata: IExplanationModelMetadata;
}

export enum ColumnCategories {
    outcome = 'outcome',
    dataset = 'dataset',
    index = "index",
    explanation = 'explanation',
    cohort = 'cohort'
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
    public static readonly ProbabilityYRoot = "ProbabilityClass"
    public static readonly TrueYLabel = "TrueY";
    public static readonly DitherLabel = "Dither";
    public static readonly ClassificationError = "ClassificationError";
    public static readonly RegressionError = "RegressionError";
    public static readonly ReducedLocalImportanceRoot = "LocalImportance";
    public static readonly ReducedLocalImportanceIntercept = "LocalImportanceIntercept";
    public static readonly ReducedLocalImportanceSortIndexRoot = "LocalImportanceSortIndex";

    public hasDataset: boolean = false;
    public hasLocalExplanations: boolean = false;
    public hasPredictedY: boolean = false;
    public hasPredictedProbabilities: boolean = false;
    public hasTrueY: boolean = false;
    public datasetFeatureCount: number = 0;
    public datasetRowCount: number = 0;
    public localExplanationFeatureCount: number = 0;

    // these properties should only be accessed by Cohort class,
    // which enables independent filtered views of this data
    public dataDict: Array<{[key: string]: number}>;
    public binDict: {[key: string]: number[]} = {};

    private readonly _modelMeta: IExplanationModelMetadata;
    private readonly _localExplanationIndexesComputed: boolean[];
    public rawLocalImportance: number[][][];
    public metaDict: {[key: string]: IJointMeta} = {};

    // creating public static methods of the class instance methonds.
    // This is to enable prototyping the cohort concept, where we don't have a single
    // datasource as initially envisioned but an array of them, all build off of the true datasource
    public static unwrap(dataset: Array<{[key: string]: any}>, key: string, binVector?: number[]): any[] {
        if (binVector) {
            return dataset.map(row => {
                const rowValue = row[key];
                return binVector.findIndex(upperLimit => upperLimit >= rowValue );
            });
        }
        return dataset.map(row => row[key]);
    }

    // recover the array representation of just the eval dataset values from a row
    // This includes subbing categorical values back in in place of indexes
    public static datasetSlice(row: {[key: string]: any}, metaDict: {[key: string]: IJointMeta}, length: number): any[] {
        const result = new Array(length);
        for(let i: number = 0; i < length; i++) {
            const key = JointDataset.DataLabelRoot + i.toString();
            if (metaDict[key].isCategorical) {
                result[i] = metaDict[key].sortedCategoricalValues[row[key]];
            } else {
                result[i] = row[key];
            }
        }
        return result;
    }

    // recover the array representation of just the local explanations from a row
    public static localExplanationSlice(row: {[key: string]: any}, length: number): number[] {
        const result: number[] = new Array(length);
        for(let i: number = 0; i < length; i++) {
            result[i] = row[JointDataset.ReducedLocalImportanceRoot + i.toString()];
        }
        return result;
    }

    constructor(args: IJointDatasetArgs) {
        this._modelMeta = args.metadata;
        if (args.dataset && args.dataset.length > 0) {
            this.initializeDataDictIfNeeded(args.dataset);
            this.datasetRowCount = args.dataset.length;
            this.datasetFeatureCount = args.dataset[0].length;
            // first set metadata 
            args.dataset[0].forEach((unused, colIndex) => {
                const key = JointDataset.DataLabelRoot + colIndex.toString();
                if (args.metadata.featureIsCategorical[colIndex]) {
                    const sortedUnique = (args.metadata.featureRanges[colIndex] as ICategoricalRange).uniqueValues.concat().sort();
                    this.metaDict[key] = {
                        label: args.metadata.featureNames[colIndex],
                        abbridgedLabel: args.metadata.featureNamesAbridged[colIndex],
                        isCategorical: true,
                        treatAsCategorical: true,
                        sortedCategoricalValues: sortedUnique,
                        category: ColumnCategories.dataset,
                        index: colIndex
                    }
                } else {
                    this.metaDict[key] = {
                        label: args.metadata.featureNames[colIndex],
                        abbridgedLabel: args.metadata.featureNamesAbridged[colIndex],
                        isCategorical: false,
                        featureRange: args.metadata.featureRanges[colIndex] as INumericRange,
                        category: ColumnCategories.dataset,
                        index: colIndex
                    }
                }
            });
            args.dataset.forEach((row, index) => {
                row.forEach((val, colIndex) => {
                    const key = JointDataset.DataLabelRoot + colIndex.toString();
                    // store the index for categorical values rather than the actual value. Makes dataset uniform numeric and enables dithering
                    if (args.metadata.featureIsCategorical[colIndex]) {
                        this.dataDict[index][key] = this.metaDict[key].sortedCategoricalValues.indexOf(val);
                    } else {
                        this.dataDict[index][key] = val;
                    }
                });
            });
            this.hasDataset = true;
        }
        if (args.predictedY) {
            this.initializeDataDictIfNeeded(args.predictedY);
            args.predictedY.forEach((val, index) => {
                this.dataDict[index][JointDataset.PredictedYLabel] = val;
            });
            this.metaDict[JointDataset.PredictedYLabel] = {
                label: localization.ExplanationScatter.predictedY,
                abbridgedLabel: localization.ExplanationScatter.predictedY,
                isCategorical: args.metadata.modelType !== ModelTypes.regression,
                treatAsCategorical: args.metadata.modelType !== ModelTypes.regression,
                sortedCategoricalValues: args.metadata.modelType !== ModelTypes.regression ? args.metadata.classNames : undefined,
                category: ColumnCategories.outcome
            };
            if (args.metadata.modelType === ModelTypes.regression) {
                this.metaDict[JointDataset.PredictedYLabel].featureRange = {
                    min: Math.min(...args.predictedY),
                    max: Math.max(...args.predictedY),
                    rangeType: RangeTypes.numeric
                }
            }
            this.hasPredictedY = true;
        }
        if (args.predictedProbabilities) {
            if (args.metadata.modelType === ModelTypes.binary) {
                this.initializeDataDictIfNeeded(args.predictedY);
                args.predictedProbabilities.forEach((predictionArray, index) => {
                    predictionArray.forEach((val, classIndex) => {
                        this.dataDict[index][JointDataset.ProbabilityYRoot + classIndex.toString()] = val;
                    });
                });
                const label = localization.formatString(localization.ExplanationScatter.probabilityLabel, args.metadata.classNames[0]) as string;
                const projection = args.predictedProbabilities.map(row => row[0]);
                this.metaDict[JointDataset.ProbabilityYRoot + "0"] = {
                    label,
                    abbridgedLabel: label,
                    isCategorical: false,
                    treatAsCategorical: false,
                    sortedCategoricalValues: undefined,
                    category: ColumnCategories.outcome,
                    featureRange: {
                        min: Math.min(...projection),
                        max: Math.max(...projection),
                        rangeType: RangeTypes.numeric
                    }
                };
                this.hasPredictedProbabilities = true;
            }
        }
        if (args.trueY) {
            this.initializeDataDictIfNeeded(args.trueY);
            args.trueY.forEach((val, index) => {
                this.dataDict[index][JointDataset.TrueYLabel] = val;
            });
            this.metaDict[JointDataset.TrueYLabel] = {
                label: localization.ExplanationScatter.trueY,
                abbridgedLabel: localization.ExplanationScatter.trueY,
                isCategorical: args.metadata.modelType !== ModelTypes.regression,
                treatAsCategorical: args.metadata.modelType !== ModelTypes.regression,
                sortedCategoricalValues: args.metadata.modelType !== ModelTypes.regression ? args.metadata.classNames : undefined,
                category: ColumnCategories.outcome
            };
            if (args.metadata.modelType === ModelTypes.regression) {
                this.metaDict[JointDataset.TrueYLabel].featureRange = {
                    min: Math.min(...args.trueY),
                    max: Math.max(...args.trueY),
                    rangeType: RangeTypes.numeric
                }
            }
            this.hasTrueY = true;
        }
        // include error columns if applicable
        if (this.hasPredictedY && this.hasTrueY) {
            if (args.metadata.modelType === ModelTypes.regression) {
                this.dataDict.forEach(row => {
                    row[JointDataset.RegressionError] = row[JointDataset.TrueYLabel] - row[JointDataset.PredictedYLabel];
                });
                const regressionErrorArray = this.dataDict.map(row => row[JointDataset.RegressionError]);
                this.metaDict[JointDataset.RegressionError] = {
                    label: localization.Columns.regressionError,
                    abbridgedLabel: localization.Columns.error,
                    isCategorical: false,
                    sortedCategoricalValues: undefined,
                    category: ColumnCategories.outcome,
                    featureRange: {
                        rangeType: RangeTypes.numeric,
                        min: Math.min(...regressionErrorArray),
                        max: Math.max(...regressionErrorArray)
                    }
                };
            }
            if (args.metadata.modelType === ModelTypes.binary) {
                this.dataDict.forEach(row => {
                    // sum pred and 2*true to map to ints 0 - 3,
                    // 0: TN
                    // 1: FP
                    // 2: FN
                    // 3: TP
                    const predictionCategory = 2 * row[JointDataset.TrueYLabel] + row[JointDataset.PredictedYLabel];
                    row[JointDataset.ClassificationError] = predictionCategory;
                });
                this.metaDict[JointDataset.ClassificationError] = {
                    label: localization.Columns.classificationOutcome,
                    abbridgedLabel: localization.Columns.classificationOutcome,
                    isCategorical: true,
                    treatAsCategorical: true,
                    sortedCategoricalValues: [
                        localization.Columns.trueNegative,
                        localization.Columns.falsePositive,
                        localization.Columns.falseNegative,
                        localization.Columns.truePositive
                    ],
                    category: ColumnCategories.outcome
                };
            }
        }
        if (args.localExplanations) {
            this.rawLocalImportance = JointDataset.buildLocalFeatureMatrix(args.localExplanations.scores, args.metadata.modelType);
            this.localExplanationFeatureCount = this.rawLocalImportance[0].length;
            this.initializeDataDictIfNeeded(this.rawLocalImportance);
            this._localExplanationIndexesComputed = new Array(this.localExplanationFeatureCount).fill(false);
            this.buildLocalFlattenMatrix(WeightVectors.absAvg);
            this.hasLocalExplanations = true;
        }
    }

    public getRow(index: number): {[key: string]: number} {
        return {...this.dataDict[index]}
    }

    public setTreatAsCategorical(key: string, value: boolean): void {
        const metadata = this.metaDict[key];
        metadata.treatAsCategorical = value;
        if (value) {
            const values = this.dataDict.map(row => row[key]);
            metadata.sortedCategoricalValues = _.uniq(values).sort((a, b) => {return a - b}) as any[];
        }
    }

    public addBin(key: string, binCount?: number): void {
        const meta = this.metaDict[key];
        // use data-dict for undefined binCount (building default bin)
        // use filtered data for user provided binCount
        if (binCount === undefined) {
            if (meta.featureRange.rangeType === RangeTypes.integer) {
                const uniqueValues = _.uniq(this.dataDict.map(row => row[key]));
                binCount = Math.min(5, uniqueValues.length);
            }
            if (binCount === undefined) {
                binCount = 5;
            }
        }
        let delta = meta.featureRange.max - meta.featureRange.min;
        if (delta === 0 || binCount === 0) {
            this.binDict[key] = [meta.featureRange.max];
            meta.sortedCategoricalValues = [`${meta.featureRange.min} - ${meta.featureRange.max}`];
            return;
        }
        // make uniform bins in these cases
        if (meta.featureRange.rangeType === RangeTypes.numeric || delta < (binCount - 1)) {
            const binDelta = delta / binCount;
            const array = new Array(binCount).fill(0).map((unused, index) => {
                return index !== binCount - 1 ?
                    meta.featureRange.min + (binDelta * (1+ index)) :
                    meta.featureRange.max;
            });
            let prevMax = meta.featureRange.min;
            const labelArray = array.map((num) => {
                const label = `${prevMax.toLocaleString(undefined, {maximumSignificantDigits: 3})} - ${num.toLocaleString(undefined, {maximumSignificantDigits: 3})}`;
                prevMax = num;
                return label;
            });
            this.binDict[key] = array;
            meta.sortedCategoricalValues = labelArray;
            return;
        }
        // handle integer case, increment delta since we include the ends as discrete values
        const intDelta = delta / binCount;
        const array = new Array(binCount).fill(0).map((unused, index) => {
            if (index === binCount - 1) {
                return meta.featureRange.max;
            }
            return Math.ceil( meta.featureRange.min - 1 + intDelta * (index + 1));
        });
        let previousVal = meta.featureRange.min;
        const labelArray = array.map((num) => {
            const label = previousVal === num ?
            previousVal.toLocaleString(undefined, {maximumSignificantDigits: 3}) :
                `${previousVal.toLocaleString(undefined, {maximumSignificantDigits: 3})} - ${num.toLocaleString(undefined, {maximumSignificantDigits: 3})}`
            previousVal = num + 1;
            return label;
        });
        this.binDict[key] = array;
        meta.sortedCategoricalValues = labelArray;
    } 

    private initializeDataDictIfNeeded(arr: any[]): void {
        if (arr === undefined) {
            return;
        }
        if (this.dataDict !== undefined) {
            if (this.dataDict.length !== arr.length) {
                throw new Error("Differing length inputs. Ensure data matches explanations and predictions.")
            }
            return;
        }
        this.dataDict = Array.from({length: arr.length} as any).map((unused, index) => {
            const dict = {};
            dict[JointDataset.IndexLabel] = index;
            dict[JointDataset.DitherLabel] = 0.2 * Math.random() - 0.1;
            return dict;
        });
        this.metaDict[JointDataset.IndexLabel] = {
            label: localization.ExplanationScatter.index,
            abbridgedLabel: localization.ExplanationScatter.index,
            isCategorical: false,
            featureRange: {
                rangeType: RangeTypes.integer,
                min: 0,
                max: arr.length - 1
            },
            category: ColumnCategories.index
        };
        this.metaDict[Cohort.CohortKey] = {
            label: localization.Cohort.cohort,
            abbridgedLabel: localization.Cohort.cohort,
            isCategorical: true,
            category: ColumnCategories.cohort
        };
    }

    // project the 3d array based on the selected vector weights. Costly to do, so avoid when possible.
    private buildLocalFlattenMatrix(weightVector: WeightVectorOption): void {
        const featuresMinArray = new Array(this.rawLocalImportance[0].length).fill(Number.MAX_SAFE_INTEGER);
        const featuresMaxArray = new Array(this.rawLocalImportance[0].length).fill(Number.MIN_SAFE_INTEGER);
        switch(this._modelMeta.modelType) {
            case ModelTypes.regression:
            case ModelTypes.binary: {
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
                        this.dataDict[rowIndex][JointDataset.ReducedLocalImportanceRoot + featureIndex.toString()] = classArray[0];
                        this._localExplanationIndexesComputed[rowIndex] = false;
                    });
                });
                break;
            }
            case ModelTypes.multiclass: {
                this.rawLocalImportance.forEach((featuresByClasses, rowIndex) => {
                    featuresByClasses.forEach((classArray, featureIndex) => {
                        this._localExplanationIndexesComputed[rowIndex] = false;
                        let value: number;
                        switch (weightVector) {
                            case WeightVectors.equal: {
                                value = classArray.reduce((a, b) => a + b) / classArray.length;
                                break;
                            }
                            // case WeightVectors.predicted: {
                            //     return classArray[this.predictedY[rowIndex]];
                            // }
                            case WeightVectors.absAvg: {
                                value = classArray.reduce((a, b) => a + Math.abs(b), 0) / classArray.length;
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
                        this.dataDict[rowIndex][JointDataset.ReducedLocalImportanceRoot + featureIndex.toString()] = value;
                    });
                });
            }
        }
        this.rawLocalImportance[0].forEach((classArray, featureIndex) => {
            const featureLabel = this._modelMeta.featureNames[featureIndex];
            this.metaDict[JointDataset.ReducedLocalImportanceRoot + featureIndex.toString()] = {
                label: localization.formatString(localization.featureImportanceOf, featureLabel) as string,
                abbridgedLabel: localization.formatString(localization.featureImportanceOf, featureLabel) as string,
                isCategorical: false,
                featureRange: {
                    rangeType: RangeTypes.numeric,
                    min: featuresMinArray[featureIndex],
                    max: featuresMaxArray[featureIndex]
                },
                category: ColumnCategories.explanation
            };
        });
    }

    private static buildLocalFeatureMatrix(localExplanationRaw: number[][] | number[][][], modelType: ModelTypes): number[][][] {
        switch(modelType) {
            case ModelTypes.regression: {
                return (localExplanationRaw as number[][])
                        .map(featureArray => featureArray.map(val => [val]));
            }
            case ModelTypes.binary: {
                return JointDataset.transposeLocalImportanceMatrix(localExplanationRaw as number[][][])
                        .map(featuresByClasses => featuresByClasses.map(classArray => classArray.slice(0, 1)));
            }
            case ModelTypes.multiclass: {
                return JointDataset.transposeLocalImportanceMatrix(localExplanationRaw as number[][][]);
            }
        }
    }

    private static transposeLocalImportanceMatrix(input: number[][][]): number[][][] {
        const numClasses =input.length;
        const numRows = input[0].length;
        const numFeatures = input[0][0].length;
        const result: number[][][] = Array(numRows).fill(0)
            .map(r => Array(numFeatures).fill(0)
            .map(f => Array(numClasses).fill(0)));
        input.forEach((rowByFeature, classIndex) => {
            rowByFeature.forEach((featureArray, rowIndex) => {
                featureArray.forEach((value, featureIndex) => {
                    result[rowIndex][featureIndex][classIndex] = value;
                });
            });
        });
        return result;
    }
}