// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import json5 from "json5";
import { io } from "socket.io-client";

import { IAppConfig } from "./config";

interface IDataResponse<TResponse> {
  data: TResponse;
}

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

export async function connectToFlaskService<TRequest, TResponse>(
  config: Pick<IAppConfig, "baseUrl" | "withCredentials">,
  data: TRequest,
  urlPath: string,
  abortSignal?: AbortSignal
): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    if (abortSignal?.aborted) {
      return reject(new Error("Aborted socket connection"));
    }
    const url = config.baseUrl;
    const socket = io(url, {
      reconnectionDelayMax: 10000
    });
    socket.on("connect", () => {
      console.log(`socket connected, socket id: ${socket.id}, url: ${url}`);
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
    socket.emit(
      urlPath,
      {
        data: JSON.stringify(data)
      },
      (response: IDataResponse<TResponse>) => {
        return resolve(response.data);
      }
    );
  });
}
