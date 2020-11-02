// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app/App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.querySelector(`#${"__rai_app_id__"}`)
);
