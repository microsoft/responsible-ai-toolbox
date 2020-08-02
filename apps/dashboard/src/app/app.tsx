import React from "react";
import { App as Interpret } from "../interpret/App";
import { App as Fairlearn } from "../fairlearn/App";
import { Route, Link, BrowserRouter } from "react-router-dom";

export default class App extends React.Component {
    public render(): React.ReactNode {
        return (
            <div>
                <div role="navigation">
                    <ul>
                        <li>
                            <Link to="/fairlearn">Fair Learn</Link>
                        </li>
                        <li>
                            <Link to="/interpret">Interpret</Link>
                        </li>
                    </ul>
                </div>
                <BrowserRouter>
                    <Route path="/fairlearn" exact component={Fairlearn} />
                    <Route path="/interpret" exact component={Interpret} />
                </BrowserRouter>
            </div>
        );
    }
}
