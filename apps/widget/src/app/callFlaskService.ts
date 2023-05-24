// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import json5 from "json5";

import { IAppConfig } from "./config";

export async function callFlaskService<TRequest, TResponse>(
  config: Pick<IAppConfig, "baseUrl" | "withCredentials">,
  data: TRequest,
  urlPath: string,
  abortSignal?: AbortSignal
): Promise<TResponse> {
  const url = config.baseUrl + urlPath;
  return fetch(url, {
    body: JSON.stringify(data),
    credentials: config.withCredentials ? "include" : "omit",
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
