import { IModelMetadata } from 'mlchartlib';
import { JointDataset } from './JointDataset';

export enum ModelTypes {
    regression = 'regression',
    binary = 'binary',
    multiclass = 'multiclass',
}

export interface IExplanationContext {
    modelMetadata: IExplanationModelMetadata;
    jointDataset: JointDataset;
    explanationGenerators: IExplanationGenerators;
    localExplanation?: ILocalExplanation;
    testDataset?: ITestDataset;
    globalExplanation?: IGlobalExplanation;
    isGlobalDerived: boolean;
    ebmExplanation?: IFeatureValueExplanation;
    customVis?: string;
    inputError?: string;
}

// The interface containing either the local explanations matrix,
// or information on the fetcing of the local explanation.
export interface ILocalExplanation {
    values?: number[][][];
    flattenedValues?: number[][];
    intercepts?: number[];
    percentComplete?: number;
}

// The Global explanation. Either derived from local, or passed in as independent prop.
// User provided shall take precidence over our computed. Features x Class
export interface IGlobalExplanation {
    perClassFeatureImportances?: number[][];
    flattenedFeatureImportances?: number[];
    intercepts?: number[];
}

export interface IMultiClassBoundedCoordinates {
    type: string;
    names: number[] | string[];
    scores: number[][];
    scoresRange?: number[];
    upperBounds?: number[][];
    lowerBounds?: number[][];
}

export interface IFeatureValueExplanation {
    featureList: IMultiClassBoundedCoordinates[];
    displayParameters?: {
        interpolation?: 'vh' | 'other';
        yAxisLabel?: string;
        xAxisLabel?: string;
    };
}

export interface IExplanationGenerators {
    requestPredictions?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
    requestLocalFeatureExplanations?: (
        request: any[],
        abortSignal: AbortSignal,
        explanationAlgorithm?: string,
    ) => Promise<any[]>;
}

export interface ITestDataset {
    dataset?: any[][];
    predictedY?: number[];
    probabilityY?: number[][];
    trueY?: number[];
}

export interface IExplanationModelMetadata extends IModelMetadata {
    modelType: ModelTypes;
    explainerType?: string;
}
