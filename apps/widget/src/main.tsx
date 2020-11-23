// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { initializeIcons } from "office-ui-fabric-react";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app/App";
initializeIcons();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.querySelector(`#${"__rai_app_id__"}`)
);
