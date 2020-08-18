export interface IDatasetSummaryV1 {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}

export enum PredictionTypesV1 {
  binaryClassification = "binaryClassification",
  regression = "regression",
  probability = "probability"
}

export type PredictionTypeV1 =
  | PredictionTypesV1.binaryClassification
  | PredictionTypesV1.probability
  | PredictionTypesV1.regression;

export interface IMetricResponseV1 {
  global?: number;
  bins?: number[];
}

export interface IMetricRequestV1 {
  metricKey: string;
  binVector: number[];
  modelIndex: number;
}

export interface IFeatureBinMetaV1 {
  binVector: number[];
  binLabels: string[];
  // this could also be held in a 'features name' array separate with the same length.
  featureBinName: string;
}

export interface ICustomMetricV1 {
  name?: string;
  description?: string;
  id: string;
}

export interface IFairnessPropsV1 {
  startingTabIndex?: number;
  dataSummary: IDatasetSummaryV1;
  testData?: any[][];
  precomputedMetrics?: Array<Array<{ [key: string]: IMetricResponseV1 }>>;
  precomputedFeatureBins?: IFeatureBinMetaV1[];
  customMetrics: ICustomMetricV1[];
  PredictionTypeV1?: PredictionTypesV1;
  // One array per each model;
  predictedY: number[][];
  modelNames?: string[];
  trueY: number[];
  theme?: any;
  locale?: string;
  stringParams?: any;
  supportedBinaryClassificationAccuracyKeys?: string[];
  supportedRegressionAccuracyKeys?: string[];
  supportedProbabilityAccuracyKeys?: string[];
  shouldInitializeIcons?: boolean;
  iconUrl?: string;
  // The request hook
  requestMetrics: (
    request: IMetricRequestV1,
    abortSignal?: AbortSignal
  ) => Promise<IMetricResponseV1>;
}
