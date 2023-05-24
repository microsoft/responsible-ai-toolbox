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

export function IsBinary(modelType: ModelTypes): boolean {
  return (
    modelType === ModelTypes.Binary ||
    modelType === ModelTypes.ImageBinary ||
    modelType === ModelTypes.TextBinary
  );
}

export function IsMultilabel(modelType: ModelTypes): boolean {
  return (
    modelType === ModelTypes.ImageMultilabel ||
    modelType === ModelTypes.TextMultilabel
  );
}

export function IsClassifier(modelType: ModelTypes): boolean {
  return (
    modelType === ModelTypes.Binary ||
    modelType === ModelTypes.ImageBinary ||
    modelType === ModelTypes.TextBinary ||
    modelType === ModelTypes.Multiclass ||
    modelType === ModelTypes.ImageMulticlass ||
    modelType === ModelTypes.TextMulticlass ||
    modelType === ModelTypes.ImageMultilabel ||
    modelType === ModelTypes.TextMultilabel
  );
}
