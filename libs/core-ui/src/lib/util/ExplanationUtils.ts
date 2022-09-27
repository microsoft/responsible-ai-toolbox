// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ModelTypes } from "../Interfaces/IExplanationContext";

export function IsMulticlass(modelType: ModelTypes): boolean {
  return (
    modelType === ModelTypes.Multiclass ||
    modelType === ModelTypes.ImageMulticlass ||
    modelType === ModelTypes.TextMulticlass
  );
}

export function IsClassifier(modelType: ModelTypes): boolean {
  return (
    modelType === ModelTypes.Binary ||
    modelType === ModelTypes.Multiclass ||
    modelType === ModelTypes.ImageMulticlass ||
    modelType === ModelTypes.TextMulticlass
  );
}
