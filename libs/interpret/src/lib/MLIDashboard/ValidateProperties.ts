import { IExplanationDashboardProps } from './Interfaces';
import { IExplanationModelMetadata } from './IExplanationContext';
import { localization } from '../Localization/localization';

export class ValidateProperties {
    private readonly classLength: number;
    private readonly featureLength: number;
    public readonly errorStrings: string[] = [];
    private rowLength: number;
    constructor(private props: IExplanationDashboardProps, modelMetadata: IExplanationModelMetadata) {
        this.classLength = modelMetadata.classNames.length;
        this.featureLength = modelMetadata.featureNames.length;
        this.validateProps();
    }

    // Mutates the passed in props arg, removing any properties that are incompatible.
    private validateProps(): void {
        if (this.props.trueY) {
            this.rowLength = this.props.trueY.length;
        }
        if (this.props.predictedY) {
            this.validatePredictedY();
        }
        if (this.props.probabilityY) {
            this.validatePredictProba();
        }
        if (this.props.testData) {
            this.validateTestData();
        }
        if (
            this.props.precomputedExplanations &&
            this.props.precomputedExplanations.localFeatureImportance &&
            this.props.precomputedExplanations.localFeatureImportance.scores
        ) {
            this.validateLocalExplanation();
        }
    }

    private validatePredictedY(): void {
        const length = this.props.predictedY.length;
        if (this.rowLength === undefined) {
            this.rowLength = length;
        }
        if (length !== this.rowLength) {
            this.props.predictedY = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.inconsistentDimensions,
                    localization.ValidationErrors.predictedY,
                    length,
                    this.rowLength,
                ),
            );
        }
    }

    private validatePredictProba(): void {
        if (!Array.isArray(this.props.probabilityY)) {
            this.props.probabilityY = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.notArray,
                    localization.ValidationErrors.predictedProbability,
                    `${this.rowLength || 0} x ${this.classLength}`,
                ),
            );
            return;
        }
        const rowLength = this.props.probabilityY.length;
        if (this.rowLength === undefined) {
            this.rowLength = rowLength;
        }
        if (rowLength !== this.rowLength) {
            this.props.probabilityY = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.inconsistentDimensions,
                    localization.ValidationErrors.predictedProbability,
                    rowLength,
                    this.rowLength,
                ),
            );
            return;
        }
        if (rowLength === 0) {
            this.props.probabilityY = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.notNonEmpty,
                    localization.ValidationErrors.predictedProbability,
                ),
            );
            return;
        }
        const classLength = this.props.probabilityY[0].length;
        if (classLength !== this.classLength) {
            this.props.probabilityY = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.inconsistentDimensions,
                    localization.ValidationErrors.predictedProbability,
                    `[${rowLength} x ${classLength}]`,
                    `[${this.rowLength} x ${this.classLength}]`,
                ),
            );
            return;
        }
        if (!this.props.probabilityY.every((row) => row.length === this.classLength)) {
            this.props.probabilityY = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.varyingLength,
                    localization.ValidationErrors.predictedProbability,
                ),
            );
            return;
        }
    }

    private validateTestData(): void {
        if (!Array.isArray(this.props.testData)) {
            this.props.testData = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.notArray,
                    localization.ValidationErrors.evalData,
                    `${this.rowLength || 0} x ${this.classLength}`,
                ),
            );
            return;
        }
        const rowLength = this.props.testData.length;
        if (this.rowLength === undefined) {
            this.rowLength = rowLength;
        }
        if (rowLength !== this.rowLength) {
            this.props.testData = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.inconsistentDimensions,
                    localization.ValidationErrors.evalData,
                    rowLength,
                    this.rowLength,
                ),
            );
            return;
        }
        if (rowLength === 0) {
            this.props.testData = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.notNonEmpty,
                    localization.ValidationErrors.evalData,
                ),
            );
            return;
        }
        const featureLength = this.props.testData[0].length;
        if (featureLength !== this.featureLength) {
            this.props.testData = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.inconsistentDimensions,
                    localization.ValidationErrors.evalData,
                    `[${rowLength} x ${featureLength}]`,
                    `[${this.rowLength} x ${this.featureLength}]`,
                ),
            );
            return;
        }
        if (!this.props.testData.every((row) => row.length === this.featureLength)) {
            this.props.testData = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.varyingLength,
                    localization.ValidationErrors.evalData,
                ),
            );
            return;
        }
    }

    private validateLocalExplanation(): void {
        const localExp = this.props.precomputedExplanations.localFeatureImportance.scores;
        if (!Array.isArray(localExp)) {
            this.props.precomputedExplanations.localFeatureImportance = undefined;
            this.errorStrings.push(
                localization.formatString(
                    localization.ValidationErrors.notArray,
                    localization.ValidationErrors.localFeatureImportance,
                    `${this.rowLength || 0} x ${this.featureLength} x ${this.classLength}`,
                ),
            );
            return;
        }
        // explanation will be 2d in case of regression models. 3 for classifier
        let explanationDimension = 2;
        if (
            (localExp as number[][][]).every((dim1) => {
                return dim1.every((dim2) => Array.isArray(dim2));
            })
        ) {
            explanationDimension = 3;
        }
        if (explanationDimension === 3) {
            const classLength = localExp.length;
            if (this.classLength !== classLength) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.inconsistentDimensions,
                        localization.ValidationErrors.localFeatureImportance,
                        classLength,
                        this.classLength,
                    ),
                );
                return;
            }
            if (classLength === 0) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.notNonEmpty,
                        localization.ValidationErrors.localFeatureImportance,
                    ),
                );
                return;
            }
            const rowLength = localExp[0].length;
            if (rowLength === 0) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.notNonEmpty,
                        localization.ValidationErrors.localFeatureImportance,
                    ),
                );
                return;
            }
            if (this.rowLength === undefined) {
                this.rowLength = rowLength;
            }
            if (rowLength !== this.rowLength) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.inconsistentDimensions,
                        localization.ValidationErrors.localFeatureImportance,
                        `${classLength} x ${rowLength}`,
                        `${this.classLength} x ${this.rowLength}`,
                    ),
                );
                return;
            }
            if (!localExp.every((classArray) => classArray.length === this.rowLength)) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.varyingLength,
                        localization.ValidationErrors.localFeatureImportance,
                    ),
                );
                return;
            }
            const featureLength = (localExp[0][0] as number[]).length;
            if (featureLength !== this.featureLength) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.inconsistentDimensions,
                        localization.ValidationErrors.localFeatureImportance,
                        `${classLength} x ${rowLength} x ${featureLength}`,
                        `${this.classLength} x ${this.rowLength} x ${this.featureLength}`,
                    ),
                );
                return;
            }
            if (
                !localExp.every((classArray) => classArray.every((rowArray) => rowArray.length === this.featureLength))
            ) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.varyingLength,
                        localization.ValidationErrors.localFeatureImportance,
                    ),
                );
                return;
            }
        } else {
            const rowLength = localExp.length;
            if (this.rowLength === undefined) {
                this.rowLength = rowLength;
            }
            if (rowLength !== this.rowLength) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.inconsistentDimensions,
                        localization.ValidationErrors.localFeatureImportance,
                        `${rowLength}`,
                        `${this.rowLength}`,
                    ),
                );
                return;
            }
            if (rowLength === 0) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.notNonEmpty,
                        localization.ValidationErrors.localFeatureImportance,
                    ),
                );
                return;
            }
            const featureLength = (localExp[0] as number[]).length;
            if (featureLength !== this.featureLength) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.inconsistentDimensions,
                        localization.ValidationErrors.localFeatureImportance,
                        `${rowLength} x ${featureLength}`,
                        `${this.rowLength} x ${this.featureLength}`,
                    ),
                );
                return;
            }
            if (!localExp.every((rowArray) => rowArray.length === this.featureLength)) {
                this.props.precomputedExplanations.localFeatureImportance = undefined;
                this.errorStrings.push(
                    localization.formatString(
                        localization.ValidationErrors.varyingLength,
                        localization.ValidationErrors.localFeatureImportance,
                    ),
                );
                return;
            }
        }
    }
}
