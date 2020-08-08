import { INumericRange } from "./INumericRange";
import { ICategoricalRange } from "./ICategoricalRange";

export interface IModelMetadata {
    featureNames: string[];
    featureNamesAbridged: string[];
    classNames: string[];
    featureIsCategorical?: boolean[];
    featureRanges?: Array<INumericRange | ICategoricalRange>;
}
