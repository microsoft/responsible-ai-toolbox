// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackTokens, Stack } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

import { predictionPathStyles } from "./PredictionPath.styles";

export interface IPredictionPathProps {
  temporaryCohort: ErrorCohort;
}

const alignmentStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 5
};

export class PredictionPath extends React.Component<IPredictionPathProps> {
  public render(): React.ReactNode {
    const errorCohort = this.props.temporaryCohort;
    const filters = errorCohort.filtersToString();
    const classNames = predictionPathStyles();
    return (
      <Stack>
        {filters.reverse().map((filter: string, index: number) => (
          <div key={index}>
            <Stack horizontal tokens={alignmentStackTokens}>
              <Stack verticalAlign="center">
                <i className={classNames.filterCircle} />
              </Stack>
              <Stack verticalAlign="center">
                <div>{filter}</div>
              </Stack>
            </Stack>
            {index !== filters.length - 1 && (
              <div className={classNames.stepBar} />
            )}
          </div>
        ))}
      </Stack>
    );
  }
}
