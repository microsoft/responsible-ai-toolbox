import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, RouteComponentProps } from "react-router-dom";
import { App } from "./app/App";
import { IAppSetting } from "./app/IAppSetting";

function renderApp(props: RouteComponentProps<IAppSetting>): React.ReactNode {
  return <App {...props.match.params} />;
}

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Route path={App.route} render={renderApp} />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
