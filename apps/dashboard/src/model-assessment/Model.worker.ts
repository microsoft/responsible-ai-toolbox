// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { loadPyodide, PyodideInterface } from "pyodide";

import model from "./model.py";
import { ModelWorkerMessageType } from "./ModelWorkerMessageTypes";
declare const self: Worker;

let requestPredictions: (data: any[]) => any[];
let pyodide: PyodideInterface;

async function init(messageCallback: (msg: string) => void): Promise<void> {
  messageCallback("Starting...");
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/",
    stderr: messageCallback,
    stdout: messageCallback
  });
  messageCallback("Loading packages...");
  await pyodide.loadPackage(
    ["scikit-learn", "pandas", "micropip"],
    messageCallback
  );
  messageCallback("Installing raiutils...");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("raiutils");
}

async function train(
  messageCallback: (msg: string) => void,
  taskType: string,
  featureNames: string[],
  features: any[][],
  trueY: any[]
): Promise<void> {
  messageCallback("Training...");
  await pyodide.runPythonAsync(model);
  const train = pyodide.globals.get("train");
  requestPredictions = train(taskType, featureNames, features, trueY);
  messageCallback("Ready");
}

self.addEventListener("message", async (event: MessageEvent): Promise<void> => {
  const { id, taskType, featureNames, features, trueY, type, data } =
    event.data;
  const messageCallback = (
    msg: string,
    type?: ModelWorkerMessageType,
    data?: any[][]
  ): void => {
    self.postMessage({
      data,
      id,
      message: msg,
      type: type ?? ModelWorkerMessageType.Message
    });
  };
  if (type === ModelWorkerMessageType.Predict) {
    if (!requestPredictions) {
      messageCallback("", ModelWorkerMessageType.Error);
      return;
    }
    messageCallback(
      "",
      ModelWorkerMessageType.Predict,
      requestPredictions(data)
    );
    return;
  }
  if (type === ModelWorkerMessageType.Init) {
    await init(messageCallback);
    await train(messageCallback, taskType, featureNames, features, trueY);
    messageCallback("", ModelWorkerMessageType.Ready);
  }
});

export default class extends Worker {
  public constructor() {
    super("");
  }
}
