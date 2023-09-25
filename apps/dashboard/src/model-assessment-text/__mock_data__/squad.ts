// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetTaskType,
  IDataset,
  IModelExplanationData
} from "@responsible-ai/core-ui";
import JSZip from "jszip";
import fetch from "node-fetch";

export const squad: IDataset = {
  categorical_features: [],
  class_names: undefined,
  feature_names: [
    "context_positive_words",
    "context_negative_words",
    "context_negation_words",
    "context_negated_entities",
    "context_named_persons",
    "context_sentence_length",
    "question_positive_words",
    "question_negative_words",
    "question_negation_words",
    "question_negated_entities",
    "question_named_persons",
    "question_sentence_length"
  ],
  features: [
    [42, 0, 0, 0, 2, 695, 3, 0, 0, 0, 0, 71],
    [42, 0, 0, 0, 2, 695, 3, 0, 0, 0, 0, 49],
    [42, 0, 0, 0, 2, 695, 5, 0, 0, 0, 1, 76],
    [42, 0, 0, 0, 2, 695, 1, 0, 0, 0, 1, 33],
    [42, 0, 0, 0, 2, 695, 4, 0, 0, 0, 0, 52]
  ],
  predicted_y: [
    "Saint Bernadette Soubirous",
    "a copper statue of Christ",
    "the Main Building",
    "a Marian place of prayer and reflection",
    "a golden statue of the Virgin Mary"
  ],
  target_column: "answers",
  task_type: DatasetTaskType.QuestionAnswering,
  true_y: [
    "Saint Bernadette Soubirous",
    "a copper statue of Christ",
    "the Main Building",
    "a Marian place of prayer and reflection",
    "a golden statue of the Virgin Mary"
  ]
};

async function getModelExplanationDataFromZip(
  url: string,
  jsonFileName: string
): Promise<IModelExplanationData> {
  // Fetch the zip file from the URL
  const response = await fetch(url);

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Error fetching zip file: ${response.statusText}`);
  }

  // Get the zip file as ArrayBuffer
  const zipFileData = await response.arrayBuffer();

  // Load the zip file using JSZip
  const zip = await JSZip.loadAsync(zipFileData);

  // Find the JSON file in the zip
  const jsonFile = zip.file(jsonFileName);

  if (!jsonFile) {
    throw new Error(`JSON file not found: ${jsonFileName}`);
  }

  // Extract and parse the JSON content
  const jsonData = JSON.parse(await jsonFile.async("text"));
  return jsonData as IModelExplanationData;
}

export async function getSquadModelExplanationData(): Promise<
  Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
> {
  // download large json file from blob storage
  const zipUrl =
    "https://publictestdatasets.blob.core.windows.net/data/appTestData.zip";
  const jsonFileName = "squadData.json"; // Replace with the name of the JSON file inside the zip

  return getModelExplanationDataFromZip(zipUrl, jsonFileName)
    .then((modelExplanationData) => {
      return modelExplanationData;
    })
    .catch((error) => {
      console.error("Error:", error);
    }) as Promise<
    Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
  >;
}
