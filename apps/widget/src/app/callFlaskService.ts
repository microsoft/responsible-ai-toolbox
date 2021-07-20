// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import json5 from "json5";

import { config } from "./config";

export async function callFlaskService<TRequest, TResponse>(
  data: TRequest,
  urlPath: string,
  abortSignal?: AbortSignal
): Promise<TResponse> {
  const url = config.baseUrl + urlPath;
  return fetch(url, {
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    method: "post",
    signal: abortSignal
  }).then(async (resp) => {
    if (resp.status >= 200 && resp.status < 300) {
      const json = json5.parse(await resp.text());
      if (json.error !== undefined) {
        throw new Error(json.error);
      }
      return json.data;
    }
    return Promise.reject(new Error(resp.statusText));
  });
}
