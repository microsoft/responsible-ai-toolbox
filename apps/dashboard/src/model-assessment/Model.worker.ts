// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { loadPyodide } from "pyodide";

import model from "./model.py";
declare const self: Worker;

let requestPredictions: (data: any[]) => any[];

self.addEventListener("message", async (event: MessageEvent): Promise<void> => {
  const { id, taskType, featureNames, features, trueY, type, data } =
    event.data;
  if (type === "predict") {
    self.postMessage({
      data: requestPredictions(data),
      id,
      type: "predict"
    });
    return;
  }
  self.postMessage({
    id,
    message: "Starting...",
    type: "message"
  });
  const messageCallback = (msg: string): void => {
    self.postMessage({
      id,
      message: msg,
      type: "message"
    });
  };
  const pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/",
    stdout: messageCallback
  });
  await pyodide.loadPackage(
    ["scikit-learn", "pandas", "micropip"],
    messageCallback
  );
  self.postMessage({
    id,
    message: "Installing raiutils..",
    type: "message"
  });
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("raiutils");
  self.postMessage({
    id,
    message: "Training...",
    type: "message"
  });
  await pyodide.runPythonAsync(model);
  const train = pyodide.globals.get("train");
  requestPredictions = train(taskType, featureNames, features, trueY);
  self.postMessage({
    id,
    message: "Ready",
    type: "ready"
  });
});

export default class extends Worker {
  public constructor() {
    super("");
  }
}
