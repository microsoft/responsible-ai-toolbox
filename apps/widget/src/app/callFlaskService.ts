// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from "axios";

import { config } from "./config";

export async function callFlaskService<TRequest, TResponse>(
  data: TRequest,
  urlPath: string
): Promise<TResponse> {
  const url = config.baseUrl + urlPath;
  if (config.withCredentials) {
    const headers = {
      Accept:
        "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Content-Type": "application/json"
    };
    axios.defaults.withCredentials = true;
    const axiosOptions = { headers, withCredentials: true };
    return axios
      .post(url, JSON.stringify(data), axiosOptions)
      .then((response) => {
        return response.data.data;
      })
      .catch(function (error) {
        throw new Error(error);
      });
  }
  return fetch(url, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
    method: "post"
  })
    .then((resp) => {
      if (resp.status >= 200 && resp.status < 300) {
        return resp.json();
      }
      return Promise.reject(new Error(resp.statusText));
    })
    .then((json) => {
      if (json.error !== undefined) {
        throw new Error(json.error);
      }
      return Promise.resolve(json.data);
    });
}
