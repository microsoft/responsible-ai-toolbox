export interface IDatasetSummaryV2 {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}

export enum PredictionTypesV2 {
  binaryClassification = "binaryClassification",
  regression = "regression",
  probability = "probability"
}

export type PredictionTypeV2 =
  | PredictionTypesV2.binaryClassification
  | PredictionTypesV2.probability
  | PredictionTypesV2.regression;

export interface IMetricResponseV2 {
  global?: number;
  bins?: number[];
}

export interface IMetricRequestV2 {
  metricKey: string;
  binVector: number[];
  modelIndex: number;
}

export interface IFeatureBinMetaV2 {
  binVector: number[];
  binLabels: string[];
  // this could also be held in a 'features name' array separate with the same length.
  featureBinName: string;
}

export interface ICustomMetricV2 {
  name?: string;
  description?: string;
  id: string;
}

export interface IFairnessPropsV2 {
  startingTabIndex?: number;
  dataSummary: IDatasetSummaryV2;
  testData?: any[][];
  precomputedMetrics?: Array<Array<{ [key: string]: IMetricResponseV2 }>>;
  precomputedFeatureBins?: IFeatureBinMetaV2[];
  customMetrics: ICustomMetricV2[];
  PredictionTypeV2?: PredictionTypesV2;
  // One array per each model;
  predictedY: number[][];
  modelNames?: string[];
  trueY: number[];
  theme?: any;
  locale?: string;
  stringParams?: any;
  supportedBinaryClassificationAccuracyKeys: string[];
  supportedRegressionAccuracyKeys: string[];
  supportedProbabilityAccuracyKeys: string[];
  shouldInitializeIcons?: boolean;
  iconUrl?: string;
  // The request hook
  requestMetrics: (
    request: IMetricRequestV2,
    abortSignal?: AbortSignal
  ) => Promise<IMetricResponseV2>;
}
