// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import json5 from "json5";

import { callFlaskService } from "./callFlaskService";

export async function getModelData(): Promise<any> {
  if (!process.env.NX_based_url) {
    return json5.parse("__rai_model_data__");
  }
  const data = await callFlaskService(
    {
      baseUrl: process.env.NX_based_url,
      withCredentials: false
    },
    "",
    "/model_data"
  );
  return data;
}
