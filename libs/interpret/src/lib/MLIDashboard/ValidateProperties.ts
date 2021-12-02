// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  isThreeDimArray,
  isTwoDimArray,
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import { IExplanationDashboardProps } from "./Interfaces/IExplanationDashboardProps";

export class ValidateProperties {
  public readonly errorStrings: string[] = [];
  private readonly classLength: number;
  private readonly featureLength: number;
  private rowLength: number | undefined;
  public constructor(
    private props: IExplanationDashboardProps,
    modelMetadata: IExplanationModelMetadata
  ) {
    this.classLength = modelMetadata.classNames.length;
    this.featureLength = modelMetadata.featureNames.length;
    this.rowLength =
      props.trueY?.length ||
      props.predictedY?.length ||
      props.probabilityY?.length ||
      props.testData?.length;
    this.validateProps();
  }

  private validate<T>(
    y: T[] | undefined,
    length: number | undefined,
    fieldName: string
  ): boolean {
    if (!Array.isArray(y)) {
      this.errorStrings.push(
        localization.formatString(
          localization.Interpret.ValidationErrors.notArray,
          fieldName,
          length
        )
      );
      return false;
    }
    if (length === undefined) {
      return true;
    }
    if (y.length !== length) {
      this.errorStrings.push(
        localization.formatString(
          localization.Interpret.ValidationErrors.inconsistentDimensions,
          fieldName,
          y.length,
          length
        )
      );
      return false;
    }
    return true;
  }

  private validate1D<T>(
    y: T[] | undefined,
    length: number | undefined,
    fieldName: string
  ): boolean {
    if (y === undefined) {
      return true;
    }
    return this.validate(y, length, fieldName);
  }
  private validate2D<T>(
    y: T[][] | undefined,
    length: [number | undefined, number],
    fieldName: string
  ): boolean {
    if (y === undefined) {
      return true;
    }
    if (!this.validate1D(y, length[0], fieldName)) {
      return false;
    }
    for (const [i, element] of y.entries()) {
      if (!this.validate1D(element, length[1], `${fieldName}[${i}]`)) {
        return false;
      }
    }
    return true;
  }
  private validate3D<T>(
    y: T[][][] | undefined,
    length: [number | undefined, number | undefined, number],
    fieldName: string
  ): boolean {
    if (y === undefined) {
      return true;
    }
    if (!this.validate1D(y, length[0], fieldName)) {
      return false;
    }
    for (const [i, element] of y.entries()) {
      if (
        !this.validate2D(element, [length[1], length[2]], `${fieldName}[${i}]`)
      ) {
        return false;
      }
    }
    return true;
  }

  // Mutates the passed in props arg, removing any properties that are incompatible.
  private validateProps(): void {
    if (
      !this.validate1D(
        this.props.predictedY,
        this.rowLength,
        localization.Interpret.ValidationErrors.predictedY
      )
    ) {
      this.props.predictedY = undefined;
    }
    if (
      !this.validate2D(
        this.props.probabilityY,
        [this.rowLength, this.classLength],
        localization.Interpret.ValidationErrors.predictedProbability
      )
    ) {
      this.props.probabilityY = undefined;
    }
    if (
      !this.validate2D(
        this.props.testData,
        [this.rowLength, this.featureLength],
        localization.Interpret.ValidationErrors.evalData
      )
    ) {
      this.props.testData = undefined;
    }
    this.validateGlobalExplanation();

    this.validateLocalExplanation();
  }

  private validateGlobalExplanation(): void {
    if (!this.props.precomputedExplanations?.globalFeatureImportance?.scores) {
      return;
    }
    const globalExp =
      this.props.precomputedExplanations?.globalFeatureImportance?.scores;
    const globalFeatureLength =
      this.props.precomputedExplanations?.globalFeatureImportance?.featureNames
        ?.length ?? this.featureLength;
    if (isTwoDimArray(globalExp)) {
      if (
        !this.validate2D(
          globalExp,
          [globalFeatureLength, this.classLength],
          localization.Interpret.ValidationErrors.globalFeatureImportance
        )
      ) {
        this.props.precomputedExplanations.globalFeatureImportance = undefined;
      }
    } else if (
      !this.validate1D(
        globalExp,
        globalFeatureLength,
        localization.Interpret.ValidationErrors.globalFeatureImportance
      )
    ) {
      this.props.precomputedExplanations.globalFeatureImportance = undefined;
    }
  }
  private validateLocalExplanation(): void {
    if (!this.props.precomputedExplanations?.localFeatureImportance?.scores) {
      return;
    }
    const localExp =
      this.props.precomputedExplanations.localFeatureImportance.scores;
    if (isThreeDimArray(localExp)) {
      if (
        !this.validate3D(
          localExp,
          [this.classLength, this.rowLength, this.featureLength],
          localization.Interpret.ValidationErrors.localFeatureImportance
        )
      ) {
        this.props.precomputedExplanations.localFeatureImportance = undefined;
      }
    } else if (isTwoDimArray(localExp)) {
      if (
        !this.validate2D(
          localExp,
          [this.rowLength, this.featureLength],
          localization.Interpret.ValidationErrors.localFeatureImportance
        )
      ) {
        this.props.precomputedExplanations.localFeatureImportance = undefined;
      }
    }
  }
}
