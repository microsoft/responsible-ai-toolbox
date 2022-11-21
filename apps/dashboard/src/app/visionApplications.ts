// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fridge } from "../model-assessment-vision/__mock_data__/fridge";
import { fridgeBinary } from "../model-assessment-vision/__mock_data__/fridgeBinary";
import { imagenet } from "../model-assessment-vision/__mock_data__/imagenet";

import {
  IDataSet,
  IModelAssessmentSetting,
  IModelAssessmentDataSet
} from "./applicationInterfaces";

export const applicationKeys = <const>["modelAssessmentVision"];

export type IApplications = {
  [key in typeof applicationKeys[number]]: unknown;
} & {
  modelAssessmentVision: IModelAssessmentSetting &
    IDataSet<IModelAssessmentDataSet>;
};

export const visionApplications: IApplications = <const>{
  modelAssessmentVision: {
    datasets: {
      fridge: {
        classDimension: 3,
        dataset: {
          categorical_features: fridge.categorical_features,
          class_names: fridge.class_names,
          feature_names: fridge.feature_names,
          features: fridge.features,
          images: fridge.images,
          predicted_y: fridge.predicted_y,
          task_type: fridge.task_type,
          true_y: fridge.true_y
        }
      },
      fridgeBinary: {
        classDimension: 3,
        dataset: {
          categorical_features: fridgeBinary.categorical_features,
          class_names: fridgeBinary.class_names,
          feature_names: fridgeBinary.feature_names,
          features: fridgeBinary.features,
          images: fridgeBinary.images,
          predicted_y: fridgeBinary.predicted_y,
          task_type: fridgeBinary.task_type,
          true_y: fridgeBinary.true_y
        }
      },
      imagenet: {
        classDimension: 3,
        dataset: {
          categorical_features: imagenet.categorical_features,
          class_names: imagenet.class_names,
          feature_names: imagenet.feature_names,
          features: imagenet.features,
          images: imagenet.images,
          predicted_y: imagenet.predicted_y,
          task_type: imagenet.task_type,
          true_y: imagenet.true_y
        }
      } as IModelAssessmentDataSet
    },
    versions: { "1": 1, "2:Static-View": 2 }
  }
};
