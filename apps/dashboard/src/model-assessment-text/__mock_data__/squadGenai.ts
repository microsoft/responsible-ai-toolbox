// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetTaskType,
  IDataset,
  IModelExplanationData
} from "@responsible-ai/core-ui";
import JSZip from "jszip";
import fetch from "node-fetch";

export const squadGenai: IDataset = {
  categorical_features: [],
  class_names: undefined,
  feature_names: [
    "context",
    "prompt",
    "positive_words",
    "negative_words",
    "negation_words",
    "negated_entities",
    "named_persons",
    "sentence_length"
  ],
  features: [
    [
      'Architecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.',
      'Answer the question given the context.\n\ncontext:\nArchitecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.\n\nquestion:\nTo whom did the Virgin Mary allegedly appear in 1858 in Lourdes France?',
      50,
      0,
      0,
      0,
      3,
      827
    ],
    [
      'Architecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.',
      'Answer the question given the context.\n\ncontext:\nArchitecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.\n\nquestion:\nWhat is in front of the Notre Dame Main Building?',
      50,
      0,
      0,
      0,
      2,
      805
    ],
    [
      'Architecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.',
      'Answer the question given the context.\n\ncontext:\nArchitecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.\n\nquestion:\nThe Basilica of the Sacred heart at Notre Dame is beside to which structure?',
      52,
      0,
      0,
      0,
      3,
      832
    ]
  ],
  predicted_y: [
    "This is a dummy answer",
    "This is a dummy answer",
    "This is a dummy answer"
  ],
  target_column: undefined,
  task_type: DatasetTaskType.GenerativeText,
  true_y: undefined
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
