import React from "react";

import { ReactComponent as Logo } from "./logo.svg";
import star from "./star.svg";

import { Route, Link } from "react-router-dom";

export const App = () => {
    /*
     * Replace the elements below with your own.
     */
    return (
        <div>
            <header className="flex">
                <Logo width="75" height="75" />
                <h1>Welcome to dashboard!</h1>
            </header>
            <main>
                <h2>Resources &amp; Tools</h2>
                <p>Thank you for using and showing some ♥ for Nx.</p>
                <div className="flex github-star-container">
                    <a href="https://github.com/nrwl/nx" target="_blank" rel="noopener noreferrer">
                        {" "}
                        If you like Nx, please give it a star:
                        <div className="github-star-badge">
                            <img src={star} className="material-icons" alt="" />
                            Star
                        </div>
                    </a>
                </div>
                <p>Here are some links to help you get started.</p>
                <ul className="resources">
                    <li className="col-span-2">
                        <a className="resource flex" href="https://connect.nrwl.io/app/courses/nx-workspaces/intro">
                            Nx video course
                        </a>
                    </li>
                    <li className="col-span-2">
                        <a className="resource flex" href="https://nx.dev/react/getting-started/what-is-nx">
                            Nx video tutorial
                        </a>
                    </li>
                    <li className="col-span-2">
                        <a className="resource flex" href="https://nx.dev/react/tutorial/01-create-application">
                            Interactive tutorial
                        </a>
                    </li>
                    <li className="col-span-2">
                        <a className="resource flex" href="https://nx.app/">
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 120 120"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M120 15V30C103.44 30 90 43.44 90 60C90 76.56 76.56 90 60 90C43.44 90 30 103.44 30 120H15C6.72 120 0 113.28 0 105V15C0 6.72 6.72 0 15 0H105C113.28 0 120 6.72 120 15Z"
                                    fill="#0E2039"
                                />
                                <path
                                    d="M120 30V105C120 113.28 113.28 120 105 120H30C30 103.44 43.44 90 60 90C76.56 90 90 76.56 90 60C90 43.44 103.44 30 120 30Z"
                                    fill="white"
                                />
                            </svg>
                            <span className="gutter-left">Nx Cloud</span>
                        </a>
                    </li>
                </ul>
                <h2>Next Steps</h2>
                <p>Here are some things you can do with Nx.</p>
                <details open>
                    <summary>Add UI library</summary>
                    <pre>{`# Generate UI lib
nx g @nrwl/react:lib ui

# Add a component
nx g @nrwl/react:component xyz --project ui`}</pre>
                </details>
                <details>
                    <summary>View dependency graph</summary>
                    <pre>{`nx dep-graph`}</pre>
                </details>
                <details>
                    <summary>Run affected commands</summary>
                    <pre>{`# see what's been affected by changes
nx affected:dep-graph

# run tests for current changes
nx affected:test

# run e2e tests for current changes
nx affected:e2e
  `}</pre>
                </details>
            </main>

            {/* START: routes */}
            {/* These routes and navigation have been generated for you */}
            {/* Feel free to move and update them to fit your needs */}
            <br />
            <hr />
            <br />
            <div role="navigation">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/page-2">Page 2</Link>
                    </li>
                </ul>
            </div>
            <Route
                path="/"
                exact
                render={() => (
                    <div>
                        This is the generated root route. <Link to="/page-2">Click here for page 2.</Link>
                    </div>
                )}
            />
            <Route
                path="/page-2"
                exact
                render={() => (
                    <div>
                        <Link to="/">Click here to go back to root page.</Link>
                    </div>
                )}
            />
            {/* END: routes */}
        </div>
    );
};

export default App;
